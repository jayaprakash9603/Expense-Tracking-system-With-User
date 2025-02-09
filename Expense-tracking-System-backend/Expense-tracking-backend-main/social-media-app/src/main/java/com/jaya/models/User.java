package com.jaya.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User  {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;
	private String firstName;
	private String lastName;
	private String email;
	private String password;
	private String gender;


	@OneToMany(mappedBy = "user", cascade =CascadeType.ALL)
	private List<Expense> expenses = new ArrayList<>();

	@OneToMany(mappedBy = "user", cascade =CascadeType.ALL)
	private List<EmailLog>emailLogs=new ArrayList<>();
	

}
