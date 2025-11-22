import { prisma } from "../lib/prisma";

export async function canUserVoteOnEventType(
  personID: string,
  eventType: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { personID },
  });

  if (!user) {
    return false;
  }

  // If allowedEventTypes is empty, user can vote on all types
  if (user.allowedEventTypes.length === 0) {
    return true;
  }

  // Check if eventType is in user's allowed types
  return user.allowedEventTypes.includes(eventType);
}

export async function grantUserEventTypeAccess(
  personID: string,
  eventTypes: string[]
): Promise<void> {
  await prisma.user.update({
    where: { personID },
    data: {
      allowedEventTypes: eventTypes,
    },
  });
}

export async function addUserEventTypeAccess(
  personID: string,
  eventType: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { personID },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updated = Array.from(new Set([...user.allowedEventTypes, eventType]));

  await prisma.user.update({
    where: { personID },
    data: {
      allowedEventTypes: updated,
    },
  });
}

export async function removeUserEventTypeAccess(
  personID: string,
  eventType: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { personID },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updated = user.allowedEventTypes.filter((type: string) => type !== eventType);

  await prisma.user.update({
    where: { personID },
    data: {
      allowedEventTypes: updated,
    },
  });
}
