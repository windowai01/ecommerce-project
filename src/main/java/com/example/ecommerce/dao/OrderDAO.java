package com.example.ecommerce.dao;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.model.OrderItem;
import com.example.ecommerce.model.Product;
import org.springframework.stereotype.Repository;
import javax.sql.DataSource;
import java.sql.*;
import java.util.*;
import java.math.BigDecimal;

@Repository
public class OrderDAO {
    private final Connection connection;

    public OrderDAO(DataSource dataSource) throws SQLException {
        this.connection = dataSource.getConnection();
    }

    // ✅ Add Order
    public int addOrder(Order order) throws SQLException {
        String sqlOrder = "INSERT INTO orders (user_id, total) VALUES (?, ?)";
        PreparedStatement stmtOrder = connection.prepareStatement(sqlOrder, Statement.RETURN_GENERATED_KEYS);

        if (order.getUserId() != null) {
            stmtOrder.setInt(1, order.getUserId());
        } else {
            stmtOrder.setNull(1, Types.INTEGER);
        }

        stmtOrder.setBigDecimal(2, order.getTotal());
        stmtOrder.executeUpdate();

        ResultSet rs = stmtOrder.getGeneratedKeys();
        if (rs.next()) {
            int orderId = rs.getInt(1);

            String sqlItem = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
            PreparedStatement stmtItem = connection.prepareStatement(sqlItem);

            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    stmtItem.setInt(1, orderId);
                    stmtItem.setLong(2, item.getProduct().getId());
                    stmtItem.setInt(3, item.getQuantity());
                    stmtItem.setBigDecimal(4, item.getPrice());
                    stmtItem.addBatch();
                }
                stmtItem.executeBatch();
            }

            return orderId;
        }
        return -1;
    }

    // ✅ Get all orders
    public List<Order> getAllOrders() throws SQLException {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders";
        Statement stmt = connection.createStatement();
        ResultSet rs = stmt.executeQuery(sql);

        while (rs.next()) {
            Order o = new Order();
            o.setId(rs.getLong("id")); // changed to Long

            int userId = rs.getInt("user_id");
            if (rs.wasNull())
                o.setUserId(null);
            else
                o.setUserId(userId);

            o.setTotal(rs.getBigDecimal("total"));

            Timestamp ts = rs.getTimestamp("created_at");
            if (ts != null)
                o.setCreatedAt(ts.toLocalDateTime());

            o.setItems(getItemsByOrderId(o.getId().intValue()));
            orders.add(o);
        }
        return orders;
    }

    // ✅ Get order by ID
    public Order getOrderById(int id) throws SQLException {
        String sql = "SELECT * FROM orders WHERE id = ?";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setInt(1, id);
        ResultSet rs = stmt.executeQuery();

        if (rs.next()) {
            Order o = new Order();
            o.setId(rs.getLong("id"));

            int userId = rs.getInt("user_id");
            if (rs.wasNull())
                o.setUserId(null);
            else
                o.setUserId(userId);

            o.setTotal(rs.getBigDecimal("total"));

            Timestamp ts = rs.getTimestamp("created_at");
            if (ts != null)
                o.setCreatedAt(ts.toLocalDateTime());

            o.setItems(getItemsByOrderId(id));
            return o;
        }
        return null;
    }

    // ✅ Delete order
    public boolean deleteOrder(int id) throws SQLException {
        String sql = "DELETE FROM orders WHERE id = ?";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setInt(1, id);
        return stmt.executeUpdate() > 0;
    }

    // ✅ Helper: Get items for a specific order
    private List<OrderItem> getItemsByOrderId(int orderId) throws SQLException {
        List<OrderItem> items = new ArrayList<>();
        String sql = "SELECT * FROM order_items WHERE order_id = ?";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setInt(1, orderId);
        ResultSet rs = stmt.executeQuery();

        while (rs.next()) {
            OrderItem item = new OrderItem();
            item.setId(rs.getLong("id"));

            // ✅ Correct relationship handling
            Order order = new Order();
            order.setId(rs.getLong("order_id"));
            item.setOrder(order);

            Product product = new Product();
            product.setId(rs.getLong("product_id"));
            item.setProduct(product);

            item.setQuantity(rs.getInt("quantity"));
            item.setPrice(rs.getBigDecimal("price"));

            items.add(item);
        }
        return items;
    }
}
