import * as React from "react";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import * as ResizablePrimitive from "react-resizable-panels";

const SplitPaneRoot = ResizablePrimitive.PanelGroup;

const SplitPanePanel = ResizablePrimitive.Panel;

const SplitPaneResizeHandle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelResizeHandle>) => (
  <ResizablePrimitive.PanelResizeHandle
    className={`relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-4 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-4 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 ${className}`}
    {...props}
  >
    <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
      <DragHandleDots2Icon className="h-2.5 w-2.5" />
    </div>
  </ResizablePrimitive.PanelResizeHandle>
);

export const SplitPane = React.forwardRef<
  React.ElementRef<typeof SplitPaneRoot>,
  React.ComponentPropsWithoutRef<typeof SplitPaneRoot> & {
    children: React.ReactNode;
    sizes?: number[];
    onLayout?: (sizes: number[]) => void;
  }
>(({ children, sizes, onLayout, direction = "horizontal", ...props }, ref) => {
  const childArray = React.Children.toArray(children);

  return (
    <SplitPaneRoot 
      ref={ref}
      onLayout={onLayout}
      direction={direction}
      className="h-full w-full"
      {...props}
    >
      {childArray.map((child, index) => [
        <SplitPanePanel 
          key={`panel-${index}`} 
          defaultSize={sizes?.[index]}
          className="h-full w-full"
          style={{ minHeight: 0, minWidth: 0 }}
        >
          {child}
        </SplitPanePanel>,
        index < childArray.length - 1 && (
          <SplitPaneResizeHandle key={`handle-${index}`} />
        )
      ]).flat().filter(Boolean)}
    </SplitPaneRoot>
  );
});
SplitPane.displayName = "SplitPane";
