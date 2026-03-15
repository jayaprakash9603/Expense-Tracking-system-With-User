package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.BulkDeleteRequest;
import com.jaya.dto.ChatRequest;
import com.jaya.dto.ChatResponse;
import com.jaya.exception.RestExceptionHandler;
import com.jaya.service.ChatService;
import com.jaya.service.PresenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static com.jaya.testutil.ChatTestDataFactory.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatController.class)
@Import(RestExceptionHandler.class)
class ChatControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @MockBean
    private IUserServiceClient userClient;

    @MockBean
    private PresenceService presenceService;

    private UserDTO reqUser;

    @BeforeEach
    void setUp() {
        reqUser = buildUser();
        when(userClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
    }

    @Nested
    @DisplayName("POST /api/chats/one-to-one")
    class SendOneToOneChat {

        @Test
        @DisplayName("shouldSendOneToOneChatAndReturn200")
        void shouldSendOneToOneChatAndReturn200() throws Exception {
            ChatResponse response = new ChatResponse();
            response.setId(100);
            response.setSenderId(1);
            response.setRecipientId(2);
            response.setContent("Hello");
            when(chatService.sendOneToOneChat(any(ChatRequest.class), eq(reqUser.getId()))).thenReturn(response);

            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "Hello");
            mockMvc.perform(post("/api/chats/one-to-one")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.senderId").value(1));
        }

        @Test
        @DisplayName("shouldReturn400WhenContentIsBlank")
        void shouldReturn400WhenContentIsBlank() throws Exception {
            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "");
            mockMvc.perform(post("/api/chats/one-to-one")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/chats/group")
    class SendGroupChat {

        @Test
        @DisplayName("shouldSendGroupChatAndReturn200")
        void shouldSendGroupChatAndReturn200() throws Exception {
            ChatResponse response = new ChatResponse();
            response.setId(101);
            response.setSenderId(1);
            response.setGroupId(GROUP_ID);
            response.setContent("Group message");
            when(chatService.sendGroupChat(any(ChatRequest.class), eq(reqUser.getId()))).thenReturn(response);

            ChatRequest request = buildGroupChatRequest(GROUP_ID, "Group message");
            mockMvc.perform(post("/api/chats/group")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.groupId").value(GROUP_ID));
        }
    }

    @Nested
    @DisplayName("GET /api/chats/between")
    class GetChatsBetween {

        @Test
        @DisplayName("shouldReturnChatsBetweenUsers")
        void shouldReturnChatsBetweenUsers() throws Exception {
            ChatResponse chat = new ChatResponse();
            chat.setId(100);
            chat.setSenderId(1);
            chat.setRecipientId(2);
            chat.setContent("Hello");
            when(chatService.getChatsBetweenUsers(eq(reqUser.getId()), eq(2))).thenReturn(List.of(chat));

            mockMvc.perform(get("/api/chats/between")
                            .header("Authorization", TEST_JWT)
                            .param("userId2", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(100));
        }

        @Test
        @DisplayName("shouldReturn400WhenUserId2Invalid")
        void shouldReturn400WhenUserId2Invalid() throws Exception {
            mockMvc.perform(get("/api/chats/between")
                            .header("Authorization", TEST_JWT)
                            .param("userId2", "abc"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("shouldReturn400WhenUserId2Missing")
        void shouldReturn400WhenUserId2Missing() throws Exception {
            mockMvc.perform(get("/api/chats/between")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/chats/{chatId}/read")
    class MarkChatAsRead {

        @Test
        @DisplayName("shouldMarkChatAsReadAndReturn200")
        void shouldMarkChatAsReadAndReturn200() throws Exception {
            ChatResponse response = new ChatResponse();
            response.setId(100);
            response.setIsRead(true);
            when(chatService.markChatAsRead(eq(100), eq(reqUser.getId()))).thenReturn(response);

            mockMvc.perform(put("/api/chats/100/read")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("PUT /api/chats/{messageId}/edit")
    class EditMessage {

        @Test
        @DisplayName("shouldEditMessageAndReturn200")
        void shouldEditMessageAndReturn200() throws Exception {
            ChatResponse response = new ChatResponse();
            response.setId(100);
            response.setContent("edited");
            when(chatService.editMessage(eq(100), eq("edited"), eq(reqUser.getId()))).thenReturn(response);

            mockMvc.perform(put("/api/chats/100/edit")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"content\":\"edited\"}"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("shouldReturn400WhenContentEmpty")
        void shouldReturn400WhenContentEmpty() throws Exception {
            mockMvc.perform(put("/api/chats/100/edit")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"content\":\"\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/chats/{id}")
    class DeleteChat {

        @Test
        @DisplayName("shouldDeleteChatAndReturn200")
        void shouldDeleteChatAndReturn200() throws Exception {
            mockMvc.perform(delete("/api/chats/100")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("DELETE /api/chats/bulk")
    class BulkDelete {

        @Test
        @DisplayName("shouldBulkDeleteAndReturn200")
        void shouldBulkDeleteAndReturn200() throws Exception {
            BulkDeleteRequest request = new BulkDeleteRequest();
            request.setChatIds(List.of(1, 2, 3));
            mockMvc.perform(delete("/api/chats/bulk")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/chats/mark-read")
    class MarkRead {

        @Test
        @DisplayName("shouldMarkBatchAsReadByMessageIds")
        void shouldMarkBatchAsReadByMessageIds() throws Exception {
            when(chatService.markChatsAsReadBatch(eq(List.of(1, 2, 3)), eq(reqUser.getId()))).thenReturn(3);

            mockMvc.perform(post("/api/chats/mark-read")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"messageIds\":[1,2,3]}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.markedCount").value(3));
        }

        @Test
        @DisplayName("shouldMarkConversationAsRead")
        void shouldMarkConversationAsRead() throws Exception {
            when(chatService.markConversationAsRead(eq(2), eq(reqUser.getId()))).thenReturn(5);

            mockMvc.perform(post("/api/chats/mark-read")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"conversationId\":2,\"conversationType\":\"user\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.markedCount").value(5));
        }
    }

    @Nested
    @DisplayName("GET /api/chats/conversations")
    class GetConversations {

        @Test
        @DisplayName("shouldReturnConversationsList")
        void shouldReturnConversationsList() throws Exception {
            when(chatService.getConversationsList(eq(reqUser.getId()))).thenReturn(List.of(Map.of("id", 1)));

            mockMvc.perform(get("/api/chats/conversations")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/chats/unread/count")
    class GetUnreadCount {

        @Test
        @DisplayName("shouldReturnUnreadCount")
        void shouldReturnUnreadCount() throws Exception {
            when(chatService.getUnreadMessageCount(eq(reqUser.getId()))).thenReturn(5L);

            mockMvc.perform(get("/api/chats/unread/count")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.unreadCount").value(5));
        }
    }

    @Nested
    @DisplayName("GET /api/chats/statistics")
    class GetStatistics {

        @Test
        @DisplayName("shouldReturnStatistics")
        void shouldReturnStatistics() throws Exception {
            when(chatService.getChatStatistics(eq(reqUser.getId()))).thenReturn(Map.of("totalMessages", 10));

            mockMvc.perform(get("/api/chats/statistics")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/chats/{messageId}/reactions")
    class AddReaction {

        @Test
        @DisplayName("shouldAddReactionAndReturn200")
        void shouldAddReactionAndReturn200() throws Exception {
            mockMvc.perform(post("/api/chats/100/reactions")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"reaction\":\"👍\"}"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("shouldReturn400WhenReactionEmpty")
        void shouldReturn400WhenReactionEmpty() throws Exception {
            mockMvc.perform(post("/api/chats/100/reactions")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"reaction\":\"\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/chats/media")
    class SendMediaMessage {

        @Test
        @DisplayName("shouldSendMediaMessageAndReturn200")
        void shouldSendMediaMessageAndReturn200() throws Exception {
            ChatResponse response = new ChatResponse();
            response.setId(100);
            response.setMediaUrl("https://example.com/image.png");
            when(chatService.sendMediaMessage(eq(2), isNull(), eq("https://example.com/image.png"), isNull(), isNull(), eq(reqUser.getId())))
                    .thenReturn(response);

            mockMvc.perform(post("/api/chats/media")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"recipientId\":2,\"mediaUrl\":\"https://example.com/image.png\"}"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("shouldReturn400WhenMediaUrlEmpty")
        void shouldReturn400WhenMediaUrlEmpty() throws Exception {
            mockMvc.perform(post("/api/chats/media")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"mediaUrl\":\"\"}"))
                    .andExpect(status().isBadRequest());
        }
    }
}
