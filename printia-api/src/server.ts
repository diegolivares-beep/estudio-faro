import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { sign, verify } from "hono/jwt";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "./db/client";

const SECRET = process.env.JWT_SECRET || "printia-demo-secret-change-in-prod";
const PORT = Number(process.env.PORT || 8787);

// Modulos por rol (baseline). Los permisos granulares por usuario lo afinan.
const ACCESO: Record<string, string[]> = {
  admin: [
    "resumen", "cotizador", "cotizaciones", "consultas", "crm", "ecommerce", "clientes", "satisfaccion",
    "produccion", "tablero", "planificacion", "despacho", "inventario", "proveedores", "visto-bueno",
    "agenda", "tareas", "finanzas", "pagos", "contabilidad", "indicadores", "config",
  ],
  vendedor: ["resumen", "cotizador", "cotizaciones", "consultas", "crm", "ecommerce", "clientes", "satisfaccion", "agenda", "tareas"],
  produccion: ["resumen", "produccion", "tablero", "planificacion", "despacho", "inventario", "proveedores", "visto-bueno", "agenda", "tareas", "indicadores"],
  finanzas: ["resumen", "finanzas", "pagos", "contabilidad", "proveedores", "clientes", "cotizaciones", "indicadores"],
};

// Acceso efectivo = baseline del rol + overrides de permisos granulares.
function accesoDe(u: any): string[] {
  const base = ACCESO[u.rol] || ["resumen"];
  const p = (u.permisos || {}) as Record<string, string>;
  if (!p || Object.keys(p).length === 0) return base;
  const set = new Set(base);
  for (const [mod, lvl] of Object.entries(p)) {
    if (lvl === "inactivo") set.delete(mod);
    else set.add(mod);
  }
  set.add("resumen");
  return [...set];
}

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

function empresaDe(c: any): string {
  const claims = c.get("claims") as Claims;
  return claims.empresaId;
}

async function nextNumero(table: any, eid: string, fmt: (n: number) => string) {
  const rows = await db.select().from(table).where(eq(table.empresaId, eid));
  return fmt(rows.length);
}

// CRUD generico (POST/PATCH/DELETE) para colecciones simples por empresa.
function crud(path: string, table: any) {
  app.post(`/api/${path}`, auth, async (c) => {
    const b = await c.req.json();
    const row = { ...b, id: b.id || uid(), empresaId: empresaDe(c) };
    await db.insert(table).values(row);
    return c.json(row, 201);
  });
  app.patch(`/api/${path}/:id`, auth, async (c) => {
    const id = c.req.param("id");
    const patch = await c.req.json();
    await db.update(table).set(patch).where(eq(table.id, id));
    const [row] = await db.select().from(table).where(eq(table.id, id));
    return c.json(row);
  });
  app.delete(`/api/${path}/:id`, auth, async (c) => {
    const id = c.req.param("id");
    await db.delete(table).where(eq(table.id, id));
    return c.json({ ok: true });
  });
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
  return c.json({ token, usuario, acceso: accesoDe(u) });
});

app.post("/api/auth/demo-login", async (c) => {
  const { usuarioId } = await c.req.json();
  const [u] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, String(usuarioId)));
  if (!u) return c.json({ error: "Usuario no existe" }, 404);
  const token = await sign({ uid: u.id, empresaId: u.empresaId, rol: u.rol } as Claims, SECRET, "HS256");
  const { passwordHash, ...usuario } = u;
  return c.json({ token, usuario, acceso: accesoDe(u) });
});

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
  return c.json({ usuario, acceso: accesoDe(u) });
});

// --- Bootstrap: toda la data de la empresa actual en una llamada ---
app.get("/api/bootstrap", auth, async (c) => {
  const eid = empresaDe(c);
  // Secuencial: PGlite (dev) usa una conexion y no admite consultas concurrentes.
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
  const consultas = await byEmp(schema.consultas);
  const leads = await byEmp(schema.leads);
  const estadosProduccion = await byEmp(schema.estadosProduccion);
  const agendamientos = await byEmp(schema.agendamientos);
  const tareas = await byEmp(schema.tareas);
  const listasPrecios = await byEmp(schema.listasPrecios);
  const monedas = await byEmp(schema.monedas);
  const tokensApi = await byEmp(schema.tokensApi);
  const empresas = await db.select().from(schema.empresas);
  const usuarios = await db.select().from(schema.usuarios);
  return c.json({
    empresaId: eid, empresas,
    usuarios: usuarios.map(({ passwordHash, ...u }) => u),
    clientes, materiales, maquinas, productos, cotizaciones, ots, documentos, cobros, encuestas,
    proveedores, cuentasBancarias, pagos, asientos, eerr, balance,
    finanzas: finanzasArr[0] ?? null,
    consultas, leads, estadosProduccion, agendamientos, tareas, listasPrecios, monedas, tokensApi,
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

// --- Inventario: ajuste de stock ---
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

// --- Consultas (numero correlativo) ---
app.post("/api/consultas", auth, async (c) => {
  const b = await c.req.json();
  const eid = empresaDe(c);
  const numero = await nextNumero(schema.consultas, eid, (n) => `C-2026-${String(92 + n).padStart(4, "0")}`);
  const row = { ...b, id: uid(), empresaId: eid, numero };
  await db.insert(schema.consultas).values(row);
  return c.json(row, 201);
});
app.patch("/api/consultas/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  await db.update(schema.consultas).set(patch).where(eq(schema.consultas.id, id));
  const [row] = await db.select().from(schema.consultas).where(eq(schema.consultas.id, id));
  return c.json(row);
});

// --- Usuarios: permisos / estado ---
app.patch("/api/usuarios/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  delete patch.passwordHash;
  await db.update(schema.usuarios).set(patch).where(eq(schema.usuarios.id, id));
  const [u] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, id));
  const { passwordHash, ...usuario } = u;
  return c.json(usuario);
});

// --- Empresa: configuraciones ---
app.patch("/api/empresas/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  await db.update(schema.empresas).set(patch).where(eq(schema.empresas.id, id));
  const [row] = await db.select().from(schema.empresas).where(eq(schema.empresas.id, id));
  return c.json(row);
});

// --- Productos ---
app.post("/api/productos", auth, async (c) => {
  const b = await c.req.json();
  const row = { ...b, id: b.id || uid(), empresaId: empresaDe(c) };
  await db.insert(schema.productos).values(row);
  return c.json(row, 201);
});
app.patch("/api/productos/:id", auth, async (c) => {
  const id = c.req.param("id");
  const patch = await c.req.json();
  await db.update(schema.productos).set(patch).where(eq(schema.productos.id, id));
  const [row] = await db.select().from(schema.productos).where(eq(schema.productos.id, id));
  return c.json(row);
});

// --- Colecciones simples (CRUD generico) ---
crud("leads", schema.leads);
crud("agendamientos", schema.agendamientos);
crud("tareas", schema.tareas);
crud("estados-produccion", schema.estadosProduccion);
crud("listas-precios", schema.listasPrecios);
crud("monedas", schema.monedas);
crud("tokens-api", schema.tokensApi);
crud("encuestas", schema.encuestas);

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Printia API en http://localhost:${info.port}`);
});
