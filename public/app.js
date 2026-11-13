const $ = (selector) => document.querySelector(selector);
let items = [],
  editingId = null;
export async function api(path, method = "GET", data) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Request failed. Please try again.");
  return result;
}
export function status(message, error = false) {
  $("#status").textContent = message;
  $("#status").classList.toggle("error", error);
}
export async function load() {
  try {
    items = (await api("/api/items")).items;
    render();
  } catch (error) {
    status(error.message, true);
  }
}
function reset() {
  editingId = null;
  $("#item-form").reset();
  $("#save").textContent = "Save";
  $("#cancel").hidden = true;
}
function render() {
  $("#count").textContent =
    String(items.length);
  $("#items").replaceChildren();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No items yet.";
    $("#items").append(empty);
  }
  for (const item of items) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = item.id;
    const title = document.createElement("h3");
    title.textContent = item.title;
    const body = document.createElement("p");
    body.textContent = item.body;
    const actions = document.createElement("div");
    actions.className = "actions";
    const edit = document.createElement("button");
    edit.className = "quiet";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", `Edit ${item.title}`);
    edit.onclick = () => {
      editingId = item.id;
      $("#title").value = item.title;
      $("#body").value = item.body;
      $("#save").textContent = "Save changes";
      $("#cancel").hidden = false;
      $("#title").focus();
    };
    const remove = document.createElement("button");
    remove.className = "quiet";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete ${item.title}`);
    remove.onclick = async () => {
      if (!confirm(`Delete “${item.title}”?`)) return;
      remove.disabled = true;
      try {
        await api(`/api/items/${item.id}`, "DELETE");
        if (editingId === item.id) reset();
        await load();
        status("Deleted.");
      } catch (error) {
        status(error.message, true);
        remove.disabled = false;
      }
    };
    actions.append(edit, remove);
    card.append(title, body, actions);
    $("#items").append(card);
  }
  document.dispatchEvent(new CustomEvent("board:loaded", { detail: items }));
}
$("#cancel").onclick = reset;
$("#item-form").onsubmit = async (event) => {
  event.preventDefault();
  $("#save").disabled = true;
  try {
    await api(
      editingId ? `/api/items/${editingId}` : "/api/items",
      editingId ? "PUT" : "POST",
      { title: $("#title").value, body: $("#body").value },
    );
    reset();
    await load();
    status("Saved.");
  } catch (error) {
    status(error.message, true);
  } finally {
    $("#save").disabled = false;
  }
};
load();
