package com.jaya.repository;

import com.jaya.models.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

    List<Expense> findByDateBetween(LocalDate from, LocalDate to);

    Expense findByUserIdAndId(Integer userId, Integer id);
    // Add these methods to your ExpenseRepository interface
    Page<Expense> findByUserId(Integer userId, Pageable pageable);
    Page<Expense> findByUserIdAndDateBetween(Integer userId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    List<Expense> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(Integer userId, LocalDate startDate, LocalDate endDate);


    List<Expense>findByUser(User user);
    List<Expense>findByUserId(Integer userId);
    List<Expense> findByUserId(Integer userId, Sort sort);
    List<Expense> findByUserOrderByDateAsc(User user);
    List<Expense> findByUserOrderByDateDesc(User user);

    List<Expense> findByUserIdAndDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);
    List<Expense> findByUserIdAndDateBetween(Integer userId, LocalDateTime start, LocalDateTime end);

    Page<Expense> findByUser(User user, Pageable pageable);
    @Query("SELECT e FROM Expense e WHERE e.expense.expenseName = ?1 ORDER BY e.date DESC")
    List<Expense> findByExpenseNameOrderByDateDesc(String expenseName);

    @Query("SELECT e FROM Expense e WHERE e.user = :user AND e.date BETWEEN :startDate AND :endDate")
    List<Expense> findByUserAndDateBetween(
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate,
                                           @Param("user") User user);

    List<Expense>findByUserAndDate(User user,LocalDate date);
    List<Expense> findByIdIn(List<Integer> ids);
    @Query("SELECT e FROM ExpenseDetails e JOIN e.expense exp WHERE exp.user.id = :userId AND e.amount = :amount")
    List<ExpenseDetails> findByUserAndAmount(@Param("userId") Integer userId, @Param("amount") double amount);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId")
    List<Expense> findExpensesByUserId(@Param("userId") Integer userId);
    @Query("SELECT e FROM Expense e JOIN FETCH e.expense d WHERE e.user.id = :userId AND d.amount BETWEEN :minAmount AND :maxAmount")
    List<Expense> findExpensesByUserAndAmountRange(@Param("userId") Integer userId, @Param("minAmount") double minAmount, @Param("maxAmount") double maxAmount);


    @Query("SELECT e.expense FROM Expense e WHERE e.expense.expenseName = :expenseName AND e.expense.amount = :amount")
    ExpenseDetails findExistingExpenseDetails(@Param("expenseName") String expenseName, @Param("amount") double amount);

    @Query("SELECT e FROM Expense e JOIN e.expense d WHERE e.user.id = :userId AND d.type = 'loss' ORDER BY d.amount DESC")
    Page<Expense> findTopNExpensesByUserAndAmount(@Param("userId") Integer userId, Pageable pageable);


    @Query("SELECT e FROM Expense e WHERE e.user.id = ?1 AND e.expense.expenseName = ?2 ORDER BY e.date DESC")
    List<Expense> searchExpensesByUserAndName(@Param("userId") Integer userId, @Param("expenseName") String expenseName);
    
    @Query("SELECT SUM(ed.netAmount) FROM ExpenseDetails ed WHERE LOWER(ed.expenseName) = LOWER(:expenseName)")
    Double getTotalExpenseByName(@Param("expenseName") String expenseName);
    
    @Query("SELECT SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year")
    Double getTotalByMonthAndYear(@Param("month") int month, @Param("year") int year);

    
    @Query("SELECT LOWER(TRIM(ed.expenseName)), ed.paymentMethod, SUM(ed.netAmount) " +
    	       "FROM Expense e JOIN e.expense ed " +
    	       "GROUP BY LOWER(TRIM(ed.expenseName)), ed.paymentMethod")
    	List<Object[]> findTotalExpensesGroupedByCategoryAndPaymentMethod();
    	
    	@Query("SELECT ed FROM ExpenseDetails ed")
    	List<ExpenseDetails> findAllExpenseDetails();
    
    @Query("SELECT SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE e.date BETWEEN :startDate AND :endDate")
    Double getTotalByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    
    @Query("SELECT ed.paymentMethod, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year GROUP BY ed.paymentMethod")
    List<Object[]> findTotalByPaymentMethodForCurrentMonth(@Param("month") int month, @Param("year") int year);

    
    @Query("SELECT ed.paymentMethod, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year GROUP BY ed.paymentMethod")
    List<Object[]> findTotalByPaymentMethodForLastMonth(@Param("month") int month, @Param("year") int year);

    
    @Query("SELECT ed.paymentMethod, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE e.date BETWEEN :startDate AND :endDate GROUP BY ed.paymentMethod")
    List<Object[]> findTotalByPaymentMethodBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    
    @Query("SELECT ed.paymentMethod, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year GROUP BY ed.paymentMethod")
    List<Object[]> findTotalByPaymentMethodForMonth(@Param("month") int month, @Param("year") int year);

    
    
    @Query("SELECT ed.expenseName, ed.paymentMethod, SUM(ed.netAmount) FROM Expense e " +
    	       "JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year " +
    	       "GROUP BY ed.expenseName, ed.paymentMethod")
    	List<Object[]> findTotalByExpenseNameAndPaymentMethodForMonth(@Param("month") int month, @Param("year") int year);

    	
    	@Query("SELECT ed.expenseName, ed.paymentMethod, SUM(ed.netAmount) FROM Expense e " +
    		       "JOIN e.expense ed WHERE e.date BETWEEN :startDate AND :endDate " +
    		       "GROUP BY ed.expenseName, ed.paymentMethod")
    		List<Object[]> findTotalByExpenseNameAndPaymentMethodForDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT ed FROM ExpenseDetails ed JOIN ed.expense e WHERE e.user.id = :userId AND LOWER(ed.expenseName) = LOWER(:expenseName)")
    List<ExpenseDetails> findExpensesByUserAndName(@Param("userId") Integer userId, @Param("expenseName") String expenseName);
    @Query("SELECT ed.expenseName, SUM(ed.netAmount) AS totalAmount " +
            "FROM ExpenseDetails ed " +
            "JOIN ed.expense e " +
            "WHERE e.user.id = :userId " +
            "GROUP BY ed.expenseName " +
            "ORDER BY totalAmount DESC")
    List<Object[]> findTotalExpensesGroupedByCategory(@Param("userId") Integer userId);






    @Query("SELECT ed.expenseName, COUNT(ed.expenseName) AS frequency " +
            "FROM ExpenseDetails ed " +
            "JOIN ed.expense e " +
            "WHERE e.user.id = :userId " +
            "GROUP BY ed.expenseName " +
            "ORDER BY frequency DESC")
    Page<Object[]> findTopExpenseNamesByUser(@Param("userId") Integer userId, Pageable pageable);



    @Query("SELECT e FROM Expense e JOIN e.expense ed WHERE e.user.id = :userId AND ed.type = 'gain'")
    List<Expense> findExpensesWithGainTypeByUser(@Param("userId") Integer userId);

    @Query("SELECT e FROM Expense e JOIN e.expense ed WHERE e.user.id = :userId AND ed.type = 'loss'")
    List<Expense> findByLossTypeAndUser(@Param("userId") Integer userId);

    @Query("SELECT e FROM Expense e JOIN e.expense ed WHERE e.user.id = :userId AND ed.paymentMethod = :paymentMethod")
    List<Expense> findByUserAndPaymentMethod(@Param("userId") Integer userId, @Param("paymentMethod") String paymentMethod);


    
    @Query("SELECT e.date, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed GROUP BY e.date ORDER BY e.date ASC")
    List<Object[]> findTotalExpensesGroupedByDate();
    
    @Query("SELECT SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE e.date = :today")
    Double findTotalExpensesForToday(@Param("today") LocalDate today);
    
    @Query("SELECT SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year")
    Double findTotalExpensesForCurrentMonth(@Param("month") int month, @Param("year") int year);





    @Query("SELECT e FROM Expense e JOIN e.expense ed WHERE e.user.id = :userId AND ed.type = :type AND ed.paymentMethod = :paymentMethod")
    List<Expense> findByUserAndTypeAndPaymentMethod(@Param("userId") Integer userId, @Param("type") String type, @Param("paymentMethod") String paymentMethod);

    
    @Query("SELECT DISTINCT e.expense.paymentMethod FROM Expense e")
    List<String> findDistinctPaymentMethods();

    @Query("SELECT ed.paymentMethod, COUNT(ed.paymentMethod) FROM ExpenseDetails ed " +
            "JOIN ed.expense e WHERE e.user.id = :userId " +
            "GROUP BY ed.paymentMethod ORDER BY COUNT(ed.paymentMethod) DESC")
    List<Object[]> findTopPaymentMethodsByUser(@Param("userId") Integer userId);


    @Query("SELECT e FROM Expense e JOIN e.expense ed WHERE e.user.id = :userId AND ed.type = 'gain' ORDER BY ed.amount DESC")
    List<Expense> findTop10GainsByUser(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT e FROM Expense e JOIN e.expense ed WHERE e.user.id = :userId AND ed.type = 'loss' ORDER BY ed.amount DESC")
    List<Expense> findTop10LossesByUser(@Param("userId") Integer userId, Pageable pageable);



    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    List<Expense> findByUserAndMonthAndYear(@Param("userId") Integer userId, @Param("month") int month, @Param("year") int year);


    @Query("SELECT e2.expenseName " +
            "FROM Expense e1 " +
            "JOIN ExpenseDetails e2 ON e1.id = e2.expense.id " +
            "WHERE e1.user.id = :userId AND e2.type = 'gain' " +
            "ORDER BY e2.amount DESC")
    List<String> findTopExpensesByGainForUser(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT e2.expenseName " +
            "FROM Expense e1 " +
            "JOIN ExpenseDetails e2 ON e1.id = e2.expense.id " +
            "WHERE e1.user.id = :userId AND e2.type = 'loss' " +
            "ORDER BY e2.amount DESC")
  List<String> findTopExpensesByLoss(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT e FROM Expense e JOIN e.expense d WHERE " +
            "(e.user.id = :userId) AND " +
            "(d.expenseName LIKE %:expenseName% OR :expenseName IS NULL) AND " +
            "(e.date BETWEEN :startDate AND :endDate OR :startDate IS NULL OR :endDate IS NULL) AND " +
            "(d.type = :type OR :type IS NULL) AND " +
            "(d.paymentMethod = :paymentMethod OR :paymentMethod IS NULL) AND " +
            "(d.amount BETWEEN :minAmount AND :maxAmount OR :minAmount IS NULL OR :maxAmount IS NULL)")
    List<Expense> filterExpensesByUser(
            @Param("userId") Integer userId,
            @Param("expenseName") String expenseName,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") String type,
            @Param("paymentMethod") String paymentMethod,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount);



    @Query("SELECT e FROM Expense e WHERE e.user.id = ?1 AND e.expense.expenseName = ?2 AND e.date < ?3 ORDER BY e.date DESC")
    List<Expense> findByUserAndExpenseNameBeforeDate(Integer userId, String expenseName, LocalDate date);



    @Query("SELECT ed.expenseName, SUM(ed.amount) as total " +
            "FROM Expense e JOIN e.expense ed " +
            "WHERE YEAR(e.date) = :year AND e.user.id = :userId " +
            "GROUP BY ed.expenseName " +
            "ORDER BY total DESC")
    List<Object[]> findExpenseByNameAndUserId(@Param("year") int year, @Param("userId") Integer userId);


    // For Bar/Line Chart: Monthly Expenses
    @Query("SELECT MONTH(e.date) as month, SUM(ed.amount) as total " +
            "FROM Expense e JOIN e.expense ed " +
            "WHERE YEAR(e.date) = :year AND e.user.id = :userId " +
            "AND ed.type = 'loss' AND ed.paymentMethod <> 'creditPaid' " +
            "GROUP BY MONTH(e.date) " +
            "ORDER BY MONTH(e.date)")
    List<Object[]> findMonthlyLossExpensesByUserId(@Param("year") int year, @Param("userId") Integer userId);





    // For Polar Area Chart: Payment Method Distribution
    @Query("SELECT ed.paymentMethod, SUM(ed.amount) as total " +
            "FROM Expense e JOIN e.expense ed " +
            "WHERE YEAR(e.date) = :year AND e.user.id = :userId " +
            "GROUP BY ed.paymentMethod")
    List<Object[]> findPaymentMethodDistributionByUserId(@Param("year") int year, @Param("userId") Integer userId);


    @Query(value = "SELECT TO_CHAR(e.date, 'FMMonth') AS month, " +
            "SUM(ed.amount) AS total, " +
            "SUM(SUM(ed.amount)) OVER (ORDER BY EXTRACT(MONTH FROM e.date)) AS cumulative_total " +
            "FROM expenses e " +
            "JOIN expense_details ed ON e.id = ed.expense_id " +
            "WHERE EXTRACT(YEAR FROM e.date) = :year " +
            "AND e.user_id = :userId " +
            "AND ed.payment_method != 'creditPaid' " +   // Exclude 'creditPaid'
            "AND ed.type = 'loss' " +                    // Only 'loss' types
            "GROUP BY EXTRACT(MONTH FROM e.date), TO_CHAR(e.date, 'FMMonth') " +
            "ORDER BY EXTRACT(MONTH FROM e.date)",
            nativeQuery = true)
    List<Object[]> findCumulativeExpensesByUserId(@Param("year") int year, @Param("userId") Integer userId);








    // For Stacked Bar Chart: Expenses by Name Over Time
    @Query(value = "SELECT ed2.expense_name " +
            "FROM expenses e2 " +
            "JOIN expense_details ed2 ON e2.id = ed2.expense_id " +
            "WHERE YEAR(e2.date) = :year AND e2.user_id = :userId " +
            "GROUP BY ed2.expense_name " +
            "ORDER BY SUM(ed2.amount) DESC", nativeQuery = true)
    List<String> findTopExpenseNames(@Param("year") int year, @Param("userId") Integer userId);

    @Query(value = """
    SELECT MONTHNAME(e.date) AS month, ed.expense_name, SUM(ed.amount) AS total
    FROM expenses e
    JOIN expense_details ed ON e.id = ed.expense_id
    WHERE YEAR(e.date) = :year AND e.user_id = :userId
      AND ed.expense_name IN (
          SELECT ed2.expense_name
          FROM expenses e2
          JOIN expense_details ed2 ON e2.id = ed2.expense_id
          WHERE YEAR(e2.date) = :year AND e2.user_id = :userId
          GROUP BY ed2.expense_name
          ORDER BY SUM(ed2.amount) DESC
          LIMIT :limit
      )
    GROUP BY MONTH(e.date), ed.expense_name
    ORDER BY MONTH(e.date), ed.expense_name
    """, nativeQuery = true)
    List<Object[]> findExpenseNameOverTimeByUserNative(@Param("year") int year,
                                                       @Param("limit") int limit,
                                                       @Param("userId") int userId);


    @Query("SELECT e FROM Expense e WHERE YEAR(e.date) = :year AND e.user.id = :userId")
    List<Expense> findByYearAndUser(@Param("year") int year, @Param("userId") int userId);






    @Query("SELECT e, ed FROM Expense e JOIN e.expense ed " +
            "WHERE YEAR(e.date) = :year AND e.user.id = :userId " +
            "AND ed.paymentMethod != 'creditPaid' AND ed.type = 'loss'")
    List<Object[]> findExpensesWithDetailsByUserIdAndYear(
            @Param("year") int year, @Param("userId") Integer userId);


    List<Expense> findAllByUserIdAndIdIn(Integer userId, Set<Integer> expenseIds);
}




