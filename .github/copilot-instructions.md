# GitHub Copilot Instructions - Expense Tracking System

## 🎯 Critical Instructions for AI Agents

**BEFORE making ANY code changes:**

1. **🔍 ANALYZE FIRST** - Always read and understand existing code patterns in the codebase
2. **📚 LEARN THE CONTEXT** - Search for similar implementations before creating new ones
3. **🏗️ FOLLOW EXISTING PATTERNS** - Match the architectural style already established
4. **✅ PRODUCTION READY** - All code must meet production-grade quality standards
5. **🧪 VALIDATE CHANGES** - Ensure changes don't break existing functionality

**Never assume or guess** - If you need to modify code:
- Search the codebase for existing similar implementations
- Understand the current logic flow before suggesting changes
- Maintain consistency with established patterns
- Consider impact on dependent services/components

## Architecture Overview

This is a **microservices-based expense tracking system** with a React frontend and Spring Boot backend. The system follows Netflix OSS patterns with Eureka service discovery, Spring Cloud Gateway, and Kafka event-driven architecture.

### Core Components

**Backend (14 Microservices)**:
- `eureka-server` (8761) - Service discovery
- `Gateway` (8080) - API Gateway with path-based routing (all routes via `/api/`)
- `user-service` (6001) - Authentication & user management
- `social-media-app` (6000) - Main expense tracking service
- Domain services: Budget (6005), Bill (6007), Category (6008), Payment (6006), Friendship (6009), Notification (6003), Audit (6004), Chat (7001), Analytics, Event

**Frontend**:
- React 18.3 app at `Expense Tracking System FrontEnd/social-media-master`
- Redux state management with thunk middleware
- Material-UI (MUI) components with custom theming

**Infrastructure**:
- MySQL (port 5000, maps to 3306) - Shared database with per-service schemas
- Redis (6379) - Chat service caching
- Kafka + Zookeeper (9092) - Event streaming
- Kafka-UI (9080) - Monitoring interface

## Development Workflows

### Starting Services

**Quick Start (Infrastructure Only)**:
```powershell
docker-compose up -d  # MySQL, Redis, Kafka, Zookeeper
```

**Start All Backend Services**:
```powershell
.\start-all-services.ps1  # Launches 11 services in Windows Terminal tabs
```
Services start order: Eureka → Gateway → User → Expense → Others

**Frontend**:
```powershell
cd "Expense Tracking System FrontEnd\social-media-master"
npm start  # Runs on port 3000
```

### Building Services

**Individual Service**:
```powershell
cd Expense-tracking-System-backend\Expense-tracking-backend-main\{service-name}
mvn clean package -DskipTests
mvn spring-boot:run
```

**All Services (Docker)**:
```powershell
docker-compose --profile build up -d
```

### Jenkins CI/CD

Three pipeline options in `Expense-tracking-System-backend/Expense-tracking-backend-main/`:
- `Jenkinsfile` - Parallel builds with metrics (recommended)
- `Jenkinsfile.simple` - Sequential builds for debugging
- `Jenkinsfile.docker` - Builds + Docker image creation

## Coding Standards

### 🎯 Production-Ready Code Requirements

**Every code contribution must meet these standards:**

1. **Error Handling** - Comprehensive try-catch blocks with meaningful error messages
2. **Logging** - Appropriate log levels (DEBUG, INFO, WARN, ERROR) with context
3. **Validation** - Input validation at all entry points (controllers, service methods)
4. **Security** - Never expose sensitive data, validate user permissions
5. **Performance** - Consider database query optimization, caching strategies
6. **Testing** - Write testable code (dependency injection, mockable components)
7. **Documentation** - Complex business logic requires explanation comments
8. **Backward Compatibility** - Don't break existing API contracts

### General Principles

