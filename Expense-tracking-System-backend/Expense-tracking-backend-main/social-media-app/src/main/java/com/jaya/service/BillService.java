//package com.jaya.service;
//
//import com.jaya.exceptions.UserException;
//import com.jaya.models.Bill;
//import com.jaya.models.Expense;
//
//import java.time.LocalDate;
//import java.util.List;
//
//public interface BillService {
//    Bill createBill(Bill bill, Integer userId) throws UserException;
//    Bill updateBill(Bill bill, Integer userId) throws UserException;
//    Bill getByBillId(Integer id, Integer userId) throws UserException;
//    void deleteBill(Integer id, Integer userId) throws UserException;
//    List<Bill> getAllBillsForUser(Integer userId) throws UserException;
//    String deleteAllBillsForUser(Integer userId) throws Exception;
//    List<Bill> getAllBillsForUser(Integer userId, int month, int year) throws Exception;
//    List<Bill> getAllBillsForUser(Integer userId, int month, int year, int offset) throws Exception;
//
//    List<Expense>getAllExpensesForBill( Integer userId,LocalDate startDate,LocalDate endDate) throws Exception;
//    List<Bill> getBillsWithinRange(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception;
//
//    List<Bill> getAllBillsForUser(Integer userId, String range, int offset) throws Exception;
//
//    Bill getBillIdByExpenseId(Integer userId,Integer billId) throws UserException;
//}