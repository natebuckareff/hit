import { MetaProvider } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { onMount, Suspense } from 'solid-js';
import { FileRoutes } from '@solidjs/start/router';
import posthog from 'posthog-js';
import './app.css';

export default function App() {
  onMount(() => {
    posthog.init('phc_e8Gkm9i9HlQouMduDjKXUsHVEl033DfplPsp3ccZXl4', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'always',
    });
  });

  return (
    <Router
      base={import.meta.env.SERVER_BASE_URL}
      root={props => (
        <MetaProvider>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
