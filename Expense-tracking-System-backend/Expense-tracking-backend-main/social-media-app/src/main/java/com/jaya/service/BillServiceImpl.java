package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.models.Bill;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.models.User;
import com.jaya.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;


    private final ExpenseService expenseService;

    private final UserService userService;

    @Override
    @Transactional
    public Bill createBill(Bill bill, Integer userId) {
        try {


            User user = userService.findUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found with ID: " + userId);
            }



            Expense expense = new Expense();
            expense.setId(null);
            expense.setDate(bill.getDate());
            expense.setUser(user);
            expense.setCategoryId(0);
            expense.setBudgetIds(new HashSet<>());
            expense.setBill(true);



            ExpenseDetails expenseDetails = new ExpenseDetails();
            expenseDetails.setId(null);
            expenseDetails.setAmount(bill.getAmount());
            expenseDetails.setComments(bill.getDescription() != null ? bill.getDescription() : "");
            expenseDetails.setType(bill.getType() != null ? bill.getType() : "loss");
            expenseDetails.setPaymentMethod(bill.getPaymentMethod() != null ? bill.getPaymentMethod() : "cash");
            expenseDetails.setExpenseName(bill.getName());
            expenseDetails.setNetAmount(bill.getNetAmount());
            expenseDetails.setCreditDue(bill.getCreditDue());
            expenseDetails.setExpense(expense);

            // Set the expense details to the expense
            expense.setExpense(expenseDetails);

            // Add the expense using the expense service
           Expense savedExpense= expenseService.addExpense(expense, user);

            bill.setId(null);
            bill.setUser(savedExpense.getUser());
            bill.setDate(savedExpense.getDate());
            bill.setExpenses(bill.getExpenses());
            bill.setCategoryId(savedExpense.getCategoryId());
            bill.setDescription(savedExpense.getExpense().getComments());
            bill.setPaymentMethod(savedExpense.getExpense().getPaymentMethod());
            bill.setAmount(savedExpense.getExpense().getAmount());
            bill.setNetAmount(savedExpense.getExpense().getNetAmount());
            bill.setName(bill.getName());
            bill.setType(savedExpense.getExpense().getType());
            bill.setCreditDue(savedExpense.getExpense().getCreditDue());
            bill.setBudgetIds(savedExpense.getBudgetIds());
            bill.setExpenseId(savedExpense.getExpense().getId());
            return billRepository.save(bill);

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error creating bill: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Bill updateBill(Bill bill, Integer userId) {
        try {
            User user = userService.findUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found with ID: " + userId);
            }
            // You may want to ensure the bill exists in the repository before updating
            Bill existingBill = billRepository.findById(bill.getId())
                    .orElseThrow(() -> new RuntimeException("Bill not found with ID: " + bill.getId()));

            // Update expense details
            Expense expense = expenseService.getExpenseById(existingBill.getExpenseId(), user);
            if (expense == null) {
                expense = new Expense();
            }
            expense.setDate(bill.getDate());
            expense.setUser(user);
            expense.setCategoryId(existingBill.getCategoryId());
            // Keep existing budgetIds if available, or update as needed
            if(expense.getBudgetIds() == null) {
                expense.setBudgetIds(new HashSet<>());
            }
            expense.setBill(true);

            ExpenseDetails expenseDetails = expense.getExpense();
            if (expenseDetails == null) {
                expenseDetails = new ExpenseDetails();
            }
            expenseDetails.setAmount(bill.getAmount());
            expenseDetails.setComments(bill.getDescription() != null ? bill.getDescription() : "");
            expenseDetails.setType(bill.getType() != null ? bill.getType() : "loss");
            expenseDetails.setPaymentMethod(bill.getPaymentMethod() != null ? bill.getPaymentMethod() : "cash");
            expenseDetails.setExpenseName(bill.getName());
            expenseDetails.setNetAmount(bill.getNetAmount());
            expenseDetails.setCreditDue(bill.getCreditDue());
            expenseDetails.setExpense(expense);

            expense.setExpense(expenseDetails);

            // Update using expense service if appropriate, or update directly.
            Expense savedExpense = expenseService.updateExpenseWithBillService(bill.getExpenseId(),expense, user);

            // Update bill fields with updated expense details
            existingBill.setUser(savedExpense.getUser());
            existingBill.setDate(savedExpense.getDate());
            // Update existing expenses, category, and other fields as required
            existingBill.setCategoryId(savedExpense.getCategoryId());
            existingBill.setDescription(savedExpense.getExpense().getComments());
            existingBill.setPaymentMethod(savedExpense.getExpense().getPaymentMethod());
            existingBill.setAmount(savedExpense.getExpense().getAmount());
            existingBill.setNetAmount(savedExpense.getExpense().getNetAmount());
            existingBill.setName(bill.getName());
            existingBill.setType(savedExpense.getExpense().getType());
            existingBill.setCreditDue(savedExpense.getExpense().getCreditDue());
            existingBill.setBudgetIds(savedExpense.getBudgetIds());
            existingBill.setExpenseId(savedExpense.getExpense().getId());
            existingBill.setExpenses(bill.getExpenses());

            return billRepository.save(existingBill);

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error updating bill: " + e.getMessage(), e);
        }
    }

    @Override
    public Bill getByBillId(Integer id, Integer userId) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("Bill ID cannot be null");
            }
            if (userId == null) {
                throw new IllegalArgumentException("User ID cannot be null");
            }

            User user = userService.findUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found with ID: " + userId);
            }

            Optional<Bill> billOpt = billRepository.findById(id);
            if (!billOpt.isPresent()) {
                throw new RuntimeException("Bill not found with ID: " + id);
            }

            return billOpt.get();

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving bill: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteBill(Integer id, Integer userId) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("Bill ID cannot be null");
            }
            if (userId == null) {
                throw new IllegalArgumentException("User ID cannot be null");
            }

            User user = userService.findUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found with ID: " + userId);
            }

            Optional<Bill> billOpt = billRepository.findById(id);
            if (!billOpt.isPresent()) {
                throw new RuntimeException("Bill not found with ID: " + id);
            }

            billRepository.deleteById(id);

        } catch (Exception e) {
            throw new RuntimeException("Error deleting bill: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Bill> getAllBillsForUser(Integer userId) {
        try {
            if (userId == null) {
                throw new IllegalArgumentException("User ID cannot be null");
            }

            User user = userService.findUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found with ID: " + userId);
            }

            return billRepository.findAll();

        } catch (Exception e) {
            throw new RuntimeException("Error retrieving bills: " + e.getMessage(), e);
        }
    }


    @Override
    public List<Bill> getAllBillsForUser(Integer userId, int month, int year) throws UserException {
        if (userId == null) throw new IllegalArgumentException("User ID cannot be null");
        User user = userService.findUserById(userId);
        if (user == null) throw new RuntimeException("User not found with ID: " + userId);

        return billRepository.findByUserId(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        bill.getDate().getMonthValue() == month &&
                        bill.getDate().getYear() == year)
                .collect(Collectors.toList());
    }
    @Override
    public String deleteAllBillsForUser(Integer userId) throws Exception {
        List<Bill>getAllUserBills=billRepository.findByUserId(userId);
        getAllUserBills.forEach(bill -> billRepository.deleteById(bill.getId()));
        List<Integer>expenseIds=getAllUserBills.stream().map(Bill::getExpenseId).collect(Collectors.toList());
        System.out.println("Deleting expenses with ids: "+expenseIds);
        expenseService.deleteExpensesByIdsWithBillService(expenseIds, userService.findUserById(userId));
        return "All bills are deleted successfully";
    }
}