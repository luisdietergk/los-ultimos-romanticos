import { prisma } from "@/lib/db";
import { updateProduct } from "@/lib/actions/shop";

export default async function ShopPage() {
  const products = await prisma.shopProduct.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl font-black">Tienda</h1>
      <p className="mt-2 text-sm text-neutral-700">Editar nombre, tallas, precio, descripción y foto de cada producto.</p>

      <div className="mt-6 flex flex-col gap-4">
        {products.map((p) => (
          <form
            key={p.id}
            action={updateProduct}
            className="grid grid-cols-1 gap-4 border-2 border-ink p-4 sm:grid-cols-[auto_1fr]"
          >
            <input type="hidden" name="id" value={p.id} />

            <div className="flex flex-col items-start gap-2">
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photoUrl} alt={p.name} className="h-24 w-24 object-cover" />
              ) : (
                <div className="h-24 w-24 bg-neutral-200" />
              )}
              <input type="file" name="photo" accept="image/*" className="w-full text-xs" />
            </div>

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
