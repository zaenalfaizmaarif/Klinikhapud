<?php include(APPPATH . 'Views/layout/header.php'); ?>
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
