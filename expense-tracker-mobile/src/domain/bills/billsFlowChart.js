function padDatePart(n) {
  return String(n).padStart(2, "0");
}

export function toDateKeyParts(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const slice = dateStr.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slice)) return null;
  const [y, m, d] = slice.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}

export function isDateInFlowRange(dateStr, rangeStart, rangeEnd) {
  const key = dateStr && String(dateStr).slice(0, 10);
  if (!key || !rangeStart || !rangeEnd) return false;
  return key >= rangeStart && key <= rangeEnd;
}

export function getFlowRangeBounds(activeRange, offset) {
  const now = new Date();
  const fmt = (d) => {
    const y = d.getFullYear();
    const m = padDatePart(d.getMonth() + 1);
    const day = padDatePart(d.getDate());
    return `${y}-${m}-${day}`;
  };

  if (activeRange === "month") {
    const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { rangeStart: fmt(start), rangeEnd: fmt(end) };
  }

  if (activeRange === "year") {
    const y = now.getFullYear() + offset;
    return { rangeStart: `${y}-01-01`, rangeEnd: `${y}-12-31` };
  }

  const base = new Date(now);
  base.setDate(now.getDate() + offset * 7);
  const dow = base.getDay();
  const start = new Date(base);
  start.setDate(base.getDate() - dow);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { rangeStart: fmt(start), rangeEnd: fmt(end) };
}

export function buildBillChartRows(bills, activeRange, flowTab, rangeStart) {
  const flowIncome = (b) => {
    let income = 0;
    let expense = 0;
    const amt = Math.abs(Number(b.amount) || 0);
    if (b.flowType === "gain") income += amt;
    else expense += amt;
    if (flowTab === "inflow") return { income, expense: 0 };
    if (flowTab === "outflow") return { income: 0, expense };
    return { income, expense };
  };

  const startParts = toDateKeyParts(rangeStart);
  if (!startParts) return [];

  if (activeRange === "month") {
    const { y, m } = startParts;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const rows = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const label = String(day);
      let income = 0;
      let expense = 0;
      bills.forEach((b) => {
        const p = toDateKeyParts(b.date);
        if (!p || p.y !== y || p.m !== m || p.d !== day) return;
        const v = flowIncome(b);
        income += v.income;
        expense += v.expense;
      });
      rows.push({ label, income, expense });
    }
    return rows;
  }

  if (activeRange === "year") {
    const y = startParts.y;
    const rows = [];
    for (let month = 0; month < 12; month += 1) {
      const label = String(month + 1);
      let income = 0;
      let expense = 0;
      bills.forEach((b) => {
        const p = toDateKeyParts(b.date);
        if (!p || p.y !== y || p.m !== month) return;
        const v = flowIncome(b);
        income += v.income;
        expense += v.expense;
      });
      rows.push({ label, income, expense });
    }
    return rows;
  }

  const p0 = toDateKeyParts(rangeStart);
  if (!p0) return [];
  const startSunday = new Date(p0.y, p0.m, p0.d);
  const rows = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(startSunday);
    d.setDate(startSunday.getDate() + i);
    const label = ["S", "M", "T", "W", "T", "F", "S"][i] || String(i + 1);
    let income = 0;
    let expense = 0;
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    bills.forEach((b) => {
      const p = toDateKeyParts(b.date);
      if (!p || p.y !== y || p.m !== m || p.d !== day) return;
      const v = flowIncome(b);
      income += v.income;
      expense += v.expense;
    });
    rows.push({ label, income, expense });
  }
  return rows;
}
