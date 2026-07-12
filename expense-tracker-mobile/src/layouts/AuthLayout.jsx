import React from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

function AuthBrandRow({ variant }) {
  const isDesktop = variant === "desktop";
  return (
    <div
      className={cn(
        "flex w-full max-w-full flex-row flex-nowrap items-center justify-center",
        isDesktop ? "gap-3 sm:gap-4 xl:gap-6" : "gap-2 sm:gap-3",
      )}
    >
      <div
        className={cn(
          "shrink-0 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.3)]",
          isDesktop
            ? "h-16 w-16 text-3xl sm:h-[4.5rem] sm:w-[4.5rem] sm:text-4xl xl:h-28 xl:w-28 xl:text-5xl 2xl:h-32 2xl:w-32 2xl:text-6xl"
            : "h-10 w-10 text-xl sm:h-12 sm:w-12 sm:text-2xl md:h-14 md:w-14 md:text-3xl",
        )}
      >
        <span className="font-black tracking-widest text-primary-foreground font-display leading-none">E</span>
      </div>
      <h1
        className={cn(
          "m-0 flex min-w-0 flex-nowrap items-baseline gap-x-1 whitespace-nowrap font-display leading-tight sm:gap-x-1.5",
          isDesktop
            ? "text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl"
            : "text-sm sm:text-lg md:text-xl",
        )}
      >
        <span className="shrink-0 font-extrabold tracking-tight text-foreground sm:tracking-wide">Expensio</span>
        <span className="shrink-0 font-bold tracking-tight text-primary sm:tracking-wide">Finance</span>
      </h1>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-col justify-center items-center w-[45%] xl:w-[50%] 2xl:w-[55%] p-12 xl:p-16 bg-card relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary blur-[8.75rem]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/70 blur-[7.5rem]" />
        </div>

        <div className="z-10 flex w-full max-w-[min(100%,32rem)] flex-col items-center px-4">
          <AuthBrandRow variant="desktop" />
          <p className="mt-8 text-center text-muted-foreground text-base xl:text-lg max-w-[25rem] xl:max-w-[31.25rem] leading-relaxed font-light">
            Track all your expenses in one place with a simpler, more intuitive
            way. Take control of your financial journey today.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 w-full px-1">
            <AuthBrandRow variant="mobile" />
            <p className="mt-4 text-center text-muted-foreground text-sm max-w-xs mx-auto font-light">
              Track all your expenses in one place
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
