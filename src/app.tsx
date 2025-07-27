import { MetaProvider } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { Suspense } from 'solid-js';
import { FileRoutes } from '@solidjs/start/router';
import './app.css';

export default function App() {
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
