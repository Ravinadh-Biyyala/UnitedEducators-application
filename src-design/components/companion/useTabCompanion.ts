import { useCallback } from "react";
import { useParams } from "react-router";
import { useCompanion, newId, now, type Suggestion } from "./CompanionContext";

/**
 * Tab-scoped chatbot helper.
 *
 * Every submission-detail tab uses route key `page:submission:<subId>:<tab>`.
 * `useTabCompanion("risk")` returns a `react(text, suggestions?)` that pushes
 * an agent message onto that tab's Companion thread.
 *
 * Example:
 *   const react = useTabCompanion("risk");
 *   react("Marked Building Age as **Reviewed**.", [{ id: "next", label: "Next item" }]);
 */
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: "explain-impact", label: "Explain impact",   tone: "blue",  icon: "info"  },
  { id: "what-next",      label: "What should I do next?", tone: "gold",  icon: "compass" },
  { id: "preview-quote",  label: "Preview quote",          tone: "green", icon: "eye"   },
];

export function useTabCompanion(tab: string) {
  const { id: routeSubId } = useParams<{ id: string }>();
  const subId = routeSubId ?? "SUB-7829";
  const routeKey = `page:submission:${subId}:${tab}`;
  const { pushMsg } = useCompanion();

  return useCallback(
    (text: string, suggestions: Suggestion[] = DEFAULT_SUGGESTIONS) => {
      pushMsg(routeKey, {
        id: newId(), role: "agent", kind: "text", ts: now(),
        text, suggestions,
      });
    },
    [pushMsg, routeKey],
  );
}
