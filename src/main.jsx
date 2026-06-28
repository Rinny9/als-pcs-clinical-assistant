import React, {useMemo, useState} from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, Activity, Syringe, Wind, Droplets, HeartPulse, Baby, Search, TimerReset } from 'lucide-react';
import './styles.css';

const round = (n, d=2) => Number.isFinite(n) ? Math.round(n * 10**d) / 10**d : null;
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const estWeightFromAge = age => age < 1 ? round(3.5 + age*12*0.65,1) : round(age * 2 + 10,1);
const ageBand = age => age >= 18 ? 'adult' : age >= 12 ? 'teen' : age >= 1 ? 'child' : 'infant';
const pedsHypotension = age => age < 1 ? 70 : 70 + 2 * Math.floor(age);
const pedsNormotension = age => age < 1 ? 90 : 90 + 2 * Math.floor(age);
const isAdult = age => age >= 18;
const ml = (mg, concMgPerMl) => round(mg / concMgPerMl, 2);

function getIgelSize(weight){
  if(weight < 5) return 'Size 1 (<5 kg)';
  if(weight < 12) return 'Size 1.5 (5–12 kg)';
  if(weight < 25) return 'Size 2 (10–25 kg)';
  if(weight < 35) return 'Size 2.5 (25–35 kg)';
  if(weight < 60) return 'Size 3 (30–60 kg)';
  if(weight < 90) return 'Size 4 (50–90 kg)';
  return 'Size 5 (>90 kg)';
}
function airway(age, weight, heightCm, sex){
  const pediatric = age < 18;
  const ett = pediatric ? round((age/4)+4,1) : '7.0–8.0 mm typical adult; choose clinically';
  const ettCuffed = pediatric ? round((age/4)+3.5,1) : ett;
  const depth = pediatric ? round((age/2)+12,1) : '21–23 cm typical adult; confirm clinically';
  const blade = age < 1 ? 'Miller 0–1' : age < 8 ? 'Miller/Mac 1–2' : 'Mac 3–4';
  const suction = pediatric && Number.isFinite(ettCuffed) ? `${Math.round(ettCuffed*2)} Fr` : '10–14 Fr';
  let ibw = null;
  if(heightCm){ const inches = heightCm/2.54; ibw = sex==='female' ? 45.5 + 2.3*(inches-60) : 50 + 2.3*(inches-60); ibw = round(Math.max(ibw, weight),1); }
  const tvBase = ibw || weight;
  return {ett, ettCuffed, depth, blade, suction, igel:getIgelSize(weight), tidal:`${round(tvBase*6,0)}–${round(tvBase*8,0)} mL`, etco2:'30–40 mmHg when ventilating/post-ROSC unless clinical reason differs'};
}

