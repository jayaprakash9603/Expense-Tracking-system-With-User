import React from "react";
import { useTheme } from "../../hooks/useTheme";

const DiscoverTab = ({
  filteredRecommendations,
  searchQuery,
  formatCreatedDate,
}) => {
  const { colors } = useTheme();
  return (
    <div className="pb-6">
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.recommendationId}
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              style={{
                backgroundColor: colors.card_bg,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary_accent}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{recommendation.avatar}</div>
                  <div className="text-right">
                    <div
                      className="text-sm"
                      style={{ color: colors.placeholder_text }}
                    >
                      Members
                    </div>
                    <div
                      className="text-xl font-bold"
                      style={{ color: colors.primary_text }}
                    >
                      {recommendation.memberCount}
                    </div>
                  </div>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.primary_text }}
                >
                  {recommendation.groupName}
                </h3>
                <p
                  className="text-sm mb-3 line-clamp-2"
                  style={{ color: colors.placeholder_text }}
                >
                  {recommendation.groupDescription ||
                    "No description available"}
                </p>
                <div
                  className="flex justify-between items-center text-sm mb-2"
                  style={{ color: colors.placeholder_text }}
                >
                  <span className="text-teal-400 font-medium">
                    {recommendation.mutualFriendsCount} mutual friends
                  </span>
                  <span>{formatCreatedDate(recommendation.createdAt)}</span>
                </div>
                <div
                  className="text-sm mb-4"
                  style={{ color: colors.placeholder_text }}
                >
                  Created by{" "}
                  <span
                    style={{ color: colors.primary_text, fontWeight: "500" }}
                  >
                    {recommendation.creatorName !== "null null"
                      ? recommendation.creatorName
                      : recommendation.creatorEmail}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{
                      backgroundColor: colors.tertiary_accent,
                      color: colors.button_text,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.primary_accent;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = colors.tertiary_accent;
                    }}
                  >
                    Request to Join
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{
                      backgroundColor: colors.active_bg,
                      color: colors.secondary_text,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.hover_bg;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = colors.active_bg;
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3
            className="text-2xl font-bold mb-2"
            style={{ color: colors.primary_text }}
          >
            {searchQuery
              ? "No Recommendations Found"
              : "No Recommendations Available"}
          </h3>
          <p className="mb-8" style={{ color: colors.placeholder_text }}>
            {searchQuery
              ? `No recommendations match "${searchQuery}"`
              : "Connect with friends to discover groups they've created"}
          </p>
          {!searchQuery && (
            <button
              className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: colors.primary_accent,
                color: colors.button_text,
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = colors.tertiary_accent)
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = colors.primary_accent)
              }
            >
              Find Friends
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscoverTab;
