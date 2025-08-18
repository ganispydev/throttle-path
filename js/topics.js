import { $, readJSON } from './utils.js';

async function init(){
  const data = await readJSON('./data/posts.json');
  const tags = [...new Set(data.posts.flatMap(p=>p.tags))].sort();
  $('#topics').innerHTML = tags.map(t=>`
    <div class="topic">
      <h3>#${t}</h3>
      <ul>
        ${data.posts.filter(p=>p.tags.includes(t)).slice(0,5).map(p=>`<li><a href="./article.html?id=${p.id}">${p.title}</a></li>`).join('')}
      </ul>
    </div>
  `).join('');
}
init();
