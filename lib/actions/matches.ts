"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { MatchStatus, GoalTeam } from "@/lib/types";
import { requireString, requireInt, nullableString, floatOrNull } from "./util";

const VALID_STATUS: MatchStatus[] = ["SCHEDULED", "CANCELLED"];
const VALID_TEAM: GoalTeam[] = ["LUR", "RIVAL"];

/** Renames the shared Rival row used by this (and every other) match against
 * that opponent — intentional per the schema, not a per-match override. */
export async function renameRival(formData: FormData): Promise<void> {
  const rivalId = requireString(formData, "rivalId");
  const name = requireString(formData, "name").trim();

  await prisma.rival.update({ where: { id: rivalId }, data: { name } });
  redirect("/admin/matches");
}

/** Kickoff time is entered and stored as plain UTC (the <input> is labeled
 * accordingly) to avoid ambiguous local-timezone math in an admin tool. */
export async function updateMatch(formData: FormData): Promise<void> {
  const matchId = requireString(formData, "matchId");
  const kickoffRaw = requireString(formData, "kickoffAt");
  const venue = requireString(formData, "venue").trim();
  const status = requireString(formData, "status");

  if (!VALID_STATUS.includes(status as MatchStatus)) {
    throw new Error(`Estado inválido: ${status}`);
  }

  const kickoffAt = new Date(kickoffRaw.endsWith("Z") ? kickoffRaw : `${kickoffRaw}Z`);
  if (Number.isNaN(kickoffAt.getTime())) {
    throw new Error("Fecha/hora de inicio inválida.");
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { kickoffAt, venue, status: status as MatchStatus },
  });
  redirect("/admin/matches");
}

async function resolveGoalFields(formData: FormData) {
  const matchId = requireString(formData, "matchId");
  const minute = requireInt(formData, "minute");
  const team = requireString(formData, "team");
  if (!VALID_TEAM.includes(team as GoalTeam)) throw new Error(`Equipo inválido: ${team}`);

  const note = nullableString(formData, "note");
  const videoUrl = nullableString(formData, "videoUrl");
  const shotX = floatOrNull(formData, "shotX");
  const shotY = floatOrNull(formData, "shotY");
  const goalX = floatOrNull(formData, "goalX");
  const goalY = floatOrNull(formData, "goalY");

  let playerId: string | null = null;
  let scorerName: string;

  if (team === "LUR") {
    playerId = nullableString(formData, "playerId");
    if (!playerId) throw new Error("Elige quién anotó.");
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error("Jugador no encontrado.");
    scorerName = player.name;
  } else {
    scorerName = requireString(formData, "scorerName").trim();
  }

  return { matchId, minute, team: team as GoalTeam, playerId, scorerName, note, videoUrl, shotX, shotY, goalX, goalY };
}

export async function addGoal(formData: FormData): Promise<void> {
  const fields = await resolveGoalFields(formData);
  await prisma.goal.create({ data: fields });
  redirect(`/admin/matches/${fields.matchId}`);
}

export async function updateGoal(formData: FormData): Promise<void> {
  const goalId = requireString(formData, "goalId");
  const fields = await resolveGoalFields(formData);
  await prisma.goal.update({ where: { id: goalId }, data: fields });
  redirect(`/admin/matches/${fields.matchId}`);
}

export async function deleteGoal(formData: FormData): Promise<void> {
  const goalId = requireString(formData, "goalId");
  const matchId = requireString(formData, "matchId");
  await prisma.goal.delete({ where: { id: goalId } });
  redirect(`/admin/matches/${matchId}`);
}
