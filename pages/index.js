import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    // Aquí iría la lógica de inicio de sesión
    console.log('Iniciar sesión con:', { username, password });
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    // Aquí iría la lógica de registro
    console.log('Registrarse con:', { registerUsername, registerPassword });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Vamp Jams</title>
        <meta name="description" content="Página de inicio de sesión y registro" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.navbar}>
        <button onClick={() => { setShowLogin(true); setShowRegister(false); }}>Inicio de sesión</button>
        <button onClick={() => { setShowLogin(false); setShowRegister(true); }}>Registrar</button>
      </nav>

      <main className={styles.main}>
        <h1 className={styles.title}>Vamp Jams</h1>

        {showLogin && (
          <form onSubmit={handleLogin} className={styles.form}>
            <h3>Iniciar sesión</h3>
            <input
              type="text"
              placeholder="Nombre de usuario"
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
              placeholder="Nombre de usuario"
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
      </main>
    </div>
  );
}


