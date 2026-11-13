import { test } from "node:test";
import assert from "node:assert/strict";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { readFile } from "node:fs/promises";
import worker from "../src/index.js";

// Real local D1 engine; no fake SQL adapter.
test("D1 CRUD, validation, missing records and cross-origin writes", async () => {
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      workers: [
        {
          name: "test",
          modules: true,
          script: 'export default { fetch(){return new Response("test")} }',
          d1Databases: ["DB"],
          compatibilityDate: "2026-09-09",
        },
      ],
    }),
  );
  try {
    const DB = await mf.getD1Database("DB");
    await DB.exec(
      (
        await readFile(
          new URL("../migrations/0001_items.sql", import.meta.url),
          "utf8",
        )
      ).replaceAll("\n", " "),
    );
    const call = (path, method = "GET", body, headers = {}) =>
      worker.fetch(
        new Request(`http://localhost${path}`, {
          method,
          headers: { "Content-Type": "application/json", ...headers },
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
        { DB },
      );
    assert.equal(
      (await call("/api/items", "POST", { title: " ", body: "" })).status,
      400,
    );
    assert.equal(
      (
        await call(
          "/api/items",
          "POST",
          { title: "x", body: "" },
          { Origin: "https://elsewhere.test" },
        )
      ).status,
      403,
    );
    let res = await call("/api/items", "POST", {
      title: "Plant care",
      body: "<script>alert(1)</script>",
    });
    assert.equal(res.status, 201);
    const item = await res.json();
    assert.equal(
      (await (await call("/api/items")).json()).items[0].body,
      "<script>alert(1)</script>",
    );
    assert.equal(
      (
        await call(`/api/items/${item.id}`, "PUT", {
          title: "New title",
          body: "New details",
        })
      ).status,
      200,
    );
    assert.equal(
      (await (await call("/api/items")).json()).items[0].title,
      "New title",
    );
    assert.equal((await call(`/api/items/${item.id}`, "DELETE")).status, 200);
    assert.equal(
      (
        await call(`/api/items/${item.id}`, "PUT", {
          title: "Missing",
          body: "",
        })
      ).status,
      404,
    );
    assert.equal((await (await call("/api/items")).json()).items.length, 0);
  } finally {
    await mf.dispose();
  }
});
