import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SisaRasa — Selamatkan Makanan, Hemat Uangmu",
  description:
    "Platform untuk mengurangi food waste dengan menghubungkan restoran, kafe, dan bakery yang memiliki makanan berlebih dengan pembeli yang mencari makanan berkualitas dengan harga terjangkau.",
  keywords: [
    "food waste",
    "makanan murah",
    "surplus makanan",
    "hemat",
    "restoran",
    "sustainability",
    "SisaRasa",
  ],
  openGraph: {
    title: "SisaRasa — Selamatkan Makanan, Hemat Uangmu",
    description:
      "Temukan makanan berkualitas dari restoran & kafe terdekat dengan diskon hingga 70%. Kurangi food waste, hemat pengeluaran.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
