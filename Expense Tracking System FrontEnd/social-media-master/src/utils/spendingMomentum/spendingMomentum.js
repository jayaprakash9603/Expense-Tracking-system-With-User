import dayjs from "dayjs";

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getIsoDateKey(date) {
  return dayjs(date).format("YYYY-MM-DD");
}

// Weeks start on Monday.
export function getWeekStartMonday(date) {
  const d = dayjs(date);
  // day(): 0=Sun ... 6=Sat; shift so Monday is 0
  const diff = (d.day() + 6) % 7;
  return d.subtract(diff, "day").startOf("day");
}

function normalizeExpenseItem(raw) {
  const date = raw?.date ?? raw?.expense?.date;
  const type = raw?.type ?? raw?.expense?.type;
  const amount = raw?.amount ?? raw?.expense?.amount;
  return {
    date: date ? dayjs(date) : null,
    type: type ?? null,
    amount: safeNumber(amount),
  };
}

function hashToIndex(seed, length) {
  if (!length) return 0;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % length;
}

function pickVariant(variants, seed) {
  if (!Array.isArray(variants) || variants.length === 0) return "";
  return variants[hashToIndex(seed, variants.length)];
}

const MESSAGES = {
  early: [
    "Collecting data for your spending trend…",
    "Too early to judge spending speed this week.",
    "Warming up the trend engine — check back soon.",
    "Need a bit more week data to read the pace.",
    "Early week signal is still forming.",
    "Trend is loading — not enough points yet.",
    "We’re still gathering this week’s spending pattern.",
    "Low confidence right now — give it another day.",
    "Not enough week progress to call the speed yet.",
    "Spending momentum is still settling in.",
    "Hold on — this week’s pace isn’t clear yet.",
    "Momentum check: still too soon.",
    "Trend isn’t stable yet — more data needed.",
    "Early week: waiting for a stronger signal.",
    "Let’s see a few more days before judging pace.",
    "Spending speed: calibrating…",
    "Current week is young — momentum is uncertain.",
    "Small sample so far — trend will sharpen soon.",
    "Not enough activity days to assess momentum.",
    "We’ll show a clearer trend after midweek.",
    "Gathering signals…",
    "Still building confidence in this week’s pace.",
    "Early-week check: trend not ready.",
    "Trend forming — come back tomorrow.",
    "Momentum needs more days of data.",
  ],
  strongAccel: [
    "Expenses are accelerating.",
    "Spending is picking up fast.",
    "Your spending pace is rising sharply.",
    "This week’s outflow is speeding up.",
    "Spending momentum is trending higher.",
    "Careful — spending speed jumped.",
    "Your weekly spend is climbing quickly.",
    "Spending is ramping up.",
    "This week looks costlier so far.",
    "Your outflow velocity increased.",
    "Spending is moving faster than last week.",
    "Watch out — expenses are gaining speed.",
    "This week’s spending is accelerating.",
    "Spending pace is running hot.",
    "Spending speed increased notably.",
    "Your expenses are trending up.",
    "Higher spend velocity detected.",
    "This week’s spending growth is strong.",
    "Spending is climbing — stay alert.",
    "Your spending speed is up.",
  ],
  mildIncrease: [
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
    "Spending momentum nudged up.",
  ],
  strongImprove: [
    "Strong improvement in spending control.",
    "Great discipline this week.",
    "You slowed spending significantly.",
    "Spending momentum improved a lot.",
    "This week’s spending pace dropped sharply.",
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
    "You’re cutting spending fast.",
    "Solid discipline — strong slowdown.",
  ],
  normalImprove: [
    "Nice — you spent less than last week.",
    "You slowed down spending this week.",
    "Good progress — spending pace is lower.",
    "Weekly spending speed is down.",
    "Spending momentum is improving.",
    "You’re easing off spending.",
    "Spending pace is trending better.",
    "Good job keeping expenses lower.",
    "Your outflow velocity dropped.",
    "Spending is cooling down.",
    "Positive trend — spending slowed.",
    "This week is shaping up better.",
    "Steadier control — spending reduced.",
    "Small win — you’re spending less.",
    "Nice work — spending pace improved.",
  ],
  stable: [
    "Spending pace is steady.",
    "No major change in spending speed.",
    "Spending momentum looks stable.",
    "Weekly pace is roughly unchanged.",
    "You’re holding a consistent spend speed.",
    "Spending speed is steady so far.",
    "Trend is flat — pace unchanged.",
    "Spending velocity is stable.",
    "No big shift in weekly spending pace.",
    "Spending momentum is neutral.",
    "Steady week so far.",
    "Spending pace: no meaningful change.",
    "Your weekly spending speed is consistent.",
    "Momentum is balanced — staying level.",
    "Pace looks steady compared to last week.",
  ],
  predictiveOver: [
    "This week is shaping up costlier than last.",
    "You’re on track to overspend this week.",
    "Current pace suggests a higher-spend week.",
    "If this pace holds, this week will be costlier.",
    "Trend points to a heavier spending week.",
    "Week-end outlook: spending is trending higher.",
    "You may finish the week above last week.",
    "Forecast: higher weekly spend at this pace.",
    "End-of-week signal: overspending risk.",
    "This week likely ends higher than last.",
  ],
  predictiveGood: [
    "Good pace — this week looks better than last.",
    "You’re on track to spend less this week.",
    "Current pace suggests an improved week.",
    "If this pace holds, this week will be lighter.",
    "Trend points to a better week for expenses.",
    "Week-end outlook: spending is trending lower.",
    "You may finish the week below last week.",
    "Forecast: lower weekly spend at this pace.",
    "End-of-week signal: improving control.",
    "This week likely ends better than last.",
  ],
  noData: [
    "No spending data yet to measure momentum.",
    "Not enough spending records to compute momentum.",
    "Momentum needs spending data to get started.",
    "No loss entries found for the last two weeks.",
    "Add a few expenses to unlock momentum insights.",
  ],
};

