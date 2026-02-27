package com.jaya.service;

import com.jaya.dto.BillSearchDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.models.Bill;
import com.jaya.common.dto.UserDTO;
import com.jaya.repository.BillRepository;
import com.jaya.util.BulkProgressTracker;
import com.jaya.util.BillServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;

    private final ExpenseClient expenseService;

    private final BillServiceHelper helper;

    private final BulkProgressTracker progressTracker;

    private static volatile List<String> cachedBackupItems = null;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Bill createBill(Bill bill, Integer userId) throws Exception {
        try {
            UserDTO user = helper.validateUser(userId);

            helper.validateBillData(bill);

            ExpenseDTO expense = helper.createExpenseFromBill(bill, user);
            ExpenseDTO savedExpense = expenseService.addExpense(expense, userId);

            if (savedExpense == null || savedExpense.getId() == null) {
                throw new Exception("Failed to create associated expense");
            }

            Bill newBill = helper.mapExpenseToBill(bill, savedExpense);
            Bill savedBill = billRepository.save(newBill);

            if (savedBill.getId() == null) {
                throw new Exception("Failed to save bill");
            }

            return savedBill;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new Exception("Error creating bill: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Bill updateBill(Bill bill, Integer userId) throws Exception {
        try {
            UserDTO user = helper.validateUser(userId);

            Bill existingBill = getByBillId(bill.getId(), userId);

            ExpenseDTO expense = expenseService.getExpenseById(existingBill.getExpenseId(), userId);
            if (expense == null) {
                throw new Exception("Associated expense not found for bill ID: " + bill.getId());
            }

            expense.setDate(bill.getDate() != null ? bill.getDate().toString() : null);

            expense.setUserId(userId);
            expense.setCategoryId(bill.getCategoryId());
            expense.setBill(true);
            expense.setIncludeInBudget(bill.isIncludeInBudget());

            if (bill.getBudgetIds() != null) {
                expense.setBudgetIds(bill.getBudgetIds());
            } else if (expense.getBudgetIds() == null) {
                expense.setBudgetIds(new HashSet<>());
            }

            ExpenseDetailsDTO expenseDetails = expense.getExpense();
            if (expenseDetails == null) {
                expenseDetails = new ExpenseDetailsDTO();
                expense.setExpense(expenseDetails);
            }

            expenseDetails.setAmount(bill.getAmount());
            expenseDetails.setComments(bill.getDescription() != null ? bill.getDescription() : "");
            expenseDetails.setType(bill.getType() != null ? bill.getType() : "loss");
            expenseDetails.setPaymentMethod(bill.getPaymentMethod() != null ? bill.getPaymentMethod() : "cash");
            expenseDetails.setExpenseName(bill.getName());
            expenseDetails.setNetAmount(bill.getNetAmount());
            expenseDetails.setCreditDue(bill.getCreditDue());

            ExpenseDTO savedExpense = expenseService.updateExpenseWithBillService(existingBill.getExpenseId(), expense,
                    user.getId());

            existingBill.setUserId(userId);
            existingBill.setDate(savedExpense.getDate() != null ? LocalDate.parse(savedExpense.getDate()) : null);
            existingBill.setCategoryId(savedExpense.getCategoryId());
            existingBill.setDescription(savedExpense.getExpense().getComments());
            existingBill.setPaymentMethod(savedExpense.getExpense().getPaymentMethod());
            existingBill.setAmount(savedExpense.getExpense().getAmountAsDouble());
            existingBill.setNetAmount(savedExpense.getExpense().getNetAmountAsDouble());
            existingBill.setName(bill.getName());
            existingBill.setType(savedExpense.getExpense().getType());
            existingBill.setCreditDue(savedExpense.getExpense().getCreditDueAsDouble());
            existingBill.setBudgetIds(savedExpense.getBudgetIds());
            existingBill.setIncludeInBudget(bill.isIncludeInBudget());
            existingBill.setCategory(savedExpense.getCategoryName());
            existingBill.setExpenseId(savedExpense.getId());

            if (bill.getExpenses() != null) {
                existingBill.setExpenses(bill.getExpenses());
            }

            return billRepository.save(existingBill);

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Bill getByBillId(Integer id, Integer userId) throws Exception {
        try {
            helper.validateBillId(id);
            helper.validateUser(userId);
            Optional<Bill> billOpt = billRepository.findById(id);
            if (billOpt.isEmpty()) {
                throw new Exception("Bill not found with ID: " + id);
            }
            return billOpt.get();
        } catch (Exception e) {
            throw new Exception("Error retrieving bill: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteBill(Integer id, Integer userId) throws Exception {
        try {
            helper.validateBillId(id);
            UserDTO user = helper.validateUser(userId);
            Bill bill = getByBillId(id, userId);
            expenseService.deleteExpensesByIdsWithBillService(Arrays.asList(bill.getExpenseId()), user.getId());

            billRepository.deleteById(id);

        } catch (Exception e) {
            throw new Exception("Error deleting bill: " + e.getMessage());
        }
    }

    @Override
    public List<Bill> getAllBillsForUser(Integer userId) throws Exception {
        try {
            helper.validateUser(userId);

            List<Bill> bills = billRepository.findByUserId(userId);

            System.out.print("bills size" + bills.size());
            return bills;
        } catch (Exception e) {
            throw new Exception("Error retrieving bills: " + e.getMessage());
        }
    }

    @Override
    public List<Bill> getAllBillsForUser(Integer userId, int month, int year) throws Exception {
        helper.validateUser(userId);
        helper.validateMonthAndYear(month, year);
        return billRepository.findByUserId(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        bill.getDate().getMonthValue() == month &&
                        bill.getDate().getYear() == year)
                .collect(Collectors.toList());
    }

    @Override
    public List<Bill> getAllBillsForUser(Integer userId, int month, int year, int offset) throws Exception {
        helper.validateUser(userId);
        helper.validateMonthAndYear(month, year);
        return billRepository.findByUserId(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        bill.getDate().getMonthValue() == month &&
                        bill.getDate().getYear() == year)
                .skip(offset)
                .collect(Collectors.toList());
    }

    @Override
    public List<Bill> getAllBillsForUser(Integer userId, String range, int offset) throws Exception {
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

        return billRepository.findByUserId(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        (bill.getDate().isEqual(startDate) || bill.getDate().isAfter(startDate)) &&
                        (bill.getDate().isEqual(endDate) || bill.getDate().isBefore(endDate)))
                .collect(Collectors.toList());
    }

    @Override
    public Bill getBillIdByExpenseId(Integer userId, Integer expenseid) throws Exception {

        Bill bill = billRepository.findByExpenseId(expenseid);
        if (bill == null) {
            throw new Exception("Bill not found for expense ID: " + expenseid);
        }
        System.out.println("bill id" + bill.getId() + "expense id " + bill.getExpenseId());
        return bill;
    }

    @Override
    public String deleteAllBillsForUser(Integer userId) throws Exception {
        helper.validateUser(userId);
        List<Bill> getAllUserBills = billRepository.findByUserId(userId);

        List<Integer> expenseIds = getAllUserBills.stream()
                .map(Bill::getExpenseId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        getAllUserBills.forEach(bill -> billRepository.deleteById(bill.getId()));

        if (!expenseIds.isEmpty()) {
            try {
                expenseService.deleteExpensesByIdsWithBillService(expenseIds, userId);
            } catch (Exception e) {
                System.err.println("Warning: Failed to delete some expenses: " + e.getMessage());
            }
        }

        return "All bills are deleted successfully";
    }

    @Override
    public List<Bill> getBillsWithinRange(Integer userId, LocalDate startDate, LocalDate endDate) throws Exception {
        helper.validateUser(userId);
        return billRepository.findByUserId(userId).stream()
                .filter(bill -> bill.getDate() != null &&
                        (startDate.equals(endDate)
                                ? bill.getDate().isEqual(startDate)
                                : (bill.getDate().isEqual(startDate) || bill.getDate().isAfter(startDate)) &&
                                        (bill.getDate().isEqual(endDate) || bill.getDate().isBefore(endDate))))
                .collect(Collectors.toList());
    }

    @Override
    public List<Bill> filterBillsByTypeAndRange(Integer userId, List<Bill> bills, String type,
            LocalDate fromDate, LocalDate toDate) throws Exception {

        helper.validateUser(userId);

        List<Bill> source = bills == null ? billRepository.findByUserId(userId) : bills;
        if (source == null || source.isEmpty()) {
            return source == null ? Collections.emptyList() : source;
        }

        String normalizedType = type == null ? null : type.trim().toLowerCase();
        boolean typeFilterEnabled = normalizedType != null && !normalizedType.isEmpty()
                && !"all".equals(normalizedType);

        if (typeFilterEnabled && !"loss".equals(normalizedType) && !"gain".equals(normalizedType)) {
            throw new IllegalArgumentException("Type must be either 'loss' or 'gain'");
        }

        if (fromDate != null && toDate != null && toDate.isBefore(fromDate)) {
            throw new IllegalArgumentException("toDate cannot be earlier than fromDate");
        }

        return source.stream()
                .filter(bill -> {
                    if (typeFilterEnabled) {
                        String billType = bill.getType() == null ? "loss" : bill.getType().toLowerCase();
                        if (!billType.equals(normalizedType)) {
                            return false;
                        }
                    }

                    LocalDate billDate = bill.getDate();
                    if (fromDate != null) {
                        if (billDate == null || billDate.isBefore(fromDate)) {
                            return false;
                        }
                    }

                    if (toDate != null) {
                        if (billDate == null || billDate.isAfter(toDate)) {
                            return false;
                        }
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDTO> getAllExpensesForBill(Integer userId, LocalDate startDate, LocalDate endDate)
            throws Exception {

        List<Bill> bills = getBillsWithinRange(userId, startDate, endDate);
        return bills.stream().map(bill -> expenseService.getExpenseById(bill.getExpenseId(), userId))
                .collect(Collectors.toList());

    }

    @Override
    public List<String> getAllUniqueItemNames(Integer userId) throws Exception {
        try {
            helper.validateUser(userId);
            return billRepository.findByUserId(userId).stream()
                    .filter(bill -> bill.getExpenses() != null)
                    .flatMap(bill -> bill.getExpenses().stream())
                    .map(exp -> exp.getItemName() == null ? "" : exp.getItemName().trim())
                    .filter(name -> name != null && !name.isEmpty())
                    .map(String::trim)
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new Exception("Error retrieving unique item names: " + e.getMessage());
        }
    }

    @Override
    public List<String> getUserAndBackupItems(Integer userId) throws Exception {
        try {
            helper.validateUser(userId);

            List<String> userItems = getAllUniqueItemNames(userId);

            if (cachedBackupItems == null) {
                synchronized (BillServiceImpl.class) {
                    if (cachedBackupItems == null) {
                        java.util.List<String> backup = new java.util.ArrayList<>();
                        try (java.io.InputStream is = getClass().getClassLoader()
                                .getResourceAsStream("backup_item_names.txt")) {
                            if (is != null) {
                                try (java.io.BufferedReader reader = new java.io.BufferedReader(
                                        new java.io.InputStreamReader(is))) {
                                    backup = reader.lines()
                                            .map(String::trim)
                                            .filter(s -> s != null && !s.isEmpty())
                                            .distinct()
                                            .collect(Collectors.toList());
                                }
                            }
                        } catch (Exception ex) {
                        }
                        cachedBackupItems = backup;
                    }
                }
            }

            java.util.LinkedHashSet<String> merged = new java.util.LinkedHashSet<>();
            if (userItems != null)
                merged.addAll(userItems);
            if (cachedBackupItems != null) {
                for (String b : cachedBackupItems) {
                    if (b != null && !b.trim().isEmpty())
                        merged.add(b.trim());
                }
            }

            return new java.util.ArrayList<>(merged);
        } catch (Exception e) {
            throw new Exception("Error retrieving user and backup items: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public List<Bill> addMultipleBills(List<Bill> bills, Integer userId) throws Exception {
        UserDTO user = helper.validateUser(userId);
        if (bills == null || bills.isEmpty())
            return java.util.Collections.emptyList();

        final int batchSize = 500;
        int count = 0;
        java.util.List<Bill> savedBills = new java.util.ArrayList<>(bills.size());

        for (Bill bill : bills) {
            helper.validateBillData(bill);

            ExpenseDTO expenseDto = helper.createExpenseFromBill(bill, user);
            ExpenseDTO savedExpense = expenseService.addExpense(expenseDto, userId);

            Bill toSave = helper.mapExpenseToBill(bill, savedExpense);
            billRepository.save(toSave);
            savedBills.add(toSave);

            if (++count % batchSize == 0) {
            }
        }
        return savedBills;
    }

    @Override
    @Transactional
    public List<Bill> addMultipleBillsWithProgress(List<Bill> bills, Integer userId, String jobId) throws Exception {
        UserDTO user = helper.validateUser(userId);
        if (bills == null || bills.isEmpty())
            return Collections.emptyList();

        final int progressStep = 250;
        int sinceLast = 0;
        List<Bill> savedBills = new ArrayList<>(Math.min(bills.size(), 10_000));

        try {
            for (Bill bill : bills) {
                helper.validateBillData(bill);

                ExpenseDTO expenseDto = helper.createExpenseFromBill(bill, user);
                System.out.println(("category id in bill" + expenseDto.getCategoryId()));
                ExpenseDTO savedExpense = expenseService.addExpense(expenseDto, userId);

                Bill toSave = helper.mapExpenseToBill(bill, savedExpense);
                billRepository.save(toSave);
                savedBills.add(toSave);

                if (++sinceLast >= progressStep) {
                    progressTracker.increment(jobId, sinceLast);
                    sinceLast = 0;
                }
            }
            if (sinceLast > 0)
                progressTracker.increment(jobId, sinceLast);
            return savedBills;
        } catch (Exception ex) {
            progressTracker.fail(jobId, ex.getMessage());
            throw ex;
        }
    }

    @Override
    public List<BillSearchDTO> searchBills(Integer userId, String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String subsequencePattern = convertToSubsequencePattern(query.trim());
        List<BillSearchDTO> results = billRepository.searchBillsFuzzyWithLimit(userId, subsequencePattern);
        return results.stream().limit(limit).collect(Collectors.toList());
    }

    private String convertToSubsequencePattern(String query) {
        if (query == null || query.isEmpty()) {
            return "%";
        }
        StringBuilder pattern = new StringBuilder("%");
        for (char c : query.toCharArray()) {
            pattern.append(c).append("%");
        }
        return pattern.toString();
    }
}
