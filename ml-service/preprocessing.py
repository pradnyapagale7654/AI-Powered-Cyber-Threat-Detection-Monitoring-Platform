import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

FEATURE_COLUMNS = [
    'duration', 'source_bytes', 'destination_bytes', 
    'packet_count', 'source_port', 'destination_port', 
    'failed_attempts', 'connection_count', 'request_rate', 'protocol_encoded'
]

PROTOCOL_MAP = {'TCP': 0, 'UDP': 1, 'ICMP': 2}

def preprocess_features(df, scaler=None, fit_scaler=False):
    """
    Standardize raw dataset features into ML input vectors.
    """
    df_clean = df.copy()

    # Required numeric columns with default fill values
    numeric_defaults = {
        'duration': 0.1,
        'source_bytes': 100,
        'destination_bytes': 100,
        'packet_count': 10,
        'source_port': 40000,
        'destination_port': 80,
        'failed_attempts': 0,
        'connection_count': 5,
        'request_rate': 10.0
    }

    for col, default in numeric_defaults.items():
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(default)
        else:
            df_clean[col] = default

    # Map protocol column
    if 'protocol' in df_clean.columns:
        df_clean['protocol_encoded'] = df_clean['protocol'].astype(str).str.upper().map(
            lambda x: PROTOCOL_MAP.get(x, 0)
        )
    else:
        df_clean['protocol_encoded'] = 0

    X_raw = df_clean[FEATURE_COLUMNS].values

    if fit_scaler:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)
        return X_scaled, scaler
    else:
        if scaler is not None:
            X_scaled = scaler.transform(X_raw)
        else:
            X_scaled = X_raw
        return X_scaled, scaler
