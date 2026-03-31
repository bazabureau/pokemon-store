import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from coupons.models import Coupon
from products.models import Category, Product
from reviews.models import Review

User = get_user_model()


# ---------------------------------------------------------------------------
# Product definitions
# ---------------------------------------------------------------------------

PRODUCTS = [
    # ── Single Cards ──────────────────────────────────────────────────────
    {
        "name": "Arceus VSTAR",
        "image": "products/arceus-vstar.png",
        "price": 49.99,
        "compare_price": 64.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Brilliant Stars",
        "rarity": "Ultra Rare",
        "language": "english",
        "description": "Arceus VSTAR z setu Brilliant Stars. Karta w stanie Near Mint, idealna do kolekcji lub gry turniejowej.",
    },
    {
        "name": "Blaziken VMAX",
        "image": "products/blaziken-vmax.png",
        "price": 34.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Chilling Reign",
        "rarity": "Ultra Rare",
        "language": "english",
        "description": "Blaziken VMAX z setu Chilling Reign. Karta w stanie Near Mint z efektowną ilustracją.",
    },
    {
        "name": "Charizard EX",
        "image": "products/charizard-ex.png",
        "price": 89.99,
        "compare_price": 109.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Obsidian Flames",
        "rarity": "Double Rare",
        "language": "english",
        "description": "Charizard EX z setu Obsidian Flames. Jedna z najbardziej poszukiwanych kart w formacie Standard.",
    },
    {
        "name": "Charizard V Alt Art",
        "image": "products/charizard-v-alt-art.png",
        "price": 299.99,
        "compare_price": 349.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Brilliant Stars",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Charizard V Alternate Art z Brilliant Stars. Jeden z najpiękniejszych alt-artów w historii Pokemon TCG.",
    },
    {
        "name": "Dragonite V Alt Art",
        "image": "products/dragonite-v-alt-art.png",
        "price": 179.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Evolving Skies",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Dragonite V Alternate Art z Evolving Skies. Karta z przepiękną ilustracją Dragonite lecącego nad miastem.",
    },
    {
        "name": "Eevee Heroes Espeon V SA",
        "image": "products/eevee-heroes-espeon-v-sa.png",
        "price": 219.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Eevee Heroes",
        "rarity": "Special Art",
        "language": "japanese",
        "description": "Espeon V Special Art z japońskiego setu Eevee Heroes. Rzadka karta w japońskiej wersji językowej.",
    },
    {
        "name": "Gengar VMAX",
        "image": "products/gengar-vmax.png",
        "price": 39.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Fusion Strike",
        "rarity": "Ultra Rare",
        "language": "english",
        "description": "Gengar VMAX z setu Fusion Strike. Karta z klimatyczną ilustracją w stanie Near Mint.",
    },
    {
        "name": "Giratina V Alt Art",
        "image": "products/giratina-v-alt-art.png",
        "price": 259.99,
        "compare_price": 299.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Lost Origin",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Giratina V Alternate Art z Lost Origin. Jedna z najdroższych i najbardziej pożądanych kart z ery Sword & Shield.",
    },
    {
        "name": "Lugia V Alt Art",
        "image": "products/lugia-v-alt-art.png",
        "price": 199.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Silver Tempest",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Lugia V Alternate Art z Silver Tempest. Majestatyczna ilustracja Lugii nad oceanem.",
    },
    {
        "name": "Mew EX SAR",
        "image": "products/mew-ex-sar.png",
        "price": 149.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Scarlet & Violet 151",
        "rarity": "Special Art Rare",
        "language": "english",
        "description": "Mew EX Special Art Rare z setu 151. Karta z wyjątkową ilustracją nawiązującą do pierwszej generacji.",
    },
    {
        "name": "Mew VMAX",
        "image": "products/mew-vmax.png",
        "price": 44.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Fusion Strike",
        "rarity": "Ultra Rare",
        "language": "english",
        "description": "Mew VMAX z setu Fusion Strike. Popularna karta turniejowa w pięknym stanie.",
    },
    {
        "name": "Mewtwo EX",
        "image": "products/mewtwo-ex.png",
        "price": 59.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Scarlet & Violet 151",
        "rarity": "Double Rare",
        "language": "english",
        "description": "Mewtwo EX z setu 151. Klasyczny Pokemon w nowoczesnej odsłonie.",
    },
    {
        "name": "Moonbreon - Umbreon V SA",
        "image": "products/moonbreon-umbreon-v-sa.png",
        "price": 549.99,
        "compare_price": 649.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Eevee Heroes",
        "rarity": "Special Art",
        "language": "japanese",
        "description": "Słynny 'Moonbreon' - Umbreon V Special Art z Eevee Heroes. Jedna z najbardziej ikonicznych kart Pokemon TCG.",
    },
    {
        "name": "Palkia VSTAR",
        "image": "products/palkia-vstar.png",
        "price": 29.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Astral Radiance",
        "rarity": "Ultra Rare",
        "language": "english",
        "description": "Palkia VSTAR z setu Astral Radiance. Silna karta turniejowa w doskonałym stanie.",
    },
    {
        "name": "Pikachu VMAX",
        "image": "products/pikachu-vmax.png",
        "price": 69.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Vivid Voltage",
        "rarity": "Ultra Rare",
        "language": "english",
        "description": "Pikachu VMAX z Vivid Voltage. Tłusty Pikachu, kultowa karta kolekcjonerska.",
    },
    {
        "name": "Rayquaza VMAX Alt Art",
        "image": "products/rayquaza-vmax-alt-art.png",
        "price": 349.99,
        "compare_price": 399.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Evolving Skies",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Rayquaza VMAX Alternate Art z Evolving Skies. Uznawana za jedną z najpiękniejszych kart w historii TCG.",
    },
    {
        "name": "Sylveon VMAX Alt Art",
        "image": "products/sylveon-vmax-alt-art.png",
        "price": 189.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Evolving Skies",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Sylveon VMAX Alternate Art z Evolving Skies. Urocza ilustracja z Sylveonem wśród kwiatów.",
    },
    {
        "name": "Umbreon VMAX Alt Art",
        "image": "products/umbreon-vmax-alt-art.png",
        "price": 499.99,
        "compare_price": 599.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Evolving Skies",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Umbreon VMAX Alternate Art z Evolving Skies. Grail card - jedna z najcenniejszych kart współczesnego Pokemon TCG.",
    },
    {
        "name": "Elektryczny Tygrys",
        "image": "products/electric_tiger.png",
        "price": 159.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Custom Series",
        "rarity": "Ultra Rare",
        "language": "english",
        "description": "Unikalna karta Elektrycznego Tygrysa z limitowanej serii Custom. Rzadka karta kolekcjonerska z niepowtarzalną ilustracją.",
    },
    {
        "name": "Wodny Smok",
        "image": "products/water_dragon.png",
        "price": 169.99,
        "product_type": "single_card",
        "condition": "near_mint",
        "set_name": "Custom Series",
        "rarity": "Ultra Rare",
        "language": "english",
        "description": "Unikalna karta Wodnego Smoka z limitowanej serii Custom. Efektowna ilustracja wodnego smoka w akcji.",
    },
    # ── Slabs ─────────────────────────────────────────────────────────────
    {
        "name": "PSA 10 Charizard VSTAR Rainbow",
        "image": "products/psa-10-charizard-vstar-rainbow.png",
        "price": 399.99,
        "compare_price": 449.99,
        "product_type": "slab",
        "grade": 10.0,
        "grading_company": "PSA",
        "set_name": "Brilliant Stars",
        "rarity": "Secret Rare",
        "language": "english",
        "description": "Charizard VSTAR Rainbow z oceną PSA 10 Gem Mint. Najwyższa nota gradingowa - idealna karta kolekcjonerska.",
    },
    {
        "name": "PSA 10 Eevee Heroes Umbreon V SA",
        "image": "products/psa-10-eevee-heroes-umbreon-v-sa.png",
        "price": 1299.99,
        "product_type": "slab",
        "grade": 10.0,
        "grading_company": "PSA",
        "set_name": "Eevee Heroes",
        "rarity": "Special Art",
        "language": "japanese",
        "description": "Umbreon V Special Art z oceną PSA 10. Japońska wersja Moonbreona w perfekcyjnym stanie z najwyższą notą.",
    },
    {
        "name": "PSA 10 Lugia V Alt Art",
        "image": "products/psa-10-lugia-v-alt-art.png",
        "price": 599.99,
        "product_type": "slab",
        "grade": 10.0,
        "grading_company": "PSA",
        "set_name": "Silver Tempest",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Lugia V Alt Art z oceną PSA 10. Jedna z najpiękniejszych kart Sword & Shield w najwyższej ocenie.",
    },
    {
        "name": "PSA 10 Mewtwo EX SAR",
        "image": "products/psa-10-mewtwo-ex-sar.png",
        "price": 349.99,
        "product_type": "slab",
        "grade": 10.0,
        "grading_company": "PSA",
        "set_name": "Scarlet & Violet 151",
        "rarity": "Special Art Rare",
        "language": "english",
        "description": "Mewtwo EX SAR z oceną PSA 10. Perfekcyjna kopia z setu 151 w najwyższym stanie gradingowym.",
    },
    {
        "name": "PSA 8 Blastoise EX",
        "image": "products/psa-8-blastoise-ex.png",
        "price": 129.99,
        "product_type": "slab",
        "grade": 8.0,
        "grading_company": "PSA",
        "set_name": "Base Set",
        "rarity": "Holo Rare",
        "language": "english",
        "description": "Blastoise EX z oceną PSA 8. Klasyczna karta z Base Setu w solidnym stanie gradingowym.",
    },
    {
        "name": "PSA 9 Pikachu V Full Art",
        "image": "products/psa-9-pikachu-v-full-art.png",
        "price": 179.99,
        "product_type": "slab",
        "grade": 9.0,
        "grading_company": "PSA",
        "set_name": "Vivid Voltage",
        "rarity": "Full Art",
        "language": "english",
        "description": "Pikachu V Full Art z oceną PSA 9 Mint. Pikachu w pełnej ilustracji z wysoką oceną gradingową.",
    },
    {
        "name": "Beckett 9.5 Rayquaza VMAX Alt Art",
        "image": "products/beckett-95-rayquaza-vmax-alt-art.png",
        "price": 899.99,
        "product_type": "slab",
        "grade": 9.5,
        "grading_company": "Beckett",
        "set_name": "Evolving Skies",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Rayquaza VMAX Alt Art z oceną Beckett 9.5 Gem Mint. Jedna z najcenniejszych kart Evolving Skies w grading Beckett.",
    },
    {
        "name": "CGC 10 Charizard EX",
        "image": "products/cgc-10-charizard-ex.png",
        "price": 499.99,
        "product_type": "slab",
        "grade": 10.0,
        "grading_company": "CGC",
        "set_name": "Obsidian Flames",
        "rarity": "Double Rare",
        "language": "english",
        "description": "Charizard EX z oceną CGC 10 Pristine. Najwyższa nota CGC - niezwykle rzadka perfekcyjna kopia.",
    },
    {
        "name": "CGC 9.5 Umbreon VMAX Alt Art",
        "image": "products/cgc-95-umbreon-vmax-alt-art.png",
        "price": 1099.99,
        "product_type": "slab",
        "grade": 9.5,
        "grading_company": "CGC",
        "set_name": "Evolving Skies",
        "rarity": "Alt Art",
        "language": "english",
        "description": "Umbreon VMAX Alt Art z oceną CGC 9.5 Gem Mint. Ikona Pokemon TCG w gradingu CGC z niemal perfekcyjną notą.",
    },
    # ── Sealed Products ───────────────────────────────────────────────────
    {
        "name": "Evolving Skies Booster Box",
        "image": "products/evolving-skies-booster-box.png",
        "price": 699.99,
        "compare_price": 799.99,
        "product_type": "sealed",
        "set_name": "Evolving Skies",
        "language": "english",
        "description": "Zapieczętowany Booster Box Evolving Skies - 36 boosterów. Jeden z najlepszych setów Sword & Shield z alt-artami Eeveelucji.",
    },
    {
        "name": "Obsidian Flames Booster Box",
        "image": "products/obsidian-flames-booster-box.png",
        "price": 549.99,
        "product_type": "sealed",
        "set_name": "Obsidian Flames",
        "language": "english",
        "description": "Zapieczętowany Booster Box Obsidian Flames - 36 boosterów. Set z Charizardem EX i wieloma cennymi kartami.",
    },
    {
        "name": "Paradox Rift Booster Box",
        "image": "products/paradox-rift-booster-box.png",
        "price": 529.99,
        "product_type": "sealed",
        "set_name": "Paradox Rift",
        "language": "english",
        "description": "Zapieczętowany Booster Box Paradox Rift - 36 boosterów. Set z kartami Paradox Pokemon i ilustracjami przyszłości.",
    },
    {
        "name": "Scarlet & Violet 151 Booster Bundle",
        "image": "products/scarlet-violet-151-booster-bundle.png",
        "price": 199.99,
        "product_type": "sealed",
        "set_name": "Scarlet & Violet 151",
        "language": "english",
        "description": "Booster Bundle setu 151 - 6 boosterów. Nostalgiczny set z pierwszą generacją Pokemon.",
    },
    {
        "name": "Crown Zenith Elite Trainer Box",
        "image": "products/crown-zenith-elite-trainer-box.png",
        "price": 299.99,
        "product_type": "sealed",
        "set_name": "Crown Zenith",
        "language": "english",
        "description": "Elite Trainer Box Crown Zenith z 10 boosterami, kościami, ochraniaczami i innymi akcesoriami. Ostatni set Sword & Shield.",
    },
    {
        "name": "Temporal Forces Elite Trainer Box",
        "image": "products/temporal-forces-elite-trainer-box.png",
        "price": 249.99,
        "product_type": "sealed",
        "set_name": "Temporal Forces",
        "language": "english",
        "description": "Elite Trainer Box Temporal Forces z 10 boosterami i zestawem akcesoriów. Set z ACE SPEC kartami.",
    },
    {
        "name": "Paldea Evolved Build & Battle Stadium",
        "image": "products/paldea-evolved-build-battle-stadium.png",
        "price": 179.99,
        "product_type": "sealed",
        "set_name": "Paldea Evolved",
        "language": "english",
        "description": "Build & Battle Stadium Paldea Evolved dla dwóch graczy. Zawiera pre-release promo karty i boostery.",
    },
    {
        "name": "VSTAR Universe Booster Box (JP)",
        "image": "products/vstar-universe-booster-box-jp.png",
        "price": 449.99,
        "product_type": "sealed",
        "set_name": "VSTAR Universe",
        "language": "japanese",
        "description": "Japoński Booster Box VSTAR Universe - 10 boosterów po 10 kart. Odpowiednik Crown Zenith z przepięknymi SAR kartami.",
    },
    # ── Protection ────────────────────────────────────────────────────────
    {
        "name": "Dragon Shield Matte Sleeves 100 szt.",
        "image": "products/dragon-shield-matte-sleeves-100ct.png",
        "price": 49.99,
        "product_type": "protection",
        "description": "Koszulki Dragon Shield Matte 100 sztuk. Najwyższa jakość ochrony kart - wybór profesjonalnych graczy.",
    },
    {
        "name": "KMC Perfect Fit Inner Sleeves 100 szt.",
        "image": "products/kmc-perfect-fit-inner-sleeves-100ct.png",
        "price": 19.99,
        "product_type": "protection",
        "description": "Wewnętrzne koszulki KMC Perfect Fit 100 sztuk. Idealne do double-sleevingu z zewnętrznymi koszulkami.",
    },
    {
        "name": "Ultra Pro Penny Sleeves 100 szt.",
        "image": "products/ultra-pro-penny-sleeves-100ct.png",
        "price": 9.99,
        "product_type": "protection",
        "description": "Ekonomiczne koszulki Ultra Pro Penny Sleeves 100 sztuk. Podstawowa ochrona kart w świetnej cenie.",
    },
    {
        "name": "Ultra Pro Top Loaders 25 szt.",
        "image": "products/ultra-pro-top-loaders-25ct.png",
        "price": 14.99,
        "product_type": "protection",
        "description": "Top Loadery Ultra Pro 25 sztuk. Sztywna ochrona cennych kart - standard w wysyłce i przechowywaniu.",
    },
    # ── Storage ───────────────────────────────────────────────────────────
    {
        "name": "BCW Card Storage Box 800 kart",
        "image": "products/bcw-card-storage-box-800ct.png",
        "price": 24.99,
        "product_type": "storage",
        "description": "Pudełko do przechowywania BCW na 800 kart. Solidne kartonowe pudełko z pokrywką do organizacji kolekcji.",
    },
    {
        "name": "Ultra Pro 9-Pocket Binder",
        "image": "products/ultra-pro-9-pocket-binder.png",
        "price": 79.99,
        "product_type": "storage",
        "description": "Album Ultra Pro z 9 kieszonkami na stronę. Premium binder do prezentacji i ochrony kolekcji kart Pokemon.",
    },
    {
        "name": "Ultra Pro Card Display Stand",
        "image": "products/ultra-pro-card-display-stand.png",
        "price": 34.99,
        "product_type": "storage",
        "description": "Stojak ekspozycyjny Ultra Pro na karty. Elegancki sposób na wystawienie najcenniejszych kart z kolekcji.",
    },
]

