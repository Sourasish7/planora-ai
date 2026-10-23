import { PlanoraDatabase } from "@/types";

export const SEED_DATA: PlanoraDatabase = {
  events: [],
  userSettings: {
    preferredCurrency: "USD",
    aiProvider: "auto",
    aiModel: "",
    theme: "dark",
  },
  auditLogs: [
    {
      id: "log-init",
      timestamp: "2026-10-22T08:00:00Z",
      action: "INITIALIZE_DATABASE",
      details: "Planora AI Database initialized with clean slate",
    },
  ],
};
