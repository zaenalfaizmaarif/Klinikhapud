<?php include(APPPATH . 'Views/layout/header.php'); ?>
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
