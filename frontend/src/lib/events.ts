type EventCallback = (studentId: string, lessonsRemaining: number) => void;

class EventBus {
  private listeners: { [key: string]: EventCallback[] } = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, studentId: string, lessonsRemaining: number) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(studentId, lessonsRemaining));
    }
  }
}

export const eventBus = new EventBus();