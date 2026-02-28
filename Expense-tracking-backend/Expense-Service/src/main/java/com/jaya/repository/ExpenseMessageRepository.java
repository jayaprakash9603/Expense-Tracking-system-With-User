package com.jaya.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jaya.models.ExpenseMessage;

public interface ExpenseMessageRepository extends JpaRepository<ExpenseMessage, Integer> {
public List<ExpenseMessage>findByChatId(Integer chatId);
}


