"""
Image processing module for background removal with Cloudinary integration.
Implements full-quality and low-quality thumbnail generation.
Uses enhanced OCR optimized for signature detection (white background with dark line).
FIXED: Job tracking and duplicate prevention system.
"""

import logging
import time
import traceback
from typing import Dict, Tuple, Any, Set
import io
import threading
from PIL import Image, ImageFilter
from rembg import remove, new_session
import pytesseract
import numpy as np

from app.cloudinary_service import CloudinaryService

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Error específico para fallos en el procesamiento de la imagen."""

# Diccionario para cachear sesiones por modelo y evitar crear una sesión nueva para cada imagen
_sessions_cache: Dict[str, Any] = {}

# Set para trackear jobs activos y evitar duplicados
_active_jobs: Set[str] = set()
_jobs_lock = threading.Lock()

def clear_sessions_cache():
    """
    Limpia el caché de sesiones rembg para liberar memoria.
    Útil al reiniciar la aplicación o cambiar configuraciones.
    """
    global _sessions_cache
    logger.info("🧹 Limpiando caché de sesiones rembg")
    _sessions_cache.clear()

def clear_active_jobs():
    """
    Limpia el set de jobs activos.
    Útil al reiniciar la aplicación o en caso de errores críticos.
    """
    global _active_jobs
    with _jobs_lock:
        logger.info("🧹 Limpiando lista de jobs activos")
        _active_jobs.clear()

def get_active_jobs_count() -> int:
    """Retorna el número de jobs actualmente en procesamiento."""
    with _jobs_lock:
        return len(_active_jobs)

def get_session_for_model(model_name: str):
    """
    Obtiene una sesión rembg reutilizable para el modelo dado,
    almacenando en caché para evitar crear múltiples sesiones.
    """
    if model_name not in _sessions_cache:
        logger.info(f"🔧 Creando nueva sesión para el modelo: {model_name}")
        _sessions_cache[model_name] = new_session(model_name)
    else:
        logger.debug(f"♻️ Reutilizando sesión existente para el modelo: {model_name}")
    return _sessions_cache[model_name]


def is_probable_signature(image: Image.Image, ocr_confidence_threshold=30.0) -> bool:
    """
    Detecta firmas en imágenes con fondo blanco y línea oscura usando OCR optimizado.
    """
    try:
        # Convertir a escala de grises
        gray = image.convert("L")
        
        # Calcular porcentaje de píxeles claros (fondo)
        np_gray = np.array(gray)
        light_pixels = np_gray > 200  # Píxeles casi blancos
        light_ratio = np.mean(light_pixels)
        
        # Si no hay suficiente fondo blanco, descartar como firma
        if light_ratio < 0.85:
            logger.debug(f"📋 Fondo insuficiente: {light_ratio:.2f} < 0.85")
            return False
            
        # Preprocesamiento mejorado para firmas
        # 1. Enfocar ligeramente para mejorar líneas finas
        sharpened = gray.filter(ImageFilter.SHARPEN)
        
        # 2. Alto contraste para firmas oscuras
        high_contrast = sharpened.point(lambda x: 0 if x < 200 else 255)
        
        # 3. OCR optimizado para firmas (configuración especial)
        ocr_config = r'--psm 6 --oem 3 -c tessedit_char_whitelist=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        
        ocr_data = pytesseract.image_to_data(
            high_contrast, 
            lang="eng", 
            output_type=pytesseract.Output.DICT,
            config=ocr_config
        )
        
        # Calcular confianza máxima detectada - CORREGIDO ERROR DE TIPO
        confidences = []
        for conf in ocr_data['conf']:
            try:
                c = float(conf)
                if c > 0:  # Ignorar valores negativos o cero
                    confidences.append(c)
            except (ValueError, TypeError):
                continue
        
        max_conf = max(confidences) if confidences else 0
        
        if max_conf <= ocr_confidence_threshold:
            logger.info(f"✍️ Firma detectada: fondo blanco ({light_ratio:.2f}), confianza OCR baja ({max_conf})")
            return True
            
        logger.debug(f"📝 No es firma: confianza OCR alta ({max_conf})")
        return False

    except Exception as e:
        logger.warning(f"⚠️ Detección de firma fallida: {e}")
        return False


def detect_signature_or_text(image_bytes: bytes, ocr_confidence_threshold: float = 30.0) -> str:
    """
    Detecta si la imagen es una firma (fondo blanco + línea oscura).
    Devuelve 'isnet-general-use' para firmas, 'u2net' para imágenes normales.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        if is_probable_signature(image, ocr_confidence_threshold):
            return "isnet-general-use"
        else:
            return "u2net"

    except Exception as e:
        logger.warning(f"⚠️ Detección OCR fallida: {e}, usando modelo general")
        return "u2net"


