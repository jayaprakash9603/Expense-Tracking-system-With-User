package com.jaya.controller;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.exceptions.MissingRequestHeaderException;
import com.jaya.mapper.ExpenseMapper;
import com.jaya.models.AccessLevel;
import com.jaya.models.Expense;
import com.jaya.models.MonthlySummary;
import com.jaya.service.ExpenseService;
import com.jaya.service.FriendShipService;
import com.jaya.service.UserSettingsService;
import com.jaya.util.UserPermissionHelper;
import com.jaya.testutil.ExpenseTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BaseExpenseControllerTest {

    @Mock
    private IUserServiceClient userServiceClient;
    @Mock
    private FriendShipService friendshipService;
    @Mock
    private ExpenseService expenseService;
    @Mock
    private UserPermissionHelper permissionHelper;
    @Mock
    private ExpenseMapper expenseMapper;
    @Mock
    private UserSettingsService userSettingsService;

    private TestBaseExpenseController controller;

    @BeforeEach
    void setUp() {
        controller = new TestBaseExpenseController();
        ReflectionTestUtils.setField(controller, "IUserServiceClient", userServiceClient);
        ReflectionTestUtils.setField(controller, "friendshipService", friendshipService);
        ReflectionTestUtils.setField(controller, "expenseService", expenseService);
        ReflectionTestUtils.setField(controller, "permissionHelper", permissionHelper);
        ReflectionTestUtils.setField(controller, "expenseMapper", expenseMapper);
        ReflectionTestUtils.setField(controller, "userSettingsService", userSettingsService);
    }

    private static class TestBaseExpenseController extends BaseExpenseController {

        public UserDTO getAuthenticatedUserPublic(String jwt) throws Exception {
            return getAuthenticatedUser(jwt);
        }

        public UserDTO getTargetUserWithPermissionPublic(String jwt, Integer targetId, boolean requireWrite) throws Exception {
            return getTargetUserWithPermission(jwt, targetId, requireWrite);
        }

        public ResponseEntity<?> handleFriendExpenseAccessPublic(Integer userId, UserDTO viewer) throws Exception {
            return handleFriendExpenseAccess(userId, viewer);
        }

        public ResponseEntity<?> handleExceptionPublic(Exception e) {
            return handleException(e);
        }
    }

    @Nested
    class GetAuthenticatedUser {

        @Test
        void shouldThrowWhenJwtMissing() {
            assertThatThrownBy(() -> controller.getAuthenticatedUserPublic(null))
                    .isInstanceOf(MissingRequestHeaderException.class);
        }

        @Test
        void shouldReturnUserWhenJwtValid() throws Exception {
            UserDTO user = ExpenseTestDataFactory.buildUser();
            when(userServiceClient.getUserProfile(ExpenseTestDataFactory.TEST_JWT)).thenReturn(user);

            UserDTO result = controller.getAuthenticatedUserPublic(ExpenseTestDataFactory.TEST_JWT);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(ExpenseTestDataFactory.TEST_USER_ID);
        }
    }

    @Nested
    class GetTargetUserWithPermission {

        @Test
        void shouldReturnTargetUserFromPermissionHelper() throws Exception {
            UserDTO reqUser = ExpenseTestDataFactory.buildUser();
            UserDTO targetUser = ExpenseTestDataFactory.buildFriendUser();
            when(userServiceClient.getUserProfile(ExpenseTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(permissionHelper.getTargetUserWithPermissionCheck(
                    ExpenseTestDataFactory.FRIEND_USER_ID, reqUser, false)).thenReturn(targetUser);

            UserDTO result = controller.getTargetUserWithPermissionPublic(
                    ExpenseTestDataFactory.TEST_JWT, ExpenseTestDataFactory.FRIEND_USER_ID, false);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(ExpenseTestDataFactory.FRIEND_USER_ID);
        }
    }

    @Nested
    class HandleFriendExpenseAccess {

        @Test
        void shouldReturnForbiddenWhenNoAccess() throws Exception {
            UserDTO viewer = ExpenseTestDataFactory.buildUser();
            when(friendshipService.canUserAccessExpenses(ExpenseTestDataFactory.FRIEND_USER_ID, viewer.getId()))
                    .thenReturn(false);

            ResponseEntity<?> result = controller.handleFriendExpenseAccessPublic(
                    ExpenseTestDataFactory.FRIEND_USER_ID, viewer);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        void shouldReturnExpenseListForReadAccess() throws Exception {
            UserDTO viewer = ExpenseTestDataFactory.buildUser();
            UserDTO targetUser = ExpenseTestDataFactory.buildFriendUser();
            List<Expense> expenses = List.of();
            when(friendshipService.canUserAccessExpenses(ExpenseTestDataFactory.FRIEND_USER_ID, viewer.getId()))
                    .thenReturn(true);
            when(friendshipService.getUserAccessLevel(ExpenseTestDataFactory.FRIEND_USER_ID, viewer.getId()))
                    .thenReturn(AccessLevel.READ);
            when(userServiceClient.getUserById(ExpenseTestDataFactory.FRIEND_USER_ID)).thenReturn(targetUser);
            when(expenseService.getAllExpenses(ExpenseTestDataFactory.FRIEND_USER_ID)).thenReturn(expenses);

            ResponseEntity<?> result = controller.handleFriendExpenseAccessPublic(
                    ExpenseTestDataFactory.FRIEND_USER_ID, viewer);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(expenses);
        }

        @Test
        void shouldReturnSummaryForSummaryAccess() throws Exception {
            UserDTO viewer = ExpenseTestDataFactory.buildUser();
            UserDTO targetUser = ExpenseTestDataFactory.buildFriendUser();
            Map<String, MonthlySummary> yearlySummary = new HashMap<>();
            when(friendshipService.canUserAccessExpenses(ExpenseTestDataFactory.FRIEND_USER_ID, viewer.getId()))
                    .thenReturn(true);
            when(friendshipService.getUserAccessLevel(ExpenseTestDataFactory.FRIEND_USER_ID, viewer.getId()))
                    .thenReturn(AccessLevel.SUMMARY);
            when(userServiceClient.getUserById(ExpenseTestDataFactory.FRIEND_USER_ID)).thenReturn(targetUser);
            int year = LocalDate.now().getYear();
            when(expenseService.getYearlySummary(year, ExpenseTestDataFactory.FRIEND_USER_ID)).thenReturn(yearlySummary);

            ResponseEntity<?> result = controller.handleFriendExpenseAccessPublic(
                    ExpenseTestDataFactory.FRIEND_USER_ID, viewer);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(yearlySummary);
        }

        @Test
        void shouldReturnLimitedDataForLimitedAccess() throws Exception {
            UserDTO viewer = ExpenseTestDataFactory.buildUser();
            UserDTO targetUser = ExpenseTestDataFactory.buildFriendUser();
            MonthlySummary monthlySummary = ExpenseTestDataFactory.buildMonthlySummary();
            when(friendshipService.canUserAccessExpenses(ExpenseTestDataFactory.FRIEND_USER_ID, viewer.getId()))
                    .thenReturn(true);
            when(friendshipService.getUserAccessLevel(ExpenseTestDataFactory.FRIEND_USER_ID, viewer.getId()))
                    .thenReturn(AccessLevel.LIMITED);
            when(userServiceClient.getUserById(ExpenseTestDataFactory.FRIEND_USER_ID)).thenReturn(targetUser);
            int year = LocalDate.now().getYear();
            int month = LocalDate.now().getMonthValue();
            when(expenseService.getMonthlySummary(year, month, ExpenseTestDataFactory.FRIEND_USER_ID))
                    .thenReturn(monthlySummary);

            ResponseEntity<?> result = controller.handleFriendExpenseAccessPublic(
                    ExpenseTestDataFactory.FRIEND_USER_ID, viewer);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isInstanceOf(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) result.getBody();
            assertThat(body).containsKey("currentMonth");
        }
    }

    @Nested
    class HandleException {

        @Test
        void shouldReturnNotFoundForNotFoundMessage() {
            ResponseEntity<?> result = controller.handleExceptionPublic(new RuntimeException("resource not found"));

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        void shouldReturnForbiddenForPermissionMessage() {
            ResponseEntity<?> result = controller.handleExceptionPublic(
                    new RuntimeException("You don't have permission to access"));

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        void shouldReturnInternalServerErrorOtherwise() {
            ResponseEntity<?> result = controller.handleExceptionPublic(new RuntimeException("Unknown error"));

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
