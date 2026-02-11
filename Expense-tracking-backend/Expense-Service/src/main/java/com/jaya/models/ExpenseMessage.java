package com.jaya.models;

import java.time.LocalDateTime;

import com.jaya.common.dto.UserDTO;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "expense_message")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;
	
	
	private String content;
	private String image;
	private Integer userId;
	@ManyToOne
	private ExpenseChat chat;
	private LocalDateTime createdAt;
}


