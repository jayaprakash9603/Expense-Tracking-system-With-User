/**
 * Telugu Translations (తెలుగు)
 */
export const te = {
  // Common
  common: {
    save: "సేవ్ చేయండి",
    cancel: "రద్దు చేయండి",
    delete: "తొలగించండి",
    edit: "సవరించండి",
    add: "జోడించండి",
    search: "శోధించండి",
    filter: "ఫిల్టర్ చేయండి",
    export: "ఎగుమతి చేయండి",
    import: "దిగుమతి చేయండి",
    refresh: "రిఫ్రెష్ చేయండి",
    loading: "లోడ్ అవుతోంది...",
    noData: "డేటా అందుబాటులో లేదు",
    error: "లోపం ఏర్పడింది",
    success: "విజయం",
    confirm: "నిర్ధారించండి",
    back: "వెనక్కి",
    next: "తరువాత",
    previous: "మునుపటి",
    close: "మూసివేయండి",
    submit: "సమర్పించండి",
    reset: "రీసెట్ చేయండి",
    yes: "అవును",
    no: "కాదు",
    notAvailable: "అందుబాటులో లేదు",
    viewAnalytics: "విశ్లేషణ చూడండి",
    finish: "Finish",
    skip: "Skip",
  },

  // Navigation
  navigation: {
    adminPanelHeading: "అడ్మిన్ ప్యానెల్",
    dashboard: "డ్యాష్‌బోర్డ్",
    userManagement: "వినియోగదారుల నిర్వహణ",
    roleManagement: "పాత్రల నిర్వహణ",
    systemAnalytics: "సిస్టమ్ విశ్లేషణ",
    auditLogs: "ఆడిట్ లాగ్స్",
    reports: "రిపోర్టులు",
    settings: "సెట్టింగ్స్",
    stories: "స్టోరీలు",
    home: "హోమ్",
    expenses: "ఖర్చులు",
    categories: "వర్గాలు",
    payments: "చెల్లింపులు",
    bill: "బిల్లు",
    friends: "స్నేహితులు",
    groups: "సమూహాలు",
    budgets: "బడ్జెట్‌లు",
    history: "చరిత్ర",
    paymentMethod: "చెల్లింపు విధానం",
    calendar: "క్యాలెండర్",
    utilities: "యుటిలిటీస్",
    myShares: "నా షేర్లు",
    publicShares: "పబ్లిక్ షేర్లు",
    sharedWithMe: "నాతో షేర్ చేయబడినవి",
  },

  // Flows
  flows: {
    entities: {
      category: {
        singular: "వర్గం",
        plural: "వర్గాలు",
      },
      paymentMethod: {
        singular: "చెల్లింపు విధానం",
        plural: "చెల్లింపు విధానాలు",
      },
      empty: {
        search: {
          title: "పోలికలు లేవు",
          subtitle: '"{{query}}" కోసం ఫలితాలు లేవు. వేరే పదం ప్రయత్నించండి.',
        },
        none: {
          title: "డేటా కనబడలేదు",
          subtitle: "ఫిల్టర్‌లను సర్దుబాటు చేయండి లేదా కాల వ్యవధిని మార్చండి",
          receiptScanner: {
            title: "రసీదు స్కాన్ చేయండి",
            buttonLabel: "రసీదు స్కాన్ చేయండి",
            tooltip:
              "OCR తో రసీదును స్కాన్ చేసి ఖర్చు వివరాలను ఆటో-ఫిల్ చేయండి",
            tip: "💡 సూచన: ఉత్తమ ఫలితాల కోసం రసీదు యొక్క అన్ని పేజీలను అప్‌లోడ్ చేయండి",
            dropTitle: "మీ రసీదు పేజీలను ఇక్కడ వదలండి",
            dropSubtitle: "లేదా ఫైల్ ఎంచుకోవడానికి క్లిక్ చేయండి",
            supportedFormats:
              "మద్దతు: JPG, PNG, GIF, BMP, TIFF (ప్రతి ఫైల్ గరిష్టం 10MB)",
            multiPageChip: "బహుళ పేజీ రసీదుల కోసం పలుకులు అప్‌లోడ్ చేయండి",
            fileCountSingular: "{{count}} పేజీ ఎంపికైంది",
            fileCountPlural: "{{count}} పేజీలు ఎంపికయ్యాయి",
            scanButtonProcessingSingular: "{{count}} పేజీ స్కాన్ అవుతోంది...",
            scanButtonProcessingPlural:
              "{{count}} పేజీలు స్కాన్ అవుతున్నాయి...",
            scanButtonReadySingular: "{{count}} పేజీని స్కాన్ చేయండి",
            scanButtonReadyPlural: "{{count}} పేజీలను స్కాన్ చేయండి",
            pageLabel: "పేజీ {{number}}",
            imageAlt: "రసీదు పేజీ {{number}}",
            addMore: "ఇంకా జోడించండి",
            clearAll: "అన్నీ క్లియర్ చేయండి",
            confidenceTitle: "OCR నమ్మకం: {{confidence}}%",
            confidenceHint:
              "అవసరమైతే ఫీల్డులను సమీక్షించి సవరించండి. పసుపు/ఎరుపు బ్యాడ్జ్‌లు తక్కువ నమ్మకాన్ని సూచిస్తాయి.",
            errors: {
              fileLimit: "గరిష్టంగా {{max}} ఫైళ్లు మాత్రమే అనుమతించబడతాయి",
              invalidFormat:
                "{{fileName}}: చెల్లని ఫార్మాట్ (JPG, PNG, GIF, BMP లేదా TIFF మాత్రమే)",
              fileSize: "{{fileName}}: ఫైల్ 10MB పరిమితిని మించిపోయింది",
            },
            fields: {
              merchant: {
                label: "వ్యాపారి పేరు",
                placeholder: "వ్యాపారి పేరు ఇవ్వండి",
              },
              amount: {
                label: "మొత్తం మొత్తం",
                placeholder: "0.00",
              },
              date: {
                label: "తేదీ",
              },
              tax: {
                label: "పన్ను (GST/CGST/SGST)",
                placeholder: "0.00",
              },
              category: {
                label: "సూచించబడిన వర్గం",
              },
              paymentMethod: {
                label: "చెల్లింపు విధానం",
              },
              detectedItems: "గుర్తించిన అంశాలు ({{count}})",
            },
            badges: {
              labels: {
                high: "అధిక",
                medium: "మధ్యస్థ",
                low: "తక్కువ",
              },
              tooltipFallback: "{{level}} నమ్మకం",
            },
            actions: {
              scanAnother: "మరొకదాన్ని స్కాన్ చేయండి",
              useData: "ఈ డేటాను ఉపయోగించండి",
            },
            defaults: {
              expenseName: "రసీదు ఖర్చు",
              descriptionPrefix: "రసీదు ద్వారా స్కాన్ చేయబడింది",
              taxSuffix: " (పన్ను: {{currency}}{{amount}})",
            },
            meta: {
              processedIn: "OCR ద్వారా {{ms}}ms లో ప్రాసెస్ చేయబడింది",
            },
            successMessage: {
              title: "రసీదు విజయవంతంగా స్కాన్ అయింది!",
              body: "ఫలితం:\n- పేరు: {{name}}\n- మొత్తం: {{amount}}\n- తేదీ: {{date}}\n\nదయచేసి అవసరమైతే సమీక్షించి సవరించండి.",
            },
          },
        },
      },
      expenseCount: "{{count}} ఖర్చు",
    },
    confirmations: {
      deleteCategory: "ఈ వర్గాన్ని తొలగించాలా?",
      deletePaymentMethod: "ఈ చెల్లింపు విధానాన్ని తొలగించాలా?",
    },
    categoryFlow: {
      createDialogTitle: "వర్గం సృష్టించండి",
    },
    paymentMethodFlow: {
      createDialogTitle: "చెల్లింపు విధానం సృష్టించండి",
    },
    messages: {
      createSuccess: '{{entity}} "{{name}}" విజయవంతంగా సృష్టించబడింది',
      deleteSuccess: '{{entity}} "{{name}}" విజయవంతంగా తొలగించబడింది.',
      deleteError: "{{entity}} తొలగించలేకపోయాం. దయచేసి మళ్లీ ప్రయత్నించండి.",
    },
    expensesTable: {
      title: "ఖర్చులు",
      entityTitle: "{{name}} ఖర్చులు",
      summary: "{{count}} ఎంట్రీలు • మొత్తం {{total}}",
      empty: "ఖర్చులు కనబడలేదు",
      emptyHint: "వేరే కార్డు లేదా కాలాన్ని ఎంచి ప్రయత్నించండి",
      unnamedExpense: "పేరు లేని ఖర్చు",
      noDate: "తేదీ లేదు",
      type: {
        income: "ఆదాయం",
        expense: "ఖర్చు",
      },
    },
    search: {
      placeholder: "{{entityPlural}} శోధించండి...",
    },
    rangeLabels: {
      entityWeek: "{{entityPlural}} ఈ వారం",
      entityMonth: "{{entityPlural}} ఈ నెల",
      entityYear: "{{entityPlural}} ఈ సంవత్సరం",
    },
  },

  // కొత్త ఖర్చు
  newExpense: {
    title: "కొత్త ఖర్చు",
    header: {
      previouslyAdded: "ఇప్పటికే జోడించబడింది",
    },
    indicators: {
      autoFilled: "స్వయంపూరితంగా నింపబడింది",
    },
    actions: {
      linkBudgets: "బడ్జెట్లను లింక్ చేయండి",
      submit: "సమర్పించండి",
      successMessage: "ఖర్చు విజయవంతంగా సృష్టించబడింది!",
    },
    messages: {
      errorLoadingBudgets: "బడ్జెట్లు లోడ్ చేయలేకపోయాం",
    },
    autocomplete: {
      noOptions: "ఎంపికలు లేవు",
    },
    fields: {
      expenseName: "ఖర్చు పేరు",
      amount: "మొత్తం",
      date: "తేదీ",
      transactionType: "లావాదేవీ రకం",
      category: "వర్గం",
      paymentMethod: "చెల్లింపు విధానం",
      comments: "వ్యాఖ్యలు",
    },
    placeholders: {
      expenseName: "ఖర్చు పేరును నమోదు చేయండి",
      amount: "మొత్తాన్ని నమోదు చేయండి",
      date: "తేదీని ఎంచుకోండి",
      transactionType: "లావాదేవీ రకాన్ని ఎంచుకోండి",
      category: "వర్గాన్ని ఎంచుకోండి",
      paymentMethod: "చెల్లింపు విధానాన్ని ఎంచుకోండి",
      comments: "వ్యాఖ్యను జోడించండి",
      generic: "{{field}} ని నమోదు చేయండి",
    },
    table: {
      headers: {
        name: "పేరు",
        inBudget: "బడ్జెట్‌లో",
        description: "వివరణ",
        startDate: "ప్రారంభ తేదీ",
        endDate: "ముగింపు తేదీ",
        remainingAmount: "మిగిలిన మొత్తం",
        amount: "మొత్తం",
      },
      noRows: "పంక్తులు కనబడలేదు",
    },
    transactionTypes: {
      gain: "లాభం",
      loss: "నష్టం",
    },
  },

  // ఖర్చు సవరించు
  editExpense: {
    title: "ఖర్చు సవరించు",
    actions: {
      linkBudgets: "బడ్జెట్లను లింక్ చేయండి",
      submit: "సమర్పించండి",
      successMessage: "ఖర్చు విజయవంతంగా నవీకరించబడింది!",
    },
    messages: {
      updateError: "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      errorLoadingBudgets: "బడ్జెట్లు లోడ్ చేయలేకపోయాం",
    },
    autocomplete: {
      noOptions: "ఎంపికలు లేవు",
    },
    fields: {
      expenseName: "ఖర్చు పేరు",
      amount: "మొత్తం",
      date: "తేదీ",
      transactionType: "లావాదేవీ రకం",
      category: "వర్గం",
      paymentMethod: "చెల్లింపు విధానం",
      comments: "వ్యాఖ్యలు",
    },
    placeholders: {
      expenseName: "ఖర్చు పేరును నమోదు చేయండి",
      amount: "మొత్తాన్ని నమోదు చేయండి",
      date: "తేదీని ఎంచుకోండి",
      transactionType: "లావాదేవీ రకాన్ని ఎంచుకోండి",
      category: "వర్గాన్ని శోధించండి",
      paymentMethod: "చెల్లింపు విధానాన్ని ఎంచుకోండి",
      comments: "వ్యాఖ్యను జోడించండి (ఐచ్చికం)",
      generic: "{{field}} ను నమోదు చేయండి",
    },
    validation: {
      expenseName: "ఖర్చు పేరు అవసరం",
      amount: "మొత్తం అవసరం",
      date: "తేదీ అవసరం",
      transactionType: "లావాదేవీ రకం అవసరం",
    },
    table: {
      headers: {
        name: "పేరు",
        inBudget: "బడ్జెట్‌లో",
        description: "వివరణ",
        startDate: "ప్రారంభ తేదీ",
        endDate: "ముగింపు తేదీ",
        remainingAmount: "మిగిలిన మొత్తం",
        amount: "మొత్తం",
      },
      noRows: "పంక్తులు కనబడలేదు",
    },
    transactionTypes: {
      gain: "లాభం",
      loss: "నష్టం",
    },
  },

  // కొత్త బడ్జెట్
  newBudget: {
    title: "కొత్త బడ్జెట్",
    actions: {
      linkExpenses: "ఖర్చులను లింక్ చేయండి",
      submit: "సమర్పించండి",
      submitting: "సమర్పిస్తోంది...",
    },
    messages: {
      createSuccess: "బడ్జెట్ విజయవంతంగా సృష్టించబడింది!",
      createError: "బడ్జెట్ సృష్టించడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      expenseLoadError: "ఖర్చులను లోడ్ చేయలేకపోయాం.",
    },
    fields: {
      name: "బడ్జెట్ పేరు",
      description: "వివరణ",
      startDate: "ప్రారంభ తేదీ",
      endDate: "ముగింపు తేదీ",
      amount: "మొత్తం",
    },
    placeholders: {
      name: "బడ్జెట్ పేరును నమోదు చేయండి",
      description: "వివరణను జోడించండి",
      startDate: "ప్రారంభ తేదీని ఎంచుకోండి",
      endDate: "ముగింపు తేదీని ఎంచుకోండి",
      amount: "మొత్తం మొత్తాన్ని నమోదు చేయండి",
      generic: "{{field}} ను నమోదు చేయండి",
    },
    validation: {
      name: "బడ్జెట్ పేరు అవసరం",
      description: "వివరణ అవసరం",
      startDate: "ప్రారంభ తేదీ అవసరం",
      endDate: "ముగింపు తేదీ అవసరం",
      amount: "మొత్తం అవసరం",
    },
    table: {
      headers: {
        date: "తేదీ",
        expenseName: "ఖర్చు పేరు",
        amount: "మొత్తం",
        paymentMethod: "చెల్లింపు విధానం",
        type: "రకం",
        comments: "వ్యాఖ్యలు",
        inBudget: "బడ్జెట్‌లో",
      },
      noRows: "పంక్తులు కనబడలేదు",
    },
  },

  // బడ్జెట్ సవరించండి
  editBudget: {
    title: "బడ్జెట్ సవరించండి",
    actions: {
      linkExpenses: "ఖర్చులను లింక్ చేయండి",
      submit: "సమర్పించండి",
      submitting: "సమర్పిస్తోంది...",
    },
    messages: {
      updateSuccess: "బడ్జెట్ విజయవంతంగా నవీకరించబడింది!",
      updateError: "బడ్జెట్ నవీకరణ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      expenseLoadError: "ఖర్చులను లోడ్ చేయలేకపోయాం.",
      budgetLoadError: "బడ్జెట్ వివరాలను లోడ్ చేయలేకపోయాం.",
    },
    fields: {
      name: "బడ్జెట్ పేరు",
      description: "వివరణ",
      startDate: "ప్రారంభ తేదీ",
      endDate: "ముగింపు తేదీ",
      amount: "మొత్తం",
    },
    placeholders: {
      name: "బడ్జెట్ పేరును నమోదు చేయండి",
      description: "వివరణను జోడించండి",
      startDate: "ప్రారంభ తేదీని ఎంచుకోండి",
      endDate: "ముగింపు తేదీని ఎంచుకోండి",
      amount: "మొత్తం మొత్తాన్ని నమోదు చేయండి",
      generic: "{{field}} ను నమోదు చేయండి",
    },
    validation: {
      name: "బడ్జెట్ పేరు అవసరం",
      description: "వివరణ అవసరం",
      startDate: "ప్రారంభ తేదీ అవసరం",
      endDate: "ముగింపు తేదీ అవసరం",
      amount: "మొత్తం అవసరం",
    },
    table: {
      headers: {
        date: "తేదీ",
        expenseName: "ఖర్చు పేరు",
        amount: "మొత్తం",
        paymentMethod: "చెల్లింపు విధానం",
        type: "రకం",
        comments: "వ్యాఖ్యలు",
        inBudget: "బడ్జెట్‌లో",
      },
      noRows: "పంక్తులు కనబడలేదు",
    },
  },

  // బిల్లు సంబంధిత అనువాదాలు
  billCommon: {
    fields: {
      name: "బిల్లు పేరు",
      description: "వివరణ",
      date: "తేదీ",
      paymentMethod: "చెల్లింపు విధానం",
      type: "రకం",
      category: "వర్గం",
    },
    placeholders: {
      billName: "బిల్లు పేరును నమోదు చేయండి",
      searchBillName: "బిల్లు పేరును శోధించండి లేదా టైప్ చేయండి",
      description: "వివరణను నమోదు చేయండి",
      paymentMethod: "చెల్లింపు విధానాన్ని ఎంచుకోండి",
      type: "రకాన్ని ఎంచుకోండి",
      category: "వర్గాన్ని శోధించండి",
      itemName: "అంశం పేరు",
      quantity: "పరిమాణం *",
      unitPrice: "యూనిట్ ధర *",
      comments: "వ్యాఖ్యలు",
    },
    typeOptions: {
      gain: "లాభం",
      loss: "నష్టం",
    },
    indicators: {
      previouslyAdded: "మునుపు జోడించబడింది",
      autoFilled: "స్వయంచాలకంగా నింపబడింది",
    },
    actions: {
      linkBudgets: "బడ్జెట్‌లను లింక్ చేయండి",
      hideBudgets: "బడ్జెట్‌లను దాచండి",
      addExpenses: "ఖర్చు అంశాలను జోడించండి",
      editExpenses: "ఖర్చు అంశాలను సవరించండి",
      hideExpenses: "ఖర్చు అంశాలను దాచండి",
      addRow: "వరుసను జోడించండి",
      saveExpenses: "ఖర్చులను సేవ్ చేయండి",
      saveChanges: "మార్పులను సేవ్ చేయండి",
      submit: "సమర్పించండి",
      update: "నవీకరించండి",
    },
    budgets: {
      heading: "ఎంచుకున్న తేదీకి అందుబాటులో ఉన్న బడ్జెట్‌లు",
      noBudgets: "ఎంచుకున్న తేదీకి బడ్జెట్‌లు కనబడలేదు",
      errorMessage: "లోపం: {{message}}",
      fallbackError: "బడ్జెట్‌లను లోడ్ చేయలేకపోయాం.",
      columns: {
        name: "పేరు",
        description: "వివరణ",
        startDate: "ప్రారంభ తేదీ",
        endDate: "ముగింపు తేదీ",
        remainingAmount: "మిగిలిన మొత్తం",
        amount: "మొత్తం",
      },
    },
    expenseTable: {
      headers: {
        itemName: "అంశం పేరు *",
        quantity: "పరిమాణం *",
        unitPrice: "యూనిట్ ధర *",
        totalPrice: "మొత్తం ధర",
        comments: "వ్యాఖ్యలు",
        actions: "చర్యలు",
      },
      validationHintDetailed:
        "ప్రస్తుత అంశాన్ని (అంశం పేరు, పరిమాణం, యూనిట్ ధర అవసరం) పూర్తి చేసి మరిన్ని వరుసలు జోడించండి",
      validationHintSimple:
        "మరిన్ని వరుసలు జోడించడానికి ప్రస్తుత అంశాన్ని పూర్తి చేయండి",
      totalLabel: "మొత్తం మొత్తం",
      summaryLabels: {
        qty: "పరిమాణం",
        unit: "యూనిట్",
        calc: "లెక్కింపు",
        comments: "వ్యాఖ్యలు",
      },
    },
    summary: {
      title: "ఖర్చు అంశాల సారాంశం",
      singleItem: "{{count}} అంశం జోడించబడింది",
      multipleItems: "{{count}} అంశాలు జోడించబడ్డాయి",
      noItemsTitle: "⚠️ ఎలాంటి ఖర్చు అంశాలు ఇంకా జోడించబడలేదు",
    },
    messages: {
      noItemsCreate: "బిల్లు సృష్టించడానికి కనీసం ఒక ఖర్చు అంశం అవసరం",
      noItemsEdit: "బిల్లు నవీకరించడానికి కనీసం ఒక ఖర్చు అంశం అవసరం",
      unsavedChanges:
        "మీ వద్ద సేవ్ చేయని ఖర్చు అంశాలు ఉన్నాయి. సేవ్ చేయకుండా మూసివేయాలా? అన్ని నమోదు చేసిన డేటా కోల్పోతారు.",
      addExpenseValidationDetailed:
        "సేవ్ చేయడానికి ముందు కనీసం ఒక పూర్తి ఖర్చు అంశాన్ని జోడించండి. అంశం పేరు, పరిమాణం, యూనిట్ ధర అన్నీ అవసరం.",
      addExpenseValidationSimple:
        "దయచేసి సేవ్ చేసే ముందు కనీసం ఒక పూర్తి ఖర్చు అంశాన్ని జోడించండి.",
      expensesRequiredCreate:
        "బిల్లు సృష్టించడానికి కనీసం ఒక ఖర్చు అంశాన్ని జోడించండి.",
      expensesRequiredUpdate:
        "బిల్లు నవీకరించడానికి కనీసం ఒక ఖర్చు అంశాన్ని జోడించండి.",
      totalAmountInvalid: "మొత్తం మొత్తం సున్నా కంటే ఎక్కువగా ఉండాలి.",
      invalidQuantityOrPrice:
        "పరిమాణం మరియు యూనిట్ ధరకు సరైన ధనాత్మక విలువలను నమోదు చేయండి.",
    },
  },

  // బిల్లు సృష్టించండి
  createBill: {
    title: "బిల్లు సృష్టించండి",
    labels: {
      expenseTableTitle: "ఖర్చు అంశాలు",
    },
    messages: {
      success: "బిల్లు విజయవంతంగా సృష్టించబడింది!",
      failure: "బిల్లు సృష్టించడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      errorWithReason: "బిల్లు సృష్టించేటప్పుడు లోపం: {{message}}",
      budgetLoadError: "బడ్జెట్‌లను లోడ్ చేయలేకపోయాం.",
    },
    summary: {
      noItemsSubtitle: "బిల్లు సృష్టించడానికి కనీసం ఒక ఖర్చు అంశం అవసరం",
    },
  },

  // బిల్లు సవరించండి (అదనపు)
  editBill: {
    title: "బిల్లు సవరించండి",
    labels: {
      expenseTableTitle: "ఖర్చు అంశాలను సవరించండి",
    },
    messages: {
      success: "బిల్లు విజయవంతంగా నవీకరించబడింది!",
      errorWithReason: "బిల్లు నవీకరించేటప్పుడు లోపం: {{message}}",
      loadErrorTitle: "⚠️ బిల్లు లోడ్ లోపం",
      noBillId: "ఎటువంటి బిల్లు ఐడీ ఇవ్వలేదు.",
      invalidData: "బిల్లు డేటా అందుబాటులో లేదు లేదా చెల్లదు.",
    },
    buttons: {
      retry: "మళ్లీ ప్రయత్నించండి",
      goBack: "వెనక్కి వెళ్ళండి",
    },
    summary: {
      noItemsSubtitle: "బిల్లు నవీకరించడానికి కనీసం ఒక ఖర్చు అంశం అవసరం",
    },
  },

  // Cashflow
  cashflow: {
    searchPlaceholder: "ఖర్చులను శోధించండి...",
    genericSearchPlaceholder: "శోధించండి...",
    nav: {
      reports: "రిపోర్టులు",
      categories: "వర్గాలు",
      budget: "బడ్జెట్",
      paymentMethod: "చెల్లింపు",
      bill: "బిల్లు",
      calendar: "క్యాలెండర్",
    },
    addNew: {
      label: "కొత్తదాన్ని జోడించండి",
      tooltip:
        "ఖర్చు, బడ్జెట్, వర్గాన్ని జోడించండి లేదా ఫైల్‌ను అప్‌లోడ్ చేయండి",
      readOnly: "మీకు మాత్రమే చదవగల ప్రాప్యత ఉంది",
      options: {
        addExpense: "ఖర్చు జోడించండి",
        uploadFile: "ఫైల్ అప్‌లోడ్ చేయండి",
        addBudget: "బడ్జెట్ జోడించండి",
        addCategory: "వర్గం జోడించండి",
        addPaymentMethod: "చెల్లింపు విధానం జోడించండి",
      },
    },
    labels: {
      weekNumber: "వారం {{number}}",
      amountMasked: "మొత్తం దాచబడింది",
      amountWithValue: "మొత్తం: {{amount}}",
      billBadge: "బిల్లు",
      monthPlaceholder: "నెల",
      datePlaceholder: "తేదీ",
      noComments: "వ్యాఖ్యలు లేవు",
      uncategorized: "వర్గీకరించలేదు",
      unknownPayment: "తెలియదు",
      recentFirst: "తాజావి ముందు",
      oldFirst: "పాతవి ముందు",
      expenses: "ఖర్చులు",
      total: "మొత్తం",
      average: "సగటు",
      minimum: "కనిష్టం",
      maximum: "గరిష్టం",
      selectionTitle: "ఎంపిక",
      selectionCounter: "{{total}} లో {{current}}",
    },
    tooltips: {
      collapseStats: "ఎంపిక గణాంకాలను ముడిచండి",
      expandStats: "ఎంపిక గణాంకాలను విస్తరించండి",
      hideStats: "గణాంకాలను దాచండి",
      showStats: "గణాంకాలను చూపించండి",
      clearSelection: "ఎంపికను క్లియర్ చేయండి",
      deleteSelected: "ఎంపిక చేసిన {{count}} తొలగించండి",
      scrollTop: "పైకి స్క్రోల్ చేయండి",
      scrollBottom: "కిందకు స్క్రోల్ చేయండి",
      previousMonth: "గత నెల",
      nextMonth: "తర్వాతి నెల",
      selectMonth: "ఒక నెలను ఎంచుకోవడానికి క్లిక్ చేయండి",
      previousDate: "గత తేదీ",
      nextDate: "తర్వాతి తేదీ",
      selectDate: "నిర్దిష్ట తేదీకి వెళ్లడానికి క్లిక్ చేయండి",
      sortAscending: "పురాతనవి ముందు (ఆరోహణ క్రమం)",
      sortDescending: "తాజావి ముందు (అవరోహణ క్రమం)",
      billExpense: "ఇది బిల్లు ఖర్చు",
      category: "వర్గం: {{category}}",
      paymentMethod: "చెల్లింపు: {{method}}",
      previousSelected: "మునుపటి ఎంపిక చేసిన ఖర్చుకు వెళ్లండి",
      nextSelected: "తదుపరి ఎంపిక చేసిన ఖర్చుకు వెళ్లండి",
      selectionNavigator: "ఎంపిక చేసిన ఖర్చుల మధ్య నావిగేట్ చేయండి",
    },
    summary: {
      collapseAria: "ఎంపిక గణాంకాలను ముడిచండి",
      expandAria: "ఎంపిక గణాంకాలను విస్తరించండి",
      clear: "క్లియర్ చేయండి",
      clearSelection: "ఎంపికను క్లియర్ చేయండి",
    },
    deletion: {
      header: "తొలగింపు నిర్ధారణ",
      approve: "అవును, తొలగించండి",
      decline: "కాదు, రద్దు చేయండి",
      deleting: "తొలగిస్తోంది...",
      confirmMultiple:
        "మీరు నిజంగా {{count}} ఎంపిక చేసిన ఖర్చులను తొలగించాలనుకుంటున్నారా?",
      confirmSingle: 'మీకు నిజంగా "{{name}}" ను తొలగించాలని ఉందా?',
      confirmSingleFallback: "ఈ ఖర్చు",
      toastMultiSuccess: "ఎంపిక చేసిన ఖర్చులు విజయవంతంగా తొలగించబడ్డాయి.",
      toastMultiError:
        "ఎంపిక చేసిన ఖర్చులను తొలగించేటప్పుడు లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.",
      toastBillSuccess: "బిల్లు విజయవంతంగా తొలగించబడింది.",
      toastExpenseSuccess: "ఖర్చు విజయవంతంగా తొలగించబడింది.",
      toastExpenseError:
        "ఖర్చును తొలగించడంలో లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.",
    },
    messages: {
      noDataChart: "చూపించడానికి డేటా ఏదీ లేదు",
      adjustFilters: "ఫిల్టర్లను లేదా తేదీ పరిధిని సవరించండి",
      noMatches: "ఫలితాలు లేవు",
      noData: "డేటా కనబడలేదు",
      searchSuggestion: "వేరే శోధన పదాన్ని ప్రయత్నించండి",
      adjustPeriod: "ఫిల్టర్లను సవరించండి లేదా కాలాన్ని మార్చండి",
      noMonthsAvailable: "మాసాలు అందుబాటులో లేవు",
    },
    sort: {
      recentFirst: "తాజావి ముందు",
      highToLow: "అధికం నుండి తక్కువకు",
      lowToHigh: "తక్కువ నుండి అధికానికి",
    },
    actions: {
      editExpense: "ఖర్చును సవరించండి",
      deleteExpense: "ఖర్చును తొలగించండి",
      deleteSelected: "ఎంపిక చేసినవాటిని తొలగించండి",
    },
    flowToggle: {
      all: "ఆదాయం & వ్యయం",
      inflow: "ఆదాయం",
      outflow: "వ్యయం",
    },
    chart: {
      xAxisDay: "రోజు",
      xAxisWeekday: "వారం రోజు",
      xAxisMonth: "నెల",
      yAxisAmount: "మొత్తం",
      averageLabel: "సగటు",
      tooltipAmount: "మొత్తం",
    },
    rangeTypes: {
      week: "వారం",
      month: "నెల",
      year: "సంవత్సరం",
    },
    rangeLabels: {
      thisWeek: "ఈ వారం",
      thisMonth: "ఈ నెల",
      thisYear: "ఈ సంవత్సరం",
    },
    weekDays: {
      mon: "సోమ",
      tue: "మంగళ",
      wed: "బుధ",
      thu: "గురు",
      fri: "శుక్ర",
      sat: "శని",
      sun: "ఆది",
    },
    monthsShort: {
      jan: "జన",
      feb: "ఫిబ్ర",
      mar: "మార్",
      apr: "ఏప్రి",
      may: "మే",
      jun: "జూన్",
      jul: "జూలై",
      aug: "ఆగ",
      sep: "సెప్",
      oct: "అక్టో",
      nov: "నవ",
      dec: "డిసె",
    },
    tableHeaders: {
      name: "ఖర్చు పేరు",
      amount: "మొత్తం",
      type: "రకం",
      paymentMethod: "చెల్లింపు విధానం",
      netAmount: "నికర మొత్తం",
      comments: "వ్యాఖ్యలు",
      creditDue: "జమ కావాల్సింది",
      date: "తేదీ",
    },
  },

  // Dashboard
  dashboard: {
    title: "ఆర్థిక డ్యాష్‌బోర్డ్",
    subtitle: "మీ ఆర్థిక ఆరోగ్యంపై తక్షణ అవగాహన",
    metrics: "మీట్రిక్స్",
    dailySpending: "రోజువారీ ఖర్చు నమూనా",
    categoryBreakdown: "వర్గాల విభజన",
    monthlyTrend: "నెలవారీ ధోరణి",
    paymentMethods: "చెల్లింపు పద్ధతులు",
    recentTransactions: "ఇటీవలి లావాదేవీలు",
    budgetOverview: "బడ్జెట్ అవలోకనం",
    quickAccess: "త్వరిత ప్రాప్తి",
    summaryOverview: "సారాంశ అవలోకనం",
    customize: "డ్యాష్‌బోర్డ్‌ను అనుకూలీకరించండి",
    refreshData: "డేటాను రిఫ్రెష్ చేయండి",
    exportReports: "రిపోర్టులను ఎగుమతి చేయండి",
    overview: {
      title: "అప్లికేషన్ అవలోకనం",
      liveSummary: "ప్రత్యక్ష సారాంశం",
      totalExpenses: "మొత్తం ఖర్చులు",
      creditDue: "క్రెడిట్ బాకీ",
      activeBudgets: "క్రియాశీల బడ్జెట్‌లు",
      friends: "స్నేహితులు",
      groups: "గ్రూపులు",
      avgDailySpend: "సగటు రోజువారీ ఖర్చు",
      last30Days: "గత 30 రోజులు",
      savingsRate: "పొదుపు రేటు",
      ofIncome: "ఆదాయం నుండి",
      upcomingBills: "రాబోయే బిల్లులు",
      dueThisPeriod: "ఈ కాలంలో చెల్లించవలసినది",
      topExpenses: "అత్యధిక ఖర్చులు",
      noExpensesData: "ఖర్చు డేటా అందుబాటులో లేదు",
    },
    charts: {
      titles: {
        dailySpending: "📊 రోజువారీ ఖర్చు నమూనా",
        spendingTrends: "ఖర్చు ధోరణులు",
      },
      typeOptions: {
        loss: "వ్యయం",
        gain: "ఆదాయం",
      },
      timeframeOptions: {
        thisMonth: "ఈ నెల",
        lastMonth: "గత నెల",
        last3Months: "గత 3 నెలలు",
        thisYear: "ఈ సంవత్సరం",
        lastYear: "గత సంవత్సరం",
        allTime: "అన్ని కాలాలు",
      },
      timeframeChips: {
        weekly: "వారపు",
        monthly: "నెలవారీ",
        quarterly: "త్రైమాసిక",
        yearly: "వార్షిక",
      },
      tooltip: {
        totalSpending: "మొత్తం ఖర్చు",
        totalIncome: "మొత్తం ఆదాయం",
        dayPrefix: "రోజు",
        transactions: "లావాదేవీలు",
        moreLabel: "ఇంకా",
        runningAverage: "సగటు",
      },
      datasetLabels: {
        income: "ఆదాయం",
        expenses: "ఖర్చులు",
        savings: "పొదుపులు",
      },
    },
  },

  // Settings
  settings: {
    title: "సెట్టింగ్స్",
    subtitle: "మీ అభిరుచులు మరియు ఖాతా సెట్టింగ్స్‌ను నిర్వహించండి",

    // Main Sections
    appearance: "రూపరేఖలు",
    preferences: "అభిరుచులు",
    privacySecurity: "గోప్యత & భద్రత",
    dataStorage: "డేటా & నిల్వ",
    smartFeatures: "స్మార్ట్ ఫీచర్లు & ఆటోమేషన్",
    accessibility: "అనుకూలత",
    accountManagement: "ఖాతా నిర్వహణ",
    helpSupport: "సహాయం & మద్దతు",
    about: "గురించి",

    // Appearance Settings
    theme: "థీమ్ మోడ్",
    themeLight: "కాంతివంతమైన పరిసరాల్లో మెరుగైన వీక్షణ కోసం లైట్ మోడ్",
    themeDark: "కంటి అలసటను తగ్గించడానికి డార్క్ మోడ్",
    fontSize: "అక్షర పరిమాణం",
    fontSizeDescription: "సులభంగా చదవడానికి పాఠ్య పరిమాణాన్ని సర్దుబాటు చేయండి",
    compactMode: "కాంపాక్ట్ మోడ్",
    compactModeDescription: "తక్కువ స్పేసింగ్‌తో మరిన్ని కంటెంట్ చూపించండి",
    animations: "యానిమేషన్‌లను ప్రారంభించండి",
    animationsDescription: "సమతుల్య మార్పులు మరియు యానిమేషన్‌లను చూపించండి",
    enableAnimations: "యానిమేషన్‌లను ప్రారంభించండి",
    enableAnimationsDescription:
      "సమతుల్య మార్పులు మరియు యానిమేషన్‌లను చూపించండి",
    highContrast: "హై కాంట్రాస్ట్ మోడ్",
    highContrastDescription: "మెరుగైన యాక్సెసిబిలిటీ కోసం స్పష్టమైన వీక్షణ",
    highContrastMode: "హై కాంట్రాస్ట్ మోడ్",
    highContrastModeDescription: "మెరుగైన యాక్సెసిబిలిటీ కోసం స్పష్టమైన వీక్షణ",

    // Preferences
    language: "భాష",
    languageDescription: "మీకు నచ్చిన భాషను ఎంచుకోండి",
    defaultCurrency: "అప్రమేయ కరెన్సీ",
    defaultCurrencyDescription:
      "లావాదేవీల కోసం మీకు నచ్చిన కరెన్సీని సెట్ చేయండి",
    dateFormat: "తేదీ ఫార్మాట్",
    dateFormatDescription: "తేదీలు ఎలా కనిపించాలో ఎంచుకోండి",
    timeFormat: "సమయ ఫార్మాట్",
    timeFormatDescription: "12-గంటలు లేదా 24-గంటల సమయ ఫార్మాట్‌ను ఎంచుకోండి",

    // Privacy & Security
    profileVisibility: "ప్రొఫైల్ దర్శనీయత",
    profileVisibilityDescription:
      "మీ ప్రొఫైల్ మరియు ఖర్చు సమాచారాన్ని ఎవరు చూడగలరో నియంత్రించండి",
    maskSensitiveData: "సున్నితమైన డేటాను దాచండి",
    maskSensitiveDataDescription:
      "గోప్యత కోసం ఖర్చు మొత్తాలు మరియు ఆర్థిక వివరాలను దాచండి",
    twoFactorAuth: "రెండు-దశల ప్రమాణీకరణ",
    twoFactorAuthDescription:
      "ఈమెయిల్ OTP ద్వారా మీ ఖాతాకు అదనపు భద్రతను జోడించండి",
    mfaAuth: "ఆథెంటికేటర్ యాప్ (MFA)",
    mfaAuthDescription:
      "మెరుగుపడిన భద్రత కోసం Google Authenticator ఉపయోగించండి (ఈమెయిల్ 2FA కంటే ప్రాధాన్యత)",
    configure: "కాన్ఫిగర్ చేయండి",
    blockedUsers: "తరిమివేయబడిన వినియోగదారులు",
    blockedUsersDescription:
      "బ్లాక్ చేసిన వినియోగదారులను మరియు గోప్యత సెట్టింగ్స్‌ను నిర్వహించండి",
    autoLogout: "స్వయంచాలక లాగౌట్",
    autoLogoutDescription:
      "క్రియాశీలత లేకుండా కొంతసేపటి తర్వాత ఆటోమేటిక్‌గా లాగౌట్ అవుతుంది",
    sessionTimeout: "సెషన్ టైమ్‌అవుట్",
    sessionTimeoutDescription: "క్రియాశీలత టైమ్‌అవుట్ వ్యవధి",

    // Data & Storage
    autoBackup: "ఆటో బ్యాకప్",
    autoBackupDescription: "మీ డేటాను ఆటోమేటిక్‌గా క్లౌడ్‌కు బ్యాకప్ చేయండి",
    backupFrequency: "బ్యాకప్ తరచుదనం",
    backupFrequencyDescription: "మీ డేటాను ఎంత తరచుగా బ్యాకప్ చేయాలో ఎంచుకోండి",
    cloudSync: "క్లౌడ్ సింక్",
    cloudSyncDescription: "మీ అన్ని పరికరాల మధ్య డేటును సమకాలీకరించండి",
    storageUsage: "నిల్వ వినియోగం",
    storageUsageDescription: "మీ డేటా నిల్వ వినియోగాన్ని చూడండి",
    clearCache: "క్యాష్‌ను క్లియర్ చేయండి",
    clearCacheDescription: "క్యాష్ డేటాను తొలగించి స్థలాన్ని ఖాళీ చేయండి",

    // Smart Features
    autoCategorize: "ఖర్చులను ఆటో-వర్గీకరించండి",
    autoCategorizeDescription: "AI ఆధారిత ఆటోమేటిక్ ఖర్చు వర్గీకరణ",
    smartBudgeting: "స్మార్ట్ బడ్జెట్ సూచనలు",
    smartBudgetingDescription: "మెరుగైన బడ్జెట్ కోసం AI సిఫార్సులు పొందండి",
    scheduledReports: "షెడ్యూల్ చేసిన రిపోర్టులు",
    scheduledReportsDescription: "ఆటోమేటెడ్ ఖర్చు రిపోర్టులను స్వీకరించండి",
    expenseReminders: "ఖర్చు గుర్తుచూపులు",
    expenseRemindersDescription: "పునరావృత ఖర్చులకు గుర్తు చేయింపులు పొందండి",
    predictiveAnalytics: "అనుమానిత విశ్లేషణ",
    predictiveAnalyticsDescription:
      "పాటర్న్‌ల ఆధారంగా భవిష్యత్ ఖర్చులను అంచనా వేయండి",

    // Accessibility
    screenReaderSupport: "స్క్రీన్ రీడర్ మద్దతు",
    screenReaderSupportDescription: "స్క్రీన్ రీడర్‌ల కోసం మెరుగైన మద్దతు",
    keyboardShortcuts: "కీబోర్డ్ షార్ట్‌కట్లు",
    keyboardShortcutsDescription:
      "కీబోర్డ్ నావిగేషన్ షార్ట్‌కట్‌లను ప్రారంభించండి",
    showShortcutIndicators: "షార్ట్‌కట్ సూచకాలు చూపించు",
    showShortcutIndicatorsDescription:
      "Alt కీ నొక్కినప్పుడు షార్ట్‌కట్ బ్యాజ్‌లు చూపించండి",
    reduceMotion: "చలనాన్ని తగ్గించండి",
    reduceMotionDescription:
      "మెరుగైన యాక్సెసిబిలిటీ కోసం యానిమేషన్‌లను తగ్గించండి",
    enhancedFocusIndicators: "మెరుగైన ఫోకస్ సూచికలు",
    enhancedFocusIndicatorsDescription:
      "ఫోకస్‌లో ఉన్న అంశాలను మరింత స్పష్టంగా హైలైట్ చేయండి",
    keyboardShortcutsGuide: "కీబోర్డ్ షార్ట్‌కట్ గైడ్",
    keyboardShortcutsGuideDescription:
      "అందుబాటులో ఉన్న అన్ని కీబోర్డ్ షార్ట్‌కట్‌లను చూడండి",

    // Account Management
    notificationSettings: "నోటిఫికేషన్ సెట్టింగ్స్",
    notificationSettingsDescription:
      "అన్ని నోటిఫికేషన్ అభిరుచులు మరియు ఛానల్స్‌ను నిర్వహించండి",
    editProfile: "ప్రొఫైల్ సవరించండి",
    editProfileDescription: "మీ వ్యక్తిగత సమాచారం మరియు అభిరుచులను నవీకరించండి",
    changePassword: "పాస్వర్డ్ మార్చండి",
    changePasswordDescription: "మీ ఖాతా పాస్వర్డ్‌ను నవీకరించండి",
    dataExport: "డేటా ఎగుమతి",
    dataExportDescription: "మీ అన్ని ఖర్చు డేటాను డౌన్‌లోడ్ చేసుకోండి",
    deleteAccount: "ఖాతాను తొలగించండి",
    deleteAccountDescription: "మీ ఖాతా మరియు అన్ని డేటాను శాశ్వతంగా తొలగించండి",
    deleteAccountWarning:
      "మీ ఖర్చులు, బడ్జెట్‌లు, స్నేహితులు సహా మీ మొత్తం డేటా శాశ్వతంగా తొలగించబడుతుంది.",

    // Help & Support
    restartTour: "పర్యటనను పునఃప్రారంభించండి",
    restartTourDescription: "అప్లికేషన్ వాక్‌త్రూను మళ్లీ వీక్షించండి",
    helpCenter: "సహాయ కేంద్రం",
    helpCenterDescription: "FAQలు మరియు సహాయ వ్యాసాలను బ్రౌజ్ చేయండి",
    contactSupport: "మద్దతును సంప్రదించండి",
    contactSupportDescription: "మా మద్దతు బృందం నుండి సహాయం పొందండి",
    termsOfService: "సేవా నిబంధనలు",
    termsOfServiceDescription: "మా నిబంధనలు మరియు షరతులను చదవండి",
    privacyPolicy: "గోప్యతా విధానం",
    privacyPolicyDescription: "మీ డేటాను ఎలా రక్షిస్తున్నామో తెలుసుకోండి",

    // App Info
    appVersion: "యాప్ సంచిక",
    lastUpdated: "చివరిగా నవీకరించిన తేది",
    buildNumber: "బిల్డ్ నంబర్",

    // Button Labels
    enable: "ప్రారంభించండి",
    manage: "నిర్వహించండి",
    change: "మార్చండి",
    view: "చూడండి",
    start: "ప్రారంభించండి",
    clear: "క్లియర్ చేయండి",
    export: "ఎగుమతి చేయండి",
    edit: "సవరించండి",
    delete: "తొలగించండి",

    // Select Options
    small: "చిన్నది",
    medium: "మధ్యస్థ (అప్రమేయం)",
    large: "పెద్దది",
    extraLarge: "అధిక పెద్దది",

    // Profile Visibility Options
    public: "🌍 పబ్లిక్ - ఎవరైనా చూడవచ్చు",
    friendsOnly: "👥 స్నేహితులు మాత్రమే - పరిమిత ప్రాప్తి",
    private: "🔒 ప్రైవేట్ - మీకు మాత్రమే",

    // Profile Visibility Labels (for chips)
    publicLabel: "🌍 పబ్లిక్",
    friendsLabel: "👥 స్నేహితులు",
    privateLabel: "🔒 ప్రైవేట్",

    // Time Format Options
    time12h: "🕐 12-గంటలు (3:00 PM)",
    time24h: "🕒 24-గంటలు (15:00)",

    // Backup Frequency Options
    daily: "📆 దినసరి",
    weekly: "📅 వారానికి",
    monthly: "🗓️ నెలకు",
    manualOnly: "✋ మాన్యువల్ మాత్రమే",

    // Report Schedule Options
    dailySummary: "📊 దినసరి సారాంశం",
    weeklySummary: "📈 వారపు సారాంశం",
    monthlySummary: "📉 నెలవారీ సారాంశం",
    noScheduledReports: "🚫 షెడ్యూల్ చేసిన రిపోర్టులు లేవు",

    // Currency Options
    currencyUSD: "💵 USD - అమెరికన్ డాలర్ ($)",
    currencyEUR: "💶 EUR - యూరో (€)",
    currencyGBP: "💷 GBP - బ్రిటిష్ పౌండ్ (£)",
    currencyINR: "💴 INR - భారత రూపాయి (₹)",
    currencyJPY: "💴 JPY - జపాన్ యెన్ (¥)",

    // Date Format Options
    dateFormatUS: "📅 MM/DD/YYYY (అమెరికా)",
    dateFormatUK: "📅 DD/MM/YYYY (యుకె/ఈయు)",
    dateFormatISO: "📅 YYYY-MM-DD (ISO)",
    usd: "USD - అమెరికన్ డాలర్ ($)",
    eur: "EUR - యూరో (€)",
    gbp: "GBP - బ్రిటిష్ పౌండ్ (£)",
    inr: "INR - భారత రూపాయి (₹)",
    jpy: "JPY - జపాన్ యెన్ (¥)",

    // Date Format Options
    mmddyyyy: "MM/DD/YYYY (అమెరికా)",
    ddmmyyyy: "DD/MM/YYYY (యుకె/ఈయు)",
    yyyymmdd: "YYYY-MM-DD (ISO)",

    // Status Messages
    profileVisibilityPublic:
      "మీ ప్రొఫైల్ ఇప్పుడు పబ్లిక్‌గా ఉంది - ఎవరైనా మీ సమాచారాన్ని చూడవచ్చు",
    profileVisibilityFriends:
      "మీ ప్రొఫైల్ ఇప్పుడు స్నేహితులకు మాత్రమే - స్నేహితులు మాత్రమే చూడగలరు",
    profileVisibilityPrivate:
      "మీ ప్రొఫైల్ ఇప్పుడు ప్రైవేట్ - మీరే మీ సమాచారాన్ని చూడగలరు",
  },

  // Modals
  modals: {
    logoutTitle: "లాగౌట్ నిర్ధారణ",
    logoutPrompt: "మీరు లాగౌట్ అవ్వాలని ఖచ్చితంగా అనుకుంటున్నారా?",
  },

  // Header
  header: {
    showAmounts: "మొత్తాలను చూపించండి",
    hideAmounts: "మొత్తాలను దాచండి",
    switchToLight: "లైట్ మోడ్‌కు మార్చండి",
    switchToDark: "డార్క్ మోడ్‌కు మార్చండి",
    notifications: "నోటిఫికేషన్‌లు",
    viewProfile: "ప్రొఫైల్ చూడండి",
    switchToUserMode: "వినియోగదారి మోడ్‌కు మార్చండి",
    switchToAdminMode: "అడ్మిన్ మోడ్‌కు మార్చండి",
  },

  // Auth
  auth: {
    login: "లాగిన్ చేయండి",
    logout: "లాగౌట్ అవండి",
    register: "నమోదు చేసుకోండి",
    email: "ఇమెయిల్",
    password: "పాస్‌వర్డ్",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    rememberMe: "నన్ను గుర్తుపెట్టుకో",
    signIn: "సైన్ ఇన్ చేయండి",
    signUp: "సైన్ అప్ చేయండి",
    firstName: "మొదటి పేరు",
    lastName: "చివరి పేరు",
    switchToAdminMode: "ప్రశాసక మోడ్‌కు మార్చండి",
    switchToUserMode: "వినియోగదారి మోడ్‌కు మార్చండి",
    viewProfile: "ప్రొఫైల్ చూడండి",
  },

  // Expenses
  expenses: {
    title: "ఖర్చులు",
    addExpense: "ఖర్చును జోడించండి",
    editExpense: "ఖర్చును సవరించండి",
    deleteExpense: "ఖర్చును తొలగించండి",
    amount: "మొత్తం",
    category: "వర్గం",
    date: "తేదీ",
    description: "వివరణ",
    paymentMethod: "చెల్లింపు విధానం",
    noExpenses: "ఖర్చులు కనబడలేదు",
  },

  // Budget
  budget: {
    title: "బడ్జెట్",
    addBudget: "బడ్జెట్ జోడించండి",
    editBudget: "బడ్జెట్ సవరించండి",
    deleteBudget: "బడ్జెట్ తొలగించండి",
    budgetName: "బడ్జెట్ పేరు",
    allocatedAmount: "కేటాయించిన మొత్తం",
    spentAmount: "ఖర్చయిన మొత్తం",
    remainingAmount: "మిగిలినది",
    startDate: "ప్రారంభ తేదీ",
    endDate: "ముగింపు తేదీ",
    noBudgets: "బడ్జెట్‌లు కనబడలేదు",
  },

  // Categories
  categories: {
    title: "వర్గాలు",
    addCategory: "వర్గం జోడించండి",
    editCategory: "వర్గం సవరించండి",
    deleteCategory: "వర్గం తొలగించండి",
    categoryName: "వర్గం పేరు",
    icon: "ఐకాన్",
    color: "రంగు",
  },

  // Messages
  messages: {
    saveSuccess: "విజయవంతంగా సేవ్ చేయబడింది",
    updateSuccess: "విజయవంతంగా నవీకరించబడింది",
    deleteSuccess: "విజయవంతంగా తొలగించబడింది",
    saveError: "సేవ్ చేయడంలో లోపం",
    updateError: "నవీకరించడంలో లోపం",
    deleteError: "తొలగించడంలో లోపం",
    loadError: "డేటాను లోడ్ చేయడంలో లోపం",
    confirmDelete: "ఈ అంశాన్ని నిజంగా తొలగించాలనుకుంటున్నారా?",
    languageChanged: "భాష విజయవంతంగా మార్చబడింది",
  },

  // OCR రసీదు స్కానింగ్
  ocr: {
    title: "రసీదు స్కాన్ చేయండి",
    subtitle: "OCR తో ఖర్చు వివరాలను స్వయంచాలకంగా తీయండి",
    steps: {
      upload: "అప్‌లోడ్",
      scan: "స్కాన్",
      review: "సమీక్ష",
    },
    dropHere: "మీ రసీదు పేజీలను ఇక్కడ డ్రాప్ చేయండి",
    orBrowse: "లేదా ఫైళ్లను బ్రౌజ్ చేయడానికి క్లిక్ చేయండి",
    maxSize: "ఒక్కొక్కటి గరిష్టంగా 10MB",
    multiPageSupport: "బహుళ-పేజీ రసీదు మద్దతు",
    multiPageTip:
      "💡 ఉత్తమ ఫలితాల కోసం బహుళ-పేజీ రసీదుల అన్ని పేజీలను అప్‌లోడ్ చేయండి",
    page: "పేజీ",
    pages: "పేజీలు",
    receiptPage: "రసీదు పేజీ",
    addMore: "మరిన్ని జోడించండి",
    clearAll: "అన్నీ క్లియర్ చేయండి",
    scanning: "స్కాన్ అవుతోంది...",
    scanPages: "స్కాన్ చేయండి",
    processingReceipt: "రసీదు ప్రాసెస్ అవుతోంది...",
    analyzingText: "టెక్స్ట్ విశ్లేషణ మరియు డేటా తీయడం",
    ocrConfidence: "OCR విశ్వసనీయత",
    reviewFields: "అవసరమైన విధంగా ఫీల్డ్‌లను సమీక్షించి సవరించండి.",
    detectedItems: "గుర్తించిన అంశాలు",
    showRawText: "OCR టెక్స్ట్ చూపించు",
    hideRawText: "OCR టెక్స్ట్ దాచు",
    scanAnother: "మరొకటి స్కాన్ చేయండి",
    useThisData: "ఈ డేటాను ఉపయోగించండి",
    processedIn: "ప్రాసెస్ చేసిన సమయం",
    usingOCR: "OCR ఉపయోగించి",
    imageQuality: "చిత్ర నాణ్యత",
    defaultExpenseName: "రసీదు ఖర్చు",
    scannedFrom: "రసీదు నుండి స్కాన్ చేయబడింది",
    tax: "పన్ను",
    fields: {
      merchant: "వ్యాపారి పేరు",
      amount: "మొత్తం మొత్తం",
      date: "తేదీ",
      category: "వర్గం",
      paymentMethod: "చెల్లింపు విధానం",
    },
    placeholders: {
      merchant: "వ్యాపారి పేరు నమోదు చేయండి",
    },
    confidence: {
      high: "అధిక",
      medium: "మధ్యస్థ",
      low: "తక్కువ",
    },
    errors: {
      maxFiles: "గరిష్టంగా 10 ఫైళ్లు అనుమతించబడతాయి",
      invalidFormat:
        "చెల్లని ఫార్మాట్ (JPG, PNG, GIF, BMP లేదా TIFF ఉపయోగించండి)",
      fileTooLarge: "ఫైల్ 10MB కంటే ఎక్కువ",
    },
  },

  // MFA (మల్టీ-ఫాక్టర్ అథెంటికేషన్)
  mfa: {
    verification: {
      title: "రెండు-దశల ప్రమాణీకరణ",
      subtitle: "మీ అథెంటికేటర్ యాప్ నుండి 6-అంకెల కోడ్‌ను నమోదు చేయండి",
      backupSubtitle: "మీ బ్యాకప్ కోడ్‌లలో ఒకదాన్ని నమోదు చేయండి",
      signingInAs: "సైన్ ఇన్ అవుతున్నారు:",
      codeRefreshes: "కోడ్ ప్రతి 30 సెకన్లకు రిఫ్రెష్ అవుతుంది",
      verify: "ధృవీకరించు",
      verifying: "ధృవీకరిస్తోంది...",
      useBackupCode: "బ్యాకప్ కోడ్ ఉపయోగించండి",
      lostAccess:
        "అథెంటికేటర్‌కు యాక్సెస్ కోల్పోయారా? బ్యాకప్ కోడ్ ఉపయోగించండి",
      useAuthenticator: "← బదులుగా అథెంటికేటర్ యాప్ ఉపయోగించండి",
      backToLogin: "లాగిన్‌కు తిరిగి వెళ్ళండి",
      backupCodeFormat: "బ్యాకప్ కోడ్‌లు 8 అక్షరాలు (XXXX-XXXX ఫార్మాట్)",
      sessionExpired: "సెషన్ గడువు ముగిసింది. దయచేసి మళ్ళీ లాగిన్ అవ్వండి.",
      loginSuccess: "లాగిన్ విజయవంతం!",
      verificationFailed: "ధృవీకరణ విఫలమైంది",
    },
    setup: {
      title: "అథెంటికేటర్ యాప్",
      subtitle: "Google Authenticatorతో మీ ఖాతాను సురక్షితం చేయండి",
      authenticatorApp: "అథెంటికేటర్ యాప్",
      authenticatorAppDescription:
        "Google Authenticatorతో మీ ఖాతాను సురక్షితం చేయండి",
      setUpAuthenticator: "అథెంటికేటర్ యాప్ సెటప్ చేయండి",
      setUpAuthenticatorDescription:
        "మీ ఖాతాకు అదనపు భద్రత జోడించడానికి Google Authenticator లేదా ఏదైనా TOTP యాప్ ఉపయోగించండి. ప్రారంభించినప్పుడు, సైన్ ఇన్ చేసేటప్పుడు మీ యాప్ నుండి కోడ్ నమోదు చేయాల్సి ఉంటుంది.",
      getStarted: "ప్రారంభించండి",
      settingUp: "సెటప్ అవుతోంది...",
      setupTitle: "అథెంటికేటర్ యాప్ సెటప్ చేయండి",
      setupDescription:
        "మీ ఖాతాకు అదనపు భద్రత జోడించడానికి Google Authenticator లేదా ఏదైనా TOTP యాప్ ఉపయోగించండి.",
      priorityNote: "గమనిక",
      priorityNoteDescription:
        "రెండూ ప్రారంభించినప్పుడు MFA, ఇమెయిల్ 2FA కంటే ప్రాధాన్యత తీసుకుంటుంది.",
      priorityDescription:
        "రెండూ ప్రారంభించినప్పుడు MFA, ఇమెయిల్ 2FA కంటే ప్రాధాన్యత తీసుకుంటుంది.",
      steps: {
        scanQr: "QR కోడ్ స్కాన్ చేయండి",
        verifyCode: "కోడ్ ధృవీకరించండి",
        saveBackup: "బ్యాకప్ కోడ్‌లు సేవ్ చేయండి",
      },
      step1Title: "1. QR కోడ్ స్కాన్ చేయండి",
      step1Description:
        "Google Authenticator తెరిచి ఈ QR కోడ్‌ను స్కాన్ చేయండి",
      orEnterManually: "లేదా మాన్యువల్‌గా నమోదు చేయండి",
      account: "ఖాతా",
      issuer: "జారీదారు",
      copySecret: "సీక్రెట్ కాపీ చేయండి",
      copied: "కాపీ చేయబడింది!",
      continue: "కొనసాగించు",
      step2Title: "2. సెటప్ ధృవీకరించండి",
      step2Description:
        "సెటప్ ధృవీకరించడానికి మీ అథెంటికేటర్ యాప్ నుండి 6-అంకెల కోడ్ నమోదు చేయండి",
      codeChangesEvery30Seconds: "కోడ్ ప్రతి 30 సెకన్లకు మారుతుంది",
      codeChanges: "కోడ్ ప్రతి 30 సెకన్లకు మారుతుంది",
      back: "వెనుకకు",
      verifyAndEnable: "ధృవీకరించి ప్రారంభించు",
      verifyEnable: "ధృవీకరించి ప్రారంభించు",
      verifying: "ధృవీకరిస్తోంది...",
      step3Title: "MFA విజయవంతంగా ప్రారంభించబడింది!",
      mfaEnabledSuccessfully: "MFA విజయవంతంగా ప్రారంభించబడింది!",
      saveBackupCodes: "బ్యాకప్ కోడ్‌లు",
      backupCodesWarning:
        "ఈ కోడ్‌లను సురక్షితంగా సేవ్ చేయండి. అథెంటికేటర్ యాప్ ప్రాప్యత కోల్పోతే ఉపయోగించండి.",
      backupCodesOnce: "ప్రతి కోడ్ ఒక్కసారి మాత్రమే ఉపయోగించవచ్చు.",
      copyCodes: "కోడ్‌లు కాపీ చేయండి",
      download: "డౌన్‌లోడ్",
      done: "పూర్తయింది",
      mfaEnabled: "MFA ప్రారంభించబడింది",
      mfaEnabledDescription: "మీ ఖాతా Google Authenticatorతో రక్షించబడింది.",
      backupCodesRemaining: "{{count}} బ్యాకప్ కోడ్‌లు మిగిలి ఉన్నాయి",
      primaryAuth: "ప్రాథమిక అథెంటికేషన్",
      regenerateBackupCodes: "బ్యాకప్ కోడ్‌లు పునరుత్పత్తి చేయండి",
      disableMfa: "MFA నిలిపివేయండి",
      disableTitle: "MFA నిలిపివేయండి",
      disableMfaWarning:
        "ఇది మీ ఖాతా నుండి అథెంటికేటర్ రక్షణను తొలగిస్తుంది. కొనసాగించడానికి మీ గుర్తింపును ధృవీకరించాలి.",
      disableWarning: "ఇది మీ ఖాతా నుండి అథెంటికేటర్ రక్షణను తొలగిస్తుంది.",
      importantReminder: "గుర్తింపు",
      removeAuthenticatorEntry:
        "నిలిపివేసిన తర్వాత మీ అథెంటికేటర్ యాప్ నుండి 'Expensio Finance' తొలగించండి.",
      beforeYouScan: "స్కాన్ చేయడానికి ముందు",
      deleteOldEntriesWarning:
        "మీరు ఇంతకు ముందు MFA ప్రారంభించి ఉంటే, దయచేసి ముందుగా మీ Google Authenticator యాప్ నుండి పాత 'Expensio Finance' ఎంట్రీలను తొలగించండి. ఇది మీకు ఒకే సక్రియ కోడ్ ఉండేలా చేస్తుంది మరియు గందరగోళాన్ని నివారిస్తుంది.",
      useAuthenticatorCode: "అథెంటికేటర్ కోడ్ ఉపయోగించండి",
      usePassword: "పాస్‌వర్డ్ ఉపయోగించండి",
      authenticatorCode: "అథెంటికేటర్ కోడ్",
      password: "పాస్‌వర్డ్",
      cancel: "రద్దు",
      mfaEnabledSuccess: "MFA విజయవంతంగా ప్రారంభించబడింది!",
      mfaDisabledSuccess: "MFA విజయవంతంగా నిలిపివేయబడింది",
      verificationFailed: "ధృవీకరణ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
      failedToLoadStatus: "MFA స్థితి లోడ్ చేయడంలో విఫలమైంది",
      failedToStartSetup: "MFA సెటప్ ప్రారంభించడంలో విఫలమైంది",
      failedToDisable: "MFA నిలిపివేయడంలో విఫలమైంది",
      newCodesGenerated: "కొత్త బ్యాకప్ కోడ్‌లు రూపొందించబడ్డాయి!",
      failedToRegenerate: "కోడ్‌లు పునరుత్పత్తి చేయడంలో విఫలమైంది",
      copiedToClipboard: "క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!",
      backupCodesDownloaded: "బ్యాకప్ కోడ్‌లు డౌన్‌లోడ్ చేయబడ్డాయి!",
      enterCodeToRegenerate:
        "హెచ్చరిక: ఇది మీ అన్ని ఇప్పటికే ఉన్న బ్యాకప్ కోడ్‌లను చెల్లనివిగా చేస్తుంది!\n\nకొత్త బ్యాకప్ కోడ్‌లు రూపొందించడానికి మీ ప్రస్తుత అథెంటికేటర్ కోడ్ నమోదు చేయండి:",
    },
  },

  // Universal Search (సార్వత్రిక శోధన)
  search: {
    placeholder: "ఖర్చులు, బడ్జెట్‌లు, చర్యలను శోధించండి...",
    openSearch: "శోధించండి",
    noResults: "ఫలితాలు కనుగొనబడలేదు",
    tryDifferent: "వేరే శోధన పదం ప్రయత్నించండి",
    suggestions: "సూచనలు",
    typeToSearch: "శోధించడానికి టైప్ చేయండి...",
    navigate: "నావిగేట్ చేయండి",
    select: "ఎంచుకోండి",
    close: "మూసివేయండి",
    poweredBy: "సార్వత్రిక శోధన",

    // Section Headers
    sections: {
      admin: "అడ్మిన్",
      quickActions: "శీఘ్ర చర్యలు",
      actions: "చర్యలు",
      expenses: "ఖర్చులు",
      budgets: "బడ్జెట్‌లు",
      categories: "వర్గాలు",
      bills: "బిల్లులు",
      paymentMethods: "చెల్లింపు విధానాలు",
      payment_methods: "చెల్లింపు విధానాలు",
      friends: "స్నేహితులు",
      reports: "రిపోర్టులు",
      settings: "సెట్టింగ్స్",
      notifications: "నోటిఫికేషన్లు",
    },

    // Admin Mode Actions
    admin: {
      dashboard: "అడ్మిన్ డాష్‌బోర్డ్",
      dashboardDesc: "సిస్టమ్ అవలోకనం మరియు మెట్రిక్స్",
      users: "వినియోగదారు నిర్వహణ",
      usersDesc: "సిస్టమ్ వినియోగదారులను నిర్వహించండి",
      roles: "పాత్ర నిర్వహణ",
      rolesDesc: "వినియోగదారు పాత్రలు మరియు అనుమతులను నిర్వహించండి",
      analytics: "సిస్టమ్ విశ్లేషణలు",
      analyticsDesc: "సిస్టమ్-వ్యాప్త విశ్లేషణలు మరియు గణాంకాలు చూడండి",
      audit: "ఆడిట్ లాగ్‌లు",
      auditDesc: "సిస్టమ్ ఆడిట్ ట్రయిల్ మరియు కార్యకలాప లాగ్‌లు చూడండి",
      reports: "సిస్టమ్ రిపోర్టులు",
      reportsDesc: "సిస్టమ్ రిపోర్టులను రూపొందించండి మరియు చూడండి",
      settings: "సిస్టమ్ సెట్టింగ్స్",
      settingsDesc: "సిస్టమ్-వ్యాప్త సెట్టింగ్స్ కాన్ఫిగర్ చేయండి",
    },

    // Quick Actions
    actions: {
      // Expense Actions
      addExpense: "ఖర్చు జోడించండి",
      addExpenseDesc: "కొత్త ఖర్చు సృష్టించండి",
      viewExpenses: "అన్ని ఖర్చులు చూడండి",
      viewExpensesDesc: "మీ ఖర్చు చరిత్ర చూడండి",
      expenseReports: "ఖర్చు రిపోర్టులు",
      expenseReportsDesc: "ఖర్చు విశ్లేషణ చూడండి",

      // Budget Actions
      createBudget: "బడ్జెట్ సృష్టించండి",
      createBudgetDesc: "కొత్త బడ్జెట్ సెట్ చేయండి",
      viewBudgets: "బడ్జెట్‌లు చూడండి",
      viewBudgetsDesc: "మీ బడ్జెట్‌లను నిర్వహించండి",
      budgetReports: "బడ్జెట్ రిపోర్టులు",
      budgetReportsDesc: "బడ్జెట్ విశ్లేషణ చూడండి",

      // Bill Actions
      createBill: "బిల్లు సృష్టించండి",
      createBillDesc: "కొత్త పునరావృత బిల్లు జోడించండి",
      viewBills: "బిల్లులు చూడండి",
      viewBillsDesc: "మీ బిల్లులను నిర్వహించండి",
      billCalendar: "బిల్లు క్యాలెండర్",
      billCalendarDesc: "క్యాలెండర్‌లో బిల్లులు చూడండి",
      billReports: "బిల్లు రిపోర్టులు",
      billReportsDesc: "బిల్లు విశ్లేషణ చూడండి",

      // Category Actions
      createCategory: "వర్గం సృష్టించండి",
      createCategoryDesc: "కొత్త ఖర్చు వర్గం జోడించండి",
      viewCategories: "వర్గాలు చూడండి",
      viewCategoriesDesc: "ఖర్చు వర్గాలను నిర్వహించండి",
      categoryReports: "వర్గం రిపోర్టులు",
      categoryReportsDesc: "వర్గం వారీగా ఖర్చు చూడండి",

      // Payment Method Actions
      addPaymentMethod: "చెల్లింపు విధానం జోడించండి",
      addPaymentMethodDesc: "కొత్త చెల్లింపు విధానం జోడించండి",
      viewPaymentMethods: "చెల్లింపు విధానాలు చూడండి",
      viewPaymentMethodsDesc: "మీ చెల్లింపు విధానాలను నిర్వహించండి",
      paymentReports: "చెల్లింపు విధానం రిపోర్టులు",
      paymentReportsDesc: "చెల్లింపు విధానం వారీగా ఖర్చు చూడండి",

      // Dashboard & General
      dashboard: "డ్యాష్‌బోర్డ్",
      dashboardDesc: "ప్రధాన డ్యాష్‌బోర్డ్‌కు వెళ్లండి",
      calendarView: "క్యాలెండర్ వీక్షణ",
      calendarViewDesc: "క్యాలెండర్‌లో ఖర్చులు చూడండి",
      transactions: "లావాదేవీలు",
      transactionsDesc: "అన్ని లావాదేవీలు చూడండి",
      allReports: "అన్ని రిపోర్టులు",
      allReportsDesc: "సమగ్ర రిపోర్టులు చూడండి",
      insights: "అంతర్దృష్టులు",
      insightsDesc: "ఖర్చు అంతర్దృష్టులు చూడండి",

      // Friends
      viewFriends: "స్నేహితులు",
      viewFriendsDesc: "మీ స్నేహితులను నిర్వహించండి",
      friendActivity: "స్నేహితుల కార్యకలాపం",
      friendActivityDesc: "స్నేహితుల కార్యకలాపాలు చూడండి",

      // Groups
      viewGroups: "సమూహాలు",
      viewGroupsDesc: "ఖర్చు సమూహాలను నిర్వహించండి",
      createGroup: "సమూహం సృష్టించండి",
      createGroupDesc: "కొత్త ఖర్చు సమూహం సృష్టించండి",

      // Settings
      settings: "సెట్టింగ్స్",
      settingsDesc: "యాప్ సెట్టింగ్స్ మరియు ప్రాధాన్యతలు",
      profile: "ప్రొఫైల్",
      profileDesc: "మీ ప్రొఫైల్ చూడండి మరియు సవరించండి",
      notificationSettings: "నోటిఫికేషన్ సెట్టింగ్స్",
      notificationSettingsDesc: "నోటిఫికేషన్ ప్రాధాన్యతలను నిర్వహించండి",

      // Upload
      uploadExpenses: "ఖర్చులు అప్‌లోడ్ చేయండి",
      uploadExpensesDesc: "ఫైల్ నుండి ఖర్చులను బల్క్‌లో అప్‌లోడ్ చేయండి",
      uploadBills: "బిల్లులు అప్‌లోడ్ చేయండి",
      uploadBillsDesc: "ఫైల్ నుండి బిల్లులను బల్క్‌లో అప్‌లోడ్ చేయండి",

      // Chat
      chat: "చాట్",
      chatDesc: "స్నేహితులతో చాట్ తెరవండి",
    },

    // సెట్టింగ్స్ సెర్చ్ ఐటంలు
    settings: {
      keyboardShortcuts: "కీబోర్డ్ షార్ట్‌కట్లు",
      keyboardShortcutsDesc: "కీబోర్డ్ నావిగేషన్ షార్ట్‌కట్లు ప్రారంభించండి",
      showShortcutIndicators: "షార్ట్‌కట్ సూచకాలు చూపించు",
      showShortcutIndicatorsDesc:
        "Alt కీ నొక్కినప్పుడు షార్ట్‌కట్ బ్యాజ్‌లు చూపించండి",
      screenReader: "స్క్రీన్ రీడర్ మద్దతు",
      screenReaderDesc: "స్క్రీన్ రీడర్‌ల కోసం మెరుగైన మద్దతు",
      reduceMotion: "చలనాన్ని తగ్గించండి",
      reduceMotionDesc: "మెరుగైన యాక్సెసిబిలిటీ కోసం యానిమేషన్‌లను తగ్గించండి",
      focusIndicators: "మెరుగైన ఫోకస్ సూచికలు",
      focusIndicatorsDesc:
        "ఫోకస్ చేసిన ఎలిమెంట్‌లను మరింత ప్రముఖంగా హైలైట్ చేయండి",
    },
  },

  // కీబోర్డ్ Alt ఓవర్లే
  keyboard: {
    pressLetter: "ఒక అక్షరం నొక్కండి:",
    escToCancel: "రద్దు చేయడానికి Esc",
    calendar: "క్యాలెండర్",
    toggleTheme: "థీమ్",
    toggleMasking: "మాస్కింగ్",
    search: "వెతకండి",
    help: "సహాయం",
    // హెడర్ చర్యలు
    notifications: "నోటిఫికేషన్లు",
    profile: "ప్రొఫైల్",
    // నోటిఫికేషన్ ప్యానెల్ చైల్డ్ షార్ట్‌కట్లు
    markAllRead: "అన్నీ చదివినట్లు గుర్తించు",
    clearAll: "అన్నీ క్లియర్ చేయి",
    close: "మూసివేయి",
    // ప్రొఫైల్ డ్రాప్‌డౌన్ చైల్డ్ షార్ట్‌కట్లు
    viewProfile: "ప్రొఫైల్ చూడండి",
    settings: "సెట్టింగ్‌లు",
    switchMode: "మోడ్ మార్చు",
    logout: "లాగ్ అవుట్",
    // మోడల్ షార్ట్‌కట్లు
    yes: "అవును",
    no: "కాదు",
    confirm: "నిర్ధారించు",
    cancel: "రద్దు",
    // ఫ్లో పేజీ షార్ట్‌కట్లు
    week: "వారం",
    month: "నెల",
    year: "సంవత్సరం",
    previous: "ముందు",
    next: "తర్వాత",
    flowToggle: "ఫ్లో టాగల్",
    // ఫ్లో నావిగేషన్ బార్ షార్ట్‌కట్లు (వరుస 1-7)
    flowNav1: "నావిగేషన్ 1",
    flowNav2: "నావిగేషన్ 2",
    flowNav3: "నావిగేషన్ 3",
    flowNav4: "నావిగేషన్ 4",
    flowNav5: "నావిగేషన్ 5",
    flowNav6: "నావిగేషన్ 6",
    flowNav7: "నావిగేషన్ 7",
  },

  // Tour
  tour: {
    welcomeTitle: "Welcome to Expensio!",
    welcomeMessage: "Let's take a quick tour to help you get started.",
    profileMessage:
      "This is your profile area. View stories, friend updates, and your status here.",
    dashboardMessage:
      "Your Dashboard gives you a quick overview of your financial health and recent activities.",
    expensesMessage:
      "Track all your daily expenses here. Add, edit, and categorize your spending.",
    budgetsMessage:
      "Set monthly budgets to keep your spending in check. We'll alert you when you get close to your limits.",
    groupsMessage:
      "Create groups to split bills and share expenses with friends and family easily.",
    reportsMessage:
      "Visualize your spending habits with detailed reports and analytics to make better financial decisions.",
    categoriesMessage:
      "Manage your expense categories to organize your spending effectively.",
    paymentsMessage: "Manage your payment methods and track transactions.",
    billMessage: "Keep track of your bills and due dates to avoid late fees.",
    friendsMessage: "Connect with friends and share your financial journey.",
    utilitiesMessage:
      "Access various utility tools to assist with your financial planning.",
    headerSearchMessage:
      "Quickly search for any feature, transaction, or setting.",
    headerMaskingMessage:
      "Toggle the visibility of sensitive amounts for privacy.",
    headerThemeMessage:
      "Switch between dark and light modes to suit your preference.",
    headerNotificationsMessage:
      "Stay updated with important alerts and notifications.",
    headerProfileMessage:
      "Access your profile settings and manage your account.",
    finishTitle: "You're all set!",
    finishMessage: "Enjoy using Expensio to manage your finances effortlessly.",
  },
};
