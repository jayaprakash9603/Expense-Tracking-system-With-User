import React from "react";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-col justify-center items-center w-[45%] xl:w-[50%] 2xl:w-[55%] p-12 xl:p-16 bg-card relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary blur-[140px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/70 blur-[120px]" />
        </div>

        <div className="z-10 flex flex-col items-center space-y-8">
          <div className="w-28 h-28 xl:w-32 xl:h-32 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.3)]">
            <span className="text-5xl xl:text-6xl text-primary-foreground font-black tracking-widest font-display">
              E
            </span>
          </div>

          <div className="flex flex-col items-center mt-2">
            <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-foreground mb-1 tracking-wider font-display">
              Expensio
            </h1>
            <span className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-primary tracking-wide font-display">
              Finance
            </span>
          </div>

          <p className="text-center text-muted-foreground text-lg xl:text-xl max-w-[400px] xl:max-w-[500px] mt-8 leading-relaxed font-light">
            Track all your expenses in one place with a simpler, more intuitive
            way. Take control of your financial journey today.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              <span className="text-4xl text-primary-foreground font-black font-display">E</span>
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-extrabold text-foreground tracking-wider font-display">
                Expensio
              </h1>
              <span className="text-3xl font-bold text-primary tracking-wide font-display">
                Finance
              </span>
            </div>
            <p className="text-center text-muted-foreground text-sm max-w-xs mt-2 font-light">
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
