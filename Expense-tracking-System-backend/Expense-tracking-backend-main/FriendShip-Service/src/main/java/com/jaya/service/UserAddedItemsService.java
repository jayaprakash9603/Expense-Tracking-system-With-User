package com.jaya.service;

import com.jaya.dto.share.UserAddedItemsDTO;
import com.jaya.models.UserAddedSharedItem;
import com.jaya.repository.UserAddedSharedItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
@Service
@RequiredArgsConstructor
@Slf4j
public class UserAddedItemsService {

    private final UserAddedSharedItemRepository repository;

    @Transactional(readOnly = true)
    public UserAddedItemsDTO getAddedItems(Integer userId, String shareToken) {
        Set<String> addedRefs = repository.findExternalRefsByUserIdAndShareToken(userId, shareToken);

        return UserAddedItemsDTO.builder()
                .userId(userId)
                .shareToken(shareToken)
                .addedExternalRefs(addedRefs)
                .addedCount(addedRefs.size())
                .build();
    }

    @Transactional(readOnly = true)
    public boolean isItemAdded(Integer userId, String shareToken, String externalRef) {
        return repository.existsByUserIdAndShareTokenAndExternalRef(userId, shareToken, externalRef);
    }
    @Transactional
    public UserAddedItemsDTO.AddItemResponse trackAddedItem(
            Integer userId,
            String shareToken,
            UserAddedItemsDTO.AddItemRequest request) {

        log.debug("Tracking added item: userId={}, shareToken={}, ref={}",
                userId, shareToken, request.getExternalRef());
        if (repository.existsByUserIdAndShareTokenAndExternalRef(
                userId, shareToken, request.getExternalRef())) {
            return UserAddedItemsDTO.AddItemResponse.builder()
                    .success(true)
                    .alreadyAdded(true)
                    .message("Item was already added previously")
                    .build();
        }
        UserAddedSharedItem item = UserAddedSharedItem.builder()
                .userId(userId)
                .shareToken(shareToken)
                .externalRef(request.getExternalRef())
                .resourceType(request.getResourceType())
                .originalOwnerId(request.getOriginalOwnerId())
                .newItemId(request.getNewItemId())
                .build();

        item = repository.save(item);

        log.info("Tracked added item: userId={}, shareToken={}, ref={}",
                userId, shareToken, request.getExternalRef());

        return UserAddedItemsDTO.AddItemResponse.builder()
                .success(true)
                .alreadyAdded(false)
                .message("Item tracked successfully")
                .addedAt(item.getAddedAt())
                .build();
    }
    @Transactional
    public UserAddedItemsDTO.BulkAddResponse trackAddedItems(
            Integer userId,
            String shareToken,
            UserAddedItemsDTO.BulkAddRequest request) {

        int successCount = 0;
        int alreadyAddedCount = 0;
        int failedCount = 0;
        List<String> errors = new ArrayList<>();

        for (UserAddedItemsDTO.AddItemRequest item : request.getItems()) {
            try {
                UserAddedItemsDTO.AddItemResponse response = trackAddedItem(userId, shareToken, item);
                if (Boolean.TRUE.equals(response.getSuccess())) {
                    if (Boolean.TRUE.equals(response.getAlreadyAdded())) {
                        alreadyAddedCount++;
                    } else {
                        successCount++;
                    }
                } else {
                    failedCount++;
                    errors.add("Failed to track: " + item.getExternalRef());
                }
            } catch (Exception e) {
                failedCount++;
                errors.add("Error tracking " + item.getExternalRef() + ": " + e.getMessage());
                log.error("Error tracking item {}: {}", item.getExternalRef(), e.getMessage());
            }
        }

        return UserAddedItemsDTO.BulkAddResponse.builder()
                .successCount(successCount)
                .alreadyAddedCount(alreadyAddedCount)
                .failedCount(failedCount)
                .errors(errors)
                .build();
    }
    @Transactional
    public void untrackItem(Integer userId, String shareToken, String externalRef) {
        repository.deleteByUserIdAndShareTokenAndExternalRef(userId, shareToken, externalRef);
        log.info("Untracked item: userId={}, shareToken={}, ref={}", userId, shareToken, externalRef);
    }
    @Transactional(readOnly = true)
    public long getAddedCount(Integer userId, String shareToken) {
        return repository.countByUserIdAndShareToken(userId, shareToken);
    }
}
