import { prisma } from "@/lib/db";
import { updateProduct, createProduct } from "@/lib/actions/shop";
import { MediaUploadField } from "@/components/admin/MediaUploadField";

// Matches DETAIL_SLOTS in lib/actions/shop.ts — the public detail sheet's
// gallery shows the main photo plus these three detail shots.
const DETAIL_SLOTS = [1, 2, 3];

function DetailImageFields({ detailImageUrls }: { detailImageUrls: string[] }) {
  return (
    <div className="sm:col-span-2">
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Fotos de detalle (galería)</label>
      <div className="flex flex-wrap gap-3">
        {DETAIL_SLOTS.map((i) => (
          <MediaUploadField
            key={i}
            name={`detail${i}`}
            category="shop-detail"
            currentUrl={detailImageUrls[i - 1] ?? null}
            accept="image/*"
            kind="image"
            previewClassName="h-20 w-20 object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const products = await prisma.shopProduct.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl font-black">Tienda</h1>
      <p className="mt-2 text-sm text-neutral-700">Editar nombre, tallas, precio, descripción y foto de cada producto.</p>

      <details className="mt-6 border-2 border-ink p-4">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider">+ Agregar producto</summary>
        <form action={createProduct} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
          <MediaUploadField
            name="photoUrl"
            category="shop"
            currentUrl={null}
            accept="image/*"
            kind="image"
            previewClassName="h-24 w-24 object-cover"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Nombre</label>
              <input name="name" required className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Tallas (CSV)</label>
              <input
                name="sizesCsv"
                defaultValue="S,M,L,XL"
                required
                className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Precio (MXN)</label>
              <input
                type="number"
                name="priceMxn"
                min={0}
                defaultValue={0}
                required
                className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Descripción</label>
              <textarea name="description" rows={2} required className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm" />
            </div>
            <DetailImageFields detailImageUrls={[]} />
            <div className="sm:col-span-2">
              <button type="submit" className="bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream hover:bg-accent-hover">
                Agregar
              </button>
            </div>
          </div>
        </form>
      </details>

      <div className="mt-6 flex flex-col gap-4">
        {products.map((p) => (
          <form
            key={p.id}
            action={updateProduct}
            className="grid grid-cols-1 gap-4 border-2 border-ink p-4 sm:grid-cols-[auto_1fr]"
          >
            <input type="hidden" name="id" value={p.id} />

            <MediaUploadField
              name="photoUrl"
              category="shop"
              currentUrl={p.photoUrl}
              accept="image/*"
              kind="image"
              previewClassName="h-24 w-24 object-cover"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Nombre</label>
                <input
                  name="name"
                  defaultValue={p.name}
                  required
                  className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Tallas (CSV)</label>
                <input
                  name="sizesCsv"
                  defaultValue={p.sizesCsv}
                  required
                  className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Precio (MXN)</label>
                <input
                  type="number"
                  name="priceMxn"
                  min={0}
                  defaultValue={p.priceMxn}
                  required
                  className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Descripción</label>
                <textarea
                  name="description"
                  defaultValue={p.description}
                  rows={2}
                  required
                  className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <DetailImageFields detailImageUrls={p.detailImageUrls} />
              <div className="sm:col-span-2">
                <button type="submit" className="bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream hover:bg-accent-hover">
                  Guardar
                </button>
              </div>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
