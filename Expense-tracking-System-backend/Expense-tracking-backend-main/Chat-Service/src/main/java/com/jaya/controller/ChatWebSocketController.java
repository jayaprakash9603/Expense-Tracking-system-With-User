package com.jaya.controller;

import com.jaya.dto.ChatRequest;
import com.jaya.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {
    @Autowired
    private ChatService chatService;

    @MessageMapping("/send/one-to-one")
    public void sendOneToOneChat(ChatRequest request, Integer userId) {
        chatService.sendOneToOneChat(request, userId);
    }

    @MessageMapping("/send/group")
    public void sendGroupChat(ChatRequest request, Integer userId) {
        chatService.sendGroupChat(request, userId);
    }

    @MessageMapping("/mark-read")
    public void markChatAsRead(Integer chatId, Integer userId) throws Exception {
        chatService.markChatAsRead(chatId, userId);
    }
}