import { ControlPanel } from '@/components/ControlPanel';
import { UnifiedCommandCenter } from '@/components/UnifiedCommandCenter';

export default function ControlPage() {
  return (
    <div className="p-6 space-y-6">
      <UnifiedCommandCenter className="mb-6" />
      <ControlPanel />
    </div>
  );
}
