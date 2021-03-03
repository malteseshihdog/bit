//function updateArbitrage(data) {
//    document.getElementById('arbitrage').innerHTML = data;
//}
//var host = window.location.protocol + "//" + window.location.host + ':8443';
//console.log(host);
//var socket = io.connect(host);
//socket.on('connect', function (data) {
//    console.log(data);
//    socket.emit('arbitrage', 'index');
//
//    socket.on('arbitrage', updateArbitrage);
//});


var headerCanvas = null;
var headerCanvasContext = null;
var headerCanvasAnimateInterval = null;
var nodes = [];
var cryptoIcons = [
    '$pac.png',
    '0xbtc.png',
    '2give.png',
    'abt.png',
    'act.png',
    'actn.png',
    'ada.png',
    'add.png',
    'adx.png',
    'ae.png',
    'aeon.png',
    'aeur.png',
    'agi.png',
    'agrs.png',
    'aion.png',
    'algo.png',
    'amb.png',
    'amp.png',
    'ampl.png',
    'ant.png',
    'apex.png',
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
    'audr.png',
    'auto.png',
    'aywa.png',
    'bab.png',
    'bal.png',
    'band.png',
    'bat.png',
    'bay.png',
    'bcbc.png',
    'bcc.png',
    'bcd.png',
    'bch.png',
    'bcio.png',
    'bcn.png',
    'bco.png',
    'bcpt.png',
    'bdl.png',
    'beam.png',
    'bela.png',
    'bix.png',
    'blcn.png',
    'blk.png',
    'block.png',
    'blz.png',
    'bnb.png',
    'bnt.png',
    'bnty.png',
    'booty.png',
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
    'btg.png',
    'btm.png',
    'bts.png',
    'btt.png',
    'btx.png',
    'burst.png',
    'bze.png',
    'call.png',
    'cc.png',
    'cdn.png',
    'cdt.png',
    'cenz.png',
    'chain.png',
    'chat.png',
    'chips.png',
    'cix.png',
    'clam.png',
    'cloak.png',
    'cmm.png',
    'cmt.png',
    'cnd.png',
    'cnx.png',
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
    'd.png',
    'dai.png',
    'dash.png',
    'dat.png',
    'data.png',
    'dbc.png',
    'dcn.png',
    'dcr.png',
    'deez.png',
    'dent.png',
    'dew.png',
    'dgb.png',
    'dgd.png',
    'dlt.png',
    'dnt.png',
    'dock.png',
    'doge.png',
    'dot.png',
    'drgn.png',
    'drop.png',
    'dta.png',
    'dth.png',
    'dtr.png',
    'ebst.png',
    'eca.png',
    'edg.png',
    'edo.png',
    'edoge.png',
    'ela.png',
    'elec.png',
    'elf.png',
    'elix.png',
    'ella.png',
    'emc.png',
    'emc2.png',
    'eng.png',
    'enj.png',
    'entrp.png',
    'eon.png',
    'eop.png',
    'eos.png',
    'eqli.png',
    'equa.png',
    'etc.png',
    'eth.png',
    'ethos.png',
    'etn.png',
    'etp.png',
    'eur.png',
    'evx.png',
    'exmo.png',
    'exp.png',
    'fair.png',
    'fct.png',
    'fil.png',
    'fjc.png',
    'fldc.png',
    'flo.png',
    'fsn.png',
    'ftc.png',
    'fuel.png',
    'fun.png',
    'game.png',
    'gas.png',
    'gbp.png',
    'gbx.png',
    'gbyte.png',
    'generic.png',
    'gin.png',
    'glxt.png',
    'gmr.png',
    'gno.png',
    'gnt.png',
    'gold.png',
    'grc.png',
    'grin.png',
    'grs.png',
    'gsc.png',
    'gto.png',
    'gup.png',
    'gusd.png',
    'gvt.png',
    'gxs.png',
    'gzr.png',
    'hight.png',
    'hodl.png',
    'hot.png',
    'hpb.png',
    'hsr.png',
    'ht.png',
    'html.png',
    'huc.png',
    'hush.png',
    'icn.png',
    'icx.png',
    'ignis.png',
    'ilk.png',
    'ink.png',
    'ins.png',
    'ion.png',
    'iop.png',
    'iost.png',
    'iotx.png',
    'iq.png',
    'itc.png',
    'jnt.png',
    'jpy.png',
    'kcs.png',
    'kin.png',
    'klown.png',
    'kmd.png',
    'knc.png',
    'krb.png',
    'lbc.png',
    'lend.png',
    'leo.png',
    'link.png',
    'lkk.png',
    'loom.png',
    'lpt.png',
    'lrc.png',
    'lsk.png',
    'ltc.png',
    'lun.png',
    'maid.png',
    'mana.png',
    'matic.png',
    'mcap.png',
    'mco.png',
    'mda.png',
    'mds.png',
    'med.png',
    'meetone.png',
    'mft.png',
    'miota.png',
    'mith.png',
    'mkr.png',
    'mln.png',
    'mnx.png',
    'mnz.png',
    'moac.png',
    'mod.png',
    'mona.png',
    'msr.png',
    'mth.png',
    'mtl.png',
    'music.png',
    'mzc.png',
    'nano.png',
    'nas.png',
    'nav.png',
    'ncash.png',
    'ndz.png',
    'nebl.png',
    'neo.png',
    'neos.png',
    'neu.png',
    'nexo.png',
    'ngc.png',
    'nio.png',
    'nlc2.png',
    'nlg.png',
    'nmc.png',
    'nmr.png',
    'npxs.png',
    'nuls.png',
    'nxs.png',
    'nxt.png',
    'oax.png',
    'ok.png',
    'omg.png',
    'omni.png',
    'ong.png',
    'ont.png',
    'oot.png',
    'ost.png',
    'ox.png',
    'oxt.png',
    'part.png',
    'pasc.png',
    'pasl.png',
    'pax.png',
    'pay.png',
    'payx.png',
    'pink.png',
    'pirl.png',
    'pivx.png',
    'plr.png',
    'poa.png',
    'poe.png',
    'polis.png',
    'poly.png',
    'pot.png',
    'powr.png',
    'ppc.png',
    'ppp.png',
    'ppt.png',
    'pre.png',
    'prl.png',
    'pungo.png',
    'pura.png',
    'qash.png',
    'qiwi.png',
    'qlc.png',
    'qrl.png',
    'qsp.png',
    'qtum.png',
    'r.png',
    'rads.png',
    'rap.png',
    'rcn.png',
    'rdd.png',
    'rdn.png',
    'ren.png',
    'rep.png',
    'repv2.png',
    'req.png',
    'rhoc.png',
    'ric.png',
    'rise.png',
    'rlc.png',
    'rpx.png',
    'rub.png',
    'rvn.png',
    'ryo.png',
    'safe.png',
    'sai.png',
    'salt.png',
    'san.png',
    'sbd.png',
    'sberbank.png',
    'sc.png',
    'shift.png',
    'sib.png',
    'sin.png',
    'sky.png',
    'slr.png',
    'sls.png',
    'smart.png',
    'sngls.png',
    'snm.png',
    'snt.png',
    'soc.png',
    'spank.png',
    'sphtx.png',
    'srn.png',
    'stak.png',
    'start.png',
    'steem.png',
    'storj.png',
    'storm.png',
    'stq.png',
    'strat.png',
    'stx.png',
    'sub.png',
    'sumo.png',
    'sys.png',
    'taas.png',
    'tau.png',
    'tbx.png',
    'tel.png',
    'ten.png',
    'tern.png',
    'tgch.png',
    'theta.png',
    'tix.png',
    'tkn.png',
    'tks.png',
    'tnb.png',
    'tnc.png',
    'tnt.png',
    'tomo.png',
    'tpay.png',
    'trig.png',
    'trtl.png',
    'trx.png',
    'tusd.png',
    'tzc.png',
    'ubq.png',
    'uma.png',
    'uni.png',
    'unity.png',
    'usd.png',
    'usdc.png',
    'usdt.png',
    'utk.png',
    'veri.png',
    'vet.png',
    'via.png',
    'vib.png',
    'vibe.png',
    'vivo.png',
    'vrc.png',
    'vrsc.png',
    'vtc.png',
    'vtho.png',
    'wabi.png',
    'wan.png',
    'waves.png',
    'wax.png',
    'wbtc.png',
    'wgr.png',
    'wicc.png',
    'wings.png',
    'wpr.png',
    'wtc.png',
    'x.png',
    'xas.png',
    'xbc.png',
    'xbp.png',
    'xby.png',
    'xcp.png',
    'xdn.png',
    'xem.png',
    'xin.png',
    'xlm.png',
    'xmcc.png',
    'xmg.png',
    'xmo.png',
    'xmr.png',
    'xmy.png',
    'xp.png',
    'xpa.png',
    'xpm.png',
    'xrp.png',
    'xsg.png',
    'xtz.png',
    'xuc.png',
    'xvc.png',
    'xvg.png',
    'xzc.png',
    'yfi.png',
    'yoyow.png',
    'zcl.png',
    'zec.png',
    'zel.png',
    'zen.png',
    'zest.png',
    'zil.png',
    'zilla.png',
    'zrx.png'
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
    headerCanvas = document.getElementById('headerCanvas');
    headerCanvasContext = headerCanvas.getContext('2d');
    var w = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

    var h = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

    headerCanvas.width = w;
    headerCanvas.height = h;
}

