package com.jaya.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jaya.dto.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class Chat {

	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;
	
	
	private String chat_name;
	
	private String chat_image;
	
	
	@ManyToMany
	private List<User> users=new ArrayList<>();
	
	
	@JsonIgnore
	@OneToMany(mappedBy="chat")
	private List<Message>messages=new ArrayList<>();
	private LocalDateTime timestamp;
	
	
}
