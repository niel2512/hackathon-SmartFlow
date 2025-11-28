# SmartFlow Production Setup Guide

## Data Persistence

All data entered into SmartFlow is now permanently stored in the database. There is no more data reset on refresh.

### Key Features:

1. **Persistent Storage**
   - All user data, products, orders, and automation rules are stored permanently
   - Data survives application restarts and page refreshes
   - Admin and staff user data is always retained in the database

2. **Data Validation**
   - All input data is validated before being saved
   - Invalid requests return clear error messages with specific field details
   - Database constraints prevent corrupted data

3. **Error Handling**
   - API routes return standardized error responses
   - Each error includes a code for programmatic handling
   - Detailed error messages guide users to correct issues

4. **Audit Logging**
   - Every create, update, and delete operation is logged
   - Audit logs include user context, timestamp, and detailed change records
   - Admin users can review the complete audit trail via `/api/admin/database?action=audit-logs`

## API Endpoints

### Products
- `GET /api/products` - Retrieve all products
- `POST /api/products` - Create a new product
- `GET /api/products/[id]` - Get a specific product
- `PATCH /api/products/[id]` - Update a product
- `DELETE /api/products/[id]` - Delete a product

### Orders
- `GET /api/orders` - Retrieve all orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/[id]` - Get a specific order
- `PATCH /api/orders/[id]` - Update order status or details
- `DELETE /api/orders/[id]` - Delete an order

### Workflows
- `GET /api/workflows` - Retrieve all workflow rules
- `POST /api/workflows` - Create a new workflow rule
- `DELETE /api/workflows/[id]` - Delete a workflow rule

### Admin Management
- `GET /api/admin/backup?action=statistics` - Get data statistics
- `GET /api/admin/backup?action=export-json` - Export all data as JSON
- `GET /api/admin/backup?action=export-products-csv` - Export products as CSV
- `GET /api/admin/backup?action=export-orders-csv` - Export orders as CSV
- `GET /api/admin/backup?action=migration-history` - View migration history
- `GET /api/admin/database?action=health` - Check database health
- `GET /api/admin/database?action=summary` - Get data summary
- `GET /api/admin/database?action=integrity` - Validate data integrity
- `GET /api/admin/database?action=audit-logs` - Retrieve audit logs

## Data Backup

### Automated Backups
- Create backups via `/api/admin/backup?action=export-json`
- Export products and orders as CSV for external analysis
- Store backups in a secure location outside the application

### Migration Tracking
- All data migrations are tracked with timestamps and status
- Review migration history via `/api/admin/backup?action=migration-history`

## Database Health Monitoring

### Health Checks
- Run health checks via `/api/admin/database?action=health`
- Checks for data integrity issues, missing products, and low stock alerts

### Data Summary
- View aggregate data via `/api/admin/database?action=summary`
- Includes order counts by status, revenue totals, and inventory metrics

## Validation Rules

### Product Validation
- Name: Required, non-empty string
- Stock: Non-negative number
- Minimum Stock: Non-negative number
- Price: Non-negative number

### Order Validation
- Customer Name: Required, non-empty string
- Items: At least one item required
  - Product ID: Must exist in inventory
  - Quantity: Positive number, cannot exceed available stock
  - Price: Non-negative number
- Status: Must be one of "Pending", "Processing", or "Completed"

### Workflow Validation
- Trigger: Must be one of "New Order", "Low Stock", or "Order Completed"
- Action: Must be one of "Send Notification", "Reduce Stock", or "Assign Staff"

## Error Handling

All API endpoints return standardized error responses with the following format:

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { "field": "error details" },
  "timestamp": "2025-11-28T10:30:00.000Z"
}
\`\`\`

### Common Error Codes
- `VALIDATION_ERROR`: Input data failed validation
- `NOT_FOUND`: Requested resource not found
- `INSUFFICIENT_STOCK`: Product has insufficient inventory
- `INVALID_OPERATION`: Operation not allowed in current state
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_ERROR`: Unexpected server error

## Security Notes

1. **Data Protection**
   - All data modifications are audit-logged
   - Only authenticated users can access the system
   - Admin users have access to audit trails and backups

2. **Input Validation**
   - All user inputs are validated server-side
   - Invalid data is rejected before being stored
   - Prevents data corruption and injection attacks

3. **Backup Strategy**
   - Regular backups should be created and stored securely
   - Use the export endpoints to create offline backups
   - Store backups in a separate secure location

## Troubleshooting

### Data Integrity Issues
- Run `/api/admin/database?action=integrity` to identify problems
- Review audit logs to understand when issues occurred
- Contact support with integrity check results

### Missing Products in Orders
- Ensure products exist before creating orders
- Validate product references in audit logs
- Check data export for consistency

### Low Stock Alerts
- Review products with `stock < minStock`
- Update minimum stock levels as needed
- Monitor inventory regularly via dashboard
