import { useParams } from '@solidjs/router';
import {
  createSignal,
  For,
  JSX,
  Match,
  onMount,
  Setter,
  Show,
  Switch,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { Layout } from '~/components/Layout';
import { Time } from '~/components/Time';
import { getTotalDuration, loadRoutines, renderTime, Routine } from '~/util';

interface PlayState {
  playing: boolean;
  itemIndex: number;
  time: number;
}

export default function PlayRoutine() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = createSignal(true);
  const [routines, setRoutines] = createStore<Routine[]>([]);
  const [flash, setFlash] = createSignal(0);
  const [state, setState] = createStore<PlayState>({
    playing: false,
    itemIndex: 0,
    time: 0,
  });

  const routine = () => routines.find(r => r.id === params.id);
  const items = () => routine()?.items ?? [];
  const currentItem = () => items()[state.itemIndex];

  const totalDuration = () => {
    const r = routine();
    return r ? getTotalDuration(r) : 0;
  };

  const totalTime = () => {
    let time = state.time;
    for (let i = 0; i < state.itemIndex; i++) {
      time += items()[i].duration;
    }
    return time;
  };

  const updateState = () => {
    if (!state.playing) {
      return;
    }

    const item = currentItem();
    if (!item) {
      return;
    }

    if (state.time >= item.duration - 5 && state.time < item.duration) {
      setFlash(1.0);
    }

    if (state.time >= item.duration) {
      if (state.itemIndex === items().length - 1) {
        finishRoutine();
      } else {
        nextItem(0);
      }
    } else {
      nextSecond();
    }
  };

  const finishRoutine = () => {
    setState(state => ({
      ...state,
      playing: false,
      itemIndex: 0,
      time: 0,
    }));
  };

  const previousItem = () => {
    const prevIndex = Math.max(0, state.itemIndex - 1);
    setState(state => ({
      ...state,
      itemIndex: prevIndex,
      time: 0,
    }));
  };

  const nextItem = (time?: number) => {
    const nextIndex = Math.min(state.itemIndex + 1, items().length - 1);
    setState(state => ({
      ...state,
      itemIndex: nextIndex,
      time: time ?? 0,
    }));
  };

  const nextSecond = () => {
    setState(state => ({
      ...state,
      time: state.time + 1,
    }));
  };

  const previousTenSeconds = () => {
    const nextTime = Math.max(0, state.time - 10);
    setState(state => ({
      ...state,
      time: nextTime,
    }));
  };

  const nextTenSeconds = () => {
    const nextTime = Math.min(state.time + 10, currentItem()?.duration ?? 0);
    setState(state => ({
      ...state,
      time: nextTime,
    }));
  };

  const handlePause = () => {
    setState(state => ({
      ...state,
      playing: false,
    }));
  };

  const handlePlay = () => {
    setState(state => ({
      ...state,
      playing: true,
    }));
  };

  onMount(() => {
    setRoutines(loadRoutines());
    setLoading(false);

    const interval = setInterval(() => {
      updateState();
    }, 1_000);

    return () => clearInterval(interval);
  });

  return (
    <>
      <Layout>
        <Switch>
          <Match when={loading()}>
            <div class="flex flex-col items-center gap-2">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          </Match>

          <Match when={!loading()}>
            <div class="flex flex-col gap-2">
              <div class="flex flex-row items-center justify-between">
                <button
                  class="cursor-pointer text-lg underline"
                  onClick={previousTenSeconds}
                >
                  Back 10s
                </button>

                <button
                  class="cursor-pointer text-lg underline"
                  onClick={previousItem}
                >
                  Back
                </button>

                <Switch>
                  <Match when={state.playing}>
                    <button
                      class="cursor-pointer text-lg underline"
                      onClick={handlePause}
                    >
                      Pause
                    </button>
                  </Match>
                  <Match when={!state.playing}>
                    <button
                      class="cursor-pointer text-lg underline"
                      onClick={handlePlay}
                    >
                      Play
                    </button>
                  </Match>
                </Switch>

                <button
                  class="cursor-pointer text-lg underline"
                  onClick={() => nextItem()}
                >
                  Next
                </button>

                <button
                  class="cursor-pointer text-lg underline"
                  onClick={nextTenSeconds}
                >
                  Forward 10s
                </button>
              </div>

              <Progress
                class="opacity-70"
                color2="bg-blue-400"
                time={totalTime()}
                duration={totalDuration()}
              >
                <div class="flex h-full flex-row items-center justify-between bg-blue-100 px-4 text-4xl font-bold text-blue-950">
                  <div>{routine()?.name ?? ''}</div>
                  <Time {...renderTime(totalTime())} />
                </div>
              </Progress>

              <For each={items()}>
                {(item, index) => (
                  <Switch>
                    <Match when={index() === state.itemIndex}>
                      <Progress
                        class="border-3 border-green-300"
                        color2="bg-green-400"
                        time={state.time}
                        duration={currentItem()?.duration ?? 0}
                      >
                        <div class="flex h-full flex-row items-center justify-between bg-green-100 px-4 text-4xl font-bold text-green-950 opacity-60">
                          <div>{currentItem()?.name ?? ''}</div>
                          <Time {...renderTime(state.time)} />
                        </div>
                      </Progress>
                    </Match>
                    <Match when={index() !== state.itemIndex}>
                      <Progress
                        class="border-3 border-dashed border-gray-300"
                        color2="bg-gray-400"
                        time={0}
                        duration={item.duration}
                      >
                        <div class="flex h-full flex-row items-center justify-between bg-gray-100 px-4 text-4xl font-bold text-gray-950 opacity-60">
                          <div>{item.name ?? ''}</div>
                          <Time {...renderTime(0)} />
                        </div>
                      </Progress>
                    </Match>
                  </Switch>
                )}
              </For>
            </div>
          </Match>
        </Switch>
      </Layout>

      <Flash opacity={flash()} setOpacity={setFlash} />
    </>
  );
}

function Progress(props: {
  class?: string;
  color2?: string;
  time: number;
  duration: number;
  children?: JSX.Element;
}) {
  const width = () => `${(props.time / props.duration) * 100}%`;
  return (
    <div
      style={{ '--width': width() }}
      class={'relative h-[64px] w-full ' + props.class}
    >
      <div class={'h-full ' + props.color2} style={{ width: 'var(--width)' }} />
      <Show when={props.children}>
        <div class="absolute inset-0">{props.children}</div>
      </Show>
    </div>
  );
}

function Flash(props: { opacity: number; setOpacity: Setter<number> }) {
  onMount(() => {
    const interval = setInterval(() => {
      props.setOpacity(opacity => Math.max(0, opacity - 0.04));
    }, 16);
    return () => clearInterval(interval);
  });

  return (
    <Show when={props.opacity > 0}>
      <div
        style={{ '--opacity': props.opacity }}
        class="absolute inset-0 bg-white opacity-[var(--opacity)]"
      />
    </Show>
  );
}
