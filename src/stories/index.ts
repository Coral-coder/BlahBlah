import type { Story } from "@/stories/types";
import { germanStories } from "@/stories/content/de";
import { spanishStories } from "@/stories/content/es";
import { chineseStories } from "@/stories/content/zh";
import { thaiStories } from "@/stories/content/th";

export const STORIES: Story[] = [
  ...germanStories,
  ...spanishStories,
  ...chineseStories,
  ...thaiStories,
];

export function getStories(courseCode: string): Story[] {
  return STORIES.filter((s) => s.courseCode === courseCode);
}

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}
