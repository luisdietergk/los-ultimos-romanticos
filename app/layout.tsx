import type { Metadata } from "next";
import { Abril_Fatface, Archivo } from "next/font/google";
import "./globals.css";

const abrilFatface = Abril_Fatface({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Los Últimos Románticos",
  description: "Por amor al juego, por amor a lo nuestro.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${abrilFatface.variable} ${archivo.variable} antialiased`}>
      <body className="bg-cream text-ink">{children}</body>
    </html>
  );
}
