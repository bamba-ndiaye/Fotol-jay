import prisma from '../../../prisma/client';

export const getAds = async (filters?: any) => {
  return await prisma.ad.findMany({
    where: filters,
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getAdById = async (id: number) => {
  return await prisma.ad.findUnique({
    where: { id },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
};

export const createAd = async (data: any) => {
  return await prisma.ad.create({
    data: {
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      imageUrl: data.imageUrl || null,
      categoryId: parseInt(data.categoryId),
      userId: data.userId,
      status: data.status || 'pending_verification'
    },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
};

export const updateAd = async (id: number, data: any) => {
  return await prisma.ad.update({
    where: { id },
    data,
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
};

export const updateAdStatus = async (id: number, newStatus: string, userId: number, reason?: string) => {
  // Récupérer l'ancien statut
  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad) throw new Error('Annonce non trouvée');

  const oldStatus = ad.status;

  // Mettre à jour le statut et les champs associés
  const updateData: any = { status: newStatus };
  if (newStatus === 'sold') {
    updateData.soldAt = new Date();
    updateData.soldReason = reason;
  }

  // Mettre à jour l'annonce
  const updatedAd = await prisma.ad.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });

  // TODO: Créer l'entrée d'historique quand la table sera créée
  // await prisma.adStatusHistory.create({
  //   data: {
  //     adId: id,
  //     oldStatus,
  //     newStatus,
  //     reason,
  //     changedBy: userId
  //   }
  // });

  return updatedAd;
};

export const deleteAd = async (id: number) => {
  return await prisma.ad.delete({ where: { id } });
};