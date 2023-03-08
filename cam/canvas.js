const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const image = new Image();
image.src = "example.jpg";

image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  // Do some image processing
  ctx.putImageData(imageData, 0, 0);
};
