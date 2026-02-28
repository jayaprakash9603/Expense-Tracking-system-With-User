package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "chats", indexes = {
    // Single column indexes for common lookups
    @Index(name = "idx_chat_sender_id", columnList = "sender_id"),
    @Index(name = "idx_chat_recipient_id", columnList = "recipient_id"),
    @Index(name = "idx_chat_group_id", columnList = "group_id"),
    @Index(name = "idx_chat_timestamp", columnList = "timestamp"),
    @Index(name = "idx_chat_is_read", columnList = "is_read"),
    
    // Composite indexes for conversation queries (most common access patterns)
    @Index(name = "idx_chat_sender_recipient_time", columnList = "sender_id, recipient_id, timestamp"),
    @Index(name = "idx_chat_recipient_sender_time", columnList = "recipient_id, sender_id, timestamp"),
    @Index(name = "idx_chat_group_time", columnList = "group_id, timestamp"),
    
    // Composite indexes for unread message queries
    @Index(name = "idx_chat_recipient_unread", columnList = "recipient_id, is_read"),
    @Index(name = "idx_chat_group_sender", columnList = "group_id, sender_id"),
    
    // Index for media and pinned message queries
    @Index(name = "idx_chat_media", columnList = "is_media_message"),
    @Index(name = "idx_chat_pinned", columnList = "is_pinned")
})
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sender_id", nullable = false)
    private Integer senderId;

    @Column(name = "recipient_id")
    private Integer recipientId;

    @Column(name = "group_id")
    private Integer groupId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @ElementCollection
    @CollectionTable(name = "chat_read_by_users", joinColumns = @JoinColumn(name = "chat_id"))
    @Column(name = "user_id")
    @org.hibernate.annotations.BatchSize(size = 32)
    private Set<Integer> readByUsers = new HashSet<>();
    @Column(name = "read_count")
    private Integer readCount = 0;

    @Column(name = "is_delivered")
    private Boolean isDelivered = false;

    @Column(name = "delivered_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deliveredAt;

    @ElementCollection
    @CollectionTable(name = "chat_delivered_to_users", joinColumns = @JoinColumn(name = "chat_id"))
    @Column(name = "user_id")
    @org.hibernate.annotations.BatchSize(size = 32)
    private Set<Integer> deliveredToUsers = new HashSet<>();

    @Column(name = "deleted_by_sender")
    private Boolean deletedBySender = false;

    @Column(name = "deleted_by_recipient")
    private Boolean deletedByRecipient = false;

    @ElementCollection
    @CollectionTable(name = "chat_deleted_by_users", joinColumns = @JoinColumn(name = "chat_id"))
    @Column(name = "user_id")
    @org.hibernate.annotations.BatchSize(size = 32)
    private Set<Integer> deletedByUsers = new HashSet<>();

    @Column(name = "is_edited")
    private Boolean isEdited = false;

    @Column(name = "edited_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editedAt;

    @Column(name = "reply_to_message_id")
    private Integer replyToMessageId;

    @Column(name = "is_forwarded")
    private Boolean isForwarded = false;

    @Column(name = "forwarded_from_message_id")
    private Integer forwardedFromMessageId;

    @Column(name = "is_media_message")
    private Boolean isMediaMessage = false;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "media_type")
    private String mediaType;

    @Column(name = "is_pinned")
    private Boolean isPinned = false;

    @Column(name = "pinned_by")
    private Integer pinnedBy;

    @Column(name = "pinned_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime pinnedAt;

    @ElementCollection
    @CollectionTable(name = "chat_reactions", joinColumns = @JoinColumn(name = "chat_id"))
    @MapKeyColumn(name = "reaction_type")
    @Column(name = "user_id")
    private Map<String, List<Integer>> reactions = new HashMap<>();

    @Column(name = "is_self_destructing")
    private Boolean isSelfDestructing = false;

    @Column(name = "self_destruct_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime selfDestructTime;

    @Column(name = "self_destruct_duration_seconds")
    private Integer selfDestructDurationSeconds;

    @Column(name = "is_self_destructed")
    private Boolean isSelfDestructed = false;

    public Chat() {
        this.timestamp = LocalDateTime.now();
    }

    public Chat(Integer senderId, Integer recipientId, String content) {
        this();
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.content = content;
    }

    public Chat(Integer senderId, Integer groupId, String content, boolean isGroupChat) {
        this();
        this.senderId = senderId;
        this.groupId = groupId;
        this.content = content;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSenderId() {
        return senderId;
    }

    public void setSenderId(Integer senderId) {
        this.senderId = senderId;
    }

    public Integer getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Integer recipientId) {
        this.recipientId = recipientId;
    }

    public Integer getGroupId() {
        return groupId;
    }

    public void setGroupId(Integer groupId) {
        this.groupId = groupId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean isRead() {
        return isRead != null ? isRead : false;
    }

    public void setRead(Boolean read) {
        isRead = read;
    }

    public Set<Integer> getReadByUsers() {
        return readByUsers;
    }

    public void setReadByUsers(Set<Integer> readByUsers) {
        this.readByUsers = readByUsers != null ? readByUsers : new HashSet<>();
    }

    public Integer getReadCount() {
        return readCount != null ? readCount : 0;
    }

    public void setReadCount(Integer readCount) {
        this.readCount = readCount;
    }

    public Boolean getIsDelivered() {
        return isDelivered;
    }

    public void setIsDelivered(Boolean isDelivered) {
        this.isDelivered = isDelivered;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public Set<Integer> getDeliveredToUsers() {
        return deliveredToUsers;
    }

    public void setDeliveredToUsers(Set<Integer> deliveredToUsers) {
        this.deliveredToUsers = deliveredToUsers != null ? deliveredToUsers : new HashSet<>();
    }

    public Boolean getDeletedBySender() {
        return deletedBySender;
    }

    public void setDeletedBySender(Boolean deletedBySender) {
        this.deletedBySender = deletedBySender;
    }

    public Boolean getDeletedByRecipient() {
        return deletedByRecipient;
    }

    public void setDeletedByRecipient(Boolean deletedByRecipient) {
        this.deletedByRecipient = deletedByRecipient;
    }

    public Set<Integer> getDeletedByUsers() {
        return deletedByUsers;
    }

    public void setDeletedByUsers(Set<Integer> deletedByUsers) {
        this.deletedByUsers = deletedByUsers != null ? deletedByUsers : new HashSet<>();
    }

    public Boolean getIsEdited() {
        return isEdited;
    }

    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }

    public LocalDateTime getEditedAt() {
        return editedAt;
    }

    public void setEditedAt(LocalDateTime editedAt) {
        this.editedAt = editedAt;
    }

    public Integer getReplyToMessageId() {
        return replyToMessageId;
    }

    public void setReplyToMessageId(Integer replyToMessageId) {
        this.replyToMessageId = replyToMessageId;
    }

    public Boolean getIsForwarded() {
        return isForwarded;
    }

    public void setIsForwarded(Boolean isForwarded) {
        this.isForwarded = isForwarded;
    }

    public Integer getForwardedFromMessageId() {
        return forwardedFromMessageId;
    }

    public void setForwardedFromMessageId(Integer forwardedFromMessageId) {
        this.forwardedFromMessageId = forwardedFromMessageId;
    }

    public Boolean getIsMediaMessage() {
        return isMediaMessage;
    }

    public void setIsMediaMessage(Boolean isMediaMessage) {
        this.isMediaMessage = isMediaMessage;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
    }

    public Integer getPinnedBy() {
        return pinnedBy;
    }

    public void setPinnedBy(Integer pinnedBy) {
        this.pinnedBy = pinnedBy;
    }

    public LocalDateTime getPinnedAt() {
        return pinnedAt;
    }

    public void setPinnedAt(LocalDateTime pinnedAt) {
        this.pinnedAt = pinnedAt;
    }

    public Map<String, List<Integer>> getReactions() {
        return reactions;
    }

    public void setReactions(Map<String, List<Integer>> reactions) {
        this.reactions = reactions != null ? reactions : new HashMap<>();
    }

    public boolean isOneToOneChat() {
        return recipientId != null && groupId == null;
    }

    public boolean isGroupChat() {
        return groupId != null && recipientId == null;
    }

    public void markAsReadByUser(Integer userId) {
        if (readByUsers == null) {
            readByUsers = new HashSet<>();
        }
        if (readByUsers.add(userId)) {
            readCount = readByUsers.size();
        }
    }

    public boolean isReadByUser(Integer userId) {
        return readByUsers != null && readByUsers.contains(userId);
    }

    public Boolean getIsSelfDestructing() {
        return isSelfDestructing;
    }

    public void setIsSelfDestructing(Boolean isSelfDestructing) {
        this.isSelfDestructing = isSelfDestructing;
    }

    public LocalDateTime getSelfDestructTime() {
        return selfDestructTime;
    }

    public void setSelfDestructTime(LocalDateTime selfDestructTime) {
        this.selfDestructTime = selfDestructTime;
    }

    public Integer getSelfDestructDurationSeconds() {
        return selfDestructDurationSeconds;
    }

    public void setSelfDestructDurationSeconds(Integer selfDestructDurationSeconds) {
        this.selfDestructDurationSeconds = selfDestructDurationSeconds;
    }

    public Boolean getIsSelfDestructed() {
        return isSelfDestructed;
    }

    public void setIsSelfDestructed(Boolean isSelfDestructed) {
        this.isSelfDestructed = isSelfDestructed;
    }

    public boolean isSelfDestructingMessage() {
        return isSelfDestructing != null && isSelfDestructing;
    }

    public boolean isSelfDestructedMessage() {
        return isSelfDestructed != null && isSelfDestructed;
    }

    public boolean shouldSelfDestruct() {
        return isSelfDestructingMessage() &&
                selfDestructTime != null &&
                LocalDateTime.now().isAfter(selfDestructTime) &&
                !isSelfDestructedMessage();
    }

    public void setSelfDestructTimer(int durationInSeconds) {
        this.isSelfDestructing = true;
        this.selfDestructDurationSeconds = durationInSeconds;
        this.selfDestructTime = LocalDateTime.now().plusSeconds(durationInSeconds);
    }

    public void markAsSelfDestructed() {
        this.isSelfDestructed = true;
    }

    @Column(name = "thread_id")
    private String threadId;

    public String getThreadId() {
        return threadId;
    }

    public void setThreadId(String threadId) {
        this.threadId = threadId;
    }

    @Column(name = "starred_by_users")
    @ElementCollection
    @CollectionTable(name = "chat_starred_by_users", joinColumns = @JoinColumn(name = "chat_id"))
    private Set<Integer> starredByUsers = new HashSet<>();

    public Set<Integer> getStarredByUsers() {
        return starredByUsers;
    }

    public void setStarredByUsers(Set<Integer> starredByUsers) {
        this.starredByUsers = starredByUsers != null ? starredByUsers : new HashSet<>();
    }

    public void markAsDeliveredByUser(Integer userId) {
        if (deliveredToUsers == null) {
            deliveredToUsers = new HashSet<>();
        }
        deliveredToUsers.add(userId);
        if (isOneToOneChat() && userId.equals(recipientId)) {
            setIsDelivered(true);
            setDeliveredAt(LocalDateTime.now());
        }
    }

    public boolean isDeliveredByUser(Integer userId) {
        return deliveredToUsers != null && deliveredToUsers.contains(userId);
    }

    public void markAsDeletedBySender() {
        this.deletedBySender = true;
    }

    public void markAsDeletedByRecipient() {
        this.deletedByRecipient = true;
    }

    public void markAsDeletedByUser(Integer userId) {
        if (deletedByUsers == null) {
            deletedByUsers = new HashSet<>();
        }
        deletedByUsers.add(userId);
    }

    public boolean isDeletedByUser(Integer userId) {
        if (isOneToOneChat()) {
            if (userId.equals(senderId)) {
                return deletedBySender != null && deletedBySender;
            } else if (userId.equals(recipientId)) {
                return deletedByRecipient != null && deletedByRecipient;
            }
        } else if (isGroupChat()) {
            if (userId.equals(senderId)) {
                return deletedBySender != null && deletedBySender;
            } else {
                return deletedByUsers != null && deletedByUsers.contains(userId);
            }
        }
        return false;
    }

    public boolean isCompletelyDeleted() {
        if (isOneToOneChat()) {
            return (deletedBySender != null && deletedBySender) &&
                    (deletedByRecipient != null && deletedByRecipient);
        }
        return false;
    }

    public String getDisplayContent(Integer currentUserId) {
        if (isDeletedByUser(currentUserId)) {
            return null;
        }

        if (isOneToOneChat()) {
            if (currentUserId.equals(recipientId) && deletedBySender != null && deletedBySender) {
                return "🚫 This message was deleted";
            }
        } else if (isGroupChat()) {
            if (!currentUserId.equals(senderId) && deletedBySender != null && deletedBySender) {
                return "🚫 This message was deleted";
            }
        }

        return content;
    }

    public void addReaction(Integer userId, String reaction) {
        if (reactions == null) {
            reactions = new HashMap<>();
        }

        reactions.values().forEach(userList -> userList.remove(userId));

        reactions.computeIfAbsent(reaction, k -> new ArrayList<>()).add(userId);

        reactions.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }

    public void removeReaction(Integer userId, String reaction) {
        if (reactions != null && reactions.containsKey(reaction)) {
            reactions.get(reaction).remove(userId);
            if (reactions.get(reaction).isEmpty()) {
                reactions.remove(reaction);
            }
        }
    }

    public boolean hasReactionFromUser(Integer userId, String reaction) {
        return reactions != null &&
                reactions.containsKey(reaction) &&
                reactions.get(reaction).contains(userId);
    }

    public int getReactionCount(String reaction) {
        return reactions != null && reactions.containsKey(reaction) ? reactions.get(reaction).size() : 0;
    }

    public boolean hasMedia() {
        return isMediaMessage != null && isMediaMessage &&
                mediaUrl != null && !mediaUrl.trim().isEmpty();
    }

    public boolean isImageMessage() {
        return hasMedia() && mediaType != null && mediaType.startsWith("image/");
    }

    public boolean isVideoMessage() {
        return hasMedia() && mediaType != null && mediaType.startsWith("video/");
    }

    public boolean isAudioMessage() {
        return hasMedia() && mediaType != null && mediaType.startsWith("audio/");
    }

    public boolean isDocumentMessage() {
        return hasMedia() && mediaType != null &&
                (mediaType.startsWith("application/") || mediaType.startsWith("text/"));
    }

    public boolean isReply() {
        return replyToMessageId != null;
    }

    public boolean isForwardedMessage() {
        return isForwarded != null && isForwarded;
    }

    public boolean isEditedMessage() {
        return isEdited != null && isEdited;
    }

    public boolean isPinnedMessage() {
        return isPinned != null && isPinned;
    }

    public boolean hasReactions() {
        return reactions != null && !reactions.isEmpty();
    }

    public boolean isRecentMessage() {
        return timestamp != null && timestamp.isAfter(LocalDateTime.now().minusHours(24));
    }

    public boolean canBeEdited(Integer userId) {
        return senderId.equals(userId) &&
                timestamp != null &&
                timestamp.isAfter(LocalDateTime.now().minusMinutes(15)) &&
                !isDeletedByUser(userId);
    }

    public boolean canBeDeleted(Integer userId) {
        if (isOneToOneChat()) {
            return senderId.equals(userId) || recipientId.equals(userId);
        } else if (isGroupChat()) {
            return true;
        }
        return false;
    }

    @Override
    public String toString() {
        return "Chat{" +
                "id=" + id +
                ", senderId=" + senderId +
                ", recipientId=" + recipientId +
                ", groupId=" + groupId +
                ", content='" + content + '\'' +
                ", timestamp=" + timestamp +
                ", isRead=" + isRead +
                ", isDelivered=" + isDelivered +
                ", isEdited=" + isEdited +
                ", isForwarded=" + isForwarded +
                ", isMediaMessage=" + isMediaMessage +
                ", isPinned=" + isPinned +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;

        Chat chat = (Chat) o;

        return id != null ? id.equals(chat.id) : chat.id == null;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}