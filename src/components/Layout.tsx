import { JSX, Show } from 'solid-js';

export function Layout(props: { title?: string; children: JSX.Element }) {
  return (
    <div class="mx-auto max-w-xl py-8">
      <Show when={props.title}>
        {title => (
          <h1 class="mb-4 text-2xl font-bold text-gray-700 opacity-70">
            {title()}
          </h1>
        )}
      </Show>
      {props.children}
    </div>
  );
}
