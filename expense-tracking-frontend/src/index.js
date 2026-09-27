import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { getStore, setStore } from "./utils/realtime/store";
import "./config/globalErrorHandlers";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./config/googleOAuth";
import { RootErrorBoundary } from "./features/errors";
import { injectBaseThemeStyles } from "./utils/theme/themeInjector";
import AppThemeProvider from "./shared/theme/AppThemeProvider";
import buildAppTheme from "./shared/theme/buildAppTheme";
import { injectThemeFromBuilt } from "./utils/theme/themeInjector";

injectBaseThemeStyles();

const bootstrapTheme = buildAppTheme(
  store.getState()?.theme?.mode || "dark",
  store.getState()?.theme?.palette || "teal",
);
injectThemeFromBuilt(bootstrapTheme, false);

console.log(
  "Google OAuth Client ID loaded:",
  GOOGLE_CLIENT_ID
    ? "Yes (ends with: ..." + GOOGLE_CLIENT_ID.slice(-20) + ")"
    : "NOT CONFIGURED",
);

const root = ReactDOM.createRoot(document.getElementById("root"));

setStore(store);

root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Provider store={store}>
            <AppThemeProvider>
              <App />
            </AppThemeProvider>
          </Provider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
);

reportWebVitals();
