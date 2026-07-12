# Generate Postman Collection

Scan this entire repository and generate a complete Postman Collection v2.1.0 JSON file. Follow EVERY step below precisely.

---

## Step 1: Detect Project Type & Framework

Scan the repo root and source directories to detect the tech stack:

| Indicator File/Pattern | Framework |
|---|---|
| `pom.xml` or `build.gradle` with Spring | **Spring Boot** (Java/Kotlin) |
| `package.json` with express/fastify/nest/koa | **Node.js** (Express/Nest/Fastify) |
| `requirements.txt` / `pyproject.toml` with flask/django/fastapi | **Python** (Flask/Django/FastAPI) |
| `go.mod` with gin/echo/fiber | **Go** (Gin/Echo/Fiber) |
| `.csproj` with ASP.NET | **.NET** (ASP.NET Core) |

If it's a **monorepo** or has multiple services/modules, scan ALL of them.

---

## Step 2: Find ALL API Endpoints

Based on the detected framework, search for endpoint definitions:

### Spring Boot (Java/Kotlin)
- Search for classes annotated with `@RestController`, `@Controller`
- Extract `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`
- Parse class-level `@RequestMapping` prefix and combine with method-level paths
- Extract `@RequestParam`, `@PathVariable`, `@RequestBody` parameter types
- Check for `@PreAuthorize` or custom auth annotations to determine auth requirements
- Look at DTO/model classes referenced in `@RequestBody` to build sample JSON bodies

### Node.js (Express/Nest/Fastify)
- Search for `router.get/post/put/delete/patch`, `app.get/post/put/delete/patch`
- For NestJS: `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`, `@Controller()`
- Extract route paths, middleware (auth guards), and request body shapes from DTOs or validation schemas

### Python (Flask/Django/FastAPI)
- Flask: `@app.route`, `@blueprint.route`, methods parameter
- Django REST: `ViewSet` classes, `urlpatterns`
- FastAPI: `@app.get/post/put/delete`, `@router.get/post/put/delete`, Pydantic models for body

### Go (Gin/Echo/Fiber)
- `r.GET/POST/PUT/DELETE`, `e.GET/POST/PUT/DELETE`
- Extract handler function signatures for parameter info

### ASP.NET Core
- `[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]` attributes
- `[Route]` attribute, controller class names

---

## Step 3: Extract Endpoint Metadata

For EVERY endpoint found, extract:

1. **HTTP Method** (GET, POST, PUT, DELETE, PATCH)
2. **Full URL Path** (combine class/module prefix + method path)
3. **Path Variables** — convert to Postman `{{variableName}}` syntax
4. **Query Parameters** — with sample values and types
5. **Request Body** — build realistic sample JSON from DTOs/models/schemas:
   - Use field names, types, and any validation annotations to generate sensible defaults
   - Strings → meaningful sample values (not "string")
   - Numbers → realistic numbers
   - Dates → use current year dates
   - Booleans → true/false
   - Enums → use the first valid enum value
6. **Auth requirement** — does this endpoint need auth or is it public (`noauth`)?
7. **Service/Module grouping** — which controller/service does it belong to?

---

## Step 4: Generate the Postman Collection Python Script

Create a Python script named `generate-postman-collection.py` in the **repository root** that builds and writes the collection. The script must follow this exact structure:

```python
import json
import uuid
import os

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

def jwt_extract_test():
    return test_script([
        'pm.test("Status is 200", () => pm.response.to.have.status(200));',
        '',
        'pm.test("JWT present in response", () => {',
        '    var data = pm.response.json();',
        '    var token = data.jwt || data.token || data.accessToken || data.access_token;',
        '    pm.expect(token).to.be.a("string").and.not.empty;',
        '    pm.collectionVariables.set("jwt", token);',
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
        '    }',
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

def folder(name, items):
    return {"name": name, "item": items}

def body_json(obj):
    return json.dumps(obj, indent=2)
```

Then add endpoint-building functions grouped by controller/service, and finally the collection assembler.

---

## Step 5: Collection Structure Rules

### Folder Organization
- Group endpoints by **controller/service name** — each controller becomes a top-level folder
- Within large controllers, create **sub-folders** by operation type (CRUD, Search, Analytics, Reports, etc.)
- Name folders with a number prefix for ordering: `"01. Auth"`, `"02. Users"`, etc.

### Variable Detection
Automatically detect and create collection variables for:
- `baseUrl` — detect from `application.yml`, `application.properties`, `.env`, `config` files. Default to `http://localhost:PORT`
- `jwt` / `token` — empty string, populated by auth endpoints
- Entity ID variables — for every entity that has CRUD operations (e.g., `userId`, `expenseId`, `orderId`)
- Common variables — `email`, `password` if auth endpoints exist

### Auth Configuration
- Set collection-level auth to **Bearer Token** using `{{jwt}}` if JWT auth is detected
- Add a **pre-request script** at collection level that auto-authenticates if `jwt` is empty (if auth endpoints exist)
- Add a **test script** at collection level that clears `jwt` on 401 responses
- Mark public endpoints (health checks, login, signup, public APIs) with `noauth()`

### Test Scripts (auto-generate for every endpoint)
- **Auth endpoints** (login/signup): use `jwt_extract_test()` to capture the token
- **Create endpoints** (POST that creates a resource): use `id_extract_test("entityId")` to capture created IDs
- **All other endpoints**: use `auto_test(method, name)` which adds:
  - Status code assertion (200 for GET, 2xx for POST/DELETE)
  - Content-Type JSON check
  - Response body not empty check (for GET/POST)
  - No server error check (500/502/503)

### Path Variable Syntax
- Convert path variables to Postman double-brace format: `/users/{id}` → `/users/{{userId}}`
- Use descriptive variable names: `{{userId}}` not `{{id}}`

### Sample Request Bodies
- Generate **realistic** sample JSON bodies based on DTO/model field names and types
- Use current year for date fields
- Use meaningful string values (not "string" or "test")
- Include all required fields, mark optional fields in comments

---

## Step 6: Run & Output

After generating the Python script:
1. Run it with `python generate-postman-collection.py`
2. Report the output: total endpoints, endpoints with tests, total assertions, folder count
3. The output file should be `postman-collection.json` in the repo root

---

## Quality Checks

Before finishing, verify:
- [ ] Every controller/route file in the repo has been scanned
- [ ] Every public endpoint is represented in the collection
- [ ] No duplicate endpoints
- [ ] All path variables have corresponding collection variables
- [ ] All request bodies have realistic sample data
- [ ] Auth endpoints extract and store JWT
- [ ] Create endpoints extract and store entity IDs
- [ ] Every endpoint has at least one test assertion
- [ ] Folder structure matches the service/controller organization
- [ ] The generated JSON is valid Postman v2.1.0 format
