// src/pages/Dashboard.js
import React from 'react';
import TaskList from '../components/TaskList';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleTaskClick = (taskId) => {
    navigate(`/task/${taskId}`);
  };

  return (
    <div className="container mt-4">
      <h2>Панель задач</h2>
      <TaskList onTaskClick={handleTaskClick} />
    </div>
  );
};

export default Dashboard;