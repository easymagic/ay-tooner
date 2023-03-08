const toon = async (w, h, canvas, blob) => {
  //   console.log("dataURL", dataUrl);
  let img = await getImageStream(blob);
  // console.log(img);
  process(w, h, canvas, img);
  return img;
};

const process = (w, h, canvas, srcimg) => {
  // var canvas = $("<canvas>");
  //   var w = (canvas.width = SIZE);
  //   var h = (canvas.height = SIZE);
  // var prog = $("<span>").text("Processing...");
  // t.container.append(prog);
  let distance = 35;

  let ctx = canvas.getContext("2d");
  ctx.drawImage(srcimg, 0, 0);
  let image = ctx.getImageData(0, 0, w, h); //array [4*w*h] of colors RGBA
  // console.log("w,h,image", w, h, t.image);
  ctx.clearRect(0, 0, w, h);
  let mask = Array(w);
  var zz = Array();
  for (var i = 0; i < w * h; i++) {
    zz[i] = i;
  }
  for (var i = 0; i < w; i++) {
    mask[i] = Array(h);
    for (var j = 0; j < h; j++) {
      mask[i][j] = true;
      var n = Math.floor(w * h * Math.random());
      var z = zz[n];
      zz[n] = zz[i * j];
      zz[i * j] = z;
    }
  }

  var n = 0;
  var err = "";
  var step = (w * h) / 100;
  var progress = 0;
  while (n < w * h && err == "") {
    var q = Math.floor(step);
    while (q > 0 && n < w * h && err == "") {
      var x = zz[n];
      var j = Math.floor(x / w);
      var i = x % w;

      if (mask[i][j]) {
        var y = x * 4;
        var avgct = 0;
        let avg = [
          image.data[y++],
          image.data[y++],
          image.data[y++],
          image.data[y++],
        ];
        try {
          console.log(" w , h , n < w*h", w, h, n, w * h);
          doPoint(w, h, image.data, distance, i, j); // do all the points next to it too...
          doPaint(w, h, mask, avg, image.data);
        } catch (e) {
          if (!e.message == "Maximum call stack size exceeded") {
            err = e.message;
            console.log(err);
            // prog.text(e.message);
          } else {
            doPaint(w, h, mask, avg, image.data);
          } // ignore call stack (we'll try
        }
      }
      n++;
      q--;
    }
    // ctx.putImageData(image, 0, 0);
    // console.log("data-image", image);
    // console.log("data-url-v2", canvas.toDataURL());
    progress++;
    if (err == "") {
      //   prog.text("Processing " + String(progress) + "%");
      //   window.setTimeout(fn, 0.0001);
      // fn();
    }
  }

  if (err == "") {
    //   prog.remove();
  }
  ctx.putImageData(image, 0, 0);
  // drawImage(t.ctx);
  console.log("data-url", canvas.toDataURL());
  // t.srcimg.src = canvas.toDataURL();
  // var outImg = $("<img>");
  // outImg[0].src = canvas[0].toDataURL();
  // t.container.append(outImg);

  // var fn = function () {
  //   if (n < w * h && err == "") {
  //     //////
  //     ///////////
  //   } else {
  //     if (err == "") {
  //       //   prog.remove();
  //     }
  //     ctx.putImageData(image, 0, 0);
  //     // drawImage(t.ctx);
  //     console.log("data-url", canvas.toDataURL());
  //     // t.srcimg.src = canvas.toDataURL();
  //     // var outImg = $("<img>");
  //     // outImg[0].src = canvas[0].toDataURL();
  //     // t.container.append(outImg);
  //   }
  // };
  // fn();
  // window.setTimeout(fn, 4);
};

const getImageStream = (blob) => {
  //   var t = this;
  var fr = new FileReader();
  let srcimg = new Image();
  return new Promise((resolve) => {
    console.log("Going");
    fr.onload = function (revt) {
      srcimg.src = revt.target.result;
      // t.process(canvas);
    };
    srcimg.onload = () => {
      resolve(srcimg);
    };
    fr.readAsDataURL(blob);
  });
};

const doPaint = (w, h, mask, avg, data) => {
  var t = this;
  var avgct = 1;
  for (var i = 0; i < w; i++) {
    for (var j = 0; j < h; j++) {
      var x = 4 * (i + j * w);
      if (null == mask[i][j]) {
        for (var k = 0; k < 4; k++) {
          avg[k] = (avg[k] * avgct + data[x + k]) / (avgct + 1);
        }
        avgct++;
      }
    }
  }
  for (var i = 0; i < w; i++) {
    for (var j = 0; j < h; j++) {
      if (null == mask[i][j]) {
        var n = 4 * (i + j * w);
        for (var k = 0; k < 4; k++) {
          data[n + k] = Math.floor(avg[k]);
        }
        mask[i][j] = 0;
      }
    }
  }
};

const doPoint = (w, h, data, _distance, avg, i, j) => {
  var x = 4 * (i + j * w);
  let mask = [];
  var p = [data[x++], data[x++], data[x++], data[x++]];
  if (_distance > distance(avg, p)) {
    mask[i][j] = null;
    if (i + 1 < w && mask[i + 1][j]) {
      doPoint(w, h, data, _distance, i + 1, j);
    }
    if (i - 1 > 0 && mask[i - 1][j]) {
      doPoint(w, h, data, _distance, i - 1, j);
    }
    if (j + 1 < h && mask[i][j + 1]) {
      doPoint(w, h, data, _distance, i, j + 1);
    }
    if (j - 1 > 0 && mask[i][j - 1]) {
      doPoint(w, h, data, _distance, i, j - 1);
    }
  }
  return;
};

const avgPt = (w, h, data, i, j, ct) => {
  let avg = [];
  if (i > 0 && j > 0 && i < w && j < h) {
    var x = 4 * (i + j * w);
    var p = [data[x++], data[x++], data[x++], data[x++]];
    for (var k = 0; k < 4; k++) {
      avg[k] = (avg[k] * ct + p[k]) / (ct + 1);
    }
  }
  return avg;
};

const distance = (a, b) => {
  var o = 0;
  for (i = 0; i < 4; i++) {
    o += (a[i] - b[i]) * (a[i] - b[i]);
  }
  return Math.sqrt(o);
};
