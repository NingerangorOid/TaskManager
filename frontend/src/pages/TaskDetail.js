// src/pages/TaskDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TaskCard from '../components/TaskCard';
import AttachmentList from '../components/AttachmentList';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTaskAndComments = async () => {
    try {
      setLoading(true);
      const [taskRes, commentsRes] = await Promise.all([
        axios.get(`/tasks/${id}/`),
        axios.get(`/tasks/${id}/comments/`)
      ]);

      let commentsData;
      if (Array.isArray(commentsRes.data)) {
        commentsData = commentsRes.data;
      } else {
        commentsData = commentsRes.data.results || [];
      }

      setTask(taskRes.data);
      setComments(commentsData);
    } catch (err) {
      console.error('Ошибка загрузки задачи или комментариев:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskAndComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`/tasks/${id}/comments/`, { text: newComment });
      setNewComment('');
      loadTaskAndComments();
    } catch (err) {
      console.error('Ошибка добавления комментария:', err);
    }
  };

  if (loading) return <div className="container mt-4">Загрузка...</div>;
  if (!task) return <div className="container mt-4">Задача не найдена</div>;

  return (
    <div className="container mt-4">
      <TaskCard task={task} />

      {/* Вложения */}
      <AttachmentList taskId={id} />

      <h4 className="mt-4">Комментарии</h4>
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="3"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Напишите комментарий..."
        />
        <button className="btn btn-primary mt-2" onClick={handleAddComment}>
          Добавить
        </button>
      </div>

      {Array.isArray(comments) && comments.length === 0 ? (
        <p>Комментариев пока нет.</p>
      ) : (
        Array.isArray(comments) && comments.map(comment => (
          <div key={comment.id} className="list-group-item mb-2">
            <div><strong>{comment.author.username}</strong></div>
            <div>{comment.text}</div>
            <small className="text-muted">{new Date(comment.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskDetail;