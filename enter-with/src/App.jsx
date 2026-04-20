import React from 'react';
import UserGrid from './components/UserGrid';
import PostFeed from './components/PostFeed';
import CommentSection from './components/CommentSection';
import TodoList from './components/TodoList';

export default function App({ data }) {
  const { users, posts, todos, userPostsResults, commentResults } = data;

  return (
    <div className="page">
      <h1 style={{ marginBottom: '2rem' }}>SSR Dashboard</h1>
      <UserGrid users={users} userPostsResults={userPostsResults} />
      <PostFeed posts={posts} />
      <CommentSection commentResults={commentResults} posts={posts} />
      <TodoList todos={todos} />
    </div>
  );
}
