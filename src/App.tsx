import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Routes from "./Routes";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/">
          <div className="w-full min-h-screen overflow-x-hidden m-0 p-0">
            <main className="w-full">
              <Routes />
            </main>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}


export default App;
