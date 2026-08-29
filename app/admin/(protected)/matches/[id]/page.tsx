import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { renameRival, updateMatch } from "@/lib/actions/matches";
import { GoalsList } from "./GoalsList";
import type { GoalTeam } from "@/lib/types";

function toDatetimeLocal(d: Date): string {
  // Stored/edited as plain UTC wall-clock (see lib/actions/matches.ts).
  return d.toISOString().slice(0, 16);
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: { rival: true, goals: { orderBy: { minute: "asc" } } },
  });
  if (!match) notFound();

  const players = await prisma.player.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, dorsal: true },
  });

  const goalRows = match.goals.map((g) => ({
    goalId: g.id,
    minute: g.minute,
    team: g.team as GoalTeam,
    playerId: g.playerId,
    scorerName: g.scorerName,
    note: g.note,
    shotX: g.shotX,
    shotY: g.shotY,
    goalX: g.goalX,
    goalY: g.goalY,
  }));

  return (
    <div>
      <Link href="/admin/matches" className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-accent">
        ← Partidos
      </Link>

      <h1 className="mt-2 font-serif text-3xl font-black">
        J{match.jornada} · {match.rival.name}
      </h1>
      <p className="mt-2 text-sm text-neutral-700">
        Renombrar un rival aquí lo actualiza en todos sus partidos.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <form action={renameRival} className="flex items-end gap-2 border-2 border-ink p-4">
          <input type="hidden" name="rivalId" value={match.rivalId} />
          <div className="flex-1">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Rival</label>
            <input
              name="name"
              defaultValue={match.rival.name}
              required
              className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <button type="submit" className="bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cream">
            Guardar
          </button>
        </form>

        <form action={updateMatch} className="flex flex-wrap items-end gap-2 border-2 border-ink p-4">
          <input type="hidden" name="matchId" value={match.id} />
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Inicio (UTC)</label>
            <input
              type="datetime-local"
              name="kickoffAt"
              defaultValue={toDatetimeLocal(match.kickoffAt)}
              required
              className="border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Sede</label>
            <input
              name="venue"
              defaultValue={match.venue}
              required
              className="w-24 border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Estado</label>
            <select name="status" defaultValue={match.status} className="border border-ink/30 bg-transparent px-2 py-1.5 text-sm">
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <button type="submit" className="bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cream">
            Guardar
          </button>
        </form>
      </div>

      <h2 className="mt-10 font-serif text-xl font-black">Goles</h2>
      <div className="mt-4">
        <GoalsList matchId={match.id} players={players} goals={goalRows} />
      </div>
    </div>
  );
}
