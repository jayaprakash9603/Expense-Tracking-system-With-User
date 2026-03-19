import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/redux/store";
import { ThemeProvider } from "./ThemeProvider";
import { LanguageProviderWrapper } from "./LanguageProviderWrapper";
import { LayoutProvider } from "@/shared/hooks/useLayout";
import { AppToaster } from "@/shared/components/AppToast";
import "@/config/globalErrorHandlers";

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProviderWrapper>
          <BrowserRouter>
            <LayoutProvider>
              {children}
              <AppToaster />
            </LayoutProvider>
          </BrowserRouter>
        </LanguageProviderWrapper>
      </ThemeProvider>
    </Provider>
  );
}

export default AppProviders;
