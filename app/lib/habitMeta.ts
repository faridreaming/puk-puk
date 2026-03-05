import type { LucideIcon } from "lucide-react";
import {
  Activity, BookOpen, Brain, Briefcase, Dumbbell, Flame,
  Heart, Laptop, Moon, Mountain, Music, Pencil, Droplets,
  PersonStanding, Salad, Shield, Sparkles, CircleOff, Timer,
  Target, Zap, Sun, Coffee, Bike, Eye, Footprints,
} from "lucide-react";

// --- Icon Registry ---

export interface HabitIconOption {
  name: string;
  icon: LucideIcon;
  label: string;
}

export const HABIT_ICONS: HabitIconOption[] = [
  { name: "target", icon: Target, label: "Target" },
  { name: "dumbbell", icon: Dumbbell, label: "Olahraga" },
  { name: "running", icon: PersonStanding, label: "Lari" },
  { name: "bike", icon: Bike, label: "Sepeda" },
  { name: "footprints", icon: Footprints, label: "Jalan" },
  { name: "book-open", icon: BookOpen, label: "Baca" },
  { name: "pencil", icon: Pencil, label: "Menulis" },
  { name: "brain", icon: Brain, label: "Belajar" },
  { name: "laptop", icon: Laptop, label: "Coding" },
  { name: "heart", icon: Heart, label: "Kesehatan" },
  { name: "droplets", icon: Droplets, label: "Minum" },
  { name: "salad", icon: Salad, label: "Makan Sehat" },
  { name: "moon", icon: Moon, label: "Tidur" },
  { name: "sun", icon: Sun, label: "Pagi" },
  { name: "coffee", icon: Coffee, label: "Kopi" },
  { name: "music", icon: Music, label: "Musik" },
  { name: "mountain", icon: Mountain, label: "Outdoor" },
  { name: "shield", icon: Shield, label: "NoFap" },
  { name: "no-smoking", icon: CircleOff, label: "Berhenti" },
  { name: "timer", icon: Timer, label: "Waktu" },
  { name: "sparkles", icon: Sparkles, label: "Kebiasaan" },
  { name: "activity", icon: Activity, label: "Aktivitas" },
  { name: "eye", icon: Eye, label: "Fokus" },
  { name: "briefcase", icon: Briefcase, label: "Kerja" },
  { name: "zap", icon: Zap, label: "Energi" },
  { name: "flame", icon: Flame, label: "Semangat" },
];

export function getHabitIcon(name: string): LucideIcon {
  return HABIT_ICONS.find((i) => i.name === name)?.icon ?? Target;
}

// --- Color Registry ---

export interface HabitColorOption {
  name: string;
  label: string;
  bg: string;       // bg for icon container
  text: string;      // text/icon color
  ring: string;      // selected ring
  light: string;     // lighter bg for cards/badges
  dot: string;       // solid fill for color swatch circle
}

export const HABIT_COLORS: HabitColorOption[] = [
  {
    name: "amber",
    label: "Amber",
    bg: "bg-amber-100 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    light: "bg-amber-50/80 dark:bg-amber-500/8 border-amber-200/40 dark:border-amber-500/10",
    dot: "bg-amber-500",
  },
  {
    name: "emerald",
    label: "Hijau",
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500",
    light: "bg-emerald-50/80 dark:bg-emerald-500/8 border-emerald-200/40 dark:border-emerald-500/10",
    dot: "bg-emerald-500",
  },
  {
    name: "blue",
    label: "Biru",
    bg: "bg-blue-100 dark:bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500",
    light: "bg-blue-50/80 dark:bg-blue-500/8 border-blue-200/40 dark:border-blue-500/10",
    dot: "bg-blue-500",
  },
  {
    name: "violet",
    label: "Ungu",
    bg: "bg-violet-100 dark:bg-violet-500/15",
    text: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500",
    light: "bg-violet-50/80 dark:bg-violet-500/8 border-violet-200/40 dark:border-violet-500/10",
    dot: "bg-violet-500",
  },
  {
    name: "rose",
    label: "Pink",
    bg: "bg-rose-100 dark:bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500",
    light: "bg-rose-50/80 dark:bg-rose-500/8 border-rose-200/40 dark:border-rose-500/10",
    dot: "bg-rose-500",
  },
  {
    name: "cyan",
    label: "Cyan",
    bg: "bg-cyan-100 dark:bg-cyan-500/15",
    text: "text-cyan-600 dark:text-cyan-400",
    ring: "ring-cyan-500",
    light: "bg-cyan-50/80 dark:bg-cyan-500/8 border-cyan-200/40 dark:border-cyan-500/10",
    dot: "bg-cyan-500",
  },
  {
    name: "orange",
    label: "Oranye",
    bg: "bg-orange-100 dark:bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-500",
    light: "bg-orange-50/80 dark:bg-orange-500/8 border-orange-200/40 dark:border-orange-500/10",
    dot: "bg-orange-500",
  },
  {
    name: "zinc",
    label: "Abu",
    bg: "bg-zinc-200 dark:bg-zinc-700",
    text: "text-zinc-600 dark:text-zinc-300",
    ring: "ring-zinc-500",
    light: "bg-zinc-100/80 dark:bg-zinc-800/50 border-zinc-200/40 dark:border-zinc-700/30",
    dot: "bg-zinc-500",
  },
];

export function getHabitColor(name: string): HabitColorOption {
  return HABIT_COLORS.find((c) => c.name === name) ?? HABIT_COLORS[0];
}
