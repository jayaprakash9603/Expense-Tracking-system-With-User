import json
import uuid

BASE = "{{baseUrl}}"

def url(raw, path_parts, query=None):
    u = {"raw": raw, "host": [BASE], "path": path_parts}
    if query:
        u["query"] = query
    return u

def q(key, val, disabled=False):
    p = {"key": key, "value": str(val)}
    if disabled:
        p["disabled"] = True
    return p

def auto_test(method, name):
    lines = []
    is_delete = method == "DELETE"
    is_create = method == "POST" and any(kw in name.lower() for kw in ["create", "add ", "signup", "save", "send ", "invite", "scan"])
    is_auth = any(kw in name.lower() for kw in ["signin", "signup", "login", "refresh token", "verify login", "google login"])

    if is_auth:
        lines.append('pm.test("Status is 200", () => pm.response.to.have.status(200));')
    elif is_delete:
        lines.append('pm.test("Status is 2xx", () => { pm.expect(pm.response.code).to.be.oneOf([200, 204]); });')
    elif is_create:
        lines.append('pm.test("Status is 2xx", () => { pm.expect(pm.response.code).to.be.oneOf([200, 201]); });')
    else:
        lines.append('pm.test("Status is 200", () => pm.response.to.have.status(200));')

    lines.append('')
    lines.append('pm.test("Content-Type is JSON", () => {')
    lines.append('    if (pm.response.code !== 204 && pm.response.text().length > 0) {')
    lines.append('        pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");')
    lines.append('    }')
    lines.append('});')

    if method in ("GET", "POST") and not is_delete:
        lines.append('')
        lines.append('pm.test("Response body is not empty", () => {')
        lines.append('    if (pm.response.code !== 204) {')
        lines.append('        pm.expect(pm.response.text().length).to.be.greaterThan(0);')
        lines.append('    }')
        lines.append('});')

    if not is_delete:
        lines.append('')
        lines.append('pm.test("No server error", () => {')
        lines.append('    pm.expect(pm.response.code).to.not.be.oneOf([500, 502, 503]);')
        lines.append('});')

    return [{"listen": "test", "script": {"type": "text/javascript", "exec": lines}}]


def req(name, method, raw_url, path_parts, query=None, body=None, auth=None, events=None):
    r = {"name": name, "request": {"method": method, "header": [], "url": url(raw_url, path_parts, query)}}
    if body is not None:
        r["request"]["body"] = {"mode": "raw", "raw": body, "options": {"raw": {"language": "json"}}}
    if auth:
        r["request"]["auth"] = auth
    if events:
        r["event"] = events
    else:
        r["event"] = auto_test(method, name)
    return r

def noauth():
    return {"type": "noauth"}

def test_script(code):
    return [{"listen": "test", "script": {"type": "text/javascript", "exec": code if isinstance(code, list) else [code]}}]

def status_test(code):
    return test_script([f'pm.test("Status {code}", () => pm.response.to.have.status({code}));'])

def jwt_extract_test():
    return test_script([
        'pm.test("Status is 200", () => pm.response.to.have.status(200));',
        '',
        'pm.test("JWT present in response", () => {',
        '    var data = pm.response.json();',
        '    var token = data.jwt || data.token;',
        '    pm.expect(token).to.be.a("string").and.not.empty;',
        '    pm.collectionVariables.set("jwt", token);',
        '    console.log("JWT stored successfully");',
        '});',
        '',
        'pm.test("Content-Type is JSON", () => {',
        '    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");',
        '});',
        '',
        'pm.test("No server error", () => {',
        '    pm.expect(pm.response.code).to.not.be.oneOf([500, 502, 503]);',
        '});'
    ])

def id_extract_test(var_name, status=201):
    return test_script([
        f'pm.test("Status is {status} or 200", () => {{',
        f'    pm.expect(pm.response.code).to.be.oneOf([200, {status}]);',
        '});',
        '',
        f'pm.test("Store {var_name}", () => {{',
        '    var data = pm.response.json();',
        f'    var id = data.id || data.{var_name};',
        '    if (id) {',
        f'        pm.collectionVariables.set("{var_name}", String(id));',
        f'        console.log("{var_name} stored: " + id);',
        '    }',
        '});',
        '',
        'pm.test("Content-Type is JSON", () => {',
        '    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");',
        '});',
        '',
        'pm.test("Response body is not empty", () => {',
        '    pm.expect(pm.response.text().length).to.be.greaterThan(0);',
        '});',
        '',
        'pm.test("No server error", () => {',
        '    pm.expect(pm.response.code).to.not.be.oneOf([500, 502, 503]);',
        '});'
    ])

def folder(name, items):
    return {"name": name, "item": items}

def body_json(obj):
    return json.dumps(obj, indent=2)

# ============================================================
# 1. USER SERVICE
# ============================================================

def user_service_auth():
    return folder("01. Auth", [
        req("Signup", "POST", f"{BASE}/auth/signup", ["auth","signup"],
            body=body_json({"firstName":"John","lastName":"Doe","fullName":"John Doe","email":"{{email}}","password":"{{password}}"}),
            auth=noauth(), events=jwt_extract_test()),
        req("Signin", "POST", f"{BASE}/auth/signin", ["auth","signin"],
            body=body_json({"email":"{{email}}","password":"{{password}}"}),
            auth=noauth(), events=jwt_extract_test()),
        req("Verify Login OTP", "POST", f"{BASE}/auth/verify-login-otp", ["auth","verify-login-otp"],
            body=body_json({"email":"{{email}}","otp":"123456"}),
            auth=noauth(), events=jwt_extract_test()),
        req("Refresh Token", "POST", f"{BASE}/auth/refresh-token", ["auth","refresh-token"],
            events=jwt_extract_test()),
        req("Find User By ID (auth/user)", "GET", f"{BASE}/auth/user/{{{{userId}}}}", ["auth","user","{{userId}}"]),
        req("Find User By ID (auth/id)", "GET", f"{BASE}/auth/{{{{userId}}}}", ["auth","{{userId}}"]),
        req("Get User By Email", "GET", f"{BASE}/auth/email?email={{{{email}}}}", ["auth","email"],
            query=[q("email","{{email}}")]),
        req("Get All Users", "GET", f"{BASE}/auth/all-users", ["auth","all-users"]),
        req("Check Email", "POST", f"{BASE}/auth/check-email", ["auth","check-email"],
            body=body_json({"email":"{{email}}"}), auth=noauth()),
        req("Check Auth Method", "GET", f"{BASE}/auth/check-auth-method?email={{{{email}}}}", ["auth","check-auth-method"],
            query=[q("email","{{email}}")], auth=noauth()),
        req("Send OTP", "POST", f"{BASE}/auth/send-otp", ["auth","send-otp"],
            body=body_json({"email":"{{email}}"}), auth=noauth()),
        req("Resend Login OTP", "POST", f"{BASE}/auth/resend-login-otp", ["auth","resend-login-otp"],
            body=body_json({"email":"{{email}}"}), auth=noauth()),
        req("Verify OTP", "POST", f"{BASE}/auth/verify-otp", ["auth","verify-otp"],
            body=body_json({"email":"{{email}}","otp":"123456"}), auth=noauth()),
        req("Reset Password", "PATCH", f"{BASE}/auth/reset-password", ["auth","reset-password"],
            body=body_json({"email":"{{email}}","password":"NewPass@123"}), auth=noauth()),
    ])

def user_service_oauth2():
    return folder("02. OAuth2", [
        req("Google Login", "POST", f"{BASE}/auth/oauth2/google", ["auth","oauth2","google"],
            body=body_json({"credential":"GOOGLE_ID_TOKEN","email":"user@gmail.com","firstName":"John","lastName":"Doe"}),
            auth=noauth()),
        req("OAuth2 Health Check", "GET", f"{BASE}/auth/oauth2/health", ["auth","oauth2","health"], auth=noauth()),
    ])

def user_service_mfa():
    return folder("03. MFA", [
        req("Get MFA Status", "GET", f"{BASE}/auth/mfa/status", ["auth","mfa","status"]),
        req("Setup MFA", "POST", f"{BASE}/auth/mfa/setup", ["auth","mfa","setup"]),
        req("Enable MFA", "POST", f"{BASE}/auth/mfa/enable", ["auth","mfa","enable"],
            body=body_json({"tempSecret":"BASE32SECRETKEY","otp":"123456"})),
        req("Verify MFA", "POST", f"{BASE}/auth/mfa/verify", ["auth","mfa","verify"],
            body=body_json({"email":"{{email}}","otp":"123456"}), auth=noauth()),
        req("Disable MFA", "POST", f"{BASE}/auth/mfa/disable", ["auth","mfa","disable"],
            body=body_json({"password":"{{password}}"})),
        req("Regenerate Backup Codes", "POST", f"{BASE}/auth/mfa/regenerate-backup-codes", ["auth","mfa","regenerate-backup-codes"],
            body=body_json({"password":"{{password}}"})),
    ])

def user_service_user():
    return folder("04. User", [
        req("Get Profile", "GET", f"{BASE}/api/user/profile", ["api","user","profile"]),
        req("Get User By Email", "GET", f"{BASE}/api/user/email?email={{{{email}}}}", ["api","user","email"],
            query=[q("email","{{email}}")]),
        req("Get All Users", "GET", f"{BASE}/api/user/all", ["api","user","all"]),
        req("Get User By ID", "GET", f"{BASE}/api/user/{{{{userId}}}}", ["api","user","{{userId}}"]),
        req("Update User", "PUT", f"{BASE}/api/user", ["api","user"],
            body=body_json({"firstName":"John","lastName":"Doe","fullName":"John Doe"})),
        req("Update Two Factor", "PUT", f"{BASE}/api/user/two-factor", ["api","user","two-factor"],
            body=body_json({"enabled":True})),
        req("Delete User", "DELETE", f"{BASE}/api/user/{{{{userId}}}}", ["api","user","{{userId}}"]),
        req("Add Role To User", "POST", f"{BASE}/api/user/{{{{userId}}}}/roles/{{{{roleId}}}}", ["api","user","{{userId}}","roles","{{roleId}}"]),
        req("Remove Role From User", "DELETE", f"{BASE}/api/user/{{{{userId}}}}/roles/{{{{roleId}}}}", ["api","user","{{userId}}","roles","{{roleId}}"]),
        req("Switch User Mode", "PUT", f"{BASE}/api/user/switch-mode?mode=PERSONAL", ["api","user","switch-mode"],
            query=[q("mode","PERSONAL")]),
    ])

def user_service_roles():
    return folder("05. Roles", [
        req("Create Role", "POST", f"{BASE}/api/roles", ["api","roles"],
            body=body_json({"name":"ROLE_MANAGER"}), events=id_extract_test("roleId")),
        req("Get All Roles", "GET", f"{BASE}/api/roles", ["api","roles"]),
        req("Get Role By ID", "GET", f"{BASE}/api/roles/{{{{roleId}}}}", ["api","roles","{{roleId}}"]),
        req("Get Role By Name", "GET", f"{BASE}/api/roles/name/ROLE_ADMIN", ["api","roles","name","ROLE_ADMIN"]),
        req("Update Role", "PUT", f"{BASE}/api/roles/{{{{roleId}}}}", ["api","roles","{{roleId}}"],
            body=body_json({"name":"ROLE_MANAGER"})),
        req("Delete Role", "DELETE", f"{BASE}/api/roles/{{{{roleId}}}}", ["api","roles","{{roleId}}"]),
    ])

def user_service_admin():
    return folder("06. Admin Users", [
        req("Get All Users (Paginated)", "GET", f"{BASE}/api/admin/users?page=0&size=20", ["api","admin","users"],
            query=[q("page","0"),q("size","20"),q("status","ACTIVE",True),q("role","ROLE_USER",True),q("search","",True)]),
        req("Get User By ID", "GET", f"{BASE}/api/admin/users/{{{{userId}}}}", ["api","admin","users","{{userId}}"]),
        req("Update User Status", "PUT", f"{BASE}/api/admin/users/{{{{userId}}}}/status", ["api","admin","users","{{userId}}","status"],
            body=body_json({"status":"SUSPENDED"})),
        req("Delete User", "DELETE", f"{BASE}/api/admin/users/{{{{userId}}}}", ["api","admin","users","{{userId}}"]),
        req("Bulk User Action", "POST", f"{BASE}/api/admin/users/bulk-action", ["api","admin","users","bulk-action"],
            body=body_json({"userIds":[1,2,3],"action":"SUSPEND"})),
        req("Get User Stats", "GET", f"{BASE}/api/admin/users/stats", ["api","admin","users","stats"]),
        req("Search Users", "GET", f"{BASE}/api/admin/users/search?query=john&limit=20", ["api","admin","users","search"],
            query=[q("query","john"),q("limit","20")]),
        req("Get All Users (Simple)", "GET", f"{BASE}/api/admin/all", ["api","admin","all"]),
    ])

