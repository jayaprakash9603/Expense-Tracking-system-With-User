package com.jaya.mapper;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.models.Category;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.models.PaymentMethod;
import com.jaya.service.CategoryServiceWrapper;
import com.jaya.service.PaymentMethodServices;
import com.jaya.util.DataMaskingUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;













@Component
@Slf4j
public class ExpenseMapper {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private DataMaskingUtil dataMaskingUtil;

    @Autowired
    private CategoryServiceWrapper categoryServices;

    @Autowired
    private PaymentMethodServices paymentMethodServices;

    





    public ExpenseDTO toDTO(Expense entity) {
        return toDTO(entity, false);
    }

    






    public ExpenseDTO toDTO(Expense entity, Boolean maskSensitiveData) {
        if (entity == null) {
            return null;
        }

        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(entity.getId());
        dto.setDate(entity.getDate() != null ? entity.getDate().format(DATE_FORMATTER) : null);
        dto.setCategoryId(entity.getCategoryId());
        dto.setCategoryName(entity.getCategoryName());
        dto.setIncludeInBudget(entity.isIncludeInBudget());
        dto.setBill(entity.isBill());
        dto.setRecurring(entity.isRecurring());
        dto.setUserId(entity.getUserId());
        dto.setBudgetIds(entity.getBudgetIds() != null ? new HashSet<>(entity.getBudgetIds()) : new HashSet<>());

        
        enrichWithCategoryDetails(dto, entity.getCategoryId(), entity.getUserId());

        
        if (entity.getExpense() != null) {
            dto.setExpense(toDetailsDTO(entity.getExpense(), maskSensitiveData));
            
            enrichWithPaymentMethodDetails(dto, entity.getExpense().getPaymentMethod(), entity.getUserId());
        }

        return dto;
    }

    






    private void enrichWithCategoryDetails(ExpenseDTO dto, Integer categoryId, Integer userId) {
        if (categoryId == null || userId == null) {
            return;
        }
        try {
            Category category = categoryServices.getById(categoryId, userId);
            if (category != null) {
                dto.setCategoryIcon(category.getIcon());
                dto.setCategoryColor(category.getColor());
            }
        } catch (Exception e) {
            log.debug("Could not fetch category details for categoryId={}, userId={}: {}",
                    categoryId, userId, e.getMessage());
        }
    }

    






    private void enrichWithPaymentMethodDetails(ExpenseDTO dto, String paymentMethodName, Integer userId) {
        if (paymentMethodName == null || paymentMethodName.isEmpty() || userId == null) {
            return;
        }
        try {
            PaymentMethod paymentMethod = paymentMethodServices.getByNameWithService(userId, paymentMethodName);
            if (paymentMethod != null) {
                dto.setPaymentMethodIcon(paymentMethod.getIcon());
                dto.setPaymentMethodColor(paymentMethod.getColor());
            }
        } catch (Exception e) {
            log.debug("Could not fetch payment method details for name={}, userId={}: {}",
                    paymentMethodName, userId, e.getMessage());
        }
    }

    
    

    











    public ExpenseDTO toDTO(Expense entity, Map<Integer, Category> categoryMap,
            Map<String, PaymentMethod> paymentMethodMap) {
        return toDTO(entity, false, categoryMap, paymentMethodMap);
    }

    










    public ExpenseDTO toDTO(Expense entity, Boolean maskSensitiveData,
            Map<Integer, Category> categoryMap,
            Map<String, PaymentMethod> paymentMethodMap) {
        if (entity == null) {
            return null;
        }

        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(entity.getId());
        dto.setDate(entity.getDate() != null ? entity.getDate().format(DATE_FORMATTER) : null);
        dto.setCategoryId(entity.getCategoryId());
        dto.setCategoryName(entity.getCategoryName());
        dto.setIncludeInBudget(entity.isIncludeInBudget());
        dto.setBill(entity.isBill());
        dto.setRecurring(entity.isRecurring());
        dto.setUserId(entity.getUserId());
        dto.setBudgetIds(entity.getBudgetIds() != null ? new HashSet<>(entity.getBudgetIds()) : new HashSet<>());

        
        if (categoryMap != null && entity.getCategoryId() != null) {
            Category category = categoryMap.get(entity.getCategoryId());
            if (category != null) {
                dto.setCategoryIcon(category.getIcon());
                dto.setCategoryColor(category.getColor());
            }
        }

        
        if (entity.getExpense() != null) {
            dto.setExpense(toDetailsDTO(entity.getExpense(), maskSensitiveData));

            
            String paymentMethodName = entity.getExpense().getPaymentMethod();
            if (paymentMethodMap != null && paymentMethodName != null && !paymentMethodName.isEmpty()) {
                PaymentMethod paymentMethod = paymentMethodMap.get(paymentMethodName);
                if (paymentMethod != null) {
                    dto.setPaymentMethodIcon(paymentMethod.getIcon());
                    dto.setPaymentMethodColor(paymentMethod.getColor());
                }
            }
        }

        return dto;
    }

    






    public Map<Integer, Category> fetchCategoryMapForUser(Integer userId) {
        try {
            List<Category> categories = categoryServices.getAllForUser(userId);
            if (categories != null) {
                return categories.stream()
                        .collect(Collectors.toMap(Category::getId, Function.identity(), (a, b) -> a));
            }
        } catch (Exception e) {
            log.warn("Could not fetch categories for userId={}: {}", userId, e.getMessage());
        }
        return Map.of();
    }

    






