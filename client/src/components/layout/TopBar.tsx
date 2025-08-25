export function TopBar() {
  return (
    <div className="flex items-center justify-center lg:justify-end gradient-bg h-12 lg:h-3 w-full px-4 lg:px-0 transition-all duration-300" 
         data-testid="top-bar">
      <div className="lg:hidden">
        <h1 className="text-white font-semibold text-lg">RH Performance</h1>
      </div>
    </div>
  );
}