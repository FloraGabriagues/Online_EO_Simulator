// ============================================================================
// Nysa : mode comparaison (deux configurations cote a cote).
//
// Necessite que index.html expose window._nysa (voir instructions d'integration)
// et appelle window._nysaPaintLeft / window._nysaAfterRefresh depuis refresh().
//
// Charge apres index.html et i18n.js.
// ============================================================================
(function(){
"use strict";

// ---- i18n ----
if(typeof I18N !== "undefined"){
  I18N["cmp.lock"]         = {fr:"Comparer",               en:"Compare"};
  I18N["cmp.unlock"]       = {fr:"Quitter la comparaison", en:"Exit comparison"};
  I18N["cmp.param"]        = {fr:"Parametre",              en:"Parameter"};
  I18N["cmp.default_left"] = {fr:"Config A",               en:"Config A"};
  I18N["cmp.default_right"]= {fr:"Config B",               en:"Config B"};
  I18N["cmp.rename.ph"]    = {fr:"Nom de la configuration", en:"Configuration name"};
  I18N["cmp.capture"]      = {fr:"Enregistrer une video",   en:"Record a video"};
  I18N["cmp.capture.soon"] = {fr:"Bientot disponible",      en:"Coming soon"};
}

// ---- state ----
var active   = false;
var lockedCv = document.createElement("canvas");
var lockedCtx= lockedCv.getContext("2d");
var lockedSt = null;   // copie du state au moment du verrouillage
var leftName  = t("cmp.default_left");
var rightName = t("cmp.default_right");
var hiddenKeys = {};   // {k: true} pour les lignes retirées (-)

// ---- references DOM (remplies dans init) ----
var chipLeft, chipRight, viewfoot, viewer, scenebar, ny;

// ---- utilitaires ----
function fmtVal(p, v){
  if(v == null) return "-";
  return Number(v).toFixed(p.dec) + " " + p.unit;
}

// ---- UI : bouton Lock ----
var lockBtn = document.createElement("button");
lockBtn.type = "button";
lockBtn.className = "mode cmp-lockbtn";
lockBtn.dataset.active = "false";

function updateBtnText(){
  lockBtn.textContent = active ? t("cmp.unlock") : t("cmp.lock");
  lockBtn.dataset.active = active ? "true" : "false";
}

// ---- UI : bouton Capture (placeholder) ----
var captureBtn = document.createElement("button");
captureBtn.type = "button";
captureBtn.className = "mode cmp-capturebtn";
captureBtn.textContent = "🎬"; // 🎬
captureBtn.title = t("cmp.capture.soon");
captureBtn.dataset.ready = "false";

// ---- UI : conteneur du tableau ----
var tableWrap = document.createElement("div");
tableWrap.className = "cmp-table-wrap";
tableWrap.hidden = true;

// ============ lock / unlock ============
function lock(){
  if(!ny) return;
  var simCv = ny.simCv;

  // copie du canvas simule
  lockedCv.width  = simCv.width;
  lockedCv.height = simCv.height;
  lockedCtx.drawImage(simCv, 0, 0);

  // copie de l'etat courant
  lockedSt = {};
  ny.PARAMS.forEach(function(p){ lockedSt[p.k] = ny.st[p.k]; });

  active = true;
  updateBtnText();

  // chips editables des deux cotes
  updateChip(chipLeft, leftName);
  chipLeft.classList.add("cmp-editable");
  updateChip(chipRight, rightName);
  chipRight.classList.add("cmp-editable");

  // override paintLeft
  window._nysaPaintLeft = function(){
    ny.truthCv.width  = lockedCv.width;
    ny.truthCv.height = lockedCv.height;
    ny.tctx.imageSmoothingEnabled = false;
    ny.tctx.drawImage(lockedCv, 0, 0);
  };

  buildTable();
  tableWrap.hidden = false;
  ny.refresh();
}

function unlock(){
  active = false;
  updateBtnText();

  chipLeft.textContent = tx("Image source");
  chipLeft.classList.remove("cmp-editable");
  chipRight.textContent = tx("Image simplifiee");
  chipRight.classList.remove("cmp-editable");

  // reset names for next comparison
  leftName  = t("cmp.default_left");
  rightName = t("cmp.default_right");

  window._nysaPaintLeft   = null;
  window._nysaAfterRefresh = null;
  tableWrap.hidden = true;
  if(ny) ny.refresh();
}

// ============ chip avec crayon ============
function updateChip(chip, name){
  chip.textContent = "";
  chip.appendChild(document.createTextNode(name));
  var pencil = document.createElement("span");
  pencil.className = "cmp-pencil";
  pencil.textContent = "✎"; // ✎
  chip.appendChild(pencil);
}

// ============ rename generique ============
function doRename(chip, getName, setName, thClass){
  return function(e){
    if(!active) return;
    e.stopPropagation();
    e.preventDefault();

    var current = getName();
    var input = document.createElement("input");
    input.type  = "text";
    input.value = current;
    input.className   = "cmp-rename-input";
    input.placeholder = t("cmp.rename.ph");
    chip.textContent = "";
    chip.appendChild(input);
    input.focus();
    input.select();

    function commit(){
      var newName = input.value.trim() || current;
      setName(newName);
      updateChip(chip, getName());
      // mettre a jour l'en-tete du tableau
      if(thClass){
        var th = tableWrap.querySelector("thead th." + thClass);
        if(th) th.textContent = getName();
      }
    }
    input.addEventListener("blur",  commit);
    input.addEventListener("keydown", function(ev){
      if(ev.key === "Enter")  input.blur();
      if(ev.key === "Escape"){input.value = current; input.blur();}
    });
    // bloquer toute propagation depuis l'input
    ["pointerdown","mousedown","click"].forEach(function(evt){
      input.addEventListener(evt, function(ev){ ev.stopPropagation(); });
    });
  };
}

// ============ tableau de comparaison ============
function buildTable(){
  if(!ny) return;
  tableWrap.innerHTML = "";

  var table = document.createElement("table");
  table.className = "cmp-table";

  // en-tete
  var thead = document.createElement("thead");
  var trH   = document.createElement("tr");
  var ths   = ["", t("cmp.param"), leftName, rightName];
  var cls   = ["", "", "cmp-th-left", "cmp-th-right"];
  ths.forEach(function(txt, i){
    var th = document.createElement("th");
    th.textContent = txt;
    if(cls[i]) th.className = cls[i];
    trH.appendChild(th);
  });
  thead.appendChild(trH);
  table.appendChild(thead);

  // corps
  var tbody = document.createElement("tbody");
  ny.PARAMS.forEach(function(p, idx){
    var tr = document.createElement("tr");
    tr.dataset.k = p.k;
    tr.dataset.idx = idx;

    // +/- toggle
    var tdToggle = document.createElement("td");
    tdToggle.className = "cmp-toggle";
    var togBtn = document.createElement("button");
    togBtn.type = "button";
    togBtn.textContent = hiddenKeys[p.k] ? "+" : "−";
    togBtn.title = tx(p.name);
    togBtn.addEventListener("click", function(){
      hiddenKeys[p.k] = !hiddenKeys[p.k];
      tr.classList.toggle("cmp-hidden", !!hiddenKeys[p.k]);
      togBtn.textContent = hiddenKeys[p.k] ? "+" : "−";
      reorderRows(tbody);
    });
    tdToggle.appendChild(togBtn);
    tr.appendChild(tdToggle);

    // nom
    var tdN = document.createElement("td");
    tdN.className = "cmp-name";
    tdN.textContent = tx(p.name);
    tr.appendChild(tdN);

    // valeur verrouillee
    var tdL = document.createElement("td");
    tdL.className = "cmp-val-left";
    tdL.textContent = fmtVal(p, lockedSt[p.k]);
    tr.appendChild(tdL);

    // valeur courante
    var tdR = document.createElement("td");
    tdR.className = "cmp-val-right";
    tdR.textContent = fmtVal(p, ny.st[p.k]);
    tr.appendChild(tdR);

    // surlignage si different
    var valL = Number(lockedSt[p.k]).toFixed(p.dec);
    var valR = Number(ny.st[p.k]).toFixed(p.dec);
    if(valL !== valR) tr.classList.add("cmp-diff");

    if(hiddenKeys[p.k]) tr.classList.add("cmp-hidden");
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  reorderRows(tbody);

  // mise a jour en temps reel
  window._nysaAfterRefresh = updateTable;
}

// reordonne : les lignes visibles en haut (ordre PARAMS), les - en bas
function reorderRows(tbody){
  var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
  rows.sort(function(a, b){
    var ha = hiddenKeys[a.dataset.k] ? 1 : 0;
    var hb = hiddenKeys[b.dataset.k] ? 1 : 0;
    if(ha !== hb) return ha - hb;
    return (parseInt(a.dataset.idx)||0) - (parseInt(b.dataset.idx)||0);
  });
  rows.forEach(function(r){ tbody.appendChild(r); });
}

function updateTable(){
  if(!ny || !active) return;
  var rows = tableWrap.querySelectorAll("tbody tr");
  rows.forEach(function(tr){
    var k = tr.dataset.k;
    if(!k) return;
    var p = ny.PMAP[k];
    if(!p) return;
    var tds = tr.querySelectorAll("td");
    tds[3].textContent = fmtVal(p, ny.st[p.k]);

    var valL = Number(lockedSt[p.k]).toFixed(p.dec);
    var valR = Number(ny.st[p.k]).toFixed(p.dec);
    tr.classList.toggle("cmp-diff", valL !== valR);
  });
}

// ============ expose pour capture.js ============
window._nysaCompare = {
  get active()    { return active; },
  get lockedCv()  { return lockedCv; },
  get lockedSt()  { return lockedSt; },
  get leftName()  { return leftName; },
  get rightName() { return rightName; },
  get hiddenKeys(){ return hiddenKeys; },
  get tableWrap() { return tableWrap; },
  captureBtn: captureBtn,
  lock: lock,
  unlock: unlock
};

// ============ initialisation ============
function init(){
  ny = window._nysa;
  if(!ny){
    setTimeout(init, 100);
    return;
  }

  chipLeft  = document.querySelector(".chip.left");
  chipRight = document.querySelector(".chip.right");
  viewfoot  = document.querySelector(".viewfoot");
  viewer    = document.querySelector(".viewer");
  scenebar  = document.getElementById("scenes");

  if(!chipLeft || !viewfoot || !viewer || !scenebar) return;

  // bouton Lock dans vtools
  var vtools = viewfoot.querySelector(".vtools");
  updateBtnText();
  vtools.appendChild(lockBtn);
  lockBtn.addEventListener("click", function(){ if(active) unlock(); else lock(); });

  // bouton Capture dans vtools
  vtools.appendChild(captureBtn);

  // ---- chip gauche : renommer au clic ----
  chipLeft.addEventListener("click", doRename(
    chipLeft,
    function(){ return leftName; },
    function(n){ leftName = n; },
    "cmp-th-left"
  ));
  // bloquer POINTERDOWN (pas mousedown) pour que le slider ne reagisse pas
  chipLeft.addEventListener("pointerdown", function(e){
    if(active){ e.stopPropagation(); }
  });

  // ---- chip droite : renommer au clic ----
  chipRight.addEventListener("click", doRename(
    chipRight,
    function(){ return rightName; },
    function(n){ rightName = n; },
    "cmp-th-right"
  ));
  chipRight.addEventListener("pointerdown", function(e){
    if(active){ e.stopPropagation(); }
  });

  // tableau au-dessus du choix de scenes
  scenebar.parentNode.insertBefore(tableWrap, scenebar);
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

})();
