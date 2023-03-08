function Toon(dataUrl, canvas) {
  var _t = this;
  _t.srcimg = null; // new Image();
  //   _t.image = imageArray;
  //   _t.ctx = context;
  _t.handleTransform(dataUrl, canvas);
  //   _t.draw(c);
}

Toon.prototype = {
  handleTransform: async function (dataUrl, canvas) {
    var t = this;
    t.srcimg = await this.getImageStream(dataUrl);
    // console.log("image-object", t.srcimg);
    t.process(canvas);
    // var fr = new FileReader();
    // console.log("Going");
    // fr.onload = function (revt) {
    //   t.srcimg.src = revt.target.result;
    //   t.process(canvas);
    // };
    // fr.readAsDataURL(dataUrl);
  },

  getImageStream: function (dataUrl) {
    var t = this;
    var fr = new FileReader();
    t.srcimg = new Image();
    return new Promise((resolve) => {
      console.log("Going");
      fr.onload = function (revt) {
        t.srcimg.src = revt.target.result;
        // t.process(canvas);
      };
      t.srcimg.onload = () => {
        resolve(t.srcimg);
      };
      fr.readAsDataURL(dataUrl);
    });
  },

  process: function (canvas) {
    var t = this;
    // var canvas = $("<canvas>");
    var w = (canvas.width = SIZE);
    var h = (canvas.height = SIZE);
    // var prog = $("<span>").text("Processing...");
    // t.container.append(prog);

    t.ctx = canvas.getContext("2d");
    t.ctx.drawImage(t.srcimg, 0, 0);
    t.image = t.ctx.getImageData(0, 0, w, h); //array [4*w*h] of colors RGBA
    // console.log("w,h,image", w, h, t.image);
    t.ctx.clearRect(0, 0, w, h);
    t.mask = Array(w);
    var zz = Array();
    for (var i = 0; i < w * h; i++) {
      zz[i] = i;
    }
    for (var i = 0; i < w; i++) {
      t.mask[i] = Array(h);
      for (var j = 0; j < h; j++) {
        t.mask[i][j] = true;
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
    var fn = function () {
      if (n < w * h && err == "") {
        var q = Math.floor(step);
        while (q > 0 && n < w * h && err == "") {
          var x = zz[n];
          var j = Math.floor(x / w);
          var i = x % w;

          if (t.mask[i][j]) {
            var y = x * 4;
            var avgct = 0;
            t.avg = [
              t.image.data[y++],
              t.image.data[y++],
              t.image.data[y++],
              t.image.data[y++],
            ];
            try {
              t.doPoint(i, j); // do all the points next to it too...
              t.doPaint();
            } catch (e) {
              if (!e.message == "Maximum call stack size exceeded") {
                err = e.message;
                // prog.text(e.message);
              } else {
                t.doPaint();
              } // ignore call stack (we'll try
            }
          }
          n++;
          q--;
        }
        progress++;
        if (err == "") {
          //   prog.text("Processing " + String(progress) + "%");
          //   window.setTimeout(fn, 0.0001);
          fn();
        }
      } else {
        if (err == "") {
          //   prog.remove();
        }
        t.ctx.putImageData(t.image, 0, 0);
        // drawImage(t.ctx);
        console.log("data-url", canvas.toDataURL());
        // t.srcimg.src = canvas.toDataURL();
        // var outImg = $("<img>");
        // outImg[0].src = canvas[0].toDataURL();
        // t.container.append(outImg);
      }
    };
    fn();
    // window.setTimeout(fn, 4);
  },
  doPaint: function () {
    var t = this;
    var w = t.srcimg.width;
    var h = t.srcimg.height;
    var avgct = 1;
    for (var i = 0; i < w; i++) {
      for (var j = 0; j < h; j++) {
        var x = 4 * (i + j * w);
        if (null == t.mask[i][j]) {
          for (var k = 0; k < 4; k++) {
            t.avg[k] = (t.avg[k] * avgct + t.image.data[x + k]) / (avgct + 1);
          }
          avgct++;
        }
      }
    }
    for (var i = 0; i < w; i++) {
      for (var j = 0; j < h; j++) {
        if (null == t.mask[i][j]) {
          var n = 4 * (i + j * w);
          for (var k = 0; k < 4; k++) {
            t.image.data[n + k] = Math.floor(t.avg[k]);
          }
          t.mask[i][j] = 0;
        }
      }
    }
  },

  doPoint: function (i, j) {
    var t = this;
    var w = t.srcimg.width;
    var h = t.srcimg.height;
    var x = 4 * (i + j * w);
    var p = [
      t.image.data[x++],
      t.image.data[x++],
      t.image.data[x++],
      t.image.data[x++],
    ];
    if (t.distance > distance(t.avg, p)) {
      t.mask[i][j] = null;
      if (i + 1 < w && t.mask[i + 1][j]) {
        t.doPoint(i + 1, j);
      }
      if (i - 1 > 0 && t.mask[i - 1][j]) {
        t.doPoint(i - 1, j);
      }
      if (j + 1 < h && t.mask[i][j + 1]) {
        t.doPoint(i, j + 1);
      }
      if (j - 1 > 0 && t.mask[i][j - 1]) {
        t.doPoint(i, j - 1);
      }
    }
    return;
  },
  avgPt: function (i, j, ct) {
    var t = this;
    var w = t.srcimg.width;
    var h = t.srcimg.height;
    if (i > 0 && j > 0 && i < w && j < h) {
      var x = 4 * (i + j * w);
      var p = [
        t.image.data[x++],
        t.image.data[x++],
        t.image.data[x++],
        t.image.data[x++],
      ];
      for (var k = 0; k < 4; k++) {
        t.avg[k] = (t.avg[k] * ct + p[k]) / (ct + 1);
      }
    }
  },
  avgct: 0,
  ctx: 0,
  mask: 0,
  image: 0,
  avg: 0,
  srcimg: 0,
  cnv: 0,
  distance: 35,
  container: 0, // container
}; // proto

function distance(a, b) {
  var o = 0;
  for (i = 0; i < 4; i++) {
    o += (a[i] - b[i]) * (a[i] - b[i]);
  }
  return Math.sqrt(o);
}
