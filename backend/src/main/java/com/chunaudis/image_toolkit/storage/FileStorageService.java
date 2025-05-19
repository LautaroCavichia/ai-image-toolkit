package com.chunaudis.image_toolkit.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

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

    private Path originalsLocation;

    @PostConstruct
    public void init() {
        try {
            this.originalsLocation = Paths.get(basePathString, originalsSubDir).toAbsolutePath().normalize();
            Files.createDirectories(this.originalsLocation);
            log.info("Initialized storage location: {}", this.originalsLocation);
        } catch (IOException ex) {
            log.error("Could not initialize storage location", ex);
            throw new RuntimeException("Could not initialize storage location", ex);
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
            log.info("Stored original file: {}", destinationFile.toString());
            // Return relative path or full path as needed by your JobMessageDTO
            return destinationFile.toString(); // For local FS, full path might be needed by Python
        } catch (IOException e) {
            log.error("Failed to store file {}", filename, e);
            throw new RuntimeException("Failed to store file " + filename, e);
        }
    }

    // TODO: Add methods to store processed files, load files etc.
}