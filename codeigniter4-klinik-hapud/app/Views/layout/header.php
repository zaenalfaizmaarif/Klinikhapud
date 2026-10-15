<!DOCTYPE html>
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
