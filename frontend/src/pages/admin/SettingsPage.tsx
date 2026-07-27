import { Card } from '../../components/ui/Card';
import { ReportSettingsForm } from '../../components/admin/ReportSettingsForm';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <Card>
        <div className="p-6">
          <ReportSettingsForm />
        </div>
      </Card>
    </div>
  );
}
