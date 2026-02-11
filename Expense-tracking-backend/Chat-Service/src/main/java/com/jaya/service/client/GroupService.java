package com.jaya.service.client;

import com.jaya.dto.GroupResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@FeignClient(name = "FRIENDSHIP-SERVICE", url = "${FRIENDSHIP_SERVICE_URL:http://localhost:6009}", contextId = "chatGroupClient")
public interface GroupService {


    @GetMapping("/api/groups/get-group-by-id")
    public Optional<GroupResponseDTO> getGroupByIdwithService(
            @RequestParam Integer id,@RequestParam Integer userId) throws Exception;
}
