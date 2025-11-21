package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Review;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.ReviewRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<Map<String, Object>> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        Integer count = reviewRepository.getReviewCountByProductId(productId);

        // Calculate rating distribution
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            int rating = i;
            long ratingCount = reviews.stream().filter(r -> r.getRating() == rating).count();
            distribution.put(i, ratingCount);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("reviews", reviews.stream().map(r -> {
            Map<String, Object> reviewMap = new HashMap<>();
            reviewMap.put("id", r.getId());
            reviewMap.put("rating", r.getRating());
            reviewMap.put("title", r.getTitle());
            reviewMap.put("comment", r.getComment());
            reviewMap.put("verified", r.getVerified());
            reviewMap.put("createdAt", r.getCreatedAt());
            reviewMap.put("userName", r.getUser().getFirstName() + " " + r.getUser().getLastName().charAt(0) + ".");
            return reviewMap;
        }).toList());
        response.put("averageRating",
                avgRating != null ? BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP) : 0);
        response.put("totalReviews", count != null ? count : 0);
        response.put("distribution", distribution);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> request, Principal principal) {
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Long productId = Long.valueOf(request.get("productId").toString());

            // Check if user already reviewed
            if (reviewRepository.existsByProductIdAndUserId(productId, user.getId())) {
                return ResponseEntity.badRequest().body(new MessageResponse("You have already reviewed this product"));
            }

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Review review = new Review();
            review.setProduct(product);
            review.setUser(user);
            review.setRating(Integer.valueOf(request.get("rating").toString()));
            review.setTitle(request.get("title") != null ? request.get("title").toString() : null);
            review.setComment(request.get("comment") != null ? request.get("comment").toString() : null);
            review.setVerified(false); // Could check if user purchased the product

            reviewRepository.save(review);

            // Update product average rating
            Double newAvg = reviewRepository.getAverageRatingByProductId(productId);
            Integer newCount = reviewRepository.getReviewCountByProductId(productId);
            product.setAverageRating(
                    newAvg != null ? BigDecimal.valueOf(newAvg).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            product.setReviewCount(newCount != null ? newCount : 0);
            productRepository.save(product);

            return ResponseEntity.ok(new MessageResponse("Review added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, Principal principal) {
        return reviewRepository.findById(id).map(review -> {
            User user = userRepository.findByEmail(principal.getName()).orElse(null);
            if (user == null || (!review.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN"))) {
                return ResponseEntity.badRequest().body(new MessageResponse("Unauthorized"));
            }

            Long productId = review.getProduct().getId();
            reviewRepository.delete(review);

            // Update product rating
            Product product = review.getProduct();
            Double newAvg = reviewRepository.getAverageRatingByProductId(productId);
            Integer newCount = reviewRepository.getReviewCountByProductId(productId);
            product.setAverageRating(
                    newAvg != null ? BigDecimal.valueOf(newAvg).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            product.setReviewCount(newCount != null ? newCount : 0);
            productRepository.save(product);

            return ResponseEntity.ok(new MessageResponse("Review deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }
}