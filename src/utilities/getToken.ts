const getToken = () => {
  const token = localStorage.getItem("token");
  if (token) return token;
  return null;
};

const getRefreshToken = () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) return refreshToken;
  return null;
};

export { getToken, getRefreshToken };
