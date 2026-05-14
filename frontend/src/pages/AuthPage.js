import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useTranslation from '../i18n/useTranslation';

function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await login(formData.username, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrors(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await register(formData.username, formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrors(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrors({}); }}
          >
            {t('auth.loginTab')}
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrors({}); }}
          >
            {t('auth.registerTab')}
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-username">{t('auth.username')}</label>
              <input
                id="login-username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="login-password">{t('auth.password')}</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            {errors.detail && <p className="form-error">{errors.detail}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? t('auth.loggingIn') : t('auth.loginButton')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="register-username">{t('auth.username')}</label>
              <input
                id="register-username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="register-email">{t('auth.email')}</label>
              <input
                id="register-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="register-password">{t('auth.password')}</label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            {errors.detail && <p className="form-error">{errors.detail}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.registerButton')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
