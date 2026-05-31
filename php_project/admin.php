<?php
// admin.php
// Halaman Dashboard IT Admin untuk melihat keseluruhan tiket masuk serta memperbarui statusnya.

// 1. Hubungkan koneksi database
require_once 'db.php';

try {
    // 2. Ambil semua tiket yang diurutkan dari yang terbaru (tanggal descending)
    $sql = "SELECT * FROM tickets ORDER BY tanggal DESC";
    $stmt = $pdo->query($sql);
    $tickets = $stmt->fetchAll();
} catch (PDOException $e) {
    die("Gagal mengambil data tiket: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IT Admin Dashboard - Sistem Ticketing</title>
    <!-- Hubungkan ke stylesheet eksternal -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <!-- Header Navigasi -->
        <header>
            <h1>IT Support Dashboard</h1>
            <nav class="nav-links">
                <a href="index.php">Kirim Tiket</a>
                <a href="admin.php" class="active">Dashboard IT (Admin)</a>
            </nav>
        </header>

        <!-- Pesan Notifikasi jika Berhasil Mengubah Status -->
        <?php if (isset($_GET['notif'])): ?>
            <?php if ($_GET['notif'] === 'updated'): ?>
                <div class="alert alert-success" style="padding: 10px 15px; margin-bottom: 20px;">
                    <strong>Berhasil!</strong> Status tiket telah diperbarui.
                </div>
            <?php elseif ($_GET['notif'] === 'invalid'): ?>
                <div class="alert alert-danger" style="padding: 10px 15px; margin-bottom: 20px;">
                    <strong>Gagal!</strong> ID tiket atau status yang diminta tidak valid.
                </div>
            <?php endif; ?>
        <?php endif; ?>

        <!-- Kartu Utama Dashboard -->
        <div class="card">
            <h2 class="card-title">Daftar Tiket Kendala IT Masuk</h2>

            <!-- Handling Jika Tiket Kosong -->
            <?php if (empty($tickets)): ?>
                <div style="text-align: center; color: var(--text-muted); padding: 40px 0;">
                    <p style="font-size: 1.1rem; font-weight: 500;">Belum ada tiket masuk saat ini.</p>
                    <p style="font-size: 0.9rem; margin-top: 5px;">Karyawan belum ada yang mengirimkan kendala IT.</p>
                </div>
            <?php else: ?>
                
                <!-- Elemen Pembungkus Tabel agar Responsif di Desktop/Tablet -->
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px;">No. Tiket</th>
                                <th style="width: 180px;">Pelapor</th>
                                <th style="width: 100px;">Divisi</th>
                                <th>Deskripsi Kendala</th>
                                <th style="width: 120px;">Kategori</th>
                                <th style="width: 100px;">Urgensi</th>
                                <th style="width: 120px;">Status</th>
                                <th style="width: 200px; text-align: center;">Tindakan Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($tickets as $ticket): 
                                // Format ID tiket (Contoh: ID 1 menjadi TCK-0001)
                                $formatted_id = "TCK-" . str_pad($ticket['id'], 4, "0", STR_PAD_LEFT);
                                
                                // Map class CSS untuk Status
                                $status_class = 'badge-open';
                                if ($ticket['status'] === 'In Progress') $status_class = 'badge-progress';
                                if ($ticket['status'] === 'Resolved') $status_class = 'badge-resolved';

                                // Map class CSS untuk Urgensi
                                $urgency_class = 'badge-low';
                                if ($ticket['urgensi'] === 'Medium') $urgency_class = 'badge-medium';
                                if ($ticket['urgensi'] === 'High') $urgency_class = 'badge-high';
                            ?>
                                <tr>
                                    <!-- data-label digunakan untuk media query agar responsif saat dibuka di mobile -->
                                    <td data-label="No. Tiket">
                                        <strong style="color: var(--primary-color); font-size: 0.9rem;">
                                            <?= htmlspecialchars($formatted_id) ?>
                                        </strong>
                                    </td>
                                    <td data-label="Pelapor">
                                        <div style="font-weight: 600;"><?= htmlspecialchars($ticket['nama']) ?></div>
                                        <div style="font-size: 0.8rem; color: var(--text-muted);"><?= htmlspecialchars($ticket['email']) ?></div>
                                    </td>
                                    <td data-label="Divisi">
                                        <?= htmlspecialchars($ticket['divisi']) ?>
                                    </td>
                                    <td data-label="Deskripsi Kendala">
                                        <div style="font-weight: 600;"><?= htmlspecialchars($ticket['judul']) ?></div>
                                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">
                                            <?= nl2br(htmlspecialchars($ticket['deskripsi'])) ?>
                                        </div>
                                        <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
                                            <?php if (!empty($ticket['tanggal_pengajuan'])): ?>
                                                <span>📅 Pengajuan: <strong><?= date('d M Y', strtotime($ticket['tanggal_pengajuan'])) ?></strong></span>
                                            <?php endif; ?>
                                            <span>⏱️ Sistem: <?= date('d M Y - H:i', strtotime($ticket['tanggal'])) ?></span>
                                            <?php if ($ticket['status'] === 'Resolved' && !empty($ticket['tanggal_resolve'])): ?>
                                                <span style="color: #10b981; font-weight: bold;">✅ Selesai: <?= date('d M Y - H:i', strtotime($ticket['tanggal_resolve'])) ?></span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td data-label="Kategori">
                                        <span class="badge" style="background-color: #f1f5f9; color: #334155;">
                                            <?= htmlspecialchars($ticket['kategori']) ?>
                                        </span>
                                    </td>
                                    <td data-label="Urgensi">
                                        <span class="badge <?= $urgency_class ?>">
                                            <?= htmlspecialchars($ticket['urgensi']) ?>
                                        </span>
                                    </td>
                                    <td data-label="Status">
                                        <span class="badge <?= $status_class ?>">
                                            <?= htmlspecialchars($ticket['status']) ?>
                                        </span>
                                    </td>
                                    <td data-label="Tindakan Admin">
                                        <!-- Form untuk memperbarui status tiket menggunakan POST -->
                                        <form action="update_status.php" method="POST" class="status-action-form">
                                            <input type="hidden" name="id" value="<?= $ticket['id'] ?>">
                                            
                                            <?php if ($ticket['status'] !== 'Open'): ?>
                                                <button type="submit" name="status" value="Open" class="btn-status btn-open" title="Ubah status ke Open">Open</button>
                                            <?php endif; ?>

                                            <?php if ($ticket['status'] !== 'In Progress'): ?>
                                                <button type="submit" name="status" value="In Progress" class="btn-status btn-progress" title="Ubah status ke In Progress">Progress</button>
                                            <?php endif; ?>

                                            <?php if ($ticket['status'] !== 'Resolved'): ?>
                                                <button type="submit" name="status" value="Resolved" class="btn-status btn-resolved" title="Selesaikan Tiket">Resolve</button>
                                            <?php endif; ?>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

            <?php endif; ?>
        </div>
    </div>
</body>
</html>
