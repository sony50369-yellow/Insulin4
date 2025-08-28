
// Formulations by drug
const formulations = {
  insulin: [
    { id: "penfill300", label: "Penfill 300 IU/amp", unitsPerContainer: 300, needleShots: 5, expiryDays: 45 },
    { id: "vial1000", label: "Vial 1000 IU/vial", unitsPerContainer: 1000, needleShots: 2, expiryDays: 45 }
  ],
  gansulog: [
    { id: "penfill300", label: "Penfill 300 IU/amp", unitsPerContainer: 300, needleShots: 5, expiryDays: 45 }
  ],
  toujeo: [
    { id: "pen450", label: "Pre-filled Pen 450 IU/pen", unitsPerContainer: 450, needlesPerPen: 6, expiryDays: 45 }
  ],
  teriparatide: [
    { id: "pen600mcg", label: "Pre-filled Pen 600 mcg/pen", daysPerPen: 28, needlesPerPen: 28 }
  ]
};

function refreshFormulation() {
  const drug = document.getElementById('drug').value;
  const sel = document.getElementById('formulation');
  sel.innerHTML = "";
  formulations[drug].forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.label;
    sel.appendChild(opt);
  });
  // show/hide units for teriparatide
  document.getElementById('units-wrap').style.display = (drug === 'teriparatide') ? 'none' : '';
}

document.addEventListener('DOMContentLoaded', () => {
  refreshFormulation();
  document.getElementById('drug').addEventListener('change', refreshFormulation);
});

function calculate(){
  const days = Number(document.getElementById('days').value);
  const injPerDay = Number(document.getElementById('injPerDay').value);
  const drug = document.getElementById('drug').value;
  const formulationId = document.getElementById('formulation').value;
  const dailyUnits = Number(document.getElementById('dailyUnits').value || 0);

  const totalInjections = days * injPerDay;
  let containersNeeded = 0;
  let needlesNeeded = 0;
  let debugLines = [];
  let extra = [];
  let warnings = [];

  if (drug === 'insulin' || drug === 'gansulog') {
    const f = formulations[drug].find(x => x.id === formulationId);
    const byUnits = Math.ceil((dailyUnits * days) / f.unitsPerContainer);
    const byExpiry = Math.ceil(days / f.expiryDays);
    containersNeeded = Math.max(byUnits, byExpiry);
    needlesNeeded = Math.ceil(totalInjections / f.needleShots);
    if (byExpiry > byUnits) { warnings.push('จำนวนภาชนะเพิ่มขึ้นเพราะอายุยาเปิดใช้ 45 วัน'); }
    debugLines.push(`byUnits = ceil(${dailyUnits} * ${days} / ${f.unitsPerContainer}) = ${byUnits}`);
    debugLines.push(`byExpiry = ceil(${days} / ${f.expiryDays}) = ${byExpiry}`);
    extra.push(`ขวด/หลอดละ ${f.unitsPerContainer} IU • ${f.needleShots} ครั้ง/เข็ม • อายุยา ${f.expiryDays} วัน`);
  } else if (drug === 'toujeo') {
    const f = formulations[drug][0];
    const byUnits = Math.ceil((dailyUnits * days) / f.unitsPerContainer);
    const byExpiry = Math.ceil(days / f.expiryDays);
    containersNeeded = Math.max(byUnits, byExpiry);
    needlesNeeded = containersNeeded * f.needlesPerPen;
    if (byExpiry > byUnits) { warnings.push('จำนวนปากกาเพิ่มขึ้นเพราะอายุยาเปิดใช้ 45 วัน'); }
    debugLines.push(`byUnits = ceil(${dailyUnits} * ${days} / ${f.unitsPerContainer}) = ${byUnits}`);
    debugLines.push(`byExpiry = ceil(${days} / ${f.expiryDays}) = ${byExpiry}`);
    extra.push(`ให้เข็ม ${f.needlesPerPen} เข็ม/pen • อายุยา ${f.expiryDays} วัน`);
  } else if (drug === 'teriparatide') {
    const f = formulations[drug][0];
    containersNeeded = Math.ceil(days / f.daysPerPen);
    needlesNeeded = containersNeeded * f.needlesPerPen;
    debugLines.push(`pens = ceil(${days} / ${f.daysPerPen}) = ${containersNeeded}`);
    extra.push(`ไม่ต้องใส่ยูนิต • 1 pen ≈ ${f.daysPerPen} วัน • เข็ม ${f.needlesPerPen}/pen`);
  }

  const results = document.getElementById('results');
  const body = document.getElementById('resultsBody');
  const debug = document.getElementById('debug');

  body.innerHTML = `
    ${warnings.length ? `<div class='alert'>${warnings.join('<br/>')}</div>` : ''}
    <div class="result">
      <div>จำนวนภาชนะบรรจุที่ต้องจ่าย (ขวด/หลอด/pen): <strong>${containersNeeded}</strong></div>
      <div>จำนวนเข็มที่ต้องจ่าย: <strong>${needlesNeeded}</strong></div>
      <div class="muted">${extra.join(' • ')}</div>
    </div>
  `;
  debug.innerHTML = `<code>${debugLines.join('<br/>')}<br/>total injections = ${totalInjections}</code>`;
  results.hidden = false;
}

// quick-select buttons
document.addEventListener('click', function(e){
  if(e.target && e.target.classList.contains('chip')){
    const targetId = e.target.getAttribute('data-target');
    const val = e.target.getAttribute('data-value');
    const input = document.getElementById(targetId);
    if (input){
      input.value = val;
      const parent = e.target.parentElement;
      if (parent){
        parent.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      }
      e.target.classList.add('active');
    }
  }
});

function resetForm(){
  document.getElementById('calc-form').reset();
  refreshFormulation();
  document.getElementById('results').hidden = true;
}
