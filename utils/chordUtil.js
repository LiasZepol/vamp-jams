export const determineChord = (selectedNotes, strings) => {
    const allNotes = [
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    ];
  
    const chordNotes = selectedNotes
      .map((fret, index) => (fret !== null ? strings[index].notes[fret] : null))
      .filter(note => note !== null);
  
    // Remove duplicates
    const uniqueChordNotes = [...new Set(chordNotes)];
  
    // Basic chord identification (only a few common chords for simplicity)
    const chordMap = {
        'C': ['C', 'E', 'G'],
        'Cm': ['C', 'D#', 'G'],
        'C#': ['C#', 'F', 'G#'],
        'C#m': ['C#', 'E', 'G#'],
        'D': ['D', 'F#', 'A'],
        'Dm': ['D', 'F', 'A'],
        'D#': ['D#', 'G', 'A#'],
        'D#m': ['D#', 'F#', 'A#'],
        'E': ['E', 'G#', 'B'],
        'Em': ['E', 'G', 'B'],
        'F': ['F', 'A', 'C'],
        'Fm': ['F', 'G#', 'C'],
        'F#': ['F#', 'A#', 'C#'],
        'F#m': ['F#', 'A', 'C#'],
        'G': ['G', 'B', 'D'],
        'Gm': ['G', 'A#', 'D'],
        'G#': ['G#', 'C', 'D#'],
        'G#m': ['G#', 'B', 'D#'],
        'A': ['A', 'C#', 'E'],
        'Am': ['A', 'C', 'E'],
        'A#': ['A#', 'D', 'F'],
        'A#m': ['A#', 'C#', 'F'],
        'B': ['B', 'D#', 'F#'],
        'Bm': ['B', 'D', 'F#'],
    };
  
    for (const [chordName, notes] of Object.entries(chordMap)) {
      if (uniqueChordNotes.length === notes.length && uniqueChordNotes.every(note => notes.includes(note))) {
        return chordName;
      }
    }
  
    return 'Acorde no reconocido';
  };
  