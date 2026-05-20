import { useState, useEffect } from "react";
import type { RoleId } from "@/lib/mockData";

const KEY = "uw-workbench:role";
let listeners: Array<(r: RoleId) => void> = [];
let current: RoleId = ((typeof window !== "undefined" && (localStorage.getItem(KEY) as RoleId)) || "uw") as RoleId;

export function useRole() {
  const [roleId, setLocal] = useState<RoleId>(current);
  useEffect(() => {
    const cb = (r: RoleId) => setLocal(r);
    listeners.push(cb);
    return () => { listeners = listeners.filter(l => l !== cb); };
  }, []);
  function setRoleId(r: RoleId) {
    current = r;
    if (typeof window !== "undefined") localStorage.setItem(KEY, r);
    listeners.forEach(l => l(r));
  }
  return { roleId, setRoleId };
}
