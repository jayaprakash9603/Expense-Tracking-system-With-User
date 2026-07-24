import React from "react";
import { resolveUserProfileImage } from "../../../utils/user/resolveUserProfileImage";

const UserAvatar = ({ user }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0)?.toUpperCase() || ""}${
      lastName?.charAt(0)?.toUpperCase() || ""
    }`;
  };

  const getAvatarColor = (id) => {
    const colors = [
      "#8a56e2",
      "#3eb489",
      "#e6a935",
      "#e35353",
      "#5c6bc0",
      "#26a69a",
      "#ec407a",
      "#7e57c2",
    ];
    return colors[id % colors.length];
  };

  const renderAvatar = () => {
    const imageUrl = resolveUserProfileImage(user);
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={`${user.firstName || ""} ${user.lastName || ""}`}
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    }

    return (
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
        style={{
          backgroundColor: getAvatarColor(user?.id || user?.userId || 0),
        }}
      >
        {getInitials(
          user?.firstName || user?.name?.split(" ")[0],
          user?.lastName || user?.name?.split(" ")[1]
        )}
      </div>
    );
  };

  return renderAvatar();
};

export default UserAvatar;
