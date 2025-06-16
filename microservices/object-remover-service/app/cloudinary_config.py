"""
Cloudinary configuration for the object removal servicce.
"""

import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "drzokg7bb"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "683266267847728"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)