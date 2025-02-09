// src/hooks/useAuthentication.js

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProfileAction } from "../../Redux/Auth/auth.action";

const useAuthentication = (jwt) => {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!jwt) {
      navigate("/login");
      setLoadingAuth(false);
    } else {
      dispatch(getProfileAction(jwt)).finally(() => {
        setLoadingAuth(false);
      });
    }
  }, [jwt, dispatch, navigate]);

  return { loadingAuth };
};

export default useAuthentication;
