# User Import Tool

This tool imports users from CSV files and adds them to the database with event type access control.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Ensure the `.env` file is configured with the correct database URL:
```
DATABASE_URL=postgresql://docker:docker@localhost:55432/polls
```

## CSV Format

CSV files should use semicolon (`;`) as delimiter and have the following columns:

```
PersonID;Name
25107;Edward Tombre
25108;John Doe
```

## Usage

The event type is extracted from the CSV filename. For example:
- `conference.csv` → event type is `conference`
- `workshop.csv` → event type is `workshop`

Run the import script:

```bash
pnpm import data/conference.csv
pnpm import data/workshop.csv
```

## What It Does

For each user in the CSV file:

1. **Checks if user exists** in the database
2. **If user exists**: Adds the event type to their `allowedEventTypes` array (if not already present)
3. **If user doesn't exist**: Creates the user with the event type in their `allowedEventTypes` array

## Output

The script provides detailed feedback:

```
📥 Importing users from: conference.csv
📌 Event type: conference

📊 Processing 2 users...
✅ Created user 25107 (Edward Tombre) with access to: conference
ℹ️  User 25108 already has access to conference

📈 Import Summary:
   Total processed: 2
   Created: 1
   Updated: 0
   Event type: conference

✨ Import completed successfully!
```

## Error Handling

- Invalid records (missing PersonID or Name) are skipped with a warning
- Database errors are logged with details
- The script exits with code 1 on fatal errors

## Example Workflow

```bash
# Import conference attendees
pnpm import data/conference.csv

# Import workshop participants
pnpm import data/workshop.csv

# Same user can now vote on both conference and workshop events
```
