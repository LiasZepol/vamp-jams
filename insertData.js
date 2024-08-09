import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import connectDB from './lib/db.js';
import Scale from './models/Scale.js';
import ChordType from './models/ChordType.js';

const scales = [
    { name: 'Mayor', notes: ['1', '2', '3', '4', '5', '6', '7'] },
    { name: 'Menor', notes: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] },
    // ... agrega aquí otras escalas
];

const insertData = async () => {
    await connectDB();

    // Insertar escalas
    for (const scale of scales) {
        await Scale.create(scale);
    }

    // Insertar tipos de acordes
    await ChordType.create({ type: 'mayor', scale: majorScale._id });
    await ChordType.create({ type: 'm7', scale: minorScale._id });

    // Función para obtener escalas según el tipo de acorde
    const getScalesByChordType = (chordType) => {
        const scaleMap = {
            'm7': ['Menor', 'Mayor'], // Escalas para m7
            '7': ['Mayor', 'Menor'],   // Escalas para 7
            // ... agrega más tipos de acordes y sus escalas
        };
        return scaleMap[chordType] || [];
    };

    // Ejemplo de uso
    const chordType = 'm7'; // Cambia esto según el acorde detectado
    const availableScales = getScalesByChordType(chordType);
    console.log('Escalas disponibles:', availableScales.join(', ')); // Cambiado para mostrar ambas escalas

    console.log('Datos insertados');
    process.exit();
};

insertData();
