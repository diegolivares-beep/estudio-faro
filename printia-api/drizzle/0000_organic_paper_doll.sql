CREATE TABLE "clientes" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"rut" text NOT NULL,
	"tipo" text NOT NULL,
	"contacto" text DEFAULT '' NOT NULL,
	"telefono" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"condicion_pago" text DEFAULT 'Contado' NOT NULL,
	"compras_anio" integer DEFAULT 0 NOT NULL,
	"ultima_compra" text DEFAULT '' NOT NULL,
	"vendedor" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cobros" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"documento" text NOT NULL,
	"cliente_id" text NOT NULL,
	"monto" integer NOT NULL,
	"vence" text NOT NULL,
	"estado" text DEFAULT 'vigente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cotizaciones" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"numero" text NOT NULL,
	"cliente_id" text NOT NULL,
	"fecha" text NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"producto" text NOT NULL,
	"familia" text NOT NULL,
	"cantidad" integer NOT NULL,
	"costo_directo" integer NOT NULL,
	"costo_maquina" integer NOT NULL,
	"margen" double precision NOT NULL,
	"total" integer NOT NULL,
	"vendedor" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"folio" text NOT NULL,
	"tipo" text NOT NULL,
	"cliente_id" text NOT NULL,
	"neto" integer NOT NULL,
	"fecha" text NOT NULL,
	"estado" text DEFAULT 'en-espera' NOT NULL,
	"ot_id" text
);
--> statement-breakpoint
CREATE TABLE "empresas" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"razon_social" text NOT NULL,
	"rut" text NOT NULL,
	"giro" text NOT NULL,
	"direccion" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text NOT NULL,
	"web" text NOT NULL,
	"color" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encuestas" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"cliente" text NOT NULL,
	"score" integer NOT NULL,
	"comentario" text NOT NULL,
	"fecha" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maquinas" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"tipo" text NOT NULL,
	"costo_hora" integer,
	"costo_click" integer,
	"costo_m2" integer
);
--> statement-breakpoint
CREATE TABLE "materiales" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"unidad" text NOT NULL,
	"costo" integer NOT NULL,
	"stock" integer NOT NULL,
	"reposicion" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ots" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"numero" text NOT NULL,
	"cliente_id" text NOT NULL,
	"producto" text NOT NULL,
	"familia" text NOT NULL,
	"cantidad" integer NOT NULL,
	"estado" text DEFAULT 'prueba-color' NOT NULL,
	"maquina" text NOT NULL,
	"entrega" text NOT NULL,
	"prioridad" text DEFAULT 'media' NOT NULL,
	"total" integer NOT NULL,
	"qc" boolean DEFAULT false NOT NULL,
	"tiraje_real" integer,
	"merma" integer
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"familia" text NOT NULL,
	"unidad" text NOT NULL,
	"desde" integer NOT NULL,
	"atributos" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"cargo" text NOT NULL,
	"rol" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"iniciales" text NOT NULL,
	"color" text NOT NULL
);
