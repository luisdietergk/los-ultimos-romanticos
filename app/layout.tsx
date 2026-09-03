import type { Metadata } from "next";
import { Abril_Fatface, Archivo, Big_Shoulders } from "next/font/google";
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

// Tungsten Compressed Bold (the user's actual request) is a paid Hoefler &
// Co / Type Network face, not available for free/self-hosted use. Google
// merged the old separate "Big Shoulders Display"/"Text" families into one
// variable family — loaded here as the full variable font (not a fixed
// weight) so the `opsz` (optical size) axis is available at runtime; each
// heading pushes it to its max (72) via inline font-variation-settings to
// get that same tall, compressed, heavy-bold "Display" character Tungsten
// has, instead of the default's more open "Text" spacing.
const bigShoulders = Big_Shoulders({
  variable: "--font-countdown",
  weight: "variable",
  axes: ["opsz"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Los Últimos Románticos",
  description: "Por amor al juego, por amor a lo nuestro.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${abrilFatface.variable} ${archivo.variable} ${bigShoulders.variable} antialiased`}>
      <body className="bg-cream text-ink">{children}</body>
    </html>
  );
}
