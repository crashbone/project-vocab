// TimeSpentHandler.ts
import { addOrUpdate } from "@/junk/localStorageHandler";

type TimerSession = {
  id: string;
  startTime: number;
  accumulatedTimeSeconds: number;
  interval?: ReturnType<typeof setInterval>;
};

export class TimeSpentHandler {
  private static _instance: TimeSpentHandler | null = null;
  private activeTimers: Record<string, TimerSession> = {};

  // Singleton accessor
  public static get instance(): TimeSpentHandler {
    if (!TimeSpentHandler._instance) {
      TimeSpentHandler._instance = new TimeSpentHandler();
    }
    return TimeSpentHandler._instance;
  }

  // Private constructor to prevent direct instantiation
  private constructor() {}

  /**
   * Starts or resumes a timer for a given ID
   */
  public startRecording(timeSpentId: string) {
    const existing = this.activeTimers[timeSpentId];
    if (existing) {
      if (!existing.startTime) existing.startTime = Date.now();
      return;
    }

    const localKey = `timeSpent-${timeSpentId}`;
    const stored = localStorage.getItem(localKey);
    const previousTimeSeconds = stored ? parseInt(stored, 10) || 0 : 0;

    const session: TimerSession = {
      id: timeSpentId,
      startTime: Date.now(),
      accumulatedTimeSeconds: previousTimeSeconds,
    };

    session.interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - session.startTime) / 1000;
      const totalSeconds = session.accumulatedTimeSeconds + elapsedSeconds;
      addOrUpdate(localKey, totalSeconds.toString());
    }, 30_000);

    this.activeTimers[timeSpentId] = session;
  }

  /**
   * Stops recording for a given ID and persists the total time
   */
  public stopRecording(id: string) {
    const session = this.activeTimers[id];
    if (!session) return;

    const elapsedSeconds = (Date.now() - session.startTime) / 1000;
    const totalSeconds = session.accumulatedTimeSeconds + elapsedSeconds;
    const localKey = `timeSpent-${id}`;

    addOrUpdate(localKey, totalSeconds.toString());

    if (session.interval) clearInterval(session.interval);
    delete this.activeTimers[id];
  }

  /**
   * Syncs all stored time data to server
   */
  public async updateServer(): Promise<void> {
    const data: Record<string, number> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("timeSpent-")) {
        const id = key.replace("timeSpent-", "");
        const value = localStorage.getItem(key);
        if (value) {
          const totalSeconds = parseInt(value, 10) || 0;
          data[id] = totalSeconds;
        }
      }
    }

    if (Object.keys(data).length === 0) return Promise.resolve();

    return new Promise((resolve) => {
      console.log("Syncing time spent data:", data);
      // TODO: Replace with actual API call
      resolve();
    });
  }
}
