import prisma from '../../../prisma/client';

export const getPendingAds = async () => {
  return await prisma.ad.findMany({
    where: {
      status: 'pending_verification',
      verificationStatus: 'in_review'
    },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
};

export const approveAd = async (adId: number) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return await prisma.ad.update({
    where: { id: adId },
    data: {
      status: 'active',
      verificationStatus: 'verified',
      publishedAt: now,
      expiresAt
    },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
};

export const rejectAd = async (adId: number, reason: string) => {
  return await prisma.ad.update({
    where: { id: adId },
    data: {
      status: 'rejected',
      verificationStatus: 'rejected',
      verificationReason: reason
    },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
};