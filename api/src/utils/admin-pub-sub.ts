type AdminMessage = {
  type: "event_updated" | "event_activated" | "event_deactivated" | "poll_activated" | "poll_created" | "poll_updated";
  eventId: string;
  data: Record<string, unknown>;
};

type AdminSubscriber = (message: AdminMessage) => void;

class AdminPubSub {
  private channels: Record<string, AdminSubscriber[]> = {};

  subscribe(eventId: string, subscriber: AdminSubscriber) {
    if (!this.channels[eventId]) {
      this.channels[eventId] = [];
    }

    this.channels[eventId].push(subscriber);
  }

  publish(eventId: string, message: AdminMessage) {
    if (!this.channels[eventId]) {
      return;
    }

    for (const subscriber of this.channels[eventId]) {
      subscriber(message);
    }
  }

  unsubscribe(eventId: string, subscriber: AdminSubscriber) {
    if (!this.channels[eventId]) {
      return;
    }

    this.channels[eventId] = this.channels[eventId].filter((sub) => sub !== subscriber);
  }
}

export const admin = new AdminPubSub();
