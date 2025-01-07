import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Routes from "./Routes";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes />
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;