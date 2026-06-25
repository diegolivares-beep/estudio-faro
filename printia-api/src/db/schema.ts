import {
  pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb,
} from "drizzle-orm/pg-core";

// Multi-tenant: toda tabla operativa lleva empresa_id.

export const empresas = pgTable("empresas", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  razonSocial: text("razon_social").notNull(),
  rut: text("rut").notNull(),
  giro: text("giro").notNull(),
  direccion: text("direccion").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email").notNull(),
  web: text("web").notNull(),
  color: text("color").notNull(),
});

export const usuarios = pgTable("usuarios", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  cargo: text("cargo").notNull(),
  rol: text("rol").notNull(), // admin | vendedor | produccion | finanzas
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  iniciales: text("iniciales").notNull(),
  color: text("color").notNull(),
});

export const clientes = pgTable("clientes", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  rut: text("rut").notNull(),
  tipo: text("tipo").notNull(), // empresa | particular
  contacto: text("contacto").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  email: text("email").notNull().default(""),
  condicionPago: text("condicion_pago").notNull().default("Contado"),
  comprasAnio: integer("compras_anio").notNull().default(0),
  ultimaCompra: text("ultima_compra").notNull().default(""),
  vendedor: text("vendedor").notNull().default(""),
});

export const materiales = pgTable("materiales", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  unidad: text("unidad").notNull(),
  costo: integer("costo").notNull(),
  stock: integer("stock").notNull(),
  reposicion: integer("reposicion").notNull(),
});

export const maquinas = pgTable("maquinas", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  tipo: text("tipo").notNull(), // offset | digital | gran-formato | terminacion
  costoHora: integer("costo_hora"),
  costoClick: integer("costo_click"),
  costoM2: integer("costo_m2"),
});

export const productos = pgTable("productos", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  familia: text("familia").notNull(),
  unidad: text("unidad").notNull(),
  desde: integer("desde").notNull(),
  atributos: jsonb("atributos").$type<string[]>().notNull().default([]),
});

export const cotizaciones = pgTable("cotizaciones", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  numero: text("numero").notNull(),
  clienteId: text("cliente_id").notNull(),
  fecha: text("fecha").notNull(),
  estado: text("estado").notNull().default("borrador"),
  producto: text("producto").notNull(),
  familia: text("familia").notNull(),
  cantidad: integer("cantidad").notNull(),
  costoDirecto: integer("costo_directo").notNull(),
  costoMaquina: integer("costo_maquina").notNull(),
  margen: doublePrecision("margen").notNull(),
  total: integer("total").notNull(),
  vendedor: text("vendedor").notNull(),
});

export const ots = pgTable("ots", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  numero: text("numero").notNull(),
  clienteId: text("cliente_id").notNull(),
  producto: text("producto").notNull(),
  familia: text("familia").notNull(),
  cantidad: integer("cantidad").notNull(),
  estado: text("estado").notNull().default("prueba-color"),
  maquina: text("maquina").notNull(),
  entrega: text("entrega").notNull(),
  prioridad: text("prioridad").notNull().default("media"),
  total: integer("total").notNull(),
  qc: boolean("qc").notNull().default(false),
  tirajeReal: integer("tiraje_real"),
  merma: integer("merma"),
});

export const documentos = pgTable("documentos", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  folio: text("folio").notNull(),
  tipo: text("tipo").notNull(),
  clienteId: text("cliente_id").notNull(),
  neto: integer("neto").notNull(),
  fecha: text("fecha").notNull(),
  estado: text("estado").notNull().default("en-espera"),
  otId: text("ot_id"),
});

export const cobros = pgTable("cobros", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  documento: text("documento").notNull(),
  clienteId: text("cliente_id").notNull(),
  monto: integer("monto").notNull(),
  vence: text("vence").notNull(),
  estado: text("estado").notNull().default("vigente"),
});

export const encuestas = pgTable("encuestas", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  cliente: text("cliente").notNull(),
  score: integer("score").notNull(),
  comentario: text("comentario").notNull(),
  fecha: text("fecha").notNull(),
});
