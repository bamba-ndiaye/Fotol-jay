import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Filter, Eye, Calendar, DollarSign } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SellButton from '../components/SellButton';

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status: string;
  verificationStatus: string;
  publishedAt: string | null;
  expiresAt: string | null;
  category: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

const Dashboard = () => {
  const { user, token } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAds();
    fetchCategories();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ads', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || ad.category.id === selectedCategory;
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStatusChange = (adId: number, newStatus: string) => {
    setAds(ads.map(ad =>
      ad.id === adId ? { ...ad, status: newStatus } : ad
    ));
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
          <p className="text-gray-600 mt-2">Gérez vos annonces sur Fotol Jaay</p>
        </div>
        <Link
          to="/create-ad"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nouvelle annonce</span>
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="sold">Vendues</option>
            <option value="pending_verification">En attente</option>
            <option value="expired">Expirées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Liste des annonces */}
      {filteredAds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {ads.length === 0 ? 'Vous n\'avez pas encore d\'annonces' : 'Aucune annonce ne correspond à vos critères'}
          </div>
          <Link
            to="/create-ad"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Créer votre première annonce</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map(ad => (
            <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                {ad.imageUrl ? (
                  <img
                    src={`${ad.imageUrl}`}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Erreur chargement image:', ad.imageUrl);
                      // Fallback si l'image ne charge pas
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></div>';
                      }
                    }}
                    onLoad={() => {
                      console.log('Image chargée avec succès:', ad.imageUrl);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                   <StatusBadge status={ad.status} />
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

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign size={16} className="mr-1" />
                    <span>{ad.price.toLocaleString()} FCFA</span>
                  </div>
                  <span className="text-sm text-gray-500">{ad.category.name}</span>
                </div>

                {ad.publishedAt && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar size={14} className="mr-1" />
                    <span>Publié le {new Date(ad.publishedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}

                {ad.expiresAt && (
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar size={14} className="mr-1" />
                    <span>Expire le {new Date(ad.expiresAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <SellButton
                    adId={ad.id}
                    currentStatus={ad.status}
                    onStatusChange={(newStatus) => handleStatusChange(ad.id, newStatus)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;