// src/pages/Tasks.jsx
import React from 'react';

const TasksPage = () => {
  return (
    <div className="container mt-4">
      <h2>Мои задачи</h2>
      <p className="text-muted">Здесь будет список задач. Пока что — заглушка.</p>
      <div className="card p-4 bg-light">
        <h5>Задача #1 (пример)</h5>
        <p>Описание задачи...</p>
        <span className="badge bg-primary">В работе</span>
      </div>
    </div>
  );
};

export default TasksPage;