package com.jaya.controller;

import com.jaya.models.Category;
import com.jaya.models.Expense;
import com.jaya.models.User;
import com.jaya.service.CategoryService;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestHeader("Authorization") String jwt, @RequestBody Category category) {
        User user = userService.findUserByJwt(jwt);
        Category created = categoryService.create(category, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@RequestHeader("Authorization") String jwt, @PathVariable Integer id) throws Exception {
        User user = userService.findUserByJwt(jwt);
        Category category = categoryService.getById(id, user);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<Category>> getCategoryByName(@RequestHeader("Authorization") String jwt, @PathVariable String name) throws Exception {
        User user = userService.findUserByJwt(jwt);
        List<Category> categories = categoryService.getByName(name,user);
        if (categories == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(categories);
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserByJwt(jwt);
        List<Category> categories = categoryService.getAll(user);
        if (categories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@RequestHeader("Authorization") String jwt, @PathVariable Integer id, @RequestBody Category category) throws Exception {
        User user = userService.findUserByJwt(jwt);
        Category updated = categoryService.update(id, category, user);
    //        if (updated == null) {
    //            return ResponseEntity.notFound().build();
    //        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@RequestHeader("Authorization") String jwt, @PathVariable Integer id) throws Exception {
        User user = userService.findUserByJwt(jwt);
        categoryService.delete(id, user);
        return new ResponseEntity<>("Category is deleted", HttpStatus.NO_CONTENT);
    }





    @PostMapping("/bulk")
    public ResponseEntity<List<Category>> createMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories) {
        User user = userService.findUserByJwt(jwt);
        List<Category> createdCategories = categoryService.createMultiple(categories, user);
        return new ResponseEntity<>(createdCategories, HttpStatus.CREATED);
    }

    // Update multiple categories
    @PutMapping("/bulk")
    public ResponseEntity<List<Category>> updateMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories) {
        User user = userService.findUserByJwt(jwt);
        List<Category> updatedCategories = categoryService.updateMultiple(categories, user);
        return ResponseEntity.ok(updatedCategories);
    }

    // Delete multiple categories
    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Integer> categoryIds) {
        User user = userService.findUserByJwt(jwt);
        categoryService.deleteMultiple(categoryIds, user);
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/all/global")
    public ResponseEntity<Void> deleteAllGlobalCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "global", defaultValue = "true") boolean global) {
        User user = userService.findUserByJwt(jwt);
        categoryService.deleteAllGlobal(user, global);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllCategories(
            @RequestHeader("Authorization") String jwt) {
        User user = userService.findUserByJwt(jwt);
        categoryService.deleteAllUserCategories(user);
        return ResponseEntity.noContent().build();
    }

    // In CategoryController.java or ExpenseController.java
    @GetMapping("/uncategorized")
    public ResponseEntity<List<Expense>> getUncategorizedExpenses(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserByJwt(jwt);
        List<Expense> uncategorizedExpenses = categoryService.getOthersAndUncategorizedExpenses(user);
        return ResponseEntity.ok(uncategorizedExpenses);
    }
}