package com.jaya.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jaya.common.dto.UserDTO;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "expense_chat")
public class ExpenseChat {

	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;
	
	
	private String chat_name;
	
	private String chat_image;
	
	
	@jakarta.persistence.ElementCollection
	private List<Integer> userIds=new ArrayList<>();
	
	
	@JsonIgnore
	@OneToMany(mappedBy="chat")
	private List<ExpenseMessage>messages=new ArrayList<>();
	private LocalDateTime timestamp;
	
	
}



