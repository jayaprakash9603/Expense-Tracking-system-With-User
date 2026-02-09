package com.jaya.common.service.client.local;

import com.jaya.common.dto.BillDTO;
import com.jaya.common.service.client.IBillServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Local implementation for Bill Service client in monolithic mode.
 * Calls the local BillService bean directly instead of making HTTP calls.
 */
@Component
@Profile("monolithic")
@Slf4j
public class LocalBillServiceClient implements IBillServiceClient {

    private final ApplicationContext applicationContext;
    private Object billService;

    @Autowired
    public LocalBillServiceClient(@Lazy ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    private Object getBillService() {
        if (billService == null) {
            try {
                billService = applicationContext.getBean("billServiceImpl");
            } catch (Exception e) {
                log.warn("Could not find billServiceImpl, trying BillServiceImpl class", e);
                try {
                    billService = applicationContext.getBean(
                        Class.forName("com.jaya.service.BillServiceImpl"));
                } catch (ClassNotFoundException ex) {
                    log.error("BillServiceImpl class not found", ex);
                    throw new RuntimeException("BillService not available in monolithic mode", ex);
                }
            }
        }
        return billService;
    }

    @Override
    public String exportUserBillsToExcel(String jwt, String filePath) {
        log.debug("LocalBillServiceClient: Exporting bills to Excel");
        try {
            Object service = getBillService();
            var method = service.getClass().getMethod("exportUserBillsToExcel", String.class, String.class);
            return (String) method.invoke(service, jwt, filePath);
        } catch (Exception e) {
            log.error("Error calling local BillService.exportUserBillsToExcel", e);
            throw new RuntimeException("Failed to export bills to Excel locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<BillDTO> getAllBills(String jwt, Integer targetId) {
        log.debug("LocalBillServiceClient: Getting all bills for target: {}", targetId);
        try {
            Object service = getBillService();
            var method = service.getClass().getMethod("getAllBills", String.class, Integer.class);
            return (List<BillDTO>) method.invoke(service, jwt, targetId);
        } catch (Exception e) {
            log.error("Error calling local BillService.getAllBills", e);
            throw new RuntimeException("Failed to get all bills locally", e);
        }
    }
}
