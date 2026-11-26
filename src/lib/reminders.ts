import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
  type TimestampTrigger,
} from "@notifee/react-native";

const MESSAGES = [
  "🦜 Time for your BlahBlah! Keep the streak alive.",
  "🦜 A few minutes of practice goes a long way. Let's go!",
  "🦜 Your daily lesson is waiting!",
  "🦜 Don't break the chain — practice now.",
];

/** Next occurrence of the given hour (local time). */
function nextAt(hour: number): number {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

/** Request permission and (re)schedule a daily reminder at `hour`. Returns success. */
export async function scheduleDailyReminder(hour: number): Promise<boolean> {
  try {
    const settings = await notifee.requestPermission();
    if (
      settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED &&
      settings.authorizationStatus !== AuthorizationStatus.PROVISIONAL
    ) {
      return false;
    }
    await notifee.cancelTriggerNotifications();
    const channelId = await notifee.createChannel({
      id: "reminders",
      name: "Practice reminders",
      importance: AndroidImportance.HIGH,
    });
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: nextAt(hour),
      repeatFrequency: RepeatFrequency.DAILY,
    };
    await notifee.createTriggerNotification(
      {
        title: "BlahBlah",
        body: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
        android: { channelId, pressAction: { id: "default" } },
      },
      trigger,
    );
    return true;
  } catch {
    return false;
  }
}

export async function cancelReminders(): Promise<void> {
  try {
    await notifee.cancelTriggerNotifications();
  } catch {
    // no-op
  }
}
