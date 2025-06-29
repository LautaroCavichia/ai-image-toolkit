package com.chunaudis.image_toolkit.service;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ImageProxyService {

    private static final Logger log = LoggerFactory.getLogger(ImageProxyService.class);
    
    // Cache for processed thumbnails (in-memory for demo, use Redis in production)
    private final ConcurrentHashMap<String, byte[]> thumbnailCache = new ConcurrentHashMap<>();
    
    // HTTP client for downloading images
    private final HttpClient httpClient;
    
    // Thumbnail settings
    private static final int THUMBNAIL_WIDTH = 400;
    private static final int THUMBNAIL_HEIGHT = 300;
    private static final float THUMBNAIL_QUALITY = 0.7f;

    public ImageProxyService() {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    /**
     * Get full quality image from Cloudinary URL
     */
    public byte[] getFullQualityImage(String cloudinaryUrl) throws IOException {
        log.debug("Downloading full quality image from: {}", cloudinaryUrl);
        
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(cloudinaryUrl))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();

            HttpResponse<byte[]> response = httpClient.send(request, 
                HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() != 200) {
                throw new IOException("Failed to download image: HTTP " + response.statusCode());
            }

            byte[] imageData = response.body();
            log.debug("Downloaded {} bytes from Cloudinary", imageData.length);
            
            return imageData;

        } catch (Exception e) {
            log.error("Failed to download image from {}: {}", cloudinaryUrl, e.getMessage());
            throw new IOException("Failed to download image", e);
        }
    }

    /**
     * Get thumbnail image - either from cache or generate locally
     */
    public byte[] getThumbnailImage(String cloudinaryUrl) throws IOException {
        String cacheKey = generateCacheKey(cloudinaryUrl);
        
        // Check cache first
        byte[] cachedThumbnail = thumbnailCache.get(cacheKey);
        if (cachedThumbnail != null) {
            log.debug("Serving thumbnail from cache for: {}", cloudinaryUrl);
            return cachedThumbnail;
        }

        // Download original and create thumbnail
        log.debug("Creating thumbnail for: {}", cloudinaryUrl);
        
        byte[] originalImage = getFullQualityImage(cloudinaryUrl);
        byte[] thumbnailData = createThumbnail(originalImage);
        
        // Cache the result
        thumbnailCache.put(cacheKey, thumbnailData);
        log.debug("Cached thumbnail for: {}", cloudinaryUrl);
        
        return thumbnailData;
    }

    /**
     * Create thumbnail locally using Java image processing
     */
    private byte[] createThumbnail(byte[] originalImageData) throws IOException {
        try {
            // Read original image
            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(originalImageData));
            if (originalImage == null) {
                throw new IOException("Unable to read image data");
            }

            // Calculate thumbnail dimensions maintaining aspect ratio
            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();
            
            double aspectRatio = (double) originalWidth / originalHeight;
            int thumbnailWidth = THUMBNAIL_WIDTH;
            int thumbnailHeight = THUMBNAIL_HEIGHT;
            
            if (aspectRatio > (double) THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT) {
                // Image is wider than thumbnail ratio
                thumbnailHeight = (int) (THUMBNAIL_WIDTH / aspectRatio);
            } else {
                // Image is taller than thumbnail ratio
                thumbnailWidth = (int) (THUMBNAIL_HEIGHT * aspectRatio);
            }

            // Create thumbnail
            BufferedImage thumbnailImage = new BufferedImage(
                thumbnailWidth, thumbnailHeight, BufferedImage.TYPE_INT_RGB);
            
            Graphics2D g2d = thumbnailImage.createGraphics();
            
            // Set high quality rendering hints
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
            // Scale and draw the image
            Image scaledImage = originalImage.getScaledInstance(
                thumbnailWidth, thumbnailHeight, Image.SCALE_SMOOTH);
            g2d.drawImage(scaledImage, 0, 0, null);
            g2d.dispose();

            // Convert to byte array with compression
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            // Use JPEG format for smaller file size
            boolean written = ImageIO.write(thumbnailImage, "JPEG", outputStream);
            if (!written) {
                throw new IOException("Failed to write thumbnail image");
            }
            
            byte[] thumbnailData = outputStream.toByteArray();
            
            log.debug("Created thumbnail: {}x{} pixels, {} bytes (compression: {:.1f}%)", 
                thumbnailWidth, thumbnailHeight, thumbnailData.length,
                (1.0 - (double) thumbnailData.length / originalImageData.length) * 100);
            
            return thumbnailData;

        } catch (IOException e) {
            log.error("Failed to create thumbnail: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Generate cache key for thumbnail
     */
    private String generateCacheKey(String cloudinaryUrl) {
        // Use URL hash as cache key
        return "thumb_" + Math.abs(cloudinaryUrl.hashCode());
    }

    /**
     * Clear thumbnail cache (for maintenance)
     */
    public void clearThumbnailCache() {
        thumbnailCache.clear();
        log.info("Thumbnail cache cleared");
    }

    /**
     * Get cache statistics
     */
    public int getCacheSize() {
        return thumbnailCache.size();
    }
}