// Helper function to format date
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      // hour: '2-digit',
      // minute: '2-digit'
    });
  } catch (error) {
    return "Invalid Date";
  }
};
