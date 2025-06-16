import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWandMagicSparkles, 
  faSquare,
  faCoins,
  faTrash,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

export interface ObjectRemovalConfig {
  method: 'BOUNDING_BOX';
  coordinates?: {x: number, y: number, width: number, height: number};
  quality?: 'FREE' | 'PREMIUM';
}

interface ObjectRemovalConfigProps {
  config: ObjectRemovalConfig;
  onChange: (config: ObjectRemovalConfig) => void;
  imagePreview?: string;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

const ObjectRemovalConfigComponent: React.FC<ObjectRemovalConfigProps> = ({ 
  config, 
  onChange, 
  imagePreview 
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageScale, setImageScale] = useState({ scaleX: 1, scaleY: 1 });
  const [actualImageSize, setActualImageSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const qualityOptions = [
    {
      type: 'FREE',
      label: 'Standard Quality',
      description: 'Good quality inpainting',
      tokenCost: 0
    },
    {
      type: 'PREMIUM',
      label: 'Premium Quality',
      description: 'High-quality AI inpainting',
      tokenCost: 1
    }
  ];

  // Mejorar la inicialización del canvas
  const initializeCanvas = useCallback(() => {
    if (!imagePreview || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    // Esperar a que la imagen se cargue completamente
    const setupCanvas = () => {
      // Obtener dimensiones reales de la imagen
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      
      // Obtener dimensiones mostradas
      const displayWidth = img.offsetWidth;
      const displayHeight = img.offsetHeight;
      
      // Calcular escala
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      
      setImageScale({ scaleX, scaleY });
      setActualImageSize({ width: naturalWidth, height: naturalHeight });
      
      // Configurar canvas para que coincida exactamente con la imagen mostrada
      const rect = img.getBoundingClientRect();
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // Asegurar que el canvas tenga exactamente las mismas dimensiones que la imagen
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      
      setImageLoaded(true);
      redrawCanvas();
      
      console.log('📐 Canvas inicializado:', {
        naturalSize: { width: naturalWidth, height: naturalHeight },
        displaySize: { width: displayWidth, height: displayHeight },
        scale: { scaleX, scaleY }
      });
    };

    if (img.complete && img.naturalWidth > 0) {
      setupCanvas();
    } else {
      img.onload = setupCanvas;
    }
  }, [imagePreview]);

  useEffect(() => {
    initializeCanvas();
    
    // Reinicializar cuando cambie el tamaño de ventana
    const handleResize = () => {
      setTimeout(initializeCanvas, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  // Mejorar el cálculo de coordenadas
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Calcular coordenadas relativas al canvas
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Asegurar que las coordenadas estén dentro de los límites
    const clampedX = Math.max(0, Math.min(x, canvas.width));
    const clampedY = Math.max(0, Math.min(y, canvas.height));
    
    return { x: clampedX, y: clampedY };
  }, []);

  // Convertir coordenadas del canvas a coordenadas de imagen real
  const canvasToImageCoordinates = useCallback((canvasCoords: {x: number, y: number, width?: number, height?: number}) => {
    return {
      x: Math.round(canvasCoords.x * imageScale.scaleX),
      y: Math.round(canvasCoords.y * imageScale.scaleY),
      width: canvasCoords.width ? Math.round(canvasCoords.width * imageScale.scaleX) : undefined,
      height: canvasCoords.height ? Math.round(canvasCoords.height * imageScale.scaleY) : undefined
    };
  }, [imageScale]);

  // Actualizar configuración cuando cambien las coordenadas
  useEffect(() => {
    if (boundingBoxes.length > 0) {
      const firstBox = boundingBoxes[0];
      const imageCoords = canvasToImageCoordinates(firstBox);
      
      const newConfig = {
        ...config,
        coordinates: {
          x: imageCoords.x,
          y: imageCoords.y,
          width: imageCoords.width || 0,
          height: imageCoords.height || 0
        }
      };
      
      console.log('🎯 Coordenadas actualizadas:', {
        canvas: firstBox,
        image: imageCoords,
        scale: imageScale
      });
      
      onChange(newConfig);
    }
  }, [boundingBoxes, canvasToImageCoordinates, imageScale]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configurar estilos de dibujo
    ctx.lineWidth = 2;
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';

    // Dibujar cajas existentes
    boundingBoxes.forEach((box, index) => {
      ctx.strokeStyle = '#ff4444';
      ctx.fillStyle = 'rgba(255, 68, 68, 0.15)';
      
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Etiqueta con fondo
      const label = `Object ${index + 1}`;
      const labelWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(box.x, box.y - 20, labelWidth + 8, 18);
      
      ctx.fillStyle = 'white';
      ctx.fillText(label, box.x + 4, box.y - 6);
    });

    // Dibujar caja actual
    if (currentBox) {
      ctx.strokeStyle = '#44ff44';
      ctx.fillStyle = 'rgba(68, 255, 68, 0.15)';
      
      ctx.fillRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      
      // Mostrar dimensiones
      if (currentBox.width > 50 && currentBox.height > 20) {
        const dimensionText = `${Math.round(currentBox.width * imageScale.scaleX)}×${Math.round(currentBox.height * imageScale.scaleY)}px`;
        const textWidth = ctx.measureText(dimensionText).width;
        
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(
          currentBox.x + currentBox.width - textWidth - 8, 
          currentBox.y + currentBox.height - 18, 
          textWidth + 8, 
          16
        );
        
        ctx.fillStyle = 'white';
        ctx.fillText(
          dimensionText, 
          currentBox.x + currentBox.width - textWidth - 4, 
          currentBox.y + currentBox.height - 4
        );
      }
    }
  }, [boundingBoxes, currentBox, imageLoaded, imageScale]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;

    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentBox({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0,
      id: Date.now().toString()
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !imageLoaded) return;

    const coords = getCanvasCoordinates(e);
    const width = coords.x - startPoint.x;
    const height = coords.y - startPoint.y;

    setCurrentBox({
      x: width < 0 ? coords.x : startPoint.x,
      y: height < 0 ? coords.y : startPoint.y,
      width: Math.abs(width),
      height: Math.abs(height),
      id: Date.now().toString()
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;

    // Validar tamaño mínimo
    if (currentBox.width > 5 && currentBox.height > 5) {
      setBoundingBoxes([currentBox]); // Solo permitir una caja por ahora
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
  };

  const handleQualityChange = (quality: 'FREE' | 'PREMIUM') => {
    onChange({
      ...config,
      quality
    });
  };

  const clearBoundingBoxes = () => {
    setBoundingBoxes([]);
    setCurrentBox(null);
    onChange({
      ...config,
      coordinates: undefined
    });
  };

  const getTokenCost = () => {
    return config.quality === 'PREMIUM' ? 1 : 0;
  };

  return (
    <motion.div 
      className="object-removal-config"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '16px',
        border: '1px solid #e9ecef'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <FontAwesomeIcon icon={faWandMagicSparkles} style={{ marginRight: '8px', color: '#007bff' }} />
        <p style={{ 
          margin: 0, 
          fontWeight: '600', 
          color: '#495057',
          fontSize: '16px'
        }}>
          Object Removal Configuration
        </p>
      </div>

      {/* Method Display - Single Rectangle Method */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          padding: '16px',
          border: '2px solid #007bff',
          borderRadius: '8px',
          backgroundColor: '#e7f3ff',
          display: 'flex',
          alignItems: 'center'
        }}>
          <FontAwesomeIcon 
            icon={faSquare} 
            style={{ marginRight: '12px', color: '#007bff' }} 
          />
          <div>
            <span style={{ 
              fontWeight: '600', 
              color: '#007bff',
              fontSize: '14px'
            }}>
              Select Areas
            </span>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '12px', 
              color: '#6c757d',
              lineHeight: '1.4'
            }}>
              Draw boxes around objects to remove
            </p>
          </div>
        </div>
      </div>

      {/* Bounding Box Selection Interface */}
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ marginBottom: '20px' }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                Draw a box around the object to remove
              </span>
              {boundingBoxes.length > 0 && (
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 8px',
                  background: '#28a745',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  1 selected
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={clearBoundingBoxes}
                disabled={boundingBoxes.length === 0}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #dc3545',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#dc3545',
                  cursor: boundingBoxes.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: boundingBoxes.length > 0 ? 1 : 0.5,
                  fontSize: '12px'
                }}
              >
                <FontAwesomeIcon icon={faTrash} style={{ marginRight: '4px' }} />
                Clear
              </button>
            </div>
          </div>
          
          <div 
            ref={containerRef}
            style={{ 
              position: 'relative', 
              display: 'inline-block',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              overflow: 'hidden',
              maxWidth: '100%'
            }}
          >
            <img
              ref={imageRef}
              src={imagePreview}
              alt="Selection area"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '500px',
                display: 'block',
                userSelect: 'none'
              }}
              draggable={false}
              onLoad={() => console.log('🖼️ Imagen cargada')}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: 'crosshair',
                pointerEvents: imageLoaded ? 'auto' : 'none'
              }}
            />
            
            {!imageLoaded && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                Loading image...
              </div>
            )}
          </div>
          
