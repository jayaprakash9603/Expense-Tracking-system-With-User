import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AppCard({ className, children, padding = "default", ...props }) {
  const paddingMap = {
    compact: "[&>div]:p-3 md:[&>div]:p-4",
    default: "",
    spacious: "[&>div]:p-5 md:[&>div]:p-6 lg:[&>div]:p-8",
  };

  return (
    <Card className={cn("border-border", paddingMap[padding], className)} {...props}>
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
