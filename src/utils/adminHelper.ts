// Helper function to get admin status based on isBlocked
export const getAdminStatus = (isBlocked: boolean) => {
  return isBlocked ? "Blocked" : "Active";
};

// Helper function to get status colors
export const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return { bg: "#E8F5E8", color: "#22C55E", border: "#A5D6A7" };
    case "Blocked":
      return { bg: "#FFEBEE", color: "#FF5630", border: "#EF9A9A" };
    default:
      return { bg: "#FFF8E1", color: "#FFAB00", border: "#FFD54F" };
  }
};

// Helper function to get role display name
export const getRoleDisplayName = (role: string) => {
  if (!role) return "Unknown";
  switch (role) {
    case "Super":
      return "Super Admin";
    case "Sub":
      return "Sub Admin";
    case "User":
      return "User";
    default:
      return role;
  }
};

// Helper function to get role color
export const getRoleColor = (role: string) => {
  if (!role) return { bg: "#E3F2FD", color: "#1976D2", border: "#BBDEFB" };
  switch (role) {
    case "Super":
      return { bg: "#FEF3C7", color: "#D97706", border: "#FDE68A" };
    case "Sub":
      return { bg: "#E3F2FD", color: "#1976D2", border: "#BBDEFB" };
    case "User":
      return { bg: "#F3E5F5", color: "#7B1FA2", border: "#E1BEE7" };
    default:
      return { bg: "#E3F2FD", color: "#1976D2", border: "#BBDEFB" };
  }
};

// Helper function to get safe email initial
export const getEmailInitial = (email: string) => {
  if (!email || typeof email !== "string") return "?";
  return email.charAt(0).toUpperCase();
};
