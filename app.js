const { useState, useEffect, useRef, useCallback } = React;

/* ---------------------------------------------------------------------- */
/* Iconos livianos (sin dependencias externas)                            */
/* ---------------------------------------------------------------------- */
function IconBase({ children, size = 16, color, style, strokeWidth }) {
  return <span style={{ fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", color, width: size, height: size, ...style }}>{children}</span>;
}
const Home = (p) => <IconBase {...p}>🏠</IconBase>;
const ClipboardList = (p) => <IconBase {...p}>📋</IconBase>;
const CalendarDays = (p) => <IconBase {...p}>📅</IconBase>;
const Package = (p) => <IconBase {...p}>📦</IconBase>;
const BarChart3 = (p) => <IconBase {...p}>📊</IconBase>;
const HistoryIcon = (p) => <IconBase {...p}>🕒</IconBase>;
const SettingsIcon = (p) => <IconBase {...p}>⚙️</IconBase>;
const Sun = (p) => <IconBase {...p}>☀️</IconBase>;
const Moon = (p) => <IconBase {...p}>🌙</IconBase>;
const Play = (p) => <IconBase {...p}>▶️</IconBase>;
const Pause = (p) => <IconBase {...p}>⏸️</IconBase>;
const Check = (p) => <IconBase {...p}>✔️</IconBase>;
const Plus = (p) => <IconBase {...p}>➕</IconBase>;
const Trash2 = (p) => <IconBase {...p}>🗑️</IconBase>;
const AlertTriangle = (p) => <IconBase {...p}>⚠️</IconBase>;
const Clock = (p) => <IconBase {...p}>⏱️</IconBase>;
const ChevronRight = (p) => <IconBase {...p}>›</IconBase>;
const X = (p) => <IconBase {...p}>✖️</IconBase>;
const Camera = (p) => <IconBase {...p}>📷</IconBase>;
const Sparkles = (p) => <IconBase {...p}>✨</IconBase>;
const StickyNote = (p) => <IconBase {...p}>🗒️</IconBase>;
const Bot = (p) => <IconBase {...p}>🤖</IconBase>;
const Route = (p) => <IconBase {...p}>🧭</IconBase>;

/* ---------------------------------------------------------------------- */
/* Gráficos livianos (sin dependencias externas, reemplazan a recharts)   */
/* ---------------------------------------------------------------------- */
function GraficoLinea({ datos, valueKey, color, max, alto = 160 }) {
  const maxVal = max ?? Math.max(1, ...datos.map((d) => d[valueKey]));
  const n = datos.length;
  const pts = datos.map((d, i) => {
    const x = n > 1 ? (i / (n - 1)) * 100 : 50;
    const y = 100 - Math.min(100, (d[valueKey] / maxVal) * 100);
    return [x, y];
  });
  const puntos = pts.map((p) => p.join(",")).join(" ");
  return (
    <div style={{ height: alto, width: "100%" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <polyline points={puntos} fill="none" stroke={color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill={color} />)}
      </svg>
    </div>
  );
}
function GraficoBarrasVert({ datos, valueKey, labelKey, color, tema, alto = 160 }) {
  const max = Math.max(1, ...datos.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: alto }}>
      {datos.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
          <div style={{ fontSize: 9, color: tema.textoSuave }}>{d[valueKey]}</div>
          <div style={{ width: "100%", maxWidth: 22, height: `${(d[valueKey] / max) * 78}%`, minHeight: 2, background: color, borderRadius: "5px 5px 0 0", transition: "height .3s" }} />
          <div style={{ fontSize: 8.5, color: tema.textoSuave, whiteSpace: "nowrap" }}>{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
}
function GraficoBarrasHoriz({ datos, valueKey, labelKey, color, tema }) {
  const max = Math.max(1, ...datos.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {datos.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
            <span>{d[labelKey]}</span><span style={{ fontFamily: FUENTE_MONO }}>{d[valueKey]}</span>
          </div>
          <BarraProgreso pct={(d[valueKey] / max) * 100} color={color} fondo={tema.superficieAlt} alto={7} />
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Constantes y datos semilla                                             */
/* ---------------------------------------------------------------------- */

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DIAS_LABORALES = [1, 2, 3, 4, 5, 6]; // lunes a sábado

const FRECUENCIAS = {
  diaria: { label: "Diaria", dias: 1 },
  alterna: { label: "Día sí, día no", dias: 2 },
  semanal: { label: "Semanal", dias: 7 },
  quincenal: { label: "Quincenal", dias: 14 },
  mensual: { label: "Mensual", dias: 30 },
};

const PRIORIDADES = {
  alta: { label: "Alta", color: "#DC4545" },
  media: { label: "Media", color: "#D98A2B" },
  baja: { label: "Baja", color: "#5B8A72" },
};

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const A = new Date(a + "T00:00:00");
  const B = new Date(b + "T00:00:00");
  return Math.round((B - A) / 86400000);
}

const SEED_AREAS = [
  {
    id: "recepcion", nombre: "Recepción", color: "#2D6CDF",
    tareas: [
      { id: uid("t"), nombre: "Escritorio", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Sillas metálicas", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Piso", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
    ],
  },
  {
    id: "oficina", nombre: "Oficina", color: "#6B4EA0",
    tareas: [
      { id: uid("t"), nombre: "Escritorios", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Piso", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Basura", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
    ],
  },
  {
    id: "salon-amarillo", nombre: "Salón Amarillo", color: "#F2B705",
    tareas: [
      { id: uid("t"), nombre: "Mesas", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Sillas", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Pizarrón", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Barrer", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Trapear", prioridad: "media", frecuencia: "alterna", ultima: null, notas: "" },
    ],
  },
  {
    id: "salon-azul", nombre: "Salón Azul", color: "#2D6CDF",
    tareas: [
      { id: uid("t"), nombre: "Mesas", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Sillas", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Pizarrón", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Barrer", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Trapear", prioridad: "media", frecuencia: "alterna", ultima: null, notas: "" },
    ],
  },
  {
    id: "salon-verde", nombre: "Salón Verde", color: "#2E9E5B",
    tareas: [
      { id: uid("t"), nombre: "Mesas", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Sillas", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Pizarrón", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Barrer", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Trapear", prioridad: "media", frecuencia: "alterna", ultima: null, notas: "" },
    ],
  },
  {
    id: "bano", nombre: "Baño", color: "#0F766E",
    tareas: [
      { id: uid("t"), nombre: "Inodoro y lavamanos", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Espejo", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Baldear piso", prioridad: "alta", frecuencia: "alterna", ultima: null, notas: "Un día sí, un día no" },
      { id: uid("t"), nombre: "Reponer papel/jabón", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
    ],
  },
  {
    id: "deposito", nombre: "Depósito", color: "#8A5A3B",
    tareas: [
      { id: uid("t"), nombre: "Orden general", prioridad: "media", frecuencia: "semanal", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Piso", prioridad: "baja", frecuencia: "semanal", ultima: null, notas: "" },
    ],
  },
  {
    id: "escaleras", nombre: "Escaleras", color: "#5B6B7A",
    tareas: [
      { id: uid("t"), nombre: "Barrer escalones", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Pasamanos", prioridad: "baja", frecuencia: "alterna", ultima: null, notas: "" },
    ],
  },
  {
    id: "entrada", nombre: "Entrada", color: "#C0562E",
    tareas: [
      { id: uid("t"), nombre: "Puerta de cristal", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Piso de entrada", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
    ],
  },
  {
    id: "cafeteria", nombre: "Cafetería", color: "#B8722E",
    tareas: [
      { id: uid("t"), nombre: "Limpiar cafetera", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Lavar vajilla y cubiertos", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Limpiar mesón y microondas", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Reponer café, azúcar y vasos", prioridad: "media", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Sacar basura orgánica", prioridad: "alta", frecuencia: "diaria", ultima: null, notas: "" },
      { id: uid("t"), nombre: "Limpiar nevera/refrigeradora", prioridad: "media", frecuencia: "semanal", ultima: null, notas: "" },
    ],
  },
];

const CATEGORIAS_INVENTARIO = ["Limpieza", "Higiene", "Papelería", "Herramientas", "Cafetería", "Otro"];

const SUGERENCIAS_INSUMOS_COMUNES = [
  "Desinfectante multiuso", "Desinfectante Natural GL Cherry", "Cloro Gl Natural", "Alcohol en gel",
  "Alcohol líquido 70%", "Jabón líquido de manos", "Jabón en polvo", "Suavizante de telas",
  "Limpiavidrios", "Limpiador de pisos", "Cera para piso", "Removedor de manchas",
  "Ambientador en aerosol", "Ambientador en gel", "Pastillas para inodoro", "Papel higiénico",
  "Papel toalla", "Toallas de mano de tela", "Toalla ECO Microfibra", "Servilletas",
  "Bolsas de basura pequeñas", "Bolsas de basura grandes", "Guantes de limpieza", "Guantes Nitrilo",
  "Mascarillas", "Escoba", "Recogedor", "Trapeador", "Balde", "Esponjas", "Fibra verde",
  "Franela", "Cepillo para inodoro", "Cepillo de mano", "Atomizador vacío", "Wipes desinfectantes",
  "Jabón de manos almendra", "Vinagre blanco", "Bicarbonato de sodio", "Pastillas desinfectantes Clorox",
  "Café molido", "Café en grano", "Azúcar", "Endulzante", "Vasos desechables", "Platos desechables",
  "Cucharitas plásticas", "Servilletas de cafetería", "Filtros de café", "Leche en polvo", "Crema para café",
  "Detergente lavaplatos", "Esponja lavaplatos", "Bolsas para basura orgánica", "Té / infusiones", "Galletas para café",
];

const PROVEEDOR_DEFAULT = { nombre: "DGP Xpress · Distribuidora General Express", correo: "atencion@dgp.com.pa", tel: "395-1489 / 6784-5323 / 6200-5982" };

const SEED_INVENTARIO = [
  { id: uid("p"), nombre: "Desinfectante Natural GL Cherry", sku: "764451122017", stock: 1, minimo: 2, unidad: "galón", categoria: "Limpieza", proveedor: "DGP Xpress", costo: 5.25, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: "Jabón Líquido Gl Natural Almendra Blanco", sku: "764451125476", stock: 1, minimo: 2, unidad: "galón", categoria: "Higiene", proveedor: "DGP Xpress", costo: 6.25, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: 'Bolsas N 18"x18" (25u)', sku: "764451123045", stock: 3, minimo: 4, unidad: "paquetes", categoria: "Limpieza", proveedor: "DGP Xpress", costo: 0.80, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: 'Bolsas N 23"x30" (20u)', sku: "764451123069", stock: 1, minimo: 2, unidad: "paquetes", categoria: "Limpieza", proveedor: "DGP Xpress", costo: 1.25, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: "Cloro Gl Natural", sku: "764451121966", stock: 1, minimo: 2, unidad: "galón", categoria: "Limpieza", proveedor: "DGP Xpress", costo: 3.25, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: "Wipes Toallitas Desinfectante (85u)", sku: "607766051392", stock: 3, minimo: 3, unidad: "paquetes", categoria: "Limpieza", proveedor: "DGP Xpress", costo: 5.75, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: "Toalla ECO Microfibra Gris", sku: "8151", stock: 6, minimo: 6, unidad: "unidades", categoria: "Herramientas", proveedor: "DGP Xpress", costo: 0.70, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: "Guante Nit M Negro Chad Line", sku: "9007.000", stock: 1, minimo: 2, unidad: "cajas", categoria: "Herramientas", proveedor: "DGP Xpress", costo: 5.00, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: "Pastilla Clorox (6u)", sku: "044600159324", stock: 1, minimo: 1, unidad: "paquetes", categoria: "Limpieza", proveedor: "DGP Xpress", costo: 20.70, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: "Pastilla Azul Tergo 3x2", sku: "7702532896320", stock: 1, minimo: 1, unidad: "paquetes", categoria: "Limpieza", proveedor: "DGP Xpress", costo: 3.43, ultimaReposicion: "2026-06-29" },
  { id: uid("p"), nombre: "Café molido", sku: "", stock: 2, minimo: 2, unidad: "libras", categoria: "Cafetería", proveedor: "", costo: 0, ultimaReposicion: null },
  { id: uid("p"), nombre: "Azúcar", sku: "", stock: 3, minimo: 2, unidad: "libras", categoria: "Cafetería", proveedor: "", costo: 0, ultimaReposicion: null },
  { id: uid("p"), nombre: "Vasos desechables", sku: "", stock: 40, minimo: 30, unidad: "unidades", categoria: "Cafetería", proveedor: "", costo: 0, ultimaReposicion: null },
  { id: uid("p"), nombre: "Cucharitas plásticas", sku: "", stock: 40, minimo: 30, unidad: "unidades", categoria: "Cafetería", proveedor: "", costo: 0, ultimaReposicion: null },
  { id: uid("p"), nombre: "Filtros de café", sku: "", stock: 15, minimo: 10, unidad: "unidades", categoria: "Cafetería", proveedor: "", costo: 0, ultimaReposicion: null },
  { id: uid("p"), nombre: "Leche en polvo/crema", sku: "", stock: 1, minimo: 1, unidad: "botes", categoria: "Cafetería", proveedor: "", costo: 0, ultimaReposicion: null },
  { id: uid("p"), nombre: "Detergente lavaplatos", sku: "", stock: 1, minimo: 1, unidad: "botellas", categoria: "Cafetería", proveedor: "", costo: 0, ultimaReposicion: null },
  { id: uid("p"), nombre: "Esponja lavaplatos", sku: "", stock: 3, minimo: 2, unidad: "unidades", categoria: "Cafetería", proveedor: "", costo: 0, ultimaReposicion: null },
];

/* ---------------------------------------------------------------------- */
/* Almacenamiento persistente                                             */
/* ---------------------------------------------------------------------- */

async function loadKey(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return fallback;
  } catch (e) {
    return fallback;
  }
}

async function saveKey(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error guardando", key, e);
  }
}

/* ---------------------------------------------------------------------- */
/* Utilidades de tareas / frecuencia                                      */
/* ---------------------------------------------------------------------- */

function tareaVenceHoy(tarea) {
  const hoy = todayStr();
  if (!tarea.ultima) return true;
  if (tarea.ultima === hoy) return false;
  const freq = FRECUENCIAS[tarea.frecuencia] || FRECUENCIAS.diaria;
  return daysBetween(tarea.ultima, hoy) >= freq.dias;
}

function tareaHechaHoy(tarea) {
  return tarea.ultima === todayStr();
}

function formatDuracion(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ---------------------------------------------------------------------- */
/* App principal                                                          */
/* ---------------------------------------------------------------------- */

function App() {
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("inicio");
  const [oscuro, setOscuro] = useState(false);
  const [areas, setAreas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [sesion, setSesion] = useState(null); // {inicio, tiempos:{tareaId:segundos}, fotos:{}}
  const [areaActiva, setAreaActiva] = useState(null);
  const [cronometro, setCronometro] = useState({ tareaId: null, inicio: null, acumulado: 0 });
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      const [a, inv, hist, cfg, ses] = await Promise.all([
        loadKey("aloha:areas", SEED_AREAS),
        loadKey("aloha:inventario", SEED_INVENTARIO),
        loadKey("aloha:historial", []),
        loadKey("aloha:settings", { oscuro: false }),
        loadKey("aloha:sesion", null),
      ]);
      setAreas(a);
      setInventario(inv);
      setHistorial(hist);
      setOscuro(!!cfg.oscuro);
      setSesion(ses);
      setCargando(false);
    })();
  }, []);

  useEffect(() => { if (!cargando) saveKey("aloha:areas", areas); }, [areas, cargando]);
  useEffect(() => { if (!cargando) saveKey("aloha:inventario", inventario); }, [inventario, cargando]);
  useEffect(() => { if (!cargando) saveKey("aloha:historial", historial); }, [historial, cargando]);
  useEffect(() => { if (!cargando) saveKey("aloha:settings", { oscuro }); }, [oscuro, cargando]);
  useEffect(() => { if (!cargando) saveKey("aloha:sesion", sesion); }, [sesion, cargando]);

  // reloj para cronómetro activo
  useEffect(() => {
    if (!cronometro.tareaId) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [cronometro.tareaId]);

  const mostrarToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  /* -------------------- acciones de jornada -------------------- */

  function iniciarJornada() {
    setSesion({ inicio: new Date().toISOString(), tiempos: {}, fotos: {} });
    mostrarToast("Jornada iniciada");
    setTab("checklist");
  }

  function iniciarCronometro(tareaId) {
    setCronometro({ tareaId, inicio: Date.now(), acumulado: (sesion?.tiempos?.[tareaId] || 0) });
  }

  function pausarCronometro() {
    if (!cronometro.tareaId) return;
    const transcurrido = Math.floor((Date.now() - cronometro.inicio) / 1000);
    const total = cronometro.acumulado + transcurrido;
    setSesion((s) => ({ ...s, tiempos: { ...s.tiempos, [cronometro.tareaId]: total } }));
    setCronometro({ tareaId: null, inicio: null, acumulado: 0 });
  }

  function tiempoActual(tareaId) {
    const base = sesion?.tiempos?.[tareaId] || 0;
    if (cronometro.tareaId === tareaId) {
      const transcurrido = Math.floor((Date.now() - cronometro.inicio) / 1000);
      return base > cronometro.acumulado ? cronometro.acumulado + transcurrido : cronometro.acumulado + transcurrido;
    }
    return base;
  }

  function marcarTarea(areaId, tareaId, notas) {
    if (cronometro.tareaId === tareaId) pausarCronometro();
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId ? a : {
          ...a,
          tareas: a.tareas.map((t) =>
            t.id !== tareaId ? t : { ...t, ultima: todayStr(), notas: notas ?? t.notas }
          ),
        }
      )
    );
  }

  function desmarcarTarea(areaId, tareaId) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId ? a : {
          ...a,
          tareas: a.tareas.map((t) => (t.id !== tareaId ? t : { ...t, ultima: null })),
        }
      )
    );
  }

  function finalizarJornada() {
    if (!sesion) return;
    const hoy = todayStr();
    let totalTareas = 0, completadas = 0, tiempoTotal = 0;
    const porArea = [];
    areas.forEach((a) => {
      const tareasHoy = a.tareas.filter((t) => tareaHechaHoy(t) || tareaVenceHoy(t));
      const hechas = a.tareas.filter((t) => tareaHechaHoy(t));
      totalTareas += tareasHoy.length;
      completadas += hechas.length;
      const tArea = a.tareas.reduce((sum, t) => sum + (sesion.tiempos?.[t.id] || 0), 0);
      tiempoTotal += tArea;
      if (tareasHoy.length > 0) porArea.push({ area: a.nombre, color: a.color, completadas: hechas.length, total: tareasHoy.length, tiempo: tArea });
    });
    const registro = {
      id: uid("h"),
      fecha: hoy,
      inicio: sesion.inicio,
      fin: new Date().toISOString(),
      totalTareas, completadas, tiempoTotal,
      porArea,
    };
    setHistorial((prev) => [registro, ...prev]);
    setSesion(null);
    setCronometro({ tareaId: null, inicio: null, acumulado: 0 });
    mostrarToast("Jornada finalizada y guardada en el historial");
    setTab("historial");
  }

  /* -------------------- inventario -------------------- */

  function ajustarStock(id, delta) {
    setInventario((prev) =>
      prev.map((p) =>
        p.id !== id ? p : {
          ...p,
          stock: Math.max(0, p.stock + delta),
          ultimaReposicion: delta > 0 ? todayStr() : p.ultimaReposicion,
        }
      )
    );
  }

  function editarProducto(id, cambios) {
    setInventario((prev) => prev.map((p) => (p.id !== id ? p : { ...p, ...cambios })));
  }

  /* -------------------- configuración de áreas -------------------- */

  function agregarTarea(areaId, nombre, prioridad, frecuencia) {
    if (!nombre.trim()) return;
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId ? a : { ...a, tareas: [...a.tareas, { id: uid("t"), nombre, prioridad, frecuencia, ultima: null, notas: "" }] }
      )
    );
  }

  function eliminarTarea(areaId, tareaId) {
    setAreas((prev) => prev.map((a) => (a.id !== areaId ? a : { ...a, tareas: a.tareas.filter((t) => t.id !== tareaId) })));
  }

  /* -------------------- derivados -------------------- */

  const tareasDeHoy = areas.flatMap((a) => a.tareas.filter((t) => tareaVenceHoy(t) || tareaHechaHoy(t)).map((t) => ({ ...t, areaId: a.id, areaNombre: a.nombre, color: a.color })));
  const totalHoy = tareasDeHoy.length;
  const hechasHoy = tareasDeHoy.filter(tareaHechaHoy).length;
  const progresoHoy = totalHoy ? Math.round((hechasHoy / totalHoy) * 100) : 0;
  const alertasInventario = inventario.filter((p) => p.stock <= p.minimo);

  const tema = oscuro ? TEMA_OSCURO : TEMA_CLARO;

  if (cargando) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: tema.fondo, color: tema.texto, fontFamily: FUENTE_BODY }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={20} className="spin-slow" />
          <span>Cargando Aloha Limpieza…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: tema.fondo, color: tema.texto, fontFamily: FUENTE_BODY, transition: "background .3s,color .3s", "--acento": tema.acento, "--acento-suave": tema.acentoSuave }}>
      <style>{GLOBAL_CSS}</style>

      {/* Encabezado */}
      <header style={{ borderBottom: `1px solid ${tema.borde}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: tema.fondo, zIndex: 20, boxShadow: `0 1px 0 ${tema.borde}, 0 4px 12px rgba(0,0,0,.03)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: tema.acento, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 15, boxShadow: `0 2px 8px ${tema.acento}55` }}>A</div>
          <div>
            <div style={{ fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 17, lineHeight: 1.1 }}>Aloha Limpieza</div>
            <div style={{ fontSize: 11.5, color: tema.textoSuave }}>Asistente de jornada · {DIAS[new Date().getDay()]}</div>
          </div>
        </div>
        <button onClick={() => setOscuro((o) => !o)} className="btn-anim" style={estiloBotonIcono(tema)} title="Modo oscuro">
          {oscuro ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>

      <main key={tab} className="vista-fade" style={{ maxWidth: 860, margin: "0 auto", padding: "18px 16px 100px" }}>
        {tab === "inicio" && (
          <VistaInicio
            tema={tema} sesion={sesion} progresoHoy={progresoHoy} totalHoy={totalHoy} hechasHoy={hechasHoy}
            alertasInventario={alertasInventario} inventario={inventario} areas={areas} onIniciar={iniciarJornada}
            onIrChecklist={() => setTab("checklist")} historial={historial}
          />
        )}
        {tab === "checklist" && (
          <VistaChecklist
            tema={tema} areas={areas} sesion={sesion} areaActiva={areaActiva} setAreaActiva={setAreaActiva}
            marcarTarea={marcarTarea} desmarcarTarea={desmarcarTarea}
            cronometro={cronometro} iniciarCronometro={iniciarCronometro} pausarCronometro={pausarCronometro}
            tiempoActual={tiempoActual} onIniciar={iniciarJornada} onFinalizar={finalizarJornada}
            mostrarToast={mostrarToast}
          />
        )}
        {tab === "calendario" && <VistaCalendario tema={tema} areas={areas} />}
        {tab === "inventario" && <VistaInventario tema={tema} inventario={inventario} setInventario={setInventario} ajustarStock={ajustarStock} editarProducto={editarProducto} />}
        {tab === "estadisticas" && <VistaEstadisticas tema={tema} historial={historial} areas={areas} />}
        {tab === "historial" && <VistaHistorial tema={tema} historial={historial} />}
        {tab === "config" && <VistaConfig tema={tema} areas={areas} setAreas={setAreas} agregarTarea={agregarTarea} eliminarTarea={eliminarTarea} />}
      </main>

      {/* Navegación inferior */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: tema.superficie, borderTop: `1px solid ${tema.borde}`, display: "flex", justifyContent: "space-around", padding: "6px 4px calc(env(safe-area-inset-bottom,0px) + 6px)", zIndex: 30, boxShadow: "0 -4px 16px rgba(0,0,0,.04)" }}>
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`nav-item${tab === item.id ? " activo" : ""}`} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 8px", color: tab === item.id ? tema.acento : tema.textoSuave, cursor: "pointer", flex: 1, fontFamily: FUENTE_BODY }}>
            <span className="nav-pill" />
            <item.icon size={19} strokeWidth={tab === item.id ? 2.4 : 1.9} />
            <span style={{ fontSize: 10.5, fontWeight: tab === item.id ? 600 : 500 }}>{item.label}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div style={{ position: "fixed", bottom: 78, left: "50%", transform: "translateX(-50%)", background: tema.textoInverso, color: tema.fondoInverso, padding: "9px 16px", borderRadius: 10, fontSize: 13, zIndex: 50, boxShadow: "0 6px 18px rgba(0,0,0,.18)", animation: "fadeUp .2s ease" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Tema y estilos globales                                                */
/* ---------------------------------------------------------------------- */

const FUENTE_DISPLAY = "'Space Grotesk', 'Segoe UI', sans-serif";
const FUENTE_BODY = "'Inter', 'Segoe UI', sans-serif";
const FUENTE_MONO = "'JetBrains Mono', 'Courier New', monospace";

const TEMA_CLARO = {
  fondo: "#F6F5F1", superficie: "#FFFFFF", superficieAlt: "#EFEDE6", borde: "#E2E0D6",
  texto: "#1C1D1B", textoSuave: "#6B6A61", acento: "#0F766E", acentoSuave: "#CDE7E2",
  textoInverso: "#1C1D1B", fondoInverso: "#FFFFFF",
};
const TEMA_OSCURO = {
  fondo: "#15171A", superficie: "#1D2024", superficieAlt: "#23262B", borde: "#2C3036",
  texto: "#F1F1EE", textoSuave: "#9A9EA6", acento: "#3FBFA8", acentoSuave: "#1E3B37",
  textoInverso: "#F1F1EE", fondoInverso: "#23262B",
};

const NAV_ITEMS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "checklist", label: "Checklist", icon: ClipboardList },
  { id: "calendario", label: "Calendario", icon: CalendarDays },
  { id: "inventario", label: "Insumos", icon: Package },
  { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
  { id: "historial", label: "Historial", icon: HistoryIcon },
  { id: "config", label: "Ajustes", icon: SettingsIcon },
];

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
* { box-sizing: border-box; }
body { margin: 0; -webkit-font-smoothing: antialiased; }
button { font-family: inherit; }
.spin-slow { animation: spin 1.8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.vista-fade { animation: fadeUp .28s ease; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: #ccc8; border-radius: 8px; }

.tarjeta { box-shadow: 0 1px 2px rgba(20,20,15,.04); transition: box-shadow .2s ease, transform .15s ease, border-color .2s ease; }
.tarjeta-clic:hover { box-shadow: 0 4px 14px rgba(20,20,15,.08); transform: translateY(-1px); }
.tarjeta-clic:active { transform: translateY(0); }

.btn-anim { transition: filter .15s ease, transform .1s ease, background .15s ease, border-color .15s ease; }
.btn-anim:hover { filter: brightness(0.94); }
.btn-anim:active { transform: scale(0.97); }
.btn-anim:disabled { opacity: .5; cursor: not-allowed; }

.nav-item { position: relative; transition: color .15s ease; }
.nav-item .nav-pill { position: absolute; inset: -6px -10px; border-radius: 11px; background: var(--acento-suave); opacity: 0; transition: opacity .18s ease; z-index: -1; }
.nav-item.activo .nav-pill { opacity: 1; }
.nav-item:active { transform: scale(0.95); }

input, select, textarea { transition: border-color .15s ease, box-shadow .15s ease; outline: none; }
input:focus, select:focus, textarea:focus { border-color: var(--acento) !important; box-shadow: 0 0 0 3px var(--acento-suave); }

button:focus-visible, a:focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .vista-fade, .tarjeta, .tarjeta-clic, .btn-anim, .nav-item, .nav-pill { animation: none !important; transition: none !important; }
}
`;

function estiloBotonIcono(tema) {
  return { width: 34, height: 34, borderRadius: 9, border: `1px solid ${tema.borde}`, background: tema.superficie, color: tema.texto, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
}

function Tarjeta({ tema, children, style, className = "" }) {
  return <div className={`tarjeta ${className}`} style={{ background: tema.superficie, border: `1px solid ${tema.borde}`, borderRadius: 14, padding: 16, ...style }}>{children}</div>;
}

function BarraProgreso({ pct, color = "#0F766E", fondo = "#E2E0D6", alto = 8 }) {
  return (
    <div style={{ width: "100%", height: alto, borderRadius: alto, background: fondo, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", background: color, transition: "width .4s ease" }} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Vista: Inicio                                                          */
/* ---------------------------------------------------------------------- */

function VistaInicio({ tema, sesion, progresoHoy, totalHoy, hechasHoy, alertasInventario, inventario, areas, onIniciar, onIrChecklist, historial }) {
  const ultima = historial[0];
  const [respuesta, setRespuesta] = useState(null);

  const rutaRecomendada = [...areas]
    .map((a) => {
      const pendientes = a.tareas.filter((t) => tareaVenceHoy(t) && !tareaHechaHoy(t));
      const altas = pendientes.filter((t) => t.prioridad === "alta").length;
      return { area: a, pendientes: pendientes.length, altas };
    })
    .filter((x) => x.pendientes > 0)
    .sort((a, b) => b.altas - a.altas || b.pendientes - a.pendientes);

  function preguntar(tipo) {
    if (tipo === "falta") {
      const pendientes = areas.flatMap((a) => a.tareas.filter((t) => tareaVenceHoy(t) && !tareaHechaHoy(t)).map((t) => `${a.nombre}: ${t.nombre}`));
      setRespuesta(pendientes.length ? `Te faltan ${pendientes.length} tareas hoy:\n${pendientes.slice(0, 8).join("\n")}${pendientes.length > 8 ? "\n…" : ""}` : "¡Ya completaste todas las tareas de hoy! 🎉");
    } else if (tipo === "bano") {
      const bano = areas.find((a) => a.id === "bano");
      const baldeo = bano?.tareas.find((t) => t.nombre.toLowerCase().includes("baldear"));
      if (!baldeo) setRespuesta("No encontré la tarea de baldeo en Baño.");
      else setRespuesta(tareaVenceHoy(baldeo) ? "Sí, hoy toca baldear el baño." : "No, hoy no toca baldear el baño (ya se hizo recientemente).");
    } else if (tipo === "reporte") {
      setRespuesta(`Reporte de hoy: ${hechasHoy}/${totalHoy} tareas (${progresoHoy}%). Andá a la pestaña Historial al finalizar la jornada para el reporte completo.`);
    } else if (tipo === "insumos") {
      setRespuesta(alertasInventario.length ? `Insumos bajos:\n${alertasInventario.map((p) => `- ${p.nombre}: ${p.stock} ${p.unidad}`).join("\n")}` : "Todos los insumos están dentro del nivel mínimo.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Tarjeta tema={tema} style={{ background: `linear-gradient(135deg, ${tema.acento}, ${tema.acento}CC)`, color: "#fff", border: "none" }}>
        <div style={{ fontFamily: FUENTE_DISPLAY, fontSize: 13, opacity: .85, letterSpacing: .3 }}>JORNADA DE HOY</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, margin: "6px 0 10px" }}>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 40, fontWeight: 600, lineHeight: 1 }}>{progresoHoy}%</div>
          <div style={{ fontSize: 13, opacity: .9, marginBottom: 6 }}>{hechasHoy} de {totalHoy} tareas completadas</div>
        </div>
        <BarraProgreso pct={progresoHoy} color="#fff" fondo="rgba(255,255,255,.28)" alto={7} />
        <div style={{ marginTop: 14 }}>
          {!sesion ? (
            <button onClick={onIniciar} className="btn-anim" style={{ background: "#fff", color: tema.acento, border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Play size={15} /> Iniciar jornada
            </button>
          ) : (
            <button onClick={onIrChecklist} className="btn-anim" style={{ background: "#fff", color: tema.acento, border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <ChevronRight size={15} /> Continuar checklist
            </button>
          )}
        </div>
      </Tarjeta>

      {rutaRecomendada.length > 0 && (
        <Tarjeta tema={tema}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>
            <Route size={16} color={tema.acento} /> Ruta recomendada de hoy
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rutaRecomendada.map((r, i) => (
              <div key={r.area.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ width: 20, height: 20, borderRadius: 99, background: tema.acentoSuave, color: tema.acento, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: r.area.color, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{r.area.nombre}</span>
                <span style={{ color: tema.textoSuave, fontSize: 11.5 }}>{r.pendientes} pend.{r.altas > 0 ? ` · ${r.altas} alta` : ""}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: tema.textoSuave, marginTop: 10 }}>Orden sugerido según prioridad y cantidad de tareas pendientes. Podés limpiar en el orden que prefieras.</div>
        </Tarjeta>
      )}

      <Tarjeta tema={tema}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>
          <Bot size={16} color={tema.acento} /> Asistente rápido
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: respuesta ? 10 : 0 }}>
          <button onClick={() => preguntar("falta")} className="btn-anim" style={estiloChip(tema)}>¿Qué me falta?</button>
          <button onClick={() => preguntar("bano")} className="btn-anim" style={estiloChip(tema)}>¿Hoy toca baldear el baño?</button>
          <button onClick={() => preguntar("insumos")} className="btn-anim" style={estiloChip(tema)}>¿Qué insumos faltan?</button>
          <button onClick={() => preguntar("reporte")} className="btn-anim" style={estiloChip(tema)}>Resumen del día</button>
        </div>
        {respuesta && (
          <div style={{ background: tema.superficieAlt, borderRadius: 10, padding: 10, fontSize: 12.5, whiteSpace: "pre-line" }}>{respuesta}</div>
        )}
        <div style={{ fontSize: 10, color: tema.textoSuave, marginTop: 8 }}>Responde al instante con tus propios datos, sin conexión a internet.</div>
      </Tarjeta>

      {alertasInventario.length > 0 && (
        <Tarjeta tema={tema} style={{ borderColor: "#DC454540" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#DC4545", fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>
            <AlertTriangle size={16} /> Insumos bajos
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {alertasInventario.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                <span>{p.nombre}</span>
                <span style={{ color: tema.textoSuave }}>{p.stock} {p.unidad} (mín. {p.minimo})</span>
              </div>
            ))}
          </div>
        </Tarjeta>
      )}

      <div>
        <div style={{ fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 14.5, marginBottom: 10 }}>Áreas</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {areas.map((a) => {
            const total = a.tareas.filter((t) => tareaVenceHoy(t) || tareaHechaHoy(t)).length;
            const hechas = a.tareas.filter(tareaHechaHoy).length;
            return (
              <Tarjeta key={a.id} tema={tema} style={{ padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: a.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{a.nombre}</span>
                </div>
                <div style={{ fontSize: 11.5, color: tema.textoSuave, marginBottom: 6 }}>{hechas}/{total} hoy</div>
                <BarraProgreso pct={total ? (hechas / total) * 100 : 0} color={a.color} fondo={tema.superficieAlt} alto={6} />
              </Tarjeta>
            );
          })}
        </div>
      </div>

      {ultima && (
        <Tarjeta tema={tema}>
          <div style={{ fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>Última jornada</div>
          <div style={{ fontSize: 13, color: tema.textoSuave }}>
            {ultima.fecha} · {ultima.completadas}/{ultima.totalTareas} tareas · {formatDuracion(ultima.tiempoTotal)} de trabajo
          </div>
        </Tarjeta>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Vista: Checklist                                                       */
/* ---------------------------------------------------------------------- */

function VistaChecklist({ tema, areas, sesion, areaActiva, setAreaActiva, marcarTarea, desmarcarTarea, cronometro, iniciarCronometro, pausarCronometro, tiempoActual, onIniciar, onFinalizar, mostrarToast }) {
  if (!sesion) {
    return (
      <Tarjeta tema={tema} style={{ textAlign: "center", padding: 32 }}>
        <ClipboardList size={30} color={tema.textoSuave} style={{ marginBottom: 10 }} />
        <div style={{ fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Ninguna jornada activa</div>
        <div style={{ fontSize: 13.5, color: tema.textoSuave, marginBottom: 16 }}>Iniciá la jornada para ver el checklist de hoy.</div>
        <button onClick={onIniciar} className="btn-anim" style={{ background: tema.acento, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}>Iniciar jornada</button>
      </Tarjeta>
    );
  }

  const area = areaActiva ? areas.find((a) => a.id === areaActiva) : null;

  if (!area) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {areas.map((a) => {
          const tareasHoy = a.tareas.filter((t) => tareaVenceHoy(t) || tareaHechaHoy(t));
          const hechas = tareasHoy.filter(tareaHechaHoy).length;
          if (tareasHoy.length === 0) return null;
          const completo = hechas === tareasHoy.length;
          return (
            <button key={a.id} onClick={() => setAreaActiva(a.id)} className="btn-anim tarjeta tarjeta-clic" style={{ textAlign: "left", background: tema.superficie, border: `1px solid ${tema.borde}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: a.color }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: tema.texto }}>{a.nombre}</div>
                  <div style={{ fontSize: 12, color: tema.textoSuave }}>{hechas}/{tareasHoy.length} tareas</div>
                </div>
              </div>
              {completo ? <Check size={18} color="#2E9E5B" /> : <ChevronRight size={18} color={tema.textoSuave} />}
            </button>
          );
        })}

        <button onClick={onFinalizar} className="btn-anim" style={{ marginTop: 10, background: tema.texto, color: tema.fondo, border: "none", borderRadius: 12, padding: "13px 16px", fontWeight: 700, cursor: "pointer" }}>
          Finalizar jornada y generar reporte
        </button>
      </div>
    );
  }

  const tareasHoy = area.tareas.filter((t) => tareaVenceHoy(t) || tareaHechaHoy(t));

  return (
    <div>
      <button onClick={() => setAreaActiva(null)} style={{ background: "none", border: "none", color: tema.textoSuave, fontSize: 13, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Todas las áreas</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 11, height: 11, borderRadius: 99, background: area.color }} />
        <div style={{ fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 18 }}>{area.nombre}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tareasHoy.map((t) => {
          const hecha = tareaHechaHoy(t);
          const enMarcha = cronometro.tareaId === t.id;
          const seg = tiempoActual(t.id);
          return (
            <div key={t.id} style={{ background: tema.superficie, border: `1px solid ${hecha ? "#2E9E5B55" : tema.borde}`, borderRadius: 13, padding: 13 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <button
                    onClick={() => hecha ? desmarcarTarea(area.id, t.id) : marcarTarea(area.id, t.id)}
                    style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${hecha ? "#2E9E5B" : tema.borde}`, background: hecha ? "#2E9E5B" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginTop: 1, flexShrink: 0 }}
                  >
                    {hecha && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, textDecoration: hecha ? "line-through" : "none", color: hecha ? tema.textoSuave : tema.texto }}>{t.nombre}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                      <span style={{ fontSize: 10.5, color: PRIORIDADES[t.prioridad].color, fontWeight: 700, textTransform: "uppercase", letterSpacing: .3 }}>{PRIORIDADES[t.prioridad].label}</span>
                      <span style={{ fontSize: 11, color: tema.textoSuave }}>{FRECUENCIAS[t.frecuencia].label}</span>
                    </div>
                    {t.notas && <div style={{ fontSize: 11.5, color: tema.textoSuave, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><StickyNote size={11} /> {t.notas}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {seg > 0 && <span style={{ fontFamily: FUENTE_MONO, fontSize: 12, color: tema.textoSuave }}>{formatDuracion(seg)}</span>}
                  <button onClick={() => (enMarcha ? pausarCronometro() : iniciarCronometro(t.id))} className="btn-anim" style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${tema.borde}`, background: enMarcha ? "#DC454518" : tema.superficieAlt, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: enMarcha ? "#DC4545" : tema.texto }}>
                    {enMarcha ? <Pause size={14} /> : <Clock size={14} />}
                  </button>
                </div>
              </div>
              {!hecha && (
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <input
                    placeholder="Agregar nota (opcional)…"
                    defaultValue={t.notas}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
                    onChange={(e) => { t._pendingNota = e.target.value; }}
                    style={{ flex: 1, fontSize: 12.5, border: `1px solid ${tema.borde}`, borderRadius: 8, padding: "7px 9px", background: tema.fondo, color: tema.texto }}
                  />
                  <button
                    onClick={() => { marcarTarea(area.id, t.id, t._pendingNota ?? t.notas); mostrarToast("Tarea completada"); }}
                    style={{ background: tema.acento, color: "#fff", border: "none", borderRadius: 8, padding: "0 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Completar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Vista: Calendario                                                      */
/* ---------------------------------------------------------------------- */

function VistaCalendario({ tema, areas }) {
  const hoyIdx = new Date().getDay();
  return (
    <div>
      <div style={{ fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Plan semanal</div>
      <div style={{ fontSize: 13, color: tema.textoSuave, marginBottom: 16 }}>Lunes a sábado · frecuencias configuradas por tarea</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DIAS_LABORALES.map((diaIdx) => {
          const esHoy = diaIdx === hoyIdx;
          const tareasDelDia = areas.flatMap((a) =>
            a.tareas
              .filter((t) => t.frecuencia === "diaria" || (t.frecuencia === "alterna" && diaIdx % 2 === 0) || t.frecuencia === "semanal" && diaIdx === 1)
              .map((t) => ({ ...t, area: a.nombre, color: a.color }))
          );
          return (
            <Tarjeta key={diaIdx} tema={tema} style={{ borderColor: esHoy ? tema.acento : tema.borde, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: esHoy ? tema.acento : tema.texto }}>{DIAS[diaIdx]} {esHoy && "· hoy"}</div>
                <div style={{ fontSize: 11.5, color: tema.textoSuave }}>{tareasDelDia.length} tareas</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tareasDelDia.slice(0, 10).map((t, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 99, background: tema.superficieAlt, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: t.color }} /> {t.nombre}
                  </span>
                ))}
                {tareasDelDia.length > 10 && <span style={{ fontSize: 11, color: tema.textoSuave }}>+{tareasDelDia.length - 10} más</span>}
              </div>
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Vista: Inventario                                                      */
/* ---------------------------------------------------------------------- */

function VistaInventario({ tema, inventario, setInventario, ajustarStock, editarProducto }) {
  const [nombre, setNombre] = useState("");
  const [minimo, setMinimo] = useState(2);
  const [unidad, setUnidad] = useState("unidades");
  const [categoria, setCategoria] = useState(CATEGORIAS_INVENTARIO[0]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [orden, setOrden] = useState("bajo");
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarPedido, setMostrarPedido] = useState(false);
  const [copiado, setCopiado] = useState(false);

  function manejarCambioNombre(valor) {
    setNombre(valor);
    const coincidencia = inventario.find((p) => p.nombre.toLowerCase() === valor.toLowerCase());
    if (coincidencia) {
      setUnidad(coincidencia.unidad);
      setCategoria(coincidencia.categoria || CATEGORIAS_INVENTARIO[0]);
    }
  }

  function agregar() {
    if (!nombre.trim()) return;
    setInventario((prev) => [...prev, { id: uid("p"), nombre, stock: 0, minimo: Number(minimo) || 1, unidad, categoria, sku: "", proveedor: "", costo: 0, ultimaReposicion: null }]);
    setNombre(""); setMinimo(2); setUnidad("unidades");
  }

  const bajos = inventario.filter((p) => p.stock <= p.minimo);
  const valorTotal = inventario.reduce((s, p) => s + (p.costo || 0) * p.stock, 0);

  let lista = inventario.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.sku || "").includes(busqueda));
  if (filtroCategoria !== "Todas") lista = lista.filter((p) => p.categoria === filtroCategoria);
  lista = [...lista].sort((a, b) => {
    if (orden === "bajo") return (a.stock - a.minimo) - (b.stock - b.minimo);
    if (orden === "az") return a.nombre.localeCompare(b.nombre);
    if (orden === "categoria") return (a.categoria || "").localeCompare(b.categoria || "");
    return 0;
  });

  const textoPedido = () => {
    const fecha = new Date().toLocaleDateString("es-PA");
    const lineas = bajos.map((p) => {
      const sugerido = Math.max(p.minimo * 2 - p.stock, p.minimo - p.stock, 1);
      return `- ${p.nombre}${p.sku ? ` (SKU ${p.sku})` : ""}: ${sugerido} ${p.unidad}`;
    });
    return `PEDIDO SUGERIDO — Aloha Limpieza — ${fecha}\nProveedor: ${PROVEEDOR_DEFAULT.nombre}\nCorreo: ${PROVEEDOR_DEFAULT.correo}\n\n${lineas.join("\n")}`;
  };

  async function copiarPedido() {
    try {
      await navigator.clipboard.writeText(textoPedido());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) { /* clipboard no disponible */ }
  }

  return (
    <div>
      <div style={{ fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Inventario de insumos</div>
      <div style={{ fontSize: 12.5, color: tema.textoSuave, marginBottom: 14 }}>{inventario.length} productos · proveedor principal DGP Xpress</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Tarjeta tema={tema} style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: tema.textoSuave }}>Insumos bajos</div>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 22, fontWeight: 700, color: bajos.length ? "#DC4545" : tema.texto }}>{bajos.length}</div>
        </Tarjeta>
        <Tarjeta tema={tema} style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: tema.textoSuave }}>Valor en stock</div>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 22, fontWeight: 700 }}>${valorTotal.toFixed(2)}</div>
        </Tarjeta>
      </div>

      {bajos.length > 0 && (
        <Tarjeta tema={tema} style={{ borderColor: "#DC454550", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setMostrarPedido((v) => !v)}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#DC4545", fontWeight: 700, fontSize: 13.5 }}>
              <AlertTriangle size={15} /> Pedido sugerido ({bajos.length})
            </div>
            <ChevronRight size={16} color={tema.textoSuave} style={{ transform: mostrarPedido ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
          </div>
          {mostrarPedido && (
            <div style={{ marginTop: 10 }}>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: FUENTE_MONO, fontSize: 11.5, background: tema.superficieAlt, borderRadius: 10, padding: 12, margin: 0, color: tema.texto }}>{textoPedido()}</pre>
              <button onClick={copiarPedido} className="btn-anim" style={{ marginTop: 8, background: tema.acento, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                {copiado ? "¡Copiado!" : "Copiar pedido"}
              </button>
            </div>
          )}
        </Tarjeta>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o SKU…" style={estiloInput(tema, 200)} />
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={estiloInput(tema, 130)}>
          <option>Todas</option>
          {CATEGORIAS_INVENTARIO.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value)} style={estiloInput(tema, 150)}>
          <option value="bajo">Ordenar: stock más bajo</option>
          <option value="az">Ordenar: A–Z</option>
          <option value="categoria">Ordenar: categoría</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {lista.map((p) => {
          const bajo = p.stock <= p.minimo;
          const editando = editandoId === p.id;
          return (
            <Tarjeta key={p.id} tema={tema} style={{ padding: 12, borderColor: bajo ? "#DC454550" : tema.borde }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {p.nombre} {bajo && <AlertTriangle size={13} color="#DC4545" />}
                    <span style={{ fontSize: 10, fontWeight: 500, color: tema.textoSuave, background: tema.superficieAlt, borderRadius: 99, padding: "1px 7px" }}>{p.categoria}</span>
                  </div>
                  <div style={{ fontSize: 11, color: tema.textoSuave, marginTop: 2 }}>
                    {p.sku && `SKU ${p.sku} · `}Mín. {p.minimo} {p.unidad}{p.costo ? ` · $${p.costo.toFixed(2)} c/u` : ""}
                  </div>
                  {p.ultimaReposicion && <div style={{ fontSize: 10.5, color: tema.textoSuave, marginTop: 1 }}>Última reposición: {p.ultimaReposicion}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => ajustarStock(p.id, -1)} className="btn-anim" style={estiloBotonMini(tema)}>−</button>
                  <span style={{ fontFamily: FUENTE_MONO, fontWeight: 600, minWidth: 30, textAlign: "center", color: bajo ? "#DC4545" : tema.texto }}>{p.stock}</span>
                  <button onClick={() => ajustarStock(p.id, 1)} className="btn-anim" style={estiloBotonMini(tema)}>+</button>
                  <button onClick={() => setEditandoId(editando ? null : p.id)} className="btn-anim" style={estiloBotonMini(tema)}><SettingsIcon size={12} /></button>
                  <button onClick={() => setInventario((prev) => prev.filter((x) => x.id !== p.id))} className="btn-anim" style={{ ...estiloBotonMini(tema), color: "#DC4545" }}><Trash2 size={13} /></button>
                </div>
              </div>

              {editando && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${tema.borde}` }}>
                  <input defaultValue={p.sku} placeholder="SKU" onBlur={(e) => editarProducto(p.id, { sku: e.target.value })} style={estiloInput(tema, 100)} />
                  <input defaultValue={p.minimo} type="number" placeholder="Mínimo" onBlur={(e) => editarProducto(p.id, { minimo: Number(e.target.value) || 0 })} style={estiloInput(tema, 70)} />
                  <input defaultValue={p.unidad} placeholder="Unidad" onBlur={(e) => editarProducto(p.id, { unidad: e.target.value })} style={estiloInput(tema, 90)} />
                  <input defaultValue={p.costo} type="number" step="0.01" placeholder="Costo unit." onBlur={(e) => editarProducto(p.id, { costo: Number(e.target.value) || 0 })} style={estiloInput(tema, 90)} />
                  <select defaultValue={p.categoria} onBlur={(e) => editarProducto(p.id, { categoria: e.target.value })} onChange={(e) => editarProducto(p.id, { categoria: e.target.value })} style={estiloInput(tema, 120)}>
                    {CATEGORIAS_INVENTARIO.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input defaultValue={p.proveedor} placeholder="Proveedor" onBlur={(e) => editarProducto(p.id, { proveedor: e.target.value })} style={estiloInput(tema, 130)} />
                </div>
              )}
            </Tarjeta>
          );
        })}
        {lista.length === 0 && <div style={{ fontSize: 13, color: tema.textoSuave, textAlign: "center", padding: 20 }}>No se encontraron productos.</div>}
      </div>

      <Tarjeta tema={tema}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Agregar producto</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={nombre}
            onChange={(e) => manejarCambioNombre(e.target.value)}
            placeholder="Nombre"
            list="sugerencias-insumos"
            autoComplete="off"
            style={estiloInput(tema, 150)}
          />
          <datalist id="sugerencias-insumos">
            {[...new Set([...inventario.map((p) => p.nombre), ...SUGERENCIAS_INSUMOS_COMUNES])].map((n) => <option key={n} value={n} />)}
          </datalist>
          <input type="number" value={minimo} onChange={(e) => setMinimo(e.target.value)} placeholder="Mínimo" style={estiloInput(tema, 70)} />
          <input value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="Unidad" style={estiloInput(tema, 90)} />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={estiloInput(tema, 120)}>
            {CATEGORIAS_INVENTARIO.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={agregar} className="btn-anim" style={{ background: tema.acento, color: "#fff", border: "none", borderRadius: 8, padding: "0 14px", fontWeight: 700, cursor: "pointer" }}>Agregar</button>
        </div>
      </Tarjeta>
    </div>
  );
}

function estiloChip(tema) {
  return { border: `1px solid ${tema.borde}`, background: tema.superficieAlt, color: tema.texto, borderRadius: 99, padding: "6px 12px", fontSize: 12, cursor: "pointer" };
}
function estiloBotonMini(tema) {
  return { width: 26, height: 26, borderRadius: 7, border: `1px solid ${tema.borde}`, background: tema.superficieAlt, color: tema.texto, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 };
}
function estiloInput(tema, width) {
  return { width, fontSize: 13, border: `1px solid ${tema.borde}`, borderRadius: 8, padding: "8px 10px", background: tema.fondo, color: tema.texto };
}

/* ---------------------------------------------------------------------- */
/* Vista: Estadísticas                                                    */
/* ---------------------------------------------------------------------- */

function VistaEstadisticas({ tema, historial, areas }) {
  const ultimos = [...historial].slice(0, 14).reverse();
  const dataCumplimiento = ultimos.map((h) => ({ fecha: h.fecha.slice(5), pct: h.totalTareas ? Math.round((h.completadas / h.totalTareas) * 100) : 0 }));
  const dataTiempo = ultimos.map((h) => ({ fecha: h.fecha.slice(5), min: Math.round(h.tiempoTotal / 60) }));

  const tiempoPorArea = {};
  historial.forEach((h) => h.porArea.forEach((pa) => { tiempoPorArea[pa.area] = (tiempoPorArea[pa.area] || 0) + pa.tiempo; }));
  const dataAreas = Object.entries(tiempoPorArea).map(([area, seg]) => ({ area, min: Math.round(seg / 60) }));

  const promedioCumplimiento = historial.length ? Math.round(historial.reduce((s, h) => s + (h.totalTareas ? h.completadas / h.totalTareas : 0), 0) / historial.length * 100) : 0;
  const promedioTiempo = historial.length ? Math.round(historial.reduce((s, h) => s + h.tiempoTotal, 0) / historial.length) : 0;

  if (historial.length === 0) {
    return (
      <Tarjeta tema={tema} style={{ textAlign: "center", padding: 32 }}>
        <BarChart3 size={28} color={tema.textoSuave} style={{ marginBottom: 8 }} />
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Todavía no hay datos</div>
        <div style={{ fontSize: 13, color: tema.textoSuave }}>Finalizá tu primera jornada para ver estadísticas.</div>
      </Tarjeta>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Tarjeta tema={tema}>
          <div style={{ fontSize: 11.5, color: tema.textoSuave, marginBottom: 4 }}>Cumplimiento promedio</div>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 26, fontWeight: 700, color: tema.acento }}>{promedioCumplimiento}%</div>
        </Tarjeta>
        <Tarjeta tema={tema}>
          <div style={{ fontSize: 11.5, color: tema.textoSuave, marginBottom: 4 }}>Tiempo promedio</div>
          <div style={{ fontFamily: FUENTE_MONO, fontSize: 26, fontWeight: 700 }}>{formatDuracion(promedioTiempo)}</div>
        </Tarjeta>
      </div>

      <Tarjeta tema={tema}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Cumplimiento por jornada (%)</div>
        <GraficoLinea datos={dataCumplimiento} valueKey="pct" color={tema.acento} max={100} alto={140} />
      </Tarjeta>

      <Tarjeta tema={tema}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Tiempo trabajado por jornada (min)</div>
        <GraficoBarrasVert datos={dataTiempo} valueKey="min" labelKey="fecha" color={tema.acento} tema={tema} alto={140} />
      </Tarjeta>

      <Tarjeta tema={tema}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Tiempo acumulado por área (min)</div>
        <GraficoBarrasHoriz datos={dataAreas} valueKey="min" labelKey="area" color={tema.acento} tema={tema} />
      </Tarjeta>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Vista: Historial                                                       */
/* ---------------------------------------------------------------------- */

function VistaHistorial({ tema, historial }) {
  if (historial.length === 0) {
    return (
      <Tarjeta tema={tema} style={{ textAlign: "center", padding: 32 }}>
        <HistoryIcon size={28} color={tema.textoSuave} style={{ marginBottom: 8 }} />
        <div style={{ fontWeight: 700 }}>Sin jornadas registradas todavía</div>
      </Tarjeta>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {historial.map((h) => {
        const pct = h.totalTareas ? Math.round((h.completadas / h.totalTareas) * 100) : 0;
        return (
          <Tarjeta key={h.id} tema={tema}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{h.fecha}</div>
              <div style={{ fontSize: 12.5, color: tema.textoSuave, fontFamily: FUENTE_MONO }}>{formatDuracion(h.tiempoTotal)}</div>
            </div>
            <BarraProgreso pct={pct} color={tema.acento} fondo={tema.superficieAlt} />
            <div style={{ fontSize: 12, color: tema.textoSuave, marginTop: 6 }}>{h.completadas}/{h.totalTareas} tareas · {pct}% cumplimiento</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {h.porArea.map((pa, i) => (
                <span key={i} style={{ fontSize: 10.5, padding: "3px 7px", borderRadius: 99, background: tema.superficieAlt, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: pa.color }} /> {pa.area} {pa.completadas}/{pa.total}
                </span>
              ))}
            </div>
          </Tarjeta>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Vista: Configuración                                                   */
/* ---------------------------------------------------------------------- */

function VistaConfig({ tema, areas, setAreas, agregarTarea, eliminarTarea }) {
  const [areaSel, setAreaSel] = useState(areas[0]?.id || null);
  const [nombre, setNombre] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [frecuencia, setFrecuencia] = useState("diaria");
  const area = areas.find((a) => a.id === areaSel);

  return (
    <div>
      <div style={{ fontFamily: FUENTE_DISPLAY, fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Áreas y tareas</div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {areas.map((a) => (
          <button key={a.id} onClick={() => setAreaSel(a.id)} className="btn-anim" style={{ border: `1px solid ${a.id === areaSel ? tema.acento : tema.borde}`, background: a.id === areaSel ? tema.acentoSuave : tema.superficie, color: tema.texto, borderRadius: 99, padding: "6px 12px", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: a.color }} /> {a.nombre}
          </button>
        ))}
      </div>

      {area && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {area.tareas.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: tema.superficie, border: `1px solid ${tema.borde}`, borderRadius: 10, padding: "9px 12px" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.nombre}</div>
                  <div style={{ fontSize: 11, color: tema.textoSuave }}>{PRIORIDADES[t.prioridad].label} · {FRECUENCIAS[t.frecuencia].label}</div>
                </div>
                <button onClick={() => eliminarTarea(area.id, t.id)} className="btn-anim" style={{ background: "none", border: "none", cursor: "pointer", color: "#DC4545" }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>

          <Tarjeta tema={tema}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Nueva tarea en {area.nombre}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la tarea" style={estiloInput(tema, 160)} />
              <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} style={estiloInput(tema, 100)}>
                {Object.entries(PRIORIDADES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} style={estiloInput(tema, 140)}>
                {Object.entries(FRECUENCIAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={() => { agregarTarea(area.id, nombre, prioridad, frecuencia); setNombre(""); }} className="btn-anim" style={{ background: tema.acento, color: "#fff", border: "none", borderRadius: 8, padding: "0 14px", fontWeight: 700, cursor: "pointer" }}>
                <Plus size={14} />
              </button>
            </div>
          </Tarjeta>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Montaje de la aplicación                                               */
/* ---------------------------------------------------------------------- */
const raiz = ReactDOM.createRoot(document.getElementById("root"));
raiz.render(<App />);
