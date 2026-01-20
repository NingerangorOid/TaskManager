// src/pages/TaskDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchTask();
    fetchComments();
    fetchAttachments();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`/tasks/${id}/`, { withCredentials: true });
      setTask(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке задачи');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/tasks/${id}/comments/`, { withCredentials: true });
      setComments(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке комментариев');
      setComments([]);
    }
  };

  const fetchAttachments = async () => {
    try {
      const response = await axios.get(`/tasks/${id}/attachments/`, { withCredentials: true });
      setAttachments(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке вложений');
      setAttachments([]);
    }
  };

  if (!task) return <div>Загрузка...</div>;

  return (
    <div className="container mt-4">
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <div className="mb-3">
        <strong>Статус:</strong> {task.status}
      </div>
      <div className="mb-3">
        <strong>Исполнитель:</strong> {task.assignee?.username || 'Не назначен'}
      </div>

      <h3>Комментарии ({comments.length})</h3>
      {comments.length > 0 ? (
        <ul className="list-group">
          {comments.map(comment => (
            <li key={comment.id} className="list-group-item">
              <p>{comment.text}</p>
              <small>Автор: {comment.author.username}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет комментариев</p>
      )}

      <h3>Вложения ({attachments.length})</h3>
      {attachments.length > 0 ? (
        <ul className="list-group">
          {attachments.map(att => (
            <li key={att.id} className="list-group-item">
              {att.file_name}
              <br />
              <small>Загрузил: {att.uploaded_by.username}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет вложений</p>
      )}

      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Назад
      </button>
    </div>
  );
};

export default TaskDetail;