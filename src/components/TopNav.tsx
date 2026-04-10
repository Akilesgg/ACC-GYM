import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopNavProps {
  userPhoto?: string;
}

export default function TopNav({ userPhoto }: TopNavProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border-2 border-primary">
          <AvatarImage src={userPhoto || "https://picsum.photos/seed/athlete/200/200"} />
          <AvatarFallback>KV</AvatarFallback>
        </Avatar>
      </div>
      <h1 className="text-2xl font-black italic text-primary tracking-tighter font-headline">
        ACC GYM
      </h1>
      <button className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200">
        <Bell size={24} />
      </button>
    </header>
  );
}
