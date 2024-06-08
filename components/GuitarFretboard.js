import React, { useState } from 'react';
import styles from '../styles/GuitarFretboard.module.css';
import * as tonal from '@tonaljs/tonal';

const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
const frets = Array.from({ length: 22 }, (_, i) => i);

const GuitarFretboard = () => {
  const [selectedNotes, setSelectedNotes] = useState([]);

  const getNoteName = (string, fret) => {
    const notes = {
      'e': ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#'],
      'B': ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
      'G': ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'],
      'D': ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      'A': ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#'],
      'E': ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#'],
    };

    return notes[string][fret];
  };

  const getChord = (notes) => {
    const noteNames = notes.map(note => getNoteName(note.string, note.fret));
    const chord = tonal.Chord.detect(noteNames);
    return chord.length > 0 ? chord[0] : 'Acorde desconocido';
  };

  const handleNoteClick = (string, fret) => {
    const note = { string, fret };
    const isNoteSelected = selectedNotes.some(
      selectedNote => selectedNote.string === string && selectedNote.fret === fret
    );

    let updatedNotes;
    if (isNoteSelected) {
      updatedNotes = selectedNotes.filter(
        selectedNote => !(selectedNote.string === string && selectedNote.fret === fret)
      );
    } else {
      updatedNotes = [...selectedNotes, note];
    }

    setSelectedNotes(updatedNotes);
    const chord = getChord(updatedNotes);
    console.log('Acorde:', chord); // Muestra el acorde en la consola
  };

  return (
    <div className={styles.fretboard}>
      {strings.map((string) => (
        <div key={string} className={styles.string}>
          {frets.map(fret => {
            const isSelected = selectedNotes.some(
              selectedNote => selectedNote.string === string && selectedNote.fret === fret
            );
            return (
              <div
                key={fret}
                className={`${styles.fret} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleNoteClick(string, fret)}
              >
                {fret}
              </div>
            );
          })}
        </div>
      ))}
      <div className={styles.selectedNotes}>
        <h3>Notas seleccionadas:</h3>
        {selectedNotes.map((note, index) => (
          <span key={index}>{`${note.string}${note.fret}`}</span>
        ))}
      </div>
    </div>
  );
};

export default GuitarFretboard;
