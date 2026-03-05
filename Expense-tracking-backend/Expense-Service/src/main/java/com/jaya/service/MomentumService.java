package com.jaya.service;

import com.jaya.models.Expense;
import com.jaya.models.MomentumInsight;
import com.jaya.repository.ExpenseRepository;
import com.jaya.repository.MomentumInsightRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class MomentumService {

    private final MomentumInsightRepository insightRepository;
    private final ExpenseRepository expenseRepository;

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    // ── Message variants (ported from spendingMomentum.js) ──

    private static final Map<String, List<String>> MESSAGES = new LinkedHashMap<>();

    static {
        MESSAGES.put("early", Arrays.asList(
                "Collecting data for your spending trend…",
                "Too early to judge spending speed this week.",
                "Warming up the trend engine — check back soon.",
                "Need a bit more week data to read the pace.",
                "Early week signal is still forming.",
                "Trend is loading — not enough points yet.",
                "We're still gathering this week's spending pattern.",
                "Low confidence right now — give it another day.",
                "Not enough week progress to call the speed yet.",
                "Spending momentum is still settling in.",
                "Hold on — this week's pace isn't clear yet.",
                "Momentum check: still too soon.",
                "Trend isn't stable yet — more data needed.",
                "Early week: waiting for a stronger signal.",
                "Let's see a few more days before judging pace.",
                "Spending speed: calibrating…",
                "Current week is young — momentum is uncertain.",
                "Small sample so far — trend will sharpen soon.",
                "Not enough activity days to assess momentum.",
                "We'll show a clearer trend after midweek.",
                "Gathering signals…",
                "Still building confidence in this week's pace.",
                "Early-week check: trend not ready.",
                "Trend forming — come back tomorrow.",
                "Momentum needs more days of data."));

        MESSAGES.put("strongAccel", Arrays.asList(
                "Expenses are accelerating.",
                "Spending is picking up fast.",
                "Your spending pace is rising sharply.",
                "This week's outflow is speeding up.",
                "Spending momentum is trending higher.",
                "Careful — spending speed jumped.",
                "Your weekly spend is climbing quickly.",
                "Spending is ramping up.",
                "This week looks costlier so far.",
                "Your outflow velocity increased.",
                "Spending is moving faster than last week.",
                "Watch out — expenses are gaining speed.",
                "This week's spending is accelerating.",
                "Spending pace is running hot.",
                "Spending speed increased notably.",
                "Your expenses are trending up.",
                "Higher spend velocity detected.",
                "This week's spending growth is strong.",
                "Spending is climbing — stay alert.",
                "Your spending speed is up."));

        MESSAGES.put("mildIncrease", Arrays.asList(
                "Slight uptick in spending this week.",
                "Spending is creeping up.",
                "Your spend pace increased a bit.",
                "This week is trending slightly higher.",
                "A small rise in spending speed.",
                "Spending momentum is mildly up.",
                "Your weekly outflow is edging higher.",
                "Spending pace is a little faster.",
                "Minor increase in spend velocity.",
                "Spending is drifting upward.",
                "This week looks a touch costlier.",
                "Your spending speed ticked up.",
                "Spending is inching higher.",
                "A gentle rise in spending pace.",
                "Spending momentum nudged up."));

        MESSAGES.put("strongImprove", Arrays.asList(
                "Strong improvement in spending control.",
                "Great discipline this week.",
                "You slowed spending significantly.",
                "Spending momentum improved a lot.",
                "This week's spending pace dropped sharply.",
                "Big slowdown — nice work.",
                "Your expenses cooled down strongly.",
                "Spending speed reduced a lot.",
                "Excellent control — spending decelerated.",
                "Strong pullback in spending.",
                "Your spend velocity fell sharply.",
                "Spending pace improved dramatically.",
                "Great restraint — spending slowed.",
                "Your weekly outflow dropped strongly.",
                "Major improvement in spending speed.",
                "Expenses are slowing down a lot.",
                "Big week-over-week improvement.",
                "Strong deceleration detected.",
                "You're cutting spending fast.",
                "Solid discipline — strong slowdown."));

        MESSAGES.put("normalImprove", Arrays.asList(
                "Nice — you spent less than last week.",
                "You slowed down spending this week.",
                "Good progress — spending pace is lower.",
                "Weekly spending speed is down.",
                "Spending momentum is improving.",
                "You're easing off spending.",
                "Spending pace is trending better.",
                "Good job keeping expenses lower.",
                "Your outflow velocity dropped.",
                "Spending is cooling down.",
                "Positive trend — spending slowed.",
                "This week is shaping up better.",
                "Steadier control — spending reduced.",
                "Small win — you're spending less.",
                "Nice work — spending pace improved."));

        MESSAGES.put("stable", Arrays.asList(
                "Spending pace is steady.",
                "No major change in spending speed.",
                "Spending momentum looks stable.",
                "Weekly pace is roughly unchanged.",
                "You're holding a consistent spend speed.",
                "Spending speed is steady so far.",
                "Trend is flat — pace unchanged.",
                "Spending velocity is stable.",
                "No big shift in weekly spending pace.",
                "Spending momentum is neutral.",
                "Steady week so far.",
                "Spending pace: no meaningful change.",
                "Your weekly spending speed is consistent.",
                "Momentum is balanced — staying level.",
                "Pace looks steady compared to last week."));

        MESSAGES.put("predictiveOver", Arrays.asList(
                "This week is shaping up costlier than last.",
                "You're on track to overspend this week.",
                "Current pace suggests a higher-spend week.",
                "If this pace holds, this week will be costlier.",
                "Trend points to a heavier spending week.",
                "Week-end outlook: spending is trending higher.",
                "You may finish the week above last week.",
                "Forecast: higher weekly spend at this pace.",
                "End-of-week signal: overspending risk.",
                "This week likely ends higher than last."));

        MESSAGES.put("predictiveGood", Arrays.asList(
                "Good pace — this week looks better than last.",
                "You're on track to spend less this week.",
                "Current pace suggests an improved week.",
                "If this pace holds, this week will be lighter.",
                "Trend points to a better week for expenses.",
                "Week-end outlook: spending is trending lower.",
                "You may finish the week below last week.",
                "Forecast: lower weekly spend at this pace.",
                "End-of-week signal: improving control.",
                "This week likely ends better than last."));

        MESSAGES.put("noData", Arrays.asList(
                "No spending data yet to measure momentum.",
                "Not enough spending records to compute momentum.",
                "Momentum needs spending data to get started.",
                "No loss entries found for the last two weeks.",
                "Add a few expenses to unlock momentum insights."));
    }

    public MomentumService(MomentumInsightRepository insightRepository, ExpenseRepository expenseRepository) {
        this.insightRepository = insightRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Returns cached insight for today if fresh, otherwise computes on-the-fly.
     */
    public MomentumInsight getMomentumInsight(Integer userId, LocalDate date) {
        Optional<MomentumInsight> cached = insightRepository.findByUserIdAndComputedDate(userId, date);
        if (cached.isPresent()) {
            return cached.get();
        }
        return computeAndCacheMomentumInsight(userId, date);
    }

    /**
     * Computes spending momentum and caches the result.
     */
    @Transactional
    public MomentumInsight computeAndCacheMomentumInsight(Integer userId, LocalDate date) {
        LocalDate from = date.minusDays(20);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(userId, from, date);

        MomentumInsight insight = computeInsight(expenses, date);
        insight.setUserId(userId);
        insight.setComputedDate(date);

        Optional<MomentumInsight> existing = insightRepository.findByUserIdAndComputedDate(userId, date);
        if (existing.isPresent()) {
            MomentumInsight toUpdate = existing.get();
            toUpdate.setCategory(insight.getCategory());
            toUpdate.setTone(insight.getTone());
            toUpdate.setIcon(insight.getIcon());
            toUpdate.setPercentChange(insight.getPercentChange());
            toUpdate.setMessage(insight.getMessage());
            toUpdate.setInsightKey(insight.getInsightKey());
            toUpdate.setCurrentWeekSpend(insight.getCurrentWeekSpend());
            toUpdate.setPreviousWeekSpend(insight.getPreviousWeekSpend());
            toUpdate.setCurrentWeekDataDays(insight.getCurrentWeekDataDays());
            return insightRepository.save(toUpdate);
        }

        return insightRepository.save(insight);
    }

    /**
     * Invalidates (recomputes) the insight for the given user for today. Runs async.
     */
    @Async
    @Transactional
    public void invalidateAndRecompute(Integer userId) {
        try {
            computeAndCacheMomentumInsight(userId, LocalDate.now());
            log.debug("Recomputed momentum insight for user {}", userId);
        } catch (Exception e) {
            log.warn("Failed to recompute momentum insight for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Batch computation for cron job — processes all user IDs with expenses.
     */
    @Transactional
    public void computeForAllUsers(LocalDate date) {
        List<Integer> userIds = expenseRepository.findDistinctUserIds();
        log.info("Computing momentum insights for {} users", userIds.size());
        for (Integer uid : userIds) {
            try {
                computeAndCacheMomentumInsight(uid, date);
            } catch (Exception e) {
                log.warn("Failed to compute momentum for user {}: {}", uid, e.getMessage());
            }
        }
    }

    /**
     * Cleans up insights older than the specified date.
     */
    @Transactional
    public void cleanupOldInsights(LocalDate olderThan) {
        int deleted = insightRepository.deleteByComputedDateBefore(olderThan);
        log.info("Cleaned up {} old momentum insights", deleted);
    }

    // ── Core computation logic (ported from spendingMomentum.js) ──

    private MomentumInsight computeInsight(List<Expense> expenses, LocalDate now) {
        LocalDate weekStart = getWeekStartMonday(now);
        LocalDate weekEnd = weekStart.plusDays(6);
        LocalDate prevWeekStart = weekStart.minusDays(7);
        LocalDate prevWeekEnd = prevWeekStart.plusDays(6);

        double currentWeekSpend = 0;
        double previousWeekSpend = 0;
        Set<LocalDate> currentWeekSpendDays = new HashSet<>();

        for (Expense exp : expenses) {
            if (exp.getExpense() == null) continue;
            String type = exp.getExpense().getType();
            if (!"loss".equals(type)) continue;

            double amt = exp.getExpense().getAmount();
            if (amt == 0) continue;
            LocalDate d = exp.getDate();
            if (d == null) continue;

            if (!d.isBefore(weekStart) && !d.isAfter(weekEnd)) {
                currentWeekSpend += amt;
                currentWeekSpendDays.add(d);
            } else if (!d.isBefore(prevWeekStart) && !d.isAfter(prevWeekEnd)) {
                previousWeekSpend += amt;
            }
        }

        DayOfWeek dow = now.getDayOfWeek();
        boolean isMonOrTue = dow == DayOfWeek.MONDAY || dow == DayOfWeek.TUESDAY;
        boolean hasFewDataDays = currentWeekSpendDays.size() < 3;
        boolean isEarlyWeek = isMonOrTue || hasFewDataDays;

        boolean canCompute = previousWeekSpend > 0;
        Double percentChange = canCompute
                ? ((currentWeekSpend - previousWeekSpend) / previousWeekSpend) * 100
                : null;

        boolean isFriSatSun = dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
        boolean isPredictive = !isEarlyWeek && isFriSatSun && percentChange != null
                && Math.abs(percentChange) >= 10;

        int dataDays = currentWeekSpendDays.size();
        String dateKey = now.format(ISO_DATE);

        return categorize(dateKey, percentChange, isEarlyWeek, isPredictive, dataDays,
                currentWeekSpend, previousWeekSpend);
    }

    private MomentumInsight categorize(String dateKey, Double pct, boolean isEarlyWeek,
            boolean isPredictive, int dataDays,
            double currentWeekSpend, double previousWeekSpend) {

        MomentumInsight.MomentumInsightBuilder b = MomentumInsight.builder()
                .currentWeekSpend(currentWeekSpend)
                .previousWeekSpend(previousWeekSpend)
                .currentWeekDataDays(dataDays)
                .updatedAt(LocalDateTime.now());

        if (isEarlyWeek) {
            String seed = dateKey + "-early-" + dataDays;
            return b.category("early").tone("neutral").icon("dot")
                    .percentChange(pct)
                    .message(pickVariant(MESSAGES.get("early"), seed))
                    .insightKey(seed).build();
        }

        if (pct == null) {
            String seed = dateKey + "-nodata";
            return b.category("noData").tone("neutral").icon("dot")
                    .percentChange(null)
                    .message(pickVariant(MESSAGES.get("noData"), seed))
                    .insightKey(seed).build();
        }

        long rounded = Math.round(pct);

        if (isPredictive) {
            boolean isOver = pct > 0;
            String seed = dateKey + "-pred-" + rounded;
            String cat = isOver ? "predictiveOver" : "predictiveGood";
            return b.category(cat)
                    .tone(isOver ? "bad" : "good")
                    .icon(isOver ? "up" : "down")
                    .percentChange(pct)
                    .message(pickVariant(MESSAGES.get(cat), seed))
                    .insightKey(seed).build();
        }

        if (pct > 15) {
            String seed = dateKey + "-accel-" + rounded;
            return b.category("strongAccel").tone("bad").icon("up")
                    .percentChange(pct)
                    .message(pickVariant(MESSAGES.get("strongAccel"), seed) + " (+" + rounded + "%)")
                    .insightKey(seed).build();
        }

        if (pct >= 5 && pct <= 15) {
            String seed = dateKey + "-mild-" + rounded;
            return b.category("mildIncrease").tone("warn").icon("up")
                    .percentChange(pct)
                    .message(pickVariant(MESSAGES.get("mildIncrease"), seed) + " (+" + rounded + "%)")
                    .insightKey(seed).build();
        }

        if (pct <= -15) {
            String seed = dateKey + "-stronggood-" + rounded;
            return b.category("strongImprove").tone("good").icon("down")
                    .percentChange(pct)
                    .message(pickVariant(MESSAGES.get("strongImprove"), seed) + " (" + rounded + "%)")
                    .insightKey(seed).build();
        }

        if (pct <= -5 && pct > -15) {
            String seed = dateKey + "-good-" + rounded;
            return b.category("normalImprove").tone("good").icon("down")
                    .percentChange(pct)
                    .message(pickVariant(MESSAGES.get("normalImprove"), seed) + " (" + rounded + "%)")
                    .insightKey(seed).build();
        }

        if (pct >= -3 && pct <= 3) {
            String seed = dateKey + "-stable-" + rounded;
            return b.category("stable").tone("neutral").icon("line")
                    .percentChange(pct)
                    .message(pickVariant(MESSAGES.get("stable"), seed))
                    .insightKey(seed).build();
        }

        // Small change outside stable band (e.g. +4% or -4%)
        String seed = dateKey + "-minor-" + rounded;
        String direction = pct > 0 ? "up" : "down";
        return b.category("stable").tone("neutral").icon(direction)
                .percentChange(pct)
                .message("Spending pace shifted slightly (" + rounded + "%).")
                .insightKey(seed).build();
    }

    // ── Deterministic hash-based variant picker (ported from JS) ──

    private static String pickVariant(List<String> variants, String seed) {
        if (variants == null || variants.isEmpty()) return "";
        return variants.get(hashToIndex(seed, variants.size()));
    }

    private static int hashToIndex(String seed, int length) {
        if (length == 0) return 0;
        int hash = 0x811c9dc5; // 2166136261 as signed 32-bit
        for (int i = 0; i < seed.length(); i++) {
            hash ^= seed.charAt(i);
            hash *= 16777619;
        }
        return Math.abs(hash) % length;
    }

    private static LocalDate getWeekStartMonday(LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue(); // 1=Mon ... 7=Sun
        return date.minusDays(dayOfWeek - 1);
    }
}
