import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  isLogin: boolean;
  email: string;
  password: string;
  name: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
}

const LoginForm = ({
  isLogin,
  email,
  password,
  name,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onSubmit,
  onToggleMode,
}: LoginFormProps) => {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isLogin ? "Login" : "Sign Up"}
      </h1>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="John Doe"
              required={!isLogin}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        
        <Button type="submit" className="w-full">
          {isLogin ? "Login" : "Sign Up"}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={onToggleMode}
          className="text-sm text-blue-600 hover:underline"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;