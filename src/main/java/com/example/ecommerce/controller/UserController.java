package com.example.ecommerce.controller;

import com.example.ecommerce.dto.ApiResponse;
import com.example.ecommerce.model.User;
import com.example.ecommerce.service.UserService;
import com.example.ecommerce.repository.UserRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> signup(@RequestBody User user) {
        try {
            User created = userService.signup(user.getEmail(), user.getPassword());
            return ResponseEntity.ok(new ApiResponse<>(true, "Signup successful", created));
        } catch (Exception e) {
            return ResponseEntity.status(409)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody User user) {
        try {
            User loggedIn = userService.login(user.getEmail(), user.getPassword());
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", loggedIn));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // GET all users
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // GET user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok(
                            new ApiResponse<>(true, "User deleted successfully", null));
                })
                .orElse(ResponseEntity.status(404)
                        .body(new ApiResponse<>(false, "User not found", null)));
    }

}
