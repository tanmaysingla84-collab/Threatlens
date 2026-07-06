/**
 * Reusable loading spinner with optional size and label props.
 * Used everywhere data is fetching to prevent blank screens.
 */
export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
    xl: 'h-16 w-16 border-[3px]',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-label={label}>
      <div
        className={`${sizeMap[size]} rounded-full border-transparent border-t-accent-blue border-r-accent-purple animate-spin`}
        style={{ borderStyle: 'solid' }}
      />
      {label && <p className="text-text-secondary text-sm animate-pulse">{label}</p>}
    </div>
  );
}
