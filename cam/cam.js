var VIDEO = null;
var SIZE = 300;
var CANVAS;
var EFFECT_INDEX = 0;
var EFFECTS = [
  "normal",
  "gray",
  "invert",
  "symmetry",
  "mirror",
  "averageSymmetry",
  "stack",
];
let ctx = null;

const pipeline = [];
const toonPipeline = [];
const replayPipeline = [];
let bufferDelayCount = 0;

async function transformImage(data) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    data,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  //"https://ay-tooner.onrender.com/cartoon-convertv2"
  //"http://127.0.0.1:5000/cartoon-convertv2"
  return fetch(
    "https://ay-tooner.onrender.com/cartoon-convertv2",
    requestOptions
  )
    .then((response) => response.text())
    .catch((error) => console.log("error", error));
}

async function processFromPipline() {
  let data = pipeline.shift();
  if (!data) {
    setTimeout(() => {
      processFromPipline();
    }, 1);
    return;
  }
  let newTransform = await transformImage(data);
  toonPipeline.push(newTransform);
  setTimeout(() => {
    processFromPipline();
  }, 1);
}

function renderFromToonPipeline() {
  let toonData = toonPipeline.shift();
  if (toonData) {
    document.querySelector("#out").src = "data:image/jpeg;base64," + toonData;
    replayPipeline.push(toonData);
  } else if (!toonData) {
    bufferDelayCount = 0;
  }
}

function backupReplayPipline() {
  // if (!toonData) {
  let backupToonData = replayPipeline.shift();
  if (!backupToonData) return;
  document.querySelector("#out").src =
    "data:image/jpeg;base64," + backupToonData;
  replayPipeline.push(backupToonData); //restore back.
  // }
}

async function main() {
  //removeOverlay();

  CANVAS = initializeCanvas("myCanvas", SIZE, SIZE);
  initializeCamera();
  ctx = CANVAS.getContext("2d");

  let inter = setInterval(async function () {
    drawScene(ctx);
    let data = CANVAS.toDataURL("image/jpeg");
    // console.log("dt", data);
    data = data.split("data:image/jpeg;base64,")[1];
    pipeline.push(data);
    // let newTransform = await transformImage(data);
    // document.querySelector("#out").src =
    //   "data:image/jpeg;base64," + newTransform;
    // console.log(newTransform);
    // clearInterval(inter);

    // socket.emit("cartoon-stream", data);

    // console.log(data);
    // let imageData = await getImageContext(getDataUrl(CANVAS));
    // let output = get2dContext("myCanvas2");
    // drawImage(output.context, imageData);
    // try {
    //   // console.log(getImageDataArray(ctx));
    //   // let blob = await getImageToBlob(CANVAS);
    //   // new Toon(blob, output.canvas);
    //   // let imageData2 = await toon(SIZE, SIZE, output.canvas, blob);
    //   // process(SIZE, SIZE, output.canvas);
    //   // let imageData2 = await getImageContext(getDataUrl(output.canvas));
    //   // drawImage(output.context, imageData2);
    // } catch (error) {
    //   console.log(error);
    // }
    // console.log(getImageDataArray(get2dContext("myCanvas2")));
    // console.log(imageData.src.length);
    if (bufferDelayCount >= 150) {
      if (toonPipeline.length <= 0) {
        // replayPipeline = []; //reset here for new iteration.
      }
      renderFromToonPipeline();
    } else {
      bufferDelayCount += 1;
      backupReplayPipline();
    }
  }, 100); // once every 100 ms

  processFromPipline();
}

function drawScene(ctx) {
  if (VIDEO != null) {
    var min = Math.min(VIDEO.videoWidth, VIDEO.videoHeight);
    var sx = (VIDEO.videoWidth - min) / 2;
    var sy = (VIDEO.videoHeight - min) / 2;
    ctx.drawImage(VIDEO, sx, sy, min, min, 0, 0, SIZE, SIZE);
  } else {
    // show loading
  }

  // applySomeEffect(ctx);
}

function applySomeEffect(ctx) {
  switch (EFFECTS[EFFECT_INDEX]) {
    case "normal":
      break;
    case "gray":
      applyGrayScale(ctx);
      break;
    case "invert":
      applyColorInvert(ctx);
      break;
    case "symmetry":
      applySymmetry(ctx);
      break;
    case "mirror":
      applyMirroring(ctx);
      break;
    case "averageSymmetry":
      applyAverageSymmetry(ctx);
      break;
    case "stack":
      applyColorInvert(ctx);
      applySymmetry(ctx);
      break;
  }

  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.beginPath();
  ctx.font = SIZE * 0.1 + "px Arial";
  ctx.fillText(EFFECTS[EFFECT_INDEX], SIZE / 2, SIZE * 0.1);
}

function initializeCanvas(canvasName, width, height) {
  let canvas = document.getElementById(canvasName);
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function initializeCamera() {
  var promise = navigator.mediaDevices.getUserMedia({ video: true });
  promise
    .then(function (signal) {
      VIDEO = document.createElement("video");
      VIDEO.srcObject = signal;
      VIDEO.play();
    })
    .catch(function (err) {
      alert("Camera Error");
    });
}

function get2dContext(id) {
  let canvasObject = initializeCanvas(id, SIZE, SIZE);
  return {
    context: canvasObject.getContext("2d"),
    canvas: canvasObject,
  };
}

function getDataUrl(canvas) {
  return canvas.toDataURL();
}

function getImageDataArray(context) {
  return context.getImageData(0, 0, SIZE, SIZE);
}

function getImageToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve);
  });
}

async function getImageContext(dataUrl) {
  //   console.log("data-url", dataUrl);
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onload = function () {
      //   ctx.drawImage(img, 0, 0); // Or at whatever offset you like
      resolve(img);
    };
    img.src = dataUrl;
    return img;
  });
}

function drawImage(context, image) {
  context.drawImage(image, 0, 0);
}

function appendDataUrlToCanvas(context) {
  var myCanvas = document.getElementById("my_canvas_id");
  var ctx = myCanvas.getContext("2d");
  var img = new Image();
  img.onload = function () {
    ctx.drawImage(img, 0, 0); // Or at whatever offset you like
  };
  img.src = strDataURI;
}

main();
