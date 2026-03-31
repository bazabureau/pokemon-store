"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import { adminAPI, productsAPI, Category } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const PRODUCT_TYPES = [
  { value: "single_card", label: "Single Card" },
  { value: "sealed_product", label: "Sealed Product" },
  { value: "slab", label: "Slab" },
  { value: "accessory", label: "Accessory" },
];

const CONDITIONS = [
  { value: "", label: "N/A" },
  { value: "mint", label: "Mint" },
  { value: "near_mint", label: "Near Mint" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "played", label: "Played" },
  { value: "poor", label: "Poor" },
];

const GRADING_COMPANIES = [
  { value: "", label: "None" },
  { value: "PSA", label: "PSA" },
  { value: "BGS", label: "BGS" },
  { value: "CGC", label: "CGC" },
];

const LANGUAGES = [
  { value: "EN", label: "English" },
  { value: "JP", label: "Japanese" },
  { value: "KR", label: "Korean" },
  { value: "DE", label: "German" },
  { value: "FR", label: "French" },
];

const RARITIES = [
  { value: "", label: "Select Rarity" },
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "holo_rare", label: "Holo Rare" },
  { value: "ultra_rare", label: "Ultra Rare" },
  { value: "secret_rare", label: "Secret Rare" },
  { value: "illustration_rare", label: "Illustration Rare" },
  { value: "special_art_rare", label: "Special Art Rare" },
  { value: "hyper_rare", label: "Hyper Rare" },
];

