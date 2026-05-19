import { usePageCompanion, type PageContext } from "./CompanionContext";

// Tiny declarative helper so any page can register its companion context with one element.
export function PageRegister(ctx: PageContext) {
  usePageCompanion(ctx);
  return null;
}
