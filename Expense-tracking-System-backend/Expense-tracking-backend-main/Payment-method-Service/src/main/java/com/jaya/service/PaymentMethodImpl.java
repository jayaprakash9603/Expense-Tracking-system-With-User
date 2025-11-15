package com.jaya.service;


import com.jaya.models.PaymentMethod;
import com.jaya.models.UserDto;
import com.jaya.repository.PaymentMethodRepository;
import com.jaya.util.ServiceHelper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentMethodImpl implements PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;


    @Autowired
    private ServiceHelper helper;

    @Override
    public PaymentMethod getById(Integer userId, Integer id) throws Exception {
        Optional<PaymentMethod> paymentMethod = paymentMethodRepository.findByUserIdAndId(userId,id);

        if(paymentMethod.isEmpty())
        {
            throw  new Exception("Payment method not found");
        }
        return paymentMethod.get();
    }


    @Override
    public PaymentMethod save(PaymentMethod paymentMethod) {
        try {
            // Ensure collections are properly initialized to avoid serialization issues
            if (paymentMethod.getUserIds() == null) {
                paymentMethod.setUserIds(new HashSet<>());
            }
            if (paymentMethod.getEditUserIds() == null) {
                paymentMethod.setEditUserIds(new HashSet<>());
            }
            if (paymentMethod.getExpenseIds() == null) {
                paymentMethod.setExpenseIds(new HashMap<>());
            }
            
            // Clean up empty sets in expenseIds map to avoid LONGBLOB issues
            if (paymentMethod.getExpenseIds() != null) {
                paymentMethod.getExpenseIds().entrySet().removeIf(entry -> 
                    entry.getValue() == null || entry.getValue().isEmpty()
                );
            }
            
            return paymentMethodRepository.save(paymentMethod);
        } catch (Exception e) {
            System.err.println("Error saving payment method: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error saving payment method: " + e.getMessage(), e);
        }
    }

    @Override
    public List<PaymentMethod> getAllPaymentMethods(Integer userId) {
        List<PaymentMethod> userPaymentMethods = paymentMethodRepository.findByUserId(userId);
        List<PaymentMethod> globalPaymentMethods = paymentMethodRepository.findByIsGlobalTrue();

        // Filter global payment methods: user not in userIds and not in editUserIds
        List<PaymentMethod> filteredGlobalMethods = globalPaymentMethods.stream()
                .filter(method ->
                        (method.getUserIds() == null || !method.getUserIds().contains(userId)) &&
                                (method.getEditUserIds() == null || !method.getEditUserIds().contains(userId))
                )
                .collect(Collectors.toList());

        List<PaymentMethod> allPaymentMethods = new ArrayList<>();
        allPaymentMethods.addAll(userPaymentMethods);
        allPaymentMethods.addAll(filteredGlobalMethods);

        return allPaymentMethods;
    }

    @Override
    public PaymentMethod createPaymentMethod(Integer userId, PaymentMethod paymentMethod) throws Exception {
        String trimmedName = paymentMethod.getName().trim();
        String type = paymentMethod.getType();

        List<PaymentMethod> allMethods = getAllPaymentMethods(userId);
        boolean duplicate = allMethods.stream()
                .anyMatch(pm -> pm.getName().equalsIgnoreCase(trimmedName) && pm.getType().equalsIgnoreCase(type));
        if (duplicate) {
            throw new Exception("Payment method with the same name and type already exists.");
        }

        PaymentMethod createdPaymentMethod = new PaymentMethod();
        if (paymentMethod.isGlobal()) {
            createdPaymentMethod.setUserId(0);
        } else {
            createdPaymentMethod.setUserId(userId);
        }
        createdPaymentMethod.setType(type);
        createdPaymentMethod.setAmount(paymentMethod.getAmount());
        createdPaymentMethod.setName(trimmedName);
        createdPaymentMethod.setGlobal(paymentMethod.isGlobal());
        createdPaymentMethod.setColor(paymentMethod.getColor());
        createdPaymentMethod.setIcon(paymentMethod.getIcon());
        createdPaymentMethod.setDescription(paymentMethod.getDescription());
        return paymentMethodRepository.save(createdPaymentMethod);
    }

    @Override
    public PaymentMethod findOrCreatePaymentMethod(Integer userId, String paymentMethodName) throws Exception {
        // Check if a payment method with the same name (case insensitive) already exists
        String trimmedName = paymentMethodName.trim();
        List<PaymentMethod> existingMethods = paymentMethodRepository.findByUserId(userId);

        // First try to find an existing payment method with the same name (case insensitive)
        for (PaymentMethod existing : existingMethods) {
            if (existing.getName().equalsIgnoreCase(trimmedName)) {
                return existing;
            }
        }

        // If not found, check global payment methods
        List<PaymentMethod> globalMethods = paymentMethodRepository.findByIsGlobalTrue();
        for (PaymentMethod method : globalMethods) {
            if (method.getName().equalsIgnoreCase(trimmedName)) {
                return method;
            }
        }

        // If still not found, create a new payment method
        PaymentMethod newPaymentMethod = new PaymentMethod();
        newPaymentMethod.setUserId(userId);
        newPaymentMethod.setName(trimmedName);
        newPaymentMethod.setType("Other"); // Default type
        newPaymentMethod.setAmount(0); // Default amount

        return paymentMethodRepository.save(newPaymentMethod);
    }

    @Override
    public PaymentMethod updatePaymentMethod(Integer userId, Integer id, PaymentMethod paymentMethod) throws Exception {
        PaymentMethod existingPaymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new Exception("Payment method not found with ID " + id));
        UserDto userOpt = helper.validateUser(userId);
        if (userOpt == null && !existingPaymentMethod.isGlobal()) {
            throw new EntityNotFoundException("User with ID " + userId + " not found");
        }

        if (existingPaymentMethod.isGlobal()) {
            if (existingPaymentMethod.getEditUserIds() == null) {
                existingPaymentMethod.setEditUserIds(new java.util.HashSet<>());
            }
            if (existingPaymentMethod.getEditUserIds().contains(userId)) {
                throw new Exception("You already edited this payment method");
            }
            existingPaymentMethod.getEditUserIds().add(userId);
            paymentMethodRepository.save(existingPaymentMethod);

            // Create a new user-specific payment method with all updatable fields
            PaymentMethod createdPaymentMethod = new PaymentMethod();
            copyUpdatableFields(paymentMethod, createdPaymentMethod);
            createdPaymentMethod.setGlobal(false);
            createdPaymentMethod.setUserId(userId);
            return paymentMethodRepository.save(createdPaymentMethod);
        } else {
            copyUpdatableFields(paymentMethod, existingPaymentMethod);
            return paymentMethodRepository.save(existingPaymentMethod);
        }
    }

    private void copyUpdatableFields(PaymentMethod source, PaymentMethod target) {
        if (source.getName() != null) target.setName(source.getName().trim());
        if (source.getAmount() != null) target.setAmount(source.getAmount());
        if (source.getType() != null) target.setType(source.getType());
        if (source.getColor() != null) target.setColor(source.getColor());
        if (source.getIcon() != null) target.setIcon(source.getIcon());
        if (source.getDescription() != null) target.setDescription(source.getDescription());
    }

    @Override
    public void deletePaymentMethod(Integer userId, Integer paymentId) throws Exception {
        PaymentMethod existingPaymentMethod =paymentMethodRepository.findById(paymentId).orElseThrow(()->new Exception("Payment method not found with ID: " + paymentId));

        if(existingPaymentMethod.isGlobal())
        {
            if(existingPaymentMethod.getUserIds().contains(userId) || existingPaymentMethod.getEditUserIds().contains(userId))
            {
                throw new Exception("payment method not found with ID: " + paymentId );
            }
            else {
                existingPaymentMethod.getUserIds().add(userId);
                paymentMethodRepository.save(existingPaymentMethod);
            }


        }
        else if(existingPaymentMethod.getUserId().equals(userId)) {
            paymentMethodRepository.delete(existingPaymentMethod);
        }
        else {
            throw new Exception("payment method not found");
        }

    }

    @Override
    public PaymentMethod getByName(Integer userId, String name) {
        // Try exact match (case-sensitive)
        List<PaymentMethod> paymentMethods = paymentMethodRepository.findByUserIdAndName(userId, name);

        if (paymentMethods == null || paymentMethods.isEmpty()) {
            // Try case-insensitive search among user methods
            List<PaymentMethod> allUserMethods = paymentMethodRepository.findByUserId(userId);
            for (PaymentMethod method : allUserMethods) {
                if (method.getName().equalsIgnoreCase(name.trim())) {
                    return method;
                }
            }
            // Try case-insensitive search among global methods
            List<PaymentMethod> globalMethods = paymentMethodRepository.findByIsGlobalTrue();
            for (PaymentMethod method : globalMethods) {
                if (method.getName().equalsIgnoreCase(name.trim())) {
                    return method;
                }
            }
            throw new EntityNotFoundException("Payment method not found with name: " + name);
        } else if (paymentMethods.size() >= 1) {
            return paymentMethods.get(0);
        } else {
            // Multiple results found, handle as needed (throwing for clarity)
            throw new RuntimeException("Multiple payment methods found with name: " + name);
        }
    }

    @Override
    public PaymentMethod getByName(Integer userId, String name, String type) {
        String trimmedName = name.trim();
        String trimmedType = type.trim();

        // Search user methods by name and type (case-insensitive)
        List<PaymentMethod> userMethods = paymentMethodRepository.findByUserIdAndNameAndType(userId,name,type);
        for (PaymentMethod method : userMethods) {
            if (method.getName() != null && method.getType() != null &&
                    method.getName().equalsIgnoreCase(trimmedName) &&
                    method.getType().equalsIgnoreCase(trimmedType)) {
                return method;
            }
        }

        // Search global methods by name and type (case-insensitive)
        List<PaymentMethod> globalMethods = paymentMethodRepository.findByIsGlobalTrue();
        for (PaymentMethod method : globalMethods) {
            if (method.getName() != null && method.getType() != null &&
                    method.getName().equalsIgnoreCase(trimmedName) &&
                    method.getType().equalsIgnoreCase(trimmedType) && !method.getEditUserIds().contains(userId) && !method.getUserIds().contains(userId)) {
                return method;
            }
        }

        // Not found, return a new PaymentMethod (not saved)
        PaymentMethod newMethod = new PaymentMethod();

        return newMethod;
    }


    @Override
    public PaymentMethod getByNameAndTypeOrCreate(String name, String type) {
        String trimmedName = name.trim();
        String trimmedType = type.trim();

        // Try to find by name and type (case-insensitive)
        List<PaymentMethod> allMethods = paymentMethodRepository.findAll();
        for (PaymentMethod method : allMethods) {
            if (method.getName() != null && method.getType() != null &&
                    method.getName().equalsIgnoreCase(trimmedName) &&
                    method.getType().equalsIgnoreCase(trimmedType)) {
                return method;
            }
        }

        throw new EntityNotFoundException("Payment method not found with name: " + name);


    }
    @Override
    public PaymentMethod getByName(String name) {
        // Try exact match (case-sensitive)
        List<PaymentMethod> paymentMethods = paymentMethodRepository.findByName(name);

        if (paymentMethods != null && !paymentMethods.isEmpty()) {
            return paymentMethods.get(0);
        }

        // Try case-insensitive search among all payment methods
        List<PaymentMethod> allMethods = paymentMethodRepository.findAll();
        for (PaymentMethod method : allMethods) {
            if (method.getName() != null && method.getName().equalsIgnoreCase(name.trim())) {
                return method;
            }
        }

        throw new EntityNotFoundException("Payment method not found with name: " + name);
    }

    @Override
    public void deleteAllUserPaymentMethods(Integer userId) {
        // Delete all user-specific (non-global) payment methods
        List<PaymentMethod> userPaymentMethods = paymentMethodRepository.findByUserId(userId);
        List<PaymentMethod> nonGlobalUserMethods = userPaymentMethods.stream()
                .filter(method -> !method.isGlobal())
                .collect(Collectors.toList());
        paymentMethodRepository.deleteAll(nonGlobalUserMethods);

        // For all global payment methods, add userId to userIds set
        List<PaymentMethod> globalPaymentMethods = paymentMethodRepository.findByIsGlobalTrue();
        for (PaymentMethod globalMethod : globalPaymentMethods) {
            if (globalMethod.getUserIds() == null) {
                globalMethod.setUserIds(new java.util.HashSet<>());
            }
            if (!globalMethod.getUserIds().contains(userId)) {
                globalMethod.getUserIds().add(userId);
                paymentMethodRepository.save(globalMethod);
            }
        }
    }

    // Java
    @Override
    public List<PaymentMethod> getOthersAndUnusedPaymentMethods(Integer userId) {
        // Get all user-specific and allowed global payment methods
        List<PaymentMethod> userMethods = paymentMethodRepository.findByUserId(userId);
        List<PaymentMethod> globalMethods = paymentMethodRepository.findByIsGlobalTrue();
        List<PaymentMethod> allMethods = new ArrayList<>();
        allMethods.addAll(userMethods);

        // Find the "Others" payment method (if it exists)
        PaymentMethod othersMethod = allMethods.stream()
                .filter(pm -> "Others".equalsIgnoreCase(pm.getName()))
                .findFirst()
                .orElse(null);

        // Return payment methods that are either the "Others" method or have no linked expense IDs
        return allMethods.stream().filter(pm -> {
            if (othersMethod != null && pm.getId().equals(othersMethod.getId())) {
                return true;
            }
            return pm.getExpenseIds() == null || pm.getExpenseIds().isEmpty();
        }).collect(Collectors.toList());
    }


}