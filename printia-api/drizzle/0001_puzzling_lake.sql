CREATE TABLE "asientos" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"numero" integer NOT NULL,
	"glosa" text NOT NULL,
	"fecha" text NOT NULL,
	"operacion" text DEFAULT 'egreso' NOT NULL,
	"debe" integer DEFAULT 0 NOT NULL,
	"haber" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "balance_lineas" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"cuenta" text NOT NULL,
	"debito" integer DEFAULT 0 NOT NULL,
	"credito" integer DEFAULT 0 NOT NULL,
	"activo" integer DEFAULT 0 NOT NULL,
	"pasivo" integer DEFAULT 0 NOT NULL,
	"perdida" integer DEFAULT 0 NOT NULL,
	"ganancia" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cuentas_bancarias" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"banco" text DEFAULT '' NOT NULL,
	"numero" text DEFAULT '' NOT NULL,
	"saldo" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eerr_lineas" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"categoria" text NOT NULL,
	"subcategoria" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"es_total" boolean DEFAULT false NOT NULL,
	"meses" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finanzas_resumen" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"iva_por_pagar" integer DEFAULT 0 NOT NULL,
	"renta_at" integer DEFAULT 0 NOT NULL,
	"ppm_acumulado" integer DEFAULT 0 NOT NULL,
	"rentabilidad" integer DEFAULT 0 NOT NULL,
	"gastos_total" integer DEFAULT 0 NOT NULL,
	"gastos_detalle" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deuda_clientes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagos" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"proveedor" text NOT NULL,
	"numero_doc" text DEFAULT '' NOT NULL,
	"vencimiento" text NOT NULL,
	"condicion" text DEFAULT 'Contado' NOT NULL,
	"monto_neto" integer NOT NULL,
	"monto_bruto" integer NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proveedores" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"razon_social" text NOT NULL,
	"rut" text DEFAULT '' NOT NULL,
	"contacto" text DEFAULT '' NOT NULL,
	"telefono" text DEFAULT '' NOT NULL,
	"cuenta_contable" text DEFAULT 'Costo insumos, materiales y productos' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cobros" ADD COLUMN "condicion" text DEFAULT 'Contado' NOT NULL;--> statement-breakpoint
ALTER TABLE "cobros" ADD COLUMN "monto_pendiente" integer;