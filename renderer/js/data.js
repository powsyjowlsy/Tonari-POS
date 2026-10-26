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

// Master Recipe Bill of Materials (BOM) Ingredient & Packaging Catalog
// Sourced from ISY108 Menu Engineering Standards & IEEE SRS Table 4/6
// Observes: 31 Canonical Items across 6 Cohesive Inventory Categories
const DEFAULT_INGREDIENTS = [
  // --------------------------------------------------------------------------
  // Category 1: Proteins & Meats (8 items)
  // --------------------------------------------------------------------------
  { id: 'ING-OCTOPUS', name: 'Diced Octopus Chunks', category: 'Proteins', stock: 500, unit: 'pcs', minStock: 80, costPerUnit: 2.50 },
  { id: 'ING-CHICKEN-CUTLET', name: 'Breaded Chicken Cutlet', category: 'Proteins', stock: 45, unit: 'pcs', minStock: 15, costPerUnit: 35.00 },
  { id: 'ING-PORK-CUTLET', name: 'Breaded Pork Cutlet', category: 'Proteins', stock: 35, unit: 'pcs', minStock: 12, costPerUnit: 42.00 },
  { id: 'ING-CHASHU', name: 'Pork Chashu Slices', category: 'Proteins', stock: 80, unit: 'slices', minStock: 20, costPerUnit: 12.00 },
  { id: 'ING-GROUND-PORK', name: 'Seasoned Ground Pork', category: 'Proteins', stock: 1500, unit: 'g', minStock: 400, costPerUnit: 0.28 },
  { id: 'ING-CHICKEN-WINGS', name: 'Marinated Chicken Wings', category: 'Proteins', stock: 150, unit: 'pcs', minStock: 40, costPerUnit: 16.00 },
  { id: 'ING-GYOZA-DUMPLING', name: 'Pork & Chive Dumplings', category: 'Proteins', stock: 200, unit: 'pcs', minStock: 50, costPerUnit: 7.50 },
  { id: 'ING-RAMEN-EGG', name: 'Ajitsuke Tamago (Ramen Egg)', category: 'Proteins', stock: 40, unit: 'pcs', minStock: 12, costPerUnit: 10.00 },

  // --------------------------------------------------------------------------
  // Category 2: Starches, Bases & Noodles (3 items)
  // --------------------------------------------------------------------------
  { id: 'ING-TAKO-BATTER', name: 'Takoyaki Dashi Batter', category: 'Starches', stock: 5000, unit: 'g', minStock: 1200, costPerUnit: 0.08 },
  { id: 'ING-STEAMED-RICE', name: 'Japanese Steamed Rice', category: 'Starches', stock: 8000, unit: 'g', minStock: 2000, costPerUnit: 0.05 },
  { id: 'ING-RAMEN-NOODLE', name: 'Fresh Ramen Noodles', category: 'Starches', stock: 40, unit: 'portions', minStock: 12, costPerUnit: 18.00 },

  // --------------------------------------------------------------------------
  // Category 3: Broths, Sauces & Condiments (8 items)
  // --------------------------------------------------------------------------
  { id: 'ING-CURRY-SAUCE', name: 'Japanese Curry Sauce', category: 'Sauces', stock: 6000, unit: 'ml', minStock: 1500, costPerUnit: 0.12 },
  { id: 'ING-TONKOTSU-BROTH', name: 'Tonkotsu Pork Broth', category: 'Broths', stock: 7000, unit: 'ml', minStock: 2000, costPerUnit: 0.09 },
  { id: 'ING-MISO-BROTH', name: 'Spicy Miso Broth Base', category: 'Broths', stock: 7000, unit: 'ml', minStock: 2000, costPerUnit: 0.10 },
  { id: 'ING-TAKO-SAUCE', name: 'Takoyaki Sweet Brown Glaze', category: 'Sauces', stock: 2500, unit: 'ml', minStock: 500, costPerUnit: 0.15 },
  { id: 'ING-KEWPIE-MAYO', name: 'Kewpie Japanese Mayo', category: 'Sauces', stock: 2000, unit: 'ml', minStock: 400, costPerUnit: 0.20 },
  { id: 'ING-CHEESE-SAUCE', name: 'Melted Cheddar Sauce', category: 'Sauces', stock: 1500, unit: 'ml', minStock: 300, costPerUnit: 0.22 },
  { id: 'ING-PONZU-DIP', name: 'Ponzu Dipping Sauce', category: 'Sauces', stock: 2000, unit: 'ml', minStock: 400, costPerUnit: 0.08 },
  { id: 'ING-TERIYAKI-GLAZE', name: 'Ninja Teriyaki Glaze', category: 'Sauces', stock: 2500, unit: 'ml', minStock: 500, costPerUnit: 0.14 },

  // --------------------------------------------------------------------------
  // Category 4: Garnishes & Toppings (2 items)
  // --------------------------------------------------------------------------
  { id: 'ING-BONITO-FLAKES', name: 'Katsuobushi Bonito Flakes', category: 'Garnishes', stock: 300, unit: 'g', minStock: 60, costPerUnit: 0.85 },
  { id: 'ING-SCALLIONS', name: 'Chopped Fresh Scallions', category: 'Garnishes', stock: 600, unit: 'g', minStock: 150, costPerUnit: 0.15 },

  // --------------------------------------------------------------------------
  // Category 5: Beverage Ingredients (4 items)
  // --------------------------------------------------------------------------
  { id: 'ING-SODA-BASE', name: 'Sparkling Carbonated Soda', category: 'Beverages', stock: 15000, unit: 'ml', minStock: 3000, costPerUnit: 0.03 },
  { id: 'ING-APPLE-SYRUP', name: 'Green Apple Syrup', category: 'Beverages', stock: 2000, unit: 'ml', minStock: 400, costPerUnit: 0.18 },
  { id: 'ING-STRAWBERRY-SYRUP', name: 'Strawberry Puree Syrup', category: 'Beverages', stock: 2000, unit: 'ml', minStock: 400, costPerUnit: 0.18 },
  { id: 'ING-BLUE-CITRUS', name: 'Blue Curacao Syrup', category: 'Beverages', stock: 2000, unit: 'ml', minStock: 400, costPerUnit: 0.16 },

  // --------------------------------------------------------------------------
  // Category 6: Packaging & Disposables (6 items)
  // --------------------------------------------------------------------------
  { id: 'PKG-TAKO-BOX', name: 'Takoyaki Paper Boat / Box', category: 'Packaging', stock: 150, unit: 'pcs', minStock: 35, costPerUnit: 2.50 },
  { id: 'PKG-BENTO-BOX', name: 'Rice Meal Bento Box & Lid', category: 'Packaging', stock: 90, unit: 'pcs', minStock: 25, costPerUnit: 4.80 },
  { id: 'PKG-RAMEN-BOWL', name: 'Thermal Ramen Bowl & Lid', category: 'Packaging', stock: 60, unit: 'pcs', minStock: 15, costPerUnit: 6.50 },
  { id: 'PKG-SNACK-TRAY', name: 'Snack / Gyoza Paper Tray', category: 'Packaging', stock: 120, unit: 'pcs', minStock: 30, costPerUnit: 1.80 },
  { id: 'PKG-WING-BOX', name: 'Ala Carte Wing Box', category: 'Packaging', stock: 70, unit: 'pcs', minStock: 20, costPerUnit: 3.20 },
  { id: 'PKG-CUP-16OZ', name: '16oz Beverage Cup & Lid Set', category: 'Packaging', stock: 150, unit: 'pcs', minStock: 40, costPerUnit: 3.50 }
];

