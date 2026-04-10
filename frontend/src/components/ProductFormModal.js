import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { X, Upload, Trash2, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import axios from 'axios';

const IMGBB_API_KEY = '565bfd923ef367e0a4de22ec987bc64e';

const ProductFormModal = ({ product, onSave, onClose }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    pieza: '',
    mayoreo: '',
    caja: '',
    colores: [],
    imagenes: []
  });
  const [colorInput, setColorInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageZoom, setImageZoom] = useState({});
  const [imagePosition, setImagePosition] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        pieza: product.pieza || '',
        mayoreo: product.mayoreo || '',
        caja: product.caja || '',
        colores: product.colores || [],
        imagenes: product.imagenes || []
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !formData.colores.includes(colorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        colores: [...prev.colores, colorInput.trim()]
      }));
      setColorInput('');
    }
  };

  const handleRemoveColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colores: prev.colores.filter((_, i) => i !== index)
    }));
  };

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData
      );
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      throw error;
    }
  };

  // Convertir imagen a WebP
  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' }));
          }, 'image/webp', 0.9);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Convertir a WebP primero
      const webpFiles = await Promise.all(files.map(file => convertToWebP(file)));
      
      const uploadPromises = webpFiles.map(file => uploadToImgBB(file));
      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...urls]
      }));

      // Initialize zoom and position for new images
      urls.forEach((url, index) => {
        const imgIndex = formData.imagenes.length + index;
        setImageZoom(prev => ({ ...prev, [imgIndex]: 1 }));
        setImagePosition(prev => ({ ...prev, [imgIndex]: { x: 0, y: 0 } }));
      });
      
      showToast('Imágenes subidas correctamente (convertidas a WebP)', 'success');
    } catch (error) {
      showToast('Error al subir imágenes. Intenta de nuevo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  const handleZoomChange = (index, delta) => {
    setImageZoom(prev => ({
      ...prev,
      [index]: Math.max(0.5, Math.min(3, (prev[index] || 1) + delta))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      showToast('El nombre del producto es obligatorio', 'warning');
      return;
    }

    onSave({
      ...formData,
      pieza: formData.pieza ? parseFloat(formData.pieza) : null,
      mayoreo: formData.mayoreo ? parseFloat(formData.mayoreo) : null,
      caja: formData.caja ? parseFloat(formData.caja) : null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDark ? 'bg-zinc-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
          isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-2xl font-bold">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                  : 'bg-gray-50 border-gray-200 text-black focus:border-black'
              }`}
              placeholder="Ej: Bocina 3BL"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-all resize-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                  : 'bg-gray-50 border-gray-200 text-black focus:border-black'
              }`}
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Precio Pieza
              </label>
              <input
                type="number"
                name="pieza"
                value={formData.pieza}
                onChange={handleChange}
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                    : 'bg-gray-50 border-gray-200 text-black focus:border-black'
                }`}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Precio Mayoreo
              </label>
              <input
                type="number"
                name="mayoreo"
                value={formData.mayoreo}
                onChange={handleChange}
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                    : 'bg-gray-50 border-gray-200 text-black focus:border-black'
                }`}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Precio Caja
              </label>
              <input
                type="number"
                name="caja"
                value={formData.caja}
                onChange={handleChange}
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                    : 'bg-gray-50 border-gray-200 text-black focus:border-black'
                }`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Colores */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Colores Disponibles
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                className={`flex-1 px-4 py-3 rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                    : 'bg-gray-50 border-gray-200 text-black focus:border-black'
                }`}
                placeholder="Agregar color..."
              />
              <button
                type="button"
                onClick={handleAddColor}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.colores.map((color, index) => (
                <span
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    isDark ? 'bg-white/10' : 'bg-black/5'
                  }`}
                >
                  {typeof color === 'string' ? color : color.nombre || color}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="hover:opacity-70"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Imágenes
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-colors ${
                isDark
                  ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Upload size={20} />
              {uploading ? 'Subiendo...' : 'Subir Imágenes'}
            </button>

            {formData.imagenes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {formData.imagenes.map((url, index) => (
                  <div
                    key={index}
                    className={`relative rounded-lg overflow-hidden border ${
                      isDark ? 'border-white/10' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={url}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${imageZoom[index] || 1})`
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleZoomChange(index, 0.1)}
                        className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white"
                      >
                        <ZoomIn size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleZoomChange(index, -0.1)}
                        className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white"
                      >
                        <ZoomOut size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {product ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
