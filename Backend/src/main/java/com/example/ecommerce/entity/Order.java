package com.example.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, length = 50)
  private String orderNumber; // e.g., ORD-20250121-001

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "address_id")
  private Address shippingAddress;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal subtotal;

  @Column(precision = 10, scale = 2)
  private BigDecimal discount = BigDecimal.ZERO;

  @Column(precision = 10, scale = 2)
  private BigDecimal shippingCharge = BigDecimal.ZERO;

  @Column(precision = 10, scale = 2)
  private BigDecimal tax = BigDecimal.ZERO;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal totalAmount;

  @Column(length = 50)
  private String couponCode;

  @Column(nullable = false, length = 30)
  private String status = "PENDING"; // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED

  @Column(nullable = false, length = 30)
  private String paymentStatus = "PENDING"; // PENDING, PAID, FAILED, REFUNDED

  @Column(length = 30)
  private String paymentMethod; // COD, RAZORPAY, etc.

  @Column(length = 100)
  private String paymentId; // Razorpay payment ID

  @Column(length = 100)
  private String razorpayOrderId;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  private List<OrderItem> orderItems = new ArrayList<>();

  @Column(length = 500)
  private String notes; // Customer notes

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column
  private LocalDateTime deliveredAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (orderNumber == null) {
      orderNumber = "ORD-" + System.currentTimeMillis();
    }
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  public void addOrderItem(OrderItem item) {
    item.setOrder(this);
    this.orderItems.add(item);
  }

  public void updateOrderItems(List<OrderItem> newItems) {
    this.orderItems.clear(); // remove old items
    for (OrderItem item : newItems) {
      item.setOrder(this); // link order → item
      this.orderItems.add(item);
    }
    recalculateTotal(); // update totals
  }

  public void removeOrderItem(OrderItem item) {
    this.orderItems.remove(item);
    recalculateTotal();
  }

  public void recalculateTotal() {
    this.subtotal = this.orderItems.stream()
        .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    this.totalAmount = this.subtotal
        .subtract(this.discount != null ? this.discount : BigDecimal.ZERO)
        .add(this.shippingCharge != null ? this.shippingCharge : BigDecimal.ZERO)
        .add(this.tax != null ? this.tax : BigDecimal.ZERO);
  }

  public void setRazorpayOrderId(String id) { // ← Added
    this.razorpayOrderId = id;
  }

  public void setPaymentMethod(String method) { // ← Added
    this.paymentMethod = method;
  }

  public void setPaymentStatus(String status) { // ← Added
    this.paymentStatus = status;
  }

  public void setPaymentId(String id) { // ← Added
    this.paymentId = id;
  }

  public String getOrderNumber() { // ← Added
    return orderNumber;
  }

  public String getPaymentStatus() { // ← Added
    return paymentStatus;
  }

}