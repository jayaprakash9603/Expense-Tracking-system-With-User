package com.jaya.repository;

import com.jaya.models.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    @Query("SELECT c FROM Category c WHERE :userId MEMBER OF c.userIds")
    List<Category> findAllByUserId(@Param("userId") Integer userId);

    // Optimized: Fetch category with all collections in single query
    @EntityGraph(attributePaths = { "expenseIds", "userIds", "editUserIds" })
    @Query("SELECT c FROM Category c WHERE c.userId = :userId AND c.id = :id")
    Category findByUserIdAndIdWithDetails(@Param("userId") Integer userId, @Param("id") Integer id);

    Category findByUserIdAndId(Integer userId, Integer id);

    // Optimized: Use EntityGraph to fetch all collections eagerly
    @EntityGraph(attributePaths = { "expenseIds", "userIds", "editUserIds" })
    @Query("SELECT DISTINCT c FROM Category c WHERE c.userId = :userId")
    List<Category> findByUserIdWithDetails(@Param("userId") Integer userId);

    List<Category> findByUserId(Integer userId);

    // Optimized: Fetch global categories with all collections
    @EntityGraph(attributePaths = { "expenseIds", "userIds", "editUserIds" })
    @Query("SELECT DISTINCT c FROM Category c WHERE c.isGlobal = true")
    List<Category> findByIsGlobalTrueWithDetails();

    List<Category> findByIsGlobalTrue();

    // Optimized: Fetch all global categories with collections
    @EntityGraph(attributePaths = { "expenseIds", "userIds", "editUserIds" })
    @Query("SELECT DISTINCT c FROM Category c WHERE c.isGlobal = true")
    List<Category> findAllByIsGlobalTrueWithDetails();

    List<Category> findAllByIsGlobalTrue(); // Fetch all global categories

    // Optimized: Find by name with details
    @EntityGraph(attributePaths = { "expenseIds", "userIds", "editUserIds" })
    @Query("SELECT DISTINCT c FROM Category c WHERE c.name = :name AND c.userId = :userId")
    List<Category> findByNameAndUserIdWithDetails(@Param("name") String name, @Param("userId") Integer userId);

    List<Category> findByNameAndUserId(String others, Integer userId);

    @EntityGraph(attributePaths = { "expenseIds", "userIds", "editUserIds" })
    @Query("SELECT DISTINCT c FROM Category c WHERE c.userId = :userId")
    List<Category> findAllWithDetailsByUserId(@Param("userId") Integer userId);

    @EntityGraph(attributePaths = { "expenseIds", "userIds", "editUserIds" })
    @Query("SELECT DISTINCT c FROM Category c WHERE c.isGlobal = true")
    List<Category> findAllGlobalWithDetails();

    // Optimized: Find by ID with all collections
    @EntityGraph(attributePaths = { "expenseIds", "userIds", "editUserIds" })
    @Query("SELECT c FROM Category c WHERE c.id = :id")
    Optional<Category> findByIdWithDetails(@Param("id") Integer id);
}