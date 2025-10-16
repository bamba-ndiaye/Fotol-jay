import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SellButtonProps {
  adId: number;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const SellButton = ({ adId, currentStatus, onStatusChange }: SellButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState('');

  const handleSell = async () => {
    if (!reason.trim()) {
      alert('Veuillez indiquer pourquoi vous marquez cette annonce comme vendue');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/ads/${adId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'sold',
          reason: reason.trim()
        }),
      });

      if (response.ok) {
        onStatusChange('sold');
        setShowConfirm(false);
        setReason('');
        alert('Annonce marquée comme vendue avec succès !');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  // Ne montrer le bouton que si l'annonce est active
  if (currentStatus !== 'active') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
      >
        <CheckCircle size={18} />
        <span>VENDRE</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold">Marquer comme vendue</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir marquer cette annonce comme vendue ?
              Cette action est irréversible.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison (obligatoire)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Vendu à un particulier via WhatsApp"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleSell}
                disabled={isLoading || !reason.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Confirmer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellButton;