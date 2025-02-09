package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "email_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer Id;

    private String toEmail;
    private String subject;
    private String text;
    private LocalDateTime sentAt;

    @ElementCollection
    private Map<String, String> attachmentDetails;


    @JsonIgnore
    @ManyToOne
    private User user;

    @OneToOne(mappedBy = "emailLog", cascade = CascadeType.ALL)
    private CommonLog commonLog;
}