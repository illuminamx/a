import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../Toast';
import { X, Save, Tag } from 'lucide-react';

const PreciosEspecialesModal = ({ cliente, onClose, onSave }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [preciosEspeciales, setPreciosEspeciales] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductos();
    // Cargar precios especiales existentes del cliente
    if (cliente.preciosEspeciales) {
      setPreciosEspeciales(cliente.preciosEspeciales);
    }
  }, [cliente]);

  const loadProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrecioChange = (productoId, precio) => {
    if (precio === '' || precio === null) {
      const newPrecios = { ...preciosEspeciales };
      delete newPrecios[productoId];
      setPreciosEspeciales(newPrecios);
    } else {
      setPreciosEspeciales(prev => ({
        ...prev,
        [productoId]: parseFloat(precio)
      }));
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'clientes', cliente.id), {
        preciosEspeciales: preciosEspeciales
      });
      showToast('Precios especiales actualizados', 'success');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error guardando precios:', error);
      showToast('Error al guardar precios', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
        isDark ? 'bg-zinc-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div>
            <h2 className="text-2xl font-bold">Precios Especiales</h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {cliente.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                isDark ? 'border-white' : 'border-black'
              }`}></div>
            </div>
          ) : productos.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No hay productos disponibles
            </p>
          ) : (
            <div className="space-y-3">
              {productos.map(producto => (
                <div
                  key={producto.id}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Imagen */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {producto.imagenes?.[0] ? (
                        <img
                          src={producto.imagenes[0]}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{producto.nombre}</h3>
                      <div className="flex gap-3 mt-1 text-xs">
                        {producto.pieza && (
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Pieza: ${producto.pieza}
                          </span>
                        )}
                        {producto.mayoreo && (
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Mayoreo: ${producto.mayoreo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Precio Especial Input */}
                    <div className="w-32 flex-shrink-0">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={preciosEspeciales[producto.id] || ''}
                          onChange={(e) => handlePrecioChange(producto.id, e.target.value)}
                          placeholder="Especial"
                          className={`w-full pl-6 pr-3 py-2 rounded-lg border outline-none text-sm transition-all ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/30'
                              : 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-black'
                          }`}
                        />
                      </div>
                      {preciosEspeciales[producto.id] && (
                        <p className="text-xs text-green-500 mt-1 text-center">
                          <Tag size={10} className="inline mr-1" />
                          Precio activo
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t flex gap-3 ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <button
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
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <Save size={18} />
            Guardar Precios
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreciosEspecialesModal;
