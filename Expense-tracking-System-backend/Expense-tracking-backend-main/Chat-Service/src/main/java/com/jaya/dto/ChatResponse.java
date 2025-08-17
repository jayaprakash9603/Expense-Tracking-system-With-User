package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatResponse {
    private Integer id;
    private Integer senderId;
    private Integer recipientId;
    private Integer groupId;
    private String content;

    // Sender details
    private String email;
    private String username;
    private String firstName;
    private String lastName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    // Read status fields
    private Boolean isRead;
    private Boolean isReadByCurrentUser;
    private Set<Integer> readByUsers;
    private Integer readCount;

    // Delivery status fields
    private Boolean isDelivered;
    private Boolean isDeliveredByCurrentUser;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deliveredAt;
    private Set<Integer> deliveredToUsers;

    // Deletion status fields
    private Boolean isDeletedByCurrentUser;
    private Boolean isDeletedBySender;
    private Boolean wasDeleted;

    // Edit information
    private Boolean isEdited;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editedAt;

    // Reply information
    private Integer replyToMessageId;

    // Forward information
    private Boolean isForwarded;
    private Integer forwardedFromMessageId;

    // Media information
    private Boolean isMediaMessage;
    private String mediaUrl;
    private String mediaType;

    // Pin information
    private Boolean isPinned;
    private Integer pinnedBy;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime pinnedAt;

    // Reactions
    private Map<String, List<Integer>> reactions;

    // Constructors
    public ChatResponse() {}

    public ChatResponse(Integer id, Integer senderId, Integer recipientId, Integer groupId,
                        String content, LocalDateTime timestamp) {
        this.id = id;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.groupId = groupId;
        this.content = content;
        this.timestamp = timestamp;
    }

    // Getters and Setters

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
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

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Boolean getIsReadByCurrentUser() {
        return isReadByCurrentUser;
    }

    public void setIsReadByCurrentUser(Boolean isReadByCurrentUser) {
        this.isReadByCurrentUser = isReadByCurrentUser;
    }

    public Set<Integer> getReadByUsers() {
        return readByUsers;
    }

    public void setReadByUsers(Set<Integer> readByUsers) {
        this.readByUsers = readByUsers;
    }

    public Integer getReadCount() {
        return readCount;
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

    public Boolean getIsDeliveredByCurrentUser() {
        return isDeliveredByCurrentUser;
    }

    public void setIsDeliveredByCurrentUser(Boolean isDeliveredByCurrentUser) {
        this.isDeliveredByCurrentUser = isDeliveredByCurrentUser;
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
        this.deliveredToUsers = deliveredToUsers;
    }

    public Boolean getIsDeletedByCurrentUser() {
        return isDeletedByCurrentUser;
    }

    public void setIsDeletedByCurrentUser(Boolean isDeletedByCurrentUser) {
        this.isDeletedByCurrentUser = isDeletedByCurrentUser;
    }

    public Boolean getIsDeletedBySender() {
        return isDeletedBySender;
    }

    public void setIsDeletedBySender(Boolean isDeletedBySender) {
        this.isDeletedBySender = isDeletedBySender;
    }

    public Boolean getWasDeleted() {
        return wasDeleted;
    }

    public void setWasDeleted(Boolean wasDeleted) {
        this.wasDeleted = wasDeleted;
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
        this.reactions = reactions;
    }

    // Utility methods
    public boolean isOneToOneChat() {
        return recipientId != null && groupId == null;
    }

    public boolean isGroupChat() {
        return groupId != null && recipientId == null;
    }

    public boolean hasMedia() {
        return isMediaMessage != null && isMediaMessage && mediaUrl != null && !mediaUrl.isEmpty();
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

    public boolean isDeletedMessage() {
        return wasDeleted != null && wasDeleted;
    }

    @Override
    public String toString() {
        return "ChatResponse{" +
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
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ChatResponse that = (ChatResponse) o;

        return id != null ? id.equals(that.id) : that.id == null;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}