async def perform_background_removal(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    
    # DEBUGGING: Mostrar stack trace para identificar de dónde viene la llamada
    logger.error("=" * 80)
    logger.error(f"🔍 JOB INICIADO: {job_id}")
    logger.error(f"🔗 URL: {image_url}")
    logger.error(f"⚙️ CONFIG: {config}")
    logger.error("📋 STACK TRACE DE LLAMADA:")
    logger.error("Stack trace:")
    logger.error(traceback.format_exc())
    logger.error("=" * 80)
    
    # Verificar si el job ya está siendo procesado (prevenir duplicados)
    with _jobs_lock:
        if job_id in _active_jobs:
            error_msg = f"🚫 Job {job_id} ya está siendo procesado, ignorando duplicado"
            logger.warning(error_msg)
            raise ImageProcessingError(error_msg)
        
        # Agregar job al set de activos
        _active_jobs.add(job_id)
        logger.info(f"📝 Job {job_id} agregado a lista activa. Total jobs activos: {len(_active_jobs)}")

    ocr_confidence_threshold = config.get("ocr_confidence_threshold", 30.0)

    try:
        logger.info(f"🚀 Iniciando trabajo {job_id} con URL: {image_url}")
        
        logger.info(f"⬇️ Descargando imagen: {image_url}")
        input_image_bytes = CloudinaryService.download_image_from_url(image_url)

        model_to_use = detect_signature_or_text(input_image_bytes, ocr_confidence_threshold)
        logger.info(f"🤖 Modelo seleccionado para {job_id}: {model_to_use}")

        # Usar sesión cacheada o crear nueva sólo si no existe
        session = get_session_for_model(model_to_use)

        start_time = time.perf_counter()
        logger.info(f"🎨 Removiendo fondo para {job_id}")
        output_bytes = remove(input_image_bytes, session=session)
        elapsed = time.perf_counter() - start_time

        logger.info(f"🖼️ Generando thumbnail para {job_id}")
        output_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        thumbnail = output_image.copy()
        thumbnail.thumbnail((400, 300), Image.Resampling.LANCZOS)

        thumbnail_buffer = io.BytesIO()
        thumbnail.save(thumbnail_buffer, format="PNG", optimize=True, quality=70)
        thumbnail_bytes = thumbnail_buffer.getvalue()

        logger.info(f"☁️ Subiendo imagen procesada a Cloudinary para {job_id}")
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            output_bytes, job_id, "bg_removed"
        )

        logger.info(f"☁️ Subiendo thumbnail a Cloudinary para {job_id}")
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )

        logger.info(f"✅ Trabajo {job_id} completado con éxito")
        logger.info(f"🔗 URL calidad completa: {processed_url}")
        logger.info(f"🔗 URL thumbnail: {thumbnail_url}")

        processing_info = {
            "model_version": model_to_use,
            "mode": "cloudinary_integration",
            "processing_time_seconds": round(elapsed, 3),
            "signature_detection_threshold": ocr_confidence_threshold,
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "job_id": job_id,  # Agregar job_id para tracking
            "timestamp": time.time()  # Timestamp para debugging
        }

        return processed_url, processing_info

    except Exception as e:
        logger.error(f"❌ Error en trabajo {job_id}: {e}")
        logger.error(f"📋 Traceback completo: {traceback.format_exc()}")
        raise ImageProcessingError(f"Error al remover fondo en job {job_id}: {e}")
    
    finally:
        # SIEMPRE remover el job del set activo, sin importar si hubo error o éxito
        with _jobs_lock:
            _active_jobs.discard(job_id)
            logger.info(f"🗑️ Job {job_id} removido de lista activa. Jobs restantes: {len(_active_jobs)}")


def get_system_status() -> Dict[str, Any]:
    """
    Retorna el estado actual del sistema de procesamiento.
    Útil para debugging y monitoreo.
    """
    with _jobs_lock:
        return {
            "active_jobs_count": len(_active_jobs),
            "active_jobs": list(_active_jobs),
            "cached_models": list(_sessions_cache.keys()),
            "cached_sessions_count": len(_sessions_cache),
            "timestamp": time.time()
        }


def force_reset_system():
    """
    Función de emergencia para resetear completamente el sistema.
    USAR SOLO EN CASO DE PROBLEMAS CRÍTICOS.
    """
    logger.warning("🚨 RESET FORZADO DEL SISTEMA DE PROCESAMIENTO")
    clear_active_jobs()
    clear_sessions_cache()
    logger.warning("🚨 Sistema reseteado completamente")