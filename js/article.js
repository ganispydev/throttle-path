import { $, $$, fmtDate, slugify, readJSON, params } from './utils.js';

async function init() {
  const id = params.get('id');
  let article = null;

  // Try localStorage first
  const stored = localStorage.getItem(`article_${id}`);
  if (stored) {
    article = JSON.parse(stored);
  }

  // Fallback to posts.json
  if (!article) {
    const data = await readJSON('./data/posts.json');
    article = data.posts.find(p => p.id === id || slugify(p.title) === id);
  }

  if (!article) {
    $('#article').innerHTML = `<p>Article not found.</p>`;
    return;
  }

  render(article);
  loadRelated(article);
}

function render(p) {
  $('#article').innerHTML = `
    <h1>${p.title}</h1>
    <p class="meta">${fmtDate(p.date)} • ${p.author || 'Unknown'}</p>
    <img src="${p.cover}" alt="${p.title}">
    <p>${p.content || p.excerpt || ''}</p>
    ${p.url ? `<p><a href="${p.url}" target="_blank">Read full article →</a></p>` : ''}
  `;
}

async function loadRelated(current) {
  const data = await readJSON('./data/posts.json');
  const related = data.posts
    .filter(p => p.id !== current.id && p.tags?.some(t => current.tags?.includes(t)))
    .slice(0, 3);

  $('#related').innerHTML = related.map(p => {
    const id = encodeURIComponent(p.id);
    const safeJSON = JSON.stringify(p).replace(/"/g, '&quot;');
    return `
    <article class="card">
      <img src="${p.cover}" alt="${p.title}">
      <div class="pad">
        <h3>
          <a href="./article.html?id=${id}" 
             onclick='localStorage.setItem("article_${id}", "${safeJSON}")'>
             ${p.title}
          </a>
        </h3>
        <p class="meta">${fmtDate(p.date)} • ${p.author}</p>
      </div>
    </article>`;
  }).join('');
}

init();
