import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/redux/store";
import { ThemeProvider } from "./ThemeProvider";
import { LanguageProviderWrapper } from "./LanguageProviderWrapper";
import { LayoutProvider } from "@/shared/hooks/useLayout";
import { AppToaster } from "@/shared/components/AppToast";
import { AppErrorBoundary } from "@/shared/components/feedback/AppErrorBoundary";
import {
  NotificationRealtimeBridge,
  FloatingNotificationContainer,
} from "@/features/notifications/components";
import "@/config/globalErrorHandlers";

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <AppErrorBoundary>
        <ThemeProvider>
          <LanguageProviderWrapper>
            <BrowserRouter>
              <LayoutProvider>
                <NotificationRealtimeBridge />
                {children}
                <FloatingNotificationContainer />
                <AppToaster />
              </LayoutProvider>
            </BrowserRouter>
          </LanguageProviderWrapper>
        </ThemeProvider>
      </AppErrorBoundary>
    </Provider>
  );
}

export default AppProviders;
