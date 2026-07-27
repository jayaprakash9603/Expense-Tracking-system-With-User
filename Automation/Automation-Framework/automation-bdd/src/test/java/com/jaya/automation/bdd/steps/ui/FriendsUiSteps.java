package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.steps.ui.support.FriendshipScenarioCoordinator;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;


import static org.assertj.core.api.Assertions.assertThat;

public class FriendsUiSteps {
    private final FriendshipScenarioCoordinator coordinator = new FriendshipScenarioCoordinator();

    @When("the user sends a friend request to {string}")
    public void userSendsFriendRequestTo(String email) {
        coordinator.sendFriendRequest(email);
    }

    @When("the user accepts the pending friend request")
    public void userAcceptsPendingFriendRequest() {
        coordinator.acceptFriendRequest();
    }

    @When("the user declines the pending friend request")
    public void userDeclinesPendingFriendRequest() {
        coordinator.declineFriendRequest();
    }

    @When("the user blocks the friend")
    public void userBlocksTheFriend() {
        coordinator.blockFriend();
    }

    @When("the user removes the friend")
    public void userRemovesTheFriend() {
        coordinator.removeFriend();
    }

    @Then("the friend {string} should be visible in the list")
    public void friendShouldBeVisibleInList(String name) {
        assertThat(coordinator.isFriendVisible(name)).as("Friend should be visible").isTrue();
    }
}
