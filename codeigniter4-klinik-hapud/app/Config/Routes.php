<?php
namespace Config;

use CodeIgniter\Router\RouteCollection;

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
