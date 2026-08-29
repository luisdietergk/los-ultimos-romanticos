// Structured content ported verbatim from the prototype's hardcoded arrays
// (Los Ultimos Romanticos.dc.html: ROSTER ~719, RIVALS18 ~740, SHOP ~742,
// defaultMatches()'s sample goalSets/spots ~955-991, Historia copy ~115-116).
// Used only by prisma/seed.ts — not imported by the app itself.

export const ROSTER = [
  { slotId: "p1", name: "A. Ríos", dorsal: "01", pos: "Portero", q: "El guardián de las despedidas", pj: 13, a: 0, nac: "México", desc: "Portero titular desde la primera cascarita. Grita más que ataja, y ataja mucho.", apodo: "EL SANTO" },
  { slotId: "p2", name: "L. Carrillo", dorsal: "02", pos: "Defensa", q: "El último en rendirse", pj: 15, a: 2, nac: "México", desc: "Lateral de los que corren la banda entera sin pedir cambio.", apodo: "EL MURO" },
  { slotId: "p3", name: "O. Nájera", dorsal: "03", pos: "Defensa", q: "El que reza antes del silbatazo", pj: 15, a: 1, nac: "México", desc: "Central de marca limpia. Reza antes del silbatazo y despeja sin dudar.", apodo: "EL REZO" },
  { slotId: "p4", name: "R. Villegas", dorsal: "04", pos: "Defensa", q: "Muro con memoria de elefante", pj: 14, a: 0, nac: "México", desc: "Defensa central que recuerda cada gol que le hicieron y cobra la revancha.", apodo: "MEMORIA" },
  { slotId: "p5", name: "P. Zamarripa", dorsal: "05", pos: "Defensa", q: "Anatomía diseñada accidentalmente para defender", pj: 12, a: 3, nac: "México", desc: "Zaguero incómodo para cualquier delantero. Juego aéreo y codos de veterano.", apodo: "EL CODO" },
  { slotId: "p6", name: "H. Beltrán", dorsal: "06", pos: "Medio", q: "El metrónomo del jueves", pj: 16, a: 5, nac: "México", desc: "Volante de contención. Reparte el juego y baja la pelota cuando el partido hierve.", apodo: "EL RELOJ" },
  { slotId: "p7", name: "M. Ovalle", dorsal: "07", pos: "Medio", q: "El último romántico de la banda", pj: 14, a: 3, nac: "Argentina", desc: "Extremo de toda la vida. Regate corto, centro largo y memoria de banda.", apodo: "LA BANDA" },
  { slotId: "p8", name: "E. Fraire", dorsal: "08", pos: "Medio", q: "Corre por dos, se queja por tres", pj: 15, a: 4, nac: "México", desc: "Interior que corre por dos. Presiona alto y no calla en todo el partido.", apodo: "PULMÓN" },
  { slotId: "p9", name: "F. Escobedo", dorsal: "09", pos: "Delantero", q: "El que siempre vuelve a creer", pj: 16, a: 2, nac: "México", desc: "Nueve de área. Vive del rebote, del centro y de la fe.", apodo: "EL NUEVE" },
  { slotId: "p10", name: "D. Sáenz", dorsal: "10", pos: "Delantero", q: "Zurda que no pide permiso", pj: 15, a: 6, nac: "México", desc: "Zurda distinta. Tiros libres, pases filtrados y confianza sin permiso.", apodo: "LA ZURDA" },
  { slotId: "p11", name: "S. Quiroz", dorsal: "11", pos: "Delantero", q: "Velocidad primero, plan después", pj: 13, a: 2, nac: "Colombia", desc: "Velocidad pura por derecha. Primero arranca, después piensa el plan.", apodo: "EL RAYO" },
  { slotId: "p12", name: "G. Palomares", dorsal: "12", pos: "Portero", q: "Ataja también las excusas", pj: 6, a: 0, nac: "México", desc: "Portero suplente. Entra sin calentar y sale sin reclamar.", apodo: "EL SUPLENTE" },
  { slotId: "p13", name: "T. Muñiz", dorsal: "13", pos: "Medio", q: "Pases que nadie más ve", pj: 12, a: 7, nac: "México", desc: "Media punta con visión rara. Ve pases que el resto ni imagina.", apodo: "EL MAGO" },
  { slotId: "p14", name: "A. Cepeda", dorsal: "14", pos: "Defensa", q: "Cabello nórdico, visión cuestionable", pj: 13, a: 1, nac: "España", desc: "Lateral de subida constante. Cabello nórdico, centros con curva.", apodo: "EL NÓRDICO" },
  { slotId: "p15", name: "N. Robles", dorsal: "16", pos: "Medio", q: "Llega tarde a todo menos al área", pj: 11, a: 3, nac: "México", desc: "Llega tarde a los entrenamientos y puntual al área rival.", apodo: "EL TARDE" },
  { slotId: "p16", name: "V. Aguirre", dorsal: "17", pos: "Delantero", q: "Festeja como si fuera final", pj: 12, a: 1, nac: "México", desc: "Delantero de festejo largo. Celebra cada gol como si fuera final.", apodo: "EL FESTEJO" },
  { slotId: "p17", name: "J. Lira", dorsal: "19", pos: "Delantero", q: "Nueve minutos, un gol, mil historias", pj: 9, a: 0, nac: "México", desc: "Revulsivo. Nueve minutos le alcanzan para cambiar un partido.", apodo: "EL ENTRÓN" },
  { slotId: "p18", name: "K. Domínguez", dorsal: "21", pos: "Medio", q: "El que apaga la luz del gimnasio", pj: 14, a: 4, nac: "México", desc: "Volante mixto. El último en irse de la cancha, siempre.", apodo: "EL ÚLTIMO" },
  { slotId: "p19", name: "B. Cantú", dorsal: "23", pos: "Defensa", q: "Se apuntó de último y no faltó a ninguno", pj: 10, a: 2, nac: "Uruguay", desc: "Se apuntó al final del torneo y no faltó a ningún jueves.", apodo: "EL NUEVO" },
];

