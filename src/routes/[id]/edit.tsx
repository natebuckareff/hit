import { Layout } from '~/components/Layout';
import {
  getTotalDuration,
  IHitItem,
  loadRoutines,
  renderTime,
  Routine,
  storeRoutines,
} from '~/util';
import { A, useParams } from '@solidjs/router';
import { createStore, unwrap } from 'solid-js/store';
import { createSignal, Match, onMount, Show, Switch } from 'solid-js';
import { DndList } from '~/components/DndList';
import { nanoid } from 'nanoid';
import { Time } from '~/components/Time';

const MAX_DURATION = 5999;

export default function EditRoutine() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = createSignal(true);
  const [routines, setRoutines] = createStore<Routine[]>([]);

  const routineIndex = () => routines.findIndex(r => r.id === params.id);
  const routine = () => routines.find(r => r.id === params.id);
  const items = () => routine()?.items ?? [];

  const setItems = (items: IHitItem[]) => {
    const index = routines.findIndex(r => r.id === params.id);
    if (index !== -1) {
      setRoutines(index, 'items', items);
      storeRoutines(routines);
    }
  };

  onMount(() => {
    setRoutines(loadRoutines());
    setLoading(false);
  });

  const handleNameChange = (value: string) => {
    const index = routines.findIndex(r => r.id === params.id);
    if (index !== -1) {
      setRoutines(index, 'name', value);
      storeRoutines(routines);
    }
  };

  const handleAddItem = () => {
    const newItem: IHitItem = {
      id: nanoid(),
      name: 'New item',
      duration: 1,
      flash: true,
    };
    setItems([...items(), newItem]);
  };

  return (
    <Layout>
      <Switch>
        <Match when={loading()}>
          <div class="flex flex-col items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        </Match>

        <Match when={!loading()}>
          <div class="flex flex-col gap-4">
            <div class="flex flex-row items-center gap-2">
              <input
                class="w-1/2 border border-gray-600 px-2 py-1 text-2xl font-bold text-gray-700 opacity-70"
                type="text"
                placeholder="Name"
                value={routine()?.name}
                onInput={e => handleNameChange(e.target.value)}
              />

              <Show when={routine()}>
                {routine => (
                  <Time {...renderTime(getTotalDuration(routine()))} />
                )}
              </Show>

              <A
                href={`/${params.id}/play`}
                class="ml-auto cursor-pointer text-xl underline"
              >
                Play
              </A>
            </div>

            <div class="flex flex-col items-stretch gap-2">
              <DndList
                class="flex flex-col gap-2"
                items={items()}
                setItems={setItems}
                renderItem={(id, item, dragActivators) => (
                  <HitItem
                    id={item?.id ?? ''}
                    name={item?.name ?? ''}
                    duration={item?.duration ?? 0}
                    flash={item?.flash ?? false}
                    dragActivators={dragActivators}
                    onNameChange={value => {
                      const i = routineIndex();
                      const j = items().findIndex(i => i.id === id);
                      if (i !== -1 && j !== -1) {
                        setRoutines(i, 'items', j, 'name', value);
                        storeRoutines(routines);
                      }
                    }}
                    onDurationChange={value => {
                      const i = routineIndex();
                      const j = items().findIndex(i => i.id === id);
                      if (i !== -1 && j !== -1) {
                        setRoutines(i, 'items', j, 'duration', value);
                        storeRoutines(routines);
                      }
                    }}
                    onFlashChange={value => {
                      const i = routineIndex();
                      const j = items().findIndex(i => i.id === id);
                      if (i !== -1 && j !== -1) {
                        setRoutines(i, 'items', j, 'flash', value);
                        storeRoutines(routines);
                      }
                    }}
                    onDelete={() => {
                      const i = routineIndex();
                      if (i !== -1) {
                        const newItems = items().filter(item => item.id !== id);
                        setRoutines(i, 'items', newItems);
                        storeRoutines(routines);
                      }
                    }}
                  />
                )}
                onChange={() => storeRoutines(routines)}
              />

              <AddItem onClick={handleAddItem} />
            </div>
          </div>
        </Match>
      </Switch>
    </Layout>
  );
}

function HitItem(props: {
  id: string;
  duration: number;
  name: string;
  flash: boolean;
  dragActivators?: Record<string, unknown>;
  onNameChange?: (value: string) => void;
  onDurationChange?: (value: number) => void;
  onFlashChange?: (value: boolean) => void;
  onDelete?: () => void;
}) {
  return (
    <div class="flex w-full flex-row items-center gap-4 border p-2">
      <button
        class="relative h-[16px] w-[16px] cursor-grab bg-blue-300 select-none"
        {...props.dragActivators}
      />

      <input
        class="w-40 border border-gray-600 px-2 py-1"
        type="text"
        placeholder="Name"
        value={props.name}
        onInput={e => props.onNameChange?.(e.target.value)}
      />

      <input
        class="w-40 border border-gray-600 px-2 py-1"
        type="number"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="00:00"
        autocomplete="off"
        value={props.duration}
        onInput={e => {
          const n = Math.min(Math.max(1, Number(e.target.value)), MAX_DURATION);
          const s = n.toString();
          e.target.value = s;
          props.onDurationChange?.(n);
        }}
      />

      <Time {...renderTime(props.duration)} />

      <div class="flex flex-row items-center gap-2">
        <input
          id={`flash-${props.id}`}
          type="checkbox"
          checked={props.flash}
          onChange={e => props.onFlashChange?.(e.target.checked)}
        />
        <label class="select-none" for={`flash-${props.id}`}>
          Flash
        </label>
      </div>

      <button
        class="ml-auto h-[16px] w-[16px] cursor-pointer bg-red-600 select-none"
        onClick={props.onDelete}
      />
    </div>
  );
}

function AddItem(props: { onClick: () => void }) {
  return (
    <div class="flex flex-col items-center rounded-sm border border-dashed border-[rgba(0,0,0,0.50)] p-2">
      <button
        class="cursor-pointer text-[rgba(0,0,0,0.80)] underline"
        onClick={props.onClick}
      >
        Add
      </button>
    </div>
  );
}
