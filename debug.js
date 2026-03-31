const { execSync } = require("child_process");
const fs = require("fs");

try {
  let output = execSync("npx tsx test.ts", { encoding: "utf-8" });
  fs.writeFileSync("debug-out.txt", output);
} catch (e) {
  fs.writeFileSync("debug-out.txt", (e.stdout || "") + "\n---\n" + (e.stderr || "") + "\n---\n" + (e.message || ""));
}
