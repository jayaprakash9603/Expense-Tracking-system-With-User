package com.jaya.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jaya.common.dto.UserDTO;
import com.jaya.models.*;
import org.springframework.stereotype.Service;

@Service
public class DailySummaryService {

    private final ExpenseService expenseService;

    public DailySummaryService(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    public List<DailySummary> getDailySummaries(Integer year, Integer month, UserDTO UserDTO) {
        List<DailySummary> dailySummaries = new ArrayList<>();
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<Expense> dailyExpenses = expenseService.getExpensesByDate(date, UserDTO.getId());

            if (dailyExpenses.isEmpty()) {
                continue;
            }

            DailySummary dailySummary = calculateDailySummary(dailyExpenses, date);
            dailySummaries.add(dailySummary);
        }

        return dailySummaries;
    }

    public DailySummary getDailySummaryForDate(LocalDate date, UserDTO UserDTO) {
        List<Expense> dailyExpenses = expenseService.getExpensesByDate(date, UserDTO.getId());

        if (dailyExpenses.isEmpty())
            return null;

        return calculateDailySummary(dailyExpenses, date);
    }

    private DailySummary calculateDailySummary(List<Expense> dailyExpenses, LocalDate date) {
        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;
        BigDecimal creditPaid = BigDecimal.ZERO;
        BigDecimal creditDue = BigDecimal.ZERO;
        BigDecimal currentMonthCreditDue = BigDecimal.ZERO;

        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        CashSummary cashSummary = new CashSummary();
        CreditPaidSummary creditPaidSummary = new CreditPaidSummary();
        CreditDueSummary creditDueSummary = new CreditDueSummary();

        for (Expense expense : dailyExpenses) {
            BigDecimal amount = BigDecimal.valueOf(expense.getExpense().getAmount());
            String category = expense.getExpense().getType();
            String paymentMethod = expense.getExpense().getPaymentMethod();

            if ("gain".equalsIgnoreCase(category) || "income".equalsIgnoreCase(category)) {
                totalGain = totalGain.add(amount);

                if ("cash".equalsIgnoreCase(paymentMethod)) {
                    cashSummary.setGain(cashSummary.getGain().add(amount));
                } else if ("creditNeedToPaid".equalsIgnoreCase(paymentMethod)) {
                    creditDueSummary.setGain(creditDueSummary.getGain().add(amount));
                }
            } else if ("loss".equalsIgnoreCase(category) || "expense".equalsIgnoreCase(category)) {
                BigDecimal negativeAmount = amount.negate();
                totalLoss = totalLoss.add(negativeAmount);

                if ("cash".equalsIgnoreCase(paymentMethod)) {
                    cashSummary.setLoss(cashSummary.getLoss().add(negativeAmount));
                } else if ("creditNeedToPaid".equalsIgnoreCase(paymentMethod)) {
                    creditDueSummary.setLoss(creditDueSummary.getLoss().add(negativeAmount));
                    creditDue = creditDue.add(negativeAmount);

                } else if ("creditPaid".equalsIgnoreCase(paymentMethod)) {
                    creditPaidSummary.setLoss(creditPaidSummary.getLoss().add(amount));
                    creditPaid = creditPaid.add(amount);
                }
            }

            categoryBreakdown.merge(category, amount, BigDecimal::add);
        }

        cashSummary.calculateDifference();
        creditDueSummary.calculateDifference();
        creditPaidSummary.calculateDifference();

        BigDecimal balanceRemaining = totalGain.add(totalLoss);
        String creditDueMessage = "Credit Due is calculated from " +
                date.withDayOfMonth(17).minusMonths(1).format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) +
                " to " + date.withDayOfMonth(16).format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));

        DailySummary dailySummary = new DailySummary();
        dailySummary.setDate(date);
        dailySummary.setTotalAmount(totalGain.add(totalLoss));
        dailySummary.setCategoryBreakdown(categoryBreakdown);
        dailySummary.setBalanceRemaining(balanceRemaining);
        dailySummary.setCurrentMonthCreditDue(currentMonthCreditDue);
        dailySummary.setCash(cashSummary);
        dailySummary.setCreditDueSummary(creditDueSummary);
        dailySummary.setCreditPaidSummary(creditPaidSummary);
        dailySummary.setCreditPaid(creditPaid);
        dailySummary.setCreditDue(creditDue);
        dailySummary.setCreditDueMessage(creditDueMessage);

        return dailySummary;
    }

    public List<DailySummary> getYearlySummaries(Integer year, UserDTO UserDTO) {
        List<DailySummary> yearlySummaries = new ArrayList<>();

        for (Month month : Month.values()) {
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                List<Expense> dailyExpenses = expenseService.getExpensesByDate(date, UserDTO.getId());
                if (dailyExpenses.isEmpty())
                    continue;

                DailySummary dailySummary = calculateDailySummary(dailyExpenses, date);
                yearlySummaries.add(dailySummary);
            }
        }

        return yearlySummaries;
    }
}


