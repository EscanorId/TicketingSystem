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
                        <label for="divisi_select">Divisi / Departemen</label>
                        <select id="divisi_select" name="divisi" required>
                            <option value="" disabled selected>-- Pilih Divisi/Departemen --</option>
                            <option value="Information Technology (IT)">Information Technology (IT)</option>
                            <option value="Human Resources / HRD">Human Resources / HRD</option>
                            <option value="Finance & Accounting">Finance & Accounting</option>
                            <option value="Sales & Marketing">Sales & Marketing</option>
                            <option value="Operations & Logistics">Operations & Logistics</option>
                            <option value="Customer Service / Support">Customer Service / Support</option>
                            <option value="General Affairs (GA)">General Affairs (GA)</option>
                            <option value="Purchasing / Procurement">Purchasing / Procurement</option>
                            <option value="Legal & Compliance">Legal & Compliance</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Research & Development (R&D)">Research & Development (R&D)</option>
                            <option value="Quality Assurance (QA)">Quality Assurance (QA)</option>
                            <option value="Production / Manufacturing">Production / Manufacturing</option>
                            <option value="Security & Safety (HSE)">Security & Safety (HSE)</option>
                            <option value="Project Management (PMO)">Project Management (PMO)</option>
                            <option value="Creative & Design">Creative & Design</option>
                            <option value="Public Relations (PR)">Public Relations (PR)</option>
                            <option value="Business Development">Business Development</option>
                            <option value="Internal Audit">Internal Audit</option>
                            <option value="Corporate Communications">Corporate Communications</option>
                            <option value="Administration">Administration</option>
                            <option value="Others">Others (Lainnya)</option>
                        </select>
                        <div id="custom_divisi_wrapper" style="margin-top: 8px; display: none;">
                            <input type="text" id="custom_divisi" placeholder="Masukkan nama divisi Anda..." style="border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 8px; width: 100%;">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="kategori_select">Kategori Kendala</label>
                        <select id="kategori_select" name="kategori" required>
                            <option value="" disabled selected>-- Pilih Kategori --</option>
                            <option value="Hardware">Hardware (Komputer, Printer, Mouse, dll)</option>
                            <option value="Software">Software (Sistem, OS, Excel, ERP, dll)</option>
                            <option value="Network">Network (Koneksi WiFi, Kabel LAN, Internet)</option>
                            <option value="Other">Other / Kategori Lainnya</option>
                        </select>
                        <div id="custom_kategori_wrapper" style="margin-top: 8px; display: none;">
                            <input type="text" id="custom_kategori" placeholder="Masukkan kategori kendala baru..." style="border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 8px; width: 100%;">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="tanggal_pengajuan">Tanggal Pengajuan</label>
                        <input type="date" id="tanggal_pengajuan" name="tanggal_pengajuan" required>
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

    <script>
        // Set default date to today
        document.getElementById('tanggal_pengajuan').value = new Date().toISOString().split('T')[0];

        // Swapping name attributes for Division
        const divisiSelect = document.getElementById('divisi_select');
        const customDivisiWrapper = document.getElementById('custom_divisi_wrapper');
        const customDivisiInput = document.getElementById('custom_divisi');

        divisiSelect.addEventListener('change', function() {
            if (this.value === 'Others') {
                customDivisiWrapper.style.display = 'block';
                customDivisiInput.required = true;
                customDivisiInput.setAttribute('name', 'divisi');
                divisiSelect.removeAttribute('name');
            } else {
                customDivisiWrapper.style.display = 'none';
                customDivisiInput.required = false;
                customDivisiInput.removeAttribute('name');
                divisiSelect.setAttribute('name', 'divisi');
            }
        });

        // Swapping name attributes for Category
        const kategoriSelect = document.getElementById('kategori_select');
        const customKategoriWrapper = document.getElementById('custom_kategori_wrapper');
        const customKategoriInput = document.getElementById('custom_kategori');

        kategoriSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                customKategoriWrapper.style.display = 'block';
                customKategoriInput.required = true;
                customKategoriInput.setAttribute('name', 'kategori');
                kategoriSelect.removeAttribute('name');
            } else {
                customKategoriWrapper.style.display = 'none';
                customKategoriInput.required = false;
                customKategoriInput.removeAttribute('name');
                kategoriSelect.setAttribute('name', 'kategori');
            }
        });
    </script>
</body>
</html>
