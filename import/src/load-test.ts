import { PrismaClient } from "@prisma/client";
import process from "process";
import axios from "axios";
import { createHash } from "crypto";

const prisma = new PrismaClient();
const API_URL = process.env.VITE_API_URL || "http://localhost:3333";
const AUTH_SECRET = process.env.AUTH_SECRET || "your-secret-key-change-in-production";

// Helper to generate password hash
function generatePasswordHash(personID: string): string {
    return createHash("md5").update(personID + AUTH_SECRET).digest("hex");
}

interface LoadTestOptions {
    pollId: string;
    duration: number; // in seconds
    targetVotes: number; // number of votes to generate
    firstOptionBias: number; // percentage (0-100)
}

async function getPollDetails(pollId: string) {
    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            event: {
                select: {
                    id: true,
                },
            },
            options: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    if (!poll) {
        throw new Error(`Poll with ID ${pollId} not found`);
    }

    if (!poll.event) {
        throw new Error(`Poll ${pollId} is not associated with an event`);
    }

    if (poll.options.length === 0) {
        throw new Error(`Poll ${pollId} has no options`);
    }

    return poll;
}

async function generateRandomVote(
    eventId: string,
    pollId: string,
    options: Array<{ id: string; title: string }>,
    firstOptionBias: number
): Promise<void> {
    // Select option based on bias
    let selectedOptionId: string;
    const random = Math.random() * 100;

    if (random < firstOptionBias && options.length > 0) {
        // Select first option
        selectedOptionId = options[0].id;
    } else {
        // Select random option
        selectedOptionId = options[Math.floor(Math.random() * options.length)].id;
    }

    // Generate unique personID for this vote
    const personID = `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create user via API (register)
    let token: string;
    try {
        const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
            personID,
            name: `Test User ${personID}`,
        });
        token = registerResponse.data.token;
    } catch (error: any) {
        // User might already exist, try to login
        if (error.response?.status === 400) {
            try {
                const passwordHash = generatePasswordHash(personID);
                const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
                    personID,
                    password: passwordHash,
                });
                token = loginResponse.data.token;
            } catch (loginError: any) {
                console.error("Failed to login:", loginError.response?.data?.message || loginError.message);
                return;
            }
        } else {
            console.error("Failed to register user:", error.response?.data?.message || error.message);
            return;
        }
    }

    // Cast vote via API
    try {
        await axios.post(
            `${API_URL}/api/events/${eventId}/polls/${pollId}/votes`,
            { pollOptionId: selectedOptionId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✓ Vote cast for option: ${options.find(o => o.id === selectedOptionId)?.title}`);
    } catch (error: any) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes("already voted")) {
            console.log(`⚠ User ${personID} already voted`);
        } else if (error.response?.status === 403) {
            console.log(`⚠ User ${personID} doesn't have access to this event type`);
        } else {
            console.error("Failed to cast vote:", error.response?.data?.message || error.message);
        }
    }
}

async function runLoadTest(options: LoadTestOptions): Promise<void> {
    console.log("\n🚀 Starting load test...");
    console.log(`📊 Poll ID: ${options.pollId}`);
    console.log(`⏱️  Duration: ${options.duration} seconds`);
    console.log(`🎯 Target votes: ${options.targetVotes}`);
    console.log(`📈 First option bias: ${options.firstOptionBias}%`);

    // Get poll details
    const poll = await getPollDetails(options.pollId);
    console.log(`\n📋 Poll: ${poll.title}`);
    console.log(`📝 Options:`);
    poll.options.forEach((opt, idx) => {
        console.log(`   ${idx + 1}. ${opt.title}`);
    });

    const startTime = Date.now();
    const endTime = startTime + options.duration * 1000;
    let voteCount = 0;

    console.log(`\n⏳ Generating ${options.targetVotes} votes over ${options.duration} seconds...\n`);

    // Calculate interval between votes to distribute them evenly
    const intervalMs = (options.duration * 1000) / options.targetVotes;

    // Generate votes at calculated intervals
    for (let i = 0; i < options.targetVotes; i++) {
        // Add random jitter (±20% of interval) to make it less uniform
        const jitter = (Math.random() - 0.5) * intervalMs * 0.4;
        const delay = Math.max(100, intervalMs + jitter);
        
        await new Promise(resolve => setTimeout(resolve, delay));

        // Stop if we've exceeded the duration
        if (Date.now() > endTime) {
            break;
        }

        try {
            await generateRandomVote(poll.event.id, options.pollId, poll.options, options.firstOptionBias);
            voteCount++;
        } catch (error) {
            console.error(`❌ Error generating vote: ${error}`);
        }
    }

    console.log(`\n✅ Load test completed!`);
    console.log(`📊 Total votes generated: ${voteCount}`);
    console.log(`⏱️  Actual duration: ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
}

async function main() {
    try {
        // Parse command line arguments
        const pollId = process.argv[2];
        const duration = parseInt(process.argv[3] || "15", 10);
        const targetVotes = parseInt(process.argv[4] || "10", 10);
        const firstOptionBias = parseInt(process.argv[5] || "75", 10);

        if (!pollId) {
            console.error("Usage: tsx src/load-test.ts <pollId> [duration] [targetVotes] [firstOptionBias]");
            console.error("  pollId: UUID of the poll to test");
            console.error("  duration: Duration in seconds (default: 15)");
            console.error("  targetVotes: Number of votes to generate (default: 10)");
            console.error("  firstOptionBias: Percentage chance for first option (default: 75)");
            process.exit(1);
        }

        if (duration < 1 || duration > 3600) {
            console.error("Duration must be between 1 and 3600 seconds");
            process.exit(1);
        }

        if (targetVotes < 1 || targetVotes > 10000) {
            console.error("Target votes must be between 1 and 10000");
            process.exit(1);
        }

        if (firstOptionBias < 0 || firstOptionBias > 100) {
            console.error("First option bias must be between 0 and 100");
            process.exit(1);
        }

        await runLoadTest({
            pollId,
            duration,
            targetVotes,
            firstOptionBias,
        });
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
