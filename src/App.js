import React, { Suspense, useEffect, useState } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import Dashboard from './views/dashboard/Dashboard';



import { fetchUsers, addUser, updateUser, deleteUser } from './fetch'; 

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const LoginForm = React.lazy(() => import('./components/login/loginForm'));
const Profile = React.lazy(() => import('./components/profile/profile'))
const UserCRUD = React.lazy(() => import('./components/users/UserCRUD'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]);

  const handleLogin = async (user) => {
    const { email, password } = user;

    console.log("Attempting to log in with:", { email, password });

    try {
      const users = await fetchUsers(); 

      const authenticatedUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (authenticatedUser) {
        console.log("User logged in:", authenticatedUser);
        authenticatedUser.isActive = true;

        await updateUser(authenticatedUser.id, authenticatedUser); 

        setCurrentUser(authenticatedUser); 
        setIsAuthenticated(true);
      } else {
        alert('Incorrect credentials. Try again.');
        console.log("No matching user found.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (isColorModeSet()) {
      return;
    }

    setColorMode(storedTheme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
        {!currentUser ? (
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        ) : (
          <>
            <Route path="/users" element={<UserCRUD users={users} setUsers={setUsers} />} />
            <Route path="/profile" element={<Profile currentUser={currentUser} setUsers={setUsers} />} />
            <Route path="*" element={<DefaultLayout currentUser={currentUser} />} />
          </>
        )}
          <Route path="/register" name="Register Page" element={<Register />} />
          <Route path="/404" name="Page 404" element={<Page404 />} />
          <Route path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;