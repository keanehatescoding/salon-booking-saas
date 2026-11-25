import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salon / barbershop / spa booking + POS + CRM",
  description: "Scheduling, staff/chair management, point-of-sale, deposits, and automated reminders for beauty and grooming businesses, replacing pen-and-paper or plain WhatsApp booking.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