# Featured products (5 best items)
FEATURED_SLUGS = {
    "umbreon-vmax-alt-art",
    "moonbreon-umbreon-v-sa",
    "rayquaza-vmax-alt-art",
    "charizard-v-alt-art",
    "psa-10-eevee-heroes-umbreon-v-sa",
}

# New products (10 items)
NEW_SLUGS = {
    "mew-ex-sar",
    "mewtwo-ex",
    "charizard-ex",
    "scarlet-violet-151-booster-bundle",
    "temporal-forces-elite-trainer-box",
    "paldea-evolved-build-battle-stadium",
    "paradox-rift-booster-box",
    "cgc-10-charizard-ex",
    "elektryczny-tygrys",
    "wodny-smok",
}

CATEGORY_MAP = {
    "single_card": "karty-pojedyncze",
    "slab": "slaby",
    "sealed": "produkty-zapakowane",
    "protection": "ochrona-i-przechowywanie",
    "storage": "ochrona-i-przechowywanie",
}


class Command(BaseCommand):
    help = "Seed the database with Pokemon TCG products, categories, users, coupons, and reviews."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Clearing existing data..."))
            Review.objects.all().delete()
            Coupon.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            # Keep existing superusers but remove seeded admin if re-seeding
            User.objects.filter(username="admin").delete()
            User.objects.filter(username="test").delete()
            self.stdout.write(self.style.SUCCESS("Existing data cleared."))

        # ── Categories ────────────────────────────────────────────────────
        categories_data = [
            {"name": "Karty Pojedyncze", "slug": "karty-pojedyncze", "order": 1, "description": "Pojedyncze karty Pokemon TCG - od tanich po najrzadsze."},
            {"name": "Slaby", "slug": "slaby", "order": 2, "description": "Profesjonalnie ocenione karty w slabach PSA, CGC i Beckett."},
            {"name": "Produkty Zapakowane", "slug": "produkty-zapakowane", "order": 3, "description": "Zapieczętowane booster boxy, ETB, bundli i inne produkty."},
            {"name": "Ochrona i Przechowywanie", "slug": "ochrona-i-przechowywanie", "order": 4, "description": "Koszulki, top loadery, albumy i pudełka do ochrony kart."},
        ]
        categories = {}
        for cd in categories_data:
            cat, _ = Category.objects.get_or_create(slug=cd["slug"], defaults=cd)
            categories[cd["slug"]] = cat

        self.stdout.write(self.style.SUCCESS(f"Categories: {len(categories)} created/verified"))

        # ── Products ──────────────────────────────────────────────────────
        created_count = 0
        for pdata in PRODUCTS:
            from django.utils.text import slugify
            slug = slugify(pdata["name"])

            if Product.objects.filter(slug=slug).exists():
                continue

            cat_slug = CATEGORY_MAP.get(pdata["product_type"], "karty-pojedyncze")
            category = categories.get(cat_slug)

            product = Product(
                name=pdata["name"],
                slug=slug,
                description=pdata.get("description", ""),
                price=pdata["price"],
                compare_price=pdata.get("compare_price"),
                product_type=pdata["product_type"],
                condition=pdata.get("condition", None) if pdata.get("condition") else None,
                grade=pdata.get("grade"),
                grading_company=pdata.get("grading_company"),
                set_name=pdata.get("set_name", ""),
                rarity=pdata.get("rarity", ""),
                language=pdata.get("language", "english"),
                is_active=True,
                is_featured=slug in FEATURED_SLUGS,
                is_new=slug in NEW_SLUGS,
                in_stock=True,
                stock_quantity=random.randint(1, 5) if pdata["product_type"] in ("single_card", "slab") else random.randint(5, 30),
                category=category,
                image=pdata["image"],
            )
            product.save()
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Products: {created_count} created"))

        # ── Users ─────────────────────────────────────────────────────────
        admin_user, admin_created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@pokemon-tcg.pl",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if admin_created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Admin user created (admin / admin123)"))
        else:
            self.stdout.write("Admin user already exists, skipped.")

        test_user, test_created = User.objects.get_or_create(
            username="test",
            defaults={
                "email": "test@pokemon-tcg.pl",
                "is_staff": False,
                "is_superuser": False,
            },
        )
        if test_created:
            test_user.set_password("test1234")
            test_user.save()
            self.stdout.write(self.style.SUCCESS("Test user created (test / test1234)"))
        else:
            self.stdout.write("Test user already exists, skipped.")

        # ── Coupons ───────────────────────────────────────────────────────
        coupons_data = [
            {
                "code": "WELCOME10",
                "discount_type": "percentage",
                "discount_value": 10,
                "minimum_order_amount": None,
                "max_uses": 1000,
                "is_active": True,
            },
            {
                "code": "POKEMON20",
                "discount_type": "fixed",
                "discount_value": 20,
                "minimum_order_amount": 100,
                "max_uses": 500,
                "is_active": True,
            },
            {
                "code": "KOLEKCJONER",
                "discount_type": "percentage",
                "discount_value": 15,
                "minimum_order_amount": 200,
                "max_uses": 200,
                "is_active": True,
            },
        ]
        coupon_count = 0
        for cdata in coupons_data:
            _, created = Coupon.objects.get_or_create(code=cdata["code"], defaults=cdata)
            if created:
                coupon_count += 1
        self.stdout.write(self.style.SUCCESS(f"Coupons: {coupon_count} created"))

        # ── Reviews ───────────────────────────────────────────────────────
        review_data = [
            {
                "rating": 5,
                "title": "Idealna karta!",
                "comment": "Karta w perfekcyjnym stanie, dokładnie jak na zdjęciu. Szybka wysyłka i solidne opakowanie. Polecam!",
            },
            {
                "rating": 5,
                "title": "Swietny zakup",
                "comment": "Jestem bardzo zadowolony z zakupu. Karta wygląda pięknie w kolekcji. Na pewno wrócę po więcej.",
            },
            {
                "rating": 4,
                "title": "Bardzo dobra jakość",
                "comment": "Produkt zgodny z opisem, wysyłka sprawna. Jedyny minus to trochę długi czas oczekiwania, ale karta jest świetna.",
            },
            {
                "rating": 5,
                "title": "Top sklep Pokemon!",
                "comment": "Najlepszy sklep z kartami Pokemon w Polsce! Ceny konkurencyjne, obsługa miła i pomocna. 10/10",
            },
            {
                "rating": 4,
                "title": "Dobra cena za jakość",
                "comment": "Karta w stanie Near Mint, jak obiecano. Cenowo uczciwie w porównaniu z innymi sklepami. Polecam serdecznie.",
            },
        ]

        products_for_reviews = list(Product.objects.order_by("?")[:5])
        review_count = 0
        for i, product in enumerate(products_for_reviews):
            if i >= len(review_data):
                break
            rd = review_data[i]
            _, created = Review.objects.get_or_create(
                product=product,
                user=test_user,
                defaults={
                    "rating": rd["rating"],
                    "title": rd["title"],
                    "comment": rd["comment"],
                    "status": "approved",
                },
            )
            if created:
                review_count += 1

        self.stdout.write(self.style.SUCCESS(f"Reviews: {review_count} created"))

        # ── Summary ───────────────────────────────────────────────────────
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("  SEED COMPLETE"))
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(f"  Categories:  {Category.objects.count()}")
        self.stdout.write(f"  Products:    {Product.objects.count()}")
        self.stdout.write(f"    Featured:  {Product.objects.filter(is_featured=True).count()}")
        self.stdout.write(f"    New:       {Product.objects.filter(is_new=True).count()}")
        self.stdout.write(f"    Singles:   {Product.objects.filter(product_type='single_card').count()}")
        self.stdout.write(f"    Slabs:     {Product.objects.filter(product_type='slab').count()}")
        self.stdout.write(f"    Sealed:    {Product.objects.filter(product_type='sealed').count()}")
        self.stdout.write(f"    Protect.:  {Product.objects.filter(product_type='protection').count()}")
        self.stdout.write(f"    Storage:   {Product.objects.filter(product_type='storage').count()}")
        self.stdout.write(f"  Users:       {User.objects.count()}")
        self.stdout.write(f"  Coupons:     {Coupon.objects.count()}")
        self.stdout.write(f"  Reviews:     {Review.objects.count()}")
        self.stdout.write(self.style.SUCCESS("=" * 50))
