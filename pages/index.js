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
  const [scales, setScales] = useState([]); // Nuevo estado para almacenar escalas

  const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const generateChordStructure = (rootNote, intervals) => {
    const rootIndex = noteStrings.indexOf(rootNote);
    if (Array.isArray(intervals[0])) {
      // Handle array of arrays
      return intervals.map(intervalSet => intervalSet.map(interval => noteStrings[(rootIndex + interval) % 12]));
    }
    return intervals.map(interval => noteStrings[(rootIndex + interval) % 12]);
  };

  const majorChordIntervals = [[0, 4, 7],[0, 4]]; // Root, Major Third, Perfect Fifth
  const minorChordIntervals = [[0, 3, 7],[0, 3]]; // Root, Minor Third, Perfect Fifth
  const augmentedChordIntervals = [0, 4, 8];
  const diminishChordIntervals = [0, 3, 6];
  const majorsevenChordIntervals = [[0, 4, 7, 11], [0, 4, 11]]; // Root, Major Third, Perfect Fifth, Major Seventh or Minor Seventh
  const dominantsevenChordIntervals = [[0, 4, 7, 10], [0, 4, 10]]; // Root, Major Third, Perfect Fifth, Minor Seventh
  const minorsevenChordIntervals = [[0, 3, 7, 10], [0, 3, 10]];
  const halfdiminishChordIntervals = [0, 3, 6, 10]
  const diminishsevenChordIntervals = [0, 3, 6, 9]
  const augmentedmajorChordIntervals = [0, 4, 8, 11]
  const augmenteddominantChordIntervals = [0, 4, 8, 10]
  const minormajorChordIntervals = [0, 3, 7, 11]


  const chordStructures = noteStrings.reduce((acc, note) => {
    acc[note + ''] = generateChordStructure(note, majorChordIntervals);
    acc[note + 'm'] = generateChordStructure(note, minorChordIntervals);
    acc[note + '+'] = generateChordStructure(note, augmentedChordIntervals);
    acc[note + 'o'] = generateChordStructure(note, diminishChordIntervals);
    acc[note + '∆'] = generateChordStructure(note, majorsevenChordIntervals);
    acc[note + '7'] = generateChordStructure(note, dominantsevenChordIntervals);
    acc[note + 'm7'] = generateChordStructure(note, minorsevenChordIntervals);
    acc[note + 'ø'] = generateChordStructure(note, halfdiminishChordIntervals);
    acc[note + 'o7'] = generateChordStructure(note, diminishsevenChordIntervals);
    acc[note + '∆+'] = generateChordStructure(note, augmentedmajorChordIntervals);
    acc[note + '+7'] = generateChordStructure(note, augmenteddominantChordIntervals);
    acc[note + 'm∆'] = generateChordStructure(note, minormajorChordIntervals);

    
    return acc;
  }, {});

  const detectChord = (notes) => {
    const uniqueNotes = [...new Set(notes)]; // Remove duplicates
    for (const [chord, structures] of Object.entries(chordStructures)) {
      if (Array.isArray(structures[0])) {
        // Handle array of arrays
        for (const structure of structures) {
          if (structure.every(note => uniqueNotes.includes(note)) && structure.length === uniqueNotes.length) {
            return chord;
          }
        }
      } else {
        if (structures.every(note => uniqueNotes.includes(note)) && structures.length === uniqueNotes.length) {
          return chord;
        }
      }
    }
    return 'No se detectó acorde';
  };

  const detectedChord = detectChord(detectedNotes);

  const fetchScales = async (chordType) => {
    try {
        const response = await fetch(`/api/scales?type=${chordType}`); // Llama al endpoint con el tipo de acorde
        const data = await response.json();
        setScales(data.scale); // Almacena las notas de la escala
    } catch (error) {
        console.error('Error al obtener escalas:', error);
    }
  };

  useEffect(() => {
    if (detectedChord !== 'No se detectó acorde') {
        const chordType = detectedChord.endsWith('m') ? 'm7' : 'mayor'; // Determina el tipo de acorde
        fetchScales(chordType); // Llama a la función con el tipo de acorde
    }
  }, [detectedChord]);

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

    const detect = () => {
      analyserRef.current.getFloatTimeDomainData(buffer);
      const pitch = pitchDetectorRef.current(buffer);
      if (pitch && pitch > 150) { // Adjusted threshold to filter out low frequencies
        const note = frequencyToNote(pitch);

        setDetectedNotes((prevNotes) => {
          if (prevNotes.length < 4 && (prevNotes.length === 0 || note !== prevNotes[prevNotes.length - 1])) {
            setLastDetectedNote(note);
            console.log(`Detected Notes: ${[...prevNotes, note]}`);
            return [...prevNotes, note];
          }
          return prevNotes;
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
            <div className="mt-4 flex flex-col items-center">
              {lastDetectedNote && (
                <h2 className="text-xl text-white mb-4 p-2 bg-gray-700 rounded-lg shadow-md">
                  {lastDetectedNote}
                </h2>
              )}
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
            <div className="mt-4">
              <h2 className="text-xl text-white">Acorde detectado:</h2>
              <p className="text-white">{detectedChord}</p>
            </div>
            <div className="mt-4">
              <h2 className="text-xl text-white">Notas para el tipo de acorde detectado:</h2>
              <ul className="text-white">
                {scales.map((note, index) => (
                  <li key={index}>{note}</li> // Muestra cada nota de la escala
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
