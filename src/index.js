const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export function validateItem(data) {
  if (!data || typeof data.title !== "string" || typeof data.body !== "string")
    return null;
  const title = data.title.trim(),
    body = data.body.trim();
  return title && title.length <= 120 && body.length <= 2000
    ? { title, body }
    : null;
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url),
      path = url.pathname;
    if (!path.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      if (!["GET", "HEAD"].includes(request.method)) {
        const origin = request.headers.get("Origin");
        if (origin && origin !== url.origin)
          return json({ error: "Please use this app to make changes." }, 403);
        if (!request.headers.get("Content-Type")?.includes("application/json"))
          return json({ error: "Send JSON." }, 415);
        if (Number(request.headers.get("Content-Length")) > 12000)
          return json({ error: "Request too large." }, 413);
      }
      if (path === "/api/items" && request.method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM items ORDER BY created_at DESC, id DESC LIMIT 100",
        ).all();
        return json({ items: results });
      }
      const match = path.match(/^\/api\/items\/([a-f0-9-]{36})$/i);
      if (
        (path === "/api/items" && request.method === "POST") ||
        (match && request.method === "PUT")
      ) {
        const raw = await request.text();
        if (raw.length > 12000)
          return json({ error: "Request too large." }, 413);
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          return json({ error: "Invalid JSON." }, 400);
        }
        const item = validateItem(data);
        if (!item)
          return json(
            {
              error:
                "Use a title of 1–120 characters and details of up to 2,000 characters.",
            },
            400,
          );
        if (match) {
          const result = await env.DB.prepare(
            "UPDATE items SET title = ?, body = ? WHERE id = ?",
          )
            .bind(item.title, item.body, match[1])
            .run();
          if (!result.meta.changes)
            return json({ error: "That item no longer exists." }, 404);
          return json({ id: match[1], ...item });
        }
        const id = crypto.randomUUID();
        await env.DB.prepare(
          "INSERT INTO items (id, title, body) VALUES (?, ?, ?)",
        )
          .bind(id, item.title, item.body)
          .run();
        return json({ id, ...item }, 201);
      }
      if (match && request.method === "DELETE") {
        const result = await env.DB.prepare("DELETE FROM items WHERE id = ?")
          .bind(match[1])
          .run();
        return result.meta.changes
          ? json({ deleted: true })
          : json({ error: "That item no longer exists." }, 404);
      }
      // New API features go here.
      return json({ error: "Not found." }, 404);
    } catch (error) {
      console.error("Request failed:", error.name);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  },
};
