type EventsMessage = {
    type: "event_activated" | "event_deactivated";
    data: Record<string, unknown>;
};

type EventsSubscriber = (message: EventsMessage) => void;

class EventsPubSub {
    private subscribers: EventsSubscriber[] = [];

    subscribe(subscriber: EventsSubscriber) {
        this.subscribers.push(subscriber);
    }

    publish(message: EventsMessage) {
        console.log(`Publishing events message to ${this.subscribers.length} subscribers:`, message.type);
        for (const subscriber of this.subscribers) {
            subscriber(message);
        }
    }

    unsubscribe(subscriber: EventsSubscriber) {
        this.subscribers = this.subscribers.filter((sub) => sub !== subscriber);
    }
}

export const events = new EventsPubSub();