**SOLID Principles** - Always apply:
- **Single Responsibility**: Each class/function has ONE clear purpose
- **Open/Closed**: Extend behavior via inheritance/composition, not modification
- **Liskov Substitution**: Subclasses must be substitutable for their base classes
- **Interface Segregation**: Create focused, specific interfaces
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

**DRY (Don't Repeat Yourself)**:
- Extract common logic into reusable functions/classes
- Use base classes for shared behavior (see `NotificationEventProducer<T>`)
- Create utility classes for repeated operations

**Design Patterns to Use**:
- **Template Method**: Base classes define algorithm structure (e.g., `NotificationEventProducer`)
- **Factory Pattern**: For object creation complexity
- **Strategy Pattern**: For interchangeable algorithms
- **Repository Pattern**: Data access abstraction (already in use)
- **Service Layer Pattern**: Business logic separation (already in use)

### Code Quality Rules

**Comments**:
- ❌ **DO NOT** add obvious comments that repeat code
- ❌ **DO NOT** use bloated Javadoc for simple getters/setters
- ✅ **DO** comment complex business logic or non-obvious decisions
- ✅ **DO** document public APIs and service interfaces
- ✅ **DO** explain "why" not "what" in comments

**Bad Example**:
```java
// Get user by ID
public User getUserById(Long id) {
    return userRepository.findById(id); // Find user in repository
}
```

**Good Example**:
```java
public User getUserById(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
}

/**
 * Validates budget threshold and sends notification if exceeded.
 * Uses 80% threshold to give users advance warning before full depletion.
 * 
 * Business Rule: Notifications sent once per threshold crossing to avoid spam.
 */
public void checkBudgetThreshold(Budget budget) {
    if (budget.getPercentageUsed() >= 80.0 && !budget.isThresholdNotificationSent()) {
        notificationProducer.sendEvent(buildThresholdEvent(budget));
        budget.setThresholdNotificationSent(true);
        budgetRepository.save(budget);
    }
}
```

**Naming Conventions**:
- Use descriptive names that reveal intent
- Avoid abbreviations unless universally understood
- Methods should be verbs, classes should be nouns
- Boolean methods: `isValid()`, `hasPermission()`, `canAccess()`

**Method Length**:
- Keep methods under 20 lines when possible
- Extract complex logic into private helper methods
- One level of abstraction per method

**Class Structure**:
```java
public class ServiceExample {
    // 1. Static constants
    private static final String DEFAULT_VALUE = "value";
    
    // 2. Instance variables
    private final DependencyA dependencyA;
    private final DependencyB dependencyB;
    
    // 3. Constructor (with dependency injection)
    public ServiceExample(DependencyA dependencyA, DependencyB dependencyB) {
        this.dependencyA = dependencyA;
        this.dependencyB = dependencyB;
    }
    
    // 4. Public methods
    public Result performOperation() {
        // High-level orchestration
        validateInput();
        return processData();
    }
    
    // 5. Private helper methods
    private void validateInput() { }
    private Result processData() { }
}
```

### Backend-Specific Standards

**Exception Handling**:
- Use custom exceptions for business errors
- Let Spring handle generic exceptions at controller level
- Log errors with context, not just stack traces
```java
// Good - Production ready
try {
    Budget budget = budgetService.getBudgetById(budgetId);
    return ResponseEntity.ok(budget);
} catch (BudgetNotFoundException ex) {
    log.error("Budget not found: budgetId={}, userId={}", budgetId, userId, ex);
    throw ex; // Let @ControllerAdvice handle
} catch (Exception ex) {
    log.error("Unexpected error fetching budget: budgetId={}", budgetId, ex);
    throw new InternalServerException("Failed to fetch budget", ex);
}
```

**Kafka Producers**:
- Always extend `NotificationEventProducer<T>` (DRY principle)
- Override only required methods: `getTopicName()`, `generatePartitionKey()`
- Use `@Value` for topic names (externalize configuration)
```java
// Follow this pattern - already established in codebase
@Component
public class YourNotificationProducer extends NotificationEventProducer<YourEvent> {
    @Value("${kafka.topics.your-events:your-events}")
    private String topicName;
    
    @Override
    protected String getTopicName() {
        return topicName;
    }
    
    @Override
    protected String generatePartitionKey(YourEvent event) {
        return event.getUserId().toString(); // Partition by user for ordering
    }
}
```

**Service Layer**:
- Keep services focused (Single Responsibility)
- Inject dependencies via constructor (Dependency Inversion)
- Return DTOs, not entities, from service methods
```java
// Good - Production ready service
@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final BudgetNotificationProducer notificationProducer;
    private final BudgetMapper budgetMapper;
    
    @Transactional
    public BudgetDTO createBudget(CreateBudgetRequest request, Long userId) {
        // Validate
        validateBudgetRequest(request);
        
        // Business logic
        Budget budget = budgetMapper.toEntity(request);
        budget.setUserId(userId);
        budget.setCreatedAt(LocalDateTime.now());
        
        // Persist
        Budget savedBudget = budgetRepository.save(budget);
        log.info("Budget created: budgetId={}, userId={}", savedBudget.getId(), userId);
        
        // Async notification
        notificationProducer.sendEvent(buildCreatedEvent(savedBudget));
        
        // Return DTO
        return budgetMapper.toDTO(savedBudget);
    }
    
    private void validateBudgetRequest(CreateBudgetRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new InvalidBudgetException("Budget amount must be positive");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new InvalidBudgetException("End date must be after start date");
        }
    }
}
```

**REST Controllers**:
- Keep controllers thin - delegate to services
- Use `@Valid` for request validation
- Return `ResponseEntity<T>` for proper HTTP status codes
```java
// Good - Thin controller with proper error handling
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {
    private final BudgetService budgetService;
    
    @PostMapping
    public ResponseEntity<BudgetDTO> createBudget(
            @Valid @RequestBody CreateBudgetRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        
        log.debug("Creating budget for user: userId={}", user.getId());
        BudgetDTO budget = budgetService.createBudget(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(budget);
    }
}
```

### Frontend-Specific Standards

**Component Structure**:
- Small, focused components (Single Responsibility)
- Extract reusable logic into custom hooks
- Use `React.memo()` for expensive rendering operations
```javascript
// Good - Production ready component
import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';

export default function BudgetCard({ budgetId, onEdit, onDelete }) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  
  // Memoized selectors
  const budget = useSelector(state => 
    state.budget.budgets.find(b => b.id === budgetId)
  );
  
  // Memoized calculations
  const progressPercentage = useMemo(() => {
    if (!budget) return 0;
    return (budget.spentAmount / budget.amount) * 100;
  }, [budget]);
  
  // Memoized callbacks
  const handleDelete = useCallback(() => {
    if (window.confirm('Delete this budget?')) {
      dispatch(deleteBudget(budgetId));
      onDelete?.(budgetId);
    }
  }, [budgetId, dispatch, onDelete]);
  
  if (!budget) return null;
  
  return (
    <div style={{ backgroundColor: colors.cardBackground }}>
      {/* Component JSX */}
    </div>
  );
}
```

**State Management**:
- Use Redux for global state only
- Local component state for UI-specific data
- Custom hooks for shared component logic
```javascript
// Good - Proper state separation
function ExpenseForm() {
  // Global state - persisted data
  const categories = useSelector(state => state.category.categories);
  const dispatch = useDispatch();
  
  // Local state - UI only
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom hook - reusable logic
  const { formatCurrency } = useCurrency();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(createExpense(formData));
      setFormData({ amount: '', description: '' });
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };
}
```

**API Calls**:
- Always use `api` instance from `config/api.js`
- Never hardcode `API_BASE_URL` in components
- Handle loading/error states consistently
```javascript
// Good - Proper API usage with error handling
import { api } from '../../config/api';

export const fetchBudgetReport = (budgetId) => async (dispatch) => {
  dispatch({ type: FETCH_BUDGET_REPORT_REQUEST });
  
  try {
    const { data } = await api.get(`/api/budgets/${budgetId}/report`);
    
    dispatch({
      type: FETCH_BUDGET_REPORT_SUCCESS,
      payload: data
    });
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch report';
    
    dispatch({
      type: FETCH_BUDGET_REPORT_FAILURE,
      payload: errorMessage
    });
    
    // Optional: Show toast notification
    console.error('Budget report fetch error:', error);
  }
};

// Bad - Don't do this
const response = await fetch('http://localhost:8080/api/budgets'); // ❌ Hardcoded URL
```

**Styling**:
- Use theme colors via `useTheme()` hook
- Avoid inline styles unless dynamic
- Follow existing MUI patterns in codebase
```javascript
// Good - Theme-aware styling
function ExpenseCard({ expense }) {
  const { colors } = useTheme();
  
  return (
    <Card sx={{
      backgroundColor: colors.cardBackground,
      borderColor: colors.border,
      '&:hover': {
        backgroundColor: colors.cardHover
      }
    }}>
      {/* Content */}
    </Card>
  );
}

// Bad - Hardcoded colors
function ExpenseCard({ expense }) {
  return <Card style={{ backgroundColor: '#fff' }}>{/* ❌ */}</Card>;
}
```

**Props Destructuring**:
```javascript
// Good - Clear and concise
function ExpenseCard({ expense, onEdit, onDelete }) {
  // ...
}

// Bad - Props object access everywhere
function ExpenseCard(props) {
  return <div>{props.expense.name}</div>; // Verbose
}
```

### File Structure & Organization

**Backend Service Structure**:
```
{service-name}/
├── src/main/java/com/jaya/
│   ├── config/           # Configuration classes (Kafka, Security, etc.)
│   ├── controller/       # REST endpoints (thin, delegate to services)
│   ├── dto/              # Data Transfer Objects (request/response)
│   ├── entity/           # JPA entities (database models)
│   ├── exception/        # Custom exceptions (domain-specific)
│   ├── kafka/
│   │   ├── producer/     # Event producers (extend base classes)
│   │   └── events/       # Event DTOs for Kafka
│   ├── mapper/           # Entity ↔ DTO mappers (MapStruct or manual)
│   ├── repository/       # JPA repositories (data access layer)
│   ├── service/          # Business logic (core functionality)
│   │   ├── impl/         # Service implementations
│   │   └── {Service}Service.java  # Service interfaces
│   └── util/             # Utility classes (helpers, validators)
└── src/main/resources/
    ├── application.yml   # Configuration properties
    └── application-{profile}.yml  # Profile-specific configs
```

**Frontend Component Structure**:
```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.styles.js
│   │   │   └── index.js
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── FloatingNotifications/  # Global notification system
│   ├── {domain}/         # Domain-specific components
│   │   ├── BudgetCard.jsx
│   │   ├── BudgetForm.jsx
│   │   └── BudgetList.jsx
├── hooks/                # Custom React hooks (reusable logic)
│   ├── useTheme.js
│   ├── useCurrency.js
│   ├── useMasking.js
│   └── useUserSettings.js
├── Redux/                # State management
│   ├── {Domain}/
│   │   ├── {domain}.action.js
│   │   ├── {domain}.actionTypes.js
│   │   └── {domain}.reducer.js
├── services/             # API service layer (optional)
├── utils/                # Utility functions
│   ├── dateUtils.js
│   ├── currencyUtils.js
│   └── validationUtils.js
└── config/
    └── api.js            # Axios configuration (centralized)
```

### Component Design Principles

**1. Small, Independent, Reusable Components**:
```javascript
// Good - Single purpose, reusable
function CurrencyDisplay({ amount, currency = 'USD' }) {
  const { formatCurrency } = useCurrency();
  return <span>{formatCurrency(amount, currency)}</span>;
}

function DateDisplay({ date, format }) {
  const settings = useUserSettings();
  const dateFormat = format || settings.dateFormat;
  return <span>{dayjs(date).format(dateFormat)}</span>;
}

// Use them anywhere
function ExpenseCard({ expense }) {
  return (
    <Card>
      <CurrencyDisplay amount={expense.amount} />
      <DateDisplay date={expense.createdAt} />
    </Card>
  );
}
```

**2. Extract Logic into Custom Hooks**:
```javascript
// Good - Reusable logic
function useExpenseForm(initialValues) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validate = () => {
    const newErrors = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be positive';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  return { formData, errors, isSubmitting, setIsSubmitting, validate, handleChange };
}

// Use in multiple components
function CreateExpenseForm() {
  const { formData, errors, validate, handleChange } = useExpenseForm({
    amount: '',
    description: ''
  });
  // ... rest of component
}
```

**3. Composition Over Inheritance**:
```javascript
// Good - Compose small components
function ExpenseCard({ expense, onEdit, onDelete, showActions = true }) {
  return (
    <Card>
      <CardHeader>
        <CurrencyDisplay amount={expense.amount} />
        <CategoryBadge category={expense.category} />
      </CardHeader>
      <CardBody>
        <DateDisplay date={expense.date} />
        <Description text={expense.description} />
      </CardBody>
      {showActions && (
        <CardActions>
          <EditButton onClick={onEdit} />
          <DeleteButton onClick={onDelete} />
        </CardActions>
      )}
    </Card>
  );
}
```

### OOP Concepts & Abstractions

**Backend - Abstract Base Classes**:
```java
// Abstract base class for notification producers (Template Method Pattern)
public abstract class NotificationEventProducer<T extends NotificationEvent> {
    protected final KafkaTemplate<String, Object> kafkaTemplate;
    protected final ObjectMapper objectMapper;
    
    // Template method - defines algorithm structure
    public void sendEvent(T event) {
        validateEvent(event);
        beforeSend(event);
        String partitionKey = generatePartitionKey(event);
        
        kafkaTemplate.send(getTopicName(), partitionKey, event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    afterSendFailure(event, ex);
                } else {
                    afterSendSuccess(event, result);
                }
            });
    }
    
    // Abstract methods - subclasses must implement
    protected abstract String getTopicName();
    protected abstract String generatePartitionKey(T event);
    
    // Hook methods - subclasses can override
    protected void validateEvent(T event) { /* default validation */ }
    protected void beforeSend(T event) { /* hook */ }
    protected void afterSendSuccess(T event, SendResult<String, Object> result) { /* hook */ }
    protected void afterSendFailure(T event, Throwable ex) { /* hook */ }
}

// Concrete implementation
@Component
public class BudgetNotificationProducer extends NotificationEventProducer<BudgetNotificationEvent> {
    @Value("${kafka.topics.budget-events:budget-events}")
    private String topicName;
    
    @Override
    protected String getTopicName() {
        return topicName;
    }
    
    @Override
    protected String generatePartitionKey(BudgetNotificationEvent event) {
        return event.getUserId().toString(); // Partition by user
    }
    
    @Override
    protected void validateEvent(BudgetNotificationEvent event) {
        super.validateEvent(event);
        event.validate(); // Domain-specific validation
    }
}
```

**Backend - Interface Segregation**:
```java
// Good - Focused interfaces
public interface Auditable {
    Long getEntityId();
    String getEntityType();
    Long getUserId();
}

public interface Notifiable {
    NotificationEvent toNotificationEvent();
}

public interface Validatable {
    void validate() throws ValidationException;
}

// Entity implements only what it needs
@Entity
public class Budget implements Auditable, Notifiable, Validatable {
    // Implementation
}
```

**Backend - Dependency Injection (Inversion of Control)**:
```java
// Good - Constructor injection with interfaces
@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetRepository budgetRepository;  // Interface
    private final NotificationEventProducer<BudgetNotificationEvent> notificationProducer;  // Interface
    private final BudgetMapper budgetMapper;  // Interface
    private final BudgetValidator budgetValidator;  // Interface
    
    // All dependencies injected, easy to test with mocks
}
```

**Frontend - Custom Hook Abstractions**:
```javascript
// Abstraction for data fetching
function useDataFetch(url, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(url);
        if (!cancelled) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to fetch data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    fetchData();
    return () => { cancelled = true; };
  }, dependencies);
  
  return { data, loading, error };
}

// Use anywhere
function BudgetList() {
  const { data: budgets, loading, error } = useDataFetch('/api/budgets');
  // ... render
}
```

### Change Tracking & Documentation

**IMPORTANT**: When making significant changes to patterns or architecture:

1. **Update This File** - Document new patterns immediately
2. **Create/Update ReadMe** - Add detailed explanation in relevant service folder
3. **Example Locations**:
   - `Notification-Service/KAFKA_TOPICS_REFERENCE.md` - Kafka event schemas
   - `BUDGET_REPORT_API_INTEGRATION_COMPLETE.md` - Integration patterns
   - `FRIEND_REQUEST_QUICK_START.md` - Feature implementation guide

**Template for New Patterns**:
```markdown
# [Feature/Pattern Name]

## Problem Solved
Why this pattern exists

## Implementation
Code examples and usage

## Integration Points
How it connects to other services

## Testing
How to verify it works
```

**Always Document**:
- New base classes or abstract patterns
- New microservices or domain services
- API contract changes (request/response DTOs)
- Kafka topic additions or event schema changes
- Database schema migrations
- Configuration property additions

## Project Conventions

### Backend Patterns

**Service Registration**: All services register with Eureka using `@EnableEurekaClient` annotation. Gateway uses `lb://SERVICE-NAME` for load-balanced routing (e.g., `lb://USER-SERVICE`).

**API Paths**: Gateway routes by path prefix (see `Gateway/src/main/resources/application.yaml`):
- `/auth/**`, `/api/user/**` → USER-SERVICE
- `/api/expenses/**` → EXPENSE-TRACKING-SYSTEM
- `/api/budgets/**` → BUDGET-SERVICE
- `/api/bills/**` → BILL-SERVICE
- `/api/categories/**` → CATEGORY-SERVICE

**Database Connection**:
- Local dev: `jdbc:mysql://localhost:5000/{service-name}_service`
- Docker: `jdbc:mysql://mysql:3306/{service-name}_service?createDatabaseIfNotExist=true`
- Credentials: root/123456 (dev only)

**Kafka Event Pattern**: Services use `NotificationEventProducer<T>` base class. Example:
```java
@Component
public class BudgetNotificationProducer extends NotificationEventProducer<BudgetNotificationEvent> {
    @Value("${kafka.topics.budget-events:budget-events}")
    private String topicName;
    
    @Override
    protected String generatePartitionKey(BudgetNotificationEvent event) {
        return event.getUserId().toString(); // Ensures event ordering per user
    }
}
```

**Kafka Topics**: `{domain}-events` pattern (e.g., `expense-events`, `budget-events`). Notification service consumes all events with dedicated consumer groups (`notification-{domain}-group`).

### Frontend Patterns

**API Configuration**: Centralized in `src/config/api.js`:
```javascript
export const API_BASE_URL = "http://localhost:8080"; // Points to Gateway
export const api = axios.create({ baseURL: API_BASE_URL });
```
JWT token automatically attached via request interceptor.

**Redux State Structure**:
```
Redux/
  ├── Auth/        - User authentication & profile
  ├── Expenses/    - Expense CRUD operations
  ├── Budget/      - Budget management & reports
  ├── Category/    - Category management
  └── UserSettings/ - User preferences (dateFormat, currency, theme)
```

**DTO Mapping Pattern**: Backend DTOs map to frontend state (see `BUDGET_REPORT_API_INTEGRATION_COMPLETE.md`). Example:
```javascript
const mappedBudgetData = {
  id: detailedReport.budgetId,
  amount: detailedReport.allocatedAmount,
  progress: detailedReport.percentageUsed,
  // ... map all backend fields to component props
};
```

**Theme System**: Uses `useTheme()` hook from `hooks/useTheme.js`. All colors accessed via `colors` object (e.g., `colors.primary`, `colors.background`).

**Floating Notifications**: Global system at `src/components/common/FloatingNotifications/`. Automatically displays for Kafka events (friend requests, budget alerts, expense updates). Max 5 visible, auto-dismiss with pause-on-hover.

## Critical Integration Points

### Service Discovery
All backend services must register with Eureka before accepting traffic. Gateway health depends on Eureka (`depends_on: eureka-server: condition: service_healthy` in docker-compose).

### Cross-Service Communication
Services communicate via:
1. **Direct REST** - Using injected URLs (e.g., `USER_SERVICE_URL`, `EXPENSE_SERVICE_URL`)
2. **Kafka Events** - For async notifications and audit logging
3. **Gateway Routes** - Frontend always goes through Gateway (never direct service calls)

### Error Handling
Gateway centralizes error handling in `GatewayExceptionHandler.java`:
- 401/403 → Auth errors
- 502/503 → Service unavailable (downstream service down)
- 404 → Route not found

Frontend intercepts 403 errors and dispatches custom event `show403Error` for unauthorized access.

## Common Tasks

**Add New Microservice**:
1. Create service in `Expense-tracking-System-backend/Expense-tracking-backend-main/`
2. Add Eureka client dependency
3. Configure in `application.yml`: port, eureka.client.serviceUrl, datasource
4. Add route in `Gateway/src/main/resources/application.yaml`
5. Update `docker-compose.yml` with service definition
6. Add to `start-all-services.ps1`

**Add Kafka Event Producer**:
1. Extend `NotificationEventProducer<YourEvent>` class
2. Override `getTopicName()`, `generatePartitionKey()`, `validateEvent()`
3. Inject in service layer and call `sendEvent(event)`
4. Consumer auto-processes in Notification service (add processor if needed)

**Add Frontend Redux Action**:
1. Create action types in `Redux/{Domain}/{domain}.actionTypes.js`
2. Implement async action in `{domain}.action.js` using `api` instance
3. Handle in reducer `{domain}.reducer.js`
4. Connect component via `useSelector()` and `dispatch()`

## Testing & Debugging

**Check Service Health**:
- Eureka Dashboard: http://localhost:8761
- Kafka UI: http://localhost:9080
- Individual service: `http://localhost:{port}/actuator/health`

**Common Issues**:
- Services not registering with Eureka → Check `eureka.client.serviceUrl.defaultZone`
- Kafka connection refused → Ensure `localhost:9092` or `kafka:29092` (Docker) is reachable
- Gateway 502 errors → Downstream service not started or not registered with Eureka
- MySQL connection failed → Check port 5000 is mapped correctly

**Logs**:
```powershell
# Docker services
docker-compose logs -f {service-name}

# Local Maven
# Check terminal running mvn spring-boot:run
```

## Key Files for Context

- `docker-compose.yml` - Full infrastructure + service orchestration
- `Gateway/src/main/resources/application.yaml` - All API routes
- `start-all-services.ps1` - Service startup order and dependencies
- `src/config/api.js` - Frontend API configuration
- `Notification-Service/KAFKA_TOPICS_REFERENCE.md` - Complete event schemas
- `DOCKER_SETUP.md` - Infrastructure setup guide
