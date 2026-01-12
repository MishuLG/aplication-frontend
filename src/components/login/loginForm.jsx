import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../../config';
import schoolImage from '../../assets/images/imagen_escuela.jpeg'; 
import '../../css/login.css'; 

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const navigate = useNavigate();

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      if (onLoginSuccess) onLoginSuccess(data.token);
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage('Credenciales incorrectas o error de conexión');
    }
  };

  // --- LÓGICA DE RECUPERACIÓN ---
  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const response = await fetch(`${API_URL}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      if (!response.ok) throw new Error('Error al enviar solicitud');

      alert('Enlace enviado. Por favor revisa tu correo.');
      setShowRecovery(false);
    } catch (error) {
      setErrorMessage('No se pudo enviar el correo de recuperación.');
    }
  };

  return (
    <div 
      className="login-container" 
      style={{ backgroundImage: `url(${schoolImage})` }} 
    >
      <div className="login-overlay"></div>

      <div className="glass-card">
        <h1 className="login-title">
          {showRecovery ? 'Recuperar Cuenta' : 'Bienvenido'}
        </h1>
        <p className="login-subtitle">
          {showRecovery ? 'Ingresa tu correo registrado' : 'Sistema de Gestión Escolar'}
        </p>

        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}

        {!showRecovery ? (
          /* FORMULARIO DE INICIO DE SESIÓN */
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="usuario@escuela.edu"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn-login">
              Ingresar
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => setShowRecovery(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : (
          /* FORMULARIO DE RECUPERACIÓN */
          <form onSubmit={handlePasswordRecovery}>
            <div className="form-group">
              <label className="form-label">Tu Correo Electrónico</label>
              <input
                type="email"
                className="glass-input"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
                placeholder="usuario@escuela.edu"
              />
            </div>

            <button type="submit" className="btn-login" style={{ background: '#10b981' }}>
              Enviar Enlace
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => setShowRecovery(false)}
            >
              ← Volver al inicio
            </button>
          </form>
        )}
      </div>

      <div className="login-footer">
        © 2026 Lendy Bustamante. Todos los derechos reservados.
      </div>
    </div>
  );
};

export default LoginForm;