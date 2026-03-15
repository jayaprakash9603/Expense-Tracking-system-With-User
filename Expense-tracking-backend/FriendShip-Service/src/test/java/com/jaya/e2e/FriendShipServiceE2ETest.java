package com.jaya.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.share.CreateShareRequest;
import com.jaya.dto.share.ShareResponse;
import com.jaya.dto.share.SharedDataResponse;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.repository.FriendshipRepository;
import com.jaya.repository.SharedResourceRepository;
import com.jaya.service.ExpenseClient;
import com.jaya.service.FriendshipNotificationService;
import com.jaya.service.UserAddedItemsService;
import com.jaya.testutil.FriendShipTestDataFactory;
import com.jaya.util.FriendshipMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration,"
                + "org.springframework.cloud.netflix.eureka.EurekaClientAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration"
})
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:friendship_service_e2e;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class FriendShipServiceE2ETest {

    private static final String USER1_JWT = "Bearer user1-jwt";
    private static final String USER2_JWT = "Bearer user2-jwt";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private SharedResourceRepository sharedResourceRepository;

    @MockBean
    private IUserServiceClient userClient;

    @MockBean
    private UnifiedActivityService unifiedActivityService;

    @MockBean
    private ExpenseClient expenseClient;

    @MockBean
    private FriendshipNotificationService friendshipNotificationService;

    @MockBean
    private UserAddedItemsService userAddedItemsService;

    @BeforeEach
    void setUp() {
        when(userClient.getUserProfile(USER1_JWT)).thenReturn(FriendShipTestDataFactory.buildRequesterUser());
        when(userClient.getUserProfile(USER2_JWT)).thenReturn(FriendShipTestDataFactory.buildRecipientUser());
        when(userClient.getUserById(1)).thenReturn(FriendShipTestDataFactory.buildRequesterUser());
        when(userClient.getUserById(2)).thenReturn(FriendShipTestDataFactory.buildRecipientUser());
        FriendshipMapper.setUserClient(userClient);

        ExpenseDTO expense = buildExpenseDTO(100, 1);
        when(expenseClient.getExpenseById(eq(100), eq(1))).thenReturn(expense);
    }

    private ExpenseDTO buildExpenseDTO(int id, int userId) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(id);
        dto.setUserId(userId);
        dto.setDate("2025-03-11");
        dto.setCategoryId(10);
        dto.setCategoryName("Food");
        dto.setBudgetIds(new HashSet<>(Set.of(501)));
        ExpenseDetailsDTO details = new ExpenseDetailsDTO();
        details.setExpenseName("Lunch");
        details.setAmount(250);
        details.setType("loss");
        details.setPaymentMethod("cash");
        details.setNetAmount(-250);
        dto.setExpense(details);
        return dto;
    }

    @Nested
    @DisplayName("Workflow 1: Friend request -> accept -> fetch friends")
    class FriendRequestWorkflow {

        @Test
        @DisplayName("send request (user1->user2), accept (user2), fetch friends (user1) contains friend")
        void friendRequestAcceptAndList() throws Exception {
            ResultActions requestResult = mockMvc.perform(post("/api/friendships/request")
                            .header("Authorization", USER1_JWT)
                            .param("recipientId", String.valueOf(FriendShipTestDataFactory.FRIEND_USER_ID)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("PENDING"));

            Integer friendshipId = objectMapper.readTree(requestResult.andReturn().getResponse().getContentAsString())
                    .get("id").asInt();

            mockMvc.perform(put("/api/friendships/" + friendshipId + "/respond")
                            .header("Authorization", USER2_JWT)
                            .param("accept", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("ACCEPTED"));

            mockMvc.perform(get("/api/friendships/friends")
                            .header("Authorization", USER1_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].status").value("ACCEPTED"));

            assertThat(friendshipRepository.count()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Workflow 2: Create share -> access -> revoke -> validate false")
    class ShareWorkflow {

        @Test
        @DisplayName("create share (user1, EXPENSE EXP-100), access with user2 and anonymous, revoke, validate returns false")
        void shareCreateAccessRevokeValidate() throws Exception {
            CreateShareRequest request = FriendShipTestDataFactory.buildCreateShareRequest();

            ResultActions createResult = mockMvc.perform(post("/api/shares")
                            .header("Authorization", USER1_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());

            String token = objectMapper.readTree(createResult.andReturn().getResponse().getContentAsString())
                    .get("token").asText();
            assertThat(token).isNotBlank();

            mockMvc.perform(get("/api/shares/" + token)
                            .header("Authorization", USER2_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isValid").value(true));

            mockMvc.perform(get("/api/shares/" + token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isValid").value(true));

            mockMvc.perform(delete("/api/shares/" + token)
                            .header("Authorization", USER1_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Share revoked successfully"));

            mockMvc.perform(get("/api/shares/" + token + "/validate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.valid").value(false));
        }
    }
}
