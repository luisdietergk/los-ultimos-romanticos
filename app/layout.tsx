import type { Metadata } from "next";
import { Abril_Fatface, Archivo, Bebas_Neue } from "next/font/google";
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

// A bold, condensed display face for numeric/dynamic bits (the countdown)
// that reads more "live scoreboard" than the storytelling serif headings.
const bebasNeue = Bebas_Neue({
  variable: "--font-countdown",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Los Últimos Románticos",
  description: "Por amor al juego, por amor a lo nuestro.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${abrilFatface.variable} ${archivo.variable} ${bebasNeue.variable} antialiased`}>
      <body className="bg-cream text-ink">{children}</body>
    </html>
  );
}
