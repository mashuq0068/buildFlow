import { Workflow } from 'lucide-react';

export default function Logo({
  badgeSize = 'w-7 h-7',
  iconSize = 16,
  wordmarkClassName = 'text-neutral-900',
  showWordmark = true,
}: {
  badgeSize?: string;
  iconSize?: number;
  wordmarkClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${badgeSize} bg-black rounded-md flex items-center justify-center shrink-0`}>
        <Workflow size={iconSize} className="text-white" strokeWidth={2.25} />
      </div>
      {showWordmark && (
        <span className={`text-[15px] font-semibold tracking-tight ${wordmarkClassName}`}>
          BuildFlow
        </span>
      )}
    </div>
  );
}
