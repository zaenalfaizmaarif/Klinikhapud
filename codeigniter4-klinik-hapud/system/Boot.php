<?php
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
            $controller = new \App\Controllers\Home();
            $controller->initController(new \stdClass(), new \stdClass(), new \stdClass());
            echo $controller->index();
            return 0;
        }

        // Pasien route
        if (str_starts_with($path, '/pasien')) {
            $controller = new \App\Controllers\Pasien();
            $controller->initController(new \stdClass(), new \stdClass(), new \stdClass());
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
            $controller = new \App\Controllers\Admin();
            $controller->initController(new \stdClass(), new \stdClass(), new \stdClass());
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
        echo "Klinik H.APUD - CodeIgniter 4 CLI\n";
        echo "Menjalankan server development di http://localhost:8080\n";
        passthru("php -S localhost:8080 -t public");
        return 0;
    }
}
