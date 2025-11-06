# main.py
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
import os
import requests
from openai import OpenAI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# ----------------- ENV SETUP -----------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY environment variable")

SEARXNG_URL = os.getenv("SEARXNG_URL", "http://localhost:8080/search")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Category → Image mapping
CATEGORY_IMAGES = {
    "news": "https://via.placeholder.com/100x100?text=News",
    "science": "https://via.placeholder.com/100x100?text=Research",
    "technology": "https://via.placeholder.com/100x100?text=Tech",
    "images": "https://via.placeholder.com/100x100?text=Image",
    "general": "https://via.placeholder.com/100x100?text=General",
}

# ----------------- FASTAPI APP -----------------
app = FastAPI(
    title="Privacy-Preserving Search Engine Backend",
    description="Fetches results via SearXNG, summarizes via OpenAI, returns raw + summary"
)

# Enable CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- MODELS -----------------
class SearchResult(BaseModel):
    url: str
    title: str
    content: str
    image: str | None = None

class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
    summary: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# ----------------- SEARCH ENDPOINT -----------------
@app.get("/search", response_model=SearchResponse)
def search(
    q: str = Query(..., description="Search query string"),
    category: str = Query("general", description="Search category, e.g., general, news, science, technology, images"),
    language: str = Query("en", description="Search language code, e.g., en, fr, de"),
    num_results: int = Query(5, ge=1, le=20, description="Number of results to return (1–20)")
):
    """Perform a privacy-preserving search via SearXNG and summarize results using OpenAI."""
    params = {
        "q": q,
        "format": "json",
        "language": language
    }

    # Add category only if not general
    if category.lower() != "general":
        params["categories"] = category.lower()

    try:
        resp = requests.get(SEARXNG_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error contacting SearXNG: {e}")

    raw_results = data.get("results", [])
    top_results = raw_results[:num_results]  # ✅ Use user-selected limit

    if not top_results:
        return SearchResponse(query=q, results=[], summary="No results found.")

    # Build text for summary (still summarize top 5 for brevity)
    text_for_summary = "\n".join(
        f"Title: {r.get('title', '')}\nURL: {r.get('url', '')}\nSnippet: {r.get('content', '')}\n"
        for r in top_results[:5]
    )

    prompt = (
        "You are a research assistant. Provide a concise summary of the following search results:\n\n"
        f"{text_for_summary}\n"
        "Write the summary as 3–5 bullet points focusing on key insights."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7
        )
        summary_text = response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error contacting OpenAI: {e}")

    result_objects = [
        SearchResult(
            url=r.get("url", ""),
            title=r.get("title", ""),
            content=r.get("content", ""),
            image=r.get("thumbnail") or CATEGORY_IMAGES.get(category.lower(), CATEGORY_IMAGES["general"])
        )
        for r in top_results
    ]

    return SearchResponse(
        query=q,
        results=result_objects,
        summary=summary_text
    )


# ----------------- CHAT ENDPOINT -----------------
# ----------------- COMBINED CHAT + SEARCH ENDPOINT -----------------
@app.post("/chat", response_model=dict)
def chat_with_search_and_summary(
    payload: dict,
    num_results: int = Query(5, ge=1, le=20, description="Number of search results to use (1–20)"),
    language: str = Query("en", description="Search language code")
):
    """Unified chat endpoint: does search + summary + chat reply in one response."""
    user_message = payload.get("message", "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Empty message")

    # Step 1: Perform SearXNG search
    params = {"q": user_message, "format": "json", "language": language}
    try:
        resp = requests.get(SEARXNG_URL, params=params, timeout=10)
        resp.raise_for_status()
        search_data = resp.json().get("results", [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error contacting SearXNG: {e}")

    if not search_data:
        return {
            "query": user_message,
            "results": [],
            "summary": "No search results found.",
            "reply": "I couldn't find any relevant search results."
        }

    # Step 2: Limit results to user's selection
    top_results = search_data[:num_results]

    # Step 3: Build text for summarization
    text_for_summary = "\n".join(
        f"Title: {r.get('title', '')}\nURL: {r.get('url', '')}\nSnippet: {r.get('content', '')}\n"
        for r in top_results
    )

    # Step 4: Generate summary
    summary_prompt = (
        "You are a research assistant. Provide a concise summary of the following search results:\n\n"
        f"{text_for_summary}\n"
        "Write the summary as 3–5 bullet points focusing on key insights."
    )
    try:
        summary_resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": summary_prompt}],
            max_tokens=300,
            temperature=0.7
        )
        summary_text = summary_resp.choices[0].message.content.strip()
    except Exception as e:
        summary_text = "Error generating summary."

    # Step 5: Generate chat reply using search + summary context
    chat_prompt = (
        f"You are a helpful assistant. Use the following summarized and raw search results "
        f"to answer the user's question.\n\nSummary:\n{summary_text}\n\n"
        f"Search Results:\n{text_for_summary}\n\n"
        f"User's question: {user_message}\n"
        "Provide a clear, factual answer based on the above."
    )
    try:
        chat_resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": chat_prompt}],
            max_tokens=400,
            temperature=0.7
        )
        reply_text = chat_resp.choices[0].message.content.strip()
    except Exception as e:
        reply_text = f"Error generating chat reply: {e}"

    # Step 6: Build final response
    results_with_images = [
        {
            "url": r.get("url", ""),
            "title": r.get("title", ""),
            "content": r.get("content", ""),
            "image": r.get("thumbnail") or CATEGORY_IMAGES.get("general")
        }
        for r in top_results
    ]

    return {
        "query": user_message,
        "results": results_with_images,
        "summary": summary_text,
        "reply": reply_text
    }
