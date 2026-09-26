from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Union
import os
import uvicorn
from prediction import MLPredictor

app = FastAPI(
    title="CyberShield AI - ML Service",
    description="Microservice for network anomaly detection & threat classification using scikit-learn",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = MLPredictor()

class NetworkFeatures(BaseModel):
    duration: float = Field(0.1, description="Connection duration in seconds")
    protocol: str = Field("TCP", description="Network protocol (TCP, UDP, ICMP)")
    source_bytes: int = Field(100, description="Bytes transmitted from source")
    destination_bytes: int = Field(100, description="Bytes received at destination")
    packet_count: int = Field(10, description="Total packet count")
    source_port: int = Field(44332, description="Source port number")
    destination_port: int = Field(80, description="Destination port number")
    failed_attempts: int = Field(0, description="Failed login/connection attempts")
    connection_count: int = Field(5, description="Number of concurrent connection attempts")
    request_rate: float = Field(10.0, description="Requests per second")

class PredictRequest(BaseModel):
    events: Union[NetworkFeatures, List[NetworkFeatures]]

@app.get("/")
def root():
    return {
        "service": "CyberShield AI ML Service",
        "status": "online",
        "models_loaded": predictor.is_loaded
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_ready": predictor.is_loaded
    }

@app.post("/predict")
def predict_threat(payload: Union[NetworkFeatures, List[NetworkFeatures]]):
    try:
        if isinstance(payload, list):
            items = [item.model_dump() for item in payload]
            results = predictor.predict_batch(items)
            return results
        else:
            item = payload.model_dump()
            result = predictor.predict_single(item)
            return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction engine error: {str(e)}")

@app.post("/train")
def train_models_endpoint():
    try:
        from train import train_and_save_models
        train_and_save_models()
        predictor.load_models()
        return {"status": "success", "message": "ML models retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training error: {str(e)}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
