package com.jaya.automation.flows.common.service;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.admin.page.AdminPage;
import com.jaya.automation.flows.bills.page.BillsPage;
import com.jaya.automation.flows.budgets.page.BudgetsPage;
import com.jaya.automation.flows.categories.page.CategoriesPage;
import com.jaya.automation.flows.chat.page.ChatPage;
import com.jaya.automation.flows.dashboard.page.DashboardPage;
import com.jaya.automation.flows.expenses.page.ExpensesPage;
import com.jaya.automation.flows.friends.page.FriendsPage;
import com.jaya.automation.flows.groups.page.GroupsPage;
import com.jaya.automation.flows.payments.page.PaymentMethodsPage;
import com.jaya.automation.flows.profile.page.ProfilePage;
import com.jaya.automation.flows.settings.page.SettingsPage;
import com.jaya.automation.flows.sharing.page.SharingPage;

public final class DomainNavigationFlowService {
    private final DashboardPage dashboardPage;
    private final ExpensesPage expensesPage;
    private final BudgetsPage budgetsPage;
    private final BillsPage billsPage;
    private final CategoriesPage categoriesPage;
    private final PaymentMethodsPage paymentMethodsPage;
    private final FriendsPage friendsPage;
    private final GroupsPage groupsPage;
    private final SharingPage sharingPage;
    private final ChatPage chatPage;
    private final SettingsPage settingsPage;
    private final ProfilePage profilePage;
    private final AdminPage adminPage;

    public DomainNavigationFlowService(UiEngine uiEngine) {
        this.dashboardPage = new DashboardPage(uiEngine);
        this.expensesPage = new ExpensesPage(uiEngine);
        this.budgetsPage = new BudgetsPage(uiEngine);
        this.billsPage = new BillsPage(uiEngine);
        this.categoriesPage = new CategoriesPage(uiEngine);
        this.paymentMethodsPage = new PaymentMethodsPage(uiEngine);
        this.friendsPage = new FriendsPage(uiEngine);
        this.groupsPage = new GroupsPage(uiEngine);
        this.sharingPage = new SharingPage(uiEngine);
        this.chatPage = new ChatPage(uiEngine);
        this.settingsPage = new SettingsPage(uiEngine);
        this.profilePage = new ProfilePage(uiEngine);
        this.adminPage = new AdminPage(uiEngine);
    }

    public DashboardPage dashboard() {
        return dashboardPage;
    }

    public ExpensesPage expenses() {
        return expensesPage;
    }

    public BudgetsPage budgets() {
        return budgetsPage;
    }

    public FriendsPage friends() {
        return friendsPage;
    }

    public GroupsPage groups() {
        return groupsPage;
    }

    public SharingPage sharing() {
        return sharingPage;
    }

    public ChatPage chat() {
        return chatPage;
    }

    public SettingsPage settings() {
        return settingsPage;
    }

    public BillsPage bills() {
        return billsPage;
    }

    public CategoriesPage categories() {
        return categoriesPage;
    }

    public PaymentMethodsPage paymentMethods() {
        return paymentMethodsPage;
    }

    public ProfilePage profile() {
        return profilePage;
    }

    public AdminPage admin() {
        return adminPage;
    }
}
