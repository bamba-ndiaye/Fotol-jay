import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

const CreateAd = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowCamera(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      console.log('📷 Tentative d\'accès à la caméra...');

      // Essayer d'abord la caméra arrière, sinon caméra frontale
      let constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ Caméra arrière accessible');
      } catch (error) {
        console.log('⚠️ Caméra arrière non disponible, tentative caméra frontale...');
        constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ Caméra frontale accessible');
      }

      setStream(mediaStream);
      setShowCamera(true);

      // Attendre que la vidéo soit prête
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          console.log('📹 Vidéo assignée à l\'élément');

          // Vérifier que la vidéo fonctionne
          videoRef.current.onloadedmetadata = () => {
            console.log('🎬 Métadonnées vidéo chargées');
            videoRef.current?.play();
          };
        }
      }, 100);

    } catch (error) {
      console.error('❌ Erreur accès caméra:', error);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      alert('Erreur: Impossible d\'accéder à la caméra.\n\nSolutions :\n1. Autorisez l\'accès caméra dans votre navigateur\n2. Actualisez la page et réessayez\n3. Utilisez un téléphone avec caméra\n4. Upload une image directement');
    }
  };

  const capturePhoto = () => {
    console.log('📸 Capture de photo...');
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      // Vérifier que la vidéo est prête
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('❌ Vidéo pas encore prête');
        setError('La caméra n\'est pas encore prête. Attendez un instant.');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        console.log('🎨 Dessin sur le canvas...');
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ Blob créé, taille:', blob.size);
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(blob));
            setShowCamera(false);

            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              setStream(null);
            }

            // Afficher un message de confirmation
            alert('Photo capturée avec succès !');
            console.log('📸 Photo capturée avec succès !');
          } else {
            console.error('❌ Échec de la création du blob');
            setError('Erreur lors de la capture de la photo.');
          }
        }, 'image/jpeg', 0.8);
      } else {
        console.error('❌ Impossible d\'obtenir le contexte 2D du canvas');
        setError('Erreur technique lors de la capture.');
      }
    } else {
      console.error('❌ Éléments video ou canvas non disponibles');
      setError('Éléments de capture non disponibles.');
    }
  };

  const stopCamera = () => {
    setShowCamera(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const imageFormData = new FormData();
    imageFormData.append('photo', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/api/ads/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: imageFormData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image first if selected
      if (selectedFile) {
        imageUrl = await uploadImage();
      }

      // Create ad
      const adData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        imageUrl: imageUrl
      };

      console.log('📤 Envoi des données:', adData);

      const response = await fetch('http://localhost:3000/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(adData),
      });

      console.log('📥 Réponse du serveur:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Annonce créée:', result);
        alert('Annonce créée avec succès !');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur:', errorData);
        setError(errorData.error || 'Erreur lors de la création de l\'annonce');
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour au dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Créer une nouvelle annonce</h1>
        <p className="text-gray-600 mt-2">Remplissez les informations de votre annonce</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Titre de l'annonce"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez votre annonce en détail..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 500000"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.categoryId}
                onChange={handleInputChange}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capture photo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo de l'annonce
            </label>

            {!previewUrl ? (
              <div className="space-y-4">
                {!showCamera ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-sm text-gray-600 mb-4">
                        Prenez une photo de votre produit
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 flex items-center space-x-2 text-lg"
                        >
                          📷 Prendre une photo
                        </button>
                      </div>
                    </div>
    
                    <div className="text-center">
                      <span className="text-gray-500 text-sm">ou</span>
                    </div>
    
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-blue-600 hover:text-blue-800">
                          📁 Choisir une image depuis l'ordinateur
                        </div>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                      style={{ transform: 'scaleX(-1)' }} // Miroir pour un effet naturel
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 shadow-lg"
                      >
                        📸 Capturer
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 shadow-lg"
                      >
                        Annuler
                      </button>
                    </div>
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      🔴 Enregistrement
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Canvas caché pour la capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save size={20} />
              <span>{loading ? 'Création...' : 'Créer l\'annonce'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAd;