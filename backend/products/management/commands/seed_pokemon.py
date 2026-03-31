import random
from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from products.models import Category, Product


# 1x1 red PNG placeholder (89 bytes)
PLACEHOLDER_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00"
    b"\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00"
    b"\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


SINGLE_CARDS = [
    {"name": "Charizard ex", "set_name": "Obsidian Flames", "rarity": "Ultra Rare", "card_number": "125/197", "price": "189.99", "condition": "near_mint", "language": "english"},
    {"name": "Pikachu VMAX", "set_name": "Vivid Voltage", "rarity": "Secret Rare", "card_number": "188/185", "price": "249.99", "condition": "near_mint", "language": "english", "is_featured": True},
    {"name": "Mewtwo ex", "set_name": "Scarlet & Violet 151", "rarity": "Special Art Rare", "card_number": "193/165", "price": "320.00", "condition": "near_mint", "language": "english", "is_featured": True},
    {"name": "Umbreon VMAX Alt Art", "set_name": "Evolving Skies", "rarity": "Alternate Art Secret Rare", "card_number": "215/203", "price": "499.99", "condition": "near_mint", "language": "english", "is_featured": True},
    {"name": "Lugia V Alt Art", "set_name": "Silver Tempest", "rarity": "Alternate Art", "card_number": "186/195", "price": "179.99", "condition": "excellent", "language": "english"},
    {"name": "Gengar VMAX", "set_name": "Fusion Strike", "rarity": "Ultra Rare", "card_number": "157/264", "price": "45.00", "condition": "near_mint", "language": "english"},
    {"name": "Rayquaza VMAX Alt Art", "set_name": "Evolving Skies", "rarity": "Alternate Art Secret Rare", "card_number": "218/203", "price": "389.99", "condition": "near_mint", "language": "english", "is_featured": True},
    {"name": "Mew VMAX", "set_name": "Fusion Strike", "rarity": "Secret Rare", "card_number": "269/264", "price": "59.99", "condition": "near_mint", "language": "english"},
    {"name": "Eevee Heroes Espeon V SA", "set_name": "Eevee Heroes", "rarity": "Special Art", "card_number": "081/069", "price": "299.99", "condition": "near_mint", "language": "japanese"},
    {"name": "Moonbreon - Umbreon V SA", "set_name": "Eevee Heroes", "rarity": "Special Art", "card_number": "085/069", "price": "450.00", "condition": "near_mint", "language": "japanese", "is_featured": True},
    {"name": "Giratina V Alt Art", "set_name": "Lost Origin", "rarity": "Alternate Art", "card_number": "186/196", "price": "89.99", "condition": "near_mint", "language": "english"},
    {"name": "Palkia VSTAR", "set_name": "Astral Radiance", "rarity": "Ultra Rare", "card_number": "040/189", "price": "29.99", "condition": "excellent", "language": "english"},
    {"name": "Arceus VSTAR", "set_name": "Brilliant Stars", "rarity": "Ultra Rare", "card_number": "123/172", "price": "35.00", "condition": "near_mint", "language": "english"},
    {"name": "Charizard V Alt Art", "set_name": "Brilliant Stars", "rarity": "Alternate Art", "card_number": "154/172", "price": "159.99", "condition": "light_played", "language": "english"},
    {"name": "Blaziken VMAX", "set_name": "Chilling Reign", "rarity": "Ultra Rare", "card_number": "021/198", "price": "22.99", "condition": "near_mint", "language": "english"},
    {"name": "Dragonite V Alt Art", "set_name": "Evolving Skies", "rarity": "Alternate Art", "card_number": "192/203", "price": "119.99", "condition": "near_mint", "language": "english"},
    {"name": "Sylveon VMAX Alt Art", "set_name": "Evolving Skies", "rarity": "Alternate Art Secret Rare", "card_number": "212/203", "price": "199.99", "condition": "near_mint", "language": "english"},
    {"name": "Mew ex SAR", "set_name": "Scarlet & Violet 151", "rarity": "Special Art Rare", "card_number": "205/165", "price": "89.99", "condition": "near_mint", "language": "japanese"},
]

