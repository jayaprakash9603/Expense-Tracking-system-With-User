package com.jaya.service;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "BILL-SERVICE", url = "${bill.service.url:http://localhost:6007}", contextId = "expenseBillClient")
public interface BillExportClient {

    @GetMapping(value = "/api/bills/export/excel")
    String exportUserBillsToExcel(@RequestHeader("Authorization") String jwt,
            @RequestParam(value = "filePath", required = false) String filePath);

    @GetMapping(value = "/api/bills")
    List<Object> getAllBills(@RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId);
}
