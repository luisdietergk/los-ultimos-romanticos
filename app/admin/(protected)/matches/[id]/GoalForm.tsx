"use client";

import { useRef, useState } from "react";
import { pitchPoint, goalMouthPoint } from "@/lib/derived";
import { addGoal, updateGoal } from "@/lib/actions/matches";

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export interface RosterPlayer {
  id: string;
  name: string;
  dorsal: string;
}

export interface GoalFormInitial {
  goalId: string;
  minute: number;
  team: "LUR" | "RIVAL";
  playerId: string | null;
  scorerName: string;
  note: string | null;
  videoUrl: string | null;
  shotX: number | null;
  shotY: number | null;
  goalX: number | null;
  goalY: number | null;
}

/** Shared add/edit goal form: minute, team, scorer, note, and click-to-place
 * shot-origin + goal-mouth pickers using the exact same 300x200 / 300x140
 * SVG geometry as the public site's GoalMapModal (components/site/shared/
 * GoalMapModal.tsx), so admin-entered coordinates line up with the public
 * shot map pixel-for-pixel. */
export function GoalForm({
  matchId,
  players,
  initial,
  onDone,
}: {
  matchId: string;
  players: RosterPlayer[];
  initial?: GoalFormInitial;
  onDone?: () => void;
}) {
  const isEdit = !!initial;
  const [team, setTeam] = useState<"LUR" | "RIVAL">(initial?.team ?? "LUR");
  const [shotX, setShotX] = useState<number | null>(initial?.shotX ?? null);
  const [shotY, setShotY] = useState<number | null>(initial?.shotY ?? null);
  const [goalX, setGoalX] = useState<number | null>(initial?.goalX ?? null);
  const [goalY, setGoalY] = useState<number | null>(initial?.goalY ?? null);

  const pitchRef = useRef<SVGSVGElement>(null);
  const goalRef = useRef<SVGSVGElement>(null);

  function handlePitchClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = pitchRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (300 / rect.width);
    const py = (e.clientY - rect.top) * (200 / rect.height);
    setShotX(clamp01((px - 8) / 284));
    setShotY(clamp01((py - 8) / 184));
  }

  function handleGoalClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = goalRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (300 / rect.width);
    const py = (e.clientY - rect.top) * (140 / rect.height);
    setGoalX(clamp01((px - 41) / 218));
    setGoalY(clamp01((py - 21) / 107));
  }

  const shotDot = shotX != null && shotY != null ? pitchPoint(shotX, shotY) : null;
  const goalDot = goalX != null && goalY != null ? goalMouthPoint(goalX, goalY) : null;

  const action = isEdit ? updateGoal : addGoal;

  return (
    <form
      action={action}
      onSubmit={() => onDone?.()}
      className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto]"
    >
      <input type="hidden" name="matchId" value={matchId} />
      {isEdit && <input type="hidden" name="goalId" value={initial!.goalId} />}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Minuto</label>
            <input
              type="number"
              name="minute"
              min={0}
              max={130}
              defaultValue={initial?.minute ?? ""}
              required
              className="w-20 border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Equipo</label>
            <div className="flex gap-3 py-1.5 text-sm">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="team"
                  value="LUR"
                  checked={team === "LUR"}
                  onChange={() => setTeam("LUR")}
                />
                LUR
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="team"
                  value="RIVAL"
                  checked={team === "RIVAL"}
                  onChange={() => setTeam("RIVAL")}
                />
                Rival
              </label>
            </div>
          </div>

          {team === "LUR" ? (
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Anotador</label>
              <select
                name="playerId"
                defaultValue={initial?.playerId ?? ""}
                required
                className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
              >
                <option value="" disabled>
                  Elige un jugador…
                </option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.dorsal} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Anotador (rival)</label>
              <input
                name="scorerName"
                defaultValue={initial?.scorerName ?? ""}
                required
                className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Nota (opcional)</label>
          <input
            name="note"
            defaultValue={initial?.note ?? ""}
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider">Video del gol (URL, opcional)</label>
          <input
            name="videoUrl"
            type="url"
            placeholder="https://..."
            defaultValue={initial?.videoUrl ?? ""}
            className="w-full border border-ink/30 bg-transparent px-2 py-1.5 text-sm"
          />
          <p className="mt-1 text-[11px] text-neutral-600">
            Pega el enlace de un video (YouTube, Vercel Blob, etc.). Aparecerá como botón &quot;Ver gol&quot; en el mapa de tiro.
          </p>
        </div>

        <div>
          <button type="submit" className="bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream hover:bg-accent-hover">
            {isEdit ? "Guardar cambios" : "Agregar gol"}
          </button>
          {isEdit && onDone && (
            <button
              type="button"
              onClick={onDone}
              className="ml-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-ink"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-[220px]">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600">Origen del tiro (clic)</div>
        <svg
          ref={pitchRef}
          viewBox="0 0 300 200"
          className="w-full cursor-crosshair border border-ink/30"
          onClick={handlePitchClick}
        >
          <rect x="8" y="8" width="284" height="184" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <line x1="150" y1="8" x2="150" y2="192" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <circle cx="150" cy="100" r="26" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          {shotDot && (
            <>
              <circle cx={shotDot.x} cy={shotDot.y} r="7.5" fill="var(--color-cream)" stroke="var(--color-accent)" strokeWidth="3" />
              <circle cx={shotDot.x} cy={shotDot.y} r="3" fill="var(--color-ink)" />
            </>
          )}
        </svg>
        <input type="hidden" name="shotX" value={shotX ?? ""} readOnly />
        <input type="hidden" name="shotY" value={shotY ?? ""} readOnly />
        {shotDot && (
          <button
            type="button"
            onClick={() => {
              setShotX(null);
              setShotY(null);
            }}
            className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-accent"
          >
            Borrar punto
          </button>
        )}
      </div>

      <div className="w-full max-w-[220px]">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600">Punto en la portería (clic)</div>
        <svg
          ref={goalRef}
          viewBox="0 0 300 140"
          className="w-full cursor-crosshair border border-ink/30"
          onClick={handleGoalClick}
        >
          <path d="M66 36 L234 36 L234 110 L66 110 Z" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1" />
          <path d="M41 21 L66 36 M259 21 L234 36 M41 128 L66 110 M259 128 L234 110" stroke="var(--color-neutral-500)" strokeWidth="1" />
          <rect x="36" y="18" width="7" height="112" fill="var(--color-ink)" />
          <rect x="257" y="18" width="7" height="112" fill="var(--color-ink)" />
          <rect x="36" y="18" width="228" height="7" fill="var(--color-ink)" />
          {goalDot && (
            <>
              <circle cx={goalDot.x} cy={goalDot.y} r="9" fill="var(--color-cream)" stroke="var(--color-accent)" strokeWidth="3" />
              <circle cx={goalDot.x} cy={goalDot.y} r="3.4" fill="var(--color-ink)" />
            </>
          )}
        </svg>
        <input type="hidden" name="goalX" value={goalX ?? ""} readOnly />
        <input type="hidden" name="goalY" value={goalY ?? ""} readOnly />
        {goalDot && (
          <button
            type="button"
            onClick={() => {
              setGoalX(null);
              setGoalY(null);
            }}
            className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-accent"
          >
            Borrar punto
          </button>
        )}
      </div>
    </form>
  );
}
