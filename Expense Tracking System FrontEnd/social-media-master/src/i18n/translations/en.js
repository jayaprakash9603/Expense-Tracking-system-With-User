/**
 * English Translations
 */
export const en = {
  // Common
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    refresh: "Refresh",
    loading: "Loading...",
    noData: "No data available",
    error: "An error occurred",
    success: "Success",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    submit: "Submit",
    reset: "Reset",
    yes: "Yes",
    no: "No",
    notAvailable: "N/A",
  },

  // Navigation
  navigation: {
    adminPanelHeading: "Admin Panel",
    dashboard: "Dashboard",
    userManagement: "User Management",
    roleManagement: "Role Management",
    systemAnalytics: "System Analytics",
    auditLogs: "Audit Logs",
    reports: "Reports",
    settings: "Settings",
    home: "Home",
    expenses: "Expenses",
    categories: "Categories",
    payments: "Payments",
    bill: "Bill",
    friends: "Friends",
    groups: "Groups",
    budgets: "Budgets",
    history: "History",
    paymentMethod: "Payment Method",
    calendar: "Calendar",
  },

  // Flows
  flows: {
    entities: {
      category: {
        singular: "Category",
        plural: "Categories",
      },
      paymentMethod: {
        singular: "Payment Method",
        plural: "Payment Methods",
      },
      empty: {
        search: {
          title: "No matches",
          subtitle: 'Try a different search term for "{{query}}"',
        },
        none: {
          title: "No data found",
          subtitle: "Adjust filters or change the period",
        },
      },
      expenseCount: "{{count}} expense{{suffix}}",
    },
    confirmations: {
      deleteCategory: "Are you sure you want to delete this category?",
      deletePaymentMethod:
        "Are you sure you want to delete this payment method?",
    },
    categoryFlow: {
      createDialogTitle: "Create Category",
    },
    paymentMethodFlow: {
      createDialogTitle: "Create Payment Method",
    },
    messages: {
      createSuccess: '{{entity}} "{{name}}" created successfully',
      deleteSuccess: '{{entity}} "{{name}}" deleted successfully.',
      deleteError: "Failed to delete {{entity}}. Please try again.",
    },
    expensesTable: {
      title: "Expenses",
      entityTitle: "{{name}} Expenses",
      unnamedExpense: "Unnamed Expense",
      noDate: "No date",
      type: {
        income: "Income",
        expense: "Expense",
      },
    },
    search: {
      placeholder: "Search {{entityPlural}}...",
    },
    rangeLabels: {
      entityWeek: "{{entityPlural}} this week",
      entityMonth: "{{entityPlural}} this month",
      entityYear: "{{entityPlural}} this year",
    },
  },

  // Cashflow
  cashflow: {
    searchPlaceholder: "Search expenses...",
    genericSearchPlaceholder: "Search...",
    nav: {
      reports: "Reports",
      categories: "Categories",
      budget: "Budget",
      paymentMethod: "Payments",
      bill: "Bill",
      calendar: "Calendar",
    },
    addNew: {
      label: "Add New",
      tooltip: "Add expense, budget, category or upload file",
      readOnly: "You have read-only access",
      options: {
        addExpense: "Add Expense",
        uploadFile: "Upload File",
        addBudget: "Add Budget",
        addCategory: "Add Category",
        addPaymentMethod: "Add Payment Method",
      },
    },
    labels: {
      weekNumber: "Week {{number}}",
      amountMasked: "Amount masked",
      amountWithValue: "Amount: {{amount}}",
      billBadge: "Bill",
      monthPlaceholder: "Month",
      datePlaceholder: "Date",
      noComments: "No comments",
      uncategorized: "Uncategorized",
      unknownPayment: "Unknown",
      recentFirst: "Recent First",
      oldFirst: "Old First",
      expenses: "Expenses",
      total: "Total",
      average: "Avg",
      minimum: "Min",
      maximum: "Max",
      selectionTitle: "Selection",
      selectionCounter: "{{current}} of {{total}}",
    },
    tooltips: {
      collapseStats: "Collapse selection stats",
      expandStats: "Expand selection stats",
      hideStats: "Hide stats",
      showStats: "Show stats",
      clearSelection: "Clear selection",
      deleteSelected: "Delete {{count}} selected",
      scrollTop: "Scroll to Top",
      scrollBottom: "Scroll to Bottom",
      previousMonth: "Previous Month",
      nextMonth: "Next Month",
      selectMonth: "Click to select a month",
      previousDate: "Previous Date",
      nextDate: "Next Date",
      selectDate: "Click to jump to a specific date",
      sortAscending: "Sort by Oldest First (Ascending Order)",
      sortDescending: "Sort by Newest First (Descending Order)",
      billExpense: "This is a bill expense",
      category: "Category: {{category}}",
      paymentMethod: "Payment: {{method}}",
      previousSelected: "Go to previous selected expense",
      nextSelected: "Go to next selected expense",
      selectionNavigator: "Navigate between selected expenses",
    },
    summary: {
      collapseAria: "Collapse selection stats",
      expandAria: "Expand selection stats",
      clear: "Clear",
      clearSelection: "Clear selection",
    },
    deletion: {
      header: "Deletion Confirmation",
      approve: "Yes, Delete",
      decline: "No, Cancel",
      deleting: "Deleting...",
      confirmMultiple:
        "Are you sure you want to delete {{count}} selected expenses?",
      confirmSingle: 'Are you sure you want to delete "{{name}}"?',
      confirmSingleFallback: "this expense",
      toastMultiSuccess: "Selected expenses deleted successfully.",
      toastMultiError: "Error deleting selected expenses. Please try again.",
      toastBillSuccess: "Bill deleted successfully.",
      toastExpenseSuccess: "Expense deleted successfully.",
      toastExpenseError: "Error deleting expense. Please try again.",
    },
    messages: {
      noDataChart: "No data to display",
      adjustFilters: "Try adjusting filters or date range",
      noMatches: "No matches",
      noData: "No data found",
      searchSuggestion: "Try a different search term",
      adjustPeriod: "Adjust filters or change the period",
      noMonthsAvailable: "No months available",
    },
    sort: {
      recentFirst: "Recent First",
      highToLow: "High to Low",
      lowToHigh: "Low to High",
    },
    actions: {
      editExpense: "Edit Expense",
      deleteExpense: "Delete Expense",
      deleteSelected: "Delete Selected",
    },
    flowToggle: {
      all: "Money In & Out",
      inflow: "Money In",
      outflow: "Money Out",
    },
    chart: {
      xAxisDay: "Day",
      xAxisWeekday: "Weekday",
      xAxisMonth: "Month",
      yAxisAmount: "Amount",
      averageLabel: "Avg",
      tooltipAmount: "Amount",
    },
    rangeTypes: {
      week: "Week",
      month: "Month",
      year: "Year",
    },
    rangeLabels: {
      thisWeek: "This Week",
      thisMonth: "This Month",
      thisYear: "This Year",
    },
    weekDays: {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    },
    monthsShort: {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
    },
    tableHeaders: {
      name: "Expense Name",
      amount: "Amount",
      type: "Type",
      paymentMethod: "Payment Method",
      netAmount: "Net Amount",
      comments: "Comments",
      creditDue: "Credit Due",
      date: "Date",
    },
  },

  // New Expense
  newExpense: {
    title: "New Expense",
    header: {
      previouslyAdded: "Previously Added",
    },
    indicators: {
      autoFilled: "Auto-filled",
    },
    actions: {
      linkBudgets: "Link Budgets",
      submit: "Submit",
      successMessage: "Expense created successfully!",
    },
    messages: {
      errorLoadingBudgets: "Unable to load budgets",
    },
    autocomplete: {
      noOptions: "No options",
    },
    fields: {
      expenseName: "Expense Name",
      amount: "Amount",
      date: "Date",
      transactionType: "Transaction Type",
      category: "Category",
      paymentMethod: "Payment Method",
      comments: "Comments",
    },
    placeholders: {
      expenseName: "Enter expense name",
      amount: "Enter amount",
      date: "Choose a date",
      transactionType: "Select transaction type",
      category: "Select category",
      paymentMethod: "Select payment method",
      comments: "Add a comment",
      generic: "Enter your {{field}}",
    },
    table: {
      headers: {
        name: "Name",
        inBudget: "In Budget",
        description: "Description",
        startDate: "Start Date",
        endDate: "End Date",
        remainingAmount: "Remaining Amount",
        amount: "Amount",
      },
      noRows: "No rows found",
    },
    transactionTypes: {
      gain: "Gain",
      loss: "Loss",
    },
  },

  // Edit Expense
  editExpense: {
    title: "Edit Expense",
    actions: {
      linkBudgets: "Link Budgets",
      submit: "Submit",
      successMessage: "Expense updated successfully!",
    },
    messages: {
      updateError: "Something went wrong. Please try again.",
      errorLoadingBudgets: "Unable to load budgets",
    },
    autocomplete: {
      noOptions: "No options",
    },
    fields: {
      expenseName: "Expense Name",
      amount: "Amount",
      date: "Date",
      transactionType: "Transaction Type",
      category: "Category",
      paymentMethod: "Payment Method",
      comments: "Comments",
    },
    placeholders: {
      expenseName: "Enter expense name",
      amount: "Enter amount",
      date: "Choose a date",
      transactionType: "Select transaction type",
      category: "Search category",
      paymentMethod: "Select payment method",
      comments: "Add a comment (optional)",
      generic: "Enter your {{field}}",
    },
    validation: {
      expenseName: "Expense name is required.",
      amount: "Amount is required.",
      date: "Date is required.",
      transactionType: "Transaction type is required.",
    },
    table: {
      headers: {
        name: "Name",
        inBudget: "In Budget",
        description: "Description",
        startDate: "Start Date",
        endDate: "End Date",
        remainingAmount: "Remaining Amount",
        amount: "Amount",
      },
      noRows: "No rows found",
    },
    transactionTypes: {
      gain: "Gain",
      loss: "Loss",
    },
  },

  // New Budget
  newBudget: {
    title: "New Budget",
    actions: {
      linkExpenses: "Link Expenses",
      submit: "Submit",
      submitting: "Submitting...",
    },
    messages: {
      createSuccess: "Budget created successfully!",
      createError: "Failed to create budget. Please try again.",
      expenseLoadError: "Unable to load expenses.",
    },
    fields: {
      name: "Budget Name",
      description: "Description",
      startDate: "Start Date",
      endDate: "End Date",
      amount: "Amount",
    },
    placeholders: {
      name: "Enter budget name",
      description: "Add a description",
      startDate: "Choose a start date",
      endDate: "Choose an end date",
      amount: "Enter total amount",
      generic: "Enter your {{field}}",
    },
    validation: {
      name: "Budget name is required.",
      description: "Description is required.",
      startDate: "Start date is required.",
      endDate: "End date is required.",
      amount: "Amount is required.",
    },
    table: {
      headers: {
        date: "Date",
        expenseName: "Expense Name",
        amount: "Amount",
        paymentMethod: "Payment Method",
        type: "Type",
        comments: "Comments",
        inBudget: "In Budget",
      },
      noRows: "No rows found",
    },
  },

  // Edit Budget
  editBudget: {
    title: "Edit Budget",
    actions: {
      linkExpenses: "Link Expenses",
      submit: "Submit",
      submitting: "Submitting...",
    },
    messages: {
      updateSuccess: "Budget updated successfully!",
      updateError: "Failed to update budget. Please try again.",
      expenseLoadError: "Unable to load expenses.",
      budgetLoadError: "Unable to load budget details.",
    },
    fields: {
      name: "Budget Name",
      description: "Description",
      startDate: "Start Date",
      endDate: "End Date",
      amount: "Amount",
    },
    placeholders: {
      name: "Enter budget name",
      description: "Add a description",
      startDate: "Choose a start date",
      endDate: "Choose an end date",
      amount: "Enter total amount",
      generic: "Enter your {{field}}",
    },
    validation: {
      name: "Budget name is required.",
      description: "Description is required.",
      startDate: "Start date is required.",
      endDate: "End date is required.",
      amount: "Amount is required.",
    },
    table: {
      headers: {
        date: "Date",
        expenseName: "Expense Name",
        amount: "Amount",
        paymentMethod: "Payment Method",
        type: "Type",
        comments: "Comments",
        inBudget: "In Budget",
      },
      noRows: "No rows found",
    },
  },

  // Bill Shared Translations
  billCommon: {
    fields: {
      name: "Bill Name",
      description: "Description",
      date: "Date",
      paymentMethod: "Payment Method",
      type: "Type",
      category: "Category",
    },
    placeholders: {
      billName: "Enter bill name",
      searchBillName: "Search or type bill name",
      description: "Enter description",
      paymentMethod: "Select payment method",
      type: "Select type",
      category: "Search category",
      itemName: "Item name",
      quantity: "Qty *",
      unitPrice: "Unit Price *",
      comments: "Comments",
    },
    typeOptions: {
      gain: "Gain",
      loss: "Loss",
    },
    indicators: {
      previouslyAdded: "Previously Added",
      autoFilled: "Auto-filled",
    },
    actions: {
      linkBudgets: "Link Budgets",
      hideBudgets: "Hide Budgets",
      addExpenses: "Add Expense Items",
      editExpenses: "Edit Expense Items",
      hideExpenses: "Hide Expense Items",
      addRow: "Add Row",
      saveExpenses: "Save Expenses",
      saveChanges: "Save Changes",
      submit: "Submit",
      update: "Update",
    },
    budgets: {
      heading: "Available Budgets for Selected Date",
      noBudgets: "No budgets found for the selected date",
      errorMessage: "Error: {{message}}",
      fallbackError: "Failed to load budgets.",
      columns: {
        name: "Name",
        description: "Description",
        startDate: "Start Date",
        endDate: "End Date",
        remainingAmount: "Remaining Amount",
        amount: "Amount",
      },
    },
    expenseTable: {
      headers: {
        itemName: "Item Name *",
        quantity: "Quantity *",
        unitPrice: "Unit Price *",
        totalPrice: "Total Price",
        comments: "Comments",
        actions: "Actions",
      },
      validationHintDetailed:
        "Complete the current item (Item Name, Quantity, and Unit Price are required) to add more rows",
      validationHintSimple: "Complete the current item to add more rows",
      totalLabel: "Total Amount",
      summaryLabels: {
        qty: "Qty",
        unit: "Unit",
        calc: "Calc",
        comments: "Comments",
      },
    },
    summary: {
      title: "Expense Items Summary",
      singleItem: "{{count}} item added",
      multipleItems: "{{count}} items added",
      noItemsTitle: "⚠️ No expense items added yet",
    },
    messages: {
      noItemsCreate: "At least one expense item is required to create a bill",
      noItemsEdit: "At least one expense item is required to update the bill",
      unsavedChanges:
        "You have unsaved expense items. Are you sure you want to close without saving? All entered data will be lost.",
      addExpenseValidationDetailed:
        "Please add at least one complete expense item before saving. Item Name, Quantity, and Unit Price are all required.",
      addExpenseValidationSimple:
        "Please add at least one complete expense item before saving.",
      expensesRequiredCreate:
        "At least one expense item should be added to create a bill.",
      expensesRequiredUpdate:
        "At least one expense item should be added to update the bill.",
      totalAmountInvalid: "Total amount must be greater than zero.",
      invalidQuantityOrPrice:
        "Please enter valid positive values for both quantity and unit price.",
    },
    receiptScanner: {
      title: "Scan Receipt",
      buttonLabel: "Scan Receipt",
      tooltip: "Scan receipt using OCR to auto-fill expense details",
      tip: "💡 Tip: Upload all pages of your receipt for best results",
      dropTitle: "Drop your receipt pages here",
      dropSubtitle: "or click to browse files",
      supportedFormats: "Supports: JPG, PNG, GIF, BMP, TIFF (max 10MB each)",
      multiPageChip: "Upload multiple pages for multi-page receipts",
      fileCountSingular: "{{count}} page selected",
      fileCountPlural: "{{count}} pages selected",
      scanButtonProcessingSingular: "Scanning {{count}} page...",
      scanButtonProcessingPlural: "Scanning {{count}} pages...",
      scanButtonReadySingular: "Scan {{count}} Page",
      scanButtonReadyPlural: "Scan {{count}} Pages",
      pageLabel: "Page {{number}}",
      imageAlt: "Receipt page {{number}}",
      addMore: "Add More",
      clearAll: "Clear All",
      confidenceTitle: "OCR Confidence: {{confidence}}%",
      confidenceHint:
        "Review and edit fields as needed. Yellow/Red badges indicate lower confidence.",
      errors: {
        fileLimit: "Maximum {{max}} files allowed",
        invalidFormat:
          "{{fileName}}: Invalid format (use JPG, PNG, GIF, BMP, or TIFF)",
        fileSize: "{{fileName}}: File exceeds 10MB limit",
      },
      fields: {
        merchant: {
          label: "Merchant Name",
          placeholder: "Enter merchant name",
        },
        amount: {
          label: "Total Amount",
          placeholder: "0.00",
        },
        date: {
          label: "Date",
        },
        tax: {
          label: "Tax (GST/CGST/SGST)",
          placeholder: "0.00",
        },
        category: {
          label: "Suggested Category",
        },
        paymentMethod: {
          label: "Payment Method",
        },
        detectedItems: "Detected Items ({{count}})",
      },
      badges: {
        labels: {
          high: "High",
          medium: "Medium",
          low: "Low",
        },
        tooltipFallback: "{{level}} confidence",
      },
      actions: {
        scanAnother: "Scan Another",
        useData: "Use This Data",
      },
      defaults: {
        expenseName: "Receipt Expense",
        descriptionPrefix: "Scanned from receipt",
        taxSuffix: " (Tax: {{currency}}{{amount}})",
      },
      meta: {
        processedIn: "Processed in {{ms}}ms using OCR",
      },
      successMessage: {
        title: "Receipt scanned successfully!",
        body: "Extracted:\n- Name: {{name}}\n- Amount: {{amount}}\n- Date: {{date}}\n\nPlease review and edit if needed.",
      },
    },
  },

  // Create Bill
  createBill: {
    title: "Create Bill",
    labels: {
      expenseTableTitle: "Expense Items",
    },
    messages: {
      success: "Bill created successfully!",
      failure: "Failed to create bill. Please try again.",
      errorWithReason: "Error creating bill: {{message}}",
      budgetLoadError: "Failed to load budgets.",
    },
    summary: {
      noItemsSubtitle: "At least one expense item is required to create a bill",
    },
  },

  // Edit Bill
  editBill: {
    title: "Edit Bill",
    labels: {
      expenseTableTitle: "Edit Expense Items",
    },
    messages: {
      success: "Bill updated successfully!",
      errorWithReason: "Error updating bill: {{message}}",
      loadErrorTitle: "⚠️ Error Loading Bill",
      noBillId: "No bill ID provided.",
      invalidData: "Bill data is missing or invalid.",
    },
    buttons: {
      retry: "Retry",
      goBack: "Go Back",
    },
    summary: {
      noItemsSubtitle:
        "At least one expense item is required to update the bill",
    },
  },

  // Dashboard
  dashboard: {
    title: "Financial Dashboard",
    subtitle: "Real-time insights into your financial health",
    metrics: "Metrics",
    dailySpending: "Daily Spending Pattern",
    categoryBreakdown: "Category Breakdown",
    monthlyTrend: "Monthly Trend",
    paymentMethods: "Payment Methods",
    recentTransactions: "Recent Transactions",
    budgetOverview: "Budget Overview",
    quickAccess: "Quick Access",
    summaryOverview: "Summary Overview",
    customize: "Customize Dashboard",
    refreshData: "Refresh Data",
    exportReports: "Export Reports",
    overview: {
      title: "Application Overview",
      liveSummary: "Live Summary",
      totalExpenses: "Total Expenses",
      creditDue: "Credit Due",
      activeBudgets: "Active Budgets",
      friends: "Friends",
      groups: "Groups",
      avgDailySpend: "Avg Daily Spend",
      last30Days: "Last 30 days",
      savingsRate: "Savings Rate",
      ofIncome: "of income",
      upcomingBills: "Upcoming Bills",
      dueThisPeriod: "due this period",
      topExpenses: "Top Expenses",
      noExpensesData: "No expenses data available",
    },
    charts: {
      titles: {
        dailySpending: "📊 Daily Spending Pattern",
        spendingTrends: "Spending Trends",
      },
      typeOptions: {
        loss: "Loss",
        gain: "Gain",
      },
      timeframeOptions: {
        thisMonth: "This Month",
        lastMonth: "Last Month",
        last3Months: "Last 3 Months",
        thisYear: "This Year",
        lastYear: "Last Year",
        allTime: "All Time",
      },
      timeframeChips: {
        weekly: "Weekly",
        monthly: "Monthly",
        quarterly: "Quarterly",
        yearly: "Yearly",
      },
      tooltip: {
        totalSpending: "Total Spending",
        totalIncome: "Total Income",
        dayPrefix: "Day",
        transactions: "Transactions",
        moreLabel: "more",
        runningAverage: "Average",
      },
      datasetLabels: {
        income: "Income",
        expenses: "Expenses",
        savings: "Savings",
      },
    },
  },

  // Settings
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences and account settings",

    // Main Sections
    appearance: "Appearance",
    preferences: "Preferences",
    privacySecurity: "Privacy & Security",
    dataStorage: "Data & Storage",
    smartFeatures: "Smart Features & Automation",
    accessibility: "Accessibility",
    accountManagement: "Account Management",
    helpSupport: "Help & Support",
    about: "About",

    // Appearance Settings
    theme: "Theme Mode",
    themeLight: "Light mode for better visibility in bright environments",
    themeDark: "Dark mode for reduced eye strain",
    fontSize: "Font Size",
    fontSizeDescription: "Adjust text size for better readability",
    compactMode: "Compact Mode",
    compactModeDescription: "Display more content with reduced spacing",
    animations: "Enable Animations",
    animationsDescription: "Show smooth transitions and animations",
    enableAnimations: "Enable Animations",
    enableAnimationsDescription: "Show smooth transitions and animations",
    highContrast: "High Contrast Mode",
    highContrastDescription: "Enhanced visibility for better accessibility",
    highContrastMode: "High Contrast Mode",
    highContrastModeDescription: "Enhanced visibility for better accessibility",

    // Preferences
    language: "Language",
    languageDescription: "Choose your preferred language",
    defaultCurrency: "Default Currency",
    defaultCurrencyDescription: "Set your preferred currency for transactions",
    dateFormat: "Date Format",
    dateFormatDescription: "Choose how dates are displayed",
    timeFormat: "Time Format",
    timeFormatDescription: "Choose 12-hour or 24-hour time format",

    // Privacy & Security
    profileVisibility: "Profile Visibility",
    profileVisibilityDescription:
      "Control who can see your profile and expense information",
    maskSensitiveData: "Mask Sensitive Data",
    maskSensitiveDataDescription:
      "Hide expense amounts and financial details for privacy",
    twoFactorAuth: "Two-Factor Authentication",
    twoFactorAuthDescription: "Add an extra layer of security to your account",
    blockedUsers: "Blocked Users",
    blockedUsersDescription: "Manage blocked users and privacy settings",
    autoLogout: "Auto Logout",
    autoLogoutDescription: "Automatically log out after period of inactivity",
    sessionTimeout: "Session Timeout",
    sessionTimeoutDescription: "Inactivity timeout duration",

    // Data & Storage
    autoBackup: "Auto Backup",
    autoBackupDescription: "Automatically backup your data to cloud",
    backupFrequency: "Backup Frequency",
    backupFrequencyDescription: "How often to backup your data",
    cloudSync: "Cloud Sync",
    cloudSyncDescription: "Sync data across all your devices",
    storageUsage: "Storage Usage",
    storageUsageDescription: "View your data storage usage",
    clearCache: "Clear Cache",
    clearCacheDescription: "Free up space by clearing cached data",

    // Smart Features
    autoCategorize: "Auto-Categorize Expenses",
    autoCategorizeDescription: "AI-powered automatic expense categorization",
    smartBudgeting: "Smart Budget Suggestions",
    smartBudgetingDescription: "Get AI recommendations for better budgeting",
    scheduledReports: "Scheduled Reports",
    scheduledReportsDescription: "Receive automated expense reports",
    expenseReminders: "Expense Reminders",
    expenseRemindersDescription: "Get reminders for recurring expenses",
    predictiveAnalytics: "Predictive Analytics",
    predictiveAnalyticsDescription:
      "Forecast future expenses based on patterns",

    // Accessibility
    screenReaderSupport: "Screen Reader Support",
    screenReaderSupportDescription: "Enhanced support for screen readers",
    keyboardShortcuts: "Keyboard Shortcuts",
    keyboardShortcutsDescription: "Enable keyboard navigation shortcuts",
    reduceMotion: "Reduce Motion",
    reduceMotionDescription: "Minimize animations for better accessibility",
    enhancedFocusIndicators: "Enhanced Focus Indicators",
    enhancedFocusIndicatorsDescription:
      "Highlight focused elements more prominently",
    keyboardShortcutsGuide: "Keyboard Shortcuts Guide",
    keyboardShortcutsGuideDescription: "View all available keyboard shortcuts",

    // Account Management
    notificationSettings: "Notification Settings",
    notificationSettingsDescription:
      "Manage all notification preferences and channels",
    editProfile: "Edit Profile",
    editProfileDescription: "Update your personal information and preferences",
    changePassword: "Change Password",
    changePasswordDescription: "Update your account password",
    dataExport: "Data Export",
    dataExportDescription: "Download all your expense data",
    deleteAccount: "Delete Account",
    deleteAccountDescription: "Permanently delete your account and all data",
    deleteAccountWarning:
      "All your data, including expenses, budgets, and friends, will be permanently deleted.",

    // Help & Support
    helpCenter: "Help Center",
    helpCenterDescription: "Browse FAQs and help articles",
    contactSupport: "Contact Support",
    contactSupportDescription: "Get help from our support team",
    termsOfService: "Terms of Service",
    termsOfServiceDescription: "Read our terms and conditions",
    privacyPolicy: "Privacy Policy",
    privacyPolicyDescription: "Learn about how we protect your data",

    // App Info
    appVersion: "App Version",
    lastUpdated: "Last Updated",
    buildNumber: "Build Number",

    // Button Labels
    enable: "Enable",
    manage: "Manage",
    change: "Change",
    view: "View",
    clear: "Clear",
    export: "Export",
    edit: "Edit",
    delete: "Delete",

    // Select Options
    small: "Small",
    medium: "Medium (Default)",
    large: "Large",
    extraLarge: "Extra Large",

    // Profile Visibility Options
    public: "🌍 Public - Anyone can view",
    friendsOnly: "👥 Friends Only - Restricted access",
    private: "🔒 Private - Only you",

    // Profile Visibility Labels (for chips)
    publicLabel: "🌍 Public",
    friendsLabel: "👥 Friends",
    privateLabel: "🔒 Private",

    // Time Format Options
    time12h: "🕐 12-hour (3:00 PM)",
    time24h: "🕒 24-hour (15:00)",

    // Backup Frequency Options
    daily: "📆 Daily",
    weekly: "📅 Weekly",
    monthly: "🗓️ Monthly",
    manualOnly: "✋ Manual Only",

    // Report Schedule Options
    dailySummary: "📊 Daily Summary",
    weeklySummary: "📈 Weekly Summary",
    monthlySummary: "📉 Monthly Summary",
    noScheduledReports: "🚫 No Scheduled Reports",

    // Currency Options
    currencyUSD: "💵 USD - US Dollar ($)",
    currencyEUR: "💶 EUR - Euro (€)",
    currencyGBP: "💷 GBP - British Pound (£)",
    currencyINR: "💴 INR - Indian Rupee (₹)",
    currencyJPY: "💴 JPY - Japanese Yen (¥)",

    // Date Format Options
    dateFormatUS: "📅 MM/DD/YYYY (US)",
    dateFormatUK: "📅 DD/MM/YYYY (UK/EU)",
    dateFormatISO: "📅 YYYY-MM-DD (ISO)",
    usd: "USD - US Dollar ($)",
    eur: "EUR - Euro (€)",
    gbp: "GBP - British Pound (£)",
    inr: "INR - Indian Rupee (₹)",
    jpy: "JPY - Japanese Yen (¥)",

    // Date Format Options
    mmddyyyy: "MM/DD/YYYY (US)",
    ddmmyyyy: "DD/MM/YYYY (UK/EU)",
    yyyymmdd: "YYYY-MM-DD (ISO)",

    // Status Messages
    profileVisibilityPublic:
      "Your profile is now public - anyone can view your information",
    profileVisibilityFriends:
      "Your profile is now friends only - only friends can view",
    profileVisibilityPrivate:
      "Your profile is now private - only you can view your information",
  },

  // Modals
  modals: {
    logoutTitle: "Logout Confirmation",
    logoutPrompt: "Are you sure you want to logout?",
  },

  // Header
  header: {
    showAmounts: "Show Amounts",
    hideAmounts: "Hide Amounts",
    switchToLight: "Switch to Light Mode",
    switchToDark: "Switch to Dark Mode",
    notifications: "Notifications",
    viewProfile: "View Profile",
    switchToUserMode: "Switch to User Mode",
    switchToAdminMode: "Switch to Admin Mode",
  },

  // Auth
  auth: {
    login: "Login",
    logout: "Logout",
    register: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember Me",
    signIn: "Sign In",
    signUp: "Sign Up",
    firstName: "First Name",
    lastName: "Last Name",
    switchToAdminMode: "Switch to Admin Mode",
    switchToUserMode: "Switch to User Mode",
    viewProfile: "View Profile",
  },

  // Expenses
  expenses: {
    title: "Expenses",
    addExpense: "Add Expense",
    editExpense: "Edit Expense",
    deleteExpense: "Delete Expense",
    amount: "Amount",
    category: "Category",
    date: "Date",
    description: "Description",
    paymentMethod: "Payment Method",
    noExpenses: "No expenses found",
  },

  // Budget
  budget: {
    title: "Budget",
    addBudget: "Add Budget",
    editBudget: "Edit Budget",
    deleteBudget: "Delete Budget",
    budgetName: "Budget Name",
    allocatedAmount: "Allocated Amount",
    spentAmount: "Spent Amount",
    remainingAmount: "Remaining",
    startDate: "Start Date",
    endDate: "End Date",
    noBudgets: "No budgets found",
  },

  // Categories
  categories: {
    title: "Categories",
    addCategory: "Add Category",
    editCategory: "Edit Category",
    deleteCategory: "Delete Category",
    categoryName: "Category Name",
    icon: "Icon",
    color: "Color",
  },

  // Messages
  messages: {
    saveSuccess: "Saved successfully",
    updateSuccess: "Updated successfully",
    deleteSuccess: "Deleted successfully",
    saveError: "Failed to save",
    updateError: "Failed to update",
    deleteError: "Failed to delete",
    loadError: "Failed to load data",
    confirmDelete: "Are you sure you want to delete this item?",
    languageChanged: "Language changed successfully",
  },

  // OCR Receipt Scanning
  ocr: {
    title: "Scan Receipt",
    subtitle: "Auto-extract expense details with OCR",
    steps: {
      upload: "Upload",
      scan: "Scan",
      review: "Review",
    },
    dropHere: "Drop your receipt pages here",
    orBrowse: "or click to browse files",
    maxSize: "Max 10MB each",
    multiPageSupport: "Multi-page receipt support",
    multiPageTip: "💡 Upload all pages of multi-page receipts for best results",
    page: "page",
    pages: "pages",
    receiptPage: "Receipt page",
    addMore: "Add More",
    clearAll: "Clear All",
    scanning: "Scanning...",
    scanPages: "Scan",
    processingReceipt: "Processing Receipt...",
    analyzingText: "Analyzing text and extracting data",
    ocrConfidence: "OCR Confidence",
    reviewFields:
      "Review and edit fields as needed. Colored badges indicate confidence.",
    detectedItems: "Detected Items",
    showRawText: "Show Raw OCR Text",
    hideRawText: "Hide Raw OCR Text",
    scanAnother: "Scan Another",
    useThisData: "Use This Data",
    processedIn: "Processed in",
    usingOCR: "using OCR",
    imageQuality: "Image Quality",
    defaultExpenseName: "Receipt Expense",
    scannedFrom: "Scanned from receipt",
    tax: "Tax",
    fields: {
      merchant: "Merchant Name",
      amount: "Total Amount",
      date: "Date",
      category: "Category",
      paymentMethod: "Payment Method",
    },
    placeholders: {
      merchant: "Enter merchant name",
    },
    confidence: {
      high: "HIGH",
      medium: "MEDIUM",
      low: "LOW",
    },
    errors: {
      maxFiles: "Maximum 10 files allowed",
      invalidFormat: "Invalid format (use JPG, PNG, GIF, BMP, or TIFF)",
      fileTooLarge: "File exceeds 10MB",
    },
  },
};
