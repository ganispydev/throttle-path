// Universal cache-busting + dynamic header/footer loader
(() => {
  const VERSION = Date.now().toString();
  const bust = (url) => url + (url.includes("?") ? "&" : "?") + "v=" + VERSION;

  async function loadPart(id, file) {
    try {
      const res = await fetch(bust(file), { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${file}`);
      const html = await res.text();
      const host = document.getElementById(id);
      if (host) host.innerHTML = html;
    } catch (e) {
      console.error(e);
    }
  }

  // After footer loads, set year
  function setYear() {
    const y = document.querySelector("#site-footer #y, footer #y");
    if (y) y.textContent = new Date().getFullYear();
  }

  // Bust favicon links (prevents old icon sticking)
  function refreshIcons() {
    const links = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]'));
    links.forEach(link => {
      const href = link.getAttribute("href");
      if (href && !href.includes("v=")) {
        link.setAttribute("href", href + (href.includes("?") ? "&" : "?") + "v=" + VERSION);
      }
    });
  }

  // Bust CSS links
  function refreshStyles() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute("href");
      if (href && !href.includes("v=")) {
        link.setAttribute("href", bust(href));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadPart("site-header", "header.html");
    await loadPart("site-footer", "footer.html");
    setYear();
    refreshIcons();
    refreshStyles();
  });
})();