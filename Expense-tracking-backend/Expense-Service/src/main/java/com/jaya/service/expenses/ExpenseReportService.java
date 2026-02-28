package com.jaya.service.expenses;


import com.jaya.models.ExpenseReport;
import com.jaya.models.ReportRequest;
import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;


import java.time.LocalDate;
import java.util.List;
import java.util.Map;




public interface ExpenseReportService {

    
    ExpenseReport generateExpenseReport(Integer expenseId, Integer userId);
    String generateExcelReport(Integer userId) throws Exception;



    
    ResponseEntity<String> generateAndSendMonthlyReport(ReportRequest request);



    



    
    void sendEmailWithAttachment(String toEmail, String subject, String body, String attachmentPath) throws MessagingException;



    



    




    


}
