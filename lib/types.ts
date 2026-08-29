// String-union "enums" — SQLite has no native enum support, so these are
// validated in TypeScript instead of at the Prisma schema level. Moving to
// Postgres later can promote these to real `enum` blocks without changing
// any call site, since the string values are identical.

export type MatchStatus = "SCHEDULED" | "CANCELLED";
export type GoalTeam = "LUR" | "RIVAL";
export type KitType = "LOCAL" | "VISITA" | "PORTERO";

export const KIT_TYPES: { type: KitType; title: string }[] = [
  { type: "LOCAL", title: "LOCAL" },
  { type: "VISITA", title: "VISITANTE" },
  { type: "PORTERO", title: "PORTERO" },
];
