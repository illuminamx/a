import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Trash2, Move } from 'lucide-react';

const ImageEditor = ({ url, index, isDark, onRemove }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleMouseDown = (e) => {
    if (e.target === imageRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.target === imageRef.current && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden border ${
        isDark ? 'border-white/10' : 'border-gray-200'
      }`}
    >
      <div 
        className="aspect-square overflow-hidden bg-gray-100 cursor-move select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={url}
          alt={`Imagen ${index + 1}`}
          className="w-full h-full object-cover transition-transform"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          draggable={false}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors"
            title="Acercar para encuadre"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors"
            title="Alejar"
          >
            <ZoomOut size={14} />
          </button>
          <div className="px-2 py-1.5 rounded-full bg-black/70 text-white text-xs flex items-center gap-1">
            <Move size={12} />
            <span>Arrastrar</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-full bg-red-500/90 hover:bg-red-500 text-white transition-colors"
          title="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/70 text-white text-xs">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};

export default ImageEditor;
