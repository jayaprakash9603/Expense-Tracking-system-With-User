package com.jaya.dto;

import com.jaya.models.AccessLevel;
import com.jaya.models.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipReportDTO {

    // Summary stats
    private int totalFriends;
    private int pendingRequests;
    private int blockedUsers;
    private int iSharedWithCount;
    private int sharedWithMeCount;

    // Access level breakdown
    private Map<String, Integer> accessLevelDistribution;

    // Monthly activity data for charts
    private List<MonthlyActivityDTO> monthlyActivity;

    // Sharing status data
    private List<SharingStatusDTO> sharingStatus;

    // Top active friends
    private List<TopFriendDTO> topFriends;

    // Detailed friendship list (filterable)
    private List<FriendshipDetailDTO> friendships;

    // Filter information applied
    private FilterInfo appliedFilters;

    // Pagination info
    private int totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyActivityDTO {
        private String month;
        private int newFriends;
        private int requestsSent;
        private int requestsReceived;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SharingStatusDTO {
        private String name;
        private int count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopFriendDTO {
        private Integer userId;
        private String name;
        private String email;
        private int interactionScore;
        private String fill; // Color for chart
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendshipDetailDTO {
        private Integer id;
        private Integer friendId;
        private String friendName;
        private String friendEmail;
        private FriendshipStatus status;
        private AccessLevel myAccessLevel;
        private AccessLevel theirAccessLevel;
        private LocalDateTime connectedSince;
        private LocalDateTime lastUpdated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterInfo {
        private LocalDateTime fromDate;
        private LocalDateTime toDate;
        private FriendshipStatus status;
        private AccessLevel accessLevel;
        private String sortBy;
        private String sortDirection;
    }
}
