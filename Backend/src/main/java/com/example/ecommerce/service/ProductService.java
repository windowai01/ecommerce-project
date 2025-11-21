package com.example.ecommerce.service;

import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public Product createProduct(Product product, MultipartFile image) {
        try {
            if (image != null && !image.isEmpty()) {
                // Convert MultipartFile to File and upload to Cloudinary
                File tempFile = File.createTempFile("upload", image.getOriginalFilename());
                image.transferTo(tempFile);
                String imageUrl = cloudinaryService.uploadImage(tempFile);
                product.setImage(imageUrl);
                tempFile.delete();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
        return productRepository.save(product);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product updateProduct(Long id, Product newData, MultipartFile image) {
        Product product = getProductById(id);

        if (newData.getName() != null && !newData.getName().isEmpty()) {
            product.setName(newData.getName());
        }
        if (newData.getDescription() != null && !newData.getDescription().isEmpty()) {
            product.setDescription(newData.getDescription());
        }
        if (newData.getPrice() != null) {
            product.setPrice(newData.getPrice());
        }
        if (newData.getQuantity() != null) {
            product.setQuantity(newData.getQuantity());
        }

        // Handle image upload if provided
        try {
            if (image != null && !image.isEmpty()) {
                // Delete old image from Cloudinary if it exists
                if (product.getImage() != null && !product.getImage().isEmpty()) {
                    cloudinaryService.deleteImage(product.getImage());
                }

                // Upload new image
                File tempFile = File.createTempFile("upload", image.getOriginalFilename());
                image.transferTo(tempFile);
                String imageUrl = cloudinaryService.uploadImage(tempFile);
                product.setImage(imageUrl);
                tempFile.delete();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }
}