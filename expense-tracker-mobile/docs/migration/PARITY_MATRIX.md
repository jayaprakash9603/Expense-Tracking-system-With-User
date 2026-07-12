# Parity Matrix (Old Frontend -> Mobile App)

Track parity from `expense-tracking-frontend` to `expense-tracker-mobile`.

| Capability                 | Old Source                                      | New Target                                      | Status  | Owner         | Notes   |
| -------------------------- | ----------------------------------------------- | ----------------------------------------------- | ------- | ------------- | ------- |
| Filter popover             | `src/components/FilterPopover.jsx`              | `features/*/components` shared filter primitive | planned | reports       | Phase 3 |
| Generic accordion group    | `src/components/GenericAccordionGroup.jsx`      | shared grouped list pattern                     | planned | expenses      | Phase 3 |
| Report customization modal | `src/components/ReportCustomizationModal.jsx`   | shared report customization framework           | planned | reports       | Phase 3 |
| Preview data grid          | `src/components/PreviewDataGrid.jsx`            | shared data table abstraction                   | planned | reports       | Phase 3 |
| Floating notifications     | `src/components/common/FloatingNotifications/*` | `features/notifications` + shared toast wrapper | planned | notifications | Phase 3 |
| Notification websocket     | `src/services/notificationWebSocket.js`         | `infrastructure/websocket` service              | planned | notifications | Phase 3 |
| Split calculator modal     | `src/components/SplitCalculatorModal.jsx`       | group expense flow                              | planned | groups        | Phase 4 |
| Chart controls/drilldown   | `src/components/charts/*`                       | analytics/reports shared chart controls         | planned | analytics     | Phase 4 |
| Admin analytics/roles      | `src/pages/Admin/*`                             | `features/system`                               | planned | system        | Phase 5 |

Update this matrix in each phase PR.