          <div style={{ 
            marginTop: '12px',
            padding: '12px',
            background: '#e3f2fd',
            borderRadius: '6px',
            border: '1px solid #bbdefb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '6px', color: '#1976d2' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1565c0' }}>
                Selection Instructions
              </span>
            </div>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '16px',
              fontSize: '12px', 
              color: '#1565c0',
              lineHeight: '1.4'
            }}>
              <li>Click and drag to draw a selection box</li>
              <li>Only one object can be selected at a time</li>
              <li>Make sure to fully encompass the object you want to remove</li>
              <li>Drawing a new box will replace the previous selection</li>
            </ul>
            
            {boundingBoxes.length > 0 && (
              <div style={{ 
                marginTop: '8px',
                fontSize: '12px',
                color: '#1565c0'
              }}>
                <strong>Current selection:</strong> {canvasToImageCoordinates(boundingBoxes[0]).width}×{canvasToImageCoordinates(boundingBoxes[0]).height}px
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Quality Selection */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ 
          margin: '0 0 12px 0', 
          fontWeight: '600', 
          color: '#495057',
          fontSize: '14px'
        }}>
          Inpainting Quality:
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          {qualityOptions.map((option) => (
            <div
              key={option.type}
              onClick={() => handleQualityChange(option.type as 'FREE' | 'PREMIUM')}
              style={{
                flex: 1,
                padding: '12px',
                border: `2px solid ${config.quality === option.type ? '#007bff' : '#dee2e6'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: config.quality === option.type ? '#e7f3ff' : 'white',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ 
                    fontWeight: '600', 
                    color: config.quality === option.type ? '#007bff' : '#495057',
                    fontSize: '14px'
                  }}>
                    {option.label}
                  </span>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '12px', 
                    color: '#6c757d'
                  }}>
                    {option.description}
                  </p>
                </div>
                {option.tokenCost > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#ffc107',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    <FontAwesomeIcon icon={faCoins} style={{ marginRight: '4px' }} />
                    {option.tokenCost}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Cost Summary */}
      {getTokenCost() > 0 && (
        <div style={{
          padding: '12px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '14px', color: '#856404' }}>
            Total token cost for this configuration:
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: '#856404',
            fontWeight: '600'
          }}>
            <FontAwesomeIcon icon={faCoins} style={{ marginRight: '6px' }} />
            {getTokenCost()}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ObjectRemovalConfigComponent;