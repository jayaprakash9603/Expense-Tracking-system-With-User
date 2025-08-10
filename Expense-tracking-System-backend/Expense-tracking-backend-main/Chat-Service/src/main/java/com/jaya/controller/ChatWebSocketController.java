package com.jaya.controller;

import com.jaya.dto.ChatRequest;
import com.jaya.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for real-time chat messaging.
 */
@Controller
public class ChatWebSocketController {
    @Autowired
    private ChatService chatService;

    /**
     * Handles one-to-one chat messages sent via WebSocket.
     * @param request DTO containing sender ID, recipient ID, and content.
     */
    @MessageMapping("/send/one-to-one")
    public void sendOneToOneChat(ChatRequest request,Integer userId) {
        chatService.sendOneToOneChat(request,userId);
    }

    /**
     * Handles group chat messages sent via WebSocket.
     * @param request DTO containing sender ID, group ID, and content.
     */
    @MessageMapping("/send/group")
    public void sendGroupChat(ChatRequest request,Integer userId) {
        chatService.sendGroupChat(request,userId);
    }

    /**
     * Marks a chat as read via WebSocket.
     * @param chatId ID of the chat to mark as read.
     */
    @MessageMapping("/mark-read")
    public void markChatAsRead(Integer chatId,Integer userId) throws Exception {
        chatService.markChatAsRead(chatId,userId);
    }
}