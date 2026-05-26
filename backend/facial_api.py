from fastapi import FastAPI, File, UploadFile
from facial_recognition_model import checkSimiliarity, load_image, getTransform
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now (dev only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"Welcome to Joshua Facial Recognition API"}

@app.post("/validate")
async def validate_faces(image2: UploadFile = File(...)):
    print("Received image for validation:", image2.filename)
    img_bytes = await image2.read()
    img2 = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img2 = getTransform()(img2)
    img2 = img2.unsqueeze(0)
    similarity = checkSimiliarity(img2)

    print("Similarity score:", similarity)

    if similarity > 0.5:
        print("Same person")
    else:
        print("Different people")

    return {
        "valid": similarity > 0.5,
        "confidence": similarity,
        "message": "This person is Joshua" if similarity > 0.5 else "This person is not Joshua"
    }
    