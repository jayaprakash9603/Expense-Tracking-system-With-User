package com.jaya.service.expenses;

import com.jaya.models.Category;
import com.jaya.models.Expense;
import java.util.List;
import java.util.Map;




public interface ExpenseCategoryService {

    
    List<Expense> getExpensesByCategoryId(Integer categoryId, Integer userId);
    Map<Category, List<Expense>> getAllExpensesByCategories(Integer userId) throws Exception;

    
    List<Map<String, Object>> getTotalByCategory(Integer userId);



    







    




    


}