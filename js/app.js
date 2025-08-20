import { $, $$, fmtDate, slugify, readJSON } from './utils.js';

const PAGE_SIZE = 6;
let posts = [];
let page = 1;
const API_KEY = "565a3582c2af4b049e863d210ec5cffd";  // Your NewsAPI key
const API_URL = `https://newsapi.org/v2/everything?q=motorcycle OR moto3 OR motogp OR superbike&language=en&sortBy=publishedAt&pageSize=30&apiKey=${API_KEY}`;

async function init() {
  try {
    // Try fetching live Moto news
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("NewsAPI fetch failed");
    const data = await res.json();

    posts = data.articles.map((a, i) => ({
      id: slugify(a.title) + "-" + i,
      title: a.title,
      excerpt: a.description || "",
      cover: a.urlToImage || "./assets/placeholder.png",
      author: a.author || "Moto News",
      date: a.publishedAt,
      tags: ["Live"],
      url: a.url
    }));
  } catch (err) {
    console.warn("Falling back to local posts.json ❌", err);
    const localData = await readJSON('./data/posts.json');
    posts = localData.posts;
  }

  posts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
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
  return `
  <article class="card">
    <img src="${p.cover}" alt="${p.title}">
    <div class="pad">
      <div class="badges">${p.tags.map(t => `<span class="badge">${t}</span>`).join(' ')}</div>
      <h3><a href="${p.url ? p.url : './article.html?id=' + encodeURIComponent(p.id)}" target="_blank">${p.title}</a></h3>
      <p class="meta">${fmtDate(p.date)} • ${p.author}</p>
      <p>${p.excerpt}</p>
      <p><a href="${p.url ? p.url : './article.html?id=' + encodeURIComponent(p.id)}" target="_blank">Read more →</a></p>
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
