import React from 'react';

export default function TodoList({ todos }) {
  const done = todos.filter(t => t.completed).length;

  return (
    <section className="section">
      <h2>Todos <span className="tag">{done}/{todos.length} done</span></h2>
      <div className="grid">
        {todos.map(todo => (
          <div className="card" key={todo.id} style={{ opacity: todo.completed ? 0.5 : 1 }}>
            <p style={{ margin: 0, fontSize: '.9rem', textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </p>
            <span className="tag" style={{ marginTop: '.5rem', background: todo.completed ? '#d1fae5' : '#fee2e2', color: todo.completed ? '#065f46' : '#991b1b' }}>
              {todo.completed ? 'done' : 'pending'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
