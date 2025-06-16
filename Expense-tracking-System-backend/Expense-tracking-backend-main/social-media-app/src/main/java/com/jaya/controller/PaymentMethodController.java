package com.jaya.controller;

import com.jaya.exceptions.UserException;
import com.jaya.models.PaymentMethod;
import com.jaya.models.User;
import com.jaya.service.PaymentMethodService;
import com.jaya.service.UserService;
import com.jaya.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    @Autowired
    private PaymentMethodService paymentMethodService;
    @Autowired
    private UserService userService;
    @Autowired
    private FriendshipService friendshipService;

    private User getTargetUserWithPermissionCheck(Integer targetId, User reqUser, boolean needWriteAccess) throws UserException {
        if (targetId == null) return reqUser;
        User targetUser = userService.findUserById(targetId);
        if (targetUser == null) throw new RuntimeException("Target user not found");
        boolean hasAccess = needWriteAccess ?
                friendshipService.canUserModifyExpenses(targetId, reqUser.getId()) :
                friendshipService.canUserAccessExpenses(targetId, reqUser.getId());
        if (!hasAccess) {
            String action = needWriteAccess ? "modify" : "access";
            throw new RuntimeException("You don't have permission to " + action + " this user's payment methods");
        }
        return targetUser;
    }

    private ResponseEntity<?> handleTargetUserException(RuntimeException e) {
        if (e.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Target user not found");
        } else if (e.getMessage().contains("permission")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentMethodById(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            PaymentMethod pm = paymentMethodService.getById(targetUser.getId(), id);
            return ResponseEntity.ok(pm);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching payment method: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPaymentMethods(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<PaymentMethod> list = paymentMethodService.getAllPaymentMethods(targetUser.getId());
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching payment methods: " + e.getMessage());
        }
    }

    @GetMapping("/name")
    public ResponseEntity<?> getByName(
            @RequestHeader("Authorization") String jwt,
            @RequestParam String name,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            PaymentMethod paymentMethod = paymentMethodService.getByName(targetUser.getId(), name);
            return ResponseEntity.ok(paymentMethod);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching payment method: " + e.getMessage());
        }
    }

    @PostMapping()
    public ResponseEntity<?> createPaymentMethod(
            @RequestHeader("Authorization") String jwt,
            @RequestBody PaymentMethod paymentMethod,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            PaymentMethod created = paymentMethodService.createPaymentMethod(targetUser.getId(), paymentMethod);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating payment method: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePaymentMethod(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestBody PaymentMethod paymentMethod,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            PaymentMethod updated = paymentMethodService.updatePaymentMethod(targetUser.getId(), id, paymentMethod);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating payment method: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePaymentMethod(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            paymentMethodService.deletePaymentMethod(targetUser.getId(), id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting payment method: " + e.getMessage());
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllUserPaymentMethods(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            paymentMethodService.deleteAllUserPaymentMethods(targetUser.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting payment methods: " + e.getMessage());
        }
    }
}