import cron from 'node-cron';
import prisma from '../../prisma/client';
import cloudinary from '../config/cloudinary';

export const startCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();

    try {
      await prisma.ad.updateMany({
        where: {
          expiresAt: { lt: now },
          status: 'active'
        },
        data: { status: 'expired' }
      });

      const cutoffDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oldAds = await prisma.ad.findMany({
        where: {
          status: 'expired',
          expiresAt: { lt: cutoffDate }
        }
      });

      for (const ad of oldAds) {
        if (ad.imageUrl) {
          const publicId = ad.imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`expat_ads/${publicId}`);
          }
        }
        await prisma.ad.delete({ where: { id: ad.id } });
      }

      console.log('Cron job exécuté avec succès');
    } catch (error) {
      console.error('Erreur dans le cron job:', error);
    }
  });
};