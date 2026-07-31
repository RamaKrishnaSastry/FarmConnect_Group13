import { useState } from 'react';

const PREF_KEYS = {
  orderUpdates: 'farmconnect_pref_order_updates',
  messages: 'farmconnect_pref_messages',
  newListings: 'farmconnect_pref_new_listings',
};

const readPrefs = () => {
  const prefs = {};
  Object.entries(PREF_KEYS).forEach(([key, storageKey]) => {
    prefs[key] = localStorage.getItem(storageKey) !== 'off';
  });
  return prefs;
};

const SETTINGS_ITEMS = [
  { key: 'orderUpdates', label: 'Order updates', desc: 'Get notified when a request is approved, in delivery, or completed' },
  { key: 'messages', label: 'New messages', desc: 'Get notified when you receive a new chat message' },
  { key: 'newListings', label: 'New produce listings', desc: 'Get notified when farmers list fresh produce' },
];

export const SettingsModal = ({ onClose }) => {
  const [prefs, setPrefs] = useState(readPrefs);

  const toggle = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(PREF_KEYS[key], next[key] ? 'on' : 'off');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-gray-500 transition hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">Notification preferences</p>

        <div className="space-y-3">
          {SETTINGS_ITEMS.map((item) => {
            const enabled = prefs[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => toggle(item.key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-gray-400">Preferences are saved on this device.</p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800"
        >
          Done
        </button>
      </div>
    </div>
  );
};
