package com.jaya.controller;



import com.jaya.models.InvestmentInput;
import com.jaya.models.InvestmentResult;
import com.jaya.service.InvestmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/investment")
public class InvestmentController {

    @Autowired
    private InvestmentService investmentService;

    @PostMapping("/calculate")
    public ResponseEntity<InvestmentResult> calculateFutureValue(@Valid @RequestBody InvestmentInput input) {
        try {
            InvestmentResult result = investmentService.calculateFutureValue(input);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
