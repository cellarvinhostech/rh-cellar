import { MobileNav } from "./MobileNav";

export function TopBar() {
  return (
    <div className="flex items-center justify-between lg:justify-end gradient-bg h-12 lg:h-3 w-full px-4 lg:px-0" data-testid="top-bar">
      <div className="lg:hidden">
        <MobileNav />
      </div>
      <div className="lg:hidden">
        <h1 className="text-white font-semibold text-lg">RH Performance</h1>
      </div>
    </div>
  );
}