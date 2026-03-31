import * as dotenv from "dotenv";
dotenv.config();
import { fetchAndUpsertFundamentals } from "../lib/sync-market";

async function main() {
  console.log("Starting test sync for 5 symbols...");
  const result = await fetchAndUpsertFundamentals(5);
  console.log("Test sync result:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
