<?php include(APPPATH . 'Views/layout/header.php'); ?>
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
