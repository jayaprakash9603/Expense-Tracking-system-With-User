package com.jaya.controller;


import com.jaya.dto.User;
import com.jaya.service.UserService;
import com.jaya.util.UserPermissionHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;

public abstract class BaseExpenseController {

    @Autowired
    protected UserService userService;

    @Autowired
    protected UserPermissionHelper permissionHelper;

    protected User getAuthenticatedUser(String jwt) throws Exception {
        return userService.findUserByJwt(jwt);
    }

    protected User getTargetUserWithPermission(String jwt, Integer targetId, boolean requireWrite) throws Exception {
        User reqUser = getAuthenticatedUser(jwt);
        return permissionHelper.getTargetUserWithPermissionCheck(targetId, reqUser, requireWrite);
    }

    protected ResponseEntity<?> handleException(Exception e) {
        if (e.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } else if (e.getMessage().contains("permission")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
