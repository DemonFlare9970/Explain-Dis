# Explain Dis

A full-stack web application that provides simplified explanations for PDFs, YouTube videos, and text content using AI.

## Features

- **PDF Upload**: Extract text from PDF files and get AI-powered explanations
- **YouTube Integration**: Extract transcripts from YouTube videos and explain them
- **Text Explanation**: Enter any text and get it explained at different complexity levels
- **Multiple Complexity Levels**: 
  - Child (12-year-old level)
  - Student (High school/College level)
  - Expert (Advanced level)

## Tech Stack

### Backend
- **Python 3.8+**
- **FastAPI** - Modern, fast web framework
- **pdfplumber** - PDF text extraction
- **youtube-transcript-api** - YouTube transcript extraction
- **OpenAI GPT-4** - AI explanations

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Dropzone** - File upload interface
- **Axios** - HTTP client

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

6. Run the backend server:
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### POST /upload-pdf
Upload a PDF file and get an explanation.

**Parameters:**
- `file`: PDF file (multipart/form-data)
- `complexity_level`: string ("child", "student", "expert")

### POST /youtube-link
Process a YouTube video URL and explain its transcript.

**Body:**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "complexity_level": "student"
}
```

### POST /explain-text
Explain provided text content.

**Body:**
```json
{
  "text": "Your text content here",
  "complexity_level": "student"
}
```

## Usage

1. **Choose Input Method**: Select between PDF upload, YouTube link, or text input
2. **Set Complexity Level**: Choose the appropriate explanation level
3. **Submit Content**: Upload your file, paste URL, or enter text
4. **Get Explanation**: Receive an AI-generated explanation tailored to your chosen complexity level
5. **Copy or Clear**: Copy the explanation or clear results to try again

## Development

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
python -m pytest

# Frontend tests (if implemented)
cd frontend
npm test
```

### Building for Production

#### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## Deployment

### Recommended Services
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Heroku, Fly.io
- **Environment Variables**: Set `OPENAI_API_KEY` in your deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support or questions, please open an issue in the repository.
