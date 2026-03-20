import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { recalculateBudgetSpent } from "../src/infrastructure/demo/domain/demoBudgetAccounting.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "../src/infrastructure/demo/fixtures");
const XLSX_PATH = path.join(FIXTURES_DIR, "Demo_Data.xlsx");
const SEED_PATH = path.join(FIXTURES_DIR, "seed.entities.json");

const SHEETS = [
  "Categories",
  "PaymentMethods",
  "Budgets",
  "Bills",
  "Expenses",
  "Friends",
  "Groups",
  "FriendRequests",
];

function splitCsv(s) {
  if (s == null || String(s).trim() === "") return [];
  return String(s)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function buildDemoDataset() {
  const categories = [
    { id: "demo-cat-1", name: "Food", color: "#14b8a6", type: "NEED" },
    { id: "demo-cat-2", name: "Transport", color: "#6366f1", type: "NEED" },
    { id: "demo-cat-3", name: "Health", color: "#f43f5e", type: "NEED" },
    { id: "demo-cat-4", name: "Entertainment", color: "#a855f7", type: "WANT" },
    { id: "demo-cat-5", name: "Income", color: "#10b981", type: "NEED" },
    { id: "demo-cat-6", name: "Shopping", color: "#f59e0b", type: "WANT" },
    { id: "demo-cat-7", name: "Utilities", color: "#0ea5e9", type: "NEED" },
    { id: "demo-cat-8", name: "Housing", color: "#84cc16", type: "NEED" },
  ];

  const paymentMethods = [
    { id: "demo-pm-1", name: "Visa ··4242", type: "CARD" },
    { id: "demo-pm-2", name: "Checking ··1091", type: "BANK" },
    { id: "demo-pm-3", name: "Cash wallet", type: "CASH" },
    { id: "demo-pm-4", name: "Rewards ··8831", type: "CARD" },
    { id: "demo-pm-5", name: "Amex ··1001", type: "CARD" },
  ];

  const budgets = [
    {
      id: "demo-bud-1",
      name: "Household essentials",
      amount: 1400,
      period: "MONTHLY",
      startDateOffsetDays: -90,
      endDateOffsetDays: "",
      description: "Groceries and household",
      categoryIds: "demo-cat-1,demo-cat-6",
      comments: "Linked bills: Electric, Internet",
      spent: "",
    },
    {
      id: "demo-bud-2",
      name: "Commute",
      amount: 320,
      period: "MONTHLY",
      startDateOffsetDays: -60,
      endDateOffsetDays: "",
      description: "Transport",
      categoryIds: "demo-cat-2",
      comments: "",
      spent: "",
    },
    {
      id: "demo-bud-3",
      name: "Wellness",
      amount: 280,
      period: "MONTHLY",
      startDateOffsetDays: -45,
      endDateOffsetDays: "",
      description: "Health and fitness",
      categoryIds: "demo-cat-3",
      comments: "",
      spent: "",
    },
    {
      id: "demo-bud-4",
      name: "Fun money",
      amount: 400,
      period: "MONTHLY",
      startDateOffsetDays: -30,
      endDateOffsetDays: "",
      description: "Entertainment",
      categoryIds: "demo-cat-4",
      comments: "",
      spent: "",
    },
    {
      id: "demo-bud-5",
      name: "Utilities pool",
      amount: 550,
      period: "MONTHLY",
      startDateOffsetDays: -120,
      endDateOffsetDays: "",
      description: "Bills covered under household utilities",
      categoryIds: "demo-cat-7",
      comments: "Tied to Bills sheet: Electric, Internet, Mobile",
      spent: "",
    },
    {
      id: "demo-bud-6",
      name: "Annual reserve",
      amount: 8000,
      period: "YEARLY",
      startDateOffsetDays: -400,
      endDateOffsetDays: 200,
      description: "Year-long planning bucket",
      categoryIds: "",
      comments: "Cross-category buffer",
      spent: "",
    },
  ];

  const bills = [
    {
      id: "demo-bill-1",
      name: "Electric utility",
      amount: 95,
      dueInDays: 5,
      status: "PENDING",
      category: "Utilities",
      notes: "Budget: demo-bud-5 (Utilities pool)",
      budgetId: "demo-bud-5",
    },
    {
      id: "demo-bill-2",
      name: "Internet",
      amount: 69.99,
      dueInDays: 12,
      status: "PENDING",
      category: "Utilities",
      notes: "Budget: demo-bud-5",
      budgetId: "demo-bud-5",
    },
    {
      id: "demo-bill-3",
      name: "Rent share",
      amount: 980,
      dueInDays: 1,
      status: "PENDING",
      category: "Housing",
      notes: "Budget: demo-bud-6 partial overlap",
      budgetId: "demo-bud-6",
    },
    {
      id: "demo-bill-4",
      name: "Mobile plan",
      amount: 45,
      dueInDays: 20,
      status: "PENDING",
      category: "Utilities",
      notes: "Budget: demo-bud-5",
      budgetId: "demo-bud-5",
    },
    {
      id: "demo-bill-5",
      name: "Insurance",
      amount: 132,
      dueInDays: 45,
      status: "PENDING",
      category: "Insurance",
      notes: "Budget: demo-bud-6",
      budgetId: "demo-bud-6",
    },
    {
      id: "demo-bill-6",
      name: "Streaming bundle",
      amount: 24.99,
      dueInDays: 8,
      status: "PENDING",
      category: "Entertainment",
      notes: "Budget: demo-bud-4",
      budgetId: "demo-bud-4",
    },
    {
      id: "demo-bill-7",
      name: "Gym membership",
      amount: 49,
      dueInDays: 15,
      status: "PENDING",
      category: "Health",
      notes: "Budget: demo-bud-3",
      budgetId: "demo-bud-3",
    },
    {
      id: "demo-bill-8",
      name: "Parking permit",
      amount: 120,
      dueInDays: 60,
      status: "PENDING",
      category: "Transport",
      notes: "Budget: demo-bud-2",
      budgetId: "demo-bud-2",
    },
  ];

  const lossNames = [
    "Groceries",
    "Transit pass",
    "Coffee",
    "Lunch",
    "Pharmacy",
    "Fuel",
    "Parking",
    "Dinner",
    "Books",
    "Gym",
    "Haircut",
    "Pet supplies",
    "Gift",
    "Train",
    "Snacks",
    "Clothing",
    "Electronics",
    "Movie",
    "Taxi",
    "Water bill share",
    "Office supplies",
    "Yoga",
    "Dentist",
    "Home goods",
    "Takeout",
  ];
  const catIds = ["demo-cat-1", "demo-cat-2", "demo-cat-3", "demo-cat-4", "demo-cat-6", "demo-cat-7"];
  const budLinks = [
    ["demo-bud-1"],
    ["demo-bud-2"],
    ["demo-bud-1", "demo-bud-6"],
    ["demo-bud-4"],
    ["demo-bud-3"],
    ["demo-bud-5"],
    [],
  ];
  const expenses = [];
  for (let i = 0; i < 200; i += 1) {
    const dateOffsetDays = -800 + Math.round((920 * i) / 199);
    const catId = catIds[i % catIds.length];
    const budgetPick = budLinks[i % budLinks.length];
    const budgetIds = budgetPick.join(",");
    const isGain = i % 17 === 0;
    const type = isGain ? "gain" : i % 11 === 0 ? "WANT" : "NEED";
    const name = isGain
      ? i % 34 === 0
        ? "Salary deposit"
        : i % 34 === 17
          ? "Freelance payout"
          : "Cashback"
      : lossNames[i % lossNames.length];
    const amount = isGain
      ? num(120 + (i % 50) * 40 + (i % 3) * 15)
      : Math.round((8 + (i % 9) * 6.2 + (i % 5) * 2.1) * 10) / 10;
    const paymentMethod = ["CARD", "CASH", "BANK", "CARD", "CARD"][i % 5];
    expenses.push({
      id: `demo-exp-${String(i + 1).padStart(3, "0")}`,
      name,
      amount,
      dateOffsetDays,
      categoryId: isGain ? "demo-cat-5" : catId,
      paymentMethod,
      type,
      budgetIds,
      comments: budgetIds ? `Budgets: ${budgetIds}` : "",
      isRecurring: i % 31 === 0,
      createdAtOffsetDays: dateOffsetDays,
      updatedAtOffsetDays: dateOffsetDays,
    });
  }

  const friends = [
    {
      id: "demo-fr-1",
      friendUserId: "u-901",
      displayName: "Jamie Chen",
      email: "jamie@example.com",
      status: "ACCEPTED",
    },
    {
      id: "demo-fr-2",
      friendUserId: "u-902",
      displayName: "Sam Rivera",
      email: "sam@example.com",
      status: "ACCEPTED",
    },
    {
      id: "demo-fr-3",
      friendUserId: "u-903",
      displayName: "Taylor Brooks",
      email: "taylor@example.com",
      status: "ACCEPTED",
    },
    {
      id: "demo-fr-4",
      friendUserId: "u-904",
      displayName: "Riley Ng",
      email: "riley@example.com",
      status: "ACCEPTED",
    },
  ];

  const groups = [
    {
      id: "demo-gr-1",
      name: "Weekend trips",
      description: "Shared trip fund",
      memberCount: 4,
    },
    {
      id: "demo-gr-2",
      name: "Flatmates",
      description: "Household split",
      memberCount: 3,
    },
    {
      id: "demo-gr-3",
      name: "Book club",
      description: "Events and snacks",
      memberCount: 6,
    },
    {
      id: "demo-gr-4",
      name: "Sports league",
      description: "Fees and gear",
      memberCount: 8,
    },
  ];

  const friendRequests = [
    {
      id: "demo-frq-1",
      senderId: "u-801",
      senderName: "Alex Kim",
      senderEmail: "alex@example.com",
      status: "PENDING",
    },
    {
      id: "demo-frq-2",
      senderId: "u-802",
      senderName: "Jordan Lee",
      senderEmail: "jordan@example.com",
      status: "PENDING",
    },
    {
      id: "demo-frq-3",
      senderId: "u-803",
      senderName: "Casey Morgan",
      senderEmail: "casey@example.com",
      status: "PENDING",
    },
  ];

  return {
    Categories: categories,
    PaymentMethods: paymentMethods,
    Budgets: budgets,
    Bills: bills,
    Expenses: expenses,
    Friends: friends,
    Groups: groups,
    FriendRequests: friendRequests,
  };
}

function sheetRowsToWorkbook(rowsBySheet) {
  const wb = XLSX.utils.book_new();
  for (const name of SHEETS) {
    const rows = rowsBySheet[name];
    if (!rows?.length) continue;
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  return wb;
}

function rowsToSeedEntities(rowsBySheet) {
  const catSet = new Set(rowsBySheet.Categories.map((r) => r.id));
  const budSet = new Set(rowsBySheet.Budgets.map((r) => r.id));

  const categories = rowsBySheet.Categories.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    color: String(r.color),
    type: String(r.type),
  }));

  const paymentMethods = rowsBySheet.PaymentMethods.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    type: String(r.type),
  }));

  const budgets = rowsBySheet.Budgets.map((r) => {
    const categoryIds = splitCsv(r.categoryIds);
    for (const cid of categoryIds) {
      if (!catSet.has(cid)) throw new Error(`Budget ${r.id} unknown categoryId ${cid}`);
    }
    const row = {
      id: String(r.id),
      name: String(r.name),
      amount: num(r.amount),
      period: String(r.period || "MONTHLY"),
      startDateOffsetDays: num(r.startDateOffsetDays, 0),
      categories: categoryIds.map((id) => ({ id })),
      spent: num(r.spent, 0),
    };
    if (r.description != null && String(r.description).trim() !== "") {
      row.description = String(r.description);
    }
    if (r.comments != null && String(r.comments).trim() !== "") {
      row.comments = String(r.comments);
    }
    if (r.endDateOffsetDays !== "" && r.endDateOffsetDays != null && String(r.endDateOffsetDays).trim() !== "") {
      row.endDateOffsetDays = num(r.endDateOffsetDays);
    }
    return row;
  });

  const bills = rowsBySheet.Bills.map((r) => {
    const bid = r.budgetId != null && String(r.budgetId).trim() !== "" ? String(r.budgetId) : "";
    if (bid && !budSet.has(bid)) throw new Error(`Bill ${r.id} unknown budgetId ${bid}`);
    const bill = {
      id: String(r.id),
      name: String(r.name),
      amount: num(r.amount),
      status: String(r.status || "PENDING"),
      category: String(r.category || ""),
      notes: String(r.notes || ""),
    };
    if (bid) bill.budgetId = bid;
    if (r.dueInDays !== "" && r.dueInDays != null) bill.dueInDays = num(r.dueInDays);
    else if (r.dueDateOffsetDays !== "" && r.dueDateOffsetDays != null) {
      bill.dueDateOffsetDays = num(r.dueDateOffsetDays);
    }
    return bill;
  });

  const expenses = rowsBySheet.Expenses.map((r) => {
    if (!catSet.has(String(r.categoryId))) throw new Error(`Expense ${r.id} unknown categoryId ${r.categoryId}`);
    const bIds = splitCsv(r.budgetIds);
    for (const b of bIds) {
      if (!budSet.has(b)) throw new Error(`Expense ${r.id} unknown budgetId ${b}`);
    }
    const row = {
      id: String(r.id),
      name: String(r.name),
      amount: num(r.amount),
      dateOffsetDays: num(r.dateOffsetDays),
      categoryId: String(r.categoryId),
      categoryName: rowsBySheet.Categories.find((c) => c.id === r.categoryId)?.name || "",
      category: rowsBySheet.Categories.find((c) => c.id === r.categoryId)?.name || "",
      type: String(r.type || "NEED"),
      paymentMethod: String(r.paymentMethod || "CASH"),
      comments: String(r.comments || ""),
      isRecurring:
        r.isRecurring === true ||
        r.isRecurring === 1 ||
        String(r.isRecurring).toLowerCase() === "true",
      budgetIds: bIds,
      createdAtOffsetDays: num(r.createdAtOffsetDays, num(r.dateOffsetDays)),
      updatedAtOffsetDays: num(r.updatedAtOffsetDays, num(r.dateOffsetDays)),
    };
    return row;
  });

  if (expenses.length !== 200) {
    throw new Error(`Expected 200 expenses, got ${expenses.length}`);
  }

  const friends = rowsBySheet.Friends.map((r) => ({
    id: String(r.id),
    friendUserId: String(r.friendUserId),
    displayName: String(r.displayName),
    email: String(r.email),
    status: String(r.status || "ACCEPTED"),
  }));

  const groups = rowsBySheet.Groups.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    description: String(r.description || ""),
    memberCount: num(r.memberCount, 0),
  }));

  const friendRequests = rowsBySheet.FriendRequests.map((r) => ({
    id: String(r.id),
    senderId: String(r.senderId),
    senderName: String(r.senderName),
    senderEmail: String(r.senderEmail),
    status: String(r.status || "PENDING"),
  }));

  const store = { budgets, expenses: expenses.map((e) => ({ ...e })) };
  recalculateBudgetSpent(store);

  const seed = {
    categories,
    expenses,
    budgets: store.budgets,
    bills,
    friends,
    friendRequests,
    paymentMethods,
    groups,
    userSettings: {
      themeMode: "dark",
      dateFormat: "DD/MM/YYYY",
      currency: "USD",
      twoFactorEnabled: false,
    },
    nextId: 6000,
  };

  return seed;
}

