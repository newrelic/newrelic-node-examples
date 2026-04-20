import React from 'react';

export default function PostFeed({ posts }) {
  return (
    <section className="section">
      <h2>Recent Posts</h2>
      <div className="grid">
        {posts.map(post => (
          <div className="card" key={post.id}>
            <h3 style={{ fontSize: '.95rem', textTransform: 'capitalize' }}>{post.title}</h3>
            <p className="meta" style={{ marginTop: '.5rem' }}>{post.body.slice(0, 80)}…</p>
            <span className="tag">user {post.userId}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
