package com.example.ecommerce.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    // 🔐 SECURITY: Move these to application.properties
    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudName == null || apiKey == null || apiSecret == null) {
            throw new IllegalStateException(
                    "Cloudinary configuration is missing. Check application.properties");
        }

        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "djxz7a3fo",
                "api_key", "979535181455772",
                "api_secret", "41ragRDQqL3RhrlLeM5lojZNO6Q",
                "secure", true // ✅ Always use HTTPS
        ));
    }
}
