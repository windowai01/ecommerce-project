package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Wishlist;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.WishlistRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getWishlist(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(user.getId());

        List<Map<String, Object>> response = wishlistItems.stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            Product p = item.getProduct();
            map.put("id", item.getId());
            map.put("productId", p.getId());
            map.put("name", p.getName());
            map.put("price", p.getPrice());
            map.put("originalPrice", p.getOriginalPrice());
            map.put("image", p.getImage());
            map.put("quantity", p.getQuantity());
            map.put("averageRating", p.getAverageRating());
            map.put("addedAt", item.getCreatedAt());
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Product already in wishlist"));
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlistRepository.save(wishlist);

        return ResponseEntity.ok(new MessageResponse("Added to wishlist"));
    }

    @DeleteMapping("/remove/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
        return ResponseEntity.ok(new MessageResponse("Removed from wishlist"));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkInWishlist(@PathVariable Long productId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean exists = wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("inWishlist", exists);
        return ResponseEntity.ok(response);
    }
}