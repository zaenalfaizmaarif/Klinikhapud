<?php include(APPPATH . 'Views/layout/header.php'); ?>
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