function readWorkbookFromDisk() {
  if (!fs.existsSync(XLSX_PATH)) {
    throw new Error(`Missing ${XLSX_PATH}. Run: bun run demo:seed:write-xlsx`);
  }
  return XLSX.readFile(XLSX_PATH);
}

function workbookToRowMap(wb) {
  const out = {};
  for (const name of SHEETS) {
    const sheet = wb.Sheets[name];
    if (!sheet) throw new Error(`Workbook missing sheet: ${name}`);
    out[name] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }
  return out;
}

function writeSeedJson(seed) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  fs.writeFileSync(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
}

function runWriteXlsx() {
  const rows = buildDemoDataset();
  const wb = sheetRowsToWorkbook(rows);
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  XLSX.writeFile(wb, XLSX_PATH);
  const seed = rowsToSeedEntities(rows);
  writeSeedJson(seed);
  process.stdout.write(`Wrote ${XLSX_PATH} and ${SEED_PATH}\n`);
}

function runFromXlsx() {
  const wb = readWorkbookFromDisk();
  const rows = workbookToRowMap(wb);
  const seed = rowsToSeedEntities(rows);
  writeSeedJson(seed);
  process.stdout.write(`Wrote ${SEED_PATH} from ${XLSX_PATH}\n`);
}

const writeXlsx = process.argv.includes("--write-xlsx");
if (writeXlsx) {
  runWriteXlsx();
} else {
  runFromXlsx();
}
