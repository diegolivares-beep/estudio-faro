// Conexion a la BD. Dev: PGlite (Postgres embebido, archivo local).
// Prod: Postgres real via DATABASE_URL (Coolify). Mismo esquema Drizzle.
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";

const DATA_DIR = process.env.PGLITE_DIR || "./pgdata";

export const usingPostgres = !!process.env.DATABASE_URL;

let _db: ReturnType<typeof drizzlePglite<typeof schema>>;
let _pglite: PGlite | null = null;

if (usingPostgres) {
  // Prod: postgres-js. Import dinamico para no exigirlo en dev.
  const { drizzle: drizzlePg } = await import("drizzle-orm/postgres-js");
  const postgres = (await import("postgres")).default;
  const client = postgres(process.env.DATABASE_URL!);
  _db = drizzlePg(client, { schema }) as unknown as typeof _db;
} else {
  _pglite = new PGlite(DATA_DIR);
  _db = drizzlePglite(_pglite, { schema });
}

export const db = _db;
export const pglite = _pglite;
export { schema };
