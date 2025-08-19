import React, { createContext, useState } from "react";
import { loadExpenses, saveExpenses } from "../utils/storage";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(loadExpenses());

  const addExpenses = (newExpenses) => {
    const updated = [...expenses, ...newExpenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  const updateExpense = (id, category) => {
    const updated = expenses.map((exp, idx) =>
      idx === id ? { ...exp, category } : exp
    );
    setExpenses(updated);
    saveExpenses(updated);
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpenses, updateExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseContext;
