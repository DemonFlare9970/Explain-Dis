from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import pdfplumber
from youtube_transcript_api import YouTubeTranscriptApi
import re
import os
import io
import logging
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
log_level = os.getenv("LOG_LEVEL", "INFO")
logging.basicConfig(level=getattr(logging, log_level))
logger = logging.getLogger(__name__)

# Get configuration from environment
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1500"))
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "10000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

app = FastAPI(
    title="Explain This API", 
    version="1.0.0",
    debug=DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

class TextExplanationRequest(BaseModel):
    text: str
    complexity_level: str = "student"

class YouTubeRequest(BaseModel):
    youtube_url: str
    complexity_level: str = "student"

def get_complexity_prompt(level: str) -> str:
    """Get the appropriate prompt based on complexity level"""
    prompts = {
        "child": "Explain this in very simple terms that a 12-year-old would understand. Use examples and avoid complex words:",
        "student": "Explain this clearly for a high school or college student. Use examples when helpful:",
        "expert": "Provide a comprehensive explanation suitable for someone with advanced knowledge in this field:"
    }
    return prompts.get(level, prompts["student"])

def explain_with_gpt(content: str, complexity_level: str) -> str:
    """Use GPT to explain the content at the specified complexity level"""
    try:
        prompt = get_complexity_prompt(complexity_level)
        
        logger.info(f"Generating explanation with {OPENAI_MODEL} for complexity level: {complexity_level}")
        
        response = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful teacher who explains complex topics clearly."},
                {"role": "user", "content": f"{prompt}\n\n{content}"}
            ],
            max_tokens=OPENAI_MAX_TOKENS,
            temperature=OPENAI_TEMPERATURE
        )
        
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error generating explanation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating explanation: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Explain This API - Upload PDFs, paste YouTube links, or submit text for explanations!"}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), complexity_level: str = "student"):
    """Extract text from PDF and explain it"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Check file size
    file_size_mb = len(await file.read()) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_FILE_SIZE_MB}MB limit")
    
    # Reset file pointer
    await file.seek(0)
    
    try:
        # Read PDF content
        content = await file.read()
        
        logger.info(f"Processing PDF: {file.filename}")
        
        # Extract text using pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        # Limit text length for API
        if len(text) > MAX_TEXT_LENGTH:
            text = text[:MAX_TEXT_LENGTH] + "..."
        
        explanation = explain_with_gpt(text, complexity_level)
        
        return {
            "original_text": text,
            "explanation": explanation,
            "complexity_level": complexity_level
        }
    
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/youtube-link")
async def process_youtube(request: YouTubeRequest):
    """Extract transcript from YouTube video and explain it"""
    try:
        # Extract video ID from URL
        video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', request.youtube_url)
        if not video_id_match:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        video_id = video_id_match.group(1)
        logger.info(f"Processing YouTube video: {video_id}")
        
        # Get transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Combine transcript text
        full_text = " ".join([entry['text'] for entry in transcript])
        
        if not full_text.strip():
            raise HTTPException(status_code=400, detail="No transcript found for this video")
        
        # Limit text length for API
        if len(full_text) > MAX_TEXT_LENGTH:
            full_text = full_text[:MAX_TEXT_LENGTH] + "..."
        
        explanation = explain_with_gpt(full_text, request.complexity_level)
        
        return {
            "original_transcript": full_text,
            "explanation": explanation,
            "complexity_level": request.complexity_level
        }
    
    except Exception as e:
        logger.error(f"Error processing YouTube video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing YouTube video: {str(e)}")

@app.post("/explain-text")
async def explain_text(request: TextExplanationRequest):
    """Explain provided text"""
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Limit text length
        text = request.text
        if len(text) > MAX_TEXT_LENGTH:
            text = text[:MAX_TEXT_LENGTH] + "..."
        
        logger.info(f"Processing text explanation for complexity level: {request.complexity_level}")
        
        explanation = explain_with_gpt(text, request.complexity_level)
        
        return {
            "original_text": text,
            "explanation": explanation,
            "complexity_level": request.complexity_level
        }
    
    except Exception as e:
        logger.error(f"Error explaining text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error explaining text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=HOST, port=PORT, reload=DEBUG)
