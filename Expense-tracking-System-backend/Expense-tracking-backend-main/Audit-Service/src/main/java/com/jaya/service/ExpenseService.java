package com.jaya.service;

import com.jaya.models.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "EXPENSE-TRACKING-SYSTEM", url = "${EXPENSE_SERVICE_URL:http://localhost:6000}")
public interface ExpenseService {

    @GetMapping("/api/user/profile")
    public UserDto getuserProfile(@RequestHeader("Authorization") String jwt);
}
