package com.jaya.controller;


import com.jaya.models.Bill;
import com.jaya.dto.BillRequestDTO;
import com.jaya.dto.BillResponseDTO;
import com.jaya.dto.ProgressStatus;
import com.jaya.models.UserDto;
import com.jaya.response.Error;
import com.jaya.service.BillService;
import com.jaya.service.FriendShipService;
import com.jaya.service.UserService;
import com.jaya.util.ServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.task.TaskExecutor;
import com.jaya.util.BulkProgressTracker;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final UserService userService;
    private final ServiceHelper helper;
    private final FriendShipService friendshipService;
    private final BulkProgressTracker progressTracker;
    private final TaskExecutor taskExecutor;


    private UserDto getTargetUserWithPermissionCheck(Integer targetId, UserDto reqUser) throws Exception {
        if (targetId == null) {
            return reqUser;
        }

        UserDto targetUser = helper.validateUser(targetId);
        if (targetUser == null) {
            throw new Exception("Target user not found");
        }

        boolean hasAccess = friendshipService.canUserModifyExpenses(targetId, reqUser.getId());

        if (!hasAccess) {
            String action = "modify";
            throw new Exception("You don't have permission to " + action + " this user's expenses");
        }

        return targetUser;
    }

    @PostMapping
    public ResponseEntity<BillResponseDTO> createBill(@RequestBody BillRequestDTO billDto, @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = userService.getuserProfile(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
    Bill bill = com.jaya.mapper.BillMapper.toEntity(billDto, targetUser.getId());
    Bill createdBill = billService.createBill(bill, targetUser.getId());
    BillResponseDTO resp = com.jaya.mapper.BillMapper.toDto(createdBill);
    return ResponseEntity.ok(resp);
    }

    // Bulk create bills (immediate, no tracking)
    @PostMapping("/add-multiple")
    public ResponseEntity<List<BillResponseDTO>> addMultipleBills(@RequestHeader("Authorization") String jwt,
                                                                  @RequestBody List<BillRequestDTO> bills,
                                                                  @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = userService.getuserProfile(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
        List<Bill> toCreate = bills.stream().map(dto -> com.jaya.mapper.BillMapper.toEntity(dto, targetUser.getId())).toList();
        List<Bill> saved = billService.addMultipleBills(toCreate, targetUser.getId());
        List<BillResponseDTO> resp = saved.stream().map(com.jaya.mapper.BillMapper::toDto).toList();
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    // Start a tracked bulk import and return a jobId
    @PostMapping("/add-multiple/tracked")
    public ResponseEntity<Map<String, String>> addMultipleBillsTracked(@RequestHeader("Authorization") String jwt,
                                                                       @RequestBody List<BillRequestDTO> bills,
                                                                       @RequestParam(required = false) Integer targetId) throws Exception {
        UserDto reqUser = userService.getuserProfile(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);

        String jobId = progressTracker.start(targetUser.getId(), bills != null ? bills.size() : 0, "Bulk bills import started");

        taskExecutor.execute(() -> {
            try {
                List<Bill> toCreate = bills == null ? java.util.Collections.emptyList() : bills.stream().map(dto -> com.jaya.mapper.BillMapper.toEntity(dto, targetUser.getId())).toList();
                List<Bill> saved = billService.addMultipleBillsWithProgress(toCreate, targetUser.getId(), jobId);
                progressTracker.complete(jobId, "Bulk bills import completed: " + (saved != null ? saved.size() : 0) + " records");
            } catch (Exception ex) {
                progressTracker.fail(jobId, ex.getMessage());
            }
        });

        Map<String, String> response = new HashMap<>();
        response.put("jobId", jobId);
        return ResponseEntity.accepted().body(response);
    }

    // Poll progress by jobId
    @GetMapping("/add-multiple/progress/{jobId}")
    public ResponseEntity<ProgressStatus> getAddMultipleBillsProgress(@PathVariable String jobId,
                                                                      @RequestHeader("Authorization") String jwt) throws Exception {
        userService.getuserProfile(jwt); // auth check
        ProgressStatus status = progressTracker.get(jobId);
        if (status == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(status);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Integer id, @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            Bill bill = billService.getByBillId(id, targetUser.getId());
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillResponseDTO> updateBill(@PathVariable Integer id, @RequestBody BillRequestDTO billDto, @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) throws Exception {

        UserDto reqUser = userService.getuserProfile(jwt);
        UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
        Bill bill = com.jaya.mapper.BillMapper.toEntity(billDto, targetUser.getId());
            bill.setId(id);
            Bill updatedBill = billService.updateBill(bill, targetUser.getId());
            BillResponseDTO resp = com.jaya.mapper.BillMapper.toDto(updatedBill);
            return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Integer id, @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            billService.deleteBill(id, targetUser.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping()
    public ResponseEntity<String> deleteAllBills( @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            String message=billService.deleteAllBillsForUser(targetUser.getId());

            return new ResponseEntity<>(message,HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<Bill> getExpenseIdByBillId( @RequestHeader("Authorization") String jwt,@PathVariable Integer expenseId, @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
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
    ) throws Exception {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
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

                System.out.print("all bills called");
                bills = billService.getAllBillsForUser(targetUser.getId());
            }
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            Error error = new Error();
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/items")
    public ResponseEntity<?> getAllUniqueItemNames(@RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userService.getuserProfile(jwt);
            UserDto targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
            java.util.List<String> resp = billService.getUserAndBackupItems(targetUser.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Error error = new Error();
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}