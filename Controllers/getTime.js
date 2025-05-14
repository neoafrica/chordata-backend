const getTimeAgo = (createdAt) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(createdAt)) / 1000);

    const days = Math.floor(diffInSeconds / (24 * 60 * 60)); // Total days difference
    const hours = Math.floor(diffInSeconds / (60 * 60)); // Total hours difference
    const minutes = Math.floor(diffInSeconds / 60); // Total minutes difference

    const months = Math.floor(days / 30); // Approximate months (30 days in a month)
    const weeks = Math.floor(days / 7); // Weeks (7 days in a week)

    if (months > 0) {
      return `${months} mon ago`;
    } else if (weeks > 0) {
      return `${weeks} w ago`;
    } else if (days > 0) {
      return `${days} d ago`;
    } else if (hours > 0) {
      return `${hours} hr ago`;
    } else if (minutes > 0) {
      return `${minutes} min ago`;
    } else {
      return "Just now";
    }
  };

  module.exports= getTimeAgo