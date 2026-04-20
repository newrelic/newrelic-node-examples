import React from 'react';

export default function CommentSection({ commentResults, posts }) {
  const postTitleById = Object.fromEntries(posts.map(p => [p.id, p.title]));

  return (
    <section className="section">
      <h2>Comments (first 5 posts)</h2>
      {commentResults.map(({ postId, comments }) => (
        <div className="card" key={postId} style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '.9rem', textTransform: 'capitalize' }}>
            Post {postId}: {postTitleById[postId]}
          </h3>
          {comments.slice(0, 3).map(c => (
            <div className="comment" key={c.id}>
              <strong>{c.name.slice(0, 40)}</strong>
              <p className="meta">{c.body.slice(0, 100)}…</p>
            </div>
          ))}
          {comments.length > 3 && (
            <p className="meta">+{comments.length - 3} more comments</p>
          )}
        </div>
      ))}
    </section>
  );
}
