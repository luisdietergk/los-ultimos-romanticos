"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form action={formAction} className="w-80 border-2 border-[#201e1d] p-8">
        <h1 className="mb-6 font-serif text-2xl font-black">Acceso admin</h1>

        <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Correo</label>
        <input
          name="email"
          type="email"
          required
          className="mb-4 w-full border-[1.5px] border-[#201e1d] bg-transparent px-3 py-2"
        />

        <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Contraseña</label>
        <input
          name="password"
          type="password"
          required
          className="mb-4 w-full border-[1.5px] border-[#201e1d] bg-transparent px-3 py-2"
        />

        {errorMessage && <p className="mb-4 text-sm text-[#ae1800]">{errorMessage}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#ae1800] px-4 py-3 font-bold uppercase tracking-wider text-[#edeae1] disabled:opacity-60"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
