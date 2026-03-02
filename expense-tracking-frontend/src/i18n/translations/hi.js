/**
 * Hindi Translations (हिन्दी)
 */
export const hi = {
  // Common
  common: {
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    add: "जोड़ें",
    search: "खोजें",
    filter: "फ़िल्टर",
    export: "निर्यात करें",
    import: "आयात करें",
    refresh: "ताज़ा करें",
    loading: "लोड हो रहा है...",
    noData: "कोई डेटा उपलब्ध नहीं है",
    error: "एक त्रुटि हुई",
    success: "सफल",
    confirm: "पुष्टि करें",
    back: "पीछे",
    next: "अगला",
    previous: "पिछला",
    close: "बंद करें",
    submit: "जमा करें",
    reset: "रीसेट करें",
    yes: "हाँ",
    no: "नहीं",
    notAvailable: "उपलब्ध नहीं",
    viewAnalytics: "विश्लेषण देखें",
    finish: "Finish",
    skip: "Skip",
  },

  // नेविगेशन
  navigation: {
    adminPanelHeading: "एडमिन पैनल",
    dashboard: "डैशबोर्ड",
    userManagement: "उपयोगकर्ता प्रबंधन",
    roleManagement: "भूमिका प्रबंधन",
    systemAnalytics: "सिस्टम विश्लेषण",
    auditLogs: "ऑडिट लॉग्स",
    reports: "रिपोर्ट्स",
    settings: "सेटिंग्स",
    stories: "स्टोरीज़",
    home: "होम",
    expenses: "खर्चे",
    categories: "श्रेणियां",
    payments: "भुगतान",
    bill: "बिल",
    friends: "मित्र",
    groups: "समूह",
    budgets: "बजट्स",
    history: "इतिहास",
    paymentMethod: "भुगतान विधि",
    calendar: "कैलेंडर",
    utilities: "यूटिलिटीज़",
    myShares: "मेरे शेयर्स",
    publicShares: "सार्वजनिक शेयर्स",
    sharedWithMe: "मेरे साथ साझा",
  },

  // Flows
  flows: {
    entities: {
      category: {
        singular: "श्रेणी",
        plural: "श्रेणियां",
      },
      paymentMethod: {
        singular: "भुगतान विधि",
        plural: "भुगतान विधियाँ",
      },
      empty: {
        search: {
          title: "कोई परिणाम नहीं",
          subtitle:
            '"{{query}}" के लिए कोई परिणाम नहीं। कोई अन्य शब्द आज़माएँ।',
        },
        none: {
          title: "कोई डेटा नहीं मिला",
          receiptScanner: {
            title: "रसीद स्कैन करें",
            buttonLabel: "रसीद स्कैन करें",
            tooltip: "OCR की मदद से रसीद स्कैन करें और खर्च विवरण स्वतः भरें",
            tip: "💡 सुझाव: सर्वोत्तम परिणामों के लिए रसीद के सभी पेज अपलोड करें",
            dropTitle: "अपनी रसीद के पेज यहाँ छोड़ें",
            dropSubtitle: "या फ़ाइल चुनने के लिए क्लिक करें",
            supportedFormats:
              "समर्थित: JPG, PNG, GIF, BMP, TIFF (प्रति फ़ाइल अधिकतम 10MB)",
            multiPageChip: "मल्टी-पेज रसीदों के लिए कई पेज अपलोड करें",
            fileCountSingular: "{{count}} पेज चुना गया",
            fileCountPlural: "{{count}} पेज चुने गए",
            scanButtonProcessingSingular: "{{count}} पेज स्कैन हो रहा है...",
            scanButtonProcessingPlural: "{{count}} पेज स्कैन हो रहे हैं...",
            scanButtonReadySingular: "{{count}} पेज स्कैन करें",
            scanButtonReadyPlural: "{{count}} पेज स्कैन करें",
            pageLabel: "पेज {{number}}",
            imageAlt: "रसीद पेज {{number}}",
            addMore: "और जोड़ें",
            clearAll: "सभी साफ़ करें",
            confidenceTitle: "OCR भरोसा: {{confidence}}%",
            confidenceHint:
              "ज़रूरत अनुसार फ़ील्ड की समीक्षा और संपादन करें। पीले/लाल बैज कम भरोसे को दर्शाते हैं।",
            errors: {
              fileLimit: "अधिकतम {{max}} फ़ाइलें अनुमत हैं",
              invalidFormat:
                "{{fileName}}: अमान्य फ़ॉर्मेट (केवल JPG, PNG, GIF, BMP या TIFF)",
              fileSize: "{{fileName}}: फ़ाइल 10MB सीमा से अधिक है",
            },
            fields: {
              merchant: {
                label: "व्यापारी का नाम",
                placeholder: "व्यापारी का नाम दर्ज करें",
              },
              amount: {
                label: "कुल राशि",
                placeholder: "0.00",
              },
              date: {
                label: "तारीख",
              },
              tax: {
                label: "कर (GST/CGST/SGST)",
                placeholder: "0.00",
              },
              category: {
                label: "सुझाई गई श्रेणी",
              },
              paymentMethod: {
                label: "भुगतान विधि",
              },
              detectedItems: "पाई गई वस्तुएँ ({{count}})",
            },
            badges: {
              labels: {
                high: "उच्च",
                medium: "मध्यम",
                low: "निम्न",
              },
              tooltipFallback: "{{level}} भरोसा",
            },
            actions: {
              scanAnother: "एक और स्कैन करें",
              useData: "इन डेटा का उपयोग करें",
            },
            defaults: {
              expenseName: "रसीद खर्च",
              descriptionPrefix: "रसीद से स्कैन किया गया",
              taxSuffix: " (कर: {{currency}}{{amount}})",
            },
            meta: {
              processedIn: "OCR द्वारा {{ms}}ms में संसाधित",
            },
            successMessage: {
              title: "रसीद सफलतापूर्वक स्कैन हुई!",
              body: "निष्कर्ष:\n- नाम: {{name}}\n- राशि: {{amount}}\n- तारीख: {{date}}\n\nकृपया आवश्यकता अनुसार समीक्षा और संपादन करें।",
            },
          },
          subtitle: "फ़िल्टर समायोजित करें या अवधि बदलें",
        },
      },
      expenseCount: "{{count}} खर्च",
    },
    confirmations: {
      deleteCategory: "क्या आप वाकई इस श्रेणी को हटाना चाहते हैं?",
      deletePaymentMethod: "क्या आप वाकई इस भुगतान विधि को हटाना चाहते हैं?",
    },
    categoryFlow: {
      createDialogTitle: "श्रेणी बनाएँ",
    },
    paymentMethodFlow: {
      createDialogTitle: "भुगतान विधि बनाएँ",
    },
    messages: {
      createSuccess: '{{entity}} "{{name}}" सफलतापूर्वक बनाई गई',
      deleteSuccess: '{{entity}} "{{name}}" सफलतापूर्वक हटाई गई।',
      deleteError: "{{entity}} हटाने में विफल। कृपया पुनः प्रयास करें।",
    },
    expensesTable: {
      title: "खर्चे",
      entityTitle: "{{name}} खर्चे",
      summary: "{{count}} प्रविष्टियाँ • कुल {{total}}",
      empty: "कोई खर्च नहीं मिला",
      emptyHint: "दूसरा कार्ड या अवधि चुनकर देखें",
      unnamedExpense: "बिना नाम का खर्च",
      noDate: "कोई तारीख नहीं",
      type: {
        income: "आय",
        expense: "खर्च",
      },
    },
    search: {
      placeholder: "{{entityPlural}} खोजें...",
    },
    rangeLabels: {
      entityWeek: "{{entityPlural}} इस सप्ताह",
      entityMonth: "{{entityPlural}} इस महीने",
      entityYear: "{{entityPlural}} इस वर्ष",
    },
  },

  // नया खर्च
  newExpense: {
    title: "नया खर्च",
    header: {
      previouslyAdded: "पहले जोड़ा गया",
    },
    indicators: {
      autoFilled: "स्वतः भरा गया",
    },
    actions: {
      linkBudgets: "बजट लिंक करें",
      submit: "जमा करें",
      successMessage: "खर्च सफलतापूर्वक बनाया गया!",
    },
    messages: {
      errorLoadingBudgets: "बजट लोड नहीं हो पाए",
    },
    autocomplete: {
      noOptions: "कोई विकल्प उपलब्ध नहीं",
    },
    fields: {
      expenseName: "खर्च का नाम",
      amount: "राशि",
      date: "तारीख",
      transactionType: "लेनदेन प्रकार",
      category: "श्रेणी",
      paymentMethod: "भुगतान विधि",
      comments: "टिप्पणियाँ",
    },
    placeholders: {
      expenseName: "खर्च का नाम दर्ज करें",
      amount: "राशि दर्ज करें",
      date: "तारीख चुनें",
      transactionType: "लेनदेन प्रकार चुनें",
      category: "श्रेणी चुनें",
      paymentMethod: "भुगतान विधि चुनें",
      comments: "टिप्पणी जोड़ें",
      generic: "अपना {{field}} दर्ज करें",
    },
    table: {
      headers: {
        name: "नाम",
        inBudget: "बजट में",
        description: "विवरण",
        startDate: "प्रारंभ तिथि",
        endDate: "समाप्ति तिथि",
        remainingAmount: "शेष राशि",
        amount: "राशि",
      },
      noRows: "कोई पंक्ति नहीं मिली",
    },
    transactionTypes: {
      gain: "लाभ",
      loss: "हानि",
    },
  },

  // खर्च संपादित करें
  editExpense: {
    title: "खर्च संपादित करें",
    actions: {
      linkBudgets: "बजट लिंक करें",
      submit: "जमा करें",
      successMessage: "खर्च सफलतापूर्वक अपडेट किया गया!",
    },
    messages: {
      updateError: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
      errorLoadingBudgets: "बजट लोड नहीं हो पाए",
    },
    autocomplete: {
      noOptions: "कोई विकल्प उपलब्ध नहीं",
    },
    fields: {
      expenseName: "खर्च का नाम",
      amount: "राशि",
      date: "तारीख",
      transactionType: "लेनदेन प्रकार",
      category: "श्रेणी",
      paymentMethod: "भुगतान विधि",
      comments: "टिप्पणियाँ",
    },
    placeholders: {
      expenseName: "खर्च का नाम दर्ज करें",
      amount: "राशि दर्ज करें",
      date: "तारीख चुनें",
      transactionType: "लेनदेन प्रकार चुनें",
      category: "श्रेणी खोजें",
      paymentMethod: "भुगतान विधि चुनें",
      comments: "टिप्पणी जोड़ें (वैकल्पिक)",
      generic: "अपना {{field}} दर्ज करें",
    },
    validation: {
      expenseName: "खर्च का नाम आवश्यक है।",
      amount: "राशि आवश्यक है।",
      date: "तारीख आवश्यक है।",
      transactionType: "लेनदेन प्रकार आवश्यक है।",
    },
    table: {
      headers: {
        name: "नाम",
        inBudget: "बजट में",
        description: "विवरण",
        startDate: "प्रारंभ तिथि",
        endDate: "समाप्ति तिथि",
        remainingAmount: "शेष राशि",
        amount: "राशि",
      },
      noRows: "कोई पंक्ति नहीं मिली",
    },
    transactionTypes: {
      gain: "लाभ",
      loss: "हानि",
    },
  },

  // नया बजट
  newBudget: {
    title: "नया बजट",
    actions: {
      linkExpenses: "खर्च लिंक करें",
      submit: "जमा करें",
      submitting: "जमा किया जा रहा है...",
    },
    messages: {
      createSuccess: "बजट सफलतापूर्वक बनाया गया!",
      createError: "बजट बनाने में विफल। कृपया पुनः प्रयास करें।",
      expenseLoadError: "खर्च लोड नहीं हो पाए।",
    },
    fields: {
      name: "बजट का नाम",
      description: "विवरण",
      startDate: "प्रारंभ तिथि",
      endDate: "समाप्ति तिथि",
      amount: "राशि",
    },
    placeholders: {
      name: "बजट का नाम दर्ज करें",
      description: "विवरण जोड़ें",
      startDate: "प्रारंभ तिथि चुनें",
      endDate: "समाप्ति तिथि चुनें",
      amount: "कुल राशि दर्ज करें",
      generic: "अपना {{field}} दर्ज करें",
    },
    validation: {
      name: "बजट का नाम आवश्यक है।",
      description: "विवरण आवश्यक है।",
      startDate: "प्रारंभ तिथि आवश्यक है।",
      endDate: "समाप्ति तिथि आवश्यक है।",
      amount: "राशि आवश्यक है।",
    },
    table: {
      headers: {
        date: "तारीख",
        expenseName: "खर्च का नाम",
        amount: "राशि",
        paymentMethod: "भुगतान विधि",
        type: "प्रकार",
        comments: "टिप्पणियाँ",
        inBudget: "बजट में",
      },
      noRows: "कोई पंक्ति नहीं मिली",
    },
  },

  // बजट संपादित करें
  editBudget: {
    title: "बजट संपादित करें",
    actions: {
      linkExpenses: "खर्च लिंक करें",
      submit: "जमा करें",
      submitting: "जमा किया जा रहा है...",
    },
    messages: {
      updateSuccess: "बजट सफलतापूर्वक अपडेट किया गया!",
      updateError: "बजट अपडेट नहीं हो पाया। कृपया पुनः प्रयास करें।",
      expenseLoadError: "खर्च लोड नहीं हो पाए।",
      budgetLoadError: "बजट विवरण लोड नहीं हो पाए।",
    },
    fields: {
      name: "बजट का नाम",
      description: "विवरण",
      startDate: "प्रारंभ तिथि",
      endDate: "समाप्ति तिथि",
      amount: "राशि",
    },
    placeholders: {
      name: "बजट का नाम दर्ज करें",
      description: "विवरण जोड़ें",
      startDate: "प्रारंभ तिथि चुनें",
      endDate: "समाप्ति तिथि चुनें",
      amount: "कुल राशि दर्ज करें",
      generic: "अपना {{field}} दर्ज करें",
    },
    validation: {
      name: "बजट का नाम आवश्यक है।",
      description: "विवरण आवश्यक है।",
      startDate: "प्रारंभ तिथि आवश्यक है।",
      endDate: "समाप्ति तिथि आवश्यक है।",
      amount: "राशि आवश्यक है।",
    },
    table: {
      headers: {
        date: "तारीख",
        expenseName: "खर्च का नाम",
        amount: "राशि",
        paymentMethod: "भुगतान विधि",
        type: "प्रकार",
        comments: "टिप्पणियाँ",
        inBudget: "बजट में",
      },
      noRows: "कोई पंक्ति नहीं मिली",
    },
  },

  // बिल साझा अनुवाद
  billCommon: {
    fields: {
      name: "बिल का नाम",
      description: "विवरण",
      date: "तारीख",
      paymentMethod: "भुगतान विधि",
      type: "प्रकार",
      category: "श्रेणी",
    },
    placeholders: {
      billName: "बिल का नाम दर्ज करें",
      searchBillName: "बिल का नाम खोजें या लिखें",
      description: "विवरण दर्ज करें",
      paymentMethod: "भुगतान विधि चुनें",
      type: "प्रकार चुनें",
      category: "श्रेणी खोजें",
      itemName: "आइटम का नाम",
      quantity: "मात्रा *",
      unitPrice: "इकाई मूल्य *",
      comments: "टिप्पणियाँ",
    },
    typeOptions: {
      gain: "लाभ",
      loss: "हानि",
    },
    indicators: {
      previouslyAdded: "पहले जोड़ा गया",
      autoFilled: "स्वतः भरा गया",
    },
    actions: {
      linkBudgets: "बजट लिंक करें",
      hideBudgets: "बजट छुपाएँ",
      addExpenses: "खर्च आइटम जोड़ें",
      editExpenses: "खर्च आइटम संपादित करें",
      hideExpenses: "खर्च आइटम छुपाएँ",
      addRow: "पंक्ति जोड़ें",
      saveExpenses: "खर्च सहेजें",
      saveChanges: "परिवर्तन सहेजें",
      submit: "जमा करें",
      update: "अपडेट करें",
    },
    budgets: {
      heading: "चयनित तारीख के उपलब्ध बजट",
      noBudgets: "चयनित तारीख के लिए कोई बजट नहीं मिला",
      errorMessage: "त्रुटि: {{message}}",
      fallbackError: "बजट लोड नहीं हो पाए।",
      columns: {
        name: "नाम",
        description: "विवरण",
        startDate: "प्रारंभ तिथि",
        endDate: "समाप्ति तिथि",
        remainingAmount: "शेष राशि",
        amount: "राशि",
      },
    },
    expenseTable: {
      headers: {
        itemName: "आइटम नाम *",
        quantity: "मात्रा *",
        unitPrice: "इकाई मूल्य *",
        totalPrice: "कुल मूल्य",
        comments: "टिप्पणियाँ",
        actions: "क्रियाएँ",
      },
      validationHintDetailed:
        "वर्तमान आइटम (आइटम नाम, मात्रा और इकाई मूल्य आवश्यक हैं) पूरा करें ताकि और पंक्तियाँ जोड़ सकें",
      validationHintSimple: "और पंक्तियाँ जोड़ने के लिए वर्तमान आइटम पूरा करें",
      totalLabel: "कुल राशि",
      summaryLabels: {
        qty: "मात्रा",
        unit: "इकाई",
        calc: "गणना",
        comments: "टिप्पणियाँ",
      },
    },
    summary: {
      title: "खर्च आइटम सारांश",
      singleItem: "{{count}} आइटम जोड़ा गया",
      multipleItems: "{{count}} आइटम जोड़े गए",
      noItemsTitle: "⚠️ कोई खर्च आइटम अभी तक नहीं जोड़ा गया",
    },
    messages: {
      noItemsCreate: "बिल बनाने के लिए कम से कम एक खर्च आइटम आवश्यक है",
      noItemsEdit: "बिल अपडेट करने के लिए कम से कम एक खर्च आइटम आवश्यक है",
      unsavedChanges:
        "आपके पास बिना सहेजे खर्च आइटम हैं। क्या आप बिना सहेजे बंद करना चाहते हैं? सभी दर्ज डेटा खो जाएगा।",
      addExpenseValidationDetailed:
        "सहेजने से पहले कम से कम एक पूरा खर्च आइटम जोड़ें। आइटम नाम, मात्रा और इकाई मूल्य सभी आवश्यक हैं।",
      addExpenseValidationSimple:
        "कृपया सहेजने से पहले कम से कम एक पूरा खर्च आइटम जोड़ें।",
      expensesRequiredCreate: "बिल बनाने के लिए कम से कम एक खर्च आइटम जोड़ें।",
      expensesRequiredUpdate:
        "बिल अपडेट करने के लिए कम से कम एक खर्च आइटम जोड़ें।",
      totalAmountInvalid: "कुल राशि शून्य से अधिक होनी चाहिए।",
      invalidQuantityOrPrice:
        "मात्रा और इकाई मूल्य दोनों के लिए मान्य धनात्मक मान दर्ज करें।",
    },
  },

  // बिल बनाएँ
  createBill: {
    title: "बिल बनाएँ",
    labels: {
      expenseTableTitle: "खर्च आइटम",
    },
    messages: {
      success: "बिल सफलतापूर्वक बनाया गया!",
      failure: "बिल बनाने में विफल। कृपया पुनः प्रयास करें।",
      errorWithReason: "बिल बनाने में त्रुटि: {{message}}",
      budgetLoadError: "बजट लोड नहीं हो पाए।",
    },
    summary: {
      noItemsSubtitle: "बिल बनाने के लिए कम से कम एक खर्च आइटम आवश्यक है",
    },
  },

  // बिल संपादित करें (पूरक)
  editBill: {
    title: "बिल संपादित करें",
    labels: {
      expenseTableTitle: "खर्च आइटम संपादित करें",
    },
    messages: {
      success: "बिल सफलतापूर्वक अपडेट किया गया!",
      errorWithReason: "बिल अपडेट करते समय त्रुटि: {{message}}",
      loadErrorTitle: "⚠️ बिल लोड करने में त्रुटि",
      noBillId: "कोई बिल आईडी प्रदान नहीं की गई।",
      invalidData: "बिल डेटा अनुपलब्ध या अमान्य है।",
    },
    buttons: {
      retry: "पुनः प्रयास करें",
      goBack: "वापस जाएँ",
    },
    summary: {
      noItemsSubtitle: "बिल अपडेट करने के लिए कम से कम एक खर्च आइटम आवश्यक है",
    },
  },

  // Cashflow
  cashflow: {
    searchPlaceholder: "खर्च खोजें...",
    genericSearchPlaceholder: "खोजें...",
    nav: {
      reports: "रिपोर्ट्स",
      categories: "श्रेणियां",
      budget: "बजट",
      paymentMethod: "भुगतान विधि",
      bill: "बिल",
      calendar: "कैलेंडर",
    },
    addNew: {
      label: "नया जोड़ें",
      tooltip: "खर्च, बजट, श्रेणी जोड़ें या फ़ाइल अपलोड करें",
      readOnly: "आपके पास केवल पढ़ने की अनुमति है",
      options: {
        addExpense: "खर्च जोड़ें",
        uploadFile: "फ़ाइल अपलोड करें",
        addBudget: "बजट जोड़ें",
        addCategory: "श्रेणी जोड़ें",
        addPaymentMethod: "भुगतान विधि जोड़ें",
      },
    },
    labels: {
      weekNumber: "सप्ताह {{number}}",
      amountMasked: "राशि छिपाई गई",
      amountWithValue: "राशि: {{amount}}",
      billBadge: "बिल",
      monthPlaceholder: "माह",
      datePlaceholder: "तारीख",
      noComments: "कोई टिप्पणी नहीं",
      uncategorized: "अवर्गीकृत",
      unknownPayment: "अज्ञात",
      recentFirst: "हाल के पहले",
      oldFirst: "पुराने पहले",
      expenses: "खर्चे",
      total: "कुल",
      average: "औसत",
      minimum: "न्यूनतम",
      maximum: "अधिकतम",
      selectionTitle: "चयन",
      selectionCounter: "{{total}} में से {{current}}",
    },
    tooltips: {
      collapseStats: "चयन आँकड़े संक्षिप्त करें",
      expandStats: "चयन आँकड़े विस्तारित करें",
      hideStats: "आँकड़े छिपाएँ",
      showStats: "आँकड़े दिखाएँ",
      clearSelection: "चयन साफ़ करें",
      deleteSelected: "चयनित {{count}} हटाएँ",
      scrollTop: "ऊपर स्क्रॉल करें",
      scrollBottom: "नीचे स्क्रॉल करें",
      previousMonth: "पिछला महीना",
      nextMonth: "अगला महीना",
      selectMonth: "किसी महीने का चयन करने के लिए क्लिक करें",
      previousDate: "पिछली तारीख",
      nextDate: "अगली तारीख",
      selectDate: "किसी विशिष्ट तारीख पर जाने के लिए क्लिक करें",
      sortAscending: "सबसे पुराना पहले (आरोही क्रम)",
      sortDescending: "सबसे नया पहले (अवरोही क्रम)",
      billExpense: "यह बिल खर्च है",
      category: "श्रेणी: {{category}}",
      paymentMethod: "भुगतान: {{method}}",
      previousSelected: "पिछले चयनित खर्च पर जाएँ",
      nextSelected: "अगले चयनित खर्च पर जाएँ",
      selectionNavigator: "चयनित खर्चों के बीच नेविगेट करें",
    },
    summary: {
      collapseAria: "चयन आँकड़े संक्षिप्त करें",
      expandAria: "चयन आँकड़े विस्तारित करें",
      clear: "साफ़ करें",
      clearSelection: "चयन साफ़ करें",
    },
    deletion: {
      header: "हटाने की पुष्टि",
      approve: "हाँ, हटाएँ",
      decline: "नहीं, रद्द करें",
      deleting: "हटा रहा है...",
      confirmMultiple: "क्या आप सच में {{count}} चयनित खर्च हटाना चाहते हैं?",
      confirmSingle: 'क्या आप सच में "{{name}}" हटाना चाहते हैं?',
      confirmSingleFallback: "इस खर्च",
      toastMultiSuccess: "चयनित खर्च सफलतापूर्वक हटाए गए।",
      toastMultiError:
        "चयनित खर्चों को हटाते समय त्रुटि। कृपया पुनः प्रयास करें।",
      toastBillSuccess: "बिल सफलतापूर्वक हटाया गया।",
      toastExpenseSuccess: "खर्च सफलतापूर्वक हटाया गया।",
      toastExpenseError: "खर्च हटाने में त्रुटि। कृपया पुनः प्रयास करें।",
    },
    messages: {
      noDataChart: "दिखाने के लिए कोई डेटा नहीं",
      adjustFilters: "फ़िल्टर या तारीख सीमा समायोजित करें",
      noMatches: "कोई परिणाम नहीं",
      noData: "कोई डेटा नहीं मिला",
      searchSuggestion: "किसी अन्य खोज शब्द का प्रयास करें",
      adjustPeriod: "फ़िल्टर समायोजित करें या अवधि बदलें",
      noMonthsAvailable: "कोई महीने उपलब्ध नहीं हैं",
    },
    sort: {
      recentFirst: "नवीनतम पहले",
      highToLow: "उच्च से निम्न",
      lowToHigh: "निम्न से उच्च",
    },
    actions: {
      editExpense: "खर्च संपादित करें",
      deleteExpense: "खर्च हटाएँ",
      deleteSelected: "चयनित हटाएँ",
    },
    flowToggle: {
      all: "आय और व्यय",
      inflow: "आय",
      outflow: "व्यय",
    },
    chart: {
      xAxisDay: "दिन",
      xAxisWeekday: "सप्ताह का दिन",
      xAxisMonth: "माह",
      yAxisAmount: "राशि",
      averageLabel: "औसत",
      tooltipAmount: "राशि",
    },
    rangeTypes: {
      week: "सप्ताह",
      month: "माह",
      year: "वर्ष",
    },
    rangeLabels: {
      thisWeek: "यह सप्ताह",
      thisMonth: "यह माह",
      thisYear: "यह वर्ष",
    },
    weekDays: {
      mon: "सोम",
      tue: "मंगल",
      wed: "बुध",
      thu: "गुरु",
      fri: "शुक्र",
      sat: "शनि",
      sun: "रवि",
    },
    monthsShort: {
      jan: "जन",
      feb: "फ़र",
      mar: "मार्च",
      apr: "अप्रै",
      may: "मई",
      jun: "जून",
      jul: "जुलाई",
      aug: "अग",
      sep: "सित",
      oct: "अक्टू",
      nov: "नव",
      dec: "दिस",
    },
    tableHeaders: {
      name: "खर्च का नाम",
      amount: "राशि",
      type: "प्रकार",
      paymentMethod: "भुगतान विधि",
      netAmount: "शुद्ध राशि",
      comments: "टिप्पणियाँ",
      creditDue: "क्रेडिट देय",
      date: "तारीख",
    },
  },

  // Dashboard
  dashboard: {
    title: "वित्तीय डैशबोर्ड",
    subtitle: "आपके वित्तीय स्वास्थ्य पर रीयल-टाइम जानकारी",
    metrics: "मेट्रिक्स",
    dailySpending: "दैनिक खर्च पैटर्न",
    categoryBreakdown: "श्रेणी विवरण",
    monthlyTrend: "मासिक रुझान",
    paymentMethods: "भुगतान विधियां",
    recentTransactions: "हाल के लेनदेन",
    budgetOverview: "बजट अवलोकन",
    quickAccess: "त्वरित पहुंच",
    summaryOverview: "सारांश अवलोकन",
    customize: "डैशबोर्ड अनुकूलित करें",
    refreshData: "डेटा ताज़ा करें",
    exportReports: "रिपोर्ट्स निर्यात करें",
    overview: {
      title: "एप्लिकेशन अवलोकन",
      liveSummary: "लाइव सारांश",
      totalExpenses: "कुल खर्च",
      creditDue: "क्रेडिट बकाया",
      activeBudgets: "सक्रिय बजट",
      friends: "मित्र",
      groups: "समूह",
      avgDailySpend: "औसत दैनिक खर्च",
      last30Days: "पिछले 30 दिन",
      savingsRate: "बचत दर",
      ofIncome: "आय का",
      upcomingBills: "आगामी बिल",
      dueThisPeriod: "इस अवधि में देय",
      topExpenses: "शीर्ष खर्च",
      noExpensesData: "कोई खर्च डेटा उपलब्ध नहीं है",
    },
    charts: {
      titles: {
        dailySpending: "📊 दैनिक खर्च पैटर्न",
        spendingTrends: "खर्च रुझान",
      },
      typeOptions: {
        loss: "व्यय",
        gain: "आय",
      },
      timeframeOptions: {
        thisMonth: "यह माह",
        lastMonth: "पिछला माह",
        last3Months: "पिछले 3 माह",
        thisYear: "यह वर्ष",
        lastYear: "पिछला वर्ष",
        allTime: "सभी समय",
      },
      timeframeChips: {
        weekly: "साप्ताहिक",
        monthly: "मासिक",
        quarterly: "त्रैमासिक",
        yearly: "वार्षिक",
      },
      tooltip: {
        totalSpending: "कुल खर्च",
        totalIncome: "कुल आय",
        dayPrefix: "दिन",
        transactions: "लेन-देन",
        moreLabel: "और",
        runningAverage: "औसत",
      },
      datasetLabels: {
        income: "आय",
        expenses: "खर्च",
        savings: "बचत",
      },
    },
  },

  // Settings
  settings: {
    title: "सेटिंग्स",
    subtitle: "अपनी प्राथमिकताएं और खाता सेटिंग्स प्रबंधित करें",

    // मुख्य अनुभाग
    appearance: "दिखावट",
    preferences: "प्राथमिकताएं",
    privacySecurity: "गोपनीयता और सुरक्षा",
    dataStorage: "डेटा और स्टोरेज",
    smartFeatures: "स्मार्ट फीचर्स और ऑटोमेशन",
    accessibility: "सुगम्यता",
    accountManagement: "खाता प्रबंधन",
    helpSupport: "सहायता और समर्थन",
    about: "के बारे में",

    // दिखावट सेटिंग्स
    theme: "थीम मोड",
    themeLight: "उज्ज्वल वातावरण में बेहतर दृश्यता के लिए लाइट मोड",
    themeDark: "आंखों के तनाव को कम करने के लिए डार्क मोड",
    fontSize: "फ़ॉन्ट आकार",
    fontSizeDescription: "बेहतर पठनीयता के लिए टेक्स्ट आकार समायोजित करें",
    compactMode: "कॉम्पैक्ट मोड",
    compactModeDescription: "कम स्पेसिंग के साथ अधिक सामग्री प्रदर्शित करें",
    animations: "एनिमेशन सक्षम करें",
    animationsDescription: "सुचारू संक्रमण और एनिमेशन दिखाएं",
    enableAnimations: "एनिमेशन सक्षम करें",
    enableAnimationsDescription: "सुचारू संक्रमण और एनिमेशन दिखाएं",
    highContrast: "हाई कंट्रास्ट मोड",
    highContrastDescription: "बेहतर पहुंच के लिए बेहतर दृश्यता",
    highContrastMode: "हाई कंट्रास्ट मोड",
    highContrastModeDescription: "बेहतर पहुंच के लिए बेहतर दृश्यता",

    // प्राथमिकताएं
    language: "भाषा",
    languageDescription: "अपनी पसंदीदा भाषा चुनें",
    defaultCurrency: "डिफ़ॉल्ट मुद्रा",
    defaultCurrencyDescription: "लेन-देन के लिए अपनी पसंदीदा मुद्रा सेट करें",
    dateFormat: "तिथि प्रारूप",
    dateFormatDescription: "चुनें कि तिथियां कैसे प्रदर्शित होती हैं",
    timeFormat: "समय प्रारूप",
    timeFormatDescription: "12-घंटे या 24-घंटे का समय प्रारूप चुनें",

    // गोपनीयता और सुरक्षा
    profileVisibility: "प्रोफ़ाइल दृश्यता",
    profileVisibilityDescription:
      "नियंत्रित करें कि आपकी प्रोफ़ाइल और खर्च की जानकारी कौन देख सकता है",
    maskSensitiveData: "संवेदनशील डेटा मास्क करें",
    maskSensitiveDataDescription:
      "गोपनीयता के लिए खर्च की राशि और वित्तीय विवरण छिपाएं",
    twoFactorAuth: "दो-कारक प्रमाणीकरण",
    twoFactorAuthDescription:
      "ईमेल OTP के माध्यम से अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ें",
    mfaAuth: "ऑथेंटिकेटर ऐप (MFA)",
    mfaAuthDescription:
      "बेहतर सुरक्षा के लिए Google Authenticator का उपयोग करें (ईमेल 2FA से प्राथमिकता)",
    configure: "कॉन्फ़िगर करें",
    blockedUsers: "अवरुद्ध उपयोगकर्ता",
    blockedUsersDescription:
      "अवरुद्ध उपयोगकर्ताओं और गोपनीयता सेटिंग्स प्रबंधित करें",
    autoLogout: "स्वचालित लॉगआउट",
    autoLogoutDescription:
      "निष्क्रियता की अवधि के बाद स्वचालित रूप से लॉगआउट करें",
    sessionTimeout: "सत्र समयबाह्य",
    sessionTimeoutDescription: "निष्क्रियता समयबाह्य अवधि",

    // डेटा और स्टोरेज
    autoBackup: "स्वचालित बैकअप",
    autoBackupDescription: "अपने डेटा को स्वचालित रूप से क्लाउड पर बैकअप करें",
    backupFrequency: "बैकअप आवृत्ति",
    backupFrequencyDescription: "अपने डेटा का बैकअप कितनी बार लेना है",
    cloudSync: "क्लाउड सिंक",
    cloudSyncDescription: "अपने सभी उपकरणों में डेटा सिंक करें",
    storageUsage: "स्टोरेज उपयोग",
    storageUsageDescription: "अपने डेटा स्टोरेज उपयोग देखें",
    clearCache: "कैश साफ़ करें",
    clearCacheDescription: "कैश किए गए डेटा को साफ़ करके स्थान मुक्त करें",

    // स्मार्ट फीचर्स
    autoCategorize: "स्वतः श्रेणीबद्ध खर्च",
    autoCategorizeDescription: "AI-संचालित स्वचालित खर्च श्रेणीकरण",
    smartBudgeting: "स्मार्ट बजट सुझाव",
    smartBudgetingDescription: "बेहतर बजट के लिए AI सिफारिशें प्राप्त करें",
    scheduledReports: "अनुसूचित रिपोर्ट",
    scheduledReportsDescription: "स्वचालित खर्च रिपोर्ट प्राप्त करें",
    expenseReminders: "खर्च अनुस्मारक",
    expenseRemindersDescription: "आवर्ती खर्चों के लिए अनुस्मारक प्राप्त करें",
    predictiveAnalytics: "भविष्यवाणी विश्लेषण",
    predictiveAnalyticsDescription:
      "पैटर्न के आधार पर भविष्य के खर्चों का पूर्वानुमान लगाएं",

    // सुगम्यता
    screenReaderSupport: "स्क्रीन रीडर सपोर्ट",
    screenReaderSupportDescription: "स्क्रीन रीडर के लिए बेहतर सपोर्ट",
    keyboardShortcuts: "कीबोर्ड शॉर्टकट",
    keyboardShortcutsDescription: "कीबोर्ड नेविगेशन शॉर्टकट सक्षम करें",
    showShortcutIndicators: "शॉर्टकट संकेतक दिखाएं",
    showShortcutIndicatorsDescription:
      "Alt कुंजी दबाने पर शॉर्टकट बैज प्रदर्शित करें",
    reduceMotion: "मोशन कम करें",
    reduceMotionDescription: "बेहतर पहुंच के लिए एनिमेशन को कम करें",
    enhancedFocusIndicators: "बेहतर फोकस संकेतक",
    enhancedFocusIndicatorsDescription:
      "फोकस किए गए तत्वों को अधिक प्रमुखता से हाइलाइट करें",
    keyboardShortcutsGuide: "कीबोर्ड शॉर्टकट गाइड",
    keyboardShortcutsGuideDescription: "सभी उपलब्ध कीबोर्ड शॉर्टकट देखें",

    // खाता प्रबंधन
    notificationSettings: "सूचना सेटिंग्स",
    notificationSettingsDescription:
      "सभी सूचना प्राथमिकताओं और चैनलों को प्रबंधित करें",
    editProfile: "प्रोफ़ाइल संपादित करें",
    editProfileDescription: "अपनी व्यक्तिगत जानकारी और प्राथमिकताएं अपडेट करें",
    changePassword: "पासवर्ड बदलें",
    changePasswordDescription: "अपना खाता पासवर्ड अपडेट करें",
    dataExport: "डेटा निर्यात",
    dataExportDescription: "अपना सभी खर्च डेटा डाउनलोड करें",
    deleteAccount: "खाता हटाएं",
    deleteAccountDescription: "अपना खाता और सभी डेटा स्थायी रूप से हटाएं",
    deleteAccountWarning:
      "आपका सभी डेटा, जिसमें खर्च, बजट और मित्र शामिल हैं, स्थायी रूप से हटा दिया जाएगा।",

    // सहायता और समर्थन
    restartTour: "टूर फिर से शुरू करें",
    restartTourDescription: "एप्लिकेशन का गाइडेड टूर दोबारा शुरू करें",
    helpCenter: "सहायता केंद्र",
    helpCenterDescription: "FAQ और सहायता लेख ब्राउज़ करें",
    contactSupport: "सपोर्ट से संपर्क करें",
    contactSupportDescription: "हमारी सपोर्ट टीम से सहायता प्राप्त करें",
    termsOfService: "सेवा की शर्तें",
    termsOfServiceDescription: "हमारी शर्तें और नियम पढ़ें",
    privacyPolicy: "गोपनीयता नीति",
    privacyPolicyDescription: "जानें कि हम आपके डेटा की सुरक्षा कैसे करते हैं",

    // ऐप जानकारी
    appVersion: "ऐप संस्करण",
    lastUpdated: "अंतिम अपडेट",
    buildNumber: "बिल्ड नंबर",

    // बटन लेबल
    enable: "सक्षम करें",
    manage: "प्रबंधित करें",
    change: "बदलें",
    view: "देखें",
    start: "शुरू करें",
    clear: "साफ़ करें",
    export: "निर्यात करें",
    edit: "संपादित करें",
    delete: "हटाएं",

    // विकल्प चुनें
    small: "छोटा",
    medium: "मध्यम (डिफ़ॉल्ट)",
    large: "बड़ा",
    extraLarge: "अतिरिक्त बड़ा",

    // प्रोफ़ाइल दृश्यता विकल्प
    public: "🌍 सार्वजनिक - कोई भी देख सकता है",
    friendsOnly: "👥 केवल मित्र - प्रतिबंधित पहुंच",
    private: "🔒 निजी - केवल आप",

    // प्रोफ़ाइल दृश्यता लेबल (चिप्स के लिए)
    publicLabel: "🌍 सार्वजनिक",
    friendsLabel: "👥 मित्र",
    privateLabel: "🔒 निजी",

    // समय प्रारूप विकल्प
    time12h: "🕐 12-घंटे (3:00 PM)",
    time24h: "🕒 24-घंटे (15:00)",

    // बैकअप आवृत्ति विकल्प
    daily: "📆 दैनिक",
    weekly: "📅 साप्ताहिक",
    monthly: "🗓️ मासिक",
    manualOnly: "✋ केवल मैनुअल",

    // रिपोर्ट अनुसूची विकल्प
    dailySummary: "📊 दैनिक सारांश",
    weeklySummary: "📈 साप्ताहिक सारांश",
    monthlySummary: "📉 मासिक सारांश",
    noScheduledReports: "🚫 कोई अनुसूचित रिपोर्ट नहीं",

    // मुद्रा विकल्प
    currencyUSD: "💵 USD - यूएस डॉलर ($)",
    currencyEUR: "💶 EUR - यूरो (€)",
    currencyGBP: "💷 GBP - ब्रिटिश पाउंड (£)",
    currencyINR: "💴 INR - भारतीय रुपया (₹)",
    currencyJPY: "💴 JPY - जापानी येन (¥)",

    // तिथि प्रारूप विकल्प
    dateFormatUS: "📅 MM/DD/YYYY (US)",
    dateFormatUK: "📅 DD/MM/YYYY (UK/EU)",
    dateFormatISO: "📅 YYYY-MM-DD (ISO)",
    usd: "USD - अमेरिकी डॉलर ($)",
    eur: "EUR - यूरो (€)",
    gbp: "GBP - ब्रिटिश पाउंड (£)",
    inr: "INR - भारतीय रुपया (₹)",
    jpy: "JPY - जापानी येन (¥)",

    // तिथि प्रारूप विकल्प
    mmddyyyy: "MM/DD/YYYY (US)",
    ddmmyyyy: "DD/MM/YYYY (UK/EU)",
    yyyymmdd: "YYYY-MM-DD (ISO)",

    // स्थिति संदेश
    profileVisibilityPublic:
      "आपकी प्रोफ़ाइल अब सार्वजनिक है - कोई भी आपकी जानकारी देख सकता है",
    profileVisibilityFriends:
      "आपकी प्रोफ़ाइल अब केवल मित्रों के लिए है - केवल मित्र देख सकते हैं",
    profileVisibilityPrivate:
      "आपकी प्रोफ़ाइल अब निजी है - केवल आप अपनी जानकारी देख सकते हैं",
  },

  // मोडल्स
  modals: {
    logoutTitle: "लॉगआउट पुष्टि",
    logoutPrompt: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
  },

  // हेडर
  header: {
    showAmounts: "राशि दिखाएं",
    hideAmounts: "राशि छिपाएं",
    switchToLight: "लाइट मोड पर स्विच करें",
    switchToDark: "डार्क मोड पर स्विच करें",
    notifications: "सूचनाएं",
    viewProfile: "प्रोफ़ाइल देखें",
    switchToUserMode: "यूज़र मोड पर स्विच करें",
    switchToAdminMode: "एडमिन मोड पर स्विच करें",
  },

  // Auth
  auth: {
    login: "लॉग इन करें",
    logout: "लॉग आउट करें",
    register: "पंजीकरण करें",
    email: "ईमेल",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    forgotPassword: "पासवर्ड भूल गए?",
    rememberMe: "मुझे याद रखें",
    signIn: "साइन इन करें",
    signUp: "साइन अप करें",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    switchToAdminMode: "एडमिन मोड पर स्विच करें",
    switchToUserMode: "उपयोगकर्ता मोड पर स्विच करें",
    viewProfile: "प्रोफ़ाइल देखें",
  },

  // Expenses
  expenses: {
    title: "खर्चे",
    addExpense: "खर्च जोड़ें",
    editExpense: "खर्च संपादित करें",
    deleteExpense: "खर्च हटाएं",
    amount: "राशि",
    category: "श्रेणी",
    date: "तिथि",
    description: "विवरण",
    paymentMethod: "भुगतान विधि",
    noExpenses: "कोई खर्च नहीं मिला",
  },

  // Budget
  budget: {
    title: "बजट",
    addBudget: "बजट जोड़ें",
    editBudget: "बजट संपादित करें",
    deleteBudget: "बजट हटाएं",
    budgetName: "बजट नाम",
    allocatedAmount: "आवंटित राशि",
    spentAmount: "खर्च की गई राशि",
    remainingAmount: "शेष",
    startDate: "प्रारंभ तिथि",
    endDate: "समाप्ति तिथि",
    noBudgets: "कोई बजट नहीं मिला",
  },

  // Categories
  categories: {
    title: "श्रेणियां",
    addCategory: "श्रेणी जोड़ें",
    editCategory: "श्रेणी संपादित करें",
    deleteCategory: "श्रेणी हटाएं",
    categoryName: "श्रेणी नाम",
    icon: "आइकन",
    color: "रंग",
  },

  // Messages
  messages: {
    saveSuccess: "सफलतापूर्वक सहेजा गया",
    updateSuccess: "सफलतापूर्वक अपडेट किया गया",
    deleteSuccess: "सफलतापूर्वक हटाया गया",
    saveError: "सहेजने में त्रुटि",
    updateError: "अपडेट करने में त्रुटि",
    deleteError: "हटाने में त्रुटि",
    loadError: "डेटा लोड करने में त्रुटि",
    confirmDelete: "क्या आप वाकई इस आइटम को हटाना चाहते हैं?",
    languageChanged: "भाषा सफलतापूर्वक बदल गई",
  },

  // OCR रसीद स्कैनिंग
  ocr: {
    title: "रसीद स्कैन करें",
    subtitle: "OCR से खर्च विवरण स्वचालित रूप से निकालें",
    steps: {
      upload: "अपलोड",
      scan: "स्कैन",
      review: "समीक्षा",
    },
    dropHere: "अपनी रसीद के पेज यहाँ ड्रॉप करें",
    orBrowse: "या फाइलें ब्राउज़ करने के लिए क्लिक करें",
    maxSize: "अधिकतम 10MB प्रत्येक",
    multiPageSupport: "बहु-पृष्ठ रसीद समर्थन",
    multiPageTip:
      "💡 सर्वोत्तम परिणामों के लिए बहु-पृष्ठ रसीदों के सभी पेज अपलोड करें",
    page: "पेज",
    pages: "पेज",
    receiptPage: "रसीद पेज",
    addMore: "और जोड़ें",
    clearAll: "सभी हटाएं",
    scanning: "स्कैन हो रहा है...",
    scanPages: "स्कैन करें",
    processingReceipt: "रसीद प्रोसेस हो रही है...",
    analyzingText: "टेक्स्ट का विश्लेषण और डेटा निकालना",
    ocrConfidence: "OCR विश्वसनीयता",
    reviewFields: "आवश्यकतानुसार फ़ील्ड्स की समीक्षा करें और संपादित करें।",
    detectedItems: "पहचानी गई वस्तुएँ",
    showRawText: "कच्चा OCR टेक्स्ट दिखाएं",
    hideRawText: "कच्चा OCR टेक्स्ट छुपाएं",
    scanAnother: "एक और स्कैन करें",
    useThisData: "यह डेटा उपयोग करें",
    processedIn: "प्रोसेस किया गया",
    usingOCR: "OCR का उपयोग करके",
    imageQuality: "छवि गुणवत्ता",
    defaultExpenseName: "रसीद खर्च",
    scannedFrom: "रसीद से स्कैन किया गया",
    tax: "कर",
    fields: {
      merchant: "व्यापारी का नाम",
      amount: "कुल राशि",
      date: "तिथि",
      category: "श्रेणी",
      paymentMethod: "भुगतान विधि",
    },
    placeholders: {
      merchant: "व्यापारी का नाम दर्ज करें",
    },
    confidence: {
      high: "उच्च",
      medium: "मध्यम",
      low: "कम",
    },
    errors: {
      maxFiles: "अधिकतम 10 फाइलें अनुमत हैं",
      invalidFormat: "अमान्य प्रारूप (JPG, PNG, GIF, BMP या TIFF उपयोग करें)",
      fileTooLarge: "फाइल 10MB से अधिक है",
    },
  },

  // MFA (मल्टी-फैक्टर ऑथेंटिकेशन)
  mfa: {
    verification: {
      title: "दो-कारक प्रमाणीकरण",
      subtitle: "अपने ऑथेंटिकेटर ऐप से 6-अंकीय कोड दर्ज करें",
      backupSubtitle: "अपने बैकअप कोड में से एक दर्ज करें",
      signingInAs: "साइन इन कर रहे हैं:",
      codeRefreshes: "कोड हर 30 सेकंड में रिफ्रेश होता है",
      verify: "सत्यापित करें",
      verifying: "सत्यापित कर रहा है...",
      useBackupCode: "बैकअप कोड का उपयोग करें",
      lostAccess: "ऑथेंटिकेटर तक पहुंच खो दी? बैकअप कोड का उपयोग करें",
      useAuthenticator: "← इसके बजाय ऑथेंटिकेटर ऐप का उपयोग करें",
      backToLogin: "लॉगिन पर वापस जाएं",
      backupCodeFormat: "बैकअप कोड 8 अक्षर के होते हैं (XXXX-XXXX प्रारूप)",
      sessionExpired: "सत्र समाप्त। कृपया फिर से लॉगिन करें।",
      loginSuccess: "लॉगिन सफल!",
      verificationFailed: "सत्यापन विफल",
    },
    setup: {
      title: "ऑथेंटिकेटर ऐप",
      subtitle: "Google Authenticator से अपना खाता सुरक्षित करें",
      authenticatorApp: "ऑथेंटिकेटर ऐप",
      authenticatorAppDescription:
        "Google Authenticator से अपना खाता सुरक्षित करें",
      setUpAuthenticator: "ऑथेंटिकेटर ऐप सेट करें",
      setUpAuthenticatorDescription:
        "अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ने के लिए Google Authenticator या किसी TOTP ऐप का उपयोग करें।",
      getStarted: "शुरू करें",
      settingUp: "सेटअप हो रहा है...",
      setupTitle: "ऑथेंटिकेटर ऐप सेट करें",
      setupDescription:
        "अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ने के लिए Google Authenticator या किसी TOTP ऐप का उपयोग करें।",
      priorityNote: "नोट",
      priorityNoteDescription:
        "दोनों सक्षम होने पर MFA, ईमेल 2FA से प्राथमिकता लेता है।",
      priorityDescription:
        "दोनों सक्षम होने पर MFA, ईमेल 2FA से प्राथमिकता लेता है।",
      steps: {
        scanQr: "QR कोड स्कैन करें",
        verifyCode: "कोड सत्यापित करें",
        saveBackup: "बैकअप कोड सहेजें",
      },
      step1Title: "1. QR कोड स्कैन करें",
      step1Description: "Google Authenticator खोलें और इस QR कोड को स्कैन करें",
      orEnterManually: "या मैन्युअल रूप से दर्ज करें",
      account: "खाता",
      issuer: "जारीकर्ता",
      copySecret: "सीक्रेट कॉपी करें",
      copied: "कॉपी हो गया!",
      continue: "जारी रखें",
      step2Title: "2. सेटअप सत्यापित करें",
      step2Description:
        "सेटअप सत्यापित करने के लिए अपने ऑथेंटिकेटर ऐप से 6-अंकीय कोड दर्ज करें",
      codeChangesEvery30Seconds: "कोड हर 30 सेकंड में बदलता है",
      codeChanges: "कोड हर 30 सेकंड में बदलता है",
      back: "वापस",
      verifyAndEnable: "सत्यापित करें और सक्षम करें",
      verifyEnable: "सत्यापित करें और सक्षम करें",
      verifying: "सत्यापित हो रहा है...",
      step3Title: "MFA सफलतापूर्वक सक्षम!",
      mfaEnabledSuccessfully: "MFA सफलतापूर्वक सक्षम!",
      saveBackupCodes: "बैकअप कोड्स",
      backupCodesWarning:
        "इन कोड्स को सुरक्षित रखें। ऑथेंटिकेटर ऐप का एक्सेस खोने पर इनका उपयोग करें।",
      backupCodesOnce: "प्रत्येक कोड केवल एक बार उपयोग किया जा सकता है।",
      copyCodes: "कोड कॉपी करें",
      download: "डाउनलोड करें",
      done: "हो गया",
      mfaEnabled: "MFA सक्षम है",
      mfaEnabledDescription: "आपका खाता Google Authenticator से सुरक्षित है।",
      backupCodesRemaining: "{{count}} बैकअप कोड शेष",
      primaryAuth: "प्राथमिक प्रमाणीकरण",
      regenerateBackupCodes: "बैकअप कोड पुनर्जीवित करें",
      disableMfa: "MFA अक्षम करें",
      disableTitle: "MFA अक्षम करें",
      disableMfaWarning:
        "यह आपके खाते से ऑथेंटिकेटर सुरक्षा हटा देगा। आगे बढ़ने के लिए आपको अपनी पहचान सत्यापित करनी होगी।",
      disableWarning: "यह आपके खाते से ऑथेंटिकेटर सुरक्षा हटा देगा।",
      importantReminder: "अनुस्मारक",
      removeAuthenticatorEntry:
        "अक्षम करने के बाद अपने ऑथेंटिकेटर ऐप से 'Expensio Finance' हटाएं।",
      beforeYouScan: "स्कैन करने से पहले",
      deleteOldEntriesWarning:
        "यदि आपने पहले MFA सक्षम किया था, तो कृपया पहले अपने Google Authenticator ऐप से पुरानी 'Expensio Finance' प्रविष्टियों को हटा दें। यह सुनिश्चित करता है कि आपके पास केवल एक सक्रिय कोड है और भ्रम से बचा जाता है।",
      useAuthenticatorCode: "ऑथेंटिकेटर कोड का उपयोग करें",
      usePassword: "पासवर्ड का उपयोग करें",
      authenticatorCode: "ऑथेंटिकेटर कोड",
      password: "पासवर्ड",
      cancel: "रद्द करें",
      mfaEnabledSuccess: "MFA सफलतापूर्वक सक्षम!",
      mfaDisabledSuccess: "MFA सफलतापूर्वक अक्षम",
      verificationFailed: "सत्यापन विफल। कृपया पुनः प्रयास करें।",
      failedToLoadStatus: "MFA स्थिति लोड करने में विफल",
      failedToStartSetup: "MFA सेटअप शुरू करने में विफल",
      failedToDisable: "MFA अक्षम करने में विफल",
      newCodesGenerated: "नए बैकअप कोड जनरेट हुए!",
      failedToRegenerate: "कोड पुनर्जीवित करने में विफल",
      copiedToClipboard: "क्लिपबोर्ड पर कॉपी हो गया!",
      backupCodesDownloaded: "बैकअप कोड डाउनलोड हुए!",
      enterCodeToRegenerate:
        "चेतावनी: यह आपके सभी मौजूदा बैकअप कोड अमान्य कर देगा!\n\nनए बैकअप कोड जनरेट करने के लिए अपना वर्तमान ऑथेंटिकेटर कोड दर्ज करें:",
    },
  },

  // Universal Search (सार्वभौमिक खोज)
  search: {
    placeholder: "खर्चे, बजट, कार्यों को खोजें...",
    openSearch: "खोजें",
    noResults: "कोई परिणाम नहीं मिला",
    tryDifferent: "कोई अन्य खोज शब्द आज़माएं",
    suggestions: "सुझाव",
    typeToSearch: "खोजने के लिए टाइप करें...",
    navigate: "नेविगेट करें",
    select: "चुनें",
    close: "बंद करें",
    poweredBy: "सार्वभौमिक खोज",

    // Section Headers
    sections: {
      admin: "एडमिन",
      quickActions: "त्वरित कार्य",
      actions: "कार्य",
      expenses: "खर्चे",
      budgets: "बजट",
      categories: "श्रेणियां",
      bills: "बिल",
      paymentMethods: "भुगतान विधियाँ",
      payment_methods: "भुगतान विधियाँ",
      friends: "मित्र",
      reports: "रिपोर्ट्स",
      settings: "सेटिंग्स",
      notifications: "सूचनाएं",
    },

    // Admin Mode Actions
    admin: {
      dashboard: "एडमिन डैशबोर्ड",
      dashboardDesc: "सिस्टम अवलोकन और मेट्रिक्स",
      users: "उपयोगकर्ता प्रबंधन",
      usersDesc: "सिस्टम उपयोगकर्ताओं को प्रबंधित करें",
      roles: "भूमिका प्रबंधन",
      rolesDesc: "उपयोगकर्ता भूमिकाएं और अनुमतियाँ प्रबंधित करें",
      analytics: "सिस्टम एनालिटिक्स",
      analyticsDesc: "सिस्टम-व्यापी एनालिटिक्स और सांख्यिकी देखें",
      audit: "ऑडिट लॉग",
      auditDesc: "सिस्टम ऑडिट ट्रेल और गतिविधि लॉग देखें",
      reports: "सिस्टम रिपोर्ट्स",
      reportsDesc: "सिस्टम रिपोर्ट्स जनरेट और देखें",
      settings: "सिस्टम सेटिंग्स",
      settingsDesc: "सिस्टम-व्यापी सेटिंग्स कॉन्फ़िगर करें",
    },

    // Quick Actions
    actions: {
      // Expense Actions
      addExpense: "खर्च जोड़ें",
      addExpenseDesc: "नया खर्च बनाएं",
      viewExpenses: "सभी खर्चे देखें",
      viewExpensesDesc: "अपना खर्च इतिहास ब्राउज़ करें",
      expenseReports: "खर्च रिपोर्ट्स",
      expenseReportsDesc: "खर्च विश्लेषण देखें",

      // Budget Actions
      createBudget: "बजट बनाएं",
      createBudgetDesc: "नया बजट सेट करें",
      viewBudgets: "बजट देखें",
      viewBudgetsDesc: "अपने बजट प्रबंधित करें",
      budgetReports: "बजट रिपोर्ट्स",
      budgetReportsDesc: "बजट विश्लेषण देखें",

      // Bill Actions
      createBill: "बिल बनाएं",
      createBillDesc: "नया आवर्ती बिल जोड़ें",
      viewBills: "बिल देखें",
      viewBillsDesc: "अपने बिल प्रबंधित करें",
      billCalendar: "बिल कैलेंडर",
      billCalendarDesc: "कैलेंडर पर बिल देखें",
      billReports: "बिल रिपोर्ट्स",
      billReportsDesc: "बिल विश्लेषण देखें",

      // Category Actions
      createCategory: "श्रेणी बनाएं",
      createCategoryDesc: "नई खर्च श्रेणी जोड़ें",
      viewCategories: "श्रेणियां देखें",
      viewCategoriesDesc: "खर्च श्रेणियां प्रबंधित करें",
      categoryReports: "श्रेणी रिपोर्ट्स",
      categoryReportsDesc: "श्रेणी के अनुसार खर्च देखें",

      // Payment Method Actions
      addPaymentMethod: "भुगतान विधि जोड़ें",
      addPaymentMethodDesc: "नई भुगतान विधि जोड़ें",
      viewPaymentMethods: "भुगतान विधियां देखें",
      viewPaymentMethodsDesc: "अपनी भुगतान विधियां प्रबंधित करें",
      paymentReports: "भुगतान विधि रिपोर्ट्स",
      paymentReportsDesc: "भुगतान विधि के अनुसार खर्च देखें",

      // Dashboard & General
      dashboard: "डैशबोर्ड",
      dashboardDesc: "मुख्य डैशबोर्ड पर जाएं",
      calendarView: "कैलेंडर दृश्य",
      calendarViewDesc: "कैलेंडर पर खर्चे देखें",
      transactions: "लेनदेन",
      transactionsDesc: "सभी लेनदेन देखें",
      allReports: "सभी रिपोर्ट्स",
      allReportsDesc: "व्यापक रिपोर्ट्स देखें",
      insights: "अंतर्दृष्टि",
      insightsDesc: "खर्च की अंतर्दृष्टि देखें",

      // Friends
      viewFriends: "मित्र",
      viewFriendsDesc: "अपने मित्र प्रबंधित करें",
      friendActivity: "मित्र गतिविधि",
      friendActivityDesc: "मित्रों की गतिविधियां देखें",

      // Groups
      viewGroups: "समूह",
      viewGroupsDesc: "खर्च समूह प्रबंधित करें",
      createGroup: "समूह बनाएं",
      createGroupDesc: "नया खर्च समूह बनाएं",

      // Settings
      settings: "सेटिंग्स",
      settingsDesc: "ऐप सेटिंग्स और प्राथमिकताएं",
      profile: "प्रोफ़ाइल",
      profileDesc: "अपनी प्रोफ़ाइल देखें और संपादित करें",
      notificationSettings: "सूचना सेटिंग्स",
      notificationSettingsDesc: "सूचना प्राथमिकताएं प्रबंधित करें",

      // Upload
      uploadExpenses: "खर्चे अपलोड करें",
      uploadExpensesDesc: "फ़ाइल से खर्चे थोक में अपलोड करें",
      uploadBills: "बिल अपलोड करें",
      uploadBillsDesc: "फ़ाइल से बिल थोक में अपलोड करें",

      // Chat
      chat: "चैट",
      chatDesc: "मित्रों के साथ चैट खोलें",

      // Tour
      restartTour: "टूर फिर से शुरू करें",
      restartTourDesc: "एप्लिकेशन का गाइडेड टूर दोबारा शुरू करें",
    },

    // सेटिंग्स खोज आइटम
    settings: {
      keyboardShortcuts: "कीबोर्ड शॉर्टकट",
      keyboardShortcutsDesc: "कीबोर्ड नेविगेशन शॉर्टकट सक्षम करें",
      showShortcutIndicators: "शॉर्टकट संकेतक दिखाएं",
      showShortcutIndicatorsDesc:
        "Alt कुंजी दबाने पर शॉर्टकट बैज प्रदर्शित करें",
      screenReader: "स्क्रीन रीडर सपोर्ट",
      screenReaderDesc: "स्क्रीन रीडर के लिए बेहतर सपोर्ट",
      reduceMotion: "मोशन कम करें",
      reduceMotionDesc: "बेहतर पहुंच के लिए एनिमेशन कम करें",
      focusIndicators: "बेहतर फोकस संकेतक",
      focusIndicatorsDesc:
        "फोकस किए गए तत्वों को अधिक प्रमुखता से हाइलाइट करें",
    },
  },

  // कीबोर्ड Alt ओवरले
  keyboard: {
    pressLetter: "एक अक्षर दबाएं:",
    escToCancel: "रद्द करने के लिए Esc",
    calendar: "कैलेंडर",
    toggleTheme: "थीम",
    toggleMasking: "मास्किंग",
    search: "खोजें",
    help: "सहायता",
    // हेडर क्रियाएं
    notifications: "सूचनाएं",
    profile: "प्रोफ़ाइल",
    // सूचना पैनल के चाइल्ड शॉर्टकट
    markAllRead: "सभी को पढ़ा हुआ करें",
    clearAll: "सभी साफ़ करें",
    close: "बंद करें",
    // प्रोफ़ाइल ड्रॉपडाउन चाइल्ड शॉर्टकट
    viewProfile: "प्रोफ़ाइल देखें",
    settings: "सेटिंग्स",
    switchMode: "मोड बदलें",
    logout: "लॉग आउट",
    // मोडल शॉर्टकट
    yes: "हाँ",
    no: "नहीं",
    confirm: "पुष्टि करें",
    cancel: "रद्द करें",
    // फ्लो पेज शॉर्टकट
    week: "सप्ताह",
    month: "महीना",
    year: "वर्ष",
    previous: "पिछला",
    next: "अगला",
    flowToggle: "फ्लो टॉगल",
    // फ्लो नेविगेशन बार शॉर्टकट (क्रमिक 1-7)
    flowNav1: "नेविगेशन 1",
    flowNav2: "नेविगेशन 2",
    flowNav3: "नेविगेशन 3",
    flowNav4: "नेविगेशन 4",
    flowNav5: "नेविगेशन 5",
    flowNav6: "नेविगेशन 6",
    flowNav7: "नेविगेशन 7",
  },

  // Tour
  tour: {
    welcomeTitle: "Expensio में आपका स्वागत है!",
    welcomeMessage: "आइए शुरुआत करने में आपकी मदद के लिए एक त्वरित दौरा करें।",
    profileMessage:
      "यह आपका प्रोफ़ाइल क्षेत्र है। कहानियाँ, मित्र अपडेट और अपनी स्थिति यहाँ देखें।",
    dashboardMessage:
      "आपका डैशबोर्ड आपको आपके वित्तीय स्वास्थ्य और हाल की गतिविधियों का त्वरित अवलोकन देता है।",
    expensesMessage:
      "अपने सभी दैनिक खर्चों को यहाँ ट्रैक करें। अपने खर्च को जोड़ें, संपादित करें और वर्गीकृत करें।",
    budgetsMessage:
      "अपने खर्च को नियंत्रण में रखने के लिए मासिक बजट निर्धारित करें। जब आप अपनी सीमाओं के करीब पहुंचेंगे तो हम आपको सचेत करेंगे।",
    groupsMessage:
      "ब्लियों को विभाजित करने और दोस्तों और परिवार के साथ आसानी से खर्च साझा करने के लिए समूह बनाएं।",
    reportsMessage:
      "विस्तृत रिपोर्ट और विश्लेषण के साथ अपनी खर्च करने की आदतों की कल्पना करें।",
    categoriesMessage:
      "अपने खर्च को प्रभावी ढंग से व्यवस्थित करने के लिए अपनी व्यय श्रेणियों का प्रबंधन करें।",
    paymentsMessage:
      "अपनी भुगतान विधियों को प्रबंधित करें और लेनदेन को ट्रैक करें।",
    billMessage:
      "विलंब शुल्क से बचने के लिए अपने बिलों और देय तिथियों पर नज़र रखें।",
    friendsMessage: "दोस्तों के साथ जुड़ें और अपनी वित्तीय यात्रा साझा करें।",
    utilitiesMessage:
      "अपनी वित्तीय योजना में सहायता के लिए विभिन्न उपयोगिता उपकरणों तक पहुँचें।",
    headerSearchMessage:
      "किसी भी सुविधा, लेनदेन या सेटिंग को त्वरित रूप से खोजें।",
    headerMaskingMessage:
      "गोपनीयता के लिए संवेदनशील राशियों की दृश्यता को टॉगल करें।",
    headerThemeMessage:
      "अपनी पसंद के अनुसार डार्क और लाइट मोड के बीच स्विच करें।",
    headerNotificationsMessage:
      "महत्वपूर्ण अलर्ट और सूचनाओं के साथ अपडेट रहें।",
    headerProfileMessage:
      "अपनी प्रोफ़ाइल सेटिंग्स तक पहुँचें और अपना खाता प्रबंधित करें।",
    finishTitle: "आप पूरी तरह तैयार हैं!",
    finishMessage:
      "Expensio का उपयोग करके अपने वित्त का प्रबंधन सहजता से करें।",
  },
};
