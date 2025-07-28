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
    <div class="mx-auto max-w-xl py-8">
      <div class="mb-4">
        <Show when={pathname() !== import.meta.env.SERVER_BASE_URL}>
          <button
            class="cursor-pointer opacity-50 hover:underline hover:opacity-100"
            onClick={handleBack}
          >
            {'<-'} Back
          </button>
        </Show>
      </div>

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
