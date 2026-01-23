import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { GameLobby } from './pages/GameLobby';
import { MultiplayerGame } from './pages/MultiplayerGame';
import { ErrorBoundary } from './components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,  // Single player game
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/multiplayer',
    element: <GameLobby />,  // Create/join lobby
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/game/:sessionCode',
    element: <ErrorBoundary><MultiplayerGame /></ErrorBoundary>,  // Multiplayer game session with error boundary
  },
]);
