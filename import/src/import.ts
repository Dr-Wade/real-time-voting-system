import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { basename } from "path";
import { argv } from "process";

const prisma = new PrismaClient();

interface UserRecord {
  PersonID: string;
  Name: string;
}

async function importUsersFromCSV(filePath: string): Promise<void> {
  // Extract event type from filename (e.g., "conference.csv" -> "conference")
  const filename = basename(filePath);
  const eventType = filename.replace(/\.csv$/i, "");

  if (!eventType) {
    throw new Error("Could not determine event type from filename");
  }

  console.log(`\n📥 Importing users from: ${filename}`);
  console.log(`📌 Event type: ${eventType}`);

  const users: UserRecord[] = [];
  let processedCount = 0;
  let createdCount = 0;
  let updatedCount = 0;

  return new Promise((resolve, reject) => {
    const parser = createReadStream(filePath).pipe(
      parse({
        delimiter: ";",
        columns: true,
        skip_empty_lines: true,
      })
    );

    parser.on("readable", async function () {
      let record: UserRecord | null;
      while ((record = parser.read()) !== null) {
        users.push(record);
      }
    });

    parser.on("error", (error) => {
      reject(new Error(`CSV parsing error: ${error.message}`));
    });

    parser.on("end", async () => {
      try {
        console.log(`\n📊 Processing ${users.length} users...`);

        for (const user of users) {
          const personID = user.PersonID?.trim();
          const name = user.Name?.trim();

          if (!personID || !name) {
            console.warn(
              `⚠️  Skipping invalid record: PersonID=${personID}, Name=${name}`
            );
            continue;
          }

          processedCount++;

          try {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
              where: { personID },
            });

            if (existingUser) {
              // User exists, add event type to allowedEventTypes if not already present
              const updatedTypes = Array.from(
                new Set([...existingUser.allowedEventTypes, eventType])
              );

              if (updatedTypes.length > existingUser.allowedEventTypes.length) {
                await prisma.user.update({
                  where: { personID },
                  data: { allowedEventTypes: updatedTypes },
                });
                console.log(
                  `✏️  Updated user ${personID} - added event type: ${eventType}`
                );
                updatedCount++;
              } else {
                console.log(
                  `ℹ️  User ${personID} already has access to ${eventType}`
                );
              }
            } else {
              // Create new user with event type
              await prisma.user.create({
                data: {
                  personID,
                  name,
                  allowedEventTypes: [eventType],
                },
              });
              console.log(
                `✅ Created user ${personID} (${name}) with access to: ${eventType}`
              );
              createdCount++;
            }
          } catch (error) {
            console.error(
              `❌ Error processing user ${personID}:`,
              error instanceof Error ? error.message : error
            );
          }
        }

        console.log(`\n📈 Import Summary:`);
        console.log(`   Total processed: ${processedCount}`);
        console.log(`   Created: ${createdCount}`);
        console.log(`   Updated: ${updatedCount}`);
        console.log(`   Event type: ${eventType}`);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function main(): Promise<void> {
  try {
    const filePath = argv[2];

    if (!filePath) {
      console.error("❌ Usage: tsx src/import.ts <path-to-csv-file>");
      console.error("Example: tsx src/import.ts data/conference.csv");
      process.exit(1);
    }

    await importUsersFromCSV(filePath);
    console.log("\n✨ Import completed successfully!");
  } catch (error) {
    console.error(
      "❌ Import failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
