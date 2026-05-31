<?php
// db.php
// Berkas konfigurasi koneksi database MySQL menggunakan PDO (PHP Data Objects).

$host = 'localhost';
$dbname = 'it_support_db';
$username = 'root';
$password = ''; // Kosongkan secara default untuk server pengembangan lokal (misalnya XAMPP)

try {
    // Membuat koneksi ke database dengan tambahan opsi pengkodean UTF-8
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,             // Melempar eksepsi jika terjadi kesalahan query
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Hasil fetch dibaca sebagai array asosiatif
        PDO::ATTR_EMULATE_PREPARES => false,                    // Menonaktifkan emulasi, menggunakan prepared statement asli
    ]);
} catch (PDOException $e) {
    // Tampilkan pesan error jika koneksi gagal
    die("Koneksi database gagal: " . $e->getMessage());
}
?>
