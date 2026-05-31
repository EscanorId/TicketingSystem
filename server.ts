import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface Ticket {
  id: string;
  nama: string;
  email: string;
  divisi: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  urgensi: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  tanggal: string;
  tanggalPengajuan?: string;
  tanggalResolve?: string;
}

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "tickets.json");

// Helper function to read tickets
function readTickets(): Ticket[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialTickets: Ticket[] = [
        {
          id: "TCK-1001",
          nama: "Budi Santoso",
          email: "budi.santoso@company.com",
          divisi: "Finance",
          judul: "Printer tidak bisa terhubung",
          kategori: "Hardware",
          deskripsi: "Printer di ruangan Finance lantai 2 tidak terdeteksi dari komputer saya padahal sudah dicolok kabel USB.",
          urgensi: "Medium",
          status: "Open",
          tanggal: "2026-05-30T10:15:00Z"
        },
        {
          id: "TCK-1002",
          nama: "Siti Rahma",
          email: "siti.rahma@company.com",
          divisi: "HRD",
          judul: "Email tidak bisa mengirim berkas",
          kategori: "Network",
          deskripsi: "Setiap kali mengirim email dengan lampiran di atas 5MB selalu gagal dan muncul pesan koneksi terputus.",
          urgensi: "High",
          status: "In Progress",
          tanggal: "2026-05-31T08:30:00Z"
        },
        {
          id: "TCK-1003",
          nama: "Andi Wijaya",
          email: "andi.wijaya@company.com",
          divisi: "Marketing",
          judul: "Aplikasi CRM crash saat dibuka",
          kategori: "Software",
          deskripsi: "Setelah update Windows kemarin sore, aplikasi CRM selalu tertutup sendiri (crash) tanpa pesan error ketika baru dibuka.",
          urgensi: "High",
          status: "Resolved",
          tanggal: "2026-05-29T14:20:00Z"
        }
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialTickets, null, 2), "utf8");
      return initialTickets;
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading tickets file:", err);
    return [];
  }
}

// Helper function to write tickets
function writeTickets(tickets: Ticket[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tickets, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing tickets file:", err);
  }
}

app.use(express.json());

// API Endpoints
app.get("/api/tickets", (req, res) => {
  const tickets = readTickets();
  res.json(tickets);
});

// Login endpoint for Admin Support
app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === "admin123" && password === "admin321") {
      res.json({ success: true, token: "admin_secure_session_token_xyz" });
    } else {
      res.status(401).json({ error: "Username atau password salah!" });
    }
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({ error: "Terjadi kesalahan server saat memproses login." });
  }
});

app.post("/api/tickets", (req, res) => {
  try {
    const { nama, email, divisi, judul, kategori, deskripsi, urgensi, tanggalPengajuan } = req.body;
    
    if (!nama || !email || !divisi || !judul || !kategori || !deskripsi || !urgensi) {
      return res.status(400).json({ error: "Semua data formulir harus diisi!" });
    }

    const tickets = readTickets();
    const nextNum = tickets.length > 0 
      ? Math.max(...tickets.map(t => parseInt(t.id.split("-")[1] || "1000"))) + 1 
      : 1001;
    
    const newTicket: Ticket = {
      id: `TCK-${nextNum}`,
      nama,
      email,
      divisi,
      judul,
      kategori,
      deskripsi,
      urgensi,
      status: "Open",
      tanggal: new Date().toISOString(),
      tanggalPengajuan: tanggalPengajuan || new Date().toISOString().split('T')[0]
    };

    tickets.push(newTicket);
    writeTickets(tickets);

    res.status(201).json({ success: true, message: "Tiket berhasil disimpan!", ticket: newTicket });
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ error: "Terjadi kesalahan server saat menyimpan tiket." });
  }
});

app.patch("/api/tickets/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer admin_secure_session_token_xyz") {
      return res.status(401).json({ error: "Akses ditolak! Anda harus masuk sebagai admin untuk memperbarui status tiket." });
    }

    if (!status || !["Open", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({ error: "Status tidak valid!" });
    }

    const tickets = readTickets();
    const index = tickets.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Tiket tidak ditemukan!" });
    }

    tickets[index].status = status;
    if (status === "Resolved") {
      tickets[index].tanggalResolve = new Date().toISOString();
    } else {
      delete tickets[index].tanggalResolve;
    }
    writeTickets(tickets);

    res.json({ success: true, message: "Status tiket berhasil diperbarui!", ticket: tickets[index] });
  } catch (err) {
    console.error("Error updating ticket status:", err);
    res.status(500).json({ error: "Terjadi kesalahan server saat memperbarui status." });
  }
});

async function startServer() {
  // Vite integration in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
