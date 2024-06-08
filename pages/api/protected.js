import connectDB from '../../lib/mongodb';
import { authenticateToken } from '../../middleware/auth';

export default async function handler(req, res) {
  await connectDB();

  authenticateToken(req, res, () => {
    res.status(200).json({ message: 'You have access to this protected route', user: req.user });
  });
}
