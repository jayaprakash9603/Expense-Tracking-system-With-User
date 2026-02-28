package com.jaya.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.OneToOne;
import jakarta.persistence.JoinColumn;

import java.time.LocalDateTime;

@Entity
@Table(name = "common_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommonLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;





    @OneToOne
    @JoinColumn(name = "email_log_id")
    private EmailLog emailLog;

    private LocalDateTime timestamp;
}
