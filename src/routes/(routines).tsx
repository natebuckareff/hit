import { createStore } from 'solid-js/store';
import {
  getTotalDuration,
  loadRoutines,
  renderTime,
  Routine,
  storeRoutines,
} from '~/util';
import { DndList } from '~/components/DndList';
import { Layout } from '~/components/Layout';
import { createSignal, Match, onMount, Switch } from 'solid-js';
import { A } from '@solidjs/router';
import { nanoid } from 'nanoid';
import { Time } from '~/components/Time';

export default function Routines() {
  const [loading, setLoading] = createSignal(true);
  const [routines, setRoutines] = createStore<Routine[]>([]);

  onMount(() => {
    setRoutines(loadRoutines());
    setLoading(false);
  });

  function handleCreateRoutine() {
    const newRoutine: Routine = {
      id: nanoid(),
      name: 'New routine',
      items: [],
    };

    setRoutines([...routines, newRoutine]);
    storeRoutines(routines);
  }

  return (
    <Layout title="Routines">
      <Switch>
        <Match when={loading()}>
          <div class="flex flex-col items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        </Match>

        <Match when={routines.length === 0}>
          <CreateRoutine onClick={handleCreateRoutine} />
        </Match>

        <Match when={routines.length > 0}>
          <div class="flex flex-col items-stretch gap-2">
            <DndList
              class="flex flex-col gap-2"
              items={routines}
              setItems={setRoutines}
              renderItem={(id, item, dragActivators) => (
                <RoutineItem
                  id={item?.id ?? ''}
                  name={item?.name ?? ''}
                  totalDuration={item ? getTotalDuration(item) : 0}
                  dragActivators={dragActivators}
                  onNameChange={value => {
                    const index = routines.findIndex(item => item.id === id);
                    if (index !== -1) {
                      setRoutines(index, 'name', value);
                      storeRoutines(routines);
                    }
                  }}
                  onDelete={() => {
                    const newRoutines = routines.filter(item => item.id !== id);
                    setRoutines(newRoutines);
                    storeRoutines(newRoutines);
                  }}
                />
              )}
              onChange={storeRoutines}
            />

            <CreateRoutine onClick={handleCreateRoutine} />
          </div>
        </Match>
      </Switch>
    </Layout>
  );
}

function RoutineItem(props: {
  id: string;
  totalDuration: number;
  name: string;
  dragActivators?: Record<string, unknown>;
  onNameChange?: (value: string) => void;
  onFlashChange?: (value: boolean) => void;
  onDelete?: () => void;
}) {
  const time = () => renderTime(props.totalDuration);
  return (
    <div class="flex w-full flex-row items-center gap-4 border p-2">
      <button
        class="relative h-[16px] w-[16px] cursor-grab bg-blue-300 select-none"
        {...props.dragActivators}
      />

      <A href={`/${props.id}/play`} class="cursor-pointer underline">
        Play
      </A>

      <Time {...time()} />

      <input
        class="w-40 border border-gray-600 px-2 py-1"
        type="text"
        placeholder="Name"
        value={props.name}
        onInput={e => props.onNameChange?.(e.target.value)}
      />

      <A href={`/${props.id}/edit`} class="ml-auto cursor-pointer underline">
        Edit
      </A>

      <button
        class="h-[16px] w-[16px] cursor-pointer bg-red-600 select-none"
        onClick={props.onDelete}
      />
    </div>
  );
}

function CreateRoutine(props: { onClick: () => void }) {
  return (
    <div class="flex flex-col items-center rounded-sm border border-dashed border-[rgba(0,0,0,0.50)] p-2">
      <button
        class="cursor-pointer text-[rgba(0,0,0,0.80)] underline"
        onClick={props.onClick}
      >
        Create routine
      </button>
    </div>
  );
}
