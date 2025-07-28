package com.jaya.controller;

import com.jaya.dto.User;
import com.jaya.models.EmailLog;
import com.jaya.service.EmailLogService;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/email-logs")
public class EmailLogController {

    @Autowired
    private EmailLogService emailLogService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<EmailLog> getAllEmailLogs(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getAllEmailLogs(reqUser);
    }

    @GetMapping("/current-month")
    public List<EmailLog> getLogsForCurrentMonth(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForCurrentMonth(reqUser);
    }

    @GetMapping("/last-month")
    public List<EmailLog> getLogsForLastMonth(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForLastMonth(reqUser);
    }

    @GetMapping("/current-year")
    public List<EmailLog> getLogsForCurrentYear(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForCurrentYear(reqUser);
    }

    @GetMapping("/last-year")
    public List<EmailLog> getLogsForLastYear(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForLastYear(reqUser);
    }

    @GetMapping("/current-week")
    public List<EmailLog> getLogsForCurrentWeek(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForCurrentWeek(reqUser);
    }

    @GetMapping("/last-week")
    public List<EmailLog> getLogsForLastWeek(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForLastWeek(reqUser);
    }

    @GetMapping("/today")
    public List<EmailLog> getLogsForToday(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForToday(reqUser);
    }

    @GetMapping("/year/{year}")
    public List<EmailLog> getLogsForSpecificYear(@PathVariable int year,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForSpecificYear(year,reqUser);
    }

    @GetMapping("/month/{year}/{month}")
    public List<EmailLog> getLogsForSpecificMonth(@PathVariable int year, @PathVariable int month,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForSpecificMonth(year, month,reqUser);
    }

    @GetMapping("/day/{year}/{month}/{day}")
    public List<EmailLog> getLogsForSpecificDay(@PathVariable int year, @PathVariable int month, @PathVariable int day,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsForSpecificDay(year, month, day,reqUser);
    }

    @GetMapping("/last-minutes/{minutes}")
    public List<EmailLog> getLogsFromLastNMinutes(@PathVariable int minutes,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsFromLastNMinutes(minutes,reqUser);
    }

    @GetMapping("/last-hours/{hours}")
    public List<EmailLog> getLogsFromLastNHours(@PathVariable int hours,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsFromLastNHours(hours,reqUser);
    }

    @GetMapping("/last-days/{days}")
    public List<EmailLog> getLogsFromLastNDays(@PathVariable int days,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsFromLastNDays(days,reqUser);
    }

    @GetMapping("/last-seconds/{seconds}")
    public List<EmailLog> getLogsFromLastNSeconds(@PathVariable int seconds,@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsFromLastNSeconds(seconds,reqUser);
    }

    @GetMapping("/last-5-minutes")
    public List<EmailLog> getLogsFromLast5Minutes(@RequestHeader("Authorization")String jwt) {
        User reqUser=userService.findUserByJwt(jwt);
        return emailLogService.getLogsFromLast5Minutes(reqUser);
    }
}