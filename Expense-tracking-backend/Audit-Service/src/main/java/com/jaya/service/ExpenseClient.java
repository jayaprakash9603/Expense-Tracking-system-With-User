package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "EXPENSE-TRACKING-SYSTEM", url = "${EXPENSE_SERVICE_URL:http://localhost:6000}", contextId = "auditExpenseClient")
public interface ExpenseClient {

    @GetMapping("/api/user/profile")
    public UserDTO getuserProfile(@RequestHeader("Authorization") String jwt);
}
