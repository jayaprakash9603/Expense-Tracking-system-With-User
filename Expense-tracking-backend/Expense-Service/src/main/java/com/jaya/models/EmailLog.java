package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jaya.common.dto.UserDTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "expense_email_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer Id;

    private String toEmail;
    private String subject;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String text;
    private LocalDateTime sentAt;

    @ElementCollection
    private Map<String, String> attachmentDetails;


    @JsonIgnore
    @ManyToOne
    private UserDTO UserDTO;

    @OneToOne(mappedBy = "emailLog", cascade = CascadeType.ALL)
    private CommonLog commonLog;
}