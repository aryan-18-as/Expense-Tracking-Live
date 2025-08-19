export const loadExpenses = () => {
  const data = localStorage.getItem("expenses");
  return data ? JSON.parse(data) : [];
};

export const saveExpenses = (data) => {
  localStorage.setItem("expenses", JSON.stringify(data));
};
