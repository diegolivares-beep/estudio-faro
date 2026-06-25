CREATE TABLE "ordenes_compra" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"numero" text NOT NULL,
	"proveedor" text NOT NULL,
	"numero_doc" text DEFAULT '' NOT NULL,
	"cuenta_contable" text DEFAULT 'Costo insumos, materiales y productos' NOT NULL,
	"fecha" text NOT NULL,
	"monto_neto" integer DEFAULT 0 NOT NULL,
	"monto_bruto" integer DEFAULT 0 NOT NULL,
	"recibido" boolean DEFAULT false NOT NULL,
	"estado" text DEFAULT 'emitida' NOT NULL
);