function calculateMeds(age, weight){
 const adult = isAdult(age);
 const meds=[];
 const epiAnaphylaxisMg = Math.min(round(weight*0.01,2),0.5);
 meds.push({cat:'Allergy / Bronchospasm',name:'Epinephrine IM 1 mg/mL',dose:`${epiAnaphylaxisMg} mg`,draw:`${ml(epiAnaphylaxisMg,1)} mL`,notes:'0.01 mg/kg IM; max 0.5 mg; may round to nearest 0.05 mg.'});
 meds.push({cat:'Respiratory',name:'Salbutamol',dose: weight < 25 ? 'MDI up to 600 mcg OR neb 2.5 mg' : 'MDI up to 800 mcg OR neb 5 mg',draw:'',notes:'q5–15 min PRN; max 3 doses in bronchoconstriction directive.'});
 meds.push({cat:'Respiratory',name:'Dexamethasone',dose:`${Math.min(round(weight*0.5,1),8)} mg`,draw:'Depends on concentration',notes:'0.5 mg/kg PO/IM/IV; max 8 mg.'});
 meds.push({cat:'Allergy',name:'Diphenhydramine',dose: weight>=50?'50 mg':weight>=25?'25 mg':'Not weight-eligible under ≥25 kg condition',draw:'',notes:'IV/IM; one dose.'});
 const d10g = Math.min(round(weight*0.2,1),25); meds.push({cat:'Metabolic',name:'D10W',dose:`${d10g} g`,draw:`${round(d10g/0.1,0)} mL D10W`,notes:'0.2 g/kg = 2 mL/kg; max 25 g.'});
 meds.push({cat:'Opioid toxicity',name:'Naloxone',dose:'IV/IO up to 0.4 mg; IM 0.4 mg; IN 2–4 mg; SC 0.8 mg',draw:'',notes:'q5 min; max 3 doses; IV titrate to respiratory status.'});
 meds.push({cat:'Analgesia',name:'Fentanyl',dose: adult?'25–75 mcg':'up to '+round(weight*1,0)+' mcg',draw:'',notes: adult?'Max single 75 mcg; cumulative 200 mcg.':'1 mcg/kg; max single 75 mcg; cumulative 200 mcg; patch <12 yrs.'});
 meds.push({cat:'Analgesia',name:'Morphine',dose: adult?'2–10 mg':`${round(weight*0.05,1)}–${Math.min(round(weight*0.1,1),5)} mg`,draw:'',notes: adult?'Max single 10 mg; cumulative 20 mg.':'0.05–0.1 mg/kg; max single 5 mg; patch <12 yrs.'});
 meds.push({cat:'Analgesia',name:'Ketamine analgesia',dose:`IV ${Math.min(round(weight*0.25,1),adult?20:10)} mg; IN ${Math.min(round(weight*1,1),adult?75:30)} mg`,draw:'',notes: adult?'q15 min; max 2 doses.':'Patch before ketamine if <18 yrs.'});
 meds.push({cat:'Sedation',name:'Midazolam sedation/combative',dose:`up to ${Math.min(round(weight*0.1,1),5)} mg`,draw:'',notes:'0.1 mg/kg IV/IM/IN; max single 5 mg; max total 10 mg.'});
 meds.push({cat:'Sedation',name:'Ketamine combative IM',dose: adult ? `${Math.min(round(weight*(age>=65?3:5),0),age>=65?300:500)} mg` : 'Adult directive only',draw:'',notes:'5 mg/kg IM age 18–64 max 500 mg; 3 mg/kg age ≥65 max 300 mg.'});
 meds.push({cat:'Cardiac',name:'Atropine',dose: adult?'1 mg IV':'Adult directive only',draw:'',notes:'q5 min; max 2 doses.'});
 meds.push({cat:'Cardiac infusion',name:'Dopamine',dose:`${round(weight*5,0)}–${round(weight*20,0)} mcg/min`,draw:'',notes:'Start 5 mcg/kg/min; titrate by 5 mcg/kg/min q5 min; max 20 mcg/kg/min. Manual drip requires local concentration/drop factor.'});
 meds.push({cat:'Cardiac arrest',name:'Epinephrine arrest',dose: age>=0.003?'1 mg IV/IO q4 min adult; pediatric per local standard/patch':'Newborn pathway',draw:'',notes:'Included as reference; confirm age-specific directive before use.'});
 meds.push({cat:'Cardiac arrest',name:'Amiodarone VF/pVT',dose: adult?'300 mg then 150 mg':'5 mg/kg typical pediatric max per directive/local standard',draw:'',notes:'Use only where authorized and indicated.'});
 meds.push({cat:'Tachydysrhythmia',name:'Adenosine',dose: adult?'6 mg → 12 mg → 12 mg':'Pediatric dose requires directive verification',draw:'',notes:'For regular narrow-complex tachycardia/SVT pathway.'});
 meds.push({cat:'Hyperkalemia',name:'Calcium gluconate',dose:'1 g IV',draw:'Usually 10 mL of 10%',notes:'Repeat q5 min as authorized; verify local stock concentration.'});
 meds.push({cat:'Hyperkalemia',name:'Salbutamol high-dose',dose:'10 mg neb OR MDI 1600 mcg',draw:'',notes:'Common ALS PCS hyperkalemia treatment; verify exact route/conditions.'});
 meds.push({cat:'Obstetrics',name:'Oxytocin',dose:'10 units IM',draw:'',notes:'Post-delivery/post-placenta per childbirth directive.'});
 return meds;
}
function fluids(age, weight){
 const ros = Math.min(weight*10,1000);
 return [
  {name:'ROSC / hypotension fluid bolus',calc:`${round(ros,0)} mL 0.9% NaCl`,notes: age<12?'Reassess every 100 mL.':'Reassess every 250 mL.'},
  {name:'General pediatric hypotension threshold',calc: age<18 ? `SBP < ${round(pedsHypotension(age),0)} mmHg` : 'Adult hypotension SBP <90 mmHg',notes: age<18 ? `Normotension threshold ≈ SBP ≥ ${round(pedsNormotension(age),0)} mmHg.`:'Adult normotension generally SBP ≥100 mmHg.'},
  {name:'Burn fluid estimate',calc:`Parkland first 24h: ${round(4*weight,0)} mL × %TBSA`,notes:'Half in first 8h from burn time. Placeholder calculator; enter TBSA in future version.'},
  {name:'Tidal volume',calc:`${round(weight*6,0)}–${round(weight*8,0)} mL using actual/estimated weight`,notes:'Use IBW when height available, especially adult ventilation.'}
 ];
}
function defib(age, weight){ return age<8 ? [{name:'Manual defibrillation initial',calc:`${round(2*weight,0)} J`,notes:'2 J/kg initial.'},{name:'Manual defibrillation subsequent',calc:`${round(4*weight,0)} J`,notes:'4 J/kg subsequent.'}] : [{name:'Defibrillation',calc:'Use RBHP/manufacturer adult energy settings',notes:'DSED/VCD after refractory VF/pVT if authorized.'},{name:'Cardioversion',calc:'100 J → 200 J → 200 J common ACP sequence',notes:'Confirm with local tachydysrhythmia authorization.'}]; }

