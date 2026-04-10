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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
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

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div
            ref={ticketRef}
            className="bg-white text-black p-6 font-mono text-xs"
            style={{ width: '300px', margin: '0 auto' }}
          >
            {/* Header minimalista */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold mb-1">JessicaAleSuarez</h1>
              <div className="text-[10px] leading-relaxed">
                <p>Plaza de la Tecnología</p>
                <p>Local 26 Entrada sobre Uruguay 11</p>
                <p>Con salida al pasillo 2</p>
              </div>
            </div>

            <div className="border-t border-b border-black py-2 mb-3">
              <div className="text-center">
                <p className="text-sm font-bold">{pedido.cliente}</p>
              </div>
            </div>

            {/* Info */}
            <div className="mb-3 space-y-0.5">
              <div className="flex justify-between">
                <span>Fecha</span>
                <span>{formatDate(pedido.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hora</span>
                <span>{formatTime(pedido.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span>No</span>
                <span className="font-bold">{pedido.numero}</span>
              </div>
            </div>

            <div className="border-t border-black my-2"></div>

            {/* Productos con nuevo formato */}
            <div className="mb-3">
              {pedido.productos.map((producto, index) => (
                <div key={index} className="mb-3">
                  {/* Nombre del producto */}
                  <div className="font-bold mb-1">{producto.nombre}</div>
                  
                  {/* Si tiene colores, mostrar cada color en una línea */}
                  {producto.colores && producto.colores.length > 0 ? (
                    producto.colores.map((color, colorIdx) => {
                      const colorStr = typeof color === 'string' ? color : color.nombre || color;
                      // Dividir cantidad entre colores si hay múltiples
                      const cantidadPorColor = Math.floor(producto.cantidad / producto.colores.length);
                      const resto = colorIdx === 0 ? producto.cantidad % producto.colores.length : 0;
                      const cantidad = cantidadPorColor + resto;
                      
                      return (
                        <div key={colorIdx} className="flex justify-between pl-4 text-[11px]">
                          <span className="flex-1">{colorStr.toUpperCase()}</span>
                          <span className="w-12 text-center">{cantidad}</span>
                          <span className="w-16 text-right">${producto.precioUnitario.toFixed(2)}</span>
                          <span className="w-20 text-right font-bold">
                            ${(cantidad * producto.precioUnitario).toFixed(2)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    // Si no tiene colores, mostrar cantidad directa
                    <div className="flex justify-between pl-4 text-[11px]">
                      <span className="flex-1">N/A</span>
                      <span className="w-12 text-center">{producto.cantidad}</span>
                      <span className="w-16 text-right">${producto.precioUnitario.toFixed(2)}</span>
                      <span className="w-20 text-right font-bold">
                        ${(producto.cantidad * producto.precioUnitario).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-black pt-2 mb-3">
              <div className="flex justify-between text-sm">
                <span>Total de artículos</span>
                <span className="font-bold">
                  {pedido.productos.reduce((sum, p) => sum + p.cantidad, 0)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base mt-1">
                <span>Precio total</span>
                <span>${pedido.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-black pt-2"></div>

            {/* Política */}
            <div className="text-[9px] text-center leading-tight space-y-0.5 mt-3">
              <p className="font-bold text-[10px]">7 DÍAS DE GARANTÍA CON TICKET ORIGINAL</p>
              <p>(REPARACIÓN) ES PIEZAS NO ROTO NO</p>
              <p>DEFECTOS DE FÁBRICA NO ROTO NO</p>
              <p>MALTRATADO NO HAY CAMBIOS NI</p>
              <p>DEVOLUCIONES MENORES A $50 MXN NO HAY</p>
              <p>GARANTÍA</p>
              <p className="font-bold text-[10px] mt-2">DE LUNES A SÁBADO DE 11AM A 6PM</p>
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
