import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import GuitarFretboard from '../components/GuitarFretboard';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    // Check if the user is already authenticated by looking for the token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Inicio de sesión exitoso', data);
        setIsAuthenticated(true);
        setShowLogin(false);
        localStorage.setItem('token', data.token);
      } else {
        console.error('Error en el inicio de sesión');
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerUsername,
          password: registerPassword,
        }),
      });

      if (response.ok) {
        console.log('Registro exitoso');
        setRegistrationSuccess(true);
        setShowRegister(false);
        setRegisterUsername('');
        setRegisterPassword('');
      } else {
        console.error('Error en el registro');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Vamp Jams</title>
        <meta name="description" content="Página de inicio de sesión y registro" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.navbar}>
        {!isAuthenticated ? (
          <>
            <button onClick={() => { setShowLogin(true); setShowRegister(false); }}>Inicio de sesión</button>
            <button onClick={() => { setShowLogin(false); setShowRegister(true); }}>Registrar</button>
          </>
        ) : (
          <button onClick={handleLogout}>Cerrar sesión</button>
        )}
      </nav>

      <main className={styles.main}>
        {showLogin && !isAuthenticated && (
          <form onSubmit={handleLogin} className={styles.form}>
            <h3>Iniciar sesión</h3>
            <input
              type="text"
              placeholder="Correo electrónico"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Iniciar sesión</button>
          </form>
        )}

        {showRegister && (
          <form onSubmit={handleRegister} className={styles.form}>
            <h3>Registrarse</h3>
            <input
              type="text"
              placeholder="Correo electrónico"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <button type="submit">Registrarse</button>
          </form>
        )}

        {isAuthenticated && (
          <div>
            <h2>Bienvenido, {username}!</h2>
          </div>
        )}
        
        {registrationSuccess && (
          <div>
            <h2>Registro exitoso! Ahora puedes iniciar sesión.</h2>
          </div>
        )}

        {/* Show Guitar Fretboard only if authenticated */}
        {isAuthenticated ? (
          <div className={styles.container}>
            <h1 className={styles.title}>Diapasón de Guitarra</h1>
            <GuitarFretboard />
          </div>
        ) : (
          <div className={styles.restrictedAccess}>
            <h2>Por favor, inicie sesión para acceder al diapasón de guitarra.</h2>
          </div>
        )}
      </main>
    </div>
  );
}
