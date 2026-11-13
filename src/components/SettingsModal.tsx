import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellOff,
  Clock,
  ShieldCheck,
  X,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import type { TempUnit, ThemeMode } from '../types';
import { safeStorage } from '../services/safeStorage';
import type { NotificationPermissionState } from '../hooks/useNotifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: TempUnit;
  onSetUnit: (unit: TempUnit) => void;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  notificationPermission: NotificationPermissionState;
  isNotificationsEnabled: boolean;
  isNotificationsSupported: boolean;
  reminderTime: string;
  testSent: boolean;
  onRequestNotificationPermission: () => Promise<NotificationPermissionState>;
  onDisableNotifications: () => void;
  onUpdateReminderTime: (time: string) => void;
  onSendTestNotification: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  unit,
  onSetUnit,
  theme,
  onSetTheme,
  notificationPermission,
  isNotificationsEnabled,
  isNotificationsSupported,
  reminderTime,
  testSent,
  onRequestNotificationPermission,
  onDisableNotifications,
  onUpdateReminderTime,
  onSendTestNotification,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [openWeatherKey, setOpenWeatherKey] = useState<string>(() => {
    return safeStorage.getItem('weatherboard_custom_openweather_key') || '';
  });
  const [rapidApiKey, setRapidApiKey] = useState<string>(() => {
    return safeStorage.getItem('weatherboard_custom_rapidapi_key') || '';
  });
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (openWeatherKey.trim()) {
      safeStorage.setItem('weatherboard_custom_openweather_key', openWeatherKey.trim());
    } else {
      safeStorage.removeItem('weatherboard_custom_openweather_key');
    }

    if (rapidApiKey.trim()) {
      safeStorage.setItem('weatherboard_custom_rapidapi_key', rapidApiKey.trim());
    } else {
      safeStorage.removeItem('weatherboard_custom_rapidapi_key');
    }

    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (isOutside) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="settings-dialog-title"
      className="m-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-0 shadow-2xl backdrop:bg-black/60 dark:border-neutral-800 dark:bg-[#0c0e14] dark:text-neutral-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4 dark:border-neutral-800">
        <h2 id="settings-dialog-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Preferences & Telemetry Configuration
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="touch-target rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6 scrollbar-none">
        
        {/* Section 1: Units & Theme */}
        <section aria-labelledby="display-prefs-heading">
          <h3 id="display-prefs-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
            Display & Calibration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Unit Preference */}
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/50">
              <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Temperature Unit
              </span>
              <div className="flex rounded-lg bg-neutral-200/70 p-0.5 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => onSetUnit('C')}
                  className={`touch-target flex-1 rounded-md text-xs font-medium transition ${
                    unit === 'C'
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => onSetUnit('F')}
                  className={`touch-target flex-1 rounded-md text-xs font-medium transition ${
                    unit === 'F'
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            {/* Theme Preference */}
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/50">
              <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Color Palette
              </span>
              <div className="flex rounded-lg bg-neutral-200/70 p-0.5 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => onSetTheme('light')}
                  className={`touch-target flex-1 rounded-md text-xs font-medium transition flex items-center justify-center gap-1 ${
                    theme === 'light'
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <Sun className="h-3 w-3" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetTheme('dark')}
                  className={`touch-target flex-1 rounded-md text-xs font-medium transition flex items-center justify-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <Moon className="h-3 w-3" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetTheme('system')}
                  className={`touch-target flex-1 rounded-md text-xs font-medium transition flex items-center justify-center gap-1 ${
                    theme === 'system'
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <Laptop className="h-3 w-3" />
                  <span>Auto</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Daily Morning Reminder (Web Push / Notifications API) */}
        <section aria-labelledby="notification-heading">
          <h3 id="notification-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
            Daily Morning Meteorological Briefing
          </h3>

          <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
            {/* Pre-permission explanation card */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Morning Weather Dispatch
                </h4>
                <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Receive a concise meteorological forecast at your preferred hour each morning with precipitation probabilities and temperatures.
                </p>
              </div>
            </div>

            {/* Permission Status & Action */}
            <div className="mt-4 border-t border-neutral-200/60 pt-3 dark:border-neutral-800/60">
              {!isNotificationsSupported ? (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Web Notifications are unsupported in this browser environment.</span>
                </div>
              ) : notificationPermission === 'denied' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                    <BellOff className="h-4 w-4 shrink-0" />
                    <span>Notification permissions were previously blocked in your browser.</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    To enable daily dispatches, click the lock icon in your URL bar and reset Notification permissions for WeatherBoard.
                  </p>
                </div>
              ) : isNotificationsEnabled ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Notifications Active</span>
                    </div>

                    <button
                      type="button"
                      onClick={onDisableNotifications}
                      className="touch-target text-xs text-neutral-500 hover:text-rose-500 underline"
                    >
                      Disable
                    </button>
                  </div>

                  {/* Reminder Time Selector */}
                  <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Dispatch Time
                      </span>
                    </div>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => onUpdateReminderTime(e.target.value)}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>

                  {/* Send Test Notification Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-400">
                      Verify notification delivery via Service Worker
                    </span>
                    <button
                      type="button"
                      onClick={onSendTestNotification}
                      className="touch-target inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      <Send className="h-3 w-3" />
                      <span>{testSent ? 'Sent!' : 'Send Test'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onRequestNotificationPermission}
                    className="touch-target w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-500 active:scale-95"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Enable Daily Morning Forecast</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: API Key Configuration */}
        <section aria-labelledby="api-keys-heading">
          <div className="flex items-center justify-between mb-3">
            <h3 id="api-keys-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Custom API Keys (Optional)
            </h3>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero-Config Fallback Enabled</span>
            </span>
          </div>

          <form onSubmit={handleSaveKeys} className="space-y-3">
            <div>
              <label htmlFor="openweather-key-input" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                OpenWeatherMap API Key
              </label>
              <input
                id="openweather-key-input"
                type="password"
                value={openWeatherKey}
                onChange={(e) => setOpenWeatherKey(e.target.value)}
                placeholder="Paste your 32-character key..."
                className="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="rapidapi-key-input" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                GeoDB Cities RapidAPI Key
              </label>
              <input
                id="rapidapi-key-input"
                type="password"
                value={rapidApiKey}
                onChange={(e) => setRapidApiKey(e.target.value)}
                placeholder="Paste your RapidAPI key..."
                className="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              />
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Keys are stored securely in client-side storage. When keys are empty or hit rate limits, WeatherBoard seamlessly falls back to high-resolution Open-Meteo forecasts and geocoding without downtime.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              {keySaved && (
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              <button
                type="submit"
                className="touch-target rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                Save Keys
              </button>
            </div>
          </form>
        </section>

      </div>
    </dialog>
  );
};
