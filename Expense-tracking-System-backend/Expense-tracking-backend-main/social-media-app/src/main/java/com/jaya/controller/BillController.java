package com.jaya.controller;

import com.jaya.models.Bill;
import com.jaya.models.User;
import com.jaya.service.BillService;
import com.jaya.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<Bill> createBill(@RequestBody Bill bill, @RequestHeader("Authorization") String jwt) {

            User reqUser = userService.findUserByJwt(jwt);
            Bill createdBill = billService.createBill(bill, reqUser.getId());
            return ResponseEntity.ok(createdBill);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Integer id, @RequestHeader("Authorization") String jwt) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            Bill bill = billService.getByBillId(id, reqUser.getId());
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bill> updateBill(@PathVariable Integer id, @RequestBody Bill bill, @RequestHeader("Authorization") String jwt) {

            User reqUser = userService.findUserByJwt(jwt);
            bill.setId(id);
            Bill updatedBill = billService.updateBill(bill, reqUser.getId());
            return ResponseEntity.ok(updatedBill);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Integer id, @RequestHeader("Authorization") String jwt) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            billService.deleteBill(id, reqUser.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping()
    public ResponseEntity<String> deleteAllBills( @RequestHeader("Authorization") String jwt) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            String message=billService.deleteAllBillsForUser(reqUser.getId());
            return new ResponseEntity<>(message,HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills(
            @RequestHeader("Authorization") String jwt,
            @RequestParam int month,
            @RequestParam int year) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            List<Bill> bills = billService.getAllBillsForUser(reqUser.getId(), month, year);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}