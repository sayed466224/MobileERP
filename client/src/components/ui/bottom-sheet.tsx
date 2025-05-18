import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

interface BottomSheetProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  snapPoints?: string[];
  defaultSnapPoint?: string;
  closeIcon?: boolean;
}

const BottomSheet = React.forwardRef<
  React.ElementRef<typeof Dialog>,
  BottomSheetProps
>(({ 
  className, 
  children, 
  snapPoints = ["90vh"],
  defaultSnapPoint = "90vh",
  closeIcon = true,
  ...props
}, ref) => (
  <Dialog
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    <DialogContent className="fixed bottom-0 left-0 right-0 gap-0 border-none bg-background p-0 shadow-lg sm:rounded-t-2xl animate-in data-[state=open]:slide-in-from-bottom-full sm:max-w-full">
      <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4" />
      {children}
    </DialogContent>
  </Dialog>
));
BottomSheet.displayName = "BottomSheet";

interface BottomSheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const BottomSheetHeader = React.forwardRef<
  HTMLDivElement,
  BottomSheetHeaderProps
>(({ className, title, description, children, ...props }, ref) => (
  <DialogHeader
    ref={ref}
    className={cn("p-4 pb-2 border-b", className)}
    {...props}
  >
    {title && <DialogTitle>{title}</DialogTitle>}
    {description && <DialogDescription>{description}</DialogDescription>}
    {children}
  </DialogHeader>
));
BottomSheetHeader.displayName = "BottomSheetHeader";

interface BottomSheetBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const BottomSheetBody = React.forwardRef<
  HTMLDivElement,
  BottomSheetBodyProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-auto p-4", className)}
    {...props}
  >
    {children}
  </div>
));
BottomSheetBody.displayName = "BottomSheetBody";

interface BottomSheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const BottomSheetFooter = React.forwardRef<
  HTMLDivElement,
  BottomSheetFooterProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto border-t p-4", className)}
    {...props}
  >
    {children}
  </div>
));
BottomSheetFooter.displayName = "BottomSheetFooter";

export { BottomSheet, BottomSheetHeader, BottomSheetBody, BottomSheetFooter };
