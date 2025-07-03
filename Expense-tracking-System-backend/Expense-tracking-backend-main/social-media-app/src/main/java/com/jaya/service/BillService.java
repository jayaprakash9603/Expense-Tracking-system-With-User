package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.models.Bill;
import java.util.List;

public interface BillService {
    Bill createBill(Bill bill, Integer userId);
    Bill updateBill(Bill bill, Integer userId);
    Bill getByBillId(Integer id, Integer userId);
    void deleteBill(Integer id, Integer userId);
    List<Bill> getAllBillsForUser(Integer userId);
    String deleteAllBillsForUser(Integer userId) throws Exception;
    List<Bill> getAllBillsForUser(Integer userId, int month, int year) throws UserException;
}