SLABS = [
    {"name": "PSA 10 Charizard VSTAR Rainbow", "set_name": "Brilliant Stars", "rarity": "Secret Rare", "card_number": "174/172", "price": "899.99", "grade": "10.0", "grading_company": "PSA"},
    {"name": "PSA 9 Pikachu V Full Art", "set_name": "Vivid Voltage", "rarity": "Full Art", "card_number": "170/185", "price": "299.99", "grade": "9.0", "grading_company": "PSA"},
    {"name": "CGC 9.5 Umbreon VMAX Alt Art", "set_name": "Evolving Skies", "rarity": "Alternate Art Secret Rare", "card_number": "215/203", "price": "1499.99", "grade": "9.5", "grading_company": "CGC", "is_featured": True},
    {"name": "PSA 10 Lugia V Alt Art", "set_name": "Silver Tempest", "rarity": "Alternate Art", "card_number": "186/195", "price": "749.99", "grade": "10.0", "grading_company": "PSA"},
    {"name": "Beckett 9.5 Rayquaza VMAX Alt Art", "set_name": "Evolving Skies", "rarity": "Alternate Art Secret Rare", "card_number": "218/203", "price": "1299.99", "grade": "9.5", "grading_company": "Beckett", "is_featured": True},
    {"name": "PSA 10 Mewtwo ex SAR", "set_name": "Scarlet & Violet 151", "rarity": "Special Art Rare", "card_number": "193/165", "price": "1899.99", "grade": "10.0", "grading_company": "PSA"},
    {"name": "CGC 10 Charizard ex", "set_name": "Obsidian Flames", "rarity": "Ultra Rare", "card_number": "125/197", "price": "999.99", "grade": "10.0", "grading_company": "CGC"},
    {"name": "PSA 8 Blastoise ex", "set_name": "Paldea Evolved", "rarity": "Ultra Rare", "card_number": "186/193", "price": "249.99", "grade": "8.0", "grading_company": "PSA"},
    {"name": "PSA 10 Eevee Heroes Umbreon V SA", "set_name": "Eevee Heroes", "rarity": "Special Art", "card_number": "085/069", "price": "4999.99", "grade": "10.0", "grading_company": "PSA", "language": "japanese", "is_featured": True},
]

SEALED = [
    {"name": "Scarlet & Violet 151 Booster Bundle", "set_name": "Scarlet & Violet 151", "price": "149.99", "description": "6 booster packs from the Scarlet & Violet 151 set.", "stock_quantity": 15},
    {"name": "Obsidian Flames Booster Box", "set_name": "Obsidian Flames", "price": "549.99", "description": "36 booster packs per box. Factory sealed.", "stock_quantity": 8},
    {"name": "Evolving Skies Booster Box", "set_name": "Evolving Skies", "price": "799.99", "description": "36 booster packs. One of the most sought-after modern sets.", "stock_quantity": 3, "is_featured": True},
    {"name": "Crown Zenith Elite Trainer Box", "set_name": "Crown Zenith", "price": "199.99", "description": "10 booster packs, sleeves, dice, and more.", "stock_quantity": 12},
    {"name": "Paldea Evolved Build & Battle Stadium", "set_name": "Paldea Evolved", "price": "189.99", "description": "2 Build & Battle Boxes with 4 additional booster packs.", "stock_quantity": 10},
    {"name": "Paradox Rift Booster Box", "set_name": "Paradox Rift", "price": "499.99", "description": "36 booster packs per box. Factory sealed.", "stock_quantity": 6},
    {"name": "Temporal Forces Elite Trainer Box", "set_name": "Temporal Forces", "price": "179.99", "description": "10 booster packs, card sleeves, energy cards, and accessories.", "stock_quantity": 20},
    {"name": "Vstar Universe Booster Box (JP)", "set_name": "VSTAR Universe", "price": "359.99", "description": "10 packs of 10 cards. Japanese high-class set.", "stock_quantity": 5, "language": "japanese"},
]

