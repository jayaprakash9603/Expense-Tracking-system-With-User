-- Performance indexes to accelerate BudgetService-related expense queries
-- Composite index covers frequent WHERE clauses: userId + date range + includeInBudget flag
CREATE INDEX IF NOT EXISTS idx_expenses_user_date_include ON expenses (expense_user_id, date, include_in_budget);

-- Separate index on user id for generic lookups
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (expense_user_id);

-- Index on expense_details.expense_id to speed join fetch operations
CREATE INDEX IF NOT EXISTS idx_expense_details_expense_id ON expense_details (expense_id);

-- Optional: index on date alone if heavy standalone date filtering occurs
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);