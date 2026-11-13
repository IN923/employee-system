export const getRoleLandingPath = (role) =>
  role?.toLowerCase() === "admin" ? "/dashboard" : "/my-profile";
