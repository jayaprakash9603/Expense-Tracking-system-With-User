package com.jaya.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.jaya.models.Chat;
import com.jaya.repository.ChatRepository;

@Service
public class AsyncChatSaver {
    @Autowired
    private ChatRepository chatRepository;

    @Async
    public void saveChatAsync(Chat chat) {
        System.out.println("Async save thread: " + Thread.currentThread().getName());
        chatRepository.save(chat);
    }
}