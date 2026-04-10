// Mapa de colores en español a códigos hex
const colorMap = {
  // Básicos
  'rojo': '#FF0000',
  'azul': '#0000FF',
  'verde': '#00FF00',
  'amarillo': '#FFFF00',
  'negro': '#000000',
  'blanco': '#FFFFFF',
  'gris': '#808080',
  'naranja': '#FFA500',
  'morado': '#800080',
  'rosa': '#FFC0CB',
  'cafe': '#8B4513',
  'café': '#8B4513',
  'marron': '#8B4513',
  'marrón': '#8B4513',
  
  // Variaciones de azul
  'azul marino': '#000080',
  'azul cielo': '#87CEEB',
  'azul claro': '#ADD8E6',
  'azul oscuro': '#00008B',
  'celeste': '#87CEEB',
  'turquesa': '#40E0D0',
  'cian': '#00FFFF',
  'aqua': '#00FFFF',
  
  // Variaciones de rojo
  'rojo oscuro': '#8B0000',
  'carmesí': '#DC143C',
  'carmesi': '#DC143C',
  'granate': '#800000',
  'borgoña': '#800020',
  'borgona': '#800020',
  
  // Variaciones de verde
  'verde claro': '#90EE90',
  'verde oscuro': '#006400',
  'verde lima': '#00FF00',
  'verde oliva': '#808000',
  'menta': '#98FF98',
  
  // Variaciones de amarillo
  'amarillo claro': '#FFFFE0',
  'dorado': '#FFD700',
  'oro': '#FFD700',
  'beige': '#F5F5DC',
  
  // Morados y rosas
  'violeta': '#EE82EE',
  'púrpura': '#800080',
  'purpura': '#800080',
  'magenta': '#FF00FF',
  'fucsia': '#FF00FF',
  'rosa claro': '#FFB6C1',
  'rosa fuerte': '#FF1493',
  
  // Naranjas
  'naranja claro': '#FFA07A',
  'coral': '#FF7F50',
  'durazno': '#FFDAB9',
  'melocotón': '#FFDAB9',
  'melocoton': '#FFDAB9',
  
  // Grises
  'gris claro': '#D3D3D3',
  'gris oscuro': '#A9A9A9',
  'plata': '#C0C0C0',
  'plateado': '#C0C0C0',
  
  // Marrones
  'chocolate': '#D2691E',
  'caramelo': '#D2691E',
  'canela': '#D2691E',
  
  // Otros
  'crema': '#FFFDD0',
  'hueso': '#E3DAC9',
  'perla': '#EAE0C8',
  'ivory': '#FFFFF0',
  'marfil': '#FFFFF0',
  'lavanda': '#E6E6FA',
  'lila': '#C8A2C8',
  'salmón': '#FA8072',
  'salmon': '#FA8072',
  'vino': '#722F37',
  'mostaza': '#FFDB58',
  'miel': '#FFB347',
  
  // Colores metálicos
  'bronce': '#CD7F32',
  'cobre': '#B87333',
  
  // Colores neutros
  'arena': '#C2B280',
  'taupe': '#483C32',
  'khaki': '#C3B091',
  'oliva': '#808000',
  
  // Variaciones comunes
  'claro': '#D3D3D3',
  'oscuro': '#696969',
  'pastel': '#FAD6A5',
  'neon': '#39FF14',
  'neón': '#39FF14',
  'fluorescente': '#CCFF00',
  
  // Combinaciones
  'rojo vino': '#722F37',
  'verde menta': '#98FF98',
  'azul rey': '#4169E1',
  'rosa mexicano': '#E4007C',
  'verde bandera': '#006847'
};

/**
 * Obtiene el código hexadecimal de un color a partir de su nombre en español
 * @param {string} colorName - Nombre del color en español
 * @returns {string} - Código hex del color o un gris por defecto
 */
export const getColorHex = (colorName) => {
  if (!colorName || typeof colorName !== 'string') {
    return '#808080'; // Gris por defecto
  }

  const normalizedName = colorName.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  if (colorMap[normalizedName]) {
    return colorMap[normalizedName];
  }
  
  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(colorMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Si no encuentra, devolver gris
  return '#808080';
};

/**
 * Componente de círculo de color
 * @param {string} colorName - Nombre del color
 * @param {number} size - Tamaño del círculo en px
 */
export const ColorCircle = ({ colorName, size = 12 }) => {
  const hex = getColorHex(colorName);
  
  return (
    <span
      className="inline-block rounded-full border border-gray-300"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: hex,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }}
      title={colorName}
    />
  );
};

export default { getColorHex, ColorCircle };
