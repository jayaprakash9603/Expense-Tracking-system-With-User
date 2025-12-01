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

## Security & Authentication

### JWT Authentication Flow

**Token Generation** (User Service):
```java
// Generate JWT token after successful authentication
public class JwtProvider {
    private static final String SECRET_KEY = "your-secret-key"; // Use environment variable in production
    
    public static String generateToken(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        String roles = authorities.stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));
        
        String jwt = Jwts.builder()
            .setIssuedAt(new Date())
            .setExpiration(new Date(new Date().getTime() + 86400000)) // 24 hours
            .claim("email", auth.getName())
            .claim("authorities", roles)
            .signWith(key)
            .compact();
        
        return jwt;
    }
}
```

**Token Validation** (All Services via Gateway):
```java
@Component
public class JwtTokenValidator extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String jwt = request.getHeader("Authorization");
        
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
            
            try {
                SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
                Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();
                
                String email = String.valueOf(claims.get("email"));
                String authorities = String.valueOf(claims.get("authorities"));
                
                List<GrantedAuthority> auths = AuthorityUtils
                    .commaSeparatedStringToAuthorityList(authorities);
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                    email, null, auths);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (ExpiredJwtException e) {
                handleJwtException(response, 401, "Token has expired. Please login again.");
                return;
            } catch (MalformedJwtException e) {
                handleJwtException(response, 401, "Invalid token format.");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

**Frontend Token Management**:
```javascript
// Store token after login
localStorage.setItem("jwt", token);

// Axios interceptor automatically adds token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Role-Based Access Control

**Backend - Method Security**:
```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    // Only ADMIN role can access
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        // Implementation
    }
    
    // Multiple roles allowed
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/approve")
    public ResponseEntity<?> approveExpense(@RequestParam Long expenseId) {
        // Implementation
    }
    
    // Check specific permission
    @PreAuthorize("hasAuthority('EXPENSE_DELETE')")
    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        // Implementation
    }
}
```

**Frontend - Route Protection**:
```javascript
// ProtectedRoute component
function ProtectedRoute({ children, requiredRole }) {
  const user = useSelector(state => state.auth.user);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

// Usage in routes
<Route path="/admin" element={
  <ProtectedRoute requiredRole="ADMIN">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### CORS Configuration

**Backend - Spring Security**:
```java
@Configuration
@EnableWebSecurity
public class ApplicationConfiguration {
    
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll())
            .addFilterBefore(new JwtTokenValidator(), BasicAuthenticationFilter.class);
        
        return http.build();
    }
    
    private CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration cfg = new CorsConfiguration();
            cfg.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "https://your-production-domain.com"
            ));
            cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            cfg.setAllowedHeaders(Collections.singletonList("*"));
            cfg.setExposedHeaders(Arrays.asList("Authorization"));
            cfg.setAllowCredentials(true);
            cfg.setMaxAge(3600L);
            return cfg;
        };
    }
}
```

## Transaction Management

### Database Transactions

**Service Layer - Transactional Operations**:
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetNotificationProducer notificationProducer;
    
    // Basic transaction - auto rollback on exception
    @Transactional
    public BudgetDTO createBudget(CreateBudgetRequest request, Long userId) {
        // All database operations in single transaction
        Budget budget = budgetMapper.toEntity(request);
        budget.setUserId(userId);
        
        Budget savedBudget = budgetRepository.save(budget);
        
        // If this throws exception, budget save will rollback
        updateRelatedExpenses(savedBudget.getId());
        
        // Kafka events sent AFTER transaction commits
        notificationProducer.sendEvent(buildCreatedEvent(savedBudget));
        
        return budgetMapper.toDTO(savedBudget);
    }
    
    // Read-only transaction (optimization)
    @Transactional(readOnly = true)
    public BudgetDTO getBudgetById(Long budgetId) {
        return budgetRepository.findById(budgetId)
            .map(budgetMapper::toDTO)
            .orElseThrow(() -> new BudgetNotFoundException("Budget not found: " + budgetId));
    }
    
    // Transaction with specific isolation level
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void updateBudgetSpent(Long budgetId, BigDecimal amount) {
        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new BudgetNotFoundException("Budget not found"));
        
        budget.setSpentAmount(budget.getSpentAmount().add(amount));
        budgetRepository.save(budget);
    }
    
    // Transaction with custom rollback rules
    @Transactional(rollbackFor = {BusinessException.class, DataException.class},
                   noRollbackFor = {ValidationException.class})
    public void complexOperation() {
        // Implementation
    }
}
```

