package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Coupon;
import com.example.ecommerce.repository.CouponRepository;
import com.example.ecommerce.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    // Get all coupons (Admin)
    @GetMapping("/all")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    // Get active coupons (Public - for displaying available offers)
    @GetMapping("/active")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        return ResponseEntity.ok(couponRepository.findByActiveTrue());
    }

    // Validate and apply coupon
    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, Object> request) {
        String code = request.get("code").toString().toUpperCase();
        BigDecimal orderAmount = new BigDecimal(request.get("orderAmount").toString());

        return couponRepository.findByCodeAndActiveTrue(code).map(coupon -> {
            Map<String, Object> response = new HashMap<>();

            if (!coupon.isValid()) {
                response.put("valid", false);
                response.put("message", "Coupon has expired or reached usage limit");
                return ResponseEntity.ok(response);
            }

            if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
                response.put("valid", false);
                response.put("message", "Minimum order amount is ₹" + coupon.getMinOrderAmount());
                return ResponseEntity.ok(response);
            }

            // Calculate discount
            BigDecimal discount;
            if ("PERCENTAGE".equals(coupon.getDiscountType())) {
                discount = orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2,
                        RoundingMode.HALF_UP);
                if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discount = coupon.getMaxDiscount();
                }
            } else {
                discount = coupon.getDiscountValue();
            }

            response.put("valid", true);
            response.put("discount", discount);
            response.put("couponCode", coupon.getCode());
            response.put("description", coupon.getDescription());
            response.put("message", "Coupon applied! You save ₹" + discount);

            return ResponseEntity.ok(response);
        }).orElseGet(() -> {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Invalid coupon code");
            return ResponseEntity.ok(response);
        });
    }

    // Add coupon (Admin)
    @PostMapping("/add")
    public ResponseEntity<?> addCoupon(@RequestBody Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode().toUpperCase())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Coupon code already exists"));
        }
        coupon.setCode(coupon.getCode().toUpperCase());
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    // Update coupon (Admin)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        return couponRepository.findById(id).map(existing -> {
            existing.setCode(coupon.getCode().toUpperCase());
            existing.setDescription(coupon.getDescription());
            existing.setDiscountType(coupon.getDiscountType());
            existing.setDiscountValue(coupon.getDiscountValue());
            existing.setMinOrderAmount(coupon.getMinOrderAmount());
            existing.setMaxDiscount(coupon.getMaxDiscount());
            existing.setUsageLimit(coupon.getUsageLimit());
            existing.setValidFrom(coupon.getValidFrom());
            existing.setValidUntil(coupon.getValidUntil());
            existing.setActive(coupon.getActive());
            return ResponseEntity.ok(couponRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete coupon (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        return couponRepository.findById(id).map(coupon -> {
            couponRepository.delete(coupon);
            return ResponseEntity.ok(new MessageResponse("Coupon deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }
}