import React from "react";

const DiscoverTab = ({
  filteredRecommendations,
  searchQuery,
  formatCreatedDate,
}) => {
  return (
    <div className="pb-6">
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.groupId}
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              style={{
                backgroundColor: "#1a1a1a",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 2px #14b8a6";
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
                    <div className="text-sm text-gray-400">Members</div>
                    <div className="text-xl font-bold text-white">
                      {recommendation.memberCount}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {recommendation.groupName}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {recommendation.groupDescription ||
                    "No description available"}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                  <span className="text-teal-400 font-medium">
                    {recommendation.mutualFriendsCount} mutual friends
                  </span>
                  <span>{formatCreatedDate(recommendation.createdAt)}</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  Created by{" "}
                  <span className="text-white font-medium">
                    {recommendation.creatorName !== "null null"
                      ? recommendation.creatorName
                      : recommendation.creatorEmail}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{ backgroundColor: "#0f9488", color: "#fff" }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#14b8a6";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#0f9488";
                    }}
                  >
                    Request to Join
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{
                      backgroundColor: "#3a3a3a",
                      color: "#d1d5db",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#4a4a4a";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#3a3a3a";
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
          <h3 className="text-2xl font-bold text-white mb-2">
            {searchQuery
              ? "No Recommendations Found"
              : "No Recommendations Available"}
          </h3>
          <p className="text-gray-400 mb-8">
            {searchQuery
              ? `No recommendations match "${searchQuery}"`
              : "Connect with friends to discover groups they've created"}
          </p>
          {!searchQuery && (
            <button
              className="text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: "#14b8a6" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#0f9488")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#14b8a6")}
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
