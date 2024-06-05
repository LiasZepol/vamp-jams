import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import diapasonStyles from '../styles/Diapason.module.css';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);

  useEffect(() => {
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

  const handleNoteClick = (note) => {
    setSelectedNotes((prevNotes) => {
      if (prevNotes.includes(note)) {
        return prevNotes.filter((n) => n !== note);
      }
      return [...prevNotes, note];
    });
  };

  const getChord = () => {
    // Implementa la lógica para determinar el acorde basado en las notas seleccionadas
    if (selectedNotes.length === 0) {
      return 'Seleccione notas en el diapasón';
    }
    return `Acorde: ${selectedNotes.join(', ')}`; // Simple placeholder
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
        <h1 className={styles.title}>Vamp Jams</h1>

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

        <div className={diapasonStyles.diapasonContainer}>
          <div className={diapasonStyles.diapason}>
            <div className={diapasonStyles.cuerda} onClick={() => handleNoteClick('E')}>
              <div className={diapasonStyles.traste} style={{ left: '10%' }}></div>
              <div className={diapasonStyles.traste} style={{ left: '30%' }}></div>
              <div className={diapasonStyles.traste} style={{ left: '50%' }}></div>
              <div className={diapasonStyles.traste} style={{ left: '70%' }}></div>
              <div className={diapasonStyles.traste} style={{ left: '90%' }}></div>
              <div className={diapasonStyles.puntoGuia} style={{ left: '10%', top: '10%' }} onClick={() => handleNoteClick('E')}></div>
              <div className={diapasonStyles.puntoGuia} style={{ left: '30%', top: '10%' }} onClick={() => handleNoteClick('A')}></div>
              <div className={diapasonStyles.puntoGuia} style={{ left: '50%', top: '10%' }} onClick={() => handleNoteClick('D')}></div>
              <div className={diapasonStyles.puntoGuia} style={{ left: '70%', top: '10%' }} onClick={() => handleNoteClick('G')}></div>
              <div className={diapasonStyles.puntoGuia} style={{ left: '90%', top: '10%' }} onClick={() => handleNoteClick('B')}></div>
            </div>
          </div>
        </div>

        <div className={styles.chordInfo}>
          <h2>{getChord()}</h2>
          <div className={styles.selectedNotes}>
            {selectedNotes.map((note, index) => (
              <span key={index} className={styles.note}>
                {note}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}