def user_service_admin_analytics():
    return folder("07. Admin Analytics", [
        req("Analytics Overview", "GET", f"{BASE}/api/admin/analytics/overview?timeRange=7d", ["api","admin","analytics","overview"],
            query=[q("timeRange","7d")]),
        req("Top Categories", "GET", f"{BASE}/api/admin/analytics/top-categories?timeRange=7d&limit=5", ["api","admin","analytics","top-categories"],
            query=[q("timeRange","7d"),q("limit","5")]),
        req("Recent Activity", "GET", f"{BASE}/api/admin/analytics/recent-activity?hours=24", ["api","admin","analytics","recent-activity"],
            query=[q("hours","24")]),
        req("Top Users", "GET", f"{BASE}/api/admin/analytics/top-users?timeRange=7d&limit=10", ["api","admin","analytics","top-users"],
            query=[q("timeRange","7d"),q("limit","10")]),
        req("User Stats", "GET", f"{BASE}/api/admin/analytics/user-stats", ["api","admin","analytics","user-stats"]),
        req("Dashboard Analytics", "GET", f"{BASE}/api/admin/analytics/dashboard?timeRange=7d", ["api","admin","analytics","dashboard"],
            query=[q("timeRange","7d")]),
    ])

def user_service_report_prefs():
    pref_types = [
        ("Budget Report", "budget-report-preferences"),
        ("Dashboard", "dashboard-preferences"),
        ("Expense Report", "expense-report-preferences"),
        ("Friendship Report", "friendship-report-preferences"),
        ("Payment Report", "payment-report-preferences"),
        ("Bill Report", "bill-report-preferences"),
        ("Category Report", "category-report-preferences"),
    ]
    items = []
    for label, path_seg in pref_types:
        items.append(folder(f"{label} Preferences", [
            req(f"Get {label} Preferences", "GET", f"{BASE}/api/user/{path_seg}", ["api","user",path_seg]),
            req(f"Save {label} Preferences", "POST", f"{BASE}/api/user/{path_seg}", ["api","user",path_seg],
                body=body_json({"preferences":{}})),
            req(f"Reset {label} Preferences", "DELETE", f"{BASE}/api/user/{path_seg}", ["api","user",path_seg]),
        ]))
    return folder("08. Report Preferences", items)


# ============================================================
# 2. EXPENSE SERVICE
# ============================================================

def expense_service_crud():
    items = [
        req("Add Expense", "POST", f"{BASE}/api/expenses/add-expense", ["api","expenses","add-expense"],
            body=body_json({"expenseName":"Groceries","amount":50.0,"type":"LOSS","date":"2026-03-13","paymentMethod":"CASH"}),
            events=id_extract_test("expenseId")),
        req("Copy Expense", "POST", f"{BASE}/api/expenses/{{{{expenseId}}}}/copy", ["api","expenses","{{expenseId}}","copy"]),
        req("Get Expenses By User", "GET", f"{BASE}/api/expenses/UserDTO/{{{{userId}}}}", ["api","expenses","UserDTO","{{userId}}"]),
        req("Add Multiple Expenses", "POST", f"{BASE}/api/expenses/add-multiple", ["api","expenses","add-multiple"],
            body=body_json([{"expenseName":"Test1","amount":10},{"expenseName":"Test2","amount":20}])),
        req("Add Multiple Tracked", "POST", f"{BASE}/api/expenses/add-multiple/tracked", ["api","expenses","add-multiple","tracked"],
            body=body_json([{"expenseName":"Test1","amount":10}])),
        req("Get Add Multiple Progress", "GET", f"{BASE}/api/expenses/add-multiple/progress/job-123", ["api","expenses","add-multiple","progress","job-123"]),
        req("Delete All Expenses", "DELETE", f"{BASE}/api/expenses/delete-all", ["api","expenses","delete-all"]),
        req("Get Expense By ID", "GET", f"{BASE}/api/expenses/expense/{{{{expenseId}}}}", ["api","expenses","expense","{{expenseId}}"]),
        req("Get Expense Detailed", "GET", f"{BASE}/api/expenses/expense/{{{{expenseId}}}}/detailed", ["api","expenses","expense","{{expenseId}}","detailed"]),
        req("Fetch Expenses By Date", "GET", f"{BASE}/api/expenses/fetch-expenses-by-date?from=2026-01-01&to=2026-03-13", ["api","expenses","fetch-expenses-by-date"],
            query=[q("from","2026-01-01"),q("to","2026-03-13")]),
        req("Fetch All Expenses", "GET", f"{BASE}/api/expenses/fetch-expenses?sort=desc", ["api","expenses","fetch-expenses"],
            query=[q("sort","desc")]),
        req("Fetch Expenses Paginated", "GET", f"{BASE}/api/expenses/fetch-expenses-paginated", ["api","expenses","fetch-expenses-paginated"],
            query=[q("sort","desc"),q("page","0"),q("size","100")]),
        req("Edit Expense", "PUT", f"{BASE}/api/expenses/edit-expense/{{{{expenseId}}}}", ["api","expenses","edit-expense","{{expenseId}}"],
            body=body_json({"expenseName":"Updated","amount":75.0})),
        req("Edit Multiple Expenses", "PUT", f"{BASE}/api/expenses/edit-multiple", ["api","expenses","edit-multiple"],
            body=body_json([{"id":1,"expenseName":"Updated","amount":75.0}])),
        req("Delete Expense", "DELETE", f"{BASE}/api/expenses/delete/{{{{expenseId}}}}", ["api","expenses","delete","{{expenseId}}"]),
        req("Delete Multiple Expenses", "DELETE", f"{BASE}/api/expenses/delete-multiple", ["api","expenses","delete-multiple"],
            body=body_json([1,2,3])),
        req("Save Expenses", "POST", f"{BASE}/api/expenses/save", ["api","expenses","save"],
            body=body_json([{"expenseName":"Test","amount":10}])),
        req("Save Single Expense", "POST", f"{BASE}/api/expenses/save-single", ["api","expenses","save-single"],
            body=body_json({"expenseName":"Test","amount":10})),
        req("Upload Expenses CSV", "POST", f"{BASE}/api/expenses/upload", ["api","expenses","upload"]),
        req("Upload Categories CSV", "POST", f"{BASE}/api/expenses/upload-categories", ["api","expenses","upload-categories"]),
        req("Fetch Expenses By IDs", "POST", f"{BASE}/api/expenses/expenses/fetch-by-ids", ["api","expenses","expenses","fetch-by-ids"],
            body=body_json([1,2,3])),
        req("Delete And Send", "POST", f"{BASE}/api/expenses/expenses/delete-and-send", ["api","expenses","expenses","delete-and-send"],
            body=body_json({"expenseIds":[1,2],"email":"test@example.com"})),
        req("Expenses Save (DTO)", "POST", f"{BASE}/api/expenses/expenses/save", ["api","expenses","expenses","save"],
            body=body_json([{"expenseName":"Test","amount":10}])),
    ]
    return folder("CRUD", items)

def expense_service_summaries():
    items = [
        req("Summary Expenses", "GET", f"{BASE}/api/expenses/summary-expenses", ["api","expenses","summary-expenses"]),
        req("Monthly Summary", "GET", f"{BASE}/api/expenses/monthly-summary/2026/3", ["api","expenses","monthly-summary","2026","3"]),
        req("Yearly Summary", "GET", f"{BASE}/api/expenses/yearly-summary/2026", ["api","expenses","yearly-summary","2026"]),
        req("Between Dates Summary", "GET", f"{BASE}/api/expenses/between-dates", ["api","expenses","between-dates"],
            query=[q("startYear","2026"),q("startMonth","1"),q("endYear","2026"),q("endMonth","3")]),
        req("Monthly Insights", "GET", f"{BASE}/api/expenses/insights/monthly", ["api","expenses","insights","monthly"],
            query=[q("year","2026"),q("month","3")]),
        req("Cumulative", "GET", f"{BASE}/api/expenses/cumulative", ["api","expenses","cumulative"],
            query=[q("year","2026")]),
        req("By Name Over Time", "GET", f"{BASE}/api/expenses/name-over-time", ["api","expenses","name-over-time"],
            query=[q("year","2026"),q("limit","5")]),
        req("By Name", "GET", f"{BASE}/api/expenses/by-name", ["api","expenses","by-name"],
            query=[q("year","2026")]),
        req("Monthly Chart", "GET", f"{BASE}/api/expenses/monthly", ["api","expenses","monthly"],
            query=[q("year","2026")]),
        req("Trend", "GET", f"{BASE}/api/expenses/trend", ["api","expenses","trend"],
            query=[q("year","2026")]),
        req("Total By Category", "GET", f"{BASE}/api/expenses/total-by-category", ["api","expenses","total-by-category"]),
        req("Total By Date", "GET", f"{BASE}/api/expenses/total-by-date", ["api","expenses","total-by-date"]),
        req("Total Today", "GET", f"{BASE}/api/expenses/expenses/total-today", ["api","expenses","expenses","total-today"]),
        req("Total Current Month", "GET", f"{BASE}/api/expenses/expenses/total-current-month", ["api","expenses","expenses","total-current-month"]),
        req("Total By Month Year", "GET", f"{BASE}/api/expenses/expenses/total-by-month-year", ["api","expenses","expenses","total-by-month-year"],
            query=[q("month","3"),q("year","2026")]),
        req("Total By Date Range", "GET", f"{BASE}/api/expenses/expenses/total-by-date-range", ["api","expenses","expenses","total-by-date-range"],
            query=[q("startDate","2026-01-01"),q("endDate","2026-03-13")]),
        req("Current Month Top Expenses", "GET", f"{BASE}/api/expenses/current-month-top-expenses", ["api","expenses","current-month-top-expenses"],
            query=[q("topCount","3")]),
        req("Current Month Totals", "GET", f"{BASE}/api/expenses/current-month/totals", ["api","expenses","current-month","totals"]),
        req("Current Month Distribution", "GET", f"{BASE}/api/expenses/current-month/distribution", ["api","expenses","current-month","distribution"]),
        req("Cashflow", "GET", f"{BASE}/api/expenses/cashflow", ["api","expenses","cashflow"],
            query=[q("range","monthly"),q("offset","0")]),
        req("Range Offset", "GET", f"{BASE}/api/expenses/range/offset", ["api","expenses","range","offset"],
            query=[q("rangeType","monthly"),q("offset","0")]),
        req("Momentum Insight", "GET", f"{BASE}/api/expenses/momentum-insight", ["api","expenses","momentum-insight"]),
    ]
    return folder("Summaries & Analytics", items)

def expense_service_filters():
    items = [
        req("Search Expenses", "GET", f"{BASE}/api/expenses/search?expenseName=groceries", ["api","expenses","search"],
            query=[q("expenseName","groceries")]),
        req("Fuzzy Search", "GET", f"{BASE}/api/expenses/search/fuzzy?query=groc&limit=20", ["api","expenses","search","fuzzy"],
            query=[q("query","groc"),q("limit","20")]),
        req("Filter Expenses", "GET", f"{BASE}/api/expenses/filter", ["api","expenses","filter"],
            query=[q("expenseName","",True),q("startDate","2026-01-01",True),q("endDate","2026-03-13",True),q("type","LOSS",True),q("paymentMethod","CASH",True),q("minAmount","0",True),q("maxAmount","1000",True)]),
        req("Top N Expenses", "GET", f"{BASE}/api/expenses/top-n?n=5", ["api","expenses","top-n"],
            query=[q("n","5")]),
        req("Top Expense Names (GET)", "GET", f"{BASE}/api/expenses/top-expense-names?topN=5", ["api","expenses","top-expense-names"],
            query=[q("topN","5")]),
        req("Top Expense Names (POST)", "POST", f"{BASE}/api/expenses/top-expense-names", ["api","expenses","top-expense-names"],
            body=body_json({"topN":5,"startDate":"2026-01-01","endDate":"2026-03-13"})),
        req("Today's Expenses", "GET", f"{BASE}/api/expenses/today", ["api","expenses","today"]),
        req("Yesterday's Expenses", "GET", f"{BASE}/api/expenses/expenses/yesterday", ["api","expenses","expenses","yesterday"]),
        req("Current Month Expenses", "GET", f"{BASE}/api/expenses/current-month", ["api","expenses","current-month"]),
        req("Last Month Expenses", "GET", f"{BASE}/api/expenses/last-month", ["api","expenses","last-month"]),
        req("Current Week", "GET", f"{BASE}/api/expenses/expenses/current-week", ["api","expenses","expenses","current-week"]),
        req("Last Week", "GET", f"{BASE}/api/expenses/expenses/last-week", ["api","expenses","expenses","last-week"]),
        req("By Month", "GET", f"{BASE}/api/expenses/by-month", ["api","expenses","by-month"],
            query=[q("month","3"),q("year","2026")]),
        req("Particular Date", "GET", f"{BASE}/api/expenses/particular-date?date=2026-03-13", ["api","expenses","particular-date"],
            query=[q("date","2026-03-13")]),
        req("Particular Month", "GET", f"{BASE}/api/expenses/expenses/particular-month", ["api","expenses","expenses","particular-month"],
            query=[q("year","2026"),q("month","3")]),
        req("Before Date", "GET", f"{BASE}/api/expenses/before/Groceries/2026-03-13", ["api","expenses","before","Groceries","2026-03-13"]),
        req("By Amount", "GET", f"{BASE}/api/expenses/amount/50", ["api","expenses","amount","50"]),
        req("Amount Range", "GET", f"{BASE}/api/expenses/amount-range", ["api","expenses","amount-range"],
            query=[q("minAmount","10"),q("maxAmount","500")]),
        req("Total By Expense Name", "GET", f"{BASE}/api/expenses/total/Groceries", ["api","expenses","total","Groceries"]),
        req("Grouped By Date", "GET", f"{BASE}/api/expenses/groupedByDate?sortOrder=desc", ["api","expenses","groupedByDate"],
            query=[q("sortOrder","desc")]),
        req("Sorted Expenses", "GET", f"{BASE}/api/expenses/sorted", ["api","expenses","sorted"],
            query=[q("page","0"),q("size","10"),q("sortBy","date"),q("sortOrder","asc")]),
        req("Gain Expenses", "GET", f"{BASE}/api/expenses/gain", ["api","expenses","gain"]),
        req("Loss Expenses", "GET", f"{BASE}/api/expenses/loss", ["api","expenses","loss"]),
        req("Top Gains", "GET", f"{BASE}/api/expenses/top-gains", ["api","expenses","top-gains"]),
        req("Top Losses", "GET", f"{BASE}/api/expenses/top-losses", ["api","expenses","top-losses"]),
        req("Top Gains Unique", "GET", f"{BASE}/api/expenses/top-gains/unique?limit=10", ["api","expenses","top-gains","unique"],
            query=[q("limit","10")]),
        req("Top Losses Unique", "GET", f"{BASE}/api/expenses/top-losses/unique?limit=10", ["api","expenses","top-losses","unique"],
            query=[q("limit","10")]),
        req("Get Expense Comments", "GET", f"{BASE}/api/expenses/{{{{expenseId}}}}/comments", ["api","expenses","{{expenseId}}","comments"]),
        req("Remove Comment", "DELETE", f"{BASE}/api/expenses/{{{{expenseId}}}}/remove-comment", ["api","expenses","{{expenseId}}","remove-comment"]),
    ]
    return folder("Filters & Search", items)

