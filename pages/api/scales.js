import connectDB from '../../lib/db';
import ChordType from '../../models/ChordType';
import Scale from '../../models/Scale';

export default async function handler(req, res) {
    await connectDB(); // Conectar a la base de datos

    const { type } = req.query; // Obtener el tipo de acorde

    if (req.method === 'GET') {
        try {
            const chordType = await ChordType.findOne({ type }).populate('scale'); // Buscar el tipo de acorde y poblar la escala
            if (chordType) {
                const scale = await Scale.findById(chordType.scale); // Buscar la escala asociada
                if (scale) {
                    res.status(200).json({ scale: scale.notes }); // Devolver las notas de la escala
                } else {
                    res.status(404).json({ error: 'Escala no encontrada' });
                }
            } else {
                res.status(404).json({ error: 'Tipo de acorde no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener escalas' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
