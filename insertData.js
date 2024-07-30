import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import connectDB from './lib/db.js';
import Scale from './models/Scale.js';
import ChordType from './models/ChordType.js';

const insertData = async () => {
    await connectDB();

    // Insertar escalas
    const majorScale = await Scale.create({ name: 'Mayor', notes: ['1', '2', '3', '4', '5', '6', '7'] });
    const minorScale = await Scale.create({ name: 'Menor', notes: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] });

    // Insertar tipos de acordes
    await ChordType.create({ type: 'mayor', scale: majorScale._id });
    await ChordType.create({ type: 'm7', scale: minorScale._id });

    console.log('Datos insertados');
    process.exit();
};

insertData();