    public Map<String, PaymentMethod> fetchPaymentMethodMapForUser(Integer userId) {
        try {
            List<PaymentMethod> paymentMethods = paymentMethodServices.getAllPaymentMethods(userId);
            if (paymentMethods != null) {
                return paymentMethods.stream()
                        .filter(pm -> pm.getName() != null)
                        .collect(Collectors.toMap(PaymentMethod::getName, Function.identity(), (a, b) -> a));
            }
        } catch (Exception e) {
            log.warn("Could not fetch payment methods for userId={}: {}", userId, e.getMessage());
        }
        return Map.of();
    }

    

    





    public ExpenseDetailsDTO toDetailsDTO(ExpenseDetails details) {
        return toDetailsDTO(details, false);
    }

    






    public ExpenseDetailsDTO toDetailsDTO(ExpenseDetails details, Boolean maskSensitiveData) {
        if (details == null) {
            return null;
        }

        ExpenseDetailsDTO dto = new ExpenseDetailsDTO();
        dto.setId(details.getId());
        dto.setExpenseName(details.getExpenseName());

        
        boolean shouldMask = dataMaskingUtil.shouldMaskData(maskSensitiveData);
        dto.setMasked(shouldMask);

        
        
        if (shouldMask) {
            dto.setAmount(dataMaskingUtil.maskAmount(details.getAmount())); 
            dto.setNetAmount(dataMaskingUtil.maskAmount(details.getNetAmount())); 
            dto.setCreditDue(dataMaskingUtil.maskCreditDue(details.getCreditDue())); 
        } else {
            dto.setAmount(details.getAmount());
            dto.setNetAmount(details.getNetAmount());
            dto.setCreditDue(details.getCreditDue());
        }

        dto.setType(details.getType());
        dto.setPaymentMethod(details.getPaymentMethod());
        dto.setComments(details.getComments());

        return dto;
    }

    






    public Expense toEntity(ExpenseDTO dto) {
        if (dto == null) {
            return null;
        }

        Expense entity = new Expense();
        entity.setId(dto.getId());
        entity.setDate(dto.getDate() != null ? LocalDate.parse(dto.getDate(), DATE_FORMATTER) : null);
        entity.setCategoryId(dto.getCategoryId());
        entity.setCategoryName(dto.getCategoryName());
        entity.setIncludeInBudget(dto.isIncludeInBudget());
        entity.setBill(dto.isBill());
        entity.setRecurring(dto.isRecurring());
        entity.setUserId(dto.getUserId());
        entity.setBudgetIds(dto.getBudgetIds() != null ? new HashSet<>(dto.getBudgetIds()) : new HashSet<>());

        
        if (dto.getExpense() != null) {
            ExpenseDetails details = toDetailsEntity(dto.getExpense());
            details.setExpense(entity);
            entity.setExpense(details);
        }

        return entity;
    }

    





    public ExpenseDetails toDetailsEntity(ExpenseDetailsDTO dto) {
        if (dto == null) {
            return null;
        }

        ExpenseDetails details = new ExpenseDetails();
        details.setId(dto.getId());
        details.setExpenseName(dto.getExpenseName());
        details.setAmount(dto.getAmountAsDouble());
        details.setType(dto.getType());
        details.setPaymentMethod(dto.getPaymentMethod());
        details.setNetAmount(dto.getNetAmountAsDouble());
        details.setComments(dto.getComments());
        details.setCreditDue(dto.getCreditDueAsDouble());

        return details;
    }

    






    public void updateEntityFromDTO(Expense entity, ExpenseDTO dto) {
        if (entity == null || dto == null) {
            return;
        }

        if (dto.getDate() != null) {
            entity.setDate(LocalDate.parse(dto.getDate(), DATE_FORMATTER));
        }
        if (dto.getCategoryId() != null) {
            entity.setCategoryId(dto.getCategoryId());
        }
        if (dto.getCategoryName() != null) {
            entity.setCategoryName(dto.getCategoryName());
        }
        entity.setIncludeInBudget(dto.isIncludeInBudget());
        entity.setBill(dto.isBill());
        entity.setRecurring(dto.isRecurring());
        if (dto.getUserId() != null) {
            entity.setUserId(dto.getUserId());
        }
        if (dto.getBudgetIds() != null) {
            entity.setBudgetIds(new HashSet<>(dto.getBudgetIds()));
        }

        
        if (dto.getExpense() != null && entity.getExpense() != null) {
            updateDetailsEntityFromDTO(entity.getExpense(), dto.getExpense());
        } else if (dto.getExpense() != null) {
            ExpenseDetails details = toDetailsEntity(dto.getExpense());
            details.setExpense(entity);
            entity.setExpense(details);
        }
    }

    





    public void updateDetailsEntityFromDTO(ExpenseDetails details, ExpenseDetailsDTO dto) {
        if (details == null || dto == null) {
            return;
        }

        if (dto.getExpenseName() != null) {
            details.setExpenseName(dto.getExpenseName());
        }
        if (dto.getAmount() != null) {
            details.setAmount(dto.getAmountAsDouble());
        }
        if (dto.getType() != null) {
            details.setType(dto.getType());
        }
        if (dto.getPaymentMethod() != null) {
            details.setPaymentMethod(dto.getPaymentMethod());
        }
        if (dto.getNetAmount() != null) {
            details.setNetAmount(dto.getNetAmountAsDouble());
        }
        if (dto.getComments() != null) {
            details.setComments(dto.getComments());
        }
        if (dto.getCreditDue() != null) {
            details.setCreditDue(dto.getCreditDueAsDouble());
        }
    }
}
