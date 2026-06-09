"use client";

import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js" as any);
  }, []);

  return (
    <html lang="id">
      <head>
        <title>DonasiKu - Platform Donasi Sampah & Barang Layak Pakai</title>
        <meta name="description" content="Sistem Manajemen Donasi Untar" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}