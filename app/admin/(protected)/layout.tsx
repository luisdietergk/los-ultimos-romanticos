import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/matches", label: "Partidos" },
  { href: "/admin/players", label: "Plantilla" },
  { href: "/admin/shop", label: "Tienda" },
  { href: "/admin/kits", label: "Uniformes" },
  { href: "/admin/settings", label: "Ajustes" },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div>
      <header className="flex items-center justify-between border-b-2 border-[#201e1d] px-6 py-4">
        <nav className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#ae1800]">
              {item.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
