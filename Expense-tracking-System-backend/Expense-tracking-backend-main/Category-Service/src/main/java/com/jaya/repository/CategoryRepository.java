package com.jaya.repository;

import com.jaya.models.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    @Query("SELECT c FROM Category c WHERE :userId MEMBER OF c.userIds")
    List<Category> findAllByUserId(@Param("userId") Integer userId);


    Category findByUserIdAndId(Integer userId, Integer id);
    List<Category> findByUserId(Integer userId);
    List<Category> findByIsGlobalTrue();

    List<Category> findAllByIsGlobalTrue(); // Fetch all global categories


    List<Category> findByNameAndUserId(String others, Integer userId);

    @EntityGraph(attributePaths = {"expenseIds", "userIds", "editUserIds"})
    @Query("SELECT DISTINCT c FROM Category c WHERE c.userId = :userId")
    List<Category> findAllWithDetailsByUserId(@Param("userId") Integer userId);

    @EntityGraph(attributePaths = {"expenseIds", "userIds", "editUserIds"})
    @Query("SELECT DISTINCT c FROM Category c WHERE c.isGlobal = true")
    List<Category> findAllGlobalWithDetails();
}