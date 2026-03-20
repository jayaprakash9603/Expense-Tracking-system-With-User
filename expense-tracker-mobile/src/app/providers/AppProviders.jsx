import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/redux/store";
import { AppConfigProvider } from "@/config/runtime/AppConfigProvider";
import { ThemeProvider } from "./ThemeProvider";
import { LanguageProviderWrapper } from "./LanguageProviderWrapper";
import { LayoutProvider } from "@/shared/hooks/useLayout";
import { AppToaster } from "@/shared/components/AppToast";
import { AppErrorBoundary } from "@/shared/components/feedback/AppErrorBoundary";
import {
  NotificationRealtimeGate,
  FloatingNotificationContainer,
} from "@/features/notifications/components";
import "@/config/globalErrorHandlers";

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <AppConfigProvider>
      <AppErrorBoundary>
        <ThemeProvider>
          <LanguageProviderWrapper>
            <BrowserRouter>
              <LayoutProvider>
                <NotificationRealtimeGate />
                {children}
                <FloatingNotificationContainer />
                <AppToaster />
              </LayoutProvider>
            </BrowserRouter>
          </LanguageProviderWrapper>
        </ThemeProvider>
      </AppErrorBoundary>
      </AppConfigProvider>
    </Provider>
  );
}

export default AppProviders;
