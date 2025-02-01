import React, { useState } from 'react';
import Login from './loginForm';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const handleLogin = async (email, password) => {
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
        } else {
            alert(data.message);
        }
    };

    const handlePasswordReset = async (email) => {
        const response = await fetch('http://localhost:4000/api/password-reset/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
            alert('Recovery email sent');
        } else {
            alert(data.message);
        }
    };

    return (
        <div>
            {!token ? (
                <Login onLogin={handleLogin} onPasswordReset={handlePasswordReset} />
            ) : (
                <div>
                    <h1>Welcome</h1>
                    <button onClick={() => localStorage.removeItem('token') && setToken(null)}>Logout</button>
                </div>
            )}
        </div>
    );
};

export default App;
