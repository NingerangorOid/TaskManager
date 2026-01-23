// src/components/AttachmentList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttachmentList = ({ taskId }) => {
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const res = await axios.get(`/tasks/${taskId}/attachments/`);
        setAttachments(res.data);
      } catch (err) {
        console.error('Ошибка загрузки вложений:', err);
      }
    };
    fetchAttachments();
  }, [taskId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 20 МБ.');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post(`/tasks/${taskId}/attachments/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      const res = await axios.get(`/tasks/${taskId}/attachments/`);
      setAttachments(res.data);
      setFile(null);
    } catch (err) {
      console.error('Ошибка загрузки файла:', err);
      setError('Не удалось загрузить файл');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      await axios.delete(`/tasks/${taskId}/attachments/${attachmentId}/`, {
        withCredentials: true,
      });
      // Обновляем список
      const res = await axios.get(`/tasks/${taskId}/attachments/`);
      setAttachments(res.data);
    } catch (err) {
      console.error('Ошибка удаления файла:', err);
      setError('Не удалось удалить файл');
    }
  };

  return (
    <div className="mt-4">
      <h5>Вложения</h5>

      {attachments.length > 0 ? (
        <ul className="list-group mb-3">
          {attachments.map((att) => (
            <li key={att.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <a href={att.file} target="_blank" rel="noopener noreferrer">
                  {att.file.split('/').pop()}
                </a>
                <small className="d-block text-muted">
                  Загружен: {new Date(att.uploaded_at).toLocaleString()}
                </small>
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(att.id)}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет вложений</p>
      )}

      {/* Форма загрузки */}
      <form onSubmit={handleUpload}>
        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {error && <div className="text-danger mt-1">{error}</div>}
        </div>
        <button
          type="submit"
          className="btn btn-outline-primary"
          disabled={!file || uploading}
        >
          {uploading ? 'Загрузка...' : 'Загрузить файл'}
        </button>
      </form>
    </div>
  );
};

export default AttachmentList;