"""
Integrated Hand Tracking Server with WebSocket Support
Combines the updated hand tracking logic with Flask API and WebSocket server
"""

import cv2
import mediapipe.python.solutions.hands as mp_hands
import mediapipe.python.solutions.drawing_utils as mp_drawing
import numpy as np
import math
import asyncio
import websockets
import json
import queue
import threading
from flask import Flask
from flask_cors import CORS

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return {"status": "Hand Tracking Server Running", "websocket": "ws://localhost:8765"}

@app.route('/health')
def health():
    return {"status": "ok", "clients": len(connected_clients)}

def run_flask():
    app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False)

# --- WebSocket Server Setup ---
gesture_queue = queue.Queue()
connected_clients = set()

async def gesture_server_handler(websocket, path):
    """Handles new WebSocket connections"""
    connected_clients.add(websocket)
    print(f"✅ Client connected. Total clients: {len(connected_clients)}")
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)
        print(f"❌ Client disconnected. Total clients: {len(connected_clients)}")

async def broadcast_gestures():
    """Continuously checks the queue and sends messages to all connected clients"""
    while True:
        try:
            message = gesture_queue.get_nowait()
            if connected_clients:
                await asyncio.gather(
                    *[client.send(json.dumps(message)) for client in connected_clients],
                    return_exceptions=True
                )
        except queue.Empty:
            await asyncio.sleep(0.01)

