package com.jaya.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jaya.models.ExpenseChat;
import com.jaya.common.dto.UserDTO;

public interface ExpenseChatRepository extends JpaRepository<ExpenseChat, Integer>{

	
	@Query("select c from ExpenseChat c where :userId member of c.userIds")
	public List<ExpenseChat> findByUsersId(@Param("userId") Integer userId);
	
	@Query("select c from ExpenseChat c Where :userId Member of c.userIds And :reqUserId Member of c.userIds")
	public ExpenseChat findChatByUsersId(@Param("userId") Integer userId, @Param("reqUserId") Integer reqUserId);
}

