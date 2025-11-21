package com.example.ecommerce.controller;

import com.example.ecommerce.entity.Address;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.AddressRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Address>> getUserAddresses(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(addressRepository.findByUserIdOrderByIsDefaultDesc(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Address> getAddressById(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addAddress(@RequestBody Address address, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        address.setUser(user);

        // If this is set as default, reset other defaults
        if (address.getIsDefault()) {
            addressRepository.resetDefaultAddress(user.getId());
        }

        // If this is first address, make it default
        List<Address> existing = addressRepository.findByUserIdOrderByIsDefaultDesc(user.getId());
        if (existing.isEmpty()) {
            address.setIsDefault(true);
        }

        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/update/{id}")
    @Transactional
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody Address address, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .map(existing -> {
                    existing.setFullName(address.getFullName());
                    existing.setPhone(address.getPhone());
                    existing.setAddressLine1(address.getAddressLine1());
                    existing.setAddressLine2(address.getAddressLine2());
                    existing.setCity(address.getCity());
                    existing.setState(address.getState());
                    existing.setPincode(address.getPincode());
                    existing.setLandmark(address.getLandmark());
                    existing.setAddressType(address.getAddressType());

                    if (address.getIsDefault() && !existing.getIsDefault()) {
                        addressRepository.resetDefaultAddress(user.getId());
                        existing.setIsDefault(true);
                    }

                    return ResponseEntity.ok(addressRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/set-default/{id}")
    @Transactional
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .map(address -> {
                    addressRepository.resetDefaultAddress(user.getId());
                    address.setIsDefault(true);
                    addressRepository.save(address);
                    return ResponseEntity.ok(new MessageResponse("Default address updated"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .map(address -> {
                    addressRepository.delete(address);
                    return ResponseEntity.ok(new MessageResponse("Address deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}