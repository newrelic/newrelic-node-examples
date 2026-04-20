import React from 'react';

export default function UserGrid({ users, userPostsResults }) {
  const postCountByUser = Object.fromEntries(
    userPostsResults.map(({ userId, posts }) => [userId, posts.length])
  );

  return (
    <section className="section">
      <h2>Users</h2>
      <div className="grid">
        {users.map(user => (
          <div className="card" key={user.id}>
            <h3>{user.name}</h3>
            <p className="meta">{user.email}</p>
            <p className="meta">{user.company.name}</p>
            <span className="tag">{postCountByUser[user.id] ?? 0} posts</span>
          </div>
        ))}
      </div>
    </section>
  );
}
