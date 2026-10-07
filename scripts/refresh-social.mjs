import { fileURLToPath } from "node:url";
import { PAGES, refreshPage } from "./lib/social-refresh.mjs";

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--page" || !PAGES.includes(args[1]))) {
  console.error(`Usage: npm run content:refresh -- [--page ${PAGES.join("|")}]`);
  process.exitCode = 1;
} else {
  const rootDir = fileURLToPath(new URL("../", import.meta.url));
  for (const page of args.length ? [args[1]] : PAGES) {
    try {
      console.log(`Refreshing ${page}...`);
      const result = await refreshPage({ rootDir, page });
      console.log(`${page}: ${result.updated} saved, ${result.failed} failed (existing content retained on failure)`);
      for (const error of result.errors) console.error(`  ${error.id}: ${error.message}`);
      if (result.failed) process.exitCode = 1;
    } catch (error) {
      console.error(`${page}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
