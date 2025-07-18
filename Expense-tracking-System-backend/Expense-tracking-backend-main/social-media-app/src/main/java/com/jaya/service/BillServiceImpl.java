package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.models.Bill;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.models.User;
import com.jaya.repository.BillRepository;
import com.jaya.util.ServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;


    private final ExpenseService expenseService;

    private final UserService userService;

    private final ServiceHelper helper;


    @Override
    @Transactional(rollbackFor = Exception.class)
    public Bill createBill(Bill bill, Integer userId) throws UserException {
        try {
            User user = helper.validateUser(userId);

            helper.validateBillData(bill);

            Expense expense = helper.createExpenseFromBill(bill, user);
            Expense savedExpense = expenseService.addExpense(expense, user);

            if (savedExpense == null || savedExpense.getId() == null) {
                throw new UserException("Failed to create associated expense");
            }

            Bill newBill = helper.mapExpenseToBill(bill, savedExpense);
            Bill savedBill = billRepository.save(newBill);

            if (savedBill.getId() == null) {
                throw new UserException("Failed to save bill");
            }

            return savedBill;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new UserException("Error creating bill: " + e.getMessage());
        }
    }


    @Override
    @Transactional
    public Bill updateBill(Bill bill, Integer userId) throws UserException {
        try {
            User user = helper.validateUser(userId);

            Bill existingBill = getByBillId(bill.getId(), userId);

            // Get the existing expense
            Expense expense = expenseService.getExpenseById(existingBill.getExpenseId(), user);
            if (expense == null) {
                throw new UserException("Associated expense not found for bill ID: " + bill.getId());
            }

            // Update expense properties
            expense.setDate(bill.getDate());
            expense.setUser(user);
            expense.setCategoryId(existingBill.getCategoryId());
            expense.setBill(true);
            expense.setIncludeInBudget(bill.isIncludeInBudget());

            // Handle budget IDs
            if (bill.getBudgetIds() != null) {
                expense.setBudgetIds(bill.getBudgetIds());
            } else if (expense.getBudgetIds() == null) {
                expense.setBudgetIds(new HashSet<>());
            }

            // Update expense details
            ExpenseDetails expenseDetails = expense.getExpense();
            if (expenseDetails == null) {
                expenseDetails = new ExpenseDetails();
                expense.setExpense(expenseDetails);
            }

            expenseDetails.setAmount(bill.getAmount());
            expenseDetails.setComments(bill.getDescription() != null ? bill.getDescription() : "");
            expenseDetails.setType(bill.getType() != null ? bill.getType() : "loss");
            expenseDetails.setPaymentMethod(bill.getPaymentMethod() != null ? bill.getPaymentMethod() : "cash");
            expenseDetails.setExpenseName(bill.getName());
            expenseDetails.setNetAmount(bill.getNetAmount());
            expenseDetails.setCreditDue(bill.getCreditDue());

            // Update the expense using the bill service method
            Expense savedExpense = expenseService.updateExpenseWithBillService(existingBill.getExpenseId(), expense, user);

            // Update the bill with the saved expense data
            existingBill.setUser(savedExpense.getUser());
            existingBill.setDate(savedExpense.getDate());
            existingBill.setCategoryId(savedExpense.getCategoryId());
            existingBill.setDescription(savedExpense.getExpense().getComments());
            existingBill.setPaymentMethod(savedExpense.getExpense().getPaymentMethod());
            existingBill.setAmount(savedExpense.getExpense().getAmount());
            existingBill.setNetAmount(savedExpense.getExpense().getNetAmount());
            existingBill.setName(bill.getName());
            existingBill.setType(savedExpense.getExpense().getType());
            existingBill.setCreditDue(savedExpense.getExpense().getCreditDue());
            existingBill.setBudgetIds(savedExpense.getBudgetIds());
            existingBill.setIncludeInBudget(bill.isIncludeInBudget());

            // Keep the same expense ID - don't change it
            existingBill.setExpenseId(savedExpense.getId());

            // Only update expenses list if provided
            if (bill.getExpenses() != null) {
                existingBill.setExpenses(bill.getExpenses());
            }

            return billRepository.save(existingBill);

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (UserException e) {
            throw e;
        } catch (Exception e) {
            throw new UserException("Error updating bill: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Bill getByBillId(Integer id, Integer userId) throws UserException {
        try {
            helper.validateBillId(id);
            helper.validateUser(userId);
            Optional<Bill> billOpt = billRepository.findById(id);
            if (billOpt.isEmpty()) {
                throw new UserException("Bill not found with ID: " + id);
            }
            return billOpt.get();
        } catch (Exception e) {
            throw new UserException("Error retrieving bill: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteBill(Integer id, Integer userId) throws UserException {
        try {
            helper.validateBillId(id);
            User user = helper.validateUser(userId);
            Bill bill =getByBillId(id,userId);
            expenseService.deleteExpensesByIdsWithBillService(Arrays.asList(bill.getExpenseId()), user);
            if (bill==null) {
                throw new UserException("Bill not found with ID: " + id);
            }

            billRepository.deleteById(id);

        } catch (Exception e) {
            throw new UserException("Error deleting bill: " + e.getMessage());
        }
    }

    @Override
    public List<Bill> getAllBillsForUser(Integer userId) throws UserException {
        try {
           helper.validateUser(userId);
            return billRepository.findByUserIdWithUser(userId);
        } catch (Exception e) {
            throw new UserException("Error retrieving bills: " + e.getMessage());
        }
    }


    @Override
    public List<Bill> getAllBillsForUser(Integer userId, int month, int year) throws UserException {
        helper.validateUser(userId);
        helper.validateMonthAndYear(month, year);
        return billRepository.findByUserIdWithUser(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        bill.getDate().getMonthValue() == month &&
                        bill.getDate().getYear() == year)
                .collect(Collectors.toList());
    }

    @Override
    public List<Bill> getAllBillsForUser(Integer userId, int month, int year, int offset) throws UserException {
        helper.validateUser(userId);
        helper.validateMonthAndYear(month, year);
        return billRepository.findByUserIdWithUser(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        bill.getDate().getMonthValue() == month &&
                        bill.getDate().getYear() == year)
                .skip(offset)
                .collect(Collectors.toList());
    }




    @Override
    public List<Bill> getAllBillsForUser(Integer userId, String range, int offset) throws UserException {
        helper.validateUser(userId);
        LocalDate now = LocalDate.now();
        LocalDate startDate, endDate;

        switch (range.toLowerCase()) {
            case "week":
                startDate = now.with(java.time.DayOfWeek.MONDAY).plusWeeks(offset);
                endDate = startDate.plusDays(6);
                break;
            case "month":
                startDate = now.withDayOfMonth(1).plusMonths(offset);
                endDate = startDate.plusMonths(1).minusDays(1);
                break;
            case "year":
                startDate = now.withDayOfYear(1).plusYears(offset);
                endDate = startDate.plusYears(1).minusDays(1);
                break;
            default:
                throw new IllegalArgumentException("Invalid range: " + range);
        }

        return billRepository.findByUserIdWithUser(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        (bill.getDate().isEqual(startDate) || bill.getDate().isAfter(startDate)) &&
                        (bill.getDate().isEqual(endDate) || bill.getDate().isBefore(endDate)))
                .collect(Collectors.toList());
    }

    @Override
    public Bill getBillIdByExpenseId(Integer userId, Integer expenseid) throws UserException {

        Bill bill=billRepository.findByExpenseId(expenseid);
        if (bill == null) {
            throw new UserException("Bill not found for expense ID: " + expenseid);
        }
        System.out.println("bill id"+bill.getId()+"expense id "+bill.getExpenseId());
        return bill;
    }

    @Override
    public String deleteAllBillsForUser(Integer userId) throws Exception {
        helper.validateUser(userId);
        List<Bill>getAllUserBills=billRepository.findByUserIdWithUser(userId);
        getAllUserBills.forEach(bill -> billRepository.deleteById(bill.getId()));
        List<Integer>expenseIds=getAllUserBills.stream().map(Bill::getExpenseId).collect(Collectors.toList());
        expenseService.deleteExpensesByIdsWithBillService(expenseIds, userService.findUserById(userId));
        return "All bills are deleted successfully";
    }


    @Override
    public List<Bill> getBillsWithinRange(Integer userId, LocalDate startDate, LocalDate endDate) throws UserException {
        helper.validateUser(userId);
        return billRepository.findByUserIdWithUser(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        (startDate.equals(endDate)
                                ? bill.getDate().isEqual(startDate)
                                : (bill.getDate().isEqual(startDate) || bill.getDate().isAfter(startDate)) &&
                                (bill.getDate().isEqual(endDate) || bill.getDate().isBefore(endDate))))
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> getAllExpensesForBill(Integer userId, LocalDate startDate, LocalDate endDate) throws UserException {

        List<Bill> bills = getBillsWithinRange(userId, startDate, endDate);
        User reqUser=userService.findUserById(userId);
        return bills.stream().map(bill->expenseService.getExpenseById(bill.getExpenseId(),reqUser)).collect(Collectors.toList());

    }
}