import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { ThemeProvider } from "@emotion/react";
import createAppTheme from "./pages/Landingpage/theme";
import { getStore, setStore } from "./utils/store";
import "./config/globalErrorHandlers";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./config/googleOAuth";

// Log the Google Client ID for debugging (remove in production)
console.log(
  "Google OAuth Client ID loaded:",
  GOOGLE_CLIENT_ID
    ? "Yes (ends with: ..." + GOOGLE_CLIENT_ID.slice(-20) + ")"
    : "NOT CONFIGURED",
);

const root = ReactDOM.createRoot(document.getElementById("root"));

setStore(store);

// Create a wrapper component to access Redux state
const ThemedApp = () => {
  const mode = store.getState()?.theme?.mode || "dark";
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  // Subscribe to store changes to update theme
  const [currentTheme, setCurrentTheme] = React.useState(theme);

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const newMode = store.getState()?.theme?.mode || "dark";
      setCurrentTheme(createAppTheme(newMode));
    });
    return unsubscribe;
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <App />
    </ThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Provider store={store}>
          <ThemedApp />
        </Provider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
