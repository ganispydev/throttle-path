import { $, readJSON, params, fmtDate } from './utils.js';

async function init(){
  const id = params.get('id');
  const data = await readJSON('./data/posts.json');
  const idx = data.posts.findIndex(p=>String(p.id)===String(id));
  const p = data.posts[idx];
  if(!p){ $('#article').innerHTML='<p>Post not found.</p>'; return; }

  $('#article').innerHTML = `
    <header>
      <h1>${p.title}</h1>
      <p class="meta">${fmtDate(p.date)} • ${p.author} • <span class="badge">${p.category}</span></p>
      <div class="article-hero"><img src="${p.cover}" alt="${p.title}"/></div>
    </header>
    <section class="article-body">
      <p>${p.content}</p>
      <p><a href="${p.source}" target="_blank" rel="noopener">Read original source →</a></p>
    </section>
  `;
  const prevId = data.posts[idx+1]?.id, nextId = data.posts[idx-1]?.id;
  if(prevId) $('#prev').href = `./article.html?id=${encodeURIComponent(prevId)}`; else $('#prev').style.visibility='hidden';
  if(nextId) $('#next').href = `./article.html?id=${encodeURIComponent(nextId)}`; else $('#next').style.visibility='hidden';
}
init();
