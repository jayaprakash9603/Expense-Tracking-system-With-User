package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.share.CreateShareRequest;
import com.jaya.dto.share.ShareResponse;
import com.jaya.dto.share.SharedDataResponse;
import com.jaya.service.FriendshipNotificationService;
import com.jaya.service.QrCodeService;
import com.jaya.service.SharedResourceService;
import com.jaya.service.UserAddedItemsService;
import com.jaya.testutil.FriendShipTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShareController.class)
class ShareControllerIntegrationTest {

    private static final String SHARE_TOKEN = "share-token-100";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SharedResourceService sharedResourceService;

    @MockBean
    private IUserServiceClient userClient;

    @MockBean
    private QrCodeService qrCodeService;

    @MockBean
    private FriendshipNotificationService notificationService;

    @MockBean
    private UserAddedItemsService userAddedItemsService;

    private UserDTO requesterUser;

    @BeforeEach
    void setUp() {
        requesterUser = FriendShipTestDataFactory.buildRequesterUser();
        when(userClient.getUserProfile(FriendShipTestDataFactory.TEST_JWT)).thenReturn(requesterUser);
    }

    @Nested
    @DisplayName("POST /api/shares")
    class CreateShare {

        @Test
        @DisplayName("shouldCreateShareAndReturn201")
        void shouldCreateShareAndReturn201() throws Exception {
            CreateShareRequest request = FriendShipTestDataFactory.buildCreateShareRequest();
            ShareResponse response = ShareResponse.builder()
                    .id(1L)
                    .token(SHARE_TOKEN)
                    .resourceType(request.getResourceType())
                    .permission(request.getPermission())
                    .isActive(true)
                    .build();
            when(sharedResourceService.createShare(any(CreateShareRequest.class), eq(FriendShipTestDataFactory.TEST_USER_ID), any()))
                    .thenReturn(response);

            mockMvc.perform(post("/api/shares")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.token").value(SHARE_TOKEN))
                    .andExpect(jsonPath("$.isActive").value(true));
        }
    }

    @Nested
    @DisplayName("GET /api/shares/{token}")
    class AccessShare {

        @Test
        @DisplayName("shouldReturnShareData")
        void shouldReturnShareData() throws Exception {
            SharedDataResponse response = SharedDataResponse.builder()
                    .isValid(true)
                    .build();
            when(sharedResourceService.accessShare(eq(SHARE_TOKEN), any())).thenReturn(response);

            mockMvc.perform(get("/api/shares/" + SHARE_TOKEN))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isValid").value(true));
        }
    }

    @Nested
    @DisplayName("DELETE /api/shares/{token}")
    class RevokeShare {

        @Test
        @DisplayName("shouldRevokeShareAndReturn200")
        void shouldRevokeShareAndReturn200() throws Exception {
            doNothing().when(sharedResourceService).revokeShare(eq(SHARE_TOKEN), eq(FriendShipTestDataFactory.TEST_USER_ID));

            mockMvc.perform(delete("/api/shares/" + SHARE_TOKEN)
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Share revoked successfully"));
        }
    }

    @Nested
    @DisplayName("GET /api/shares/{token}/validate")
    class ValidateShare {

        @Test
        @DisplayName("shouldReturnValidationResult")
        void shouldReturnValidationResult() throws Exception {
            SharedDataResponse response = SharedDataResponse.builder()
                    .isValid(true)
                    .permission(com.jaya.models.SharePermission.VIEW)
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .shareName("Test Share")
                    .invalidReason("")
                    .build();
            when(sharedResourceService.accessShare(eq(SHARE_TOKEN), eq(null))).thenReturn(response);

            mockMvc.perform(get("/api/shares/" + SHARE_TOKEN + "/validate"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.valid").value(true))
                    .andExpect(jsonPath("$.permission").value("VIEW"));
        }
    }

    @Nested
    @DisplayName("PUT /api/shares/{token}/public")
    class SetSharePublic {

        @Test
        @DisplayName("shouldSetSharePublicAndReturn200")
        void shouldSetSharePublicAndReturn200() throws Exception {
            doNothing().when(sharedResourceService).setSharePublic(eq(SHARE_TOKEN), eq(FriendShipTestDataFactory.TEST_USER_ID), eq(true));

            mockMvc.perform(put("/api/shares/" + SHARE_TOKEN + "/public")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT)
                            .param("isPublic", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value(SHARE_TOKEN))
                    .andExpect(jsonPath("$.isPublic").value(true))
                    .andExpect(jsonPath("$.message").value("Share is now public"));
        }
    }
}
