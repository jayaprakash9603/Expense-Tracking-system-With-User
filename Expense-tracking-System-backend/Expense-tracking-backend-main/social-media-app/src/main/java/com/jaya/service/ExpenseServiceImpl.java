package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.models.*;
import com.jaya.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
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
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseReportRepository expenseReportRepository;


    private static final Logger logger = (Logger) LoggerFactory.getLogger(ExpenseService.class);
    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryService categoryService;
    @Autowired
    private AuditExpenseService auditExpenseService;
    @Autowired
    public ExpenseServiceImpl(ExpenseRepository expenseRepository,ExpenseReportRepository expenseReportRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseReportRepository = expenseReportRepository;
    }


    @Override
    @Transactional
    public Expense addExpense(Expense expense, User user) throws Exception {
        if (expense.getDate() == null) {
            throw new IllegalArgumentException("Expense date must not be null.");
        }

        if (expense.getExpense() == null) {
            throw new IllegalArgumentException("Expense details must not be null.");
        }

        ExpenseDetails details = expense.getExpense();
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

        if (user == null) {
            throw new UserException("User not found.");
        }

        expense.setUser(user);
        if (expense.getBudgetIds() == null) {
            expense.setBudgetIds(new HashSet<>());
        }

        // Establish bidirectional link for details
        details.setExpense(expense);
        expense.setExpense(details);

        Set<Integer> validBudgetIds = new HashSet<>();
        for (Integer budgetId : expense.getBudgetIds()) {
            Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndId(user.getId(), budgetId);
            if (budgetOpt.isPresent()) {
                Budget budget = budgetOpt.get();
                LocalDate expenseDate = expense.getDate();
                if (!expenseDate.isBefore(budget.getStartDate()) && !expenseDate.isAfter(budget.getEndDate())) {
                    validBudgetIds.add(budgetId);
                }
            }
        }

        expense.setBudgetIds(validBudgetIds);

        try {
            Category category = categoryService.getById(expense.getCategoryId(), user);
            if (category != null) {
                expense.setCategoryId(category.getId());
            }
        } catch (Exception e) {
            try {
                System.out.println("Entered into catchblock" +expense.getCategoryId());
                Category category = categoryService.getByName("Others", user).get(0);
                System.out.println("Category name"+category.getName());
                expense.setCategoryId(category.getId());
            } catch (Exception notFound) {
                System.out.println("eentered into not found");
                Category createdCategory = new Category();
                createdCategory.setDescription("Others Description");
                createdCategory.setName("Others");
                Category newCategory = categoryService.create(createdCategory, user);
                expense.setCategoryId(newCategory.getId());
            }
        }

        Expense savedExpense = expenseRepository.save(expense);

        Category getCategory = categoryService.getById(savedExpense.getCategoryId(), user);
        if (getCategory.getExpenseIds() == null) {
            getCategory.setExpenseIds(new HashMap<>());
        }
        Set<Integer> expenseSet = getCategory.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
        expenseSet.add(savedExpense.getId());
        getCategory.getExpenseIds().put(user.getId(), expenseSet);
        categoryRepository.save(getCategory);

        // Now update the valid budgets with the new expense ID
        for (Integer validBudgetId : validBudgetIds) {
            Budget budget = budgetRepository.findByUserIdAndId(user.getId(), validBudgetId).orElseThrow(() -> new RuntimeException("Budget not found"));
            if (budget.getExpenseIds() == null) {
                budget.setExpenseIds(new HashSet<>());
            }
            if (!budget.getExpenseIds().contains(savedExpense.getId())) {
                budget.getExpenseIds().add(savedExpense.getId());
                budgetRepository.save(budget);
            }
        }

        auditExpenseService.logAudit(user, savedExpense.getId(), "Expense Created",
                "Expense: " + details.getExpenseName() + ", Amount: " + details.getAmount());

        return savedExpense;
    }




    @Override
    public List<Expense> addMultipleExpenses(List<Expense> expenses, User user) throws Exception {
        if (user == null) {
            throw new UserException("User not found.");
        }

        List<String> errorMessages = new ArrayList<>();

        for (Expense expense : expenses) {
            // Reset ID to treat it as a new entity
            expense.setId(null);
            expense.setUser(user);

            // Reset ExpenseDetails and link back
            if (expense.getExpense() != null) {
                expense.getExpense().setId(null);
                expense.getExpense().setExpense(expense);
            }

            // Clean budget IDs based on user and date range
            Set<Integer> validBudgetIds = new HashSet<>();
            if (expense.getBudgetIds() != null) {
                for (Integer budgetId : expense.getBudgetIds()) {
                    Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndId(user.getId(), budgetId);
                    if (optionalBudget.isPresent()) {
                        Budget budget = optionalBudget.get();
                        if (expense.getDate() != null &&
                                !expense.getDate().isBefore(budget.getStartDate()) &&
                                !expense.getDate().isAfter(budget.getEndDate())) {
                            validBudgetIds.add(budgetId);
                        }
                    }
                }
            }
            expense.setBudgetIds(validBudgetIds);
            try {
                Category category = categoryService.getById(expense.getCategoryId(), user);
                if (category != null) {
                    expense.setCategoryId(category.getId());
                }
            } catch (Exception e) {
                try {
                    System.out.println("Entered into catchblock" +expense.getCategoryId());
                    Category category = categoryService.getByName("Others", user).get(0);
                    System.out.println("Category name"+category.getName());
                    expense.setCategoryId(category.getId());
                } catch (Exception notFound) {
                    System.out.println("eentered into not found");
                    Category createdCategory = new Category();
                    createdCategory.setDescription("Others Description");
                    createdCategory.setName("Others");
                    Category newCategory = categoryService.create(createdCategory, user);
                    expense.setCategoryId(newCategory.getId());
                }
            }

        }

        // Save the new expenses
        List<Expense> savedExpenses = saveExpenses(expenses);




        // Update corresponding Budgets with new expense IDs
        for (Expense savedExpense : savedExpenses) {

            Category getCategory = categoryService.getById(savedExpense.getCategoryId(), user);
            if (getCategory.getExpenseIds() == null) {
                getCategory.setExpenseIds(new HashMap<>());
            }
            Set<Integer> expenseSet = getCategory.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
            expenseSet.add(savedExpense.getId());
            getCategory.getExpenseIds().put(user.getId(), expenseSet);
            categoryRepository.save(getCategory);
            for (Integer budgetId : savedExpense.getBudgetIds()) {
                Budget budget = budgetRepository.findByUserIdAndId(user.getId(), budgetId).orElse(null);
                if (budget != null) {
                    if (budget.getExpenseIds() == null) budget.setExpenseIds(new HashSet<>());
                    budget.getExpenseIds().add(savedExpense.getId());
                    budget.setBudgetHasExpenses(true);
                    budgetRepository.save(budget);
                }
            }

            // Audit log
            ExpenseDetails details = savedExpense.getExpense();
            String logMessage = String.format(
                    "Expense created with ID %d. Details: Name - %s, Amount - %.2f, Type - %s, Payment Method - %s",
                    savedExpense.getId(),
                    details.getExpenseName(),
                    details.getAmount(),
                    details.getType(),
                    details.getPaymentMethod()
            );
            auditExpenseService.logAudit(user, savedExpense.getId(), "create", logMessage);
        }

        return savedExpenses;
    }


    @Override
    public Expense getExpenseById(Integer id,User user) {
        return expenseRepository.findByUserIdAndId(user.getId(), id);

    }

    @Override
    public List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to,User user) {
        return expenseRepository.findByUserAndDateBetween(from,to,user);
    }

    @Override
    public List<Expense>findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to,Integer userId) {
        return expenseRepository.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(userId, from, to);
    }
    @Override
    public List<Expense> getAllExpenses(User user) {
        logger.info("Fetching from DATABASE for user {}", user.getId());
        return expenseRepository.findByUserId(user.getId());
    }

    @Override
    public List<Expense> getAllExpenses(User user, String sortOrder) {
        // Check for "asc" or "desc", default to "desc"
        Sort sort = "asc".equalsIgnoreCase(sortOrder) ? Sort.by(Sort.Order.asc("date")) : Sort.by(Sort.Order.desc("date"));
        return expenseRepository.findByUserId(user.getId(), sort);
    }


    @Override
    @Transactional
    public Expense updateExpense(Integer id, Expense updatedExpense, User user) {
        // Fetch the existing expense
        Expense existingExpense = expenseRepository.findByUserIdAndId(user.getId(), id);
        if (existingExpense == null) {
            throw new RuntimeException("Expense not found with ID: " + id);
        }

        // Validate the updated expense data
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

        // Handle category changes
        Integer oldCategoryId = existingExpense.getCategoryId();
        Integer newCategoryId = updatedExpense.getCategoryId();

        // If category has changed, update category associations
        if (!Objects.equals(oldCategoryId, newCategoryId)) {
            // Remove expense from old category
            if (oldCategoryId != null) {
                try {
                    Category oldCategory = categoryService.getById(oldCategoryId, user);
                    if (oldCategory != null && oldCategory.getExpenseIds() != null) {
                        Set<Integer> expenseSet = oldCategory.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                        expenseSet.remove(existingExpense.getId());
                        oldCategory.getExpenseIds().put(user.getId(), expenseSet);
                        categoryRepository.save(oldCategory);
                    }
                } catch (Exception e) {
                    // Log error but continue with update
                    System.out.println("Error removing expense from old category: " + e.getMessage());
                }
            }

            // Add expense to new category
            try {
                Category newCategory = categoryService.getById(newCategoryId, user);
                if (newCategory != null) {
                    existingExpense.setCategoryId(newCategory.getId());
                }
            } catch (Exception e) {
                try {
                    System.out.println("Entered into catchblock for update: " + newCategoryId);
                    Category category = categoryService.getByName("Others", user).get(0);
                    System.out.println("Category name: " + category.getName());
                    existingExpense.setCategoryId(category.getId());
                } catch (Exception notFound) {
                    System.out.println("Entered into not found for update");
                    Category createdCategory = new Category();
                    createdCategory.setDescription("Others Description");
                    createdCategory.setName("Others");
                    try {
                        Category newCategory = categoryService.create(createdCategory, user);
                        existingExpense.setCategoryId(newCategory.getId());
                    } catch (Exception createError) {
                        System.out.println("Error creating Others category: " + createError.getMessage());
                    }
                }
            }
        }

        // Update expense details
        ExpenseDetails existingDetails = existingExpense.getExpense();
        existingDetails.setExpenseName(details.getExpenseName());
        existingDetails.setAmount(details.getAmount());
        existingDetails.setType(details.getType());
        existingDetails.setPaymentMethod(details.getPaymentMethod());
        existingDetails.setNetAmount(details.getNetAmount());
        existingDetails.setComments(details.getComments());
        existingDetails.setCreditDue(details.getCreditDue());

        // Update expense date
        existingExpense.setDate(updatedExpense.getDate());
        existingExpense.setIncludeInBudget(updatedExpense.isIncludeInBudget());

        // Handle budget associations
        Set<Integer> validBudgetIds = new HashSet<>();
        if (updatedExpense.getBudgetIds() != null) {
            for (Integer budgetId : updatedExpense.getBudgetIds()) {
                Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndId(user.getId(), budgetId);
                if (budgetOpt.isPresent()) {
                    Budget budget = budgetOpt.get();
                    LocalDate expenseDate = updatedExpense.getDate();
                    if (!expenseDate.isBefore(budget.getStartDate()) && !expenseDate.isAfter(budget.getEndDate())) {
                        validBudgetIds.add(budgetId);
                    }
                }
            }
        }

        // Remove old budget links
        if (existingExpense.getBudgetIds() != null) {
            for (Integer oldBudgetId : existingExpense.getBudgetIds()) {
                if (!validBudgetIds.contains(oldBudgetId)) {
                    Budget oldBudget = budgetRepository.findByUserIdAndId(user.getId(), oldBudgetId).orElse(null);
                    if (oldBudget != null && oldBudget.getExpenseIds() != null) {
                        oldBudget.getExpenseIds().remove(existingExpense.getId());
                        oldBudget.setBudgetHasExpenses(!oldBudget.getExpenseIds().isEmpty());
                        budgetRepository.save(oldBudget);
                    }
                }
            }
        }

        existingExpense.setBudgetIds(validBudgetIds);
        Expense savedExpense = expenseRepository.save(existingExpense);

        // Update new category with expense ID
        if (savedExpense.getCategoryId() != null) {
            try {
                Category getCategory = categoryService.getById(savedExpense.getCategoryId(), user);
                if (getCategory != null) {
                    if (getCategory.getExpenseIds() == null) {
                        getCategory.setExpenseIds(new HashMap<>());
                    }
                    Set<Integer> expenseSet = getCategory.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                    expenseSet.add(savedExpense.getId());
                    getCategory.getExpenseIds().put(user.getId(), expenseSet);
                    categoryRepository.save(getCategory);
                }
            } catch (Exception e) {
                System.out.println("Error updating category with expense ID: " + e.getMessage());
            }
        }

        // Update new budget links
        for (Integer budgetId : validBudgetIds) {
            Budget budget = budgetRepository.findByUserIdAndId(user.getId(), budgetId).orElse(null);
            if (budget != null) {
                if (budget.getExpenseIds() == null) budget.setExpenseIds(new HashSet<>());
                budget.getExpenseIds().add(savedExpense.getId());
                budget.setBudgetHasExpenses(true);
                budgetRepository.save(budget);
            }
        }

        auditExpenseService.logAudit(user, savedExpense.getId(), "Expense Updated",
                "Expense: " + existingDetails.getExpenseName() + ", Amount: " + existingDetails.getAmount());
        return savedExpense;
    }





    @Override
    @Transactional
    public List<Expense> updateMultipleExpenses(User user, List<Expense> expenses) {
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

            Optional<Expense> existingOpt = expenseRepository.findById(id);
            if (existingOpt.isEmpty()) {
                errorMessages.add("Expense not found with ID: " + id);
                continue;
            }

            Expense existingExpense = existingOpt.get();

            // Debug logging to help identify the issue
            System.out.println("Expense ID: " + id);
            System.out.println("Expense User ID: " + (existingExpense.getUser() != null ? existingExpense.getUser().getId() : "null"));
            System.out.println("Current User ID: " + user.getId());

            // Check if the user is authorized to update this expense
            if (existingExpense.getUser() == null || !existingExpense.getUser().getId().equals(user.getId())) {
                errorMessages.add("User not authorized to update Expense ID: " + id +
                        " (Expense belongs to user " +
                        (existingExpense.getUser() != null ? existingExpense.getUser().getId() : "unknown") +
                        ", current user is " + user.getId() + ")");
                continue;
            }

            try {
                // Handle category changes if needed
                Integer oldCategoryId = existingExpense.getCategoryId();
                Integer newCategoryId = expense.getCategoryId();

                // If category has changed, update category associations
                if (!Objects.equals(oldCategoryId, newCategoryId)) {
                    // Remove expense from old category
                    if (oldCategoryId != null) {
                        try {
                            Category oldCategory = categoryService.getById(oldCategoryId, user);
                            if (oldCategory != null && oldCategory.getExpenseIds() != null) {
                                Set<Integer> expenseSet = oldCategory.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                                expenseSet.remove(existingExpense.getId());

                                // If there are no more expenses for this user, remove the user key entirely
                                if (expenseSet.isEmpty()) {
                                    oldCategory.getExpenseIds().remove(user.getId());
                                } else {
                                    oldCategory.getExpenseIds().put(user.getId(), expenseSet);
                                }

                                categoryRepository.save(oldCategory);
                            }
                        } catch (Exception e) {
                            // Log error but continue with update
                            System.out.println("Error removing expense from old category: " + e.getMessage());
                        }
                    }

                    // Add expense to new category
                    if (newCategoryId != null) {
                        try {
                            Category newCategory = categoryService.getById(newCategoryId, user);
                            if (newCategory != null) {
                                existingExpense.setCategoryId(newCategory.getId());

                                if (newCategory.getExpenseIds() == null) {
                                    newCategory.setExpenseIds(new HashMap<>());
                                }

                                Set<Integer> expenseSet = newCategory.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                                expenseSet.add(existingExpense.getId());
                                newCategory.getExpenseIds().put(user.getId(), expenseSet);
                                categoryRepository.save(newCategory);
                            }
                        } catch (Exception e) {
                            // Try to use "Others" category as fallback
                            try {
                                System.out.println("Entered into catchblock for update: " + newCategoryId);
                                Category category = categoryService.getByName("Others", user).get(0);
                                System.out.println("Category name: " + category.getName());
                                existingExpense.setCategoryId(category.getId());

                                if (category.getExpenseIds() == null) {
                                    category.setExpenseIds(new HashMap<>());
                                }

                                Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                                expenseSet.add(existingExpense.getId());
                                category.getExpenseIds().put(user.getId(), expenseSet);
                                categoryRepository.save(category);
                            } catch (Exception notFound) {
                                // Create "Others" category if it doesn't exist
                                System.out.println("Entered into not found for update");
                                Category createdCategory = new Category();
                                createdCategory.setDescription("Others Description");
                                createdCategory.setName("Others");
                                try {
                                    Category newCategory = categoryService.create(createdCategory, user);
                                    existingExpense.setCategoryId(newCategory.getId());

                                    if (newCategory.getExpenseIds() == null) {
                                        newCategory.setExpenseIds(new HashMap<>());
                                    }

                                    Set<Integer> expenseSet = new HashSet<>();
                                    expenseSet.add(existingExpense.getId());
                                    newCategory.getExpenseIds().put(user.getId(), expenseSet);
                                    categoryRepository.save(newCategory);
                                } catch (Exception createError) {
                                    System.out.println("Error creating Others category: " + createError.getMessage());
                                }
                            }
                        }
                    }
                }

                // Update expense details
                ExpenseDetails newDetails = expense.getExpense();
                if (newDetails != null && existingExpense.getExpense() != null) {
                    ExpenseDetails existingDetails = existingExpense.getExpense();
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
                        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndId(user.getId(), budgetId);
                        if (budgetOpt.isPresent()) {
                            Budget budget = budgetOpt.get();
                            if (!expense.getDate().isBefore(budget.getStartDate()) &&
                                    !expense.getDate().isAfter(budget.getEndDate())) {
                                validBudgetIds.add(budgetId);
                            }
                        }
                    }
                }

                // Remove old budget links
                if (existingExpense.getBudgetIds() != null) {
                    for (Integer oldBudgetId : existingExpense.getBudgetIds()) {
                        if (!validBudgetIds.contains(oldBudgetId)) {
                            Budget oldBudget = budgetRepository.findByUserIdAndId(user.getId(), oldBudgetId).orElse(null);
                            if (oldBudget != null && oldBudget.getExpenseIds() != null) {
                                oldBudget.getExpenseIds().remove(existingExpense.getId());
                                oldBudget.setBudgetHasExpenses(!oldBudget.getExpenseIds().isEmpty());
                                budgetRepository.save(oldBudget);
                            }
                        }
                    }
                }

                existingExpense.setBudgetIds(validBudgetIds);
                Expense savedExpense = expenseRepository.save(existingExpense);

                // Add new budget links
                for (Integer budgetId : validBudgetIds) {
                    Budget budget = budgetRepository.findByUserIdAndId(user.getId(), budgetId).orElse(null);
                    if (budget != null) {
                        if (budget.getExpenseIds() == null) budget.setExpenseIds(new HashSet<>());
                        budget.getExpenseIds().add(savedExpense.getId());
                        budget.setBudgetHasExpenses(true);
                        budgetRepository.save(budget);
                    }
                }

                // Log successful update
                auditExpenseService.logAudit(
                        user,
                        savedExpense.getId(),
                        "Expense Updated",
                        "Expense: " + savedExpense.getExpense().getExpenseName() + ", Amount: " + savedExpense.getExpense().getAmount()
                );

                // Add the successfully updated expense to the result list
                updatedExpenses.add(savedExpense);

            } catch (Exception e) {
                errorMessages.add("Failed to update Expense with ID: " + id + " - " + e.getMessage());
            }
        }

        // Log errors but don't throw exception, so we can return the successfully updated expenses
        if (!errorMessages.isEmpty()) {
            System.err.println("Errors occurred while updating expenses: " + String.join("; ", errorMessages));
        }

        return updatedExpenses;
    }









    @Override
    public List<Expense> getExpensesInBudgetRangeWithIncludeFlag(
            LocalDate startDate,
            LocalDate endDate,
            Integer budgetId,
            Integer userId) {

        Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndId(userId, budgetId);
        if (optionalBudget.isEmpty()) {
            throw new RuntimeException("Budget not found for user with ID: " + budgetId);
        }

        Budget budget = optionalBudget.get();

        // Use provided dates if available, else fall back to budget's start and end
        LocalDate effectiveStartDate = (startDate != null) ? startDate : budget.getStartDate();
        LocalDate effectiveEndDate = (endDate != null) ? endDate : budget.getEndDate();

        List<Expense> expensesInRange = expenseRepository.findByUserIdAndDateBetween(userId, effectiveStartDate, effectiveEndDate);

        for (Expense expense : expensesInRange) {
            boolean isIncluded = expense.getBudgetIds() != null && expense.getBudgetIds().contains(budgetId);
            expense.setIncludeInBudget(isIncluded); // flag for front-end use only
        }

        return expensesInRange;
    }








    @Override
    @Transactional
    public void deleteAllExpenses(User user, List<Expense> expenses) {
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

            // Check if the user is authorized to delete this expense
            if (existing.getUser() == null || !existing.getUser().getId().equals(user.getId())) {
                errorMessages.add("User not authorized to delete Expense ID: " + expense.getId() +
                        " (Expense belongs to user " +
                        (existing.getUser() != null ? existing.getUser().getId() : "unknown") +
                        ", current user is " + user.getId() + ")");
                continue;
            }

            try {
                // Remove expense from associated budgets
                Set<Integer> budgetIds = existing.getBudgetIds();
                if (budgetIds != null) {
                    for (Integer budgetId : budgetIds) {
                        Budget budget = budgetRepository.findByUserIdAndId(user.getId(), budgetId).orElse(null);
                        if (budget != null && budget.getExpenseIds() != null) {
                            budget.getExpenseIds().remove(existing.getId());
                            budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());
                            budgetRepository.save(budget);
                        }
                    }
                }

                // Remove expense from associated category
                Integer categoryId = existing.getCategoryId();
                if (categoryId != null) {
                    try {
                        Category category = categoryService.getById(categoryId, user);
                        if (category != null && category.getExpenseIds() != null) {
                            Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                            expenseSet.remove(existing.getId());

                            // If there are no more expenses for this user, remove the user key entirely
                            if (expenseSet.isEmpty()) {
                                category.getExpenseIds().remove(user.getId());
                            } else {
                                category.getExpenseIds().put(user.getId(), expenseSet);
                            }

                            categoryRepository.save(category);
                        }
                    } catch (Exception e) {
                        // Log error but continue with deletion
                        System.out.println("Error removing expense from category: " + e.getMessage());
                    }
                }

                // Log the audit
                auditExpenseService.logAudit(
                        user,
                        existing.getId(),
                        "Expense Deleted",
                        existing.getExpense().getExpenseName()
                );

                // Add to the list of expenses to delete
                expensesToDelete.add(existing);
            } catch (Exception e) {
                errorMessages.add("Failed to process deletion for Expense ID: " + expense.getId() + " - " + e.getMessage());
            }
        }

        // Delete all valid expenses in a batch operation
        if (!expensesToDelete.isEmpty()) {
            expenseRepository.deleteAll(expensesToDelete);
        }

        // If there were any errors, throw an exception with all error messages
        if (!errorMessages.isEmpty()) {
            throw new RuntimeException("Errors occurred while deleting expenses: " + String.join("; ", errorMessages));
        }
    }


    @Override
    @Transactional
    public void deleteExpensesByIds(List<Integer> ids, User user) throws Exception {
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
                // Check if the user is authorized to delete this expense
                if (expense.getUser() == null || !expense.getUser().getId().equals(user.getId())) {
                    errorMessages.add("User not authorized to delete Expense ID: " + expense.getId() +
                            " (Expense belongs to user " +
                            (expense.getUser() != null ? expense.getUser().getId() : "unknown") +
                            ", current user is " + user.getId() + ")");
                    continue;
                }

                // Remove expense from associated budgets
                Set<Integer> budgetIds = expense.getBudgetIds();
                if (budgetIds != null) {
                    for (Integer budgetId : budgetIds) {
                        Budget budget = budgetRepository.findByUserIdAndId(user.getId(), budgetId).orElse(null);
                        if (budget != null && budget.getExpenseIds() != null) {
                            budget.getExpenseIds().remove(expense.getId());
                            budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());
                            budgetRepository.save(budget);
                        }
                    }
                }

                // Remove expense from associated category
                Integer categoryId = expense.getCategoryId();
                if (categoryId != null) {
                    try {
                        Category category = categoryService.getById(categoryId, user);
                        if (category != null && category.getExpenseIds() != null) {
                            Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                            expenseSet.remove(expense.getId());

                            // If there are no more expenses for this user, remove the user key entirely
                            if (expenseSet.isEmpty()) {
                                category.getExpenseIds().remove(user.getId());
                            } else {
                                category.getExpenseIds().put(user.getId(), expenseSet);
                            }

                            categoryRepository.save(category);
                        }
                    } catch (Exception e) {
                        // Log error but continue with deletion
                        System.out.println("Error removing expense from category: " + e.getMessage());
                    }
                }

                // Log the audit
                auditExpenseService.logAudit(
                        user,
                        expense.getId(),
                        "Expense Deleted",
                        expense.getExpense().getExpenseName()
                );

                // Add to the list of expenses to delete
                expensesToDelete.add(expense);
            } catch (Exception e) {
                errorMessages.add("Failed to process deletion for Expense ID: " + expense.getId() + " - " + e.getMessage());
            }
        }

        // Delete all valid expenses in a batch operation
        if (!expensesToDelete.isEmpty()) {
            expenseRepository.deleteAll(expensesToDelete);
        }

        // If there were any errors, throw an exception with all error messages
        if (!errorMessages.isEmpty()) {
            throw new Exception("Errors occurred while deleting expenses: " + String.join("; ", errorMessages));
        }
    }


    @Override
    @Transactional
    public void deleteExpense(Integer id, User user) {
        Expense expense = expenseRepository.findByUserIdAndId(user.getId(), id);
        if (expense == null) {
            throw new RuntimeException("Expense not found with ID: " + id);
        }

        // Remove expense from associated budgets
        Set<Integer> budgetIds = expense.getBudgetIds();
        if (budgetIds != null) {
            for (Integer budgetId : budgetIds) {
                Budget budget = budgetRepository.findByUserIdAndId(user.getId(), budgetId).orElse(null);
                if (budget != null && budget.getExpenseIds() != null) {
                    budget.getExpenseIds().remove(expense.getId());
                    budget.setBudgetHasExpenses(!budget.getExpenseIds().isEmpty());
                    budgetRepository.save(budget);
                }
            }
        }

        // Remove expense from associated category
        Integer categoryId = expense.getCategoryId();
        if (categoryId != null) {
            try {
                Category category = categoryService.getById(categoryId, user);
                if (category != null && category.getExpenseIds() != null) {
                    Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                    expenseSet.remove(expense.getId());

                    // If there are no more expenses for this user, remove the user key entirely
                    if (expenseSet.isEmpty()) {
                        category.getExpenseIds().remove(user.getId());
                    } else {
                        category.getExpenseIds().put(user.getId(), expenseSet);
                    }

                    categoryRepository.save(category);
                }
            } catch (Exception e) {
                // Log error but continue with deletion
                System.out.println("Error removing expense from category: " + e.getMessage());
            }
        }

        auditExpenseService.logAudit(
                user,
                expense.getId(),
                "Expense Deleted",
                expense.getExpense().getExpenseName()
        );

        expenseRepository.deleteById(id);
    }


    @Override
    public MonthlySummary getMonthlySummary(Integer year, Integer month,User user) {
        // Define the date ranges
        LocalDate creditDueStartDate = LocalDate.of(year, month, 1).minusMonths(1).withDayOfMonth(17);
        LocalDate creditDueEndDate = LocalDate.of(year, month, 1).withDayOfMonth(16);

        LocalDate generalStartDate = LocalDate.of(year, month, 1);
        LocalDate generalEndDate = generalStartDate.withDayOfMonth(generalStartDate.lengthOfMonth());

        // Define the date formatter to display in dd-MM-yyyy format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        // Fetch expenses for each date range
        List<Expense> creditDueExpenses = expenseRepository.findByUserAndDateBetween(creditDueStartDate, creditDueEndDate,user);
        List<Expense> generalExpenses = expenseRepository.findByUserAndDateBetween(generalStartDate, generalEndDate,user);

        BigDecimal totalGain = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;
        BigDecimal totalCreditPaid = BigDecimal.ZERO;

    Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        CashSummary cashSummary = new CashSummary();
        BigDecimal currentMonthCreditDue = BigDecimal.ZERO;
        BigDecimal creditDue = BigDecimal.ZERO;

        // Process credit due expenses for credit due calculations
        for (Expense expense : creditDueExpenses) {
            if ("creditNeedToPaid".equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                creditDue = creditDue.add(BigDecimal.valueOf(expense.getExpense().getAmount()));
                currentMonthCreditDue = currentMonthCreditDue.add(BigDecimal.valueOf(expense.getExpense().getAmount()));
            } else if ("creditPaid".equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                currentMonthCreditDue = currentMonthCreditDue.subtract(BigDecimal.valueOf(expense.getExpense().getAmount()));
            }
        }

        // Process general expenses for all other calculations
        for (Expense expense : generalExpenses) {
            String category = expense.getExpense().getType();
            BigDecimal amount = BigDecimal.valueOf(expense.getExpense().getAmount());

            if (category.equalsIgnoreCase("gain") || category.equalsIgnoreCase("income")) {
                totalGain = totalGain.add(amount);
                if ("cash".equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                    cashSummary.setGain(cashSummary.getGain().add(amount));
                }
                // Add gain to category breakdown as positive
                categoryBreakdown.merge(category, amount, BigDecimal::add);
            } else if (category.equalsIgnoreCase("loss") || category.equalsIgnoreCase("expense")) {
                BigDecimal negativeAmount = amount.negate();
                totalLoss = totalLoss.add(negativeAmount);

                if ("cash".equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                    cashSummary.setLoss(cashSummary.getLoss().add(negativeAmount));
                }
                if ("creditPaid".equalsIgnoreCase(expense.getExpense().getPaymentMethod())) {
                    totalCreditPaid = totalCreditPaid.add(amount);
                }
                // Add loss to category breakdown as negative
                categoryBreakdown.merge(category, negativeAmount, BigDecimal::add);
            }
        }

        // Calculate the difference (cash gain - cash loss)
        cashSummary.calculateDifference();

        BigDecimal balanceRemaining = totalGain.subtract(totalLoss).setScale(2, BigDecimal.ROUND_HALF_UP);

        // Create and populate the MonthlySummary
        MonthlySummary summary = new MonthlySummary();
        summary.setTotalAmount(totalGain.add(totalLoss).setScale(2, BigDecimal.ROUND_HALF_UP));
        summary.setCategoryBreakdown(categoryBreakdown);
        summary.setBalanceRemaining(balanceRemaining);
        summary.setCurrentMonthCreditDue(currentMonthCreditDue.setScale(2, BigDecimal.ROUND_HALF_UP));
        summary.setCash(cashSummary);
        summary.setCreditPaid(totalCreditPaid.setScale(2, BigDecimal.ROUND_HALF_UP));
        summary.setCreditDue(creditDue.setScale(2, BigDecimal.ROUND_HALF_UP));

        // Set the credit due date range message
        String formattedCreditDueStartDate = creditDueStartDate.format(formatter);
        String formattedCreditDueEndDate = creditDueEndDate.format(formatter);
        summary.setCreditDueMessage("Credit Due is calculated from " + formattedCreditDueStartDate + " to " + formattedCreditDueEndDate);

        return summary;
    }


    
    @Override
    public Map<String, MonthlySummary> getYearlySummary(Integer year,User user) {
        Map<String, MonthlySummary> yearlySummary = new LinkedHashMap<>();
        
        String[] monthNames = {
            "January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"
        };

        for (int month = 1; month <= 12; month++) {
            MonthlySummary monthlySummary = getMonthlySummary(year, month,user);

            // Check if the monthly summary has any non-zero or non-null values
            if (hasRelevantData(monthlySummary)) {
                yearlySummary.put(monthNames[month - 1], monthlySummary);
            }
        }
        
        return yearlySummary;
    }
    private boolean hasRelevantData(MonthlySummary summary) {
        return summary.getTotalAmount().compareTo(BigDecimal.ZERO) != 0 ||
               summary.getBalanceRemaining().compareTo(BigDecimal.ZERO) != 0 ||
               summary.getCurrentMonthCreditDue().compareTo(BigDecimal.ZERO) != 0 ||
               summary.getCash().getGain().compareTo(BigDecimal.ZERO) != 0 ||
               summary.getCash().getLoss().compareTo(BigDecimal.ZERO) != 0 ||
               summary.getCash().getDifference().compareTo(BigDecimal.ZERO) != 0 ||
               summary.getCreditPaid().compareTo(BigDecimal.ZERO) != 0 ||
               summary.getCreditDue().compareTo(BigDecimal.ZERO) != 0 ||
               (summary.getCategoryBreakdown() != null && !summary.getCategoryBreakdown().isEmpty());
    }


    
    @Override
    public List<MonthlySummary> getSummaryBetweenDates(Integer startYear, Integer startMonth, Integer endYear, Integer endMonth,User user) {
        List<MonthlySummary> summaries = new ArrayList<>();

        // Set the start date to the first day of the start month
        LocalDate startDate = LocalDate.of(startYear, startMonth, 1);

        // Set the end date to the last day of the end month
        LocalDate endDate = LocalDate.of(endYear, endMonth, 1).withDayOfMonth(LocalDate.of(endYear, endMonth, 1).lengthOfMonth());

        // Loop through each month between the start and end date
        while (!startDate.isAfter(endDate)) {
            // Get the summary for this month
            MonthlySummary summary = getMonthlySummary(startDate.getYear(), startDate.getMonthValue(),user);
            summaries.add(summary);

            // Move to the next month
            startDate = startDate.plusMonths(1);
        }

        return summaries;
    }

    @Override
    @Transactional
    public List<Expense> saveMultipleExpenses(List<Expense> expenses, User user1) {
        User user = userRepository.findById(user1.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        List<Expense>newExpenses=new ArrayList<>();
        for(Expense expense:expenses)
        {
            Expense createExpense=new Expense();
            ExpenseDetails expenseDetails=new ExpenseDetails();



            createExpense.setUser(user);
            createExpense.setDate(expense.getDate());
            createExpense.setExpense(expenseDetails);


            expenseDetails.setExpenseName(expense.getExpense().getExpenseName());
            expenseDetails.setType(expense.getExpense().getType());
            expenseDetails.setCreditDue(expense.getExpense().getCreditDue());
            expenseDetails.setComments(expense.getExpense().getComments());
            expenseDetails.setNetAmount(expense.getExpense().getNetAmount());
            expenseDetails.setPaymentMethod(expense.getExpense().getPaymentMethod());
            expenseDetails.setAmount(expense.getExpense().getAmount());
            expenseDetails.setExpense(expense);




            newExpenses.add(createExpense);

        }


        return expenseRepository.saveAll(newExpenses) ;
    }



    @Override
    public List<Expense> getExpensesByDate(LocalDate date,User user) {
        // Assuming the `Expense` model has a `date` field and you want to find expenses for this specific day.
        return expenseRepository.findByUserAndDate(user,date);
    }
    
 // Method to fetch the top N expenses by amount
    @Override
    public List<Expense> getTopNExpenses(int n,User user) {
        Pageable pageable = PageRequest.of(0, n);
        Page<Expense> topExpensesPage = expenseRepository.findTopNExpensesByUserAndAmount(user.getId(),pageable);
        return topExpensesPage.getContent();
    }
    @Override
    public List<Expense> searchExpensesByName(String expenseName,User user) {
        return expenseRepository.searchExpensesByUserAndName(user.getId(),expenseName);
    }
    @Override
    public List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate, String type, String paymentMethod, Double minAmount, Double maxAmount,User user) {
        return expenseRepository.filterExpensesByUser(user.getId(),expenseName, startDate, endDate, type, paymentMethod, minAmount, maxAmount);
    }

    @Override
    public List<String> getTopExpenseNames(int topN, User user) {
        Page<Object[]> results = expenseRepository.findTopExpenseNamesByUser(user.getId(), PageRequest.of(0, topN));
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
                capitalizedString.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1).toLowerCase())
                        .append(" ");
            }
        }

        return capitalizedString.toString().trim();
    }


    @Override
    public Map<String, Object> getMonthlySpendingInsights(int year, int month,User user) {
        LocalDate startDate = LocalDate.of(year, Month.of(month), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(startDate, endDate,user);

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
    public List<String> getPaymentMethods(User user) {
        List<String> paymentMethodsList = new ArrayList<>(Arrays.asList( "cash", "creditPaid","creditNeedToPaid"));
        return paymentMethodsList;
    }

    
    @Override
    public Map<String, Map<String, Double>> getPaymentMethodSummary(User user) {
        List<Expense> expenses = expenseRepository.findByUser(user);
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
    public List<Expense> getExpensesByType(String type,User user) {
        return expenseRepository.findExpensesWithGainTypeByUser(user.getId());
    }
    
    @Override
    public List<Expense> getLossExpenses(User user) {
        return expenseRepository.findByLossTypeAndUser(user.getId());
    }
    
    
    @Override
    public List<Expense> getExpensesByPaymentMethod(String paymentMethod,User user) {
        return expenseRepository.findByUserAndPaymentMethod(user.getId(),paymentMethod);
    }
    
    
    @Override
    public List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod,User user) {
        return expenseRepository.findByUserAndTypeAndPaymentMethod(user.getId(),type, paymentMethod);
    }
    
    public List<String> getTopPaymentMethods(User user) {
        List<Object[]> results = expenseRepository.findTopPaymentMethodsByUser(user.getId());
        List<String> topPaymentMethods = new ArrayList<>();

        for (Object[] result : results) {
            String paymentMethod = (String) result[0];
            topPaymentMethods.add(paymentMethod);
        }

        return topPaymentMethods;
    }
    
    @Override
    public List<Expense> getTopGains(User user) {
        Pageable pageable = PageRequest.of(0, 10);  // Top 10 results
        return expenseRepository.findTop10GainsByUser(user.getId(), pageable);
    }
    
    @Override
    public List<Expense> getTopLosses(User user) {
        Pageable pageable = PageRequest.of(0, 10);
        return expenseRepository.findTop10LossesByUser(
                user.getId(),pageable
        );
    }
    @Override
    public List<Expense> getExpensesByMonthAndYear(int month, int year,User user) {
        return expenseRepository.findByUserAndMonthAndYear(user.getId(),month, year);
    }
    
    @Override
    public List<String> getUniqueTopExpensesByGain(User user,int limit) {
        Pageable pageable = PageRequest.of(0, limit);  // Limit the results to the 'limit' number
        return expenseRepository.findTopExpensesByGainForUser(user.getId(), pageable);
    }
    
    @Override
    public List<String> getUniqueTopExpensesByLoss(User user,int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<String> expenseNames = expenseRepository.findTopExpensesByLoss(user.getId(),pageable);
        return getUniqueExpenseNames(expenseNames);
    }

    private List<String> getUniqueExpenseNames(List<String> expenseNames) {
        return expenseNames.stream()
            .map(String::toLowerCase)
            .distinct()
            .collect(Collectors.toList());
    }
    
    
    @Override
    public List<Expense> getExpensesForToday(User user) {
        LocalDate today = LocalDate.now();  // Get today's date
        return expenseRepository.findByUserAndDate(user,today);  // Query expenses for today's date
    }
    
    
    @Override
    public List<Expense> getExpensesForLastMonth(User user) {
        // Get the current date
        LocalDate today = LocalDate.now();

        // Calculate the first day of last month
        LocalDate firstDayOfLastMonth = today.withDayOfMonth(1).minusMonths(1);

        // Calculate the last day of last month
        LocalDate lastDayOfLastMonth = firstDayOfLastMonth.withDayOfMonth(firstDayOfLastMonth.lengthOfMonth());

        // Query expenses between the first and last day of the previous month
        return expenseRepository.findByUserAndDateBetween(firstDayOfLastMonth, lastDayOfLastMonth,user);
    }
    
    @Override
    public List<Expense> getExpensesForCurrentMonth(User user) {
        LocalDate today = LocalDate.now();  // Get today's date

        // Calculate the first day of the current month
        LocalDate firstDayOfCurrentMonth = today.withDayOfMonth(1);

        // Calculate the last day of the current month
        LocalDate lastDayOfCurrentMonth = today.withDayOfMonth(today.lengthOfMonth());

        // Query expenses for the current month
        return expenseRepository.findByUserAndDateBetween(firstDayOfCurrentMonth, lastDayOfCurrentMonth,user);
    }
    
    
    @Override
    public String getCommentsForExpense(Integer expenseId,User user) {
        // Fetch the expense by its ID
        Expense expense = expenseRepository.findByUserIdAndId(user.getId(),expenseId);

        if (expense!=null) {
            // Return the comments associated with the expense
            return expense.getExpense().getComments();
        } else {
            // Return a message indicating the expense or comments are not found
            return "No comments found for this expense.";
        }
    }
    
    
    @Override
    public String removeCommentFromExpense(Integer expenseId,User user) {
        // Fetch the expense by its ID
        Expense expense = expenseRepository.findByUserIdAndId(user.getId(),expenseId);
        

        if (expense!=null && expense.getExpense() != null) {
            // Remove the comment by setting it to null or empty string
            expense.getExpense().setComments(null);  // You could also set it to an empty string ""

            // Save the updated expense
            expenseRepository.save(expense);

            return "Comment removed successfully.";
        } else {
            return "Expense not found or no comment to remove.";
        }
    }
    
    @Override
    public ExpenseReport generateExpenseReport(Integer expenseId,User user) {
        // Fetch the expense based on the ID
        Expense expenseOptional = expenseRepository.findByUserIdAndId(user.getId(),expenseId);

        // If the expense exists, create and save the report
        if (expenseOptional!=null) {
            Expense expense = expenseOptional;
            
            // Get the associated expense details
            String expenseName = expense.getExpense().getExpenseName();  // Fetch expense name
            String comments = expense.getExpense().getComments();  // Fetch comments

            // Create ExpenseReport object
            ExpenseReport report = new ExpenseReport();
            report.setExpenseId(expense.getId());
            report.setExpenseName(expenseName);  // Set expense name
            report.setComments(comments);       // Set comments
            report.setGeneratedDate(LocalDate.now());
            report.setTotalAmount(expense.getExpense().getAmount());
            report.setReportDetails("Generated report for expense ID " + expense.getId());

            // Set the generated time in IST (Indian Standard Time)
            LocalDateTime indiaTime = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
            
            // Format the time in 12-hour format (e.g., 02:30 PM)
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
            String formattedTime = indiaTime.format(formatter);
            report.setGeneratedTime(formattedTime);

            // Save the generated report to the database
            return expenseReportRepository.save(report);
        } else {
            // If the expense does not exist, throw an exception
            throw new RuntimeException("Expense not found for ID: " + expenseId);
        }
    }
    
    
    @Override
    public Expense copyExpense(Integer expenseId,User user) {
        // Fetch the original expense using ExpenseRepository
        Expense originalExpense = expenseRepository.findByUserIdAndId(user.getId(),expenseId);

        // Create a new Expense object, set the current date as the new expense date
        Expense newExpense = new Expense();
        newExpense.setDate(LocalDate.now());  // Set today's date for the new expense

        // Save the new Expense object
        Expense savedExpense = expenseRepository.save(newExpense);

        // Copy the ExpenseDetails and link it to the new Expense
        ExpenseDetails originalDetails = originalExpense.getExpense();
        ExpenseDetails newDetails = new ExpenseDetails();

        newDetails.setExpenseName(originalDetails.getExpenseName());
        newDetails.setAmount(originalDetails.getAmount());
        newDetails.setType(originalDetails.getType());
        newDetails.setPaymentMethod(originalDetails.getPaymentMethod());
        newDetails.setNetAmount(originalDetails.getNetAmount());
        newDetails.setComments(originalDetails.getComments());
        newDetails.setCreditDue(originalDetails.getCreditDue());

        // Link the new details to the new expense
        newDetails.setExpense(savedExpense);

        // Set the new details in the saved expense
        savedExpense.setExpense(newDetails);

        // Save the new Expense object with the linked ExpenseDetails
        expenseRepository.save(savedExpense);

        // Return the newly copied expense
        return savedExpense;
    }
    
    @Override
    public List<ExpenseDetails> getExpenseDetailsByAmount(double amount,User user) {
        return expenseRepository.findByUserAndAmount(user.getId(),amount);  // Fetch expense details by amount
    }


    @Override
    public List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount,User user) {
        return expenseRepository.findExpensesByUserAndAmountRange(user.getId(),minAmount, maxAmount);  // Fetch expenses within the amount range
    }
    @Override
    public Double getTotalExpenseByName(String expenseName) {
        return expenseRepository.getTotalExpenseByName(expenseName.trim());
    }
    @Override
    public List<ExpenseDetails> getExpensesByName(String expenseName,User user) {
        return expenseRepository.findExpensesByUserAndName(user.getId(),expenseName.trim());
    }
    
    @Override
    public List<Map<String, Object>> getTotalByCategory(User user) {
        List<Object[]> result = expenseRepository.findTotalExpensesGroupedByCategory(user.getId());
        System.out.println("Result size: " + result.size());
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : result) {
            String expenseName = ((String) row[0]).trim();
            Double totalAmount = (Double) row[1];

            List<Integer> expenseIds = new ArrayList<>();
            List<ExpenseDetails> expenseDetailsList = expenseRepository.findExpensesByUserAndName(user.getId(),expenseName);

            List<String> expenseDates = new ArrayList<>();
            for (ExpenseDetails expenseDetails : expenseDetailsList) {
                expenseIds.add(expenseDetails.getId());
                expenseDates.add(expenseDetails.getExpense().getDate().toString());
            }

            Map<String, Object> map = new HashMap<>();
            map.put("expenseName", expenseName);
            map.put("totalAmount", totalAmount);
//            map.put("ids", expenseIds);
//            map.put("dates", expenseDates);

            response.add(map);
        }

        return response;
    }
    
    
    @Override
    public Map<String, Double> getTotalByDate() {
        // Fetching total expenses grouped by date from the repository
        List<Object[]> result = expenseRepository.findTotalExpensesGroupedByDate();

        // Map to store the final response: {date: totalAmount}
        Map<String, Double> totalExpensesByDate = new HashMap<>();

        // Iterating through the result and filling the map
        for (Object[] row : result) {
            LocalDate date = (LocalDate) row[0];  // Date of the expense
            Double totalAmount = (Double) row[1];  // Total amount for that date

            // Storing the result in the map, converting date to String for JSON response
            totalExpensesByDate.put(date.toString(), totalAmount);
        }

        // Returning the final map
        return totalExpensesByDate;
    }
    
    @Override
    public Double getTotalForToday() {
        // Fetching the total expenses for today from the repository
        LocalDate today = LocalDate.now(); // Get today's date
        return expenseRepository.findTotalExpensesForToday(today);
    }
    
    
    @Override
    public Double getTotalForCurrentMonth() {
        // Fetching the current month and year
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue(); // Get current month (1-12)
        int year = today.getYear(); // Get current year
        
        // Fetch total expenses for the current month and year
        return expenseRepository.findTotalExpensesForCurrentMonth(month, year);
    }

    @Override
    public Double getTotalForMonthAndYear(int month, int year) {
        return expenseRepository.getTotalByMonthAndYear(month, year);
    }
    
    @Override
    public Double getTotalByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.getTotalByDateRange(startDate, endDate);
    }
    
    
    @Override
    public Map<String, Double> getPaymentWiseTotalForCurrentMonth() {
        // Get the current month and year
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        // Call the repository to fetch the totals
        List<Object[]> paymentWiseTotals = expenseRepository.findTotalByPaymentMethodForCurrentMonth(currentMonth, currentYear);

        // Prepare the result map
        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : paymentWiseTotals) {
            result.put((String) obj[0], (Double) obj[1]);  // Payment method and total netAmount
        }

        return result;
    }
    
    @Override
    public Map<String, Double> getPaymentWiseTotalForLastMonth() {
        // Get the current date and calculate the last month
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        // Calculate the previous month and adjust the year if necessary
        int lastMonth = currentMonth - 1;
        int lastYear = currentYear;
        if (lastMonth == 0) {
            lastMonth = 12;  // December
            lastYear -= 1;   // Previous year
        }

        // Call the repository to fetch the totals
        List<Object[]> paymentWiseTotals = expenseRepository.findTotalByPaymentMethodForLastMonth(lastMonth, lastYear);

        // Prepare the result map
        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : paymentWiseTotals) {
            result.put((String) obj[0], (Double) obj[1]);  // Payment method and total netAmount
        }

        return result;
    }
    
    @Override
    public Map<String, Double> getPaymentWiseTotalForDateRange(LocalDate startDate, LocalDate endDate) {
        // Call the repository to get payment-wise totals for the specific date range
        List<Object[]> paymentWiseTotals = expenseRepository.findTotalByPaymentMethodBetweenDates(startDate, endDate);

        // Prepare the result map
        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : paymentWiseTotals) {
            result.put((String) obj[0], (Double) obj[1]);  // Payment method and total netAmount
        }

        return result;
    }
    
    @Override
    public Map<String, Double> getPaymentWiseTotalForMonth(int month, int year) {
        // Call the repository to get payment-wise totals for the specified month and year
        List<Object[]> paymentWiseTotals = expenseRepository.findTotalByPaymentMethodForMonth(month, year);

        // Prepare the result map
        Map<String, Double> result = new HashMap<>();
        for (Object[] obj : paymentWiseTotals) {
            result.put((String) obj[0], (Double) obj[1]);  // Payment method and total netAmount
        }

        return result;
    }
    
    @Override
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethod(int month, int year) {
        // Call the repository to get totals grouped by expenseName and paymentMethod
        List<Object[]> totals = expenseRepository.findTotalByExpenseNameAndPaymentMethodForMonth(month, year);

        // Prepare the result map
        Map<String, Map<String, Double>> result = new HashMap<>();
        for (Object[] obj : totals) {
            String expenseName = (String) obj[0];
            String paymentMethod = (String) obj[1];
            Double totalAmount = (Double) obj[2];

            // Create a map for each expenseName if it doesn't exist
            result.putIfAbsent(expenseName, new HashMap<>());
            // Add the paymentMethod and its corresponding total to the expenseName map
            result.get(expenseName).put(paymentMethod, totalAmount);
        }

        return result;
    }
    
    @Override
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(LocalDate startDate, LocalDate endDate) {
        // Call the repository to get totals grouped by expenseName and paymentMethod
        List<Object[]> totals = expenseRepository.findTotalByExpenseNameAndPaymentMethodForDateRange(startDate, endDate);

        // Prepare the result map
        Map<String, Map<String, Double>> result = new HashMap<>();
        for (Object[] obj : totals) {
            String expenseName = (String) obj[0];
            String paymentMethod = (String) obj[1];
            Double totalAmount = (Double) obj[2];

            // Create a map for each expenseName if it doesn't exist
            result.putIfAbsent(expenseName, new HashMap<>());
            // Add the paymentMethod and its corresponding total to the expenseName map
            result.get(expenseName).put(paymentMethod, totalAmount);
        }

        return result;
    }
    
    @Override
    public Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod() {
        List<Object[]> results = expenseRepository.findTotalExpensesGroupedByCategoryAndPaymentMethod();
        Map<String, Map<String, Double>> groupedExpenses = new HashMap<>();

        for (Object[] result : results) {
            String expenseName = ((String) result[0]).trim().toLowerCase();
            String paymentMethod = (String) result[1];
            Double totalAmount = (Double) result[2];

            groupedExpenses
                .computeIfAbsent(expenseName, k -> new HashMap<>())
                .merge(paymentMethod, totalAmount, Double::sum);
        }

        return groupedExpenses;
    }
    
