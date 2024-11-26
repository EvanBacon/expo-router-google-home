"use client";

import { createNestAPI } from "@/components/nest/nest-actions";
import { renderDevicesAsync } from "@/components/nest/nest-server-actions";

export const { Provider: NestActionsProvider, useNest: useNestActions } =
  createNestAPI({
    renderDevicesAsync,
  });
