export interface Routine {
  id: string;
  name: string;
  items: IHitItem[];
}

export interface IHitItem {
  id: string;
  name: string;
  duration: number;
  flash: boolean;
}

export function getTotalDuration(routine: Routine) {
  return routine.items.reduce((acc, item) => acc + item.duration, 0);
}

export function renderTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const cutoff = seconds % 60;
  return {
    minutes: minutes.toString().padStart(2, '0'),
    seconds: cutoff.toString().padStart(2, '0'),
  };
}

export function loadRoutines() {
  const routines = localStorage.getItem('hit:routines');
  if (routines) {
    return JSON.parse(routines);
  }
  return [];
}

export function storeRoutines(routines: Routine[]) {
  localStorage.setItem('hit:routines', JSON.stringify(routines));
}

export function asset(file: string) {
  return `${import.meta.env.SERVER_BASE_URL}/${file}`;
}
