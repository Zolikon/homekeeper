function BottomNav({ children }: { children: React.ReactNode }) {
  return (
    <nav className="w-full h-14 bg-theme_primary flex items-center justify-around shrink-0 z-50 relative">
      {children}
    </nav>
  );
}

export default BottomNav;
