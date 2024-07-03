import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';
import Pitchfinder from 'pitchfinder';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [currentChord, setCurrentChord] = useState('');
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const pitchDetectorRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [detectedNotes, setDetectedNotes] = useState([]);
  const [lastDetectedNote, setLastDetectedNote] = useState(null);
  const [noteDurations, setNoteDurations] = useState({});

  useEffect(() => {
    // Check if the user is already authenticated by looking for the token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startAudioDetection();
    }
    return () => {
      stopAudioDetection();
    };
  }, [isAuthenticated]);

  const startAudioDetection = async () => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    pitchDetectorRef.current = Pitchfinder.AMDF();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      detectPitch();
      setIsListening(true);
      setDetectedNotes([]); // Reset detected notes when starting detection
      setLastDetectedNote(null); // Reset last detected note
    } catch (err) {
      console.error('Error accessing audio stream:', err);
    }
  };

  const stopAudioDetection = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
  };

  const detectPitch = () => {
    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);

    const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const getNote = (frequency) => {
      const A4 = 440;
      const semitone = 69;
      const noteNumber = 12 * (Math.log(frequency / A4) / Math.log(2));
      return Math.round(noteNumber) + semitone;
    };

    const frequencyToNote = (frequency) => {
      const note = getNote(frequency);
      return noteStrings[note % 12];
    };

    const lowPassFilter = (buffer) => {
      const alpha = 0.02; // More aggressive smoothing factor
      let previousValue = buffer[0];
      for (let i = 1; i < buffer.length; i++) {
        buffer[i] = alpha * buffer[i] + (1 - alpha) * previousValue;
        previousValue = buffer[i];
      }
    };

    const detect = () => {
      analyserRef.current.getFloatTimeDomainData(buffer);
      lowPassFilter(buffer); // Apply low-pass filter
      const pitch = pitchDetectorRef.current(buffer);
      if (pitch && pitch > 100) { // Adjust the threshold to filter out low frequencies
        const note = frequencyToNote(pitch);
        const now = Date.now();

        setNoteDurations((prevDurations) => {
          const newDurations = { ...prevDurations };
          if (!newDurations[note]) {
            newDurations[note] = { start: now, duration: 0 };
          } else {
            newDurations[note].duration = now - newDurations[note].start;
          }

          if (newDurations[note].duration >= 2000) { // Note duration is more than 2 seconds
            setDetectedNotes((prevNotes) => {
              if (prevNotes.length < 4 && (prevNotes.length === 0 || note !== prevNotes[prevNotes.length - 1])) {
                setLastDetectedNote(note);
                return [...prevNotes, note];
              }
              return prevNotes;
            });
          }

          return newDurations;
        });
      }
      requestAnimationFrame(detect);
    };
    detect();
  };

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
    <div className="bg-red-900 md:bg-pink-900">
      <Head>
        <title>Vamp Jams</title>
        <meta name="description" content="Página de inicio de sesión y registro" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="bg-gradient-to-r from-purple-100 via-purple-500 to-purple-600 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <img src="/images/vampjams.jpeg" alt="Vamp Jams Logo" className="h-10" />
          <div>
            {!isAuthenticated ? (
              <>
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
                  onClick={() => { setShowLogin(true); setShowRegister(false); }}
                >
                  Inicio de sesión
                </button>
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={() => { setShowLogin(false); setShowRegister(true); }}
                >
                  Registrar
                </button>
              </>
            ) : (
              <button 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
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
          <div className={`${styles.container} bg-gray-800 p-6 rounded-lg shadow-lg border-4 border-gray-700`}>
            <h1 className="text-3xl font-bold text-green-400"> {currentChord}</h1>
            <div className="mt-4 flex justify-center">
              <button 
                className={`bg-${isListening ? 'red' : 'blue'}-500 text-white px-4 py-2 rounded hover:bg-${isListening ? 'red' : 'blue'}-700`}
                onClick={isListening ? stopAudioDetection : startAudioDetection}
              >
                {isListening ? 'Detener entrada de audio' : 'Comenzar a escuchar'}
              </button>
            </div>
            <div className="mt-4">
              <h2 className="text-xl text-white">Notas detectadas:</h2>
              <ul className="text-white">
                {detectedNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
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
