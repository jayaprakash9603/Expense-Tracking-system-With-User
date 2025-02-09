// utils/handleShowExpenses.js
const handleShowExpenses = (
  searchTerm,
  specificYear,
  specificMonth,
  fromDay,
  toDay,
  expenseName,
  paymentMethod,
  category,
  startYear,
  startMonth,
  minAmount,
  maxAmount,
  logTypes,
  setUrl,
  setError
) => {
  let url = "http://localhost:8080/api/expenses"; // Change port to 8080 and add '/api/expenses'
  let params = {};

  switch (searchTerm) {
    case "Today":
      url = `${url}/today`;
      break;
    case "Yesterday":
      url = `${url}/yesterday`;
      break;
    case "Last Week":
      url = `${url}/last-week`;
      break;
    case "Current Week":
      url = `${url}/current-week`;
      break;
    case "Current Month":
      url = `${url}/current-month`;
      break;
    case "Last Month":
      url = `${url}/last-month`;
      break;
    case "All Expenses":
      url = `${url}/user`;
      break;
    case "Within Range Expenses":
      if (!fromDay || !toDay) {
        setError("Please provide both From and To dates");
        return;
      }
      url = `${url}/within-range`;
      params.startDate = fromDay;
      params.endDate = toDay;
      break;
    case "Expenses By Name":
      if (!expenseName) {
        setError("Please provide an expense name");
        return;
      }
      url = `${url}/name`;
      params.name = expenseName;
      break;
    case "Expenses By Payment Method":
      if (!paymentMethod) {
        setError("Please provide a payment method.");
        return;
      }
      url = `${url}/payment-method/${paymentMethod}`;
      break;
    case "Expenses By Type and Payment Method":
      if (!category || !paymentMethod) {
        setError("Please provide type and payment");
        return;
      }
      url = `${url}/type-payment-method/${category}/${paymentMethod}`;
      break;
    case "Expenses By Type":
      if (!category) {
        setError("Please provide a category");
        return;
      }
      url = `${url}/type/${category}`;
      break;
    case "Particular Month Expenses":
      if (!startMonth || !startYear) {
        setError("Please provide month and year");
        return;
      }
      url = `${url}/by-month`;
      params.month = startMonth;
      params.year = startYear;
      break;
    case "Expenses Within Amount Range":
      if (!minAmount || !maxAmount) {
        setError("Please provide min or max value.");
        return;
      }
      url = `${url}/amount-range`;
      params.minAmount = minAmount;
      params.maxAmount = maxAmount;
      break;
    case "Particular Date Expenses":
      if (!fromDay) {
        setError("Please provide a date");
        return;
      }
      url = `${url}/particular-date`;
      params.date = fromDay;
      break;
    default:
      setError("Please select a valid option.");
      return;
  }

  if (Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams(params).toString();
    url = `${url}?${queryParams}`;
  }

  console.log("Sending request to:", url, "with params:", params);
  setUrl(url);
};

export default handleShowExpenses;
