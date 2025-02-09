// formatUtils.js

// Convert data to the new format
export const convertToNewFormat = (data) => {
    return data.reduce((acc, { id, date, expense }) => {
      if (!acc[date]) {
        acc[date] = [];
      }
      const index = acc[date].length + 1;
  
      acc[date].push({
        id: id,
        index: index,
        expenseName: expense.expenseName,
        amount: expense.amount,
        type: expense.type,
        paymentMethod: expense.paymentMethod,
        netAmount: expense.netAmount,
        creditDue: expense.creditDue,
        comments: expense.comments || "", // Include creditDue here
      });
  
      return acc;
    }, {});
  };
  
  // Convert data back to the old format
  export const convertToOldFormat = (data) => {
    return Object.entries(data).flatMap(([date, expensesArray]) =>
      expensesArray.map(
        ({
          id,
          index,
          expenseName,
          amount,
          type,
          paymentMethod,
          netAmount,
          creditDue,
          comments,
        }) => ({
          id: id,
          date: date,
          expense: {
            expenseName: expenseName,
            amount: amount,
            type: type,
            paymentMethod: paymentMethod,
            netAmount: netAmount,
            comments: comments || "", // Default values
            creditDue: creditDue, // Include creditDue here
          },
        })
      )
    );
  };
  