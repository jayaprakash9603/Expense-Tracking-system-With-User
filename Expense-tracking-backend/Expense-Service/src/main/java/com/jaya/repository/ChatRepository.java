package com.jaya.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jaya.models.Chat;
import com.jaya.common.dto.UserDTO;

public interface ChatRepository extends JpaRepository<Chat, Integer>{

	
	public List<Chat> findByUsersId(Integer userId);
	
	@Query("select c from Chat c Where :UserDTO Member of c.users And :reqUser Member of c.users")
	public Chat findChatByUsersId(@Param("UserDTO")UserDTO UserDTO,@Param("reqUser")UserDTO reqUser);
}