def expense_service_payment():
    items = [
        req("Payment Methods List", "GET", f"{BASE}/api/expenses/payment-method", ["api","expenses","payment-method"]),
        req("Payment Method Summary", "GET", f"{BASE}/api/expenses/payment-method-summary", ["api","expenses","payment-method-summary"]),
        req("Top Payment Methods", "GET", f"{BASE}/api/expenses/top-payment-methods", ["api","expenses","top-payment-methods"]),
        req("By Payment Method", "GET", f"{BASE}/api/expenses/payment-method/CASH", ["api","expenses","payment-method","CASH"]),
        req("By Type And Payment", "GET", f"{BASE}/api/expenses/LOSS/CASH", ["api","expenses","LOSS","CASH"]),
        req("Payment Methods Chart", "GET", f"{BASE}/api/expenses/payment-methods", ["api","expenses","payment-methods"],
            query=[q("year","2026")]),
        req("Payment Methods Filtered", "GET", f"{BASE}/api/expenses/payment-methods/filtered", ["api","expenses","payment-methods","filtered"],
            query=[q("rangeType","monthly"),q("offset","0")]),
        req("Payment Wise Total Current Month", "GET", f"{BASE}/api/expenses/expenses/payment-wise-total-current-month", ["api","expenses","expenses","payment-wise-total-current-month"]),
        req("Payment Wise Total Last Month", "GET", f"{BASE}/api/expenses/expenses/payment-wise-total-last-month", ["api","expenses","expenses","payment-wise-total-last-month"]),
        req("Payment Wise Total From-To", "GET", f"{BASE}/api/expenses/expenses/payment-wise-total-from-to", ["api","expenses","expenses","payment-wise-total-from-to"],
            query=[q("startDate","2026-01-01"),q("endDate","2026-03-13")]),
        req("Payment Wise Total Month", "GET", f"{BASE}/api/expenses/expenses/payment-wise-total-month", ["api","expenses","expenses","payment-wise-total-month"],
            query=[q("month","3"),q("year","2026")]),
        req("Total By Expense Payment Method", "GET", f"{BASE}/api/expenses/expenses/total-by-expense-payment-method", ["api","expenses","expenses","total-by-expense-payment-method"],
            query=[q("month","3"),q("year","2026")]),
        req("Total By Expense Payment Method Range", "GET", f"{BASE}/api/expenses/expenses/total-by-expense-payment-method-range", ["api","expenses","expenses","total-by-expense-payment-method-range"],
            query=[q("startDate","2026-01-01"),q("endDate","2026-03-13")]),
        req("Total Expense Payment Method (All)", "GET", f"{BASE}/api/expenses/expenses/total-expense-payment-method", ["api","expenses","expenses","total-expense-payment-method"]),
    ]
    return folder("Payment Method Analytics", items)

def expense_service_category_budget():
    items = [
        req("By Category", "GET", f"{BASE}/api/expenses/by-category/{{{{categoryId}}}}", ["api","expenses","by-category","{{categoryId}}"]),
        req("All By Categories Detailed", "GET", f"{BASE}/api/expenses/all-by-categories/detailed", ["api","expenses","all-by-categories","detailed"]),
        req("All By Categories Filtered", "GET", f"{BASE}/api/expenses/all-by-categories/detailed/filtered", ["api","expenses","all-by-categories","detailed","filtered"],
            query=[q("rangeType","monthly"),q("offset","0")]),
        req("All By Payment Method Filtered", "GET", f"{BASE}/api/expenses/all-by-payment-method/detailed/filtered", ["api","expenses","all-by-payment-method","detailed","filtered"],
            query=[q("rangeType","monthly"),q("offset","0")]),
        req("Included In Budget", "GET", f"{BASE}/api/expenses/included-in-BudgetModel/2026-01-01/2026-03-31", ["api","expenses","included-in-BudgetModel","2026-01-01","2026-03-31"]),
        req("Included In Budgets (service)", "GET", f"{BASE}/api/expenses/included-in-budgets/2026-01-01/2026-03-31?userId={{{{userId}}}}", ["api","expenses","included-in-budgets","2026-01-01","2026-03-31"],
            query=[q("userId","{{userId}}")]),
        req("Get Expenses By IDs (service)", "POST", f"{BASE}/api/expenses/get-expenses-by-ids?userId={{{{userId}}}}", ["api","expenses","get-expenses-by-ids"],
            query=[q("userId","{{userId}}")], body=body_json([1,2,3])),
        req("Budget Expenses", "GET", f"{BASE}/api/expenses/{{{{budgetId}}}}/expenses", ["api","expenses","{{budgetId}}","expenses"]),
        req("Daily Spending", "GET", f"{BASE}/api/expenses/daily-spending", ["api","expenses","daily-spending"],
            query=[q("month","3"),q("year","2026")]),
    ]
    return folder("Category & Budget", items)

def expense_service_reports():
    items = [
        req("Generate Expense Report", "POST", f"{BASE}/api/expenses/{{{{expenseId}}}}/generate-report", ["api","expenses","{{expenseId}}","generate-report"]),
        req("Generate Excel Report", "GET", f"{BASE}/api/expenses/generate-excel-report", ["api","expenses","generate-excel-report"]),
        req("Current Month Excel", "GET", f"{BASE}/api/expenses/current-month/excel", ["api","expenses","current-month","excel"]),
        req("Reports History", "GET", f"{BASE}/api/expenses/reports/history", ["api","expenses","reports","history"]),
        req("Reports History By Status", "GET", f"{BASE}/api/expenses/reports/history/status/COMPLETED", ["api","expenses","reports","history","status","COMPLETED"]),
        req("Reports History Recent", "GET", f"{BASE}/api/expenses/reports/history/recent", ["api","expenses","reports","history","recent"]),
        req("Reports History Stats", "GET", f"{BASE}/api/expenses/reports/history/stats", ["api","expenses","reports","history","stats"]),
        req("Reports History Range", "GET", f"{BASE}/api/expenses/reports/history/range", ["api","expenses","reports","history","range"],
            query=[q("startDate","2026-01-01T00:00:00"),q("endDate","2026-03-13T23:59:59")]),
    ]
    return folder("Reports", items)

def expense_service_email():
    items = [
        req("Send Excel Report", "GET", f"{BASE}/api/expenses/send-excel-report?toEmail={{{{email}}}}", ["api","expenses","send-excel-report"],
            query=[q("toEmail","{{email}}")]),
        req("Send Monthly Report", "POST", f"{BASE}/api/expenses/send-monthly-report", ["api","expenses","send-monthly-report"],
            body=body_json({"email":"{{email}}","month":3,"year":2026})),
        req("Current Month Email", "GET", f"{BASE}/api/expenses/current-month/email?email={{{{email}}}}", ["api","expenses","current-month","email"],
            query=[q("email","{{email}}")]),
        req("Last Month Email", "GET", f"{BASE}/api/expenses/expenses/last-month/email?email={{{{email}}}}", ["api","expenses","expenses","last-month","email"],
            query=[q("email","{{email}}")]),
        req("By Month Email", "GET", f"{BASE}/api/expenses/by-month/email", ["api","expenses","by-month","email"],
            query=[q("month","3"),q("year","2026"),q("email","{{email}}")]),
        req("All Expenses Email", "GET", f"{BASE}/api/expenses/email/all?email={{{{email}}}}", ["api","expenses","email","all"],
            query=[q("email","{{email}}")]),
        req("By Type Payment Email", "GET", f"{BASE}/api/expenses/LOSS/CASH/email?email={{{{email}}}}", ["api","expenses","LOSS","CASH","email"],
            query=[q("email","{{email}}")]),
        req("By Date Range Email", "GET", f"{BASE}/api/expenses/fetch-expenses-by-date/email", ["api","expenses","fetch-expenses-by-date","email"],
            query=[q("from","2026-01-01"),q("to","2026-03-13"),q("email","{{email}}")]),
        req("Gain Email", "GET", f"{BASE}/api/expenses/expenses/gain/email?email={{{{email}}}}", ["api","expenses","expenses","gain","email"],
            query=[q("email","{{email}}")]),
        req("Loss Email", "GET", f"{BASE}/api/expenses/expenses/loss/email?email={{{{email}}}}", ["api","expenses","expenses","loss","email"],
            query=[q("email","{{email}}")]),
        req("Today Email", "GET", f"{BASE}/api/expenses/expenses/today/email?email={{{{email}}}}", ["api","expenses","expenses","today","email"],
            query=[q("email","{{email}}")]),
        req("By Payment Method Email", "GET", f"{BASE}/api/expenses/payment-method/CASH/email?email={{{{email}}}}", ["api","expenses","payment-method","CASH","email"],
            query=[q("email","{{email}}")]),
        req("Amount Range Email", "GET", f"{BASE}/api/expenses/expenses/amount-range/email", ["api","expenses","expenses","amount-range","email"],
            query=[q("minAmount","10"),q("maxAmount","500"),q("email","{{email}}")]),
        req("Search Email", "GET", f"{BASE}/api/expenses/expenses/search/email", ["api","expenses","expenses","search","email"],
            query=[q("expenseName","groceries"),q("email","{{email}}")]),
        req("Monthly Summary Email", "GET", f"{BASE}/api/expenses/monthly-summary/2026/3/email?email={{{{email}}}}", ["api","expenses","monthly-summary","2026","3","email"],
            query=[q("email","{{email}}")]),
        req("Payment Summary Email", "GET", f"{BASE}/api/expenses/payment-method-summary/email?email={{{{email}}}}", ["api","expenses","payment-method-summary","email"],
            query=[q("email","{{email}}")]),
        req("Yearly Summary Email", "GET", f"{BASE}/api/expenses/yearly-summary/email", ["api","expenses","yearly-summary","email"],
            query=[q("year","2026"),q("email","{{email}}")]),
        req("Between Dates Email", "GET", f"{BASE}/api/expenses/between-dates/email", ["api","expenses","between-dates","email"],
            query=[q("startYear","2026"),q("startMonth","1"),q("endYear","2026"),q("endMonth","3"),q("email","{{email}}")]),
        req("Yesterday Email", "GET", f"{BASE}/api/expenses/expenses/yesterday/email?email={{{{email}}}}", ["api","expenses","expenses","yesterday","email"],
            query=[q("email","{{email}}")]),
        req("Date Email", "GET", f"{BASE}/api/expenses/expenses/date/email", ["api","expenses","expenses","date","email"],
            query=[q("date","2026-03-13"),q("email","{{email}}")]),
        req("Last Week Email", "GET", f"{BASE}/api/expenses/expenses/last-week/email?email={{{{email}}}}", ["api","expenses","expenses","last-week","email"],
            query=[q("email","{{email}}")]),
    ]
    return folder("Email Reports", items)

