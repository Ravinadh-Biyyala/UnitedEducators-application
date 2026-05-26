import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Send, ChevronRight, ChevronsRight, RotateCcw, ArrowRight,
  Compass, Activity, Shield, ShieldCheck, AlertTriangle, Layers, FileSearch, Wand2,
  CheckCircle2, BarChart3, FileText, Mail, ListChecks, ChartPie,
  Inbox as InboxIcon, Building2, X, Plus, Check,
  ClipboardList, Users, Clock as ClockIcon, Calendar, TrendingUp,
  Bell, AtSign, Upload, Flag,
} from "lucide-react";
import { useCompanion, now, newId, type CompanionMsg, type Suggestion, type VizSpec } from "./CompanionContext";
import { companionChat, type ChatMsg } from "../../lib/companion/companionChat";

// ─── Design tokens (match workbench AppShell) ────────────────────────────────
const N    = "#0123D4";
const ND   = "#011B9E";
const G    = "#C9A227";
const NAVY = "#0B1A6E";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#5F7080";
const BG   = "#EEF1F6";
const font = "'Source Sans 3', system-ui, sans-serif";

const ICONS: Record<string, any> = {
  Compass, Activity, Shield, ShieldCheck, AlertTriangle, Layers, FileSearch, Wand2,
  BarChart3, FileText, Mail, ListChecks, ChartPie, InboxIcon, Building2, Sparkles,
  Send, Clock: ClockIcon, ArrowRight, ClipboardList, Plus, Users,
  Calendar, TrendingUp, Bell, AtSign, Upload, Flag, CheckCircle2,
};

const TONE_BG: Record<string, { bg: string; border: string; text: string }> = {
  blue:   { bg: `${N}14`,    border: `${N}55`,    text: N },
  gold:   { bg: `${G}1F`,    border: `${G}66`,    text: "#7B6217" },
  navy:   { bg: `${NAVY}18`, border: `${NAVY}55`, text: NAVY },
  green:  { bg: `${G}1F`,    border: `${G}66`,    text: "#7B6217" },
  red:    { bg: `${NAVY}18`, border: `${NAVY}55`, text: NAVY },
  violet: { bg: `${NAVY}18`, border: `${NAVY}55`, text: NAVY },
};

// Keyframes for ambient motion (slot once globally per component mount).
const KEYFRAMES = `
@keyframes uwc-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes uwc-pulse { 0%,100% { opacity: 0.55 } 50% { opacity: 1 } }
@keyframes uwc-dot { 0%,100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }
@keyframes uwc-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes uwc-slide-in-right { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
`;

