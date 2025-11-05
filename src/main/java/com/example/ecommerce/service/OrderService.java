package com.example.ecommerce.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.ecommerce.dto.OrderRequest;
import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.*;
import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderService {
    private final ProductRepository productRepo;
    private final OrderRepository orderRepo;

    public OrderService(ProductRepository productRepo, OrderRepository orderRepo) {
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
    }

    // ✅ CREATE ORDER WITH DETAILED RESPONSE
    @Transactional
    public Map<String, Object> createOrderWithDetails(OrderRequest req) {
        Order order = new Order();
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        List<Map<String, Object>> productDetails = new ArrayList<>();

        for (OrderRequest.Item it : req.items) {
            Product p = productRepo.findById(it.productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + it.productId));

            if (p.getQuantity() == null || p.getQuantity() < it.quantity) {
                throw new RuntimeException("Not enough stock for product: " + p.getName());
            }

            // decrease stock
            p.setQuantity(p.getQuantity() - it.quantity);
            productRepo.save(p);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setQuantity(it.quantity);
            oi.setPrice(p.getPrice());
            items.add(oi);

            BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(it.quantity));
            total = total.add(subtotal);

            productDetails.add(Map.of(
                    "productName", p.getName(),
                    "price", p.getPrice(),
                    "quantity", it.quantity,
                    "subtotal", subtotal
            ));
        }

        order.setItems(items);
        order.setTotal(total);
        Order saved = orderRepo.save(order);

        return Map.of(
                "orderId", saved.getId(),
                "message", "Order created successfully!",
                "total", total,
                "products", productDetails
        );
    }

    // ✅ GET ALL ORDERS
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    // ✅ GET ONE ORDER
    public Optional<Order> getOrderById(Long id) {
        return orderRepo.findById(id);
    }

    // ✅ DELETE ORDER
    @Transactional
    public boolean deleteOrder(Long id) {
        if (orderRepo.existsById(id)) {
            orderRepo.deleteById(id);
            return true;
        }
        return false;
    }
}
