import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const config = JSON.parse(readFileSync("wrangler.json", "utf8"));
const run = (args) => {
  const result = spawnSync("npx", ["wrangler", ...args], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status || 1);
};
if (
  config.d1_databases[0].database_id === "00000000-0000-0000-0000-000000000000"
) {
  run([
    "d1",
    "create",
    config.d1_databases[0].database_name,
    "--binding",
    "DB",
    "--update-config",
  ]);
}
run(["d1", "migrations", "apply", "DB", "--remote"]);
console.log("Database ready. Deploy with npm run deploy.");
