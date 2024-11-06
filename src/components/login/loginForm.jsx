import React, { useState } from 'react';
import { Button, Card, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import './login.css'

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handlePasswordRecovery = (e) => {
    e.preventDefault();
    alert(`A recovery link has been sent to ${email}`);
  };

  return (
    <div className="login-body">
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Card style={{ width: '400px' }}>
        <CardBody>
          <h1 className="text-center">Login</h1>
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
            <Button type="submit" color="primary" block>Entrar</Button>
            <Button color="link" onClick={() => setShowRecovery(!showRecovery)} block>
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
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </FormGroup>
              <Button type="submit" color="success" block>Recover Password</Button>
            </Form>
          )}
        </CardBody>
      </Card>
    </div>

    </div>
    
  );
};

export default LoginForm;