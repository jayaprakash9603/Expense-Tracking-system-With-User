package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.models.PaymentMethod;
import com.jaya.models.User;
import com.jaya.repository.PaymentMethodRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PaymentMethodImpl implements PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private UserService userService;

    @Override
    public PaymentMethod getById(Integer userId, Integer id) throws Exception {
        PaymentMethod paymentMethod = paymentMethodRepository.findByUserIdAndId(userId, id);
        if (paymentMethod == null) {
            throw new Exception("Payment method not found " + id);
        }
        return paymentMethod;
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
    public PaymentMethod createPaymentMethod(Integer userId, PaymentMethod paymentMethod) throws UserException {
        String trimmedName = paymentMethod.getName().trim();
        String type = paymentMethod.getType();

        List<PaymentMethod> allMethods = getAllPaymentMethods(userId);
        boolean duplicate = allMethods.stream()
                .anyMatch(pm -> pm.getName().equalsIgnoreCase(trimmedName) && pm.getType().equalsIgnoreCase(type));
        if (duplicate) {
            throw new UserException("Payment method with the same name and type already exists.");
        }

        PaymentMethod createdPaymentMethod = new PaymentMethod();
        if (paymentMethod.isGlobal()) {
            createdPaymentMethod.setUser(null);
        } else {
            createdPaymentMethod.setUser(userService.findUserById(userId));
        }
        createdPaymentMethod.setType(type);
        createdPaymentMethod.setAmount(paymentMethod.getAmount());
        createdPaymentMethod.setName(trimmedName);
        createdPaymentMethod.setGlobal(paymentMethod.isGlobal());

        return paymentMethodRepository.save(createdPaymentMethod);
    }

    @Override
    public PaymentMethod findOrCreatePaymentMethod(Integer userId, String paymentMethodName) throws UserException {
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
        newPaymentMethod.setUser(userService.findUserById(userId));
        newPaymentMethod.setName(trimmedName);
        newPaymentMethod.setType("Other"); // Default type
        newPaymentMethod.setAmount(0); // Default amount

        return paymentMethodRepository.save(newPaymentMethod);
    }

    @Override
    public PaymentMethod updatePaymentMethod(Integer userId, Integer id, PaymentMethod paymentMethod) throws Exception {
        PaymentMethod existingPaymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new Exception("Payment method not found with ID " + id));
        User userOpt = userService.findUserById(userId);
        if (userOpt == null && !existingPaymentMethod.isGlobal()) {
            throw new EntityNotFoundException("User with ID " + userId + " not found");
        }

        if (existingPaymentMethod.isGlobal()) {
            if (existingPaymentMethod.getEditUserIds() == null) {
                existingPaymentMethod.setEditUserIds(new java.util.HashSet<>());
            }
            if (existingPaymentMethod.getEditUserIds().contains(userId)) {
                throw new Exception("you already edited this payment method ");
            }

            existingPaymentMethod.getEditUserIds().add(userId);
            paymentMethodRepository.save(existingPaymentMethod);

            // Create a new user-specific payment method with the updated values
            PaymentMethod createdPaymentMethod = new PaymentMethod();
            createdPaymentMethod.setType(paymentMethod.getType());
            createdPaymentMethod.setName(paymentMethod.getName());
            createdPaymentMethod.setAmount(paymentMethod.getAmount());
            createdPaymentMethod.setGlobal(false);
            createdPaymentMethod.setUser(userOpt);
            return paymentMethodRepository.save(createdPaymentMethod);
        } else {
            if (paymentMethod.getName() != null) {
                existingPaymentMethod.setName(paymentMethod.getName().trim());
            }
            if (paymentMethod.getAmount() != null) {
                existingPaymentMethod.setAmount(paymentMethod.getAmount());
            }
            if (paymentMethod.getType() != null) {
                existingPaymentMethod.setType(paymentMethod.getType());
            }
            return paymentMethodRepository.save(existingPaymentMethod);
        }
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
        else if(existingPaymentMethod.getUser().getId().equals(userId)) {
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
}