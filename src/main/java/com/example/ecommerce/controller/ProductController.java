package com.example.ecommerce.controller;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // ✅ Add Product
    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String price,
            @RequestParam(value = "quantity", required = false, defaultValue = "0") int quantity,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(new BigDecimal(price));
        product.setQuantity(quantity);

        Product saved = productService.addProduct(product, file);
        return ResponseEntity.ok(saved);
    }

    // ✅ Update Product
    @PutMapping("/update/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String price,
            @RequestParam(value = "quantity", required = false, defaultValue = "0") int quantity,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        Product newData = new Product();
        newData.setName(name);
        newData.setDescription(description);
        newData.setPrice(new BigDecimal(price));
        newData.setQuantity(quantity);

        Product updated = productService.updateProduct(id, newData, file);
        return ResponseEntity.ok(updated);
    }

    // ✅ Get All Products
    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ✅ Get Product by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return productService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Delete Product
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
        try {
            boolean deleted = productService.delete(id);

            if (!deleted) {
                return ResponseEntity.status(404).body(Map.of(
                        "status", 404,
                        "message", "Product not found!"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "Product deleted successfully!"
            ));

        } catch (IllegalStateException ex) {
            return ResponseEntity.status(400).body(Map.of(
                    "status", 400,
                    "message", ex.getMessage()
            ));
        }
    }
}
