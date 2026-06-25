import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db, schema } from "./db/client";

const SECRET = process.env.JWT_SECRET || "printia-demo-secret-change-in-prod";
const PORT = Number(process.env.PORT || 8787);

const ACCESO: Record<string, string[]> = {
  admin: ["resumen", "cotizador", "cotizaciones", "produccion", "planificacion", "despacho", "clientes", "inventario", "finanzas", "contabilidad", "pagos", "proveedores", "indicadores", "config"],
  vendedor: ["resumen", "cotizador", "cotizaciones", "clientes"],
  produccion: ["resumen", "produccion", "planificacion", "despacho", "inventario", "indicadores"],
  finanzas: ["resumen", "finanzas", "contabilidad", "pagos", "proveedores", "clientes", "cotizaciones", "indicadores"],
};

const app = new Hono();
app.use("*", cors());

const uid = () => crypto.randomUUID();

type Claims = { uid: string; empresaId: string; rol: string };

// --- Auth middleware ---
async function auth(c: any, next: any) {
  const h = c.req.header("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return c.json({ error: "No autorizado" }, 401);
  try {
    const p = (await verify(token, SECRET, "HS256")) as unknown as Claims;
    c.set("claims", p);
    await next();
  } catch {
    return c.json({ error: "Token invalido" }, 401);
  }
}

// Single-tenant: la empresa siempre es la del usuario logueado.
function empresaDe(c: any): string {
  const claims = c.get("claims") as Claims;
  return claims.empresaId;
}

// Numero correlativo simple basado en la cantidad existente.
async function nextNumero(table: any, eid: string, fmt: (n: number) => string) {
  const rows = await db.select().from(table).where(eq(table.empresaId, eid));
  return fmt(rows.length);
}

app.get("/", (c) => c.json({ ok: true, service: "printia-api" }));

// --- Login ---
app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  const [u] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, String(email || "").toLowerCase()));
  if (!u || !bcrypt.compareSync(String(password || ""), u.passwordHash)) {
    return c.json({ error: "Credenciales invalidas" }, 401);
  }
  const token = await sign({ uid: u.id, empresaId: u.empresaId, rol: u.rol } as Claims, SECRET, "HS256");
  const { passwordHash, ...usuario } = u;
  return c.json({ token, usuario, acceso: ACCESO[u.rol] });
});

// Login rapido por id (solo demo, para el selector de usuarios)
app.post("/api/auth/demo-login", async (c) => {
  const { usuarioId } = await c.req.json();
  const [u] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, String(usuarioId)));
  if (!u) return c.json({ error: "Usuario no existe" }, 404);
  const token = await sign({ uid: u.id, empresaId: u.empresaId, rol: u.rol } as Claims, SECRET, "HS256");
  const { passwordHash, ...usuario } = u;
  return c.json({ token, usuario, acceso: ACCESO[u.rol] });
});

// Lista publica para el selector del login (sin secretos)
app.get("/api/login-options", async (c) => {
  const rows = (await db.select().from(schema.usuarios)).map((u) => ({
    id: u.id, nombre: u.nombre, cargo: u.cargo, rol: u.rol, iniciales: u.iniciales, color: u.color, email: u.email,
  }));
  return c.json(rows);
});

app.get("/api/usuarios", auth, async (c) => {
  const rows = (await db.select().from(schema.usuarios)).map(({ passwordHash, ...r }) => r);
  return c.json(rows);
});

app.get("/api/empresas", auth, async (c) => {
  return c.json(await db.select().from(schema.empresas));
});

app.get("/api/me", auth, async (c) => {
  const claims = c.get("claims") as Claims;
  const [u] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, claims.uid));
  if (!u) return c.json({ error: "no encontrado" }, 404);
  const { passwordHash, ...usuario } = u;
  return c.json({ usuario, acceso: ACCESO[u.rol] });
});

// --- Bootstrap: toda la data de la empresa actual en una llamada ---
app.get("/api/bootstrap", auth, async (c) => {
  const eid = empresaDe(c);
  // Secuencial a proposito: PGlite (dev) usa una sola conexion y no admite
  // consultas concurrentes. En Postgres (prod) tambien funciona bien.
  const byEmp = (t: any) => db.select().from(t).where(eq(t.empresaId, eid));
  const clientes = await byEmp(schema.clientes);
  const materiales = await byEmp(schema.materiales);
  const maquinas = await byEmp(schema.maquinas);
  const productos = await byEmp(schema.productos);
  const cotizaciones = await byEmp(schema.cotizaciones);
  const ots = await byEmp(schema.ots);
  const documentos = await byEmp(schema.documentos);
  const cobros = await byEmp(schema.cobros);
  const encuestas = await byEmp(schema.encuestas);
  const proveedores = await byEmp(schema.proveedores);
  const cuentasBancarias = await byEmp(schema.cuentasBancarias);
  const pagos = await byEmp(schema.pagos);
  const asientos = await byEmp(schema.asientos);
  const eerr = await byEmp(schema.eerrLineas);
  const balance = await byEmp(schema.balanceLineas);
  const finanzasArr = await byEmp(schema.finanzasResumen);
  const empresas = await db.select().from(schema.empresas);
  const usuarios = await db.select().from(schema.usuarios);
  return c.json({
    empresaId: eid, empresas,
    usuarios: usuarios.map(({ passwordHash, ...u }) => u),
    clientes, materiales, maquinas, productos, cotizaciones, ots, documentos, cobros, encuestas,
    proveedores, cuentasBancarias, pagos, asientos, eerr, balance,
    finanzas: finanzasArr[0] ?? null,
  });
});

