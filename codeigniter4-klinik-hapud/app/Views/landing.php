<?php include(APPPATH . 'Views/layout/header.php'); ?>
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
