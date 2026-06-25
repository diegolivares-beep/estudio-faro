CREATE TABLE "agendamientos" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"usuario_id" text NOT NULL,
	"ot_id" text DEFAULT '' NOT NULL,
	"titulo" text NOT NULL,
	"fecha" text NOT NULL,
	"hora_inicio" integer NOT NULL,
	"hora_fin" integer NOT NULL,
	"tipo" text DEFAULT 'trabajo' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultas" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"numero" text NOT NULL,
	"contacto" text NOT NULL,
	"cliente_nombre" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"telefono" text DEFAULT '' NOT NULL,
	"fecha" text NOT NULL,
	"producto" text DEFAULT '' NOT NULL,
	"mensaje" text DEFAULT '' NOT NULL,
	"origen" text DEFAULT 'Web' NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"vendedor" text DEFAULT 'Sin asignar' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estados_produccion" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"color" text DEFAULT '#64748b' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"contacto" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"telefono" text DEFAULT '' NOT NULL,
	"etapa" text DEFAULT 'nuevo' NOT NULL,
	"valor" integer DEFAULT 0 NOT NULL,
	"probabilidad" integer DEFAULT 20 NOT NULL,
	"vendedor" text DEFAULT 'Sin asignar' NOT NULL,
	"fecha" text NOT NULL,
	"nota" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listas_precios" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monedas" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"decimales" integer DEFAULT 0 NOT NULL,
	"cambio_venta" double precision DEFAULT 1 NOT NULL,
	"cambio_compra" double precision DEFAULT 1 NOT NULL,
	"auto" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tareas" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"usuario_id" text NOT NULL,
	"titulo" text NOT NULL,
	"ot_id" text DEFAULT '' NOT NULL,
	"fecha" text NOT NULL,
	"prioridad" text DEFAULT 'media' NOT NULL,
	"hecha" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens_api" (
	"id" text PRIMARY KEY NOT NULL,
	"empresa_id" text NOT NULL,
	"nombre" text NOT NULL,
	"token" text NOT NULL,
	"vence" text DEFAULT '' NOT NULL,
	"ultimo_uso" text DEFAULT '' NOT NULL,
	"estado" text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "empresas" ADD COLUMN "config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "encuestas" ADD COLUMN "ot" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "encuestas" ADD COLUMN "vendedor" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "encuestas" ADD COLUMN "estado" text DEFAULT 'contestada' NOT NULL;--> statement-breakpoint
ALTER TABLE "ots" ADD COLUMN "estado_tag" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "ots" ADD COLUMN "compromiso" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "ots" ADD COLUMN "responsable" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "ots" ADD COLUMN "vb_estado" text DEFAULT 'sin-solicitar' NOT NULL;--> statement-breakpoint
ALTER TABLE "ots" ADD COLUMN "vb_comentario" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "productos" ADD COLUMN "codigo" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "productos" ADD COLUMN "precio_neto" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "productos" ADD COLUMN "exento_iva" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "productos" ADD COLUMN "activo" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "productos" ADD COLUMN "en_tienda" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "estado" text DEFAULT 'activo' NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "permisos" jsonb DEFAULT '{}'::jsonb NOT NULL;