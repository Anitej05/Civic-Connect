import base64
import uuid
from fastapi import UploadFile
import os
import aiofiles

# Define the static directory path relative to the backend folder
STATIC_DIR = "backend/static/images"

# Ensure the directory exists
os.makedirs(STATIC_DIR, exist_ok=True)

def encode_image_to_base64(image_path: str) -> str:
    """Encodes an image file to a base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

async def save_upload_file(upload_file: UploadFile) -> tuple[str, str]:
    """
    Saves an uploaded file to the static directory.
    Returns a tuple of (full_file_path, url_path).
    """
    # Generate a unique filename to prevent overwrites
    extension = os.path.splitext(upload_file.filename)[1]
    filename = f"{uuid.uuid4()}{extension}"
    full_file_path = os.path.join(STATIC_DIR, filename)

    # Asynchronously write the file
    try:
        async with aiofiles.open(full_file_path, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)
    except Exception as e:
        # Handle potential exceptions during file write
        return None, None

    # Return the full path for local access and the URL path for API responses
    url_path = f"/static/images/{filename}"
    return full_file_path, url_path
