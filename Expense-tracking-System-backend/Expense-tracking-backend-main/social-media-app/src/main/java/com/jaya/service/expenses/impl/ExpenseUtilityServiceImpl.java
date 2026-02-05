package com.jaya.service.expenses.impl;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.models.DropdownValues;
import com.jaya.models.Expense;
import com.jaya.repository.ExpenseReportRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.expenses.ExpenseUtilityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class ExpenseUtilityServiceImpl implements ExpenseUtilityService {


    private static final String CREDIT_NEED_TO_PAID = "creditNeedToPaid";
    private static final String CREDIT_PAID = "creditPaid";
    private static final String CASH = "cash";


    private final ExpenseRepository expenseRepository;
    private final ExpenseReportRepository expenseReportRepository;

    public ExpenseUtilityServiceImpl(ExpenseRepository expenseRepository, ExpenseReportRepository expenseReportRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseReportRepository = expenseReportRepository;
    }


    @Override
    public List<ExpenseDTO> validateAndProcessExpenses(List<ExpenseDTO> expenses) {
        for (ExpenseDTO expense : expenses) {
            if (expense.getId() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'id' in expense: " + expense);
            }
            if (expense.getDate() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'date' in expense: " + expense);
            }
            if (expense.getExpense() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'expense' in expense: " + expense);
            }

            ExpenseDetailsDTO details = expense.getExpense();
            if (details.getId() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'id' in expense details: " + expense);
            }
            if (details.getExpenseName() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'expenseName' in expense details: " + expense);
            }
            if (details.getAmountAsDouble() == 0.0) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'amount' in expense details: " + expense);
            }
            if (details.getType() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'type' in expense details: " + expense);
            }
            if (details.getPaymentMethod() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'paymentMethod' in expense details: " + expense);
            }
            if (details.getNetAmountAsDouble() == 0.0) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'netAmount' in expense details: " + expense);
            }
            if (details.getComments() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'comments' in expense details: " + expense);
            }
        }
        return expenses;
    }

    @Override
    public double calculateTotalAmount(Map<String, Map<String, Double>> categorizedExpenses) {
        double totalGains = 0.0;
        double totalLosses = 0.0;

        if (categorizedExpenses.containsKey("gain")) {
            for (double amount : categorizedExpenses.get("gain").values()) {
                totalGains += amount;
            }
        }

        if (categorizedExpenses.containsKey("loss")) {
            for (double amount : categorizedExpenses.get("loss").values()) {
                totalLosses += amount;
            }
        }

        return totalGains - totalLosses;
    }

    @Override
    public Map<String, Map<String, Double>> categorizeExpenses(List<ExpenseDTO> processedExpenses) {
        Map<String, Map<String, Double>> categorizedExpenses = new HashMap<>();

        for (ExpenseDTO expense : processedExpenses) {
            String type = expense.getExpense().getType();
            String paymentMethod = expense.getExpense().getPaymentMethod();
            double amount = expense.getExpense().getAmountAsDouble();

            categorizedExpenses.computeIfAbsent(type, k -> new HashMap<>()).merge(paymentMethod, amount, Double::sum);
        }

        return categorizedExpenses;
    }

    @Override
    public double calculateTotalCreditDue(List<ExpenseDTO> processedExpenses) {
        double totalCreditDue = 0.0;

        for (ExpenseDTO expense : processedExpenses) {
            totalCreditDue += expense.getExpense().getCreditDueAsDouble();
        }

        return totalCreditDue;
    }

    @Override
    public List<String> findTopExpenseNames(List<ExpenseDTO> expenses, int topN) {

        Map<String, Long> expenseNameFrequency = expenses.stream().collect(Collectors.groupingBy(expense -> expense.getExpense().getExpenseName(), Collectors.counting()));

        return expenseNameFrequency.entrySet().stream().sorted(Map.Entry.<String, Long>comparingByValue().reversed()).limit(topN).map(Map.Entry::getKey).collect(Collectors.toList());
    }

    @Override
    public String findTopPaymentMethod(List<ExpenseDTO> expenses) {
        Map<String, Long> paymentMethodFrequency = expenses.stream().collect(Collectors.groupingBy(expense -> expense.getExpense().getPaymentMethod(), Collectors.counting()));

        return paymentMethodFrequency.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(null);
    }

    @Override
    public List<String> getTopExpenseNames(int topN, Integer userId) {
        Page<Object[]> results = expenseRepository.findTopExpenseNamesByUser(userId, PageRequest.of(0, topN));
        Set<String> topExpenseNamesSet = new HashSet<>();

        for (Object[] result : results) {
            String expenseName = ((String) result[0]).toLowerCase();
            String capitalizedExpenseName = capitalizeWords(expenseName);
            topExpenseNamesSet.add(capitalizedExpenseName);
        }

        return new ArrayList<>(topExpenseNamesSet);
    }

    @Override
    public List<String> getTopPaymentMethods(Integer userId) {
        List<Object[]> results = expenseRepository.findTopPaymentMethodsByUser(userId);
        List<String> topPaymentMethods = new ArrayList<>();

        for (Object[] result : results) {
            String paymentMethod = (String) result[0];
            topPaymentMethods.add(paymentMethod);
        }

        return topPaymentMethods;
    }

    @Override
    public List<String> getUniqueTopExpensesByGain(Integer userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);  
        return expenseRepository.findTopExpensesByGainForUser(userId, pageable);
    }

    @Override
    public List<String> getUniqueTopExpensesByLoss(Integer userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<String> expenseNames = expenseRepository.findTopExpensesByLoss(userId, pageable);
        return getUniqueExpenseNames(expenseNames);
    }

    @Override
    public List<String> getPaymentMethods(Integer userId) {
        List<String> paymentMethodsList = new ArrayList<>(Arrays.asList(CASH, CREDIT_PAID, CREDIT_NEED_TO_PAID));
        return paymentMethodsList;
    }
    @Override
    public Set<String> getPaymentMethodNames(List<ExpenseDTO> expenses) {
        return expenses.stream().map(expense -> expense.getExpense().getPaymentMethod()).collect(Collectors.toSet());
    }

    @Override
    public List<String> getDropdownValues() {
        return DropdownValues.getMonths();
    }

    @Override
    public List<String> getSummaryTypes() {
        return DropdownValues.getSummaryTypes();
    }

    @Override
    public List<String> getDailySummaryTypes() {
        return DropdownValues.getDailySummaryTypes();
    }

    @Override
    public List<String> getExpensesTypes() {
        return DropdownValues.getExpensesTypes();
    }

    @Override
    public Map<String, List<Map<String, Object>>> getExpensesGroupedByDate(Integer userId, String sortOrder) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        Map<String, List<Map<String, Object>>> groupedExpenses = new LinkedHashMap<>();
        Map<String, Integer> dateIndexMap = new LinkedHashMap<>();

        for (Expense expense : expenses) {
            String date = expense.getDate().toString();

            Map<String, Object> expenseMap = new LinkedHashMap<>();
            expenseMap.put("id", expense.getId());

            int index = dateIndexMap.getOrDefault(date, 0) + 1;
            expenseMap.put("index", index);

            dateIndexMap.put(date, index);

            if (expense.getExpense() != null) {
                expenseMap.put("expenseName", expense.getExpense().getExpenseName());
                expenseMap.put("amount", expense.getExpense().getAmount());
                expenseMap.put("type", expense.getExpense().getType());
                expenseMap.put("comments", expense.getExpense().getComments());
                expenseMap.put("paymentMethod", expense.getExpense().getPaymentMethod());
                expenseMap.put("netAmount", expense.getExpense().getNetAmount());
            } else {
                expenseMap.put("expenseName", "No details available");
                expenseMap.put("amount", 0.0);
                expenseMap.put("type", "N/A");
            }

            groupedExpenses.computeIfAbsent(date, k -> new ArrayList<>()).add(expenseMap);
        }

        Map<String, List<Map<String, Object>>> sortedGroupedExpenses = new LinkedHashMap<>();
        groupedExpenses.entrySet().stream().sorted((entry1, entry2) -> {
            LocalDate date1 = LocalDate.parse(entry1.getKey());
            LocalDate date2 = LocalDate.parse(entry2.getKey());
            return "desc".equalsIgnoreCase(sortOrder) ? date2.compareTo(date1) : date1.compareTo(date2);
        }).forEach(entry -> sortedGroupedExpenses.put(entry.getKey(), entry.getValue()));

        return sortedGroupedExpenses;
    }































    private String capitalizeWords(String str) {
        String[] words = str.split(" ");
        StringBuilder capitalizedString = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                capitalizedString.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1).toLowerCase()).append(" ");
            }
        }

        return capitalizedString.toString().trim();
    }


    private List<String> getUniqueExpenseNames(List<String> expenseNames) {
        return expenseNames.stream().map(String::toLowerCase).distinct().collect(Collectors.toList());
    }
}