var Node = function (x, y, vx, vy, icon, size, color) {
    this.x = x || 0;
    this.y = y || 0;
    this.vx = vx || 0;
    this.vy = vy || 0;
    this.icon = icon || null;
    this.size = size || 10;
    this.color = color || 'rgba(97, 252, 161, 0.2)';
    return this;
};

Node.prototype.draw = function () {
    headerCanvasContext.drawImage(cryptoIconImages[this.icon], this.x-(this.size/2), this.y-(this.size/2), this.size, this.size);
};

Node.prototype.drawLine = function () {
    var nearNodes = this.near();
    for (var i in nearNodes) {
        headerCanvasContext.beginPath();
        headerCanvasContext.moveTo(this.x, this.y);
        headerCanvasContext.lineTo(nearNodes[i].x, nearNodes[i].y);
        headerCanvasContext.strokeStyle = this.color;
        headerCanvasContext.stroke();
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
    headerCanvasContext = headerCanvas.getContext('2d');
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

    for (var i = 0; i <= w / 20; i++) {
        var node = new Node(Math.random() * w, Math.random() * h, (Math.random() * 2) - 1, (Math.random() * 2) - 1, parseInt(Math.random()*cryptoIcons.length), (Math.random() * 5) + 5, Math.random()*2>1 ? 'rgba(97, 252, 161, 0.2)' : 'rgba(252, 97, 161, 0.2)');
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

    headerCanvasContext.clearRect(0, 0, w, h);
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
    clearInterval(headerCanvasAnimateInterval);
    headerCanvasAnimateInterval = setInterval(function () {
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