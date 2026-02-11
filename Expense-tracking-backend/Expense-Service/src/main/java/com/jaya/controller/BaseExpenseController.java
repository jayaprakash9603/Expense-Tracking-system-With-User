package com.jaya.controller;


import com.jaya.common.dto.UserDTO;
import com.jaya.exceptions.MissingRequestHeaderException;
import com.jaya.mapper.ExpenseMapper;
import com.jaya.models.AccessLevel;
import com.jaya.models.MonthlySummary;
import com.jaya.service.ExpenseService;
import com.jaya.service.FriendShipService;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.service.UserSettingsService;
import com.jaya.util.UserPermissionHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;


import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

public abstract class BaseExpenseController {

    @Autowired
    protected IUserServiceClient IUserServiceClient;

    @Autowired
    protected FriendShipService friendshipService;

    @Autowired
    protected ExpenseService expenseService;

    @Autowired
    protected UserPermissionHelper permissionHelper;

    @Autowired
    protected ExpenseMapper expenseMapper;

    @Autowired
    protected UserSettingsService userSettingsService;

    protected UserDTO getAuthenticatedUser(String jwt) throws Exception {
        if(jwt==null)
        {
            throw new MissingRequestHeaderException("jwt cant be null");
        }
        return IUserServiceClient.getUserProfile(jwt);
    }

    protected UserDTO getTargetUserWithPermission(String jwt, Integer targetId, boolean requireWrite) throws Exception  {
        UserDTO reqUser = getAuthenticatedUser(jwt);
        return permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, requireWrite);
    }


    protected ResponseEntity<?> handleFriendExpenseAccess(Integer userId, UserDTO viewer) throws Exception {
        if (!friendshipService.canUserAccessExpenses(userId, viewer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You don't have permission to view this UserDTO's expenses");
        }

        AccessLevel accessLevel = friendshipService.getUserAccessLevel(userId, viewer.getId());
        UserDTO targetUser = IUserServiceClient.findUserById(userId);

        if (targetUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("UserDTO not found");
        }

        switch (accessLevel) {
            case READ:
            case WRITE:
            case FULL:
                return ResponseEntity.ok(expenseService.getAllExpenses(targetUser.getId()));

            case SUMMARY:
                Map<String, MonthlySummary> yearlySummary = expenseService.getYearlySummary(
                        LocalDate.now().getYear(), targetUser.getId());
                return ResponseEntity.ok(yearlySummary);

            case LIMITED:
                return ResponseEntity.ok(createLimitedExpenseData(targetUser));

            default:
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to view this UserDTO's expenses");
        }
    }

    private Map<String, Object> createLimitedExpenseData(UserDTO targetUser) {
        MonthlySummary currentMonthSummary = expenseService.getMonthlySummary(
                LocalDate.now().getYear(),
                LocalDate.now().getMonthValue(),
                targetUser.getId());

        Map<String, Double> simplifiedSummary = new HashMap<>();
        simplifiedSummary.put("totalIncome", currentMonthSummary.getTotalAmount().doubleValue());
        simplifiedSummary.put("totalExpense", currentMonthSummary.getCash().getDifference().doubleValue());
        simplifiedSummary.put("balance", currentMonthSummary.getBalanceRemaining().doubleValue());

        Map<String, Object> limitedData = new HashMap<>();
        limitedData.put("currentMonth", simplifiedSummary);
        return limitedData;
    }

    protected ResponseEntity<?> handleException(Exception e) {
        if (e.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } else if (e.getMessage().contains("permission")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
