package com.jaya.service;

import com.jaya.dto.PaymentMethodEvent;
import com.jaya.dto.User;
import com.jaya.events.BudgetExpenseEvent;
import com.jaya.events.CategoryExpenseEvent;
import com.jaya.exceptions.UserException;
import com.jaya.kafka.BudgetExpenseKafkaProducerService;
import com.jaya.kafka.CategoryExpenseKafkaProducerService;
import com.jaya.kafka.PaymentMethodKafkaProducerService;
import com.jaya.models.*;
import com.jaya.repository.*;
import com.jaya.util.AuditHelper;
import com.jaya.util.JsonConverter;
import com.jaya.util.ServiceHelper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;

import ch.qos.logback.classic.Logger;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.*;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.Month;


@Service
public class ExpenseServiceImpl implements Serializable, ExpenseService {


    private final ExpenseRepository expenseRepository;
    private final ExpenseReportRepository expenseReportRepository;

    public static final String OTHERS = "Others";
    private static final String CREDIT_NEED_TO_PAID = "creditNeedToPaid";
    private static final String CREDIT_PAID = "creditPaid";
    private static final String CASH = "cash";
    private static final String MONTH = "month";
    private static final String YEAR = "year";
    private static final String WEEK = "week";

    private static final Logger logger = (Logger) LoggerFactory.getLogger(ExpenseServiceImpl.class);


    @Autowired
    private CacheManager cacheManager;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private BudgetServices budgetService;

    @Autowired
    private CategoryExpenseKafkaProducerService categoryExpenseKafkaProducer;

    @Autowired
    private PaymentMethodKafkaProducerService paymentMethodKafkaProducer;

    @Autowired
    private CategoryService categoryService;


    @Autowired
    private ServiceHelper helper;

    @Autowired
    private KafkaProducerService producer;


    @Autowired
    private PaymentMethodServices paymentMethodService;



    @Autowired
    private BudgetExpenseKafkaProducerService budgetExpenseKafkaProducerService;


    @Autowired
    private AuditHelper auditHelper;

