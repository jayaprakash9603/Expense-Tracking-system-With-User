package com.jaya.repository;

import com.jaya.models.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod,Integer> {


    PaymentMethod findByUserIdAndId(Integer userId, Integer id);

    List<PaymentMethod>findByUserId(Integer userId);
}
