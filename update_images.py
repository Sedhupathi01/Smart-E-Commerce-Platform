from core.models import Product

products_urls = {
    "Aura Pro Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
    "Smart Workspace Lamp": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1000&auto=format&fit=crop",
    "cat": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop"
}

for name, url in products_urls.items():
    Product.objects.filter(name=name).update(image=url)

# Add another product if needed
