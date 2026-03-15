package com.jaya.controller;

import com.jaya.common.dto.UserDTO;
import com.jaya.models.MomentumInsight;
import com.jaya.service.MomentumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class MomentumController extends BaseExpenseController {

    @Autowired
    private MomentumService momentumService;

    @GetMapping("/momentum-insight")
    public ResponseEntity<Map<String, Object>> getMomentumInsight(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        UserDTO targetUser = getTargetUserWithPermission(jwt, targetId, false);

        MomentumInsight insight = momentumService.getMomentumInsight(targetUser.getId(), LocalDate.now());

        Map<String, Object> response = new HashMap<>();
        response.put("category", insight.getCategory());
        response.put("tone", insight.getTone());
        response.put("icon", insight.getIcon());
        response.put("percentChange", insight.getPercentChange());
        response.put("message", insight.getMessage());
        response.put("key", insight.getInsightKey());

        return ResponseEntity.ok(response);
    }
}
