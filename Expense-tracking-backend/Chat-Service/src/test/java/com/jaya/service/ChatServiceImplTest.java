package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.ChatRequest;
import com.jaya.dto.ChatResponse;
import com.jaya.dto.GroupResponseDTO;
import com.jaya.exception.ChatServiceException;
import com.jaya.models.Chat;
import com.jaya.repository.ChatRepository;
import com.jaya.service.client.GroupService;
import com.jaya.util.ChatServiceHelper;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static com.jaya.testutil.ChatTestDataFactory.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private ChatServiceHelper helper;

    @Mock
    private GroupService groupService;

    @Mock
    private FriendShipService friendshipService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private AsyncChatSaver asyncChatSaver;

    @Mock
    private UserCacheService userCacheService;

    @InjectMocks
    private ChatServiceImpl chatService;

    @Nested
    @DisplayName("sendOneToOneChat")
    class SendOneToOneChat {

        @Test
        @DisplayName("shouldSendMessageWhenUsersAreFriends")
        void shouldSendMessageWhenUsersAreFriends() throws Exception {
            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "Hello");
            UserDTO user = buildUser();
            Chat savedChat = buildChatWithId(100, TEST_USER_ID, RECIPIENT_USER_ID, "Hello");

            doReturn(user).when(helper).validateUser(anyInt());
            when(friendshipService.areFriends(TEST_USER_ID, RECIPIENT_USER_ID)).thenReturn(true);
            when(chatRepository.save(any(Chat.class))).thenReturn(savedChat);

            ChatResponse response = chatService.sendOneToOneChat(request, TEST_USER_ID);

            assertThat(response.getSenderId()).isEqualTo(TEST_USER_ID);
            assertThat(response.getRecipientId()).isEqualTo(RECIPIENT_USER_ID);
            assertThat(response.getContent()).isEqualTo("Hello");
            verify(messagingTemplate).convertAndSendToUser(
                    eq(RECIPIENT_USER_ID.toString()), eq("/queue/chats"), any(ChatResponse.class));
        }

        @Test
        @DisplayName("shouldThrowWhenSendingToSelf")
        void shouldThrowWhenSendingToSelf() throws Exception {
            ChatRequest request = buildChatRequest(TEST_USER_ID, "Hello");
            doReturn(buildUser()).when(helper).validateUser(anyInt());

            assertThatThrownBy(() -> chatService.sendOneToOneChat(request, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("Cannot send messages to yourself");
        }

        @Test
        @DisplayName("shouldThrowWhenNotFriends")
        void shouldThrowWhenNotFriends() throws Exception {
            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "Hello");
            doReturn(buildUser()).when(helper).validateUser(anyInt());
            when(friendshipService.areFriends(TEST_USER_ID, RECIPIENT_USER_ID)).thenReturn(false);

            assertThatThrownBy(() -> chatService.sendOneToOneChat(request, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("friends");
        }

        @Test
        @DisplayName("shouldThrowForFeignInternalServerError")
        void shouldThrowForFeignInternalServerError() throws Exception {
            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "Hello");
            doReturn(buildUser()).when(helper).validateUser(anyInt());
            FeignException.InternalServerError ex = new FeignException.InternalServerError("error",
                    Request.create(Request.HttpMethod.GET, "/test", Collections.emptyMap(), (byte[]) null, StandardCharsets.UTF_8),
                    null, Collections.emptyMap());
            doThrow(ex).when(friendshipService).areFriends(TEST_USER_ID, RECIPIENT_USER_ID);

            assertThatThrownBy(() -> chatService.sendOneToOneChat(request, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("Friendship service error");
        }

        @Test
        @DisplayName("shouldThrowForFeignNotFound")
        void shouldThrowForFeignNotFound() throws Exception {
            ChatRequest request = buildChatRequest(RECIPIENT_USER_ID, "Hello");
            doReturn(buildUser()).when(helper).validateUser(anyInt());
            FeignException.NotFound ex = new FeignException.NotFound("not found",
                    Request.create(Request.HttpMethod.GET, "/test", Collections.emptyMap(), (byte[]) null, StandardCharsets.UTF_8),
                    null, Collections.emptyMap());
            doThrow(ex).when(friendshipService).areFriends(TEST_USER_ID, RECIPIENT_USER_ID);

            assertThatThrownBy(() -> chatService.sendOneToOneChat(request, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("Friendship not found");
        }
    }

    @Nested
    @DisplayName("sendGroupChat")
    class SendGroupChat {

        @Test
        @DisplayName("shouldSendGroupMessage")
        void shouldSendGroupMessage() throws Exception {
            ChatRequest request = buildGroupChatRequest(GROUP_ID, "Group message");
            doReturn(buildUser()).when(helper).validateUser(anyInt());
            doReturn(Optional.of(new GroupResponseDTO())).when(groupService).getGroupByIdwithService(GROUP_ID, TEST_USER_ID);

            ChatResponse response = chatService.sendGroupChat(request, TEST_USER_ID);

            assertThat(response.getGroupId()).isEqualTo(GROUP_ID);
            assertThat(response.getContent()).isEqualTo("Group message");
            verify(asyncChatSaver).saveChatAsync(any(Chat.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/group/" + GROUP_ID), any(ChatResponse.class));
        }

        @Test
        @DisplayName("shouldThrowWhenGroupNotFound")
        void shouldThrowWhenGroupNotFound() throws Exception {
            ChatRequest request = buildGroupChatRequest(GROUP_ID, "Group message");
            doReturn(buildUser()).when(helper).validateUser(anyInt());
            FeignException.NotFound ex = new FeignException.NotFound("not found",
                    Request.create(Request.HttpMethod.GET, "/test", Collections.emptyMap(), (byte[]) null, StandardCharsets.UTF_8),
                    null, Collections.emptyMap());
            doThrow(ex).when(groupService).getGroupByIdwithService(GROUP_ID, TEST_USER_ID);

            assertThatThrownBy(() -> chatService.sendGroupChat(request, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("Group not found");
        }
    }

    @Nested
    @DisplayName("markChatAsRead")
    class MarkChatAsRead {

        @Test
        @DisplayName("shouldMarkOneToOneChatAsRead")
        void shouldMarkOneToOneChatAsRead() throws Exception {
            Chat chat = buildChatWithId(1, RECIPIENT_USER_ID, TEST_USER_ID, "Hi");
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));
            when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> inv.getArgument(0));
            doReturn(buildUser()).when(helper).validateUser(anyInt());

            ChatResponse response = chatService.markChatAsRead(1, TEST_USER_ID);

            assertThat(chat.isRead()).isTrue();
            verify(chatRepository).save(chat);
        }

        @Test
        @DisplayName("shouldThrowWhenNonRecipientTriesToMarkRead")
        void shouldThrowWhenNonRecipientTriesToMarkRead() throws Exception {
            Chat chat = buildChatWithId(1, RECIPIENT_USER_ID, 999, "Hi");
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));

            assertThatThrownBy(() -> chatService.markChatAsRead(1, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("Only the recipient");
        }

        @Test
        @DisplayName("shouldMarkGroupChatAsReadByUser")
        void shouldMarkGroupChatAsReadByUser() throws Exception {
            Chat chat = buildGroupChatWithId(1, RECIPIENT_USER_ID, GROUP_ID, "Group msg");
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));
            when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> inv.getArgument(0));
            doReturn(Optional.of(new GroupResponseDTO())).when(groupService).getGroupByIdwithService(GROUP_ID, TEST_USER_ID);

            chatService.markChatAsRead(1, TEST_USER_ID);

            assertThat(chat.getReadByUsers()).contains(TEST_USER_ID);
            verify(chatRepository).save(chat);
        }

        @Test
        @DisplayName("shouldThrowWhenSenderTriesToMarkOwnGroupMessageRead")
        void shouldThrowWhenSenderTriesToMarkOwnGroupMessageRead() throws Exception {
            Chat chat = buildGroupChatWithId(1, TEST_USER_ID, GROUP_ID, "My msg");
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));
            doReturn(Optional.of(new GroupResponseDTO())).when(groupService).getGroupByIdwithService(GROUP_ID, TEST_USER_ID);

            assertThatThrownBy(() -> chatService.markChatAsRead(1, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("cannot mark your own");
        }
    }

    @Nested
    @DisplayName("editMessage")
    class EditMessage {

        @Test
        @DisplayName("shouldEditMessageWithinTimeLimit")
        void shouldEditMessageWithinTimeLimit() throws Exception {
            Chat chat = buildChatWithId(1, TEST_USER_ID, RECIPIENT_USER_ID, "Original");
            chat.setTimestamp(LocalDateTime.now());
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));
            when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> inv.getArgument(0));
            doReturn(buildUser()).when(helper).validateUser(anyInt());

            ChatResponse response = chatService.editMessage(1, "Updated", TEST_USER_ID);

            assertThat(chat.getContent()).isEqualTo("Updated");
            assertThat(chat.getIsEdited()).isTrue();
            assertThat(chat.getEditedAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldThrowWhenNonSenderTriesToEdit")
        void shouldThrowWhenNonSenderTriesToEdit() throws Exception {
            Chat chat = buildChatWithId(1, RECIPIENT_USER_ID, TEST_USER_ID, "Original");
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));

            assertThatThrownBy(() -> chatService.editMessage(1, "Updated", TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("can only edit your own");
        }

        @Test
        @DisplayName("shouldThrowWhenEditTimeLimitExceeded")
        void shouldThrowWhenEditTimeLimitExceeded() throws Exception {
            Chat chat = buildChatWithId(1, TEST_USER_ID, RECIPIENT_USER_ID, "Original");
            chat.setTimestamp(LocalDateTime.now().minusMinutes(20));
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));

            assertThatThrownBy(() -> chatService.editMessage(1, "Updated", TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("time limit exceeded");
        }
    }

    @Nested
    @DisplayName("deleteChat")
    class DeleteChat {

        @Test
        @DisplayName("shouldSoftDeleteOneToOneChatBySender")
        void shouldSoftDeleteOneToOneChatBySender() throws Exception {
            Chat chat = buildChatWithId(1, TEST_USER_ID, RECIPIENT_USER_ID, "Hi");
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));
            when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> inv.getArgument(0));
            doReturn(buildUser()).when(helper).validateUser(anyInt());

            chatService.deleteChat(1, TEST_USER_ID);

            assertThat(chat.getDeletedBySender()).isTrue();
            assertThat(chat.isCompletelyDeleted()).isFalse();
            verify(chatRepository).save(chat);
            verify(chatRepository, never()).delete(any());
        }

        @Test
        @DisplayName("shouldSoftDeleteOneToOneChatByRecipient")
        void shouldSoftDeleteOneToOneChatByRecipient() throws Exception {
            Chat chat = buildChatWithId(1, RECIPIENT_USER_ID, TEST_USER_ID, "Hi");
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));
            when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> inv.getArgument(0));
            doReturn(buildUser()).when(helper).validateUser(anyInt());

            chatService.deleteChat(1, TEST_USER_ID);

            assertThat(chat.getDeletedByRecipient()).isTrue();
        }

        @Test
        @DisplayName("shouldHardDeleteWhenBothPartiesDeleted")
        void shouldHardDeleteWhenBothPartiesDeleted() throws Exception {
            Chat chat = buildChatWithId(1, RECIPIENT_USER_ID, TEST_USER_ID, "Hi");
            chat.setDeletedBySender(true);
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));
            when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> inv.getArgument(0));
            doReturn(buildUser()).when(helper).validateUser(anyInt());

            chatService.deleteChat(1, TEST_USER_ID);

            assertThat(chat.getDeletedByRecipient()).isTrue();
            verify(chatRepository).delete(chat);
        }

        @Test
        @DisplayName("shouldThrowWhenNonParticipantTriesToDelete")
        void shouldThrowWhenNonParticipantTriesToDelete() throws Exception {
            Chat chat = buildChatWithId(1, 100, 200, "Hi");
            when(chatRepository.findById(1)).thenReturn(Optional.of(chat));
            doReturn(buildUser()).when(helper).validateUser(anyInt());

            assertThatThrownBy(() -> chatService.deleteChat(1, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("your own conversations");
        }
    }

    @Nested
    @DisplayName("forwardMessage")
    class ForwardMessage {

        @Test
        @DisplayName("shouldForwardToUser")
        void shouldForwardToUser() throws Exception {
            Chat original = buildChatWithId(1, RECIPIENT_USER_ID, TEST_USER_ID, "Original");
            when(chatRepository.findById(1)).thenReturn(Optional.of(original));
            when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> {
                Chat saved = inv.getArgument(0);
                saved.setId(2);
                return saved;
            });
            doReturn(buildUser()).when(helper).validateUser(anyInt());
            when(friendshipService.areFriends(TEST_USER_ID, RECIPIENT_USER_ID)).thenReturn(true);

            ChatResponse response = chatService.forwardMessage(1, RECIPIENT_USER_ID, null, TEST_USER_ID);

            verify(chatRepository).save(argThat(c -> c.getIsForwarded() != null && c.getIsForwarded()));
        }

        @Test
        @DisplayName("shouldForwardToGroup")
        void shouldForwardToGroup() throws Exception {
            Chat original = buildGroupChatWithId(1, RECIPIENT_USER_ID, GROUP_ID, "Original");
            when(chatRepository.findById(1)).thenReturn(Optional.of(original));
            when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> {
                Chat saved = inv.getArgument(0);
                saved.setId(2);
                return saved;
            });
            doReturn(buildUser()).when(helper).validateUser(anyInt());
            doReturn(Optional.of(new GroupResponseDTO())).when(groupService).getGroupByIdwithService(GROUP_ID, TEST_USER_ID);

            ChatResponse response = chatService.forwardMessage(1, null, GROUP_ID, TEST_USER_ID);

            verify(chatRepository).save(argThat(c -> c.getGroupId() != null && c.getGroupId().equals(GROUP_ID)));
        }

        @Test
        @DisplayName("shouldThrowWhenNoTargetSpecified")
        void shouldThrowWhenNoTargetSpecified() throws Exception {
            Chat original = buildChatWithId(1, RECIPIENT_USER_ID, TEST_USER_ID, "Original");
            when(chatRepository.findById(1)).thenReturn(Optional.of(original));

            assertThatThrownBy(() -> chatService.forwardMessage(1, null, null, TEST_USER_ID))
                    .isInstanceOf(ChatServiceException.class)
                    .hasMessageContaining("Either target user or target group");
        }
    }

    @Nested
    @DisplayName("markChatsAsReadBatch")
    class MarkChatsAsReadBatch {

        @Test
        @DisplayName("shouldReturnZeroForEmptyList")
        void shouldReturnZeroForEmptyList() {
            int resultNull = chatService.markChatsAsReadBatch(null, TEST_USER_ID);
            int resultEmpty = chatService.markChatsAsReadBatch(List.of(), TEST_USER_ID);

            assertThat(resultNull).isZero();
            assertThat(resultEmpty).isZero();
            verify(chatRepository, never()).batchMarkAsRead(any());
        }

        @Test
        @DisplayName("shouldCallBatchMarkAsRead")
        void shouldCallBatchMarkAsRead() throws Exception {
            doReturn(buildUser()).when(helper).validateUser(anyInt());
            when(chatRepository.batchMarkAsRead(anyList())).thenReturn(2);

            int result = chatService.markChatsAsReadBatch(List.of(1, 2, 3), TEST_USER_ID);

            assertThat(result).isEqualTo(2);
            verify(chatRepository).batchMarkAsRead(List.of(1, 2, 3));
        }
    }
}
