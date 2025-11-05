package com.example.ecommerce.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private Cloudinary cloudinary;

    // ✅ Add Product + Upload Image + Auto Delete Local File
    public Product addProduct(Product product, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String tempFileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                File tempFile = new File(System.getProperty("java.io.tmpdir"), tempFileName);
                imageFile.transferTo(tempFile);

                Map uploadResult = cloudinary.uploader().upload(tempFile, ObjectUtils.asMap(
                        "folder", "ecommerce_products"
                ));
                product.setImageUrl(uploadResult.get("secure_url").toString());

                tempFile.delete(); // Auto delete after upload
            } catch (IOException e) {
                throw new RuntimeException("Image upload failed: " + e.getMessage());
            }
        }

        return productRepository.save(product);
    }

    // ✅ Update Product + Image (if new image provided)
    public Product updateProduct(Long id, Product newData, MultipartFile newImage) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        existing.setName(newData.getName());
        existing.setDescription(newData.getDescription());
        existing.setPrice(newData.getPrice());
        existing.setQuantity(newData.getQuantity());

        if (newImage != null && !newImage.isEmpty()) {
            try {
                String tempFileName = UUID.randomUUID() + "_" + newImage.getOriginalFilename();
                File tempFile = new File(System.getProperty("java.io.tmpdir"), tempFileName);
                newImage.transferTo(tempFile);

                Map uploadResult = cloudinary.uploader().upload(tempFile, ObjectUtils.asMap(
                        "folder", "ecommerce_products"
                ));
                existing.setImageUrl(uploadResult.get("secure_url").toString());

                tempFile.delete(); // Auto delete after upload
            } catch (IOException e) {
                throw new RuntimeException("Image upload failed: " + e.getMessage());
            }
        }

        return productRepository.save(existing);
    }

    // ✅ Get All Products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ✅ Get Product by ID
    public Optional<Product> getById(Long id) {
        return productRepository.findById(id);
    }

    // ✅ Delete Product by ID
    public boolean delete(Long id) {
        if (!productRepository.existsById(id)) {
            return false; // Product not found
        }

        try {
            productRepository.deleteById(id);
            return true;
        } catch (DataIntegrityViolationException ex) {
            // Product is linked to an existing order
            throw new IllegalStateException("Cannot delete product — it’s linked to an existing order.");
        }
    }   
}
