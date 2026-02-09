import { useState, useEffect } from "react";
import axios from "axios";
import { expensesTypesEmail } from "../Input Fields/InputFields";

const useFetchLogTypes = () => {
  const [logTypes, setLogTypes] = useState([]);
  const [filteredLogTypes, setFilteredLogTypes] = useState([]);

  useEffect(() => {
    const fetchLogTypes = () => {
      setLogTypes(expensesTypesEmail);
      setFilteredLogTypes(expensesTypesEmail);
    };

    fetchLogTypes();
    const interval = setInterval(fetchLogTypes, 100000000);

    return () => clearInterval(interval);
  }, []);

  return { logTypes, filteredLogTypes, setFilteredLogTypes };
};

export default useFetchLogTypes;
