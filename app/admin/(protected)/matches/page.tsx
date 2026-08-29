import Link from "next/link";
import { prisma } from "@/lib/db";
import { renameRival, updateMatch } from "@/lib/actions/matches";

function toDatetimeLocal(d: Date): string {
  // Stored/edited as plain UTC wall-clock (see lib/actions/matches.ts).
  return d.toISOString().slice(0, 16);
}

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    include: { rival: true },
    orderBy: { jornada: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-black">Partidos</h1>
      <p className="mt-2 text-sm text-neutral-700">
        Editar rival, fecha/hora (UTC), sede y estado. Renombrar un rival aquí lo actualiza en todos sus partidos.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {matches.map((m) => (
          <div key={m.id} className="border-2 border-ink p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-sm font-bold uppercase tracking-wider">
                J{m.jornada} · {m.jornadaLabel}
                <span className={m.status === "CANCELLED" ? "ml-3 text-accent" : "ml-3 text-neutral-600"}>
                  {m.status}
                </span>
              </div>
              <Link href={`/admin/matches/${m.id}`} className="text-xs font-bold uppercase tracking-wider text-accent hover:underline">
                Editar goles →
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <form action={renameRival} className="flex items-end gap-2">
                <input type="hidden" name="rivalId" value={m.rivalId} />
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Rival</label>
                  <input
                    name="name"
                    defaultValue={m.rival.name}
                    required
                    className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
                  />
                </div>
                <button type="submit" className="bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cream">
                  Guardar
                </button>
              </form>

              <form action={updateMatch} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="matchId" value={m.id} />
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Inicio (UTC)</label>
                  <input
                    type="datetime-local"
                    name="kickoffAt"
                    defaultValue={toDatetimeLocal(m.kickoffAt)}
                    required
                    className="border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Sede</label>
                  <input
                    name="venue"
                    defaultValue={m.venue}
                    required
                    className="w-24 border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Estado</label>
                  <select name="status" defaultValue={m.status} className="border border-ink/30 bg-transparent px-2 py-1.5 text-sm">
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <button type="submit" className="bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cream">
                  Guardar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