def start_websocket_server():
    """Starts the WebSocket server in its own asyncio event loop"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    server = websockets.serve(gesture_server_handler, "0.0.0.0", 8765)
    loop.run_until_complete(server)
    print("🌐 WebSocket server started on ws://localhost:8765")
    loop.run_until_complete(broadcast_gestures())
    loop.run_forever()

# --- Hand Tracking with Gesture Detection ---

def run_hand_tracker():
    """Main function to run hand tracking and gesture detection"""
    
    # Gesture Control States and Constants
    PINCH_THRESHOLD = 40
    UNPINCH_THRESHOLD = 60
    
    zoom_state = "IDLE"
    zoom_pinch_start_pos = (0, 0)
    zoom_current_pinch_pos = (0, 0)
    MIN_ZOOM_PIXELS = 20
    
    rotation_state = "IDLE"
    rotation_pinch_start_pos = (0, 0)
    rotation_current_pinch_pos = (0, 0)
    MIN_ROTATION_PIXELS = 20
    
    panning_state = "IDLE"
    pan_start_midpoint = (0, 0)
    pan_current_midpoint = (0, 0)
    MIN_PAN_PIXELS = 20

    def is_fist(hand_landmarks):
        """Checks if a hand is in a fist"""
        if (hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y > hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_PIP].y and
            hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y > hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_PIP].y and
            hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_TIP].y > hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_PIP].y and
            hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP].y > hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_PIP].y):
            return True
        return False

    cap = cv2.VideoCapture(0)
    
    with mp_hands.Hands(
        model_complexity=1,
        max_num_hands=2,
        min_detection_confidence=0.8,
        min_tracking_confidence=0.8,
    ) as hands:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                print("⚠️  Ignoring empty camera frame...")
                continue
            
            height, width, _ = frame.shape
            black_background = np.zeros((height, width, 3), dtype=np.uint8)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)

            # Data Collection Phase
            hands_in_frame = []
            if results.multi_hand_landmarks and results.multi_handedness:
                for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
                    handedness = results.multi_handedness[i].classification[0].label
                    mp_drawing.draw_landmarks(black_background, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                    
                    thumb_tip_px = (
                        int(hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP].x * width),
                        int(hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP].y * height)
                    )
                    index_finger_tip_px = (
                        int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * width),
                        int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * height)
                    )
                    wrist_px = (
                        int(hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].x * width),
                        int(hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].y * height)
                    )

                    hands_in_frame.append({
                        "landmarks": hand_landmarks,
                        "handedness": handedness,
                        "is_fist": is_fist(hand_landmarks),
                        "pinch_distance": math.hypot(
                            thumb_tip_px[0] - index_finger_tip_px[0],
                            thumb_tip_px[1] - index_finger_tip_px[1]
                        ),
                        "pinch_midpoint": (
                            (thumb_tip_px[0] + index_finger_tip_px[0]) // 2,
                            (thumb_tip_px[1] + index_finger_tip_px[1]) // 2
                        ),
                        "wrist_pos": wrist_px,
                        "thumb_tip_pos": thumb_tip_px,
                        "index_tip_pos": index_finger_tip_px
                    })

            # Gesture Processing Phase
            is_panning_now = False
            
            # Check for two-handed panning first
            if len(hands_in_frame) == 2:
                hand1, hand2 = hands_in_frame[0], hands_in_frame[1]
                if hand1["is_fist"] and hand2["is_fist"]:
                    is_panning_now = True
                    midpoint_now = (
                        (hand1["wrist_pos"][0] + hand2["wrist_pos"][0]) // 2,
                        (hand1["wrist_pos"][1] + hand2["wrist_pos"][1]) // 2
                    )
                    if panning_state == "IDLE":
                        panning_state = "PANNING"
                        pan_start_midpoint = midpoint_now
                    pan_current_midpoint = midpoint_now
                    cv2.line(black_background, pan_start_midpoint, pan_current_midpoint, (0, 255, 0), 4)
            
            # If not actively panning now, check if we need to end a pan or process single hand gestures
            if not is_panning_now:
                if panning_state == "PANNING":
                    delta_x = pan_current_midpoint[0] - pan_start_midpoint[0]
                    delta_y = pan_current_midpoint[1] - pan_start_midpoint[1]
                    if abs(delta_x) > MIN_PAN_PIXELS or abs(delta_y) > MIN_PAN_PIXELS:
                        print(f"✋ Panned: dX={delta_x}, dY={delta_y}")
                        gesture_queue.put({"type": "pan", "dx": delta_x, "dy": delta_y})
                    panning_state = "IDLE"
                
                # Process single-hand gestures only if not panning
                for hand in hands_in_frame:
                    if hand["handedness"] == "Right":
                        if zoom_state == "IDLE":
                            cv2.circle(black_background, hand["thumb_tip_pos"], 15, (0, 255, 0), -1)
                            cv2.circle(black_background, hand["index_tip_pos"], 15, (0, 0, 255), -1)
                            if hand["pinch_distance"] < PINCH_THRESHOLD:
                                zoom_state = "PINCHED"
                                zoom_pinch_start_pos = hand["pinch_midpoint"]
                                zoom_current_pinch_pos = hand["pinch_midpoint"]
                        elif zoom_state == "PINCHED":
                            cv2.circle(black_background, hand["thumb_tip_pos"], 15, (0, 255, 255), -1)
                            cv2.circle(black_background, hand["index_tip_pos"], 15, (0, 255, 255), -1)
                            if hand["pinch_distance"] < PINCH_THRESHOLD:
                                zoom_current_pinch_pos = hand["pinch_midpoint"]
                                cv2.line(black_background, zoom_pinch_start_pos, zoom_current_pinch_pos, (0, 255, 255), 3)
                            else:
                                delta_y = zoom_pinch_start_pos[1] - zoom_current_pinch_pos[1]
                                if abs(delta_y) > MIN_ZOOM_PIXELS:
                                    print(f"🔍 Zoom: {delta_y} pixels")
                                    gesture_queue.put({"type": "zoom", "delta": delta_y})
                                zoom_state = "IDLE"

                    elif hand["handedness"] == "Left":
                        if rotation_state == "IDLE":
                            cv2.circle(black_background, hand["thumb_tip_pos"], 15, (0, 255, 0), -1)
                            cv2.circle(black_background, hand["index_tip_pos"], 15, (0, 0, 255), -1)
                            if hand["pinch_distance"] < PINCH_THRESHOLD:
                                rotation_state = "PINCHED"
                                rotation_pinch_start_pos = hand["pinch_midpoint"]
                                rotation_current_pinch_pos = hand["pinch_midpoint"]
                        elif rotation_state == "PINCHED":
                            cv2.circle(black_background, hand["thumb_tip_pos"], 15, (255, 255, 0), -1)
                            cv2.circle(black_background, hand["index_tip_pos"], 15, (255, 255, 0), -1)
                            if hand["pinch_distance"] < PINCH_THRESHOLD:
                                rotation_current_pinch_pos = hand["pinch_midpoint"]
                                cv2.line(black_background, rotation_pinch_start_pos, rotation_current_pinch_pos, (255, 255, 0), 3)
                            else:
                                delta_x = rotation_current_pinch_pos[0] - rotation_pinch_start_pos[0]
                                if abs(delta_x) > MIN_ROTATION_PIXELS:
                                    print(f"🔄 Rotated: {delta_x} pixels")
                                    gesture_queue.put({"type": "rotate", "delta": delta_x})
                                rotation_state = "IDLE"
            
            if not hands_in_frame:
                zoom_state = "IDLE"
                rotation_state = "IDLE"
                panning_state = "IDLE"

            cv2.imshow("Hand Tracking", cv2.flip(black_background, 1))
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    
    cap.release()
    cv2.destroyAllWindows()

# --- Main Execution ---

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 HAND TRACKING SERVER - URANUS PROBE EDITION")
    print("=" * 70)
    print("📡 Flask API: http://localhost:5000")
    print("🌐 WebSocket: ws://localhost:8765")
    print("\n🎮 Gesture Controls:")
    print("  👉 Right hand pinch (up/down): Zoom")
    print("  👈 Left hand pinch (left/right): Rotate")
    print("  ✊ Two fists: Pan")
    print("\n⌨️  Press 'q' in the tracking window to quit")
    print("=" * 70)
    
    # Start Flask server in a separate thread
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    # Start WebSocket server in a separate thread
    ws_thread = threading.Thread(target=start_websocket_server, daemon=True)
    ws_thread.start()
    
    # Run hand tracker in main thread
    run_hand_tracker()
