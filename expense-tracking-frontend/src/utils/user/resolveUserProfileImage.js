export const resolveUserProfileImage = (user) => {
  if (!user) {
    return "";
  }

  return (
    user.profileImage ||
    user.image ||
    user.oauthProfileImage ||
    ""
  );
};

export const normalizeUserProfile = (user) => {
  if (!user) {
    return user;
  }

  const profileImage = resolveUserProfileImage(user);
  return {
    ...user,
    profileImage,
    image: profileImage,
  };
};