**Important Transaction Rules**:
1. ✅ Always use `@Transactional` on service methods that modify data
2. ✅ Use `readOnly = true` for query-only methods (performance optimization)
3. ✅ Keep transactions short - avoid long-running operations
4. ✅ Send Kafka events AFTER transaction commits (Spring handles this automatically)
5. ❌ Don't call `@Transactional` methods from same class (proxy limitation)
6. ❌ Don't catch exceptions without re-throwing (breaks rollback)

## Configuration Management

### Environment-Specific Configuration

**Application Properties Pattern**:
```yaml
# application.yml - Default configuration
server:
  port: ${SERVER_PORT:6005}

spring:
  application:
    name: BUDGET-SERVICE
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:5000/budget_service}
    username: ${SPRING_DATASOURCE_USERNAME:root}
    password: ${SPRING_DATASOURCE_PASSWORD:123456}
  kafka:
    bootstrap-servers: ${SPRING_KAFKA_BOOTSTRAP_SERVERS:localhost:9092}

eureka:
  client:
    serviceUrl:
      defaultZone: ${EUREKA_CLIENT_SERVICEURL_DEFAULTZONE:http://localhost:8761/eureka}

# Custom properties
kafka:
  topics:
    budget-events: ${KAFKA_TOPICS_BUDGET_EVENTS:budget-events}
```

**Profile-Specific Configuration**:
```yaml
# application-docker.yml - Docker environment
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/budget_service?createDatabaseIfNotExist=true
  kafka:
    bootstrap-servers: kafka:29092

eureka:
  client:
    serviceUrl:
      defaultZone: http://eureka-server:8761/eureka
```

**Using Configuration in Code**:
```java
@Component
public class BudgetNotificationProducer {
    
    // Inject with default value
    @Value("${kafka.topics.budget-events:budget-events}")
    private String topicName;
    
    @Value("${app.notification.retry.max-attempts:3}")
    private int maxRetryAttempts;
    
    @Value("${app.budget.threshold.warning:80.0}")
    private Double warningThreshold;
}
```

**Configuration Properties Class** (Type-safe):
```java
@Configuration
@ConfigurationProperties(prefix = "app.budget")
@Data
public class BudgetConfigProperties {
    private Threshold threshold = new Threshold();
    private Notification notification = new Notification();
    
    @Data
    public static class Threshold {
        private Double warning = 80.0;
        private Double critical = 95.0;
    }
    
    @Data
    public static class Notification {
        private Boolean enabled = true;
        private Integer batchSize = 100;
    }
}

// Usage
@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetConfigProperties config;
    
    public void checkThreshold(Budget budget) {
        if (budget.getPercentageUsed() >= config.getThreshold().getWarning()) {
            // Send warning
        }
    }
}
```

## WebSocket & Real-time Communication

### Backend WebSocket Configuration

**WebSocket Setup**:
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-notifications")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
```

**Sending WebSocket Messages**:
```java
@Service
@RequiredArgsConstructor
public class NotificationWebSocketService {
    private final SimpMessagingTemplate messagingTemplate;
    
    public void sendNotificationToUser(Long userId, NotificationDTO notification) {
        // Send to specific user
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/notifications",
            notification
        );
    }
    
    public void broadcastNotification(NotificationDTO notification) {
        // Broadcast to all connected users
        messagingTemplate.convertAndSend(
            "/topic/notifications",
            notification
        );
    }
}
```

### Frontend WebSocket Integration

**React WebSocket Hook**:
```javascript
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export function useWebSocket(userId) {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (!userId) return;
    
    const socket = new SockJS('http://localhost:6003/ws-notifications');
    const client = Stomp.over(socket);
    
    client.connect({}, () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Subscribe to user-specific notifications
      client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
        const notification = JSON.parse(message.body);
        setNotifications(prev => [notification, ...prev]);
      });
      
      // Subscribe to broadcast notifications
      client.subscribe('/topic/notifications', (message) => {
        const notification = JSON.parse(message.body);
        setNotifications(prev => [notification, ...prev]);
      });
    });
    
    setStompClient(client);
    
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [userId]);
  
  return { connected, notifications, stompClient };
}

