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
 renderResponsePlan(current);loadWorksheet();renderList();
}
function renderResponsePlan(s){
 const p=s.response_plan||{};
 const phaseHtml=(p.phases||[]).map((phase,i)=>`<article class="response-card"><div class="response-card-head"><span class="response-index">${String(i+1).padStart(2,"0")}</span><h4>${esc(phase.phase)}</h4></div><ol>${(phase.steps||[]).map(step=>`<li>${esc(step)}</li>`).join("")}</ol></article>`).join("");
 const notes=(p.scenario_notes||[]).map(n=>`<article class="response-note"><strong>${esc(n.label)}</strong><p>${esc(n.text)}</p></article>`).join("");
 const w=s.tool_workflow||{};
 const toolHtml=(w.tools||[]).map(t=>`<article class="tool-workflow-card"><div class="tool-card-head"><h4>${esc(t.name)}</h4><span>${esc(t.role)}</span></div><p><strong>Investigate</strong><br>${esc(t.investigate)}</p><p><strong>Response action</strong><br>${esc(t.actions)}</p><p class="muted"><strong>When not applicable</strong><br>${esc(t.when_not_applicable)}</p></article>`).join("");
 const snFields=(w.service_now_fields||[]).map(x=>`<li>${esc(x)}</li>`).join("");
 const guardrails=(w.safety_guardrails||[]).map(x=>`<li>${esc(x)}</li>`).join("");
 const toolsHtml=w.tools?`<section class="tool-workflow"><div class="source-banner"><strong>${esc(w.label||"Cross-tool workflow")}</strong><p>${esc(w.incident_focus||"Correlate evidence across relevant security tools.")}</p><p class="muted">${esc(w.training_note||"Training use only.")}</p></div><h3>Tool-by-tool investigation and response</h3><div class="tool-workflow-grid">${toolHtml}</div><article class="panel tool-correlation"><h3>Correlation keys</h3><p>${esc(w.correlation_keys||"Use stable identifiers and UTC timestamps.")}</p></article><article class="panel tool-correlation"><h3>Scenario-specific decision point</h3><p>${esc(w.scenario_specific_check||"Document relevant evidence and gaps.")}</p><h4>Containment approach</h4><p>${esc(w.containment_plan||"Contain based on confirmed scope and approved authority.")}</p><h4>Success criteria</h4><p>${esc(w.success_criteria||"Verify containment and recovery at the affected resource.")}</p></article><article class="panel tool-correlation"><h3>ServiceNow incident record checklist</h3><ul>${snFields}</ul></article><article class="panel tool-safety"><h3>Safety and evidence guardrails</h3><ul>${guardrails}</ul></article></section>`:"";

 const verification=(p.verification_targets||[]).map(v=>`<tr><td>${esc(v.control)}</td><td>${esc(v.expected_result)}</td><td>${esc(v.evidence_to_retain)}</td></tr>`).join("");
 const references=(p.references||[]).map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(r.id)}</strong> · ${esc(r.title)}</a></li>`).join("");
 const assumption=p.response_assumption?`<article class="response-note"><strong>Scenario response assumption</strong><p>${esc(p.response_assumption)}</p></article>`:"";
 const priority=p.priority_guidance?`<article class="response-note"><strong>Initial priority / escalation guidance</strong><p>${esc(p.priority_guidance)}</p></article>`:"";
 const responseLead=p.response_lead?`<article class="response-note"><strong>Response lead</strong><p>${esc(p.response_lead)}</p></article>`:"";
 const bounded=p.bounded_finding?`<article class="response-note"><strong>Bounded finding from the playbook</strong><p>${esc(p.bounded_finding)}</p></article>`:"";
 $("#responsePlan").innerHTML=`${toolsHtml}<div class="source-banner"><strong>${esc(p.source_label||"Response guidance")}</strong><p>${esc(p.basis||"Review the response phases below.")}</p><p class="muted">${esc(p.disclaimer||"Training use only.")}</p></div><div class="response-context">${priority}${responseLead}${assumption}${notes}${bounded}</div><div class="response-phase-grid">${phaseHtml}</div>${verification?`<article class="panel verification-panel"><h3>Scenario verification targets</h3><p class="muted">Use these targets to prove that containment and recovery worked, rather than relying only on a console status.</p><div class="table-wrap"><table><thead><tr><th>Control</th><th>Expected result</th><th>Evidence to retain</th></tr></thead><tbody>${verification}</tbody></table></div></article>`:""}${references?`<article class="panel reference-panel"><h3>Industry references cited by the playbook</h3><ul>${references}</ul></article>`:""}<div class="button-row"><button id="copyResponseBtn" class="secondary">Copy response steps</button><span id="copyResponseStatus" aria-live="polite"></span></div>`;
 const copyBtn=$("#copyResponseBtn");
 if(copyBtn)copyBtn.addEventListener("click",()=>{
   const plain=`${s.id} — ${s.title}\n\n`+(p.phases||[]).map((phase,i)=>`${i+1}. ${phase.phase}\n${(phase.steps||[]).map(step=>`- ${step}`).join("\n")}`).join("\n\n")+`\n\n${(p.scenario_notes||[]).map(n=>`${n.label}: ${n.text}`).join("\n")}`;
   const status=$("#copyResponseStatus");
   if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(plain).then(()=>status.textContent="Copied response steps.").catch(()=>fallbackCopy(plain,status));}else fallbackCopy(plain,status);
 });
}
function fallbackCopy(text,status){const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy");status.textContent="Response steps copied.";}catch(e){status.textContent="Copy unavailable in this browser. Select and copy the steps manually.";}ta.remove();}
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
  scenario:{id:current.id,title:current.title,domain:current.category,initial_priority:current.priority,response_plan:current.response_plan},
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