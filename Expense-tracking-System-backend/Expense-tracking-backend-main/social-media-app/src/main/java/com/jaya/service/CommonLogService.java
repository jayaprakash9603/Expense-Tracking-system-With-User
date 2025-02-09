package com.jaya.service;

import com.jaya.models.AuditExpense;
import com.jaya.models.CommonLog;
import com.jaya.models.EmailLog;
import com.jaya.repository.CommonLogRepository;
import com.jaya.repository.EmailLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CommonLogService {

    @Autowired
    private CommonLogRepository commonLogRepository;

    @Autowired
    private EmailLogRepository emailLogRepository;

    public CommonLog saveCommonLog(AuditExpense auditExpense, Integer emailLogId) {
        EmailLog emailLog = emailLogRepository.findById(emailLogId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email log ID"));

        CommonLog commonLog = new CommonLog();
        commonLog.setAuditExpense(auditExpense);
        commonLog.setEmailLog(emailLog);
        commonLog.setTimestamp(LocalDateTime.now());
        return commonLogRepository.save(commonLog);
    }
}