import mongoose from 'mongoose';

const scaleSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Nombre de la escala
    notes: { type: [String], required: true }, // Notas de la escala
});

const Scale = mongoose.models.Scale || mongoose.model('Scale', scaleSchema);
export default Scale;

