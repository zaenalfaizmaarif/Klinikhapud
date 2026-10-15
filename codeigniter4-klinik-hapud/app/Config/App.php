<?php
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