def expense_service_utilities():
    items = [
        req("Dropdown Values", "GET", f"{BASE}/api/expenses/dropdown-values", ["api","expenses","dropdown-values"], auth=noauth()),
        req("Summary Types", "GET", f"{BASE}/api/expenses/expenses/summary-types", ["api","expenses","expenses","summary-types"], auth=noauth()),
        req("Daily Summary Types", "GET", f"{BASE}/api/expenses/expenses/daily-summary-types", ["api","expenses","expenses","daily-summary-types"], auth=noauth()),
        req("Expense Types", "GET", f"{BASE}/api/expenses/expenses/expenses-types", ["api","expenses","expenses","expenses-types"], auth=noauth()),
        req("Validate And Calculate", "POST", f"{BASE}/api/expenses/validate-and-calculate", ["api","expenses","validate-and-calculate"],
            body=body_json([{"expenseName":"Test","amount":10}])),
        req("Calculate Credit Due", "POST", f"{BASE}/api/expenses/calculate-credit-due", ["api","expenses","calculate-credit-due"],
            body=body_json([{"expenseName":"Test","amount":10}])),
        req("Find Top Expense Names", "POST", f"{BASE}/api/expenses/find-top-expense-names?topN=5", ["api","expenses","find-top-expense-names"],
            query=[q("topN","5")], body=body_json([{"expenseName":"Test","amount":10}])),
        req("Find Top Payment Method", "POST", f"{BASE}/api/expenses/payload/find-top-payment-method", ["api","expenses","payload","find-top-payment-method"],
            body=body_json([{"expenseName":"Test","amount":10,"paymentMethod":"CASH"}])),
        req("Payment Method Names", "POST", f"{BASE}/api/expenses/payload/payment-method-names", ["api","expenses","payload","payment-method-names"],
            body=body_json([{"expenseName":"Test","paymentMethod":"CASH"}])),
        req("Get Expense (service)", "GET", f"{BASE}/api/expenses/get-by-id?userId={{{{userId}}}}&expenseId={{{{expenseId}}}}", ["api","expenses","get-by-id"],
            query=[q("userId","{{userId}}"),q("expenseId","{{expenseId}}")]),
        req("Add With Bill Service", "POST", f"{BASE}/api/expenses/add-expense-with-bill-service?userId={{{{userId}}}}", ["api","expenses","add-expense-with-bill-service"],
            query=[q("userId","{{userId}}")], body=body_json({"expenseName":"Test","amount":10})),
        req("Update With Bill Service", "POST", f"{BASE}/api/expenses/update-expense-with-bill-service", ["api","expenses","update-expense-with-bill-service"],
            query=[q("expenseId","{{expenseId}}"),q("userId","{{userId}}")], body=body_json({"expenseName":"Updated","amount":20})),
        req("Delete With Bill Service", "DELETE", f"{BASE}/api/expenses/delete-expenses-with-bill-service", ["api","expenses","delete-expenses-with-bill-service"],
            query=[q("expenseIds","1,2"),q("userId","{{userId}}")]),
        req("Get All With Bill Service", "GET", f"{BASE}/api/expenses/get-all-expenses-with-bill-service?userId={{{{userId}}}}", ["api","expenses","get-all-expenses-with-bill-service"],
            query=[q("userId","{{userId}}")]),
        req("Get All Sort With Bill Service", "GET", f"{BASE}/api/expenses/get-all-expenses-sort-with-bill-service", ["api","expenses","get-all-expenses-sort-with-bill-service"],
            query=[q("userId","{{userId}}"),q("sort","desc")]),
    ]
    return folder("Utilities & Service-to-Service", items)

def expense_service_settings():
    return folder("10. User Settings", [
        req("Get Settings", "GET", f"{BASE}/api/settings", ["api","settings"]),
        req("Update Settings", "PUT", f"{BASE}/api/settings", ["api","settings"],
            body=body_json({"currency":"USD","language":"en"})),
        req("Reset Settings", "POST", f"{BASE}/api/settings/reset", ["api","settings","reset"]),
        req("Delete Settings", "DELETE", f"{BASE}/api/settings", ["api","settings"]),
        req("Settings Exist", "GET", f"{BASE}/api/settings/exists", ["api","settings","exists"]),
        req("Create Default Settings", "POST", f"{BASE}/api/settings/default", ["api","settings","default"]),
    ])

def expense_service_daily_summary():
    return folder("11. Daily Summary", [
        req("Monthly Daily Summary", "GET", f"{BASE}/daily-summary/monthly", ["daily-summary","monthly"],
            query=[q("year","2026"),q("month","3")]),
        req("Yearly Daily Summary", "GET", f"{BASE}/daily-summary/yearly", ["daily-summary","yearly"],
            query=[q("year","2026")]),
        req("Date Daily Summary", "GET", f"{BASE}/daily-summary/date?date=2026-03-13", ["daily-summary","date"],
            query=[q("date","2026-03-13")]),
        req("Monthly Daily Summary Email", "GET", f"{BASE}/daily-summary/monthly/email", ["daily-summary","monthly","email"],
            query=[q("year","2026"),q("month","3"),q("email","{{email}}")]),
        req("Yearly Daily Summary Email", "GET", f"{BASE}/daily-summary/yearly/email", ["daily-summary","yearly","email"],
            query=[q("year","2026"),q("email","{{email}}")]),
        req("Date Daily Summary Email", "GET", f"{BASE}/daily-summary/date/email/2026-03-13", ["daily-summary","date","email","2026-03-13"],
            query=[q("email","{{email}}")]),
    ])

def expense_service_bulk():
    return folder("12. Bulk Expense-Budget", [
        req("Bulk Expenses Budgets", "POST", f"{BASE}/api/bulk/expenses-budgets", ["api","bulk","expenses-budgets"],
            body=body_json({"expenses":[],"budgets":[]})),
        req("Bulk Expenses Budgets Tracked", "POST", f"{BASE}/api/bulk/expenses-budgets/tracked", ["api","bulk","expenses-budgets","tracked"],
            body=body_json({"expenses":[],"budgets":[]})),
        req("Bulk Progress", "GET", f"{BASE}/api/bulk/expenses-budgets/progress/job-123", ["api","bulk","expenses-budgets","progress","job-123"]),
        req("Bulk Recover", "POST", f"{BASE}/api/bulk/recover", ["api","bulk","recover"],
            body=body_json({"expenses":[],"budgets":[]})),
        req("Bulk Health", "GET", f"{BASE}/api/bulk/health", ["api","bulk","health"], auth=noauth()),
    ])

def expense_service_investment():
    return folder("13. Investment", [
        req("Calculate Investment", "POST", f"{BASE}/api/investment/calculate", ["api","investment","calculate"],
            body=body_json({"principal":10000,"rate":8.5,"years":10,"compoundingFrequency":"MONTHLY"})),
    ])

def expense_service_email_logs():
    return folder("14. Email Logs", [
        req("All Email Logs", "GET", f"{BASE}/email-logs", ["email-logs"]),
        req("Current Month Logs", "GET", f"{BASE}/email-logs/current-month", ["email-logs","current-month"]),
        req("Last Month Logs", "GET", f"{BASE}/email-logs/last-month", ["email-logs","last-month"]),
        req("Current Year Logs", "GET", f"{BASE}/email-logs/current-year", ["email-logs","current-year"]),
        req("Last Year Logs", "GET", f"{BASE}/email-logs/last-year", ["email-logs","last-year"]),
        req("Current Week Logs", "GET", f"{BASE}/email-logs/current-week", ["email-logs","current-week"]),
        req("Last Week Logs", "GET", f"{BASE}/email-logs/last-week", ["email-logs","last-week"]),
        req("Today Logs", "GET", f"{BASE}/email-logs/today", ["email-logs","today"]),
        req("By Year", "GET", f"{BASE}/email-logs/year/2026", ["email-logs","year","2026"]),
        req("By Month", "GET", f"{BASE}/email-logs/month/2026/3", ["email-logs","month","2026","3"]),
        req("By Day", "GET", f"{BASE}/email-logs/day/2026/3/13", ["email-logs","day","2026","3","13"]),
        req("Last N Minutes", "GET", f"{BASE}/email-logs/last-minutes/30", ["email-logs","last-minutes","30"]),
        req("Last N Hours", "GET", f"{BASE}/email-logs/last-hours/24", ["email-logs","last-hours","24"]),
        req("Last N Days", "GET", f"{BASE}/email-logs/last-days/7", ["email-logs","last-days","7"]),
        req("Last N Seconds", "GET", f"{BASE}/email-logs/last-seconds/3600", ["email-logs","last-seconds","3600"]),
        req("Last 5 Minutes", "GET", f"{BASE}/email-logs/last-5-minutes", ["email-logs","last-5-minutes"]),
    ])

def expense_service_kafka():
    return folder("15. Kafka", [
        req("Send Message", "POST", f"{BASE}/kafka/send", ["kafka","send"],
            body='"test message"'),
        req("Kafka Health", "GET", f"{BASE}/kafka/health", ["kafka","health"], auth=noauth()),
        req("Kafka Info", "GET", f"{BASE}/kafka/info", ["kafka","info"], auth=noauth()),
        req("Create Topic", "POST", f"{BASE}/kafka/topics/test-topic?partitions=1&replicationFactor=1", ["kafka","topics","test-topic"],
            query=[q("partitions","1"),q("replicationFactor","1")]),
        req("List Topics", "GET", f"{BASE}/kafka/topics", ["kafka","topics"]),
    ])


# ============================================================
# 3. FINANCIAL SERVICES
# ============================================================

def budget_service():
    return folder("16. Budgets", [
        req("Create Budget", "POST", f"{BASE}/api/budgets", ["api","budgets"],
            body=body_json({"name":"Monthly Budget","amount":5000,"startDate":"2026-03-01","endDate":"2026-03-31"}),
            events=id_extract_test("budgetId")),
        req("Edit Budget", "PUT", f"{BASE}/api/budgets/{{{{budgetId}}}}", ["api","budgets","{{budgetId}}"],
            body=body_json({"name":"Updated Budget","amount":6000})),
        req("Delete Budget", "DELETE", f"{BASE}/api/budgets/{{{{budgetId}}}}", ["api","budgets","{{budgetId}}"]),
        req("Delete All Budgets", "DELETE", f"{BASE}/api/budgets", ["api","budgets"]),
        req("Get Budget By ID", "GET", f"{BASE}/api/budgets/{{{{budgetId}}}}", ["api","budgets","{{budgetId}}"]),
        req("Get Budget (service)", "GET", f"{BASE}/api/budgets/get-by-id", ["api","budgets","get-by-id"],
            query=[q("budgetId","{{budgetId}}"),q("userId","{{userId}}")]),
        req("Save Budget (service)", "POST", f"{BASE}/api/budgets/save", ["api","budgets","save"],
            body=body_json({"name":"Test","amount":1000})),
        req("Get Budgets For User (service)", "GET", f"{BASE}/api/budgets/user?userId={{{{userId}}}}", ["api","budgets","user"],
            query=[q("userId","{{userId}}")]),
        req("Get All Budgets", "GET", f"{BASE}/api/budgets", ["api","budgets"]),
        req("Budget Expenses", "GET", f"{BASE}/api/budgets/{{{{budgetId}}}}/expenses", ["api","budgets","{{budgetId}}","expenses"]),
        req("Budget Report", "GET", f"{BASE}/api/budgets/report/{{{{budgetId}}}}", ["api","budgets","report","{{budgetId}}"]),
        req("All Budget Reports", "GET", f"{BASE}/api/budgets/reports", ["api","budgets","reports"]),
        req("Detailed Budget Report", "GET", f"{BASE}/api/budgets/detailed-report/{{{{budgetId}}}}", ["api","budgets","detailed-report","{{budgetId}}"],
            query=[q("rangeType","all"),q("offset","0"),q("flowType","all")]),
        req("Filter By Date", "GET", f"{BASE}/api/budgets/filter-by-date?date=2026-03-13", ["api","budgets","filter-by-date"],
            query=[q("date","2026-03-13")]),
        req("Budgets For Expense", "GET", f"{BASE}/api/budgets/expenses", ["api","budgets","expenses"],
            query=[q("expenseId","{{expenseId}}"),q("date","2026-03-13")]),
        req("All With Expenses Filtered", "GET", f"{BASE}/api/budgets/all-with-expenses/detailed/filtered", ["api","budgets","all-with-expenses","detailed","filtered"],
            query=[q("rangeType","monthly"),q("offset","0")]),
        req("Search Budgets", "GET", f"{BASE}/api/budgets/search?query=monthly&limit=20", ["api","budgets","search"],
            query=[q("query","monthly"),q("limit","20")]),
    ])

def category_service():
    return folder("17. Categories", [
        req("Create Category", "POST", f"{BASE}/api/categories", ["api","categories"],
            body=body_json({"name":"Food","type":"EXPENSE","icon":"restaurant","color":"#FF5722"}),
            events=id_extract_test("categoryId")),
        req("Get Category By ID", "GET", f"{BASE}/api/categories/{{{{categoryId}}}}", ["api","categories","{{categoryId}}"]),
        req("Get Category By Name", "GET", f"{BASE}/api/categories/name/Food", ["api","categories","name","Food"]),
        req("Get All Categories", "GET", f"{BASE}/api/categories", ["api","categories"]),
        req("Update Category", "PUT", f"{BASE}/api/categories/{{{{categoryId}}}}", ["api","categories","{{categoryId}}"],
            body=body_json({"name":"Updated Food","icon":"fastfood"})),
        req("Delete Category", "DELETE", f"{BASE}/api/categories/{{{{categoryId}}}}", ["api","categories","{{categoryId}}"]),
        req("Create Bulk Categories", "POST", f"{BASE}/api/categories/bulk", ["api","categories","bulk"],
            body=body_json([{"name":"Cat1","type":"EXPENSE"},{"name":"Cat2","type":"INCOME"}])),
        req("Update Bulk Categories", "PUT", f"{BASE}/api/categories/bulk", ["api","categories","bulk"],
            body=body_json([{"id":1,"name":"Updated1"},{"id":2,"name":"Updated2"}])),
        req("Delete Bulk Categories", "DELETE", f"{BASE}/api/categories/bulk", ["api","categories","bulk"],
            body=body_json([1,2,3])),
        req("Delete All Global Categories", "DELETE", f"{BASE}/api/categories/all/global?global=true", ["api","categories","all","global"],
            query=[q("global","true")]),
        req("Delete All Categories", "DELETE", f"{BASE}/api/categories", ["api","categories"]),
        req("Admin Update Global Category", "PATCH", f"{BASE}/api/categories/admin/global/{{{{categoryId}}}}", ["api","categories","admin","global","{{categoryId}}"],
            body=body_json({"name":"Updated Global"})),
        req("Uncategorized Expenses", "GET", f"{BASE}/api/categories/uncategorized", ["api","categories","uncategorized"]),
        req("Filtered Expenses With Category", "GET", f"{BASE}/api/categories/{{{{categoryId}}}}/filtered-expenses", ["api","categories","{{categoryId}}","filtered-expenses"]),
        req("Expenses By Category", "GET", f"{BASE}/api/categories/{{{{categoryId}}}}/expenses", ["api","categories","{{categoryId}}","expenses"],
            query=[q("page","0"),q("size","1000"),q("sortBy","date"),q("sortDir","desc")]),
        req("Search Categories", "GET", f"{BASE}/api/categories/search?query=food&limit=20", ["api","categories","search"],
            query=[q("query","food"),q("limit","20")]),
        req("Get By ID (service)", "GET", f"{BASE}/api/categories/get-by-id-with-service", ["api","categories","get-by-id-with-service"],
            query=[q("categoryId","{{categoryId}}"),q("userId","{{userId}}")]),
        req("Get By Name (service)", "GET", f"{BASE}/api/categories/get-by-name-with-service", ["api","categories","get-by-name-with-service"],
            query=[q("categoryName","Food"),q("userId","{{userId}}")]),
        req("Create (service)", "POST", f"{BASE}/api/categories/create-category-with-service?userId={{{{userId}}}}", ["api","categories","create-category-with-service"],
            query=[q("userId","{{userId}}")], body=body_json({"name":"Test"})),
        req("Save (service)", "POST", f"{BASE}/api/categories/save", ["api","categories","save"],
            body=body_json({"name":"Test"})),
        req("Get All For User (service)", "GET", f"{BASE}/api/categories/get-all-for-users?userId={{{{userId}}}}", ["api","categories","get-all-for-users"],
            query=[q("userId","{{userId}}")]),
    ])

