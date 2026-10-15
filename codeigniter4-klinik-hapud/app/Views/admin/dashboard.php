<?php include(APPPATH . 'Views/layout/header.php'); ?>
<div class="space-y-6">
    <div class="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl flex justify-between items-center shadow-lg">
        <div>
            <span class="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Dashboard Petugas</span>
            <h2 class="text-2xl font-black">Manajemen Antrean Klinik H.APUD</h2>
            <p class="text-xs text-slate-400 mt-0.5">Hari ini: <?= date('d M Y') ?> • Total <?= count($patients) ?> Pasien Terdaftar</p>
        </div>
        <div>
            <a href="<?= base_url('admin/logout') ?>" class="px-4 py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-bold transition">Logout</a>
        </div>
    </div>

    <!-- Tabel Pasien -->
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div class="p-5 border-b border-slate-100 font-black text-slate-900">Daftar Pasien Hari Ini</div>
        <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                    <th class="p-3.5">No Antrean</th>
                    <th class="p-3.5">Nama Pasien</th>
                    <th class="p-3.5">Layanan</th>
                    <th class="p-3.5">Jam Slot</th>
                    <th class="p-3.5">Status</th>
                    <th class="p-3.5 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                <?php if(empty($patients)): ?>
                    <tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada pasien terdaftar hari ini.</td></tr>
                <?php else: foreach($patients as $p): ?>
                    <tr class="hover:bg-slate-50">
                        <td class="p-3.5 font-black text-teal-800 font-mono text-sm"><?= esc($p['code']) ?></td>
                        <td class="p-3.5 font-bold text-slate-900"><?= esc($p['name']) ?></td>
                        <td class="p-3.5"><?= esc($p['service']) ?></td>
                        <td class="p-3.5"><?= esc($p['time_slot']) ?> WIB</td>
                        <td class="p-3.5">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold <?= $p['status'] === 'Dipanggil' ? 'bg-amber-100 text-amber-800' : ($p['status'] === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700') ?>">
                                <?= esc($p['status']) ?>
                            </span>
                        </td>
                        <td class="p-3.5 text-center">
                            <?php if(!str_contains(strtolower($p['service']), 'home care')): ?>
                                <a href="<?= base_url('admin/panggil/' . $p['id']) ?>" class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold">Panggil</a>
                            <?php else: ?>
                                <span class="px-2 py-0.5 bg-sky-50 text-sky-800 text-[10px] font-bold rounded">Home Care</span>
                            <?php endif; ?>
                            <a href="<?= base_url('admin/selesai/' . $p['id']) ?>" class="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold ml-1">Selesai</a>
                        </td>
                    </tr>
                <?php endforeach; endif; ?>
            </tbody>
        </table>
    </div>
</div>
<?php include(APPPATH . 'Views/layout/footer.php'); ?>
