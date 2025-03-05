
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

  if (error.message?.includes("Email not confirmed")) {
    return {
      title: "Email Not Confirmed",
      message: "Please check your inbox for the confirmation email, or request a new confirmation email.",
    };
  }

  return {
    title: "Authentication Error",
    message: error.message || "An error occurred during authentication",
  };
};