// Usage in component
function NotificationPanel() {
  const userId = useSelector(state => state.auth.user?.id);
  const { connected, notifications } = useWebSocket(userId);
  
  return (
    <div>
      <div>Status: {connected ? 'Connected' : 'Disconnected'}</div>
      {notifications.map(notif => (
        <NotificationCard key={notif.id} notification={notif} />
      ))}
    </div>
  );
}
```

## Database Patterns

### Entity-DTO Mapping

**Entity** (Database representation):
```java
@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private String name;
    private BigDecimal amount;
    private BigDecimal spentAmount;
    
    @Enumerated(EnumType.STRING)
    private BudgetPeriod period;
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

**DTO** (API representation):
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {
    private Long id;
    private String name;
    private BigDecimal amount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
    private String period;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    // Computed fields not in database
    private Integer daysRemaining;
    private Boolean isExpired;
    private String status; // ACTIVE, EXCEEDED, EXPIRED
}
```

**Mapper** (Conversion logic):
```java
@Component
public class BudgetMapper {
    
    public BudgetDTO toDTO(Budget entity) {
        if (entity == null) return null;
        
        BudgetDTO dto = new BudgetDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setAmount(entity.getAmount());
        dto.setSpentAmount(entity.getSpentAmount());
        
        // Computed fields
        BigDecimal remaining = entity.getAmount().subtract(entity.getSpentAmount());
        dto.setRemainingAmount(remaining);
        
        double percentage = entity.getSpentAmount()
            .divide(entity.getAmount(), 2, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .doubleValue();
        dto.setPercentageUsed(percentage);
        
        // Status logic
        if (LocalDateTime.now().isAfter(entity.getEndDate())) {
            dto.setStatus("EXPIRED");
        } else if (percentage >= 100) {
            dto.setStatus("EXCEEDED");
        } else {
            dto.setStatus("ACTIVE");
        }
        
        return dto;
    }
    
    public Budget toEntity(BudgetDTO dto) {
        if (dto == null) return null;
        
        Budget entity = new Budget();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setAmount(dto.getAmount());
        entity.setSpentAmount(dto.getSpentAmount());
        // Don't map computed fields
        
        return entity;
    }
}
```

### Repository Patterns

**Standard Repository**:
```java
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    // Query methods - Spring Data JPA generates implementation
    List<Budget> findByUserId(Long userId);
    
    List<Budget> findByUserIdAndEndDateAfter(Long userId, LocalDateTime date);
    
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.spentAmount >= b.amount")
    List<Budget> findExceededBudgets(@Param("userId") Long userId);
    
    // Custom query with pagination
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId ORDER BY b.createdAt DESC")
    Page<Budget> findByUserIdOrderByCreatedAtDesc(
        @Param("userId") Long userId, 
        Pageable pageable
    );
    
