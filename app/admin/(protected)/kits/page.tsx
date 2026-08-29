import { prisma } from "@/lib/db";
import { updateKit } from "@/lib/actions/kits";
import { KIT_TYPES } from "@/lib/types";
import { MediaUploadField } from "@/components/admin/MediaUploadField";

export default async function KitsPage() {
  const kits = await prisma.kitImage.findMany();
  const byType = new Map(kits.map((k) => [k.type, k]));

  return (
    <div>
      <h1 className="font-serif text-3xl font-black">Uniformes</h1>
      <p className="mt-2 text-sm text-neutral-700">Editar título e imagen de cada uniforme.</p>

      <div className="mt-6 flex flex-col gap-4">
        {KIT_TYPES.map(({ type }) => {
          const kit = byType.get(type);
          if (!kit) return null;
          return (
            <form
              key={kit.id}
              action={updateKit}
              className="grid grid-cols-1 gap-4 border-2 border-ink p-4 sm:grid-cols-[auto_1fr]"
            >
              <input type="hidden" name="id" value={kit.id} />

              <MediaUploadField
                name="imageUrl"
                category="kits"
                currentUrl={kit.imageUrl}
                accept="image/*"
                kind="image"
                previewClassName="h-32 w-24 object-cover"
              />

              <div className="flex flex-col items-start gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-600">{type}</div>
                <div className="w-full max-w-sm">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Título</label>
                  <input
                    name="title"
                    defaultValue={kit.title}
                    required
                    className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
                  />
                </div>
                <button type="submit" className="bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream hover:bg-accent-hover">
                  Guardar
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
