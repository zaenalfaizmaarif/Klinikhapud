<?php
namespace App\Controllers;

class Home extends BaseController
{
    public function index(): string
    {
        $db = \Config\Database::connect();
        
        $today = date('Y-m-d');
        $patients = $db->table('patients')
                       ->where('visit_date', $today)
                       ->where('status !=', 'Batal')
                       ->orderBy('time_slot', 'ASC')
                       ->get()->getResultArray();

        $serving = null;
        $waitingCount = 0;
        $completedCount = 0;

        foreach ($patients as $p) {
            if ($p['status'] === 'Dipanggil') $serving = $p;
            if ($p['status'] === 'Menunggu') $waitingCount++;
            if ($p['status'] === 'Selesai') $completedCount++;
        }

        $statusRow = $db->table('clinic_status')->get()->getRowArray();

        $data = [
            'serving' => $serving,
            'waitingCount' => $waitingCount,
            'completedCount' => $completedCount,
            'clinicStatus' => $statusRow ?? ['is_open' => 1, 'reason' => ''],
            'patientUser' => $this->session->get('patient_user')
        ];

        return view('landing', $data);
    }
}
