package com.example.ecommerce.dto;

import jakarta.validation.constraints.NotEmpty; // ✅ ADD THIS IMPORT
import java.util.List;

public class OrderRequest {

    @NotEmpty(message = "Order must contain at least one item")
    private List<Item> items;

    public static class Item {
        private Long productId;
        private int quantity;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }
}