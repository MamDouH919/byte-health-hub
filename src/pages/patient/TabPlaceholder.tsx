// Generic placeholder for tabs we wire up but haven't fully designed.

const TabPlaceholder = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <div className="surface-card p-10 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2">
        This section follows the same clinical layout as Profile and Blood Tests — content coming next.
      </p>
    </div>
  </div>
);

export default TabPlaceholder;
