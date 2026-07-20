package com.jaya.common.service.client.feign;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.service.client.ICategoryServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "CATEGORY-SERVICE",
    url = "${CATEGORY_SERVICE_URL:http://localhost:6008}",
    contextId = "commonCategoryServiceClient"
)
@Profile("!monolithic")
public interface FeignCategoryServiceClient extends ICategoryServiceClient {

    @Override
    @GetMapping("/api/categories/internal/get-by-id-with-service")
    CategoryDTO getById(@RequestParam("categoryId") Integer categoryId,
                        @RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/categories/internal/get-by-name-with-service")
    List<CategoryDTO> getByName(@RequestParam("categoryName") String categoryName,
                                @RequestParam("userId") Integer userId);

    @Override
    @PostMapping("/api/categories/internal/create-category-with-service")
    CategoryDTO create(@RequestBody CategoryDTO category,
                       @RequestParam("userId") Integer userId);

    @Override
    @PostMapping("/api/categories/internal/save")
    CategoryDTO save(@RequestBody CategoryDTO category);

    @Override
    @GetMapping("/api/categories/internal/get-all-for-users")
    List<CategoryDTO> getAllForUser(@RequestParam("userId") Integer userId);
}
