import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

if (existsSync(".env.local")) {
  console.log("ملف .env.local موجود؛ لم نغيّر إعداداتك. عدّل ADMIN_PASSWORD فيه عند الحاجة، ثم أعد تشغيل الموقع.");
  process.exit(0);
}
let muted = false;
const output = new Writable({ write(chunk, _encoding, callback) { if (!muted) process.stdout.write(chunk); callback(); } });
const rl = createInterface({ input: process.stdin, output, terminal: true });
async function secret(prompt) {
  process.stdout.write(prompt);
  muted = true;
  const value = await rl.question("");
  muted = false;
  process.stdout.write("\n");
  return value;
}
try {
  const password = await secret("اختر كلمة مرور للإدارة (12 حرفًا على الأقل؛ لن تظهر أثناء الكتابة): ");
  if (password.length < 12 || password.length > 256 || /[\r\n]/.test(password)) throw new Error("استخدم كلمة مرور بين 12 و256 حرفًا.");
  const repeated = await secret("اكتب كلمة المرور مرة ثانية: ");
  if (repeated !== password) throw new Error("كلمتا المرور غير متطابقتين.");
  const escaped = password.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\$/g,"\\$");
  await writeFile(".env.local", `ADMIN_PASSWORD="${escaped}"\nADMIN_SESSION_SECRET=${randomBytes(48).toString("hex")}\nCATALOG_STORAGE=local\n`, { mode: 0o600, flag: "wx" });
  console.log("تم إعداد الإدارة. شغّل npm run dev ثم افتح /admin. لا ترفع .env.local إلى GitHub ولا ترسل محتواه لأي شخص.");
} catch (error) { console.error(error.message); process.exitCode = 1; } finally { rl.close(); }
