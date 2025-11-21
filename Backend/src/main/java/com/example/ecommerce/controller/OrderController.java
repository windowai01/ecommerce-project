package com.example.ecommerce.controller;

import com.example.ecommerce.dto.OrderRequest;
import com.example.ecommerce.dto.OrderResponse;
import com.example.ecommerce.dto.UpdateOrderStatusRequest;
import com.example.ecommerce.dto.MessageResponse;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.service.OrderService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
// @CrossOrigin(origins = "*")
public class OrderController {

  @Autowired
  private OrderService orderService;

  @Autowired
  private UserRepository userRepository;

  // CREATE ORDER
  @PostMapping("/add")
  public ResponseEntity<OrderResponse> createOrder(
      @Valid @RequestBody OrderRequest request,
      Principal principal) {
    User user = userRepository.findByEmail(principal.getName())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    OrderResponse response = orderService.createOrder(request, user);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  // GET ALL ORDERS
  @GetMapping("/all")
  public ResponseEntity<List<OrderResponse>> getAllOrders() {
    return ResponseEntity.ok(orderService.getAllOrders());
  }

  // GET ORDER BY ID
  @GetMapping("/{id}")
  public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
    return ResponseEntity.ok(orderService.getOrderById(id));
  }

  // UPDATE ORDER ITEMS
  @PutMapping("/update/{id}")
  public ResponseEntity<OrderResponse> updateOrder(
      @PathVariable Long id,
      @Valid @RequestBody OrderRequest request) {
    OrderResponse response = orderService.updateOrderItems(id, request);
    return ResponseEntity.ok(response);
  }

  // GET ORDERS BY USER ID
  @GetMapping("/user/{userId}")
  public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@PathVariable Long userId) {
    return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
  }

  // GET ORDERS BY STATUS
  @GetMapping("/status/{status}")
  public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable String status) {
    return ResponseEntity.ok(orderService.getOrdersByStatus(status));
  }

  // UPDATE ORDER STATUS
  @PutMapping("/{id}/status")
  public ResponseEntity<OrderResponse> updateOrderStatus(
      @PathVariable Long id,
      @Valid @RequestBody UpdateOrderStatusRequest request) {
    OrderResponse response = orderService.updateOrderStatus(id, request);
    return ResponseEntity.ok(response);
  }

  // UPDATE ORDER ITEMS (Replace entire items)
  @PutMapping("/{id}/items")
  public ResponseEntity<OrderResponse> updateOrderItems(
      @PathVariable Long id,
      @Valid @RequestBody OrderRequest request) {
    OrderResponse response = orderService.updateOrderItems(id, request);
    return ResponseEntity.ok(response);
  }

  // ADD ITEM TO ORDER
  @PostMapping("/{orderId}/items")
  public ResponseEntity<OrderResponse> addItemToOrder(
      @PathVariable Long orderId,
      @RequestParam Long productId,
      @RequestParam int quantity) {
    OrderResponse response = orderService.addItemToOrder(orderId, productId, quantity);
    return ResponseEntity.ok(response);
  }

  // REMOVE ITEM FROM ORDER
  @DeleteMapping("/{orderId}/items/{itemId}")
  public ResponseEntity<OrderResponse> removeItemFromOrder(
      @PathVariable Long orderId,
      @PathVariable Long itemId) {
    OrderResponse response = orderService.removeItemFromOrder(orderId, itemId);
    return ResponseEntity.ok(response);
  }

  // CANCEL ORDER
  @PutMapping("/{id}/cancel")
  public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
    OrderResponse response = orderService.cancelOrder(id);
    return ResponseEntity.ok(response);
  }

  // DELETE ORDER
  @DeleteMapping("/{id}")
  public ResponseEntity<MessageResponse> deleteOrder(@PathVariable Long id) {
    orderService.deleteOrder(id);
    return ResponseEntity.ok(new MessageResponse("Order deleted successfully"));
  }
}