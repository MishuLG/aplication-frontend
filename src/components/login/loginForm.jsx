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

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate(); 

  const API_URL = 'http://localhost:4000/api/auth'; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
  
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
  
      const data = await response.json();
      const { token } = data;
  
      localStorage.setItem('authToken', token);
  
      onLoginSuccess(data.user);
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
    }
  };
  
  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password recovery failed');
      }

      alert('A recovery email has been sent. Check your inbox.');
      setShowRecovery(false);
    } catch (error) {
      console.error('Error during password recovery:', error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
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
            <h1 className="text-center">Login</h1>
            {errorMessage && (
              <Alert color="danger" className="text-center" timeout={3000}>
                {errorMessage}
              </Alert>
            )}
            <Form onSubmit={handleLogin}>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormGroup>
              <Button color="dark" type="submit" className="btn-spacing" block>
                Enter
              </Button>
              <Button
                color="dark"
                className="btn-spacing"
                onClick={() => setShowRecovery(!showRecovery)}
                block
              >
                Forgot your password?
              </Button>
            </Form>

            {showRecovery && (
              <Form onSubmit={handlePasswordRecovery} className="mt-3">
                <FormGroup>
                  <Label for="recoveryEmail">Enter your email</Label>
                  <Input
                    type="email"
                    id="recoveryEmail"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                  />
                </FormGroup>
                <Button type="submit" color="success" block>
                  Recover Password
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
