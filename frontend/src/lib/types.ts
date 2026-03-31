export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  price: number;
  compare_price?: number | null;
  image: string | null;
  product_type: "single_card" | "slab" | "sealed" | "protection" | "storage";
  condition?: string | null;
  grade?: number | null;
  grading_company?: string | null;
  is_new?: boolean;
  is_featured?: boolean;
  in_stock?: boolean;
  set_name?: string;
  rarity?: string;
}

// Convert API product to ProductCardProps
export function toCardProps(p: any): import("@/components/products/ProductCard").ProductCardProps {
  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name,
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    image: p.image || "",
    productType: p.product_type,
    condition: p.condition ?? undefined,
    grade: p.grade ? parseFloat(p.grade) : undefined,
    gradingCompany: p.grading_company ?? undefined,
    isNew: p.is_new ?? false,
    isFavourited: false,
    inStock: p.in_stock ?? true,
  };
}
