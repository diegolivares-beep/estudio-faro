// Crea las tablas (migraciones) y carga la semilla. Idempotente.
import { db, usingPostgres } from "./client";
import { seed } from "./seed";

async function run() {
  if (usingPostgres) {
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    await migrate(db as any, { migrationsFolder: "./drizzle" });
  } else {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db as any, { migrationsFolder: "./drizzle" });
  }
  const seeded = await seed();
  console.log(seeded ? "BD creada y poblada con datos ficticios." : "BD ya tenia datos, no se re-sembro.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Error en setup:", e);
  process.exit(1);
});
