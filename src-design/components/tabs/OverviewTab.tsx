import { SubmissionDetailsCard } from "../SubmissionDetailsCard";

const font = "'Source Sans 3', system-ui, sans-serif";

export function OverviewTab() {
  return (
    <div className="space-y-5" style={{ fontFamily: font }}>
      <SubmissionDetailsCard />
    </div>
  );
}
