"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins, Flame, Library, LogOut, Trophy, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthProvider";
import { getProfile, onProfileChanged } from "@/lib/profile";
import { getPoints } from "@/lib/points";
import { onActivityChanged } from "@/lib/activity";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [avatar, setAvatar] = useState("");
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const refreshProfile = () => setAvatar(getProfile().avatar);
    const refreshPoints = () => setPoints(getPoints());
    refreshProfile();
    refreshPoints();
    const offProfile = onProfileChanged(refreshProfile);
    const offActivity = onActivityChanged(refreshPoints);
    return () => {
      offProfile();
      offActivity();
    };
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${user.name}`}
          className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors hover:bg-white/5"
        >
          <Avatar size="sm">
            {avatar ? (
              <AvatarImage src={avatar} alt={user.name} />
            ) : (
              <AvatarFallback className="bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {user.name.split(" ")[0]}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate">{user.email}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-normal text-primary">
            <Coins className="size-3.5" />
            {points.toLocaleString()} BookBee Points
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound className="size-4" />
            Profile & Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/library">
            <Library className="size-4" />
            My Library
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/leaderboard">
            <Trophy className="size-4" />
            Leaderboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/library#streak">
            <Flame className="size-4" />
            Listening Streak
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => signOut()}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
