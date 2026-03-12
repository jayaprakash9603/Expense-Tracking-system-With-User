package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.service.FriendshipService;
import com.jaya.util.FriendshipMapper;
import com.jaya.testutil.FriendShipTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FriendshipController.class)
class FriendshipControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FriendshipService friendshipService;

    @MockBean
    private IUserServiceClient userClient;

    private UserDTO requesterUser;

    @BeforeEach
    void setUp() {
        requesterUser = FriendShipTestDataFactory.buildRequesterUser();
        when(userClient.getUserProfile(FriendShipTestDataFactory.TEST_JWT)).thenReturn(requesterUser);
        when(userClient.getUserById(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(requesterUser);
        when(userClient.getUserById(FriendShipTestDataFactory.FRIEND_USER_ID)).thenReturn(FriendShipTestDataFactory.buildRecipientUser());
        FriendshipMapper.setUserClient(userClient);
    }

    @Nested
    @DisplayName("POST /api/friendships/request")
    class SendFriendRequest {

        @Test
        @DisplayName("shouldSendFriendRequestAndReturn201")
        void shouldSendFriendRequestAndReturn201() throws Exception {
            Friendship friendship = FriendShipTestDataFactory.buildPendingFriendship();
            when(friendshipService.sendFriendRequest(eq(FriendShipTestDataFactory.TEST_USER_ID), eq(FriendShipTestDataFactory.FRIEND_USER_ID)))
                    .thenReturn(friendship);

            mockMvc.perform(post("/api/friendships/request")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT)
                            .param("recipientId", String.valueOf(FriendShipTestDataFactory.FRIEND_USER_ID)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(100))
                    .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("shouldReturn400WhenAuthorizationHeaderMissing")
        void shouldReturn400WhenAuthorizationHeaderMissing() throws Exception {
            mockMvc.perform(post("/api/friendships/request")
                            .param("recipientId", String.valueOf(FriendShipTestDataFactory.FRIEND_USER_ID)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/friendships/{friendshipId}/respond")
    class RespondToRequest {

        @Test
        @DisplayName("shouldRespondToRequestAndReturn200")
        void shouldRespondToRequestAndReturn200() throws Exception {
            Friendship friendship = FriendShipTestDataFactory.buildAcceptedFriendship();
            when(friendshipService.respondToRequest(anyInt(), eq(FriendShipTestDataFactory.TEST_USER_ID), eq(true)))
                    .thenReturn(friendship);

            mockMvc.perform(put("/api/friendships/101/respond")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT)
                            .param("accept", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(101))
                    .andExpect(jsonPath("$.status").value("ACCEPTED"));
        }
    }

    @Nested
    @DisplayName("GET /api/friendships/friends")
    class GetUserFriendships {

        @Test
        @DisplayName("shouldReturnFriendsList")
        void shouldReturnFriendsList() throws Exception {
            List<Friendship> friendships = List.of(FriendShipTestDataFactory.buildAcceptedFriendship());
            when(friendshipService.getUserFriendships(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(friendships);

            mockMvc.perform(get("/api/friendships/friends")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1));
        }

        @Test
        @DisplayName("shouldReturnEmptyListWhenNoFriends")
        void shouldReturnEmptyListWhenNoFriends() throws Exception {
            when(friendshipService.getUserFriendships(FriendShipTestDataFactory.TEST_USER_ID))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/friendships/friends")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("POST /api/friendships/block/{userId}")
    class BlockUser {

        @Test
        @DisplayName("shouldBlockUserAndReturn200")
        void shouldBlockUserAndReturn200() throws Exception {
            doNothing().when(friendshipService).blockUser(eq(FriendShipTestDataFactory.TEST_USER_ID), eq(FriendShipTestDataFactory.FRIEND_USER_ID));

            mockMvc.perform(post("/api/friendships/block/" + FriendShipTestDataFactory.FRIEND_USER_ID)
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("User blocked successfully"));
        }
    }

    @Nested
    @DisplayName("POST /api/friendships/unblock/{userId}")
    class UnblockUser {

        @Test
        @DisplayName("shouldUnblockUserAndReturn200")
        void shouldUnblockUserAndReturn200() throws Exception {
            doNothing().when(friendshipService).unblockUser(eq(FriendShipTestDataFactory.TEST_USER_ID), eq(FriendShipTestDataFactory.FRIEND_USER_ID));

            mockMvc.perform(post("/api/friendships/unblock/" + FriendShipTestDataFactory.FRIEND_USER_ID)
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("User unblocked successfully"));
        }
    }

    @Nested
    @DisplayName("GET /api/friendships/can-access-expenses")
    class CanAccessExpenses {

        @Test
        @DisplayName("shouldReturnTrueWhenCanAccess")
        void shouldReturnTrueWhenCanAccess() throws Exception {
            when(friendshipService.canUserAccessExpenses(
                    eq(FriendShipTestDataFactory.FRIEND_USER_ID),
                    eq(FriendShipTestDataFactory.TEST_USER_ID)))
                    .thenReturn(true);

            mockMvc.perform(get("/api/friendships/can-access-expenses")
                            .param("targetUserId", String.valueOf(FriendShipTestDataFactory.FRIEND_USER_ID))
                            .param("requesterId", String.valueOf(FriendShipTestDataFactory.TEST_USER_ID)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(true));
        }

        @Test
        @DisplayName("shouldReturnFalseWhenCannotAccess")
        void shouldReturnFalseWhenCannotAccess() throws Exception {
            when(friendshipService.canUserAccessExpenses(
                    eq(FriendShipTestDataFactory.FRIEND_USER_ID),
                    eq(FriendShipTestDataFactory.TEST_USER_ID)))
                    .thenReturn(false);

            mockMvc.perform(get("/api/friendships/can-access-expenses")
                            .param("targetUserId", String.valueOf(FriendShipTestDataFactory.FRIEND_USER_ID))
                            .param("requesterId", String.valueOf(FriendShipTestDataFactory.TEST_USER_ID)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(false));
        }
    }
}
