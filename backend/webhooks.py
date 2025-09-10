import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import APIRouter, Request, Header, HTTPException
from svix.webhooks import Webhook, WebhookVerificationError
from crud import create_user

CLERK_WEBHOOK_SECRET = os.environ.get("CLERK_WEBHOOK_SECRET")

router = APIRouter()

@router.post("/clerk")
async def handle_clerk_webhook(
    request: Request, 
    id: str = Header(None),
    signature: str = Header(None),
    timestamp: str = Header(None)
):
    if not CLERK_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Clerk webhook secret not configured")

    payload_body = await request.body()

    try:
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        payload = wh.verify(payload_body, {
            "id": id,
            "signature": signature,
            "timestamp": timestamp
        })
    except WebhookVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from e
    
    event_type = payload["type"]

    if event_type == "user.created":
        clerk_user_id = payload["data"]["id"]
        email = payload["data"]["email_addresses"][0]["email_address"]
        new_user = create_user(clerk_user_id=clerk_user_id, email=email)
        if new_user:
            print(f"Successfully synced new user to database.")
        else:
            print(f"User already exists or there was an error.")
    
    return {"status": "success"}