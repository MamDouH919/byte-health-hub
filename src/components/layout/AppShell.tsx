import { TopNav } from "./TopNav";

export const AppShell = ({
  children,
  user,
  showNoor = false,
  compact = false,
  subtitle,
  showSwitchers = false,
}: {
  children: React.ReactNode;
  user?: string;
  showNoor?: boolean;
  compact?: boolean;
  subtitle?: string;
  showSwitchers?: boolean;
}) => (
  <div className="min-h-screen w-full bg-background">
    <TopNav user={user} showNoor={showNoor} compact={compact} subtitle={subtitle} showSwitchers={showSwitchers} />
    <main className="px-8 pb-16">{children}</main>
  </div>
);
