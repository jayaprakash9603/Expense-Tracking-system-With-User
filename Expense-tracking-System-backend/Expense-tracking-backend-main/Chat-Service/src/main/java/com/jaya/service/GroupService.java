package com.jaya.service;

import com.jaya.dto.GroupResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@FeignClient(name = "FRIENDSHIP-SERVICE", url = "http://localhost:6009")
public interface GroupService {


    @GetMapping("/api/groups/get-group-by-id")
    public Optional<GroupResponseDTO> getGroupByIdwithService(
            @RequestParam Integer id,@RequestParam Integer userId) throws Exception;
}
