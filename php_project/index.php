<?php
// index.php
// Halaman form utama bagi user / karyawan untuk mengirimkan tiket laporan kendala IT Support.
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Ticketing IT Support</title>
    <!-- Hubungkan ke stylesheet eksternal -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <!-- Header Navigasi -->
        <header>
            <h1>Sistem IT Support</h1>
            <nav class="nav-links">
                <a href="index.php" class="active">Kirim Tiket</a>
                <a href="admin.php">Dashboard IT (Admin)</a>
            </nav>
        </header>

        <!-- Formulir Input Tiket -->
        <div class="card">
            <h2 class="card-title">Formulir Pengajuan Tiket IT Support</h2>

            <!-- Handling Alert Berdasarkan Status di URL Parameter -->
            <?php if (isset($_GET['status'])): ?>
                <?php if ($_GET['status'] === 'success'): ?>
                    <div class="alert alert-success">
                        <strong>Berhasil!</strong> Tiket Anda berhasil dikirim dan akan segera diproses oleh tim IT.
                    </div>
                <?php elseif ($_GET['status'] === 'error'): ?>
                    <div class="alert alert-danger">
                        <strong>Gagal!</strong> Terjadi kesalahan. Pastikan semua kolom terisi dengan benar.
                    </div>
                <?php endif; ?>
            <?php endif; ?>

            <form action="simpan_tiket.php" method="POST">
                <div class="form-grid">
                    <!-- Kolom Kiri: Informasi Personal -->
                    <div class="form-group">
                        <label for="nama">Nama Lengkap</label>
                        <input type="text" id="nama" name="nama" placeholder="Masukkan nama lengkap Anda" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email Perusahaan</label>
                        <input type="email" id="email" name="email" placeholder="contoh@perusahaan.com" required>
                    </div>

                    <div class="form-group">
                        <label for="divisi">Divisi / Departemen</label>
                        <input type="text" id="divisi" name="divisi" placeholder="Contoh: HRD, Finance, Gudang" required>
                    </div>

                    <div class="form-group">
                        <label for="kategori">Kategori Kendala</label>
                        <select id="kategori" name="kategori" required>
                            <option value="" disabled selected>-- Pilih Kategori --</option>
                            <option value="Hardware">Hardware (Komputer, Printer, Mouse, dll)</option>
                            <option value="Software">Software (Sistem, OS, Excel, ERP, dll)</option>
                            <option value="Network">Network (Koneksi WiFi, Kabel LAN, Internet)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="urgensi">Tingkat Urgensi</label>
                        <select id="urgensi" name="urgensi" required>
                            <option value="" disabled selected>-- Pilih Tingkat Urgensi --</option>
                            <option value="Low">Low - Tidak mengganggu pekerjaan utama</option>
                            <option value="Medium">Medium - Agak mengganggu pekerjaan utama</option>
                            <option value="High">High - Menghentikan pekerjaan utama / krusial</option>
                        </select>
                    </div>

                    <!-- Kolom Kanan / Bawah: Detail Laporan -->
                    <div class="form-group-full form-group" style="margin-top: 10px;">
                        <label for="judul">Judul Masalah</label>
                        <input type="text" id="judul" name="judul" placeholder="Ringkasan singkat kendala (Contoh: Printer Rusak, Excel Crash)" required>
                    </div>

                    <div class="form-group-full form-group">
                        <label for="deskripsi">Deskripsi Masalah Lengkap</label>
                        <textarea id="deskripsi" name="deskripsi" placeholder="Tuliskan detail kronologi masalah, nomor inventaris jika ada, dan kendala spesifik yang dihadapi secara rinci..." required></textarea>
                    </div>

                    <!-- Tombol Kirim -->
                    <div class="form-group-full">
                        <button type="submit" class="btn" style="width: 100%;">Kirim Tiket Bantuan</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
