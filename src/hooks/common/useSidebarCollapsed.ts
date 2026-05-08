import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { setSidebarCollapsed } from '@/store/ui/uiSlice';

export function useSidebarCollapsed(): [boolean, () => void] {
  const dispatch  = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  const toggle = () => dispatch(setSidebarCollapsed(!collapsed));

  return [collapsed, toggle];
}
