package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.GroupRequestDTO;
import com.jaya.dto.GroupResponseDTO;
import com.jaya.models.GroupRole;
import com.jaya.service.GroupService;
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

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GroupController.class)
class GroupControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GroupService groupService;

    @MockBean
    private IUserServiceClient userClient;

    private UserDTO requesterUser;

    @BeforeEach
    void setUp() {
        requesterUser = FriendShipTestDataFactory.buildRequesterUser();
        when(userClient.getUserProfile(FriendShipTestDataFactory.TEST_JWT)).thenReturn(requesterUser);
    }

    @Nested
    @DisplayName("POST /api/groups")
    class CreateGroup {

        @Test
        @DisplayName("shouldCreateGroupAndReturn201")
        void shouldCreateGroupAndReturn201() throws Exception {
            GroupRequestDTO request = FriendShipTestDataFactory.buildGroupRequestDTO();
            GroupResponseDTO response = new GroupResponseDTO();
            response.setId(1);
            response.setName(request.getName());
            response.setDescription(request.getDescription());
            response.setCreatedBy(FriendShipTestDataFactory.TEST_USER_ID);
            when(groupService.createGroup(any(GroupRequestDTO.class))).thenReturn(response);

            mockMvc.perform(post("/api/groups")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Trip Group"));
        }
    }

    @Nested
    @DisplayName("GET /api/groups/{groupId}")
    class GetGroupById {

        @Test
        @DisplayName("shouldReturnGroupById")
        void shouldReturnGroupById() throws Exception {
            GroupResponseDTO response = new GroupResponseDTO();
            response.setId(1);
            response.setName("Test Group");
            response.setDescription("Description");
            response.setCreatedBy(FriendShipTestDataFactory.TEST_USER_ID);
            when(groupService.getGroupById(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID)))
                    .thenReturn(Optional.of(response));

            mockMvc.perform(get("/api/groups/1")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Test Group"));
        }

        @Test
        @DisplayName("shouldReturn404WhenGroupNotFound")
        void shouldReturn404WhenGroupNotFound() throws Exception {
            when(groupService.getGroupById(anyInt(), eq(FriendShipTestDataFactory.TEST_USER_ID)))
                    .thenReturn(Optional.empty());

            mockMvc.perform(get("/api/groups/999")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/groups/{groupId}/members/{userId}")
    class AddMemberToGroup {

        @Test
        @DisplayName("shouldAddMemberAndReturn200")
        void shouldAddMemberAndReturn200() throws Exception {
            GroupResponseDTO response = new GroupResponseDTO();
            response.setId(1);
            response.setName("Test Group");
            response.setTotalMembers(2);
            when(groupService.addMemberToGroup(
                    eq(1),
                    eq(FriendShipTestDataFactory.FRIEND_USER_ID),
                    eq(FriendShipTestDataFactory.TEST_USER_ID)))
                    .thenReturn(response);

            mockMvc.perform(post("/api/groups/1/members/" + FriendShipTestDataFactory.FRIEND_USER_ID)
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalMembers").value(2));
        }
    }

    @Nested
    @DisplayName("DELETE /api/groups/{groupId}/members/{userId}")
    class RemoveMemberFromGroup {

        @Test
        @DisplayName("shouldRemoveMemberAndReturn200")
        void shouldRemoveMemberAndReturn200() throws Exception {
            GroupResponseDTO response = new GroupResponseDTO();
            response.setId(1);
            response.setName("Test Group");
            response.setTotalMembers(1);
            when(groupService.removeMemberFromGroup(
                    eq(1),
                    eq(FriendShipTestDataFactory.FRIEND_USER_ID),
                    eq(FriendShipTestDataFactory.TEST_USER_ID)))
                    .thenReturn(response);

            mockMvc.perform(delete("/api/groups/1/members/" + FriendShipTestDataFactory.FRIEND_USER_ID)
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalMembers").value(1));
        }
    }

    @Nested
    @DisplayName("GET /api/groups/{groupId}/permissions")
    class GetUserPermissions {

        @Test
        @DisplayName("shouldReturnPermissionsMap")
        void shouldReturnPermissionsMap() throws Exception {
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("delete_group")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("edit_settings")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("manage_members")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("manage_expenses")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("add_expenses")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("edit_expenses")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("delete_expenses")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("view_expenses")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("promote_members")))
                    .thenReturn(true);
            when(groupService.hasPermissionInGroup(eq(1), eq(FriendShipTestDataFactory.TEST_USER_ID), eq("demote_members")))
                    .thenReturn(true);

            mockMvc.perform(get("/api/groups/1/permissions")
                            .header("Authorization", FriendShipTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.canDeleteGroup").value(true))
                    .andExpect(jsonPath("$.canViewExpenses").value(true));
        }
    }
}
