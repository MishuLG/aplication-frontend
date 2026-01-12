import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom'; 
import './login.css';
import API_URL from '../../../config';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
  
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }
  
      const data = await response.json();
      const { token } = data;
  
      localStorage.setItem('token', token); 
  
      if (onLoginSuccess) {
        onLoginSuccess(token);
      }
      
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      let msg = error.message;
      if (msg === 'Invalid credentials') msg = 'Credenciales inválidas';
      if (msg === 'User not found') msg = 'Usuario no encontrado';
      
      setErrorMessage(msg || 'Ocurrió un error inesperado');
    }
  };
  
  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/auth/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falló la recuperación de contraseña');
      }

      alert('Se ha enviado un correo de recuperación. Revisa tu bandeja de entrada.');
      setShowRecovery(false);
    } catch (error) {
      console.error('Error durante la recuperación:', error);
      setErrorMessage('Ocurrió un error inesperado. Inténtalo más tarde.');
    }
  };

  return (
    <div className="login-body">
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <Card className="blurred-card" style={{ width: '400px' }}>
          <CardBody>
            <h1 className="text-center">Iniciar Sesión</h1>
            {errorMessage && (
              <Alert color="danger" className="text-center">
                {errorMessage}
              </Alert>
            )}
            <Form onSubmit={handleLogin}>
              <FormGroup>
                <Label for="email">Correo Electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="ejemplo@correo.com"
                />
              </FormGroup>
              <FormGroup>
                <Label for="password">Contraseña</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="********"
                />
              </FormGroup>
              <Button color="dark" type="submit" className="btn-spacing" block>
                Entrar
              </Button>
              <Button
                color="dark"
                className="btn-spacing"
                onClick={() => setShowRecovery(!showRecovery)}
                block
                type="button"
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Form>

            {showRecovery && (
              <Form onSubmit={handlePasswordRecovery} className="mt-3">
                <FormGroup>
                  <Label for="recoveryEmail">Ingresa tu correo</Label>
                  <Input
                    type="email"
                    id="recoveryEmail"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                  />
                </FormGroup>
                <Button type="submit" color="success" block>
                  Recuperar Contraseña
                </Button>
              </Form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;