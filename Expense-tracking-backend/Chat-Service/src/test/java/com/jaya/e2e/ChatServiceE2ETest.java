package com.jaya.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.ChatRequest;
import com.jaya.dto.ChatResponse;
import com.jaya.dto.GroupResponseDTO;
import com.jaya.models.Chat;
import com.jaya.repository.ChatRepository;
import com.jaya.service.FriendShipService;
import com.jaya.service.client.GroupService;
import com.jaya.testutil.ChatTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.jaya.testutil.ChatTestDataFactory.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration"
})
@AutoConfigureMockMvc
@Transactional
class ChatServiceE2ETest {

    private static final String USER1_JWT = "Bearer user1-jwt";
    private static final String USER2_JWT = "Bearer user2-jwt";
    private static final Integer USER3_ID = 3;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ChatRepository chatRepository;

    @MockBean
    private IUserServiceClient userClient;

    @MockBean
    private FriendShipService friendshipService;

    @MockBean
    private GroupService groupService;

    @MockBean
    private RedisTemplate<String, Object> objectRedisTemplate;

    @MockBean
    private RedisTemplate<String, String> stringRedisTemplate;

    @MockBean
    private SimpMessagingTemplate simpMessagingTemplate;

    @BeforeEach
    void setUp() {
        ValueOperations<String, Object> valueOps = mock(ValueOperations.class);
        SetOperations<String, Object> setOps = mock(SetOperations.class);
        when(objectRedisTemplate.opsForValue()).thenReturn(valueOps);
        when(objectRedisTemplate.opsForSet()).thenReturn(setOps);

        ValueOperations<String, String> stringValueOps = mock(ValueOperations.class);
        SetOperations<String, String> stringSetOps = mock(SetOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(stringValueOps);
        when(stringRedisTemplate.opsForSet()).thenReturn(stringSetOps);

        when(userClient.getUserProfile(anyString())).thenAnswer(inv -> {
            String jwt = inv.getArgument(0);
            if (USER2_JWT.equals(jwt)) {
                return buildRecipientUser();
            }
            return buildUser();
        });
        when(userClient.getUserById(1)).thenReturn(buildUser());
        when(userClient.getUserById(2)).thenReturn(buildRecipientUser());
        when(userClient.getUserById(USER3_ID)).thenReturn(buildUser3());

        when(friendshipService.areFriends(1, 2)).thenReturn(true);
        when(friendshipService.areFriends(2, 1)).thenReturn(true);
        when(friendshipService.areFriends(1, 1)).thenThrow(new RuntimeException("Cannot check self"));
        when(friendshipService.areFriends(1, USER3_ID)).thenReturn(false);
        when(friendshipService.areFriends(USER3_ID, 1)).thenReturn(false);

        try {
            doReturn(Optional.of(buildGroupResponseDTO()))
                    .when(groupService).getGroupByIdwithService(anyInt(), anyInt());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private UserDTO buildUser3() {
        UserDTO user = new UserDTO();
        user.setId(USER3_ID);
        user.setUsername("user3");
        user.setEmail("user3@example.com");
        user.setFirstName("User");
        user.setLastName("Three");
        return user;
    }

    private GroupResponseDTO buildGroupResponseDTO() {
        GroupResponseDTO dto = new GroupResponseDTO();
        dto.setId(GROUP_ID);
        dto.setName("Test Group");
        return dto;
    }

    @Nested
    @DisplayName("Workflow 1: One-to-one message lifecycle")
    class OneToOneMessageLifecycle {

        @Test
        @DisplayName("send fetch markRead verify")
        void oneToOneMessageLifecycle() throws Exception {
            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "Hello from User 1");
            ResultActions sendResult = mockMvc.perform(post("/api/chats/one-to-one")
                            .header("Authorization", USER1_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            ChatResponse sentChat = objectMapper.readValue(
                    sendResult.andReturn().getResponse().getContentAsString(), ChatResponse.class);
            Integer chatId = sentChat.getId();
            assertThat(chatId).isNotNull();

            mockMvc.perform(get("/api/chats/between")
                            .header("Authorization", USER2_JWT)
                            .param("userId2", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[?(@.id == " + chatId + ")].content").value("Hello from User 1"));

            mockMvc.perform(put("/api/chats/{chatId}/read", chatId)
                            .header("Authorization", USER2_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isRead").value(true));

            Chat updated = chatRepository.findById(chatId).orElseThrow();
            assertThat(updated.isRead()).isTrue();
        }
    }

    @Nested
    @DisplayName("Workflow 2: Message edit within time limit")
    class MessageEditWithinTimeLimit {

        @Test
        @DisplayName("edit message and verify isEdited")
        void editMessageAndVerify() throws Exception {
            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "Original content");
            ResultActions sendResult = mockMvc.perform(post("/api/chats/one-to-one")
                            .header("Authorization", USER1_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            ChatResponse sentChat = objectMapper.readValue(
                    sendResult.andReturn().getResponse().getContentAsString(), ChatResponse.class);
            Integer messageId = sentChat.getId();

            mockMvc.perform(put("/api/chats/{messageId}/edit", messageId)
                            .header("Authorization", USER1_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"content\":\"Edited content\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").value("Edited content"))
                    .andExpect(jsonPath("$.isEdited").value(true));

            Chat updated = chatRepository.findById(messageId).orElseThrow();
            assertThat(updated.getContent()).isEqualTo("Edited content");
            assertThat(updated.getIsEdited()).isTrue();
        }
    }

    @Nested
    @DisplayName("Workflow 3: Message deletion")
    class MessageDeletion {

        @Test
        @DisplayName("sender deletes message soft-deleted")
        void senderDeletesMessageSoftDeleted() throws Exception {
            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "Message to delete");
            ResultActions sendResult = mockMvc.perform(post("/api/chats/one-to-one")
                            .header("Authorization", USER1_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            ChatResponse sentChat = objectMapper.readValue(
                    sendResult.andReturn().getResponse().getContentAsString(), ChatResponse.class);
            Integer chatId = sentChat.getId();

            mockMvc.perform(delete("/api/chats/{id}", chatId)
                            .header("Authorization", USER1_JWT))
                    .andExpect(status().isOk());

            Chat deleted = chatRepository.findById(chatId).orElseThrow();
            assertThat(deleted.getDeletedBySender()).isTrue();
            assertThat(deleted.getDeletedByRecipient()).isFalse();
        }
    }

    @Nested
    @DisplayName("Workflow 4: Non-friend rejection")
    class NonFriendRejection {

        @Test
        @DisplayName("reject message to non-friend")
        void rejectMessageToNonFriend() throws Exception {
            ChatRequest request = new ChatRequest();
            request.setRecipientId(USER3_ID);
            request.setContent("Hello non-friend");

            mockMvc.perform(post("/api/chats/one-to-one")
                            .header("Authorization", USER1_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Workflow 5: Batch read and unread count")
    class BatchReadAndUnreadCount {

        @Test
        @DisplayName("insert unread mark batch verify count")
        void batchReadAndUnreadCount() throws Exception {
            Chat c1 = ChatTestDataFactory.buildOneToOneChat(2, 1, "Unread 1");
            c1.setRead(false);
            Chat c2 = ChatTestDataFactory.buildOneToOneChat(2, 1, "Unread 2");
            c2.setRead(false);
            Chat c3 = ChatTestDataFactory.buildOneToOneChat(2, 1, "Unread 3");
            c3.setRead(false);
            chatRepository.saveAll(List.of(c1, c2, c3));

            ResultActions countResult1 = mockMvc.perform(get("/api/chats/unread/count")
                            .header("Authorization", USER1_JWT))
                    .andExpect(status().isOk());
            long countBefore = Long.parseLong(
                    objectMapper.readTree(countResult1.andReturn().getResponse().getContentAsString())
                            .get("unreadCount").asText());

            List<Integer> messageIds = List.of(c1.getId(), c2.getId());
            mockMvc.perform(post("/api/chats/mark-read")
                            .header("Authorization", USER1_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("messageIds", messageIds))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.markedCount").value(2));

            ResultActions countResult2 = mockMvc.perform(get("/api/chats/unread/count")
                            .header("Authorization", USER1_JWT))
                    .andExpect(status().isOk());
            long countAfter = Long.parseLong(
                    objectMapper.readTree(countResult2.andReturn().getResponse().getContentAsString())
                            .get("unreadCount").asText());
            assertThat(countAfter).isEqualTo(countBefore - 2);
        }
    }
}
