package com.jaya.controller;

import com.jaya.models.AuditExpense;
import com.jaya.models.CommonLog;
import com.jaya.service.CommonLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/common-logs")
public class CommonLogController {

    @Autowired
    private CommonLogService commonLogService;

//    @PostMapping
//    public CommonLog createCommonLog(@RequestBody AuditExpense auditExpense, @RequestParam Long emailLogId) {
//        return commonLogService.saveCommonLog(auditExpense, emailLogId);
//    }
}