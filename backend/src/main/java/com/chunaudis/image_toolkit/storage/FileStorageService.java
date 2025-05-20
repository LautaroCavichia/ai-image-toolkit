package com.chunaudis.image_toolkit.storage;        

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {
    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${app.storage.base-path}")
    private String basePathString;
    @Value("${app.storage.originals-subdir}")
    private String originalsSubDir;
    @Value("${app.storage.processed-subdir}")
    private String processedSubDir;

    private Path originalsLocation;
    private Path processedLocation;

    @PostConstruct
    public void init() {
        try {
            this.originalsLocation = Paths.get(basePathString, originalsSubDir).toAbsolutePath().normalize();
            this.processedLocation = Paths.get(basePathString, processedSubDir).toAbsolutePath().normalize();
            
            Files.createDirectories(this.originalsLocation);
            Files.createDirectories(this.processedLocation);
            
            log.info("Initialized storage locations: originals={}, processed={}", 
                this.originalsLocation, this.processedLocation);
        } catch (IOException ex) {
            log.error("Could not initialize storage locations", ex);
            throw new RuntimeException("Could not initialize storage locations", ex);
        }
    }

    public String storeOriginalFile(MultipartFile file, UUID userId, UUID imageId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Failed to store empty file.");
        }
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = imageId.toString() + "_original" + extension;

        try {
            Path userDirPath = this.originalsLocation.resolve(userId.toString());
            Files.createDirectories(userDirPath); // Ensure user directory exists
            Path destinationFile = userDirPath.resolve(filename).normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(userDirPath.toAbsolutePath())) {
                throw new IllegalArgumentException("Cannot store file outside current directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // Extract image metadata (width, height)
            int[] dimensions = getImageDimensions(destinationFile.toString());
            
            log.info("Stored original file: {} ({}x{})", 
                     destinationFile.toString(), dimensions[0], dimensions[1]);
            
            // Return relative path or full path as needed by your JobMessageDTO
            return destinationFile.toString(); // For local FS, full path might be needed by Python
        } catch (IOException e) {
            log.error("Failed to store file {}", filename, e);
            throw new RuntimeException("Failed to store file " + filename, e);
        }
    }

    /**
     * Get image dimensions (width and height)
     * @param filePath Path to the image file
     * @return int array with [width, height], or [0, 0] if reading fails
     */
    public int[] getImageDimensions(String filePath) {
        try {
            BufferedImage img = ImageIO.read(Paths.get(filePath).toFile());
            if (img != null) {
                return new int[] { img.getWidth(), img.getHeight() };
            }
        } catch (IOException e) {
            log.warn("Failed to read image dimensions for {}: {}", filePath, e.getMessage());
        }
        return new int[] { 0, 0 }; // Default values if reading fails
    }
    
    /**
     * Get file size in bytes
     * @param filePath Path to the file
     * @return File size in bytes, or 0 if reading fails
     */
    public long getFileSize(String filePath) {
        try {
            return Files.size(Paths.get(filePath));
        } catch (IOException e) {
            log.warn("Failed to get file size for {}: {}", filePath, e.getMessage());
            return 0L;
        }
    }
}