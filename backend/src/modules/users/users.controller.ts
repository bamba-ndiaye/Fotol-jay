import { Request, Response } from 'express';
import { findUserById, updateUser } from './users.model';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await findUserById((req as any).user.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = (req as any).user.id;

    const user = await updateUser(userId, { name });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
};