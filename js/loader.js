// Dynamically load header & footer into each page
async function loadPart(id, file) {
  const el = document.getElementById(id);
  if (el) {
    try {
      const res = await fetch(file);
      const html = await res.text();
      el.innerHTML = html;
    } catch (err) {
      console.error(`Failed to load ${file}:`, err);
    }
  }
}

loadPart("site-header", "header.html");
loadPart("site-footer", "footer.html");