// --- Cotizaciones ---
app.post("/api/cotizaciones", auth, async (c) => {
  const b = await c.req.json();
  const eid = empresaDe(c);
  const numero = await nextNumero(schema.cotizaciones, eid, (n) => `COT-2026-${String(425 + n).padStart(4, "0")}`);
  const row = { ...b, id: uid(), empresaId: eid, numero };
  await db.insert(schema.cotizaciones).values(row);
  return c.json(row, 201);
});
app.patch("/api/cotizaciones/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  await db.update(schema.cotizaciones).set(patch).where(eq(schema.cotizaciones.id, id));
  const [row] = await db.select().from(schema.cotizaciones).where(eq(schema.cotizaciones.id, id));
  return c.json(row);
});

// --- OT ---
app.post("/api/ots", auth, async (c) => {
  const b = await c.req.json();
  const eid = empresaDe(c);
  const numero = await nextNumero(schema.ots, eid, (n) => `OT-${3400 + n}`);
  const row = { ...b, id: uid(), empresaId: eid, numero };
  await db.insert(schema.ots).values(row);
  return c.json(row, 201);
});
app.patch("/api/ots/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  await db.update(schema.ots).set(patch).where(eq(schema.ots.id, id));
  const [row] = await db.select().from(schema.ots).where(eq(schema.ots.id, id));
  return c.json(row);
});

// --- Clientes ---
app.post("/api/clientes", auth, async (c) => {
  const b = await c.req.json();
  const row = { id: uid(), empresaId: empresaDe(c), ...b };
  await db.insert(schema.clientes).values(row);
  return c.json(row, 201);
});

// --- Inventario: ajuste de stock (OC) ---
app.patch("/api/materiales/:id", auth, async (c) => {
  const id = c.req.param("id");
  const { delta } = await c.req.json();
  const [m] = await db.select().from(schema.materiales).where(eq(schema.materiales.id, id));
  if (!m) return c.json({ error: "no existe" }, 404);
  await db.update(schema.materiales).set({ stock: m.stock + Number(delta || 0) }).where(eq(schema.materiales.id, id));
  const [row] = await db.select().from(schema.materiales).where(eq(schema.materiales.id, id));
  return c.json(row);
});

// --- Documentos DTE ---
app.post("/api/documentos", auth, async (c) => {
  const b = await c.req.json();
  const eid = empresaDe(c);
  const folio = b.folio || (await nextNumero(schema.documentos, eid, (n) => `Factura ${12895 + n}`));
  const row = { ...b, id: uid(), empresaId: eid, folio };
  await db.insert(schema.documentos).values(row);
  return c.json(row, 201);
});
app.patch("/api/documentos/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  await db.update(schema.documentos).set(patch).where(eq(schema.documentos.id, id));
  const [row] = await db.select().from(schema.documentos).where(eq(schema.documentos.id, id));
  return c.json(row);
});

// --- Pagos ---
app.post("/api/pagos", auth, async (c) => {
  const b = await c.req.json();
  const row = { ...b, id: uid(), empresaId: empresaDe(c) };
  await db.insert(schema.pagos).values(row);
  return c.json(row, 201);
});
app.patch("/api/pagos/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  await db.update(schema.pagos).set(patch).where(eq(schema.pagos.id, id));
  const [row] = await db.select().from(schema.pagos).where(eq(schema.pagos.id, id));
  return c.json(row);
});

// --- Cobros ---
app.patch("/api/cobros/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  await db.update(schema.cobros).set(patch).where(eq(schema.cobros.id, id));
  const [row] = await db.select().from(schema.cobros).where(eq(schema.cobros.id, id));
  return c.json(row);
});

// --- Proveedores ---
app.post("/api/proveedores", auth, async (c) => {
  const b = await c.req.json();
  const row = { ...b, id: uid(), empresaId: empresaDe(c) };
  await db.insert(schema.proveedores).values(row);
  return c.json(row, 201);
});

// --- Asientos (comprobantes) ---
app.post("/api/asientos", auth, async (c) => {
  const b = await c.req.json();
  const eid = empresaDe(c);
  const existing = await db.select().from(schema.asientos).where(eq(schema.asientos.empresaId, eid));
  const numero = 14400 + existing.length + 1;
  const row = { ...b, id: uid(), empresaId: eid, numero };
  await db.insert(schema.asientos).values(row);
  return c.json(row, 201);
});

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Printia API en http://localhost:${info.port}`);
});
