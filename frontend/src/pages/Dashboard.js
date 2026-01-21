// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);
  const [currentPageUrl, setCurrentPageUrl] = useState('/tasks/'); // ← текущий URL страницы

  const fetchTasksAndUser = async (url = '/tasks/') => {
    try {
      setLoading(true);
      const [tasksRes, userRes] = await Promise.all([
        axios.get(url),
        axios.get('/whoami/')
      ]);

      // Пагинация включена → ожидаем объект с results
      if (tasksRes.data.results !== undefined) {
        setTasks(tasksRes.data.results);
        setNextPage(tasksRes.data.next);
        setPrevPage(tasksRes.data.previous);
        setCurrentPageUrl(url);
      } else {
        // Без пагинации — просто массив
        setTasks(tasksRes.data);
        setNextPage(null);
        setPrevPage(null);
        setCurrentPageUrl('/tasks/');
      }

      setCurrentUserIsAdmin(userRes.data.user.is_staff);
    } catch (err) {
      console.error('Ошибка загрузки задач или профиля:', err);
      setTasks([]);
      setNextPage(null);
      setPrevPage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndUser();
  }, []);

  // Перезагружаем текущую страницу после удаления
  const handleTaskDeleted = () => {
    fetchTasksAndUser(currentPageUrl);
  };

  if (loading) return <div className="container mt-4">Загрузка...</div>;

  return (
    <div className="container mt-4">
      <h2>Панель задач</h2>

      {Array.isArray(tasks) && tasks.length === 0 ? (
        <p>У вас пока нет задач.</p>
      ) : (
        Array.isArray(tasks) && tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            current_user_is_admin={currentUserIsAdmin}
            onTaskDeleted={handleTaskDeleted} // ← перезагружает текущую страницу
          />
        ))
      )}

      {/* Пагинация */}
      {(nextPage || prevPage) && (
        <div className="mt-4 d-flex justify-content-center">
          {prevPage && (
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => fetchTasksAndUser(prevPage)}
            >
              Предыдущая
            </button>
          )}
          {nextPage && (
            <button
              className="btn btn-outline-primary"
              onClick={() => fetchTasksAndUser(nextPage)}
            >
              Следующая
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;