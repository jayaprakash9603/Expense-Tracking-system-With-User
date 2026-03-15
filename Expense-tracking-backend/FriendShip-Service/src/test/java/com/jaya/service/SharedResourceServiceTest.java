package com.jaya.service;

import com.jaya.dto.share.CreateShareRequest;
import com.jaya.dto.share.SharedDataResponse;
import com.jaya.dto.share.ShareResponse;
import com.jaya.exceptions.ShareAccessDeniedException;
import com.jaya.exceptions.ShareRateLimitException;
import com.jaya.models.SharedResource;
import com.jaya.models.SharedResourceType;
import com.jaya.models.ShareVisibility;
import com.jaya.repository.ShareAccessLogRepository;
import com.jaya.repository.SharedResourceRepository;
import com.jaya.testutil.FriendShipTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SharedResourceServiceTest {

    @Mock
    private SharedResourceRepository sharedResourceRepository;

    @Mock
    private ShareAccessLogRepository shareAccessLogRepository;

    @Mock
    private SecureTokenService secureTokenService;

    @Mock
    private QrCodeService qrCodeService;

    @Mock
    private com.jaya.common.service.client.IUserServiceClient userClient;

    @Mock
    private ExpenseClient expenseClient;

    @Mock
    private FriendshipService friendshipService;

    @InjectMocks
    private SharedResourceService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "maxSharesPerHour", 10);
        ReflectionTestUtils.setField(service, "maxActiveShares", 50);
        ReflectionTestUtils.setField(service, "shareBaseUrl", "http://localhost:3000");
    }

    @Test
    void createShare_shouldCreateShareWhenWithinRateLimits() {
        CreateShareRequest request = FriendShipTestDataFactory.buildCreateShareRequest();
        SharedResource saved = FriendShipTestDataFactory.buildSharedResource();

        when(sharedResourceRepository.countSharesCreatedSince(any(), any())).thenReturn(5L);
        when(sharedResourceRepository.countActiveSharesByOwner(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(10L);
        when(secureTokenService.generateToken()).thenReturn("generated-token");
        when(sharedResourceRepository.existsByShareToken("generated-token")).thenReturn(false);
        when(sharedResourceRepository.save(any(SharedResource.class))).thenAnswer(inv -> {
            SharedResource sr = inv.getArgument(0);
            sr.setId(1L);
            return sr;
        });
        when(qrCodeService.generateQrCodeDataUri(anyString(), any())).thenReturn("data:image/png;base64,xxx");
        when(qrCodeService.buildShareUrl(anyString(), any())).thenReturn("http://localhost:3000/share/generated-token");

        ShareResponse result = service.createShare(request, FriendShipTestDataFactory.TEST_USER_ID);

        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("generated-token");
        verify(sharedResourceRepository).save(any(SharedResource.class));
    }

    @Test
    void createShare_shouldThrowRateLimitWhenHourlyExceeded() {
        CreateShareRequest request = FriendShipTestDataFactory.buildCreateShareRequest();

        when(sharedResourceRepository.countSharesCreatedSince(any(), any())).thenReturn(10L);

        assertThatThrownBy(() -> service.createShare(request, FriendShipTestDataFactory.TEST_USER_ID))
                .isInstanceOf(ShareRateLimitException.class)
                .hasMessageContaining("Rate limit");

        verify(sharedResourceRepository, never()).save(any());
    }

    @Test
    void createShare_shouldThrowRateLimitWhenActiveSharesExceeded() {
        CreateShareRequest request = FriendShipTestDataFactory.buildCreateShareRequest();

        when(sharedResourceRepository.countSharesCreatedSince(any(), any())).thenReturn(0L);
        when(sharedResourceRepository.countActiveSharesByOwner(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(50L);

        assertThatThrownBy(() -> service.createShare(request, FriendShipTestDataFactory.TEST_USER_ID))
                .isInstanceOf(ShareRateLimitException.class)
                .hasMessageContaining("Maximum active shares");

        verify(sharedResourceRepository, never()).save(any());
    }

    @Test
    void accessShare_shouldReturnInvalidWhenShareRevoked() {
        SharedResource revoked = FriendShipTestDataFactory.buildSharedResource();
        revoked.setIsActive(false);

        when(sharedResourceRepository.findByShareToken("share-token-100")).thenReturn(Optional.of(revoked));

        SharedDataResponse result = service.accessShare("share-token-100", null);

        assertThat(result.getIsValid()).isFalse();
        assertThat(result.getInvalidReason()).contains("revoked");
    }

    @Test
    void accessShare_shouldReturnInvalidWhenShareExpired() {
        SharedResource expired = FriendShipTestDataFactory.buildSharedResource();
        expired.setExpiresAt(LocalDateTime.now().minusDays(1));

        when(sharedResourceRepository.findByShareToken("share-token-100")).thenReturn(Optional.of(expired));

        SharedDataResponse result = service.accessShare("share-token-100", null);

        assertThat(result.getIsValid()).isFalse();
        assertThat(result.getInvalidReason()).contains("expired");
    }

    @Test
    void accessShare_shouldReturnValidResponseForLinkOnlyShare() {
        SharedResource share = FriendShipTestDataFactory.buildSharedResource();
        share.setVisibility(ShareVisibility.LINK_ONLY);

        when(sharedResourceRepository.findByShareToken("share-token-100")).thenReturn(Optional.of(share));
        when(sharedResourceRepository.save(any(SharedResource.class))).thenAnswer(inv -> inv.getArgument(0));

        SharedDataResponse result = service.accessShare("share-token-100", null);

        assertThat(result.getIsValid()).isTrue();
        assertThat(result.getResourceType()).isEqualTo(SharedResourceType.EXPENSE);
        verify(sharedResourceRepository).save(any(SharedResource.class));
    }

    @Test
    void revokeShare_shouldRevokeShareOwnedByUser() {
        SharedResource share = FriendShipTestDataFactory.buildSharedResource();

        when(sharedResourceRepository.findByTokenAndOwner("share-token-100", FriendShipTestDataFactory.TEST_USER_ID))
                .thenReturn(Optional.of(share));
        when(sharedResourceRepository.save(any(SharedResource.class))).thenAnswer(inv -> inv.getArgument(0));

        service.revokeShare("share-token-100", FriendShipTestDataFactory.TEST_USER_ID);

        assertThat(share.getIsActive()).isFalse();
        assertThat(share.getRevokedAt()).isNotNull();
        verify(sharedResourceRepository).save(share);
    }

    @Test
    void revokeShare_shouldThrowWhenShareNotOwned() {
        when(sharedResourceRepository.findByTokenAndOwner("share-token-100", FriendShipTestDataFactory.FRIEND_USER_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.revokeShare("share-token-100", FriendShipTestDataFactory.FRIEND_USER_ID))
                .isInstanceOf(ShareAccessDeniedException.class)
                .hasMessageContaining("permission");
    }
}
