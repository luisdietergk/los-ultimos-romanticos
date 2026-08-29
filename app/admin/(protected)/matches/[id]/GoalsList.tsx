"use client";

import { useState } from "react";
import { GoalForm, type GoalFormInitial, type RosterPlayer } from "./GoalForm";
import { deleteGoal } from "@/lib/actions/matches";

export type GoalRow = GoalFormInitial;

/** Read-only goal list with per-row edit-in-place (swaps the row for
 * <GoalForm initial=.../> using the same client state that drives Cancelar)
 * and delete, plus the always-visible add form at the bottom. */
export function GoalsList({
  matchId,
  players,
  goals,
}: {
  matchId: string;
  players: RosterPlayer[];
  goals: GoalRow[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {goals.length === 0 && <p className="text-sm text-neutral-600">Sin goles registrados.</p>}

        {goals.map((g) =>
          editingId === g.goalId ? (
            <div key={g.goalId} className="border-2 border-accent p-4">
              <GoalForm matchId={matchId} players={players} initial={g} onDone={() => setEditingId(null)} />
            </div>
          ) : (
            <div
              key={g.goalId}
              className="flex flex-wrap items-center justify-between gap-2 border border-ink/20 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-bold">{g.minute}&apos;</span>{" "}
                <span className={g.team === "LUR" ? "font-bold text-accent" : "font-bold text-neutral-700"}>
                  {g.team}
                </span>{" "}
                {g.scorerName}
                {g.note && <span className="ml-2 text-neutral-600">— {g.note}</span>}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingId(g.goalId)}
                  className="text-xs font-bold uppercase tracking-wider text-accent hover:underline"
                >
                  Editar
                </button>
                <form action={deleteGoal}>
                  <input type="hidden" name="goalId" value={g.goalId} />
                  <input type="hidden" name="matchId" value={matchId} />
                  <button
                    type="submit"
                    className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-accent"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          )
        )}
      </div>

      <div className="border-2 border-ink p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-600">Agregar gol</h3>
        <GoalForm matchId={matchId} players={players} />
      </div>
    </div>
  );
}
