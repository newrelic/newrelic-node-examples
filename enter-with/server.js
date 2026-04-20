const https = require('https');
const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const axios = require('axios');
const App = require('./src/App').default;

const app = express();
const PORT = process.env.PORT || 3000;
const BASE = 'https://jsonplaceholder.typicode.com';

// Allow self-signed certs in dev/demo environments
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const http = axios.create({ httpsAgent });

async function fetchDashboardData() {
  console.log('[phase-1] parallel bootstrap: users, posts, todos, albums');
  const [usersRes, postsRes, todosRes, albumsRes] = await Promise.all([
    http.get(`${BASE}/users`),
    http.get(`${BASE}/posts`),
    http.get(`${BASE}/todos`),
    http.get(`${BASE}/albums`),
  ]);

  const users = usersRes.data.slice(0, 5);
  const posts = postsRes.data.slice(0, 10);
  const todos = todosRes.data.slice(0, 10);
  const albums = albumsRes.data.slice(0, 5);

  console.log('[phase-2+3] cascading: posts-per-user (5) + comments-per-post (5)');
  const [userPostsResults, commentResults] = await Promise.all([
    Promise.all(
      users.map(u =>
        http.get(`${BASE}/posts?userId=${u.id}`).then(r => ({
          userId: u.id,
          posts: r.data,
        }))
      )
    ),
    Promise.all(
      posts.slice(0, 5).map(p =>
        http.get(`${BASE}/comments?postId=${p.id}`).then(r => ({
          postId: p.id,
          comments: r.data,
        }))
      )
    ),
  ]);

  console.log('[phase-4] photo thumbnails for each album (5 calls)');
  const photoResults = await Promise.all(
    albums.map(a =>
      http.get(`${BASE}/photos?albumId=${a.id}`).then(r => ({
        albumId: a.id,
        photos: r.data.slice(0, 4),
      }))
    )
  );

  return { users, posts, todos, albums, userPostsResults, commentResults, photoResults };
}

app.get('/', async (req, res) => {
  const start = Date.now();
  try {
    const data = await fetchDashboardData();
    const elapsed = Date.now() - start;
    console.log(`[ssr] data fetch complete in ${elapsed}ms — rendering`);

    const html = renderToString(React.createElement(App, { data }));

    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SSR Dashboard</title>
    <style>
      body { font-family: sans-serif; margin: 0; background: #f5f5f5; color: #222; }
      h1, h2, h3 { margin: 0 0 .5rem; }
      .page { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
      .card { background: #fff; border-radius: 6px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
      .section { margin-bottom: 2rem; }
      .tag { display: inline-block; font-size: .75rem; background: #e0e7ff; color: #3730a3; border-radius: 4px; padding: 2px 6px; margin: 2px; }
      .meta { font-size: .8rem; color: #666; }
      .comment { border-left: 3px solid #e5e7eb; padding-left: .75rem; margin: .5rem 0; font-size: .85rem; }
    </style>
  </head>
  <body>
    <div id="root">${html}</div>
    <footer style="text-align:center;padding:1rem;color:#999;font-size:.8rem">
      Data fetched in ${elapsed}ms via ${14} axios calls across 4 phases
    </footer>
  </body>
</html>`);
  } catch (err) {
    console.error('[ssr] error:', err.message);
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

// Dev-only: force GC and return heap stats for leak monitoring
app.get('/_gc', (req, res) => {
  const before = process.memoryUsage();
  if (typeof global.gc === 'function') global.gc();
  const after = process.memoryUsage();
  res.json({
    freed: Math.round((before.heapUsed - after.heapUsed) / 1024 / 1024 * 10) / 10,
    heapUsed: Math.round(after.heapUsed / 1024 / 1024 * 10) / 10,
    heapTotal: Math.round(after.heapTotal / 1024 / 1024 * 10) / 10,
    rss: Math.round(after.rss / 1024 / 1024 * 10) / 10,
    external: Math.round(after.external / 1024 / 1024 * 10) / 10,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
