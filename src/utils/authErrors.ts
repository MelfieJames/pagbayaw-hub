export const getAuthErrorMessage = (error: any): { title: string; message: string } => {
  if (error.message?.includes("User already registered")) {
    return {
      title: "Authentication Error",
      message: "Invalid admin credentials. Please check your password.",
    };
  }

  if (error.message?.includes("Invalid login credentials")) {
    return {
      title: "Authentication Error",
      message: "Invalid email or password. Please check your credentials.",
    };
  }

  return {
    title: "Authentication Error",
    message: error.message || "An error occurred during authentication",
  };
};