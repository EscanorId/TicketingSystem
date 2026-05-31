<?php
// simpan_tiket.php
// Skrip PHP prosedural dengan PDO untuk memproses penyimpanan tiket ke database MySQL.

// 1. Hubungkan berkas koneksi database
require_once 'db.php';

// 2. Pastikan permintaan datang dengan metode POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 3. Ambil data input dan bersihkan untuk keamanan dasar (sanitasi)
    $nama              = filter_input(INPUT_POST, 'nama', FILTER_DEFAULT);
    $email             = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $divisi            = filter_input(INPUT_POST, 'divisi', FILTER_DEFAULT);
    $judul             = filter_input(INPUT_POST, 'judul', FILTER_DEFAULT);
    $kategori          = filter_input(INPUT_POST, 'kategori', FILTER_DEFAULT);
    $deskripsi         = filter_input(INPUT_POST, 'deskripsi', FILTER_DEFAULT);
    $urgensi           = filter_input(INPUT_POST, 'urgensi', FILTER_DEFAULT);
    $tanggal_pengajuan = filter_input(INPUT_POST, 'tanggal_pengajuan', FILTER_DEFAULT);

    if (empty($tanggal_pengajuan)) {
        $tanggal_pengajuan = date('Y-m-d');
    }

    // 4. Validasi server-side
    // Pastikan semua kolom tidak ada yang kosong atau tidak valid
    if (empty($nama) || empty($email) || empty($divisi) || empty($judul) || empty($kategori) || empty($deskripsi) || empty($urgensi)) {
        // Redirect balik ke index dengan parameter error
        header("Location: index.php?status=error");
        exit;
    }

    // Pastikan nilai dropdown sesuai ekspektasi enum di database
    $valid_urgensi = ['Low', 'Medium', 'High'];

    if (!in_array($urgensi, $valid_urgensi)) {
        header("Location: index.php?status=error");
        exit;
    }

    try {
        // 5. Racik query SQL menggunakan prepared statements agar aman dari serangan SQL Injection
        $sql = "INSERT INTO tickets (nama, email, divisi, judul, kategori, deskripsi, urgensi, status, tanggal_pengajuan) 
                VALUES (:nama, :email, :divisi, :judul, :kategori, :deskripsi, :urgensi, 'Open', :tanggal_pengajuan)";
        
        $stmt = $pdo->prepare($sql);
        
        // Eksekusi statement dengan mencocokkan placeholder parameter
        $stmt->execute([
            ':nama'              => $nama,
            ':email'             => $email,
            ':divisi'            => $divisi,
            ':judul'             => $judul,
            ':kategori'          => $kategori,
            ':deskripsi'         => $deskripsi,
            ':urgensi'           => $urgensi,
            ':tanggal_pengajuan' => $tanggal_pengajuan
        ]);

        // 6. Jika sukses, alihkan ke index.php dengan status success
        header("Location: index.php?status=success");
        exit;

    } catch (PDOException $e) {
        // Log pesan kesalahan database di server jika diperlukan
        error_log("Database Error: " . $e->getMessage());
        
        // Alihkan ke index.php dengan status error
        header("Location: index.php?status=error");
        exit;
    }

} else {
    // Apabila berkas ini diakses langsung tanpa post form, kembalikan ke index.php
    header("Location: index.php");
    exit;
}
?>
