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
  const [isListening, setIsListening] = useState(false); // Inicializa en false
  const [detectedNotes, setDetectedNotes] = useState([]);
  const [lastDetectedNote, setLastDetectedNote] = useState(null);
  const [scales, setScales] = useState([]); // Nuevo estado para almacenar escalas
  const [tuningNote, setTuningNote] = useState('N/A'); // Inicializa con 'N/A'
  const [tuningFrequency, setTuningFrequency] = useState(0); // Inicializa con 0

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
    return '---'; // Muestra '---' si no hay acorde detectado
  };

  const detectedChord = detectChord(detectedNotes);
  console.log(detectedChord); // Verifica qué acorde se está detectando

  const fetchScales = async (chordType) => {
    try {
        const response = await fetch(`/api/scales?type=${chordType}`);
        const data = await response.json();
        console.log(data); // Verifica la estructura de los datos
        setScales(data.scale || []); // Asegúrate de que 'scale' sea un array
    } catch (error) {
        console.error('Error al obtener escalas:', error);
    }
  };

  useEffect(() => {
    if (detectedChord !== '---') {
        const chordType = detectedChord.endsWith('m') ? 'menor' : 'mayor'; // Cambiar 'm7' a 'menor'
        console.log(chordType); // Verifica el tipo de acorde
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

  const startAudioDetection = async () => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    pitchDetectorRef.current = Pitchfinder.AMDF();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      detectPitch();
      setIsListening(true); // Asegúrate de que esté en true
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
    setIsListening(false); // Asegúrate de que esté en false
  };

  // Función para generar frecuencias de notas en diferentes octavas
  const getNoteFrequencies = () => {
    const baseFrequencies = {
      'C': 261.63,
      'C#': 277.18,
      'D': 293.66,
      'D#': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F#': 369.99,
      'G': 392.00,
      'G#': 415.30,
      'A': 440.00,
      'A#': 466.16,
      'B': 493.88,
    };

    const frequencies = {};
    for (let octave = 0; octave <= 8; octave++) { // Cambia el rango según sea necesario
      for (const [note, frequency] of Object.entries(baseFrequencies)) {
        frequencies[note + octave] = frequency * Math.pow(2, octave); // Ajusta la frecuencia según la octava
      }
    }
    return frequencies;
  };

  const noteFrequencies = getNoteFrequencies(); // Genera las frecuencias de notas

  const getLightStatus = (frequency) => {
    const targetFrequency = noteFrequencies[tuningNote] || 0;
    if (frequency === 0) return 'bg-gray-500'; // Sin frecuencia detectada
    if (targetFrequency === 0) return 'bg-gray-500'; // Sin nota seleccionada

    // Compara la frecuencia detectada con la frecuencia de la nota con tolerancia de 1 Hz
    const tolerance = 6; // Tolerancia en Hz
    return Math.abs(frequency - targetFrequency) <= tolerance ? 'bg-green-500' : 'bg-gray-500'; // Luz verde si está afinado, gris si no
  };

  const centerLight = getLightStatus(tuningFrequency);

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
        setTuningNote(note); // Actualiza la nota de afinación
        setTuningFrequency(pitch); // Actualiza la frecuencia de afinación

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
    <div className="bg-purple-600"> {/* Cambiado a bg-purple-600 */}
      <Head>
        <title>Vamp Jams</title>
        <meta name="description" content="Página de inicio de sesión y registro" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="bg-gradient-to-r from-purple-100 via-purple-500 to-purple-600 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <img src="/images/vampjams.jpeg" alt="Vamp Jams Logo" className="h-10" />
          <div className="flex items-center">
            {isAuthenticated && (
              <h2 className="text-white mr-4">Bienvenido, {username}!</h2> // Mensaje de bienvenida
            )}
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

      {/* Afinador */}
      <div className="m-0"> {/* Sin margen externo */}
        <div className="tuner bg-gray-800 py-2 px-1 rounded-lg shadow-lg flex flex-col items-center mx-auto w-auto"> {/* Padding reducido */}
          <h2 className="text-xl text-white font-bold mb-1">Afinador</h2> {/* Tamaño de texto reducido */}
          <p className="text-2xl text-green-400 font-semibold mb-1">{tuningNote}</p> {/* Tamaño de texto reducido */}
          <div className="flex justify-center items-center mb-1">
            <div className={`light ${centerLight} w-5 h-5 rounded-full transition-all duration-300`} /> {/* Tamaño del foco reducido */}
          </div>
          <p className="text-md text-white">{tuningFrequency.toFixed(2)} Hz</p> {/* Tamaño de texto reducido */}
        </div>
      </div>

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

        {registrationSuccess && (
          <div>
            <h2>Registro exitoso! Ahora puedes iniciar sesión.</h2>
          </div>
        )}

        {/* Show Guitar Fretboard only if authenticated */}
        {isAuthenticated ? (
          <div className={`${styles.container} bg-gray-800 p-4 rounded-lg shadow-lg border-4 border-gray-700`}>
            <h1 className="text-3xl font-bold text-green-400 text-center mb-4">{currentChord}</h1>
            <div className="mt-4 flex flex-col items-center">
              <button 
                className={`bg-${isListening ? 'red' : 'blue'}-500 text-white px-4 py-2 rounded hover:bg-${isListening ? 'red' : 'blue'}-700 mb-4`}
                onClick={isListening ? stopAudioDetection : startAudioDetection}
              >
                {isListening ? 'Detener entrada de audio' : 'Comenzar a escuchar'}
              </button>
            </div>
            <div className="mt-4">
              <h2 className="text-xl text-white text-center">Notas</h2> {/* Añadida clase text-center */}
              <div className="flex justify-center mt-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-gray-700 text-white p-4 m-2 rounded-lg shadow-md flex-1 min-w-[80px] text-center">
                    {detectedNotes[index] || '---'} {/* Muestra '---' si no hay nota detectada */}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 mb-6"> {/* Aumenta el margen superior y añade margen inferior */}
              <h2 className="text-xl text-white">Acorde</h2>
              <div className="bg-gray-700 text-white p-4 rounded-lg shadow-md text-center">
                {detectedChord || '---'} {/* Muestra '---' si no hay acorde detectado */}
              </div>
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

