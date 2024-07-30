import mongoose from 'mongoose';

const chordTypeSchema = new mongoose.Schema({
    type: { type: String, required: true }, // Tipo de acorde (ej. "mayor", "m7")
    scale: { type: mongoose.Schema.Types.ObjectId, ref: 'Scale', required: true }, // Referencia a la escala
});

const ChordType = mongoose.models.ChordType || mongoose.model('ChordType', chordTypeSchema);
export default ChordType;
