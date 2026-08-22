import { Routes } from "react-router-dom";
import { GlobalErrorHandler } from "../features/errors";
import {
  KeyboardShortcutProvider,
  ShortcutGuideModal,
  AltKeyOverlay,
} from "../features/keyboard";
import { getAppRoutes } from "./AppRoutes";
import { getPublicRoutes } from "./PublicRoutes";
import "../services/socketService";

export default function AuthenticatedApp({ isDark }) {
  return (
    <KeyboardShortcutProvider>
      <div className={isDark ? "dark" : "light"}>
        <Routes>
          {getPublicRoutes({ includeHome: false })}
          {getAppRoutes()}
        </Routes>
      </div>
      <GlobalErrorHandler />
      <ShortcutGuideModal />
      <AltKeyOverlay />
    </KeyboardShortcutProvider>
  );
}
