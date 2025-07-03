package com.jaya.repository;

import com.jaya.models.Bill;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill,Integer> {

    @Query("SELECT b FROM Bill b WHERE b.user.id = :userId")
    List<Bill> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT b FROM Bill b WHERE b.id = :billId AND b.user.id = :userId")
    Optional<Bill> findByIdAndUserId(@Param("billId") Integer billId, @Param("userId") Integer userId);

}
