package com.jaya.service;

import com.jaya.dto.BillSearchDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Bill;

import java.time.LocalDate;
import java.util.List;

public interface BillService {
    Bill createBill(Bill bill, Integer userId) throws Exception;

    Bill updateBill(Bill bill, Integer userId) throws Exception;

    Bill getByBillId(Integer id, Integer userId) throws Exception;

    void deleteBill(Integer id, Integer userId) throws Exception;

    List<Bill> getAllBillsForUser(Integer userId) throws Exception;

    String deleteAllBillsForUser(Integer userId) throws Exception;

    List<Bill> getAllBillsForUser(Integer userId, int month, int year) throws Exception;

    List<Bill> getAllBillsForUser(Integer userId, int month, int year, int offset) throws Exception;

    List<ExpenseDTO> getAllExpensesForBill(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception;

    List<Bill> getBillsWithinRange(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception;

    List<Bill> filterBillsByTypeAndRange(Integer userId, List<Bill> bills, String type,
            LocalDate fromDate, LocalDate toDate) throws Exception;

    List<String> getAllUniqueItemNames(Integer userId) throws Exception;

    List<Bill> getAllBillsForUser(Integer userId, String range, int offset) throws Exception;

    Bill getBillIdByExpenseId(Integer userId, Integer billId) throws Exception;

    List<String> getUserAndBackupItems(Integer userId) throws Exception;

    List<Bill> addMultipleBills(List<Bill> bills, Integer userId) throws Exception;

    List<Bill> addMultipleBillsWithProgress(List<Bill> bills, Integer userId, String jobId) throws Exception;

    List<BillSearchDTO> searchBills(Integer userId, String query, int limit);
}