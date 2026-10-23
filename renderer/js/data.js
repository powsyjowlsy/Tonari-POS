// Official Tonari Menu Catalog & Inventory Seed Data
// Sourced directly from ISY108 Stakeholder Presentation (Pages 1-7)

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
  // Katsu Curry
  {
    id: 'TN-CUR-01',
    name: 'Chicken Katsu Curry',
    category: 'curry',
    categoryName: 'Katsu Curry',
    price: 110.00,
    stock: 25,
    minStock: 8,
    description: 'Crispy deep-fried chicken cutlet served with rich Japanese curry sauce and steamed rice.'
  },
  {
    id: 'TN-CUR-02',
    name: 'Pork Katsu Curry',
    category: 'curry',
    categoryName: 'Katsu Curry',
    price: 125.00,
    stock: 20,
    minStock: 8,
    description: 'Breaded tender pork cutlet with authentic Japanese vegetable curry sauce and rice.'
  },
  {
    id: 'TN-CUR-03',
    name: 'Katsu Curry Ala Carte',
    category: 'curry',
    categoryName: 'Katsu Curry',
    price: 95.00,
    stock: 18,
    minStock: 5,
    description: 'Crispy chicken katsu cutlet with Japanese curry sauce without rice.'
  },

  // Takoyaki
  {
    id: 'TN-TAK-01',
    name: 'Classic Octopus Takoyaki (4 pcs)',
    category: 'takoyaki',
    categoryName: 'Takoyaki',
    price: 50.00,
    stock: 40,
    minStock: 12,
    description: '4 pieces of savory Japanese octopus balls drizzled with kewpie mayo, takoyaki sauce, and bonito flakes.'
  },
  {
    id: 'TN-TAK-02',
    name: 'Classic Octopus Takoyaki (8 pcs)',
    category: 'takoyaki',
    categoryName: 'Takoyaki',
    price: 95.00,
    stock: 30,
    minStock: 10,
    description: '8 pieces of savory Japanese octopus balls with signature glaze, kewpie mayo, and nori strips.'
  },
  {
    id: 'TN-TAK-03',
    name: 'Cheesy Overload Takoyaki (4 pcs)',
    category: 'takoyaki',
    categoryName: 'Takoyaki',
    price: 65.00,
    stock: 25,
    minStock: 8,
    description: '4 pieces of takoyaki topped with melted cheddar and mozzarella cheese sauce.'
  },

  // Ramen
  {
    id: 'TN-RAM-01',
    name: 'Tonkotsu Rich Broth Ramen',
    category: 'ramen',
    categoryName: 'Ramen',
    price: 120.00,
    stock: 20,
    minStock: 6,
    description: 'Creamy 8-hour pork bone broth with springy noodles, pork chashu, soft-boiled egg, and scallions.'
  },
  {
    id: 'TN-RAM-02',
    name: 'Spicy Miso Ramen',
    category: 'ramen',
    categoryName: 'Ramen',
    price: 125.00,
    stock: 18,
    minStock: 6,
    description: 'Rich fermented miso broth infused with spicy chili oil, ground pork, sweet corn, and bamboo shoots.'
  },

  // Gyoza
  {
    id: 'TN-GYO-01',
    name: 'Pan-Fried Pork Gyoza (4 pcs)',
    category: 'gyoza',
    categoryName: 'Gyoza',
    price: 55.00,
    stock: 35,
    minStock: 10,
    description: '4 pieces of crispy pan-seared pork and garlic chive dumplings with ponzu dipping sauce.'
  },
  {
    id: 'TN-GYO-02',
    name: 'Pan-Fried Pork Gyoza (6 pcs)',
    category: 'gyoza',
    categoryName: 'Gyoza',
    price: 80.00,
    stock: 25,
    minStock: 8,
    description: '6 pieces of golden crispy-bottom dumplings served with house dipping sauce.'
  },

  // Ninja Wings
  {
    id: 'TN-WNG-01',
    name: 'Ninja Wings Rice Meal (3 pcs)',
    category: 'wings',
    categoryName: 'Ninja Wings',
    price: 99.00,
    stock: 22,
    minStock: 8,
    description: '3 pieces of Japanese glazed chicken wings (Sweet Teriyaki) served with steamed garlic rice.'
  },
  {
    id: 'TN-WNG-02',
    name: 'Ninja Wings Ala Carte (6 pcs)',
    category: 'wings',
    categoryName: 'Ninja Wings',
    price: 145.00,
    stock: 18,
    minStock: 6,
    description: '6 pieces of crispy glazed wings tossed in spicy Japanese togarashi glaze.'
  },

  // Fruit Soda
  {
    id: 'TN-SDA-01',
    name: 'Green Apple Fruit Soda (16oz)',
    category: 'soda',
    categoryName: 'Fruit Soda',
    price: 39.00,
    stock: 50,
    minStock: 15,
    description: 'Sparkling soda cooler infused with crisp green apple syrup and popping boba.'
  },
  {
    id: 'TN-SDA-02',
    name: 'Strawberry Lychee Soda (16oz)',
    category: 'soda',
    categoryName: 'Fruit Soda',
    price: 39.00,
    stock: 45,
    minStock: 15,
    description: 'Chilled sparkling beverage blended with strawberry puree and sweet lychee fruit jelly.'
  },
  {
    id: 'TN-SDA-03',
    name: 'Blue Lemonade Fizz (16oz)',
    category: 'soda',
    categoryName: 'Fruit Soda',
    price: 35.00,
    stock: 50,
    minStock: 15,
    description: 'Zesty blue citrus cooler with fizzy carbonation, popular among students.'
  }
];

if (typeof window !== 'undefined') {
  window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
  window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
}
