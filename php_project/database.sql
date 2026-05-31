-- database.sql
-- File ini digunakan untuk membuat database dan tabel tickets di MySQL.

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS it_support_db;
USE it_support_db;

-- Buat tabel tickets
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    divisi VARCHAR(100) NOT NULL,
    judul VARCHAR(150) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    urgensi ENUM('Low', 'Medium', 'High') NOT NULL,
    status ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open',
    tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_pengajuan DATE DEFAULT NULL,
    tanggal_resolve TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
