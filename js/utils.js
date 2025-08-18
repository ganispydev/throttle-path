const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const fmtDate = iso => new Date(iso).toLocaleDateString(undefined, {year:'numeric',month:'short',day:'numeric'});
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const readJSON = url => fetch(url).then(r=>r.json());
const params = new URLSearchParams(location.search);
export { $, $$, fmtDate, slugify, readJSON, params };
