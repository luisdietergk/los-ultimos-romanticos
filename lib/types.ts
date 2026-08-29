// Re-exports of Prisma's generated enum types, plus one small lookup table.
// (Postgres has native enum support, so these are real `enum` blocks in
// schema.prisma — this file just gives the rest of the app a stable import
// path that doesn't care whether it's reading a Prisma-generated type.)

export type { MatchStatus, GoalTeam, KitType } from "@prisma/client";
import type { KitType } from "@prisma/client";

export const KIT_TYPES: { type: KitType; title: string }[] = [
  { type: "LOCAL", title: "LOCAL" },
  { type: "VISITA", title: "VISITANTE" },
  { type: "PORTERO", title: "PORTERO" },
];
