import Link from "next/link";
import { prisma } from "@/lib/db";
import { playerAssistCount, playerGoalCount } from "@/lib/derived";

export default async function PlayersPage() {
  const [players, allGoals] = await Promise.all([
    prisma.player.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.goal.findMany(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl font-black">Plantilla</h1>
      <p className="mt-2 text-sm text-neutral-700">
        Los goles y las asistencias se calculan a partir de los goles registrados en cada partido y no se editan aquí.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left text-xs font-bold uppercase tracking-wider">
              <th className="py-2 pr-3"></th>
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Nombre</th>
              <th className="py-2 pr-3">Posición</th>
              <th className="py-2 pr-3">PJ</th>
              <th className="py-2 pr-3">Asist.</th>
              <th className="py-2 pr-3">Goles</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className="border-b border-ink/15">
                <td className="py-2 pr-3">
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photoUrl} alt={p.name} className="h-10 w-10 object-cover" />
                  ) : (
                    <div className="h-10 w-10 bg-neutral-200" />
                  )}
                </td>
                <td className="py-2 pr-3 font-bold">{p.dorsal}</td>
                <td className="py-2 pr-3">
                  <Link href={`/admin/players/${p.id}`} className="font-bold hover:text-accent hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="py-2 pr-3">{p.position}</td>
                <td className="py-2 pr-3">{p.pj}</td>
                <td className="py-2 pr-3">{playerAssistCount(p.id, allGoals)}</td>
                <td className="py-2 pr-3 font-bold">{playerGoalCount(p.id, allGoals)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
