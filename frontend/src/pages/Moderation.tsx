import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Eye, AlertTriangle } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status: string;
  verificationStatus: string;
  verificationReason?: string;
  publishedAt: string | null;
  expiresAt: string | null;
  category: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const Moderation = () => {
  const { token } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingAds();
  }, []);

  const fetchPendingAds = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/verification/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      } else {
        setError('Erreur lors du chargement des annonces en attente');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const approveAd = async (adId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/verification/approve/${adId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Annonce approuvée avec succès');
        fetchPendingAds();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      setError('Erreur de connexion');
    }
  };

  const rejectAd = async (adId: number) => {
    if (!rejectionReason.trim()) {
      setError('Veuillez fournir une raison de rejet');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/verification/reject/${adId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      if (response.ok) {
        setSuccess('Annonce rejetée avec succès');
        setSelectedAd(null);
        setRejectionReason('');
        fetchPendingAds();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du rejet');
      }
    } catch (error) {
      setError('Erreur de connexion');
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modération des annonces</h1>
        <p className="text-gray-600 mt-2">Vérifiez et validez les annonces en attente</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {/* Liste des annonces en attente */}
      {ads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            Aucune annonce en attente de modération
          </div>
          <div className="text-gray-400">
            Toutes les annonces ont été traitées
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                {ad.imageUrl ? (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(ad.verificationStatus)}`}>
                    {ad.verificationStatus === 'verified' ? 'Vérifiée' :
                     ad.verificationStatus === 'in_review' ? 'En revue' : 'Rejetée'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {ad.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {ad.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-semibold">
                      {ad.price.toLocaleString()} FCFA
                    </span>
                    <span className="text-gray-500">{ad.category.name}</span>
                  </div>

                  <div className="text-sm text-gray-500">
                    <div>Par: {ad.user.name}</div>
                    <div>Email: {ad.user.email}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => approveAd(ad.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <Check size={16} />
                    <span>Approuver</span>
                  </button>

                  <button
                    onClick={() => setSelectedAd(ad)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                  >
                    <X size={16} />
                    <span>Rejeter</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rejet */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-2" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">
                Rejeter l'annonce
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Annonce: <span className="font-medium">{selectedAd.title}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du rejet *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Expliquez pourquoi cette annonce est rejetée..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedAd(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => rejectAd(selectedAd.id)}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;