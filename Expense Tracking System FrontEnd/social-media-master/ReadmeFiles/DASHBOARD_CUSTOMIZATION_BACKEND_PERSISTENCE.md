# Dashboard Customization with Backend Persistence

## Overview

This feature allows users to customize their dashboard layout (reorder sections, hide/show sections) and persist these preferences in the backend database, ensuring the same layout across devices and sessions.

## Architecture

### Backend Components

1. **Entity**: `DashboardPreference`
   - Stores user-specific dashboard configurations
   - One preference per user (unique constraint on user_id)
   - JSON-encoded layout configuration

2. **Repository**: `DashboardPreferenceRepository`
   - CRUD operations for dashboard preferences
   - Methods: `findByUserId`, `existsByUserId`, `deleteByUserId`

3. **Service**: `DashboardPreferenceService`
   - Business logic for managing preferences
   - Integrates with `UserService` for authentication
   - Handles JSON serialization/deserialization

4. **Controller**: `DashboardPreferenceController`
   - REST endpoints at `/api/user/dashboard-preferences`
   - JWT-authenticated endpoints
   - Error handling and validation

5. **Database Table**: `dashboard_preferences`
   ```sql
   - id (BIGINT, PRIMARY KEY)
   - user_id (INT, UNIQUE, NOT NULL, FK to users.id)
   - layout_config (TEXT, NOT NULL) -- JSON string
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   ```

### Frontend Components

1. **Hook**: `useDashboardLayout.js`
   - Manages dashboard section state
   - Loads preferences from backend on mount
   - Falls back to localStorage if backend unavailable
   - Auto-saves to backend when layout changes

2. **Provider**: `DashboardProvider.jsx`
   - Context provider using `useDashboardLayout` hook
   - Exposes layout configuration to dashboard components

3. **Modal**: `DashboardCustomizationModal.jsx`
   - UI for customizing dashboard layout
   - Drag-and-drop reordering
   - Toggle visibility of sections
   - Reset to defaults

## API Endpoints

### Get Dashboard Preference
```http
GET /api/user/dashboard-preferences
Authorization: Bearer <JWT>

Response 200:
{
  "id": 1,
  "userId": 123,
  "layoutConfig": "[{\"id\":\"metrics\",\"name\":\"Key Metrics\",\"visible\":true,\"type\":\"full\"}...]",
  "createdAt": "2025-12-03T10:00:00",
  "updatedAt": "2025-12-03T15:30:00"
}

Response 404:
{
  "message": "No custom dashboard preference found. Using defaults."
}
```

### Save/Update Dashboard Preference
```http
POST /api/user/dashboard-preferences
Authorization: Bearer <JWT>
Content-Type: text/plain

Body: "[{\"id\":\"metrics\",\"name\":\"Key Metrics\",\"visible\":true,\"type\":\"full\"}...]"

Response 200:
{
  "message": "Dashboard preference saved successfully",
  "preference": {
    "id": 1,
    "userId": 123,
    "layoutConfig": "...",
    "createdAt": "2025-12-03T10:00:00",
    "updatedAt": "2025-12-03T15:30:00"
  }
}
```

### Reset Dashboard Preference
```http
DELETE /api/user/dashboard-preferences
Authorization: Bearer <JWT>

Response 200:
{
  "message": "Dashboard preference reset to default successfully"
}
```

## Layout Configuration Format

The `layoutConfig` is a JSON string representing an array of section objects:

```json
[
  {
    "id": "metrics",
    "name": "Key Metrics",
    "visible": true,
    "type": "full"
  },
  {
    "id": "category-breakdown",
    "name": "Category Breakdown",
    "visible": false,
    "type": "half"
  }
]
```

**Section Properties**:
- `id` (string): Unique identifier for the section
- `name` (string): Display name
- `visible` (boolean): Whether section is shown on dashboard
- `type` (string): Layout type - `"full"`, `"half"`, or `"bottom"`

## Default Sections

```javascript
const DEFAULT_SECTIONS = [
  { id: 'metrics', name: 'Key Metrics', visible: true, type: 'full' },
  { id: 'daily-spending', name: 'Daily Spending', visible: true, type: 'full' },
  { id: 'quick-access', name: 'Quick Access', visible: true, type: 'full' },
  { id: 'summary-overview', name: 'Summary Overview', visible: true, type: 'half' },
  { id: 'category-breakdown', name: 'Category Breakdown', visible: true, type: 'half' },
  { id: 'monthly-trend', name: 'Monthly Trend', visible: true, type: 'half' },
  { id: 'payment-methods', name: 'Payment Methods', visible: true, type: 'half' },
  { id: 'recent-transactions', name: 'Recent Transactions', visible: true, type: 'bottom' },
  { id: 'budget-overview', name: 'Budget Overview', visible: true, type: 'bottom' },
];
```

## Usage

### Opening Customization Modal

