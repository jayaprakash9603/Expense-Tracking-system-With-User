import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { formatAmount as fmt } from "../../utils/formatAmount";

const normalizeName = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const isLossExpense = (expense) => {
  const type = String(expense?.type ?? "").toLowerCase();
  if (type === "loss") return true;
  if (type === "gain" || type === "profit") return false;
  const amount = Number(expense?.amount);
  return Number.isFinite(amount) ? amount < 0 : false;
};

export default function TopRecurringExpensesCard({
  budgets,
  items,
  title,
  subtitle,
  layout,
}) {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  const topRecurringExpenses = useMemo(() => {
    if (Array.isArray(items)) {
      return items
        .filter((x) => x && x.name)
        .map((x) => ({
          key: normalizeName(x.name),
          name: String(x.name).trim(),
          txCount: Number(x.txCount ?? x.transactions ?? 0) || 0,
          totalAmount: Number(x.totalAmount ?? x.amount ?? 0) || 0,
        }))
        .slice(0, 5);
    }

    const byName = new Map();

    for (const budget of budgets || []) {
      const expenses = budget?.expenses || [];
      for (const expense of expenses) {
        if (!isLossExpense(expense)) continue;

        const rawName = expense?.name;
        const key = normalizeName(rawName);
        if (!key) continue;

        const rawAmount = Number(expense?.amount);
        const absAmount = Number.isFinite(rawAmount) ? Math.abs(rawAmount) : 0;

        const existing = byName.get(key);
        if (existing) {
          existing.txCount += 1;
          existing.totalAmount += absAmount;
        } else {
          byName.set(key, {
            key,
            name: String(rawName).trim(),
            txCount: 1,
            totalAmount: absAmount,
          });
        }
      }
    }

    const sorted = Array.from(byName.values()).sort((a, b) => {
      if (b.txCount !== a.txCount) return b.txCount - a.txCount;
      if (b.totalAmount !== a.totalAmount) return b.totalAmount - a.totalAmount;
      return a.name.localeCompare(b.name);
    });

    return sorted.slice(0, 5);
  }, [budgets, items]);

  if ((!budgets || budgets.length === 0) && (!items || items.length === 0))
    return null;

  const subtitleColor = colors.placeholder_text || colors.secondary_text;

  const rowBaseStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 14px",
    background: colors.secondary_bg,
    borderRadius: "12px",
    border: `1px solid ${colors.border_color}`,
    boxShadow: `inset 5px 0 0 ${colors.primary_accent}`,
  };

  const onRowEnter = (e) => {
    e.currentTarget.style.background = colors.hover_bg;
  };

  const onRowLeave = (e) => {
    e.currentTarget.style.background = colors.secondary_bg;
  };

  const content = (
    <div
      className="chart-container"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div className="chart-header" style={{ marginBottom: "14px" }}>
        <h3 style={{ color: colors.primary_text, margin: "0 0 4px 0" }}>
          {title}
        </h3>
        <div className="chart-subtitle" style={{ color: subtitleColor }}>
          {subtitle}
        </div>
      </div>

      {topRecurringExpenses.length > 0 ? (
        <div style={{ display: "grid", gap: "10px" }}>
          {topRecurringExpenses.map((item) => (
            <div
              key={item.key}
              style={{
                ...rowBaseStyle,
              }}
              onMouseEnter={onRowEnter}
              onMouseLeave={onRowLeave}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  color: colors.primary_text,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={item.name}
              >
                {item.name}
              </div>

              <div
                style={{
                  color: colors.secondary_text,
                  background: colors.active_bg,
                  border: `1px solid ${colors.border_color}`,
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {item.txCount} tx
              </div>

              <div
                style={{
                  color: colors.primary_text,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {fmt(item.totalAmount, {
                  currencySymbol,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: colors.secondary_text, padding: "8px 0" }}>
          No recurring expenses found in this range.
        </div>
      )}
    </div>
  );

  if (layout === "gridItem") {
    return content;
  }

  return <div className="chart-row full-width">{content}</div>;
}

TopRecurringExpensesCard.propTypes = {
  budgets: PropTypes.arrayOf(
    PropTypes.shape({
      expenses: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          amount: PropTypes.number,
          type: PropTypes.string,
        })
      ),
    })
  ),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      txCount: PropTypes.number,
      totalAmount: PropTypes.number,
    })
  ),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  layout: PropTypes.oneOf(["fullWidth", "gridItem"]),
};

TopRecurringExpensesCard.defaultProps = {
  budgets: [],
  items: undefined,
  title: "🔁 Top recurring expenses",
  subtitle: "Aggregated by expense name across budgets",
  layout: "fullWidth",
};
