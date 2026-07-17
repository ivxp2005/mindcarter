import { useEffect, useState } from "react";
import { MOOD_LOCK_MS, todayISO, type JournalEntry, type Mood } from "./patient";

/** Drives the "how are you feeling today?" check-in strip: the pick stays
 *  editable for a fixed window from the first click, then locks in
 *  permanently for the day (backed by the DB upsert in `checkInMoodFn`). */
export function useMoodCheckIn(journal: JournalEntry[], checkInMood: (mood: Mood) => void) {
  const [checkedInMood, setCheckedInMood] = useState<Mood | null>(null);
  const [windowEndsAt, setWindowEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (windowEndsAt === null) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [windowEndsAt]);

  const remainingMs = windowEndsAt !== null ? Math.max(0, windowEndsAt - now) : 0;
  const isEditingWindow = windowEndsAt !== null && remainingMs > 0;
  const remainingSec = Math.ceil(remainingMs / 1000);

  useEffect(() => {
    if (windowEndsAt !== null && remainingMs === 0) setWindowEndsAt(null);
  }, [remainingMs, windowEndsAt]);

  const todaysEntry = journal.find((e) => e.date === todayISO());
  const isLockedIn = !isEditingWindow && !!todaysEntry;
  // Reflect an already-logged mood (e.g. from a page reload) even before any
  // click happens this session, so the matching emoji shows as selected.
  const displayedMood = checkedInMood ?? todaysEntry?.mood ?? null;

  const handleCheckIn = (m: Mood) => {
    if (isLockedIn) return;
    setCheckedInMood(m);
    checkInMood(m);
    if (windowEndsAt === null) {
      setNow(Date.now());
      setWindowEndsAt(Date.now() + MOOD_LOCK_MS);
    }
  };

  return { checkedInMood: displayedMood, isEditingWindow, isLockedIn, remainingSec, handleCheckIn };
}
