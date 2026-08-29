import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { playerGoalCount } from "@/lib/derived";
import { updatePlayer } from "@/lib/actions/players";

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) notFound();

  const goals = await prisma.goal.findMany({ where: { playerId: id } });
  const goalCount = playerGoalCount(id, goals);

  return (
    <div>
      <Link href="/admin/players" className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-accent">
        ← Plantilla
      </Link>

      <h1 className="mt-2 font-serif text-3xl font-black">
        #{player.dorsal} — {player.name}
      </h1>

      <form action={updatePlayer} className="mt-6 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={player.id} />

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Dorsal</label>
          <input
            name="dorsal"
            defaultValue={player.dorsal}
            required
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Nombre</label>
          <input
            name="name"
            defaultValue={player.name}
            required
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Posición</label>
          <input
            name="position"
            defaultValue={player.position}
            required
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Nacionalidad</label>
          <input
            name="nationality"
            defaultValue={player.nationality}
            required
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Apodo</label>
          <input
            name="apodo"
            defaultValue={player.apodo ?? ""}
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">PJ</label>
            <input
              type="number"
              name="pj"
              min={0}
              defaultValue={player.pj}
              className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Asistencias</label>
            <input
              type="number"
              name="assists"
              min={0}
              defaultValue={player.assists}
              className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Goles (calculado)</label>
          <div className="border border-ink/15 bg-neutral-100 px-2 py-1.5 text-sm text-neutral-700">{goalCount}</div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Frase</label>
          <input
            name="quote"
            defaultValue={player.quote ?? ""}
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Descripción</label>
          <textarea
            name="description"
            defaultValue={player.description ?? ""}
            rows={4}
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Foto</label>
          {player.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.photoUrl} alt={player.name} className="mb-2 h-24 w-24 object-cover" />
          )}
          <input type="file" name="photo" accept="image/*" className="block text-sm" />
        </div>

        <div className="sm:col-span-2">
          <button type="submit" className="bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream hover:bg-accent-hover">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
