package com.jaya.controller;

import com.jaya.exceptions.UserException;
import com.jaya.models.Bill;
import com.jaya.models.User;
import com.jaya.response.Error;
import com.jaya.service.BillService;
import com.jaya.service.FriendshipService;
import com.jaya.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final UserService userService;
    private final FriendshipService friendshipService;


    private User getTargetUserWithPermissionCheck(Integer targetId, User reqUser) throws UserException {
        if (targetId == null) {
            return reqUser;
        }

        User targetUser = userService.findUserById(targetId);
        if (targetUser == null) {
            throw new UserException("Target user not found");
        }

        boolean hasAccess = true ?
                friendshipService.canUserModifyExpenses(targetId, reqUser.getId()) :
                friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

        if (!hasAccess) {
            String action = true ? "modify" : "access";
            throw new UserException("You don't have permission to " + action + " this user's expenses");
        }

        return targetUser;
    }
    @PostMapping
    public ResponseEntity<Bill> createBill(@RequestBody Bill bill, @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) throws UserException {

            User reqUser = userService.findUserByJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            Bill createdBill = billService.createBill(bill, targetUser.getId());
            return ResponseEntity.ok(createdBill);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Integer id, @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            Bill bill = billService.getByBillId(id, targetUser.getId());
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bill> updateBill(@PathVariable Integer id, @RequestBody Bill bill, @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) throws UserException {

            User reqUser = userService.findUserByJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            bill.setId(id);
            Bill updatedBill = billService.updateBill(bill, targetUser.getId());
            return ResponseEntity.ok(updatedBill);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Integer id, @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            billService.deleteBill(id, targetUser.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping()
    public ResponseEntity<String> deleteAllBills( @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            String message=billService.deleteAllBillsForUser(targetUser.getId());

            return new ResponseEntity<>(message,HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<Bill> getExpenseIdByBillId( @RequestHeader("Authorization") String jwt,@PathVariable Integer expenseId, @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            Bill bill=billService.getBillIdByExpenseId( targetUser.getId(),expenseId);
            return new ResponseEntity<>(bill,HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }



    @GetMapping
    public ResponseEntity<?> getAllBills(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String range,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false)LocalDate expenseDate
            ,@RequestParam(required = false) Integer targetId
    ) throws UserException {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            List<Bill> bills;


            if (range != null && offset != null) {
                bills = billService.getAllBillsForUser(targetUser.getId(), range, offset);
            } else if (month != null && year != null && offset != null) {
                bills = billService.getAllBillsForUser(targetUser.getId(), month, year, offset);
            } else if (month != null && year != null) {
                bills = billService.getAllBillsForUser(targetUser.getId(), month, year);
            }
            else if(expenseDate!=null)
            {
                return ResponseEntity.ok(billService.getAllExpensesForBill(targetUser.getId(), expenseDate, expenseDate));
            }
            else if(date!=null){
                bills = billService.getBillsWithinRange(targetUser.getId(), date,date);
            }else if (startDate != null && endDate != null) {
                bills = billService.getBillsWithinRange(targetUser.getId(), startDate, endDate);
            } else {
                bills = billService.getAllBillsForUser(targetUser.getId());
            }
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            Error error = new Error();
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}