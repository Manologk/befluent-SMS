import { ThemeColors } from "@/types/theme";

export function createTheme(colors: ThemeColors): string {
  return Object.entries(colors)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n');
}