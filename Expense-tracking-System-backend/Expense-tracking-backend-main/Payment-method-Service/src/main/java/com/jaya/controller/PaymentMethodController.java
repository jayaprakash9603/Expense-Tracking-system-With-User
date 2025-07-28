package com.jaya.controller;

import com.jaya.dto.ErrorDetails;
import com.jaya.dto.PaymentMethodEvent;
import com.jaya.models.PaymentMethod;
import com.jaya.models.UserDto;
import com.jaya.service.FriendShipService;
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
    @Autowired
    private FriendShipService friendshipService;

    private UserDto getTargetUserWithPermissionCheck(Integer targetId, UserDto reqUser, boolean needWriteAccess) throws Exception {
        if (targetId == null) return reqUser;
        UserDto targetUser = userService.getUserProfileById(targetId);
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
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
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
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<PaymentMethod> list = paymentMethodService.getAllPaymentMethods(targetUser.getId());
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching payment methods: " + e.getMessage());
        }
    }


    @GetMapping("/get-all-payment-methods")
    public List<PaymentMethod> getAllPaymentMethodsByService(
            @RequestParam Integer userId) {


            List<PaymentMethod> list = paymentMethodService.getAllPaymentMethods(userId);
        return list;
    }

    @GetMapping("/name")
    public ResponseEntity<?> getByName(
            @RequestHeader("Authorization") String jwt,
            @RequestParam String name,
            @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            PaymentMethod paymentMethod = paymentMethodService.getByName(targetUser.getId(), name);
            return ResponseEntity.ok(paymentMethod);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching payment method: " + e.getMessage());
        }
    }

    @GetMapping("/name-and-type")
    public PaymentMethod getByNameAndType(
            @RequestParam Integer userId,
            @RequestParam String name,
            @RequestParam String type
            ) {

            return paymentMethodService.getByName(userId, name,type);

    }

    @PostMapping("/save")
    public PaymentMethod save(
            @RequestBody PaymentMethod paymentMethod
    ) {

        return paymentMethodService.save(paymentMethod);

    }

    @GetMapping("/names")
    public PaymentMethod getByNameWithService(
            @RequestParam Integer userId,
            @RequestParam String name
    ) {

        return paymentMethodService.getByName(userId, name);

    }

    @PostMapping()
    public ResponseEntity<?> createPaymentMethod(
            @RequestHeader("Authorization") String jwt,
            @RequestBody PaymentMethod paymentMethod,
            @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            PaymentMethod created = paymentMethodService.createPaymentMethod(targetUser.getId(), paymentMethod);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            ErrorDetails errorDetails = new ErrorDetails();
            errorDetails.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePaymentMethod(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String jwt,
            @RequestBody PaymentMethod paymentMethod,
            @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
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
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
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
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            paymentMethodService.deleteAllUserPaymentMethods(targetUser.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting payment methods: " + e.getMessage());
        }
    }

    // Java
    @GetMapping("/unused")
    public ResponseEntity<?> getUnusedPaymentMethods(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<PaymentMethod> unusedMethods = paymentMethodService.getOthersAndUnusedPaymentMethods(targetUser.getId() );
            return ResponseEntity.ok(unusedMethods);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching unused payment methods: " + e.getMessage());
        }
    }
}