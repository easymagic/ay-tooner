# ay-tooner

To use this product two things are required:

1. You need to run app.py , which is a flask app running on a socket
2. You also need to open the `cam/index.html` which is the client where web camera app is located
3. You can change the `host` to `localhost` from `cam.js` depending on your machine the snippet is
   given below:

```
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
  return fetch("http://127.0.0.1:5000/cartoon-convertv2", requestOptions)
    .then((response) => response.text())
    .catch((error) => console.log("error", error));
}
```
