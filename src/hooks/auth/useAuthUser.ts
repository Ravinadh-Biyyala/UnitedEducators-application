import { useAppSelector } from '@/app/hooks';
import type { User } from '@/shared/types';

export function useAuthUser(): User | null {
  return useAppSelector((state) => state.auth.user);
}