export const RIVALS18 = [
  "SANTA CRUZ 7", "BARRIO ALTO FC", "LOS COMPADRES", "CLUB PARAÍSO", "GOGOS",
  "ATLÉTICO NAZAS", "REAL CASCARITA", "DEPORTIVO LERDO", "LA ROSITA UNITED",
  "JARDINES FC", "VILLA FLORIDA", "EL CAMPESTRE", "SPORTING TORREÓN",
  "UNIÓN LA MERCED", "CANTERA 7", "ARENAL UNITED", "PUERTA DEL SOL", "LOS ALAMOS FC",
];

export const SHOP = [
  { slotId: "s1", name: "Jersey local", sizesCsv: "S,M,L,XL,XXL", priceMxn: 690, description: "El jersey que nos representa. Tradición, elegancia y amor por los detalles." },
  { slotId: "s2", name: "Jersey visitante", sizesCsv: "S,M,L,XL,XXL", priceMxn: 690, description: "Versión crema con vivos rojo y negro. Corte recto, cuello polo y dorsal personalizable." },
  { slotId: "s3", name: "Jersey portero", sizesCsv: "S,M,L,XL", priceMxn: 720, description: "Manga larga en dorado envejecido, con codos reforzados y el patrón de rosas en toda la tela." },
  { slotId: "s4", name: "Short oficial", sizesCsv: "S,M,L,XL,XXL", priceMxn: 380, description: "Negro con doble franja lateral y el número bordado en la pierna izquierda." },
  { slotId: "s5", name: "Calcetas 20◆20", sizesCsv: "Única", priceMxn: 180, description: "Altas, con anillos rojo y negro y corazones tejidos en el tobillo." },
  { slotId: "s6", name: "Chamarra rompevientos", sizesCsv: "S,M,L,XL", priceMxn: 890, description: "Para las noches frías de cancha. Cierre completo, forro ligero y escudo al pecho." },
  { slotId: "s7", name: "Gorra del escudo", sizesCsv: "Ajustable", priceMxn: 290, description: "Panel frontal negro con el escudo bordado en hilo dorado." },
  { slotId: "s8", name: "Bufanda romántica", sizesCsv: "Única", priceMxn: 250, description: "Tejida con el lema del equipo en ambos extremos. Para gritar goles sin perder la garganta." },
];

