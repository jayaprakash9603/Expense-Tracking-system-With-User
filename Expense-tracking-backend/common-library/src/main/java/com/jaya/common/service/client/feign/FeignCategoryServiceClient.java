package com.jaya.common.service.client.feign;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.service.client.ICategoryServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feign client implementation for Category Service.
 * Active only in microservices mode (when 'monolithic' profile is NOT active).
 */
@FeignClient(
    name = "CATEGORY-SERVICE",
    url = "${CATEGORY_SERVICE_URL:http://localhost:6008}",
    contextId = "commonCategoryServiceClient"
)
@Profile("!monolithic")
public interface FeignCategoryServiceClient extends ICategoryServiceClient {

    @Override
    @GetMapping("/api/category/get")
    CategoryDTO getById(@RequestParam("categoryId") Integer categoryId,
                        @RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/category/by-name")
    List<CategoryDTO> getByName(@RequestParam("categoryName") String categoryName,
                                @RequestParam("userId") Integer userId);

    @Override
    @PostMapping("/api/category/create")
    CategoryDTO create(@RequestBody CategoryDTO category,
                       @RequestParam("userId") Integer userId);

    @Override
    @PostMapping("/api/category/save")
    CategoryDTO save(@RequestBody CategoryDTO category);

    @Override
    @GetMapping("/api/category/all")
    List<CategoryDTO> getAllForUser(@RequestParam("userId") Integer userId);
}
