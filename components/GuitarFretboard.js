import React, { useState } from 'react';
import styles from '../styles/GuitarFretboard.module.css';
import { determineChord } from '../utils/chordUtil';

const GuitarFretboard = () => {
  const strings = [
    { name: 'E', notes: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'] },
    { name: 'B', notes: ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#'] },
    { name: 'G', notes: ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#'] },
    { name: 'D', notes: ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#'] },
    { name: 'A', notes: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'] },
    { name: 'E', notes: ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'] },
  ];

  const [selectedNotes, setSelectedNotes] = useState(Array(strings.length).fill(null));

  const handleNoteClick = (stringIndex, fretIndex) => {
    const newSelectedNotes = [...selectedNotes];
    if (newSelectedNotes[stringIndex] === fretIndex) {
      newSelectedNotes[stringIndex] = null; // Deselect if already selected
    } else {
      newSelectedNotes[stringIndex] = fretIndex; // Select the note
    }
    setSelectedNotes(newSelectedNotes);
  };

  return (
    <div className={styles.fretboard}>
      {strings.map((string, stringIndex) => (
        <div key={string.name} className={styles.string}>
          {string.notes.map((note, fretIndex) => (
            <button
              key={note}
              className={`${styles.fret} ${selectedNotes[stringIndex] === fretIndex ? styles.selected : ''}`}
              onClick={() => handleNoteClick(stringIndex, fretIndex)}
            >
              {note}
            </button>
          ))}
        </div>
      ))}
      <div className={styles.chordDisplay}>
        <h2>Estás tocando: {determineChord(selectedNotes, strings)}</h2>
      </div>
    </div>
  );
};

export default GuitarFretboard;

