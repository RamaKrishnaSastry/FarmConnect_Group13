export const TOUR_DONE_KEY = 'farmconnect_tour_done';

const sharedIntro = {
  icon: '🎬',
  title: 'Welcome to FarmConnect',
  body:
    'FarmConnect connects farmers, buyers, and transporters in one marketplace. This short animated tour will walk you through everything you can do here.',
  tip: 'Use the Next button (or the → arrow key) to explore every feature at your own pace.',
};

export const getTourSteps = (role) => {
  if (role === 'FARMER') return farmerSteps();
  if (role === 'BUYER') return buyerSteps();
  if (role === 'TRANSPORTER') return transporterSteps();
  return [sharedIntro];
};

const farmerSteps = () => [
  {
    ...sharedIntro,
    body:
      'You are signed in as a Farmer. Everything on your dashboard is organized into tabs — overview, produce, requests, deliveries, ratings, and chat. Let us walk through each one.',
  },
  {
    icon: '📊',
    title: 'Dashboard overview',
    target: '#farmer-stats',
    placement: 'right',
    body:
      'The stat cards give you a quick pulse on your farm: active listings, pending buyer requests, deliveries in transit, and your average rating.',
  },
  {
    icon: '🌾',
    title: 'Manage your produce',
    path: '/dashboard/farmer',
    tab: 'produce',
    target: '#produce-section',
    placement: 'right',
    body:
      'Your produce listings live here — 3 demo listings are already seeded (tomatoes, carrots, and sweet corn). Each card shows price, quantity, status, and a photo.',
  },
  {
    icon: '➕',
    title: 'Add or edit produce',
    path: '/dashboard/farmer',
    tab: 'produce',
    target: '#add-produce-btn',
    placement: 'bottom',
    body:
      'Use "Add Produce" to list a new crop with name, quantity, unit, price, and an optional photo. The edit (✏️) and delete (🗑️) buttons on each card let you keep listings up to date.',
  },
  {
    icon: '📝',
    title: 'Respond to requests',
    path: '/dashboard/farmer',
    tab: 'requests',
    target: '#requests-section',
    placement: 'right',
    body:
      'Buyers send purchase requests with a quantity, offered price, and note. Approve to accept the deal (this automatically creates a delivery job for transporters) or reject it.',
  },
  {
    icon: '🚚',
    title: 'Track deliveries',
    path: '/dashboard/farmer',
    tab: 'deliveries',
    target: '#deliveries-section',
    placement: 'right',
    body:
      'Once a request is approved, a delivery is created. Watch it move through shipped → in transit → delivered, along with the route, distance, and estimated time.',
  },
  {
    icon: '⭐',
    title: 'See your ratings',
    path: '/dashboard/farmer',
    tab: 'ratings',
    target: '#ratings-section',
    placement: 'right',
    body:
      'Buyers rate your produce quality and delivery experience. The demo data includes a 5-star product review and a 5-star delivery review.',
  },
  {
    icon: '💬',
    title: 'Chat with buyers',
    path: '/dashboard/farmer',
    tab: 'chat',
    target: '#chat-section',
    placement: 'right',
    body:
      'Every request has its own conversation thread. Pick a request on the left, read the thread, and send a message to negotiate or coordinate pickup.',
  },
];

const buyerSteps = () => [
  {
    ...sharedIntro,
    body:
      'You are signed in as a Buyer. Browse fresh listings from farmers, place requests, rate your experience, and message farmers directly — all from this single page.',
  },
  {
    icon: '🛒',
    title: 'Browse available produce',
    target: '#buyer-available',
    placement: 'right',
    body:
      'Every available listing from farmers is shown here with price, quantity, and a description. Demo data includes tomatoes, carrots, and sweet corn.',
  },
  {
    icon: '📦',
    title: 'Place a purchase request',
    target: '#buyer-request-form',
    placement: 'right',
    body:
      'For each item, enter how much you want, your offered price, and an optional note. Click "Request" to send it to the farmer — it starts as a pending request.',
    tip: 'You can negotiate: the farmer will approve or reject your offer.',
  },
  {
    icon: '🗂️',
    title: 'Track your requests',
    target: '#buyer-my-requests',
    placement: 'right',
    body:
      '"My Requests" lists everything you have ordered with its current status — pending, approved, delivering, or completed. Two demo requests are already in flight.',
  },
  {
    icon: '⭐',
    title: 'Rate your experience',
    target: '#buyer-rating-box',
    placement: 'right',
    body:
      'After a deal, rate the farmer on product quality and delivery experience (1–5 stars) and leave a short review. Your feedback powers the farmer’s rating.',
  },
  {
    icon: '💬',
    title: 'Message the farmer',
    target: '#buyer-chat',
    placement: 'right',
    body:
      'Select any of your requests and send the farmer a message. It is the fastest way to confirm details, quantities, or pickup times.',
  },
];

const transporterSteps = () => [
  {
    ...sharedIntro,
    body:
      'You are signed in as a Transporter. Pick up delivery jobs, track your route, and mark them complete once the produce reaches the buyer.',
  },
  {
    icon: '🚚',
    title: 'Available deliveries',
    target: '#transp-available',
    placement: 'right',
    body:
      'When a farmer approves a request, a delivery job appears here. The demo data has a carrot delivery from Springfield to Chicago ready for pickup — buyer, farmer, and route are all shown.',
  },
  {
    icon: '🔍',
    title: 'Filter by route',
    target: '#transp-filter',
    placement: 'right',
    body:
      'Use the filter box to narrow available deliveries by location or route. Type a city or address to find jobs in your area instantly.',
  },
  {
    icon: '✅',
    title: 'Accept a delivery',
    target: '#transp-accept-btn',
    placement: 'right',
    body:
      'Click "Accept" to take the job. The delivery moves to your active list, its status becomes in transit, and the buyer sees the request as delivering.',
    tip: 'Accepting the demo carrot delivery is safe — the "My Deliveries" section below is ready to receive it.',
  },
  {
    icon: '🧭',
    title: 'View the route',
    target: '#transp-mine',
    placement: 'right',
    body:
      '"My Deliveries" lists the jobs you have accepted. "View route" opens Google Maps with the exact pickup and drop-off points.',
  },
  {
    icon: '🏁',
    title: 'Complete the delivery',
    target: '#transp-complete-btn',
    placement: 'right',
    body:
      'Once you drop off the produce, click "Mark completed". The delivery is marked delivered and the buyer’s request becomes completed.',
  },
];