PROTECTION_STORAGE = [
    {"name": "Ultra Pro Penny Sleeves (100ct)", "price": "9.99", "description": "Standard size penny sleeves for Pokemon cards. Crystal clear.", "stock_quantity": 100, "product_type": "protection"},
    {"name": "Ultra Pro Top Loaders (25ct)", "price": "19.99", "description": "3x4 rigid top loader holders for valuable cards.", "stock_quantity": 75, "product_type": "protection"},
    {"name": "Dragon Shield Matte Sleeves (100ct)", "price": "49.99", "description": "Premium matte art sleeves. Perfect fit for Pokemon cards.", "stock_quantity": 50, "product_type": "protection"},
    {"name": "BCW Card Storage Box (800ct)", "price": "24.99", "description": "Corrugated cardboard storage box. Holds up to 800 cards.", "stock_quantity": 30, "product_type": "storage"},
    {"name": "Ultra Pro 9-Pocket Binder", "price": "59.99", "description": "Premium PRO-Binder with 360-card capacity. Side-loading pockets.", "stock_quantity": 25, "product_type": "storage"},
    {"name": "KMC Perfect Fit Inner Sleeves (100ct)", "price": "14.99", "description": "Perfect fit inner sleeves for double sleeving.", "stock_quantity": 80, "product_type": "protection"},
    {"name": "Ultra Pro Card Display Stand", "price": "34.99", "description": "Acrylic display stand for graded slabs and toploaded cards.", "stock_quantity": 40, "product_type": "storage"},
]


class Command(BaseCommand):
    help = "Seed the database with Pokemon card products"

    def handle(self, *args, **options):
        self.stdout.write("Seeding categories...")

        categories_data = [
            {"name": "Single Cards", "slug": "single-cards", "description": "Individual Pokemon trading cards", "order": 1},
            {"name": "Graded Slabs", "slug": "graded-slabs", "description": "Professionally graded and encapsulated cards", "order": 2},
            {"name": "Sealed Products", "slug": "sealed-products", "description": "Factory sealed booster boxes, ETBs, and more", "order": 3},
            {"name": "Protection & Storage", "slug": "protection-storage", "description": "Card sleeves, top loaders, binders, and storage", "order": 4},
        ]

        cats = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults=cat_data,
            )
            cats[cat.slug] = cat
            action = "Created" if created else "Exists"
            self.stdout.write(f"  {action}: {cat.name}")

        self.stdout.write("\nSeeding products...")
        created_count = 0

        # Singles
        for data in SINGLE_CARDS:
            created_count += self._create_product(
                data, cats["single-cards"], product_type="single_card",
            )

        # Slabs
        for data in SLABS:
            created_count += self._create_product(
                data, cats["graded-slabs"], product_type="slab",
            )

        # Sealed
        for data in SEALED:
            created_count += self._create_product(
                data, cats["sealed-products"], product_type="sealed",
            )

        # Protection & Storage
        for data in PROTECTION_STORAGE:
            pt = data.pop("product_type", "protection")
            created_count += self._create_product(
                data, cats["protection-storage"], product_type=pt,
            )

        self.stdout.write(self.style.SUCCESS(f"\nDone! Created {created_count} products."))

    def _create_product(self, data, category, product_type):
        name = data["name"]
        slug = slugify(name)

        if Product.objects.filter(slug=slug).exists():
            self.stdout.write(f"  Exists: {name}")
            return 0

        product = Product(
            name=name,
            slug=slug,
            description=data.get("description", f"High-quality {name} Pokemon card."),
            price=Decimal(data["price"]),
            product_type=product_type,
            condition=data.get("condition"),
            grade=Decimal(data["grade"]) if data.get("grade") else None,
            grading_company=data.get("grading_company"),
            set_name=data.get("set_name", ""),
            rarity=data.get("rarity", ""),
            card_number=data.get("card_number"),
            language=data.get("language", "english"),
            is_active=True,
            is_featured=data.get("is_featured", False),
            is_new=random.choice([True, False]),
            in_stock=True,
            stock_quantity=data.get("stock_quantity", 1),
            category=category,
        )

        # Save placeholder image
        product.image.save(
            f"{slug}.png",
            ContentFile(PLACEHOLDER_PNG),
            save=False,
        )
        product.save()

        self.stdout.write(f"  Created: {name} - {data['price']} PLN")
        return 1
