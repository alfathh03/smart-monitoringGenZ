import os
import re
import cv2
import numpy as np
import easyocr
from flask import Flask, request, jsonify
from flask_cors import CORS  
from ultralytics import YOLO

app = Flask(__name__)
CORS(app) 

# 1. INIT & LOAD MODEL SCANNER
print("Membangunkan Sistem... Mohon tunggu!")

# Load Model YOLO (Scanner)
try:
    yolo_model = YOLO("best.pt")
    print("Model YOLO (best.pt) siap!")
except Exception as e:
    print(f"Peringatan: Model YOLO (best.pt) tidak ditemukan. {e}")

# Load EasyOCR (Scanner)
reader = easyocr.Reader(['id', 'en'], gpu=False) 
print("EasyOCR siap!")

# 2. ENDPOINT 1: SCANNER STRUK (YOLO + OCR)
@app.route('/api/scan', methods=['POST'])
def scan_receipt():
    if 'image' not in request.files:
        return jsonify({"error": "Tidak ada file gambar yang dikirim!"}), 400

    file = request.files['image']
    
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    
    results = reader.readtext(img)
    extracted_text = [text for (bbox, text, prob) in results]
    full_text = "\n".join(extracted_text)
    
    merchant_name = extracted_text[0] if len(extracted_text) > 0 else "Tidak Diketahui"

    tanggal_match = re.search(r'\d{2}[-/]\d{2}[-/]\d{4}', full_text)
    tanggal = tanggal_match.group() if tanggal_match else None

    total_amount = 0
    for i, line in enumerate(extracted_text):
        if "total" in line.lower():
            angka_sama = re.sub(r'[^\d]', '', line.lower().replace('total', ''))
            if angka_sama.strip():
                total_amount = int(angka_sama)
                break
            elif i + 1 < len(extracted_text):
                angka_bawah = re.sub(r'[^\d]', '', extracted_text[i+1])
                if angka_bawah.strip():
                    total_amount = int(angka_bawah)
                    break

    return jsonify({
        "merchant_name": merchant_name,
        "tanggal": tanggal,
        "total_amount": total_amount,
        "payment_method": "cash",
        "raw_text": extracted_text
    })

# 3. ENDPOINT 2: INSIGHT GENERATOR (RULE-BASED)
def generate_insight(total, avg_pengeluaran):
    """Fungsi logika Insight dari Tim AI"""
    if total > avg_pengeluaran * 1.5:
        return (
            "Pengeluaran Anda lebih tinggi dari rata-rata. "
            "Pertimbangkan untuk mengurangi pengeluaran non-prioritas."
        )
    elif total < avg_pengeluaran * 0.5:
        return (
            "Pengeluaran Anda lebih rendah dari biasanya. "
            "Pertahankan pola pengelolaan keuangan yang baik."
        )
    else:
        return (
            "Pengeluaran Anda masih dalam rentang normal."
        )

@app.route('/api/insight', methods=['POST'])
def get_insight():
    data = request.json

    if not data or 'total' not in data or 'avg_pengeluaran' not in data:
        return jsonify({"error": "Format salah. Butuh 'total' dan 'avg_pengeluaran'"}), 400

    try:
        total = float(data['total'])
        avg_pengeluaran = float(data['avg_pengeluaran'])
        
        # Eksekusi Fungsi Rule-Based
        insight_message = generate_insight(total, avg_pengeluaran)
        
        return jsonify({
            "success": True,
            "insight_message": insight_message,
            "data_analyzed": {
                "total": total,
                "avg_pengeluaran": avg_pengeluaran
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# JALANKAN SERVER PYTHON
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=False)