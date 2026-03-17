package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;

import java.util.Map;

public final class FriendshipScenarioCoordinator {

    public void sendFriendRequest(String email) {
        BddWorld.uiActionExecutor().clickAction("friends.add.new");
        BddWorld.uiActionExecutor().fillFields(Map.of("friends.search.email", email));
        BddWorld.uiActionExecutor().clickAction("friends.send.request");
        BddWorld.putAliasValue("friend.request.email", email);
    }

    public void acceptFriendRequest() {
        BddWorld.uiActionExecutor().clickAction("friends.accept.request");
    }

    public void declineFriendRequest() {
        BddWorld.uiActionExecutor().clickAction("friends.decline.request");
    }

    public void blockFriend() {
        BddWorld.uiActionExecutor().clickAction("friends.block");
    }

    public void removeFriend() {
        BddWorld.uiActionExecutor().clickAction("friends.remove");
        BddWorld.uiActionExecutor().clickAction("friends.remove.confirm");
    }

    public boolean isFriendVisible(String name) {
        return BddWorld.testContext().uiEngine().elements()
                .exists(com.jaya.automation.core.ui.Locator.text(name));
    }
}
