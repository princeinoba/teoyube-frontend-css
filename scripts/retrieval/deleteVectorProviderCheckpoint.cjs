/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const allowedRoot = path.resolve(root, ".var", "retrieval");
const target = path.resolve(allowedRoot, "vector-provider-evaluation");
if (!target.startsWith(`${allowedRoot}${path.sep}`)) {
  throw new Error("Refusing checkpoint deletion outside the ignored retrieval root.");
}
fs.rmSync(target, { recursive: true, force: true });
console.log(JSON.stringify({ status: "deleted", target: ".var/retrieval/vector-provider-evaluation" }));
