// ============================================================
//  BREW & BLOOM — site content
//  This is the file you'll edit most. Change text, prices, or
//  image names here and the website updates automatically.
//  All names, prices, hours and contact details are SAMPLE
//  placeholders for a fictional concept café.
// ============================================================

// ---- Site-wide settings -----------------------------------
const site = {
  name: 'Brew & Bloom',
  tagline: 'Every Cup Tells a Story.',

  // Leave "" while the café is fictional. When you have a real, valid
  // Google Maps link, paste it here and the "Get Directions" button turns on.
  directionsUrl: '',

  // Leave "" for the honest demo mode (nothing is sent anywhere).
  // To receive real enquiries, paste a form-service URL here, e.g.
  // a Formspree endpoint like "https://formspree.io/f/yourFormId".
  formEndpoint: '',

  address: ['12 Placeholder Lane', 'Sample Town 000000', 'India'],
  phone: '+91 00000 00000',
  email: 'hello@brewandbloom.example',
  social: [
    { label: 'Instagram', url: 'https://www.instagram.com/' },
    { label: 'Facebook', url: 'https://www.facebook.com/' },
    { label: 'Pinterest', url: 'https://www.pinterest.com/' },
  ],
};

// ---- Opening hours (placeholder) --------------------------
const hours = [
  { days: 'Monday – Friday', time: '7:30 am – 9:00 pm' },
  { days: 'Saturday', time: '8:00 am – 10:00 pm' },
  { days: 'Sunday', time: '8:00 am – 8:00 pm' },
];

// ---- Menu -------------------------------------------------
// category must be one of: "coffee" | "cold" | "bakery"
// image = file name inside the /assets folder
const categories = [
  { id: 'all', label: 'All' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'cold', label: 'Cold Beverages' },
  { id: 'bakery', label: 'Bakery & Desserts' },
];

const menu = [
  { name: 'Espresso', price: 120, category: 'coffee', image: 'item-espresso.svg',
    alt: 'Top-down illustration of a small cup of espresso on a saucer',
    description: 'A short, concentrated shot with a rich, golden crema.' },
  { name: 'Cappuccino', price: 160, category: 'coffee', image: 'item-cappuccino.svg',
    alt: 'Top-down illustration of a cappuccino with thick milk foam',
    description: 'Equal parts espresso, steamed milk and velvety foam.' },
  { name: 'Café Latte', price: 170, category: 'coffee', image: 'item-latte.svg',
    alt: 'Top-down illustration of a latte with a leaf pattern in the milk',
    description: 'Smooth espresso softened with silky steamed milk.' },
  { name: 'Caramel Latte', price: 190, category: 'coffee', image: 'item-caramel.svg',
    alt: 'Top-down illustration of a latte with a caramel zig-zag drizzle',
    description: 'Our latte finished with a sweet caramel drizzle.' },
  { name: 'Mocha', price: 200, category: 'coffee', image: 'item-mocha.svg',
    alt: 'Top-down illustration of a mocha with a chocolate swirl',
    description: 'Espresso and chocolate with steamed milk, for the sweet-toothed.' },

  { name: 'Iced Americano', price: 150, category: 'cold', image: 'item-americano.svg',
    alt: 'Illustration of a tall glass of iced americano with a straw',
    description: 'Espresso over ice and cold water. Clean, bright, refreshing.' },
  { name: 'Iced Latte', price: 180, category: 'cold', image: 'item-icedlatte.svg',
    alt: 'Illustration of an iced latte with milk and espresso layers',
    description: 'Cold milk and espresso poured over ice in layers.' },
  { name: 'Cold Coffee', price: 190, category: 'cold', image: 'item-coldcoffee.svg',
    alt: 'Illustration of a glass of cold coffee topped with cream',
    description: 'Creamy, chilled and lightly sweet, topped with cream.' },

  { name: 'Butter Croissant', price: 130, category: 'bakery', image: 'item-croissant.svg',
    alt: 'Illustration of a golden butter croissant on a plate',
    description: 'Flaky, golden layers with a buttery crumb.' },
  { name: 'Chocolate Brownie', price: 140, category: 'bakery', image: 'item-brownie.svg',
    alt: 'Illustration of a square chocolate brownie on a plate',
    description: 'Dense, fudgy and deeply chocolatey.' },
  { name: 'Blueberry Cheesecake', price: 220, category: 'bakery', image: 'item-cheesecake.svg',
    alt: 'Illustration of a slice of cheesecake topped with blueberries',
    description: 'Creamy cheesecake on a biscuit base with blueberry topping.' },
  { name: 'Chocolate Chip Cookie', price: 90, category: 'bakery', image: 'item-cookie.svg',
    alt: 'Illustration of a chocolate chip cookie on a plate',
    description: 'Soft in the middle, golden at the edges, full of chocolate chips.' },
];

// ---- Best sellers ("House picks") -------------------------
const picks = [
  { name: 'Signature Caramel Latte', image: 'best-caramel.svg',
    alt: 'Large illustration of a caramel latte seen from above',
    tag: 'Coffee',
    description: 'Espresso, steamed milk and a slow ribbon of caramel. Sweet without being heavy.' },
  { name: 'Iced Vanilla Latte', image: 'best-icedlatte.svg',
    alt: 'Large illustration of a tall iced latte with a straw',
    tag: 'Cold',
    description: 'Cold milk, a hint of vanilla and a shot of espresso over ice, made for warm afternoons.' },
  { name: 'Butter Croissant', image: 'best-croissant.svg',
    alt: 'Large illustration of a golden croissant on a plate',
    tag: 'Bakery',
    description: 'Crisp outside, soft and layered inside. Lovely beside any cup on the menu.' },
];

// ---- Gallery ----------------------------------------------
// size controls the tile shape: "tall" | "wide" | "square"
const gallery = [
  { image: 'g-prep.svg', size: 'tall', caption: 'Coffee preparation',
    alt: 'Illustration of an espresso machine pouring a shot into a cup' },
  { image: 'g-latteart.svg', size: 'square', caption: 'Latte art',
    alt: 'Illustration of a latte with leaf-shaped milk art seen from above' },
  { image: 'g-pastry.svg', size: 'wide', caption: 'Pastries & desserts',
    alt: 'Illustration of a tray of croissants, a brownie, cookies and cheesecake' },
  { image: 'g-interior.svg', size: 'wide', caption: 'A cozy café interior',
    alt: 'Illustration of a café interior with arched windows, plants and small tables' },
  { image: 'g-sunlight.svg', size: 'square', caption: 'Sunlight & coffee cups',
    alt: 'Illustration of two coffee cups on a table in a band of sunlight' },
  { image: 'g-seating.svg', size: 'tall', caption: 'Inviting seating',
    alt: 'Illustration of an armchair, a side table and a plant beside a window' },
];

// ---- Reservation options ----------------------------------
const timeSlots = [
  '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm',
  '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm',
];
const maxGuests = 8;