def bill_service():
    return folder("18. Bills", [
        req("Create Bill", "POST", f"{BASE}/api/bills", ["api","bills"],
            body=body_json({"billName":"Electricity","amount":120,"billDate":"2026-03-13","items":[{"name":"Unit charges","amount":100}]}),
            events=id_extract_test("billId")),
        req("Add Multiple Bills", "POST", f"{BASE}/api/bills/add-multiple", ["api","bills","add-multiple"],
            body=body_json([{"billName":"Bill1","amount":50},{"billName":"Bill2","amount":75}])),
        req("Add Multiple Tracked", "POST", f"{BASE}/api/bills/add-multiple/tracked", ["api","bills","add-multiple","tracked"],
            body=body_json([{"billName":"Bill1","amount":50}])),
        req("Add Multiple Progress", "GET", f"{BASE}/api/bills/add-multiple/progress/job-123", ["api","bills","add-multiple","progress","job-123"]),
        req("Get Bill By ID", "GET", f"{BASE}/api/bills/{{{{billId}}}}", ["api","bills","{{billId}}"]),
        req("Update Bill", "PUT", f"{BASE}/api/bills/{{{{billId}}}}", ["api","bills","{{billId}}"],
            body=body_json({"billName":"Updated Bill","amount":150})),
        req("Delete Bill", "DELETE", f"{BASE}/api/bills/{{{{billId}}}}", ["api","bills","{{billId}}"]),
        req("Delete All Bills", "DELETE", f"{BASE}/api/bills", ["api","bills"]),
        req("Get Bill By Expense", "GET", f"{BASE}/api/bills/expenses/{{{{expenseId}}}}", ["api","bills","expenses","{{expenseId}}"]),
        req("Get All Bills", "GET", f"{BASE}/api/bills", ["api","bills"],
            query=[q("month","3",True),q("year","2026",True),q("range","monthly",True)]),
        req("Get All Unique Items", "GET", f"{BASE}/api/bills/items", ["api","bills","items"]),
        req("Export Excel", "GET", f"{BASE}/api/bills/export/excel", ["api","bills","export","excel"]),
        req("Import Excel", "POST", f"{BASE}/api/bills/import/excel", ["api","bills","import","excel"]),
        req("Import And Save Excel", "POST", f"{BASE}/api/bills/import/excel/save", ["api","bills","import","excel","save"],
            query=[q("skipDuplicates","false")]),
        req("Scan Receipt", "POST", f"{BASE}/api/bills/scan-receipt", ["api","bills","scan-receipt"]),
        req("Scan Multiple Receipts", "POST", f"{BASE}/api/bills/scan-receipt/multiple", ["api","bills","scan-receipt","multiple"]),
        req("OCR Status", "GET", f"{BASE}/api/bills/ocr/status", ["api","bills","ocr","status"]),
        req("Search Bills", "GET", f"{BASE}/api/bills/search?query=electricity&limit=20", ["api","bills","search"],
            query=[q("query","electricity"),q("limit","20")]),
    ])

def payment_service():
    return folder("19. Payment Methods", [
        req("Get Payment Method By ID", "GET", f"{BASE}/api/payment-methods/{{{{paymentMethodId}}}}", ["api","payment-methods","{{paymentMethodId}}"]),
        req("Get All Payment Methods", "GET", f"{BASE}/api/payment-methods", ["api","payment-methods"]),
        req("Get All (service)", "GET", f"{BASE}/api/payment-methods/get-all-payment-methods?userId={{{{userId}}}}", ["api","payment-methods","get-all-payment-methods"],
            query=[q("userId","{{userId}}")]),
        req("Get By Name", "GET", f"{BASE}/api/payment-methods/name?name=CASH", ["api","payment-methods","name"],
            query=[q("name","CASH")]),
        req("Get By Name And Type", "GET", f"{BASE}/api/payment-methods/name-and-type", ["api","payment-methods","name-and-type"],
            query=[q("userId","{{userId}}"),q("name","CASH"),q("type","DEBIT")]),
        req("Save (service)", "POST", f"{BASE}/api/payment-methods/save", ["api","payment-methods","save"],
            body=body_json({"name":"CASH","type":"CASH"})),
        req("Get By Name (service)", "GET", f"{BASE}/api/payment-methods/names", ["api","payment-methods","names"],
            query=[q("userId","{{userId}}"),q("name","CASH")]),
        req("Create Payment Method", "POST", f"{BASE}/api/payment-methods", ["api","payment-methods"],
            body=body_json({"name":"Credit Card","type":"CREDIT","bankName":"HDFC"}),
            events=id_extract_test("paymentMethodId")),
        req("Update Payment Method", "PUT", f"{BASE}/api/payment-methods/{{{{paymentMethodId}}}}", ["api","payment-methods","{{paymentMethodId}}"],
            body=body_json({"name":"Updated Card","type":"CREDIT"})),
        req("Delete Payment Method", "DELETE", f"{BASE}/api/payment-methods/{{{{paymentMethodId}}}}", ["api","payment-methods","{{paymentMethodId}}"]),
        req("Delete All Payment Methods", "DELETE", f"{BASE}/api/payment-methods/all", ["api","payment-methods","all"]),
        req("Unused Payment Methods", "GET", f"{BASE}/api/payment-methods/unused", ["api","payment-methods","unused"]),
        req("Search Payment Methods", "GET", f"{BASE}/api/payment-methods/search?query=cash&limit=20", ["api","payment-methods","search"],
            query=[q("query","cash"),q("limit","20")]),
    ])


# ============================================================
# 4. SOCIAL SERVICES
# ============================================================

def friendship_service():
    return folder("20. Friendships", [
        req("Send Friend Request", "POST", f"{BASE}/api/friendships/request?recipientId=2", ["api","friendships","request"],
            query=[q("recipientId","2")]),
        req("Respond To Request", "PUT", f"{BASE}/api/friendships/{{{{friendshipId}}}}/respond?accept=true", ["api","friendships","{{friendshipId}}","respond"],
            query=[q("accept","true")]),
        req("Get Friendship By ID", "GET", f"{BASE}/api/friendships/{{{{friendshipId}}}}", ["api","friendships","{{friendshipId}}"]),
        req("Set Access Level", "PUT", f"{BASE}/api/friendships/{{{{friendshipId}}}}/access?accessLevel=VIEW_ONLY", ["api","friendships","{{friendshipId}}","access"],
            query=[q("accessLevel","VIEW_ONLY")]),
        req("Get User Friendships", "GET", f"{BASE}/api/friendships/friends", ["api","friendships","friends"]),
        req("Are Friends", "GET", f"{BASE}/api/friendships/are-friends/1/2", ["api","friendships","are-friends","1","2"]),
        req("Get Friend IDs (service)", "GET", f"{BASE}/api/friendships/friend-ids?userId={{{{userId}}}}", ["api","friendships","friend-ids"],
            query=[q("userId","{{userId}}")]),
        req("Pending Requests", "GET", f"{BASE}/api/friendships/pending", ["api","friendships","pending"]),
        req("Incoming Requests", "GET", f"{BASE}/api/friendships/pending/incoming", ["api","friendships","pending","incoming"]),
        req("Outgoing Requests", "GET", f"{BASE}/api/friendships/pending/outgoing", ["api","friendships","pending","outgoing"]),
        req("Cancel Friend Request", "DELETE", f"{BASE}/api/friendships/request/{{{{friendshipId}}}}/cancel", ["api","friendships","request","{{friendshipId}}","cancel"]),
        req("Remove Friendship", "DELETE", f"{BASE}/api/friendships/{{{{friendshipId}}}}", ["api","friendships","{{friendshipId}}"]),
        req("Block User", "POST", f"{BASE}/api/friendships/block/2", ["api","friendships","block","2"]),
        req("Unblock User", "POST", f"{BASE}/api/friendships/unblock/2", ["api","friendships","unblock","2"]),
        req("Blocked Users", "GET", f"{BASE}/api/friendships/blocked", ["api","friendships","blocked"]),
        req("Friendship Stats", "GET", f"{BASE}/api/friendships/stats", ["api","friendships","stats"]),
        req("Check Friendship Status", "GET", f"{BASE}/api/friendships/check/2", ["api","friendships","check","2"]),
        req("Friend Suggestions", "GET", f"{BASE}/api/friendships/suggestions?limit=10", ["api","friendships","suggestions"],
            query=[q("limit","10")]),
        req("Mutual Friends", "GET", f"{BASE}/api/friendships/mutual/2", ["api","friendships","mutual","2"]),
        req("Search Friends", "GET", f"{BASE}/api/friendships/search?query=john", ["api","friendships","search"],
            query=[q("query","john")]),
        req("Check Expense Access", "GET", f"{BASE}/api/friendships/access-check/2", ["api","friendships","access-check","2"]),
        req("Shared With Me", "GET", f"{BASE}/api/friendships/shared-with-me", ["api","friendships","shared-with-me"]),
        req("I Shared With", "GET", f"{BASE}/api/friendships/i-shared-with", ["api","friendships","i-shared-with"]),
        req("Quick Share", "PUT", f"{BASE}/api/friendships/quick-share/2?accessLevel=VIEW_ONLY", ["api","friendships","quick-share","2"],
            query=[q("accessLevel","VIEW_ONLY")]),
        req("Expense Sharing Summary", "GET", f"{BASE}/api/friendships/expense-sharing-summary", ["api","friendships","expense-sharing-summary"]),
        req("Batch Share", "POST", f"{BASE}/api/friendships/batch-share", ["api","friendships","batch-share"],
            body=body_json([{"userId":2,"accessLevel":"VIEW_ONLY"}])),
        req("Recommended To Share", "GET", f"{BASE}/api/friendships/recommended-to-share", ["api","friendships","recommended-to-share"]),
        req("Detailed Friends", "GET", f"{BASE}/api/friendships/friends/detailed", ["api","friendships","friends","detailed"]),
        req("Friendship Details", "GET", f"{BASE}/api/friendships/details?friendId=2", ["api","friendships","details"],
            query=[q("friendId","2")]),
        req("Can Access Expenses (service)", "GET", f"{BASE}/api/friendships/can-access-expenses", ["api","friendships","can-access-expenses"],
            query=[q("targetUserId","2"),q("requesterId","1")]),
        req("Can Modify Expenses (service)", "GET", f"{BASE}/api/friendships/can-modify-expenses", ["api","friendships","can-modify-expenses"],
            query=[q("targetUserId","2"),q("requesterId","1")]),
        req("Get Access Level (service)", "GET", f"{BASE}/api/friendships/get-access-level", ["api","friendships","get-access-level"],
            query=[q("userId","1"),q("viewerId","2")]),
        req("Friendship Report", "GET", f"{BASE}/api/friendships/report", ["api","friendships","report"],
            query=[q("fromDate","2026-01-01T00:00:00"),q("toDate","2026-03-13T23:59:59"),q("status","ACCEPTED"),q("accessLevel","VIEW_ONLY"),q("sortBy","createdAt"),q("sortDirection","desc"),q("page","0"),q("size","20")]),
    ])

