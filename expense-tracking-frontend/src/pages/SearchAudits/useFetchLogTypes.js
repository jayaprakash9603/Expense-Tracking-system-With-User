import { useState, useEffect } from "react";
import { api } from "../../config/api";

const useFetchLogTypes = () => {
  const [logTypes, setLogTypes] = useState([]);
  const [filteredLogTypes, setFilteredLogTypes] = useState([]);

  useEffect(() => {
    const fetchLogTypes = () => {
      api
        .get("/audit-logs/audit-types")
        .then((response) => {
          setLogTypes(response.data);
          setFilteredLogTypes(response.data);
        })
        .catch((error) => {
          console.error("Error fetching log types:", error);
        });
    };

    fetchLogTypes();
    const interval = setInterval(fetchLogTypes, 100000000);

    return () => clearInterval(interval);
  }, []);

  return { logTypes, filteredLogTypes, setFilteredLogTypes };
};

export default useFetchLogTypes;
