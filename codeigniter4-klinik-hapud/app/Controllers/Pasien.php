<?php
namespace App\Controllers;

class Pasien extends BaseController
{
    public function index()
    {
        $user = $this->session->get('patient_user');
        if (!$user) {
            return redirect()->to(base_url('pasien/login'));
        }

        $db = \Config\Database::connect();
        $myTickets = $db->table('patients')
                        ->where('phone', $user['phone'])
                        ->orWhere('name', $user['name'])
                        ->orderBy('visit_date', 'DESC')
                        ->orderBy('created_at', 'DESC')
                        ->get()->getResultArray();

        $activeTicket = null;
        foreach ($myTickets as $t) {
            if ($t['status'] === 'Dipanggil' || $t['status'] === 'Menunggu') {
                $activeTicket = $t;
                break;
            }
        }
        if (!$activeTicket && count($myTickets) > 0) {
            $activeTicket = $myTickets[0];
        }

        return view('pasien/akun', [
            'user' => $user,
            'myTickets' => $myTickets,
            'activeTicket' => $activeTicket
        ]);
    }

    public function login()
    {
        return view('pasien/login', ['error' => $this->session->getFlashdata('error')]);
    }

    public function auth()
    {
        $name = trim($this->request->getPost('name'));
        $pass = trim($this->request->getPost('password'));

        $db = \Config\Database::connect();
        $acc = $db->table('patient_accounts')
                  ->where('name', $name)
                  ->where('password', $pass)
                  ->get()->getRowArray();

        if ($acc) {
            $this->session->set('patient_user', [
                'id' => $acc['id'],
                'name' => $acc['name'],
                'phone' => $acc['phone'],
                'patient_type' => $acc['patient_type'],
                'no_rm' => $acc['no_rm'],
                'dob' => $acc['dob'],
                'gender' => $acc['gender'],
                'address' => $acc['address']
            ]);
            return redirect()->to(base_url('pasien'));
        }

        return redirect()->to(base_url('pasien/login'))->with('error', 'Nama atau Kata Sandi salah!');
    }

    public function logout()
    {
        $this->session->remove('patient_user');
        return redirect()->to(base_url());
    }

    public function daftar()
    {
        return view('pasien/daftar');
    }

    public function simpan_daftar()
    {
        $name = trim($this->request->getPost('name'));
        $pass = trim($this->request->getPost('password'));
        $phone = trim($this->request->getPost('phone'));
        $patient_type = $this->request->getPost('patient_type') ?? 'Baru';
        $no_rm = $this->request->getPost('no_rm') ?? '-';
        $dob = $this->request->getPost('dob');
        $gender = $this->request->getPost('gender') ?? 'Laki-laki';
        $address = $this->request->getPost('address');

        $db = \Config\Database::connect();
        $id = 'acc-' . time();

        $db->table('patient_accounts')->insert([
            'id' => $id,
            'name' => $name,
            'password' => $pass,
            'phone' => $phone,
            'patient_type' => $patient_type,
            'no_rm' => $no_rm,
            'dob' => $dob ?: null,
            'gender' => $gender,
            'address' => $address,
            'created_at' => date('Y-m-d H:i:s')
        ]);

        $this->session->set('patient_user', [
            'id' => $id,
            'name' => $name,
            'phone' => $phone,
            'patient_type' => $patient_type,
            'no_rm' => $no_rm,
            'dob' => $dob,
            'gender' => $gender,
            'address' => $address
        ]);

        return redirect()->to(base_url('pasien'));
    }

    public function daftar_berobat()
    {
        $db = \Config\Database::connect();
        $user = $this->session->get('patient_user');

        $service = $this->request->getPost('service');
        $visit_date = $this->request->getPost('visit_date');
        $session_name = $this->request->getPost('session_name');
        $time_slot = $this->request->getPost('time_slot');
        $complaint = $this->request->getPost('complaint');

        // Generate Prefix
        $prefix = 'A';
        if (str_contains($service, 'Ibu & Anak')) $prefix = 'B';
        if (str_contains($service, 'Gigi')) $prefix = 'C';
        if (str_contains($service, 'Lansia')) $prefix = 'D';
        if (str_contains($service, 'Home Care')) $prefix = 'E';

        $count = $db->table('patients')->where('service', $service)->countAllResults() + 1;
        $code = sprintf('%s-%03d', $prefix, $count);
        $id = 'pt-' . time();

        $db->table('patients')->insert([
            'id' => $id,
            'code' => $code,
            'name' => $user ? $user['name'] : $this->request->getPost('name'),
            'patient_type' => $user ? $user['patient_type'] : ($this->request->getPost('patient_type') ?? 'Baru'),
            'no_rm' => $user ? $user['no_rm'] : ($this->request->getPost('no_rm') ?? '-'),
            'service' => $service,
            'dob' => $user ? $user['dob'] : $this->request->getPost('dob'),
            'gender' => $user ? $user['gender'] : ($this->request->getPost('gender') ?? 'Laki-laki'),
            'phone' => $user ? $user['phone'] : $this->request->getPost('phone'),
            'address' => $user ? $user['address'] : $this->request->getPost('address'),
            'visit_date' => $visit_date,
            'session_name' => $session_name,
            'time_slot' => $time_slot,
            'complaint' => $complaint,
            'status' => 'Menunggu',
            'created_at' => date('Y-m-d H:i:s')
        ]);

        return redirect()->to(base_url('pasien/tiket/' . $code));
    }

    public function tiket($code)
    {
        $db = \Config\Database::connect();
        $patient = $db->table('patients')->where('code', $code)->get()->getRowArray();
        return view('pasien/tiket', ['patient' => $patient]);
    }

    public function monitor()
    {
        $db = \Config\Database::connect();
        $today = date('Y-m-d');
        $patients = $db->table('patients')
                       ->where('visit_date', $today)
                       ->where('status !=', 'Batal')
                       ->orderBy('time_slot', 'ASC')
                       ->get()->getResultArray();

        return view('pasien/monitor', ['patients' => $patients]);
    }
}