    @Autowired
    private JsonConverter jsonConverter;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, ExpenseReportRepository expenseReportRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseReportRepository = expenseReportRepository;
    }


    @Override
    public Expense addExpense(Expense expense, Integer userId) throws Exception {

        User user = helper.validateUser(userId);
        expense.setId(null);
        if (expense.getExpense() != null) {
            expense.getExpense().setId(null);
        }

        validateExpenseData(expense, user);

        expense.setUserId(userId);
        if (expense.getBudgetIds() == null) expense.setBudgetIds(new HashSet<>());

        ExpenseDetails details = expense.getExpense();
        if (details == null) {
            throw new UserException("Expense details must not be null.");
        }
        details.setId(null);
        details.setExpenseName(details.getExpenseName() != null ? details.getExpenseName() : "");
        details.setAmount(details.getAmount());
        details.setType(details.getType() != null ? details.getType() : "");
        details.setPaymentMethod(details.getPaymentMethod() != null ? details.getPaymentMethod() : "");
        details.setNetAmount(details.getType().equals("loss") ? -details.getAmount() : details.getAmount());
        details.setComments(details.getComments() != null ? details.getComments() : "");
        details.setCreditDue(details.getPaymentMethod().equals(CREDIT_NEED_TO_PAID) ? details.getAmount() : 0);

        // Set bi-directional relationship
        details.setExpense(expense);
        expense.setExpense(details);

        Set<Integer> validBudgetIds = validateAndExtractBudgetIds(expense, user);
        expense.setBudgetIds(validBudgetIds);

        handleCategory(expense, user);

        Expense savedExpense = expenseRepository.save(expense);

        handlePaymentMethod(savedExpense, user);

        updateCategoryExpenseIds(savedExpense, userId);


        updateBudgetExpenseLinks(savedExpense, validBudgetIds, user);
        auditHelper.auditAction(user.getId(), expense.getId().toString(), "EXPENSE", "CREATE", savedExpense);
        updateExpenseCache(savedExpense, user.getId());
        return savedExpense;
    }


    private void updateExpenseCache(Expense savedExpense, Integer userId) {
        updateExpenseCache(Collections.singletonList(savedExpense), userId);
    }

    private void updateExpenseCache(List<Expense> savedExpenses, Integer userId) {
        Cache cache = cacheManager.getCache("expenses");
        if (cache == null) {
            logger.warn("Cache 'expenses' not found");
            return;
        }

        if (savedExpenses == null || savedExpenses.isEmpty()) {
            logger.warn("No expenses provided to update cache for user: {}", userId);
            return;
        }

        List<Expense> cachedExpenses = cache.get(userId, List.class);
        if (cachedExpenses == null) {
            cachedExpenses = new ArrayList<>();
        }

        // Add all new expenses to the cached list
        cachedExpenses.addAll(savedExpenses);
        cache.put(userId, cachedExpenses);

        if (savedExpenses.size() == 1) {
            logger.info("Added expense ID {} to cache for user: {}", savedExpenses.get(0).getId(), userId);
        } else {
            List<Integer> expenseIds = savedExpenses.stream().map(Expense::getId).collect(Collectors.toList());
            logger.info("Added {} expenses with IDs {} to cache for user: {}", savedExpenses.size(), expenseIds, userId);
        }
    }



    @Override
    public List<Expense> getExpensesByIds(Integer userId, Set<Integer> expenseIds) throws UserException {

        // Validate expense IDs
        if (expenseIds == null || expenseIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Remove any null values from the set
        Set<Integer> validExpenseIds = expenseIds.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (validExpenseIds.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            // Validate user exists (assuming you have a helper method)
            helper.validateUser(userId);

            // Fetch expenses from repository
            List<Expense> expenses = expenseRepository.findAllByUserIdAndIdIn(userId, validExpenseIds);

            // Log the operation for audit purposes
            if (!expenses.isEmpty()) {
                System.out.println("Retrieved " + expenses.size() + " expenses for user " + userId);
            }

            return expenses;

        } catch (Exception e) {
            throw new UserException("Error retrieving expenses for user " + userId + ": " + e.getMessage());
        }
    }
    @Override
    public Expense copyExpense(Integer userId, Integer expenseId) throws Exception {
        User user = helper.validateUser(userId);
        Expense original = getExpenseById(expenseId, user.getId());
        if (original == null) {
            throw new RuntimeException("Expense not found with ID: " + expenseId);
        }

        // Deep copy the expense
        Expense copy = new Expense();
        copy.setDate(original.getDate());
        copy.setUserId(userId);
        copy.setBudgetIds(original.getBudgetIds() != null ? new HashSet<>(original.getBudgetIds()) : new HashSet<>());
        copy.setCategoryId(original.getCategoryId());

        if (original.getExpense() != null) {
            ExpenseDetails details = new ExpenseDetails();
            details.setExpenseName(original.getExpense().getExpenseName());
            details.setAmount(original.getExpense().getAmount());
            details.setType(original.getExpense().getType());
            details.setPaymentMethod(original.getExpense().getPaymentMethod());
            details.setNetAmount(original.getExpense().getNetAmount());
            details.setComments(original.getExpense().getComments());
            details.setCreditDue(original.getExpense().getCreditDue());
            details.setExpense(copy); // set bi-directional link
            copy.setExpense(details);
        }

        // Save the copied expense only once
        return addExpense(copy, userId);


    }

    @Override
    public Expense save(Expense expense) {
        return expenseRepository.save(expense);
    }

    // Add this helper method to your class
    private List<Expense> getCachedExpenses(Integer userId) {
        Cache cache = cacheManager.getCache("expenses");
        if (cache != null) {
            List<Expense> cachedExpenses = cache.get(userId, List.class);
            if (cachedExpenses != null) {
                logger.info("Retrieved {} expenses from cache for user: {}", cachedExpenses.size(), userId);
                return new ArrayList<>(cachedExpenses);
            }
        }
        logger.info("No cached expenses found for user: {}", userId);
        return null;
    }

    private void cacheExpenses(Integer userId, List<Expense> expenses) {
        Cache cache = cacheManager.getCache("expenses");
        if (cache != null && expenses != null) {
            cache.put(userId, new ArrayList<>(expenses));
            logger.info("Cached {} expenses for user: {}", expenses.size(), userId);
        }
    }

    @Override
    public List<Expense> getExpensesByUserAndSort(Integer userId, String sort) throws UserException {
        System.out.println("Fetching expenses for user: " + userId + " with sort order: " + sort);

        // Try to get from cache first
        List<Expense> expenses = getCachedExpenses(userId);

        if (expenses == null) {
            // If not in cache, fetch from database
            logger.info("Cache miss - fetching from database for user: {}", userId);
            expenses = expenseRepository.findByUserId(userId);

            // Cache the expenses
            cacheExpenses(userId, expenses);
        }

        // Sort based on the requested order
        if (expenses != null) {
            if (sort.equalsIgnoreCase("asc")) {
                expenses.sort(Comparator.comparing(Expense::getDate));
            } else {
                expenses.sort(Comparator.comparing(Expense::getDate).reversed());
            }
        }

        return expenses;
    }


    private void validateExpenseData(Expense expense, User user) throws IllegalArgumentException, UserException {
        if (expense.getDate() == null) throw new IllegalArgumentException("Expense date must not be null.");
        if (expense.getExpense() == null) throw new IllegalArgumentException("Expense details must not be null.");
        ExpenseDetails details = expense.getExpense();
        if (details.getExpenseName() == null || details.getExpenseName().isEmpty())
            throw new IllegalArgumentException("Expense name must not be empty.");
        if (details.getAmount() < 0) throw new IllegalArgumentException("Expense amount cannot be negative.");
        if (details.getPaymentMethod() == null || details.getPaymentMethod().isEmpty())
            throw new IllegalArgumentException("Payment method must not be empty.");
        if (details.getType() == null || details.getType().isEmpty())
            throw new IllegalArgumentException("Expense type must not be empty.");
        if (user == null) throw new UserException("User not found.");
    }

    private Set<Integer> validateAndExtractBudgetIds(Expense expense, User user) throws Exception {
        Set<Integer> validBudgetIds = new HashSet<>();
        for (Integer budgetId : expense.getBudgetIds()) {

            Budget budgetOpt;
            try {
                budgetOpt = budgetService.getBudgetById(budgetId, user.getId());
            } catch (Exception e) {
                continue;
            }

            System.out.println("testing after catch");
            if (budgetOpt != null) {
                Budget budget = budgetOpt;
                LocalDate expenseDate = expense.getDate();
                if (!expenseDate.isBefore(budget.getStartDate()) && !expenseDate.isAfter(budget.getEndDate())) {
                    validBudgetIds.add(budgetId);
                }
            }
        }
        return validBudgetIds;
    }

    private void handleCategory(Expense expense, User user) throws Exception {


        try {
            Category category = categoryService.getById(expense.getCategoryId(), user.getId());
            if (category != null) {
                expense.setCategoryId(category.getId());
                expense.setCategoryName(category.getName());
            }
        } catch (Exception e) {

            try {
                Category category = categoryService.getByName(OTHERS, user.getId()).get(0);
                expense.setCategoryId(category.getId());
                expense.setCategoryName(category.getName());
            } catch (Exception notFound) {
                Category createdCategory = new Category();
                createdCategory.setDescription("Others Description");
                createdCategory.setName(OTHERS);
                Category newCategory = categoryService.create(createdCategory, user.getId());
                expense.setCategoryId(newCategory.getId());
                expense.setCategoryName(newCategory.getName());
            }
        }
    }

    private void handlePaymentMethod(Expense savedExpense, User user) {
        ExpenseDetails details = savedExpense.getExpense();
        String paymentMethodName = details.getPaymentMethod().trim();
        String paymentType = details.getType().equalsIgnoreCase("loss") ? "expense" : "income";

        // Create and send Kafka event instead of direct processing
        PaymentMethodEvent event = new PaymentMethodEvent(user.getId(), savedExpense.getId(), paymentMethodName, paymentType, "Automatically created for expense: " + details.getPaymentMethod(), CASH, getThemeAppropriateColor("salary"), "CREATE");

        paymentMethodKafkaProducer.sendPaymentMethodEvent(event);
        logger.info("Payment method event sent for expense ID: {} and user: {}", savedExpense.getId(), user.getId());
    }

    // Add this method for handling payment method updates
    private void handlePaymentMethodUpdate(Expense existingExpense, ExpenseDetails newDetails, Integer userId) {
        ExpenseDetails existingDetails = existingExpense.getExpense();
        String oldPaymentMethodName = existingDetails.getPaymentMethod();
        String oldPaymentType = (existingDetails.getType() != null && existingDetails.getType().equalsIgnoreCase("loss")) ? "expense" : "income";
        String newPaymentMethodName = newDetails.getPaymentMethod().trim();
        String newPaymentType = (newDetails.getType() != null && newDetails.getType().equalsIgnoreCase("loss")) ? "expense" : "income";

        // Send delete event for old payment method
        if (oldPaymentMethodName != null && !oldPaymentMethodName.trim().isEmpty()) {
            PaymentMethodEvent deleteEvent = new PaymentMethodEvent(userId, existingExpense.getId(), oldPaymentMethodName.trim(), oldPaymentType, "", "", "", "DELETE");
            paymentMethodKafkaProducer.sendPaymentMethodEvent(deleteEvent);
        }

        // Send create event for new payment method
        PaymentMethodEvent createEvent = new PaymentMethodEvent(userId, existingExpense.getId(), newPaymentMethodName, newPaymentType, "Automatically created for expense: " + newDetails.getPaymentMethod(), CASH, getThemeAppropriateColor("salary"), "CREATE");
        paymentMethodKafkaProducer.sendPaymentMethodEvent(createEvent);
    }


    private void updateBudgetExpenseLinks(Expense savedExpense, Set<Integer> validBudgetIds, User user) throws Exception {
        if (!validBudgetIds.isEmpty()) {
            BudgetExpenseEvent budgetEvent = new BudgetExpenseEvent(user.getId(), savedExpense.getId(), validBudgetIds, "ADD");
            budgetExpenseKafkaProducerService.sendBudgetExpenseEvent(budgetEvent);
            logger.info("Budget expense event sent for expense ID: {} with budget IDs: {}", savedExpense.getId(), validBudgetIds);
        }
    }

    private Expense updateExpenseInternal(Expense existingExpense, Expense updatedExpense, Integer userId) throws Exception {
        validateExpenseData(updatedExpense);
        ExpenseDetails newDetails = updatedExpense.getExpense();

        updateCategory(existingExpense, updatedExpense, userId);
        updatePaymentMethod(existingExpense, newDetails, userId);

        ExpenseDetails existingDetails = existingExpense.getExpense();
        existingDetails.setExpenseName(newDetails.getExpenseName());
        existingDetails.setAmount(newDetails.getAmount());
        existingDetails.setType(newDetails.getType());
        existingDetails.setPaymentMethod(newDetails.getPaymentMethod());
        existingDetails.setNetAmount(newDetails.getNetAmount());
        existingDetails.setComments(newDetails.getComments());
        existingDetails.setCreditDue(newDetails.getCreditDue());

        existingExpense.setDate(updatedExpense.getDate());
        existingExpense.setIncludeInBudget(updatedExpense.isIncludeInBudget());

        Set<Integer> validBudgetIds = extractValidBudgetIds(updatedExpense, userId);
        removeOldBudgetLinks(existingExpense, validBudgetIds, userId);
        existingExpense.setBudgetIds(validBudgetIds);
        Expense savedExpense = expenseRepository.save(existingExpense);
        updateCategoryExpenseIds(savedExpense, userId);
        updateBudgetLinks(savedExpense, validBudgetIds, userId);


        return savedExpense;
    }


    @Override
    @Transactional
    public List<Expense> addMultipleExpenses(List<Expense> expenses, Integer userId) throws Exception {
        User user = helper.validateUser(userId);
        if (userId == null) throw new UserException("User not found.");

        int batchSize = 500;
        int count = 0;
        List<Expense> savedExpenses = new ArrayList<>();

        for (Expense expense : expenses) {
            expense.setId(null);
            expense.setUserId(userId);
            if (expense.getExpense() != null) {
                expense.getExpense().setId(null);
                expense.getExpense().setExpense(expense);
            }
            if (expense.getBudgetIds() == null) expense.setBudgetIds(new HashSet<>());
            Set<Integer> validBudgetIds = validateAndExtractBudgetIds(expense, user);
            expense.setBudgetIds(validBudgetIds);
            handleCategory(expense, user);

            entityManager.persist(expense);
            savedExpenses.add(expense);

            if (++count % batchSize == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }
        entityManager.flush();
        entityManager.clear();

        // Now update category, payment method, and budget links with correct expense IDs
        for (Expense savedExpense : savedExpenses) {
            handlePaymentMethod(savedExpense, user);
            updateCategoryExpenseIds(savedExpense, userId); // This will now use the correct ID
            updateBudgetExpenseLinks(savedExpense, savedExpense.getBudgetIds(), user);


            auditHelper.auditAction(user.getId(), savedExpense.getId().toString(), "EXPENSE", "CREATE", savedExpense);
        }


        updateExpenseCache(savedExpenses, userId);

        return savedExpenses;
    }


    @Override
    public Expense getExpenseById(Integer id, Integer userId) {
        return expenseRepository.findByUserIdAndId(userId, id);

    }

    @Override
    public List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to, Integer userId) {
        return expenseRepository.findByUserIdAndDateBetween(userId, from, to);
    }

    @Override
    public List<Expense> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to, Integer userId) {
        return expenseRepository.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(userId, from, to);
    }

    @Override
    public List<Expense> getAllExpenses(Integer userId) {
        logger.info("Fetching from DATABASE for user {}", userId);
        return expenseRepository.findByUserId(userId);
    }

    @Override
    public List<Expense> getAllExpenses(Integer userId, String sortOrder) {
        // Check for "asc" or "desc", default to "desc"
        Sort sort = "asc".equalsIgnoreCase(sortOrder) ? Sort.by(Sort.Order.asc("date")) : Sort.by(Sort.Order.desc("date"));
        return expenseRepository.findByUserId(userId, sort);
    }


    // Java


    @Override
    @Transactional
    public Expense updateExpense(Integer id, Expense updatedExpense, Integer userId) throws Exception {
        Expense existingExpense = expenseRepository.findByUserIdAndId(userId, id);
        if (existingExpense == null) {
            throw new RuntimeException("Expense not found with ID: " + id);
        }
        if (existingExpense.isBill()) {
            throw new RuntimeException("Cannot update a bill expense. Please use the Bill Id for updates.");
        }
        Expense savedExpense = updateExpenseInternal(existingExpense, updatedExpense, userId);

        // Update cache - first remove old expense, then add updated one
        Cache cache = cacheManager.getCache("expenses");
        if (cache != null) {
            // Remove old expense from individual cache
            cache.evict(id);

            // Update user's expense list cache
            List<Expense> cachedExpenses = cache.get(userId, List.class);
            if (cachedExpenses != null) {
                // First, remove the old expense from the cached list
                cachedExpenses.removeIf(expense -> expense.getId().equals(id));

                // Then, add the updated expense to the cached list
                cachedExpenses.add(savedExpense);

                // Update the cache with the modified list
                cache.put(userId, cachedExpenses);
                logger.info("Removed old expense ID {} and added updated expense to cache for user: {}", id, userId);
            } else {
                // If no cached list exists, evict to force fresh fetch next time
                cache.evict(userId);
                logger.info("Evicted cache for user: {} due to missing cached list", userId);
            }

            // Add updated expense to individual cache
            cache.put(savedExpense.getId(), savedExpense);
        }

        return savedExpense;
    }

    @Override
    @Transactional
    public Expense updateExpenseWithBillService(Integer id, Expense updatedExpense, Integer userId) throws Exception {
        Expense existingExpense = expenseRepository.findByUserIdAndId(userId, id);
        if (existingExpense == null) {
            throw new RuntimeException("Expense not found with ID: " + id);
        }
        return updateExpenseInternal(existingExpense, updatedExpense, userId);
    }


    private void validateExpenseData(Expense updatedExpense) {
        if (updatedExpense.getDate() == null) {
            throw new IllegalArgumentException("Expense date must not be null.");
        }
        if (updatedExpense.getExpense() == null) {
            throw new IllegalArgumentException("Expense details must not be null.");
        }
        ExpenseDetails details = updatedExpense.getExpense();
        if (details.getExpenseName() == null || details.getExpenseName().isEmpty()) {
            throw new IllegalArgumentException("Expense name must not be empty.");
        }
        if (details.getAmount() < 0) {
            throw new IllegalArgumentException("Expense amount cannot be negative.");
        }
        if (details.getPaymentMethod() == null || details.getPaymentMethod().isEmpty()) {
            throw new IllegalArgumentException("Payment method must not be empty.");
        }
        if (details.getType() == null || details.getType().isEmpty()) {
            throw new IllegalArgumentException("Expense type must not be empty.");
        }
    }

    private void updateCategory(Expense existingExpense, Expense updatedExpense, Integer userId) throws Exception {
        Integer oldCategoryId = existingExpense.getCategoryId();
        Integer newCategoryId = updatedExpense.getCategoryId();
        User user = helper.validateUser(userId);

        if (!Objects.equals(oldCategoryId, newCategoryId)) {
            // Send REMOVE event for old category
            if (oldCategoryId != null) {
                CategoryExpenseEvent removeEvent = new CategoryExpenseEvent(userId, existingExpense.getId(), oldCategoryId, existingExpense.getCategoryName(), "REMOVE");
                categoryExpenseKafkaProducer.sendCategoryExpenseEvent(removeEvent);
            }

            // Handle new category assignment
            try {
                Category newCategory = categoryService.getById(newCategoryId, userId);
                if (newCategory != null) {
                    existingExpense.setCategoryId(newCategory.getId());
                    existingExpense.setCategoryName(newCategory.getName());
                    return;
                }
            } catch (Exception e) {
                // Fall back to Others category
            }

            // Assign to Others category if new category not found
            try {
                Category others = categoryService.getByName(OTHERS, user.getId()).get(0);
                existingExpense.setCategoryId(others.getId());
                existingExpense.setCategoryName(others.getName());
            } catch (Exception notFound) {
                Category createdCategory = new Category();
                createdCategory.setDescription("Others Description");
                createdCategory.setName(OTHERS);
                try {
                    Category newCategory = categoryService.create(createdCategory, user.getId());
                    existingExpense.setCategoryId(newCategory.getId());
                    existingExpense.setCategoryName(newCategory.getName());
                } catch (Exception createError) {
                    logger.error("Error creating Others category: {}", createError.getMessage());
                }
            }
        }
    }

    private void updatePaymentMethod(Expense existingExpense, ExpenseDetails newDetails, Integer userId) throws Exception {
        User user = helper.validateUser(userId);
        ExpenseDetails existingDetails = existingExpense.getExpense();
        String oldPaymentMethodName = existingDetails.getPaymentMethod();
        String oldPaymentType = (existingDetails.getType() != null && existingDetails.getType().equalsIgnoreCase("loss")) ? "expense" : "income";
        String newPaymentMethodName = newDetails.getPaymentMethod().trim();
        String newPaymentType = (newDetails.getType() != null && newDetails.getType().equalsIgnoreCase("loss")) ? "expense" : "income";

        // Remove expense from old payment method
        if (oldPaymentMethodName != null && !oldPaymentMethodName.trim().isEmpty()) {
            List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
            PaymentMethod oldPaymentMethod = allMethods.stream().filter(pm -> pm.getName().equalsIgnoreCase(oldPaymentMethodName.trim()) && pm.getType().equalsIgnoreCase(oldPaymentType)).findFirst().orElse(null);
            if (oldPaymentMethod != null && oldPaymentMethod.getExpenseIds() != null) {
                Map<Integer, Set<Integer>> expenseIds = oldPaymentMethod.getExpenseIds();
                Set<Integer> userExpenseSet = expenseIds.getOrDefault(userId, new HashSet<>());
                userExpenseSet.remove(existingExpense.getId());
                expenseIds.put(userId, userExpenseSet);
                paymentMethodService.save(oldPaymentMethod);
            }
        }

        // Add expense to new payment method
        List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
        PaymentMethod newPaymentMethod = allMethods.stream().filter(pm -> pm.getName().equalsIgnoreCase(newPaymentMethodName) && pm.getType().equalsIgnoreCase(newPaymentType)).findFirst().orElse(null);
        if (newPaymentMethod == null) {
            newPaymentMethod = new PaymentMethod();
            newPaymentMethod.setUserId(userId);
            newPaymentMethod.setName(newPaymentMethodName);
            newPaymentMethod.setType(newPaymentType);
            newPaymentMethod.setAmount(0);
            newPaymentMethod.setGlobal(false);
            newPaymentMethod.setExpenseIds(new HashMap<>());
        }
        if (newPaymentMethod.getExpenseIds() == null) {
            newPaymentMethod.setExpenseIds(new HashMap<>());
        }
        Map<Integer, Set<Integer>> expenseIds = newPaymentMethod.getExpenseIds();
        Set<Integer> userExpenseSet = expenseIds.getOrDefault(user.getId(), new HashSet<>());
        userExpenseSet.add(existingExpense.getId());
        expenseIds.put(user.getId(), userExpenseSet);
        paymentMethodService.save(newPaymentMethod);
    }

    private Set<Integer> extractValidBudgetIds(Expense updatedExpense, Integer userId) throws Exception {
        Set<Integer> validBudgetIds = new HashSet<>();
        if (updatedExpense.getBudgetIds() != null) {
            for (Integer budgetId : updatedExpense.getBudgetIds()) {
                Budget budgetOpt = budgetService.getBudgetById(budgetId, userId);
                if (budgetOpt != null) {
                    Budget budget = budgetOpt;
                    LocalDate expenseDate = updatedExpense.getDate();
                    if (!expenseDate.isBefore(budget.getStartDate()) && !expenseDate.isAfter(budget.getEndDate())) {
                        validBudgetIds.add(budgetId);
                    }
                }
            }
        }
        return validBudgetIds;
    }

    private void removeOldBudgetLinks(Expense existingExpense, Set<Integer> validBudgetIds, Integer userId) throws Exception {
        if (existingExpense.getBudgetIds() != null) {
            for (Integer oldBudgetId : existingExpense.getBudgetIds()) {
                if (!validBudgetIds.contains(oldBudgetId)) {
                    Budget oldBudget = budgetService.getBudgetById(oldBudgetId, userId);
                    if (oldBudget != null && oldBudget.getExpenseIds() != null) {
                        oldBudget.getExpenseIds().remove(existingExpense.getId());
                        oldBudget.setBudgetHasExpenses(!oldBudget.getExpenseIds().isEmpty());
                        budgetService.save(oldBudget);
                    }
                }
            }
        }
    }


    @Transactional
    private void updateCategoryExpenseIds(Expense savedExpense, Integer userId) {
        logger.info("Updating categoryId: {}", savedExpense.getCategoryId());
        if (savedExpense.getCategoryId() != null) {
            logger.info("Entered inside if statement: {}", savedExpense.getCategoryId());

            // Send Kafka event instead of direct database update
            CategoryExpenseEvent event = new CategoryExpenseEvent(userId, savedExpense.getId(), savedExpense.getCategoryId(), savedExpense.getCategoryName(), "ADD");

            categoryExpenseKafkaProducer.sendCategoryExpenseEvent(event);
            logger.info("Sent category expense event for expense {} to category {}", savedExpense.getId(), savedExpense.getCategoryId());
        }
    }

    private void updateBudgetLinks(Expense savedExpense, Set<Integer> validBudgetIds, Integer userId) throws Exception {
        for (Integer budgetId : validBudgetIds) {
            Budget budget = budgetService.getBudgetById(budgetId, userId);
            if (budget != null) {
                if (budget.getExpenseIds() == null) {
                    budget.setExpenseIds(new HashSet<>());
                }
                budget.getExpenseIds().add(savedExpense.getId());
                budget.setBudgetHasExpenses(true);
                budgetService.save( budget);
            }
        }
    }


    @Override
    @Transactional
    @CacheEvict(value = {"expenses", "categories"}, allEntries = true)
    public List<Expense> updateMultipleExpenses(Integer userId, List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            throw new IllegalArgumentException("Expense list cannot be null or empty.");
        }

        List<String> errorMessages = new ArrayList<>();
        List<Expense> updatedExpenses = new ArrayList<>();

        for (Expense expense : expenses) {
            Integer id = expense.getId();
            if (id == null) {
                errorMessages.add("Expense ID cannot be null.");
                continue;
            }

            if (expense.isBill()) {

                continue;
            }
            Optional<Expense> existingOpt = expenseRepository.findById(id);
            if (existingOpt.isEmpty()) {
                errorMessages.add("Expense not found with ID: " + id);
                continue;
            }

            Expense existingExpense = existingOpt.get();

            if (existingExpense.getUserId() == null || !existingExpense.getUserId().equals(userId)) {
                errorMessages.add("User not authorized to update Expense ID: " + id);
                continue;
            }

            try {
                // --- Category update logic (unchanged) ---
                Integer oldCategoryId = existingExpense.getCategoryId();
                Integer newCategoryId = expense.getCategoryId();
                if (!Objects.equals(oldCategoryId, newCategoryId)) {
                    // Remove from old category
                    if (oldCategoryId != null) {
                        try {
                            Category oldCategory = categoryService.getById(oldCategoryId, userId);
                            if (oldCategory != null && oldCategory.getExpenseIds() != null) {
                                Set<Integer> expenseSet = oldCategory.getExpenseIds().getOrDefault(userId, new HashSet<>());
                                expenseSet.remove(existingExpense.getId());
                                if (expenseSet.isEmpty()) {
                                    oldCategory.getExpenseIds().remove(userId);
                                } else {
                                    oldCategory.getExpenseIds().put(userId, expenseSet);
                                }
                                categoryService.save(oldCategory);
                            }
                        } catch (Exception e) {
                            System.out.println("Error removing expense from old category: " + e.getMessage());
                        }
                    }
                    // Add to new category
                    if (newCategoryId != null) {
                        try {
                            Category newCategory = categoryService.getById(newCategoryId, userId);
                            if (newCategory != null) {
                                existingExpense.setCategoryId(newCategory.getId());
                                existingExpense.setCategoryName(newCategory.getName());
                                if (newCategory.getExpenseIds() == null) {
                                    newCategory.setExpenseIds(new HashMap<>());
                                }
                                Set<Integer> expenseSet = newCategory.getExpenseIds().getOrDefault(userId, new HashSet<>());
                                expenseSet.add(existingExpense.getId());
                                newCategory.getExpenseIds().put(userId, expenseSet);
                                categoryService.save( newCategory);
                            }
                        } catch (Exception e) {
                            try {
                                Category category = categoryService.getByName(OTHERS, userId).get(0);
                                existingExpense.setCategoryId(category.getId());
                                existingExpense.setCategoryName(category.getName());
                                if (category.getExpenseIds() == null) {
                                    category.setExpenseIds(new HashMap<>());
                                }
                                Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(userId, new HashSet<>());
                                expenseSet.add(existingExpense.getId());
                                category.getExpenseIds().put(userId, expenseSet);
                                categoryService.save( category);
                            } catch (Exception notFound) {
                                Category createdCategory = new Category();
                                createdCategory.setDescription("Others Description");
                                createdCategory.setName(OTHERS);
                                try {
                                    Category newCategory = categoryService.create(createdCategory, userId);
                                    existingExpense.setCategoryId(newCategory.getId());
                                    existingExpense.setCategoryName(newCategory.getName());
                                    if (newCategory.getExpenseIds() == null) {
                                        newCategory.setExpenseIds(new HashMap<>());
                                    }
                                    Set<Integer> expenseSet = new HashSet<>();
                                    expenseSet.add(existingExpense.getId());
                                    newCategory.getExpenseIds().put(userId, expenseSet);
                                    categoryService.save( newCategory);
                                } catch (Exception createError) {
                                    System.out.println("Error creating Others category: " + createError.getMessage());
                                }
                            }
                        }
                    }
                }

                ExpenseDetails newDetails = expense.getExpense();
                if (newDetails != null && existingExpense.getExpense() != null) {
                    ExpenseDetails existingDetails = existingExpense.getExpense();
                    String oldPaymentMethodName = existingDetails.getPaymentMethod();
                    String oldPaymentType = existingDetails.getType() != null && existingDetails.getType().equalsIgnoreCase("loss") ? "expense" : "income";
                    String newPaymentMethodName = newDetails.getPaymentMethod() != null ? newDetails.getPaymentMethod().trim() : null;
                    String newPaymentType = newDetails.getType() != null && newDetails.getType().equalsIgnoreCase("loss") ? "expense" : "income";

                    // Remove from old payment method if changed
                    if (oldPaymentMethodName != null && !oldPaymentMethodName.trim().isEmpty() && (newPaymentMethodName == null || !oldPaymentMethodName.trim().equalsIgnoreCase(newPaymentMethodName) || !oldPaymentType.equalsIgnoreCase(newPaymentType))) {
                        List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
                        PaymentMethod oldPaymentMethod = allMethods.stream().filter(pm -> pm.getName().equalsIgnoreCase(oldPaymentMethodName.trim()) && pm.getType().equalsIgnoreCase(oldPaymentType)).findFirst().orElse(null);
                        if (oldPaymentMethod != null && oldPaymentMethod.getExpenseIds() != null) {
                            oldPaymentMethod.getExpenseIds().remove(existingExpense.getId());
                            paymentMethodService.save(oldPaymentMethod);
                        }
                    }

                    if (newPaymentMethodName != null && !newPaymentMethodName.isEmpty()) {
                        List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
                        PaymentMethod newPaymentMethod = allMethods.stream().filter(pm -> pm.getName().equalsIgnoreCase(newPaymentMethodName) && pm.getType().equalsIgnoreCase(newPaymentType)).findFirst().orElse(null);
                        if (newPaymentMethod == null) {
                            newPaymentMethod = new PaymentMethod();
                            newPaymentMethod.setUserId(userId);
                            newPaymentMethod.setName(newPaymentMethodName);
                            newPaymentMethod.setType(newPaymentType);
                            newPaymentMethod.setAmount(0);
                            newPaymentMethod.setGlobal(false);
                            newPaymentMethod.setExpenseIds(new HashMap<>());
                        }
                        if (newPaymentMethod.getExpenseIds() == null) {
                            newPaymentMethod.setExpenseIds(new HashMap<>());
                        }
                        Map<Integer, Set<Integer>> expenseIds = newPaymentMethod.getExpenseIds();
                        Set<Integer> userExpenseSet = expenseIds.getOrDefault(userId, new HashSet<>());
                        userExpenseSet.add(existingExpense.getId());
                        expenseIds.put(userId, userExpenseSet);
                        paymentMethodService.save(newPaymentMethod);
                    }

                    existingDetails.setAmount(newDetails.getAmount());
                    existingDetails.setExpenseName(newDetails.getExpenseName());
                    existingDetails.setNetAmount(newDetails.getNetAmount());
                    existingDetails.setType(newDetails.getType());
                    existingDetails.setPaymentMethod(newDetails.getPaymentMethod());
                    existingDetails.setComments(newDetails.getComments());
                    existingDetails.setCreditDue(newDetails.getCreditDue());
                }

                existingExpense.setDate(expense.getDate());
                existingExpense.setIncludeInBudget(expense.isIncludeInBudget());

                Set<Integer> validBudgetIds = new HashSet<>();
                if (expense.getBudgetIds() != null) {
                    for (Integer budgetId : expense.getBudgetIds()) {
                        Budget budgetOpt = budgetService.getBudgetById(budgetId, userId);
                        if (budgetOpt != null) {
                            Budget budget = budgetOpt;
                            if (!expense.getDate().isBefore(budget.getStartDate()) && !expense.getDate().isAfter(budget.getEndDate())) {
                                validBudgetIds.add(budgetId);
                            }
                        }
                    }
                }

                if (existingExpense.getBudgetIds() != null) {
                    for (Integer oldBudgetId : existingExpense.getBudgetIds()) {
                        if (!validBudgetIds.contains(oldBudgetId)) {
                            Budget oldBudget = budgetService.getBudgetById(oldBudgetId, userId);
                            if (oldBudget != null && oldBudget.getExpenseIds() != null) {
                                oldBudget.getExpenseIds().remove(existingExpense.getId());
                                oldBudget.setBudgetHasExpenses(!oldBudget.getExpenseIds().isEmpty());
                                budgetService.save( oldBudget);
                            }
                        }
                    }
                }

                existingExpense.setBudgetIds(validBudgetIds);
                Expense savedExpense = expenseRepository.save(existingExpense);

                // Add new budget links
                for (Integer budgetId : validBudgetIds) {
                    Budget budget = budgetService.getBudgetById(budgetId, userId);
                    if (budget != null) {
                        if (budget.getExpenseIds() == null) budget.setExpenseIds(new HashSet<>());
                        budget.getExpenseIds().add(savedExpense.getId());
                        budget.setBudgetHasExpenses(true);
                        budgetService.save(budget);
                    }
                }

                // auditExpenseService.logAudit(user, savedExpense.getId(), "Expense Updated", "Expense: " + savedExpense.getExpense().getExpenseName() + ", Amount: " + savedExpense.getExpense().getAmount());

                updatedExpenses.add(savedExpense);

            } catch (Exception e) {
                errorMessages.add("Failed to update Expense with ID: " + id + " - " + e.getMessage());
            }
        }

        if (!errorMessages.isEmpty()) {
            System.err.println("Errors occurred while updating expenses: " + String.join("; ", errorMessages));
        }


        return updatedExpenses;
    }


    @Override
    public List<Expense> getExpensesInBudgetRangeWithIncludeFlag(LocalDate startDate, LocalDate endDate, Integer budgetId, Integer userId) throws Exception {

        Budget optionalBudget = budgetService.getBudgetById(budgetId, userId);
        if (optionalBudget == null) {
            throw new RuntimeException("Budget not found for user with ID: " + budgetId);
        }

        Budget budget = optionalBudget;


        LocalDate effectiveStartDate = (startDate != null) ? startDate : budget.getStartDate();
        LocalDate effectiveEndDate = (endDate != null) ? endDate : budget.getEndDate();

        List<Expense> expensesInRange = expenseRepository.findByUserIdAndDateBetween(userId, effectiveStartDate, effectiveEndDate);

        for (Expense expense : expensesInRange) {
            boolean isIncluded = expense.getBudgetIds() != null && expense.getBudgetIds().contains(budgetId);
            expense.setIncludeInBudget(isIncluded);
        }

        return expensesInRange;
    }


    @Override
    @Transactional
    @CacheEvict(value = "expenses", allEntries = true)
    public void deleteAllExpenses(Integer userId, List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            throw new IllegalArgumentException("Expenses list cannot be null or empty.");
        }

        List<String> errorMessages = new ArrayList<>();
        List<Expense> expensesToDelete = new ArrayList<>();

        for (Expense expense : expenses) {
            if (expense.getId() == null) {
                errorMessages.add("Expense ID cannot be null.");
                continue;
            }

            Expense existing = expenseRepository.findById(expense.getId()).orElse(null);
            if (existing == null) {
                errorMessages.add("Expense not found with ID: " + expense.getId());
                continue;
            }

            if (existing.isBill()) {
                continue;
            }

            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                errorMessages.add("User not authorized to delete Expense ID: " + expense.getId() + " (Expense belongs to user " + (existing.getUserId() != null ? existing.getUserId() : "unknown") + ", current user is " + userId + ")");
                continue;
            }

            try {
                Set<Integer> budgetIds = existing.getBudgetIds();
                if (budgetIds != null) {
                    for (Integer budgetId : budgetIds) {
                        Budget budget = budgetService.getBudgetById(budgetId, userId);
                        if (budget != null && budget.getExpenseIds() != null) {
                            budget.getExpenseIds().remove(existing.getId());
                            budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());
                            budgetService.save( budget);
                        }
                    }
                }

                Integer categoryId = existing.getCategoryId();
                if (categoryId != null) {
                    try {
                        Category category = categoryService.getById(categoryId, userId);
                        if (category != null && category.getExpenseIds() != null) {
                            Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(userId, new HashSet<>());
                            expenseSet.remove(existing.getId());
                            if (expenseSet.isEmpty()) {
                                category.getExpenseIds().remove(userId);
                            } else {
                                category.getExpenseIds().put(userId, expenseSet);
                            }
                            categoryService.save( category);
                        }
                    } catch (Exception e) {
                        System.out.println("Error removing expense from category: " + e.getMessage());
                    }
                }

                ExpenseDetails details = existing.getExpense();
                if (details != null && details.getPaymentMethod() != null && !details.getPaymentMethod().trim().isEmpty()) {
                    String paymentMethodName = details.getPaymentMethod().trim();
                    String paymentType = (details.getType() != null && details.getType().equalsIgnoreCase("loss")) ? "expense" : "income";
                    List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
                    PaymentMethod paymentMethod = allMethods.stream().filter(pm -> pm.getName().equalsIgnoreCase(paymentMethodName) && pm.getType().equalsIgnoreCase(paymentType)).findFirst().orElse(null);
                    if (paymentMethod != null && paymentMethod.getExpenseIds() != null) {
                        Map<Integer, Set<Integer>> expenseIdsMap = paymentMethod.getExpenseIds();
                        Set<Integer> userExpenseSet = expenseIdsMap.getOrDefault(userId, new HashSet<>());
                        userExpenseSet.remove(existing.getId());
                        if (userExpenseSet.isEmpty()) {
                            expenseIdsMap.remove(userId);
                        } else {
                            expenseIdsMap.put(userId, userExpenseSet);
                        }
                        paymentMethodService.save(paymentMethod);
                    }
                }


                auditHelper.auditAction(userId, expense.getId().toString(), "EXPENSE", "DELETE", expense);
                // auditExpenseService.logAudit(user, existing.getId(), "Expense Deleted", existing.getExpense().getExpenseName());
                expensesToDelete.add(existing);
            } catch (Exception e) {
                errorMessages.add("Failed to process deletion for Expense ID: " + expense.getId() + " - " + e.getMessage());
            }
        }

        if (!expensesToDelete.isEmpty()) {
            expenseRepository.deleteAll(expensesToDelete);
        }

        if (!errorMessages.isEmpty()) {
            throw new RuntimeException("Errors occurred while deleting expenses: " + String.join("; ", errorMessages));
        }
    }


    // Java
    @Override
    @Transactional
    @CacheEvict(value = "expenses", allEntries = true)
    public void deleteExpensesByIdsWithBillService(List<Integer> ids, Integer userId) throws Exception {
        deleteExpensesInternal(ids, userId, true);
    }

    @Override
    @Transactional
    @CacheEvict(value = "expenses", allEntries = true)
    public void deleteExpensesByIds(List<Integer> ids, Integer userId) throws Exception {
        deleteExpensesInternal(ids, userId, false);
    }

    @Transactional
    @CacheEvict(value = "expenses", allEntries = true)
    private void deleteExpensesInternal(List<Integer> ids, Integer userId, boolean skipBillCheck) throws Exception {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Expense ID list cannot be null or empty.");
        }

        List<Expense> expenses = expenseRepository.findAllById(ids);
        if (expenses.isEmpty()) {
            throw new Exception("No expenses found for the given IDs");
        }

        List<String> errorMessages = new ArrayList<>();
        List<Expense> expensesToDelete = new ArrayList<>();

        for (Expense expense : expenses) {
            try {
                if (expense.getUserId() == null || !expense.getUserId().equals(userId)) {
                    errorMessages.add("User not authorized to delete Expense ID: " + expense.getId() + " (Expense belongs to user " + (expense.getUserId() != null ? expense.getUserId() : "unknown") + ", current user is " + userId + ")");
                    continue;
                }

                if (!skipBillCheck && expense.isBill()) {
                    continue;
                }

                // Process budget removal
                Set<Integer> budgetIds = expense.getBudgetIds();
                if (budgetIds != null) {
                    for (Integer budgetId : budgetIds) {
                        Budget budget = budgetService.getBudgetById(budgetId, userId);
                        if (budget != null && budget.getExpenseIds() != null) {
                            budget.getExpenseIds().remove(expense.getId());
                            budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());
                            budgetService.save( budget);
                        }
                    }
                }

                // Process category removal
                Integer categoryId = expense.getCategoryId();
                if (categoryId != null) {
                    try {
                        Category category = categoryService.getById(categoryId, userId);
                        if (category != null && category.getExpenseIds() != null) {
                            Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(userId, new HashSet<>());
                            expenseSet.remove(expense.getId());
                            if (expenseSet.isEmpty()) {
                                category.getExpenseIds().remove(userId);
                            } else {
                                category.getExpenseIds().put(userId, expenseSet);
                            }
                            categoryService.save( category);
                        }
                    } catch (Exception e) {
                        System.out.println("Error removing expense from category: " + e.getMessage());
                    }
                }

                // Process payment method removal
                ExpenseDetails details = expense.getExpense();
                if (details != null && details.getPaymentMethod() != null && !details.getPaymentMethod().isEmpty()) {
                    try {
                        PaymentMethod paymentMethod = paymentMethodService.getByNameAndType(userId, details.getPaymentMethod(), details.getType().equals("loss") ? "expense" : "income");
                        if (paymentMethod != null && paymentMethod.getExpenseIds() != null) {
                            Map<Integer, Set<Integer>> expenseIdsMap = paymentMethod.getExpenseIds();
                            Set<Integer> userExpenseSet = expenseIdsMap.getOrDefault(userId, new HashSet<>());
                            userExpenseSet.remove(expense.getId());
                            if (userExpenseSet.isEmpty()) {
                                expenseIdsMap.remove(userId);
                            } else {
                                expenseIdsMap.put(userId, userExpenseSet);
                            }
                            paymentMethodService.save(paymentMethod);
                        }
                    } catch (Exception e) {
                        System.out.println("Error removing expense from payment method: " + e.getMessage());
                    }
                }

                // auditExpenseService.logAudit(user, expense.getId(), "Expense Deleted", expense.getExpense().getExpenseName());
                expensesToDelete.add(expense);
            } catch (Exception e) {
                errorMessages.add("Failed to process deletion for Expense ID: " + expense.getId() + " - " + e.getMessage());
            }
        }

        if (!expensesToDelete.isEmpty()) {
            expenseRepository.deleteAll(expensesToDelete);
        }
        if (!errorMessages.isEmpty()) {
            throw new Exception("Errors occurred while deleting expenses: " + String.join("; ", errorMessages));
        }
    }


    @Override
    @Transactional
    public void deleteExpense(Integer id, Integer userId) throws Exception {
        Expense expense = expenseRepository.findByUserIdAndId(userId, id);
        if (expense == null) {
            throw new RuntimeException("Expense not found with ID: " + id);
        }

        if (expense.isBill()) {
            throw new RuntimeException("Cannot delete a bill expense. Please use the Bill Id for deletion.");
        }

        Set<Integer> budgetIds = expense.getBudgetIds();
        if (budgetIds != null) {
            for (Integer budgetId : budgetIds) {
                Budget budget = budgetService.getBudgetById(budgetId, userId);
                if (budget != null && budget.getExpenseIds() != null) {
                    budget.getExpenseIds().remove(expense.getId());
                    budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());
                    budgetService.save( budget);
                }
            }
        }

        Integer categoryId = expense.getCategoryId();
        if (categoryId != null) {
            try {
                Category category = categoryService.getById(categoryId, userId);
                if (category != null && category.getExpenseIds() != null) {
                    Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(userId, new HashSet<>());
                    expenseSet.remove(expense.getId());
                    if (expenseSet.isEmpty()) {
                        category.getExpenseIds().remove(userId);
                    } else {
                        category.getExpenseIds().put(userId, expenseSet);
                    }
                    categoryService.save( category);
                }
            } catch (Exception e) {
                System.out.println("Error removing expense from category: " + e.getMessage());
            }
        }

        if (expense.getExpense() != null && expense.getExpense().getPaymentMethod() != null) {
            String paymentMethodName = expense.getExpense().getPaymentMethod();
            String type = expense.getExpense().getType();
            try {
                PaymentMethod paymentMethod = paymentMethodService.getByNameAndType(userId, paymentMethodName, type.equals("loss") ? "expense" : "income");
                if (paymentMethod != null && paymentMethod.getExpenseIds() != null) {
                    Map<Integer, Set<Integer>> expenseIdsMap = paymentMethod.getExpenseIds();
                    Set<Integer> userExpenseSet = expenseIdsMap.getOrDefault(userId, new HashSet<>());
                    userExpenseSet.remove(expense.getId());
                    System.out.println("Removing expense ID " + expense.getId() + " from payment method " + userExpenseSet);
                    if (userExpenseSet.isEmpty()) {
                        expenseIdsMap.remove(userId);
                    } else {
                        expenseIdsMap.put(userId, userExpenseSet);
                    }
                    paymentMethodService.save(paymentMethod);
                }
            } catch (Exception e) {
                System.out.println("Error removing expense from payment method: " + e.getMessage());
            }
        }

        // auditExpenseService.logAudit(user, expense.getId(), "Expense Deleted", expense.getExpense().getExpenseName());

        // Remove from cache before deleting from database
        Cache cache = cacheManager.getCache("expenses");
        if (cache != null) {
            // Remove individual expense from cache
            cache.evict(id);

            // Update user's expense list cache
            List<Expense> cachedExpenses = cache.get(userId, List.class);
            if (cachedExpenses != null) {
                // Remove the deleted expense from the cached list
                cachedExpenses.removeIf(exp -> exp.getId().equals(id));

                // Update the cache with the modified list
                cache.put(userId, cachedExpenses);
                logger.info("Removed deleted expense ID {} from cache for user: {}", id, userId);
            } else {
                // If no cached list exists, evict to force fresh fetch next time
                cache.evict(userId);
                logger.info("Evicted cache for user: {} due to missing cached list", userId);
            }
        }

        // Also evict related caches that might be affected
        Cache budgetCache = cacheManager.getCache("budgets");
        if (budgetCache != null) {
            budgetCache.evict(userId);
        }

        Cache categoryCache = cacheManager.getCache("categories");
        if (categoryCache != null) {
            categoryCache.evict(userId);
        }

        Cache paymentMethodCache = cacheManager.getCache("paymentMethods");
        if (paymentMethodCache != null) {
            paymentMethodCache.evict(userId);
        }

        String expenseJson = jsonConverter.toJson(getExpenseById(id, userId));
        auditHelper.auditAction(userId, id.toString(), "EXPENSE", "DELETE", expenseJson);

        expenseRepository.deleteById(id);
    }

    @Override
    public MonthlySummary getMonthlySummary(Integer year, Integer month, Integer userId) {
        LocalDate creditDueStartDate = LocalDate.of(year, month, 1).minusMonths(1).withDayOfMonth(17);
        LocalDate creditDueEndDate = LocalDate.of(year, month, 1).withDayOfMonth(16);

        LocalDate generalStartDate = LocalDate.of(year, month, 1);
        LocalDate generalEndDate = generalStartDate.withDayOfMonth(generalStartDate.lengthOfMonth());


        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        List<Expense> creditDueExpenses = expenseRepository.findByUserIdAndDateBetween(userId, creditDueStartDate, creditDueEndDate);
        List<Expense> generalExpenses = expenseRepository.findByUserIdAndDateBetween(userId, generalStartDate, generalEndDate);

        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;
        BigDecimal totalCreditPaid = BigDecimal.ZERO;

        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        CashSummary cashSummary = new CashSummary();
        BigDecimal currentMonthCreditDue = BigDecimal.ZERO;
        BigDecimal creditDue = BigDecimal.ZERO;

        // Process credit due expenses for credit due calculations
        for (Expense expense : creditDueExpenses) {
            if (CREDIT_NEED_TO_PAID.equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                creditDue = creditDue.add(BigDecimal.valueOf(expense.getExpense().getAmount()));
                currentMonthCreditDue = currentMonthCreditDue.add(BigDecimal.valueOf(expense.getExpense().getAmount()));
            } else if (CREDIT_PAID.equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                currentMonthCreditDue = currentMonthCreditDue.subtract(BigDecimal.valueOf(expense.getExpense().getAmount()));
            }
        }


        for (Expense expense : generalExpenses) {
            String category = expense.getExpense().getType();
            BigDecimal amount = BigDecimal.valueOf(expense.getExpense().getAmount());

            if (category.equalsIgnoreCase("gain") || category.equalsIgnoreCase("income")) {
                totalGain = totalGain.add(amount);
                if (CASH.equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                    cashSummary.setGain(cashSummary.getGain().add(amount));
                }

                categoryBreakdown.merge(category, amount, BigDecimal::add);
            } else if (category.equalsIgnoreCase("loss") || category.equalsIgnoreCase("expense")) {
                BigDecimal negativeAmount = amount.negate();
                totalLoss = totalLoss.add(negativeAmount);

                if (CASH.equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                    cashSummary.setLoss(cashSummary.getLoss().add(negativeAmount));
                }
                if (CREDIT_PAID.equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                    totalCreditPaid = totalCreditPaid.add(amount);
                }

                categoryBreakdown.merge(category, negativeAmount, BigDecimal::add);
            }
        }


        cashSummary.calculateDifference();

        BigDecimal balanceRemaining = totalGain.subtract(totalLoss).setScale(2, BigDecimal.ROUND_HALF_UP);


        MonthlySummary summary = new MonthlySummary();
        summary.setTotalAmount(totalGain.add(totalLoss).setScale(2, BigDecimal.ROUND_HALF_UP));
        summary.setCategoryBreakdown(categoryBreakdown);
        summary.setBalanceRemaining(balanceRemaining);
        summary.setCurrentMonthCreditDue(currentMonthCreditDue.setScale(2, BigDecimal.ROUND_HALF_UP));
        summary.setCash(cashSummary);
        summary.setCreditPaid(totalCreditPaid.setScale(2, BigDecimal.ROUND_HALF_UP));
        summary.setCreditDue(creditDue.setScale(2, BigDecimal.ROUND_HALF_UP));


        String formattedCreditDueStartDate = creditDueStartDate.format(formatter);
        String formattedCreditDueEndDate = creditDueEndDate.format(formatter);
        summary.setCreditDueMessage("Credit Due is calculated from " + formattedCreditDueStartDate + " to " + formattedCreditDueEndDate);

        return summary;
    }


    @Override
    public Map<String, MonthlySummary> getYearlySummary(Integer year, Integer userId) {
        Map<String, MonthlySummary> yearlySummary = new LinkedHashMap<>();

        String[] monthNames = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};

        for (int month = 1; month <= 12; month++) {
            MonthlySummary monthlySummary = getMonthlySummary(year, month, userId);


            if (hasRelevantData(monthlySummary)) {
                yearlySummary.put(monthNames[month - 1], monthlySummary);
            }
        }

        return yearlySummary;
    }

    private boolean hasRelevantData(MonthlySummary summary) {
        return summary.getTotalAmount().compareTo(BigDecimal.ZERO) != 0 || summary.getBalanceRemaining().compareTo(BigDecimal.ZERO) != 0 || summary.getCurrentMonthCreditDue().compareTo(BigDecimal.ZERO) != 0 || summary.getCash().getGain().compareTo(BigDecimal.ZERO) != 0 || summary.getCash().getLoss().compareTo(BigDecimal.ZERO) != 0 || summary.getCash().getDifference().compareTo(BigDecimal.ZERO) != 0 || summary.getCreditPaid().compareTo(BigDecimal.ZERO) != 0 || summary.getCreditDue().compareTo(BigDecimal.ZERO) != 0 || (summary.getCategoryBreakdown() != null && !summary.getCategoryBreakdown().isEmpty());
    }


    @Override
    public List<MonthlySummary> getSummaryBetweenDates(Integer startYear, Integer startMonth, Integer endYear, Integer endMonth, Integer userId) {
        List<MonthlySummary> summaries = new ArrayList<>();


        LocalDate startDate = LocalDate.of(startYear, startMonth, 1);


        LocalDate endDate = LocalDate.of(endYear, endMonth, 1).withDayOfMonth(LocalDate.of(endYear, endMonth, 1).lengthOfMonth());


        while (!startDate.isAfter(endDate)) {

            MonthlySummary summary = getMonthlySummary(startDate.getYear(), startDate.getMonthValue(), userId);
            summaries.add(summary);


            startDate = startDate.plusMonths(1);
        }

        return summaries;
    }


    @Override
    public List<Expense> getExpensesByDate(LocalDate date, Integer userId) {
        return expenseRepository.findByUserIdAndDate(userId, date);
    }


    @Override
    public List<Expense> getTopNExpenses(int n, Integer userId) {
        Pageable pageable = PageRequest.of(0, n);
        Page<Expense> topExpensesPage = expenseRepository.findTopNExpensesByUserAndAmount(userId, pageable);
        return topExpensesPage.getContent();
    }

    @Override
    public List<Expense> searchExpensesByName(String expenseName, Integer userId) {
        return expenseRepository.searchExpensesByUserAndName(userId, expenseName);
    }

    @Override
    public List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate, String type, String paymentMethod, Double minAmount, Double maxAmount, Integer userId) {
        return expenseRepository.filterExpensesByUser(userId, expenseName, startDate, endDate, type, paymentMethod, minAmount, maxAmount);
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


    @Override
    public Map<String, Object> getMonthlySpendingInsights(int year, int month, Integer userId) {
        LocalDate startDate = LocalDate.of(year, Month.of(month), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        double totalExpenses = 0;
        double averageDailyExpenses = 0;
        Map<String, Double> categoryWiseSpending = new HashMap<>();

        for (Expense expense : expenses) {
            ExpenseDetails expenseDetails = expense.getExpense();


            String category = expenseDetails.getType();

            categoryWiseSpending.put(category, categoryWiseSpending.getOrDefault(category, 0.0) + expenseDetails.getAmount());
        }

        int daysInMonth = startDate.lengthOfMonth();
        if (daysInMonth > 0) {
            averageDailyExpenses = categoryWiseSpending.get("loss") / daysInMonth;
            averageDailyExpenses = Math.round(averageDailyExpenses * 100.0) / 100.0;
        }

        Map<String, Object> insights = new HashMap<>();
        insights.put("totalExpenses", categoryWiseSpending.get("loss"));
        insights.put("averageDailyExpenses", averageDailyExpenses);
        insights.put("categoryWiseSpending", categoryWiseSpending);

        return insights;
    }

    @Override
    public List<String> getPaymentMethods(Integer userId) {
        List<String> paymentMethodsList = new ArrayList<>(Arrays.asList(CASH, CREDIT_PAID, CREDIT_NEED_TO_PAID));
        return paymentMethodsList;
    }


    @Override
    public Map<String, Map<String, Double>> getPaymentMethodSummary(Integer userId) {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        Map<String, Map<String, Double>> paymentMethodSummary = new HashMap<>();

        for (Expense expense : expenses) {
            ExpenseDetails expenseDetails = expense.getExpense();
            String paymentMethod = expenseDetails.getPaymentMethod();
            double amount = expenseDetails.getAmount();
            String expenseType = expenseDetails.getType();

            Map<String, Double> methodSummary = paymentMethodSummary.getOrDefault(paymentMethod, new HashMap<>());

            String key = expenseType.equals("loss") ? paymentMethod + " loss" : paymentMethod + " gain";
            methodSummary.put(key, methodSummary.getOrDefault(key, 0.0) + amount);

            paymentMethodSummary.put(paymentMethod, methodSummary);
        }

        return paymentMethodSummary;
    }

    @Override
    public List<Expense> getExpensesByType(String type, Integer userId) {
        return expenseRepository.findExpensesWithGainTypeByUser(userId);
    }

    @Override
    public List<Expense> getLossExpenses(Integer userId) {
        return expenseRepository.findByLossTypeAndUser(userId);
    }


    @Override
    public List<Expense> getExpensesByPaymentMethod(String paymentMethod, Integer userId) {
        return expenseRepository.findByUserAndPaymentMethod(userId, paymentMethod);
    }


    @Override
    public List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod, Integer userId) {
        return expenseRepository.findByUserAndTypeAndPaymentMethod(userId, type, paymentMethod);
    }

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
    public List<Expense> getExpensesByMonthAndYear(int month, int year, Integer userId) {
        return expenseRepository.findByUserAndMonthAndYear(userId, month, year);
    }

    @Override
    public List<String> getUniqueTopExpensesByGain(Integer userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);  // Limit the results to the 'limit' number
        return expenseRepository.findTopExpensesByGainForUser(userId, pageable);
    }

    @Override
    public List<String> getUniqueTopExpensesByLoss(Integer userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<String> expenseNames = expenseRepository.findTopExpensesByLoss(userId, pageable);
        return getUniqueExpenseNames(expenseNames);
    }

    private List<String> getUniqueExpenseNames(List<String> expenseNames) {
        return expenseNames.stream().map(String::toLowerCase).distinct().collect(Collectors.toList());
    }


    @Override
    public List<Expense> getExpensesForToday(Integer userId) {
        LocalDate today = LocalDate.now();
        return expenseRepository.findByUserIdAndDate(userId, today);
    }


    @Override
    public List<Expense> getExpensesForLastMonth(Integer userId) {

        LocalDate today = LocalDate.now();


        LocalDate firstDayOfLastMonth = today.withDayOfMonth(1).minusMonths(1);

        LocalDate lastDayOfLastMonth = firstDayOfLastMonth.withDayOfMonth(firstDayOfLastMonth.lengthOfMonth());


        return expenseRepository.findByUserIdAndDateBetween(userId, firstDayOfLastMonth, lastDayOfLastMonth);
    }

    @Override
    public List<Expense> getExpensesForCurrentMonth(Integer userId) {
        LocalDate today = LocalDate.now();


        LocalDate firstDayOfCurrentMonth = today.withDayOfMonth(1);

        LocalDate lastDayOfCurrentMonth = today.withDayOfMonth(today.lengthOfMonth());


        return expenseRepository.findByUserIdAndDateBetween(userId, firstDayOfCurrentMonth, lastDayOfCurrentMonth);
    }


    @Override
    public String getCommentsForExpense(Integer expenseId, Integer userId) {

        Expense expense = expenseRepository.findByUserIdAndId(userId, expenseId);

        if (expense != null) {

            return expense.getExpense().getComments();
        } else {

            return "No comments found for this expense.";
        }
    }


    @Override
    public String removeCommentFromExpense(Integer expenseId, Integer userId) {

        Expense expense = expenseRepository.findByUserIdAndId(userId, expenseId);


        if (expense != null && expense.getExpense() != null) {

            expense.getExpense().setComments(null);


            expenseRepository.save(expense);

            return "Comment removed successfully.";
        } else {
            return "Expense not found or no comment to remove.";
        }
    }

    @Override
    public ExpenseReport generateExpenseReport(Integer expenseId, Integer userId) {

        Expense expenseOptional = expenseRepository.findByUserIdAndId(userId, expenseId);

        if (expenseOptional != null) {
            Expense expense = expenseOptional;


            String expenseName = expense.getExpense().getExpenseName();
            String comments = expense.getExpense().getComments();


            ExpenseReport report = new ExpenseReport();
            report.setExpenseId(expense.getId());
            report.setExpenseName(expenseName);
            report.setComments(comments);
            report.setGeneratedDate(LocalDate.now());
            report.setTotalAmount(expense.getExpense().getAmount());
            report.setReportDetails("Generated report for expense ID " + expense.getId());


            LocalDateTime indiaTime = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
            String formattedTime = indiaTime.format(formatter);
            report.setGeneratedTime(formattedTime);


            return expenseReportRepository.save(report);
        } else {
            // If the expense does not exist, throw an exception
            throw new RuntimeException("Expense not found for ID: " + expenseId);
        }
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
    public Double getTotalExpenseByName(String expenseName) {
        return expenseRepository.getTotalExpenseByName(expenseName.trim());
    }

    @Override
    public List<ExpenseDetails> getExpensesByName(String expenseName, Integer userId) {
        return expenseRepository.findExpensesByUserAndName(userId, expenseName.trim());
    }

    @Override
    public List<Map<String, Object>> getTotalByCategory(Integer userId) {
        List<Object[]> result = expenseRepository.findTotalExpensesGroupedByCategory(userId);
        System.out.println("Result size: " + result.size());
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : result) {
            String expenseName = ((String) row[0]).trim();
            Double totalAmount = (Double) row[1];

            List<Integer> expenseIds = new ArrayList<>();
            List<ExpenseDetails> expenseDetailsList = expenseRepository.findExpensesByUserAndName(userId, expenseName);

            List<String> expenseDates = new ArrayList<>();
            for (ExpenseDetails expenseDetails : expenseDetailsList) {
                expenseIds.add(expenseDetails.getId());
                expenseDates.add(expenseDetails.getExpense().getDate().toString());
            }

            Map<String, Object> map = new HashMap<>();
            map.put("expenseName", expenseName);
            map.put("totalAmount", totalAmount);


            response.add(map);
        }

        return response;
    }


    @Override
    public Map<String, Double> getTotalByDate(Integer userId) {

        List<Object[]> result = expenseRepository.findTotalExpensesGroupedByDate(userId);


        Map<String, Double> totalExpensesByDate = new HashMap<>();


        for (Object[] row : result) {
            LocalDate date = (LocalDate) row[0];
            Double totalAmount = (Double) row[1];


            totalExpensesByDate.put(date.toString(), totalAmount);
        }


        return totalExpensesByDate;
    }

    @Override
    public Double getTotalForToday(Integer userId) {
        LocalDate today = LocalDate.now(); // Get today's date
        return expenseRepository.findTotalExpensesForToday(today, userId);
    }


    @Override
    public Double getTotalForCurrentMonth(Integer userId) {

        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();


        return expenseRepository.findTotalExpensesForCurrentMonth(month, year, userId);
    }

    @Override
    public Double getTotalForMonthAndYear(int month, int year, Integer userId) {
        return expenseRepository.getTotalByMonthAndYear(month, year, userId);
    }

    @Override
    public Double getTotalByDateRange(LocalDate startDate, LocalDate endDate, Integer userId) {
        return expenseRepository.getTotalByDateRange(startDate, endDate, userId);
    }


    @Override
    public Map<String, Double> getPaymentWiseTotalForCurrentMonth(Integer userId) {

        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();


        List<Object[]> paymentWiseTotals = expenseRepository.findTotalByPaymentMethodForCurrentMonth(currentMonth, currentYear, userId);


        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : paymentWiseTotals) {
            result.put((String) obj[0], (Double) obj[1]);
        }

        return result;
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForLastMonth(Integer userId) {
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        int lastMonth = currentMonth - 1;
        int lastYear = currentYear;
        if (lastMonth == 0) {
            lastMonth = 12;  // December
            lastYear -= 1;   // Previous year
        }


        List<Object[]> paymentWiseTotals = expenseRepository.findTotalByPaymentMethodForLastMonth(lastMonth, lastYear, userId);

        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : paymentWiseTotals) {
            result.put((String) obj[0], (Double) obj[1]);
        }

        return result;
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForDateRange(LocalDate startDate, LocalDate endDate, Integer userId) {

        List<Object[]> paymentWiseTotals = expenseRepository.findTotalByPaymentMethodBetweenDates(startDate, endDate, userId);


        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : paymentWiseTotals) {
            result.put((String) obj[0], (Double) obj[1]);
        }

        return result;
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForMonth(int month, int year, Integer userId) {

        List<Object[]> paymentWiseTotals = expenseRepository.findTotalByPaymentMethodForMonth(month, year, userId);


        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : paymentWiseTotals) {
            result.put((String) obj[0], (Double) obj[1]);
        }

        return result;
    }

    @Override
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethod(int month, int year, Integer userId) {

        List<Object[]> totals = expenseRepository.findTotalByExpenseNameAndPaymentMethodForMonth(month, year, userId);


        Map<String, Map<String, Double>> result = new HashMap<>();
        for (Object[] obj : totals) {
            String expenseName = (String) obj[0];
            String paymentMethod = (String) obj[1];
            Double totalAmount = (Double) obj[2];


            result.putIfAbsent(expenseName, new HashMap<>());

            result.get(expenseName).put(paymentMethod, totalAmount);
        }

        return result;
    }

    @Override
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(LocalDate startDate, LocalDate endDate, Integer userId) {

        List<Object[]> totals = expenseRepository.findTotalByExpenseNameAndPaymentMethodForDateRange(startDate, endDate, userId);


        Map<String, Map<String, Double>> result = new HashMap<>();
        for (Object[] obj : totals) {
            String expenseName = (String) obj[0];
            String paymentMethod = (String) obj[1];
            Double totalAmount = (Double) obj[2];


            result.putIfAbsent(expenseName, new HashMap<>());

            result.get(expenseName).put(paymentMethod, totalAmount);
        }

        return result;
    }

    @Override
    public Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod(Integer userId) {
        List<Object[]> results = expenseRepository.findTotalExpensesGroupedByCategoryAndPaymentMethod(userId);
        Map<String, Map<String, Double>> groupedExpenses = new HashMap<>();

        for (Object[] result : results) {
            String expenseName = ((String) result[0]).trim().toLowerCase();
            String paymentMethod = (String) result[1];
            Double totalAmount = (Double) result[2];

            groupedExpenses.computeIfAbsent(expenseName, k -> new HashMap<>()).merge(paymentMethod, totalAmount, Double::sum);
        }

        return groupedExpenses;
    }


    @Autowired
    private JavaMailSender mailSender;

    public String generateExcelReport(Integer userId) throws Exception {
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        User user = helper.validateUser(userId);
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Expenses");

        // Create header row with additional category columns
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Expense Name");
        headerRow.createCell(1).setCellValue("Payment Method");
        headerRow.createCell(2).setCellValue("Amount");
        headerRow.createCell(3).setCellValue("Net Amount");
        headerRow.createCell(4).setCellValue("Credit Due");
        headerRow.createCell(5).setCellValue("Type");
        headerRow.createCell(6).setCellValue("Date");
        headerRow.createCell(7).setCellValue("Category ID");
        headerRow.createCell(8).setCellValue("Comments");

        // Create a map to cache category information to avoid repeated database lookups
        Map<Integer, Category> categoryCache = new HashMap<>();

        int rowNum = 1;
        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null) continue;

            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(expense.getId());
            row.createCell(1).setCellValue(details.getExpenseName());
            row.createCell(2).setCellValue(details.getPaymentMethod());
            row.createCell(3).setCellValue(details.getAmount());
            row.createCell(4).setCellValue(details.getNetAmount());
            row.createCell(5).setCellValue(details.getCreditDue());
            row.createCell(6).setCellValue(details.getType());
            row.createCell(7).setCellValue(expense.getDate().toString());
            row.createCell(8).setCellValue(expense.getCategoryId() != null ? expense.getCategoryId() : 0);
            row.createCell(9).setCellValue(details.getComments() != null ? details.getComments() : "");
        }


        // Auto-size columns for better readability
        for (int i = 0; i < 14; i++) {
            sheet.autoSizeColumn(i);
        }

        // Create a summary sheet
        Sheet summarySheet = workbook.createSheet("Category Summary");
        Row summaryHeader = summarySheet.createRow(0);
        summaryHeader.createCell(0).setCellValue("Category ID");
        summaryHeader.createCell(1).setCellValue("Category Name");
        summaryHeader.createCell(2).setCellValue("Category Color");
        summaryHeader.createCell(3).setCellValue("Category Icon");
        summaryHeader.createCell(4).setCellValue("Category Description");
        summaryHeader.createCell(5).setCellValue("Is Global");
        summaryHeader.createCell(6).setCellValue("Total Amount");
        summaryHeader.createCell(7).setCellValue("Number of Expenses");
        summaryHeader.createCell(8).setCellValue("User Ids");
        summaryHeader.createCell(9).setCellValue("Edited UserIds");

        // Calculate totals by category
        Map<Integer, Double> categoryTotals = new HashMap<>();
        Map<Integer, Integer> categoryExpenseCounts = new HashMap<>();

        for (Expense expense : expenses) {
            Integer categoryId = expense.getCategoryId();
            if (categoryId == null) categoryId = 0;

            double amount = expense.getExpense() != null ? expense.getExpense().getAmount() : 0;
            categoryTotals.put(categoryId, categoryTotals.getOrDefault(categoryId, 0.0) + amount);
            categoryExpenseCounts.put(categoryId, categoryExpenseCounts.getOrDefault(categoryId, 0) + 1);
        }

        // Write summary data
        int summaryRowNum = 1;

        List<Category> categories = categoryService.getAllForUser(userId);
        for (Map.Entry<Integer, Double> entry : categoryTotals.entrySet()) {
            Integer categoryId = entry.getKey();
            Double totalAmount = entry.getValue();
            Integer expenseCount = categoryExpenseCounts.get(categoryId);

            Row row = summarySheet.createRow(summaryRowNum++);
            row.createCell(0).setCellValue(categoryId);

            // Get category details
            String categoryName = "Uncategorized";
            String categoryColor = "";
            String categoryIcon = "";
            String categoryDescription = "";
            Set<Integer> expenseIds = new HashSet<>();
            boolean isGlobal = false;
            Set<Integer> editedUserIds = new HashSet<>();
            Set<Integer> userIds = new HashSet<>();
            if (categoryId > 0) {
                Category category = categoryCache.get(categoryId);
                if (category != null) {
                    categoryName = category.getName();
                    categoryColor = category.getColor();
                    categoryIcon = category.getIcon();
                    categoryDescription = category.getDescription();
                    isGlobal = category.isGlobal();
                    userIds = category.getUserIds();
                    editedUserIds = category.getEditUserIds();
                }
            }

            row.createCell(1).setCellValue(categoryName);
            row.createCell(2).setCellValue(categoryColor);
            row.createCell(3).setCellValue(categoryIcon);
            row.createCell(4).setCellValue(categoryDescription);
            row.createCell(5).setCellValue(isGlobal);
            row.createCell(6).setCellValue(totalAmount);
            row.createCell(7).setCellValue(expenseCount);
            row.createCell(8).setCellValue(userIds != null ? userIds.toString() : "[]");
            row.createCell(9).setCellValue(editedUserIds != null ? editedUserIds.toString() : "[]");
        }

        // Auto-size summary columns
        for (int i = 0; i < 10; i++) {
            summarySheet.autoSizeColumn(i);
        }

        // Create a payment method summary sheet
        Sheet paymentMethodSheet = workbook.createSheet("Payment Method Summary");
        Row paymentMethodHeader = paymentMethodSheet.createRow(0);
        paymentMethodHeader.createCell(0).setCellValue("Payment Method");
        paymentMethodHeader.createCell(1).setCellValue("Total Amount");
        paymentMethodHeader.createCell(2).setCellValue("Number of Expenses");

        // Calculate totals by payment method
        Map<String, Double> paymentMethodTotals = new HashMap<>();
        Map<String, Integer> paymentMethodCounts = new HashMap<>();

        for (Expense expense : expenses) {
            if (expense.getExpense() != null) {
                String paymentMethod = expense.getExpense().getPaymentMethod();
                if (paymentMethod != null && !paymentMethod.isEmpty()) {
                    double amount = expense.getExpense().getAmount();
                    paymentMethodTotals.put(paymentMethod, paymentMethodTotals.getOrDefault(paymentMethod, 0.0) + amount);
                    paymentMethodCounts.put(paymentMethod, paymentMethodCounts.getOrDefault(paymentMethod, 0) + 1);
                }
            }
        }

        // Write payment method summary data
        int paymentMethodRowNum = 1;
        for (Map.Entry<String, Double> entry : paymentMethodTotals.entrySet()) {
            String paymentMethod = entry.getKey();
            Double totalAmount = entry.getValue();
            Integer expenseCount = paymentMethodCounts.get(paymentMethod);

            Row row = paymentMethodSheet.createRow(paymentMethodRowNum++);
            row.createCell(0).setCellValue(paymentMethod);
            row.createCell(1).setCellValue(totalAmount);
            row.createCell(2).setCellValue(expenseCount);
        }

        // Auto-size payment method columns
        for (int i = 0; i < 3; i++) {
            paymentMethodSheet.autoSizeColumn(i);
        }


        List<Budget> budgets = budgetService.getAllBudgetForUser(userId);
        Sheet budgetSheet = workbook.createSheet("Budgets");
        Row budgetHeader = budgetSheet.createRow(0);
        budgetHeader.createCell(0).setCellValue("Budget ID");
        budgetHeader.createCell(1).setCellValue("Name");
        budgetHeader.createCell(2).setCellValue("Description");
        budgetHeader.createCell(3).setCellValue("Amount");
        budgetHeader.createCell(4).setCellValue("Remaining Amount");
        budgetHeader.createCell(5).setCellValue("Start Date");
        budgetHeader.createCell(6).setCellValue("End Date");
        budgetHeader.createCell(7).setCellValue("Has Expenses");
        budgetHeader.createCell(8).setCellValue("Expenses Ids");

        int budgetRowNum = 1;
        for (Budget budget : budgets) {
            Row row = budgetSheet.createRow(budgetRowNum++);
            row.createCell(0).setCellValue(budget.getId());
            row.createCell(1).setCellValue(budget.getName());
            row.createCell(2).setCellValue(budget.getDescription());
            row.createCell(3).setCellValue(budget.getAmount());
            row.createCell(4).setCellValue(budget.getRemainingAmount());
            row.createCell(5).setCellValue(budget.getStartDate() != null ? budget.getStartDate().toString() : "");
            row.createCell(6).setCellValue(budget.getEndDate() != null ? budget.getEndDate().toString() : "");
            row.createCell(7).setCellValue(budget.isBudgetHasExpenses());
            row.createCell(8).setCellValue(budget.getExpenseIds() != null ? budget.getExpenseIds().toString() : "");
        }
        for (int i = 0; i < 9; i++) {
            budgetSheet.autoSizeColumn(i);
        }
        // Create the file
        String emailPrefix = user.getEmail().split("@")[0];  // Get the part before '@' in the email address
        String userFolderName = emailPrefix + "_" + userId;
        String userFolderPath = Paths.get(System.getProperty("user.home"), "reports", userFolderName).toString();

        File userFolder = new File(userFolderPath);
        if (!userFolder.exists()) {
            userFolder.mkdirs();
        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss");
        String timestamp = dateFormat.format(new Date());
        String filePath = Paths.get(userFolderPath, "expenses_report_" + timestamp + ".xlsx").toString();

        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
            workbook.write(fileOut);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }


        workbook.close();

        return filePath;
    }


    @Override
    public void sendEmailWithAttachment(String toEmail, String subject, String body, String attachmentPath) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body);
        helper.addAttachment("expenses_report.xlsx", new File(attachmentPath));

        mailSender.send(message);
    }


    @Override
    public ResponseEntity<String> generateAndSendMonthlyReport(ReportRequest request) {
        try {

            String reportsDir = System.getProperty("user.home") + "/reports";
            Files.createDirectories(Paths.get(reportsDir));

            String uniqueFileName = "monthly_report_" + UUID.randomUUID() + ".xlsx";
            Path reportPath = Paths.get(reportsDir, uniqueFileName);


            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Monthly Report");

            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Date");
            headerRow.createCell(1).setCellValue("Description");
            headerRow.createCell(2).setCellValue("Amount");


            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("2024-11-01");
            dataRow.createCell(1).setCellValue("Office Supplies");
            dataRow.createCell(2).setCellValue(150.00);


            try (FileOutputStream fileOut = new FileOutputStream(reportPath.toFile())) {
                workbook.write(fileOut);
            }
            workbook.close();


            sendEmailWithAttachment(request.getToEmail(), "Monthly Expense Report", "Please find the attached monthly expense report.", reportPath.toString());

            return ResponseEntity.ok("Monthly report sent to " + request.getToEmail());
        } catch (IOException | MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to generate and send the report");
        }
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
    public List<Expense> getExpensesByMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return expenseRepository.findByDateBetween(startDate, endDate);
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
            if (details.getAmount() == 0.0) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'amount' in expense details: " + expense);
            }
            if (details.getType() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'type' in expense details: " + expense);
            }
            if (details.getPaymentMethod() == null) {
                throw new IllegalArgumentException("Invalid data: Missing required field 'paymentMethod' in expense details: " + expense);
            }
            if (details.getNetAmount() == 0.0) {
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
    public double calculateTotalCreditDue(List<ExpenseDTO> processedExpenses) {
        double totalCreditDue = 0.0;

        for (ExpenseDTO expense : processedExpenses) {
            totalCreditDue += expense.getExpense().getCreditDue();
        }

        return totalCreditDue;
    }


    @Override
    public Map<String, Map<String, Double>> categorizeExpenses(List<ExpenseDTO> processedExpenses) {
        Map<String, Map<String, Double>> categorizedExpenses = new HashMap<>();

        for (ExpenseDTO expense : processedExpenses) {
            String type = expense.getExpense().getType();
            String paymentMethod = expense.getExpense().getPaymentMethod();
            double amount = expense.getExpense().getAmount();

            categorizedExpenses.computeIfAbsent(type, k -> new HashMap<>()).merge(paymentMethod, amount, Double::sum);
        }

        return categorizedExpenses;
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

    public Set<String> getPaymentMethodNames(List<ExpenseDTO> expenses) {
        return expenses.stream().map(expense -> expense.getExpense().getPaymentMethod()).collect(Collectors.toSet());
    }

    @Override
    public List<Expense> getExpensesByIds(List<Integer> ids) {
        return expenseRepository.findByIdIn(ids);
    }


    @Override
    public List<Expense> saveExpenses(List<Expense> expenses) {
        int batchsize = 100;
        int i = 0;
        List<Expense> saved = new ArrayList<>();
        for (Expense e : expenses) {
            entityManager.persist(e);
            saved.add(e);
            if (++i % batchsize == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }

        entityManager.flush();
        entityManager.clear();
        return saved;
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


    public Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(Integer userId, String sortOrder, int page, int size, String sortBy) throws Exception {
        Sort sort = Sort.by(Sort.Order.by(sortBy).with(Sort.Direction.fromString(sortOrder)));
        User user = helper.validateUser(userId);
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
    public Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date) {

        List<Expense> expensesBeforeDate = expenseRepository.findByUserAndExpenseNameBeforeDate(userId, expenseName, date);
        return expensesBeforeDate.get(0);
    }


    @Override
    public List<Expense> saveExpenses(List<ExpenseDTO> expenseDTOs, Integer userId) throws Exception {

        User user = helper.validateUser(userId);
        if (expenseDTOs == null || expenseDTOs.isEmpty()) {
            throw new IllegalArgumentException("Expense DTO list cannot be null or empty.");
        }

        List<Expense> savedExpenses = new ArrayList<>();
        List<String> errorMessages = new ArrayList<>();


        Category othersCategory = null;
        try {

            List<Category> othersCategories = categoryService.getByName(OTHERS, userId);

            if (othersCategories != null && !othersCategories.isEmpty()) {
                othersCategory = othersCategories.get(0);
                logger.info("Found existing 'Others' category with ID: " + othersCategory.getId());
            } else {

                othersCategory = createOthersCategory(userId);
                logger.info("Created new 'Others' category with ID: " + othersCategory.getId());
            }
        } catch (Exception e) {
            logger.info("Error preparing 'Others' category: " + e.getMessage());
            e.printStackTrace();

        }

        for (ExpenseDTO dto : expenseDTOs) {
            try {
                Expense expense = new Expense();
                expense.setUserId(userId);
                expense.setDate(LocalDate.parse(dto.getDate()));


                ExpenseDetailsDTO detailsDTO = dto.getExpense();
                if (detailsDTO == null) {
                    errorMessages.add("Expense details cannot be null for date: " + dto.getDate());
                    continue;
                }

                ExpenseDetails details = new ExpenseDetails();
                details.setExpenseName(detailsDTO.getExpenseName());
                details.setAmount(detailsDTO.getAmount());
                details.setType(detailsDTO.getType());
                details.setPaymentMethod(detailsDTO.getPaymentMethod());
                details.setNetAmount(detailsDTO.getNetAmount());
                details.setComments(detailsDTO.getComments());
                details.setCreditDue(detailsDTO.getCreditDue());
                details.setExpense(expense);
                expense.setExpense(details);


                Expense savedExpense = expenseRepository.save(expense);


                Category category = null;
                Integer categoryId = dto.getCategoryId();


                if (categoryId != null) {
                    try {
                        category = categoryService.getById(categoryId, userId);
                    } catch (Exception e) {
                        System.out.println("Specified category not found: " + e.getMessage());

                    }
                }


                if (category == null) {
                    if (othersCategory != null) {
                        category = othersCategory;
                    } else {
                        try {
                            List<Category> existingOthers = categoryService.getByName(OTHERS, userId);
                            if (existingOthers != null && !existingOthers.isEmpty()) {
                                category = existingOthers.get(0);

                                othersCategory = category;
                            } else {
                                category = createOthersCategory(userId);
                                othersCategory = category;
                            }
                        } catch (Exception e) {
                            errorMessages.add("Failed to create 'Others' category: " + e.getMessage());
                            expenseRepository.delete(savedExpense);
                            continue;
                        }
                    }
                }


                savedExpense.setCategoryId(category.getId());
                savedExpense.setCategoryName(category.getName());


                if (category.getExpenseIds() == null) {
                    category.setExpenseIds(new HashMap<>());
                }

                Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(userId, new HashSet<>());
                expenseSet.add(savedExpense.getId());
                category.getExpenseIds().put(userId, expenseSet);


                categoryService.save(category);


                Set<Integer> validBudgetIds = new HashSet<>();
                if (dto.getBudgetIds() != null) {
                    for (Integer budgetId : dto.getBudgetIds()) {
                        Budget budgetOpt = budgetService.getBudgetById(budgetId, userId);
                        if (budgetOpt != null) {
                            Budget budget = budgetOpt;
                            if (!savedExpense.getDate().isBefore(budget.getStartDate()) && !savedExpense.getDate().isAfter(budget.getEndDate())) {
                                validBudgetIds.add(budgetId);
                            }
                        }
                    }
                }
                savedExpense.setBudgetIds(validBudgetIds);


                savedExpense = expenseRepository.save(savedExpense);
                savedExpenses.add(savedExpense);


                for (Integer budgetId : validBudgetIds) {
                    Budget budget = budgetService.getBudgetById(budgetId, userId);
                    if (budget != null) {
                        if (budget.getExpenseIds() == null) budget.setExpenseIds(new HashSet<>());
                        budget.getExpenseIds().add(savedExpense.getId());
                        budget.setBudgetHasExpenses(true);
                        budgetService.save( budget);
                    }
                }


                // auditExpenseService.logAudit(user, savedExpense.getId(), "Expense Created", "Expense: " + savedExpense.getExpense().getExpenseName() + ", Amount: " + savedExpense.getExpense().getAmount());

            } catch (Exception e) {
                errorMessages.add("Failed to save expense for date " + dto.getDate() + ": " + e.getMessage());
            }
        }

        if (!errorMessages.isEmpty()) {
            throw new RuntimeException("Errors occurred while saving expenses: " + String.join("; ", errorMessages));
        }

        return savedExpenses;
    }

    private Category createOthersCategory(Integer userId) throws Exception {
        try {
            List<Category> existingCategories = categoryService.getByName(OTHERS, userId);
            if (existingCategories != null && !existingCategories.isEmpty()) {
                Category existingCategory = existingCategories.get(0);


                if (existingCategory.getUserIds() == null) {
                    existingCategory.setUserIds(new HashSet<>());
                }
                existingCategory.getUserIds().add(userId);

                if (existingCategory.getEditUserIds() == null) {
                    existingCategory.setEditUserIds(new HashSet<>());
                }
                existingCategory.getEditUserIds().add(userId);

                return categoryService.save( existingCategory);
            }


            Category newCategory = new Category();
            newCategory.setName(OTHERS);
            newCategory.setDescription("Default category for uncategorized expenses");
            newCategory.setColor("#808080");
            newCategory.setIcon("category");
            newCategory.setGlobal(true);


            newCategory.setUserIds(new HashSet<>());
            newCategory.getUserIds().add(userId);

            newCategory.setEditUserIds(new HashSet<>());
            newCategory.getEditUserIds().add(userId);

            newCategory.setExpenseIds(new HashMap<>());
            return categoryService.create(newCategory, userId);
        } catch (Exception e) {
            System.err.println("Error creating 'Others' category: " + e.getMessage());
            e.printStackTrace();
            throw new Exception("Failed to create 'Others' category: " + e.getMessage());
        }
    }


    @Override
    public Map<String, Object> getExpenseByName(Integer userId, int year) {
        List<Object[]> results = expenseRepository.findExpenseByNameAndUserId(year, userId);
        Map<String, Object> response = new LinkedHashMap<>();
        String[] labels = new String[Math.min(results.size(), 5)];
        Double[] data = new Double[Math.min(results.size(), 5)];

        for (int i = 0; i < Math.min(results.size(), 5); i++) {
            labels[i] = (String) results.get(i)[0];
            data[i] = (Double) results.get(i)[1];
        }

        response.put("labels", labels);
        response.put("datasets", List.of(Map.of("data", data)));
        return response;
    }

    @Override
    public Map<String, Object> getMonthlyExpenses(Integer userId, int year) {
        List<Object[]> results = expenseRepository.findMonthlyLossExpensesByUserId(year, userId);

        String[] labels = new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Double[] data = new Double[12];
        Arrays.fill(data, 0.0);

        for (Object[] result : results) {
            int month = ((Number) result[0]).intValue();
            double total = ((Number) result[1]).doubleValue();
            data[month - 1] = total;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("labels", labels);
        response.put("datasets", List.of(Map.of("label", "Expenses ($)", "data", data)));

        return response;
    }


    @Override
    public Map<String, Object> getExpenseTrend(Integer userId, int year) {
        List<Object[]> results = expenseRepository.findMonthlyLossExpensesByUserId(year, userId);

        String[] labels = new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Double[] data = new Double[12];
        Arrays.fill(data, 0.0);

        for (Object[] result : results) {
            int month = ((Number) result[0]).intValue();
            double total = ((Number) result[1]).doubleValue();
            if (month >= 1 && month <= 12) {
                data[month - 1] = total;
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("labels", labels);
        response.put("datasets", List.of(Map.of("label", "Expense Trend ($)", "data", data)));

        return response;
    }


    @Override
    public Map<String, Object> getPaymentMethodDistribution(Integer userId, int year) {
        List<Object[]> results = expenseRepository.findPaymentMethodDistributionByUserId(year, userId);
        Map<String, Object> response = new LinkedHashMap<>();
        String[] labels = new String[results.size()];
        Double[] data = new Double[results.size()];

        for (int i = 0; i < results.size(); i++) {
            labels[i] = (String) results.get(i)[0];
            data[i] = (Double) results.get(i)[1];
        }

        response.put("labels", labels);
        response.put("datasets", List.of(Map.of("data", data)));
        return response;
    }

    @Override
    public Map<String, Object> getCumulativeExpenses(Integer userId, int year) {

        List<Expense> results = expenseRepository.findExpensesWithDetailsByUserIdAndYear(year, userId);
        Map<Month, Double> monthlyTotals = new TreeMap<>();
        for (Expense expense : results) {

            ExpenseDetails details = expense.getExpense();

            Month month = expense.getDate().getMonth();
            double amount = details.getAmount();


            monthlyTotals.merge(month, amount, Double::sum);
        }


        List<Double> cumulativeData = new ArrayList<>();
        double cumulativeSum = 0.0;
        for (Month month : monthlyTotals.keySet()) {
            cumulativeSum += monthlyTotals.get(month);
            cumulativeData.add(cumulativeSum);
        }


        Map<String, Object> response = new LinkedHashMap<>();
        String[] labels = new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Double[] data = new Double[12];
        Arrays.fill(data, 0.0);


        Map<Month, Integer> monthToIndex = new HashMap<>();
        monthToIndex.put(Month.JANUARY, 0);
        monthToIndex.put(Month.FEBRUARY, 1);
        monthToIndex.put(Month.MARCH, 2);
        monthToIndex.put(Month.APRIL, 3);
        monthToIndex.put(Month.MAY, 4);
        monthToIndex.put(Month.JUNE, 5);
        monthToIndex.put(Month.JULY, 6);
        monthToIndex.put(Month.AUGUST, 7);
        monthToIndex.put(Month.SEPTEMBER, 8);
        monthToIndex.put(Month.OCTOBER, 9);
        monthToIndex.put(Month.NOVEMBER, 10);
        monthToIndex.put(Month.DECEMBER, 11);


        int dataIndex = 0;
        for (Month month : monthlyTotals.keySet()) {
            Integer index = monthToIndex.get(month);
            if (index != null && dataIndex < cumulativeData.size()) {
                data[index] = cumulativeData.get(dataIndex);
                dataIndex++;
            }
        }


        if (!cumulativeData.isEmpty()) {
            double lastCumulative = cumulativeData.get(cumulativeData.size() - 1);
            for (int i = 0; i < data.length; i++) {
                if (data[i] == 0.0) {
                    data[i] = lastCumulative;
                }
            }
        }

        response.put("labels", labels);
        response.put("datasets", List.of(Map.of("label", "Cumulative Expenses ($)", "data", data)));

        return response;
    }


    @Override
    public Map<String, Object> getExpenseNameOverTime(Integer userId, int year, int limit) {
        List<Expense> expenses = expenseRepository.findByYearAndUser(year, userId);

        Map<String, Map<Integer, Double>> monthlySums = new HashMap<>();
        Map<String, Double> totalPerExpense = new HashMap<>();

        for (Expense e : expenses) {
            ExpenseDetails ed = e.getExpense();
            if (ed == null) continue;

            String expenseName = ed.getExpenseName();
            if (expenseName == null || expenseName.toLowerCase().contains("given")) continue;

            int month = e.getDate().getMonthValue();  // 1 = Jan, 12 = Dec
            double amount = ed.getAmount();

            monthlySums.computeIfAbsent(expenseName, k -> new HashMap<>()).merge(month, amount, Double::sum);

            totalPerExpense.merge(expenseName, amount, Double::sum);
        }


        List<String> topExpenseNames = totalPerExpense.entrySet().stream().sorted((a, b) -> Double.compare(b.getValue(), a.getValue())).limit(limit).map(Map.Entry::getKey).toList();

        String[] labels = new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("labels", labels);

        List<Map<String, Object>> datasets = new ArrayList<>();

        for (String name : topExpenseNames) {
            List<Double> data = new ArrayList<>(Collections.nCopies(12, 0.0));
            Map<Integer, Double> monthData = monthlySums.getOrDefault(name, new HashMap<>());
            for (Map.Entry<Integer, Double> entry : monthData.entrySet()) {
                data.set(entry.getKey() - 1, entry.getValue());
            }
            datasets.add(Map.of("label", name, "data", data));
        }

        response.put("datasets", datasets);
        return response;
    }


    @Override
    public List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);

        Map<LocalDate, Double> dailySpending = new HashMap<>();

        for (Expense e : expenses) {
            if (e.getExpense() != null) {
                ExpenseDetails details = e.getExpense();
                if ("loss".equalsIgnoreCase(details.getType()) && !CREDIT_PAID.equalsIgnoreCase(details.getPaymentMethod())) {
                    LocalDate date = e.getDate();
                    double amount = details.getAmount();
                    dailySpending.merge(date, amount, Double::sum);
                }
            }
        }

        List<Map<String, Object>> response = new ArrayList<>();
        LocalDate date = startOfMonth;
        while (!date.isAfter(endOfMonth)) {
            Map<String, Object> dayEntry = new HashMap<>();
            dayEntry.put("day", date.toString());
            dayEntry.put("spending", dailySpending.getOrDefault(date, 0.0));
            response.add(dayEntry);
            date = date.plusDays(1);
        }

        return response;
    }


    @Override
    public List<Map<String, Object>> getMonthlySpendingAndIncomeCurrentMonth(Integer userId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);

        System.out.println("Expenses for current month: " + expenses.size());

        double totalSpending = expenses.stream().filter(e -> e.getExpense() != null).filter(e -> "loss".equalsIgnoreCase(e.getExpense().getType())).filter(e -> !CREDIT_PAID.equalsIgnoreCase(e.getExpense().getPaymentMethod())).mapToDouble(e -> e.getExpense().getAmount()).sum();

        double totalIncome = expenses.stream().filter(e -> e.getExpense() != null).filter(e -> "gain".equalsIgnoreCase(e.getExpense().getType())).filter(e -> CASH.equalsIgnoreCase(e.getExpense().getPaymentMethod())).mapToDouble(e -> e.getExpense().getAmount()).sum();

        List<Map<String, Object>> response = new ArrayList<>();

        Map<String, Object> spendingData = new HashMap<>();
        spendingData.put("name", "Spending");
        spendingData.put("value", totalSpending);
        response.add(spendingData);

        Map<String, Object> incomeData = new HashMap<>();
        incomeData.put("name", "Income");
        incomeData.put("value", totalIncome);
        response.add(incomeData);

        return response;
    }


    @Override
    public List<Map<String, Object>> getExpenseDistributionCurrentMonth(Integer userId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);

        Map<String, Double> expenseNameTotals = expenses.stream().filter(e -> e.getExpense() != null).collect(Collectors.groupingBy(e -> e.getExpense().getExpenseName(), Collectors.summingDouble(e -> e.getExpense().getAmount())));

        return expenseNameTotals.entrySet().stream().sorted(Map.Entry.<String, Double>comparingByValue().reversed()).limit(5).map(entry -> {
            Map<String, Object> data = new HashMap<>();
            data.put("name", entry.getKey());
            data.put("value", entry.getValue());
            return data;
        }).collect(Collectors.toList());
    }


    private List<Expense> getExpensesWithinRange(Integer userId, String rangeType, int offset, String flowType) {
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (rangeType.toLowerCase()) {
            case WEEK:
                startDate = now.minusWeeks(offset).with(DayOfWeek.MONDAY);
                endDate = startDate.plusDays(6);
                break;
            case MONTH:
                startDate = now.minusMonths(offset).withDayOfMonth(1);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                break;
            case YEAR:

                startDate = now.minusYears(offset).withDayOfYear(1);
                endDate = startDate.withDayOfYear(startDate.lengthOfYear());
                break;
            default:
                startDate = now.withDayOfMonth(1);
                endDate = now.withDayOfMonth(now.lengthOfMonth());
        }

        return getExpensesWithinRange(userId, startDate, endDate, flowType);
    }

    @Override
    public List<Expense> getExpensesWithinRange(Integer userId, LocalDate startDate, LocalDate endDate, String flowType) {

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
    public List<Expense> getExpensesByCategoryId(Integer categoryId, Integer userId) {
        try {

            Category category = categoryService.getById(categoryId, userId);
            if (category == null) {
                throw new RuntimeException("Category not found with ID: " + categoryId);
            }


            Set<Integer> expenseIds = new HashSet<>();
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                expenseIds = category.getExpenseIds().get(userId);
            }

            if (expenseIds.isEmpty()) {
                return new ArrayList<>();
            }


            List<Expense> expenses = expenseRepository.findAllByUserIdAndIdIn(userId, expenseIds);

            return expenses;
        } catch (Exception e) {
            System.out.println("Error retrieving expenses by category ID: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve expenses for category ID: " + categoryId, e);
        }
    }


    @Override
    @Transactional
    public Map<Category, List<Expense>> getAllExpensesByCategories(Integer userId) {

        List<Category> userCategories = categoryService.getAllForUser(userId);

        List<Expense> userExpenses = getAllExpenses(userId);


        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();


        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }


        for (Expense expense : userExpenses) {
            for (Category category : userCategories) {

                if (category.getExpenseIds() != null) {
                    for (Map.Entry<Integer, Set<Integer>> entry : category.getExpenseIds().entrySet()) {
                        if (entry.getValue().contains(expense.getId())) {
                            categoryExpensesMap.get(category).add(expense);
                            break;
                        }
                    }
                }
            }
        }

        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        return categoryExpensesMap;
    }


    @Override
    public Map<String, Object> getFilteredExpensesByCategories(Integer userId, String rangeType, int offset, String flowType) {

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
                startDate = now.minusDays(30);  // Default to last 30 days
                endDate = now;
                break;
            default:
                throw new IllegalArgumentException("Invalid rangeType. Valid options are: week, month, year, custom");
        }


        List<Category> userCategories = categoryService.getAllForUser(userId);


        List<Expense> filteredExpenses = getExpensesWithinRange(userId, startDate, endDate, flowType);


        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();

        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }


        for (Expense expense : filteredExpenses) {
            for (Category category : userCategories) {
                // Check if this expense is associated with this category
                if (category.getExpenseIds() != null) {
                    for (Map.Entry<Integer, Set<Integer>> entry : category.getExpenseIds().entrySet()) {
                        if (entry.getValue().contains(expense.getId())) {
                            categoryExpensesMap.get(category).add(expense);
                            break;
                        }
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


            Map<String, Object> categoryDetails = buildCategoryDetailsMap(category, expenses, categoryTotal);


            response.put(category.getName(), categoryDetails);
        }


        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCategories", totalCategories);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("categoryTotals", categoryTotals);
        summary.put("dateRange", Map.of("startDate", startDate, "endDate", endDate, "rangeType", rangeType, "offset", offset, "flowType", flowType != null ? flowType : "all"));

        response.put("summary", summary);

        return response;
    }

    private Map<String, Object> buildCategoryDetailsMap(Category category, List<Expense> expenses, double categoryTotal) {
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


        List<Map<String, Object>> formattedExpenses = formatExpensesForResponse(expenses);

        categoryDetails.put("expenses", formattedExpenses);
        categoryDetails.put("totalAmount", categoryTotal);
        categoryDetails.put("expenseCount", expenses.size());

        return categoryDetails;
    }


    private List<Map<String, Object>> formatExpensesForResponse(List<Expense> expenses) {
        List<Map<String, Object>> formattedExpenses = new ArrayList<>();
        for (Expense expense : expenses) {
            Map<String, Object> expenseMap = new HashMap<>();
            expenseMap.put("id", expense.getId());
            expenseMap.put("date", expense.getDate());

            if (expense.getExpense() != null) {
                ExpenseDetails details = expense.getExpense();
                Map<String, Object> detailsMap = new HashMap<>();
                detailsMap.put("id", details.getId());
                detailsMap.put("expenseName", details.getExpenseName());
                detailsMap.put("amount", details.getAmount());
                detailsMap.put("type", details.getType());
                detailsMap.put("paymentMethod", details.getPaymentMethod());
                detailsMap.put("netAmount", details.getNetAmount());
                detailsMap.put("comments", details.getComments());
                detailsMap.put("creditDue", details.getCreditDue());

                expenseMap.put("details", detailsMap);
            }

            formattedExpenses.add(expenseMap);
        }
        return formattedExpenses;
    }

    @Override
    public Map<String, Object> getFilteredExpensesByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate, String flowType) {


        List<Category> userCategories = categoryService.getAllForUser(userId);


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
                } else if (!flowType.equalsIgnoreCase("inflow") && !flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase(flowType)) {
                    continue;
                }
            }

            for (Category category : userCategories) {

                if (category.getExpenseIds() != null) {
                    for (Map.Entry<Integer, Set<Integer>> entry : category.getExpenseIds().entrySet()) {
                        if (entry.getValue().contains(expense.getId())) {
                            categoryExpensesMap.get(category).add(expense);
                            break;
                        }
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


            List<Map<String, Object>> formattedExpenses = new ArrayList<>();
            for (Expense expense : expenses) {
                Map<String, Object> expenseMap = new HashMap<>();
                expenseMap.put("id", expense.getId());
                expenseMap.put("date", expense.getDate());

                if (expense.getExpense() != null) {
                    ExpenseDetails details = expense.getExpense();
                    Map<String, Object> detailsMap = new HashMap<>();
                    detailsMap.put("id", details.getId());
                    detailsMap.put("expenseName", details.getExpenseName());
                    detailsMap.put("amount", details.getAmount());
                    detailsMap.put("type", details.getType());
                    detailsMap.put("paymentMethod", details.getPaymentMethod());
                    detailsMap.put("netAmount", details.getNetAmount());
                    detailsMap.put("comments", details.getComments());
                    detailsMap.put("creditDue", details.getCreditDue());

                    expenseMap.put("details", detailsMap);
                }

                formattedExpenses.add(expenseMap);
            }

            categoryDetails.put("expenses", formattedExpenses);
            categoryDetails.put("totalAmount", categoryTotal);
            categoryDetails.put("expenseCount", expenses.size());


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
    public Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, LocalDate fromDate, LocalDate toDate, String flowType) {

        // Get filtered expenses for the user
        List<Expense> filteredExpenses = getExpensesWithinRange(userId, fromDate, toDate, flowType);

        // Group expenses by payment method
        Map<String, List<Expense>> paymentMethodExpensesMap = new HashMap<>();
        for (Expense expense : filteredExpenses) {
            if (flowType != null && !flowType.isEmpty()) {
                String expenseType = expense.getExpense().getType();
                if (flowType.equalsIgnoreCase("inflow") && !expenseType.equalsIgnoreCase("gain")) {
                    continue;
                } else if (flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase("loss")) {
                    continue;
                } else if (!flowType.equalsIgnoreCase("inflow") && !flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase(flowType)) {
                    continue;
                }
            }
            String paymentMethod = expense.getExpense() != null && expense.getExpense().getPaymentMethod() != null ? expense.getExpense().getPaymentMethod() : "Unknown";
            paymentMethodExpensesMap.computeIfAbsent(paymentMethod, k -> new ArrayList<>()).add(expense);
        }

        // Remove payment methods with no expenses
        paymentMethodExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        // Prepare response
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
            List<Map<String, Object>> formattedExpenses = new ArrayList<>();
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    methodTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
                Map<String, Object> expenseMap = new HashMap<>();
                expenseMap.put("id", expense.getId());
                expenseMap.put("date", expense.getDate());
                if (expense.getExpense() != null) {
                    ExpenseDetails details = expense.getExpense();
                    Map<String, Object> detailsMap = new HashMap<>();
                    detailsMap.put("id", details.getId());
                    detailsMap.put("expenseName", details.getExpenseName());
                    detailsMap.put("amount", details.getAmount());
                    detailsMap.put("type", details.getType());
                    detailsMap.put("paymentMethod", details.getPaymentMethod());
                    detailsMap.put("netAmount", details.getNetAmount());
                    detailsMap.put("comments", details.getComments());
                    detailsMap.put("creditDue", details.getCreditDue());
                    expenseMap.put("details", detailsMap);
                }
                formattedExpenses.add(expenseMap);
            }
            paymentMethodTotals.put(paymentMethod, methodTotal);

            Map<String, Object> methodDetails = new HashMap<>();
            methodDetails.put("paymentMethod", paymentMethod);
            methodDetails.put("expenses", formattedExpenses);
            methodDetails.put("totalAmount", methodTotal);
            methodDetails.put("expenseCount", expenses.size());

            response.put(paymentMethod, methodDetails);
        }

        // Add summary statistics
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaymentMethods", totalPaymentMethods);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("paymentMethodTotals", paymentMethodTotals);

        // Add date range information
        Map<String, Object> dateRangeInfo = new HashMap<>();
        dateRangeInfo.put("fromDate", fromDate);
        dateRangeInfo.put("toDate", toDate);
        dateRangeInfo.put("flowType", flowType);
        summary.put("dateRange", dateRangeInfo);

        response.put("summary", summary);

        return response;
    }


    @Override
    public Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, String rangeType, int offset, String flowType) {
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
        Map<String, List<Expense>> paymentMethodExpensesMap = new HashMap<>();

        for (Expense expense : filteredExpenses) {
            String pmName = (expense.getExpense() != null && expense.getExpense().getPaymentMethod() != null) ? expense.getExpense().getPaymentMethod() : "Unknown";
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

            // Here, you would fetch the PaymentMethod entity & populate extra info:
            PaymentMethod pmEntity = paymentMethodService.getByNameWithService(userId, pmName);
            Map<String, Object> methodDetails = new HashMap<>();
            methodDetails.put("id", pmEntity != null ? pmEntity.getId() : null);
            methodDetails.put("name", pmEntity != null ? pmEntity.getName() : pmName);
            methodDetails.put("description", pmEntity != null ? pmEntity.getDescription() : "");
            methodDetails.put("isGlobal", pmEntity != null && pmEntity.isGlobal());
            methodDetails.put("icon", pmEntity != null ? pmEntity.getIcon() : "");
            methodDetails.put("color", pmEntity != null ? pmEntity.getColor() : "");
            methodDetails.put("editUserIds", pmEntity != null && pmEntity.getEditUserIds() != null ? pmEntity.getEditUserIds() : new ArrayList<>());
            methodDetails.put("userIds", pmEntity != null && pmEntity.getUserIds() != null ? pmEntity.getUserIds() : new ArrayList<>());
            methodDetails.put("expenseCount", expenses.size());
            methodDetails.put("totalAmount", methodTotal);
            methodDetails.put("expenses", formatExpensesForResponse(expenses));

            response.put(pmName, methodDetails);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaymentMethods", totalPaymentMethods);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("paymentMethodTotals", paymentMethodTotals);
        summary.put("dateRange", Map.of("startDate", startDate, "endDate", endDate, "rangeType", rangeType, "offset", offset, "flowType", flowType != null ? flowType : "all"));
        response.put("summary", summary);

        return response;
    }

    private String getThemeAppropriateColor(String categoryName) {
        Map<String, String> colorMap = new HashMap<>();
        colorMap.put("food", "#5b7fff");       // Blue
        colorMap.put("groceries", "#00dac6");  // Teal
        colorMap.put("shopping", "#bb86fc");   // Purple
        colorMap.put("entertainment", "#ff7597"); // Pink
        colorMap.put("utilities", "#ffb74d");  // Orange
        colorMap.put("rent", "#ff5252");       // Red
        colorMap.put("transportation", "#69f0ae"); // Green
        colorMap.put("health", "#ff4081");     // Bright Pink
        colorMap.put("education", "#64b5f6");  // Light Blue
        colorMap.put("travel", "#ffd54f");     // Yellow
        colorMap.put("others", "#b0bec5");     // Gray
        colorMap.put("salary", "#69f0ae");     // Green
        colorMap.put("investment", "#00e676"); // Bright Green
        colorMap.put("gift", "#e040fb");       // Violet
        colorMap.put("refund", "#ffab40");     // Amber


        String lowerCaseName = categoryName.toLowerCase();
        for (Map.Entry<String, String> entry : colorMap.entrySet()) {
            if (lowerCaseName.contains(entry.getKey())) {
                return entry.getValue();
            }
        }


        int hash = categoryName.hashCode();
        String[] colorArray = colorMap.values().toArray(new String[0]);
        int index = Math.abs(hash % colorArray.length);
        return colorArray[index];
    }
}
