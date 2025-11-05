package com.example.ecommerce.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "djxz7a3fo",
                "api_key", "979535181455772",
                "api_secret", "41ragRDQqL3RhrlLeM5lojZNO6Q"
        ));
    }
}
