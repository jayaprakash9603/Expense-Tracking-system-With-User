/**
 * Arabic Translations (العربية)
 * RTL (Right-to-Left) language
 */
export const ar = {
  // Common
  common: {
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    search: "بحث",
    filter: "تصفية",
    export: "تصدير",
    import: "استيراد",
    refresh: "تحديث",
    loading: "جارٍ التحميل...",
    noData: "لا توجد بيانات متاحة",
    error: "حدث خطأ",
    success: "نجح",
    confirm: "تأكيد",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    close: "إغلاق",
    submit: "إرسال",
    reset: "إعادة تعيين",
  },

  // Dashboard
  dashboard: {
    title: "لوحة المعلومات المالية",
    subtitle: "رؤى في الوقت الفعلي حول صحتك المالية",
    metrics: "المقاييس",
    dailySpending: "نمط الإنفاق اليومي",
    categoryBreakdown: "التوزيع حسب الفئة",
    monthlyTrend: "الاتجاه الشهري",
    paymentMethods: "طرق الدفع",
    recentTransactions: "المعاملات الأخيرة",
    budgetOverview: "نظرة عامة على الميزانية",
    quickAccess: "الوصول السريع",
    summaryOverview: "نظرة عامة ملخصة",
    customize: "تخصيص لوحة المعلومات",
    refreshData: "تحديث البيانات",
    exportReports: "تصدير التقارير",
  },

  // Settings
  settings: {
    title: "الإعدادات",
    subtitle: "إدارة تفضيلاتك",

    appearance: "المظهر",
    language: "اللغة والمنطقة",
    privacy: "الخصوصية والأمان",
    notifications: "الإشعارات",
    account: "الحساب",
    about: "حول",

    theme: "الوضع الداكن",
    themeLight: "الوضع الفاتح لرؤية أفضل في البيئات المضيئة",
    themeDark: "الوضع الداكن لتقليل إجهاد العين",

    languageLabel: "اللغة",
    languageDescription: "اختر لغتك المفضلة",

    profileVisibility: "رؤية الملف الشخصي",
    profileVisibilityDescription: "التحكم في من يمكنه رؤية ملفك الشخصي",
    visibilityPublic: "عام",
    visibilityFriends: "الأصدقاء فقط",
    visibilityPrivate: "خاص",

    dataMasking: "إخفاء البيانات",
    dataMaskingDescription: "إخفاء المعلومات المالية الحساسة",

    autoLogout: "تسجيل خروج تلقائي",
    autoLogoutDescription: "تسجيل الخروج بعد عدم النشاط",

    notificationSettings: "تفضيلات الإشعارات",
    notificationSettingsDescription: "إدارة إعدادات الإشعارات",

    changePassword: "تغيير كلمة المرور",
    changePasswordDescription: "تحديث كلمة مرور حسابك",
    change: "تغيير",

    deleteAccount: "حذف الحساب",
    deleteAccountDescription: "حذف حسابك نهائياً",
    deleteAccountWarning: "لا يمكن التراجع عن هذا الإجراء",

    currency: "العملة",
    currencyDescription: "اختر عملتك المفضلة",

    dateFormat: "تنسيق التاريخ",
    dateFormatDescription: "اختر كيفية عرض التواريخ",

    sessionTimeout: "مهلة الجلسة",
    sessionTimeoutDescription: "مدة عدم النشاط",
    minutes: "دقائق",
  },

  // Auth
  auth: {
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    register: "تسجيل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    rememberMe: "تذكرني",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    switchToAdminMode: "التبديل إلى وضع المسؤول",
    switchToUserMode: "التبديل إلى وضع المستخدم",
    viewProfile: "عرض الملف الشخصي",
  },

  // Expenses
  expenses: {
    title: "النفقات",
    addExpense: "إضافة نفقة",
    editExpense: "تعديل النفقة",
    deleteExpense: "حذف النفقة",
    amount: "المبلغ",
    category: "الفئة",
    date: "التاريخ",
    description: "الوصف",
    paymentMethod: "طريقة الدفع",
    noExpenses: "لم يتم العثور على نفقات",
  },

  // Budget
  budget: {
    title: "الميزانية",
    addBudget: "إضافة ميزانية",
    editBudget: "تعديل الميزانية",
    deleteBudget: "حذف الميزانية",
    budgetName: "اسم الميزانية",
    allocatedAmount: "المبلغ المخصص",
    spentAmount: "المبلغ المنفق",
    remainingAmount: "المتبقي",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    noBudgets: "لم يتم العثور على ميزانيات",
  },

  // Categories
  categories: {
    title: "الفئات",
    addCategory: "إضافة فئة",
    editCategory: "تعديل الفئة",
    deleteCategory: "حذف الفئة",
    categoryName: "اسم الفئة",
    icon: "الأيقونة",
    color: "اللون",
  },

  // Messages
  messages: {
    saveSuccess: "تم الحفظ بنجاح",
    updateSuccess: "تم التحديث بنجاح",
    deleteSuccess: "تم الحذف بنجاح",
    saveError: "خطأ في الحفظ",
    updateError: "خطأ في التحديث",
    deleteError: "خطأ في الحذف",
    loadError: "خطأ في تحميل البيانات",
    confirmDelete: "هل أنت متأكد من أنك تريد حذف هذا العنصر؟",
    languageChanged: "تم تغيير اللغة بنجاح",
  },
};
