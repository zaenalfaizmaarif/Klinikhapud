<?php include(APPPATH . 'Views/layout/header.php'); ?>
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
