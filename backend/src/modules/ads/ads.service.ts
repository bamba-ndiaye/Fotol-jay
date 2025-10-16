import multer from 'multer';
import path from 'path';

// Configuration du stockage local temporaire
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés'));
    }
  }
});

export const uploadImage = async (file: Express.Multer.File, userId: number): Promise<string> => {
  try {
    // Pour l'instant, retourner simplement le chemin local
    // TODO: Implémenter l'upload vers Cloudinary quand les credentials seront disponibles
    const imageUrl = `/uploads/${file.filename}`;
    return imageUrl;
  } catch (error) {
    console.error('Erreur upload image:', error);
    throw new Error('Erreur lors de l\'upload de l\'image');
  }
};