export function computeSpendingMomentum({
  items,
  now = dayjs(),
  minPredictiveAbsPercent = 10,
} = {}) {
  const normalized = Array.isArray(items)
    ? items.map(normalizeExpenseItem).filter((x) => x.date)
    : [];

  const weekStart = getWeekStartMonday(now);
  const weekEnd = weekStart.add(6, "day").endOf("day");
  const prevWeekStart = weekStart.subtract(7, "day");
  const prevWeekEnd = prevWeekStart.add(6, "day").endOf("day");

  const weekStartMs = weekStart.valueOf();
  const weekEndMs = weekEnd.valueOf();
  const prevWeekStartMs = prevWeekStart.valueOf();
  const prevWeekEndMs = prevWeekEnd.valueOf();

  let currentWeekSpend = 0;
  let previousWeekSpend = 0;
  const currentWeekSpendDays = new Set();

  for (const raw of normalized) {
    if (raw.type !== "loss") continue;
    const amt = safeNumber(raw.amount);
    if (!amt) continue;

    const ts = raw.date.valueOf();

    if (ts >= weekStartMs && ts <= weekEndMs) {
      currentWeekSpend += amt;
      currentWeekSpendDays.add(getIsoDateKey(raw.date));
    } else if (ts >= prevWeekStartMs && ts <= prevWeekEndMs) {
      previousWeekSpend += amt;
    }
  }

  const dow = now.day(); // 0..6
  const isMonOrTue = dow === 1 || dow === 2;
  const hasFewDataDays = currentWeekSpendDays.size < 3;
  const isEarlyWeek = isMonOrTue || hasFewDataDays;

  const canCompute = previousWeekSpend > 0;
  const percentChange = canCompute
    ? ((currentWeekSpend - previousWeekSpend) / previousWeekSpend) * 100
    : null;

  const isFriSatSun = dow === 5 || dow === 6 || dow === 0;
  const isPredictive =
    !isEarlyWeek &&
    isFriSatSun &&
    percentChange !== null &&
    Math.abs(percentChange) >= minPredictiveAbsPercent;

  return {
    now: dayjs(now),
    currentWeekSpend,
    previousWeekSpend,
    percentChange,
    currentWeekDataDays: currentWeekSpendDays.size,
    isEarlyWeek,
    isPredictive,
  };
}

