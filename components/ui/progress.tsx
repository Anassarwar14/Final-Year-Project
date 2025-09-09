interface ProgressProps {
  value: number; // 0 - 100
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-orange-500 h-2 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
