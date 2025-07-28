import { useNavigate } from '@solidjs/router';
import { JSX, Show } from 'solid-js';
import { usePathname } from '~/hooks/usePathname';

export function Layout(props: { title?: string; children: JSX.Element }) {
  const pathname = usePathname();
  const navigate = useNavigate();

  const handleBack = () => {
    if (pathname() !== import.meta.env.SERVER_BASE_URL) {
      navigate(-1);
    }
  };

  return (
    <div class="mx-auto flex h-full max-w-xl flex-col pt-8">
      <Show when={pathname() !== import.meta.env.SERVER_BASE_URL}>
        <div class="mb-4">
          <button
            class="cursor-pointer opacity-50 hover:underline hover:opacity-100"
            onClick={handleBack}
          >
            {'<-'} Back
          </button>
        </div>
      </Show>

      <Show when={props.title}>
        {title => (
          <h1 class="mb-4 text-2xl font-bold text-gray-700 opacity-70">
            {title()}
          </h1>
        )}
      </Show>
      {props.children}

      <footer class="mt-auto pt-16 text-xs text-gray-400">
        <div class="flex flex-row justify-between py-6">
          <a
            class="underline hover:text-black"
            href="https://github.com/natebuckareff/hit"
          >
            Repository
          </a>

          <a
            class="underline hover:text-black"
            href={`https://github.com/natebuckareff/hit/commit/${import.meta.env.VITE_COMMIT_HASH}`}
          >
            {import.meta.env.VITE_COMMIT_HASH.slice(0, 7)}
          </a>
        </div>
      </footer>
    </div>
  );
}
