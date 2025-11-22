# Import Tools

This directory contains tools for importing users and load testing the voting system.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Ensure the `.env` file is configured with the correct database URL:
```
DATABASE_URL=postgresql://docker:docker@localhost:55432/polls
```

## Tools

### 1. User Import Tool

Imports users from CSV files and adds them to the database with event type access control.

## CSV Format

CSV files should use semicolon (`;`) as delimiter and have the following columns:

```
PersonID;Name
25107;Edward Tombre
25108;John Doe
```

#### Usage

The event type is extracted from the CSV filename. For example:
- `conference.csv` → event type is `conference`
- `workshop.csv` → event type is `workshop`

Run the import script:

```bash
pnpm import data/conference.csv
pnpm import data/workshop.csv
```

#### What It Does

For each user in the CSV file:

1. **Checks if user exists** in the database
2. **If user exists**: Adds the event type to their `allowedEventTypes` array (if not already present)
3. **If user doesn't exist**: Creates the user with the event type in their `allowedEventTypes` array

#### Output

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

#### Error Handling

- Invalid records (missing PersonID or Name) are skipped with a warning
- Database errors are logged with details
- The script exits with code 1 on fatal errors

#### Example Workflow

```bash
# Import conference attendees
pnpm import data/conference.csv

# Import workshop participants
pnpm import data/workshop.csv

# Same user can now vote on both conference and workshop events
```

### 2. Load Test Tool

Generates random votes for a poll to test the system under load. Useful for testing real-time updates and WebSocket connections.

#### Features

- Generates votes with configurable bias towards the first option (default: 75%)
- Creates unique test users for each vote
- Runs for a specified duration (default: 15 seconds)
- Displays real-time feedback and statistics

#### Usage

```bash
pnpm load-test <pollId> [duration] [targetVotes] [firstOptionBias]
```

**Parameters:**
- `pollId` (required): UUID of the poll to test
- `duration` (optional): Duration in seconds (default: 15, max: 3600)
- `targetVotes` (optional): Number of votes to generate (default: 10, max: 10000)
- `firstOptionBias` (optional): Percentage chance for first option (default: 75, range: 0-100)

#### Examples

```bash
# Generate 10 votes over 15 seconds with 75% bias to first option
pnpm load-test 550e8400-e29b-41d4-a716-446655440000

# Generate 50 votes over 30 seconds with 50% bias (random distribution)
pnpm load-test 550e8400-e29b-41d4-a716-446655440000 30 50 50

# Generate 100 votes over 60 seconds with 90% bias to first option
pnpm load-test 550e8400-e29b-41d4-a716-446655440000 60 100 90

# Generate 5 votes over 10 seconds with default bias
pnpm load-test 550e8400-e29b-41d4-a716-446655440000 10 5
```

#### Output

The script provides real-time feedback:

```
🚀 Starting load test...
📊 Poll ID: 550e8400-e29b-41d4-a716-446655440000
⏱️  Duration: 30 seconds
🎯 Target votes: 50
📈 First option bias: 75%

📋 Poll: What's your favorite framework?
📝 Options:
   1. Vue.js
   2. React
   3. Angular

⏳ Generating 50 votes over 30 seconds...

✓ Vote cast for option: Vue.js
✓ Vote cast for option: Vue.js
✓ Vote cast for option: React
✓ Vote cast for option: Vue.js
...

✅ Load test completed!
📊 Total votes generated: 50
⏱️  Actual duration: 30.15 seconds
```

#### How It Works

1. Fetches poll details including all options and associated event
2. Calculates interval between votes to distribute them evenly across the duration
3. For each vote:
   - Waits for calculated interval (with ±20% random jitter)
   - Selects an option based on the bias percentage
   - Creates a unique test user via `/auth/register` API
   - Authenticates the user via `/auth/login` API to get token
   - Casts vote via `/events/:eventId/polls/:pollId/votes` API endpoint
4. Continues until target votes reached or duration exceeded
5. Reports total votes generated and actual duration

**Vote Distribution**: Votes are evenly distributed across the duration with slight randomness to simulate realistic voting patterns. For example:
- 10 votes over 30 seconds = 1 vote every 3 seconds (with jitter)
- 100 votes over 60 seconds = 1 vote every 0.6 seconds (with jitter)

**Important**: The load test uses the actual API endpoints, which means:
- ✅ WebSocket pub-sub is triggered for each vote
- ✅ Real-time updates are sent to connected clients
- ✅ Vote counts are published to WebSocket subscribers
- ✅ Admin panel and widget see live vote updates

#### Testing Real-time Updates

Use this tool to test WebSocket connections and real-time vote updates:

1. Start the backend API server
2. Open the admin panel in a browser to see live vote counts
3. Run the load test in another terminal
4. Watch vote counts update in real-time as votes are generated

**Example workflow**:
```bash
# Terminal 1: Start the API
cd api && pnpm dev

# Terminal 2: Start the admin panel
cd admin && pnpm dev

# Terminal 3: Run the load test
cd import && pnpm load-test 6f2aa768-9efb-4edd-aaf4-86f8c7403bce 30 75
```

Watch the admin panel as votes come in - you should see the vote counts update in real-time!
