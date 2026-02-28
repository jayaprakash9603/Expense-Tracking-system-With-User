package com.jaya.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExpenseHomeController {

    @GetMapping("/")
    public ResponseEntity<String> home() {
        return new ResponseEntity<>("Welcome to Expense Service", HttpStatus.OK);
    }
}
