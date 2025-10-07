export type Product = {
  slug: string;
  name: string;
  city: string;
  description: string;
  price: number;
  image: string;
  colors: string[];
  sizes: string[];
};

export const memleketProducts: Product[] = [
  {
    slug: "istanbul",
    name: "Memleket: Istanbul Tee",
    city: "Istanbul",
    description:
      "Two-continents energy. A shirt for bridges, ferries, and late tea.",
    price: 34,
    image: "/memleket/istanbul.jpg",
    colors: ["black", "white"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "ankara",
    name: "Memleket: Ankara Tee",
    city: "Ankara",
    description:
      "Quiet confidence. Bureaucracy by day, sincerity by night. Memleket.",
    price: 34,
    image: "/memleket/ankara.jpg",
    colors: ["black", "white"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "izmir",
    name: "Memleket: Izmir Tee",
    city: "Izmir",
    description:
      "Sea breeze sarcasm. Simit crumbs and the softest sunsets.",
    price: 34,
    image: "/memleket/izmir.jpg",
    colors: ["black", "white"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "trabzon",
    name: "Memleket: Trabzon Tee",
    city: "Trabzon",
    description: "Green slopes, loud love. Rain jacket soul, tea glass heart.",
    price: 34,
    image: "/memleket/trabzon.jpg",
    colors: ["black", "white"],
    sizes: ["S", "M", "L", "XL"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return memleketProducts.find((p) => p.slug === slug);
}


