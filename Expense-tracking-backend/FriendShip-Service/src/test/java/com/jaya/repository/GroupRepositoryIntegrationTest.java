package com.jaya.repository;

import com.jaya.models.Group;
import com.jaya.models.GroupRole;
import com.jaya.testutil.FriendShipTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EntityScan("com.jaya.models")
@ActiveProfiles("test")
class GroupRepositoryIntegrationTest {

    private static final int REPO_USER_1 = 80001;
    private static final int REPO_USER_2 = 80002;
    private static final int REPO_USER_3 = 80003;

    @Autowired
    private GroupRepository groupRepository;

    @Nested
    @DisplayName("findAllUserGroups")
    class FindAllUserGroups {

        @Test
        @DisplayName("shouldReturnGroupsWhereUserIsCreatorOrMember")
        void shouldReturnGroupsWhereUserIsCreatorOrMember() {
            Group createdByUser = FriendShipTestDataFactory.buildGroup(
                    1, "Created Group", "Desc", REPO_USER_1,
                    Set.of(REPO_USER_1), java.util.Map.of(REPO_USER_1, GroupRole.ADMIN));
            createdByUser.setId(null);
            Group memberGroup = FriendShipTestDataFactory.buildGroup(
                    2, "Member Group", "Desc", REPO_USER_2,
                    Set.of(REPO_USER_2, REPO_USER_1), java.util.Map.of(REPO_USER_2, GroupRole.ADMIN, REPO_USER_1, GroupRole.MEMBER));
            memberGroup.setId(null);
            groupRepository.save(createdByUser);
            groupRepository.save(memberGroup);

            List<Group> result = groupRepository.findAllUserGroups(REPO_USER_1);

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("shouldReturnEmptyWhenUserHasNoGroups")
        void shouldReturnEmptyWhenUserHasNoGroups() {
            List<Group> result = groupRepository.findAllUserGroups(REPO_USER_3);
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findGroupsByMemberId")
    class FindGroupsByMemberId {

        @Test
        @DisplayName("shouldReturnGroupsWhereUserIsMember")
        void shouldReturnGroupsWhereUserIsMember() {
            Group g = FriendShipTestDataFactory.buildGroup(
                    1, "Test Group", "Desc", REPO_USER_1,
                    Set.of(REPO_USER_1, REPO_USER_2), java.util.Map.of(REPO_USER_1, GroupRole.ADMIN, REPO_USER_2, GroupRole.MEMBER));
            g.setId(null);
            groupRepository.save(g);

            List<Group> result = groupRepository.findGroupsByMemberId(REPO_USER_2);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Test Group");
        }

        @Test
        @DisplayName("shouldReturnEmptyWhenUserIsNotMember")
        void shouldReturnEmptyWhenUserIsNotMember() {
            List<Group> result = groupRepository.findGroupsByMemberId(REPO_USER_3);
            assertThat(result).isEmpty();
        }
    }
}
