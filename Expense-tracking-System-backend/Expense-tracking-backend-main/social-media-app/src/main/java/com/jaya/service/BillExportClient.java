package com.jaya.service;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client for calling Bill-Service export Excel endpoint.
 * Mirrors the /api/bills/export/excel controller contract.
 */
@FeignClient(
        name = "BILL-SERVICE",
        url = "${bill.service.url:http://localhost:6007}"
)
public interface BillExportClient {

    /**
     * Export the current user's bills to Excel.
     * The Bill-Service implementation writes the Excel file to disk and returns
     * a String path, so we keep the same contract here.
     */
        @GetMapping(value = "/api/bills/export/excel")
    String exportUserBillsToExcel(@RequestHeader("Authorization") String jwt,
                                  @RequestParam(value = "filePath", required = false) String filePath);

    /**
     * Retrieve all bills for the current (or target) user.
     * Mirrors the /api/bills GET controller contract for the simplest case
     * where no date/range filters are applied.
     */
    @GetMapping(value = "/api/bills")
    List<Object> getAllBills(@RequestHeader("Authorization") String jwt,
                             @RequestParam(value = "targetId", required = false) Integer targetId);
}
