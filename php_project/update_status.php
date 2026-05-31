<?php
// update_status.php
// Skrip PHP prosedural dengan PDO untuk memperbarui status tiket di database.

// 1. Hubungkan koneksi database
require_once 'db.php';

// 2. Pastikan permintaan dikirimkan melalui metode POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 3. Ambil data POST dan lakukan validasi dasar
    $id     = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $status = filter_input(INPUT_POST, 'status', FILTER_DEFAULT);

    // List status yang valid sesuai tipe ENUM database
    $valid_statuses = ['Open', 'In Progress', 'Resolved'];

    // 4. Periksa apakah parameter yang dikirimkan sudah benar
    if ($id === false || $id === null || !in_array($status, $valid_statuses)) {
        header("Location: admin.php?notif=invalid");
        exit;
    }

    try {
        // 5. Buat kueri SQL UPDATE menggunakan prepared statements
        if ($status === 'Resolved') {
            $sql = "UPDATE tickets SET status = :status, tanggal_resolve = CURRENT_TIMESTAMP WHERE id = :id";
        } else {
            $sql = "UPDATE tickets SET status = :status, tanggal_resolve = NULL WHERE id = :id";
        }
        $stmt = $pdo->prepare($sql);
        
        // Eksekusi pembaruan status
        $stmt->execute([
            ':status' => $status,
            ':id'     => $id
        ]);

        // 6. Alihkan kembali ke admin dashboard dengan notifikasi keberhasilan
        header("Location: admin.php?notif=updated");
        exit;

    } catch (PDOException $e) {
        // Log kesalahan database
        error_log("Database Error saat update status: " . $e->getMessage());
        header("Location: admin.php?notif=invalid");
        exit;
    }

} else {
    // Alihkan langsung ke dashboard jika berkas diakses tanpa metode POST
    header("Location: admin.php");
    exit;
}
?>
