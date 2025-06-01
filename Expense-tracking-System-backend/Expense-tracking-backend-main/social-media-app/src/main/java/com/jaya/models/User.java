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
@Table(name = "app_user")
public class User  {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;
	private String username;
	private String phoneNumber;
	private String website;
	private String location;
	private String bio;
	private String firstName;
	private String lastName;
	@Column(unique = true, nullable = false)
	private String email;
	private String password;
	private String gender;
	private String image="";


	@OneToMany(mappedBy = "user", cascade =CascadeType.ALL)
	private List<Expense> expenses = new ArrayList<>();

	@OneToMany(mappedBy = "user", cascade =CascadeType.ALL)
	private List<EmailLog>emailLogs=new ArrayList<>();

	@OneToMany(mappedBy = "user", cascade =CascadeType.ALL)
	private List<AuditExpense>audits=new ArrayList<>();

	@OneToMany
	private List<PaymentMethod> paymentMethod = new ArrayList<>();


	@OneToMany
	private List<Category>categoryies=new ArrayList<>();

}
