import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Error403 from "./Error403";
import Error404 from "./Error404";
import { toast } from "react-toastify";
import { logoutAction } from "../../../Redux/Auth/auth.action";

const GlobalErrorHandler = () => {
  const [error403, setError403] = useState(null);
  const [error404, setError404] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for 403 errors
    const handle403Error = (event) => {
      setError403(event.detail);
    };

    // Listen for 404 errors
    const handle404Error = (event) => {
      setError404(event.detail);
    };

    // Listen for unauthorized errors
    const handleUnauthorized = (event) => {
      toast.error(event.detail.message);
      dispatch(logoutAction());
      navigate("/login");
    };

    // Add event listeners
    window.addEventListener("show403Error", handle403Error);
    window.addEventListener("show404Error", handle404Error);
    window.addEventListener("unauthorized", handleUnauthorized);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("show403Error", handle403Error);
      window.removeEventListener("show404Error", handle404Error);
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [navigate]);

  return (
    <>
      {error403 && (
        <Error403
          message={error403.message}
          onClose={() => setError403(null)}
        />
      )}

      {error404 && (
        <Error404
          message={error404.message}
          onClose={() => setError404(null)}
        />
      )}
    </>
  );
};

export default GlobalErrorHandler;
