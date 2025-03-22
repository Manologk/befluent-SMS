# Implementing Login, Logout, and Attaching Access Tokens in React (TypeScript)

This guide demonstrates how to manage user authentication and attach access tokens to API requests in a React app using TypeScript.

---

## **1. Set Up Project**
Install necessary dependencies:
```bash
npm install axios react-router-dom jwt-decode
```

---

## **2. Create Auth Context**
The `AuthContext` will manage the token and provide utilities for login and logout.

### `AuthContext.tsx`
```tsx
import React, { createContext, useState, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## **3. Create Axios Instance with Interceptor**

### `apiClient.ts`
```tsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## **4. Implement Login and Logout**

### `Login.tsx`
```tsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import apiClient from './apiClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const token = response.data.token;
      login(token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
```

### `Logout.tsx`
```tsx
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';

const Logout = () => {
  const { logout } = useContext(AuthContext)!;

  const handleLogout = () => {
    logout();
    window.location.href = '/login'; // Redirect to login
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
```

---

## **5. Protect Routes**
Use a wrapper for protected routes.

### `ProtectedRoute.tsx`
```tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useContext(AuthContext)!;

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## **6. Routing Setup**

### `App.tsx`
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './Login';
import Logout from './Logout';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
```

---

## **7. Example API Call**
Use `apiClient` to make authenticated requests.

### `Dashboard.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import apiClient from './apiClient';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/protected-data');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
};

export default Dashboard;
```

---

## **8. Logout Behavior**
The `Logout` component ensures token cleanup and redirection to the login page.

---

This structure ensures secure and clean handling of authentication in a React-Typescript application.