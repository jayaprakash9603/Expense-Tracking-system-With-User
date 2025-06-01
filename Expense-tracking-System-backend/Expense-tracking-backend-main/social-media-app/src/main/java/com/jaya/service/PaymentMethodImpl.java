package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.models.PaymentMethod;
import com.jaya.models.User;
import com.jaya.repository.PaymentMethodRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentMethodImpl implements PaymentMethodService{


    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private UserService userService;
    @Override
    public PaymentMethod getById(Integer userId, Integer id) throws Exception {
        PaymentMethod paymentMethod=paymentMethodRepository.findByUserIdAndId(userId,id);
        if(paymentMethod==null)
        {
            throw new Exception("Payment method not found " + id);
        }
        return paymentMethod;
    }

    @Override
    public List<PaymentMethod> getAllPaymentMethods(Integer userId) {

        return paymentMethodRepository.findByUserId(userId);
    }

    @Override
    public PaymentMethod createPaymentMethod(Integer userId, PaymentMethod paymentMethod) throws UserException {
        PaymentMethod createdPaymentMethod=new PaymentMethod();
        createdPaymentMethod.setUser(userService.findUserById(userId));
        createdPaymentMethod.setType(paymentMethod.getType());
        createdPaymentMethod.setAmount(paymentMethod.getAmount());
        createdPaymentMethod.setName(paymentMethod.getName());
        return paymentMethodRepository.save(createdPaymentMethod);
    }
    @Override
    public PaymentMethod updatePaymentMethod(Integer userId, Integer id, PaymentMethod paymentMethod) throws Exception {
        PaymentMethod existingPaymentMethod = getById(userId,id);
        User userOpt = userService.findUserById(userId);
        if (userOpt==null) {
            throw new EntityNotFoundException("User with ID " + userId + " not found");
        }

        if (paymentMethod.getName() != null) {
            existingPaymentMethod.setName(paymentMethod.getName());
        }
        if (paymentMethod.getAmount() != null) {
            existingPaymentMethod.setAmount(paymentMethod.getAmount());
        }
        if (paymentMethod.getType() != null) {
            existingPaymentMethod.setType(paymentMethod.getType());
        }
        return paymentMethodRepository.save(existingPaymentMethod);
    }

    @Override
    public void deletePaymentMethod(Integer userId, Integer paymentId) throws Exception {
        PaymentMethod existingPaymentMethod = getById(userId,paymentId);

        if (existingPaymentMethod == null) {
            throw new Exception("Payment method not found with ID: " + paymentId);
        }
        paymentMethodRepository.delete(existingPaymentMethod);

    }
}
