import asyncio
from database import supabase

async def listen_to_messages():
    print("🔄 Realtime chat listener started...")
    # Yahan Supabase realtime subscription ka logic aayega
    # Jo naye messages ko database se frontend par live push karega

if __name__ == "__main__":
    asyncio.run(listen_to_messages())
