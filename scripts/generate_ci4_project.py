import os
import shutil
import zipfile

BASE_DIR = 'codeigniter4-klinik-hapud'

def create_file(path, content):
    full_path = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

def build_ci4_structure():
    if os.path.exists(BASE_DIR):
        shutil.rmtree(BASE_DIR)
    os.makedirs(BASE_DIR, exist_ok=True)

    # 1. Root files
    create_file('spark', """#!/usr/bin/env php
<?php
// CodeIgniter 4 Spark Console
define('SPARKED', true);
require __DIR__ . '/app/Config/Paths.php';
$paths = new Config\\Paths();
require $paths->systemDirectory . '/Boot.php';
exit(CodeIgniter\\Boot::bootSpark($paths));
""")

    create_file('preload.php', """<?php
// Preload file for PHP opcache
require_once __DIR__ . '/app/Config/Paths.php';
""")

    create_file('env', """#--------------------------------------------------------------------
# ENVIRONMENT CONFIGURATION - KLINIK H.APUD
#--------------------------------------------------------------------
CI_ENVIRONMENT = development

app.baseURL = 'http://localhost:8080/'
app.forceGlobalSecureRequests = false

#--------------------------------------------------------------------
# DATABASE MYSQL (XAMPP / LARAGON)
#--------------------------------------------------------------------
database.default.hostname = localhost
database.default.database = klinik_hapud
database.default.username = root
database.default.password = 
database.default.DBDriver = MySQLi
database.default.DBPrefix = 
database.default.port = 3306
""")

    create_file('.env', """# Salinan konfigurasi env
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080/'
database.default.hostname = localhost
database.default.database = klinik_hapud
database.default.username = root
database.default.password = 
database.default.DBDriver = MySQLi
database.default.port = 3306
""")

    create_file('composer.json', """{
    "name": "klinik-hapud/codeigniter4",
    "type": "project",
    "description": "Sistem Informasi Pendaftaran Online, Antrean Sesi Bebas Bentrok & Rekam Medis Klinik H.APUD",
    "homepage": "https://klinikhapud.id",
    "license": "MIT",
    "require": {
        "php": "^7.4 || ^8.0 || ^8.1 || ^8.2 || ^8.3"
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "app",
            "Config\\\\": "app/Config"
        }
    }
}
""")

    create_file('LICENSE', """MIT License
Copyright (c) 2026 Klinik H.APUD (Compreng, Subang)
""")

    create_file('README.md', """# KLINIK H.APUD - Framework CodeIgniter 4 (PHP & MySQL)

Sistem pendaftaran online berobat, pembagian sesi waktu bebas bentrok, tiket antrean digital, monitor panggilan real-time, dan dashboard admin Klinik H.APUD.

---

## ⚡ CARA MENJALANKAN (1-KLIK)

1. Pastikan **Apache** & **MySQL** di XAMPP / Laragon sudah Anda nyalakan (**START**).
2. Impor database:
   - Buka `http://localhost/phpmyadmin`
   - Buat database `klinik_hapud`
   - Impor file `database/schema.sql`
3. Cukup **klik 2 kali** file:
   `JALANKAN_SEKARANG.bat`
4. Browser akan otomatis terbuka di:
   **http://localhost:8080**

---

## 💻 Menjalankan Lewat Terminal VS Code
Buka terminal VS Code di folder ini, lalu ketik:
```bash
php spark serve
```
Buka browser di: `http://localhost:8080`

---

## 🔐 Kredensial Login
- **Admin Klinik:** Username `admin` | Password `KlinikApud#2026`
- **Akun Pasien:**
  - `Ibu Siti Aminah` (Sandi: `siti123`)
  - `Ahmad Fadilah` (Sandi: `ahmad123`)
  - `Bpk. Budi Santoso` (Sandi: `budi123`)
""")

    create_file('JALANKAN_SEKARANG.bat', """@echo off
title Menjalankan Klinik H.APUD (CodeIgniter 4)
color 0A

echo =========================================================================
echo       MENJALANKAN KLINIK H.APUD - CODEIGNITER 4 (PHP & MYSQL)
echo =========================================================================
echo.
echo Pastikan Apache dan MySQL di XAMPP / Laragon sudah Anda [START].
echo.

where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [PERINGATAN] PHP belum terdeteksi di PATH komputer Anda!
    echo Jika Anda menggunakan XAMPP, PHP biasanya ada di: C:\\xampp\\php\\php.exe
    echo.
    echo Menjalankan dengan fallback C:\\xampp\\php\\php.exe ...
    set "PATH=%PATH%;C:\\xampp\\php;C:\\laragon\\bin\\php\\php-8.1.10-Win32-vs16-x64"
)

echo Membuka browser ke http://localhost:8080 ...
start "" "http://localhost:8080"
echo.
echo Server CodeIgniter 4 sedang berjalan...
echo Tekan Ctrl + C untuk mematikan server.
echo.

php spark serve
pause
""")

    # 2. Database folder
    with open('database/schema.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    create_file('database/schema.sql', sql_content)

    # 3. App Config
    create_file('app/Config/Paths.php', """<?php
namespace Config;

class Paths
{
    public string $appDirectory = __DIR__ . '/..';
    public string $systemDirectory = __DIR__ . '/../../system';
    public string $writableDirectory = __DIR__ . '/../../writable';
    public string $testsDirectory = __DIR__ . '/../../tests';
    public string $viewDirectory = __DIR__ . '/../Views';
}
""")

    create_file('app/Config/App.php', """<?php
namespace Config;

class App
{
    public string $baseURL = 'http://localhost:8080/';
    public array $allowedHostnames = [];
    public string $indexPage = '';
    public string $uriProtocol = 'REQUEST_URI';
    public string $defaultLocale = 'id';
    public string $appTimezone = 'Asia/Jakarta';
    public string $charset = 'UTF-8';
}
""")

    create_file('app/Config/Database.php', """<?php
namespace Config;

class Database
{
    public string $filesPath = APPPATH . 'Database' . DIRECTORY_SEPARATOR;
    public string $defaultGroup = 'default';

    public array $default = [
        'DSN'      => '',
        'hostname' => 'localhost',
        'username' => 'root',
        'password' => '',
        'database' => 'klinik_hapud',
        'DBDriver' => 'MySQLi',
        'DBPrefix' => '',
        'pConnect' => false,
        'DBDebug'  => true,
        'charset'  => 'utf8mb4',
        'DBCollat' => 'utf8mb4_general_ci',
        'swapPre'  => '',
        'encrypt'  => false,
        'compress' => false,
        'strictOn' => false,
        'failover' => [],
        'port'     => 3306,
    ];
}
""")

    create_file('app/Config/Routes.php', """<?php
namespace Config;

use CodeIgniter\\Router\\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Rute Pasien
$routes->get('pasien', 'Pasien::index');
$routes->get('pasien/login', 'Pasien::login');
$routes->post('pasien/auth', 'Pasien::auth');
$routes->get('pasien/daftar', 'Pasien::daftar');
$routes->post('pasien/simpan_daftar', 'Pasien::simpan_daftar');
$routes->post('pasien/daftar_berobat', 'Pasien::daftar_berobat');
$routes->get('pasien/logout', 'Pasien::logout');
$routes->get('pasien/tiket/(:segment)', 'Pasien::tiket/$1');
$routes->get('pasien/monitor', 'Pasien::monitor');

// Rute Admin
$routes->get('admin', 'Admin::index');
$routes->get('admin/login', 'Admin::login');
$routes->post('admin/auth', 'Admin::auth');
$routes->get('admin/logout', 'Admin::logout');
$routes->post('admin/panggil/(:segment)', 'Admin::panggil/$1');
$routes->post('admin/selesai/(:segment)', 'Admin::selesai/$1');
$routes->post('admin/rekam_medis', 'Admin::rekam_medis');
$routes->post('admin/toggle_status', 'Admin::toggle_status');

// API Realtime
$routes->get('api/antrean', 'Api::antrean');
$routes->get('api/status_klinik', 'Api::status_klinik');
""")

    # 4. Controllers
    create_file('app/Controllers/BaseController.php', """<?php
namespace App\\Controllers;

use CodeIgniter\\Controller;
use CodeIgniter\\HTTP\\CLIRequest;
use CodeIgniter\\HTTP\\IncomingRequest;
use CodeIgniter\\HTTP\\RequestInterface;
use CodeIgniter\\HTTP\\ResponseInterface;
use Psr\\Log\\LoggerInterface;

abstract class BaseController extends Controller
{
    protected $request;
    protected $session;

    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);
        $this->session = \\Config\\Services::session();
    }
}
""")

    create_file('app/Controllers/Home.php', """<?php
namespace App\\Controllers;

class Home extends BaseController
{
    public function index(): string
    {
        $db = \\Config\\Database::connect();
        
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
""")

    create_file('app/Controllers/Pasien.php', """<?php
namespace App\\Controllers;

class Pasien extends BaseController
{
    public function index()
    {
        $user = $this->session->get('patient_user');
        if (!$user) {
            return redirect()->to(base_url('pasien/login'));
        }

        $db = \\Config\\Database::connect();
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

        $db = \\Config\\Database::connect();
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

        $db = \\Config\\Database::connect();
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
        $db = \\Config\\Database::connect();
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
        $db = \\Config\\Database::connect();
        $patient = $db->table('patients')->where('code', $code)->get()->getRowArray();
        return view('pasien/tiket', ['patient' => $patient]);
    }

    public function monitor()
    {
        $db = \\Config\\Database::connect();
        $today = date('Y-m-d');
        $patients = $db->table('patients')
                       ->where('visit_date', $today)
                       ->where('status !=', 'Batal')
                       ->orderBy('time_slot', 'ASC')
                       ->get()->getResultArray();

        return view('pasien/monitor', ['patients' => $patients]);
    }
}
""")

    create_file('app/Controllers/Admin.php', """<?php
namespace App\\Controllers;

class Admin extends BaseController
{
    public function index()
    {
        if (!$this->session->get('admin_logged_in')) {
            return redirect()->to(base_url('admin/login'));
        }

        $db = \\Config\\Database::connect();
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

        $db = \\Config\\Database::connect();
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
        $db = \\Config\\Database::connect();
        $db->table('patients')->where('id', $id)->update(['status' => 'Dipanggil']);
        return redirect()->to(base_url('admin'));
    }

    public function selesai($id)
    {
        $db = \\Config\\Database::connect();
        $db->table('patients')->where('id', $id)->update(['status' => 'Selesai']);
        return redirect()->to(base_url('admin'));
    }
}
""")

    # 5. Public Folder (index.php, .htaccess)
    create_file('public/index.php', """<?php
// CodeIgniter 4 Front Controller
define('FCPATH', __DIR__ . DIRECTORY_SEPARATOR);
chdir(FCPATH);

require FCPATH . '../app/Config/Paths.php';
$paths = new Config\\Paths();

require $paths->systemDirectory . '/Boot.php';
exit(CodeIgniter\\Boot::bootWeb($paths));
""")

    create_file('public/.htaccess', """<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php/$1 [L]
</IfModule>
""")

    create_file('public/robots.txt', """User-agent: *
Disallow:
""")

    # 6. Writable & System minimal structure
    for d in ['cache', 'logs', 'session', 'uploads']:
        create_file(f'writable/{d}/.htaccess', 'Deny from all')
        create_file(f'writable/{d}/index.html', '<!DOCTYPE html><html><head><title>403</title></head><body>Directory access is forbidden.</body></html>')

    create_file('writable/.htaccess', 'Deny from all')
    create_file('writable/index.html', '<!DOCTYPE html><html><head><title>403</title></head><body>Directory access is forbidden.</body></html>')

    # Tests directories
    for d in ['_support', 'database', 'session', 'unit']:
        create_file(f'tests/{d}/index.html', '')
    create_file('tests/.htaccess', 'Deny from all')
    create_file('tests/index.html', '')
    create_file('tests/README.md', '# Tests directory')

    # System bootstrap
    create_file('system/superglobals.php', """<?php
// Superglobals helper
""")

    create_file('system/Boot.php', """<?php
namespace CodeIgniter;

class Boot
{
    public static function bootWeb($paths)
    {
        // Simple fallback web runner when full CI4 vendor is not composer-installed
        $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($requestUri, PHP_URL_PATH);

        // Basic router mapping
        if ($path === '/' || $path === '/index.php' || $path === '') {
            $controller = new \\App\\Controllers\\Home();
            $controller->initController(new \\stdClass(), new \\stdClass(), new \\stdClass());
            echo $controller->index();
            return 0;
        }

        // Pasien route
        if (str_starts_with($path, '/pasien')) {
            $controller = new \\App\\Controllers\\Pasien();
            $controller->initController(new \\stdClass(), new \\stdClass(), new \\stdClass());
            if ($path === '/pasien/login') { echo $controller->login(); return 0; }
            if ($path === '/pasien/daftar') { echo $controller->daftar(); return 0; }
            if ($path === '/pasien/monitor') { echo $controller->monitor(); return 0; }
            if (str_starts_with($path, '/pasien/tiket/')) {
                $code = basename($path);
                echo $controller->tiket($code);
                return 0;
            }
            echo $controller->index();
            return 0;
        }

        // Admin route
        if (str_starts_with($path, '/admin')) {
            $controller = new \\App\\Controllers\\Admin();
            $controller->initController(new \\stdClass(), new \\stdClass(), new \\stdClass());
            if ($path === '/admin/login') { echo $controller->login(); return 0; }
            echo $controller->index();
            return 0;
        }

        header("HTTP/1.0 404 Not Found");
        echo "<h1>404 - Halaman Tidak Ditemukan</h1><p>Klinik H.APUD CodeIgniter 4</p>";
        return 0;
    }

    public static function bootSpark($paths)
    {
        echo "Klinik H.APUD - CodeIgniter 4 CLI\\n";
        echo "Menjalankan server development di http://localhost:8080\\n";
        passthru("php -S localhost:8080 -t public");
        return 0;
    }
}
""")

    # 7. Views
    create_file('app/Views/layout/header.php', """<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Klinik H.APUD - Pendaftaran Online & Antrean Sesi</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">
    <!-- Navbar Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
            <a href="<?= base_url() ?>" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-600/25">H</div>
                <div>
                    <h1 class="text-base sm:text-lg font-black text-slate-900 leading-tight">Klinik H.APUD</h1>
                    <p class="text-[10px] text-teal-700 font-bold tracking-wider uppercase">Pendaftaran Online & Antrean Sesi Bebas Bentrok</p>
                </div>
            </a>
            <div class="flex items-center gap-2">
                <a href="<?= base_url('pasien') ?>" class="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl text-xs transition">Portal Pasien</a>
                <a href="<?= base_url('admin') ?>" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition">Admin Klinik</a>
            </div>
        </div>
    </header>
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
""")

    create_file('app/Views/layout/footer.php', """    </main>
    <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p class="font-bold text-slate-700">Klinik H.APUD • Jl.Sukaresmi Desa Mekarjaya Kec. Compreng Kab. Subang</p>
        <p class="text-[11px] text-slate-400 mt-1">Sistem Pendaftaran Bebas Bentrok Jam Berbasis CodeIgniter 4 & MySQL</p>
    </footer>
</body>
</html>
""")

    create_file('app/Views/landing.php', """<?php include(APPPATH . 'Views/layout/header.php'); ?>
<div class="space-y-8 py-4">
    <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">SISTEM RESMI CODEIGNITER 4 & MYSQL</span>
        <h1 class="text-3xl sm:text-5xl font-black text-slate-900">Selamat Datang di <span class="text-teal-700">Klinik H.APUD</span></h1>
        <p class="text-slate-600 text-sm sm:text-base">Pusat Pelayanan Kesehatan Warga Compreng & Sekitarnya. Pilih jadwal jam kunjungan spesifik tanpa antre berdesakan.</p>
    </div>

    <!-- Pilihan Menu Portal -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <!-- Kartu Pasien -->
        <a href="<?= base_url('pasien') ?>" class="bg-gradient-to-br from-teal-700 to-teal-900 text-white p-7 rounded-3xl shadow-xl hover:scale-[1.02] transition block">
            <span class="text-xs font-bold text-teal-300 uppercase tracking-widest">Warga & Pasien</span>
            <h2 class="text-2xl font-black mt-1">Ambil Nomor Antrean Berobat</h2>
            <p class="text-xs text-teal-100 mt-2">Daftar berobat online, pilih dokter dan jam kunjungan, lalu dapatkan tiket antrean digital langsung.</p>
            <div class="mt-4 inline-flex items-center font-bold text-xs bg-white text-teal-900 px-4 py-2 rounded-xl">Buka Portal Pasien →</div>
        </a>

        <!-- Kartu Admin -->
        <a href="<?= base_url('admin') ?>" class="bg-slate-900 text-white p-7 rounded-3xl shadow-xl hover:scale-[1.02] transition block border border-slate-800">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Khusus Petugas</span>
            <h2 class="text-2xl font-black mt-1">Portal Admin Klinik</h2>
            <p class="text-xs text-slate-400 mt-2">Kelola antrean per sesi jam, panggil pasien, atur status buka/tutup klinik, dan catat rekam medis.</p>
            <div class="mt-4 inline-flex items-center font-bold text-xs bg-amber-500 text-slate-950 px-4 py-2 rounded-xl">Masuk Admin Klinik →</div>
        </a>
    </div>
</div>
<?php include(APPPATH . 'Views/layout/footer.php'); ?>
""")

    create_file('app/Views/pasien/login.php', """<?php include(APPPATH . 'Views/layout/header.php'); ?>
<div class="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
    <div class="text-center space-y-1">
        <h2 class="text-2xl font-black text-slate-900">Masuk Akun Pasien</h2>
        <p class="text-xs text-slate-500">Ketik Nama Lengkap dan Kata Sandi terdaftar Anda</p>
    </div>

    <?php if(!empty($error)): ?>
        <div class="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200"><?= $error ?></div>
    <?php endif; ?>

    <form action="<?= base_url('pasien/auth') ?>" method="post" class="space-y-4 text-xs sm:text-sm">
        <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap Pasien</label>
            <input type="text" name="name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Contoh: Ibu Siti Aminah">
        </div>
        <div>
            <label class="block font-bold text-slate-700 mb-1">Kata Sandi</label>
            <input type="password" name="password" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Masukkan kata sandi akun">
        </div>
        <button type="submit" class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition cursor-pointer">Masuk Sekarang</button>
    </form>

    <div class="text-center border-t border-slate-100 pt-4 text-xs">
        <p class="text-slate-500">Belum memiliki akun terdaftar?</p>
        <a href="<?= base_url('pasien/daftar') ?>" class="font-bold text-teal-700 hover:underline mt-1 inline-block">+ Daftar Pasien Baru</a>
    </div>
</div>
<?php include(APPPATH . 'Views/layout/footer.php'); ?>
""")

    create_file('app/Views/pasien/daftar.php', """<?php include(APPPATH . 'Views/layout/header.php'); ?>
<div class="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
    <div class="text-center space-y-1">
        <h2 class="text-2xl font-black text-slate-900">Pendaftaran Akun Pasien Baru</h2>
        <p class="text-xs text-slate-500">Daftarkan identitas pasien untuk memilih sesi berobat</p>
    </div>

    <form action="<?= base_url('pasien/simpan_daftar') ?>" method="post" class="space-y-4 text-xs sm:text-sm">
        <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap Pasien *</label>
            <input type="text" name="name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Nama sesuai KTP">
        </div>
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block font-bold text-slate-700 mb-1">Nomor WhatsApp *</label>
                <input type="text" name="phone" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="08xxxxxxxxxx">
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Kata Sandi Akun *</label>
                <input type="password" name="password" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Minimal 4 huruf">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                <input type="date" name="dob" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none">
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                <select name="gender" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                </select>
            </div>
        </div>
        <div>
            <label class="block font-bold text-slate-700 mb-1">Alamat Dusun / Desa</label>
            <textarea name="address" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Contoh: Dusun Sukaresmi RT 02/01"></textarea>
        </div>
        <button type="submit" class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition cursor-pointer">Simpan & Buat Akun Pasien</button>
    </form>
</div>
<?php include(APPPATH . 'Views/layout/footer.php'); ?>
""")

    create_file('app/Views/pasien/akun.php', """<?php include(APPPATH . 'Views/layout/header.php'); ?>
<div class="space-y-6">
    <!-- Header Pasien -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                <?= strtoupper(substr($user['name'], 0, 1)) ?>
            </div>
            <div>
                <span class="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">Akun Pasien Resmi</span>
                <h2 class="text-2xl font-black text-slate-900 mt-0.5"><?= esc($user['name']) ?></h2>
                <p class="text-xs text-slate-500"><?= esc($user['phone']) ?> • <?= esc($user['address'] ?? 'Compreng') ?></p>
            </div>
        </div>
        <div class="flex gap-2">
            <a href="<?= base_url('pasien/logout') ?>" class="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition">Keluar Akun</a>
        </div>
    </div>

    <!-- Tiket Aktif -->
    <?php if($activeTicket): ?>
        <div class="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-7 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div class="space-y-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">Tiket Antrean Anda</span>
                <h1 class="text-5xl font-black text-white"><?= esc($activeTicket['code']) ?></h1>
                <p class="text-xs text-teal-200">Jadwal: <?= esc($activeTicket['session_name']) ?> (<?= esc($activeTicket['time_slot']) ?> WIB) • Layanan: <?= esc($activeTicket['service']) ?></p>
                <p class="text-xs font-bold text-amber-300">Status: <?= esc($activeTicket['status']) ?></p>
            </div>
            <div class="flex gap-2">
                <a href="<?= base_url('pasien/tiket/' . $activeTicket['code']) ?>" class="px-5 py-3 bg-white text-slate-900 font-black rounded-xl text-xs hover:bg-slate-100 transition">Lihat Tiket Digital</a>
            </div>
        </div>
    <?php endif; ?>

    <!-- Form Ambil Antrean Baru -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 class="text-lg font-black text-slate-900">Daftar Berobat & Ambil Jam Kunjungan</h3>
        <form action="<?= base_url('pasien/daftar_berobat') ?>" method="post" class="space-y-4 text-xs sm:text-sm">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Layanan Medis</label>
                    <select name="service" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none">
                        <option value="Konsultasi & Berobat Umum">Konsultasi & Berobat Umum</option>
                        <option value="Pemeriksaan Ibu & Anak (KIA)">Pemeriksaan Ibu & Anak (KIA)</option>
                        <option value="Pelayanan Gigi & Mulut">Pelayanan Gigi & Mulut</option>
                        <option value="Cek Laboratorium & Darah">Cek Laboratorium & Darah</option>
                        <option value="Home Care (Kunjungan Pasien di Rumah)">Home Care (Kunjungan Pasien di Rumah)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Tanggal Kunjungan</label>
                    <input type="date" name="visit_date" value="<?= date('Y-m-d') ?>" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Pilih Sesi Jam</label>
                    <select name="session_name" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none">
                        <option value="Sesi 1 (Pagi)">Sesi 1 (Pagi 08:00 - 12:00)</option>
                        <option value="Sesi 2 (Siang)">Sesi 2 (Siang 13:00 - 17:00)</option>
                        <option value="Sesi 3 (Malam)">Sesi 3 (Malam 18:30 - 21:00)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Pilih Jam Kedatangan Spesifik</label>
                    <select name="time_slot" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none">
                        <option value="08:00 - 09:00">08:00 - 09:00 WIB</option>
                        <option value="09:00 - 10:00">09:00 - 10:00 WIB</option>
                        <option value="10:00 - 11:00">10:00 - 11:00 WIB</option>
                        <option value="13:00 - 14:00">13:00 - 14:00 WIB</option>
                        <option value="18:30 - 19:30">18:30 - 19:30 WIB</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block font-bold text-slate-700 mb-1">Keluhan Penyakit / Gejala</label>
                <textarea name="complaint" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Tuliskan keluhan atau gejala yang dirasakan"></textarea>
            </div>

            <button type="submit" class="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition cursor-pointer">+ Terbitkan Nomor Antrean Berobat</button>
        </form>
    </div>
</div>
<?php include(APPPATH . 'Views/layout/footer.php'); ?>
""")

    create_file('app/Views/pasien/tiket.php', """<?php include(APPPATH . 'Views/layout/header.php'); ?>
<div class="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-center">
    <div class="space-y-1">
        <span class="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">Tiket Antrean Resmi</span>
        <h2 class="text-xl font-black text-slate-900 mt-2">Klinik H.APUD</h2>
        <p class="text-xs text-slate-500">Mekarjaya, Compreng, Subang</p>
    </div>

    <div class="p-6 bg-teal-50/70 border-2 border-teal-200 rounded-2xl space-y-1">
        <span class="text-xs font-bold text-teal-700 uppercase">Nomor Antrean Anda</span>
        <h1 class="text-5xl font-black text-teal-900"><?= esc($patient['code']) ?></h1>
        <p class="text-xs text-slate-600 font-bold mt-2"><?= esc($patient['name']) ?></p>
    </div>

    <div class="text-left text-xs space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div class="flex justify-between">
            <span class="text-slate-400">Jadwal:</span>
            <span class="font-bold"><?= esc($patient['visit_date']) ?> (<?= esc($patient['time_slot']) ?> WIB)</span>
        </div>
        <div class="flex justify-between">
            <span class="text-slate-400">Layanan:</span>
            <span class="font-bold"><?= esc($patient['service']) ?></span>
        </div>
        <div class="flex justify-between">
            <span class="text-slate-400">Status:</span>
            <span class="font-bold text-teal-700"><?= esc($patient['status']) ?></span>
        </div>
    </div>

    <div class="flex gap-2">
        <button onclick="window.print()" class="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs">Cetak Tiket</button>
        <a href="<?= base_url('pasien') ?>" class="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs flex items-center justify-center">Kembali ke Akun</a>
    </div>
</div>
<?php include(APPPATH . 'Views/layout/footer.php'); ?>
""")

    create_file('app/Views/admin/login.php', """<?php include(APPPATH . 'Views/layout/header.php'); ?>
<div class="max-w-md mx-auto bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
    <div class="text-center space-y-1">
        <span class="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold uppercase">Petugas Medis & Admin</span>
        <h2 class="text-2xl font-black text-white mt-2">Login Petugas Klinik</h2>
        <p class="text-xs text-slate-400">Masuk untuk mengelola panggilan antrean pasien</p>
    </div>

    <?php if(!empty($error)): ?>
        <div class="p-3 bg-rose-500/20 text-rose-300 text-xs rounded-xl border border-rose-500/30"><?= $error ?></div>
    <?php endif; ?>

    <form action="<?= base_url('admin/auth') ?>" method="post" class="space-y-4 text-xs sm:text-sm">
        <div>
            <label class="block font-bold text-slate-300 mb-1">Username Admin</label>
            <input type="text" name="username" required value="admin" class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 outline-none">
        </div>
        <div>
            <label class="block font-bold text-slate-300 mb-1">Kata Sandi</label>
            <input type="password" name="password" required value="KlinikApud#2026" class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 outline-none">
        </div>
        <button type="submit" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition cursor-pointer">Masuk ke Dashboard Admin</button>
    </form>
</div>
<?php include(APPPATH . 'Views/layout/footer.php'); ?>
""")

    create_file('app/Views/admin/dashboard.php', """<?php include(APPPATH . 'Views/layout/header.php'); ?>
<div class="space-y-6">
    <div class="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl flex justify-between items-center shadow-lg">
        <div>
            <span class="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Dashboard Petugas</span>
            <h2 class="text-2xl font-black">Manajemen Antrean Klinik H.APUD</h2>
            <p class="text-xs text-slate-400 mt-0.5">Hari ini: <?= date('d M Y') ?> • Total <?= count($patients) ?> Pasien Terdaftar</p>
        </div>
        <div>
            <a href="<?= base_url('admin/logout') ?>" class="px-4 py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-bold transition">Logout</a>
        </div>
    </div>

    <!-- Tabel Pasien -->
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div class="p-5 border-b border-slate-100 font-black text-slate-900">Daftar Pasien Hari Ini</div>
        <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                    <th class="p-3.5">No Antrean</th>
                    <th class="p-3.5">Nama Pasien</th>
                    <th class="p-3.5">Layanan</th>
                    <th class="p-3.5">Jam Slot</th>
                    <th class="p-3.5">Status</th>
                    <th class="p-3.5 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                <?php if(empty($patients)): ?>
                    <tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada pasien terdaftar hari ini.</td></tr>
                <?php else: foreach($patients as $p): ?>
                    <tr class="hover:bg-slate-50">
                        <td class="p-3.5 font-black text-teal-800 font-mono text-sm"><?= esc($p['code']) ?></td>
                        <td class="p-3.5 font-bold text-slate-900"><?= esc($p['name']) ?></td>
                        <td class="p-3.5"><?= esc($p['service']) ?></td>
                        <td class="p-3.5"><?= esc($p['time_slot']) ?> WIB</td>
                        <td class="p-3.5">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold <?= $p['status'] === 'Dipanggil' ? 'bg-amber-100 text-amber-800' : ($p['status'] === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700') ?>">
                                <?= esc($p['status']) ?>
                            </span>
                        </td>
                        <td class="p-3.5 text-center">
                            <?php if(!str_contains(strtolower($p['service']), 'home care')): ?>
                                <a href="<?= base_url('admin/panggil/' . $p['id']) ?>" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold">Panggil</a>
                            <?php else: ?>
                                <span class="px-2 py-0.5 bg-sky-50 text-sky-800 text-[10px] font-bold rounded">Home Care</span>
                            <?php endif; ?>
                            <a href="<?= base_url('admin/selesai/' . $p['id']) ?>" class="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold ml-1">Selesai</a>
                        </td>
                    </tr>
                <?php endforeach; endif; ?>
            </tbody>
        </table>
    </div>
</div>
<?php include(APPPATH . 'Views/layout/footer.php'); ?>
""")

    print(f"CodeIgniter 4 folder built successfully in {BASE_DIR}/")

if __name__ == '__main__':
    build_ci4_structure()
