import type { DashboardModel } from "@/wordManagement/DashboardModel"
import type { InitialData } from "./fetchInitialData"

export type EventMap = {
  initialDataFetched: InitialData
  pagesFetched: DashboardModel
  userLoggedIn: object
}


// ==========================
// Types
// ==========================

export type EventBusCallback<T> = (data: T) => void

// ==========================
// EventChannel (one event)
// ==========================

export class EventChannel<T> {
  private listeners = new Set<EventBusCallback<T>>()

  subscribe(handler: EventBusCallback<T>): () => void {
    this.listeners.add(handler)
    return () => {
      this.listeners.delete(handler)
    }
  }

  notify(callback: T): void {
    this.listeners.forEach(handler => {
      handler(callback)
    })
  }

  clear(): void {
    this.listeners.clear()
  }
}

// ==========================
// EventRegistry (lazy)
// ==========================

export class EventRegistry<Events extends Record<string, any>> {
  private channels: Partial<{
    [K in keyof Events]: EventChannel<Events[K]>
  }> = {}

  event<K extends keyof Events>(key: K): EventChannel<Events[K]> {
    if (!this.channels[key]) {
      this.channels[key] = new EventChannel<Events[K]>()
    }

    return this.channels[key]!
  }

  clear<K extends keyof Events>(key?: K): void {
    if (key) {
      this.channels[key]?.clear()
    } else {
      Object.values(this.channels).forEach(channel => {
        channel?.clear()
      })
    }
  }
}

export const eventBusEvents = new EventRegistry<EventMap>()

export const publish = <K extends keyof EventMap>(key: K, callback: EventMap[K]) => {
  eventBusEvents.event(key).notify(callback)
}

export const subscribe = <K extends keyof EventMap>(key: K, handler: EventBusCallback<EventMap[K]>) => {
  eventBusEvents.event(key).subscribe(handler)
}
