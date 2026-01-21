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

    // Check for duplicate category by name and type for a specific user
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND LOWER(c.type) = LOWER(:type) AND c.userId = :userId")
    Optional<Category> findByNameAndTypeAndUserId(@Param("name") String name, @Param("type") String type,
            @Param("userId") Integer userId);

    // Check for duplicate global category by name and type
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND LOWER(c.type) = LOWER(:type) AND c.isGlobal = true")
    Optional<Category> findGlobalByNameAndType(@Param("name") String name, @Param("type") String type);

    // Check for duplicate excluding a specific category (for updates)
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND LOWER(c.type) = LOWER(:type) AND c.userId = :userId AND c.id != :excludeId")
    Optional<Category> findByNameAndTypeAndUserIdExcluding(@Param("name") String name, @Param("type") String type,
            @Param("userId") Integer userId, @Param("excludeId") Integer excludeId);

    // Check for duplicate global category excluding a specific category (for
    // updates)
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND LOWER(c.type) = LOWER(:type) AND c.isGlobal = true AND c.id != :excludeId")
    Optional<Category> findGlobalByNameAndTypeExcluding(@Param("name") String name, @Param("type") String type,
            @Param("excludeId") Integer excludeId);

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