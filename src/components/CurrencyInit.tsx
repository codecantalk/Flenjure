"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/lib/store";

export default function CurrencyInit() {
  const initCurrency = useCurrencyStore((state) => state.initCurrency);

  useEffect(() => {
    initCurrency();
  }, [initCurrency]);

  return null;
}
