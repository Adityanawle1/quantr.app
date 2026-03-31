import { supabase } from "../lib/supabase";
import { fetchAndUpsertFundamentals } from "../lib/sync-market";

async function run() {
  const { data: stock } = await supabase.from("stocks").select("*").eq("symbol", "TATAMOTORS").single();
  if (stock) {
    console.log("Syncing TATAMOTORS...");
    await fetchAndUpsertFundamentals([stock]);
    console.log("Done syncing. Check the UI now.");
  } else {
    console.log("Not found.");
  }
}

run();
