import { AuthContainer } from './pages/AuthContainer';
import { ErrorTracker } from './components/ErrorTracker';
import { CrashMonitor } from './components/security/CrashMonitor';

function App() {
  return (
    <ErrorTracker>
      <CrashMonitor />
      <AuthContainer />
    </ErrorTracker>
  );
}

export default App;
