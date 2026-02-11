package com.jaya.service.expenses.impl;

import ch.qos.logback.classic.Logger;
import com.jaya.async.AsyncExpensePostProcessor;
import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.dto.PaymentMethodEvent;
import com.jaya.common.dto.UserDTO;
import com.jaya.events.BudgetExpenseEvent;
import com.jaya.events.CategoryExpenseEvent;
import com.jaya.exceptions.ResourceNotFoundException;
import com.jaya.exceptions.UserException;
import com.jaya.kafka.BudgetExpenseKafkaProducerService;
import com.jaya.kafka.AuditEventProducer;
import com.jaya.kafka.CategoryExpenseKafkaProducerService;
import com.jaya.kafka.PaymentMethodKafkaProducerService;
import com.jaya.models.*;
import com.jaya.repository.ExpenseReportRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.*;
import com.jaya.service.expenses.ExpenseCoreService;
import com.jaya.util.JsonConverter;
import com.jaya.util.ServiceHelper;
import com.jaya.util.BulkProgressTracker;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.persistence.FlushModeType;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.hibernate.SessionFactory;
import org.hibernate.StatelessSession;
import org.hibernate.Transaction;
import org.springframework.web.context.request.RequestAttributes;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseCoreServiceImpl implements ExpenseCoreService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseReportRepository expenseReportRepository;

    public static final String OTHERS = "Others";
    private static final String CREDIT_NEED_TO_PAID = "creditNeedToPaid";
    private static final String CREDIT_PAID = "creditPaid";
    private static final String CASH = "cash";
    private static final String MONTH = "month";
    private static final String YEAR = "year";
    private static final String WEEK = "week";

    private static final Logger logger = (Logger) LoggerFactory.getLogger(ExpenseCoreServiceImpl.class);

    @Autowired
    private ServiceHelper helper;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private AsyncExpensePostProcessor asyncExpensePostProcessor;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private jakarta.persistence.EntityManagerFactory entityManagerFactory;

    @Autowired
    private BudgetServices budgetService;

    @Autowired
    private CategoryExpenseKafkaProducerService categoryExpenseKafkaProducer;

    @Autowired
    private PaymentMethodKafkaProducerService paymentMethodKafkaProducer;

    @Autowired
    private CategoryServiceWrapper categoryService;

    @Autowired
    private KafkaProducerService producer;

    @Autowired
    private PaymentMethodServices paymentMethodService;

    @Autowired
    private JsonConverter jsonConverter;

    @Autowired
    private BudgetExpenseKafkaProducerService budgetExpenseKafkaProducerService;

    @Autowired
    private BulkProgressTracker progressTracker;

    @Autowired
    private AuditEventProducer auditEventProducer;

    @Autowired
    private com.jaya.mapper.ExpenseMapper expenseMapper;

    @Autowired
    private UserSettingsService userSettingsService;

    public ExpenseCoreServiceImpl(ExpenseRepository expenseRepository,
            ExpenseReportRepository expenseReportRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseReportRepository = expenseReportRepository;
    }

    @Override
    public ExpenseDTO addExpense(ExpenseDTO expenseDTO, Integer userId) throws Exception {

        UserDTO UserDTO = helper.validateUser(userId);

        Expense expense = expenseMapper.toEntity(expenseDTO);
        expense.setId(null);
        if (expense.getExpense() != null) {
            expense.getExpense().setId(null);
        }

        validateExpenseData(expense, UserDTO);

        expense.setUserId(userId);
        if (expense.getBudgetIds() == null)
            expense.setBudgetIds(new HashSet<>());

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

        details.setExpense(expense);
        expense.setExpense(details);

        Set<Integer> validBudgetIds = validateAndExtractBudgetIds(expense, UserDTO);
        expense.setBudgetIds(validBudgetIds);

        handleCategory(expense, UserDTO);

        Expense savedExpense = expenseRepository.save(expense);

        handlePaymentMethod(savedExpense, UserDTO);

        updateCategoryExpenseIds(savedExpense, userId);

        updateBudgetExpenseLinks(savedExpense, validBudgetIds, UserDTO);

        publishExpenseAuditEvent("CREATE", savedExpense, UserDTO, null, expenseToMap(savedExpense), "Expense created",
                "SUCCESS");

        com.jaya.dto.UserSettingsDTO userSettings = userSettingsService.getUserSettings(userId);
        Boolean maskSensitiveData = userSettings != null ? userSettings.getMaskSensitiveData() : false;

        return expenseMapper.toDTO(savedExpense, maskSensitiveData);
    }

    @Override
    public Expense copyExpense(Integer userId, Integer expenseId) throws Exception {
        UserDTO UserDTO = helper.validateUser(userId);
        Expense original = getExpenseById(expenseId, UserDTO.getId());
        if (original == null) {
            throw new RuntimeException("Expense not found with ID: " + expenseId);
        }

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
            details.setExpense(copy);
            copy.setExpense(details);
        }

        ExpenseDTO savedDTO = addExpense(expenseMapper.toDTO(copy), userId);
        return expenseMapper.toEntity(savedDTO);

    }

    @Override
    public Expense save(Expense expense) {
        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "expenses", "categories", "budgets", "paymentMethods" }, allEntries = true)
    public Expense updateExpense(Integer id, Expense updatedExpense, Integer userId) throws Exception {
        Expense existingExpense = expenseRepository.findByUserIdAndId(userId, id);
        if (existingExpense == null) {
            throw new RuntimeException("Expense not found with ID: " + id);
        }
        if (existingExpense.isBill()) {
            throw new RuntimeException("Cannot update a bill expense. Please use the Bill Id for updates.");
        }

        Map<String, Object> oldValues = expenseToMap(existingExpense);
        UserDTO UserDTO = helper.validateUser(userId);
        Expense savedExpense = updateExpenseInternal(existingExpense, updatedExpense, userId);

        entityManager.flush();
        entityManager.clear();

        Expense refreshedExpense = expenseRepository.findByUserIdAndId(userId, id);

        publishExpenseAuditEvent("UPDATE", refreshedExpense, UserDTO, oldValues, expenseToMap(refreshedExpense),
                "Expense updated",
                "SUCCESS");
        return refreshedExpense;
    }

    @Override
    @Transactional
    @CacheEvict(value = { "expenses", "categories", "budgets", "paymentMethods" }, allEntries = true)
    public Expense updateExpenseWithBillService(Integer id, Expense updatedExpense, Integer userId) throws Exception {
        Expense existingExpense = expenseRepository.findByUserIdAndId(userId, id);
        if (existingExpense == null) {
            throw new RuntimeException("Expense not found with ID: " + id);
        }

        Map<String, Object> oldValues = expenseToMap(existingExpense);
        UserDTO UserDTO = helper.validateUser(userId);
        Expense saved = updateExpenseInternal(existingExpense, updatedExpense, userId);

        entityManager.flush();
        entityManager.clear();

        Expense refreshedExpense = expenseRepository.findByUserIdAndId(userId, id);

        publishExpenseAuditEvent("UPDATE", refreshedExpense, UserDTO, oldValues, expenseToMap(refreshedExpense),
                "Expense (bill service) updated", "SUCCESS");
        return refreshedExpense;
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
                    budgetService.save(budget);
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
                    categoryService.save(category);
                }
            } catch (Exception e) {
                System.out.println("Error removing expense from category: " + e.getMessage());
            }
        }

        if (expense.getExpense() != null && expense.getExpense().getPaymentMethod() != null) {
            String paymentMethodName = expense.getExpense().getPaymentMethod();
            String type = expense.getExpense().getType();
            try {
                PaymentMethod paymentMethod = paymentMethodService.getByNameAndType(userId, paymentMethodName,
                        type.equals("loss") ? "expense" : "income");
                if (paymentMethod != null && paymentMethod.getExpenseIds() != null) {
                    Map<Integer, Set<Integer>> expenseIdsMap = paymentMethod.getExpenseIds();
                    Set<Integer> userExpenseSet = expenseIdsMap.getOrDefault(userId, new HashSet<>());
                    userExpenseSet.remove(expense.getId());
                    System.out.println(
                            "Removing expense ID " + expense.getId() + " from payment method " + userExpenseSet);
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

        Cache cache = cacheManager.getCache("expenses");
        if (cache != null) {

            cache.evict(id);

            List<Expense> cachedExpenses = cache.get(userId, List.class);
            if (cachedExpenses != null) {

                cachedExpenses.removeIf(exp -> exp.getId().equals(id));

                cache.put(userId, cachedExpenses);
                logger.info("Removed deleted expense ID {} from cache for UserDTO: {}", id, userId);
            } else {

                cache.evict(userId);
                logger.info("Evicted cache for UserDTO: {} due to missing cached list", userId);
            }
        }

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

        Map<String, Object> oldValues = expenseToMap(expense);
        UserDTO UserDTO = helper.validateUser(userId);
        String expenseJson = jsonConverter.toJson(getExpenseById(id, userId));
        expenseRepository.deleteById(id);
        publishExpenseAuditEvent("DELETE", expense, UserDTO, oldValues, null, "Expense deleted", "SUCCESS");
    }

    @Override
    @Transactional
    @CacheEvict(value = "expenses", allEntries = true)
    public void deleteExpensesByIds(List<Integer> ids, Integer userId) throws Exception {
        deleteExpensesInternal(ids, userId, false);
    }

    @Override
    @Transactional
    @CacheEvict(value = "expenses", allEntries = true)
    public void deleteExpensesByIdsWithBillService(List<Integer> ids, Integer userId) throws Exception {
        deleteExpensesInternal(ids, userId, true);
    }

    @Override
    @Transactional
    @CacheEvict(value = "expenses", allEntries = true)
    public void deleteAllExpenses(Integer userId, List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            throw new IllegalArgumentException("Expenses Are deleted");
        }

        List<String> errorMessages = new ArrayList<>();
        List<Expense> expensesToDelete = new ArrayList<>();
        List<Integer> expenseIdsToDelete = new ArrayList<>();

        // Collect all expense IDs for batch fetch (fixes N+1 query problem)
        List<Integer> allExpenseIds = expenses.stream()
                .map(Expense::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Batch fetch all expenses in one query with JOIN FETCH for ExpenseDetails
        Map<Integer, Expense> existingExpensesMap = expenseRepository.findByIdInWithDetails(allExpenseIds)
                .stream()
                .collect(Collectors.toMap(Expense::getId, e -> e));

        for (Expense expense : expenses) {
            if (expense.getId() == null) {
                errorMessages.add("Expense ID cannot be null.");
                continue;
            }

            Expense existing = existingExpensesMap.get(expense.getId());
            if (existing == null) {
                errorMessages.add("Expense not found with ID: " + expense.getId());
                continue;
            }

            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                errorMessages.add("UserDTO not authorized to delete Expense ID: " + expense.getId() +
                        " (Expense belongs to UserDTO " +
                        (existing.getUserId() != null ? existing.getUserId() : "unknown") +
                        ", current UserDTO is " + userId + ")");
                continue;
            }

            expensesToDelete.add(existing);
            expenseIdsToDelete.add(existing.getId());
        }

        if (!expensesToDelete.isEmpty()) {

            performOptimizedBatchDelete(expenseIdsToDelete, userId, expensesToDelete);
        }

        if (!errorMessages.isEmpty()) {
            throw new RuntimeException("Errors occurred while deleting expenses: " + String.join("; ", errorMessages));
        }
    }

    @Transactional
    private void performOptimizedBatchDelete(List<Integer> expenseIds, Integer userId, List<Expense> expensesToDelete) {
        final int BATCH_SIZE = 1000;

        List<Expense> expensesForAsync = createExpenseCopiesForAsync(expensesToDelete);

        for (int i = 0; i < expenseIds.size(); i += BATCH_SIZE) {
            int endIndex = Math.min(i + BATCH_SIZE, expenseIds.size());
            List<Integer> batchIds = expenseIds.subList(i, endIndex);

            try {

                expenseRepository.deleteExpenseDetailsByExpenseIds(batchIds);

                int deletedCount = expenseRepository.deleteByIdsAndUserId(batchIds, userId);

                logger.info("Batch deleted {} expenses (expected: {}) for UserDTO: {}",
                        deletedCount, batchIds.size(), userId);

                entityManager.flush();
                entityManager.clear();

            } catch (Exception e) {
                logger.error("Error in batch deletion for batch starting at index {}: {}", i, e.getMessage());
                throw new RuntimeException("Batch deletion failed: " + e.getMessage(), e);
            }
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                asyncExpensePostProcessor.publishDeletionEvents(expensesForAsync, userId);
            }
        });
    }

    private List<Expense> createExpenseCopiesForAsync(List<Expense> expensesToDelete) {
        List<Expense> expensesForAsync = new ArrayList<>();

        for (Expense expense : expensesToDelete) {
            Expense copy = new Expense();
            copy.setId(expense.getId());
            copy.setUserId(expense.getUserId());
            copy.setCategoryId(expense.getCategoryId());
            copy.setCategoryName(expense.getCategoryName());
            copy.setBudgetIds(expense.getBudgetIds() != null ? new HashSet<>(expense.getBudgetIds()) : new HashSet<>());

            if (expense.getExpense() != null) {
                ExpenseDetails details = new ExpenseDetails();
                details.setPaymentMethod(expense.getExpense().getPaymentMethod());
                details.setType(expense.getExpense().getType());
                copy.setExpense(details);
            }

            expensesForAsync.add(copy);
        }

        return expensesForAsync;
    }

    @Override
    @Transactional
    public List<Expense> addMultipleExpenses(List<Expense> expenses, Integer userId) throws Exception {
        UserDTO UserDTO = helper.validateUser(userId);
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
            if (expense.getBudgetIds() == null)
                expense.setBudgetIds(new HashSet<>());
            Set<Integer> validBudgetIds = validateAndExtractBudgetIds(expense, UserDTO);
            expense.setBudgetIds(validBudgetIds);
            handleCategory(expense, UserDTO);

            entityManager.persist(expense);
            savedExpenses.add(expense);

            if (++count % batchSize == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }
        entityManager.flush();
        entityManager.clear();

        asyncExpensePostProcessor.publishEvent(new ArrayList<>(savedExpenses), userId, UserDTO);

        return savedExpenses;
    }

    @Override
    @Transactional
    public List<Expense> addMultipleExpensesWithProgress(List<Expense> expenses, Integer userId, String jobId)
            throws Exception {
        UserDTO UserDTO = helper.validateUser(userId);

        entityManager.setFlushMode(FlushModeType.COMMIT);

        final int STATELESS_THRESHOLD = 20_000;
        if (expenses.size() >= STATELESS_THRESHOLD) {
            return addMultipleExpensesWithProgressStateless(expenses, userId, jobId, UserDTO);
        }

        final int batchSize = 1000;
        int count = 0;
        List<Expense> savedExpenses = new ArrayList<>(Math.min(expenses.size(), 10_000));

        Map<Integer, Budget> budgetCache = new HashMap<>();

        Map<Integer, Optional<Category>> categoryIdCache = new HashMap<>();
        Map<String, Optional<Category>> categoryNameCache = new HashMap<>();

        Category othersCategory = null;
        try {
            List<Category> others = categoryService.getByName(OTHERS, UserDTO.getId());
            if (others != null && !others.isEmpty()) {
                othersCategory = others.get(0);
            }
        } catch (Exception ignore) {
        }
        if (othersCategory == null) {
            try {
                othersCategory = createOthersCategory(UserDTO.getId());
            } catch (Exception e) {
                logger.warn("Failed to ensure 'Others' category exists: {}", e.getMessage());
            }
        }

        final int progressStep = 250;
        int progressSinceLastUpdate = 0;

        try {
            for (Expense expense : expenses) {
                expense.setId(null);
                expense.setUserId(userId);
                if (expense.getExpense() != null) {
                    expense.getExpense().setId(null);
                    expense.getExpense().setExpense(expense);
                }
                if (expense.getBudgetIds() == null)
                    expense.setBudgetIds(new HashSet<>());

                Set<Integer> validBudgetIds = validateAndExtractBudgetIdsCached(expense, UserDTO, budgetCache);
                expense.setBudgetIds(validBudgetIds);

                handleCategoryFast(expense, UserDTO, categoryIdCache, categoryNameCache, othersCategory);

                entityManager.persist(expense);
                savedExpenses.add(expense);

                if (++progressSinceLastUpdate >= progressStep) {
                    progressTracker.increment(jobId, progressSinceLastUpdate);
                    progressSinceLastUpdate = 0;
                }

                if (++count % batchSize == 0) {
                    entityManager.flush();
                    entityManager.clear();
                }
            }
            entityManager.flush();
            entityManager.clear();

            if (progressSinceLastUpdate > 0) {
                progressTracker.increment(jobId, progressSinceLastUpdate);
            }

            asyncExpensePostProcessor.publishEvent(new ArrayList<>(savedExpenses), userId, UserDTO, jobId);
            return savedExpenses;
        } catch (Exception ex) {

            progressTracker.fail(jobId, ex.getMessage());
            throw ex;
        }
    }

    private List<Expense> addMultipleExpensesWithProgressStateless(List<Expense> expenses, Integer userId, String jobId,
            UserDTO UserDTO) throws Exception {
        SessionFactory sessionFactory = entityManagerFactory.unwrap(SessionFactory.class);
        List<Expense> savedExpenses = new ArrayList<>(expenses.size());

        Map<Integer, Budget> budgetCache = new HashMap<>();
        Map<Integer, Optional<Category>> categoryIdCache = new HashMap<>();
        Map<String, Optional<Category>> categoryNameCache = new HashMap<>();

        Category othersCategory = null;
        try {
            List<Category> others = categoryService.getByName(OTHERS, UserDTO.getId());
            if (others != null && !others.isEmpty())
                othersCategory = others.get(0);
        } catch (Exception ignore) {
        }
        if (othersCategory == null) {
            try {
                othersCategory = createOthersCategory(UserDTO.getId());
            } catch (Exception ignore) {
            }
        }

        final int progressStep = 1000;
        int progressSinceLastUpdate = 0;

        try (StatelessSession session = sessionFactory.openStatelessSession()) {
            Transaction tx = session.beginTransaction();
            try {
                for (Expense expense : expenses) {

                    expense.setId(null);
                    expense.setUserId(userId);

                    ExpenseDetails details = expense.getExpense();
                    if (details != null) {
                        details.setId(null);
                        details.setExpense(expense);
                    }

                    if (expense.getBudgetIds() == null)
                        expense.setBudgetIds(new HashSet<>());
                    Set<Integer> validBudgetIds = validateAndExtractBudgetIdsCached(expense, UserDTO, budgetCache);
                    expense.setBudgetIds(validBudgetIds);

                    handleCategoryFast(expense, UserDTO, categoryIdCache, categoryNameCache, othersCategory);

                    session.insert(expense);

                    if (details != null) {
                        session.insert(details);
                    }

                    savedExpenses.add(expense);

                    if (++progressSinceLastUpdate >= progressStep) {
                        progressTracker.increment(jobId, progressSinceLastUpdate);
                        progressSinceLastUpdate = 0;
                    }
                }
                if (progressSinceLastUpdate > 0) {
                    progressTracker.increment(jobId, progressSinceLastUpdate);
                }
                tx.commit();
            } catch (Exception e) {
                if (tx != null)
                    tx.rollback();
                throw e;
            }
        }

        asyncExpensePostProcessor.publishEvent(new ArrayList<>(savedExpenses), userId, UserDTO, jobId);
        return savedExpenses;
    }

    private Set<Integer> validateAndExtractBudgetIdsCached(Expense expense, UserDTO UserDTO,
            Map<Integer, Budget> budgetCache) {
        Set<Integer> validBudgetIds = new HashSet<>();
        if (expense.getBudgetIds() == null || expense.getBudgetIds().isEmpty())
            return validBudgetIds;

        LocalDate expenseDate = expense.getDate();
        for (Integer budgetId : expense.getBudgetIds()) {
            if (budgetId == null)
                continue;
            Budget budget = budgetCache.get(budgetId);
            if (budget == null) {
                try {
                    budget = budgetService.getBudgetById(budgetId, UserDTO.getId());
                    if (budget != null) {
                        budgetCache.put(budgetId, budget);
                    }
                } catch (Exception ignore) {

                }
            }
            if (budget != null && !expenseDate.isBefore(budget.getStartDate())
                    && !expenseDate.isAfter(budget.getEndDate())) {
                validBudgetIds.add(budgetId);
            }
        }
        return validBudgetIds;
    }

    private void handleCategoryFast(Expense expense, UserDTO UserDTO,
            Map<Integer, Optional<Category>> categoryIdCache,
            Map<String, Optional<Category>> categoryNameCache,
            Category othersCategory) {
        try {

            String categoryName = expense.getCategoryName();
            if (categoryName != null && !categoryName.trim().isEmpty()) {
                String key = categoryName.trim().toLowerCase(Locale.ROOT);
                Optional<Category> cachedByName = categoryNameCache.get(key);
                if (cachedByName == null) {
                    Category found = null;
                    try {
                        List<Category> matches = categoryService.getByName(categoryName.trim(), UserDTO.getId());
                        if (matches != null && !matches.isEmpty()) {

                            found = matches.stream()
                                    .filter(c -> c.getName() != null
                                            && c.getName().equalsIgnoreCase(categoryName.trim()))
                                    .findFirst()
                                    .orElse(matches.get(0));
                        }
                    } catch (Exception ignore) {
                    }
                    cachedByName = Optional.ofNullable(found);
                    categoryNameCache.put(key, cachedByName);
                    if (found != null) {
                        categoryIdCache.putIfAbsent(found.getId(), Optional.of(found));
                    }
                }
                if (cachedByName.isPresent()) {
                    Category cat = cachedByName.get();
                    expense.setCategoryId(cat.getId());
                    expense.setCategoryName(cat.getName());
                    return;
                }
            }

            Integer categoryId = expense.getCategoryId();
            if (categoryId != null && categoryId > 0) {
                Optional<Category> cachedById = categoryIdCache.get(categoryId);
                if (cachedById == null) {

                    Category found = null;
                    try {
                        found = categoryService.getById(categoryId, UserDTO.getId());
                    } catch (Exception ignore) {
                    }
                    cachedById = Optional.ofNullable(found);
                    categoryIdCache.put(categoryId, cachedById);
                    if (found != null && found.getName() != null) {
                        categoryNameCache.putIfAbsent(found.getName().trim().toLowerCase(Locale.ROOT),
                                Optional.of(found));
                    }
                }
                if (cachedById.isPresent()) {
                    Category cat = cachedById.get();
                    expense.setCategoryId(cat.getId());
                    expense.setCategoryName(cat.getName());
                    return;
                }
            }

            if (othersCategory != null) {
                expense.setCategoryId(othersCategory.getId());
                expense.setCategoryName(othersCategory.getName());
            } else {

                handleCategory(expense, UserDTO);
            }
        } catch (Exception e) {
            logger.warn("Category handling fallback triggered: {}", e.getMessage());

            if (othersCategory != null) {
                expense.setCategoryId(othersCategory.getId());
                expense.setCategoryName(othersCategory.getName());
            }
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = { "expenses", "categories" }, allEntries = true)
    public List<Expense> updateMultipleExpenses(Integer userId, List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            throw new IllegalArgumentException("Expense list cannot be null or empty.");
        }

        List<String> errorMessages = new ArrayList<>();
        List<Expense> updatedExpenses = new ArrayList<>();

        // Collect all expense IDs for batch fetch (fixes N+1 query problem)
        List<Integer> batchExpenseIds = expenses.stream()
                .map(Expense::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Batch fetch all expenses in one query with JOIN FETCH for ExpenseDetails
        Map<Integer, Expense> existingExpensesMap = expenseRepository.findByIdInWithDetails(batchExpenseIds)
                .stream()
                .collect(Collectors.toMap(Expense::getId, e -> e));

        for (Expense expense : expenses) {
            Integer id = expense.getId();
            if (id == null) {
                errorMessages.add("Expense ID cannot be null.");
                continue;
            }

            if (expense.isBill()) {

                continue;
            }
            Expense existingExpense = existingExpensesMap.get(id);
            if (existingExpense == null) {
                errorMessages.add("Expense not found with ID: " + id);
                continue;
            }

            if (existingExpense.getUserId() == null || !existingExpense.getUserId().equals(userId)) {
                errorMessages.add("UserDTO not authorized to update Expense ID: " + id);
                continue;
            }

            try {

                Integer oldCategoryId = existingExpense.getCategoryId();
                Integer newCategoryId = expense.getCategoryId();
                if (!Objects.equals(oldCategoryId, newCategoryId)) {

                    if (oldCategoryId != null) {
                        try {
                            Category oldCategory = categoryService.getById(oldCategoryId, userId);
                            if (oldCategory != null && oldCategory.getExpenseIds() != null) {
                                Set<Integer> expenseSet = oldCategory.getExpenseIds().getOrDefault(userId,
                                        new HashSet<>());
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

                    if (newCategoryId != null) {
                        try {
                            Category newCategory = categoryService.getById(newCategoryId, userId);
                            if (newCategory != null) {
                                existingExpense.setCategoryId(newCategory.getId());
                                existingExpense.setCategoryName(newCategory.getName());
                                if (newCategory.getExpenseIds() == null) {
                                    newCategory.setExpenseIds(new HashMap<>());
                                }
                                Set<Integer> expenseSet = newCategory.getExpenseIds().getOrDefault(userId,
                                        new HashSet<>());
                                expenseSet.add(existingExpense.getId());
                                newCategory.getExpenseIds().put(userId, expenseSet);
                                categoryService.save(newCategory);
                            }
                        } catch (Exception e) {
                            try {
                                Category category = categoryService.getByName(OTHERS, userId).get(0);
                                existingExpense.setCategoryId(category.getId());
                                existingExpense.setCategoryName(category.getName());
                                if (category.getExpenseIds() == null) {
                                    category.setExpenseIds(new HashMap<>());
                                }
                                Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(userId,
                                        new HashSet<>());
                                expenseSet.add(existingExpense.getId());
                                category.getExpenseIds().put(userId, expenseSet);
                                categoryService.save(category);
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
                                    categoryService.save(newCategory);
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
                    String oldPaymentType = existingDetails.getType() != null
                            && existingDetails.getType().equalsIgnoreCase("loss") ? "expense" : "income";
                    String newPaymentMethodName = newDetails.getPaymentMethod() != null
                            ? newDetails.getPaymentMethod().trim()
                            : null;
                    String newPaymentType = newDetails.getType() != null
                            && newDetails.getType().equalsIgnoreCase("loss") ? "expense" : "income";

                    if (oldPaymentMethodName != null && !oldPaymentMethodName.trim().isEmpty()
                            && (newPaymentMethodName == null
                                    || !oldPaymentMethodName.trim().equalsIgnoreCase(newPaymentMethodName)
                                    || !oldPaymentType.equalsIgnoreCase(newPaymentType))) {
                        List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
                        PaymentMethod oldPaymentMethod = allMethods.stream()
                                .filter(pm -> pm.getName().equalsIgnoreCase(oldPaymentMethodName.trim())
                                        && pm.getType().equalsIgnoreCase(oldPaymentType))
                                .findFirst().orElse(null);
                        if (oldPaymentMethod != null && oldPaymentMethod.getExpenseIds() != null) {
                            oldPaymentMethod.getExpenseIds().remove(existingExpense.getId());
                            paymentMethodService.save(oldPaymentMethod);
                        }
                    }

                    if (newPaymentMethodName != null && !newPaymentMethodName.isEmpty()) {
                        List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
                        PaymentMethod newPaymentMethod = allMethods.stream()
                                .filter(pm -> pm.getName().equalsIgnoreCase(newPaymentMethodName)
                                        && pm.getType().equalsIgnoreCase(newPaymentType))
                                .findFirst().orElse(null);
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
                            if (!expense.getDate().isBefore(budget.getStartDate())
                                    && !expense.getDate().isAfter(budget.getEndDate())) {
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
                                budgetService.save(oldBudget);
                            }
                        }
                    }
                }

                existingExpense.setBudgetIds(validBudgetIds);
                Expense savedExpense = expenseRepository.save(existingExpense);

                for (Integer budgetId : validBudgetIds) {
                    Budget budget = budgetService.getBudgetById(budgetId, userId);
                    if (budget != null) {
                        if (budget.getExpenseIds() == null)
                            budget.setExpenseIds(new HashSet<>());
                        budget.getExpenseIds().add(savedExpense.getId());
                        budget.setBudgetHasExpenses(true);
                        budgetService.save(budget);
                    }
                }

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
    public List<Expense> saveExpenses(List<ExpenseDTO> expenseDTOs, Integer userId) throws Exception {

        UserDTO UserDTO = helper.validateUser(userId);
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
                details.setAmount(detailsDTO.getAmountAsDouble());
                details.setType(detailsDTO.getType());
                details.setPaymentMethod(detailsDTO.getPaymentMethod());
                details.setNetAmount(detailsDTO.getNetAmountAsDouble());
                details.setComments(detailsDTO.getComments());
                details.setCreditDue(detailsDTO.getCreditDueAsDouble());
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
                            if (!savedExpense.getDate().isBefore(budget.getStartDate())
                                    && !savedExpense.getDate().isAfter(budget.getEndDate())) {
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
                        if (budget.getExpenseIds() == null)
                            budget.setExpenseIds(new HashSet<>());
                        budget.getExpenseIds().add(savedExpense.getId());
                        budget.setBudgetHasExpenses(true);
                        budgetService.save(budget);
                    }
                }

            } catch (Exception e) {
                errorMessages.add("Failed to save expense for date " + dto.getDate() + ": " + e.getMessage());
            }
        }

        if (!errorMessages.isEmpty()) {
            throw new RuntimeException("Errors occurred while saving expenses: " + String.join("; ", errorMessages));
        }

        return savedExpenses;
    }

    @Override
    public Expense getExpenseById(Integer id, Integer userId) {
        Expense expense = expenseRepository.findByUserIdAndId(userId, id);
        if (expense == null) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        return expense;
    }

    @Override
    public List<Expense> getAllExpenses(Integer userId) {
        logger.info("Fetching from DATABASE for UserDTO {}", userId);
        return expenseRepository.findByUserId(userId);
    }

    @Override
    public List<Expense> getAllExpenses(Integer userId, String sortOrder) {

        Sort sort = "asc".equalsIgnoreCase(sortOrder) ? Sort.by(Sort.Order.asc("date"))
                : Sort.by(Sort.Order.desc("date"));

        return expenseRepository.findByUserIdWithSort(userId, sort);
    }

    @Override
    public List<Expense> getExpensesByIds(Integer userId, Set<Integer> expenseIds) throws UserException {

        if (expenseIds == null || expenseIds.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Integer> validExpenseIds = expenseIds.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (validExpenseIds.isEmpty()) {
            return Collections.emptyList();
        }

        try {

            helper.validateUser(userId);

            List<Expense> expenses = expenseRepository.findAllByUserIdAndIdIn(userId, validExpenseIds);

            if (!expenses.isEmpty()) {
                System.out.println("Retrieved " + expenses.size() + " expenses for UserDTO " + userId);
            }

            return expenses;

        } catch (Exception e) {
            throw new UserException("Error retrieving expenses for UserDTO " + userId + ": " + e.getMessage());
        }
    }

    @Override
    public List<Expense> getExpensesByIds(List<Integer> ids) {
        return expenseRepository.findByIdIn(ids);
    }

    @Override
    public List<Expense> getExpensesByUserAndSort(Integer userId, String sort) throws UserException {

        List<Expense> expenses = getCachedExpenses(userId);

        if (expenses == null) {

            logger.info("Cache miss - fetching from database for UserDTO: {}", userId);
            expenses = expenseRepository.findByUserId(userId);

            cacheExpenses(userId, expenses);
        }

        if (expenses != null) {
            if (sort.equalsIgnoreCase("asc")) {
                expenses.sort(Comparator.comparing(Expense::getDate));
            } else {
                expenses.sort(Comparator.comparing(Expense::getDate).reversed());
            }
        }

        return expenses;
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

                return categoryService.save(existingCategory);
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

    private List<Expense> getCachedExpenses(Integer userId) {
        Cache cache = cacheManager.getCache("expenses");
        if (cache != null) {
            List<Expense> cachedExpenses = cache.get(userId, List.class);
            if (cachedExpenses != null) {
                logger.info("Retrieved {} expenses from cache for UserDTO: {}", cachedExpenses.size(), userId);
                return new ArrayList<>(cachedExpenses);
            }
        }
        logger.info("No cached expenses found for UserDTO: {}", userId);
        return null;
    }

    private void cacheExpenses(Integer userId, List<Expense> expenses) {
        Cache cache = cacheManager.getCache("expenses");
        if (cache != null && expenses != null) {
            cache.put(userId, new ArrayList<>(expenses));
            logger.info("Cached {} expenses for UserDTO: {}", expenses.size(), userId);
        }
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
                    errorMessages.add("UserDTO not authorized to delete Expense ID: " + expense.getId() +
                            " (Expense belongs to UserDTO "
                            + (expense.getUserId() != null ? expense.getUserId() : "unknown") +
                            ", current UserDTO is " + userId + ")");
                    continue;
                }

                if (!skipBillCheck && expense.isBill()) {
                    continue;
                }

                expensesToDelete.add(expense);
            } catch (Exception e) {
                errorMessages
                        .add("Failed to process deletion for Expense ID: " + expense.getId() + " - " + e.getMessage());
            }
        }

        if (!expensesToDelete.isEmpty()) {

            expenseRepository.deleteAll(expensesToDelete);

            List<Expense> expensesForAsync = new ArrayList<>();
            for (Expense expense : expensesToDelete) {
                Expense copy = new Expense();
                copy.setId(expense.getId());
                copy.setUserId(expense.getUserId());
                copy.setCategoryId(expense.getCategoryId());
                copy.setCategoryName(expense.getCategoryName());
                copy.setBudgetIds(
                        expense.getBudgetIds() != null ? new HashSet<>(expense.getBudgetIds()) : new HashSet<>());

                if (expense.getExpense() != null) {
                    ExpenseDetails details = new ExpenseDetails();
                    details.setPaymentMethod(expense.getExpense().getPaymentMethod());
                    details.setType(expense.getExpense().getType());
                    copy.setExpense(details);
                }

                expensesForAsync.add(copy);
            }

            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {

                    asyncExpensePostProcessor.publishDeletionEvents(expensesForAsync, userId);
                }
            });
        }

        if (!errorMessages.isEmpty()) {
            throw new Exception("Errors occurred while deleting expenses: " + String.join("; ", errorMessages));
        }
    }

    private void handleCategory(Expense expense, UserDTO UserDTO) throws Exception {

        try {
            Category category = categoryService.getById(expense.getCategoryId(), UserDTO.getId());
            if (category != null) {
                expense.setCategoryId(category.getId());
                expense.setCategoryName(category.getName());
            }
        } catch (Exception e) {

            try {
                Category category = categoryService.getByName(OTHERS, UserDTO.getId()).get(0);
                expense.setCategoryId(category.getId());
                expense.setCategoryName(category.getName());
            } catch (Exception notFound) {
                Category createdCategory = new Category();
                createdCategory.setDescription("Others Description");
                createdCategory.setName(OTHERS);
                Category newCategory = categoryService.create(createdCategory, UserDTO.getId());
                expense.setCategoryId(newCategory.getId());
                expense.setCategoryName(newCategory.getName());
            }
        }
    }

    public void handlePaymentMethod(Expense savedExpense, UserDTO UserDTO) {
        ExpenseDetails details = savedExpense.getExpense();
        String paymentMethodName = details.getPaymentMethod().trim();
        String paymentType = details.getType().equalsIgnoreCase("loss") ? "expense" : "income";

        PaymentMethodEvent event = new PaymentMethodEvent(UserDTO.getId(), savedExpense.getId(), paymentMethodName,
                paymentType, "Automatically created for expense: " + details.getPaymentMethod(), CASH,
                getThemeAppropriateColor("salary"), "CREATE");

        paymentMethodKafkaProducer.sendPaymentMethodEvent(event);
        logger.info("Payment method event sent for expense ID: {} and UserDTO: {}", savedExpense.getId(), UserDTO.getId());
    }

    @Transactional
    public void updateCategoryExpenseIds(Expense savedExpense, Integer userId) {
        logger.info("Updating categoryId: {}", savedExpense.getCategoryId());
        if (savedExpense.getCategoryId() != null) {
            logger.info("Entered inside if statement: {}", savedExpense.getCategoryId());

            CategoryExpenseEvent event = new CategoryExpenseEvent(userId, savedExpense.getId(),
                    savedExpense.getCategoryId(), savedExpense.getCategoryName(), "ADD");

            categoryExpenseKafkaProducer.sendCategoryExpenseEvent(event);
            logger.info("Sent category expense event for expense {} to category {}", savedExpense.getId(),
                    savedExpense.getCategoryId());
        }
    }

    private void validateExpenseData(Expense expense, UserDTO UserDTO) throws IllegalArgumentException, UserException {
        if (expense.getDate() == null)
            throw new IllegalArgumentException("Expense date must not be null.");
        if (expense.getExpense() == null)
            throw new IllegalArgumentException("Expense details must not be null.");
        ExpenseDetails details = expense.getExpense();
        if (details.getExpenseName() == null || details.getExpenseName().isEmpty())
            throw new IllegalArgumentException("Expense name must not be empty.");
        if (details.getAmount() < 0)
            throw new IllegalArgumentException("Expense amount cannot be negative.");
        if (details.getPaymentMethod() == null || details.getPaymentMethod().isEmpty())
            throw new IllegalArgumentException("Payment method must not be empty.");
        if (details.getType() == null || details.getType().isEmpty())
            throw new IllegalArgumentException("Expense type must not be empty.");
        if (UserDTO == null)
            throw new UserException("UserDTO not found.");
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

    public void updateBudgetExpenseLinks(Expense savedExpense, Set<Integer> validBudgetIds, UserDTO UserDTO)
            throws Exception {
        if (!validBudgetIds.isEmpty()) {
            BudgetExpenseEvent budgetEvent = new BudgetExpenseEvent(UserDTO.getId(), savedExpense.getId(), validBudgetIds,
                    "ADD");
            budgetExpenseKafkaProducerService.sendBudgetExpenseEvent(budgetEvent);
            logger.info("Budget expense event sent for expense ID: {} with budget IDs: {}", savedExpense.getId(),
                    validBudgetIds);
        }
    }

    private void updateExpenseCache(Expense savedExpense, Integer userId) {
        updateExpenseCache(Collections.singletonList(savedExpense), userId);
    }

    public void updateExpenseCache(List<Expense> savedExpenses, Integer userId) {
        Cache cache = cacheManager.getCache("expenses");
        if (cache == null) {
            logger.warn("Cache 'expenses' not found");
            return;
        }

        if (savedExpenses == null || savedExpenses.isEmpty()) {
            logger.warn("No expenses provided to update cache for UserDTO: {}", userId);
            return;
        }

        List<Expense> cachedExpenses = cache.get(userId, List.class);
        if (cachedExpenses == null) {
            cachedExpenses = new ArrayList<>();
        }

        cachedExpenses.addAll(savedExpenses);
        cache.put(userId, cachedExpenses);

        if (savedExpenses.size() == 1) {
            logger.info("Added expense ID {} to cache for UserDTO: {}", savedExpenses.get(0).getId(), userId);
        } else {
            List<Integer> expenseIds = savedExpenses.stream().map(Expense::getId).collect(Collectors.toList());
            logger.info("Added {} expenses with IDs {} to cache for UserDTO: {}", savedExpenses.size(), expenseIds,
                    userId);
        }
    }

    private Set<Integer> validateAndExtractBudgetIds(Expense expense, UserDTO UserDTO) throws Exception {
        Set<Integer> validBudgetIds = new HashSet<>();
        for (Integer budgetId : expense.getBudgetIds()) {

            Budget budgetOpt;
            try {
                budgetOpt = budgetService.getBudgetById(budgetId, UserDTO.getId());
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

    private Expense updateExpenseInternal(Expense existingExpense, Expense updatedExpense, Integer userId)
            throws Exception {
        validateExpenseData(updatedExpense);
        ExpenseDetails newDetails = updatedExpense.getExpense();

        ExpenseDetails existingDetails = existingExpense.getExpense();
        if (existingDetails == null) {
            throw new RuntimeException("Expense details cannot be null");
        }

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
        entityManager.flush();

        entityManager.detach(savedExpense);
        Expense verified = expenseRepository.findById(savedExpense.getId())
                .orElseThrow(() -> new RuntimeException("Expense not found after save"));

        updateCategory(verified, updatedExpense, userId);
        updatePaymentMethod(verified, newDetails, userId);
        updateCategoryExpenseIds(verified, userId);
        updateBudgetLinks(verified, validBudgetIds, userId);

        entityManager.flush();

        return verified;
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

    private void updateBudgetLinks(Expense savedExpense, Set<Integer> validBudgetIds, Integer userId) throws Exception {
        for (Integer budgetId : validBudgetIds) {
            Budget budget = budgetService.getBudgetById(budgetId, userId);
            if (budget != null) {
                if (budget.getExpenseIds() == null) {
                    budget.setExpenseIds(new HashSet<>());
                }
                budget.getExpenseIds().add(savedExpense.getId());
                budget.setBudgetHasExpenses(true);
                budgetService.save(budget);
            }
        }
    }

    private void removeOldBudgetLinks(Expense existingExpense, Set<Integer> validBudgetIds, Integer userId)
            throws Exception {
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

    private void updatePaymentMethod(Expense existingExpense, ExpenseDetails newDetails, Integer userId)
            throws Exception {
        try {
            UserDTO UserDTO = helper.validateUser(userId);
            ExpenseDetails existingDetails = existingExpense.getExpense();
            String oldPaymentMethodName = existingDetails.getPaymentMethod();
            String oldPaymentType = (existingDetails.getType() != null
                    && existingDetails.getType().equalsIgnoreCase("loss")) ? "expense" : "income";
            String newPaymentMethodName = newDetails.getPaymentMethod().trim();
            String newPaymentType = (newDetails.getType() != null && newDetails.getType().equalsIgnoreCase("loss"))
                    ? "expense"
                    : "income";

            if (oldPaymentMethodName != null && !oldPaymentMethodName.trim().isEmpty()) {
                try {
                    List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
                    PaymentMethod oldPaymentMethod = allMethods.stream()
                            .filter(pm -> pm.getName().equalsIgnoreCase(oldPaymentMethodName.trim())
                                    && pm.getType().equalsIgnoreCase(oldPaymentType))
                            .findFirst().orElse(null);
                    if (oldPaymentMethod != null && oldPaymentMethod.getExpenseIds() != null) {
                        Map<Integer, Set<Integer>> expenseIds = oldPaymentMethod.getExpenseIds();
                        Set<Integer> userExpenseSet = expenseIds.getOrDefault(userId, new HashSet<>());
                        userExpenseSet.remove(existingExpense.getId());

                        if (userExpenseSet.isEmpty()) {
                            expenseIds.remove(userId);
                        } else {
                            expenseIds.put(userId, userExpenseSet);
                        }

                        logger.info("Removing expense {} from payment method {} for UserDTO {}",
                                existingExpense.getId(), oldPaymentMethodName, userId);
                        paymentMethodService.save(oldPaymentMethod);
                    }
                } catch (Exception e) {
                    logger.error("Error removing expense from old payment method: {}", e.getMessage(), e);
                    throw new Exception("Failed to remove expense from old payment method: " + e.getMessage(), e);
                }
            }

            try {
                List<PaymentMethod> allMethods = paymentMethodService.getAllPaymentMethods(userId);
                PaymentMethod newPaymentMethod = allMethods.stream()
                        .filter(pm -> pm.getName().equalsIgnoreCase(newPaymentMethodName)
                                && pm.getType().equalsIgnoreCase(newPaymentType))
                        .findFirst().orElse(null);
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
                Set<Integer> userExpenseSet = expenseIds.getOrDefault(UserDTO.getId(), new HashSet<>());
                userExpenseSet.add(existingExpense.getId());
                expenseIds.put(UserDTO.getId(), userExpenseSet);

                logger.info("Adding expense {} to payment method {} for UserDTO {}",
                        existingExpense.getId(), newPaymentMethodName, UserDTO.getId());
                paymentMethodService.save(newPaymentMethod);
            } catch (Exception e) {
                logger.error("Error adding expense to new payment method: {}", e.getMessage(), e);
                throw new Exception("Failed to add expense to new payment method: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            logger.error("Error in updatePaymentMethod for expense {}: {}", existingExpense.getId(), e.getMessage(), e);
            throw e;
        }
    }

    private void updateCategory(Expense existingExpense, Expense updatedExpense, Integer userId) throws Exception {
        Integer oldCategoryId = existingExpense.getCategoryId();
        Integer newCategoryId = updatedExpense.getCategoryId();
        UserDTO UserDTO = helper.validateUser(userId);

        if (!Objects.equals(oldCategoryId, newCategoryId)) {

            if (oldCategoryId != null) {
                CategoryExpenseEvent removeEvent = new CategoryExpenseEvent(userId, existingExpense.getId(),
                        oldCategoryId, existingExpense.getCategoryName(), "REMOVE");
                categoryExpenseKafkaProducer.sendCategoryExpenseEvent(removeEvent);
            }

            try {
                Category newCategory = categoryService.getById(newCategoryId, userId);
                if (newCategory != null) {
                    existingExpense.setCategoryId(newCategory.getId());
                    existingExpense.setCategoryName(newCategory.getName());
                    return;
                }
            } catch (Exception e) {

            }

            try {
                Category others = categoryService.getByName(OTHERS, UserDTO.getId()).get(0);
                existingExpense.setCategoryId(others.getId());
                existingExpense.setCategoryName(others.getName());
            } catch (Exception notFound) {
                Category createdCategory = new Category();
                createdCategory.setDescription("Others Description");
                createdCategory.setName(OTHERS);
                try {
                    Category newCategory = categoryService.create(createdCategory, UserDTO.getId());
                    existingExpense.setCategoryId(newCategory.getId());
                    existingExpense.setCategoryName(newCategory.getName());
                } catch (Exception createError) {
                    logger.error("Error creating Others category: {}", createError.getMessage());
                }
            }
        }
    }

    private String getThemeAppropriateColor(String categoryName) {
        Map<String, String> colorMap = new HashMap<>();
        colorMap.put("food", "#5b7fff");
        colorMap.put("groceries", "#00dac6");
        colorMap.put("shopping", "#bb86fc");
        colorMap.put("entertainment", "#ff7597");
        colorMap.put("utilities", "#ffb74d");
        colorMap.put("rent", "#ff5252");
        colorMap.put("transportation", "#69f0ae");
        colorMap.put("health", "#ff4081");
        colorMap.put("education", "#64b5f6");
        colorMap.put("travel", "#ffd54f");
        colorMap.put("others", "#b0bec5");
        colorMap.put("salary", "#69f0ae");
        colorMap.put("investment", "#00e676");
        colorMap.put("gift", "#e040fb");
        colorMap.put("refund", "#ffab40");

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

    private Map<String, Object> expenseToMap(Expense e) {
        if (e == null)
            return Collections.emptyMap();
        Map<String, Object> map = new HashMap<>();
        map.put("id", e.getId());
        map.put("userId", e.getUserId());
        map.put("categoryId", e.getCategoryId());
        map.put("categoryName", e.getCategoryName());
        map.put("date", e.getDate());
        map.put("includeInBudget", e.isIncludeInBudget());
        if (e.getBudgetIds() != null)
            map.put("budgetIds", e.getBudgetIds());
        if (e.getExpense() != null) {
            ExpenseDetails d = e.getExpense();
            map.put("amount", d.getAmount());
            map.put("type", d.getType());
            map.put("paymentMethod", d.getPaymentMethod());
            map.put("expenseName", d.getExpenseName());
            map.put("netAmount", d.getNetAmount());
            map.put("comments", d.getComments());
            map.put("creditDue", d.getCreditDue());
        }
        return map;
    }

    private void publishExpenseAuditEvent(String actionType,
            Expense expense,
            UserDTO UserDTO,
            Map<String, Object> oldValues,
            Map<String, Object> newValues,
            String details,
            String status) {
        if (expense == null || UserDTO == null)
            return;
        try {

            String ip = null;
            String userAgent = null;
            String method = null;
            String endpoint = null;
            String correlationId = null;
            Long executionTime = null;
            try {
                HttpServletRequest req = getCurrentHttpRequest();
                if (req != null) {
                    ip = req.getRemoteAddr();
                    userAgent = req.getHeader("UserDTO-Agent");
                    method = req.getMethod();
                    endpoint = req.getRequestURI();
                    Object cidAttr = req.getAttribute("correlationId");
                    if (cidAttr != null)
                        correlationId = cidAttr.toString();
                    Object start = req.getAttribute("requestStartTime");
                    if (start instanceof Long) {
                        executionTime = System.currentTimeMillis() - (Long) start;
                    }
                }
            } catch (Exception ignored) {
            }

            AuditEvent event = AuditEvent.builder()
                    .userId(UserDTO.getId())
                    .username(UserDTO.getFirstName())
                    .userRole(UserDTO.getRoles().toString())
                    .entityId(String.valueOf(expense.getId()))
                    .entityType("EXPENSE")
                    .actionType(actionType)
                    .details(details)
                    .description(expense.getExpense() != null ? expense.getExpense().getExpenseName() : null)
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .status(status)
                    .source("EXPENSE-SERVICE")
                    .ipAddress(ip)
                    .createdBy(UserDTO.getUsername())
                    .userAgent(userAgent)
                    .method(method)
                    .endpoint(endpoint)
                    .correlationId(correlationId)
                    .executionTimeMs(executionTime)
                    .build();

            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        auditEventProducer.publishAuditEvent(event);
                    }
                });
            } else {
                auditEventProducer.publishAuditEvent(event);
            }
            logger.info("Audit published {}", event);
        } catch (Exception ex) {
            logger.warn("Audit publish failed (action={} expenseId={}): {}", actionType, expense.getId(),
                    ex.getMessage());
        }
    }

    private void publishBulkSummaryAudit(String actionType, List<Expense> expenses, UserDTO UserDTO, String details) {
        if (expenses == null || expenses.isEmpty() || UserDTO == null)
            return;
        try {
            com.jaya.models.AuditEvent bulk = com.jaya.models.AuditEvent.builder()
                    .userId(UserDTO.getId())
                    .username(UserDTO.getUsername())
                    .entityId("bulk:" + expenses.size())
                    .entityType("EXPENSE")
                    .actionType(actionType)
                    .details(details)
                    .status("SUCCESS")
                    .source("SERVICE")
                    .build();
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        auditEventProducer.publishAuditEvent(bulk);
                    }
                });
            } else {
                auditEventProducer.publishAuditEvent(bulk);
            }
        } catch (Exception ex) {
            logger.warn("Bulk audit publish failed (action={} count={}): {}", actionType, expenses.size(),
                    ex.getMessage());
        }
    }

    private HttpServletRequest getCurrentHttpRequest() {
        try {
            RequestAttributes attrs = org.springframework.web.context.request.RequestContextHolder
                    .getRequestAttributes();
            if (attrs instanceof org.springframework.web.context.request.ServletRequestAttributes) {
                return ((org.springframework.web.context.request.ServletRequestAttributes) attrs).getRequest();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

}
