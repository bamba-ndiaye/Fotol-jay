import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const AdminCategories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        setError('Erreur lors du chargement des catégories');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        setNewCategoryName('');
        setSuccess('Catégorie créée avec succès');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la création');
      }
    } catch (error) {
      setError('Erreur de connexion');
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const updateCategory = async () => {
    if (!editingCategory || !editName.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (response.ok) {
        setSuccess('Catégorie mise à jour avec succès');
        setEditingCategory(null);
        setEditName('');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setError('Erreur de connexion');
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Catégorie supprimée avec succès');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      setError('Erreur de connexion');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administration des catégories</h1>
        <p className="text-gray-600 mt-2">Gérez les catégories d'annonces</p>
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

      {/* Créer une nouvelle catégorie */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ajouter une catégorie</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Nom de la catégorie"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createCategory()}
          />
          <button
            onClick={createCategory}
            disabled={!newCategoryName.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Catégories existantes</h2>
        </div>

        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucune catégorie trouvée
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map(category => (
              <div key={category.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingCategory?.id === category.id ? (
                      <div className="flex items-center space-x-4">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && updateCategory()}
                        />
                        <button
                          onClick={updateCategory}
                          className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">
                          Créée le {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {editingCategory?.id !== category.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditing(category)}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;