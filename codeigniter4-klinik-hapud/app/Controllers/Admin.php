<?php
namespace App\Controllers;

class Admin extends BaseController
{
    public function index()
    {
        if (!$this->session->get('admin_logged_in')) {
            return redirect()->to(base_url('admin/login'));
        }

        $db = \Config\Database::connect();
        $today = date('Y-m-d');
        $patients = $db->table('patients')
                       ->where('visit_date', $today)
                       ->orderBy('created_at', 'DESC')
                       ->get()->getResultArray();

        $status = $db->table('clinic_status')->get()->getRowArray();

        return view('admin/dashboard', [
            'patients' => $patients,
            'clinicStatus' => $status ?? ['is_open' => 1]
        ]);
    }

    public function login()
    {
        return view('admin/login', ['error' => $this->session->getFlashdata('error')]);
    }

    public function auth()
    {
        $username = trim($this->request->getPost('username'));
        $password = trim($this->request->getPost('password'));

        $db = \Config\Database::connect();
        $admin = $db->table('admins')
                    ->where('username', $username)
                    ->where('password', $password)
                    ->get()->getRowArray();

        if ($admin) {
            $this->session->set('admin_logged_in', true);
            $this->session->set('admin_user', $admin['username']);
            return redirect()->to(base_url('admin'));
        }

        return redirect()->to(base_url('admin/login'))->with('error', 'Username atau Kata Sandi Admin salah!');
    }

    public function logout()
    {
        $this->session->remove('admin_logged_in');
        return redirect()->to(base_url());
    }

    public function panggil($id)
    {
        $db = \Config\Database::connect();
        $db->table('patients')->where('id', $id)->update(['status' => 'Dipanggil']);
        return redirect()->to(base_url('admin'));
    }

    public function selesai($id)
    {
        $db = \Config\Database::connect();
        $db->table('patients')->where('id', $id)->update(['status' => 'Selesai']);
        return redirect()->to(base_url('admin'));
    }
}
