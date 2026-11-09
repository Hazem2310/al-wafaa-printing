// Isolated HTTP integration tests only; this is not a browser preview or a deployment.
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
const probe = createServer();
await new Promise(resolve => probe.listen(0,"127.0.0.1",resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const namespace = `qa-${randomBytes(16).toString("hex")}`;
const password = randomBytes(24).toString("hex");
const base = `http://127.0.0.1:${port}`;
const env = { ...process.env, NODE_ENV:"production", CATALOG_STORAGE:"local", CATALOG_LOCAL_NAMESPACE:namespace, ADMIN_PASSWORD:password, ADMIN_SESSION_SECRET:randomBytes(48).toString("hex") };
delete env.NETLIFY; delete env.SITE_ID; delete env.NETLIFY_BLOBS_CONTEXT;
const server = spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port",String(port)],{env,stdio:["ignore","pipe","pipe"]});
let logs=""; server.stdout.on("data",b=>{logs+=b;}); server.stderr.on("data",b=>{logs+=b;});
try {
  let ready=false;
  for(let i=0;i<100;i++) { try { const r=await fetch(`${base}/api/auth`); if(r.ok){ready=true;break;} }catch{} await new Promise(r=>setTimeout(r,150)); }
  if(!ready) throw new Error(`Test server failed: ${logs}`);
  const tests=spawn(process.execPath,["--test","tests/catalog-api.test.mjs"],{env:{...env,TEST_BASE_URL:base,TEST_ADMIN_PASSWORD:password,TEST_ALLOW_LOCAL_WRITES:"1"},stdio:"inherit"});
  process.exitCode=await new Promise(resolve=>tests.on("exit",code=>resolve(code??1)));
  if(process.exitCode) console.error(logs);
} finally { server.kill("SIGTERM"); }
