package com.jaya.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Reels {
	
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
   private  Integer id;
	
	
	private String title;
	
	private String video;
	
	@ManyToOne
	private User user;
	
	
	
	
}
