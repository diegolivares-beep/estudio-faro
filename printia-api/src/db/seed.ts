import bcrypt from "bcryptjs";
import { db, schema } from "./client";
import { EMPRESA } from "../config";

const E = EMPRESA.id;

// Datos ficticios pero realistas (costos tipicos de imprenta chilena).
// Single-tenant: una sola empresa (la de config.ts).
export async function seed() {
  const existing = await db.select().from(schema.empresas);
  if (existing.length > 0) return false;

  const pass = bcrypt.hashSync("demo1234", 8);

  await db.insert(schema.empresas).values([{ ...EMPRESA }]);

  await db.insert(schema.usuarios).values([
    { id: "u1", empresaId: E, nombre: "Carla Diaz", cargo: "Ejecutiva de ventas", rol: "vendedor", email: "carla@imprentagrafika.cl", passwordHash: pass, iniciales: "CD", color: "#2563eb" },
    { id: "u2", empresaId: E, nombre: "Marco Leon", cargo: "Ejecutivo de ventas", rol: "vendedor", email: "marco@imprentagrafika.cl", passwordHash: pass, iniciales: "ML", color: "#7c3aed" },
    { id: "u3", empresaId: E, nombre: "Dimitri Gacitua", cargo: "Gerente / dueno", rol: "admin", email: "dimitri@imprentagrafika.cl", passwordHash: pass, iniciales: "DG", color: "#0f172a" },
    { id: "u4", empresaId: E, nombre: "Patricia Soto", cargo: "Administracion y finanzas", rol: "finanzas", email: "patricia@imprentagrafika.cl", passwordHash: pass, iniciales: "PS", color: "#d97706" },
    { id: "u5", empresaId: E, nombre: "Luis Araya", cargo: "Jefe de produccion", rol: "produccion", email: "luis@imprentagrafika.cl", passwordHash: pass, iniciales: "LA", color: "#059669" },
  ]);

  // Maquinas con costos tipicos (CLP)
  await db.insert(schema.maquinas).values([
    { id: "m1", empresaId: E, nombre: "Offset Heidelberg SM 52 (4 col)", tipo: "offset", costoHora: 28000, costoClick: null, costoM2: null },
    { id: "m2", empresaId: E, nombre: "Offset GTO 52 (2 col)", tipo: "offset", costoHora: 16000, costoClick: null, costoM2: null },
    { id: "m3", empresaId: E, nombre: "Digital Konica C4070", tipo: "digital", costoHora: null, costoClick: 35, costoM2: null },
    { id: "m4", empresaId: E, nombre: "Digital Xerox Versant 180", tipo: "digital", costoHora: null, costoClick: 42, costoM2: null },
    { id: "m5", empresaId: E, nombre: "Plotter Epson SureColor", tipo: "gran-formato", costoHora: null, costoClick: null, costoM2: 4000 },
    { id: "m6", empresaId: E, nombre: "Plotter HP Latex 335", tipo: "gran-formato", costoHora: null, costoClick: null, costoM2: 4500 },
    { id: "m7", empresaId: E, nombre: "Guillotina Polar 78", tipo: "terminacion", costoHora: 9000, costoClick: null, costoM2: null },
    { id: "m8", empresaId: E, nombre: "Plastificadora / laminadora", tipo: "terminacion", costoHora: 7000, costoClick: null, costoM2: null },
    { id: "m9", empresaId: E, nombre: "Troqueladora", tipo: "terminacion", costoHora: 12000, costoClick: null, costoM2: null },
  ]);

  // Materiales con costos tipicos
  await db.insert(schema.materiales).values([
    { id: "p1", empresaId: E, nombre: "Bond 90g (pliego 76x112)", unidad: "pliego", costo: 95, stock: 4200, reposicion: 1000 },
    { id: "p2", empresaId: E, nombre: "Couche 150g brillante", unidad: "pliego", costo: 150, stock: 2600, reposicion: 800 },
    { id: "p3", empresaId: E, nombre: "Couche 300g (tarjetas)", unidad: "pliego", costo: 320, stock: 1500, reposicion: 600 },
    { id: "p4", empresaId: E, nombre: "Cartulina 250g", unidad: "pliego", costo: 210, stock: 1800, reposicion: 700 },
    { id: "p5", empresaId: E, nombre: "Autocopiativo 2 hojas", unidad: "juego", costo: 40, stock: 850, reposicion: 1500 },
    { id: "p6", empresaId: E, nombre: "PVC blanco 0.76mm", unidad: "lamina", costo: 420, stock: 320, reposicion: 200 },
    { id: "p7", empresaId: E, nombre: "Lona frontlit 13oz", unidad: "m2", costo: 2100, stock: 180, reposicion: 60 },
    { id: "p8", empresaId: E, nombre: "Vinilo adhesivo brillante", unidad: "m2", costo: 2600, stock: 95, reposicion: 50 },
    { id: "p9", empresaId: E, nombre: "Tinta offset CMYK", unidad: "kg", costo: 18000, stock: 44, reposicion: 20 },
  ]);

  await db.insert(schema.productos).values([
    { id: "pr1", empresaId: E, nombre: "Talonario autocopiativo (boletas/facturas)", familia: "offset", unidad: "talonario", desde: 3200, atributos: ["Tamano", "N de copias", "Folios", "Numerado", "Microcorte"] },
    { id: "pr2", empresaId: E, nombre: "Tarjeta de presentacion", familia: "offset", unidad: "millar", desde: 22000, atributos: ["9x5.5 cm", "Colores frente/dorso", "Papel", "Terminacion"] },
    { id: "pr3", empresaId: E, nombre: "Credencial PVC", familia: "digital", unidad: "unidad", desde: 1200, atributos: ["9x5.5 cm", "Full color doble cara", "Banda/Chip"] },
    { id: "pr4", empresaId: E, nombre: "Pendon roller", familia: "gran-formato", unidad: "unidad", desde: 28000, atributos: ["Medida", "Sustrato", "Estructura"] },
    { id: "pr5", empresaId: E, nombre: "Folleto diptico", familia: "offset", unidad: "millar", desde: 95000, atributos: ["Tamano", "Colores", "Papel", "Plegado"] },
    { id: "pr6", empresaId: E, nombre: "Adhesivos / vinilos", familia: "gran-formato", unidad: "m2", desde: 7900, atributos: ["Medida", "Material", "Corte"] },
    { id: "pr7", empresaId: E, nombre: "Afiche", familia: "offset", unidad: "unidad", desde: 480, atributos: ["Tamano", "Colores", "Papel"] },
    { id: "pr8", empresaId: E, nombre: "Timbre automatico", familia: "terminacion", unidad: "unidad", desde: 14900, atributos: ["Modelo", "N de lineas", "Color tinta"] },
  ]);

  await db.insert(schema.clientes).values([
    { id: "c1", empresaId: E, nombre: "Constructora Los Llanos Ltda.", rut: "77.451.220-9", tipo: "empresa", contacto: "Rodrigo Pizarro", telefono: "+56 9 6210 4488", email: "compras@losllanos.cl", condicionPago: "30 dias", comprasAnio: 4820000, ultimaCompra: "2026-06-18", vendedor: "Carla Diaz" },
    { id: "c2", empresaId: E, nombre: "Minera Andacollo SpA", rut: "96.812.000-4", tipo: "empresa", contacto: "Patricia Vega", telefono: "+56 9 5544 1020", email: "abastecimiento@mandacollo.cl", condicionPago: "60 dias", comprasAnio: 7150000, ultimaCompra: "2026-06-21", vendedor: "Carla Diaz" },
    { id: "c3", empresaId: E, nombre: "Restaurante La Mar Serena", rut: "78.220.910-1", tipo: "empresa", contacto: "Felipe Soto", telefono: "+56 9 7788 3311", email: "lamar@gmail.com", condicionPago: "Contado", comprasAnio: 980000, ultimaCompra: "2026-06-10", vendedor: "Marco Leon" },
    { id: "c4", empresaId: E, nombre: "Fundacion Educa Norte", rut: "65.110.330-K", tipo: "empresa", contacto: "Ana Cortes", telefono: "+56 9 8123 0099", email: "admin@educanorte.cl", condicionPago: "30 dias", comprasAnio: 2240000, ultimaCompra: "2026-06-05", vendedor: "Marco Leon" },
    { id: "c5", empresaId: E, nombre: "Vina Valle del Elqui", rut: "76.990.115-3", tipo: "empresa", contacto: "Jorge Munoz", telefono: "+56 9 4455 6677", email: "marketing@valleelqui.cl", condicionPago: "Contado", comprasAnio: 3310000, ultimaCompra: "2026-06-19", vendedor: "Carla Diaz" },
    { id: "c6", empresaId: E, nombre: "Ferreteria El Faro", rut: "78.001.442-6", tipo: "empresa", contacto: "Luis Tapia", telefono: "+56 9 9001 2233", email: "elfaro.ferreteria@gmail.com", condicionPago: "Contado", comprasAnio: 640000, ultimaCompra: "2026-05-28", vendedor: "Marco Leon" },
    { id: "c7", empresaId: E, nombre: "Camila Rojas (matrimonio)", rut: "19.882.110-4", tipo: "particular", contacto: "Camila Rojas", telefono: "+56 9 6677 8899", email: "camirojas@gmail.com", condicionPago: "Contado", comprasAnio: 185000, ultimaCompra: "2026-06-22", vendedor: "Marco Leon" },
  ]);

  await db.insert(schema.cotizaciones).values([
    { id: "q1", empresaId: E, numero: "COT-2026-0418", clienteId: "c2", fecha: "2026-06-21", estado: "aprobada", producto: "Talonario autocopiativo (boletas/facturas)", familia: "offset", cantidad: 50, costoDirecto: 168000, costoMaquina: 96000, margen: 0.32, total: 388235, vendedor: "Carla Diaz" },
    { id: "q2", empresaId: E, numero: "COT-2026-0419", clienteId: "c5", fecha: "2026-06-19", estado: "aprobada", producto: "Pendon roller", familia: "gran-formato", cantidad: 6, costoDirecto: 84000, costoMaquina: 25200, margen: 0.4, total: 182000, vendedor: "Carla Diaz" },
    { id: "q3", empresaId: E, numero: "COT-2026-0420", clienteId: "c1", fecha: "2026-06-18", estado: "aprobada", producto: "Tarjeta de presentacion", familia: "offset", cantidad: 5, costoDirecto: 62000, costoMaquina: 40000, margen: 0.35, total: 156923, vendedor: "Carla Diaz" },
    { id: "q4", empresaId: E, numero: "COT-2026-0421", clienteId: "c4", fecha: "2026-06-17", estado: "enviada", producto: "Folleto diptico", familia: "offset", cantidad: 3, costoDirecto: 210000, costoMaquina: 78000, margen: 0.33, total: 429851, vendedor: "Marco Leon" },
    { id: "q5", empresaId: E, numero: "COT-2026-0422", clienteId: "c7", fecha: "2026-06-22", estado: "enviada", producto: "Tarjeta de presentacion", familia: "offset", cantidad: 1, costoDirecto: 18000, costoMaquina: 12000, margen: 0.38, total: 48387, vendedor: "Marco Leon" },
    { id: "q6", empresaId: E, numero: "COT-2026-0423", clienteId: "c3", fecha: "2026-06-20", estado: "borrador", producto: "Adhesivos / vinilos", familia: "gran-formato", cantidad: 12, costoDirecto: 31200, costoMaquina: 18000, margen: 0.45, total: 89455, vendedor: "Marco Leon" },
    { id: "q7", empresaId: E, numero: "COT-2026-0424", clienteId: "c6", fecha: "2026-06-15", estado: "rechazada", producto: "Afiche", familia: "offset", cantidad: 500, costoDirecto: 95000, costoMaquina: 36000, margen: 0.3, total: 187143, vendedor: "Marco Leon" },
  ]);

  await db.insert(schema.ots).values([
    { id: "ot1", empresaId: E, numero: "OT-3391", clienteId: "c2", producto: "Talonario autocopiativo x50", familia: "offset", cantidad: 50, estado: "prensa", maquina: "Offset GTO 52", entrega: "2026-06-26", prioridad: "alta", total: 388235, qc: false },
    { id: "ot2", empresaId: E, numero: "OT-3392", clienteId: "c5", producto: "Pendon roller x6", familia: "gran-formato", cantidad: 6, estado: "terminaciones", maquina: "Plotter Epson", entrega: "2026-06-25", prioridad: "alta", total: 182000, qc: false },
    { id: "ot3", empresaId: E, numero: "OT-3393", clienteId: "c1", producto: "Tarjeta presentacion x5000", familia: "offset", cantidad: 5, estado: "montaje", maquina: "Offset SM 52", entrega: "2026-06-27", prioridad: "media", total: 156923, qc: false },
    { id: "ot4", empresaId: E, numero: "OT-3394", clienteId: "c3", producto: "Credencial PVC x120", familia: "digital", cantidad: 120, estado: "prueba-color", maquina: "Digital Konica", entrega: "2026-06-30", prioridad: "media", total: 198000, qc: false },
    { id: "ot5", empresaId: E, numero: "OT-3395", clienteId: "c4", producto: "Folleto diptico x3000", familia: "offset", cantidad: 3, estado: "prensa", maquina: "Offset SM 52", entrega: "2026-06-28", prioridad: "media", total: 429851, qc: false },
    { id: "ot6", empresaId: E, numero: "OT-3396", clienteId: "c7", producto: "Partes matrimonio x150", familia: "digital", cantidad: 150, estado: "despacho", maquina: "Digital Konica", entrega: "2026-06-24", prioridad: "alta", total: 185000, qc: true },
    { id: "ot7", empresaId: E, numero: "OT-3397", clienteId: "c6", producto: "Adhesivos vinilo x40", familia: "gran-formato", cantidad: 40, estado: "listo", maquina: "Plotter Epson", entrega: "2026-06-23", prioridad: "baja", total: 142000, qc: true },
    { id: "ot8", empresaId: E, numero: "OT-3398", clienteId: "c3", producto: "Timbres automaticos x4", familia: "terminacion", cantidad: 4, estado: "montaje", maquina: "Troqueladora", entrega: "2026-06-29", prioridad: "baja", total: 59600, qc: false },
    { id: "ot9", empresaId: E, numero: "OT-3399", clienteId: "c2", producto: "Carpetas corporativas x2000", familia: "offset", cantidad: 2, estado: "terminaciones", maquina: "Offset SM 52", entrega: "2026-06-26", prioridad: "alta", total: 512000, qc: false },
  ]);

  await db.insert(schema.documentos).values([
    { id: "d1", empresaId: E, folio: "Factura 12894", tipo: "Factura electronica (33)", clienteId: "c2", neto: 326248, fecha: "2026-06-21", estado: "aceptado" },
    { id: "d2", empresaId: E, folio: "Factura 12893", tipo: "Factura electronica (33)", clienteId: "c5", neto: 152941, fecha: "2026-06-20", estado: "aceptado" },
    { id: "d3", empresaId: E, folio: "Boleta 4471", tipo: "Boleta electronica (39)", clienteId: "c3", neto: 75168, fecha: "2026-06-20", estado: "en-espera" },
    { id: "d4", empresaId: E, folio: "Factura 12892", tipo: "Factura electronica (33)", clienteId: "c1", neto: 131868, fecha: "2026-06-18", estado: "aceptado" },
    { id: "d5", empresaId: E, folio: "Guia 8821", tipo: "Guia de despacho (52)", clienteId: "c4", neto: 361220, fecha: "2026-06-17", estado: "rechazado" },
  ]);

  await db.insert(schema.cobros).values([
    { id: "f1", empresaId: E, documento: "Factura 12894", clienteId: "c2", monto: 388235, vence: "2026-07-21", estado: "vigente" },
    { id: "f2", empresaId: E, documento: "Factura 12880", clienteId: "c1", monto: 156923, vence: "2026-06-28", estado: "por-vencer" },
    { id: "f3", empresaId: E, documento: "Factura 12871", clienteId: "c4", monto: 429851, vence: "2026-06-20", estado: "vencido" },
    { id: "f4", empresaId: E, documento: "Factura 12865", clienteId: "c5", monto: 182000, vence: "2026-06-19", estado: "vencido" },
  ]);

  await db.insert(schema.encuestas).values([
    { id: "s1", empresaId: E, cliente: "Minera Andacollo", score: 9, comentario: "Excelente calidad y a tiempo. Repetiremos.", fecha: "2026-06-21" },
    { id: "s2", empresaId: E, cliente: "Constructora Los Llanos", score: 10, comentario: "Muy buena atencion, talonarios impecables.", fecha: "2026-06-19" },
    { id: "s3", empresaId: E, cliente: "Restaurante La Mar", score: 8, comentario: "Buen trabajo, la entrega se atraso un dia.", fecha: "2026-06-12" },
    { id: "s4", empresaId: E, cliente: "Fundacion Educa Norte", score: 6, comentario: "Calidad ok pero esperaba mejor color.", fecha: "2026-06-05" },
    { id: "s5", empresaId: E, cliente: "Vina Valle del Elqui", score: 10, comentario: "Los pendones quedaron espectaculares.", fecha: "2026-06-19" },
  ]);

  return true;
}
