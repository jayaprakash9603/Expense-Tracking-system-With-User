
package com.jaya.repository;

import com.jaya.dto.PaymentMethodSearchDTO;
import com.jaya.models.PaymentMethod;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Integer> {

    Optional<PaymentMethod> findByUserIdAndId(Integer userId, Integer id);

    // Optimized: Fetch by ID with all collections eagerly loaded
    @EntityGraph(attributePaths = { "userIds", "editUserIds", "expenseIds" })
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.userId = :userId AND pm.id = :id")
    Optional<PaymentMethod> findByUserIdAndIdWithDetails(@Param("userId") Integer userId, @Param("id") Integer id);

    List<PaymentMethod> findByUserId(@Param("userId") Integer userId);

    // Optimized: Fetch user payment methods with all collections eagerly loaded
    @EntityGraph(attributePaths = { "userIds", "editUserIds", "expenseIds" })
    @Query("SELECT DISTINCT pm FROM PaymentMethod pm WHERE pm.userId = :userId")
    List<PaymentMethod> findByUserIdWithDetails(@Param("userId") Integer userId);

    // Fix: Add proper spacing
    List<PaymentMethod> findByUserIdAndNameAndType(Integer userId, String name, String type);

    List<PaymentMethod> findByName(String name);

    // Fix: Add proper spacing
    List<PaymentMethod> findByNameAndType(String name, String type);

    List<PaymentMethod> findByUserIdAndName(Integer userId, String name);

    // Optimized: Find by user and name with all collections
    @EntityGraph(attributePaths = { "userIds", "editUserIds", "expenseIds" })
    @Query("SELECT DISTINCT pm FROM PaymentMethod pm WHERE pm.userId = :userId AND pm.name = :name")
    List<PaymentMethod> findByUserIdAndNameWithDetails(@Param("userId") Integer userId, @Param("name") String name);

    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.name = :name AND pm.type = :type AND pm.isGlobal = true")
    List<PaymentMethod> findByNameAndTypeAndIsGlobalTrue(@Param("name") String name, @Param("type") String type);

    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.name = :name AND pm.userId = :userId")
    Optional<PaymentMethod> findByNameAndUserId(@Param("name") String name, @Param("userId") Integer userId);

    @Query("SELECT pm FROM PaymentMethod pm WHERE LOWER(pm.name) = LOWER(:name) AND pm.userId = :userId")
    Optional<PaymentMethod> findByNameIgnoreCaseAndUserId(@Param("name") String name, @Param("userId") Integer userId);

    List<PaymentMethod> findByIsGlobalTrue();

    // Optimized: Fetch global payment methods with all collections eagerly loaded
    @EntityGraph(attributePaths = { "userIds", "editUserIds", "expenseIds" })
    @Query("SELECT DISTINCT pm FROM PaymentMethod pm WHERE pm.isGlobal = true")
    List<PaymentMethod> findByIsGlobalTrueWithDetails();

    // Optimized: Find by ID with all collections
    @EntityGraph(attributePaths = { "userIds", "editUserIds", "expenseIds" })
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.id = :id")
    Optional<PaymentMethod> findByIdWithDetails(@Param("id") Integer id);

    /**
     * Fuzzy search payment methods by name or type - supports partial matching
     * Searches user's payment methods
     */
    @EntityGraph(attributePaths = { "userIds", "editUserIds", "expenseIds" })
    @Query("SELECT DISTINCT pm FROM PaymentMethod pm WHERE pm.userId = :userId AND " +
            "(LOWER(pm.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(pm.type) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY pm.name ASC")
    List<PaymentMethod> searchPaymentMethodsFuzzy(@Param("userId") Integer userId, @Param("query") String query);

    /**
     * Fuzzy search payment methods with limit - for search service optimization
     * Uses JPQL with DTO constructor to avoid N+1 problem.
     * Note: The query parameter should already be in pattern format (e.g.,
     * "%j%c%e%")
     */
    @Query("SELECT new com.jaya.dto.PaymentMethodSearchDTO(pm.id, pm.name, pm.description, pm.type, pm.amount, pm.isGlobal, pm.icon, pm.color, pm.userId) "
            +
            "FROM PaymentMethod pm WHERE pm.userId = :userId AND " +
            "(LOWER(pm.name) LIKE LOWER(:query) OR " +
            "LOWER(pm.type) LIKE LOWER(:query)) " +
            "ORDER BY pm.name ASC")
    List<PaymentMethodSearchDTO> searchPaymentMethodsFuzzyWithLimit(@Param("userId") Integer userId,
            @Param("query") String query);

    /**
     * Fuzzy search including global payment methods
     */
    @EntityGraph(attributePaths = { "userIds", "editUserIds", "expenseIds" })
    @Query("SELECT DISTINCT pm FROM PaymentMethod pm WHERE (pm.userId = :userId OR pm.isGlobal = true) AND " +
            "(LOWER(pm.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(pm.type) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY pm.name ASC")
    List<PaymentMethod> searchPaymentMethodsFuzzyIncludeGlobal(@Param("userId") Integer userId,
            @Param("query") String query);
}