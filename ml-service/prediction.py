import os
import joblib
import pandas as pd
import numpy as np
from preprocessing import preprocess_features
from risk_scoring import calculate_risk_score

class MLPredictor:
    def __init__(self, models_dir='models'):
        self.models_dir = models_dir
        self.iso_forest = None
        self.rf_classifier = None
        self.scaler = None
        self.is_loaded = False
        self.load_models()

    def load_models(self):
        try:
            iso_path = os.path.join(self.models_dir, 'isolation_forest.joblib')
            rf_path = os.path.join(self.models_dir, 'random_forest.joblib')
            scaler_path = os.path.join(self.models_dir, 'scaler.joblib')

            if os.path.exists(iso_path) and os.path.exists(rf_path) and os.path.exists(scaler_path):
                self.iso_forest = joblib.load(iso_path)
                self.rf_classifier = joblib.load(rf_path)
                self.scaler = joblib.load(scaler_path)
                self.is_loaded = True
                print("ML models loaded successfully.")
            else:
                print("Model files not found. Auto-triggering training...")
                from train import train_and_save_models
                train_and_save_models()
                self.load_models()
        except Exception as e:
            print(f"Error loading ML models: {e}")
            self.is_loaded = False

    def predict_single(self, record_dict):
        if not self.is_loaded:
            self.load_models()

        df = pd.DataFrame([record_dict])
        X_scaled, _ = preprocess_features(df, scaler=self.scaler, fit_scaler=False)

        # Isolation Forest decision score (higher anomaly score = more anomalous)
        # decision_function returns negative values for anomalies. We normalize to 0.0-1.0
        raw_iso_score = float(self.iso_forest.score_samples(X_scaled)[0])
        # Mapping score_samples: typical range is approx -0.8 to -0.3
        # We transform to anomaly score between 0.05 and 0.98
        anomaly_score = float(np.clip(1.0 - (raw_iso_score + 0.8) / 0.5, 0.05, 0.98))
        iso_pred = self.iso_forest.predict(X_scaled)[0] # -1 is anomaly, 1 is normal

        # Threat classification
        threat_type = str(self.rf_classifier.predict(X_scaled)[0])
        proba_list = self.rf_classifier.predict_proba(X_scaled)[0]
        confidence = float(np.max(proba_list))

        is_anomaly = (iso_pred == -1) or (threat_type != 'Normal')
        prediction = "anomaly" if is_anomaly else "normal"

        # Calculate risk score
        failed_attempts = record_dict.get('failed_attempts', 0)
        connection_count = record_dict.get('connection_count', 1)
        request_rate = record_dict.get('request_rate', 0.0)

        risk_data = calculate_risk_score(
            anomaly_score=anomaly_score,
            threat_type=threat_type,
            failed_attempts=failed_attempts,
            connection_count=connection_count,
            request_rate=request_rate
        )

        return {
            "prediction": prediction,
            "anomaly_score": round(anomaly_score, 3),
            "threat_type": threat_type,
            "confidence": round(confidence, 3),
            "risk_score": risk_data["risk_score"],
            "severity": risk_data["severity"],
            "contributing_factors": risk_data["contributing_factors"]
        }

    def predict_batch(self, records_list):
        return [self.predict_single(r) for r in records_list]