    // Modifying query
    @Modifying
    @Query("UPDATE Budget b SET b.spentAmount = :amount WHERE b.id = :id")
    int updateSpentAmount(@Param("id") Long id, @Param("amount") BigDecimal amount);
}
```

### Schema Naming Convention

**Per-Service Database Schema**:
- `expense_user_service` - User service schema
- `expense_tracker` - Main expense tracking schema
- `budget_service` - Budget service schema
- `bill_service` - Bill service schema
- `category_service` - Category service schema
- `payment_service` - Payment method service schema
- `notification_service` - Notification service schema
- `audit_service` - Audit service schema
- `chat_service` - Chat service schema
- `friendship_service` - Friendship service schema

## Performance Optimization

### Redis Caching (Chat Service)

**Cache Configuration**:
```java
@Configuration
@EnableCaching
public class RedisCacheConfig {
    
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

**Using Cache**:
```java
@Service
@RequiredArgsConstructor
public class ChatService {
    
    @Cacheable(value = "chatHistory", key = "#userId")
    public List<ChatMessageDTO> getChatHistory(Long userId) {
        return chatRepository.findByUserId(userId)
            .stream()
            .map(chatMapper::toDTO)
            .collect(Collectors.toList());
    }
    
    @CacheEvict(value = "chatHistory", key = "#userId")
    public void sendMessage(Long userId, ChatMessage message) {
        chatRepository.save(message);
    }
    
    @CacheEvict(value = "chatHistory", allEntries = true)
    public void clearAllChats() {
        chatRepository.deleteAll();
    }
}
```

### Kafka Partitioning Strategy

**Partition by User ID** (maintains ordering per user):
```java
@Override
protected String generatePartitionKey(BudgetNotificationEvent event) {
    return event.getUserId().toString(); // All events for same user go to same partition
}
```

**Benefits**:
- ✅ Guarantees message order per user
- ✅ Load distribution across partitions
- ✅ Parallel processing for different users

### Query Optimization

**Pagination**:
```java
@GetMapping("/expenses")
public ResponseEntity<Page<ExpenseDTO>> getExpenses(
        @RequestParam Long userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<Expense> expenses = expenseRepository.findByUserId(userId, pageable);
    Page<ExpenseDTO> dtoPage = expenses.map(expenseMapper::toDTO);
    
    return ResponseEntity.ok(dtoPage);
}
```

**Batch Processing**:
```java
@Service
public class BudgetBatchService {
    
    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void processExceededBudgets() {
        List<Budget> exceededBudgets = budgetRepository.findExceededBudgets();
        
        // Process in batches of 100
        List<List<Budget>> batches = Lists.partition(exceededBudgets, 100);
        
        for (List<Budget> batch : batches) {
            batch.forEach(this::sendExceededNotification);
        }
    }
}
```

## Testing Guidelines

### Unit Testing

**Service Layer Tests**:
```java
@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {
    
    @Mock
    private BudgetRepository budgetRepository;
    
    @Mock
    private BudgetNotificationProducer notificationProducer;
    
    @InjectMocks
    private BudgetService budgetService;
    
    @Test
    void createBudget_ShouldSaveAndSendNotification() {
        // Given
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setName("Monthly Budget");
        request.setAmount(BigDecimal.valueOf(1000));
        
        Budget savedBudget = new Budget();
        savedBudget.setId(1L);
        
        when(budgetRepository.save(any(Budget.class))).thenReturn(savedBudget);
        
        // When
        BudgetDTO result = budgetService.createBudget(request, 1L);
        
        // Then
        assertNotNull(result);
        verify(budgetRepository).save(any(Budget.class));
        verify(notificationProducer).sendEvent(any(BudgetNotificationEvent.class));
    }
    
    @Test
    void getBudgetById_WhenNotFound_ShouldThrowException() {
        // Given
        when(budgetRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(BudgetNotFoundException.class, 
            () -> budgetService.getBudgetById(1L));
    }
}
```

**Controller Tests**:
```java
@WebMvcTest(BudgetController.class)
class BudgetControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private BudgetService budgetService;
    
    @Test
    void createBudget_ShouldReturn201() throws Exception {
        // Given
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setName("Monthly Budget");
        request.setAmount(BigDecimal.valueOf(1000));
        
        BudgetDTO response = new BudgetDTO();
        response.setId(1L);
        
        when(budgetService.createBudget(any(), any())).thenReturn(response);
        
        // When & Then
        mockMvc.perform(post("/api/budgets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer " + validToken))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1));
    }
}
```

### Frontend Testing

**Component Tests**:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import BudgetCard from './BudgetCard';

describe('BudgetCard', () => {
  it('should display budget information', () => {
    const budget = {
      id: 1,
      name: 'Monthly Budget',
      amount: 1000,
      spentAmount: 500,
      percentageUsed: 50
    };
    
    render(
      <Provider store={store}>
        <BudgetCard budget={budget} />
      </Provider>
    );
    
    expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
  
  it('should call onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    
    render(
      <Provider store={store}>
        <BudgetCard budget={budget} onEdit={onEdit} />
      </Provider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(1);
  });
});
```

## Key Files for Context

- `docker-compose.yml` - Full infrastructure + service orchestration
- `Gateway/src/main/resources/application.yaml` - All API routes
- `start-all-services.ps1` - Service startup order and dependencies
- `src/config/api.js` - Frontend API configuration
- `Notification-Service/KAFKA_TOPICS_REFERENCE.md` - Complete event schemas
- `DOCKER_SETUP.md` - Infrastructure setup guide
