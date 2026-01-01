// src/hooks/useAuthentication.js

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProfileAction } from "../../Redux/Auth/auth.action";
import { LOGOUT } from "../../Redux/Auth/auth.actionType";

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

  useEffect(() => {
    if (!jwt) {
      dispatch({ type: LOGOUT });
      navigate("/login");
    } else {
      dispatch(getProfileAction(jwt));
    }
  }, [jwt, dispatch, navigate]);
  return { loadingAuth };
};

export default useAuthentication;
