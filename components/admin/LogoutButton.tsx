"use client";

import { signOut } from "next-auth/react";

/** A plain client-side signOut (fetch to /api/auth/signout), not a Server
 * Action form. This layout wraps every protected admin page, each of which
 * has its own Server Action forms — co-locating a Server-Action-bearing
 * <form> here as an ancestor of those nested forms caused Next.js
 * (16.3.3, Turbopack dev) to misattribute a nested page's form submission
 * to THIS form's action instead, silently logging the admin out on every
 * write instead of saving. Keeping logout client-side sidesteps that
 * entirely. */
export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-xs font-bold uppercase tracking-wider hover:text-[#ae1800]"
    >
      Salir
    </button>
  );
}
