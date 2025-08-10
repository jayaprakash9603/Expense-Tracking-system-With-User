package com.jaya.task.user.service.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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


}