import { $, $$, fmtDate, slugify, readJSON } from './utils.js';

const PAGE_SIZE = 6;
let posts = [];
let page = 1;

async function init() {
  const data = await readJSON('./data/posts.json');
  posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  render();

  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const q = ($('#q').value || '').trim().toLowerCase();
    const filtered = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
    page = 1;
    render(filtered);
  });
}

function render(list = posts) {
  const start = (page - 1) * PAGE_SIZE;
  const view = list.slice(start, start + PAGE_SIZE);
  $('#feed').innerHTML = view.map(card).join('');
  pager(list.length);
}

function card(p) {
  const id = encodeURIComponent(p.id || slugify(p.title));
  const safeJSON = JSON.stringify(p).replace(/"/g, '&quot;');

  return `
  <article class="card">
    <img src="${p.cover}" alt="${p.title}">
    <div class="pad">
      <div class="badges">${p.tags.map(t => `<span class="badge">${t}</span>`).join(' ')}</div>
      <h3>
        <a href="./article.html?id=${id}" 
           onclick='localStorage.setItem("article_${id}", "${safeJSON}")'>
          ${p.title}
        </a>
      </h3>
      <p class="meta">${fmtDate(p.date)} • ${p.author}</p>
      <p>${p.excerpt}</p>
      <p>
        <a href="./article.html?id=${id}" 
           onclick='localStorage.setItem("article_${id}", "${safeJSON}")'>
          Read more →
        </a>
      </p>
    </div>
  </article>`;
}

function pager(total) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  $('#pager').innerHTML = Array.from({ length: pages }, (_, i) => `
    <button ${i + 1 === page ? 'aria-current="page"' : ''} data-p="${i + 1}">${i + 1}</button>
  `).join('');
  $$('#pager button').forEach(b => b.onclick = () => { page = parseInt(b.dataset.p, 10); render(); });
}

init();