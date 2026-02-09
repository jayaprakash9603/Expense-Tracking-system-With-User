package com.jaya.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.FriendActivityDTO;
import com.jaya.models.FriendActivity;
import com.jaya.repository.FriendActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FriendActivityService {

    private final FriendActivityRepository friendActivityRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<FriendActivityDTO> getActivitiesForUser(Integer userId) {
        log.debug("Fetching activities for user: {}", userId);
        List<FriendActivity> activities = friendActivityRepository.findByTargetUserIdOrderByTimestampDesc(userId);
        return activities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<FriendActivityDTO> getActivitiesForUser(Integer userId, int page, int size) {
        log.debug("Fetching activities for user: {}, page: {}, size: {}", userId, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<FriendActivity> activities = friendActivityRepository.findByTargetUserIdOrderByTimestampDesc(userId,
                pageable);
        return activities.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<FriendActivityDTO> getUnreadActivitiesForUser(Integer userId) {
        log.debug("Fetching unread activities for user: {}", userId);
        List<FriendActivity> activities = friendActivityRepository
                .findByTargetUserIdAndIsReadFalseOrderByTimestampDesc(userId);
        return activities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendActivityDTO> getActivitiesByService(Integer userId, String service) {
        log.debug("Fetching activities for user: {} from service: {}", userId, service);
        FriendActivity.SourceService sourceService = FriendActivity.SourceService.valueOf(service.toUpperCase());
        List<FriendActivity> activities = friendActivityRepository
                .findByTargetUserIdAndSourceServiceOrderByTimestampDesc(userId, sourceService);
        return activities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendActivityDTO> getActivitiesByFriend(Integer userId, Integer friendId) {
        log.debug("Fetching activities for user: {} by friend: {}", userId, friendId);
        List<FriendActivity> activities = friendActivityRepository
                .findByTargetUserIdAndActorUserIdOrderByTimestampDesc(userId, friendId);
        return activities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendActivityDTO> getRecentActivities(Integer userId, int days) {
        log.debug("Fetching activities for user: {} from last {} days", userId, days);
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<FriendActivity> activities = friendActivityRepository.findRecentActivities(userId, since);
        return activities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Integer userId) {
        return friendActivityRepository.countByTargetUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long activityId) {
        log.debug("Marking activity as read: {}", activityId);
        friendActivityRepository.markAsRead(activityId);
    }

    @Transactional
    public int markAllAsRead(Integer userId) {
        log.debug("Marking all activities as read for user: {}", userId);
        return friendActivityRepository.markAllAsReadForUser(userId);
    }

    @Transactional
    public int deleteOldActivities(int daysOld) {
        log.info("Deleting activities older than {} days", daysOld);
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        return friendActivityRepository.deleteActivitiesOlderThan(cutoffDate);
    }

    private FriendActivityDTO mapToDTO(FriendActivity activity) {
        return FriendActivityDTO.builder()
                .id(activity.getId())
                .targetUserId(activity.getTargetUserId())
                .actorUserId(activity.getActorUserId())
                .actorUserName(activity.getActorUserName())
                .sourceService(activity.getSourceService() != null ? activity.getSourceService().name() : null)
                .entityType(activity.getEntityType() != null ? activity.getEntityType().name() : null)
                .entityId(activity.getEntityId())
                .action(activity.getAction() != null ? activity.getAction().name() : null)
                .description(activity.getDescription())
                .amount(activity.getAmount())
                .metadata(activity.getMetadata())
                .timestamp(activity.getTimestamp())
                .isRead(activity.getIsRead())
                .createdAt(activity.getCreatedAt())
                .actionText(buildActionText(activity))
                .icon(getIconForAction(activity))
                .actorUser(parseUserInfo(activity.getActorUserJson()))
                .targetUser(parseUserInfo(activity.getTargetUserJson()))
                .entityPayload(parseJsonMap(activity.getEntityPayloadJson()))
                .previousEntityState(parseJsonMap(activity.getPreviousEntityStateJson()))
                .actorIpAddress(activity.getActorIpAddress())
                .actorUserAgent(activity.getActorUserAgent())
                .build();
    }

    private FriendActivityDTO.UserInfoDTO parseUserInfo(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, FriendActivityDTO.UserInfoDTO.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse user info JSON: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> parseJsonMap(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse JSON map: {}", e.getMessage());
            return null;
        }
    }

    private String buildActionText(FriendActivity activity) {
        String actorName = activity.getActorUserName() != null ? activity.getActorUserName() : "A friend";
        String action = activity.getAction() != null ? activity.getAction().name().toLowerCase()
                : "performed an action on";
        String entityType = activity.getEntityType() != null ? activity.getEntityType().name().toLowerCase() : "item";

        if (activity.getAction() == null) {
            return actorName + " " + action + " a " + entityType;
        }
        switch (activity.getAction()) {
            case CREATE:
                return actorName + " added a new " + entityType;
            case UPDATE:
                return actorName + " updated a " + entityType;
            case DELETE:
                return actorName + " deleted a " + entityType;
            case COPY:
                return actorName + " copied a " + entityType;
            default:
                return actorName + " " + action + " a " + entityType;
        }
    }

    private String getIconForAction(FriendActivity activity) {
        if (activity.getEntityType() == null) {
            return "activity";
        }

        switch (activity.getEntityType()) {
            case EXPENSE:
                return activity.getAction() == FriendActivity.Action.DELETE ? "expense-remove" : "expense-add";
            case BUDGET:
                return "budget";
            case BILL:
                return "bill";
            case CATEGORY:
                return "category";
            case PAYMENT_METHOD:
                return "payment";
            case FRIEND:
            case FRIEND_REQUEST:
                return "friend";
            default:
                return "activity";
        }
    }
}
