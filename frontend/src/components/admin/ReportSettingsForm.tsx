import React, { useState, useEffect } from 'react';
import { fetchReportSettings, updateReportSettings, ReportSettingsData } from '../../services/api';
import { Button, TextField, Typography } from '@mui/material';
import { toast } from 'sonner';

export function ReportSettingsForm() {
  const [settings, setSettings] = useState<Partial<ReportSettingsData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReportSettings()
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch report settings:', err);
        toast.error('Failed to load report settings.');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateReportSettings(settings);
      toast.success('Report settings updated successfully.');
    } catch (err) {
      console.error('Failed to update report settings:', err);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Typography variant="h6" className="text-lg font-medium text-gray-900 dark:text-white">Report Header</Typography>
      
      <TextField
        fullWidth
        label="Header Title"
        id="header_title"
        name="header_title"
        value={settings.header_title || ''}
        onChange={handleChange}
        disabled={saving}
        variant="outlined"
      />

      <TextField
        fullWidth
        label="Company Name"
        id="header_company"
        name="header_company"
        value={settings.header_company || ''}
        onChange={handleChange}
        disabled={saving}
        variant="outlined"
      />

      <Typography variant="h6" className="text-lg font-medium text-gray-900 dark:text-white pt-4">Report Footer</Typography>

      <TextField
        fullWidth
        label="Footer Left Text"
        id="footer_left"
        name="footer_left"
        value={settings.footer_left || ''}
        onChange={handleChange}
        disabled={saving}
        variant="outlined"
      />

      <TextField
        fullWidth
        label="Footer Right Text"
        id="footer_right"
        name="footer_right"
        value={settings.footer_right || ''}
        onChange={handleChange}
        disabled={saving}
        multiline
        rows={3}
        variant="outlined"
        helperText="HTML is allowed."
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} variant="contained" color="primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
