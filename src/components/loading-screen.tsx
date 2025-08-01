export default function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent mx-auto rounded-full animate-spin mb-4"></div>
        <span className="text-muted-foreground text-base font-medium">
          Loading {label}...
        </span>
      </div>
    </div>
  );
}