export function CompanionPanel() {
  const {
    collapsed, setCollapsed, pageCtx, history, pushMsg, resetThread, go,
  } = useCompanion();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [askedByRoute, setAskedByRoute] = useState<Record<string, Set<string>>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const routeKey = pageCtx?.routeKey ?? "_idle";
  const msgs: CompanionMsg[] = history[routeKey] || [];
  const asked = askedByRoute[routeKey] ?? new Set<string>();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pin = () => {
      el.scrollTop = el.scrollHeight;
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };
    pin();
    const t = setTimeout(pin, 60);
    return () => clearTimeout(t);
  }, [msgs.length, routeKey, thinking]);

  // Build context-aware follow-up chips after a response: exclude the suggestion
  // the user just clicked, prepend any free-text "ask a follow-up" idea, cap to 4.
  function buildFollowUps(excludeId?: string): Suggestion[] {
    if (!pageCtx) return [];
    return pageCtx.suggestions
      .filter(x => x.id !== excludeId && !asked.has(x.id))
      .slice(0, 6);
  }

  // Attach follow-up suggestions to the LAST agent message in a generated list,
  // unless the page already supplied its own — pages keep authority when they
  // want a specific next-step chip set.
  function withFollowUps(generated: CompanionMsg[], excludeId?: string): CompanionMsg[] {
    if (!generated.length) return generated;
    const followUps = buildFollowUps(excludeId);
    if (!followUps.length) return generated;
    const out = [...generated];
    const lastIdx = out.length - 1;
    const last = out[lastIdx];
    if (last.role !== "agent") return out;
    if (last.kind === "text" && !last.suggestions?.length) {
      out[lastIdx] = { ...last, suggestions: followUps };
    } else if (last.kind === "viz" && !last.suggestions?.length) {
      out[lastIdx] = { ...last, suggestions: followUps };
    }
    return out;
  }

  function pickSuggestion(s: Suggestion) {
    if (!pageCtx) return;
    setAskedByRoute(prev => {
      const next = new Set(prev[routeKey] ?? []);
      next.add(s.id);
      return { ...prev, [routeKey]: next };
    });
    if (s.navigateTo) {
      pushMsg(routeKey,
        { id: newId(), role: "user", kind: "text", text: s.label, ts: now() },
        { id: newId(), role: "agent", kind: "navigate", text: `Taking you to ${s.label.toLowerCase()}…`, href: s.navigateTo, label: s.label, ts: now() },
      );
      setTimeout(() => go(s.navigateTo!), 400);
      return;
    }
    pushMsg(routeKey, { id: newId(), role: "user", kind: "text", text: s.label, ts: now() });
    setThinking(true);
    setTimeout(() => {
      // 1. Try the page's explicit suggestion-id handler.
      const generated = pageCtx.respond?.(s.id, s);
      if (generated && generated.length) {
        setThinking(false);
        pushMsg(routeKey, ...withFollowUps(generated, s.id));
        return;
      }
      // 2. Fall back to free-text intent matching using the chip's label, so
      //    chips authored elsewhere (e.g. RatingTab follow-ups) still resolve
      //    via the page's freeText() instead of dropping into a generic reply.
      const local = pageCtx.freeText?.(s.label);
      if (local && local.length) {
        setThinking(false);
        pushMsg(routeKey, ...withFollowUps(local, s.id));
        return;
      }
      // 3. Last resort — acknowledge the specific ask instead of "Done.".
      setThinking(false);
      pushMsg(routeKey, {
        id: newId(), role: "agent", kind: "text", ts: now(),
        text: `I don't have a built-in handler for "${s.label}" on this page yet. Try one of the suggestions below — or type your question and I'll respond from the page context.`,
        suggestions: buildFollowUps(s.id),
      });
    }, 720);
  }

  async function send() {
    if (!input.trim() || !pageCtx) return;
    const text = input.trim();
    pushMsg(routeKey, { id: newId(), role: "user", kind: "text", text, ts: now() });
    setInput("");
    setThinking(true);

    const local = pageCtx.freeText?.(text);
    if (local && local.length) {
      await new Promise(r => setTimeout(r, 380));
      setThinking(false);
      pushMsg(routeKey, ...withFollowUps(local));
      return;
    }

    const nav = tryNavIntent(text, history[routeKey] || []);
    if (nav) {
      await new Promise(r => setTimeout(r, 320));
      setThinking(false);
      pushMsg(routeKey, {
        id: newId(), role: "agent", kind: "navigate", ts: now(),
        text: nav.confirmation, href: nav.href, label: nav.label,
      });
      setTimeout(() => go(nav.href), 520);
      return;
    }

    const playbook = tryTaskHelpIntent(text);
    if (playbook) {
      await new Promise(r => setTimeout(r, 520));
      setThinking(false);
      pushMsg(routeKey, ...withFollowUps([playbook]));
      return;
    }

    const chart = tryChartIntent(text);
    if (chart) {
      await new Promise(r => setTimeout(r, 420));
      setThinking(false);
      pushMsg(routeKey, ...withFollowUps([chart]));
      return;
    }

    // No deterministic intent matched — ask the chat module (OpenAI when
    // VITE_OPENAI_API_KEY is set, otherwise a local senior-UW responder).
    try {
      const priorMsgs = history[routeKey] || [];
      const chatHistory: ChatMsg[] = priorMsgs
        .filter((m): m is Extract<CompanionMsg, { kind: "text" }> => m.kind === "text")
        .slice(-7)
        .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      chatHistory.push({ role: "user", content: text });

      const { text: reply } = await companionChat({
        page: { title: pageCtx.title, subtitle: pageCtx.subtitle, routeKey },
        facts: pageCtx.facts?.(),
        messages: chatHistory,
      });
      setThinking(false);
      pushMsg(routeKey, {
        id: newId(), role: "agent", kind: "text", ts: now(),
        text: reply || "I can help with charts, navigation, or playbooks. Try one of the suggestions below.",
        suggestions: buildFollowUps(),
      });
    } catch {
      setThinking(false);
      pushMsg(routeKey, {
        id: newId(), role: "agent", kind: "text", ts: now(),
        text: "I can help with charts, navigation, or playbooks. Try one of these — they map directly to actions on this page.",
        suggestions: buildFollowUps(),
      });
    }
  }

  if (collapsed) {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Open companion"
          style={{
            position: "fixed", right: 24, bottom: 24, zIndex: 60,
            width: 48, height: 48, borderRadius: 9999,
            background: `linear-gradient(135deg, ${N}, ${ND})`,
            color: "white", border: "none", cursor: "pointer",
            display: "grid", placeItems: "center",
            boxShadow: `0 12px 28px ${N}66`,
            fontFamily: font,
          }}
        >
          <Sparkles size={20} color={G} />
          <span style={{
            position: "absolute", bottom: -2, right: -2, width: 12, height: 12,
            borderRadius: 9999, background: "#10B981",
            border: "2px solid white",
          }} />
        </button>
      </>
    );
  }

  return (
    <>
      <style>{KEYFRAMES}</style>
      <aside style={{
        // Fixed overlay anchored to the right edge, starting just below the
        // 56px global top nav and running to the bottom of the viewport.
        // Was `position: relative` (in-flow), which only worked when AppShell
        // used a horizontal flex layout; after the top-nav refactor the panel
        // would flow underneath <main> and appear to take the whole screen.
        position: "fixed", top: 56, right: 0, bottom: 0, zIndex: 55,
        width: 300,
        borderLeft: `1px solid ${BDL}`,
        background: "white",
        display: "flex", flexDirection: "column",
        fontFamily: font,
        boxShadow: "-4px 0 12px rgba(15,23,42,0.04)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          height: 64, borderBottom: `1px solid ${BDL}`,
          display: "flex", alignItems: "center", padding: "0 16px",
          background: "white",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 800, color: TM }}>
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: "#10B981", boxShadow: "0 0 10px rgba(16,185,129,0.7)" }} />
            Live · agentic
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => resetThread(routeKey)} title="Reset thread"
              style={iconBtn}><RotateCcw size={14} color={TM} /></button>
            <button onClick={() => setCollapsed(true)} title="Collapse"
              style={iconBtn}><ChevronsRight size={15} color={TM} /></button>
          </div>
        </div>

        {/* Identity card */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BDL}`, background: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AgentAvatar size={44} thinking={thinking} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: TD, lineHeight: 1 }}>Companion</div>
              <div style={{ fontSize: 11, color: TT, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {pageCtx?.title ?? "On standby"}{pageCtx?.subtitle ? ` · ${pageCtx.subtitle}` : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: "auto", padding: "16px",
          display: "flex", flexDirection: "column", gap: 16,
          background: BG,
        }}>
          {msgs.map(m => (
            <MessageBubble
              key={m.id}
              msg={m}
              onGo={go}
              onPickSuggestion={pickSuggestion}
              disabled={thinking}
            />
          ))}
          {thinking && <ThinkingBubble />}
          <div ref={endRef} aria-hidden style={{ height: 1 }} />
        </div>

        {/* Composer */}
        <div style={{ borderTop: `1px solid ${BDL}`, background: "white" }}>
          <div style={{ padding: 12 }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 8,
              borderRadius: 10, border: `1px solid ${BDL}`, background: "white",
              padding: 8, transition: "all 0.18s",
            }}>
              <button style={{ ...iconBtn, width: 32, height: 32 }}>
                <Plus size={15} color={TT} />
              </button>
              <textarea
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={pageCtx ? `Ask about ${pageCtx.title.toLowerCase()}…` : "Ask the companion anything…"}
                style={{
                  flex: 1, background: "transparent", border: "none", resize: "none",
                  fontSize: 13, padding: "6px 4px", outline: "none",
                  maxHeight: 128, fontFamily: font, color: TD,
                }}
              />
              <button onClick={send} disabled={!input.trim() || !pageCtx}
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: N,
                  color: "white", border: "none", cursor: "pointer",
                  display: "grid", placeItems: "center",
                  opacity: !input.trim() || !pageCtx ? 0.3 : 1,
                }}>
                <Send size={14} />
              </button>
            </div>
            <div style={{ fontSize: 10, color: TT, marginTop: 8, paddingLeft: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: 9999, background: "#10B981", animation: "uwc-pulse 1.8s infinite" }} />
              Watching this page — every action is deterministic and traceable.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

const iconBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8,
  border: "none", background: "transparent", cursor: "pointer",
  display: "grid", placeItems: "center",
};


function AgentAvatar({ size = 40, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <div aria-hidden style={{
        position: "absolute", inset: -4, borderRadius: 14,
        background: `linear-gradient(135deg, ${N}80, ${G}80)`,
        filter: "blur(8px)",
        animation: `uwc-pulse ${thinking ? "1.2s" : "2.8s"} ease-in-out infinite`,
        opacity: thinking ? 0.8 : 0.4,
      }} />
      <div style={{
        position: "relative", width: "100%", height: "100%",
        borderRadius: 14,
        background: `linear-gradient(135deg, ${ND} 0%, ${N} 50%, ${NAVY} 100%)`,
        display: "grid", placeItems: "center",
        boxShadow: `0 8px 18px ${N}33`,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.3)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.45), transparent 55%)",
        }} />
        <div style={{
          position: "relative",
          animation: thinking ? "uwc-spin 3s linear infinite" : "none",
          display: "grid", placeItems: "center",
        }}>
          <Sparkles size={size * 0.5} color={G} />
        </div>
      </div>
      <span style={{
        position: "absolute", bottom: -2, right: -2,
        width: 11, height: 11, borderRadius: 9999, background: "#10B981",
        border: "2px solid white",
      }} />
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", animation: "uwc-fade-in 0.2s ease-out" }}>
      <AgentAvatar size={32} thinking />
      <div style={{
        borderRadius: 14, border: `1px solid ${BDL}`,
        background: "white", padding: "10px 14px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: 9999, background: N,
              animation: `uwc-dot 0.9s ${i * 0.15}s infinite ease-in-out`,
              display: "inline-block",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onGo, onPickSuggestion, disabled }: {
  msg: CompanionMsg;
  onGo: (h: string) => void;
  onPickSuggestion?: (s: Suggestion) => void;
  disabled?: boolean;
}) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", animation: "uwc-fade-in 0.2s ease-out" }}>
        <div style={{
          maxWidth: "85%", borderRadius: 14, borderBottomRightRadius: 6,
          background: N, color: "white", padding: "8px 14px",
          fontSize: 13, boxShadow: `0 4px 10px ${N}33`,
        }}>{msg.text}</div>
      </div>
    );
  }
  if (msg.kind === "navigate") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "uwc-fade-in 0.2s ease-out" }}>
        <AgentBubble text={msg.text} />
        <button onClick={() => onGo(msg.href)}
          style={{
            marginLeft: 42, alignSelf: "flex-start",
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRadius: 9999, padding: "6px 14px",
            background: `linear-gradient(90deg, ${N}, ${ND})`,
            color: "white", fontSize: 12, fontWeight: 700,
            border: "none", cursor: "pointer",
            boxShadow: `0 6px 16px ${N}44`,
          }}>
          {msg.label} <ArrowRight size={13} />
        </button>
      </div>
    );
  }
  if (msg.kind === "viz") {
    const v = msg.viz;
    const showAdd = (v.kind === "donut" || v.kind === "bars" || v.kind === "spark" || v.kind === "ring") && (v as { cta?: string }).cta === "add-to-dashboard";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "uwc-fade-in 0.2s ease-out" }}>
        <VizCard viz={msg.viz} />
        {showAdd && <AddToDashboardBar viz={v as Extract<VizSpec, { kind: "donut" | "bars" | "spark" | "ring" }>} />}
        {msg.suggestions && msg.suggestions.length > 0 && onPickSuggestion && (
          <InlineFollowUps suggestions={msg.suggestions} onPick={onPickSuggestion} disabled={disabled} />
        )}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <AgentBubble text={msg.text} />
      {msg.suggestions && msg.suggestions.length > 0 && onPickSuggestion && (
        <InlineFollowUps suggestions={msg.suggestions} onPick={onPickSuggestion} disabled={disabled} />
      )}
    </div>
  );
}

// ChatGPT-style follow-up chips rendered inline beneath each agent message.
function InlineFollowUps({ suggestions, onPick, disabled }: {
  suggestions: Suggestion[];
  onPick: (s: Suggestion) => void;
  disabled?: boolean;
}) {
  const sugs = suggestions.slice(0, 6);
  return (
    <div style={{ marginLeft: 42, animation: "uwc-fade-in 0.25s ease-out" }}>
      <div style={{
        fontSize: 9.5, fontWeight: 800, color: TT,
        textTransform: "uppercase", letterSpacing: "0.1em",
        marginBottom: 5, display: "flex", alignItems: "center", gap: 4,
      }}>
        <Sparkles size={10} color={G} /> Suggested follow-ups
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {sugs.map(s => {
          const Icon = (s.icon && ICONS[s.icon]) || Sparkles;
          const tone = TONE_BG[s.tone || "blue"];
          return (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              disabled={disabled}
              title={s.hint || s.label}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                borderRadius: 9999, padding: "4px 11px",
                fontSize: 11, fontWeight: 600,
                background: tone.bg, border: `1px solid ${tone.border}`, color: TD,
                cursor: disabled ? "wait" : "pointer",
                opacity: disabled ? 0.55 : 1,
                whiteSpace: "nowrap", maxWidth: "100%",
              }}>
              <Icon size={11} color={tone.text} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
              <ArrowRight size={10} style={{ opacity: 0.55 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddToDashboardBar({ viz }: { viz: Extract<VizSpec, { kind: "donut" | "bars" | "spark" | "ring" }> }) {
  const { pinViz, isPinned, pageCtx, go } = useCompanion();
  const signature = `${viz.kind}::${viz.title}`;
  const alreadyPinned = isPinned(signature);
  const [justPinned, setJustPinned] = useState(false);
  const pinned = alreadyPinned || justPinned;
  const label = viz.ctaLabel ?? "Add to Dashboard";
  const href = viz.dashboardHref ?? "/";
  return (
    <div style={{ marginLeft: 42, display: "flex", borderRadius: 10, border: `1px solid ${BDL}`, overflow: "hidden", maxWidth: 380, background: "white" }}>
      <button
        onClick={() => {
          if (pinned) return;
          pinViz(viz, { page: pageCtx?.title ?? "Companion", href });
          setJustPinned(true);
        }}
        disabled={pinned}
        style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "9px 12px", fontSize: 12, fontWeight: 700,
          background: pinned ? "#E8F5EC" : `${N}0A`,
          color: pinned ? "#1A5C30" : N,
          border: "none", cursor: pinned ? "default" : "pointer",
        }}>
        {pinned ? <><Check size={13} /> Pinned</> : <><Plus size={13} /> {label}</>}
      </button>
      <button onClick={() => go(href)}
        style={{
          padding: "9px 12px", borderLeft: `1px solid ${BDL}`,
          fontSize: 12, fontWeight: 600, color: TT,
          background: "transparent", border: "none", cursor: "pointer",
        }}>
        View
      </button>
    </div>
  );
}

function AgentBubble({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <AgentAvatar size={32} />
      <div style={{
        borderRadius: 14, borderTopLeftRadius: 6,
        border: `1px solid rgba(255,255,255,0.5)`,
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        padding: "10px 14px", fontSize: 13, lineHeight: 1.5,
        color: TD, maxWidth: "85%",
        boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
      }}>{text}</div>
    </div>
  );
}

function SuggestionStrip({ suggestions, onPick }: { suggestions: Suggestion[]; onPick: (s: Suggestion) => void }) {
  const sugs = suggestions.slice(0, 4);
  return (
    <div style={{ padding: "6px 12px 4px" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {sugs.map((s) => {
          const Icon = (s.icon && ICONS[s.icon]) || Sparkles;
          const tone = TONE_BG[s.tone || "blue"];
          return (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              title={s.hint || s.label}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                borderRadius: 9999, padding: "3px 10px",
                fontSize: 10.5, fontWeight: 600,
                background: tone.bg, border: `1px solid ${tone.border}`, color: tone.text,
                cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                animation: "uwc-fade-in 0.2s ease-out",
              }}
            >
              <Icon size={10} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", color: TD }}>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VizCard({ viz }: { viz: VizSpec }) {
  if (viz.kind === "linecard") {
    return <div style={{ marginLeft: 42, maxWidth: "92%" }}><LinecardViz viz={viz} /></div>;
  }
  if (viz.kind === "playbook") {
    return <div style={{ marginLeft: 42, maxWidth: "94%" }}><PlaybookViz viz={viz} /></div>;
  }
  return (
    <div style={{
      marginLeft: 42, maxWidth: "88%",
      borderRadius: 14, border: `1px solid ${BDL}`, background: "white",
      boxShadow: "0 4px 14px rgba(0,0,0,0.06)", overflow: "hidden",
    }}>
      <div style={{
        padding: "8px 14px", borderBottom: `1px solid ${BDL}`,
        background: `linear-gradient(90deg, ${N}10, ${G}08, transparent)`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: `${N}19`, display: "grid", placeItems: "center" }}>
          <BarChart3 size={12} color={N} />
        </div>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, color: TM, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {viz.title}
        </div>
        <Wand2 size={12} color={G} />
      </div>
      <div style={{ padding: 14 }}>
        {viz.kind === "ring" && <RingViz viz={viz} />}
        {viz.kind === "bars" && <BarsViz viz={viz} />}
        {viz.kind === "spark" && <SparkViz viz={viz} />}
        {viz.kind === "donut" && <DonutViz viz={viz} />}
        {viz.kind === "checklist" && <ChecklistViz viz={viz} />}
      </div>
    </div>
  );
}

function LinecardViz({ viz }: { viz: Extract<VizSpec, { kind: "linecard" }> }) {
  const { go, pinViz, isPinned, pageCtx } = useCompanion();
  const signature = `linecard::${viz.title}`;
  const alreadyPinned = isPinned(signature);
  const [justPinned, setJustPinned] = useState(false);
  const pinned = alreadyPinned || justPinned;
  const ctaMode = viz.cta ?? "add-to-dashboard";
  const fmt = (n: number) => {
    if (viz.yFormat === "currency") {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
      return `$${n}`;
    }
    if (viz.yFormat === "percent") return `${n}%`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };
  const max = Math.max(...viz.data.map(d => d.value));
  const tickMax = niceCeil(max * 1.1);
  const ticks = [tickMax, tickMax * 0.75, tickMax * 0.5, tickMax * 0.25, 0];
  const W = 320, H = 150, padL = 46, padR = 12, padT = 10, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const xs = (i: number) => padL + (viz.data.length === 1 ? innerW / 2 : (i / (viz.data.length - 1)) * innerW);
  const ys = (v: number) => padT + innerH - (v / tickMax) * innerH;
  const points = viz.data.map((d, i) => `${xs(i)},${ys(d.value)}`).join(" ");

  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${BDL}`, background: "white",
      boxShadow: "0 4px 14px rgba(0,0,0,0.06)", overflow: "hidden",
    }}>
      <div style={{ padding: "10px 16px 4px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, background: `${N}19`, display: "grid", placeItems: "center" }}>
          <BarChart3 size={11} color={N} />
        </div>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, color: TT }}>
          Companion chart
        </div>
      </div>
      {viz.intro && (
        <p style={{ padding: "0 16px 8px", fontSize: 12.5, lineHeight: 1.55, color: TD, margin: 0 }}>{viz.intro}</p>
      )}
      <div style={{
        margin: "0 12px 12px", borderRadius: 12, border: `1px solid ${BDL}`,
        background: "linear-gradient(180deg, #FFFFFF, #FAFBFD)", padding: 12,
      }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: TD, marginBottom: 4 }}>{viz.title}</div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 150 }} preserveAspectRatio="none" role="img" aria-label={viz.title}>
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={ys(t)} y2={ys(t)} stroke="#E2E6EE" strokeWidth="1" strokeDasharray="2 4" />
              <text x={padL - 6} y={ys(t) + 3} textAnchor="end" fontSize="9" fill="#7A879E" fontFamily="ui-monospace, monospace">{fmt(t)}</text>
            </g>
          ))}
          {viz.data.map((d, i) => (
            <text key={i} x={xs(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#5A6B8C">{d.label}</text>
          ))}
          <polyline fill="none" stroke={N} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" points={points} vectorEffect="non-scaling-stroke" />
          {viz.data.map((d, i) => (
            <g key={`pt-${i}`}>
              <circle cx={xs(i)} cy={ys(d.value)} r="3.5" fill={N} />
              <circle cx={xs(i)} cy={ys(d.value)} r="1.5" fill="#fff" />
            </g>
          ))}
        </svg>
      </div>
      {ctaMode === "navigate" && viz.ctaHref && (
        <button onClick={() => go(viz.ctaHref!)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "10px 14px", borderTop: `1px solid ${BDL}`, background: `${N}0A`,
            fontSize: 12.5, fontWeight: 700, color: N, border: "none", cursor: "pointer",
          }}>
          {viz.ctaLabel ?? "View Dashboard"} <ChevronRight size={14} />
        </button>
      )}
      {ctaMode === "add-to-dashboard" && (
        <div style={{ borderTop: `1px solid ${BDL}`, display: "flex" }}>
          <button
            onClick={() => {
              if (pinned) return;
              pinViz(viz, { page: pageCtx?.title ?? "Companion", href: viz.ctaHref });
              setJustPinned(true);
            }}
            disabled={pinned}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 14px", fontSize: 12.5, fontWeight: 700,
              background: pinned ? `${N}10` : `${N}0A`, color: N,
              border: "none", cursor: pinned ? "default" : "pointer",
            }}>
            {pinned ? <><Check size={14} /> Pinned to Dashboard</> : <><Plus size={14} /> {viz.ctaLabel ?? "Add to Dashboard"}</>}
          </button>
          <button onClick={() => go(viz.dashboardHref ?? "/")}
            style={{
              padding: "10px 14px", borderLeft: `1px solid ${BDL}`,
              fontSize: 12, fontWeight: 600, color: TT, background: "transparent",
              border: "none", cursor: "pointer",
            }}>View</button>
        </div>
      )}
    </div>
  );
}

