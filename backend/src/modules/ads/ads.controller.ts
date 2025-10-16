import { Request, Response } from 'express';
import { getAds, getAdById, createAd, updateAd, updateAdStatus, deleteAd } from './ads.model';
import { uploadImage } from './ads.service';

export const getAllAds = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Récupération des annonces...');
    const { status, categoryId, userId } = req.query;
    const filters: any = {};

    if (status) filters.status = status;
    if (categoryId) filters.categoryId = parseInt(categoryId as string);
    if (userId) filters.userId = parseInt(userId as string);

    console.log('📋 Filtres appliqués:', filters);

    const ads = await getAds(filters);
    console.log('✅ Annonces récupérées:', ads.length);
    res.json({ ads });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des annonces:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces' });
  }
};

export const getAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ad = await getAdById(parseInt(id));

    if (!ad) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    res.json({ ad });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'annonce' });
  }
};

export const createNewAd = async (req: Request, res: Response) => {
  try {
    console.log('📝 Création d\'une nouvelle annonce...');
    console.log('📋 Données reçues:', req.body);
    console.log('👤 Utilisateur authentifié:', (req as any).user);
    console.log('🔑 Headers Authorization:', req.headers.authorization);

    const { title, description, price, categoryId, imageUrl } = req.body;
    const userId = (req as any).user?.id;

    // Validation de l'authentification
    if (!userId) {
      console.log('❌ Utilisateur non authentifié - vérifiez le middleware auth');
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Validation des données
    if (!title || !description || !price || !categoryId) {
      console.log('❌ Données manquantes:', { title, description, price, categoryId });
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérification que l'utilisateur existe
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    console.log('🔍 Vérification de l\'utilisateur ID:', userId);
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!userExists) {
      console.log('❌ Utilisateur non trouvé dans la base de données');
      return res.status(400).json({ error: 'Utilisateur invalide' });
    }

    // Vérification que la catégorie existe
    console.log('🔍 Vérification de la catégorie ID:', categoryId);
    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!categoryExists) {
      console.log('❌ Catégorie non trouvée dans la base de données');
      return res.status(400).json({ error: 'Catégorie invalide' });
    }

    console.log('✅ Utilisateur et catégorie validés');

    console.log('🔄 Tentative de création avec:', {
      title,
      description: description.substring(0, 50) + '...',
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      imageUrl,
      userId: parseInt(userId),
      status: 'pending_verification'
    });

    const ad = await createAd({
      title,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      imageUrl,
      userId: parseInt(userId),
      status: 'pending_verification'
    });

    console.log('✅ Annonce créée avec succès:', ad.id);
    res.status(201).json({ ad });
  } catch (error: any) {
    console.error('❌ Erreur détaillée lors de la création de l\'annonce:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    // Erreur spécifique pour les contraintes de clé étrangère
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Utilisateur ou catégorie invalide' });
    }

    // Erreur spécifique pour les données trop longues
    if (error.code === 'P2000') {
      return res.status(400).json({ error: 'Données trop longues pour certains champs' });
    }

    res.status(500).json({ error: 'Erreur lors de la création de l\'annonce' });
  }
};

export const updateAdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ad = await updateAd(parseInt(id), updates);
    res.json({ ad });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'annonce' });
  }
};

export const updateAdStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = (req as any).user.id;

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    const ad = await getAdById(parseInt(id));
    if (!ad) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    if (ad.userId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette annonce' });
    }

    // Vérifier les transitions de statut autorisées
    const allowedStatuses = ['active', 'sold'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut non autorisé' });
    }

    const updatedAd = await updateAdStatus(parseInt(id), status, userId, reason);
    res.json({ ad: updatedAd });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

export const deleteAdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    const ad = await getAdById(parseInt(id));
    if (!ad) {
      return res.status(404).json({ error: 'Annonce non trouvée' });
    }

    if (ad.userId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer cette annonce' });
    }

    await deleteAd(parseInt(id));
    res.json({ message: 'Annonce supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'annonce' });
  }
};

export const uploadAdImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const imageUrl = await uploadImage(req.file, userId);
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
};