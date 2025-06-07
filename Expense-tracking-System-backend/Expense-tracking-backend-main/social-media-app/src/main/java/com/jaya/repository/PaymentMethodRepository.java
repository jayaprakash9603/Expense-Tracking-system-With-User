package com.jaya.repository;

import com.jaya.models.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Integer> {

    PaymentMethod findByUserIdAndId(Integer userId, Integer id);

    List<PaymentMethod> findByUserId(Integer userId);

    PaymentMethod findByName(String name);

    PaymentMethod findByUserIdAndName(Integer userId, String name);

    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.name = :name AND pm.user.id = :userId")
    Optional<PaymentMethod> findByNameAndUserId(@Param("name") String name, @Param("userId") Integer userId);

    @Query("SELECT pm FROM PaymentMethod pm WHERE LOWER(pm.name) = LOWER(:name) AND pm.user.id = :userId")
    Optional<PaymentMethod> findByNameIgnoreCaseAndUserId(@Param("name") String name, @Param("userId") Integer userId);

    List<PaymentMethod> findByIsGlobalTrue();
}