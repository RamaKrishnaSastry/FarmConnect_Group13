export const HelpModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Help &amp; Demo Accounts</h3>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-gray-500 transition hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-900">How FarmConnect works</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-gray-600">
              <li>Farmers list produce and approve or reject buyer requests.</li>
              <li>Buyers browse produce, request purchases, chat, and rate.</li>
              <li>Transporters accept approved deliveries and mark them completed.</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Demo accounts</p>
            <ul className="mt-1 space-y-1 text-gray-600">
              <li>🌾 Farmer — farmer@farmconnect.com / password</li>
              <li>🛒 Buyer — buyer@farmconnect.com / password</li>
              <li>🚚 Transporter — transporter@farmconnect.com / password</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
