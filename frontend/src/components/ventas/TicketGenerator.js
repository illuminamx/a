import React, { useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TicketGenerator = ({ pedido, onClose }) => {
  const { isDark } = useTheme();
  const ticketRef = useRef(null);

  const handlePrint = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, canvas.height * 80 / canvas.width]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 80, canvas.height * 80 / canvas.width);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-zinc-900' : 'bg-white'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <h3 className="font-bold text-lg">Ticket de Venta</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* TICKET */}
          <div
            ref={ticketRef}
            className="bg-white text-black p-6 mx-auto"
            style={{ maxWidth: '400px', fontFamily: 'Arial, sans-serif' }}
          >
            {/* 1. HEADER */}
            <div className="flex justify-between items-start mb-4">
              {/* Izquierda */}
              <div>
                <h1 className="font-extrabold text-xl leading-tight">JessicaAleSuarez</h1>
                <div className="text-xs mt-1 leading-tight">
                  <p>Plaza de la Tecnología</p>
                  <p>Local 26 Entrada sobre Uruguay 11</p>
                  <p>Con salida al pasillo 2</p>
                </div>
              </div>
              {/* Derecha - Logo SVG */}
              <div className="flex-shrink-0">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 5 L55 30 L30 55 L5 30 Z" stroke="black" strokeWidth="2" fill="none"/>
                  <text x="30" y="38" fontSize="28" fontWeight="bold" fontStyle="italic" textAnchor="middle" fill="black">J</text>
                </svg>
              </div>
            </div>

            {/* 2. SEPARADOR 1 */}
            <div className="w-4/5 mx-auto border-b-2 border-black mb-4"></div>

            {/* 3. DATOS DE LA ORDEN */}
            <div className="mb-4">
              <p className="font-bold text-sm">Cliente:</p>
              <p className="font-extrabold text-3xl uppercase my-2">{pedido.cliente}</p>
              <div className="text-sm space-y-0.5">
                <p>Usuario: GMAIL LOGIN</p>
                <p>Fecha: {formatDate(pedido.fecha)}</p>
                <p>No. {pedido.numero || 'N/A'}</p>
              </div>
            </div>

            {/* 4. SEPARADOR 2 */}
            <div className="w-1/2 mx-auto border-b-2 border-black mb-4"></div>

            {/* 5. LISTADO DE PRODUCTOS (CSS GRID) */}
            <div className="mb-4">
              {/* Headers */}
              <div className="grid grid-cols-4 gap-2 text-xs uppercase font-bold mb-2">
                <div className="col-span-1">PRODUCTO</div>
                <div className="text-center">CANTIDAD</div>
                <div className="text-center">P/PIEZA</div>
                <div className="text-center">TOTAL</div>
              </div>

              {/* Productos */}
              <div className="text-xs">
                {pedido.productos.map((producto, index) => (
                  <div key={index} className="mb-3">
                    {/* Nombre del producto */}
                    <div className="font-bold mb-1">{producto.nombre}</div>
                    
                    {/* Variantes/Colores */}
                    {producto.colores && producto.colores.length > 0 ? (
                      producto.colores.map((color, i) => {
                        const totalColor = producto.precioUnitario * color.cantidad;
                        return (
                          <div key={i} className="grid grid-cols-4 gap-2 mb-0.5">
                            <div className="col-span-1 pl-2">• {color.nombre}</div>
                            <div className="text-center">{color.cantidad}</div>
                            <div className="text-center">${producto.precioUnitario.toFixed(2)}</div>
                            <div className="text-center font-bold">${totalColor.toFixed(2)}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="grid grid-cols-4 gap-2 mb-0.5">
                        <div className="col-span-1 pl-2">• N/A</div>
                        <div className="text-center">1</div>
                        <div className="text-center">${producto.precioUnitario.toFixed(2)}</div>
                        <div className="text-center font-bold">${producto.precioUnitario.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. SEPARADOR 3 */}
            <div className="w-1/2 mx-auto border-b-2 border-black mb-4"></div>

            {/* 7. TOTALES */}
            <div className="text-sm mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Total de artículos:</span>
                <span className="font-bold">
                  {pedido.productos.reduce((sum, p) => {
                    return sum + p.colores.reduce((s, c) => s + c.cantidad, 0);
                  }, 0)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span>Precio total con IVA:</span>
                <span className="font-bold">${pedido.total.toFixed(2)}</span>
              </div>
            </div>

            {/* 8. SEPARADOR 4 */}
            <div className="w-1/2 mx-auto border-b-2 border-black mb-4"></div>

            {/* 9. FOOTER (TÉRMINOS) */}
            <div className="text-xs uppercase leading-tight text-center">
              <p className="font-bold mb-1">7 DÍAS DE GARANTÍA CON TICKET ORIGINAL</p>
              <p>(REPARACIÓN) ES PIEZAS NO ROTO NO</p>
              <p>DEFECTOS DE FÁBRICA NO ROTO NO</p>
              <p>MALTRATADO NO HAY CAMBIOS NI</p>
              <p>DEVOLUCIONES MENORES A $50 MXN NO HAY</p>
              <p>GARANTÍA</p>
              <p className="font-bold mt-2">DE LUNES A SÁBADO DE 11AM A 6PM</p>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t flex gap-3 ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <button
            onClick={handlePrint}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <Printer size={18} />
            Abrir para Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketGenerator;
