const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];
const phases = [
"Initial triage and incident activation",
"Investigation and scope",
"Containment and verification",
"Eradication",
"Recovery and validation",
"Closure and lessons learned"
];
const mission = [
"Establish the first confirmed harmful action and affected scope.",
"Correlate telemetry with stable IDs and validate approved activity.",
"Choose a proportionate containment action and name the decision owner.",
"Verify containment at the resource level, then document evidence gaps."
];
const rubricItems = [
["Evidence correlation","Build a defensible timeline. Join stable identifiers, distinguish event time from report time, and retain source records."],
["Severity and business impact","Tie priority to confirmed access, sensitive disclosure, service impact, privilege, or payment state. Explain changes."],
["Containment quality","State the owner, authority, scope, expected effect, customer impact, expiry, and rollback trigger."],
["Evidence discipline","Separate observed facts, hypotheses, and unknowns. Avoid overclaiming attribution, exfiltration, or user population."],
["Recovery proof","Test that old access fails, controls persist, and legitimate workflows still succeed. Keep test output and timestamps."],
["Communication and improvement","Give concise updates, assign named owners to gaps, and propose a tested detection or preventive control."]
];
let catalog=[], current=null, records={}, dispositions={};
const storageKey="cyber-ir-lab-v1";
async function init(){
 try{const r=await fetch("scenarios.json");catalog=(await r.json()).scenarios;}catch(e){catalog=embeddedFallback();}
 const saved=localStorage.getItem(storageKey);if(saved){try{const parsed=JSON.parse(saved);records=parsed.records||{};dispositions=parsed.dispositions||{};}catch{}}
 $("#scenarioCount").textContent=catalog.length;
 const domains=[...new Set(catalog.map(s=>s.category))];
 $("#domainFilter").innerHTML='<option value="">All domains</option>'+domains.map(d=>`<option>${esc(d)}</option>`).join("");
 renderList();renderRubric();renderQuality();
 const first=catalog[0];selectScenario(first.id);
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderList(){
 const q=$("#search").value.toLowerCase(), domain=$("#domainFilter").value;
 const filtered=catalog.filter(s=>(!domain||s.category===domain)&&(`${s.id} ${s.title} ${s.category}`.toLowerCase().includes(q)));
 $("#visibleCount").textContent=filtered.length;
 $("#scenarioList").innerHTML=filtered.map(s=>`<button class="scenario-item ${current?.id===s.id?'active':''}" data-id="${s.id}"><strong>${s.id}</strong><span>${esc(s.title)}</span></button>`).join("")||'<p class="muted">No matching scenarios.</p>';
 $$(".scenario-item").forEach(b=>b.addEventListener("click",()=>selectScenario(b.dataset.id)));
}
function selectScenario(id){
 current=catalog.find(s=>s.id===id);if(!current)return;
 $("#activeCase").textContent=current.id;$("#caseDomain").textContent=current.category;
 $("#caseEyebrow").textContent=`SCENARIO ${current.id} · PLAYBOOK LAB`;
 $("#caseTitle").textContent=current.title;$("#caseDescription").textContent=current.description;
 $("#priorityPill").textContent=current.priority;$("#priorityText").textContent=current.priority+" initial priority, reassess from impact and confirmed evidence";
 $("#lead").textContent=current.lead;$("#eventCount").textContent=current.evidence.length+" events";
 $("#missionList").innerHTML=mission.map(x=>`<li>${esc(x)}</li>`).join("");
 $("#evidenceRows").innerHTML=current.evidence.map((e,i)=>{
 const key=current.id+":"+i, val=dispositions[key]||"unknown";
 return `<tr><td>${esc(e[0])}</td><td>${esc(e[1])}</td><td>${esc(e[2])}</td><td><code>${esc(e[3])}</code></td><td>${esc(e[4])}</td><td><div class="disposition">${["confirmed","benign","unknown"].map(v=>`<button class="${v===val?'selected':''}" data-value="${v}" data-index="${i}">${v==="confirmed"?"Relevant":v==="benign"?"Benign":"Unknown"}</button>`).join("")}</div></td></tr>`;
 }).join("");
 $("#sourceNote").textContent=current.source_note;
 $$(".disposition button").forEach(b=>b.addEventListener("click",()=>{
   dispositions[current.id+":"+b.dataset.index]=b.dataset.value;persist();selectScenario(current.id);
 }));
 loadWorksheet();renderList();
}
function defaultRecord(){return {summary:"",severity:"",assets:"",correlations:"",containment:"",gaps:"",recovery:"",update:"",checks:[]};}
function loadWorksheet(){
 const r=records[current.id]||defaultRecord();
 $$("[data-field]").forEach(el=>el.value=r[el.dataset.field]||"");
 const checks=[
 "User and system report validated through a trusted channel",
 "Original evidence and stable identifiers preserved",
 "Business impact and priority rationale recorded",
 "Approved changes tested against exact scope and time",
 "Containment authority and rollback condition documented",
 "Post-containment activity checked at the resource",
 "Eradication cause and persistence addressed",
 "Recovery tests prove old access fails and normal work succeeds",
 "Residual risk, evidence gaps, and owners recorded"
 ];
 $("#checklist").innerHTML='<div class="check-grid">'+checks.map((c,i)=>`<label class="check-item"><input type="checkbox" data-check="${i}" ${(r.checks||[]).includes(i)?"checked":""}><span>${esc(c)}</span></label>`).join("")+'</div>';
 $$("[data-field], [data-check]").forEach(el=>el.addEventListener("change",()=>{captureWorksheet();persist();}));
}
function captureWorksheet(){
 if(!current)return;
 const r=records[current.id]||defaultRecord();
 $$("[data-field]").forEach(el=>r[el.dataset.field]=el.value);
 r.checks=$$("[data-check]:checked").map(el=>Number(el.dataset.check));
 records[current.id]=r;updateStatus();
}
function persist(){if(current)captureWorksheet();localStorage.setItem(storageKey,JSON.stringify({records,dispositions}));updateStatus();}
function updateStatus(){
 $("#savedStatus").textContent=Object.keys(records).length+" saved";
}
function renderRubric(){
 $("#rubric").innerHTML=rubricItems.map(([title,desc],i)=>`<div class="rubric-card"><strong><span style="color:var(--accent)">0${i+1}</span> ${esc(title)}</strong><p>${esc(desc)}</p></div>`).join("");
}
function renderQuality(){
 const checks=["I separated facts, hypotheses, and unknowns.","Every high-impact conclusion links to an evidence ID.","I verified controls with an actual resource-level test.","I documented business impact and a rollback condition.","I avoided unsupported claims about attribution or data exposure.","I identified a detection improvement and a measurable test."];
 $("#qualityChecks").innerHTML=checks.map(c=>`<label class="quality"><input type="checkbox"><span>${esc(c)}</span></label>`).join("");
}
function exportReport(){
 captureWorksheet();
 const r=records[current.id]||defaultRecord();
 const report={
  lab:"Cyber Incident Response Simulator",
  scenario:{id:current.id,title:current.title,domain:current.category,initial_priority:current.priority},
  exported_at:new Date().toISOString(),
  evidence_dispositions:current.evidence.map((e,i)=>({time_utc:e[0],source:e[1],entity:e[2],event:e[3],observation:e[4],disposition:dispositions[current.id+":"+i]||"unknown"})),
  worksheet:r,
  note:"Synthetic training material. Validate against the source playbook before using as operational guidance."
 };
 const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`${current.id.toLowerCase()}-incident-report.json`;a.click();URL.revokeObjectURL(url);
}
$("#search").addEventListener("input",renderList);
$("#domainFilter").addEventListener("change",renderList);
$$(".tab").forEach(b=>b.addEventListener("click",()=>{$$(".tab").forEach(x=>x.classList.toggle("active",x===b));$$(".tab-panel").forEach(p=>p.classList.toggle("active",p.id==="panel-"+b.dataset.tab));}));
$("#saveBtn").addEventListener("click",()=>{persist();$("#saveMessage").textContent="Saved locally.";setTimeout(()=>$("#saveMessage").textContent="",2200);});
$("#clearBtn").addEventListener("click",()=>{if(!confirm("Clear worksheet and evidence dispositions for "+current.id+"?"))return;delete records[current.id];current.evidence.forEach((e,i)=>delete dispositions[current.id+":"+i]);persist();selectScenario(current.id);$("#saveMessage").textContent="Scenario worksheet cleared.";});
$("#exportBtn").addEventListener("click",exportReport);
init();