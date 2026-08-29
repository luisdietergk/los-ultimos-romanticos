import { prisma } from "@/lib/db";
import { updateSettings } from "@/lib/actions/settings";

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  return (
    <div>
      <h1 className="font-serif text-3xl font-black">Ajustes</h1>
      <p className="mt-2 text-sm text-neutral-700">Contenido general del sitio.</p>

      <form action={updateSettings} className="mt-6 flex max-w-2xl flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Tagline (HTML)</label>
          <textarea
            name="taglineHtml"
            defaultValue={settings?.taglineHtml ?? ""}
            rows={2}
            required
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Historia — párrafo 1</label>
          <textarea
            name="historiaP1"
            defaultValue={settings?.historiaP1 ?? ""}
            rows={4}
            required
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Historia — párrafo 2</label>
          <textarea
            name="historiaP2"
            defaultValue={settings?.historiaP2 ?? ""}
            rows={4}
            required
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Nombre de la liga</label>
            <input
              name="ligaNombre"
              defaultValue={settings?.ligaNombre ?? "LIGA ROMÁNTICA CDT"}
              required
              className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Temporada (año)</label>
            <input
              type="number"
              name="seasonYear"
              defaultValue={settings?.seasonYear ?? 2026}
              required
              className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Video del hero</label>
          {settings?.heroVideoUrl && <video src={settings.heroVideoUrl} className="mb-2 h-32" controls />}
          <input type="file" name="heroVideo" accept="video/*" className="block text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Patrón de fondo</label>
          {settings?.patternUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.patternUrl} alt="Patrón de fondo" className="mb-2 h-16 w-16 object-cover" />
          )}
          <input type="file" name="pattern" accept="image/*" className="block text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Escudo del equipo</label>
          {settings?.teamCrestUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.teamCrestUrl} alt="Escudo del equipo" className="mb-2 h-16 w-16 object-contain" />
          )}
          <input type="file" name="teamCrest" accept="image/*" className="block text-sm" />
        </div>

        <div>
          <button type="submit" className="bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream hover:bg-accent-hover">
            Guardar cambios
          </button>
        </div>
      </form>

      <div className="mt-10 max-w-2xl border-2 border-ink p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Variables de entorno (solo lectura)</h2>
        <p className="mt-1 text-xs text-neutral-600">
          Estos valores vienen de variables de entorno, no de la base de datos — cambiarlos requiere editar el
          entorno y volver a desplegar el sitio.
        </p>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider">WhatsApp</dt>
            <dd className="mt-1">{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider">Instagram</dt>
            <dd className="mt-1 break-all">{process.env.NEXT_PUBLIC_INSTAGRAM_URL || "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