export default function ProductFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;
  const toast = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compare_price: "",
    product_type: "single_card",
    condition: "",
    grade: "",
    grading_company: "",
    set_name: "",
    rarity: "",
    card_number: "",
    language: "EN",
    category: "",
    stock_quantity: "1",
    is_featured: false,
    is_new: false,
    is_active: true,
  });

  const [imageFiles, setImageFiles] = useState<{
    image: File | null;
    image_2: File | null;
    image_3: File | null;
  }>({ image: null, image_2: null, image_3: null });

  const [imagePreviews, setImagePreviews] = useState<{
    image: string | null;
    image_2: string | null;
    image_3: string | null;
  }>({ image: null, image_2: null, image_3: null });

  useEffect(() => {
    productsAPI.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (editId) {
      setLoading(true);
      adminAPI
        .productDetail(parseInt(editId))
        .then((p) => {
          setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            compare_price: p.compare_price || "",
            product_type: p.product_type,
            condition: p.condition || "",
            grade: p.grade || "",
            grading_company: p.grading_company || "",
            set_name: p.set_name || "",
            rarity: p.rarity || "",
            card_number: p.card_number || "",
            language: p.language || "EN",
            category: p.category?.toString() || "",
            stock_quantity: p.stock_quantity.toString(),
            is_featured: p.is_featured,
            is_new: p.is_new,
            is_active: p.is_active,
          });
          setImagePreviews({
            image: p.image || null,
            image_2: p.image_2 || null,
            image_3: p.image_3 || null,
          });
        })
        .catch((err) => toast.error("Error", err.message))
        .finally(() => setLoading(false));
    }
  }, [editId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (
    field: "image" | "image_2" | "image_3",
    file: File | null
  ) => {
    setImageFiles((prev) => ({ ...prev, [field]: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setImagePreviews((prev) => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    } else {
      setImagePreviews((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      if (form.compare_price) fd.append("compare_price", form.compare_price);
      fd.append("product_type", form.product_type);
      if (form.condition) fd.append("condition", form.condition);
      if (form.grade) fd.append("grade", form.grade);
      if (form.grading_company) fd.append("grading_company", form.grading_company);
      fd.append("set_name", form.set_name);
      fd.append("rarity", form.rarity);
      if (form.card_number) fd.append("card_number", form.card_number);
      fd.append("language", form.language);
      if (form.category) fd.append("category", form.category);
      fd.append("stock_quantity", form.stock_quantity);
      fd.append("is_featured", form.is_featured.toString());
      fd.append("is_new", form.is_new.toString());
      fd.append("is_active", form.is_active.toString());

      if (imageFiles.image) fd.append("image", imageFiles.image);
      if (imageFiles.image_2) fd.append("image_2", imageFiles.image_2);
      if (imageFiles.image_3) fd.append("image_3", imageFiles.image_3);

      if (isEditing) {
        await adminAPI.updateProduct(parseInt(editId!), fd);
        toast.success("Updated", "Product updated successfully");
      } else {
        await adminAPI.createProduct(fd);
        toast.success("Created", "Product created successfully");
      }
      router.push("/admin/products");
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "0.05em",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    marginBottom: "6px",
    display: "block",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse" style={{ background: "var(--bg-elevated)" }} />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse"
              style={{ background: "var(--bg-elevated)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Header */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase mb-4 transition-colors duration-100"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={12} />
          Back to Products
        </Link>
        <h1
          className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isEditing ? "Edit Product" : "New Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-[11px] font-black tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Basic Information
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                style={inputStyle}
                placeholder="e.g. Charizard VMAX 020/189"
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors resize-none"
                style={inputStyle}
                placeholder="Product description..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Product Type *</label>
                <select
                  name="product_type"
                  value={form.product_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                >
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Language</label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & stock */}
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-[11px] font-black tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Pricing & Stock
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Price (PLN) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Compare Price</label>
                <input
                  type="number"
                  name="compare_price"
                  value={form.compare_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card details */}
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-[11px] font-black tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Card Details
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Condition</label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Grading Company</label>
                <select
                  name="grading_company"
                  value={form.grading_company}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                >
                  {GRADING_COMPANIES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                  placeholder="e.g. 10, 9.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Set Name</label>
                <input
                  type="text"
                  name="set_name"
                  value={form.set_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                  placeholder="e.g. Darkness Ablaze"
                />
              </div>
              <div>
                <label style={labelStyle}>Rarity</label>
                <select
                  name="rarity"
                  value={form.rarity}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                >
                  {RARITIES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Card Number</label>
                <input
                  type="text"
                  name="card_number"
                  value={form.card_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 outline-none focus:border-[var(--accent)] transition-colors"
                  style={inputStyle}
                  placeholder="e.g. 020/189"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-[11px] font-black tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Images
            </h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["image", "image_2", "image_3"] as const).map((field, idx) => (
                <div key={field}>
                  <label style={labelStyle}>
                    {idx === 0 ? "Main Image" : `Image ${idx + 1}`}
                  </label>
                  <div
                    className="relative flex flex-col items-center justify-center p-4 cursor-pointer transition-colors duration-100"
                    style={{
                      border: "2px dashed var(--border-default)",
                      background: "var(--bg-surface)",
                      minHeight: "140px",
                    }}
                    onClick={() =>
                      document.getElementById(`file-${field}`)?.click()
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "var(--accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "var(--border-default)")
                    }
                  >
                    {imagePreviews[field] ? (
                      <>
                        <img
                          src={imagePreviews[field]!}
                          alt=""
                          className="max-h-[100px] object-contain"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1"
                          style={{ color: "var(--error)" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageChange(field, null);
                          }}
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload
                          size={20}
                          style={{ color: "var(--text-muted)" }}
                        />
                        <span
                          className="text-[10px] mt-2"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          Click to upload
                        </span>
                      </>
                    )}
                    <input
                      id={`file-${field}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(field, e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flags */}
        <div style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-[11px] font-black tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Visibility
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { name: "is_active", label: "Active (visible on store)" },
              { name: "is_featured", label: "Featured product" },
              { name: "is_new", label: "New arrival badge" },
            ].map((flag) => (
              <label
                key={flag.name}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  className="w-5 h-5 flex items-center justify-center transition-colors duration-100"
                  style={{
                    border: `2px solid ${
                      (form as any)[flag.name]
                        ? "var(--accent)"
                        : "var(--border-strong)"
                    }`,
                    background: (form as any)[flag.name]
                      ? "var(--accent)"
                      : "transparent",
                  }}
                >
                  {(form as any)[flag.name] && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="#000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  name={flag.name}
                  checked={(form as any)[flag.name]}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {flag.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100 disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "#000",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.background = "#FFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
          >
            <Save size={14} />
            {submitting
              ? "Saving..."
              : isEditing
              ? "Update Product"
              : "Create Product"}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100"
            style={{
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--text-primary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
