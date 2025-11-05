package com.example.ecommerce.dto;

import java.util.List;

public class OrderRequest {
    public List<Item> items;

    public static class Item {
        public Long productId;
        public int quantity;
    }
}
