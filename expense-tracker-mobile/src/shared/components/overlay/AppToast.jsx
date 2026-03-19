import { Toaster, toast } from "sonner";
import React from "react";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: "bg-card text-card-foreground border-border",
        duration: 3000,
      }}
      richColors
      closeButton
    />
  );
}

export { toast };
export default AppToaster;
