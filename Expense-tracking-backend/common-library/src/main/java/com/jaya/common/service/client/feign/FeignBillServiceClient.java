package com.jaya.common.service.client.feign;

import com.jaya.common.dto.BillDTO;
import com.jaya.common.service.client.IBillServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feign client implementation for Bill Service.
 * Active only in microservices mode (when 'monolithic' profile is NOT active).
 */
@FeignClient(
    name = "BILL-SERVICE",
    url = "${BILL_SERVICE_URL:http://localhost:6007}",
    contextId = "commonBillServiceClient"
)
@Profile("!monolithic")
public interface FeignBillServiceClient extends IBillServiceClient {

    @Override
    @GetMapping("/api/bill/export-excel")
    String exportUserBillsToExcel(@RequestHeader("Authorization") String jwt,
                                   @RequestParam("filePath") String filePath);

    @Override
    @GetMapping("/api/bill/all")
    List<BillDTO> getAllBills(@RequestHeader("Authorization") String jwt,
                              @RequestParam("targetId") Integer targetId);
}
