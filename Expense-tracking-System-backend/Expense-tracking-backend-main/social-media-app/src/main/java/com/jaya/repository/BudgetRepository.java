package com.jaya.repository;

import com.jaya.models.Budget;
import com.jaya.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Integer> {

    // Custom query to find a budget by user and date range
    List<Budget> findByUserIdAndStartDateBeforeAndEndDateAfter(Integer userId, LocalDate startDate, LocalDate endDate);

    Optional<Budget> findByUserIdAndId(Integer userId, Integer budgetId);
    List<Budget> findByUserId(Integer userId);

    List<Budget> findByUserIdAndStartDateAfter(Integer userId, LocalDate startDate);

    List<Budget> findByUserIdAndEndDateBefore(Integer userId, LocalDate endDate);

    List<Budget> findByUserIdAndStartDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);

    List<Budget> findByUserIdAndEndDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);

    List<Budget> findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Integer userId, LocalDate startDate, LocalDate endDate);


}