export type KategoriTiket = "Hardware" | "Software" | "Network" | string;
export type UrgensiTiket = "Low" | "Medium" | "High";
export type StatusTiket = "Open" | "In Progress" | "Resolved";

export interface Ticket {
  id: string;
  nama: string;
  email: string;
  divisi: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  urgensi: UrgensiTiket;
  status: StatusTiket;
  tanggal: string;
  tanggalPengajuan?: string;
  tanggalResolve?: string;
}