// Master Bill of Materials (BOM) Decomposition Matrix for All 15 Menu Products
// Maps each Product ID to its mandatory raw ingredient and packaging requirements
const DEFAULT_RECIPES = {
  // --------------------------------------------------------------------------
  // Category 1: Katsu Curry
  // --------------------------------------------------------------------------
  'TN-CUR-01': [ // Chicken Katsu Curry
    { ingredientId: 'ING-CHICKEN-CUTLET', quantity: 1 },
    { ingredientId: 'ING-CURRY-SAUCE', quantity: 150 },
    { ingredientId: 'ING-STEAMED-RICE', quantity: 200 },
    { ingredientId: 'PKG-BENTO-BOX', quantity: 1 }
  ],
  'TN-CUR-02': [ // Pork Katsu Curry
    { ingredientId: 'ING-PORK-CUTLET', quantity: 1 },
    { ingredientId: 'ING-CURRY-SAUCE', quantity: 150 },
    { ingredientId: 'ING-STEAMED-RICE', quantity: 200 },
    { ingredientId: 'PKG-BENTO-BOX', quantity: 1 }
  ],
  'TN-CUR-03': [ // Katsu Curry Ala Carte
    { ingredientId: 'ING-CHICKEN-CUTLET', quantity: 1 },
    { ingredientId: 'ING-CURRY-SAUCE', quantity: 120 },
    { ingredientId: 'PKG-SNACK-TRAY', quantity: 1 }
  ],

  // --------------------------------------------------------------------------
  // Category 2: Takoyaki
  // --------------------------------------------------------------------------
  'TN-TAK-01': [ // Classic Octopus Takoyaki (4 pcs)
    { ingredientId: 'ING-TAKO-BATTER', quantity: 60 },
    { ingredientId: 'ING-OCTOPUS', quantity: 4 },
    { ingredientId: 'ING-TAKO-SAUCE', quantity: 15 },
    { ingredientId: 'ING-KEWPIE-MAYO', quantity: 10 },
    { ingredientId: 'ING-BONITO-FLAKES', quantity: 2 },
    { ingredientId: 'PKG-TAKO-BOX', quantity: 1 }
  ],
  'TN-TAK-02': [ // Classic Octopus Takoyaki (8 pcs)
    { ingredientId: 'ING-TAKO-BATTER', quantity: 120 },
    { ingredientId: 'ING-OCTOPUS', quantity: 8 },
    { ingredientId: 'ING-TAKO-SAUCE', quantity: 30 },
    { ingredientId: 'ING-KEWPIE-MAYO', quantity: 20 },
    { ingredientId: 'ING-BONITO-FLAKES', quantity: 4 },
    { ingredientId: 'PKG-TAKO-BOX', quantity: 1 }
  ],
  'TN-TAK-03': [ // Cheesy Overload Takoyaki (4 pcs)
    { ingredientId: 'ING-TAKO-BATTER', quantity: 60 },
    { ingredientId: 'ING-OCTOPUS', quantity: 4 },
    { ingredientId: 'ING-CHEESE-SAUCE', quantity: 30 },
    { ingredientId: 'PKG-TAKO-BOX', quantity: 1 }
  ],

  // --------------------------------------------------------------------------
  // Category 3: Ramen
  // --------------------------------------------------------------------------
  'TN-RAM-01': [ // Tonkotsu Rich Broth Ramen
    { ingredientId: 'ING-RAMEN-NOODLE', quantity: 1 },
    { ingredientId: 'ING-TONKOTSU-BROTH', quantity: 350 },
    { ingredientId: 'ING-CHASHU', quantity: 2 },
    { ingredientId: 'ING-RAMEN-EGG', quantity: 1 },
    { ingredientId: 'ING-SCALLIONS', quantity: 10 },
    { ingredientId: 'PKG-RAMEN-BOWL', quantity: 1 }
  ],
  'TN-RAM-02': [ // Spicy Miso Ramen
    { ingredientId: 'ING-RAMEN-NOODLE', quantity: 1 },
    { ingredientId: 'ING-MISO-BROTH', quantity: 350 },
    { ingredientId: 'ING-GROUND-PORK', quantity: 50 },
    { ingredientId: 'ING-SCALLIONS', quantity: 10 },
    { ingredientId: 'PKG-RAMEN-BOWL', quantity: 1 }
  ],

  // --------------------------------------------------------------------------
  // Category 4: Gyoza
  // --------------------------------------------------------------------------
  'TN-GYO-01': [ // Pan-Fried Pork Gyoza (4 pcs)
    { ingredientId: 'ING-GYOZA-DUMPLING', quantity: 4 },
    { ingredientId: 'ING-PONZU-DIP', quantity: 20 },
    { ingredientId: 'PKG-SNACK-TRAY', quantity: 1 }
  ],
  'TN-GYO-02': [ // Pan-Fried Pork Gyoza (6 pcs)
    { ingredientId: 'ING-GYOZA-DUMPLING', quantity: 6 },
    { ingredientId: 'ING-PONZU-DIP', quantity: 25 },
    { ingredientId: 'PKG-SNACK-TRAY', quantity: 1 }
  ],

  // --------------------------------------------------------------------------
  // Category 5: Ninja Wings
  // --------------------------------------------------------------------------
  'TN-WNG-01': [ // Ninja Wings Rice Meal (3 pcs)
    { ingredientId: 'ING-CHICKEN-WINGS', quantity: 3 },
    { ingredientId: 'ING-TERIYAKI-GLAZE', quantity: 25 },
    { ingredientId: 'ING-STEAMED-RICE', quantity: 180 },
    { ingredientId: 'PKG-BENTO-BOX', quantity: 1 }
  ],
  'TN-WNG-02': [ // Ninja Wings Ala Carte (6 pcs)
    { ingredientId: 'ING-CHICKEN-WINGS', quantity: 6 },
    { ingredientId: 'ING-TERIYAKI-GLAZE', quantity: 45 },
    { ingredientId: 'PKG-WING-BOX', quantity: 1 }
  ],

  // --------------------------------------------------------------------------
  // Category 6: Fruit Soda
  // --------------------------------------------------------------------------
  'TN-SDA-01': [ // Green Apple Fruit Soda (16oz)
    { ingredientId: 'ING-SODA-BASE', quantity: 300 },
    { ingredientId: 'ING-APPLE-SYRUP', quantity: 40 },
    { ingredientId: 'PKG-CUP-16OZ', quantity: 1 }
  ],
  'TN-SDA-02': [ // Strawberry Lychee Soda (16oz)
    { ingredientId: 'ING-SODA-BASE', quantity: 300 },
    { ingredientId: 'ING-STRAWBERRY-SYRUP', quantity: 40 },
    { ingredientId: 'PKG-CUP-16OZ', quantity: 1 }
  ],
  'TN-SDA-03': [ // Blue Lemonade Fizz (16oz)
    { ingredientId: 'ING-SODA-BASE', quantity: 300 },
    { ingredientId: 'ING-BLUE-CITRUS', quantity: 35 },
    { ingredientId: 'PKG-CUP-16OZ', quantity: 1 }
  ]
};

// Attach data structures to global window object for browser and Electron renderer access
if (typeof window !== 'undefined') {
  window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
  window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
  window.DEFAULT_INGREDIENTS = DEFAULT_INGREDIENTS;
  window.DEFAULT_RECIPES = DEFAULT_RECIPES;
}

// Support Node.js CommonJS exports for headless automated testing suites
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_CATEGORIES,
    DEFAULT_PRODUCTS,
    DEFAULT_INGREDIENTS,
    DEFAULT_RECIPES
  };
}
