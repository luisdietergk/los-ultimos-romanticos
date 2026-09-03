"use client";

import { useRef, useState } from "react";
import { pitchPoint, goalMouthPoint, shotLineEnd, type PlayMarker } from "@/lib/derived";
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
  assistPlayerId: string | null;
  assistX: number | null;
  assistY: number | null;
  playMarkers: PlayMarker[];
}

/** What a click on the pitch does right now — defaults back to placing the
 * shot origin after every other kind of click, so each button press places
 * exactly one dot before returning to the normal mode. */
type PitchMode = "shot" | "assist" | "rival" | "lur";

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
  const [playerId, setPlayerId] = useState<string>(initial?.playerId ?? "");
  const [shotX, setShotX] = useState<number | null>(initial?.shotX ?? null);
  const [shotY, setShotY] = useState<number | null>(initial?.shotY ?? null);
  const [goalX, setGoalX] = useState<number | null>(initial?.goalX ?? null);
  const [goalY, setGoalY] = useState<number | null>(initial?.goalY ?? null);
  const [assistPlayerId, setAssistPlayerId] = useState<string>(initial?.assistPlayerId ?? "");
  const [assistX, setAssistX] = useState<number | null>(initial?.assistX ?? null);
  const [assistY, setAssistY] = useState<number | null>(initial?.assistY ?? null);
  const [markers, setMarkers] = useState<PlayMarker[]>(initial?.playMarkers ?? []);
  const [pitchMode, setPitchMode] = useState<PitchMode>("shot");

  const pitchRef = useRef<SVGSVGElement>(null);
  const goalRef = useRef<SVGSVGElement>(null);

  function handlePitchClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = pitchRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (300 / rect.width);
    const py = (e.clientY - rect.top) * (200 / rect.height);
    const x = clamp01((px - 8) / 284);
    const y = clamp01((py - 8) / 184);

    if (pitchMode === "shot") {
      setShotX(x);
      setShotY(y);
    } else if (pitchMode === "assist") {
      setAssistX(x);
      setAssistY(y);
      setPitchMode("shot");
    } else {
      setMarkers((prev) => [...prev, { team: pitchMode === "rival" ? "RIVAL" : "LUR", x, y }]);
      setPitchMode("shot");
    }
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
  const assistDot = assistX != null && assistY != null ? pitchPoint(assistX, assistY) : null;
  const scorerDorsal = team === "LUR" ? players.find((p) => p.id === playerId)?.dorsal ?? null : null;
  const assistDorsal = players.find((p) => p.id === assistPlayerId)?.dorsal ?? null;

  // Same "which goal does this team shoot at" mirror as the public map, so
  // the line the admin drags here matches what actually publishes.
  const lineX2 = team === "LUR" ? 294 : 6;
  const lineY2 = shotLineEnd(goalX, team === "LUR");
  // Rival goals draw in black instead of accent red, matching how their
  // context dots already render (see the RIVAL/LUR marker split below).
  const teamColor = team === "RIVAL" ? "var(--color-ink)" : "var(--color-accent)";

  const action = isEdit ? updateGoal : addGoal;

  return (
    <form
      action={action}
      onSubmit={() => onDone?.()}
      className="grid grid-cols-1 gap-4"
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
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
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

      <div className="w-full max-w-[560px]">
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-600">
          <span>Mapa de la jugada (clic)</span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {(
            [
              { mode: "assist", label: "+ Asistente" },
              { mode: "lur", label: "+ Jugador LUR" },
              { mode: "rival", label: "+ Jugador rival" },
            ] as const
          ).map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPitchMode(mode === pitchMode ? "shot" : mode)}
              className={`border px-2 py-1 text-[9.5px] font-bold uppercase tracking-wider ${
                pitchMode === mode ? "border-ink bg-ink text-cream" : "border-ink/30 text-neutral-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {pitchMode !== "shot" && (
          <p className="mb-1.5 text-[10px] font-semibold text-accent">
            Clic en el mapa para colocar{" "}
            {pitchMode === "assist" ? "el asistente" : pitchMode === "lur" ? "al jugador LUR" : "al jugador rival"}.
          </p>
        )}
        {(pitchMode === "assist" || assistDot) && (
          <select
            value={assistPlayerId}
            onChange={(e) => setAssistPlayerId(e.target.value)}
            className="mb-1.5 w-full max-w-[280px] border border-ink/30 bg-transparent px-2 py-1 text-xs"
          >
            <option value="">Elige quién asistió…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.dorsal} — {p.name}
              </option>
            ))}
          </select>
        )}

        <svg
          ref={pitchRef}
          viewBox="0 0 300 200"
          className="w-full cursor-crosshair border border-ink/30"
          onClick={handlePitchClick}
        >
          <rect x="8" y="8" width="284" height="184" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <line x1="150" y1="8" x2="150" y2="192" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <circle cx="150" cy="100" r="26" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <circle cx="150" cy="100" r="2" fill="var(--color-neutral-500)" />
          <rect x="8" y="52" width="46" height="96" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <rect x="8" y="76" width="18" height="48" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <rect x="246" y="52" width="46" height="96" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <rect x="274" y="76" width="18" height="48" fill="none" stroke="var(--color-neutral-500)" strokeWidth="1.5" />
          <rect x="292" y="76" width="4" height="48" fill="var(--color-ink)" />
          <rect x="4" y="76" width="4" height="48" fill="var(--color-ink)" />
          {shotDot && (
            <line
              x1={shotDot.x}
              y1={shotDot.y}
              x2={lineX2}
              y2={lineY2}
              stroke={teamColor}
              strokeWidth="1.6"
              strokeDasharray="4 3"
            />
          )}
          {markers.map((m, i) => {
            const pt = pitchPoint(m.x, m.y);
            // Rival stays a solid black dot; LUR is a hollow red ring — only
            // the assist/scorer dots (below) carry a dorsal number inside.
            return m.team === "RIVAL" ? (
              <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="var(--color-ink)" />
            ) : (
              <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="none" stroke="var(--color-accent)" strokeWidth="2" />
            );
          })}
          {assistDot && (
            <>
              <circle cx={assistDot.x} cy={assistDot.y} r="7.5" fill="var(--color-cream)" stroke={teamColor} strokeWidth="2.5" />
              {assistDorsal && (
                <text x={assistDot.x} y={assistDot.y + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill={teamColor}>
                  {assistDorsal}
                </text>
              )}
            </>
          )}
          {shotDot &&
            (scorerDorsal ? (
              <>
                <circle cx={shotDot.x} cy={shotDot.y} r="8.5" fill="var(--color-cream)" stroke={teamColor} strokeWidth="3" />
                <text x={shotDot.x} y={shotDot.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="bold" fill={teamColor}>
                  {scorerDorsal}
                </text>
              </>
            ) : (
              <>
                <circle cx={shotDot.x} cy={shotDot.y} r="7.5" fill="var(--color-cream)" stroke={teamColor} strokeWidth="3" />
                <circle cx={shotDot.x} cy={shotDot.y} r="3" fill="var(--color-ink)" />
              </>
            ))}
        </svg>
        <input type="hidden" name="shotX" value={shotX ?? ""} readOnly />
        <input type="hidden" name="shotY" value={shotY ?? ""} readOnly />
        <input type="hidden" name="assistPlayerId" value={assistPlayerId} readOnly />
        <input type="hidden" name="assistX" value={assistX ?? ""} readOnly />
        <input type="hidden" name="assistY" value={assistY ?? ""} readOnly />
        <input type="hidden" name="playMarkers" value={JSON.stringify(markers)} readOnly />

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {shotDot && (
            <button
              type="button"
              onClick={() => {
                setShotX(null);
                setShotY(null);
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-accent"
            >
              Borrar tiro
            </button>
          )}
          {assistDot && (
            <button
              type="button"
              onClick={() => {
                setAssistX(null);
                setAssistY(null);
                setAssistPlayerId("");
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-accent"
            >
              Borrar asistente
            </button>
          )}
          {markers.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMarkers((prev) => prev.filter((_, j) => j !== i))}
              className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-accent"
            >
              Borrar {m.team === "RIVAL" ? "rival" : "LUR"} #{i + 1}
            </button>
          ))}
        </div>
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
