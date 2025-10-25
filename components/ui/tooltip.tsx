"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Custom hook to force tooltips on top
function useTooltipPredominance() {
  React.useEffect(() => {
    const forceTopZIndex = () => {
      // Find all tooltip elements in the DOM
      const tooltipElements = document.querySelectorAll('[data-radix-tooltip-content]');
      tooltipElements.forEach((element) => {
        const tooltipEl = element as HTMLElement;
        tooltipEl.style.zIndex = '9999999';
        tooltipEl.style.position = 'fixed';
        tooltipEl.style.backdropFilter = 'none';
        tooltipEl.style.filter = 'none';
        tooltipEl.style.transform = 'none';
        tooltipEl.style.opacity = '1';
        tooltipEl.style.visibility = 'visible';
        tooltipEl.style.pointerEvents = 'auto';

        // Try to set webkit properties if they exist
        if ('webkitBackdropFilter' in tooltipEl.style) {
          (tooltipEl.style as any).webkitBackdropFilter = 'none';
        }
        if ('webkitFilter' in tooltipEl.style) {
          (tooltipEl.style as any).webkitFilter = 'none';
        }
        if ('webkitTransform' in tooltipEl.style) {
          (tooltipEl.style as any).webkitTransform = 'none';
        }
      });
    };

    // Force immediately and set up intervals
    forceTopZIndex();
    const timeoutId = setTimeout(forceTopZIndex, 10);
    const intervalId = setInterval(forceTopZIndex, 100);

    // Clean up intervals
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);
}

const TooltipProvider = ({ children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) => {
  // Use the custom hook to force tooltips on top
  useTooltipPredominance();

  return (
    <TooltipPrimitive.Provider {...props}>
      {children}
    </TooltipPrimitive.Provider>
  );
};

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-[999999] overflow-hidden rounded-md border bg-popover/98 backdrop-blur-none px-3 py-1.5 text-sm text-popover-foreground shadow-2xl ring-1 ring-black/10 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 liquid-glass:z-[1000000]",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
