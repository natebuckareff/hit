import { useLocation } from '@solidjs/router';

export function usePathname() {
  const location = useLocation();
  return () => location.pathname.replace(/\/$/, '');
}
