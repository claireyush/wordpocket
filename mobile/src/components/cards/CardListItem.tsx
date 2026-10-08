import React from "react";
import { View, Text } from "react-native";
import { Badge } from "@/components/ui/Badge";
import type { CardDisplayStatus } from "@/lib/utils";

const STATUS_LABEL: Record<CardDisplayStatus, string> = {
  unknown: "모름",
  learning: "배우는중",
  upcoming: "복습예정",
  memorized: "암기완료",
  suspended: "제외됨",
};

interface CardListItemProps {
  word: string;
  meaning: string;
  status: CardDisplayStatus;
}

export function CardListItem({ word, meaning, status }: CardListItemProps) {
  return (
    <View className="flex-row items-center px-4 py-3 gap-3">
      <View className="flex-1">
        <Text className="text-body-md font-semibold text-text-primary" numberOfLines={1}>
          {word}
        </Text>
        <Text className="text-caption text-text-secondary mt-[2px]" numberOfLines={1}>
          {meaning}
        </Text>
      </View>
      <Badge variant={status}>{STATUS_LABEL[status]}</Badge>
    </View>
  );
}
