import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef(({ className, variant, size, asChild = false, children, ...props }, ref) => {
  const styles = cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-black text-white hover:bg-black/90": variant === "default" || !variant,
      "hover:bg-gray-100 hover:text-gray-900": variant === "ghost",
      "bg-gray-100 text-gray-900 hover:bg-gray-100/80": variant === "secondary",
      "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900": variant === "outline",
      "bg-transparent hover:bg-transparent": variant === "neutral", // added for custom variant
      "h-10 px-4 py-2": size === "default" || !size,
      "h-9 rounded-md px-3": size === "sm",
      "h-11 rounded-md px-8": size === "lg",
      "h-10 w-10": size === "icon",
    },
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(styles, children.props.className),
      ref,
      ...props,
    });
  }

  return (
    <button className={styles} ref={ref} {...props}>
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
