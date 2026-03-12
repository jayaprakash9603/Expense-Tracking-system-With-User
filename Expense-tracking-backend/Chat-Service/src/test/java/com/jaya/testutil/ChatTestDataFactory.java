package com.jaya.testutil;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.ChatRequest;
import com.jaya.models.Chat;

public final class ChatTestDataFactory {

    public static final String TEST_JWT = "Bearer test-jwt-token";
    public static final Integer TEST_USER_ID = 1;
    public static final Integer RECIPIENT_USER_ID = 2;
    public static final Integer GROUP_ID = 10;
    public static final String TEST_USERNAME = "testuser";
    public static final String TEST_EMAIL = "test@example.com";

    private ChatTestDataFactory() {
    }

    public static UserDTO buildUser() {
        UserDTO user = new UserDTO();
        user.setId(TEST_USER_ID);
        user.setUsername(TEST_USERNAME);
        user.setEmail(TEST_EMAIL);
        user.setFirstName("Test");
        user.setLastName("User");
        return user;
    }

    public static UserDTO buildRecipientUser() {
        UserDTO user = new UserDTO();
        user.setId(RECIPIENT_USER_ID);
        user.setUsername("recipient");
        user.setEmail("recipient@example.com");
        user.setFirstName("Recipient");
        user.setLastName("User");
        return user;
    }

    public static ChatRequest buildChatRequest(Integer recipientId, String content) {
        ChatRequest request = new ChatRequest();
        request.setRecipientId(recipientId);
        request.setContent(content);
        return request;
    }

    public static ChatRequest buildGroupChatRequest(Integer groupId, String content) {
        ChatRequest request = new ChatRequest();
        request.setGroupId(groupId);
        request.setContent(content);
        return request;
    }

    public static Chat buildOneToOneChat(Integer senderId, Integer recipientId, String content) {
        Chat chat = new Chat();
        chat.setSenderId(senderId);
        chat.setRecipientId(recipientId);
        chat.setContent(content);
        return chat;
    }

    public static Chat buildGroupChat(Integer senderId, Integer groupId, String content) {
        Chat chat = new Chat();
        chat.setSenderId(senderId);
        chat.setGroupId(groupId);
        chat.setContent(content);
        return chat;
    }

    public static Chat buildChatWithId(Integer id, Integer senderId, Integer recipientId, String content) {
        Chat chat = buildOneToOneChat(senderId, recipientId, content);
        chat.setId(id);
        return chat;
    }

    public static Chat buildGroupChatWithId(Integer id, Integer senderId, Integer groupId, String content) {
        Chat chat = buildGroupChat(senderId, groupId, content);
        chat.setId(id);
        return chat;
    }
}
