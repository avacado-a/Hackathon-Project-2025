import cv2
import mediapipe.python.solutions.hands as mp_hands
import mediapipe.python.solutions.drawing_utils as mp_drawing
import numpy as np
import math
import time

cap = cv2.VideoCapture(0)
#pragma region Variables Where my C++ Homies At
pinchThres = 40
unpinchThres = 60

zoomingstate = "idle"
rotatingstate = "idle"
panningstate = "idle"
zoomstartpos = (0, 0)
rotatingstartpos = (0, 0)
panstartpos = (0, 0)
zoomcurrentpos = (0, 0)
rotatingcurrentpos = (0, 0)
pancurrentpos = (0, 0)
minZoom = 20
minRot = 20
minPan = 20 #Chinese ahh name
#pragma region Variables Where my C++ Homies At

def fistQuestionMark(hand_landmarks):
    if (hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y > hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_PIP].y and
        hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y > hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_PIP].y and
        hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_TIP].y > hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_PIP].y and
        hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP].y > hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_PIP].y):
        return True
    return False

with mp_hands.Hands(
    model_complexity=1,
    max_num_hands=2,
    min_detection_confidence=0.8,
    min_tracking_confidence=0.8,
) as handsTracker:
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("Microsoft Tech Support. Please install this. Definetely not virus")
            continue
        
        height, width, _ = frame.shape
        black = np.zeros((height, width, 3), dtype=np.uint8)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = handsTracker.process(frame_rgb)

        hands = []
        if results.multi_hand_landmarks and results.multi_handedness:
            for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
                handedness = results.multi_handedness[i].classification[0].label
                mp_drawing.draw_landmarks(black, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                thumbTip = (int(hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP].x * width), int(hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP].y * height))
                indexTip = (int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * width), int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * height))
                wrist = (int(hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].x * width), int(hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].y * height))

                hands.append({
                    "landmarks": hand_landmarks,
                    "handedness": handedness,
                    "fistQuestionMark": fistQuestionMark(hand_landmarks),
                    "pDisdy": math.hypot(thumbTip[0] - indexTip[0], thumbTip[1] - indexTip[1]), # Hypot deez nuts
                    "pinchMid": ((thumbTip[0] + indexTip[0]) // 2, (thumbTip[1] + indexTip[1]) // 2),
                    "wrist": wrist,
                    "thumbTip": thumbTip,
                    "indexTip": indexTip
                })

        
        panning = False
        pan_just_released = False
        if len(hands) == 2:
            hand, hand2 = hands[0], hands[1]
            if hand["fistQuestionMark"] and hand2["fistQuestionMark"]:
                panning = True
                midpoint_now = ((hand["wrist"][0] + hand2["wrist"][0]) // 2, (hand["wrist"][1] + hand2["wrist"][1]) // 2)
                if panningstate == "idle":
                    panningstate = "panning"
                    panstartpos = midpoint_now
                pancurrentpos = midpoint_now
                cv2.line(black, panstartpos, pancurrentpos, (0, 255, 0), 4)
        
        if not panning:
            if panningstate == "panning":
                delta_x = pancurrentpos[0] - panstartpos[0]
                delta_y = pancurrentpos[1] - panstartpos[1]
                if abs(delta_x) > minPan or abs(delta_y) > minPan:
                    print(f"Panned: dX={delta_x}, dY={delta_y}")
                panningstate = "idle"
                pan_just_released = True
            
            if not pan_just_released:
                for hand in hands:
                    if hand["handedness"] == "Right":
                        if zoomingstate == "idle":
                            cv2.circle(black, hand["thumbTip"], 15, (0, 255, 0), -1)
                            cv2.circle(black, hand["indexTip"], 15, (0, 0, 255), -1)
                            if hand["pDisdy"] < pinchThres:
                                zoomingstate = "PINCHED"
                                zoomstartpos = hand["pinchMid"]
                                zoomcurrentpos = hand["pinchMid"]
                        elif zoomingstate == "PINCHED":
                            cv2.circle(black, hand["thumbTip"], 15, (0, 255, 255), -1)
                            cv2.circle(black, hand["indexTip"], 15, (0, 255, 255), -1)
                            if hand["pDisdy"] < pinchThres:
                                zoomcurrentpos = hand["pinchMid"]
                                cv2.line(black, zoomstartpos, zoomcurrentpos, (0, 255, 255), 3)
                            else:
                                delta_y = zoomstartpos[1] - zoomcurrentpos[1]
                                if abs(delta_y) > minZoom:
                                    print(f"Zoom: {delta_y} pixels")
                                zoomingstate = "idle"

                    elif hand["handedness"] == "Left":
                        if rotatingstate == "idle":
                            cv2.circle(black, hand["thumbTip"], 15, (0, 255, 0), -1)
                            cv2.circle(black, hand["indexTip"], 15, (0, 0, 255), -1)
                            if hand["pDisdy"] < pinchThres:
                                rotatingstate = "PINCHED"
                                rotatingstartpos = hand["pinchMid"]
                                rotatingcurrentpos = hand["pinchMid"]
                        elif rotatingstate == "PINCHED":
                            cv2.circle(black, hand["thumbTip"], 15, (255, 255, 0), -1)
                            cv2.circle(black, hand["indexTip"], 15, (255, 255, 0), -1)
                            if hand["pDisdy"] < pinchThres:
                                rotatingcurrentpos = hand["pinchMid"]
                                cv2.line(black, rotatingstartpos, rotatingcurrentpos, (255, 255, 0), 3)
                            else:
                                delta_x = rotatingcurrentpos[0] - rotatingstartpos[0]
                                if abs(delta_x) > minRot:
                                    print(f"Rotated: {delta_x} pixels")
                                rotatingstate = "idle"
        
        if not hands:
            zoomingstate = "idle"
            rotatingstate = "idle"
            panningstate = "idle"

        cv2.imshow("Hand Tracking", cv2.flip(black, 1))
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
cap.release()