export function getSpendingMomentumInsight({
  items,
  now = dayjs(),
  minPredictiveAbsPercent = 10,
} = {}) {
  const result = computeSpendingMomentum({
    items,
    now,
    minPredictiveAbsPercent,
  });
  const pct = result.percentChange;

  if (result.isEarlyWeek) {
    const seed = `${getIsoDateKey(result.now)}-early-${
      result.currentWeekDataDays
    }`;
    return {
      category: "early",
      tone: "neutral",
      icon: "dot",
      percentChange: pct,
      message: pickVariant(MESSAGES.early, seed),
      key: seed,
    };
  }

  if (pct === null) {
    const seed = `${getIsoDateKey(result.now)}-nodata`;
    return {
      category: "noData",
      tone: "neutral",
      icon: "dot",
      percentChange: pct,
      message: pickVariant(MESSAGES.noData, seed),
      key: seed,
    };
  }

  const rounded = Math.round(pct);

  if (result.isPredictive) {
    const isOver = pct > 0;
    const seed = `${getIsoDateKey(result.now)}-pred-${rounded}`;
    return {
      category: isOver ? "predictiveOver" : "predictiveGood",
      tone: isOver ? "bad" : "good",
      icon: isOver ? "up" : "down",
      percentChange: pct,
      message: pickVariant(
        isOver ? MESSAGES.predictiveOver : MESSAGES.predictiveGood,
        seed
      ),
      key: seed,
    };
  }

  if (pct > 15) {
    const seed = `${getIsoDateKey(result.now)}-accel-${rounded}`;
    return {
      category: "strongAccel",
      tone: "bad",
      icon: "up",
      percentChange: pct,
      message: `${pickVariant(MESSAGES.strongAccel, seed)} (+${rounded}%)`,
      key: seed,
    };
  }

  if (pct >= 5 && pct <= 15) {
    const seed = `${getIsoDateKey(result.now)}-mild-${rounded}`;
    return {
      category: "mildIncrease",
      tone: "warn",
      icon: "up",
      percentChange: pct,
      message: `${pickVariant(MESSAGES.mildIncrease, seed)} (+${rounded}%)`,
      key: seed,
    };
  }

  if (pct <= -15) {
    const seed = `${getIsoDateKey(result.now)}-stronggood-${rounded}`;
    return {
      category: "strongImprove",
      tone: "good",
      icon: "down",
      percentChange: pct,
      message: `${pickVariant(MESSAGES.strongImprove, seed)} (${rounded}%)`,
      key: seed,
    };
  }

  if (pct <= -5 && pct > -15) {
    const seed = `${getIsoDateKey(result.now)}-good-${rounded}`;
    return {
      category: "normalImprove",
      tone: "good",
      icon: "down",
      percentChange: pct,
      message: `${pickVariant(MESSAGES.normalImprove, seed)} (${rounded}%)`,
      key: seed,
    };
  }

  if (pct >= -3 && pct <= 3) {
    const seed = `${getIsoDateKey(result.now)}-stable-${rounded}`;
    return {
      category: "stable",
      tone: "neutral",
      icon: "line",
      percentChange: pct,
      message: pickVariant(MESSAGES.stable, seed),
      key: seed,
    };
  }

  // Small change outside stable band (e.g., +4% or -4%) -> keep neutral but informative.
  const seed = `${getIsoDateKey(result.now)}-minor-${rounded}`;
  const direction = pct > 0 ? "up" : "down";
  return {
    category: "stable",
    tone: "neutral",
    icon: direction === "up" ? "up" : "down",
    percentChange: pct,
    message: `Spending pace shifted slightly (${rounded}%).`,
    key: seed,
  };
}
