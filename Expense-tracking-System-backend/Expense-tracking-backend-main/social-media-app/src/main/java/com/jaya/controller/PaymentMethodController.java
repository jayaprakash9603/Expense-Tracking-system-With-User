package com.jaya.controller;

import com.jaya.exceptions.UserException;
import com.jaya.models.PaymentMethod;
import com.jaya.models.User;
import com.jaya.service.PaymentMethodService;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    @Autowired
    private PaymentMethodService paymentMethodService;
    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<PaymentMethod> getPaymentMethodById(@PathVariable Integer id, @RequestHeader("Authorization") String jwt) throws Exception {
        User reqUser = userService.findUserByJwt(jwt);
        PaymentMethod pm = paymentMethodService.getById(reqUser.getId(), id);
        return ResponseEntity.ok(pm);
    }

    @GetMapping
    public ResponseEntity<List<PaymentMethod>> getAllPaymentMethods(@RequestHeader("Authorization") String jwt) {
        User reqUser = userService.findUserByJwt(jwt);
        List<PaymentMethod> list = paymentMethodService.getAllPaymentMethods(reqUser.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/name")
    public ResponseEntity<PaymentMethod> getByName(@RequestHeader("Authorization") String jwt,@RequestParam String name) {
        User reqUser = userService.findUserByJwt(jwt);
        PaymentMethod paymentMethod = paymentMethodService.getByName(reqUser.getId(),name);
        return ResponseEntity.ok(paymentMethod);
    }

    @PostMapping()
    public ResponseEntity<PaymentMethod> createPaymentMethod(@RequestHeader("Authorization") String jwt, @RequestBody PaymentMethod paymentMethod) throws UserException {
        User reqUser = userService.findUserByJwt(jwt);
        PaymentMethod created = paymentMethodService.createPaymentMethod(reqUser.getId(), paymentMethod);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMethod> updatePaymentMethod(@PathVariable Integer id, @RequestHeader("Authorization") String jwt, @RequestBody PaymentMethod paymentMethod) throws Exception {
        User reqUser = userService.findUserByJwt(jwt);
        PaymentMethod updated = paymentMethodService.updatePaymentMethod(reqUser.getId(), id, paymentMethod);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Integer id, @RequestHeader("Authorization") String jwt) throws Exception {
        User reqUser = userService.findUserByJwt(jwt);
        paymentMethodService.deletePaymentMethod(reqUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllUserPaymentMethods( @RequestHeader("Authorization") String jwt) throws Exception {
        User reqUser = userService.findUserByJwt(jwt);
        paymentMethodService.deleteAllUserPaymentMethods(reqUser.getId());
        return ResponseEntity.noContent().build();
    }
}