function App(){
 const [age,setAge]=useState(18); const [weight,setWeight]=useState(70); const [height,setHeight]=useState(''); const [sex,setSex]=useState('male'); const [query,setQuery]=useState(''); const [timer,setTimer]=useState(0); const [running,setRunning]=useState(false);
 React.useEffect(()=>{ if(!running) return; const id=setInterval(()=>setTimer(t=>t+1),1000); return()=>clearInterval(id); },[running]);
 const actualWeight = weight || estWeightFromAge(age);
 const aw = useMemo(()=>airway(Number(age), Number(actualWeight), Number(height)||null, sex),[age,actualWeight,height,sex]);
 const meds = useMemo(()=>calculateMeds(Number(age),Number(actualWeight)),[age,actualWeight]);
 const filtered = meds.filter(m=>[m.name,m.cat,m.notes].join(' ').toLowerCase().includes(query.toLowerCase()));
 const mmss = `${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}`;
 return <main>
  <header><div><h1>ALS PCS Clinical Assistant</h1><p>GitHub-ready MVP for Ontario ALS PCS 5.4 dose, airway, fluid, and critical-call calculations.</p></div><span className="pill">Offline-first starter</span></header>
  <section className="warning"><AlertTriangle/> <div><b>Clinical safety warning:</b> This is a starter tool, not a certified medical device. Verify all calculations against current ALS PCS, companion notes, local RBHP/service policy, patient factors, and medication concentrations before clinical use.</div></section>
  <section className="grid inputs"><label>Age (years)<input type="number" step="0.1" value={age} onChange={e=>setAge(e.target.value)}/></label><label>Weight (kg)<input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)}/></label><label>Height cm optional<input type="number" value={height} onChange={e=>setHeight(e.target.value)}/></label><label>Sex for IBW<select value={sex} onChange={e=>setSex(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select></label></section>
  <section className="cards four"><Card icon={<Baby/>} title="Patient"><b>{ageBand(Number(age)).toUpperCase()}</b><p>Est. weight from age: {estWeightFromAge(Number(age))} kg</p><p>Hypotension: {Number(age)<18?`SBP < ${pedsHypotension(Number(age))}`:'SBP < 90'} mmHg</p></Card><Card icon={<Wind/>} title="Airway"><p>ETT: {aw.ettCuffed} cuffed / {aw.ett} uncuffed</p><p>Depth: {aw.depth}</p><p>iGel: {aw.igel}</p></Card><Card icon={<Droplets/>} title="Fluids"><p>ROSC bolus: {Math.min(actualWeight*10,1000)} mL</p><p>Reassess: {Number(age)<12?'q100 mL':'q250 mL'}</p><p>Burn: {4*actualWeight} mL × %TBSA</p></Card><Card icon={<TimerReset/>} title="CPR Timer"><strong className="timer">{mmss}</strong><button onClick={()=>setRunning(!running)}>{running?'Pause':'Start'}</button><button onClick={()=>{setTimer(0);setRunning(false)}}>Reset</button></Card></section>
  <section className="grid two"><Panel title="Airway / Ventilation" icon={<Wind/>}>{Object.entries(aw).map(([k,v])=><Row key={k} k={k} v={v}/>)}</Panel><Panel title="Defib / Cardiology" icon={<HeartPulse/>}>{defib(Number(age),Number(actualWeight)).map((x,i)=><Dose key={i} {...x}/>)}</Panel></section>
  <section className="grid two"><Panel title="Fluid Therapy" icon={<Droplets/>}>{fluids(Number(age),Number(actualWeight)).map((x,i)=><Dose key={i} {...x}/>)}</Panel><Panel title="Search Medications" icon={<Search/>}><input className="search" placeholder="Search: seizure, ketamine, hyperkalemia..." value={query} onChange={e=>setQuery(e.target.value)}/><p className="muted">Showing {filtered.length} of {meds.length}</p></Panel></section>
  <section className="meds"><h2><Syringe/> Medication Calculations</h2><div className="medgrid">{filtered.map((m,i)=><article className="med" key={i}><span>{m.cat}</span><h3>{m.name}</h3><b>{m.dose}</b>{m.draw&&<p className="draw">Draw: {m.draw}</p>}<p>{m.notes}</p></article>)}</div></section>
  <footer>Data source: Ontario Ministry of Health ALS PCS 5.4 starter extraction. Add companion-document notes in <code>src/data</code> before production use.</footer>
 </main>
}
function Card({icon,title,children}){return <article className="card">{icon}<h2>{title}</h2>{children}</article>}
function Panel({icon,title,children}){return <section className="panel"><h2>{icon}{title}</h2>{children}</section>}
function Row({k,v}){return <div className="row"><span>{k}</span><b>{v}</b></div>}
function Dose({name,calc,notes}){return <article className="dose"><b>{name}</b><p>{calc}</p><small>{notes}</small></article>}
createRoot(document.getElementById('root')).render(<App/>);
