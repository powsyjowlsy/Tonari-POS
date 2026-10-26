// Official Tonari Menu Catalog & Inventory Seed Data
// Sourced directly from ISY108 Stakeholder Presentation (Pages 1-7) & Master IEEE SRS (Section 7)
// Educational Documentation: Defines category hierarchy, product specifications, base prices, stock thresholds, and flavor modifiers

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Items' },
  { id: 'curry', name: 'Katsu Curry' },
  { id: 'takoyaki', name: 'Takoyaki' },
  { id: 'ramen', name: 'Ramen' },
  { id: 'gyoza', name: 'Gyoza' },
  { id: 'wings', name: 'Ninja Wings' },
  { id: 'soda', name: 'Fruit Soda' }
];

const DEFAULT_PRODUCTS = [
  // --------------------------------------------------------------------------
  // Category 1: Katsu Curry (Signature Rice Meals)
  // --------------------------------------------------------------------------
  {
    id: 'TN-CUR-01',
    name: 'Chicken Katsu Curry',
    category: 'curry',
    categoryName: 'Katsu Curry',
    price: 110.00,
    stock: 25,
    minStock: 8,
    description: 'Crispy deep-fried chicken cutlet served with rich Japanese curry sauce and steamed rice.',
    modifiers: ['Mild Curry', 'Spicy Curry', 'Extra Sauce (+PHP 15.00)']
  },
  {
    id: 'TN-CUR-02',
    name: 'Pork Katsu Curry',
    category: 'curry',
    categoryName: 'Katsu Curry',
    price: 125.00,
    stock: 20,
    minStock: 8,
    description: 'Breaded tender pork cutlet with authentic Japanese vegetable curry sauce and rice.',
    modifiers: ['Mild Curry', 'Spicy Curry', 'Extra Sauce (+PHP 15.00)']
  },
  {
    id: 'TN-CUR-03',
    name: 'Katsu Curry Ala Carte',
    category: 'curry',
    categoryName: 'Katsu Curry',
    price: 95.00,
    stock: 18,
    minStock: 5,
    description: 'Crispy chicken katsu cutlet with Japanese curry sauce without rice.',
    modifiers: ['Mild Curry', 'Spicy Curry']
  },

  // --------------------------------------------------------------------------
  // Category 2: Takoyaki (Japanese Octopus Street Balls)
  // --------------------------------------------------------------------------
  {
    id: 'TN-TAK-01',
    name: 'Classic Octopus Takoyaki (4 pcs)',
    category: 'takoyaki',
    categoryName: 'Takoyaki',
    price: 50.00,
    stock: 40,
    minStock: 12,
    description: '4 pieces of savory Japanese octopus balls drizzled with kewpie mayo, takoyaki sauce, and bonito flakes.',
    modifiers: ['Classic Glaze', 'Spicy Togarashi', 'Cheesy Drizzle']
  },
  {
    id: 'TN-TAK-02',
    name: 'Classic Octopus Takoyaki (8 pcs)',
    category: 'takoyaki',
    categoryName: 'Takoyaki',
    price: 95.00,
    stock: 30,
    minStock: 10,
    description: '8 pieces of savory Japanese octopus balls with signature glaze, kewpie mayo, and nori strips.',
    modifiers: ['Classic Glaze', 'Spicy Togarashi', 'Cheesy Drizzle']
  },
  {
    id: 'TN-TAK-03',
    name: 'Cheesy Overload Takoyaki (4 pcs)',
    category: 'takoyaki',
    categoryName: 'Takoyaki',
    price: 65.00,
    stock: 25,
    minStock: 8,
    description: '4 pieces of takoyaki topped with melted cheddar and mozzarella cheese sauce.',
    modifiers: ['Melted Cheddar', 'Spicy Mozzarella']
  },

  // --------------------------------------------------------------------------
  // Category 3: Ramen (Authentic Noodle Soups)
  // --------------------------------------------------------------------------
  {
    id: 'TN-RAM-01',
    name: 'Tonkotsu Rich Broth Ramen',
    category: 'ramen',
    categoryName: 'Ramen',
    price: 120.00,
    stock: 20,
    minStock: 6,
    description: 'Creamy 8-hour pork bone broth with springy noodles, pork chashu, soft-boiled egg, and scallions.',
    modifiers: ['Regular Broth', 'Spicy Tonkotsu', 'Extra Noodle (+PHP 25.00)']
  },
  {
    id: 'TN-RAM-02',
    name: 'Spicy Miso Ramen',
    category: 'ramen',
    categoryName: 'Ramen',
    price: 125.00,
    stock: 18,
    minStock: 6,
    description: 'Rich fermented miso broth infused with spicy chili oil, ground pork, sweet corn, and bamboo shoots.',
    modifiers: ['Medium Heat', 'Extra Spicy', 'Extra Egg (+PHP 15.00)']
  },

  // --------------------------------------------------------------------------
  // Category 4: Gyoza (Crispy Pan-Fried Dumplings)
  // --------------------------------------------------------------------------
  {
    id: 'TN-GYO-01',
    name: 'Pan-Fried Pork Gyoza (4 pcs)',
    category: 'gyoza',
    categoryName: 'Gyoza',
    price: 55.00,
    stock: 35,
    minStock: 10,
    description: '4 pieces of crispy pan-seared pork and garlic chive dumplings with ponzu dipping sauce.',
    modifiers: ['Ponzu Dip', 'Spicy Chili Garlic Dip']
  },
  {
    id: 'TN-GYO-02',
    name: 'Pan-Fried Pork Gyoza (6 pcs)',
    category: 'gyoza',
    categoryName: 'Gyoza',
    price: 80.00,
    stock: 25,
    minStock: 8,
    description: '6 pieces of golden crispy-bottom dumplings served with house dipping sauce.',
    modifiers: ['Ponzu Dip', 'Spicy Chili Garlic Dip']
  },

  // --------------------------------------------------------------------------
  // Category 5: Ninja Wings (Glazed Japanese Chicken Wings)
  // --------------------------------------------------------------------------
  {
    id: 'TN-WNG-01',
    name: 'Ninja Wings Rice Meal (3 pcs)',
    category: 'wings',
    categoryName: 'Ninja Wings',
    price: 99.00,
    stock: 22,
    minStock: 8,
    description: '3 pieces of Japanese glazed chicken wings served with steamed garlic rice.',
    modifiers: ['Sweet Teriyaki Glaze', 'Spicy Togarashi', 'Garlic Soy']
  },
  {
    id: 'TN-WNG-02',
    name: 'Ninja Wings Ala Carte (6 pcs)',
    category: 'wings',
    categoryName: 'Ninja Wings',
    price: 145.00,
    stock: 18,
    minStock: 6,
    description: '6 pieces of crispy glazed wings tossed in spicy Japanese togarashi glaze.',
    modifiers: ['Sweet Teriyaki Glaze', 'Spicy Togarashi', 'Garlic Soy']
  },

  // --------------------------------------------------------------------------
  // Category 6: Fruit Soda (Sparkling Carbonated Coolers)
  // --------------------------------------------------------------------------
  {
    id: 'TN-SDA-01',
    name: 'Green Apple Fruit Soda (16oz)',
    category: 'soda',
    categoryName: 'Fruit Soda',
    price: 39.00,
    stock: 50,
    minStock: 15,
    description: 'Sparkling soda cooler infused with crisp green apple syrup and popping boba.',
    modifiers: ['Standard Ice', 'Less Ice', 'Extra Popping Boba (+PHP 10.00)']
  },
  {
    id: 'TN-SDA-02',
    name: 'Strawberry Lychee Soda (16oz)',
    category: 'soda',
    categoryName: 'Fruit Soda',
    price: 39.00,
    stock: 45,
    minStock: 15,
    description: 'Chilled sparkling beverage blended with strawberry puree and sweet lychee fruit jelly.',
    modifiers: ['Standard Ice', 'Less Ice', 'Extra Popping Boba (+PHP 10.00)']
  },
  {
    id: 'TN-SDA-03',
    name: 'Blue Lemonade Fizz (16oz)',
    category: 'soda',
    categoryName: 'Fruit Soda',
    price: 35.00,
    stock: 50,
    minStock: 15,
    description: 'Zesty blue citrus cooler with fizzy carbonation, popular among students.',
    modifiers: ['Standard Ice', 'Less Ice', 'Extra Popping Boba (+PHP 10.00)']
  }
];

// Attach data structures to global window object for browser and Electron renderer access
if (typeof window !== 'undefined') {
  window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
  window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
}
