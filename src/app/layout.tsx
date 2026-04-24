import type { Metadata } from "next";
import { Poppins, Josefin_Sans, Bungee } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  weight: ["700"],
  subsets: ["latin"],
});

const bungee = Bungee({
  variable: "--font-bungee",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pendaftaran Sertijab UKM PCC 2026",
  description: "Sistem pendaftaran kehadiran Serah Terima Jabatan UKM PCC 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} ${josefin.variable} ${bungee.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-dark-espresso text-white relative overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
