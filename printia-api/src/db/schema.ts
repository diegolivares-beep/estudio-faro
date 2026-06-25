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
  config: jsonb("config").$type<Record<string, any>>().notNull().default({}),
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
  estado: text("estado").notNull().default("activo"), // activo | inactivo | temporal
  // Permisos granulares: { modulo: "inactivo" | "ver" | "administrar" }. Vacio = usa el rol.
  permisos: jsonb("permisos").$type<Record<string, string>>().notNull().default({}),
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
  codigo: text("codigo").notNull().default(""),
  precioNeto: integer("precio_neto").notNull().default(0),
  exentoIva: boolean("exento_iva").notNull().default(false),
  activo: boolean("activo").notNull().default(true),
  enTienda: boolean("en_tienda").notNull().default(false), // visible en e-commerce
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
  // Operaciones (Fase 3)
  estadoTag: text("estado_tag").notNull().default(""), // etiqueta libre del tablero (Diseño, Offset, Serigrafia...)
  compromiso: text("compromiso").notNull().default(""), // fecha compromiso con el cliente
  responsable: text("responsable").notNull().default(""), // usuario responsable
  vbEstado: text("vb_estado").notNull().default("sin-solicitar"), // sin-solicitar | pendiente | aprobado | rechazado
  vbComentario: text("vb_comentario").notNull().default(""),
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
  condicion: text("condicion").notNull().default("Contado"),
  montoPendiente: integer("monto_pendiente"),
});

// ---- Finanzas / contabilidad ----
export const proveedores = pgTable("proveedores", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  razonSocial: text("razon_social").notNull(),
  rut: text("rut").notNull().default(""),
  contacto: text("contacto").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  cuentaContable: text("cuenta_contable").notNull().default("Costo insumos, materiales y productos"),
});

export const cuentasBancarias = pgTable("cuentas_bancarias", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  banco: text("banco").notNull().default(""),
  numero: text("numero").notNull().default(""),
  saldo: integer("saldo").notNull().default(0),
});

export const pagos = pgTable("pagos", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  proveedor: text("proveedor").notNull(),
  numeroDoc: text("numero_doc").notNull().default(""),
  vencimiento: text("vencimiento").notNull(),
  condicion: text("condicion").notNull().default("Contado"),
  montoNeto: integer("monto_neto").notNull(),
  montoBruto: integer("monto_bruto").notNull(),
  estado: text("estado").notNull().default("pendiente"), // por-aprobar | pendiente | en-proceso | finalizado
});

// Comprobantes (libro diario)
export const asientos = pgTable("asientos", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  numero: integer("numero").notNull(),
  glosa: text("glosa").notNull(),
  fecha: text("fecha").notNull(),
  operacion: text("operacion").notNull().default("egreso"), // ingreso | egreso
  debe: integer("debe").notNull().default(0),
  haber: integer("haber").notNull().default(0),
});

// Estado de resultado: una fila por (categoria, subcategoria) con montos por mes (jsonb)
export const eerrLineas = pgTable("eerr_lineas", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  categoria: text("categoria").notNull(),
  subcategoria: text("subcategoria").notNull().default(""),
  orden: integer("orden").notNull().default(0),
  esTotal: boolean("es_total").notNull().default(false),
  meses: jsonb("meses").$type<number[]>().notNull().default([]), // 6 meses
});

// Balance: una fila por cuenta
export const balanceLineas = pgTable("balance_lineas", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  cuenta: text("cuenta").notNull(),
  debito: integer("debito").notNull().default(0),
  credito: integer("credito").notNull().default(0),
  activo: integer("activo").notNull().default(0),
  pasivo: integer("pasivo").notNull().default(0),
  perdida: integer("perdida").notNull().default(0),
  ganancia: integer("ganancia").notNull().default(0),
});

// Resumen tributario para el dashboard (una fila por empresa)
export const finanzasResumen = pgTable("finanzas_resumen", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  ivaPorPagar: integer("iva_por_pagar").notNull().default(0),
  rentaAt: integer("renta_at").notNull().default(0),
  ppmAcumulado: integer("ppm_acumulado").notNull().default(0),
  rentabilidad: integer("rentabilidad").notNull().default(0),
  gastosTotal: integer("gastos_total").notNull().default(0),
  gastosDetalle: jsonb("gastos_detalle").$type<{ nombre: string; monto: number }[]>().notNull().default([]),
  deudaClientes: integer("deuda_clientes").notNull().default(0),
});