function adaptiveSuggestions(msgs: CompanionMsg[], pageDefaults: Suggestion[]): Suggestion[] {
  const lastAgent = [...msgs].reverse().find((m): m is Extract<CompanionMsg, { role: "agent" }> => m.role === "agent");
  const lastUser  = [...msgs].reverse().find((m): m is Extract<CompanionMsg, { role: "user" }> => m.role === "user");
  if (!lastAgent) return pageDefaults.slice(0, 2);

  if (lastAgent.kind === "viz" && lastAgent.viz.kind === "playbook") {
    const pb = lastAgent.viz;
    const out: Suggestion[] = [];
    if (pb.draft) out.push({ id: "send-draft", label: pb.draft.kind === "email" ? "Send the draft" : "Trigger request", tone: "blue", icon: "Send" });
    if (pb.contextRef?.href) out.push({ id: "open-context", label: `Open ${pb.contextRef.label}`, tone: "violet", icon: "Building2", navigateTo: pb.contextRef.href });
    if (out.length < 2) out.push({ id: "snooze", label: "Snooze 3 days", tone: "gold", icon: "Clock" });
    return out.slice(0, 2);
  }
  if (lastAgent.kind === "viz" && lastAgent.viz.kind === "linecard") {
    return [
      { id: "by-segment", label: "Break down by segment", tone: "blue", icon: "ChartPie" },
      { id: "open-portfolio", label: "Open Portfolio", tone: "violet", icon: "BarChart3", navigateTo: "/portfolio" },
    ];
  }
  if (lastAgent.kind === "viz" && lastAgent.viz.kind === "checklist") {
    return [
      { id: "next", label: "What's next?", tone: "blue", icon: "ArrowRight" },
      { id: "critical", label: "Show critical only", tone: "red", icon: "AlertTriangle" },
    ];
  }
  if (lastAgent.kind === "viz" && (lastAgent.viz.kind === "donut" || lastAgent.viz.kind === "bars")) {
    return [
      { id: "by-cat", label: "Try a different cut", tone: "blue", icon: "ChartPie" },
      { id: "summary", label: "Just summarize", tone: "violet", icon: "Sparkles" },
    ];
  }
  if (lastAgent.kind === "navigate") return [];
  if (lastAgent.kind === "text" && lastAgent.suggestions?.length) return lastAgent.suggestions.slice(0, 2);

  const ut = (lastUser?.text || "").toLowerCase();
  if (/(how (do|to)|help|deal|next|what should)/.test(ut)) {
    return [
      { id: "draft", label: "Draft the next email", tone: "blue", icon: "Mail" },
      { id: "summary", label: "Summarize for me", tone: "violet", icon: "Sparkles" },
    ];
  }
  return pageDefaults.slice(0, 2);
}

