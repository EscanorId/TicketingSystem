import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  LayoutDashboard, 
  HelpCircle, 
  Wrench, 
  Network, 
  Laptop, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  User, 
  Mail, 
  Building, 
  AlertCircle,
  Menu,
  X,
  RefreshCw,
  TrendingUp,
  Inbox,
  Calendar
} from "lucide-react";
import { Ticket, KategoriTiket, UrgensiTiket, StatusTiket } from "./types";

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"form" | "admin">("form");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin Auth States
  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem("admin_token") || "");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ ticketId: string; newStatus: StatusTiket } | null>(null);

  // Form States
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDivisi, setSelectedDivisi] = useState("");
  const [customDivisi, setCustomDivisi] = useState("");
  const [judul, setJudul] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [customKategori, setCustomKategori] = useState("");
  const [urgensi, setUrgensi] = useState<UrgensiTiket | "">("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggalPengajuan, setTanggalPengajuan] = useState(() => new Date().toISOString().split("T")[0]);
  
  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Admin Dashboard States (Filters)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("All");
  const [filterUrgensi, setFilterUrgensi] = useState<UrgensiTiket | "All">("All");
  const [filterStatus, setFilterStatus] = useState<StatusTiket | "All">("All");

  // Fetch Tickets from API
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      } else {
        console.error("Gagal mengambil data tiket");
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalDivisi = selectedDivisi === "Others" ? customDivisi.trim() : selectedDivisi;
    const finalKategori = selectedKategori === "Other" ? customKategori.trim() : selectedKategori;

    if (!nama || !email || !finalDivisi || !judul || !finalKategori || !urgensi || !deskripsi) {
      setErrorMessage("Mohon lengkapi semua field terlebih dahulu, termasuk mengisi kolom inputan khusus jika memilih 'Others'!");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama,
          email,
          divisi: finalDivisi,
          judul,
          kategori: finalKategori,
          urgensi,
          deskripsi,
          tanggalPengajuan,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Tiket bantuan Anda berhasil disimpan!");
        // Reset form
        setNama("");
        setEmail("");
        setSelectedDivisi("");
        setCustomDivisi("");
        setJudul("");
        setSelectedKategori("");
        setCustomKategori("");
        setUrgensi("");
        setDeskripsi("");
        setTanggalPengajuan(new Date().toISOString().split("T")[0]);
        // Refresh ticket list
        fetchTickets();
      } else {
        setErrorMessage(data.error || "Terjadi kesalahan saat menyimpan tiket.");
      }
    } catch (err) {
      setErrorMessage("Koneksi gagal. Silakan coba beberapa saat lagi.");
      console.error("Error submitting ticket:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (ticketId: string, newStatus: StatusTiket) => {
    if (!adminToken) {
      setPendingUpdate({ ticketId, newStatus });
      setLoginError("");
      setShowLoginModal(true);
      return;
    }

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local state directly for responsive performance
        setTickets(prev => 
          prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
        );
      } else {
        if (res.status === 401) {
          setAdminToken("");
          localStorage.removeItem("admin_token");
          setPendingUpdate({ ticketId, newStatus });
          setLoginError("Sesi admin Anda telah berakhir. Silakan masuk kembali.");
          setShowLoginModal(true);
        } else {
          alert(data.error || "Gagal memperbarui status");
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Gagal memperbarui status. Periksa jaringan Anda.");
    }
  };

  // Handle Admin Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setLoginError("Username dan password wajib diisi!");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setAdminToken(data.token);
        localStorage.setItem("admin_token", data.token);
        setShowLoginModal(false);
        setLoginUsername("");
        setLoginPassword("");
        
        // Execute pending action if exists
        if (pendingUpdate) {
          const { ticketId, newStatus } = pendingUpdate;
          setPendingUpdate(null);
          
          try {
            const updateRes = await fetch(`/api/tickets/${ticketId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${data.token}`
              },
              body: JSON.stringify({ status: newStatus }),
            });
            const updateData = await updateRes.json();
            if (updateRes.ok && updateData.success) {
              setTickets(prev => 
                prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
              );
            } else {
              alert(updateData.error || "Gagal memperbarui status setelah login");
            }
          } catch (updateErr) {
            console.error("Error updating status after login:", updateErr);
          }
        }
      } else {
        setLoginError(data.error || "Username atau password salah!");
      }
    } catch (err) {
      setLoginError("Gagal menghubungkan ke server.");
      console.error("Login failure:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Calculations for Performance / Metrics Dashboard
  const totalTickets = tickets.length;
  const openTicketsCount = tickets.filter(t => t.status === "Open").length;
  const inProgressTicketsCount = tickets.filter(t => t.status === "In Progress").length;
  const resolvedTicketsCount = tickets.filter(t => t.status === "Resolved").length;
  const highUrgencyCount = tickets.filter(t => t.urgensi === "High" && t.status !== "Resolved").length;
  const resolvedRate = totalTickets > 0 ? Math.round((resolvedTicketsCount / totalTickets) * 100) : 0;

  // Filtered Tickets for Admin view
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.divisi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKategori = filterKategori === "All" || t.kategori === filterKategori;
    const matchesUrgensi = filterUrgensi === "All" || t.urgensi === filterUrgensi;
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;

    return matchesSearch && matchesKategori && matchesUrgensi && matchesStatus;
  });

  return (
    <div id="app-container" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased font-sans">
      {/* SIDEBAR - Desktop View */}
      <aside id="sidebar" className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-8 shrink-0 min-h-screen shadow-sm sticky top-0">
        <div id="sidebar-logo" className="flex items-center gap-3 text-blue-600 font-extrabold text-xl mb-12 select-none">
          <div className="bg-blue-100 p-2 rounded-xl">
            <HelpCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="tracking-tight text-slate-800">IT</span>{" "}
            <span className="text-blue-600">Support</span>
          </div>
        </div>

        <nav id="sidebar-nav" className="flex flex-col gap-2 flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-3">Menu Aplikasi</p>
          <button
            id="nav-form-btn"
            onClick={() => { setActiveTab("form"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 border-none rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "form"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Kirim Tiket Baru</span>
          </button>

          <button
            id="nav-admin-btn"
            onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 border-none rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard Admin</span>
            {openTicketsCount > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                {openTicketsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Performance Summary / Stats Box */}
        <div id="sidebar-stats" className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mt-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ringkasan Performa</p>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Total Tiket Masuk</span>
              <span className="font-bold text-slate-800">{totalTickets}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Tingkat Berhasil</span>
              <span className="font-bold text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {resolvedRate}%
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Kendala Penting</span>
              <span className={`font-bold ${highUrgencyCount > 0 ? "text-red-500" : "text-slate-700"}`}>
                {highUrgencyCount} Tiket
              </span>
            </div>
            <div className="border-t border-slate-200 my-1"></div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-bold">
              <div className="bg-amber-50 text-amber-700 rounded-md py-1.5 border border-amber-100">
                <div>{openTicketsCount}</div>
                <div className="text-[8px] uppercase">Open</div>
              </div>
              <div className="bg-indigo-50 text-indigo-700 rounded-md py-1.5 border border-indigo-100">
                <div>{inProgressTicketsCount}</div>
                <div className="text-[8px] uppercase">Work</div>
              </div>
              <div className="bg-emerald-50 text-emerald-700 rounded-md py-1.5 border border-emerald-100">
                <div>{resolvedTicketsCount}</div>
                <div className="text-[8px] uppercase">Done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Login/Logout Section */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          {adminToken ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-2 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-semibold justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
                <span>Masuk sebagai Admin</span>
              </div>
              <button
                onClick={() => {
                  setAdminToken("");
                  localStorage.removeItem("admin_token");
                  setPendingUpdate(null);
                }}
                className="w-full text-center py-2 px-4 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setLoginError("");
                setShowLoginModal(true);
              }}
              className="w-full text-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Login Admin
            </button>
          )}
        </div>
      </aside>

      {/* HEADER - Mobile View */}
      <header id="mobile-header" className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div id="mobile-logo" className="flex items-center gap-2 text-blue-600 font-extrabold text-lg">
          <HelpCircle className="w-5 h-5 stroke-[2.5]" />
          <span>IT Support Portal</span>
        </div>
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 border-none rounded-lg cursor-pointer transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-3 shadow-inner">
          <button
            id="mobile-nav-form"
            onClick={() => { setActiveTab("form"); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-none text-sm font-semibold transition-all ${
              activeTab === "form" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Kirim Tiket Baru</span>
          </button>
          <button
            id="mobile-nav-admin"
            onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-none text-sm font-semibold transition-all ${
              activeTab === "admin" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard Admin ({tickets.length})</span>
          </button>

          <div className="border-t border-slate-200 my-2 pt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status Saat Ini</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <div className="bg-amber-50 text-amber-700 py-2 rounded-lg border border-amber-100">
                <span className="block text-sm font-extrabold">{openTicketsCount}</span>
                <span className="text-[8px] uppercase">Open</span>
              </div>
              <div className="bg-indigo-50 text-indigo-700 py-2 rounded-lg border border-indigo-100">
                <span className="block text-sm font-extrabold">{inProgressTicketsCount}</span>
                <span className="text-[8px] uppercase">In Progress</span>
              </div>
              <div className="bg-emerald-50 text-emerald-700 py-2 rounded-lg border border-emerald-100">
                <span className="block text-sm font-extrabold">{resolvedTicketsCount}</span>
                <span className="text-[8px] uppercase">Resolved</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-3 pt-3">
            {adminToken ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span>Masuk sebagai Admin</span>
                </div>
                <button
                  onClick={() => {
                    setAdminToken("");
                    localStorage.removeItem("admin_token");
                    setMobileMenuOpen(false);
                    setPendingUpdate(null);
                  }}
                  className="w-full py-2.5 px-4 border border-slate-200 hover:bg-red-50 text-slate-650 text-xs font-bold rounded-xl"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginError("");
                  setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Login Admin
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="flex-1 p-6 md:p-10 flex flex-col max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Top greeting / breadcrumb */}
        <div id="content-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === "form" ? "Formulir Pengajuan Tiket" : "Dashboard IT Support Admin"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === "form" 
                ? "Laporkan kendala teknis perangkat keras, perangkat lunak, atau jaringan Anda kepada tim IT."
                : "Kelola, pantau, dan selesaikan kendala teknis karyawan secara efisien."
              }
            </p>
          </div>
          {activeTab === "admin" && (
            <button
              id="refresh-btn"
              onClick={fetchTickets}
              className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>
          )}
        </div>

        {/* VIEW 1: USER FORM SUBMISSION */}
        {activeTab === "form" && (
          <div id="form-container" className="max-w-3xl w-full mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 p-1 rounded-md">
                <PlusCircle className="w-5 h-5" />
              </span>
              Masukkan Detail Kendala Teknismu
            </h2>

            {/* Custom Alerts */}
            {successMessage && (
              <div id="alert-success" className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900">{successMessage}</p>
                  <p className="text-xs text-emerald-700 mt-1">Sistem kami telah mendaftarkan tiket Anda. Tim IT akan segera menghubungi Anda melalui email atau mendatangi divisi Anda.</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div id="alert-error" className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-medium animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Gagal Mengirim laporan</p>
                  <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nama Pelapor */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="input-nama" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Hendra Wijaya"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 text-sm"
                    required
                  />
                </div>

                {/* Email Pelapor */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="input-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: hendra.w@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 text-sm"
                    required
                  />
                </div>

                {/* Divisi */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="input-divisi" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    Divisi/Departemen <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="input-divisi"
                    value={selectedDivisi}
                    onChange={(e) => setSelectedDivisi(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 text-sm cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Pilih Divisi/Departemen --</option>
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

                  {selectedDivisi === "Others" && (
                    <input
                      type="text"
                      placeholder="Masukkan nama divisi Anda..."
                      value={customDivisi}
                      onChange={(e) => setCustomDivisi(e.target.value)}
                      className="w-full mt-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-sky-50/20 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold text-slate-800 text-xs animate-fadeIn"
                      required
                    />
                  )}
                </div>

                {/* Kategori Kendala */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="input-kategori" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Kategori Kendala <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="input-kategori"
                    value={selectedKategori}
                    onChange={(e) => setSelectedKategori(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 text-sm cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Pilih Kategori --</option>
                    <option value="Hardware">Hardware (Monitor, Laptop, Mouse, Printer, dll)</option>
                    <option value="Software">Software (Windows, Office, Aplikasi ERP, Email, dll)</option>
                    <option value="Network">Network (Koneksi WiFi, Kabel LAN, Internet lambat)</option>
                    <option value="Other">Other / Kategori Lainnya</option>
                  </select>

                  {selectedKategori === "Other" && (
                    <input
                      type="text"
                      placeholder="Masukkan kategori kendala baru..."
                      value={customKategori}
                      onChange={(e) => setCustomKategori(e.target.value)}
                      className="w-full mt-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-sky-50/20 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold text-slate-800 text-xs animate-fadeIn"
                      required
                    />
                  )}
                </div>

                {/* Tanggal Pengajuan */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="input-tanggal" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Tanggal Pengajuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="input-tanggal"
                    value={tanggalPengajuan}
                    onChange={(e) => setTanggalPengajuan(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 text-sm"
                    required
                  />
                </div>

                {/* Urgensi Kendala */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tingkat Urgensi Masalah <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "Low", label: "Low", desc: "Tidak menghentikan kerja utama", border: "border-emerald-100", activeBg: "bg-emerald-50 text-emerald-700 border-emerald-400" },
                      { value: "Medium", label: "Medium", desc: "Mengganggu beberapa bagian kerja", border: "border-amber-100", activeBg: "bg-amber-50 text-amber-700 border-amber-400" },
                      { value: "High", label: "High", desc: "Pekerjaan terhenti sepenuhnya", border: "border-red-100", activeBg: "bg-red-50 text-red-700 border-red-400" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setUrgensi(opt.value as UrgensiTiket)}
                        className={`p-3 md:p-4 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                          urgensi === opt.value 
                            ? opt.activeBg + " shadow-sm ring-2 ring-blue-50"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-bold text-sm">{opt.label}</span>
                        <span className="text-[10px] hidden md:inline ml-auto mr-auto opacity-75">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Judul Masalah */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label htmlFor="input-judul" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Judul Singkat Kendala <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-judul"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Contoh: Lampiran email selalu gagal dikirim"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 text-sm"
                    required
                  />
                </div>

                {/* Deskripsi Lengkap */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label htmlFor="input-deskripsi" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Deskripsi Lengkap Kronologi Kejadian <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="input-deskripsi"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Contoh: Saat mengirim file berukuran 6MB lewat Outlook selalu mental dan muncul tulisan timeout. Sudah mencobanya 3 kali dan hasilnya tetap sama..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 text-sm min-h-[120px] resize-y"
                    required
                  />
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 px-6 rounded-xl border-none transition-all shadow-md shadow-blue-100 cursor-pointer text-center text-sm active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Sedang Menyimpan Tiket...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Tiket Bantuan Sekarang</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 2: IT ADMIN DASHBOARD */}
        {activeTab === "admin" && (
          <div id="admin-container" className="flex flex-col gap-6">
            
            {/* FILTER & SEARCH CARD */}
            <div id="filter-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="Cari nama, judul, detail tiket..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
                  <div className="text-xs font-bold text-slate-400 uppercase mr-2 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter Tiket:
                  </div>

                  {/* Filter Kategori */}
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer hover:bg-slate-100 max-w-[180px]"
                  >
                    <option value="All">Kategori: Semua</option>
                    {Array.from(new Set([
                      "Hardware",
                      "Software",
                      "Network",
                      ...tickets.map(t => t.kategori).filter(Boolean)
                    ])).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Filter Urgensi */}
                  <select
                    value={filterUrgensi}
                    onChange={(e) => setFilterUrgensi(e.target.value as UrgensiTiket | "All")}
                    className="bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer hover:bg-slate-100"
                  >
                    <option value="All">Urgensi: Semua</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  {/* Filter Status */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as StatusTiket | "All")}
                    className="bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer hover:bg-slate-100"
                  >
                    <option value="All">Status: Semua</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TICKETS CONTAINER (GRID/TABLE) */}
            <div id="tickets-table-card" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-start">
              
              {isLoading ? (
                <div id="loading-state" className="flex flex-col items-center justify-center flex-1 py-20 gap-3">
                  <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="font-semibold text-slate-500 text-sm">Menghubungkan data tiket...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div id="empty-state" className="flex flex-col items-center justify-center flex-1 py-16 px-6 text-center gap-4">
                  <div className="bg-slate-100 p-4 rounded-full text-slate-400">
                    <Inbox className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Tidak ada tiket ditemukan</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">
                      Cobalah untuk merubah pencarian, filter, atau kirimkan tiket bantuan baru dari menu sebelah kiri.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Grid-Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">No. Tiket</th>
                          <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">Nama Pelapor</th>
                          <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">Detail Masalah</th>
                          <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">Kategori</th>
                          <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">Urgensi</th>
                          <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">Status</th>
                          <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">Tindakan Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTickets.map((ticket, index) => {
                          const statusClass = 
                            ticket.status === "Open" 
                              ? "bg-blue-50 text-blue-600" 
                              : ticket.status === "In Progress"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-emerald-50 text-emerald-600";

                          const urgencyColor = 
                            ticket.urgensi === "High" 
                              ? "bg-red-500" 
                              : ticket.urgensi === "Medium"
                              ? "bg-amber-500"
                              : "bg-emerald-500";

                          return (
                            <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                  {ticket.id}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-800 leading-snug">{ticket.nama}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{ticket.email}</div>
                                <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">
                                  {ticket.divisi}
                                </div>
                              </td>
                              <td className="px-6 py-4 max-w-md">
                                <div className="font-bold text-slate-800 text-sm leading-tight">{ticket.judul}</div>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 md:line-clamp-none hover:line-clamp-none transition-all duration-300">
                                  {ticket.deskripsi}
                                </p>
                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                  {ticket.tanggalPengajuan && (
                                    <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-sky-100">
                                      <Calendar className="w-3 h-3 shrink-0 text-sky-500" />
                                      Pengajuan: {new Date(ticket.tanggalPengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-slate-100">
                                    <Clock className="w-3 h-3 shrink-0 text-slate-400" />
                                    Sistem: {new Date(ticket.tanggal).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {ticket.status === "Resolved" && ticket.tanggalResolve && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-750 px-2 py-0.5 rounded-md font-black flex items-center gap-1 border border-emerald-100 animate-fadeIn">
                                      <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                                      Selesai: {new Date(ticket.tanggalResolve).toLocaleString("id-ID", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center w-fit gap-1.5">
                                  {ticket.kategori === "Hardware" && <Laptop className="w-3.5 h-3.5 text-slate-500" />}
                                  {ticket.kategori === "Software" && <Wrench className="w-3.5 h-3.5 text-slate-500" />}
                                  {ticket.kategori === "Network" && <Network className="w-3.5 h-3.5 text-slate-500" />}
                                  {ticket.kategori}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="flex items-center gap-1.5 text-xs font-semibold">
                                  <span className={`w-2 h-2 rounded-full ${urgencyColor}`}></span>
                                  {ticket.urgensi}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${statusClass}`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleUpdateStatus(ticket.id, "Open")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border cursor-pointer ${
                                      ticket.status === "Open"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                                    }`}
                                  >
                                    Open
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(ticket.id, "In Progress")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border cursor-pointer ${
                                      ticket.status === "In Progress"
                                        ? "bg-purple-100 text-purple-700 border-purple-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                                    }`}
                                  >
                                    Progress
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(ticket.id, "Resolved")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border cursor-pointer ${
                                      ticket.status === "Resolved"
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                                    }`}
                                  >
                                    Resolve
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Responsive Mobile Layout (List of customized cards) */}
                  <div className="lg:hidden flex flex-col divide-y divide-slate-100">
                    {filteredTickets.map((ticket) => {
                      const statusClass = 
                        ticket.status === "Open" 
                          ? "bg-blue-50 text-blue-600" 
                          : ticket.status === "In Progress"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-emerald-50 text-emerald-600";

                      const urgencyColor = 
                        ticket.urgensi === "High" 
                          ? "bg-red-500" 
                          : ticket.urgensi === "Medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500";

                      return (
                        <div key={ticket.id} className="p-5 hover:bg-slate-50/50 flex flex-col gap-4">
                          
                          {/* Row 1: ID, status & urgency */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {ticket.id}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5 text-xs font-semibold">
                                <span className={`w-2 h-2 rounded-full ${urgencyColor}`}></span>
                                {ticket.urgensi}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${statusClass}`}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Title and description */}
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm leading-tight">{ticket.judul}</h4>
                            <p className="text-xs text-slate-500 mt-1 lines-clamp-3">
                              {ticket.deskripsi}
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              {ticket.tanggalPengajuan && (
                                <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-sky-100">
                                  <Calendar className="w-3.5 h-3.5 shrink-0 text-sky-500" />
                                  Pengajuan: {new Date(ticket.tanggalPengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              )}
                              <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-slate-100">
                                <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                Sistem: {new Date(ticket.tanggal).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {ticket.status === "Resolved" && ticket.tanggalResolve && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-750 px-2 py-0.5 rounded-md font-black flex items-center gap-1 border border-emerald-100 animate-fadeIn">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                  Selesai: {new Date(ticket.tanggalResolve).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Row 3: Submit metadata */}
                          <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600">
                            <div>
                              <span className="font-semibold text-slate-800 block">{ticket.nama}</span>
                              <span className="text-[10px] text-slate-400">{ticket.email}</span>
                            </div>
                            <span className="font-semibold bg-slate-200/50 px-2.5 py-0.5 rounded-md text-[10px] text-slate-700">
                              {ticket.divisi}
                            </span>
                          </div>

                          {/* Row 4: Status Modifier buttons */}
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Status:</p>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => handleUpdateStatus(ticket.id, "Open")}
                                className={`py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                                  ticket.status === "Open"
                                    ? "bg-blue-100 border-blue-200 text-blue-700 font-extrabold"
                                    : "bg-white border-slate-200 text-slate-500"
                                }`}
                              >
                                Open
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(ticket.id, "In Progress")}
                                className={`py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                                  ticket.status === "In Progress"
                                    ? "bg-purple-100 border-purple-200 text-purple-700 font-extrabold"
                                    : "bg-white border-slate-200 text-slate-500"
                                }`}
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(ticket.id, "Resolved")}
                                className={`py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                                  ticket.status === "Resolved"
                                    ? "bg-emerald-100 border-emerald-200 text-emerald-700 font-extrabold"
                                    : "bg-white border-slate-200 text-slate-500"
                                }`}
                              >
                                Resolve
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </main>

      {/* AUTHENTICATION LOGIN MODAL DIALOG */}
      {showLoginModal && (
        <div id="login-modal-overlay" className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn bg-opacity-75">
          <div id="login-modal-content" className="bg-white w-full max-w-sm rounded-2xl border border-slate-100 shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative animate-scaleUp">
            
            {/* Close Button */}
            <button
              id="login-modal-close"
              onClick={() => {
                setShowLoginModal(false);
                setPendingUpdate(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 border-none rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-3.5 rounded-full">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Login Administrator</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Anda harus masuk sebagai admin terlebih dahulu untuk dapat mengubah, memproses, atau menyelesaikan status tiket IT.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-650 mt-0.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Contoh: admin123"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Contoh: admin321"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl border-none transition-all shadow-md cursor-pointer text-center text-xs flex items-center justify-center gap-2 mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang memverifikasi...</span>
                  </>
                ) : (
                  <span>Login & Terapkan Perubahan</span>
                )}
              </button>
            </form>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Kredensial Sementara (Demo)</p>
              <div className="text-xs text-slate-600 font-mono">
                <div>Username: <strong className="text-blue-600">admin123</strong></div>
                <div>Password: <strong className="text-blue-600">admin321</strong></div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