export const encuestas = pgTable("encuestas", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  cliente: text("cliente").notNull(),
  score: integer("score").notNull(),
  comentario: text("comentario").notNull(),
  fecha: text("fecha").notNull(),
  ot: text("ot").notNull().default(""),
  vendedor: text("vendedor").notNull().default(""),
  estado: text("estado").notNull().default("contestada"), // contestada | no-contestada | en-proceso
});

// ============================================================
//  FASE 2 — COMERCIAL EXTENDIDO
// ============================================================

// Consultas: solicitudes de cotizacion entrantes (desde web/widget)
export const consultas = pgTable("consultas", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  numero: text("numero").notNull(),
  contacto: text("contacto").notNull(),
  clienteNombre: text("cliente_nombre").notNull().default(""),
  email: text("email").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  fecha: text("fecha").notNull(),
  producto: text("producto").notNull().default(""),
  mensaje: text("mensaje").notNull().default(""),
  origen: text("origen").notNull().default("Web"), // Web | E-commerce | Telefono | Email
  estado: text("estado").notNull().default("pendiente"), // pendiente | atendida | convertida | descartada
  vendedor: text("vendedor").notNull().default("Sin asignar"),
});

// CRM: leads en pipeline kanban
export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  contacto: text("contacto").notNull().default(""),
  email: text("email").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  etapa: text("etapa").notNull().default("nuevo"), // nuevo | contactado | propuesta | ganado | perdido
  valor: integer("valor").notNull().default(0),
  probabilidad: integer("probabilidad").notNull().default(20),
  vendedor: text("vendedor").notNull().default("Sin asignar"),
  fecha: text("fecha").notNull(),
  nota: text("nota").notNull().default(""),
});

// ============================================================
//  FASE 3 — OPERACIONES
// ============================================================

// Estados configurables del tablero (etiquetas, no pipeline fijo)
export const estadosProduccion = pgTable("estados_produccion", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  color: text("color").notNull().default("#64748b"),
  orden: integer("orden").notNull().default(0),
});

// Agendamiento: bloques por persona/operario
export const agendamientos = pgTable("agendamientos", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  usuarioId: text("usuario_id").notNull(),
  otId: text("ot_id").notNull().default(""),
  titulo: text("titulo").notNull(),
  fecha: text("fecha").notNull(),
  horaInicio: integer("hora_inicio").notNull(), // hora del dia (7..18)
  horaFin: integer("hora_fin").notNull(),
  tipo: text("tipo").notNull().default("trabajo"), // trabajo | entrega | reunion
});

// Mis Tareas
export const tareas = pgTable("tareas", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  usuarioId: text("usuario_id").notNull(),
  titulo: text("titulo").notNull(),
  otId: text("ot_id").notNull().default(""),
  fecha: text("fecha").notNull(),
  prioridad: text("prioridad").notNull().default("media"),
  hecha: boolean("hecha").notNull().default(false),
});

// ============================================================
//  FASE 4 — MI EMPRESA
// ============================================================

// Multiples listas de precios por sustrato/segmento
export const listasPrecios = pgTable("listas_precios", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion").notNull().default(""),
  activa: boolean("activa").notNull().default(true),
  items: jsonb("items").$type<{ producto: string; valor: number }[]>().notNull().default([]),
});

export const monedas = pgTable("monedas", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  codigo: text("codigo").notNull(), // CLP | USD | UF | EUR
  nombre: text("nombre").notNull(),
  decimales: integer("decimales").notNull().default(0),
  cambioVenta: doublePrecision("cambio_venta").notNull().default(1),
  cambioCompra: doublePrecision("cambio_compra").notNull().default(1),
  auto: boolean("auto").notNull().default(false),
});

export const tokensApi = pgTable("tokens_api", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id").notNull(),
  nombre: text("nombre").notNull(),
  token: text("token").notNull(),
  vence: text("vence").notNull().default(""),
  ultimoUso: text("ultimo_uso").notNull().default(""),
  estado: text("estado").notNull().default("activo"), // activo | revocado
});
