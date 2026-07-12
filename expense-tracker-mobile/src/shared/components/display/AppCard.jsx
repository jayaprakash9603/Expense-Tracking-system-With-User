import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const appCardVariants = cva("border-border", {
  variants: {
    density: {
      compact: "[&>div]:p-3 md:[&>div]:p-4",
      default: "",
      spacious: "[&>div]:p-5 md:[&>div]:p-6 lg:[&>div]:p-8",
    },
    intent: {
      default: "",
      neutral: "bg-card",
      accent: "border-primary/20 bg-primary/5",
      danger: "border-destructive/40 bg-destructive/5",
    },
  },
  defaultVariants: {
    density: "default",
    intent: "default",
  },
});

export function AppCard({
  className,
  children,
  padding = "default",
  intent = "default",
  ...props
}) {
  const density = padding;

  return (
    <Card className={cn(appCardVariants({ density, intent }), className)} {...props}>
      {children}
    </Card>
  );
}

AppCard.Header = function ResponsiveHeader({ className, ...props }) {
  return <CardHeader className={cn("p-4 md:p-6", className)} {...props} />;
};
AppCard.Title = function ResponsiveTitle({ className, ...props }) {
  return <CardTitle className={cn("text-base md:text-lg", className)} {...props} />;
};
AppCard.Description = function ResponsiveDesc({ className, ...props }) {
  return <CardDescription className={cn("text-xs md:text-sm", className)} {...props} />;
};
AppCard.Content = function ResponsiveContent({ className, ...props }) {
  return <CardContent className={cn("p-4 md:p-6 pt-0 md:pt-0", className)} {...props} />;
};
AppCard.Footer = function ResponsiveFooter({ className, ...props }) {
  return <CardFooter className={cn("p-4 md:p-6 pt-0 md:pt-0", className)} {...props} />;
};

export default AppCard;
