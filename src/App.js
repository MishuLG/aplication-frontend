import React, { Component, Suspense } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import './scss/style.scss'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

// --- CORRECCIÓN: Importamos TU componente personalizado ---
const LoginForm = React.lazy(() => import('./components/login/loginForm.jsx')); 

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: !!localStorage.getItem('token'), // Usamos 'token' estandarizado
      lastActivity: Date.now()
    };
    this.inactivityTimer = null;
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.resetTimer);
    window.addEventListener('keypress', this.resetTimer);
    window.addEventListener('click', this.resetTimer);
    this.inactivityTimer = setInterval(this.checkInactivity, 60000); 
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.resetTimer);
    window.removeEventListener('keypress', this.resetTimer);
    window.removeEventListener('click', this.resetTimer);
    clearInterval(this.inactivityTimer);
  }

  resetTimer = () => {
    this.setState({ lastActivity: Date.now() });
  }

  checkInactivity = () => {
    if (!this.state.isAuthenticated) return;
    const timeout = 15 * 60 * 1000; // 15 minutos
    if (Date.now() - this.state.lastActivity > timeout) {
      this.handleLogout();
      alert("Su sesión ha expirado por inactividad.");
    }
  }

  handleLogin = (token) => {
    localStorage.setItem('token', token); // Guardamos el token
    this.setState({ isAuthenticated: true, lastActivity: Date.now() });
  }

  handleLogout = () => {
    localStorage.removeItem('token');
    this.setState({ isAuthenticated: false });
    window.location.href = '#/login';
  }

  render() {
    return (
      <HashRouter>
        <Suspense fallback={loading}>
          <Routes>
            <Route 
              exact 
              path="/login" 
              name="Login Page" 
              element={
                !this.state.isAuthenticated ? (
                  // Pasamos la función handleLogin como prop
                  <LoginForm onLoginSuccess={this.handleLogin} />
                ) : (
                  <Navigate to="/dashboard" />
                )
              } 
            />
            <Route exact path="/register" name="Register Page" element={<Register />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route 
              path="*" 
              name="Home" 
              element={
                this.state.isAuthenticated ? (
                  <DefaultLayout onLogout={this.handleLogout} /> 
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </Suspense>
      </HashRouter>
    )
  }
}

export default App