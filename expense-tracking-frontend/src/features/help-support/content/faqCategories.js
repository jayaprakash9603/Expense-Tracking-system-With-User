export const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    faqs: [
      {
        question: "How do I create my first expense?",
        answer:
          "Navigate to Expenses from the sidebar, then click the 'Add Expense' button. Fill in the amount, category, date, and description, then save your expense.",
      },
      {
        question: "How do I set up my profile?",
        answer:
          "Go to Profile from the sidebar menu. You can update your personal information, profile picture, and cover image. Click the edit button to make changes.",
      },
      {
        question: "What currencies are supported?",
        answer:
          "We support multiple currencies including USD, EUR, GBP, INR, JPY, and many more. You can change your preferred currency in Settings > Preferences.",
      },
      {
        question: "Is there a dark mode?",
        answer:
          "Yes! You can toggle between light and dark mode by clicking the sun/moon icon in the top right corner of the screen, or change it permanently in Settings > Appearance.",
      },
    ],
  },
  {
    id: "expenses",
    title: "Managing Expenses",
    faqs: [
      {
        question: "How do I edit or delete an expense?",
        answer:
          "Find the expense in your expense list, click on it to view details, then use the edit or delete buttons. You can also swipe left on mobile to reveal action buttons.",
      },
      {
        question: "Can I upload expenses in bulk?",
        answer:
          "Yes! Go to Expenses > Upload and you can import expenses from CSV or Excel files. Make sure your file follows the required format shown in the upload dialog.",
      },
      {
        question: "How do I categorize expenses?",
        answer:
          "When creating or editing an expense, select a category from the dropdown. You can also create custom categories in the Categories section.",
      },
      {
        question: "Can I add recurring expenses?",
        answer:
          "Yes, when creating an expense, toggle the 'Recurring' option and set the frequency (daily, weekly, monthly, yearly). The system will automatically create entries based on your schedule.",
      },
      {
        question: "How to split an expense with a friend?",
        answer:
          "Create a new expense, select 'Split with Friend', choose the friend, and enter the split amount. They will receive a notification and it will reflect in your shared dashboard.",
      },
    ],
  },
  {
    id: "budgets",
    title: "Budgets & Planning",
    faqs: [
      {
        question: "How do I create a budget?",
        answer:
          "Go to Budgets from the sidebar and click 'Create Budget'. Set the budget name, amount, time period, and optionally link it to specific categories.",
      },
      {
        question: "What happens when I exceed my budget?",
        answer:
          "You'll receive notifications when you reach 80% and 100% of your budget. The budget card will also change color to indicate the status (green = on track, yellow = warning, red = exceeded).",
      },
      {
        question: "Can I set budgets for specific categories?",
        answer:
          "Yes! When creating a budget, you can select specific categories to track. This helps you monitor spending in areas like groceries, entertainment, or transportation.",
      },
    ],
  },
  {
    id: "categories",
    title: "Categories",
    faqs: [
      {
        question: "How do I create custom categories?",
        answer:
          "Go to Categories and click 'Add Category'. Choose a name, icon, and color for your category. Custom categories help you organize expenses according to your needs.",
      },
      {
        question: "Can I merge or delete categories?",
        answer:
          "You can delete unused categories from the category settings. To merge, create a new category and reassign expenses from the old categories before deleting them.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payment Methods",
    faqs: [
      {
        question: "How do I add a payment method?",
        answer:
          "Go to Payment Methods and click 'Add Payment Method'. Enter the name (e.g., 'Chase Credit Card'), type (credit, debit, cash, etc.), and any notes.",
      },
      {
        question: "Can I track spending by payment method?",
        answer:
          "Yes! Each expense can be linked to a payment method. View reports by payment method in the Reports section to see spending patterns across different accounts.",
      },
    ],
  },
  {
    id: "friends",
    title: "Friends & Sharing",
    faqs: [
      {
        question: "How do I add friends?",
        answer:
          "Go to Friends and use the search to find users by name or email. Send a friend request and once accepted, you can share expenses and track group spending.",
      },
      {
        question: "How do I share expenses with friends?",
        answer:
          "When viewing a friend's profile, you can access shared expense tracking. Add expenses that involve your friend to keep track of who owes what.",
      },
      {
        question: "What is the shared dashboard?",
        answer:
          "The shared dashboard shows expenses between you and a friend. It calculates balances and helps you settle up easily.",
      },
    ],
  },
  {
    id: "security",
    title: "Security & Privacy",
    faqs: [
      {
        question: "How do I enable two-factor authentication?",
        answer:
          "Go to Settings > Security and enable 'Two-Factor Authentication'. You can use an authenticator app or SMS verification for added security.",
      },
      {
        question: "How do I change my password?",
        answer:
          "In Settings > Security, click 'Change Password'. Enter your current password and then your new password twice to confirm.",
      },
      {
        question: "Is my financial data secure?",
        answer:
          "Yes! We use industry-standard encryption for all data in transit and at rest. Your financial information is never shared with third parties without your consent.",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    faqs: [
      {
        question: "How do I customize notifications?",
        answer:
          "Go to Settings > Notifications to manage all notification preferences. You can enable/disable notifications by type and choose delivery methods (in-app, email, push).",
      },
      {
        question: "Why am I not receiving notifications?",
        answer:
          "Check that notifications are enabled in Settings. Also verify your browser/device allows notifications for our app. Check your email spam folder for email notifications.",
      },
    ],
  },
  {
    id: "settings",
    title: "Account Settings",
    faqs: [
      {
        question: "How do I change the app theme?",
        answer:
          "Go to Settings > Appearance and select your preferred theme (Light, Dark, or System). The change applies immediately.",
      },
      {
        question: "How do I export my data?",
        answer:
          "In Settings > Data Management, click 'Export Data'. You can download all your expenses, budgets, and categories in various formats (CSV, JSON, PDF).",
      },
      {
        question: "How do I update my email address?",
        answer:
          "Go to Profile > Edit, and enter your new email address. You will receive a verification email to confirm the change.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Go to Settings > Data Management and click 'Delete Account'. This action is permanent and will delete all your data. You'll need to confirm with your password.",
      },
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    faqs: [
      {
        question: "Where can I view my spending habits?",
        answer:
          "Go to the Reports section from the sidebar. You'll find detailed charts and graphs breaking down your expenses by category, time, and payment method.",
      },
      {
        question: "Can I filter reports by date?",
        answer:
          "Yes! Use the date range picker at the top of the Reports page to view data for specific days, weeks, months, or custom date ranges.",
      },
    ],
  },
];
