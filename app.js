const $ = (id) => document.getElementById(id);
const KEY = "invoice-demo-v1";
const today = () => new Date().toISOString().slice(0, 10);
let items = [{ d: "Website design (5 pages)", q: 1, p: 900 }, { d: "Logo and brand sheet", q: 1, p: 250 }, { d: "Hosting setup", q: 2, p: 40 }];
function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s) { items = s.items; ["from", "to", "no", "date", "cur", "tax", "disc", "notes"].forEach((k) => { if (s[k] != null) $(k).value = s[k]; }); } } catch (e) {} if (!$("date").value) $("date").value = today(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify({ items, from: $("from").value, to: $("to").value, no: $("no").value, date: $("date").value, cur: $("cur").value, tax: $("tax").value, disc: $("disc").value, notes: $("notes").value })); } catch (e) {} }
const num = (v, max = 1e9) => { const n = parseFloat(v); return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0; };
const money = (n) => new Intl.NumberFormat("en", { style: "currency", currency: $("cur").value }).format(n);
function rowsForm() {
  $("items").innerHTML = items.map((it, i) => `<div class="item"><label class="d">Description<input data-i="${i}" data-f="d" maxlength="120" value=""></label><label>Qty<input data-i="${i}" data-f="q" type="number" min="0" step="1" inputmode="decimal"></label><label>Price<input data-i="${i}" data-f="p" type="number" min="0" step="0.01" inputmode="decimal"></label><button type="button" class="x" data-del="${i}" aria-label="Remove item ${i + 1}">×</button></div>`).join("");
  $("items").querySelectorAll("input").forEach((el) => { const it = items[+el.dataset.i]; el.value = it[el.dataset.f]; });
}
function render() {
  const sub = items.reduce((a, it) => a + num(it.q, 1e6) * num(it.p), 0), dr = num($("disc").value, 100), tr = num($("tax").value, 100);
  const disc = sub * dr / 100, tax = (sub - disc) * tr / 100;
  $("pFrom").textContent = $("from").value || "Your business"; $("pNo").textContent = $("no").value || "-"; $("pDate").textContent = $("date").value || "-"; $("pTo").textContent = $("to").value || "Client name";
  $("pRows").innerHTML = ""; items.forEach((it) => { const tr_ = document.createElement("tr"); [[it.d || "-", ""], [num(it.q, 1e6), "n"], [money(num(it.p)), "n"], [money(num(it.q, 1e6) * num(it.p)), "n"]].forEach(([t, c]) => { const td = document.createElement("td"); td.textContent = t; if (c) td.className = c; tr_.appendChild(td); }); $("pRows").appendChild(tr_); });
  $("tSub").textContent = money(sub); $("tDisc").textContent = "-" + money(disc); $("tTaxL").textContent = `Tax (${tr}%)`; $("tTax").textContent = money(tax); $("tTot").textContent = money(sub - disc + tax); $("pNotes").textContent = $("notes").value;
  const bad = !$("from").value.trim() || !$("to").value.trim() || items.length === 0 || items.every((it) => !num(it.p));
  $("err").hidden = !bad; $("err").textContent = bad ? "Add your business, a client and at least one priced item before sending." : "";
  save();
}
$("form").addEventListener("input", (e) => { const t = e.target; if (t.dataset.i != null) { items[+t.dataset.i][t.dataset.f] = t.dataset.f === "d" ? t.value : t.value; } render(); });
$("form").addEventListener("click", (e) => { const d = e.target.dataset.del; if (d != null) { items.splice(+d, 1); rowsForm(); render(); } });
$("add").onclick = () => { if (items.length >= 30) return; items.push({ d: "", q: 1, p: 0 }); rowsForm(); render(); const l = $("items").querySelectorAll("input[data-f=d]"); l[l.length - 1].focus(); };
$("print").onclick = () => window.print();
$("reset").onclick = () => { items = [{ d: "", q: 1, p: 0 }]; $("to").value = ""; $("no").value = "INV-" + String(Math.floor(Math.random() * 900) + 100); $("date").value = today(); $("disc").value = 0; rowsForm(); render(); };
$("form").addEventListener("submit", (e) => e.preventDefault());
load(); rowsForm(); render();
