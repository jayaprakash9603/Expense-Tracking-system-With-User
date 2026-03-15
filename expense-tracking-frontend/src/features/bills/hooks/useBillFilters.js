import { useMemo } from 'react';

export const useBillFilters = (billsData, activeTab) => {
  const filteredBills = useMemo(() => {
    const bills = Array.isArray(billsData) ? billsData : [];

    switch (activeTab) {
      case 0: // All
        return bills;
      case 1: // Income
        return bills.filter((bill) => bill.type === "gain");
      case 2: // Expense
        return bills.filter((bill) => bill.type === "loss");
      default:
        return bills;
    }
  }, [billsData, activeTab]);

  const billStats = useMemo(() => {
    const bills = Array.isArray(billsData) ? billsData : [];
    return {
      total: bills.length,
      income: bills.filter(b => b.type === "gain").length,
      expense: bills.filter(b => b.type === "loss").length,
      totalIncome: bills
        .filter(bill => bill.type === "gain")
        .reduce((sum, bill) => sum + bill.amount, 0),
      totalExpense: bills
        .filter(bill => bill.type === "loss")
        .reduce((sum, bill) => sum + bill.amount, 0)
    };
  }, [billsData]);

  return { filteredBills, billStats };
};