//    @Override
//    public String generateExcelReport() throws IOException {
//        List<ExpenseDetails> expenses = expenseRepository.findAllExpenseDetails();
//
//        Workbook workbook = new XSSFWorkbook();
//        Sheet sheet = workbook.createSheet("Expenses");
//
//        // Create header row
//        Row headerRow = sheet.createRow(0);
//        headerRow.createCell(0).setCellValue("Expense Name");
//        headerRow.createCell(1).setCellValue("Payment Method");
//        headerRow.createCell(2).setCellValue("Net Amount");
//        headerRow.createCell(3).setCellValue("Credit Due");
//
//        // Fill data rows
//        int rowNum = 1;
//        for (ExpenseDetails expense : expenses) {
//            Row row = sheet.createRow(rowNum++);
//            row.createCell(0).setCellValue(expense.getExpenseName());
//            row.createCell(1).setCellValue(expense.getPaymentMethod());
//            row.createCell(2).setCellValue(expense.getNetAmount());
//            row.createCell(3).setCellValue(expense.getCreditDue());
//        }
//
//        // Write the output to a file in the user's home directory
//        String homeDir = System.getProperty("user.home");
//        String filePath = Paths.get(homeDir, "expenses_report.xlsx").toString();
//        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
//            workbook.write(fileOut);
//        }
//
//        workbook.close();
//        return filePath;
//    }
    
    
    @Autowired
    private JavaMailSender mailSender;

    public String generateExcelReport(User user) throws IOException {
        List<Expense> expenses = expenseRepository.findByUser(user);

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
        headerRow.createCell(8).setCellValue("Category Name");
        headerRow.createCell(9).setCellValue("Category Color");
        headerRow.createCell(10).setCellValue("Category Icon");
        headerRow.createCell(11).setCellValue("Category Description");
        headerRow.createCell(12).setCellValue("Is Global Category");
        headerRow.createCell(13).setCellValue("Comments");

        // Create a map to cache category information to avoid repeated database lookups
        Map<Integer, Category> categoryCache = new HashMap<>();

        int rowNum = 1;
        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null) continue;

            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(details.getExpenseName());
            row.createCell(1).setCellValue(details.getPaymentMethod());
            row.createCell(2).setCellValue(details.getAmount());
            row.createCell(3).setCellValue(details.getNetAmount());
            row.createCell(4).setCellValue(details.getCreditDue());
            row.createCell(5).setCellValue(details.getType());
            row.createCell(6).setCellValue(expense.getDate().toString());

            // Add category information
            Integer categoryId = expense.getCategoryId();
            row.createCell(7).setCellValue(categoryId != null ? categoryId : 0);

            // Get category details
            String categoryName = "Uncategorized";
            String categoryColor = "";
            String categoryIcon = "";
            String categoryDescription = "";
            boolean isGlobal = false;

            if (categoryId != null && categoryId > 0) {
                // Check cache first
                Category category = categoryCache.get(categoryId);
                if (category == null) {
                    try {
                        category = categoryService.getById(categoryId, user);
                        categoryCache.put(categoryId, category);
                    } catch (Exception e) {
                        // Category not found, use default values
                    }
                }

                if (category != null) {
                    categoryName = category.getName();
                    categoryColor = category.getColor();
                    categoryIcon = category.getIcon();
                    categoryDescription = category.getDescription();
                    isGlobal = category.isGlobal();
                }
            }

            row.createCell(8).setCellValue(categoryName);
            row.createCell(9).setCellValue(categoryColor);
            row.createCell(10).setCellValue(categoryIcon);
            row.createCell(11).setCellValue(categoryDescription);
            row.createCell(12).setCellValue(isGlobal);

            // Add comments
            row.createCell(13).setCellValue(details.getComments() != null ? details.getComments() : "");
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
            boolean isGlobal = false;

            if (categoryId > 0) {
                Category category = categoryCache.get(categoryId);
                if (category != null) {
                    categoryName = category.getName();
                    categoryColor = category.getColor();
                    categoryIcon = category.getIcon();
                    categoryDescription = category.getDescription();
                    isGlobal = category.isGlobal();
                }
            }

            row.createCell(1).setCellValue(categoryName);
            row.createCell(2).setCellValue(categoryColor);
            row.createCell(3).setCellValue(categoryIcon);
            row.createCell(4).setCellValue(categoryDescription);
            row.createCell(5).setCellValue(isGlobal);
            row.createCell(6).setCellValue(totalAmount);
            row.createCell(7).setCellValue(expenseCount);
        }

        // Auto-size summary columns
        for (int i = 0; i < 8; i++) {
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

        // Create the file
        String emailPrefix = user.getEmail().split("@")[0];  // Get the part before '@' in the email address
        String userFolderName = emailPrefix + "_" + user.getId();
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
            // Create the reports directory if it doesn't exist
            String reportsDir = System.getProperty("user.home") + "/reports";
            Files.createDirectories(Paths.get(reportsDir));

            // Generate a unique file name
            String uniqueFileName = "monthly_report_" + UUID.randomUUID() + ".xlsx";
            Path reportPath = Paths.get(reportsDir, uniqueFileName);

            // Logic to generate the report
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Monthly Report");

            // Add data to the sheet (example data)
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Date");
            headerRow.createCell(1).setCellValue("Description");
            headerRow.createCell(2).setCellValue("Amount");

            // Example data rows
            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("2024-11-01");
            dataRow.createCell(1).setCellValue("Office Supplies");
            dataRow.createCell(2).setCellValue(150.00);

            // Write the workbook to the file
            try (FileOutputStream fileOut = new FileOutputStream(reportPath.toFile())) {
                workbook.write(fileOut);
            }
            workbook.close();

            // Send the report via email
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
    public List<Expense> getExpensesByCurrentWeek() {
        LocalDate startDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endDate = startDate.plusDays(6);
        return expenseRepository.findByDateBetween(startDate, endDate);
    }

    @Override
    public List<Expense> getExpensesByLastWeek() {
        LocalDate endDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).minusDays(1);
        LocalDate startDate = endDate.minusDays(6);
        return expenseRepository.findByDateBetween(startDate, endDate);
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
//            if (details.getCreditDue() == 0.0) {
//                throw new IllegalArgumentException("Invalid data: Missing required field 'creditDue' in expense details: " + expense);
//            }
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

        categorizedExpenses
            .computeIfAbsent(type, k -> new HashMap<>())
            .merge(paymentMethod, amount, Double::sum);
    }

    return categorizedExpenses;
}



