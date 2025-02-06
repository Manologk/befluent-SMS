import { LucideIcon } from 'lucide-react';

export type ThemeName = "light" | "dark" | "system" | "blue" | "green" | "purple";

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;
};

export type Theme = {
  name: ThemeName;
  icon: LucideIcon;
}; 