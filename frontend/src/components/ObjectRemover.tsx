import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWandMagicSparkles, 
  faSquare,
  faCoins,
  faTrash,
  faInfoCircle,
  faMagic,
  faEye,
  faCog,
  faVectorSquare
} from '@fortawesome/free-solid-svg-icons';

export interface ObjectRemovalConfig {
  method: 'BOUNDING_BOX' | 'PRECISE_MASK';
  coordinates?: {x: number, y: number, width: number, height: number};
  quality?: 'FREE' | 'PREMIUM';
  mask?: ImageData;
  detectionSettings?: {
    sensitivity: number;
    edgeThreshold: number;
    smoothing: number;
  };
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
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedMask, setDetectedMask] = useState<ImageData | null>(null);
  const [showDetectionSettings, setShowDetectionSettings] = useState(false);
  const [detectionSettings, setDetectionSettings] = useState({
    sensitivity: 0.3,
    edgeThreshold: 50,
    smoothing: 2
  });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageScale, setImageScale] = useState({ scaleX: 1, scaleY: 1 });
  const [actualImageSize, setActualImageSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState<'mask' | 'box'>('mask');
  
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

  // Función para detectar bordes
  const detectEdges = useCallback((imageData: ImageData, threshold: number = 50) => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const edges = new Uint8ClampedArray(width * height * 4);

  // Convertir a escala de grises y calcular gradientes
  const grayscale = new Uint8ClampedArray(width * height);
  const gradientX = new Int16Array(width * height);
  const gradientY = new Int16Array(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const r = data[idx * 4];
      const g = data[idx * 4 + 1];
      const b = data[idx * 4 + 2];
      grayscale[idx] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }

  // Aplicar Sobel operator
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      gradientX[idx] = (
        -1 * grayscale[(y-1)*width + (x-1)] +
        -2 * grayscale[y*width + (x-1)] +
        -1 * grayscale[(y+1)*width + (x-1)] +
        1 * grayscale[(y-1)*width + (x+1)] +
        2 * grayscale[y*width + (x+1)] +
        1 * grayscale[(y+1)*width + (x+1)]
      );
      
      gradientY[idx] = (
        -1 * grayscale[(y-1)*width + (x-1)] +
        -2 * grayscale[(y-1)*width + x] +
        -1 * grayscale[(y-1)*width + (x+1)] +
        1 * grayscale[(y+1)*width + (x-1)] +
        2 * grayscale[(y+1)*width + x] +
        1 * grayscale[(y+1)*width + (x+1)]
      );
      
      const magnitude = Math.sqrt(gradientX[idx] * gradientX[idx] + gradientY[idx] * gradientY[idx]);
      const edgeStrength = magnitude > threshold ? 255 : 0;
      
      edges[idx * 4] = edgeStrength;
      edges[idx * 4 + 1] = edgeStrength;
      edges[idx * 4 + 2] = edgeStrength;
      edges[idx * 4 + 3] = 255;
    }
  }
  
  return new ImageData(edges, width, height);
}, []);




  // Función para hacer flood fill dentro de un área delimitada
  const boundedFloodFill = useCallback((
  imageData: ImageData, 
  startX: number, 
  startY: number, 
  bounds: {x: number, y: number, width: number, height: number},
  sensitivity: number = 0.3
) => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const visited = new Set<string>();
  const mask = new Uint8ClampedArray(width * height * 4);
  
  const getPixelIndex = (x: number, y: number) => (y * width + x) * 4;
  const getPixelKey = (x: number, y: number) => `${x},${y}`;
  
  // Tomar muestra de varios puntos alrededor del centro para mejor detección
  const samplePoints = [
    {x: startX, y: startY},
    {x: startX + 5, y: startY},
    {x: startX - 5, y: startY},
    {x: startX, y: startY + 5},
    {x: startX, y: startY - 5}
  ];
  
  // Calcular color promedio de los puntos de muestra
  let avgR = 0, avgG = 0, avgB = 0;
  samplePoints.forEach(point => {
    const idx = getPixelIndex(point.x, point.y);
    avgR += data[idx];
    avgG += data[idx + 1];
    avgB += data[idx + 2];
  });
  avgR /= samplePoints.length;
  avgG /= samplePoints.length;
  avgB /= samplePoints.length;
  
  const threshold = sensitivity * 442; // 442 es la distancia máxima posible entre colores RGB
  
  const stack: Array<{x: number, y: number}> = [{x: startX, y: startY}];
  
  while (stack.length > 0) {
    const {x, y} = stack.pop()!;
    
    // Verificar que esté dentro de los límites
    if (x < bounds.x || x >= bounds.x + bounds.width || 
        y < bounds.y || y >= bounds.y + bounds.height) {
      continue;
    }
    
    const key = getPixelKey(x, y);
    if (visited.has(key)) continue;
    
    const pixelIndex = getPixelIndex(x, y);
    const currentColor = {
      r: data[pixelIndex],
      g: data[pixelIndex + 1],
      b: data[pixelIndex + 2]
    };
    
    // Calcular distancia al color promedio
    const distance = Math.sqrt(
      Math.pow(currentColor.r - avgR, 2) +
      Math.pow(currentColor.g - avgG, 2) +
      Math.pow(currentColor.b - avgB, 2)
    );
    
    if (distance > threshold) continue;
    
    visited.add(key);
    
    // Marcar el pixel en la máscara
    mask[pixelIndex] = 255;     // R
    mask[pixelIndex + 1] = 100; // G
    mask[pixelIndex + 2] = 100; // B
    mask[pixelIndex + 3] = 150; // Alpha
    
    // Agregar píxeles vecinos (8-direcciones para mejor cobertura)
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        stack.push({x: x + dx, y: y + dy});
      }
    }
  }
  
  return new ImageData(mask, width, height);
}, []);

  // Función para suavizar la máscara
  const smoothMask = useCallback((mask: ImageData, iterations: number = 2) => {
    const data = new Uint8ClampedArray(mask.data);
    const width = mask.width;
    const height = mask.height;
    
    for (let iter = 0; iter < iterations; iter++) {
      const newData = new Uint8ClampedArray(data);
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          
          let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
          let count = 0;
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
              totalR += data[neighborIdx];
              totalG += data[neighborIdx + 1];
              totalB += data[neighborIdx + 2];
              totalA += data[neighborIdx + 3];
              count++;
            }
          }
          
          newData[idx] = totalR / count;
          newData[idx + 1] = totalG / count;
          newData[idx + 2] = totalB / count;
          newData[idx + 3] = totalA / count;
        }
      }
      
      data.set(newData);
    }
    
    return new ImageData(data, width, height);
  }, []);

  // Función para detectar el objeto dentro del recuadro
  const detectObjectInBox = useCallback(async (box: BoundingBox) => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setIsDetecting(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      // Crear canvas temporal para procesamiento
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      // Dibujar la imagen en el canvas temporal
      tempCtx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Punto central del recuadro para iniciar el flood fill
      const centerX = Math.floor(box.x + box.width / 2);
      const centerY = Math.floor(box.y + box.height / 2);
      
      // Realizar flood fill dentro del recuadro
      const mask = boundedFloodFill(
        imageData, 
        centerX, 
        centerY, 
        box,
        detectionSettings.sensitivity
      );
      
      // Suavizar la máscara
      const smoothedMask = smoothMask(mask, detectionSettings.smoothing);
      
      // Detectar bordes si es necesario
      if (detectionSettings.edgeThreshold > 0) {
        const edges = detectEdges(imageData, detectionSettings.edgeThreshold);
        
        // Combinar máscara con bordes
        for (let i = 0; i < smoothedMask.data.length; i += 4) {
          if (edges.data[i] > 0 && smoothedMask.data[i + 3] > 0) {
            smoothedMask.data[i + 3] = Math.max(smoothedMask.data[i + 3], 200);
          }
        }
      }
      
      setDetectedMask(smoothedMask);
      
      // Actualizar configuración con la máscara
      const imageCoords = canvasToImageCoordinates(box);
      const newConfig = {
        ...config,
        method: 'PRECISE_MASK' as const,
        coordinates: {
          x: imageCoords.x,
          y: imageCoords.y,
          width: imageCoords.width || 0,
          height: imageCoords.height || 0
        },
        mask: smoothedMask,
        detectionSettings
      };
      
      onChange(newConfig);
      
    } catch (error) {
      console.error('Error en detección de objeto:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [detectionSettings, boundedFloodFill, smoothMask, detectEdges, config, onChange]);

  // Inicialización del canvas
  const initializeCanvas = useCallback(() => {
    if (!imagePreview || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    const setupCanvas = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const displayWidth = img.offsetWidth;
      const displayHeight = img.offsetHeight;
      
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      
      setImageScale({ scaleX, scaleY });
      setActualImageSize({ width: naturalWidth, height: naturalHeight });
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      
      setImageLoaded(true);
      redrawCanvas();
    };

    if (img.complete && img.naturalWidth > 0) {
      setupCanvas();
    } else {
      img.onload = setupCanvas;
    }
  }, [imagePreview]);

  useEffect(() => {
    initializeCanvas();
    
    const handleResize = () => {
      setTimeout(initializeCanvas, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const clampedX = Math.max(0, Math.min(x, canvas.width));
    const clampedY = Math.max(0, Math.min(y, canvas.height));
    
    return { x: clampedX, y: clampedY };
  }, []);

  const canvasToImageCoordinates = useCallback((canvasCoords: {x: number, y: number, width?: number, height?: number}) => {
    return {
      x: Math.round(canvasCoords.x * imageScale.scaleX),
      y: Math.round(canvasCoords.y * imageScale.scaleY),
      width: canvasCoords.width ? Math.round(canvasCoords.width * imageScale.scaleX) : undefined,
      height: canvasCoords.height ? Math.round(canvasCoords.height * imageScale.scaleY) : undefined
    };
  }, [imageScale]);

  // Función para dibujar el contorno de la máscara
  const drawMaskContour = useCallback((ctx: CanvasRenderingContext2D, mask: ImageData) => {
    ctx.save();
    ctx.strokeStyle = '#44ff44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const width = mask.width;
    const height = mask.height;
    const data = mask.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        if (data[idx + 3] > 0) {
          // Verificar si es un borde (al menos un vecino transparente)
          let isEdge = false;
          
          for (let dy = -1; dy <= 1 && !isEdge; dy++) {
            for (let dx = -1; dx <= 1 && !isEdge; dx++) {
              if (dx === 0 && dy === 0) continue;
              
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = (ny * width + nx) * 4;
                if (data[nidx + 3] === 0) {
                  isEdge = true;
                }
              } else {
                isEdge = true;
              }
            }
          }
          
          if (isEdge) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + 1, y);
          }
        }
      }
    }
    
    ctx.stroke();
    ctx.restore();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar máscara detectada como contorno
    if (detectedMask && viewMode === 'mask') {
      drawMaskContour(ctx, detectedMask);
    }
    
    // Dibujar máscara detectada como relleno
    if (detectedMask && viewMode === 'box') {
      ctx.putImageData(detectedMask, 0, 0);
    }

    ctx.lineWidth = 2;
    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';

    // Dibujar cajas existentes
    boundingBoxes.forEach((box, index) => {
      ctx.strokeStyle = '#007bff';
      ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
      
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      const label = `Selection ${index + 1}`;
      const labelWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = '#007bff';
      ctx.fillRect(box.x, box.y - 20, labelWidth + 8, 18);
      
      ctx.fillStyle = 'white';
      ctx.fillText(label, box.x + 4, box.y - 6);
    });

    // Dibujar caja actual mientras se está dibujando
    if (currentBox && !detectedMask) {
      ctx.strokeStyle = '#44ff44';
      ctx.fillStyle = 'rgba(68, 255, 68, 0.15)';
      
      ctx.fillRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      
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
  }, [boundingBoxes, currentBox, imageLoaded, imageScale, detectedMask, viewMode, drawMaskContour]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Manejo de eventos del canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded || isDetecting) return;

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
    setDetectedMask(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !imageLoaded || isDetecting) return;

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

  const handleCanvasMouseUp = async () => {
    if (!isDrawing || !currentBox || isDetecting) return;

    if (currentBox.width > 5 && currentBox.height > 5) {
      setBoundingBoxes([currentBox]);
      
      // Iniciar detección automática del objeto dentro del recuadro
      await detectObjectInBox(currentBox);
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

  const clearSelection = () => {
    setBoundingBoxes([]);
    setCurrentBox(null);
    setDetectedMask(null);
    onChange({
      ...config,
      method: 'BOUNDING_BOX',
      coordinates: undefined,
      mask: undefined
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
          Smart Object Removal Configuration
        </p>
      </div>

      {/* Method Display */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          padding: '16px',
          border: '2px solid #007bff',
          borderRadius: '8px',
          backgroundColor: '#e7f3ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon 
              icon={faMagic} 
              style={{ marginRight: '12px', color: '#007bff' }} 
            />
            <div>
              <span style={{ 
                fontWeight: '600', 
                color: '#007bff',
                fontSize: '14px'
              }}>
                Intelligent Object Detection
              </span>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '12px', 
                color: '#6c757d',
                lineHeight: '1.4'
              }}>
                Draw a box around the object for automatic detection
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetectionSettings(!showDetectionSettings)}
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: '#007bff',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
        </div>
      </div>

      {/* Detection Settings */}
      <AnimatePresence>
        {showDetectionSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '20px',
              padding: '16px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px'
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#495057' }}>
              Detection Settings
            </h4>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                  Sensitivity: {Math.round(detectionSettings.sensitivity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.1"
                  value={detectionSettings.sensitivity}
                  onChange={(e) => setDetectionSettings({
                    ...detectionSettings,
                    sensitivity: parseFloat(e.target.value)
                  })}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                  Edge Threshold: {detectionSettings.edgeThreshold}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={detectionSettings.edgeThreshold}
                  onChange={(e) => setDetectionSettings({
                    ...detectionSettings,
                    edgeThreshold: parseInt(e.target.value)
                  })}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                  Smoothing: {detectionSettings.smoothing}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={detectionSettings.smoothing}
                  onChange={(e) => setDetectionSettings({
                    ...detectionSettings,
                    smoothing: parseInt(e.target.value)
                  })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualization Mode Selector */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ 
          margin: '0 0 8px 0', 
          fontWeight: '600', 
          color: '#495057',
          fontSize: '14px'
        }}>
          Visualization Mode:
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewMode('mask')}
            style={{
              flex: 1,
              padding: '10px',
              border: `2px solid ${viewMode === 'mask' ? '#007bff' : '#dee2e6'}`,
              borderRadius: '8px',
              background: viewMode === 'mask' ? '#e7f3ff' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon 
                icon={faVectorSquare} 
                style={{ marginRight: '6px', color: viewMode === 'mask' ? '#007bff' : '#6c757d' }} 
              />
              <span style={{ 
                fontWeight: '600', 
                color: viewMode === 'mask' ? '#007bff' : '#495057',
                fontSize: '14px'
              }}>
                Precise Contour
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setViewMode('box')}
            style={{
              flex: 1,
              padding: '10px',
              border: `2px solid ${viewMode === 'box' ? '#007bff' : '#dee2e6'}`,
              borderRadius: '8px',
              background: viewMode === 'box' ? '#e7f3ff' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon 
                icon={faSquare} 
                style={{ marginRight: '6px', color: viewMode === 'box' ? '#007bff' : '#6c757d' }} 
              />
              <span style={{ 
                fontWeight: '600', 
                color: viewMode === 'box' ? '#007bff' : '#495057',
                fontSize: '14px'
              }}>
                Bounding Box
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Selection Interface */}
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
              <FontAwesomeIcon 
                icon={detectedMask ? faEye : faSquare} 
                style={{ marginRight: '8px', color: detectedMask ? '#28a745' : '#007bff' }}
              />
              <span style={{ fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                {detectedMask ? 'Object detected' : 'Draw selection box'}
              </span>
              {boundingBoxes.length > 0 && (
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 8px',
                  background: detectedMask ? '#28a745' : '#007bff',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {detectedMask ? 'Detected' : 'Selected'}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {isDetecting && (
                <div style={{ 
                  padding: '6px 12px',
                  background: '#ffc107',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  Detecting...
                </div>
              )}
              <button
                onClick={clearSelection}
                disabled={boundingBoxes.length === 0 && !detectedMask}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #dc3545',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#dc3545',
                  cursor: boundingBoxes.length > 0 || detectedMask ? 'pointer' : 'not-allowed',
                  opacity: boundingBoxes.length > 0 || detectedMask ? 1 : 0.5,
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
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: isDetecting ? 'wait' : 'crosshair',
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
            
            {/* Overlay de instrucciones */}
           
          </div>
          
          <div style={{ 
            marginTop: '12px',
            padding: '12px',
            background: detectedMask ? '#e8f5e8' : '#e3f2fd',
            borderRadius: '6px',
            border: `1px solid ${detectedMask ? '#c3e6c3' : '#bbdefb'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <FontAwesomeIcon 
                icon={faInfoCircle} 
                style={{ marginRight: '6px', color: detectedMask ? '#2e7d32' : '#1976d2' }} 
              />
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: detectedMask ? '#2e7d32' : '#1565c0' 
              }}>
                {detectedMask ? 'Detection Complete' : 'Selection Instructions'}
              </span>
            </div>
            
            {detectedMask ? (
              <div style={{ 
                fontSize: '12px', 
                color: '#2e7d32',
                lineHeight: '1.4'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  ✅ Object automatically detected within the selected area
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
                  <div><strong>Method:</strong> Bounded Flood Fill + Edge Detection</div>
                  <div><strong>Sensitivity:</strong> {Math.round(detectionSettings.sensitivity * 100)}%</div>
                  <div><strong>Smoothing:</strong> {detectionSettings.smoothing}x</div>
                </div>
              </div>
            ) : (
              <ul style={{ 
                margin: 0, 
                paddingLeft: '16px',
                fontSize: '12px', 
                color: '#1565c0',
                lineHeight: '1.4'
              }}>
                <li><strong>Step 1:</strong> Draw a selection box around the object you want to remove</li>
                <li><strong>Step 2:</strong> The system will automatically detect the exact shape within your selection</li>
                <li><strong>Tip:</strong> Try to make the box as tight as possible around the object for best results</li>
                <li>Adjust detection settings using the gear icon above if needed</li>
              </ul>
            )}
            
            {boundingBoxes.length > 0 && (
              <div style={{ 
                marginTop: '8px',
                fontSize: '12px',
                color: detectedMask ? '#2e7d32' : '#1565c0',
                padding: '8px',
                background: detectedMask ? '#f1f8e9' : '#e3f2fd',
                borderRadius: '4px'
              }}>
                <strong>Selection area:</strong> {canvasToImageCoordinates(boundingBoxes[0]).width}×{canvasToImageCoordinates(boundingBoxes[0]).height}px
                {detectedMask && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Detection Quality:</strong> High precision mask generated
                  </div>
                )}
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
                  {detectedMask && option.type === 'PREMIUM' && (
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '11px', 
                      color: '#28a745',
                      fontWeight: '600'
                    }}>
                      ⭐ Recommended for precise selections
                    </p>
                  )}
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
            {detectedMask && (
              <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                (includes precise detection processing)
              </span>
            )}
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

      {/* Detection Performance Info */}
      {detectedMask && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            marginTop: '12px',
            padding: '12px',
            background: '#e8f5e8',
            border: '1px solid #c3e6c3' ,
            borderRadius: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <FontAwesomeIcon 
              icon={faMagic} 
              style={{ marginRight: '6px', color: '#2e7d32' }} 
            />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2e7d32' }}>
              Precise Detection Results
            </span>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#2e7d32',
            lineHeight: '1.4'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <strong>Algorithm:</strong> Bounded Flood Fill + Edge Detection
              </div>
              <div>
                <strong>Precision:</strong> High
              </div>
              <div>
                <strong>Detection Area:</strong> Within user selection
              </div>
              <div>
                <strong>Mask Quality:</strong> {detectionSettings.smoothing > 0 ? 'Smoothed' : 'Raw'}
              </div>
            </div>
            <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
              💡 For best results with precise detection, use Premium Quality inpainting
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ObjectRemovalConfigComponent;