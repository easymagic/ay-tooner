from flask import Flask, request, jsonify

import numpy as np
import cv2
from PIL import Image, ImageEnhance
from io import StringIO
import base64
# from flask_cors import CORS
from flask_cors import CORS, cross_origin

from flask_socketio import SocketIO, emit


app = Flask(__name__)
# CORS(app)

socket = SocketIO(app, cors_allowed_origins="*")


@app.route("/toon")
def toon():
    return "toon"


@socket.on("connect")
def connect():
    print("Connected", request.sid)
    emit("connect", "Hello", broadcast=True)


@socket.on("disconnect")
def disconnect():
    print("Disconnected..", request.sid)


@socket.on("cartoon-stream")
def cartoonStream(imgData):
    emit("cartoon-stream", cartoonStreamScheme1(imgData), broadcast=True)


@app.route("/cartoon-convertv2", methods=["POST"])
@cross_origin()
def cartoonConvertv2():
    imgData = request.json["data"]
    return cartoonStreamScheme1(imgData)


def cartoonStreamScheme1(imgData):
    # print(imgData)
    # imgData = request.json["data"]
    # pilImage = Image.open(imgData)
    # npImage = np.array(pilImage)
    frame = from_base64(imgData)
    frame = cv2.resize(frame, (300, 300))
    frame = cv2.flip(frame, 1)
    # Detecting edges of the input image
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 7)
    edges = cv2.Canny(frame, 75, 150)
    # edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 2)
    edges = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 9, 2)
    # Cartoonifying the image
    # color = cv2.bilateralFilter(frame, 9, 250, 250)
    color = cv2.bilateralFilter(frame, 9, 9, 7)
    cartoon = cv2.bitwise_and(color, color, mask=edges)
    _, im_arr = cv2.imencode('.jpg', cartoon)
    return base64.b64encode(im_arr.tobytes())


def color_quantization(img, k):
    # Transform the image
    data = np.float32(img).reshape((-1, 3))

    # Determine criteria
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.001)

    # Implementing K-Means
    ret, label, center = cv2.kmeans(
        data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    center = np.uint8(center)
    result = center[label.flatten()]
    result = result.reshape(img.shape)
    return result


def edge_mask(img, line_size, blur_value):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.medianBlur(gray, blur_value)
    edges = cv2.adaptiveThreshold(
        gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, line_size, blur_value)
    return edges


def cartoonStreamScheme2(imgData):
    frame = from_base64(imgData)
    frame = cv2.resize(frame, (640, 480))
    frame = cv2.flip(frame, 1)
    line_size = 7
    blur_value = 7
    edges = edge_mask(frame, line_size, blur_value)
    total_color = 9
    frame = color_quantization(frame, total_color)
    blurred = cv2.bilateralFilter(frame, d=7, sigmaColor=200, sigmaSpace=200)
    cartoon = cv2.bitwise_and(blurred, blurred, mask=edges)
    _, im_arr = cv2.imencode('.jpg', cartoon)
    return base64.b64encode(im_arr.tobytes())


def connect():
    print("Connected", request.sid)
    emit("connect", "Hello", broadcast=True)


@app.route("/cartoon-convert", methods=["POST"])
def toCartoon():
    imgData = request.json["data"]
    # pilImage = Image.open(imgData)
    # npImage = np.array(pilImage)
    frame = from_base64(imgData)
    frame = cv2.resize(frame, (640, 480))
    frame = cv2.flip(frame, 1)
    # Detecting edges of the input image
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 7)
    edges = cv2.Canny(frame, 75, 150)
    # edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 2)
    edges = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 9, 2)
    # Cartoonifying the image
    # color = cv2.bilateralFilter(frame, 9, 250, 250)
    color = cv2.bilateralFilter(frame, 9, 9, 7)
    cartoon = cv2.bitwise_and(color, color, mask=edges)
    _, im_arr = cv2.imencode('.jpg', cartoon)
    return base64.b64encode(im_arr.tobytes())


def from_base64(base64_data):
    im_bytes = base64.b64decode(base64_data)
    # im_arr is one-dim Numpy array
    im_arr = np.frombuffer(im_bytes, dtype=np.uint8)
    img = cv2.imdecode(im_arr, flags=cv2.IMREAD_COLOR)
    return img
    # nparr = np.fromstring(base64_data, np.uint8)
    # return cv2.imdecode(nparr, cv2.IMREAD_ANYCOLOR)


if __name__ == "__main__":
    # app.run(debug=True, threaded=True)
    # socket.bind(("0.0.0.0", 5000))
    # from waitress import serve
    # from waitress import serve
    socket.run(app, port=5000, allow_unsafe_werkzeug=True)
