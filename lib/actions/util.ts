// Small shared parsing/validation helpers for admin Server Actions. FormData
// values are always strings (or File), so every field coming from a form
// needs coercion + a sane fallback before it touches Prisma.

export function requireString(formData: FormData, field: string): string {
  const v = formData.get(field);
  if (typeof v !== "string" || v.trim() === "") {
    throw new Error(`Falta el campo "${field}".`);
  }
  return v;
}

export function optionalString(formData: FormData, field: string): string {
  const v = formData.get(field);
  return typeof v === "string" ? v : "";
}

export function nullableString(formData: FormData, field: string): string | null {
  const v = formData.get(field);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v;
}

export function requireInt(formData: FormData, field: string): number {
  const raw = requireString(formData, field);
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) throw new Error(`El campo "${field}" debe ser un número.`);
  return n;
}

export function intOrDefault(formData: FormData, field: string, fallback: number): number {
  const raw = formData.get(field);
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function floatOrNull(formData: FormData, field: string): number | null {
  const raw = formData.get(field);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? clamp01(n) : null;
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
