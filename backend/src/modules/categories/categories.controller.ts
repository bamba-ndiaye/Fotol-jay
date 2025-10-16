import { Request, Response } from 'express';
import { getCategories as getCategoriesModel, createCategory as createCategoryModel } from './categories.model';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getCategoriesModel();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const category = await createCategoryModel(name);

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
  }
};