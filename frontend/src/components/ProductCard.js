import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ColorCircle } from '../utils/colorUtils';

const ProductCard = ({ product, showPrices = false }) => {
  const { isDark } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const images = product.imagenes || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl group cursor-pointer ${
          isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
        }`}
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={product.nombre}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  >
                    <ChevronLeft size={20} className={isDark ? 'text-white' : 'text-black'} />
                  </button>
                  <button
                    onClick={nextImage}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  >
                    <ChevronRight size={20} className={isDark ? 'text-white' : 'text-black'} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentImageIndex
                            ? isDark ? 'bg-white w-4' : 'bg-black w-4'
                            : isDark ? 'bg-white/40' : 'bg-black/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              isDark ? 'bg-white/5' : 'bg-gray-100'
            }`}>
              <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Sin imagen</p>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.nombre}</h3>
          
          {product.descripcion && (
            <p className={`text-sm mb-3 line-clamp-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {product.descripcion}
            </p>
          )}

          {/* Colores */}
          {product.colores && product.colores.length > 0 && (
            <div className="mb-3">
              <p className={`text-xs mb-1.5 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Colores:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.colores.map((color, index) => {
                  const colorStr = typeof color === 'string' ? color : color.nombre || color;
                  return (
                    <span
                      key={index}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-white/10' : 'bg-black/5'
                      }`}
                    >
                      <ColorCircle colorName={colorStr} size={10} />
                      {colorStr}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Precios - Solo si showPrices es true */}
          {showPrices && (
            <div className="space-y-1.5">
              {product.pieza && (
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Pieza:</span>
                  <span className="font-semibold">${product.pieza}</span>
                </div>
              )}
              {product.mayoreo && (
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Mayoreo:</span>
                  <span className="font-semibold">${product.mayoreo}</span>
                </div>
              )}
              {product.caja && (
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Caja:</span>
                  <span className="font-semibold">${product.caja}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Imágenes */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div 
            className={`relative max-w-4xl w-full rounded-2xl overflow-hidden ${
              isDark ? 'bg-zinc-900' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 z-10 p-2 rounded-full ${
                isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'
              }`}
            >
              <X size={24} className={isDark ? 'text-white' : 'text-black'} />
            </button>

            <div className="relative aspect-video">
              {images.length > 0 && (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={product.nombre}
                    className="w-full h-full object-contain"
                  />
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={prevImage}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${
                          isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'
                        }`}
                      >
                        <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-black'} />
                      </button>
                      <button
                        onClick={nextImage}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${
                          isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'
                        }`}
                      >
                        <ChevronRight size={24} className={isDark ? 'text-white' : 'text-black'} />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{product.nombre}</h2>
              {product.descripcion && (
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {product.descripcion}
                </p>
              )}

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? isDark ? 'border-white' : 'border-black'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.nombre} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
