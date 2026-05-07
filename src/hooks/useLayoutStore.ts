import { createContext, useContext } from "react";

export interface LayoutState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export const LayoutContext = createContext<LayoutState>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
});

export function useLayout() {
  return useContext(LayoutContext);
}
