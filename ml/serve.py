"""
VibeForge ML Service — serves two endpoints:
  POST /classify         -> career category from goal text
  POST /predict-success  -> on_track / at_risk probability from check-in features

Run with:
  uvicorn serve:app --reload --port 8000
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="VibeForge ML Service",
    description="Career Classifier + Success Probability endpoints",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model Paths ───────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
VEC_PATH      = os.path.join(BASE_DIR, "models", "vectorizer.pkl")
CLF_PATH      = os.path.join(BASE_DIR, "models", "classifier.pkl")
SUCCESS_PATH  = os.path.join(BASE_DIR, "models", "success_model.pkl")

# ── Lazy-load models at startup ───────────────────────────────────────────────
vectorizer     = None
classifier     = None
success_model  = None

@app.on_event("startup")
def load_models():
    global vectorizer, classifier, success_model
    try:
        vectorizer    = joblib.load(VEC_PATH)
        classifier    = joblib.load(CLF_PATH)
        print(f"[OK] Career classifier loaded from {CLF_PATH}")
    except FileNotFoundError:
        print(f"[WARN] Career classifier not found at {CLF_PATH}. Run train_classifier.py first.")

    try:
        success_model = joblib.load(SUCCESS_PATH)
        print(f"[OK] Success model loaded from {SUCCESS_PATH}")
    except FileNotFoundError:
        print(f"[WARN] Success model not found at {SUCCESS_PATH}. Run train_success_model.py first.")


# ── Schemas ───────────────────────────────────────────────────────────────────
class ClassifyRequest(BaseModel):
    text: str

class ClassifyResponse(BaseModel):
    category: str
    confidence: float

class SuccessRequest(BaseModel):
    avg_completion_percent: float
    completion_trend: float
    weeks_elapsed_ratio: float
    num_checkins_missed: int

class SuccessResponse(BaseModel):
    status: str          # "on_track" | "at_risk"
    probability: float   # probability of being on_track


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "classifier_loaded": classifier is not None,
        "success_model_loaded": success_model is not None,
    }


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    if vectorizer is None or classifier is None:
        raise HTTPException(
            status_code=503,
            detail="Career classifier model not loaded. Run ml/train_classifier.py first.",
        )
    text = req.text.lower().strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    vec = vectorizer.transform([text])
    category   = classifier.predict(vec)[0]
    proba      = classifier.predict_proba(vec)[0]
    confidence = float(np.max(proba))

    return ClassifyResponse(category=category, confidence=round(confidence, 4))


@app.post("/predict-success", response_model=SuccessResponse)
def predict_success(req: SuccessRequest):
    if success_model is None:
        raise HTTPException(
            status_code=503,
            detail="Success model not loaded. Run ml/train_success_model.py first.",
        )
    features = np.array([[
        req.avg_completion_percent,
        req.completion_trend,
        req.weeks_elapsed_ratio,
        req.num_checkins_missed,
    ]])

    proba      = success_model.predict_proba(features)[0]
    # class order: [at_risk=0, on_track=1]
    on_track_prob = float(proba[1])
    status         = "on_track" if on_track_prob >= 0.5 else "at_risk"

    return SuccessResponse(status=status, probability=round(on_track_prob, 4))
