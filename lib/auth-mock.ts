// Mock authentication for development phase
// In a real app, this would be replaced with Clerk or NextAuth

export const DEMO_USER_ID = "user_2pvR1V0X5S7uJz9M3n8Q6W4YtLp";

export async function getMockUser() {
  return {
    id: DEMO_USER_ID,
    email: "demo@quantr.app",
    name: "Demo Investor",
    plan: "ELITE"
  };
}
