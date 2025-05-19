package com.chunaudis.image_toolkit.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chunaudis.image_toolkit.entity.Image;

@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
}
