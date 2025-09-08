/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main technical integration system for event handling and coordination.
 * Got it, love.
 */

export class MainTechnicalIntegrator {
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Add an event listener for a specific event type
   * @param eventType - The event type to listen for
   * @param listener - The callback function to execute when the event occurs
   */
  addEventListener(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove an event listener for a specific event type
   * @param eventType - The event type
   * @param listener - The callback function to remove
   */
  removeEventListener(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param eventType - The event type to emit
   * @param data - Optional data to pass to listeners
   */
  emitEvent(eventType: string, data?: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Get all registered event types
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.eventListeners.keys());
  }

  /**
   * Clear all event listeners
   */
  clearAllListeners(): void {
    this.eventListeners.clear();
  }
}