function PlaybookViz({ viz }: { viz: Extract<VizSpec, { kind: "playbook" }> }) {
  const { go } = useCompanion();
  const hasSteps = (viz.steps?.length ?? 0) > 0;
  const [openDraft, setOpenDraft] = useState(!!viz.draft);
  const [sent, setSent] = useState(false);
  const [editTo, setEditTo] = useState(viz.draft?.to ?? "");
  const [editCc, setEditCc] = useState("");
  const [editBcc, setEditBcc] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [editSubject, setEditSubject] = useState(viz.draft?.subject ?? "");
  const [editBody, setEditBody] = useState(viz.draft?.body ?? "");
  const [stepDone, setStepDone] = useState<Set<number>>(
    () => new Set((viz.steps ?? []).map((s, i) => s.done ? i : -1).filter(i => i >= 0))
  );
  const tone = viz.specialist.tone ?? "blue";
  const toneBg: Record<string, string> = {
    blue: N, gold: G, violet: "#7B2FBE", emerald: "#10B981",
  };
  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${BDL}`, background: "white",
      boxShadow: "0 4px 14px rgba(0,0,0,0.06)", overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${BDL}`,
        background: `linear-gradient(90deg, ${N}08, transparent)`,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: toneBg[tone], color: "white",
          display: "grid", placeItems: "center",
        }}>
          <Users size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, color: TT, lineHeight: 1 }}>
            Specialist · {viz.specialist.role}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: TD, marginTop: 2 }}>{viz.specialist.name}</div>
        </div>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: `${N}19`, display: "grid", placeItems: "center" }}>
          <ClipboardList size={13} color={N} />
        </div>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TD, marginBottom: 4 }}>{viz.title}</div>
        {viz.intro && <p style={{ fontSize: 12.5, lineHeight: 1.55, color: TM, margin: "0 0 10px" }}>{viz.intro}</p>}
        {hasSteps && (
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {viz.steps.map((s, i) => {
              const ok = stepDone.has(i);
              return (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <button
                    onClick={() => setStepDone(prev => {
                      const n = new Set(prev);
                      if (n.has(i)) n.delete(i); else n.add(i);
                      return n;
                    })}
                    aria-label={ok ? "Mark incomplete" : "Mark done"}
                    style={{
                      marginTop: 3, width: 16, height: 16, borderRadius: 9999,
                      border: ok ? `2px solid ${N}` : `2px solid ${BD}`,
                      background: ok ? N : "white",
                      display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
                    }}>
                    {ok && <Check size={10} color="white" strokeWidth={3} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.4, color: ok ? TT : TD, textDecoration: ok ? "line-through" : "none" }}>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: TT, marginRight: 6 }}>{String(i + 1).padStart(2, "0")}</span>
                      {s.label}
                    </div>
                    {s.detail && <div style={{ fontSize: 11.5, color: TT, marginTop: 2, lineHeight: 1.4 }}>{s.detail}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {viz.draft && (
          <div style={{ marginTop: hasSteps ? 12 : 0, borderRadius: 10, border: `1px solid ${BDL}`, overflow: "hidden", background: BG }}>
            <button onClick={() => setOpenDraft(o => !o)}
              style={{
                width: "100%", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
                fontSize: 11.5, fontWeight: 700, color: TM,
                background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
              }}>
              <Mail size={13} />
              <span>{viz.draft.kind === "email" ? "Drafted email · editable" : "Drafted note · editable"}</span>
              <ChevronRight size={13} style={{ marginLeft: "auto", transform: openDraft ? "rotate(90deg)" : "none", transition: "transform 0.18s" }} />
            </button>
            {openDraft && (
              <div style={{ borderTop: `1px solid ${BDL}`, background: "white", padding: 12, fontSize: 12, color: TD, animation: "uwc-fade-in 0.2s ease-out", display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: TT, width: 52, flexShrink: 0 }}>To</span>
                  <input
                    value={editTo}
                    onChange={(e) => setEditTo(e.target.value)}
                    style={{ flex: 1, fontFamily: font, fontSize: 12, padding: "6px 8px", border: `1px solid ${BDL}`, borderRadius: 6, outline: "none", color: TD }}
                  />
                  {!showCcBcc && (
                    <button
                      type="button"
                      onClick={() => setShowCcBcc(true)}
                      title="Add Cc / Bcc"
                      style={{
                        fontFamily: font, fontSize: 11, fontWeight: 700, color: N,
                        background: "transparent", border: "none", cursor: "pointer",
                        padding: "4px 6px", flexShrink: 0,
                      }}>
                      Cc/Bcc
                    </button>
                  )}
                </label>
                {showCcBcc && (
                  <>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: TT, width: 52, flexShrink: 0 }}>Cc</span>
                      <input
                        value={editCc}
                        onChange={(e) => setEditCc(e.target.value)}
                        placeholder="optional"
                        style={{ flex: 1, fontFamily: font, fontSize: 12, padding: "6px 8px", border: `1px solid ${BDL}`, borderRadius: 6, outline: "none", color: TD }}
                      />
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: TT, width: 52, flexShrink: 0 }}>Bcc</span>
                      <input
                        value={editBcc}
                        onChange={(e) => setEditBcc(e.target.value)}
                        placeholder="optional"
                        style={{ flex: 1, fontFamily: font, fontSize: 12, padding: "6px 8px", border: `1px solid ${BDL}`, borderRadius: 6, outline: "none", color: TD }}
                      />
                      <button
                        type="button"
                        onClick={() => { setShowCcBcc(false); setEditCc(""); setEditBcc(""); }}
                        title="Hide Cc / Bcc"
                        style={{
                          fontFamily: font, fontSize: 11, fontWeight: 700, color: TT,
                          background: "transparent", border: "none", cursor: "pointer",
                          padding: "4px 6px", flexShrink: 0,
                        }}>
                        Hide
                      </button>
                    </label>
                  </>
                )}
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: TT, width: 52, flexShrink: 0 }}>Subject</span>
                  <input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    style={{ flex: 1, fontFamily: font, fontSize: 12, padding: "6px 8px", border: `1px solid ${BDL}`, borderRadius: 6, outline: "none", color: TD }}
                  />
                </label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={12}
                  style={{ width: "100%", fontFamily: font, fontSize: 12.5, lineHeight: 1.55, padding: 10, border: `1px solid ${BDL}`, borderRadius: 6, outline: "none", color: TD, resize: "vertical", minHeight: 180 }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {viz.primaryCta && (
        <div style={{ borderTop: `1px solid ${BDL}`, display: "flex" }}>
          <button
            onClick={() => {
              if (viz.primaryCta!.action === "navigate" && viz.primaryCta!.href) {
                go(viz.primaryCta!.href);
              } else if (viz.primaryCta!.action === "send-draft" && viz.draft) {
                const params: string[] = [
                  `subject=${encodeURIComponent(editSubject)}`,
                  `body=${encodeURIComponent(editBody)}`,
                ];
                if (editCc.trim())  params.push(`cc=${encodeURIComponent(editCc.trim())}`);
                if (editBcc.trim()) params.push(`bcc=${encodeURIComponent(editBcc.trim())}`);
                const url = `mailto:${encodeURIComponent(editTo)}?${params.join("&")}`;
                window.location.href = url;
                setSent(true);
              } else {
                setSent(true);
              }
            }}
            disabled={sent && viz.primaryCta.action !== "navigate"}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 14px", fontSize: 12.5, fontWeight: 700,
              background: sent && viz.primaryCta.action !== "navigate" ? "#E8F5EC" : `${N}0A`,
              color: sent && viz.primaryCta.action !== "navigate" ? "#1A5C30" : N,
              border: "none", cursor: "pointer",
            }}>
            {sent && viz.primaryCta.action !== "navigate"
              ? <><Check size={14} /> {viz.primaryCta.action === "send-draft" ? "Sent" : "Done"}</>
              : <>{viz.primaryCta.action === "send-draft" ? <Send size={13} /> : <ChevronRight size={13} />}{viz.primaryCta.label}</>}
          </button>
          {viz.contextRef?.href && (
            <button onClick={() => go(viz.contextRef!.href!)}
              style={{ padding: "10px 14px", borderLeft: `1px solid ${BDL}`, fontSize: 12, fontWeight: 600, color: TT, background: "transparent", border: "none", cursor: "pointer" }}>
              {viz.contextRef.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Specialist agent registry + intent detectors ───────────────────────────
type Specialist = {
  name: string; role: string; tone: "blue" | "gold" | "violet" | "emerald";
  build: (taskTitle: string, ctx: { submission: string; broker?: string }) => {
    intro: string;
    steps: { label: string; detail?: string }[];
    draft?: { kind: "email" | "note"; to?: string; subject?: string; body: string };
    primaryCta?: { label: string; action: "send-draft" | "open-task" | "navigate"; href?: string };
  };
};

const SPECIALISTS: Record<string, Specialist> = {
  broker: {
    name: "Devon Carter", role: "Broker Outreach Specialist", tone: "blue",
    build: (title, ctx) => ({
      intro: `Here's a clean broker-outreach play for "${title}". I've prepped the email and a 48-hr follow-up so nothing slips.`,
      steps: [
        { label: "Pull broker contact + UE submission ref", detail: `${ctx.submission} · ${ctx.broker ?? "broker on file"}` },
        { label: "Draft outreach email (loss runs + open claim detail)", detail: "Pre-filled below — review before sending." },
        { label: "Set 48-hr follow-up reminder", detail: "Auto-files a Task if no reply." },
        { label: "Log broker promise + escalate on slip", detail: "Slipped promises route to UW lead automatically." },
      ],
      draft: {
        kind: "email",
        to: ctx.broker ?? "broker@partner.com",
        subject: `${ctx.submission} — open claims detail request`,
        body: `Hi,\n\nFor ${ctx.submission} I'm preparing the indication and need open-claims detail (incurred + reserves) on any open files referenced in the prior carrier loss runs.\n\nThanks,\nUE Underwriting`,
      },
      primaryCta: { label: "Send draft", action: "send-draft" },
    }),
  },
  compliance: {
    name: "Priya Shah", role: "Compliance & Forms Specialist", tone: "gold",
    build: (title, ctx) => ({
      intro: `Walking the compliance checklist for "${title}". I'll flag any UE-required addendum that's missing for ${ctx.submission}.`,
      steps: [
        { label: "Pull UE-required forms for this risk tier" },
        { label: "Cross-check submitted vs required" },
        { label: "Trigger missing-document request to broker" },
        { label: "Mark compliance verified once received" },
      ],
      primaryCta: { label: "Trigger document request", action: "send-draft" },
    }),
  },
  review: {
    name: "John Michaels", role: "Risk Review Specialist", tone: "violet",
    build: (title, ctx) => ({
      intro: `Standard review play for "${title}". I'll surface anything that crosses a referral trigger on ${ctx.submission}.`,
      steps: [
        { label: "Open the report and extract the headline metric" },
        { label: "Compare against UE thresholds" },
        { label: "Document conclusion in the submission notes" },
        { label: "Route to senior UW if a trigger fires" },
      ],
      primaryCta: { label: "Open submission", action: "navigate", href: `/submission/${ctx.submission}` },
    }),
  },
  pricing: {
    name: "Maya Khanna", role: "Pricing & Quote Specialist", tone: "blue",
    build: (title, ctx) => ({
      intro: `Indicative-quote play for "${title}". I've laid out the rate path and the broker letter is ready.`,
      steps: [
        { label: "Confirm target premium against rate factor band" },
        { label: "Generate indicative quote letter" },
        { label: "Route to broker (CC: UW lead)" },
        { label: "Log the indication + 7-day expiration" },
      ],
      primaryCta: { label: "Send indication", action: "send-draft" },
    }),
  },
  inspection: {
    name: "James Owens", role: "Loss-Control Coordinator", tone: "emerald",
    build: (title, ctx) => ({
      intro: `Setting up the loss-control inspection for "${title}". Standard COPE survey + sprinkler verification on ${ctx.submission}.`,
      steps: [
        { label: "Confirm inspector availability for the territory" },
        { label: "Send scheduling email to risk manager" },
        { label: "File COPE template + sprinkler addendum requirements" },
        { label: "Add follow-up task at T+10 days for the report" },
      ],
      primaryCta: { label: "Send scheduling email", action: "send-draft" },
    }),
  },
};

function pickSpecialist(taskTitle: string): Specialist {
  const t = taskTitle.toLowerCase();
  if (/quote|indicat|pric|premium|rate/.test(t)) return SPECIALISTS.pricing!;
  if (/inspect|survey|loss[\s-]?control|cope/.test(t)) return SPECIALISTS.inspection!;
  if (/review|report|gasb|naic|cross[\s-]?check/.test(t)) return SPECIALISTS.review!;
  if (/verif|background|compliance|missing|addendum|questionnaire/.test(t)) return SPECIALISTS.compliance!;
  return SPECIALISTS.broker!;
}

function tryTaskHelpIntent(raw: string): CompanionMsg | null {
  const text = raw.toLowerCase();
  const askVerb = /(how (do|to|should) i|how (do|to) (we|you)|help me (with|on|deal)|deal with|walk me through|what (do|should) i do|next steps?|can you help)/i.test(text);
  if (!askVerb) return null;
  // Extract a plausible task phrase (everything after the verb).
  const m = raw.match(/(?:help me (?:with|on)|how (?:do|to|should) i|walk me through|deal with|next steps? (?:on|for)?|can you help (?:with|on)?)\s+(.{4,80})/i);
  const taskTitle = (m?.[1] ?? raw).replace(/[?.!]+$/, "").trim();
  const spec = pickSpecialist(taskTitle);
  const built = spec.build(taskTitle, { submission: "this submission" });
  return {
    id: newId(), role: "agent", kind: "viz", ts: now(),
    viz: {
      kind: "playbook",
      title: taskTitle,
      specialist: { name: spec.name, role: spec.role, tone: spec.tone },
      intro: built.intro,
      steps: built.steps,
      draft: built.draft,
      primaryCta: built.primaryCta,
    },
  };
}

const ROUTES: { match: RegExp; href: string; label: string }[] = [
  { match: /\bnew (submission|account|risk)\b/i, href: "/submissions/new", label: "New submission" },
  { match: /\bsubmissions?\b(?! (id|number|#))/i, href: "/submissions", label: "Submissions" },
  { match: /\binbox\b|\bemails?\b|\bmessages?\b/i, href: "/inbox", label: "Inbox" },
  { match: /\btasks?\b|\bto[\s-]?dos?\b/i, href: "/tasks", label: "Tasks" },
  { match: /\bportfolio\b|\banalytics\b|\bbook (health|performance)\b|\bdashboard\b/i, href: "/portfolio", label: "Portfolio" },
  { match: /\bappetite\b/i, href: "/appetite", label: "Appetite" },
  { match: /\b(workbench|home|today|main)\b/i, href: "/", label: "Workbench" },
  { match: /\brenewals?\b/i, href: "/renewals", label: "Renewals" },
  { match: /\bapprovals?\b/i, href: "/approvals", label: "Approvals" },
  { match: /\bnotifications?\b/i, href: "/notifications", label: "Notifications" },
  { match: /\bactivity\b/i, href: "/activity", label: "Activity" },
];

function tryNavIntent(raw: string, history: CompanionMsg[]): { href: string; label: string; confirmation: string } | null {
  const text = raw.toLowerCase().trim();
  const hasNavVerb = /\b(take me|go to|open|navigate|show me|jump to|head to|bring me|let'?s go|move to|switch to)\b/.test(text)
                  || /^(take|open|navigate|show|jump|move|switch|bring)/.test(text);
  if (!hasNavVerb) return null;

  const subMatch = raw.match(/\b(SUB-?\d{3,5})\b/i);
  if (subMatch) {
    const id = subMatch[1]!.toUpperCase().replace(/^SUB(?!-)/, "SUB-");
    return { href: `/submission/${id}`, label: id, confirmation: `On it — opening ${id}.` };
  }
  const direct = ROUTES.find(r => r.match.test(text));
  if (direct) return { href: direct.href, label: direct.label, confirmation: `On it — taking you to ${direct.label}.` };

  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i]!;
    if (m.role !== "agent") continue;
    const body = m.kind === "text" ? m.text : m.kind === "navigate" ? m.text : m.kind === "viz" ? (("title" in m.viz) ? m.viz.title : "") : "";
    if (!body) continue;
    const found = ROUTES.find(r => r.match.test(body));
    if (found) return { href: found.href, label: found.label, confirmation: `Got it — opening ${found.label}.` };
  }
  return null;
}

const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const MONTH_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SEGMENTS: { match: RegExp; label: string; base: number; trend: number }[] = [
  { match: /\bk[\s-]?12 public\b|public school/i, label: "K-12 Public", base: 920_000, trend: 1.06 },
  { match: /\bk[\s-]?12 private\b|private school/i, label: "K-12 Private", base: 410_000, trend: 1.04 },
  { match: /\bhigher\s?ed|university|college\b/i, label: "Higher Ed", base: 780_000, trend: 1.05 },
  { match: /\bcharter\b/i, label: "Charter", base: 180_000, trend: 1.03 },
  { match: /\bcyber\b/i, label: "Cyber Liability", base: 240_000, trend: 1.08 },
  { match: /\beducators?\s?legal|epl\b/i, label: "Educators Legal Liability", base: 540_000, trend: 1.04 },
];

function tryChartIntent(raw: string): CompanionMsg | null {
  const text = raw.toLowerCase();
  const askedForChart = /\b(show|plot|chart|graph|trend|monthly|over time|by month|by quarter|view dashboard)\b/.test(text);
  if (!askedForChart) return null;

  const range = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s*(?:to|through|-|–)\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*/i);
  let months: string[] = [];
  if (range) {
    const norm = (s: string) => s.slice(0, 3).toLowerCase();
    const a = MONTHS.indexOf(norm(range[1]));
    const b = MONTHS.indexOf(norm(range[2]));
    if (a >= 0 && b >= 0) {
      const lo = Math.min(a, b), hi = Math.max(a, b);
      months = MONTH_LONG.slice(lo, hi + 1).map(m => m.slice(0, 3));
    }
  }
  if (!months.length) {
    const d = new Date(); const cur = d.getMonth();
    months = Array.from({ length: 6 }, (_, i) => MONTH_LONG[(cur - 5 + i + 12) % 12].slice(0, 3));
  }

  const seg = SEGMENTS.find(s => s.match.test(text)) ?? SEGMENTS[0]!;
  const data = months.map((m, i) => {
    const drift = Math.pow(seg.trend, i);
    const noise = 0.92 + (((i * 9301 + 49297) % 233) / 233) * 0.16;
    return { label: m, value: Math.round((seg.base * drift * noise) / 1_000) * 1_000 };
  });

  const isLossRatio = /\bloss ratio|lr\b/.test(text);
  const isBindRate = /\bbind rate|hit ratio\b/.test(text);
  if (isLossRatio) {
    const lrSeries = months.map((m, i) => ({ label: m, value: Math.max(28, Math.min(72, 46 + Math.round(Math.sin(i) * 6))) }));
    return { id: newId(), role: "agent", kind: "viz", ts: now(),
      viz: { kind: "linecard", title: `${seg.label} loss ratio`, intro: `${seg.label} loss-ratio trend — within target band.`, data: lrSeries, yFormat: "percent", cta: "add-to-dashboard", dashboardHref: "/" } };
  }
  if (isBindRate) {
    const brSeries = months.map((m, i) => ({ label: m, value: Math.max(20, Math.min(48, 32 + Math.round(Math.cos(i) * 5))) }));
    return { id: newId(), role: "agent", kind: "viz", ts: now(),
      viz: { kind: "linecard", title: `${seg.label} bind rate`, intro: `${seg.label} bind rate by month — tracking the book average.`, data: brSeries, yFormat: "percent", cta: "add-to-dashboard", dashboardHref: "/" } };
  }

  const total = data.reduce((a, d) => a + d.value, 0);
  const totalFmt = total >= 1_000_000 ? `$${(total / 1_000_000).toFixed(1)}M` : `$${Math.round(total / 1_000)}K`;
  return {
    id: newId(), role: "agent", kind: "viz", ts: now(),
    viz: {
      kind: "linecard",
      title: `${seg.label} monthly placed premium`,
      intro: `${seg.label} placed premium for the requested period totals ${totalFmt} — steady momentum versus baseline.`,
      data, yFormat: "currency", cta: "add-to-dashboard", dashboardHref: "/",
    },
  };
}

function niceCeil(n: number): number {
  if (n <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const m = n / pow;
  const nice = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return nice * pow;
}

function RingViz({ viz }: { viz: Extract<VizSpec, { kind: "ring" }> }) {
  const circ = 2 * Math.PI * 32;
  const off = circ - (viz.value / 100) * circ;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r="32" stroke={BDL} strokeWidth="9" fill="none" />
          <circle cx="50" cy="50" r="32" stroke="url(#ring-grad)" strokeWidth="9" fill="none" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={off} />
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={N} /><stop offset="100%" stopColor={G} />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: TD }}>{viz.value}</div>
            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: TT, marginTop: 2 }}>/ 100</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {viz.bars?.map(b => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
              <span style={{ color: TT }}>{b.label}</span>
              <span style={{ fontWeight: 800, fontFamily: "ui-monospace, monospace", color: TD }}>{b.value}</span>
            </div>
            <div style={{ height: 4, borderRadius: 9999, background: BDL, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${b.value}%`, background: b.tone === "gold" ? G : N }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarsViz({ viz }: { viz: Extract<VizSpec, { kind: "bars" }> }) {
  const max = Math.max(...viz.series.map(s => s.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {viz.series.map(s => {
        const c = s.tone === "gold" ? G : s.tone === "green" ? "#10B981" : s.tone === "red" ? "#E11D48" : N;
        return (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: TD }}>{s.label}</span>
              <span style={{ fontWeight: 800, fontFamily: "ui-monospace, monospace", color: TD }}>{s.value}{viz.unit ?? ""}</span>
            </div>
            <div style={{ height: 8, borderRadius: 9999, background: BDL, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(s.value / max) * 100}%`, background: c }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SparkViz({ viz }: { viz: Extract<VizSpec, { kind: "spark" }> }) {
  const max = Math.max(...viz.data); const min = Math.min(...viz.data); const span = max - min || 1;
  const points = viz.data.map((v, i) => `${(i / (viz.data.length - 1)) * 100},${100 - ((v - min) / span) * 90 - 5}`).join(" ");
  const stroke = viz.tone === "gold" ? G : viz.tone === "green" ? "#10B981" : viz.tone === "red" ? "#E11D48" : N;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: TD }}>{viz.current}</div>
          {viz.delta && <div style={{ fontSize: 10, fontWeight: 700, color: "#15803D" }}>{viz.delta}</div>}
        </div>
        {viz.subtitle && <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, color: TT }}>{viz.subtitle}</div>}
      </div>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: 80 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sg-${viz.title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" points={points} vectorEffect="non-scaling-stroke" />
        <polyline points={`0,100 ${points} 100,100`} fill={`url(#sg-${viz.title})`} stroke="none" />
      </svg>
    </div>
  );
}

function DonutViz({ viz }: { viz: Extract<VizSpec, { kind: "donut" }> }) {
  const total = viz.segments.reduce((a, s) => a + s.value, 0) || 1;
  let off = 0;
  const C = 2 * Math.PI * 30;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg viewBox="0 0 80 80" style={{ width: 96, height: 96, transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r="30" fill="none" stroke={BDL} strokeWidth="11" />
        {viz.segments.map(s => {
          const len = (s.value / total) * C;
          const el = <circle key={s.label} cx="40" cy="40" r="30" fill="none" stroke={s.color} strokeWidth="11" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />;
          off += len;
          return el;
        })}
      </svg>
      <ul style={{ flex: 1, listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
        {viz.segments.map(s => (
          <li key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: TD }}>{s.label}</span>
            <span style={{ fontWeight: 800, fontFamily: "ui-monospace, monospace", color: TD }}>{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChecklistViz({ viz }: { viz: Extract<VizSpec, { kind: "checklist" }> }) {
  const { go } = useCompanion();
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {viz.items.map((it, i) => {
        const clickable = Boolean(it.href);
        const content = (
          <>
            <span style={{
              width: 20, height: 20, borderRadius: 9999,
              display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2,
              background: it.ok ? "#E8F5EC" : "#FFF4E0",
              color: it.ok ? "#1A5C30" : "#8A5C00",
            }}>
              {it.ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: TD, lineHeight: 1.3 }}>{it.label}</div>
              {it.sub && <div style={{ fontSize: 10, color: TT, marginTop: 2 }}>{it.sub}</div>}
            </div>
            {clickable && <ChevronRight size={12} color={TT} style={{ marginTop: 4, flexShrink: 0 }} />}
          </>
        );
        if (clickable) {
          return (
            <li key={i} style={{ listStyle: "none" }}>
              <button
                onClick={() => go(it.href!)}
                style={{
                  width: "100%", display: "flex", alignItems: "flex-start", gap: 8,
                  padding: 6, borderRadius: 8, background: "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  fontFamily: font, transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F2F5F9")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {content}
              </button>
            </li>
          );
        }
        return (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 6, borderRadius: 8 }}>
            {content}
          </li>
        );
      })}
    </ul>
  );
}

// ── Background-job tray ────────────────────────────────────────────────────
export function CompanionBackgroundTray() {
  const { jobs, dismissJob, go, collapsed } = useCompanion();
  if (!jobs.length) return null;
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={{
        position: "fixed", top: 80, zIndex: 50,
        right: collapsed ? 80 : 320,
        display: "flex", flexDirection: "column", gap: 8,
        maxWidth: 360, pointerEvents: "none",
        fontFamily: font,
      }}>
        {jobs.map(job => (
          <div key={job.id}
            style={{
              pointerEvents: "auto", borderRadius: 14,
              border: `1px solid ${BDL}`, background: "rgba(255,255,255,0.95)",
              boxShadow: "0 16px 36px rgba(0,0,0,0.14)",
              overflow: "hidden", animation: "uwc-slide-in-right 0.2s ease-out",
            }}>
            <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                position: "relative", width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${N}, ${G})`,
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                <Sparkles size={15} color="white" />
                {!job.done && <span style={{
                  position: "absolute", top: -3, right: -3, width: 10, height: 10,
                  borderRadius: 9999, background: "#10B981",
                  border: "2px solid white", animation: "uwc-pulse 1.4s infinite",
                }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: TD, lineHeight: 1.3 }}>{job.title}</div>
                <div style={{ fontSize: 10, color: TT, marginTop: 2 }}>{job.subtitle}</div>
              </div>
              <button onClick={() => dismissJob(job.id)}
                style={{ width: 22, height: 22, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <X size={12} color={TT} />
              </button>
            </div>
            <div style={{ height: 4, background: BDL }}>
              <div style={{
                height: "100%", width: `${job.progress}%`,
                background: job.done ? "#10B981" : `linear-gradient(90deg, ${N}, ${G})`,
                transition: "width 0.4s",
              }} />
            </div>
            <div style={{ padding: "8px 14px", borderTop: `1px solid ${BDL}`, background: BG }}>
              <div style={{ fontSize: 11, color: TD, lineHeight: 1.4, minHeight: 16 }}>
                {job.done ? "Done — comprehension complete." : (job.steps[Math.min(job.stepIdx, job.steps.length - 1)] ?? "Working…")}
              </div>
              {job.done && job.href && (
                <button onClick={() => { go(job.href!); dismissJob(job.id); }}
                  style={{
                    marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 11, fontWeight: 700, color: N,
                    background: "transparent", border: "none", cursor: "pointer",
                  }}>
                  Open submission <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
