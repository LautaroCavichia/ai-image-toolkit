package com.chunaudis.image_toolkit;


import org.springframework.retry.annotation.EnableRetry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
@EnableRetry

public class ImageToolkitApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImageToolkitApplication.class, args);
	}

}
