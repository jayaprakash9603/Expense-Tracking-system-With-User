import { useEntityList } from "@/shared/patterns";
import { fetchBillsAction } from "@/redux/bills/bills.actions";
import { selectBillList } from "@/redux/selectors";
import { toListItem } from "@/domain/bills/bill.transformers";
import { BILL_SEARCH_FIELDS, BILL_SORT_OPTIONS } from "../config/billConfig";

export function useBillList(options = {}) {
  return useEntityList({
    fetchAction: fetchBillsAction,
    selector: selectBillList,
    searchFields: BILL_SEARCH_FIELDS,
    defaultSort: { field: "date", order: "asc" },
    transformItem: toListItem,
    ...options,
  });
}

export { BILL_SORT_OPTIONS };
export default useBillList;
