package com.jaya.service.expenses.impl;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseSearchDTO;
import com.jaya.common.dto.UserDTO;
import com.jaya.mapper.ExpenseMapper;
import com.jaya.models.*;
import com.jaya.repository.ExpenseReportRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.BudgetServices;
import com.jaya.service.CategoryServiceWrapper;
import com.jaya.service.PaymentMethodServices;
import com.jaya.service.expenses.ExpenseQueryService;
import com.jaya.util.ServiceHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class ExpenseQueryServiceImpl implements ExpenseQueryService {

    public static final String OTHERS = "Others";
    private static final String CREDIT_NEED_TO_PAID = "creditNeedToPaid";
    private static final String CREDIT_PAID = "creditPaid";
    private static final String CASH = "cash";
    private static final String MONTH = "month";
    private static final String YEAR = "year";
    private static final String WEEK = "week";

    private final ExpenseRepository expenseRepository;
    private final ExpenseReportRepository expenseReportRepository;

    
    private final ExecutorService executorService = Executors.newFixedThreadPool(
            Runtime.getRuntime().availableProcessors() * 2);

    @Autowired
    private BudgetServices budgetService;
    @Autowired
    private CategoryServiceWrapper categoryService;

    @Autowired
    private PaymentMethodServices paymentMethodService;

    @Autowired
    private ExpenseMapper expenseMapper;

    @Autowired
    private ServiceHelper helper;

    public ExpenseQueryServiceImpl(ExpenseRepository expenseRepository,
            ExpenseReportRepository expenseReportRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseReportRepository = expenseReportRepository;
    }

    @Override
    public List<Expense> getExpensesByDate(LocalDate date, Integer userId) {
        return expenseRepository.findByUserIdAndDate(userId, date);
    }

    @Override
    public List<Expense> getExpensesByDateString(String dateString, Integer userId) throws Exception {
        LocalDate specificDate;
        try {
            specificDate = LocalDate.parse(dateString);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Please use yyyy-MM-dd format.");
        }

        return getExpensesByDate(specificDate, userId);
    }

    @Override
    public List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to, Integer userId) {
        return expenseRepository.findByUserIdAndDateBetween(userId, from, to);
    }

    @Override
    public List<Expense> getExpensesForToday(Integer userId) {
        LocalDate today = LocalDate.now();
        return expenseRepository.findByUserIdAndDate(userId, today);
    }

    @Override
    public List<Expense> getExpensesForCurrentMonth(Integer userId) {
        LocalDate today = LocalDate.now();

        LocalDate firstDayOfCurrentMonth = today.withDayOfMonth(1);

        LocalDate lastDayOfCurrentMonth = today.withDayOfMonth(today.lengthOfMonth());

        return expenseRepository.findByUserIdAndDateBetween(userId, firstDayOfCurrentMonth, lastDayOfCurrentMonth);
    }

    @Override
    public List<Expense> getExpensesForLastMonth(Integer userId) {

        LocalDate today = LocalDate.now();

        LocalDate firstDayOfLastMonth = today.withDayOfMonth(1).minusMonths(1);

        LocalDate lastDayOfLastMonth = firstDayOfLastMonth.withDayOfMonth(firstDayOfLastMonth.lengthOfMonth());

        return expenseRepository.findByUserIdAndDateBetween(userId, firstDayOfLastMonth, lastDayOfLastMonth);
    }

    @Override
    public List<Expense> getExpensesByCurrentWeek(Integer userId) {
        LocalDate startDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endDate = startDate.plusDays(6);
        return expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    @Override
    public List<Expense> getExpensesByLastWeek(Integer userId) {
        LocalDate endDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).minusDays(1);
        LocalDate startDate = endDate.minusDays(6);
        return expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    @Override
    public List<Expense> getExpensesByMonthAndYear(int month, int year, Integer userId) {
        return expenseRepository.findByUserAndMonthAndYear(userId, month, year);
    }

    @Override
    public List<Expense> getExpensesByMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return expenseRepository.findByDateBetween(startDate, endDate);
    }

    @Override
    public List<Expense> searchExpensesByName(String expenseName, Integer userId) {
        return expenseRepository.searchExpensesByUserAndName(userId, expenseName);
    }

    @Override
    public List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate, String type,
            String paymentMethod, Double minAmount, Double maxAmount, Integer userId) {
        return expenseRepository.filterExpensesByUser(userId, expenseName, startDate, endDate, type, paymentMethod,
                minAmount, maxAmount);
    }

    @Override
    public List<Expense> getExpensesByType(String type, Integer userId) {
        return expenseRepository.findExpensesWithGainTypeByUser(userId);
    }

    @Override
    public List<Expense> getExpensesByPaymentMethod(String paymentMethod, Integer userId) {
        return expenseRepository.findByUserAndPaymentMethod(userId, paymentMethod);
    }

    @Override
    public List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod, Integer userId) {
        return expenseRepository.findByUserAndTypeAndPaymentMethod(userId, type, paymentMethod);
    }

    @Override
    public List<Expense> getLossExpenses(Integer userId) {
        return expenseRepository.findByLossTypeAndUser(userId);
    }

    @Override
    public List<Expense> getTopNExpenses(int n, Integer userId) {
        Pageable pageable = PageRequest.of(0, n);
        Page<Expense> topExpensesPage = expenseRepository.findTopNExpensesByUserAndAmount(userId, pageable);
        return topExpensesPage.getContent();
    }

    @Override
    public List<Expense> getTopGains(Integer userId) {
        Pageable pageable = PageRequest.of(0, 10);
        return expenseRepository.findTop10GainsByUser(userId, pageable);
    }

    @Override
    public List<Expense> getTopLosses(Integer userId) {
        Pageable pageable = PageRequest.of(0, 10);
        return expenseRepository.findTop10LossesByUser(userId, pageable);
    }

    @Override
    public List<ExpenseDetails> getExpenseDetailsByAmount(double amount, Integer userId) {
        return expenseRepository.findByUserAndAmount(userId, amount);
    }

    @Override
    public List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount, Integer userId) {
        return expenseRepository.findExpensesByUserAndAmountRange(userId, minAmount, maxAmount);
    }

    @Override
    public List<ExpenseDetails> getExpensesByName(String expenseName, Integer userId) {
        return expenseRepository.findExpensesByUserAndName(userId, expenseName.trim());
    }

    @Override
    public Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date) {

        
        Pageable pageable = PageRequest.of(0, 50);
        List<Expense> expensesBeforeDate = expenseRepository.findByUserAndExpenseNameBeforeDate(userId, expenseName,
                date, pageable);

        
        if (expensesBeforeDate == null || expensesBeforeDate.isEmpty()) {
            return null;
        }

        Expense result = expensesBeforeDate.get(0);

        
        
        CompletableFuture<Map<String, Object>> categoryStatsFuture = CompletableFuture.supplyAsync(
                () -> computeFieldFrequency(expensesBeforeDate, "category"),
                executorService);

        CompletableFuture<Map<String, Object>> typeStatsFuture = CompletableFuture.supplyAsync(
                () -> computeFieldFrequency(expensesBeforeDate, "type"),
                executorService);

        CompletableFuture<Map<String, Object>> paymentStatsFuture = CompletableFuture.supplyAsync(
                () -> computeFieldFrequency(expensesBeforeDate, "paymentmethod"),
                executorService);

        CompletableFuture<String> commentSuggestionFuture = CompletableFuture.supplyAsync(
                () -> findMostCommonCommentPrefix(expensesBeforeDate, date),
                executorService);

        
        CompletableFuture.allOf(categoryStatsFuture, typeStatsFuture, paymentStatsFuture, commentSuggestionFuture)
                .join();

        
        Map<String, Object> stats = categoryStatsFuture.join();
        Map<String, Object> typeStats = typeStatsFuture.join();
        Map<String, Object> paymentStats = paymentStatsFuture.join();
        String suggestedComment = commentSuggestionFuture.join();

        String topCategory = (String) stats.get("mostUsed");
        Integer topCategoryId = (Integer) stats.get("mostUsedId");
        String topType = (String) typeStats.get("mostUsed");
        String topPaymentMethod = (String) paymentStats.get("mostUsed");

        
        result.setCategoryName(topCategory);
        result.setCategoryId(topCategoryId);
        if (result.getExpense() != null) {
            result.getExpense().setType(topType);
            result.getExpense().setPaymentMethod(topPaymentMethod);

            
            if (suggestedComment != null && !suggestedComment.isEmpty()) {
                result.getExpense().setComments(suggestedComment);
            }
        }

        return result;
    }

    


















    private String findMostCommonCommentPrefix(List<Expense> expenses, LocalDate expenseDate) {
        if (expenses == null || expenses.isEmpty()) {
            return null;
        }

        
        List<String> comments = expenses.parallelStream()
                .filter(e -> e.getExpense() != null && e.getExpense().getComments() != null)
                .map(e -> e.getExpense().getComments().trim())
                .filter(c -> !c.isEmpty())
                .collect(Collectors.toList());

        if (comments.isEmpty()) {
            return null;
        }

        
        if (comments.size() == 1) {
            return comments.get(0);
        }

        
        String monthBasedSuggestion = detectMonthBasedPatternWithOffset(expenses, expenseDate);
        if (monthBasedSuggestion != null && !monthBasedSuggestion.isEmpty()) {
            return monthBasedSuggestion;
        }

        
        return findPrefixBasedPattern(comments);
    }

    
















    private String detectMonthBasedPattern(List<String> comments, LocalDate expenseDate) {
        if (comments == null || comments.size() < 2 || expenseDate == null) {
            return null;
        }

        
        
        Map<String, TemplateInfoWithOffset> templateFrequency = new HashMap<>();

        
        
        
        

        for (String comment : comments) {
            
            String template = replaceMonthsWithPlaceholder(comment);

            
            if (!template.equals(comment) && template.contains("{MONTH}")) {
                TemplateInfoWithOffset info = templateFrequency.get(template.toLowerCase());
                if (info == null) {
                    templateFrequency.put(template.toLowerCase(), new TemplateInfoWithOffset(template, 1));
                } else {
                    info.incrementCount();
                }
            }
        }

        if (templateFrequency.isEmpty()) {
            return null;
        }

        
        int minFrequencyThreshold = Math.max(2, comments.size() / 3);

        TemplateInfoWithOffset bestTemplate = templateFrequency.values().stream()
                .filter(info -> info.count >= minFrequencyThreshold)
                .max(Comparator.comparingInt((TemplateInfoWithOffset info) -> info.count)
                        .thenComparingInt(info -> info.template.length()))
                .orElse(null);

        if (bestTemplate == null) {
            return null;
        }

        
        String currentMonthName = expenseDate.getMonth().toString();
        
        currentMonthName = currentMonthName.charAt(0) + currentMonthName.substring(1).toLowerCase();

        
        return bestTemplate.template.replace("{MONTH}", currentMonthName);
    }

    









    private String detectMonthBasedPatternWithOffset(List<Expense> expenses, LocalDate expenseDate) {
        if (expenses == null || expenses.size() < 2 || expenseDate == null) {
            return null;
        }

        
        Map<String, TemplateInfoWithOffset> templateFrequency = new HashMap<>();

        for (Expense expense : expenses) {
            if (expense.getExpense() == null || expense.getExpense().getComments() == null) {
                continue;
            }

            String comment = expense.getExpense().getComments().trim();
            if (comment.isEmpty()) {
                continue;
            }

            LocalDate expenseEntryDate = expense.getDate();
            if (expenseEntryDate == null) {
                continue;
            }

            
            String template = replaceMonthsWithPlaceholder(comment);

            
            template = replaceVariablePartsWithPlaceholders(template);

            String extractedMonth = extractMonthFromComment(comment);

            
            if (!template.equals(comment) &&
                    (template.contains("{MONTH}") || template.contains("{LOCATION}") ||
                            template.contains("{APP}") || template.contains("{ITEM}") ||
                            template.contains("{PERSON}"))) {

                String templateKey = template.toLowerCase();
                TemplateInfoWithOffset info = templateFrequency.get(templateKey);

                if (info == null) {
                    info = new TemplateInfoWithOffset(template, 0);
                    templateFrequency.put(templateKey, info);
                }

                info.incrementCount();

                
                if (extractedMonth != null && template.contains("{MONTH}")) {
                    int mentionedMonthValue = getMonthNumber(extractedMonth);
                    int entryMonthValue = expenseEntryDate.getMonthValue();

                    
                    int monthOffset = mentionedMonthValue - entryMonthValue;
                    if (monthOffset < -6) {
                        monthOffset += 12; 
                    } else if (monthOffset > 6) {
                        monthOffset -= 12; 
                    }

                    info.addMonthOffset(monthOffset);
                }

                
                info.addOriginalComment(comment);
            }
        }

        if (templateFrequency.isEmpty()) {
            return null;
        }

        
        int minFrequencyThreshold = Math.max(2, expenses.size() / 3);

        TemplateInfoWithOffset bestTemplate = templateFrequency.values().stream()
                .filter(info -> info.count >= minFrequencyThreshold)
                .max(Comparator.comparingInt((TemplateInfoWithOffset info) -> info.count)
                        .thenComparingInt(info -> info.template.length()))
                .orElse(null);

        if (bestTemplate == null) {
            return null;
        }

        
        String suggestion = bestTemplate.template;

        
        if (suggestion.contains("{MONTH}")) {
            int avgMonthOffset = bestTemplate.getAverageMonthOffset();
            LocalDate targetDate = expenseDate.plusMonths(avgMonthOffset);
            String targetMonthName = targetDate.getMonth().toString();
            targetMonthName = targetMonthName.charAt(0) + targetMonthName.substring(1).toLowerCase();
            suggestion = suggestion.replace("{MONTH}", targetMonthName);
        }

        
        if (suggestion.contains("{LOCATION}")) {
            String commonLocation = bestTemplate.getMostCommonValueForPlaceholder("location");
            if (commonLocation != null) {
                suggestion = suggestion.replace("{LOCATION}", commonLocation);
            }
        }

        
        if (suggestion.contains("{APP}")) {
            String commonApp = bestTemplate.getMostCommonValueForPlaceholder("app");
            if (commonApp != null) {
                suggestion = suggestion.replace("{APP}", commonApp);
            }
        }

        
        if (suggestion.contains("{ITEM}")) {
            String commonItem = bestTemplate.getMostCommonValueForPlaceholder("item");
            if (commonItem != null) {
                suggestion = suggestion.replace("{ITEM}", commonItem);
            }
        }

        
        if (suggestion.contains("{PERSON}")) {
            String commonPerson = bestTemplate.getMostCommonValueForPlaceholder("person");
            if (commonPerson != null) {
                suggestion = suggestion.replace("{PERSON}", commonPerson);
            }
        }

        return suggestion;
    }

    





    private String extractMonthFromComment(String comment) {
        if (comment == null || comment.isEmpty()) {
            return null;
        }

        String[] months = {
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
        };

        for (String month : months) {
            if (comment.matches("(?i).*\\b" + month + "\\b.*")) {
                return month;
            }
        }

        return null;
    }

    





    private int getMonthNumber(String monthName) {
        if (monthName == null) {
            return 0;
        }

        String[] months = {
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
        };

        for (int i = 0; i < months.length; i++) {
            if (months[i].equalsIgnoreCase(monthName)) {
                return i + 1;
            }
        }

        return 0;
    }

    






    private String replaceMonthsWithPlaceholder(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }

        
        String[] months = {
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
        };

        String result = text;
        for (String month : months) {
            
            result = result.replaceAll("(?i)\\b" + month + "\\b", "{MONTH}");
        }

        return result;
    }

    






    private String replaceVariablePartsWithPlaceholders(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }

        String result = text;

        
        String[] locations = {
                "Seasons Mall", "seasons mall", "Avenue Mall", "avenue mall",
                "Dmart", "dmart", "DMart", "Movie Theatre", "movie theatre",
                "railway station", "Railway Station", "Pune Station", "pune station",
                "Hotel", "hotel", "pg", "PG"
        };
        for (String location : locations) {
            result = result.replaceAll("(?i)\\b" + location + "\\b", "{LOCATION}");
        }

        
        String[] apps = {
                "KIWI", "Kiwi", "kiwi", "CRED", "Cred", "cred",
                "Google Pay", "google pay", "Super Money", "super money",
                "Jupiter", "jupiter"
        };
        for (String app : apps) {
            result = result.replaceAll("(?i)\\b" + app + "\\b", "{APP}");
        }

        
        String[] items = {
                "Bread Jam", "bread jam", "Bread-Jam", "bread-jam",
                "Dry Fruits", "dry fruits", "Dry fruits",
                "Bread and Jam", "bread and jam"
        };
        for (String item : items) {
            result = result.replaceAll("(?i)" + item, "{ITEM}");
        }

        
        String[] people = { "Mother", "mother", "Daddy", "daddy" };
        for (String person : people) {
            result = result.replaceAll("(?i)\\b" + person + "\\b", "{PERSON}");
        }

        return result;
    }

    






    private String findPrefixBasedPattern(List<String> comments) {
        
        Map<String, PrefixInfo> prefixFrequency = new HashMap<>();

        
        for (String comment : comments) {
            String[] words = comment.split("\\s+");
            StringBuilder prefix = new StringBuilder();

            
            for (int i = 0; i < words.length; i++) {
                if (i > 0) {
                    prefix.append(" ");
                }
                prefix.append(words[i]);

                
                if (i >= 1) {
                    String currentPrefix = prefix.toString();
                    String normalizedKey = currentPrefix.toLowerCase();

                    PrefixInfo info = prefixFrequency.get(normalizedKey);
                    if (info == null) {
                        prefixFrequency.put(normalizedKey, new PrefixInfo(currentPrefix, 1));
                    } else {
                        info.incrementCount();
                    }
                }
            }
        }

        
        if (prefixFrequency.isEmpty()) {
            for (String comment : comments) {
                String[] words = comment.split("\\s+");
                if (words.length > 0) {
                    String word = words[0];
                    String normalizedKey = word.toLowerCase();

                    PrefixInfo info = prefixFrequency.get(normalizedKey);
                    if (info == null) {
                        prefixFrequency.put(normalizedKey, new PrefixInfo(word, 1));
                    } else {
                        info.incrementCount();
                    }
                }
            }
        }

        if (prefixFrequency.isEmpty()) {
            return null;
        }

        
        
        
        
        int minFrequencyThreshold = Math.max(2, comments.size() / 3);

        return prefixFrequency.values().stream()
                .filter(info -> info.count >= minFrequencyThreshold)
                .max(Comparator
                        .comparingInt((PrefixInfo info) -> info.count)
                        .thenComparingInt(info -> info.originalPrefix.length()))
                .map(info -> info.originalPrefix)
                .orElse(null);
    }

    


    private static class TemplateInfo {
        String template;
        int count;

        TemplateInfo(String template, int count) {
            this.template = template;
            this.count = count;
        }

        void incrementCount() {
            this.count++;
        }
    }

    






    private static class TemplateInfoWithOffset {
        String template;
        int count;
        List<Integer> monthOffsets; 
        List<String> originalComments; 

        TemplateInfoWithOffset(String template, int count) {
            this.template = template;
            this.count = count;
            this.monthOffsets = new ArrayList<>();
            this.originalComments = new ArrayList<>();
        }

        void incrementCount() {
            this.count++;
        }

        void addMonthOffset(int offset) {
            this.monthOffsets.add(offset);
        }

        void addOriginalComment(String comment) {
            if (comment != null && !comment.isEmpty()) {
                this.originalComments.add(comment);
            }
        }

        






        int getAverageMonthOffset() {
            if (monthOffsets.isEmpty()) {
                return 0; 
            }

            
            double sum = 0;
            for (int offset : monthOffsets) {
                sum += offset;
            }
            double average = sum / monthOffsets.size();

            
            return (int) Math.round(average);
        }

        








        String getMostCommonValueForPlaceholder(String placeholderType) {
            if (originalComments.isEmpty()) {
                return null;
            }

            Map<String, Integer> valueFrequency = new HashMap<>();

            for (String comment : originalComments) {
                List<String> values = extractValuesForPlaceholder(comment, placeholderType);
                for (String value : values) {
                    valueFrequency.put(value, valueFrequency.getOrDefault(value, 0) + 1);
                }
            }

            
            return valueFrequency.entrySet().stream()
                    .max(Comparator.comparingInt(Map.Entry::getValue))
                    .map(Map.Entry::getKey)
                    .orElse(null);
        }

        


        private List<String> extractValuesForPlaceholder(String comment, String placeholderType) {
            List<String> values = new ArrayList<>();

            if (comment == null || comment.isEmpty()) {
                return values;
            }

            switch (placeholderType.toLowerCase()) {
                case "location":
                    String[] locations = {
                            "Seasons Mall", "seasons mall", "Avenue Mall", "avenue mall",
                            "Dmart", "dmart", "DMart", "Movie Theatre", "movie theatre",
                            "railway station", "Railway Station", "Pune Station", "pune station",
                            "Hotel", "hotel", "pg", "PG"
                    };
                    for (String loc : locations) {
                        if (comment.matches("(?i).*\\b" + loc + "\\b.*")) {
                            values.add(loc);
                        }
                    }
                    break;

                case "app":
                    String[] apps = {
                            "KIWI", "Kiwi", "kiwi", "CRED", "Cred", "cred",
                            "Google Pay", "google pay", "Super Money", "super money",
                            "Jupiter", "jupiter"
                    };
                    for (String app : apps) {
                        if (comment.matches("(?i).*\\b" + app + "\\b.*")) {
                            values.add(app);
                        }
                    }
                    break;

                case "item":
                    String[] items = {
                            "Bread Jam", "bread jam", "Bread-Jam", "bread-jam",
                            "Dry Fruits", "dry fruits", "Dry fruits",
                            "Bread and Jam", "bread and jam"
                    };
                    for (String item : items) {
                        if (comment.matches("(?i).*" + item + ".*")) {
                            values.add(item);
                        }
                    }
                    break;

                case "person":
                    String[] people = { "Mother", "mother", "Daddy", "daddy" };
                    for (String person : people) {
                        if (comment.matches("(?i).*\\b" + person + "\\b.*")) {
                            values.add(person);
                        }
                    }
                    break;
            }

            return values;
        }
    }

    


    private static class PrefixInfo {
        String originalPrefix;
        int count;

        PrefixInfo(String originalPrefix, int count) {
            this.originalPrefix = originalPrefix;
            this.count = count;
        }

        void incrementCount() {
            this.count++;
        }
    }

    @Override
    public Map<String, Object> computeFieldFrequency(List<Expense> expenses, String fieldName) {
        Map<String, Object> result = new HashMap<>();
        if (expenses == null || expenses.isEmpty()) {
            result.put("counts", Collections.emptyMap());
            result.put("mostUsed", null);
            result.put("mostUsedCount", 0L);
            result.put("mostUsedId", null);
            result.put("valueIds", Collections.emptyMap());
            result.put("total", 0);
            return result;
        }
        if (fieldName == null || fieldName.trim().isEmpty()) {
            result.put("error", "fieldName cannot be empty");
            return result;
        }

        String normalized = fieldName.trim().toLowerCase();

        
        Map<String, Long> counts = new HashMap<>();
        Map<String, Integer> valueIds = new HashMap<>();

        
        expenses.parallelStream()
                .filter(e -> e != null)
                .forEach(e -> {
                    String value = extractFieldValue(e, normalized);
                    Integer id = null;

                    if ("category".equals(normalized) || "categoryid".equals(normalized)) {
                        if (e.getCategoryId() != null) {
                            id = e.getCategoryId();
                        }
                    } else if ("paymentmethod".equals(normalized)) {
                        if (e.getExpense() != null && e.getExpense().getPaymentMethod() != null) {
                            try {
                                PaymentMethod pm = paymentMethodService.getByNameWithService(e.getUserId(),
                                        e.getExpense().getPaymentMethod());
                                if (pm != null)
                                    id = pm.getId();
                            } catch (Exception ignored) {
                            }
                        }
                    }

                    if (value == null || value.isEmpty()) {
                        value = "Unknown";
                    }

                    
                    synchronized (counts) {
                        counts.merge(value, 1L, Long::sum);
                    }

                    if (id != null) {
                        synchronized (valueIds) {
                            valueIds.putIfAbsent(value, id);
                        }
                    }
                });

        LinkedHashMap<String, Long> sorted = counts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .collect(LinkedHashMap::new, (m, e) -> m.put(e.getKey(), e.getValue()), LinkedHashMap::putAll);

        String mostUsed = sorted.isEmpty() ? null : sorted.keySet().iterator().next();
        Long mostUsedCount = sorted.isEmpty() ? 0L : sorted.values().iterator().next();
        Integer mostUsedId = mostUsed != null ? valueIds.get(mostUsed) : null;

        result.put("counts", sorted);
        result.put("mostUsed", mostUsed);
        result.put("mostUsedCount", mostUsedCount);
        result.put("mostUsedId", mostUsedId);
        result.put("valueIds", valueIds);
        result.put("total", expenses.size());
        result.put("field", normalized);

        return result;
    }

    public String getMostFrequentValue(List<Expense> expenses, String fieldName) {
        Map<String, Object> freq = computeFieldFrequency(expenses, fieldName);
        return (String) freq.get("mostUsed");
    }

    private String extractFieldValue(Expense e, String field) {
        switch (field) {
            case "expensename":
                return e.getExpense() != null ? safeLower(e.getExpense().getExpenseName()) : null;
            case "type":
                return e.getExpense() != null ? safeLower(e.getExpense().getType()) : null;
            case "paymentmethod":
                return e.getExpense() != null ? safeLower(e.getExpense().getPaymentMethod()) : null;
            case "category":
                
                if (e.getCategoryName() != null)
                    return e.getCategoryName();
                if (e.getCategoryId() != null) {
                    try {
                        Category c = categoryService.getById(e.getCategoryId(), e.getUserId());
                        if (c != null)
                            return c.getName();
                    } catch (Exception ignored) {
                    }
                }
                return null;
            case "categoryid":
                return e.getCategoryId() != null ? String.valueOf(e.getCategoryId()) : null;
            default:
                return null;
        }
    }

    private String safeLower(String v) {
        return v == null ? null : v.trim();
    }

    @Override
    public List<Expense> getExpensesWithinRange(Integer userId, LocalDate startDate, LocalDate endDate,
            String flowType) {

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        if (flowType != null && !flowType.isEmpty()) {
            return expenses.stream().filter(expense -> {
                String type = expense.getExpense().getType();
                if ("inflow".equalsIgnoreCase(flowType)) {
                    return "gain".equalsIgnoreCase(type) || "income".equalsIgnoreCase(type);
                } else if ("outflow".equalsIgnoreCase(flowType)) {
                    return "loss".equalsIgnoreCase(type) || "expense".equalsIgnoreCase(type);
                }
                return true;
            }).collect(Collectors.toList());
        }

        return expenses;
    }

    @Override
    public List<Expense> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to,
            Integer userId) {
        return expenseRepository.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(userId, from, to);
    }

    @Override
    public List<Expense> getExpensesInBudgetRangeWithIncludeFlag(LocalDate startDate, LocalDate endDate,
            Integer budgetId, Integer userId) throws Exception {

        Budget optionalBudget = budgetService.getBudgetById(budgetId, userId);
        if (optionalBudget == null) {
            throw new RuntimeException("Budget not found for UserDTO with ID: " + budgetId);
        }

        Budget budget = optionalBudget;

        LocalDate effectiveStartDate = (startDate != null) ? startDate : budget.getStartDate();
        LocalDate effectiveEndDate = (endDate != null) ? endDate : budget.getEndDate();

        List<Expense> expensesInRange = expenseRepository.findByUserIdAndDateBetween(userId, effectiveStartDate,
                effectiveEndDate);

        for (Expense expense : expensesInRange) {
            boolean isIncluded = expense.getBudgetIds() != null && expense.getBudgetIds().contains(budgetId);
            expense.setIncludeInBudget(isIncluded);
        }

        return expensesInRange;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByCategories(Integer userId, String rangeType, int offset,
            String flowType) throws Exception {

        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (rangeType.toLowerCase()) {
            case WEEK:
                startDate = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                endDate = now.with(DayOfWeek.SUNDAY).plusWeeks(offset);
                break;
            case MONTH:
                startDate = now.withDayOfMonth(1).plusMonths(offset);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                break;
            case YEAR:
                startDate = LocalDate.of(now.getYear(), 1, 1).plusYears(offset);
                endDate = LocalDate.of(now.getYear(), 12, 31).plusYears(offset);
                break;
            case "custom":
                startDate = now.minusDays(30); 
                endDate = now;
                break;
            default:
                throw new IllegalArgumentException("Invalid rangeType. Valid options are: week, month, year, custom");
        }

        List<Category> userCategories = categoryService.getAllForUser(userId);

        
        List<PaymentMethod> allPaymentMethods = paymentMethodService.getAllPaymentMethods(userId);
        Map<Integer, Category> categoryMap = userCategories.stream()
                .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));
        Map<String, PaymentMethod> paymentMethodMap = allPaymentMethods.stream()
                .filter(pm -> pm.getName() != null)
                .collect(Collectors.toMap(PaymentMethod::getName, pm -> pm, (a, b) -> a));

        List<Expense> filteredExpenses = getExpensesWithinRange(userId, startDate, endDate, flowType);

        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();

        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }

        for (Expense expense : filteredExpenses) {
            for (Category category : userCategories) {
                
                
                
                if (category.getExpenseIds() != null) {
                    Set<Integer> userExpenseIds = category.getExpenseIds().get(userId);
                    if (userExpenseIds != null && userExpenseIds.contains(expense.getId())) {
                        categoryExpensesMap.get(category).add(expense);
                    }
                }
            }
        }

        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        Map<String, Object> response = new HashMap<>();

        int totalCategories = categoryExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> categoryTotals = new HashMap<>();

        for (Map.Entry<Category, List<Expense>> entry : categoryExpensesMap.entrySet()) {
            Category category = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();

            double categoryTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    categoryTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            categoryTotals.put(category.getName(), categoryTotal);

            Map<String, Object> categoryDetails = buildCategoryDetailsMap(category, expenses, categoryTotal,
                    categoryMap, paymentMethodMap);

            response.put(category.getName(), categoryDetails);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCategories", totalCategories);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("categoryTotals", categoryTotals);
        summary.put("dateRange", Map.of("startDate", startDate, "endDate", endDate, "rangeType", rangeType, "offset",
                offset, "flowType", flowType != null ? flowType : "all"));

        response.put("summary", summary);

        return response;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate,
            String flowType) throws Exception {

        List<Category> userCategories = categoryService.getAllForUser(userId);

        
        List<PaymentMethod> allPaymentMethods = paymentMethodService.getAllPaymentMethods(userId);
        Map<Integer, Category> categoryMap = userCategories.stream()
                .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));
        Map<String, PaymentMethod> paymentMethodMap = allPaymentMethods.stream()
                .filter(pm -> pm.getName() != null)
                .collect(Collectors.toMap(PaymentMethod::getName, pm -> pm, (a, b) -> a));

        List<Expense> filteredExpenses = getExpensesWithinRange(userId, fromDate, toDate, flowType);

        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();

        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }

        for (Expense expense : filteredExpenses) {
            if (flowType != null && !flowType.isEmpty()) {
                String expenseType = expense.getExpense().getType();

                if (flowType.equalsIgnoreCase("inflow") && !expenseType.equalsIgnoreCase("gain")) {
                    continue;
                } else if (flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase("loss")) {
                    continue;
                } else if (!flowType.equalsIgnoreCase("inflow") && !flowType.equalsIgnoreCase("outflow")
                        && !expenseType.equalsIgnoreCase(flowType)) {
                    continue;
                }
            }

            for (Category category : userCategories) {
                
                
                
                if (category.getExpenseIds() != null) {
                    Set<Integer> userExpenseIds = category.getExpenseIds().get(userId);
                    if (userExpenseIds != null && userExpenseIds.contains(expense.getId())) {
                        categoryExpensesMap.get(category).add(expense);
                    }
                }
            }
        }

        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        Map<String, Object> response = new HashMap<>();

        int totalCategories = categoryExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> categoryTotals = new HashMap<>();

        for (Map.Entry<Category, List<Expense>> entry : categoryExpensesMap.entrySet()) {
            Category category = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();

            double categoryTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    categoryTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            categoryTotals.put(category.getName(), categoryTotal);

            Map<String, Object> categoryDetails = buildCategoryDetailsMap(category, expenses, categoryTotal,
                    categoryMap, paymentMethodMap);
            response.put(category.getName(), categoryDetails);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCategories", totalCategories);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("categoryTotals", categoryTotals);

        Map<String, Object> dateRangeInfo = new HashMap<>();
        dateRangeInfo.put("fromDate", fromDate);
        dateRangeInfo.put("toDate", toDate);
        dateRangeInfo.put("flowType", flowType);
        summary.put("dateRange", dateRangeInfo);

        response.put("summary", summary);

        return response;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, LocalDate fromDate, LocalDate toDate,
            String flowType) {

        
        List<Expense> filteredExpenses = getExpensesWithinRange(userId, fromDate, toDate, flowType);

        
        
        Map<Integer, Category> categoryMap = Map.of();
        Map<String, PaymentMethod> paymentMethodMap = Map.of();
        try {
            List<Category> categories = categoryService.getAllForUser(userId);
            if (categories != null) {
                categoryMap = categories.stream()
                        .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));
            }
            List<PaymentMethod> paymentMethods = paymentMethodService.getAllPaymentMethods(userId);
            if (paymentMethods != null) {
                paymentMethodMap = paymentMethods.stream()
                        .filter(pm -> pm.getName() != null)
                        .collect(Collectors.toMap(PaymentMethod::getName, pm -> pm, (a, b) -> a));
            }
        } catch (Exception e) {
            
        }
        final Map<Integer, Category> finalCategoryMap = categoryMap;
        final Map<String, PaymentMethod> finalPaymentMethodMap = paymentMethodMap;

        
        Map<String, List<Expense>> paymentMethodExpensesMap = new HashMap<>();
        for (Expense expense : filteredExpenses) {
            if (flowType != null && !flowType.isEmpty()) {
                String expenseType = expense.getExpense().getType();
                if (flowType.equalsIgnoreCase("inflow") && !expenseType.equalsIgnoreCase("gain")) {
                    continue;
                } else if (flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase("loss")) {
                    continue;
                } else if (!flowType.equalsIgnoreCase("inflow") && !flowType.equalsIgnoreCase("outflow")
                        && !expenseType.equalsIgnoreCase(flowType)) {
                    continue;
                }
            }
            String paymentMethod = expense.getExpense() != null && expense.getExpense().getPaymentMethod() != null
                    ? expense.getExpense().getPaymentMethod()
                    : "Unknown";
            paymentMethodExpensesMap.computeIfAbsent(paymentMethod, k -> new ArrayList<>()).add(expense);
        }

        
        paymentMethodExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        
        Map<String, Object> response = new HashMap<>();
        int totalPaymentMethods = paymentMethodExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> paymentMethodTotals = new HashMap<>();

        for (Map.Entry<String, List<Expense>> entry : paymentMethodExpensesMap.entrySet()) {
            String paymentMethod = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();

            double methodTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    methodTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            paymentMethodTotals.put(paymentMethod, methodTotal);

            
            PaymentMethod pmEntity = finalPaymentMethodMap.get(paymentMethod);

            Map<String, Object> methodDetails = new HashMap<>();
            methodDetails.put("id", pmEntity != null ? pmEntity.getId() : null);
            methodDetails.put("name", pmEntity != null ? pmEntity.getName() : paymentMethod);
            methodDetails.put("paymentMethod", paymentMethod);
            methodDetails.put("description", pmEntity != null ? pmEntity.getDescription() : "");
            methodDetails.put("isGlobal", pmEntity != null && pmEntity.isGlobal());
            methodDetails.put("icon", pmEntity != null ? pmEntity.getIcon() : "");
            methodDetails.put("color", pmEntity != null ? pmEntity.getColor() : "");
            methodDetails.put("editUserIds",
                    pmEntity != null && pmEntity.getEditUserIds() != null ? pmEntity.getEditUserIds()
                            : new ArrayList<>());
            methodDetails.put("userIds",
                    pmEntity != null && pmEntity.getUserIds() != null ? pmEntity.getUserIds() : new ArrayList<>());
            methodDetails.put("expenseCount", expenses.size());
            methodDetails.put("totalAmount", methodTotal);
            methodDetails.put("expenses", formatExpensesForResponse(expenses, finalCategoryMap, finalPaymentMethodMap));

            response.put(paymentMethod, methodDetails);
        }

        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaymentMethods", totalPaymentMethods);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("paymentMethodTotals", paymentMethodTotals);

        
        Map<String, Object> dateRangeInfo = new HashMap<>();
        dateRangeInfo.put("fromDate", fromDate);
        dateRangeInfo.put("toDate", toDate);
        dateRangeInfo.put("flowType", flowType);
        summary.put("dateRange", dateRangeInfo);

        response.put("summary", summary);

        return response;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, String rangeType, int offset,
            String flowType) {
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (rangeType.toLowerCase()) {
            case WEEK:
                startDate = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                endDate = now.with(DayOfWeek.SUNDAY).plusWeeks(offset);
                break;
            case MONTH:
                startDate = now.withDayOfMonth(1).plusMonths(offset);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                break;
            case YEAR:
                startDate = LocalDate.of(now.getYear(), 1, 1).plusYears(offset);
                endDate = LocalDate.of(now.getYear(), 12, 31).plusYears(offset);
                break;
            case "custom":
                startDate = now.minusDays(30);
                endDate = now;
                break;
            default:
                throw new IllegalArgumentException("Invalid rangeType. Valid options are: week, month, year, custom");
        }

        List<Expense> filteredExpenses = getExpensesWithinRange(userId, startDate, endDate, flowType);

        
        
        Map<Integer, Category> categoryMap = Map.of();
        Map<String, PaymentMethod> paymentMethodMap = Map.of();
        try {
            List<Category> categories = categoryService.getAllForUser(userId);
            if (categories != null) {
                categoryMap = categories.stream()
                        .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));
            }
            List<PaymentMethod> paymentMethods = paymentMethodService.getAllPaymentMethods(userId);
            if (paymentMethods != null) {
                paymentMethodMap = paymentMethods.stream()
                        .filter(pm -> pm.getName() != null)
                        .collect(Collectors.toMap(PaymentMethod::getName, pm -> pm, (a, b) -> a));
            }
        } catch (Exception e) {
            
        }
        final Map<Integer, Category> finalCategoryMap = categoryMap;
        final Map<String, PaymentMethod> finalPaymentMethodMap = paymentMethodMap;

        Map<String, List<Expense>> paymentMethodExpensesMap = new HashMap<>();

        for (Expense expense : filteredExpenses) {
            String pmName = (expense.getExpense() != null && expense.getExpense().getPaymentMethod() != null)
                    ? expense.getExpense().getPaymentMethod()
                    : "Unknown";
            paymentMethodExpensesMap.computeIfAbsent(pmName, k -> new ArrayList<>()).add(expense);
        }

        paymentMethodExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());
        Map<String, Object> response = new HashMap<>();

        int totalPaymentMethods = paymentMethodExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> paymentMethodTotals = new HashMap<>();

        for (Map.Entry<String, List<Expense>> entry : paymentMethodExpensesMap.entrySet()) {
            String pmName = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();
            double methodTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    methodTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            paymentMethodTotals.put(pmName, methodTotal);

            
            PaymentMethod pmEntity = finalPaymentMethodMap.get(pmName);
            Map<String, Object> methodDetails = new HashMap<>();
            methodDetails.put("id", pmEntity != null ? pmEntity.getId() : null);
            methodDetails.put("name", pmEntity != null ? pmEntity.getName() : pmName);
            methodDetails.put("description", pmEntity != null ? pmEntity.getDescription() : "");
            methodDetails.put("isGlobal", pmEntity != null && pmEntity.isGlobal());
            methodDetails.put("icon", pmEntity != null ? pmEntity.getIcon() : "");
            methodDetails.put("color", pmEntity != null ? pmEntity.getColor() : "");
            methodDetails.put("editUserIds",
                    pmEntity != null && pmEntity.getEditUserIds() != null ? pmEntity.getEditUserIds()
                            : new ArrayList<>());
            methodDetails.put("userIds",
                    pmEntity != null && pmEntity.getUserIds() != null ? pmEntity.getUserIds() : new ArrayList<>());
            methodDetails.put("expenseCount", expenses.size());
            methodDetails.put("totalAmount", methodTotal);
            methodDetails.put("expenses", formatExpensesForResponse(expenses, finalCategoryMap, finalPaymentMethodMap));

            response.put(pmName, methodDetails);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaymentMethods", totalPaymentMethods);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("paymentMethodTotals", paymentMethodTotals);
        summary.put("dateRange", Map.of("startDate", startDate, "endDate", endDate, "rangeType", rangeType, "offset",
                offset, "flowType", flowType != null ? flowType : "all"));
        response.put("summary", summary);

        return response;
    }

    @Override
    public Map<String, Object> getExpensesGroupedByDateWithValidation(Integer userId, int page, int size, String sortBy,
            String sortOrder) throws Exception {
        
        List<String> validSortFields = Arrays.asList("date", "amount", "expenseName", "paymentMethod");
        if (!validSortFields.contains(sortBy)) {
            throw new IllegalArgumentException("Invalid sort field: " + sortBy);
        }

        
        if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
            throw new IllegalArgumentException("Invalid sort order: " + sortOrder);
        }

        
        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be positive");
        }

        
        Map<String, List<Map<String, Object>>> groupedExpenses = getExpensesGroupedByDateWithPagination(userId,
                sortOrder, page, size, sortBy);

        if (groupedExpenses.isEmpty()) {
            return Collections.emptyMap();
        }

        
        Map<String, Object> response = new HashMap<>();
        response.put("data", groupedExpenses);
        response.put("page", page);
        response.put("size", size);
        response.put("sortBy", sortBy);
        response.put("sortOrder", sortOrder);

        return response;
    }

    private Map<String, Object> buildCategoryDetailsMap(Category category, List<Expense> expenses,
            double categoryTotal) {
        return buildCategoryDetailsMap(category, expenses, categoryTotal, null, null);
    }

    



    private Map<String, Object> buildCategoryDetailsMap(Category category, List<Expense> expenses,
            double categoryTotal, Map<Integer, Category> categoryMap, Map<String, PaymentMethod> paymentMethodMap) {
        Map<String, Object> categoryDetails = new HashMap<>();
        categoryDetails.put("id", category.getId());
        categoryDetails.put("name", category.getName());
        categoryDetails.put("description", category.getDescription());
        categoryDetails.put("isGlobal", category.isGlobal());

        if (category.getColor() != null) {
            categoryDetails.put("color", category.getColor());
        }
        if (category.getIcon() != null) {
            categoryDetails.put("icon", category.getIcon());
        }

        categoryDetails.put("userIds", category.getUserIds());
        categoryDetails.put("editUserIds", category.getEditUserIds());

        categoryDetails.put("expenseIds", category.getExpenseIds());

        categoryDetails.put("expenses", formatExpensesForResponse(expenses, categoryMap, paymentMethodMap));
        categoryDetails.put("totalAmount", categoryTotal);
        categoryDetails.put("expenseCount", expenses.size());

        return categoryDetails;
    }

    private List<ExpenseDTO> formatExpensesForResponse(List<Expense> expenses) {
        return formatExpensesForResponse(expenses, null, null);
    }

    




    private List<ExpenseDTO> formatExpensesForResponse(List<Expense> expenses,
            Map<Integer, Category> categoryMap,
            Map<String, PaymentMethod> paymentMethodMap) {
        if (expenses == null || expenses.isEmpty()) {
            return Collections.emptyList();
        }

        
        if (categoryMap != null || paymentMethodMap != null) {
            return expenses.stream()
                    .map(expense -> expenseMapper.toDTO(expense, categoryMap, paymentMethodMap))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }

        
        return expenses.stream()
                .map(expenseMapper::toDTO)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(Integer userId,
            String sortOrder, int page, int size, String sortBy) throws Exception {
        Sort sort = Sort.by(Sort.Order.by(sortBy).with(Sort.Direction.fromString(sortOrder)));
        UserDTO UserDTO = helper.validateUser(userId);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Expense> expensesPage = expenseRepository.findByUserId(userId, pageable);

        Map<String, List<Map<String, Object>>> groupedExpenses = new LinkedHashMap<>();
        Map<String, Integer> dateIndexMap = new LinkedHashMap<>();

        for (Expense expense : expensesPage.getContent()) {
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

    @Override
    public List<ExpenseSearchDTO> searchExpensesFuzzy(Integer userId, String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        String subsequencePattern = convertToSubsequencePattern(query.trim());
        List<ExpenseSearchDTO> results = expenseRepository.searchExpensesFuzzyWithLimit(userId, subsequencePattern);
        
        
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
