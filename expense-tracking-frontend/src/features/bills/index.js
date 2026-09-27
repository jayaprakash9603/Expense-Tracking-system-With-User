export { default as Bill } from "./pages/BillPage";
export { default as CreateBill } from "./pages/CreateBillPage";
export { default as EditBill } from "./pages/EditBillPage";
export { default as BillCalendarView } from "./pages/BillCalendarViewPage";
export { default as DayBillsView } from "./components/DayBillsView";

export { listBills } from "./usecases";
export {
  registerBillRepository,
  BILL_REPOSITORY_KEY,
  createBillHttpRepository,
  createBillMockRepository,
} from "./adapters";

/**
 * BillReport lives in the reports feature. Import from @features/reports
 * (or features/reports) — do not re-export here to avoid cross-feature coupling.
 */
