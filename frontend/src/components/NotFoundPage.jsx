// src/components/NotFoundPage.js
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mt-5 text-center">
      <h1>404</h1>
      <p className="lead">Страница не найдена</p>
      <div className="alert alert-warning mt-4">
        <p>Вы пытаетесь перейти по некорректному адресу.
           Через 3 секунды вы будете перенаправлены на главную страницу.</p>
      </div>
    </div>
  );
};