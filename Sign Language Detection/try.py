# test.py
from flask import Flask, Response, render_template
import cv2
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import numpy as np
import math
import os

# --- Flask App Setup ---
# Tell Flask to look for templates in the current directory
app = Flask(__name__, template_folder='.') # <--- IMPORTANT CHANGE HERE!
                                         # Flask will now look for index.html in the same directory as test.py

# --- Configuration ---
# Paths are relative to test.py
MODEL_DIR = 'Model' # Assuming 'Model' folder is next to test.py
MODEL_PATH = os.path.join(MODEL_DIR, 'keras_model.h5')
LABELS_PATH = os.path.join(MODEL_DIR, 'labels.txt')

# Verify if model and labels files exist
if not os.path.exists(MODEL_PATH):
    print(f"Error: Model file not found at {MODEL_PATH}")
    print(f"Expected path: {os.path.abspath(MODEL_PATH)}") # Print absolute path for debugging
    exit()
if not os.path.exists(LABELS_PATH):
    print(f"Error: Labels file not found at {LABELS_PATH}")
    print(f"Expected path: {os.path.abspath(LABELS_PATH)}")
    exit()

# --- Initialize cvzone components globally ---
detector = HandDetector(maxHands=1)
classifier = Classifier(MODEL_PATH, LABELS_PATH)

offset = 20
imgSize = 300

# Load labels from file for displaying text on the frame
try:
    with open(LABELS_PATH, 'r') as f:
        labels = [line.strip() for line in f]
    print(f"Labels loaded: {labels}")
except Exception as e:
    print(f"Could not load labels from {LABELS_PATH}: {e}")
    labels = []

# --- Video Stream Generator Function ---
def generate_frames():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open webcam.")
        ret, buffer = cv2.imencode('.jpg', np.zeros((480,640,3), dtype=np.uint8))
        yield b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n'
        return

    while True:
        success, img = cap.read()
        if not success:
            print("Failed to grab frame.")
            break

        img = cv2.flip(img, 1)
        imgOutput = img.copy()

        hands, img = detector.findHands(img)
        if hands:
            hand = hands[0]
            x, y, w, h = hand['bbox']

            imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255

            y1, y2 = max(0, y - offset), min(img.shape[0], y + h + offset)
            x1, x2 = max(0, x - offset), min(img.shape[1], x + w + offset)
            imgCrop = img[y1:y2, x1:x2]

            if imgCrop.size == 0:
                print("Warning: imgCrop is empty, skipping hand processing for this frame.")
                cv2.rectangle(imgOutput, (x - offset, y - offset), (x + w + offset, y + h + offset), (0, 0, 255), 4)
                ret, buffer = cv2.imencode('.jpg', imgOutput)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
                continue

            aspectRatio = h / w

            if aspectRatio > 1:
                k = imgSize / h
                wCal = math.ceil(k * w)
                imgResize = cv2.resize(imgCrop, (wCal, imgSize))
                wGap = math.ceil((imgSize - wCal) / 2)
                imgWhite[:, wGap:wCal + wGap] = imgResize
            else:
                k = imgSize / w
                hCal = math.ceil(k * h)
                imgResize = cv2.resize(imgCrop, (imgSize, hCal))
                hGap = math.ceil((imgSize - hCal) / 2)
                imgWhite[hGap:hCal + hGap, :] = imgResize

            prediction, index = classifier.getPrediction(imgWhite, draw=False)

            if labels and index < len(labels):
                text_to_display = labels[index]
            else:
                text_to_display = f"Class {index}"

            cv2.putText(imgOutput, text_to_display, (x - 23, y - 30), cv2.FONT_HERSHEY_COMPLEX, 1.7, (255, 0, 255), 2)
            cv2.rectangle(imgOutput, (x - offset, y - offset), (x + w + offset, y + h + offset), (255, 0, 255), 4)

        ret, buffer = cv2.imencode('.jpg', imgOutput)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()

# --- Flask Routes ---
@app.route('/')
def index():
    """Video streaming home page."""
    # Flask will now look for 'index.html' in the current directory (SignLanguage/)
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Supplies frames from the webcam."""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# --- Main execution block for Flask ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)