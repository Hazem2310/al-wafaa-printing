import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Run ONLY against an isolated local test store, never a live/production site.
const base = process.env.TEST_BASE_URL;
const password = process.env.TEST_ADMIN_PASSWORD;
const enabled = Boolean(base && password && process.env.TEST_ALLOW_LOCAL_WRITES === "1");
test("catalog: authenticated CRUD, cross-client visibility, uploads and validation", { skip: !enabled }, async () => {
  const origin = new URL(base).origin;
  let cookie = "";
  const call = (path, method="GET", body, authenticated=false, extra={}) => fetch(`${base}${path}`, {
    method,
    headers: { Origin: origin, ...(body ? {"Content-Type":"application/json"}:{}), ...(authenticated ? {Cookie:cookie}:{}), ...extra },
    ...(body ? {body:JSON.stringify(body)} : {}),
  });
  const draft = { titleAr:"اختبار نشر قلم", titleHe:"עט בדיקה", descriptionAr:"عنصر اختبار مؤقت", category:"pens", weddingGroup:"all", image:"/images/al-wafaa-logo.jpeg", mockup:"pen", visible:true, demo:false };
  assert.equal((await call("/api/admin/catalog","POST",draft)).status,401);
  assert.equal((await call("/api/admin/catalog")).status,401);
  assert.equal((await call("/api/auth","POST",{password},false,{Origin:"https://wrong.example"})).status,403);
  assert.equal((await call("/api/auth","POST",{password:"incorrect-password"})).status,401);
  const login = await call("/api/auth","POST",{password});
  assert.equal(login.status,200);
  const setCookie = login.headers.get("set-cookie");
  assert.match(setCookie,/HttpOnly/i); assert.match(setCookie,/SameSite=strict/i);
  cookie = setCookie.split(";")[0];
  assert.equal((await (await call("/api/auth","GET",null,true)).json()).authenticated,true);
  assert.equal((await call("/api/admin/catalog","POST",{...draft,image:"javascript:alert(1)"},true)).status,400);
  assert.equal((await call("/api/admin/catalog","POST",{...draft,category:"invalid"},true)).status,400);
  assert.equal((await call("/api/admin/catalog","POST",draft,true,{Origin:"https://wrong.example"})).status,403);
  const upload = new FormData(); upload.append("file",new Blob([await readFile("public/images/al-wafaa-logo.jpeg")],{type:"image/jpeg"}),"logo.jpg");
  const uploaded = await fetch(`${base}/api/admin/upload`,{method:"POST",headers:{Origin:origin,Cookie:cookie},body:upload});
  assert.equal(uploaded.status,201); const media = await uploaded.json();
  const anonymousMedia = await fetch(`${base}${media.url}`); assert.equal(anonymousMedia.status,200); assert.equal(anonymousMedia.headers.get("content-type"),"image/webp");
  const badFile = new FormData(); badFile.append("file",new Blob(["<svg><script>alert(1)</script></svg>"],{type:"image/svg+xml"}),"bad.svg");
  assert.equal((await fetch(`${base}/api/admin/upload`,{method:"POST",headers:{Origin:origin,Cookie:cookie},body:badFile})).status,400);
  const creation = await call("/api/admin/catalog","POST",{...draft,image:media.url},true); assert.equal(creation.status,201); const {item} = await creation.json();
  try {
    // No cookie, separate reader: this must show the same server-backed item.
    const publicResponse = await call("/api/catalog"); assert.match(publicResponse.headers.get("cache-control"),/no-store/);
    assert.ok((await publicResponse.json()).items.some(p=>p.id===item.id));
    const hidden = await call(`/api/admin/catalog/${item.id}`,"PUT",{...draft,titleAr:"قلم معدل",visible:false},true); assert.equal(hidden.status,200);
    assert.ok(!(await (await call("/api/catalog")).json()).items.some(p=>p.id===item.id));
    assert.ok((await (await call("/api/admin/catalog","GET",null,true)).json()).items.some(p=>p.id===item.id&&p.titleAr==="قلم معدل"));
    assert.equal((await call(`/api/admin/catalog/${item.id}`,"PUT",{...draft,titleAr:"قلم منشور معدل"},true)).status,200);
    assert.ok((await (await call("/api/catalog")).json()).items.some(p=>p.id===item.id&&p.titleAr==="قلم منشور معدل"));
  } finally { assert.equal((await call(`/api/admin/catalog/${item.id}`,"DELETE",null,true)).status,200); }
  assert.ok(!(await (await call("/api/catalog")).json()).items.some(p=>p.id===item.id));
  const seeds=(await (await call("/api/catalog")).json()).items;
  assert.equal(seeds.filter(p=>p.category==="invitations").length,36);
  for (const item of seeds.filter(p=>p.image)) assert.equal((await fetch(`${base}${item.image}`)).status,200,item.image);
  assert.equal((await call("/api/auth","DELETE",null,true)).status,200);
});
