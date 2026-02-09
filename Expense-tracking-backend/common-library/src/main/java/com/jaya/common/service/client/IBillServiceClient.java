package com.jaya.common.service.client;

import com.jaya.common.dto.BillDTO;

import java.util.List;

/**
 * Interface for Bill Service client operations.
 * Implementations:
 * - FeignBillServiceClient: @Profile("!monolithic") - calls remote BILL-SERVICE
 * - LocalBillServiceClient: @Profile("monolithic") - calls BillService bean directly
 */
public interface IBillServiceClient {

    /**
     * Export user bills to Excel file.
     *
     * @param jwt the authorization JWT token
     * @param filePath the file path for export
     * @return the export result message
     */
    String exportUserBillsToExcel(String jwt, String filePath);

    /**
     * Get all bills for a user.
     *
     * @param jwt the authorization JWT token
     * @param targetId the target user ID
     * @return list of bills
     */
    List<BillDTO> getAllBills(String jwt, Integer targetId);
}
