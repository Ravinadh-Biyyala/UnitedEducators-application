// Re-export shim: the rich Companion context now lives in
// src-design/components/companion/CompanionContext.tsx. This file is kept so
// existing consumers (ChatBot, NewSubmissionPage) keep working without edits.
export { CompanionProvider, useCompanion } from "../components/companion/CompanionContext";
