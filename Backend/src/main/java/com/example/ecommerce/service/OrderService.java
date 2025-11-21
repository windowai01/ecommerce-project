package com.example.ecommerce.service;

import com.example.ecommerce.dto.OrderRequest;
import com.example.ecommerce.dto.OrderResponse;
import com.example.ecommerce.dto.UpdateOrderStatusRequest;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    // CREATE ORDER
    public OrderResponse createOrder(OrderRequest request, User user) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        order.setTotalAmount(BigDecimal.ZERO);

        List<OrderItem> items = new ArrayList<>();

        for (OrderRequest.OrderItemRequest reqItem : request.getItems()) {
            Product product = productRepository.findById(reqItem.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + reqItem.getProductId()));

            if (product.getQuantity() < reqItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(reqItem.getQuantity());
            item.setPrice(product.getPrice());
            items.add(item);
        }

        order.updateOrderItems(items);
        order.recalculateTotal();

        Order saved = orderRepository.save(order);
        return mapToOrderResponse(saved);
    }

    // GET ALL ORDERS
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // GET ORDER BY ID
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToOrderResponse(order);
    }

    // GET ORDERS BY USER ID
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // GET ORDERS BY STATUS
    public List<OrderResponse> getOrdersByStatus(String status) {
        validateOrderStatus(status);
        return orderRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // UPDATE ORDER STATUS
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        validateOrderStatus(request.getStatus());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String oldStatus = order.getStatus();
        order.setStatus(request.getStatus());

        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    // UPDATE ORDER ITEMS (Replace entire order items list)
    public OrderResponse updateOrderItems(Long orderId, OrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if ("DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            throw new IllegalArgumentException("Cannot update items for " + order.getStatus() + " orders");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        List<OrderItem> newItems = new ArrayList<>();

        for (OrderRequest.OrderItemRequest reqItem : request.getItems()) {
            Product product = productRepository.findById(reqItem.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + reqItem.getProductId()));

            if (product.getQuantity() < reqItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(reqItem.getQuantity());
            item.setPrice(product.getPrice());
            newItems.add(item);
        }

        order.updateOrderItems(newItems);
        order.recalculateTotal();

        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    // ADD ITEM TO ORDER
    public OrderResponse addItemToOrder(Long orderId, Long productId, int quantity) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if ("DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            throw new IllegalArgumentException("Cannot add items to " + order.getStatus() + " orders");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + productId));

        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
        }

        // Check if item already exists in order
        boolean exists = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId));

        if (exists) {
            OrderItem existingItem = order.getOrderItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .findFirst()
                    .orElseThrow();

            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            OrderItem newItem = new OrderItem();
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice());
            order.addOrderItem(newItem);
        }

        order.recalculateTotal();
        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    // REMOVE ITEM FROM ORDER
    public OrderResponse removeItemFromOrder(Long orderId, Long orderItemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if ("DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            throw new IllegalArgumentException("Cannot remove items from " + order.getStatus() + " orders");
        }

        OrderItem itemToRemove = order.getOrderItems().stream()
                .filter(item -> item.getId().equals(orderItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + orderItemId));

        order.removeOrderItem(itemToRemove);
        order.recalculateTotal();

        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    // DELETE ORDER
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if ("DELIVERED".equals(order.getStatus())) {
            throw new IllegalArgumentException("Cannot delete delivered orders");
        }

        orderRepository.delete(order);
    }

    // CANCEL ORDER
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if ("DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            throw new IllegalArgumentException("Cannot cancel " + order.getStatus() + " orders");
        }

        order.setStatus("CANCELLED");
        Order updated = orderRepository.save(order);
        return mapToOrderResponse(updated);
    }

    // HELPER: Map Order to OrderResponse
    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setUserEmail(order.getUser().getEmail());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        List<OrderResponse.OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> new OrderResponse.OrderItemDTO(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))))
                .collect(Collectors.toList());

        response.setItems(itemDTOs);
        return response;
    }

    // HELPER: Validate order status
    private void validateOrderStatus(String status) {
        List<String> validStatuses = List.of("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(status)) {
            throw new IllegalArgumentException("Invalid order status: " + status);
        }
    }
}