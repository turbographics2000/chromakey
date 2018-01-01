var WIDTH = 320;
var HEIGHT = 180;
var videoA = document.createElement('video');
var videoACanvas = document.createElement('canvas');
var videoAContext = videoACanvas.getContext('2d');
//var videoAURL = 'https://www.iandevlin.com/html5test/webvtt/v/upc-tobymanley.theora.ogg';
var videoAURL = 'mov_bbb.mp4';
var videoB = document.createElement('video');
var videoBCanvas = document.createElement('canvas'); 
var videoBContext = videoBCanvas.getContext('2d');
var videoBURL = 'sintel.mp4';

var chromakeyCanvas = document.createElement('canvas');
var chromakeyContext = chromakeyCanvas.getContext('2d');
chromakeyCanvas.width = WIDTH;
chromakeyCanvas.height = HEIGHT;
document.body.appendChild(chromakeyCanvas);

var chromaKeyColor = {r:0xe9,  g:0xe9, b:0xe9};
var colorDistance = 30;

distance.oninput = evt => colorDistance = distance.value;

function prepareVideo(video, canvas, context, videoURL) {
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.loop = true;
    document.body.appendChild(video);
    return new Promise((resolve, reject) => {
        video.onloadedmetadata = evt => {
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            video.play();
            resolve();
        };
        video.src = videoURL;
    });
}

function getColorDistance(rgb1, rgb2) {
    // 三次元空間の距離が返る
    return Math.sqrt(
        Math.pow((rgb1.r - rgb2.r), 2) +
        Math.pow((rgb1.g - rgb2.g), 2) +
        Math.pow((rgb1.b - rgb2.b), 2)
    );
};

function chromaKey() {
    var imageData = videoBContext.getImageData(0, 0, WIDTH, HEIGHT);
    var data = imageData.data;

    // dataはUint8ClampedArray
    // 長さはcanvasの width * height * 4(r,g,b,a)
    // 先頭から、一番左上のピクセルのr,g,b,aの値が順に入っており、
    // 右隣のピクセルのr,g,b,aの値が続く
    // n から n+4 までが1つのピクセルの情報となる
    for (var i = 0, l = data.length; i < l; i += 4) {
        var target = {
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
        };
        // chromaKeyColorと現在のピクセルの三次元空間上の距離を閾値と比較する
        // 閾値より小さい（色が近い）場合、そのピクセルを消す
        if (getColorDistance(chromaKeyColor, target) < colorDistance) {
            // alpha値を0にすることで見えなくする
            data[i + 3] = 0; 
        }
    }
    // 書き換えたdataをimageDataにもどし、描画する
    imageData.data = data;
    videoBContext.putImageData(imageData, 0, 0);
};

function blendDraw() {
    videoAContext.drawImage(videoA, 0, 0, WIDTH, HEIGHT);
    videoBContext.drawImage(videoB, 0, 0, WIDTH, HEIGHT);
    chromaKey();

    chromakeyContext.drawImage(videoACanvas, 0, 0,  WIDTH, HEIGHT);
    chromakeyContext.drawImage(videoBCanvas, 0, 0,  WIDTH, HEIGHT);
    requestAnimationFrame(blendDraw);
}

prepareVideo(videoA, videoACanvas, videoAContext, videoAURL).then(_ => {
    return prepareVideo(videoB, videoBCanvas, videoBContext, videoBURL);
}).then(blendDraw);