export const HISTORIA = {
  p1: "Once amigos, una cancha rentada los domingos y la terca idea de que el fútbol de barrio merece ceremonia.",
  p2: "Nacimos en 2020 jugando cascaritas sin árbitro ni público. Seis años después seguimos con la misma alineación de corazón: fútbol 7, camisetas bien puestas y cero prisa por crecer.",
};

const SPOTS = [
  { x: 0.74, y: 0.42, gx: 0.24, gy: 0.68, type: "Pie derecho" },
  { x: 0.88, y: 0.58, gx: 0.72, gy: 0.34, type: "Pie izquierdo" },
  { x: 0.66, y: 0.3, gx: 0.12, gy: 0.42, type: "Cabeza" },
  { x: 0.83, y: 0.5, gx: 0.5, gy: 0.82, type: "Penal" },
  { x: 0.58, y: 0.66, gx: 0.86, gy: 0.22, type: "Tiro libre" },
];

export interface SeedGoal {
  minute: number;
  playerName: string | null; // null => rival goal, scorerName carries the display name
  scorerName: string;
  team: "LUR" | "RIVAL";
  note: string;
  shotX: number;
  shotY: number;
  goalX: number;
  goalY: number;
}

const RAW_GOAL_SETS: { min: string; player: string; team: "lur" | "riv"; note: string }[][] = [
  [
    { min: "12'", player: "D. Sáenz", team: "lur", note: "Asistencia de M. Ovalle" },
    { min: "34'", player: "CHORE", team: "riv", note: "Tiro libre" },
    { min: "58'", player: "M. Ovalle", team: "lur", note: "De cabeza, centro de J. Lira" },
    { min: "71'", player: "CHORE", team: "riv", note: "Penal" },
    { min: "88'", player: "J. Lira", team: "lur", note: "Contragolpe" },
  ],
  [
    { min: "9'", player: "PICHU", team: "riv", note: "Rebote en el área" },
    { min: "41'", player: "PICHU", team: "riv", note: "Asistencia de CACHO" },
    { min: "77'", player: "CACHO", team: "riv", note: "Contragolpe" },
  ],
  [
    { min: "5'", player: "M. Ovalle", team: "lur", note: "Primer toque tras saque" },
    { min: "22'", player: "D. Sáenz", team: "lur", note: "Asistencia de E. Fraire" },
    { min: "49'", player: "E. Fraire", team: "lur", note: "Tiro de media distancia" },
    { min: "63'", player: "FIDEO", team: "riv", note: "Penal" },
    { min: "80'", player: "J. Lira", team: "lur", note: "Asistencia de D. Sáenz" },
  ],
  [
    { min: "17'", player: "J. Lira", team: "lur", note: "Jugada individual" },
    { min: "38'", player: "TURI", team: "riv", note: "Córner" },
    { min: "66'", player: "D. Sáenz", team: "lur", note: "Penal" },
    { min: "90'", player: "TURI", team: "riv", note: "Último minuto" },
  ],
];

/** Jornadas 1-4 ship with the prototype's own sample goals (real example
 * data the user authored while designing), so admins have a working example
 * to edit instead of an empty shell. Every other jornada seeds with no
 * goals. */
export const SAMPLE_GOAL_SETS: SeedGoal[][] = RAW_GOAL_SETS.map((set) =>
  set.map((g, k) => {
    const spot = SPOTS[k % SPOTS.length];
    return {
      minute: parseInt(g.min, 10),
      playerName: g.team === "lur" ? g.player : null,
      scorerName: g.player,
      team: g.team === "lur" ? "LUR" : "RIVAL",
      note: g.note,
      shotX: spot.x,
      shotY: spot.y,
      goalX: spot.gx,
      goalY: spot.gy,
    };
  })
);