def group_service():
    items = [
        req("Create Group", "POST", f"{BASE}/api/groups", ["api","groups"],
            body=body_json({"name":"Family","description":"Family expense group"}),
            events=id_extract_test("groupId")),
        req("Get Group By ID", "GET", f"{BASE}/api/groups/{{{{groupId}}}}", ["api","groups","{{groupId}}"]),
        req("Get Group (service)", "GET", f"{BASE}/api/groups/get-group-by-id?id={{{{groupId}}}}&userId={{{{userId}}}}", ["api","groups","get-group-by-id"],
            query=[q("id","{{groupId}}"),q("userId","{{userId}}")]),
        req("Get All Groups", "GET", f"{BASE}/api/groups", ["api","groups"]),
        req("Groups Created By User", "GET", f"{BASE}/api/groups/created", ["api","groups","created"]),
        req("Groups As Member", "GET", f"{BASE}/api/groups/member", ["api","groups","member"]),
        req("Update Group", "PUT", f"{BASE}/api/groups/{{{{groupId}}}}", ["api","groups","{{groupId}}"],
            body=body_json({"name":"Updated Group","description":"Updated"})),
        req("Delete Group", "DELETE", f"{BASE}/api/groups/{{{{groupId}}}}", ["api","groups","{{groupId}}"]),
        req("Add Member", "POST", f"{BASE}/api/groups/{{{{groupId}}}}/members/2", ["api","groups","{{groupId}}","members","2"]),
        req("Add Member With Role", "POST", f"{BASE}/api/groups/{{{{groupId}}}}/members/2/role", ["api","groups","{{groupId}}","members","2","role"],
            body=body_json({"role":"MEMBER"})),
        req("Remove Member", "DELETE", f"{BASE}/api/groups/{{{{groupId}}}}/members/2", ["api","groups","{{groupId}}","members","2"]),
        req("Change Member Role", "PUT", f"{BASE}/api/groups/{{{{groupId}}}}/members/2/role", ["api","groups","{{groupId}}","members","2","role"],
            body=body_json({"role":"ADMIN"})),
        req("Get Members", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/members", ["api","groups","{{groupId}}","members"]),
        req("Get User Role", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/role", ["api","groups","{{groupId}}","role"]),
        req("Get Permissions", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/permissions", ["api","groups","{{groupId}}","permissions"]),
        req("Check Permission", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/check-permission/EDIT", ["api","groups","{{groupId}}","check-permission","EDIT"]),
        req("Is Member", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/is-member", ["api","groups","{{groupId}}","is-member"]),
        req("Is Owner", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/is-owner", ["api","groups","{{groupId}}","is-owner"]),
        req("Bulk Add Members", "POST", f"{BASE}/api/groups/{{{{groupId}}}}/members/bulk-add", ["api","groups","{{groupId}}","members","bulk-add"],
            body=body_json([{"userId":2,"role":"MEMBER"},{"userId":3,"role":"MEMBER"}])),
        req("Bulk Remove Members", "DELETE", f"{BASE}/api/groups/{{{{groupId}}}}/members/bulk-remove", ["api","groups","{{groupId}}","members","bulk-remove"],
            body=body_json([2,3])),
        req("Available Roles", "GET", f"{BASE}/api/groups/roles", ["api","groups","roles"], auth=noauth()),
        req("Group Stats", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/stats", ["api","groups","{{groupId}}","stats"]),
        req("Group Activity", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/activity?page=0&size=20", ["api","groups","{{groupId}}","activity"],
            query=[q("page","0"),q("size","20")]),
        req("Search Groups", "GET", f"{BASE}/api/groups/search?query=family&page=0&size=10", ["api","groups","search"],
            query=[q("query","family"),q("page","0"),q("size","10")]),
        req("Invite User", "POST", f"{BASE}/api/groups/{{{{groupId}}}}/invite", ["api","groups","{{groupId}}","invite"],
            body=body_json({"userId":2,"message":"Join my group"})),
        req("Pending Invitations", "GET", f"{BASE}/api/groups/invitations/pending", ["api","groups","invitations","pending"]),
        req("Sent Invitations", "GET", f"{BASE}/api/groups/invitations/sent", ["api","groups","invitations","sent"]),
        req("Respond To Invitation", "PUT", f"{BASE}/api/groups/invitations/1/respond?accept=true", ["api","groups","invitations","1","respond"],
            query=[q("accept","true")]),
        req("Members By Role", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/members/by-role/ADMIN", ["api","groups","{{groupId}}","members","by-role","ADMIN"]),
        req("Recent Members", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/members/recent?limit=5", ["api","groups","{{groupId}}","members","recent"],
            query=[q("limit","5")]),
        req("Leave Group", "POST", f"{BASE}/api/groups/{{{{groupId}}}}/leave", ["api","groups","{{groupId}}","leave"]),
        req("Cancel Invitation (DELETE)", "DELETE", f"{BASE}/api/groups/invitations/1/cancel", ["api","groups","invitations","1","cancel"]),
        req("Cancel Invitation (PUT)", "PUT", f"{BASE}/api/groups/invitations/1/cancel", ["api","groups","invitations","1","cancel"]),
        req("Update Group Settings", "PUT", f"{BASE}/api/groups/{{{{groupId}}}}/settings", ["api","groups","{{groupId}}","settings"],
            body=body_json({"allowMemberInvites":True})),
        req("Get Group Settings", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/settings", ["api","groups","{{groupId}}","settings"]),
        req("Duplicate Group", "POST", f"{BASE}/api/groups/{{{{groupId}}}}/duplicate", ["api","groups","{{groupId}}","duplicate"],
            body=body_json({"newName":"Copy of Group","copyMembers":True})),
        req("Archive Group", "PUT", f"{BASE}/api/groups/{{{{groupId}}}}/archive", ["api","groups","{{groupId}}","archive"]),
        req("Restore Group", "PUT", f"{BASE}/api/groups/{{{{groupId}}}}/restore", ["api","groups","{{groupId}}","restore"]),
        req("Archived Groups", "GET", f"{BASE}/api/groups/archived", ["api","groups","archived"]),
        req("Export Group", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/export?format=json", ["api","groups","{{groupId}}","export"],
            query=[q("format","json")]),
        req("Group Recommendations", "GET", f"{BASE}/api/groups/recommendations?limit=5", ["api","groups","recommendations"],
            query=[q("limit","5")]),
        req("Merge Groups", "POST", f"{BASE}/api/groups/1/merge/2", ["api","groups","1","merge","2"],
            body=body_json({"keepMembers":True})),
        req("Friends Not In Group", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/friends-not-in-group", ["api","groups","{{groupId}}","friends-not-in-group"]),
        req("Sent Invitations By Group", "GET", f"{BASE}/api/groups/{{{{groupId}}}}/invitations/sent", ["api","groups","{{groupId}}","invitations","sent"]),
    ]
    return folder("21. Groups", items)

def friend_activity_service():
    return folder("22. Friend Activities", [
        req("Get Activities", "GET", f"{BASE}/api/activities", ["api","activities"]),
        req("Get Activities Paged", "GET", f"{BASE}/api/activities/paged?page=0&size=20", ["api","activities","paged"],
            query=[q("page","0"),q("size","20")]),
        req("Unread Activities", "GET", f"{BASE}/api/activities/unread", ["api","activities","unread"]),
        req("Unread Count", "GET", f"{BASE}/api/activities/unread/count", ["api","activities","unread","count"]),
        req("Activities By Service", "GET", f"{BASE}/api/activities/service/EXPENSE", ["api","activities","service","EXPENSE"]),
        req("Activities By Friend", "GET", f"{BASE}/api/activities/friend/2", ["api","activities","friend","2"]),
        req("Recent Activities", "GET", f"{BASE}/api/activities/recent?days=7", ["api","activities","recent"],
            query=[q("days","7")]),
        req("Mark As Read", "PUT", f"{BASE}/api/activities/1/read", ["api","activities","1","read"]),
        req("Mark All As Read", "PUT", f"{BASE}/api/activities/read-all", ["api","activities","read-all"]),
        req("Activity Summary", "GET", f"{BASE}/api/activities/summary", ["api","activities","summary"]),
    ])

def share_service():
    return folder("23. Shares", [
        req("Create Share", "POST", f"{BASE}/api/shares", ["api","shares"],
            body=body_json({"type":"EXPENSE","dataIds":[1,2,3],"expiresInHours":72})),
        req("Access Share", "GET", f"{BASE}/api/shares/TOKEN_HERE", ["api","shares","TOKEN_HERE"]),
        req("Access Share Paginated", "GET", f"{BASE}/api/shares/TOKEN_HERE/paginated", ["api","shares","TOKEN_HERE","paginated"],
            query=[q("type","ALL"),q("page","0"),q("size","50")]),
        req("Validate Share", "GET", f"{BASE}/api/shares/TOKEN_HERE/validate", ["api","shares","TOKEN_HERE","validate"], auth=noauth()),
        req("Revoke Share", "DELETE", f"{BASE}/api/shares/TOKEN_HERE", ["api","shares","TOKEN_HERE"]),
        req("My Shares", "GET", f"{BASE}/api/shares/my-shares?activeOnly=false", ["api","shares","my-shares"],
            query=[q("activeOnly","false")]),
        req("Shared With Me", "GET", f"{BASE}/api/shares/shared-with-me", ["api","shares","shared-with-me"]),
        req("Public Shares", "GET", f"{BASE}/api/shares/public", ["api","shares","public"]),
        req("Toggle Save Share", "POST", f"{BASE}/api/shares/TOKEN_HERE/toggle-save", ["api","shares","TOKEN_HERE","toggle-save"]),
        req("Set Public", "PUT", f"{BASE}/api/shares/TOKEN_HERE/public?isPublic=true", ["api","shares","TOKEN_HERE","public"],
            query=[q("isPublic","true")]),
        req("Share Stats", "GET", f"{BASE}/api/shares/stats", ["api","shares","stats"]),
        req("Regenerate QR", "POST", f"{BASE}/api/shares/TOKEN_HERE/regenerate-qr?size=300", ["api","shares","TOKEN_HERE","regenerate-qr"],
            query=[q("size","300")]),
        req("Get QR", "GET", f"{BASE}/api/shares/TOKEN_HERE/qr?size=300", ["api","shares","TOKEN_HERE","qr"],
            query=[q("size","300")]),
        req("Share With Friend", "POST", f"{BASE}/api/shares/TOKEN_HERE/share-with-friend", ["api","shares","TOKEN_HERE","share-with-friend"],
            body=body_json({"friendId":2})),
        req("Get Added Items", "GET", f"{BASE}/api/shares/TOKEN_HERE/added-items", ["api","shares","TOKEN_HERE","added-items"]),
        req("Track Added Item", "POST", f"{BASE}/api/shares/TOKEN_HERE/added-items", ["api","shares","TOKEN_HERE","added-items"],
            body=body_json({"externalRef":"exp-1","type":"EXPENSE"})),
        req("Track Bulk Items", "POST", f"{BASE}/api/shares/TOKEN_HERE/added-items/bulk", ["api","shares","TOKEN_HERE","added-items","bulk"],
            body=body_json({"items":[{"externalRef":"exp-1","type":"EXPENSE"}]})),
        req("Is Item Added", "GET", f"{BASE}/api/shares/TOKEN_HERE/added-items/exp-1", ["api","shares","TOKEN_HERE","added-items","exp-1"]),
        req("Untrack Item", "DELETE", f"{BASE}/api/shares/TOKEN_HERE/added-items/exp-1", ["api","shares","TOKEN_HERE","added-items","exp-1"]),
    ])


# ============================================================
# 5. COMMUNICATION SERVICES
# ============================================================

def notification_service():
    return folder("24. Notifications", [
        req("Get All Notifications", "GET", f"{BASE}/api/notifications?page=0&size=20", ["api","notifications"],
            query=[q("page","0"),q("size","20")]),
        req("Unread Notifications", "GET", f"{BASE}/api/notifications/unread", ["api","notifications","unread"]),
        req("Unread Count", "GET", f"{BASE}/api/notifications/count/unread", ["api","notifications","count","unread"]),
        req("Mark As Read", "PUT", f"{BASE}/api/notifications/{{{{notificationId}}}}/read", ["api","notifications","{{notificationId}}","read"]),
        req("Mark All As Read", "PUT", f"{BASE}/api/notifications/read-all", ["api","notifications","read-all"]),
        req("Delete Notification", "DELETE", f"{BASE}/api/notifications/{{{{notificationId}}}}", ["api","notifications","{{notificationId}}"]),
        req("Get Preferences", "GET", f"{BASE}/api/notifications/preferences", ["api","notifications","preferences"]),
        req("Update Preferences", "PUT", f"{BASE}/api/notifications/preferences", ["api","notifications","preferences"],
            body=body_json({"emailEnabled":True,"pushEnabled":True})),
        req("Send Test Notification", "POST", f"{BASE}/api/notifications/test", ["api","notifications","test"],
            body=body_json({"title":"Test","message":"Hello"})),
        req("Notification History", "GET", f"{BASE}/api/notifications/history?limit=50", ["api","notifications","history"],
            query=[q("limit","50")]),
        req("Cleanup Old", "DELETE", f"{BASE}/api/notifications/cleanup?daysOld=30", ["api","notifications","cleanup"],
            query=[q("daysOld","30")]),
        req("Delete All", "DELETE", f"{BASE}/api/notifications/all", ["api","notifications","all"]),
        req("Filtered Notifications", "GET", f"{BASE}/api/notifications/filter", ["api","notifications","filter"],
            query=[q("isRead","false",True),q("limit","20"),q("offset","0")]),
    ])

def notification_preferences_service():
    return folder("25. Notification Preferences", [
        req("Get Preferences", "GET", f"{BASE}/api/notification-preferences", ["api","notification-preferences"]),
        req("Update Preferences", "PUT", f"{BASE}/api/notification-preferences", ["api","notification-preferences"],
            body=body_json({"emailEnabled":True,"pushEnabled":True,"smsEnabled":False})),
        req("Reset To Defaults", "POST", f"{BASE}/api/notification-preferences/reset", ["api","notification-preferences","reset"]),
        req("Delete Preferences", "DELETE", f"{BASE}/api/notification-preferences", ["api","notification-preferences"]),
        req("Preferences Exist", "GET", f"{BASE}/api/notification-preferences/exists", ["api","notification-preferences","exists"]),
        req("Create Defaults", "POST", f"{BASE}/api/notification-preferences/default", ["api","notification-preferences","default"]),
    ])

def chat_service():
    items = [
        req("Send One-to-One Chat", "POST", f"{BASE}/api/chats/one-to-one", ["api","chats","one-to-one"],
            body=body_json({"recipientId":2,"content":"Hello!"})),
        req("Send Group Chat", "POST", f"{BASE}/api/chats/group", ["api","chats","group"],
            body=body_json({"groupId":1,"content":"Hello group!"})),
        req("Get Chats For User", "GET", f"{BASE}/api/chats/user", ["api","chats","user"]),
        req("Get Chats For Group", "GET", f"{BASE}/api/chats/group/{{{{groupId}}}}", ["api","chats","group","{{groupId}}"]),
        req("Get My Sent Chats", "GET", f"{BASE}/api/chats", ["api","chats"]),
        req("Chats Between Users", "GET", f"{BASE}/api/chats/between?userId2=2", ["api","chats","between"],
            query=[q("userId2","2")]),
        req("Search User Chats", "GET", f"{BASE}/api/chats/user/search?keyword=hello", ["api","chats","user","search"],
            query=[q("keyword","hello")]),
        req("Search Group Chats", "GET", f"{BASE}/api/chats/group/{{{{groupId}}}}/search?keyword=hello", ["api","chats","group","{{groupId}}","search"],
            query=[q("keyword","hello")]),
        req("Mark Chat As Read", "PUT", f"{BASE}/api/chats/{{{{chatId}}}}/read", ["api","chats","{{chatId}}","read"]),
        req("Mark Conversation Read", "POST", f"{BASE}/api/chats/mark-read", ["api","chats","mark-read"],
            body=body_json({"conversationType":"ONE_TO_ONE","conversationId":2})),
        req("Unread User Chats", "GET", f"{BASE}/api/chats/user/unread", ["api","chats","user","unread"]),
        req("Unread Group Chats", "GET", f"{BASE}/api/chats/group/{{{{groupId}}}}/unread", ["api","chats","group","{{groupId}}","unread"]),
        req("Delete Bulk Chats", "DELETE", f"{BASE}/api/chats/bulk", ["api","chats","bulk"],
            body=body_json({"chatIds":[1,2,3]})),
        req("Delete Chat", "DELETE", f"{BASE}/api/chats/{{{{chatId}}}}", ["api","chats","{{chatId}}"]),
        req("Edit Message", "PUT", f"{BASE}/api/chats/{{{{chatId}}}}/edit", ["api","chats","{{chatId}}","edit"],
            body=body_json({"content":"Edited message"})),
        req("Reply To Message", "POST", f"{BASE}/api/chats/{{{{chatId}}}}/reply", ["api","chats","{{chatId}}","reply"],
            body=body_json({"content":"Reply text"})),
        req("Forward Message", "POST", f"{BASE}/api/chats/{{{{chatId}}}}/forward", ["api","chats","{{chatId}}","forward"],
            body=body_json({"recipientIds":[2,3]})),
        req("Chat History (User)", "GET", f"{BASE}/api/chats/history/user/2?page=0&size=20", ["api","chats","history","user","2"],
            query=[q("page","0"),q("size","20")]),
        req("Chat History (Group)", "GET", f"{BASE}/api/chats/history/group/{{{{groupId}}}}?page=0&size=20", ["api","chats","history","group","{{groupId}}"],
            query=[q("page","0"),q("size","20")]),
        req("Chat Statistics", "GET", f"{BASE}/api/chats/statistics", ["api","chats","statistics"]),
        req("Add Reaction", "POST", f"{BASE}/api/chats/{{{{chatId}}}}/reactions", ["api","chats","{{chatId}}","reactions"],
            body=body_json({"emoji":"thumbsup"})),
        req("Remove Reaction", "DELETE", f"{BASE}/api/chats/{{{{chatId}}}}/reactions", ["api","chats","{{chatId}}","reactions"],
            body=body_json({"emoji":"thumbsup"})),
        req("Send Media Message", "POST", f"{BASE}/api/chats/media", ["api","chats","media"],
            body=body_json({"recipientId":2,"mediaUrl":"https://example.com/img.png","mediaType":"IMAGE"})),
        req("Unread Message Count", "GET", f"{BASE}/api/chats/unread/count", ["api","chats","unread","count"]),
        req("Start Typing", "POST", f"{BASE}/api/chats/typing/start", ["api","chats","typing","start"],
            body=body_json({"recipientId":2})),
        req("Stop Typing", "POST", f"{BASE}/api/chats/typing/stop", ["api","chats","typing","stop"],
            body=body_json({"recipientId":2})),
        req("Conversations List", "GET", f"{BASE}/api/chats/conversations", ["api","chats","conversations"]),
        req("Batch Presence", "POST", f"{BASE}/api/chats/presence/batch", ["api","chats","presence","batch"],
            body=body_json({"userIds":[1,2,3]})),
    ]
    return folder("26. Chats", items)

def presence_service():
    return folder("27. Presence", [
        req("User Presence", "GET", f"{BASE}/api/chats/presence/2", ["api","chats","presence","2"]),
        req("Friends Presence", "GET", f"{BASE}/api/chats/presence/friends", ["api","chats","presence","friends"]),
        req("Batch Presence", "GET", f"{BASE}/api/chats/presence/batch?userIds=1,2,3", ["api","chats","presence","batch"],
            query=[q("userIds","1,2,3")]),
        req("Heartbeat", "POST", f"{BASE}/api/chats/presence/heartbeat", ["api","chats","presence","heartbeat"]),
        req("Online Users", "GET", f"{BASE}/api/chats/presence/online", ["api","chats","presence","online"]),
    ])


# ============================================================
# 6. ADMIN/ANALYTICS SERVICES
# ============================================================

def audit_service():
    return folder("28. Audit Logs", [
        req("Get All Audit Logs (Admin)", "GET", f"{BASE}/api/admin/audit-logs?page=0&size=20&timeRange=7d", ["api","admin","audit-logs"],
            query=[q("page","0"),q("size","20"),q("search","",True),q("actionType","",True),q("timeRange","7d")]),
        req("Audit Log Stats", "GET", f"{BASE}/api/admin/audit-logs/stats?timeRange=7d", ["api","admin","audit-logs","stats"],
            query=[q("timeRange","7d")]),
        req("Audit Logs For User", "GET", f"{BASE}/api/admin/audit-logs/user/{{{{userId}}}}?page=0&size=20", ["api","admin","audit-logs","user","{{userId}}"],
            query=[q("page","0"),q("size","20")]),
        req("Audit Logs For Entity", "GET", f"{BASE}/api/admin/audit-logs/entity", ["api","admin","audit-logs","entity"],
            query=[q("entityType","EXPENSE"),q("entityId","1")]),
        req("Get All Reports (Admin)", "GET", f"{BASE}/api/admin/reports?page=0&size=20", ["api","admin","reports"],
            query=[q("page","0"),q("size","20"),q("type","",True)]),
        req("Generate Report", "POST", f"{BASE}/api/admin/reports/generate", ["api","admin","reports","generate"],
            body=body_json({"type":"USER_ACTIVITY","startDate":"2026-01-01","endDate":"2026-03-13"})),
        req("Get Report By ID", "GET", f"{BASE}/api/admin/reports/1", ["api","admin","reports","1"]),
        req("Delete Report", "DELETE", f"{BASE}/api/admin/reports/1", ["api","admin","reports","1"]),
        req("Download Report", "GET", f"{BASE}/api/admin/reports/1/download", ["api","admin","reports","1","download"]),
        req("Get All User Audit Logs", "GET", f"{BASE}/api/audit-logs/all", ["api","audit-logs","all"]),
        req("Get Audit Log Types", "GET", f"{BASE}/api/audit-logs/audit-types", ["api","audit-logs","audit-types"], auth=noauth()),
    ])

def analytics_service():
    return folder("30. Analytics", [
        req("Application Overview", "GET", f"{BASE}/api/analytics/overview", ["api","analytics","overview"]),
        req("Entity Analytics", "POST", f"{BASE}/api/analytics/entity", ["api","analytics","entity"],
            body=body_json({"entityType":"CATEGORY","entityId":1,"startDate":"2026-01-01","endDate":"2026-03-13"})),
        req("Download Visual Report", "GET", f"{BASE}/api/analytics/report/excel", ["api","analytics","report","excel"],
            query=[q("startDate","2026-01-01",True),q("endDate","2026-03-13",True),q("year","2026",True),q("month","3",True),q("allTime","false"),q("reportType","COMPREHENSIVE"),q("includeCharts","true"),q("includeFormulas","true"),q("includeConditionalFormatting","true")]),
    ])

def search_service():
    return folder("31. Search", [
        req("Universal Search", "GET", f"{BASE}/api/search?q=groceries&limit=5", ["api","search"],
            query=[q("q","groceries"),q("limit","5"),q("sections","",True),q("mode","USER")]),
        req("Search Health", "GET", f"{BASE}/api/search/health", ["api","search","health"], auth=noauth()),
    ])

def shortcut_service():
    return folder("32. Keyboard Shortcuts", [
        req("Get Shortcuts", "GET", f"{BASE}/api/shortcuts", ["api","shortcuts"]),
        req("Update Shortcuts", "POST", f"{BASE}/api/shortcuts/update", ["api","shortcuts","update"],
            body=body_json({"shortcuts":[{"actionId":"save","keys":"Ctrl+S"}]})),
        req("Get Recommendations", "GET", f"{BASE}/api/shortcuts/recommendations", ["api","shortcuts","recommendations"]),
        req("Reset To Defaults", "POST", f"{BASE}/api/shortcuts/reset", ["api","shortcuts","reset"]),
        req("Track Usage", "POST", f"{BASE}/api/shortcuts/track?actionId=save", ["api","shortcuts","track"],
            query=[q("actionId","save")]),
        req("Accept Recommendation", "POST", f"{BASE}/api/shortcuts/recommendations/save/accept", ["api","shortcuts","recommendations","save","accept"]),
        req("Reject Recommendation", "POST", f"{BASE}/api/shortcuts/recommendations/save/reject", ["api","shortcuts","recommendations","save","reject"]),
    ])

def story_service():
    return folder("33. Stories", [
        req("Get Active Stories", "GET", f"{BASE}/api/stories?userId={{{{userId}}}}", ["api","stories"],
            query=[q("userId","{{userId}}")]),
        req("Get Story By ID", "GET", f"{BASE}/api/stories/{{{{storyId}}}}?userId={{{{userId}}}}", ["api","stories","{{storyId}}"],
            query=[q("userId","{{userId}}")]),
        req("Mark Story Seen", "POST", f"{BASE}/api/stories/{{{{storyId}}}}/seen?userId={{{{userId}}}}", ["api","stories","{{storyId}}","seen"],
            query=[q("userId","{{userId}}")]),
        req("Mark CTA Clicked", "POST", f"{BASE}/api/stories/{{{{storyId}}}}/cta/CTA_ID/clicked?userId={{{{userId}}}}", ["api","stories","{{storyId}}","cta","CTA_ID","clicked"],
            query=[q("userId","{{userId}}")]),
        req("Dismiss Story", "POST", f"{BASE}/api/stories/{{{{storyId}}}}/dismiss?userId={{{{userId}}}}", ["api","stories","{{storyId}}","dismiss"],
            query=[q("userId","{{userId}}")]),
        req("Bulk Mark Seen", "POST", f"{BASE}/api/stories/seen-bulk", ["api","stories","seen-bulk"],
            body=body_json({"userId":1,"storyIds":["uuid1","uuid2"]})),
    ])

def admin_story_service():
    return folder("34. Admin Stories", [
        req("Create Story", "POST", f"{BASE}/api/admin/stories", ["api","admin","stories"],
            body=body_json({"title":"New Feature","content":"Check out...","type":"FEATURE","priority":1})),
        req("Update Story", "PUT", f"{BASE}/api/admin/stories/{{{{storyId}}}}", ["api","admin","stories","{{storyId}}"],
            body=body_json({"title":"Updated","content":"Updated content"})),
        req("Delete Story", "DELETE", f"{BASE}/api/admin/stories/{{{{storyId}}}}", ["api","admin","stories","{{storyId}}"]),
        req("Activate Story", "POST", f"{BASE}/api/admin/stories/{{{{storyId}}}}/activate", ["api","admin","stories","{{storyId}}","activate"]),
        req("Deactivate Story", "POST", f"{BASE}/api/admin/stories/{{{{storyId}}}}/deactivate", ["api","admin","stories","{{storyId}}","deactivate"]),
        req("Archive Story", "POST", f"{BASE}/api/admin/stories/{{{{storyId}}}}/archive", ["api","admin","stories","{{storyId}}","archive"]),
        req("Unarchive Story", "POST", f"{BASE}/api/admin/stories/{{{{storyId}}}}/unarchive", ["api","admin","stories","{{storyId}}","unarchive"]),
        req("Get All Stories", "GET", f"{BASE}/api/admin/stories?page=0&size=20", ["api","admin","stories"],
            query=[q("page","0"),q("size","20")]),
        req("Get Story By ID", "GET", f"{BASE}/api/admin/stories/{{{{storyId}}}}", ["api","admin","stories","{{storyId}}"]),
        req("Stories By Status", "GET", f"{BASE}/api/admin/stories/status/ACTIVE?page=0&size=20", ["api","admin","stories","status","ACTIVE"],
            query=[q("page","0"),q("size","20")]),
        req("Stories By Type", "GET", f"{BASE}/api/admin/stories/type/FEATURE?page=0&size=20", ["api","admin","stories","type","FEATURE"],
            query=[q("page","0"),q("size","20")]),
        req("Expire Stories", "POST", f"{BASE}/api/admin/stories/expire", ["api","admin","stories","expire"]),
        req("Archive Expired", "POST", f"{BASE}/api/admin/stories/archive-expired", ["api","admin","stories","archive-expired"]),
    ])

def event_service():
    items = [
        req("Create Event", "POST", f"{BASE}/api/events", ["api","events"],
            body=body_json({"name":"Birthday Party","eventType":"CELEBRATION","startDate":"2026-04-01","endDate":"2026-04-01","userId":1}),
            events=id_extract_test("eventId")),
        req("Update Event", "PUT", f"{BASE}/api/events/{{{{eventId}}}}/user/{{{{userId}}}}", ["api","events","{{eventId}}","user","{{userId}}"],
            body=body_json({"name":"Updated Event"})),
        req("Delete Event", "DELETE", f"{BASE}/api/events/{{{{eventId}}}}/user/{{{{userId}}}}", ["api","events","{{eventId}}","user","{{userId}}"]),
        req("Get Event By ID", "GET", f"{BASE}/api/events/{{{{eventId}}}}/user/{{{{userId}}}}", ["api","events","{{eventId}}","user","{{userId}}"]),
        req("All Events By User", "GET", f"{BASE}/api/events/user/{{{{userId}}}}", ["api","events","user","{{userId}}"]),
        req("Events By Status", "GET", f"{BASE}/api/events/user/{{{{userId}}}}/status/ACTIVE", ["api","events","user","{{userId}}","status","ACTIVE"]),
        req("Events By Type", "GET", f"{BASE}/api/events/user/{{{{userId}}}}/type/CELEBRATION", ["api","events","user","{{userId}}","type","CELEBRATION"]),
        req("Events By Date Range", "GET", f"{BASE}/api/events/user/{{{{userId}}}}/date-range", ["api","events","user","{{userId}}","date-range"],
            query=[q("startDate","2026-01-01"),q("endDate","2026-12-31")]),
        req("Search Events", "GET", f"{BASE}/api/events/user/{{{{userId}}}}/search?eventName=birthday", ["api","events","user","{{userId}}","search"],
            query=[q("eventName","birthday")]),
        req("Add Expense To Event", "POST", f"{BASE}/api/events/expenses", ["api","events","expenses"],
            body=body_json({"eventId":1,"name":"Decoration","amount":500,"category":"SUPPLIES","userId":1})),
        req("Update Event Expense", "PUT", f"{BASE}/api/events/expenses/1/user/{{{{userId}}}}", ["api","events","expenses","1","user","{{userId}}"],
            body=body_json({"name":"Updated Decoration","amount":600})),
        req("Delete Event Expense", "DELETE", f"{BASE}/api/events/expenses/1/user/{{{{userId}}}}", ["api","events","expenses","1","user","{{userId}}"]),
        req("Event Expenses", "GET", f"{BASE}/api/events/{{{{eventId}}}}/expenses/user/{{{{userId}}}}", ["api","events","{{eventId}}","expenses","user","{{userId}}"]),
        req("Expenses By Category", "GET", f"{BASE}/api/events/{{{{eventId}}}}/expenses/category/SUPPLIES", ["api","events","{{eventId}}","expenses","category","SUPPLIES"]),
        req("Total Expenses", "GET", f"{BASE}/api/events/{{{{eventId}}}}/expenses/total", ["api","events","{{eventId}}","expenses","total"]),
        req("Category Wise Expenses", "GET", f"{BASE}/api/events/{{{{eventId}}}}/expenses/category-wise", ["api","events","{{eventId}}","expenses","category-wise"]),
        req("Add Donation", "POST", f"{BASE}/api/events/donations", ["api","events","donations"],
            body=body_json({"eventId":1,"donorName":"John","amount":1000,"paymentMethod":"CASH","userId":1})),
        req("Update Donation", "PUT", f"{BASE}/api/events/donations/1/user/{{{{userId}}}}", ["api","events","donations","1","user","{{userId}}"],
            body=body_json({"donorName":"John","amount":1500})),
        req("Delete Donation", "DELETE", f"{BASE}/api/events/donations/1/user/{{{{userId}}}}", ["api","events","donations","1","user","{{userId}}"]),
        req("Event Donations", "GET", f"{BASE}/api/events/{{{{eventId}}}}/donations/user/{{{{userId}}}}", ["api","events","{{eventId}}","donations","user","{{userId}}"]),
        req("Total Donations", "GET", f"{BASE}/api/events/{{{{eventId}}}}/donations/total", ["api","events","{{eventId}}","donations","total"]),
        req("Payment Method Wise Donations", "GET", f"{BASE}/api/events/{{{{eventId}}}}/donations/payment-method-wise", ["api","events","{{eventId}}","donations","payment-method-wise"]),
        req("Create Event Budget", "POST", f"{BASE}/api/events/budgets", ["api","events","budgets"],
            body=body_json({"eventId":1,"name":"Venue Budget","amount":5000,"userId":1})),
        req("Update Event Budget", "PUT", f"{BASE}/api/events/budgets/1/user/{{{{userId}}}}", ["api","events","budgets","1","user","{{userId}}"],
            body=body_json({"name":"Updated Budget","amount":6000})),
        req("Delete Event Budget", "DELETE", f"{BASE}/api/events/budgets/1/user/{{{{userId}}}}", ["api","events","budgets","1","user","{{userId}}"]),
        req("Event Budgets", "GET", f"{BASE}/api/events/{{{{eventId}}}}/budgets/user/{{{{userId}}}}", ["api","events","{{eventId}}","budgets","user","{{userId}}"]),
        req("Total Budget", "GET", f"{BASE}/api/events/{{{{eventId}}}}/budgets/total", ["api","events","{{eventId}}","budgets","total"]),
        req("Event Summary", "GET", f"{BASE}/api/events/{{{{eventId}}}}/summary/user/{{{{userId}}}}", ["api","events","{{eventId}}","summary","user","{{userId}}"]),
        req("Event Analytics", "GET", f"{BASE}/api/events/{{{{eventId}}}}/analytics/user/{{{{userId}}}}", ["api","events","{{eventId}}","analytics","user","{{userId}}"]),
        req("Monthly Event Summary", "GET", f"{BASE}/api/events/user/{{{{userId}}}}/monthly-summary/2026/3", ["api","events","user","{{userId}}","monthly-summary","2026","3"]),
        req("Financial Overview", "GET", f"{BASE}/api/events/{{{{eventId}}}}/financial-overview/user/{{{{userId}}}}", ["api","events","{{eventId}}","financial-overview","user","{{userId}}"]),
        req("Event Categories", "GET", f"{BASE}/api/events/categories", ["api","events","categories"], auth=noauth()),
        req("Payment Methods", "GET", f"{BASE}/api/events/payment-methods", ["api","events","payment-methods"], auth=noauth()),
        req("Status Counts", "GET", f"{BASE}/api/events/user/{{{{userId}}}}/status-counts", ["api","events","user","{{userId}}","status-counts"]),
        req("Update Event Totals", "POST", f"{BASE}/api/events/{{{{eventId}}}}/update-totals", ["api","events","{{eventId}}","update-totals"]),
    ]
    return folder("35. Events", items)


# ============================================================
# ASSEMBLE COLLECTION
# ============================================================

def build_collection():
    return {
        "info": {
            "_postman_id": str(uuid.uuid4()),
            "name": "Expense Tracking System - Full API",
            "description": "Comprehensive API collection for the Expense Tracking System covering all microservices.\n\nGateway: http://localhost:8080\n\nAuto-login: Set 'email' and 'password' variables, then any request will auto-authenticate if jwt is empty.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "variable": [
            {"key": "baseUrl", "value": "http://localhost:8080", "type": "string"},
            {"key": "jwt", "value": "", "type": "string"},
            {"key": "email", "value": "test@example.com", "type": "string"},
            {"key": "password", "value": "Pass@123", "type": "string"},
            {"key": "userId", "value": "1", "type": "string"},
            {"key": "roleId", "value": "1", "type": "string"},
            {"key": "expenseId", "value": "1", "type": "string"},
            {"key": "budgetId", "value": "1", "type": "string"},
            {"key": "categoryId", "value": "1", "type": "string"},
            {"key": "billId", "value": "1", "type": "string"},
            {"key": "paymentMethodId", "value": "1", "type": "string"},
            {"key": "friendshipId", "value": "1", "type": "string"},
            {"key": "groupId", "value": "1", "type": "string"},
            {"key": "eventId", "value": "1", "type": "string"},
            {"key": "chatId", "value": "1", "type": "string"},
            {"key": "notificationId", "value": "1", "type": "string"},
            {"key": "storyId", "value": "00000000-0000-0000-0000-000000000001", "type": "string"},
        ],
        "auth": {
            "type": "bearer",
            "bearer": [{"key": "token", "value": "{{jwt}}", "type": "string"}]
        },
        "event": [
            {
                "listen": "prerequest",
                "script": {
                    "type": "text/javascript",
                    "exec": [
                        "if (!pm.collectionVariables.get('jwt') || pm.collectionVariables.get('jwt') === '') {",
                        "    var baseUrl = pm.collectionVariables.get('baseUrl');",
                        "    var email = pm.collectionVariables.get('email');",
                        "    var password = pm.collectionVariables.get('password');",
                        "    pm.sendRequest({",
                        "        url: baseUrl + '/auth/signin',",
                        "        method: 'POST',",
                        "        header: { 'Content-Type': 'application/json' },",
                        "        body: {",
                        "            mode: 'raw',",
                        "            raw: JSON.stringify({ email: email, password: password })",
                        "        }",
                        "    }, function (err, res) {",
                        "        if (!err && res.code === 200) {",
                        "            var data = res.json();",
                        "            var token = data.jwt || data.token;",
                        "            if (token) {",
                        "                pm.collectionVariables.set('jwt', token);",
                        "                console.log('Auto-login successful');",
                        "            }",
                        "        } else {",
                        "            console.log('Auto-login failed: ' + (err || res.code));",
                        "        }",
                        "    });",
                        "}"
                    ]
                }
            },
            {
                "listen": "test",
                "script": {
                    "type": "text/javascript",
                    "exec": [
                        "pm.test('Response time < 5s', () => {",
                        "    pm.expect(pm.response.responseTime).to.be.below(5000);",
                        "});",
                        "",
                        "if (pm.response.code === 401) {",
                        "    console.log('Got 401 - clearing JWT to trigger re-auth on next request');",
                        "    pm.collectionVariables.set('jwt', '');",
                        "}"
                    ]
                }
            }
        ],
        "item": [
            # User Service
            user_service_auth(),
            user_service_oauth2(),
            user_service_mfa(),
            user_service_user(),
            user_service_roles(),
            user_service_admin(),
            user_service_admin_analytics(),
            user_service_report_prefs(),
            # Expense Service
            folder("09. Expenses", [
                expense_service_crud(),
                expense_service_summaries(),
                expense_service_filters(),
                expense_service_payment(),
                expense_service_category_budget(),
                expense_service_reports(),
                expense_service_email(),
                expense_service_utilities(),
            ]),
            expense_service_settings(),
            expense_service_daily_summary(),
            expense_service_bulk(),
            expense_service_investment(),
            expense_service_email_logs(),
            expense_service_kafka(),
            # Financial Services
            budget_service(),
            category_service(),
            bill_service(),
            payment_service(),
            # Social Services
            friendship_service(),
            group_service(),
            friend_activity_service(),
            share_service(),
            # Communication Services
            notification_service(),
            notification_preferences_service(),
            chat_service(),
            presence_service(),
            # Admin/Analytics
            audit_service(),
            analytics_service(),
            search_service(),
            shortcut_service(),
            story_service(),
            admin_story_service(),
            event_service(),
        ]
    }


if __name__ == "__main__":
    import os
    collection = build_collection()
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "postman-collection.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)

    total = 0
    with_tests = 0
    total_assertions = 0
    def count_items(items):
        global total, with_tests, total_assertions
        for item in items:
            if "item" in item:
                count_items(item["item"])
            else:
                total += 1
                events = item.get("event", [])
                for ev in events:
                    if ev.get("listen") == "test":
                        with_tests += 1
                        for line in ev.get("script", {}).get("exec", []):
                            if "pm.test(" in line:
                                total_assertions += 1
    count_items(collection["item"])
    print(f"Collection generated: {out_path}")
    print(f"Total endpoints: {total}")
    print(f"Endpoints with tests: {with_tests}")
    print(f"Total test assertions: {total_assertions}")
    print(f"Total folders: {len(collection['item'])}")
