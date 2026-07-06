import { Login } from "./pages/Login";

export default function App() {
  const handleNavigate = (page: string) => {
    console.log('Navigate to:', page);
  };

  return <Login onNavigate={handleNavigate} />;
}
