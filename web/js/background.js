var backgroundCanvas = null;
var backgroundCanvasContext = null;
var backgroundCanvasAnimateInterval = null;
var nodes = [];
var cryptoIcons = [
    'abt.png',
    'act.png',
    'actn.png',
    'aeur.png',
    'agi.png',
    'agrs.png',
    'aion.png',
    'algo.png',
    'appc.png',
    'ardr.png',
    'arg.png',
    'ark.png',
    'arn.png',
    'arnx.png',
    'ary.png',
    'ast.png',
    'atm.png',
    'atom.png',
    'bay.png',
    'bcbc.png',
    'bcc.png',
    'bos.png',
    'bpt.png',
    'bq.png',
    'brd.png',
    'bsd.png',
    'bsv.png',
    'btc.png',
    'btcd.png',
    'btch.png',
    'btcp.png',
    'btcz.png',
    'btdx.png',
    'call.png',
    'cdn.png',
    'cdt.png',
    'cenz.png',
    'cny.png',
    'cob.png',
    'colx.png',
    'comp.png',
    'coqui.png',
    'cred.png',
    'crpt.png',
    'crw.png',
    'cs.png',
    'ctr.png',
    'ctxc.png',
    'cvc.png',
    'dai.png',
    'dash.png'
];

var cryptoIconImages = [];
function loadCryptoIcons() {
    for(var i in cryptoIcons) {
        var image = new Image(32,32);
        image.src = '/img/crypto-icons/' + cryptoIcons[i];
        cryptoIconImages.push(image);
    }
}

function registerBackground() {
    backgroundCanvas = document.getElementById('headerCanvas');
    backgroundCanvasContext = backgroundCanvas.getContext('2d');
    var w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    var h = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

    backgroundCanvas.width = w;
    backgroundCanvas.height = h;
}

var Node = function (x, y, vx, vy, icon, size, color) {
    this.x = x || 0;
    this.y = y || 0;
    this.vx = vx || 0;
    this.vy = vy || 0;
    this.icon = icon;
    this.size = size || 10;
    this.color = color || 'rgba(97, 252, 161, 0.2)';
    return this;
};

Node.prototype.draw = function () {
    if(cryptoIconImages.length === cryptoIcons.length) {
        backgroundCanvasContext.drawImage(cryptoIconImages[this.icon], this.x-(this.size/2), this.y-(this.size/2), this.size, this.size);
    }
};

Node.prototype.drawLine = function () {
    var nearNodes = this.near();
    for (var i in nearNodes) {
        backgroundCanvasContext.beginPath();
        backgroundCanvasContext.moveTo(this.x, this.y);
        backgroundCanvasContext.lineTo(nearNodes[i].x, nearNodes[i].y);
        backgroundCanvasContext.strokeStyle = this.color;
        backgroundCanvasContext.stroke();
    }
};

Node.prototype.near = function () {
    var nearNodes = [];
    for (var i in nodes) {
        if ((nodes[i].x >= this.x - 75 && nodes[i].x <= this.x + 75) && (nodes[i].y >= this.y - 75 && nodes[i].y <= this.y + 75)) {
            nearNodes.push(nodes[i]);
        }
    }
    return nearNodes;
};

Node.prototype.animate = function () {
    backgroundCanvasContext = backgroundCanvas.getContext('2d');
    var w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    var h = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x > w) {
        this.x = 0;
    }
    if (this.x < 0) {
        this.x = w;
    }
    if (this.y > h) {
        this.y = 0;
    }
    if (this.y < 0) {
        this.y = h;
    }
};

var createNodes = function () {
    nodes = [];
    var w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    var h = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

    for (var i = 0; i < cryptoIcons.length; i++) {
        var node = new Node(Math.random() * w, Math.random() * h, (Math.random() * 2) - 1, (Math.random() * 2) - 1, i, (Math.random() * 5) + 5, Math.random()*2>1 ? 'rgba(97, 252, 161, 0.2)' : 'rgba(252, 97, 161, 0.2)');
        nodes.push(node);
    }
};

var drawNodes = function () {
    var w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    var h = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

    backgroundCanvasContext.clearRect(0, 0, w, h);
    for (var i in nodes) {
        nodes[i].drawLine();
    }
    for (var i in nodes) {
        nodes[i].draw();
    }
};

var animateNodes = function () {
    for (var i in nodes) {
        nodes[i].animate();
    }
};

var animateBackground = function () {
    clearInterval(backgroundCanvasAnimateInterval);
    backgroundCanvasAnimateInterval = setInterval(function () {
        if(cryptoIconImages.length === cryptoIcons.length) {
            animateNodes();
            drawNodes();
        }
    }, 1000 / 15);
};


loadCryptoIcons();
window.addEventListener('load', registerBackground);
window.addEventListener('load', createNodes);
window.addEventListener('load', animateBackground);
window.addEventListener('resize', createNodes);
window.addEventListener('resize', animateBackground);