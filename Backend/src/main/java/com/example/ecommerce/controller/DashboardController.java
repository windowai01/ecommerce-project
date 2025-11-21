package com.example.ecommerce.controller;

import com.example.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total counts
        stats.put("totalProducts", productRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalCategories", categoryRepository.count());

        // Calculate total revenue
        List<com.example.ecommerce.entity.Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus()) || "PAID".equals(o.getPaymentStatus()))
                .map(o -> o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);

        // Orders by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        ordersByStatus.put("PENDING", allOrders.stream().filter(o -> "PENDING".equals(o.getStatus())).count());
        ordersByStatus.put("CONFIRMED", allOrders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count());
        ordersByStatus.put("PROCESSING", allOrders.stream().filter(o -> "PROCESSING".equals(o.getStatus())).count());
        ordersByStatus.put("SHIPPED", allOrders.stream().filter(o -> "SHIPPED".equals(o.getStatus())).count());
        ordersByStatus.put("DELIVERED", allOrders.stream().filter(o -> "DELIVERED".equals(o.getStatus())).count());
        ordersByStatus.put("CANCELLED", allOrders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count());
        stats.put("ordersByStatus", ordersByStatus);

        // Low stock products (quantity < 10)
        long lowStockCount = productRepository.findByActiveTrue().stream()
                .filter(p -> p.getQuantity() < 10)
                .count();
        stats.put("lowStockProducts", lowStockCount);

        // Recent orders (last 7 days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentOrders = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(sevenDaysAgo))
                .count();
        stats.put("recentOrders", recentOrders);

        // Revenue last 7 days
        BigDecimal weekRevenue = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(sevenDaysAgo))
                .filter(o -> "DELIVERED".equals(o.getStatus()) || "PAID".equals(o.getPaymentStatus()))
                .map(o -> o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("weekRevenue", weekRevenue);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/sales-chart")
    public ResponseEntity<List<Map<String, Object>>> getSalesChart() {
        List<Map<String, Object>> chartData = new ArrayList<>();
        List<com.example.ecommerce.entity.Order> allOrders = orderRepository.findAll();

        // Last 30 days
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

            BigDecimal dailySales = allOrders.stream()
                    .filter(o -> o.getCreatedAt().isAfter(startOfDay) && o.getCreatedAt().isBefore(endOfDay))
                    .filter(o -> !"CANCELLED".equals(o.getStatus()))
                    .map(o -> o.getTotalAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long orderCount = allOrders.stream()
                    .filter(o -> o.getCreatedAt().isAfter(startOfDay) && o.getCreatedAt().isBefore(endOfDay))
                    .filter(o -> !"CANCELLED".equals(o.getStatus()))
                    .count();

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("sales", dailySales);
            dayData.put("orders", orderCount);
            chartData.add(dayData);
        }

        return ResponseEntity.ok(chartData);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts() {
        List<com.example.ecommerce.entity.Order> allOrders = orderRepository.findAll();
        Map<Long, Map<String, Object>> productSales = new HashMap<>();

        allOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .flatMap(o -> o.getOrderItems().stream())
                .forEach(item -> {
                    Long productId = item.getProduct().getId();
                    productSales.computeIfAbsent(productId, k -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("productId", productId);
                        data.put("productName", item.getProduct().getName());
                        data.put("totalQuantity", 0);
                        data.put("totalRevenue", BigDecimal.ZERO);
                        return data;
                    });

                    Map<String, Object> data = productSales.get(productId);
                    data.put("totalQuantity", (Integer) data.get("totalQuantity") + item.getQuantity());
                    data.put("totalRevenue", ((BigDecimal) data.get("totalRevenue"))
                            .add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))));
                });

        List<Map<String, Object>> sorted = new ArrayList<>(productSales.values());
        sorted.sort((a, b) -> ((BigDecimal) b.get("totalRevenue")).compareTo((BigDecimal) a.get("totalRevenue")));

        return ResponseEntity.ok(sorted.stream().limit(10).toList());
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<Map<String, Object>>> getRecentOrders() {
        List<com.example.ecommerce.entity.Order> orders = orderRepository.findAll();
        orders.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        List<Map<String, Object>> recentOrders = orders.stream().limit(10).map(order -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", order.getId());
            data.put("orderNumber", order.getOrderNumber());
            data.put("customerName", order.getUser().getFirstName() + " " + order.getUser().getLastName());
            data.put("totalAmount", order.getTotalAmount());
            data.put("status", order.getStatus());
            data.put("paymentStatus", order.getPaymentStatus());
            data.put("createdAt", order.getCreatedAt());
            data.put("itemCount", order.getOrderItems().size());
            return data;
        }).toList();

        return ResponseEntity.ok(recentOrders);
    }
}