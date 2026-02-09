package com.jaya.service;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.models.Category;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "CATEGORY-SERVICE", url = "${category.service.url:http://localhost:6008}", contextId = "expenseCategoryClient")
public interface CategoryServices {

    @GetMapping("/api/categories/get-by-id-with-service")
    CategoryDTO getById(@RequestParam Integer categoryId, @RequestParam Integer userId) throws Exception;

    @GetMapping("/api/categories/get-by-name-with-service")
    List<CategoryDTO> getByName(@RequestParam String categoryName, @RequestParam Integer userId) throws Exception;

    @PostMapping("/api/categories/create-category-with-service")
    CategoryDTO create(@RequestBody Category category, @RequestParam Integer userId) throws Exception;

    @PostMapping("/api/categories/save")
    CategoryDTO save(@RequestBody Category category) throws Exception;

    @GetMapping("/api/categories/get-all-for-users")
    List<CategoryDTO> getAllForUser(@RequestParam Integer userId) throws Exception;
}
