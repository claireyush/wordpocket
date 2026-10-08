import React from "react";
import { View, Text, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "flex-row items-center rounded-full px-2 py-[3px]",
  {
    variants: {
      variant: {
        default: "bg-accent-bg",
        muted: "bg-bg-subtle",
        unknown: "bg-danger/10",
        learning: "bg-warning/10",
        upcoming: "bg-bg-subtle",
        memorized: "bg-accent-bg",
        suspended: "bg-bg-subtle",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const textVariants = cva("text-[10px] font-semibold", {
  variants: {
    variant: {
      default: "text-accent",
      muted: "text-text-secondary",
      unknown: "text-danger",
      learning: "text-warning",
      upcoming: "text-text-secondary",
      memorized: "text-accent",
      suspended: "text-text-tertiary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  children: string;
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn(textVariants({ variant }))}>{children}</Text>
    </View>
  );
}