@Override
public List<String> findTopExpenseNames(List<ExpenseDTO> expenses, int topN) {
    // Count the frequency of each expense name
    Map<String, Long> expenseNameFrequency = expenses.stream()
            .collect(Collectors.groupingBy(expense -> expense.getExpense().getExpenseName(), Collectors.counting()));

    // Sort the expense names by frequency in descending order and limit to top N
    return expenseNameFrequency.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(topN)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
}



@Override
public String findTopPaymentMethod(List<ExpenseDTO> expenses) {
    // Count the frequency of each payment method
    Map<String, Long> paymentMethodFrequency = expenses.stream()
            .collect(Collectors.groupingBy(expense -> expense.getExpense().getPaymentMethod(), Collectors.counting()));

    // Find the payment method with the highest frequency
    return paymentMethodFrequency.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(null);
}



@Override

public Set<String> getPaymentMethodNames(List<ExpenseDTO> expenses) {
    // Collect the unique payment method names
    return expenses.stream()
            .map(expense -> expense.getExpense().getPaymentMethod())
            .collect(Collectors.toSet());
}

@Override
public List<Expense> getExpensesByIds(List<Integer> ids) {
    return expenseRepository.findByIdIn(ids);
}



@Override
public List<Expense> saveExpenses(List<Expense> expenses) {
    return expenseRepository.saveAll(expenses);
}


    @Override
    public Map<String, List<Map<String, Object>>> getExpensesGroupedByDate(User user, String sortOrder) {
        List<Expense> expenses = expenseRepository.findByUser(user);
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
                expenseMap.put("comments",expense.getExpense().getComments());
                expenseMap.put("paymentMethod",expense.getExpense().getPaymentMethod());
                expenseMap.put("netAmount",expense.getExpense().getNetAmount());
            } else {
                expenseMap.put("expenseName", "No details available");
                expenseMap.put("amount", 0.0);
                expenseMap.put("type", "N/A");
            }

            groupedExpenses.computeIfAbsent(date, k -> new ArrayList<>()).add(expenseMap);
        }

        Map<String, List<Map<String, Object>>> sortedGroupedExpenses = new LinkedHashMap<>();
        groupedExpenses.entrySet().stream()
                .sorted((entry1, entry2) -> {
                    LocalDate date1 = LocalDate.parse(entry1.getKey());
                    LocalDate date2 = LocalDate.parse(entry2.getKey());
                    return "desc".equalsIgnoreCase(sortOrder) ? date2.compareTo(date1) : date1.compareTo(date2);
                })
                .forEach(entry -> sortedGroupedExpenses.put(entry.getKey(), entry.getValue()));

        return sortedGroupedExpenses;
    }





    public Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(User user, String sortOrder, int page, int size, String sortBy) {
        Sort sort = Sort.by(Sort.Order.by(sortBy).with(Sort.Direction.fromString(sortOrder)));
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Expense> expensesPage = expenseRepository.findByUser(user, pageable);

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
        groupedExpenses.entrySet().stream()
                .sorted((entry1, entry2) -> {
                    LocalDate date1 = LocalDate.parse(entry1.getKey());
                    LocalDate date2 = LocalDate.parse(entry2.getKey());
                    return "desc".equalsIgnoreCase(sortOrder) ? date2.compareTo(date1) : date1.compareTo(date2);
                })
                .forEach(entry -> sortedGroupedExpenses.put(entry.getKey(), entry.getValue()));

        return sortedGroupedExpenses;
    }

    @Override
    public Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date) {
        // Fetch expenses that occurred before the given date and match the expense name
        List<Expense>expensesBeforeDate=expenseRepository.findByUserAndExpenseNameBeforeDate(userId, expenseName, date);
        return expensesBeforeDate.get(0);
    }



    @Override
    public List<Expense> saveExpenses(List<ExpenseDTO> expenseDTOs, User user) {
        if (expenseDTOs == null || expenseDTOs.isEmpty()) {
            throw new IllegalArgumentException("Expense DTO list cannot be null or empty.");
        }

        List<Expense> savedExpenses = new ArrayList<>();
        List<String> errorMessages = new ArrayList<>();

        // Create or get the "Others" category once for all expenses
        Category othersCategory = null;
        try {
            // Try to find existing "Others" category
            List<Category> othersCategories = categoryService.getByName("Others", user);

            if (othersCategories != null && !othersCategories.isEmpty()) {
                othersCategory = othersCategories.get(0);
                System.out.println("Found existing 'Others' category with ID: " + othersCategory.getId());
            } else {
                // Create "Others" category if it doesn't exist
                othersCategory = createOthersCategory(user);
                System.out.println("Created new 'Others' category with ID: " + othersCategory.getId());
            }
        } catch (Exception e) {
            System.err.println("Error preparing 'Others' category: " + e.getMessage());
            e.printStackTrace();
            // Continue with null othersCategory - we'll handle individual failures per expense
        }

        for (ExpenseDTO dto : expenseDTOs) {
            try {
                Expense expense = new Expense();
                expense.setUser(user);
                expense.setDate(LocalDate.parse(dto.getDate()));

                // Set up ExpenseDetails
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

                // Save expense first to get an ID
                Expense savedExpense = expenseRepository.save(expense);

                // Handle category assignment
                Category category = null;
                Integer categoryId = dto.getCategoryId();

                // Try to get the specified category
                if (categoryId != null) {
                    try {
                        category = categoryService.getById(categoryId, user);
                    } catch (Exception e) {
                        System.out.println("Specified category not found: " + e.getMessage());
                        // Will fall back to "Others" category
                    }
                }

                // If category is still null, use the pre-fetched "Others" category
                if (category == null) {
                    if (othersCategory != null) {
                        category = othersCategory;
                    } else {
                        // If we couldn't prepare the Others category earlier, try one more time
                        // But first check if it exists now (might have been created in a previous iteration)
                        try {
                            List<Category> existingOthers = categoryService.getByName("Others", user);
                            if (existingOthers != null && !existingOthers.isEmpty()) {
                                category = existingOthers.get(0);
                                // Save this for future iterations
                                othersCategory = category;
                            } else {
                                category = createOthersCategory(user);
                                // Save this for future iterations
                                othersCategory = category;
                            }
                        } catch (Exception e) {
                            errorMessages.add("Failed to create 'Others' category: " + e.getMessage());
                            // Delete the saved expense to avoid orphaned records
                            expenseRepository.delete(savedExpense);
                            continue;
                        }
                    }
                }

                // Now we have a valid category, update the expense with it
                savedExpense.setCategoryId(category.getId());

                // Update the category's expense mapping
                if (category.getExpenseIds() == null) {
                    category.setExpenseIds(new HashMap<>());
                }

                Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                expenseSet.add(savedExpense.getId());
                category.getExpenseIds().put(user.getId(), expenseSet);

                // Save the updated category
                categoryRepository.save(category);

                // Handle budgets
                Set<Integer> validBudgetIds = new HashSet<>();
                if (dto.getBudgetIds() != null) {
                    for (Integer budgetId : dto.getBudgetIds()) {
                        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndId(user.getId(), budgetId);
                        if (budgetOpt.isPresent()) {
                            Budget budget = budgetOpt.get();
                            if (!savedExpense.getDate().isBefore(budget.getStartDate()) &&
                                    !savedExpense.getDate().isAfter(budget.getEndDate())) {
                                validBudgetIds.add(budgetId);
                            }
                        }
                    }
                }
                savedExpense.setBudgetIds(validBudgetIds);

                // Save expense again with updated category and budget info
                savedExpense = expenseRepository.save(savedExpense);
                savedExpenses.add(savedExpense);

                // Update budget links
                for (Integer budgetId : validBudgetIds) {
                    Budget budget = budgetRepository.findByUserIdAndId(user.getId(), budgetId).orElse(null);
                    if (budget != null) {
                        if (budget.getExpenseIds() == null) budget.setExpenseIds(new HashSet<>());
                        budget.getExpenseIds().add(savedExpense.getId());
                        budget.setBudgetHasExpenses(true);
                        budgetRepository.save(budget);
                    }
                }

                // Log successful creation
                auditExpenseService.logAudit(
                        user,
                        savedExpense.getId(),
                        "Expense Created",
                        "Expense: " + savedExpense.getExpense().getExpenseName() + ", Amount: " + savedExpense.getExpense().getAmount()
                );

            } catch (Exception e) {
                errorMessages.add("Failed to save expense for date " + dto.getDate() + ": " + e.getMessage());
            }
        }

        if (!errorMessages.isEmpty()) {
            throw new RuntimeException("Errors occurred while saving expenses: " + String.join("; ", errorMessages));
        }

        return savedExpenses;
    }

    // Helper method to create the "Others" category
    // Helper method to create the "Others" category
    private Category createOthersCategory(User user) throws Exception {
        try {
            // First, check if the category already exists in the database directly
            List<Category> existingCategories = categoryService.getByName("Others",user);
            if (existingCategories != null && !existingCategories.isEmpty()) {
                Category existingCategory = existingCategories.get(0);

                // Make sure this user is associated with the category
                if (existingCategory.getUserIds() == null) {
                    existingCategory.setUserIds(new HashSet<>());
                }
                existingCategory.getUserIds().add(user.getId());

                if (existingCategory.getEditUserIds() == null) {
                    existingCategory.setEditUserIds(new HashSet<>());
                }
                existingCategory.getEditUserIds().add(user.getId());

                // Save the updated category
                return categoryRepository.save(existingCategory);
            }

            // If not found, create a new one
            Category newCategory = new Category();
            newCategory.setName("Others");
            newCategory.setDescription("Default category for uncategorized expenses");
            newCategory.setColor("#808080"); // Gray color for Others category
            newCategory.setIcon("category");
            newCategory.setGlobal(true); // Make it a global category

            // Initialize collections to avoid NPE
            newCategory.setUserIds(new HashSet<>());
            newCategory.getUserIds().add(user.getId());

            newCategory.setEditUserIds(new HashSet<>());
            newCategory.getEditUserIds().add(user.getId());

            newCategory.setExpenseIds(new HashMap<>());

            // Save directly to repository instead of using the service
            return categoryRepository.save(newCategory);
        } catch (Exception e) {
            System.err.println("Error creating 'Others' category: " + e.getMessage());
            e.printStackTrace();
            throw new Exception("Failed to create 'Others' category: " + e.getMessage());
        }
    }


    @Override
    public Map<String, Object> getExpenseByName(User user,int year) {
        List<Object[]> results = expenseRepository.findExpenseByNameAndUserId(year,user.getId());
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
    public Map<String, Object> getMonthlyExpenses(User user, int year) {
        List<Object[]> results = expenseRepository.findMonthlyLossExpensesByUserId(year, user.getId());

        // Short month labels (Jan to Dec)
        String[] labels = new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Double[] data = new Double[12];
        Arrays.fill(data, 0.0);

        for (Object[] result : results) {
            int month = ((Number) result[0]).intValue(); // 1 = Jan, ..., 12 = Dec
            double total = ((Number) result[1]).doubleValue();
            data[month - 1] = total;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("labels", labels);
        response.put("datasets", List.of(Map.of("label", "Expenses ($)", "data", data)));

        return response;
    }


    @Override
    public Map<String, Object> getExpenseTrend(User user, int year) {
        List<Object[]> results = expenseRepository.findMonthlyLossExpensesByUserId(year, user.getId());

        String[] labels = new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Double[] data = new Double[12];
        Arrays.fill(data, 0.0);

        for (Object[] result : results) {
            int month = ((Number) result[0]).intValue();  // ✅ Correct cast
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
    public Map<String, Object> getPaymentMethodDistribution(User user,int year) {
        List<Object[]> results = expenseRepository.findPaymentMethodDistributionByUserId(year,user.getId());
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
    public Map<String, Object> getCumulativeExpenses(User user, int year) {
        // Fetch data from repository
        List<Object[]> results = expenseRepository.findExpensesWithDetailsByUserIdAndYear(year, user.getId());

        // Map to store monthly totals
        Map<Month, Double> monthlyTotals = new TreeMap<>(); // TreeMap to sort by month

        // Process results
        for (Object[] result : results) {
            Expense expense = (Expense) result[0];
            ExpenseDetails details = (ExpenseDetails) result[1];

            Month month = expense.getDate().getMonth();
            double amount = details.getAmount();

            // Aggregate amount by month
            monthlyTotals.merge(month, amount, Double::sum);
        }

        // Calculate cumulative totals
        List<Double> cumulativeData = new ArrayList<>();
        double cumulativeSum = 0.0;
        for (Month month : monthlyTotals.keySet()) {
            cumulativeSum += monthlyTotals.get(month);
            cumulativeData.add(cumulativeSum);
        }

        // Prepare response
        Map<String, Object> response = new LinkedHashMap<>();
        String[] labels = new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Double[] data = new Double[12];
        Arrays.fill(data, 0.0);

        // Map months to indices
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

        // Fill data array with cumulative totals
        int dataIndex = 0;
        for (Month month : monthlyTotals.keySet()) {
            Integer index = monthToIndex.get(month);
            if (index != null && dataIndex < cumulativeData.size()) {
                data[index] = cumulativeData.get(dataIndex);
                dataIndex++;
            }
        }

        // Fill remaining months with the last cumulative value (if any)
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
    public Map<String, Object> getExpenseNameOverTime(User user, int year, int limit) {
        List<Expense> expenses = expenseRepository.findByYearAndUser(year, user.getId());

        Map<String, Map<Integer, Double>> monthlySums = new HashMap<>();
        Map<String, Double> totalPerExpense = new HashMap<>();

        for (Expense e : expenses) {
            ExpenseDetails ed = e.getExpense();
            if (ed == null) continue;

            String expenseName = ed.getExpenseName();
            if (expenseName == null || expenseName.toLowerCase().contains("given")) continue;

            int month = e.getDate().getMonthValue();  // 1 = Jan, 12 = Dec
            double amount = ed.getAmount();

            monthlySums
                    .computeIfAbsent(expenseName, k -> new HashMap<>())
                    .merge(month, amount, Double::sum);

            totalPerExpense.merge(expenseName, amount, Double::sum);
        }

        // Get top-N expense names by total amount
        List<String> topExpenseNames = totalPerExpense.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .toList();

        // Labels for months
        String[] labels = new String[]{"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("labels", labels);

        List<Map<String, Object>> datasets = new ArrayList<>();

        for (String name : topExpenseNames) {
            List<Double> data = new ArrayList<>(Collections.nCopies(12, 0.0));
            Map<Integer, Double> monthData = monthlySums.getOrDefault(name, new HashMap<>());
            for (Map.Entry<Integer, Double> entry : monthData.entrySet()) {
                data.set(entry.getKey() - 1, entry.getValue()); // monthIndex = month - 1
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
                if ("loss".equalsIgnoreCase(details.getType()) && !"creditPaid".equalsIgnoreCase(details.getPaymentMethod())) {
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

        double totalSpending = expenses.stream()
                .filter(e -> e.getExpense() != null)
                .filter(e -> "loss".equalsIgnoreCase(e.getExpense().getType()))
                .filter(e -> !"creditPaid".equalsIgnoreCase(e.getExpense().getPaymentMethod()))
                .mapToDouble(e -> e.getExpense().getAmount())
                .sum();

        double totalIncome = expenses.stream()
                .filter(e -> e.getExpense() != null)
                .filter(e -> "gain".equalsIgnoreCase(e.getExpense().getType()))
                .filter(e -> "cash".equalsIgnoreCase(e.getExpense().getPaymentMethod()))
                .mapToDouble(e -> e.getExpense().getAmount())
                .sum();

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

        Map<String, Double> expenseNameTotals = expenses.stream()
                .filter(e -> e.getExpense() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getExpense().getExpenseName(),
                        Collectors.summingDouble(e -> e.getExpense().getAmount())
                ));

        return expenseNameTotals.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", entry.getKey());
                    data.put("value", entry.getValue());
                    return data;
                })
                .collect(Collectors.toList());
    }


    @Override
    public List<Expense> getExpensesWithinRange(
            Integer userId,
            LocalDate startDate,
            LocalDate endDate,
            String flowType) {

        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        // If flowType is specified, filter by type
        if (flowType != null && !flowType.isEmpty()) {
            return expenses.stream()
                    .filter(expense -> {
                        String type = expense.getExpense().getType();
                        if ("inflow".equalsIgnoreCase(flowType)) {
                            return "gain".equalsIgnoreCase(type) || "income".equalsIgnoreCase(type);
                        } else if ("outflow".equalsIgnoreCase(flowType)) {
                            return "loss".equalsIgnoreCase(type) || "expense".equalsIgnoreCase(type);
                        }
                        return true; // Return all if flowType is not recognized
                    })
                    .collect(Collectors.toList());
        }

        return expenses;
    }



    @Override
    public List<Expense> getExpensesByCategoryId(Integer categoryId, User user) {
        try {
            // First, get the category to verify it exists and the user has access to it
            Category category = categoryService.getById(categoryId, user);
            if (category == null) {
                throw new RuntimeException("Category not found with ID: " + categoryId);
            }

            // Get the expense IDs associated with this user and category
            Set<Integer> expenseIds = new HashSet<>();
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())) {
                expenseIds = category.getExpenseIds().get(user.getId());
            }

            if (expenseIds.isEmpty()) {
                return new ArrayList<>(); // Return empty list if no expenses found
            }

            // Fetch all expenses by their IDs and filter by user
            List<Expense> expenses = expenseRepository.findAllByUserIdAndIdIn(user.getId(), expenseIds);

            return expenses;
        } catch (Exception e) {
            System.out.println("Error retrieving expenses by category ID: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve expenses for category ID: " + categoryId, e);
        }
    }


    @Override
    @Transactional
    public Map<Category, List<Expense>> getAllExpensesByCategories(User user) {
        // Get all categories for the user
        List<Category> userCategories = categoryService.getAllForUser(user);

        List<Expense> userExpenses = getAllExpenses(user);

        // Create a map to store category -> expenses mapping
        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();

        // Initialize the map with empty lists for each category
        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }

        // Populate the map with expenses
        for (Expense expense : userExpenses) {
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

        // Remove categories with no expenses
        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        return categoryExpensesMap;
    }


    @Override
    public Map<String, Object> getFilteredExpensesByCategories(
            User user,
            String rangeType,
            int offset,
            String flowType) {

        // Calculate date range based on rangeType and offset
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (rangeType.toLowerCase()) {
            case "week":
                startDate = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                endDate = now.with(DayOfWeek.SUNDAY).plusWeeks(offset);
                break;
            case "month":
                startDate = now.withDayOfMonth(1).plusMonths(offset);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                break;
            case "year":
                startDate = LocalDate.of(now.getYear(), 1, 1).plusYears(offset);
                endDate = LocalDate.of(now.getYear(), 12, 31).plusYears(offset);
                break;
            case "custom":
                // For custom range, offset is ignored and we use the current date as reference
                startDate = now.minusDays(30);  // Default to last 30 days
                endDate = now;
                break;
            default:
                throw new IllegalArgumentException("Invalid rangeType. Valid options are: week, month, year, custom");
        }

        // Get all categories for the user
        List<Category> userCategories = categoryService.getAllForUser(user);

        // Get filtered expenses for the user
        List<Expense> filteredExpenses = getExpensesWithinRange(user.getId(), startDate, endDate, flowType);

        // Create a map to store category -> expenses mapping
        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();

        // Initialize the map with empty lists for each category
        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }

        // Populate the map with filtered expenses
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

        // Remove categories with no expenses
        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        // Transform the map to have a more JSON-friendly structure
        Map<String, Object> response = new HashMap<>();

        // Summary statistics
        int totalCategories = categoryExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> categoryTotals = new HashMap<>();

        for (Map.Entry<Category, List<Expense>> entry : categoryExpensesMap.entrySet()) {
            Category category = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();

            // Calculate total amount for this category
            double categoryTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    categoryTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            categoryTotals.put(category.getName(), categoryTotal);

            // Create a category details object
            Map<String, Object> categoryDetails = buildCategoryDetailsMap(category, expenses, categoryTotal);

            // Add to response with category name as key
            response.put(category.getName(), categoryDetails);
        }

        // Add summary statistics to the response
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCategories", totalCategories);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("categoryTotals", categoryTotals);
        summary.put("dateRange", Map.of(
                "startDate", startDate,
                "endDate", endDate,
                "rangeType", rangeType,
                "offset", offset,
                "flowType", flowType != null ? flowType : "all"
        ));

        response.put("summary", summary);

        return response;
    }

    // Helper method to build category details map
    private Map<String, Object> buildCategoryDetailsMap(Category category, List<Expense> expenses, double categoryTotal) {
        Map<String, Object> categoryDetails = new HashMap<>();
        categoryDetails.put("id", category.getId());
        categoryDetails.put("name", category.getName());
        categoryDetails.put("description", category.getDescription());
        categoryDetails.put("isGlobal", category.isGlobal());

        // Include color and icon if they exist in the model
        if (category.getColor() != null) {
            categoryDetails.put("color", category.getColor());
        }
        if (category.getIcon() != null) {
            categoryDetails.put("icon", category.getIcon());
        }

        // Include user IDs information
        categoryDetails.put("userIds", category.getUserIds());
        categoryDetails.put("editUserIds", category.getEditUserIds());

        // Include expense mapping information
        categoryDetails.put("expenseIds", category.getExpenseIds());

        // Format expenses with detailed information
        List<Map<String, Object>> formattedExpenses = formatExpensesForResponse(expenses);

        categoryDetails.put("expenses", formattedExpenses);
        categoryDetails.put("totalAmount", categoryTotal);
        categoryDetails.put("expenseCount", expenses.size());

        return categoryDetails;
    }

    // Helper method to format expenses for response
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
    public Map<String, Object> getFilteredExpensesByDateRange(
            User user,
            LocalDate fromDate,
            LocalDate toDate,
            String flowType) {

        // Get all categories for the user
        List<Category> userCategories = categoryService.getAllForUser(user);

        // Get filtered expenses for the user
        List<Expense> filteredExpenses = getExpensesWithinRange(user.getId(), fromDate, toDate, flowType);

        // Create a map to store category -> expenses mapping
        Map<Category, List<Expense>> categoryExpensesMap = new HashMap<>();

        // Initialize the map with empty lists for each category
        for (Category category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }

        // Populate the map with filtered expenses
        for (Expense expense : filteredExpenses) {
            // If flowType is specified as "inflow" or "outflow", apply special filtering
            if (flowType != null && !flowType.isEmpty()) {
                String expenseType = expense.getExpense().getType();

                if (flowType.equalsIgnoreCase("inflow") && !expenseType.equalsIgnoreCase("gain")) {
                    continue; // Skip if not an inflow (gain)
                } else if (flowType.equalsIgnoreCase("outflow") && !expenseType.equalsIgnoreCase("loss")) {
                    continue; // Skip if not an outflow (loss)
                } else if (!flowType.equalsIgnoreCase("inflow") &&
                        !flowType.equalsIgnoreCase("outflow") &&
                        !expenseType.equalsIgnoreCase(flowType)) {
                    continue; // Skip if specific flowType doesn't match
                }
            }

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

        // Remove categories with no expenses
        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        // Transform the map to have a more JSON-friendly structure
        Map<String, Object> response = new HashMap<>();

        // Summary statistics
        int totalCategories = categoryExpensesMap.size();
        int totalExpenses = 0;
        double totalAmount = 0.0;
        Map<String, Double> categoryTotals = new HashMap<>();

        for (Map.Entry<Category, List<Expense>> entry : categoryExpensesMap.entrySet()) {
            Category category = entry.getKey();
            List<Expense> expenses = entry.getValue();
            totalExpenses += expenses.size();

            // Calculate total amount for this category
            double categoryTotal = 0.0;
            for (Expense expense : expenses) {
                if (expense.getExpense() != null) {
                    categoryTotal += expense.getExpense().getAmount();
                    totalAmount += expense.getExpense().getAmount();
                }
            }
            categoryTotals.put(category.getName(), categoryTotal);

            // Create a category details object with all fields from the Category model
            Map<String, Object> categoryDetails = new HashMap<>();
            categoryDetails.put("id", category.getId());
            categoryDetails.put("name", category.getName());
            categoryDetails.put("description", category.getDescription());
            categoryDetails.put("isGlobal", category.isGlobal());

            // Include color and icon if they exist in the model
            if (category.getColor() != null) {
                categoryDetails.put("color", category.getColor());
            }
            if (category.getIcon() != null) {
                categoryDetails.put("icon", category.getIcon());
            }

            // Include user IDs information
            categoryDetails.put("userIds", category.getUserIds());
            categoryDetails.put("editUserIds", category.getEditUserIds());

            // Include expense mapping information
            categoryDetails.put("expenseIds", category.getExpenseIds());

            // Format expenses with detailed information
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

            // Add to response with category name as key
            response.put(category.getName(), categoryDetails);
        }

        // Add summary statistics to the response
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCategories", totalCategories);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalAmount", totalAmount);
        summary.put("categoryTotals", categoryTotals);

        // Add date range information to the summary
        Map<String, Object> dateRangeInfo = new HashMap<>();
        dateRangeInfo.put("fromDate", fromDate);
        dateRangeInfo.put("toDate", toDate);
        dateRangeInfo.put("flowType", flowType);
        summary.put("dateRange", dateRangeInfo);

        response.put("summary", summary);

        return response;
    }



    private String getThemeAppropriateColor(String categoryName) {
        // Map of predefined colors suitable for dark theme
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

        // Check if the category name matches any of our predefined categories
        String lowerCaseName = categoryName.toLowerCase();
        for (Map.Entry<String, String> entry : colorMap.entrySet()) {
            if (lowerCaseName.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        // If no match is found, generate a color based on the hash of the category name
        // This ensures the same category name always gets the same color
        int hash = categoryName.hashCode();
        // Use the hash to select from our predefined colors to ensure they're theme-appropriate
        String[] colorArray = colorMap.values().toArray(new String[0]);
        int index = Math.abs(hash % colorArray.length);
        return colorArray[index];
    }
}
