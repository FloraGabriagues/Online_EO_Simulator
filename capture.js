// ============================================================================
// Nysa : capture video du slider de comparaison.
//
// Necessite compare-mode.js (expose window._nysaCompare avec captureBtn,
// leftName, rightName, lockedSt) et window._nysa (truthCv, simCv, curW,
// curH, setWipe, st, PARAMS, PMAP).
//
// Charge apres compare-mode.js dans index.html.
//
// Principe :
//  - les images sont calculees une par une, hors temps reel, avec un trait
//    qui avance d'un pas regulier a 60 images par seconde ;
//  - chaque image recoit un horodatage exact (WebCodecs + muxer MP4) ;
//  - si WebCodecs n'est pas disponible, repli sur MediaRecorder en temps reel,
//    avec un trait pilote par l'horloge (et non par un compteur d'images) ;
//  - l'image du simulateur est reproduite sans aucun lissage : agrandissement
//    par un facteur ENTIER, chaque pixel simule devient un bloc net.
// ============================================================================
(function(){
"use strict";

// ---- reglages ----
var COL_DIVIDER = "#f5ac57";  // Nysa gold, ligne du curseur uniquement
var FPS         = 60;         // cadence de la video
var MAX_DIM     = 1000;       // cote maximal de la video (px)
var PAUSE_SEC   = 0.4;        // arret a chaque extremite
var BITRATE     = 12000000;   // debit eleve : on protege les pixels nets

// MP4 H.264 : LinkedIn n'accepte pas le WebM.
var MUXER_URL = "https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.js";

// ---- source des images de la demo ----
var IMG_SOURCE = "IGN, BD ORTHO® 2023, Etalab Open Licence 2.0";

// ---- i18n ----
if(typeof I18N !== "undefined"){
  I18N["cap.record"]     = {fr:"Enregistrer",        en:"Record"};
  I18N["cap.recording"]  = {fr:"Capture…",           en:"Capturing…"};
  I18N["cap.encoding"]   = {fr:"Encodage…",          en:"Encoding…"};
  I18N["cap.done"]       = {fr:"Termine !",           en:"Done!"};
  I18N["cap.speed"]      = {fr:"Duree",               en:"Duration"};
  I18N["cap.start"]      = {fr:"Lancer",              en:"Start"};
  I18N["cap.cancel"]     = {fr:"Annuler",             en:"Cancel"};
  I18N["cap.error"]      = {fr:"Echec de l'encodage", en:"Encoding failed"};
}

// ---- state ----
var ny   = null;
var cmp  = null;
var busy = false;

// ---- settings panel ----
var panel = document.createElement("div");
panel.className = "cap-panel";
panel.hidden = true;
panel.innerHTML =
  '<div class="cap-row">'+
    '<label class="cap-label">'+t("cap.speed")+'</label>'+
    '<select class="cap-sel" id="capSpeed">'+
      '<option value="2">2 s</option>'+
      '<option value="4" selected>4 s</option>'+
      '<option value="6">6 s</option>'+
    '</select>'+
  '</div>'+
  '<div class="cap-row cap-actions">'+
    '<button type="button" class="mode cap-cancel" id="capCancel">'+t("cap.cancel")+'</button>'+
    '<button type="button" class="mode cap-go" id="capGo">'+t("cap.start")+'</button>'+
  '</div>';

// ---- helpers ----

function getScaleInfo(){
  var lab = document.getElementById("scalebarLab");
  var bar = document.getElementById("scalebarBar");
  if(!lab || !bar) return null;
  var text = lab.textContent;
  var pct = parseFloat(bar.style.width);
  if(isNaN(pct) || pct <= 0) return null;
  return {text: text, pct: pct};
}

function findParam(pattern){
  if(!ny || !ny.PARAMS) return null;
  var pat = pattern.toLowerCase();
  for(var i=0; i<ny.PARAMS.length; i++){
    var p = ny.PARAMS[i];
    if(p.k.toLowerCase().indexOf(pat) >= 0) return p;
    if(p.name && p.name.toLowerCase().indexOf(pat) >= 0) return p;
  }
  return null;
}

function fmtParam(p, val){
  if(val == null) return "";
  var v = Number(val).toFixed(p.dec);
  return v + (p.unit ? " " + p.unit : "");
}

function getMetrics(state){
  var parts = [];
  var gsd = findParam("gsd");
  if(gsd) parts.push("GSD " + fmtParam(gsd, state[gsd.k]));
  var snr = findParam("snr");
  if(snr) parts.push("SNR " + fmtParam(snr, state[snr.k]));
  var mtf = findParam("mtf");
  if(mtf) parts.push("MTF " + fmtParam(mtf, state[mtf.k]));
  return parts.join(" · ");
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// sine ease-in-out: t in [0,1] -> [0,1]
function easeInOut(t){
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

// police des incrustations video
var CAP_FONT = "'IBM Plex Sans', system-ui, sans-serif";

// dessine une etiquette : pilule sombre + nom en blanc + metrics en dessous
// align: "left" ou "right" (bord de reference = x)
function drawLabel(ctx, x, y, name, metrics, fSize, mSize, align){
  var padL = 11, padV = 8, rad = 5;

  ctx.font = "500 " + fSize + "px " + CAP_FONT;
  var nameW = ctx.measureText(name).width;
  ctx.font = "500 " + mSize + "px " + CAP_FONT;
  var metW = metrics ? ctx.measureText(metrics).width : 0;

  var boxW = Math.max(nameW, metW) + padL * 2;
  var boxH = fSize + (metrics ? mSize + 5 : 0) + padV * 2;
  var boxX = (align === "right") ? x - boxW : x;

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  roundRect(ctx, boxX, y, boxW, boxH, rad);
  ctx.fill();

  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = "500 " + fSize + "px " + CAP_FONT;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(name, boxX + padL, y + padV);

  if(metrics){
    ctx.font = "500 " + mSize + "px " + CAP_FONT;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(metrics, boxX + padL, y + padV + fSize + 5);
  }
}

// ---- geometrie de la video (identique pour toutes les images) ----
// Facteur d'agrandissement ENTIER : un pixel simule = un bloc de sc x sc
// pixels video, tous de la meme taille. Aucune interpolation, aucune
// deformation. Si l'image est plus grande que MAX_DIM, elle reste a sa taille
// native (sc = 1), jamais reduite.
function getGeometry(){
  var w = ny.curW, h = ny.curH;
  var sc = Math.max(1, Math.floor(MAX_DIM / Math.max(w, h)));
  var imgW = w * sc, imgH = h * sc;
  // les encodeurs video veulent des dimensions paires
  var outW = imgW + (imgW % 2);
  var outH = imgH + (imgH % 2);
  return {sc: sc, imgW: imgW, imgH: imgH, outW: outW, outH: outH};
}

// canvas de travail reutilise d'une image a l'autre
var frameCv = null;

// ---- compose a single frame (dans frameCv) ----
function composeFrame(wipePct, geo, labels){
  var imgW = geo.imgW, imgH = geo.imgH;

  if(!frameCv) frameCv = document.createElement("canvas");
  if(frameCv.width !== geo.outW || frameCv.height !== geo.outH){
    frameCv.width = geo.outW;
    frameCv.height = geo.outH;
  }
  var ctx = frameCv.getContext("2d");

  ctx.fillStyle = "#0a0e13";
  ctx.fillRect(0, 0, geo.outW, geo.outH);
  ctx.imageSmoothingEnabled = false;

  // truth (full)
  ctx.drawImage(ny.truthCv, 0, 0, imgW, imgH);

  // sim (clipped right)
  var divX = Math.round(imgW * wipePct / 100);
  if(divX < imgW){
    ctx.save();
    ctx.beginPath();
    ctx.rect(divX, 0, imgW - divX, imgH);
    ctx.clip();
    ctx.drawImage(ny.simCv, 0, 0, imgW, imgH);
    ctx.restore();
  }

  // ---- divider line (yellow), bords nets sur la grille de pixels video ----
  ctx.fillStyle = COL_DIVIDER;
  ctx.fillRect(divX - 1, 0, 3, imgH);

  // small triangles, inside the image
  var tri = 5;
  ctx.beginPath();
  ctx.moveTo(divX - tri, 0);
  ctx.lineTo(divX + tri, 0);
  ctx.lineTo(divX, tri + 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(divX - tri, imgH);
  ctx.lineTo(divX + tri, imgH);
  ctx.lineTo(divX, imgH - tri - 2);
  ctx.closePath();
  ctx.fill();

  // ---- config labels (sober: white on dark pill) ----
  var fSize = Math.max(15, Math.round(imgH * 0.035));
  var mSize = Math.max(12, Math.round(imgH * 0.024));
  var edge = 14;

  drawLabel(ctx, edge, edge, cmp.leftName, labels.left, fSize, mSize, "left");
  drawLabel(ctx, imgW - edge, edge, cmp.rightName, labels.right, fSize, mSize, "right");

  // ---- scale bar (bottom-left, white on soft pill) ----
  var scaleInfo = getScaleInfo();
  if(scaleInfo){
    var sBarW = Math.round(imgW * scaleInfo.pct / 100);
    var sBarH = 3;
    var sSize = Math.max(10, Math.round(imgH * 0.020));

    var pillPad = 10;
    var pillW = Math.max(sBarW, 40) + pillPad * 2;
    var pillH = sSize + sBarH + 16;
    var pillX = edge;
    var pillY = imgH - edge - pillH;

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    roundRect(ctx, pillX, pillY, pillW, pillH, 5);
    ctx.fill();

    var sBarX = pillX + pillPad;
    var sBarY = pillY + pillH - 7;

    // texte centre au-dessus de la barre (taille inchangee)
    ctx.font = "500 " + sSize + "px " + CAP_FONT;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(scaleInfo.text, sBarX + sBarW / 2, sBarY - 3);

    // barre blanche
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sBarX, sBarY, sBarW, sBarH);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  // ---- credits (bottom-right, small white text, no pill) ----
  var cSize = Math.max(12, Math.round(imgH * 0.022));
  ctx.font = "500 " + cSize + "px " + CAP_FONT;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  var credit = IMG_SOURCE + " · nysa-imaging.com";
  // fine ombre pour rester lisible sur zone claire
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillText(credit, imgW - edge + 1, imgH - 10 + 1);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(credit, imgW - edge, imgH - 10);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  return frameCv;
}

// ---- position du trait en fonction du temps ----
// arret a 0, balayage 0 -> 100, arret a 100, balayage 100 -> 0.
// durationSec = duree des deux balayages ensemble (comme avant).
function totalSeconds(durationSec){
  return 2 * PAUSE_SEC + durationSec;
}

function getWipePct(tSec, durationSec){
  var sweep = durationSec / 2;
  var t = tSec;
  if(t < PAUSE_SEC) return 0;
  t -= PAUSE_SEC;
  if(t < sweep) return easeInOut(t / sweep) * 100;
  t -= sweep;
  if(t < PAUSE_SEC) return 100;
  t -= PAUSE_SEC;
  return (1 - easeInOut(Math.min(1, t / sweep))) * 100;
}

// libelles : fixes pendant toute la capture
function getLabels(){
  return {
    left:  getMetrics(cmp.lockedSt),
    right: getMetrics(ny.st)
  };
}

// ---- fin de capture ----
function finish(){
  busy = false;
  cmp.captureBtn.textContent = "🎬";
  ny.setWipe(50);
}

function fail(){
  cmp.captureBtn.textContent = t("cap.error");
  setTimeout(finish, 2000);
}

function downloadBlob(blob, filename){
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
}

function nextTick(){
  return new Promise(function(resolve){ setTimeout(resolve, 0); });
}

// ---- chargement du muxer MP4 (une seule fois) ----
function loadMuxer(cb){
  if(window.Mp4Muxer) return cb(true);
  var s = document.createElement("script");
  s.src = MUXER_URL;
  s.onload  = function(){ cb(!!window.Mp4Muxer); };
  s.onerror = function(){ cb(false); };
  document.head.appendChild(s);
}

// ---- choix d'un codec H.264 accepte par le navigateur ----
// Niveaux 4.2 puis 4.0 : necessaires pour ~1000 x 700 a 60 images par seconde.
var AVC_CODECS = ["avc1.64002a", "avc1.4d002a", "avc1.640028", "avc1.4d0028"];

async function pickAvcConfig(width, height){
  for(var i = 0; i < AVC_CODECS.length; i++){
    var cfg = {
      codec: AVC_CODECS[i],
      width: width,
      height: height,
      bitrate: BITRATE,
      framerate: FPS,
      avc: {format: "avc"}
    };
    try{
      var res = await VideoEncoder.isConfigSupported(cfg);
      if(res && res.supported) return cfg;
    }catch(e){}
  }
  return null;
}

// ============================================================================
// Voie 1 : WebCodecs + MP4. Hors temps reel, horodatages exacts.
// ============================================================================
async function captureExact(durationSec){
  var btn = cmp.captureBtn;
  var geo = getGeometry();
  var cfg = await pickAvcConfig(geo.outW, geo.outH);
  if(!cfg) return false;                      // -> repli temps reel

  var muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: {codec: "avc", width: geo.outW, height: geo.outH},
    fastStart: "in-memory"
  });

  var encError = null;
  var encoder = new VideoEncoder({
    output: function(chunk, meta){ muxer.addVideoChunk(chunk, meta); },
    error:  function(e){ encError = e; }
  });
  encoder.configure(cfg);

  var labels = getLabels();
  var total  = Math.round(totalSeconds(durationSec) * FPS);
  var tTotal = totalSeconds(durationSec);

  for(var f = 0; f < total; f++){
    if(encError) throw encError;

    // temps de l'image f : la derniere image tombe exactement sur la fin
    var tSec = tTotal * f / (total - 1);
    var pct  = Math.max(0, Math.min(100, getWipePct(tSec, durationSec)));

    var cv = composeFrame(pct, geo, labels);
    var frame = new VideoFrame(cv, {
      timestamp: Math.round(f * 1000000 / FPS),
      duration:  Math.round(1000000 / FPS)
    });
    encoder.encode(frame, {keyFrame: f % FPS === 0});
    frame.close();

    // ne pas laisser la file de l'encodeur grossir sans limite
    while(encoder.encodeQueueSize > 6){
      await nextTick();
    }

    // affichage du slider et du pourcentage : de temps en temps seulement
    if(f % 4 === 0){
      ny.setWipe(pct);
      btn.textContent = t("cap.recording") + " " + Math.round(f / total * 100) + "%";
      await nextTick();
    }
  }

  btn.textContent = t("cap.encoding") + " 100%";
  await encoder.flush();
  if(encError) throw encError;
  encoder.close();
  muxer.finalize();

  var blob = new Blob([muxer.target.buffer], {type: "video/mp4"});
  downloadBlob(blob, "nysa-compare.mp4");
  return true;
}

// ============================================================================
// Voie 2 (repli) : MediaRecorder en temps reel.
// Le trait est pilote par l'horloge : meme si le navigateur saute une image,
// le trait est a la bonne position au bon moment.
// ============================================================================
function captureRealtime(durationSec){
  var btn = cmp.captureBtn;
  var geo = getGeometry();

  // MP4 en priorite (LinkedIn n'accepte pas le WebM) : plusieurs variantes
  // de codec, car les navigateurs sont pointilleux sur la chaine exacte.
  var tryTypes = [
    ["video/mp4;codecs=avc1.64002a", "mp4"],
    ["video/mp4;codecs=avc1.4D401E", "mp4"],
    ["video/mp4;codecs=avc1",        "mp4"],
    ["video/mp4;codecs=h264",        "mp4"],
    ["video/mp4",                    "mp4"],
    ["video/webm;codecs=vp9",        "webm"],
    ["video/webm",                   "webm"]
  ];
  var mimeType = "", ext = "webm";
  if(typeof MediaRecorder !== "undefined"){
    for(var i = 0; i < tryTypes.length; i++){
      if(MediaRecorder.isTypeSupported(tryTypes[i][0])){
        mimeType = tryTypes[i][0];
        ext = tryTypes[i][1];
        break;
      }
    }
  }
  if(!mimeType){ fail(); return; }

  var labels = getLabels();
  var tTotal = totalSeconds(durationSec);

  // canvas d'encodage distinct du canvas de travail
  var cv = document.createElement("canvas");
  cv.width = geo.outW; cv.height = geo.outH;
  var ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(composeFrame(0, geo, labels), 0, 0);

  var stream = cv.captureStream(0);           // une image = un requestFrame()
  var track  = stream.getVideoTracks()[0];

  var chunks = [];
  var rec = new MediaRecorder(stream, {mimeType: mimeType, videoBitsPerSecond: BITRATE});
  rec.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = function(){
    downloadBlob(new Blob(chunks, {type: mimeType}), "nysa-compare." + ext);
    finish();
  };
  rec.onerror = fail;
  rec.start();

  var t0 = null;
  function step(now){
    if(t0 === null) t0 = now;
    var tSec = (now - t0) / 1000;
    var last = tSec >= tTotal;
    if(last) tSec = tTotal;

    var pct = Math.max(0, Math.min(100, getWipePct(tSec, durationSec)));
    ctx.drawImage(composeFrame(pct, geo, labels), 0, 0);
    if(track.requestFrame) track.requestFrame();

    ny.setWipe(pct);
    btn.textContent = t("cap.recording") + " " + Math.round(Math.min(1, tSec / tTotal) * 100) + "%";

    if(last){
      setTimeout(function(){ rec.stop(); }, 250);
      return;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---- point d'entree ----
function captureSequence(durationSec){
  if(busy) return;
  busy = true;
  panel.hidden = true;

  var btn = cmp.captureBtn;
  btn.textContent = t("cap.recording") + " 0%";

  var canExact = (typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined");

  function realtime(){ captureRealtime(durationSec); }

  if(!canExact){ realtime(); return; }

  loadMuxer(function(ok){
    if(!ok){ realtime(); return; }
    captureExact(durationSec).then(function(done){
      if(done) finish(); else realtime();
    }).catch(function(e){
      console.error("[nysa-capture]", e);
      fail();
    });
  });
}

// ---- init ----
function init(){
  ny  = window._nysa;
  cmp = window._nysaCompare;
  if(!ny || !cmp){
    setTimeout(init, 200);
    return;
  }

  var btn = cmp.captureBtn;
  btn.dataset.ready = "true";
  btn.title = t("cap.record");

  var tableWrap = cmp.tableWrap;
  if(tableWrap && tableWrap.parentNode){
    tableWrap.parentNode.insertBefore(panel, tableWrap.nextSibling);
  }

  btn.addEventListener("click", function(e){
    if(busy) return;
    panel.hidden = !panel.hidden;
  });

  panel.querySelector("#capCancel").addEventListener("click", function(){
    panel.hidden = true;
  });

  panel.querySelector("#capGo").addEventListener("click", function(){
    var speed = parseInt(panel.querySelector("#capSpeed").value);
    captureSequence(speed);
  });
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

})();
