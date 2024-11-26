"use client";

import { createNestAPI } from "@/components/nest/nest-actions";
import * as API from "@/components/nest/nest-server-actions";

export const { Provider: NestActionsProvider, useNest: useNestActions } =
  createNestAPI(API);
