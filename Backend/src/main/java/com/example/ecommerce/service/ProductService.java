package com.example.ecommerce.service;

import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Product updateProduct(Long id, Product newData) {
        Product product = getProductById(id);

        if (newData.getName() != null) {
            product.setName(newData.getName());
        }
        if (newData.getDescription() != null) {
            product.setDescription(newData.getDescription());
        }
        if (newData.getPrice() != null) {
            product.setPrice(newData.getPrice());
        }
        if (newData.getStockQuantity() != null) { // Fixed: use stockQuantity
            product.setStockQuantity(newData.getStockQuantity());
        }
        if (newData.getCategory() != null) {
            product.setCategory(newData.getCategory());
        }
        if (newData.getImageUrl() != null) {
            product.setImageUrl(newData.getImageUrl());
        }
        if (newData.getActive() != null) {
            product.setActive(newData.getActive());
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