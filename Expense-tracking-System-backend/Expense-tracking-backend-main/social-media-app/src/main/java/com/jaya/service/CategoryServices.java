package com.jaya.service;


import com.jaya.models.Category;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "CATEGORY-SERVICE", url = "http://localhost:6008")
public interface CategoryServices {

    @GetMapping("/api/categories/get-by-id-with-service")
    public Category getById(@RequestParam Integer categoryId, @RequestParam Integer userId) throws Exception;

    @GetMapping("/api/categories/get-by-name-with-service")
    public List<Category> getByName(@RequestParam String categoryName, @RequestParam Integer userId) throws Exception;

    @PostMapping("/api/categories/create-category-with-service")
    public Category create(@RequestBody Category category, @RequestParam Integer userId) throws Exception;


    @PostMapping("/api/categories/save")
    public Category save(@RequestBody Category category) throws Exception;

    @GetMapping("/api/categories/get-all-for-users")
    public List<Category> getAllForUser(@RequestParam Integer userId) throws Exception;
}