```jsx
import DashboardCustomizationModal from '../../components/DashboardCustomizationModal';
import { useDashboardContext } from './DashboardProvider';

function MyComponent() {
  const { layoutConfig } = useDashboardContext();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>Customize Dashboard</button>
      
      <DashboardCustomizationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sections={layoutConfig.sections}
        onToggleSection={layoutConfig.toggleSection}
        onReorderSections={layoutConfig.reorderSections}
        onResetLayout={layoutConfig.resetLayout}
        onSaveLayout={layoutConfig.saveLayout}
      />
    </>
  );
}
```

### Rendering Dashboard Sections

```jsx
function DashboardContent() {
  const { layoutConfig } = useDashboardContext();
  
  const fullWidthSections = layoutConfig.getFullWidthSections();
  const halfWidthSections = layoutConfig.getHalfWidthSections();
  const bottomSections = layoutConfig.getBottomSections();
  
  return (
    <>
      {/* Full-width sections */}
      {fullWidthSections.map(section => renderSection(section))}
      
      {/* Half-width sections in grid */}
      <div className="chart-row">
        {halfWidthSections.map(section => renderSection(section))}
      </div>
      
      {/* Bottom sections */}
      <div className="bottom-section">
        {bottomSections.map(section => renderSection(section))}
      </div>
    </>
  );
}
```

## Data Flow

1. **Load on Mount**:
   ```
   User opens dashboard
   → useDashboardLayout.useEffect()
   → API GET /api/user/dashboard-preferences
   → Parse JSON → Merge with defaults → Set state
   → If 404, fallback to localStorage → If none, use defaults
   ```

2. **Save Changes**:
   ```
   User customizes layout
   → saveLayout(newSections)
   → Serialize to JSON
   → API POST /api/user/dashboard-preferences
   → Also save to localStorage (backup)
   → Update state
   ```

3. **Reset**:
   ```
   User clicks "Reset to Default"
   → resetLayout()
   → API DELETE /api/user/dashboard-preferences
   → Remove from localStorage
   → Set state to DEFAULT_SECTIONS
   ```

## Error Handling

- **Backend Unavailable**: Falls back to localStorage
- **Network Failure**: Still updates local state, keeps localStorage backup
- **Invalid JSON**: Logs error, uses defaults
- **No JWT**: Returns 401, user redirected to login

## Database Migration

Run the migration script to create the table:
```sql
-- Located at: user-service/src/main/resources/db/migration/V2__create_dashboard_preferences_table.sql
```

For manual setup:
```bash
mysql -u root -p expense_user_service < V2__create_dashboard_preferences_table.sql
```

## Security

- All endpoints require JWT authentication
- User can only access/modify their own preferences
- Foreign key constraint ensures data integrity (CASCADE on user deletion)
- Input validation on layout configuration

## Performance

- **Caching**: Layout loaded once on mount, cached in React state
- **Debouncing**: Consider implementing debounce for auto-save (future enhancement)
- **Lazy Loading**: Dashboard sections rendered conditionally based on visibility

## Future Enhancements

1. **Versioning**: Track layout version for migrations when new sections added
2. **Templates**: Predefined layouts (e.g., "Minimal", "Power User", "Analytics Focused")
3. **Sharing**: Allow users to share custom layouts with others
4. **Analytics**: Track most popular section arrangements
5. **Section Sizing**: Allow custom widths/heights per section
6. **Nested Sections**: Support grouping sections into tabs/accordions

## Troubleshooting

**Issue**: Preferences not saving
- Check JWT token validity
- Verify user-service is running
- Check database connection
- Review backend logs for errors

**Issue**: Layout not loading on refresh
- Check browser console for API errors
- Verify JWT token in Authorization header
- Check if database table exists
- Ensure foreign key constraint allows user's preference

**Issue**: Reset not working
- Check DELETE endpoint permissions
- Verify localStorage is cleared
- Ensure DEFAULT_SECTIONS is properly defined

## Testing

### Backend Tests
```java
// Test saving preference
DashboardPreferenceDTO dto = service.saveDashboardPreference(jwt, layoutJson);
assertNotNull(dto.getId());

// Test retrieving preference
Optional<DashboardPreferenceDTO> found = service.getUserDashboardPreference(jwt);
assertTrue(found.isPresent());

// Test reset
service.resetDashboardPreference(jwt);
Optional<DashboardPreferenceDTO> deleted = service.getUserDashboardPreference(jwt);
assertFalse(deleted.isPresent());
```

### Frontend Tests
```javascript
// Test loading from backend
await waitFor(() => {
  expect(mockApi.get).toHaveBeenCalledWith('/api/user/dashboard-preferences');
});

// Test saving layout
await act(async () => {
  await saveLayout(customSections);
});
expect(mockApi.post).toHaveBeenCalled();

// Test reset
await act(async () => {
  await resetLayout();
});
expect(mockApi.delete).toHaveBeenCalled();
```

## References

- **Backend Path**: `Expense-tracking-System-backend/Expense-tracking-backend-main/user-service/`
- **Frontend Path**: `Expense Tracking System FrontEnd/social-media-master/src/`
- **Database**: `expense_user_service` schema
- **API Base URL**: `http://localhost:8080/api/user/dashboard-preferences` (via Gateway)
