// @ts-nocheck

import { createContext, useContext, useEffect, useMemo, useState } from "react";
const Ctx=createContext();
const KEY='capacity_v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}};
const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
const kg=n=>Number(n).toLocaleString('en-IN')+' kg';
const iso=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.toISOString().slice(0,10)};
const dayDiff=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
const rel=d=>{const n=dayDiff(iso(0),d);return n===0?'Today':n===1?'Tomorrow':new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'})};
const t12=t=>{const[h,m]=t.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`};
const CITIES=['Jaipur','Delhi','Gurugram','Agra','Noida','Ajmer'];
const CATS=['Retail Goods','Electronics','Documents','Machinery / Components','Furniture','Other Permitted Goods'];
const ALL=CATS;
const J=[
['J1','Raj Logistics','Jaipur','Delhi',1,'06:00','14-ft Commercial Truck',1500,1000,3200,4.8,10,ALL],
['J2','Shree Balaji Transport','Delhi','Jaipur',1,'09:30','Truck (19-ft)',2500,1800,3600,4.6,8,ALL],
['J3','Agra Express Cargo','Agra','Delhi',1,'07:15','Mini Truck',1000,600,2400,4.5,5,CATS.filter(c=>!c.startsWith('Mach'))],
['J4','Yamuna Freight','Delhi','Agra',2,'06:45','Commercial Van',800,350,1900,4.7,5,CATS.filter(c=>!/Mach|Furn/.test(c))],
['J5','Aravali Carriers','Gurugram','Jaipur',1,'05:30','Truck (22-ft)',3000,2100,3900,4.4,7,ALL],
['J6','Pink City Movers','Jaipur','Gurugram',2,'14:00','Pickup',700,250,2300,4.9,7,CATS.filter(c=>!/Mach|Furn/.test(c))],
['J7','Northline Cargo','Jaipur','Delhi',2,'08:00','Truck (17-ft)',2000,1700,2900,4.3,9,ALL],
].map(([id,carrier,from,to,off,time,vehicle,total,cur,price,rating,dur,accepts])=>{
 const [h,m]=time.split(':').map(Number);const eh=h+dur;const eo=off+Math.floor(eh/24);const et=`${String(eh%24).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
 return{id,carrier,from,to,date:iso(off),time,vehicle,total,cur,avail:total-cur,price,rating,verified:true,accepts,edate:iso(eo),etime:et}});
const NCR=c=>c==='Delhi'||c==='Gurugram'||c==='Noida';
const cityScore=(a,b)=>a===b?50:(NCR(a)&&NCR(b)?36:0);
function matchJourneys(s){
 return J.map(j=>{
  const rp=cityScore(s.from,j.from),rd=cityScore(s.to,j.to);
  if(!rp||!rd)return null;
  if(Number(s.weight)>j.avail)return null;
  if(!j.accepts.includes(s.cat))return null;
  const dd=dayDiff(s.date,j.date);if(dd<0||dd>2)return null;
  let ts=[100,75,50][dd];if(s.deliver&&j.edate>s.deliver)ts=Math.min(ts,40);
  const cs=60+40*(Number(s.weight)/j.avail),rel_=(j.rating-3)/2*100;
  const score=Math.round((rp+rd)*.35+ts*.25+cs*.2+rel_*.2);
  return{j,score}}).filter(Boolean).sort((a,b)=>b.score-a.score)}

/* ---------- small UI ---------- */
const P={truck:'M10 17h4V5H2v12h3M14 8h4l4 4v5h-3M7 15.5a1.5 1.5 0 1 0 .01 0M17 15.5a1.5 1.5 0 1 0 .01 0',arrow:'M5 12h14M13 6l6 6-6 6',check:'M20 6 9 17l-5-5',menu:'M4 6h16M4 12h16M4 18h16',x:'M18 6 6 18M6 6l12 12',box:'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',star:'M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 21l1.2-6.5L2.5 9.9 9.1 9z',shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',pin:'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z',search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',ref:'M4 4h16v16H4zM8 9h8M8 13h8M8 17h4',route:'M6 19a2 2 0 1 0 .01 0M18 5a2 2 0 1 0 .01 0M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',coin:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 12h6M12 8v8'};
const Icon=({n,s=18,c=''})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden="true"><path d={P[n]}/></svg>;
const Logo=()=><a href="#/" className="flex items-center gap-2 font-extrabold tracking-tight text-lg"><span className="bg-indigo-600 text-white rounded-lg p-1.5"><Icon n="box" s={16}/></span>CAPACITY</a>;
const RouteDisplay=({from,to,big=false})=><div className={`flex items-center gap-2 font-bold ${big?'text-2xl':'text-base'}`}>{from}<Icon n="arrow" c="text-indigo-600"/>{to}</div>;
const CapacityBar=({total,used,add=0})=>{const rem=Math.max(total-used-add,0);const p=v=>Math.max(v/total*100,0)+'%';
 return <div><div className="flex h-5 rounded-full overflow-hidden bg-slate-100 border border-slate-200" role="img" aria-label={`${used} kg used, ${add} kg new shipment, ${rem} kg remaining`}>
 <div className="bg-slate-700 grow" style={{width:p(used)}}/>{add>0&&<div className="bg-indigo-600 grow" style={{width:p(add)}}/>}<div className="bg-indigo-100" style={{width:p(rem)}}/></div>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-600"><span><i className="inline-block w-2 h-2 rounded-full bg-slate-700 mr-1"/>Current cargo {kg(used)}</span>{add>0&&<span><i className="inline-block w-2 h-2 rounded-full bg-indigo-600 mr-1"/>New shipment {kg(add)}</span>}<span><i className="inline-block w-2 h-2 rounded-full bg-indigo-200 mr-1"/>{add>0?'Remaining':'Available'} {kg(rem)}</span></div></div>};
const CompatibilityScore=({v})=><div className="text-right"><div className="text-2xl font-extrabold text-indigo-600">{v}%</div><div className="text-[11px] text-slate-500 leading-tight">compatible<br/>(prototype score)</div></div>;
const MetricCard=({label,value,icon,tone=""})=><div className="card p-4"><div className="flex items-center gap-2 text-xs text-slate-500"><Icon n={icon} s={14}/>{label}</div><div className={`text-xl font-extrabold mt-1 ${tone||''}`}>{value}</div></div>;
const FormField=({label,error,children,hint})=><label className="block"><span className="text-sm font-semibold">{label}</span><div className="mt-1">{children}</div>{hint&&<span className="text-xs text-slate-500">{hint}</span>}{error&&<span role="alert" className="text-xs text-red-600 block mt-1">{error}</span>}</label>;
const CitySelector=({value,onChange})=><select className="inp" value={value} onChange={e=>onChange(e.target.value)}><option value="">Select city</option>{CITIES.map(c=><option key={c}>{c}</option>)}</select>;
const EmptyState=({title,text,children=null})=><div className="card p-8 text-center max-w-xl mx-auto fade"><div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center mb-3"><Icon n="search"/></div><h2 className="text-xl font-bold">{title}</h2><p className="text-slate-600 mt-1">{text}</p><div className="flex flex-wrap gap-3 justify-center mt-5">{children}</div></div>;
const LoadingState=({text})=><div className="py-24 text-center fade"><div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full mx-auto" style={{animation:'sp .8s linear infinite'}}/><p className="mt-4 font-semibold">{text}</p></div>;
const Toast=({msg})=>msg?<div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg z-50 fade">{msg}</div>:null;
const Modal=({title,onClose,children})=><div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" role="dialog" aria-modal="true"><div className="card p-6 w-full max-w-md"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">{title}</h3><button onClick={onClose} aria-label="Close"><Icon n="x"/></button></div>{children}</div></div>;
const Page=({children,w='max-w-6xl'})=><main className={`${w} mx-auto px-4 sm:px-6 py-10 fade`}>{children}</main>;
const Trust=()=><div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">{['Verified Carrier','Shipment Declaration','Route Matching','Booking Reference'].map(t=><span key={t} className="flex items-center gap-1"><Icon n="check" s={13} c="text-emerald-600"/>{t}</span>)}</div>;
const StatusTimeline=({step})=>{const L=['Booking Confirmed','Carrier Confirmed','Pickup','In Transit','Delivered'];return <ol className="space-y-4">{L.map((l,i)=><li key={l} className="flex items-center gap-3"><span className={`w-7 h-7 rounded-full grid place-items-center border-2 ${i<step?'bg-indigo-600 border-indigo-600 text-white':'border-slate-300 text-slate-300'}`}>{i<step?<Icon n="check" s={14}/>:<span className="w-2 h-2 rounded-full bg-current"/>}</span><span className={i<step?'font-semibold':'text-slate-500'}>{l}</span></li>)}</ol>};

/* ---------- Navbar / Footer ---------- */
function Navbar({path}){
 const {s}=useContext(Ctx);const [o,setO]=useState(false);useEffect(()=>setO(false),[path]);
 const last=s.lastBooking;
 const L=[['How It Works','/how-it-works'],['Ship Something','/ship'],['Offer Capacity','/capacity'],['Track',last?`/tracking/${last}`:'/tracking'],['Carrier Portal','/carrier']];
 return <header className="sticky top-0 z-40 bg-[#f8f7f4]/90 backdrop-blur border-b border-slate-200"><div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"><Logo/>
 <nav className="hidden lg:flex items-center gap-6 text-sm font-medium" aria-label="Main">{L.map(([t,h])=><a key={t} href={'#'+h} className="hover:text-indigo-600">{t}</a>)}<a href="#/profile" className="hover:text-indigo-600">Profile</a></nav>
 <div className="hidden lg:flex gap-2"><a href="#/capacity" className="btn b2">Offer Capacity</a><a href="#/ship" className="btn b1">Ship Something</a></div>
 <button className="lg:hidden p-2" aria-label="Toggle menu" aria-expanded={o} onClick={()=>setO(!o)}><Icon n={o?'x':'menu'} s={24}/></button></div>
 {o&&<div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 fade">{L.concat([['Profile','/profile']]).map(([t,h])=><a key={t} href={'#'+h} className="block font-medium py-1">{t}</a>)}<div className="flex gap-2 pt-2"><a href="#/ship" className="btn b1 flex-1">Ship Something</a><a href="#/capacity" className="btn b2 flex-1">Offer Capacity</a></div></div>}</header>}
const Footer=()=><footer className="border-t border-slate-200 mt-16 bg-white"><div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-6 md:grid-cols-2"><div><Logo/><p className="text-slate-600 mt-2 font-medium">Don't drive empty. Don't ship alone.</p><p className="text-xs text-slate-500 mt-3 max-w-md">CAPACITY is an MVP prototype demonstrating route-based transportation capacity matching.</p></div>
<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end content-start">{[['How It Works','/how-it-works'],['Ship Something','/ship'],['Offer Capacity','/capacity'],['Track','/tracking'],['About','/about']].map(([t,h])=><a key={t} href={'#'+h} className="hover:text-indigo-600">{t}</a>)}</div></div></footer>;

/* ---------- Cards ---------- */
function CarrierCard({j,score,weight}){
 const {s,set,go,toast}=useContext(Ctx);const saved=(s.saved||[]).includes(j.id);
 return <article className="card p-5 fade"><div className="flex justify-between gap-3"><div><h3 className="text-lg font-bold">{j.carrier}</h3><div className="text-xs text-emerald-700 flex items-center gap-1 mt-0.5"><Icon n="check" s={13}/>Verified Carrier</div></div><CompatibilityScore v={score}/></div>
 <div className="mt-3"><RouteDisplay from={j.from} to={j.to}/><div className="text-sm text-slate-600 mt-1">{rel(j.date)} · {t12(j.time)} · {j.vehicle}</div></div>
 <div className="my-4"><CapacityBar total={j.total} used={j.cur} add={weight}/></div>
 <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"><div><dt className="text-slate-500 text-xs">Available</dt><dd className="font-semibold">{kg(j.avail)}</dd></div><div><dt className="text-slate-500 text-xs">Your shipment</dt><dd className="font-semibold">{kg(weight)}</dd></div><div><dt className="text-slate-500 text-xs">Est. delivery</dt><dd className="font-semibold">{rel(j.edate)}, {t12(j.etime)}</dd></div><div><dt className="text-slate-500 text-xs">Rating</dt><dd className="font-semibold flex items-center gap-1"><Icon n="star" s={13} c="text-amber-500"/>{j.rating}</dd></div></dl>
 <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100"><div className="text-2xl font-extrabold">{inr(j.price)}</div><div className="flex gap-2"><button className="btn b2 !px-3" aria-label="Save carrier" onClick={()=>{set(o=>({saved:saved?(o.saved||[]).filter(x=>x!==j.id):[...(o.saved||[]),j.id]}));toast(saved?'Removed from saved carriers':'Carrier saved')}}><Icon n="star" c={saved?'text-amber-500 fill-amber-400':''}/></button><button className="btn b1" onClick={()=>go(`/booking/${j.id}`)}>Book Capacity</button></div></div></article>}

/* ---------- Home ---------- */
function Home(){
 return <div>
 <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 grid lg:grid-cols-2 gap-10 items-center fade">
 <div><div className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 mb-4"><Icon n="route" s={14}/>Book the space, not the truck</div>
 <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">Turn Empty Journeys Into Delivery Capacity.</h1>
 <p className="text-lg text-slate-600 mt-5">CAPACITY connects shipments with verified commercial vehicles that already have space on the route. Ship smarter, utilize unused capacity, and make every journey count.</p>
 <div className="flex flex-wrap gap-3 mt-7"><a href="#/ship" className="btn b1">Ship Something</a><a href="#/capacity" className="btn b2">Offer Capacity</a></div>
 <p className="mt-6 font-bold text-indigo-700">Don't drive empty. Don't ship alone.</p></div>
 <div className="card p-6"><div className="flex justify-between items-start"><div><div className="text-xs text-slate-500">Commercial Truck · already on the road</div><RouteDisplay big from="JAIPUR" to="DELHI"/></div><Icon n="truck" s={28} c="text-indigo-600"/></div>
 <div className="grid grid-cols-3 gap-2 text-center my-5">{[['Total','1,500 kg'],['Current cargo','1,000 kg'],['Available','500 kg']].map(([a,b],i)=><div key={a} className={`rounded-xl p-3 ${i==2?'bg-indigo-50 text-indigo-700':'bg-slate-50'}`}><div className="text-[11px] text-slate-500">{a}</div><div className="font-bold">{b}</div></div>)}</div>
 <CapacityBar total={1500} used={1000} add={300}/>
 <div className="flex flex-col items-center my-4"><svg width="12" height="48"><line x1="6" y1="0" x2="6" y2="48" stroke="#4f46e5" strokeWidth="2" className="dash"/></svg><span className="text-xs font-semibold text-indigo-700">300 kg matched into 500 kg of free space</span></div>
 <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-3"><div className="flex items-center gap-2 font-semibold"><Icon n="box" c="text-indigo-600"/>Shipment</div><div className="font-extrabold text-indigo-700">300 kg</div></div></div></section>

 <section className="bg-white border-y border-slate-200 py-16"><div className="max-w-6xl mx-auto px-4 sm:px-6"><h2 className="text-3xl font-extrabold tracking-tight">The road is moving. The capacity isn't.</h2><p className="text-slate-600 mt-3 max-w-2xl">Commercial vehicles often travel partly empty or return without a suitable load, while small businesses struggle to find affordable transport for smaller shipments.</p>
 <div className="grid md:grid-cols-3 gap-4 mt-8">{[['Empty Return Trips','Vehicles may return after completing a delivery without a suitable load.','truck'],['Fragmented Shipments',"Small businesses often have shipments that don't justify booking an entire vehicle.",'box'],['Underused Capacity','Existing vehicle capacity is not always efficiently utilized.','route']].map(([t,d,i])=><div key={t} className="card p-6"><div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center mb-3"><Icon n={i}/></div><h3 className="font-bold">{t}</h3><p className="text-sm text-slate-600 mt-1">{d}</p></div>)}</div></div></section>

 <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16"><h2 className="text-3xl font-extrabold tracking-tight">Match the shipment to the journey.</h2>
 <div className="grid md:grid-cols-4 gap-3 mt-8 items-stretch">{[['Existing Journey + Available Capacity','A vehicle is already going there.'],['CAPACITY','Route, weight and date matching.'],['Compatible Shipment','A small load fits the free space.'],['More utilized journey','Fuller trip, extra revenue.']].map(([t,d],i)=><div key={t} className="relative card p-5"><div className="text-xs font-bold text-indigo-600">0{i+1}</div><h3 className="font-bold mt-1">{t}</h3><p className="text-sm text-slate-600 mt-1">{d}</p>{i<3&&<svg className="hidden md:block absolute -right-4 top-1/2 z-10" width="24" height="12"><line x1="0" y1="6" x2="24" y2="6" stroke="#4f46e5" strokeWidth="2" className="dash"/></svg>}</div>)}</div></section>

 <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8"><h2 className="text-3xl font-extrabold tracking-tight">How it works</h2>
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">{[['01','Post','A shipper enters pickup, destination, date, weight and cargo information.','ref'],['02','Match','CAPACITY searches compatible commercial journeys.','search'],['03','Book','The shipper selects a verified carrier and books available capacity.','shield'],['04','Track','The shipment moves through booking, pickup, transit and delivery.','pin']].map(([n,t,d,i])=><div key={n} className="card p-5"><div className="flex justify-between"><span className="text-3xl font-extrabold text-slate-200">{n}</span><Icon n={i} c="text-indigo-600"/></div><h3 className="font-bold mt-2">{t}</h3><p className="text-sm text-slate-600 mt-1">{d}</p></div>)}</div>
 <div className="card p-8 mt-10 text-center bg-slate-900 !border-slate-900 text-white"><h3 className="text-2xl font-extrabold">I need to ship 300 kg. Not a whole truck.</h3><div className="flex gap-3 justify-center mt-5 flex-wrap"><a href="#/ship" className="btn b1">Ship Something</a><a href="#/capacity" className="btn b2">Offer Capacity</a></div></div></section></div>}

/* ---------- Ship ---------- */
function Ship(){
 const {s,set,go}=useContext(Ctx);
 const [f,setF]=useState(s.shipment||{from:'',to:'',date:iso(1),deliver:'',weight:'',dims:'',cat:''});
 const [er,setEr]=useState({});const [busy,setBusy]=useState(false);
 const u=k=>e=>setF({...f,[k]:e.target?e.target.value:e});
 const submit=e=>{e.preventDefault();const x={};const w=Number(f.weight);
  if(!f.from)x.from='Select a pickup city';if(!f.to)x.to='Select a destination city';else if(f.to===f.from)x.to='Destination must differ from pickup';
  if(!f.date)x.date='Choose a pickup date';else if(f.date<iso(0))x.date='Pickup date cannot be in the past';
  if(f.deliver&&f.deliver<f.date)x.deliver='Delivery date cannot be before pickup';
  if(!f.weight||isNaN(w)||w<=0)x.weight='Enter a valid weight above 0 kg';else if(w>5000)x.weight='Above 5,000 kg — consider a full-truck booking';
  if(!f.cat)x.cat='Select a cargo category';setEr(x);if(Object.keys(x).length)return;
  setBusy(true);set({shipment:f});setTimeout(()=>go('/matches'),1200)};
 if(busy)return <LoadingState text="Finding compatible journeys..."/>;
 return <Page w="max-w-3xl"><h1 className="text-3xl font-extrabold tracking-tight">Ship Something</h1><p className="text-slate-600 mt-2">Tell us what you're sending. We'll find space on a journey that's already happening.</p>
 <form onSubmit={submit} noValidate className="card p-6 mt-6 grid sm:grid-cols-2 gap-4">
 <FormField label="Pickup City" error={er.from}><CitySelector value={f.from} onChange={u('from')}/></FormField>
 <FormField label="Destination City" error={er.to}><CitySelector value={f.to} onChange={u('to')}/></FormField>
 <FormField label="Pickup Date" error={er.date}><input type="date" className="inp" min={iso(0)} value={f.date} onChange={u('date')}/></FormField>
 <FormField label="Preferred Delivery Date" error={er.deliver} hint="Optional"><input type="date" className="inp" value={f.deliver} onChange={u('deliver')}/></FormField>
 <FormField label="Package Weight (kg)" error={er.weight}><input type="number" min="1" className="inp" placeholder="e.g. 300" value={f.weight} onChange={u('weight')}/></FormField>
 <FormField label="Package Dimensions" hint="Optional, e.g. 4 boxes · 60×40×40 cm"><input className="inp" value={f.dims} onChange={u('dims')} placeholder="4 boxes, 60×40×40 cm"/></FormField>
 <div className="sm:col-span-2"><FormField label="Cargo Category" error={er.cat}><select className="inp" value={f.cat} onChange={u('cat')}><option value="">Select category</option>{CATS.map(c=><option key={c}>{c}</option>)}</select></FormField></div>
 <p className="sm:col-span-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">Certain goods may be restricted or prohibited. All shipments are subject to verification and applicable rules.</p>
 <div className="sm:col-span-2"><button className="btn b1 w-full sm:w-auto"><Icon n="search" s={16}/>Find Capacity</button></div></form></Page>}

/* ---------- Matches ---------- */
function Matches(){
 const {s,set,go}=useContext(Ctx);const sh=s.shipment;
 const [load_,setL]=useState(true);const [sort,setSort]=useState('score');const [minR,setMinR]=useState(0);const [maxP,setMaxP]=useState('');
 useEffect(()=>{const t=setTimeout(()=>setL(false),600);return()=>clearTimeout(t)},[]);
 const res=useMemo(()=>{if(!sh)return[];let r=matchJourneys(sh).filter(m=>m.j.rating>=minR&&(!maxP||m.j.price<=Number(maxP)));
  const k={score:(a,b)=>b.score-a.score,price:(a,b)=>a.j.price-b.j.price,dep:(a,b)=>(a.j.date+a.j.time).localeCompare(b.j.date+b.j.time),del:(a,b)=>(a.j.edate+a.j.etime).localeCompare(b.j.edate+b.j.etime),cap:(a,b)=>b.j.avail-a.j.avail,rating:(a,b)=>b.j.rating-a.j.rating}[sort];return r.sort(k)},[sh,sort,minR,maxP]);
 if(!sh)return <Page><EmptyState title="No shipment yet" text="Enter your shipment details to see available capacity."><a href="#/ship" className="btn b1">Ship Something</a></EmptyState></Page>;
 if(load_)return <LoadingState text="Finding compatible journeys..."/>;
 return <Page><h1 className="text-3xl font-extrabold tracking-tight">Available Capacity</h1>
 <div className="card p-4 mt-5 flex flex-wrap items-center justify-between gap-3"><div><RouteDisplay from={sh.from} to={sh.to}/><div className="text-sm text-slate-600 mt-1">{kg(sh.weight)} · {sh.cat} · Pickup: {rel(sh.date)}</div></div><a href="#/ship" className="btn b2">Change shipment details</a></div>
 <div className="card p-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"><FormField label="Sort by"><select className="inp" value={sort} onChange={e=>setSort(e.target.value)}><option value="score">Best match</option><option value="price">Price</option><option value="dep">Departure</option><option value="del">Delivery</option><option value="cap">Available capacity</option><option value="rating">Carrier rating</option></select></FormField>
 <FormField label="Max price (₹)"><input type="number" className="inp" value={maxP} onChange={e=>setMaxP(e.target.value)} placeholder="Any"/></FormField>
 <FormField label="Min rating"><select className="inp" value={minR} onChange={e=>setMinR(Number(e.target.value))}><option value={0}>Any</option><option value={4.5}>4.5+</option><option value={4.7}>4.7+</option></select></FormField>
 <div className="flex items-end text-xs text-slate-500">Compatibility is a prototype matching score.</div></div>
 <div className="mt-5 space-y-4">{res.length?res.map(m=><CarrierCard key={m.j.id} j={m.j} score={m.score} weight={Number(sh.weight)}/>):
 <EmptyState title="No compatible capacity found" text="No journeys match this route, weight, date and cargo category. Adjust your shipment or try a later date."><a href="#/ship" className="btn b1">Change shipment details</a><button className="btn b2" onClick={()=>{const d=new Date(sh.date);d.setDate(d.getDate()+1);set({shipment:{...sh,date:d.toISOString().slice(0,10)}});setL(true);setTimeout(()=>setL(false),500)}}>Try another date</button></EmptyState>}</div>
 <div className="mt-6"><Trust/></div></Page>}

/* ---------- Booking ---------- */
function Booking({id}){
 const {s,set,go}=useContext(Ctx);const sh=s.shipment;
 const [f,setF]=useState({pc:'',pa:'',dc:'',da:'',decl:false});const [er,setEr]=useState({});const [busy,setBusy]=useState(false);
 const bk=(s.bookings||{})[id];
 if(/^CAP-/.test(id)){ if(!bk)return <Page><EmptyState title="Invalid booking ID" text={`We couldn't find booking ${id}.`}><a href="#/ship" className="btn b1">Ship Something</a></EmptyState></Page>;
  return <Confirmed b={bk}/>}
 const j=J.find(x=>x.id===id);
 if(!j)return <Page><EmptyState title="Capacity not found" text="This journey doesn't exist or is no longer available."><a href="#/ship" className="btn b1">Find capacity</a></EmptyState></Page>;
 if(!sh)return <Page><EmptyState title="Missing shipment" text="Enter your shipment details before booking."><a href="#/ship" className="btn b1">Ship Something</a></EmptyState></Page>;
 const w=Number(sh.weight);
 if(w>j.avail)return <Page><EmptyState title="Shipment exceeds available capacity" text={`${kg(w)} is more than the ${kg(j.avail)} available on this journey.`}><a href="#/matches" className="btn b1">Back to matches</a></EmptyState></Page>;
 if(busy)return <LoadingState text="Confirming available capacity..."/>;
 const u=k=>e=>setF({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value});
 const confirm=e=>{e.preventDefault();const x={};if(!f.pc.trim())x.pc='Required';if(!f.pa.trim())x.pa='Required';if(!f.dc.trim())x.dc='Required';if(!f.da.trim())x.da='Required';if(!f.decl)x.decl='You must accept the shipment declaration';setEr(x);if(Object.keys(x).length)return;
  setBusy(true);setTimeout(()=>{const n=Object.keys(s.bookings||{}).length;const bid='CAP-'+(10284+n);
   const b={id:bid,j,shipment:sh,pickup:{c:f.pc,a:f.pa},delivery:{c:f.dc,a:f.da},step:2,created:new Date().toISOString()};
   set(o=>({bookings:{...(o.bookings||{}),[bid]:b},lastBooking:bid}));setBusy(false);go('/booking/'+bid)},1200)};
 const row=(a,b)=><div className="flex justify-between gap-4 py-2 border-b border-slate-100 text-sm"><span className="text-slate-500">{a}</span><span className="font-semibold text-right">{b}</span></div>;
 return <Page w="max-w-5xl"><h1 className="text-3xl font-extrabold tracking-tight">Booking Summary</h1>
 <div className="grid md:grid-cols-5 gap-5 mt-6"><div className="card p-5 md:col-span-2 h-fit">{row('Shipment',kg(w))}{row('Route',`${sh.from} → ${sh.to}`)}{row('Carrier',j.carrier)}{row('Vehicle',j.vehicle)}{row('Departure',`${rel(j.date)}, ${t12(j.time)}`)}{row('Est. delivery',`${rel(j.edate)}, ${t12(j.etime)}`)}{row('Price',inr(j.price))}<div className="mt-4"><CapacityBar total={j.total} used={j.cur} add={w}/></div><p className="text-[11px] text-slate-500 mt-3">Prototype booking — no real payment is processed.</p></div>
 <form onSubmit={confirm} noValidate className="card p-5 md:col-span-3 grid sm:grid-cols-2 gap-4"><h2 className="font-bold sm:col-span-2">Pickup details</h2>
 <FormField label="Contact name / phone" error={er.pc}><input className="inp" value={f.pc} onChange={u('pc')}/></FormField><FormField label={`Pickup address (${sh.from})`} error={er.pa}><input className="inp" value={f.pa} onChange={u('pa')}/></FormField>
 <h2 className="font-bold sm:col-span-2">Delivery details</h2><FormField label="Receiver name / phone" error={er.dc}><input className="inp" value={f.dc} onChange={u('dc')}/></FormField><FormField label={`Delivery address (${sh.to})`} error={er.da}><input className="inp" value={f.da} onChange={u('da')}/></FormField>
 <div className="sm:col-span-2"><label className="flex gap-2 text-sm"><input type="checkbox" checked={f.decl} onChange={u('decl')} className="mt-1"/>I declare that the shipment matches the details entered and contains no prohibited goods.</label>{er.decl&&<span role="alert" className="text-xs text-red-600">{er.decl}</span>}</div>
 <div className="sm:col-span-2"><button className="btn b1">Confirm Booking</button></div></form></div></Page>}
function Confirmed({b}){return <Page w="max-w-xl"><div className="card p-8 text-center"><div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center"><Icon n="check" s={28}/></div><h1 className="text-3xl font-extrabold mt-4">You're Matched.</h1><div className="mt-4 text-xs text-slate-500">Booking ID</div><div className="text-3xl font-extrabold text-indigo-600 tracking-wide">{b.id}</div><p className="text-slate-600 mt-3">Your shipment has been matched with available capacity.</p><p className="text-sm text-slate-500 mt-1">{b.shipment.from} → {b.shipment.to} · {kg(b.shipment.weight)} · {b.j.carrier}</p><a href={`#/tracking/${b.id}`} className="btn b1 mt-6">Track Shipment</a></div></Page>}

/* ---------- Tracking ---------- */
function Tracking({id}){
 const {s,set,toast}=useContext(Ctx);const [q,setQ]=useState('');const b=id&&(s.bookings||{})[id];
 if(!id||!b)return <Page w="max-w-xl"><EmptyState title={id?'Invalid booking ID':'Track a shipment'} text={id?`No booking found for ${id}.`:'Enter your booking ID to see progress.'}>
  <form className="flex gap-2 w-full" onSubmit={e=>{e.preventDefault();q.trim()&&(location.hash='#/tracking/'+q.trim().toUpperCase())}}><input className="inp" placeholder="CAP-10284" value={q} onChange={e=>setQ(e.target.value)} aria-label="Booking ID"/><button className="btn b1">Track</button></form></EmptyState></Page>;
 const st=b.step;const pos=[0,.1,.2,.55,1][st-1]??.1;
 return <Page><h1 className="text-3xl font-extrabold tracking-tight">{b.id}</h1><div className="mt-1"><RouteDisplay from={b.shipment.from} to={b.shipment.to}/></div>
 <p className="text-slate-600 text-sm mt-1">{kg(b.shipment.weight)} · {b.j.carrier}</p>
 <div className="grid md:grid-cols-2 gap-5 mt-6"><div className="card p-6"><h2 className="font-bold mb-4">Progress</h2><StatusTimeline step={st}/><button className="btn b2 mt-6 text-sm" disabled={st>=5} onClick={()=>{set(o=>({bookings:{...o.bookings,[b.id]:{...b,step:Math.min(5,st+1)}}}));toast('Demo: status advanced')}}>Advance status (demo)</button></div>
 <div className="card p-6"><h2 className="font-bold mb-2">Route</h2><svg viewBox="0 0 300 120" className="w-full"><path id="rt" d="M30 90 C100 10, 200 110, 270 30" fill="none" stroke="#c7d2fe" strokeWidth="4"/><path d="M30 90 C100 10, 200 110, 270 30" fill="none" stroke="#4f46e5" strokeWidth="3" className="dash"/><circle cx="30" cy="90" r="7" fill="#1f2328"/><circle cx="270" cy="30" r="7" fill="#4f46e5"/><text x="30" y="110" fontSize="11" textAnchor="middle">{b.shipment.from}</text><text x="270" y="18" fontSize="11" textAnchor="middle">{b.shipment.to}</text><circle r="8" fill="#fff" stroke="#4f46e5" strokeWidth="3"><animateMotion dur="0.01s" fill="freeze" keyPoints={`${pos};${pos}`} keyTimes="0;1" calcMode="linear"><mpath href="#rt"/></animateMotion></circle></svg>
 <p className="text-xs bg-amber-50 text-amber-800 rounded-lg p-2">Prototype tracking — live GPS integration can be added in a production version.</p></div>
 <div className="card p-6"><h2 className="font-bold mb-2">Shipment details</h2><p className="text-sm text-slate-600">{b.shipment.cat} · {kg(b.shipment.weight)}{b.shipment.dims?` · ${b.shipment.dims}`:''}<br/>Pickup: {b.pickup.a} ({b.pickup.c})<br/>Delivery: {b.delivery.a} ({b.delivery.c})</p></div>
 <div className="card p-6"><h2 className="font-bold mb-2">Carrier details</h2><p className="text-sm text-slate-600">{b.j.carrier} <span className="text-emerald-700">✓ Verified</span><br/>{b.j.vehicle} · rated {b.j.rating}<br/>Departs {rel(b.j.date)}, {t12(b.j.time)}<br/>Est. delivery {rel(b.j.edate)}, {t12(b.j.etime)}<br/>Booking ID: {b.id}</p></div></div></Page>}

/* ---------- Offer capacity ---------- */
function Capacity(){
 const {s,set,go}=useContext(Ctx);const [f,setF]=useState(s.cj||{from:'Delhi',to:'Jaipur',date:iso(0),time:'08:00',vehicle:'Truck',total:1500,cur:1000});const [er,setEr]=useState({});
 const u=k=>e=>setF({...f,[k]:e.target.value});const t=Number(f.total)||0,c=Number(f.cur)||0;
 const sub=e=>{e.preventDefault();const x={};if(!f.from)x.from='Required';if(!f.to)x.to='Required';else if(f.to===f.from)x.to='Must differ from start';if(!f.date)x.date='Required';if(!f.time)x.time='Required';
  if(!(t>0))x.total='Enter a valid capacity';if(f.cur===''||c<0)x.cur='Enter current cargo (0 or more)';else if(c>t)x.cur='Cargo cannot exceed total capacity';setEr(x);if(Object.keys(x).length)return;
  set({cj:{...f,total:t,cur:c},accepted:[]});go('/carrier')};
 return <Page w="max-w-3xl"><h1 className="text-3xl font-extrabold tracking-tight">Offer Capacity</h1><p className="text-slate-600 mt-2">Declare your journey and unused space. We'll find shipments that fit.</p>
 <form onSubmit={sub} noValidate className="card p-6 mt-6 grid sm:grid-cols-2 gap-4">
 <FormField label="Starting City" error={er.from}><CitySelector value={f.from} onChange={v=>setF({...f,from:v})}/></FormField><FormField label="Destination City" error={er.to}><CitySelector value={f.to} onChange={v=>setF({...f,to:v})}/></FormField>
 <FormField label="Journey Date" error={er.date}><input type="date" className="inp" value={f.date} onChange={u('date')}/></FormField><FormField label="Departure Time" error={er.time}><input type="time" className="inp" value={f.time} onChange={u('time')}/></FormField>
 <div className="sm:col-span-2"><FormField label="Vehicle Type"><select className="inp" value={f.vehicle} onChange={u('vehicle')}>{['Mini Truck','Commercial Van','Pickup','Truck','Other Commercial Vehicle'].map(v=><option key={v}>{v}</option>)}</select></FormField></div>
 <FormField label="Total Vehicle Capacity (kg)" error={er.total}><input type="number" className="inp" value={f.total} onChange={u('total')}/></FormField><FormField label="Current Cargo (kg)" error={er.cur}><input type="number" className="inp" value={f.cur} onChange={u('cur')}/></FormField>
 <div className="sm:col-span-2 rounded-xl bg-indigo-50 p-4"><div className="font-bold text-indigo-700 mb-2">Available Capacity = {kg(Math.max(t-c,0))}</div><CapacityBar total={t||1} used={Math.min(c,t)}/></div>
 <div className="sm:col-span-2"><button className="btn b1"><Icon n="search" s={16}/>Find Shipments</button></div></form></Page>}

/* ---------- Carrier ---------- */
function Carrier(){
 const {s,set,toast}=useContext(Ctx);const j=s.cj||{from:'Delhi',to:'Jaipur',date:iso(0),time:'08:00',vehicle:'14-ft Truck',total:1500,cur:1000};
 const acc=s.accepted||[];const used=j.cur+acc.reduce((a,x)=>a+x.w,0);const avail=j.total-used;
 const [view,setView]=useState('dash');
 const T=[['Retail Co.',200,2100,'Retail Goods','5–7 AM'],['Electronics Hub',150,1600,'Electronics','7–9 AM'],['Home Furnishings',100,1050,'Furniture','9–11 AM']];
 const all=T.map(([k,w,e,cat,win],i)=>({id:`${j.to}-${j.from}-${i}`,biz:`${j.to} ${k}`,w,e,cat,win,from:j.to,to:j.from})).filter(x=>!acc.find(a=>a.id===x.id)&&!(j.vehicle==='Pickup'&&x.cat==='Furniture'));
 let room=avail;const fit=all.filter(x=>x.w<=room&&(room-=x.w,true));const pot=fit.reduce((a,x)=>a+x.e,0);const got=acc.reduce((a,x)=>a+x.e,0);
 const accept=x=>{if(x.w>avail){toast('Not enough capacity left');return}set(o=>({accepted:[...(o.accepted||[]),x]}));toast(`Accepted ${x.biz}`)};
 return <Page><h1 className="text-3xl font-extrabold tracking-tight">Carrier Portal</h1>
 <div className="grid md:grid-cols-3 gap-4 mt-6"><MetricCard label="Available capacity" value={kg(avail)} icon="box"/><MetricCard label="Accepted shipments" value={acc.length} icon="check"/><MetricCard label="Confirmed extra earnings" value={inr(got)} icon="coin" tone="text-emerald-600"/></div>
 <div className="card p-6 mt-5"><div className="text-xs text-slate-500 mb-1">Today's Journey · {j.vehicle}</div><RouteDisplay big from={j.from} to={j.to}/><div className="text-sm text-slate-600 mt-1">{rel(j.date)}, {t12(j.time)} · Total {kg(j.total)} · Cargo {kg(used)} · Available {kg(avail)}</div><div className="mt-4"><CapacityBar total={j.total} used={j.cur} add={used-j.cur}/></div></div>
 <div className="card p-6 mt-5 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white"><div className="text-xs font-bold tracking-widest text-indigo-600">RETURN TRIP OPPORTUNITY</div>
 <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm"><div>Current Journey<div className="font-bold"><RouteDisplay from={j.from} to={j.to}/></div></div><div>Return Journey<div className="font-bold"><RouteDisplay from={j.to} to={j.from}/></div></div></div>
 <div className="inline-block mt-3 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full px-3 py-1">Returning with available capacity</div>
 {view==='dash'&&<><h2 className="font-bold mt-4">{fit.length} Compatible Shipment{fit.length!==1&&'s'}</h2><ul className="text-sm mt-2 space-y-1">{fit.map((x,i)=><li key={x.id} className="flex justify-between border-b border-slate-100 py-1"><span>Shipment {i+1}: {kg(x.w)}</span><b>{inr(x.e)}</b></li>)}</ul>
 <div className="flex flex-wrap items-center justify-between gap-3 mt-4"><div><div className="text-xs text-slate-500">Potential additional earnings</div><div className="text-3xl font-extrabold text-indigo-600">{inr(pot)}</div></div><button className="btn b1" disabled={!fit.length} onClick={()=>setView('match')}>Match Return Loads</button></div>{!fit.length&&<p className="text-sm text-slate-500 mt-2">No more compatible shipments fit the remaining capacity.</p>}</>}</div>
 {view==='match'&&<div className="mt-5 fade"><div className="flex justify-between items-center mb-3"><h2 className="text-xl font-bold">Return loads · {j.to} → {j.from}</h2><button className="btn b2 text-sm" onClick={()=>setView('dash')}>Back to overview</button></div>
 {all.length?<div className="grid md:grid-cols-2 gap-4">{all.map(x=><article key={x.id} className="card p-5"><h3 className="font-bold">{x.biz}</h3><RouteDisplay from={x.from} to={x.to}/><p className="text-sm text-slate-600 mt-1">{kg(x.w)} · {x.cat}<br/>Pickup: {rel(j.date)} {x.win}</p><div className="flex justify-between items-center mt-3"><div><div className="text-xs text-slate-500">Potential earning</div><b className="text-xl">{inr(x.e)}</b></div><button className="btn b1" disabled={x.w>avail} onClick={()=>accept(x)}>{x.w>avail?'Too large':'Accept Shipment'}</button></div></article>)}</div>:<EmptyState title="No more return loads" text="All compatible shipments have been accepted."/>}</div>}
 {acc.length>0&&<div className="mt-5"><h2 className="font-bold mb-2">Accepted return loads</h2><div className="space-y-2">{acc.map(x=><div key={x.id} className="card p-3 flex justify-between text-sm"><span><Icon n="check" s={14} c="inline text-emerald-600 mr-1"/>{x.biz} · {kg(x.w)}</span><b>{inr(x.e)}</b></div>)}</div></div>}
 <p className="text-xs text-slate-500 mt-6">Return shipments shown are prototype sample data. <a href="#/capacity" className="underline">Edit journey</a></p></Page>}

/* ---------- Static pages ---------- */
function How(){const S=['Enter shipment','Find compatible journeys','Compare carriers','Book available capacity','Track shipment'],C=['Post your journey','Declare available capacity','Receive compatible shipments','Fill unused capacity','Earn additional revenue'];
 const col=(t,a,l,h)=><div className="card p-6"><h2 className="text-xl font-bold">{t}</h2><ol className="mt-4 space-y-3">{a.map((x,i)=><li key={x} className="flex gap-3 items-center"><span className="w-8 h-8 rounded-full bg-indigo-600 text-white grid place-items-center text-sm font-bold">{i+1}</span>{x}</li>)}</ol><a href={h} className="btn b1 mt-5">{l}</a></div>;
 return <Page><h1 className="text-4xl font-extrabold tracking-tight">How it works</h1><p className="text-slate-600 mt-2 max-w-2xl">Book the space, not the truck. A vehicle is already going there — CAPACITY helps you use the space it has left.</p><div className="grid md:grid-cols-2 gap-5 mt-8">{col('For Shippers',S,'Ship Something','#/ship')}{col('For Carriers',C,'Offer Capacity','#/capacity')}</div></Page>}
const About=()=><Page w="max-w-3xl"><h1 className="text-4xl font-extrabold tracking-tight">About CAPACITY</h1><p className="mt-4 text-slate-600">CAPACITY is designed to make better use of commercial transportation capacity that already exists.</p><blockquote className="text-2xl font-extrabold text-indigo-700 my-6">Make every commercial journey more productive.</blockquote>
<p className="text-slate-600">This prototype focuses on route-based capacity matching. Future versions could explore the following — none are implemented today:</p><ul className="grid sm:grid-cols-2 gap-2 mt-4">{['Fleet integrations','Real-time tracking','Demand prediction','Dynamic pricing','Route optimization','Utilization analytics'].map(x=><li key={x} className="card p-3 text-sm">{x}</li>)}</ul><div className="mt-6"><Trust/></div><p className="text-xs text-slate-500 mt-4">Carrier verification, payments, insurance and GPS are not implemented in this prototype.</p></Page>;
function Profile(){const {s,set,toast}=useContext(Ctx);const [tab,setTab]=useState(0);const p=s.profile||{name:'Anita Sharma',company:'Sharma Home Décor Pvt. Ltd.',email:'anita@sharmadecor.example',phone:'+91 98100 00000',city:'Jaipur'};
 const [m,setM]=useState(false);const [f,setF]=useState(p);const bs=Object.values(s.bookings||{});const sv=J.filter(j=>(s.saved||[]).includes(j.id));
 return <Page w="max-w-4xl"><h1 className="text-3xl font-extrabold tracking-tight">Profile</h1><p className="text-xs text-slate-500">Prototype profile with sample data stored in your browser.</p>
 <div className="flex gap-2 mt-5 overflow-x-auto" role="tablist">{['Personal Information','Shipments','Bookings','Saved Carriers'].map((t,i)=><button key={t} role="tab" aria-selected={tab===i} onClick={()=>setTab(i)} className={`btn whitespace-nowrap ${tab===i?'b1':'b2'}`}>{t}</button>)}</div>
 <div className="card p-6 mt-4">{tab===0&&<div><dl className="grid sm:grid-cols-2 gap-4 text-sm">{[['Name',p.name],['Company',p.company],['Email',p.email],['Phone',p.phone],['City',p.city]].map(([a,b])=><div key={a}><dt className="text-slate-500 text-xs">{a}</dt><dd className="font-semibold">{b}</dd></div>)}</dl><button className="btn b2 mt-5" onClick={()=>{setF(p);setM(true)}}>Edit</button></div>}
 {tab===1&&(s.shipment?<div><RouteDisplay from={s.shipment.from} to={s.shipment.to}/><p className="text-sm text-slate-600 mt-1">{kg(s.shipment.weight)} · {s.shipment.cat} · Pickup {rel(s.shipment.date)}</p></div>:<p className="text-slate-600">No shipments yet. <a className="underline" href="#/ship">Ship something</a></p>)}
 {tab===2&&(bs.length?<div className="space-y-3">{bs.map(b=><a key={b.id} href={'#/tracking/'+b.id} className="flex justify-between border border-slate-200 rounded-xl p-3 hover:border-indigo-400"><span><b>{b.id}</b> · {b.shipment.from} → {b.shipment.to}</span><span className="text-sm text-slate-500">{b.j.carrier}</span></a>)}</div>:<p className="text-slate-600">No bookings yet.</p>)}
 {tab===3&&(sv.length?<div className="space-y-3">{sv.map(j=><div key={j.id} className="flex justify-between border border-slate-200 rounded-xl p-3"><span><b>{j.carrier}</b> · {j.from} → {j.to}</span><span>★ {j.rating}</span></div>)}</div>:<p className="text-slate-600">No saved carriers. Use the star on any carrier card.</p>)}</div>
 {m&&<Modal title="Edit profile" onClose={()=>setM(false)}><form className="space-y-3" onSubmit={e=>{e.preventDefault();if(!f.name.trim()){toast('Name is required');return}set({profile:f});setM(false);toast('Profile updated')}}>{[['name','Name'],['company','Company'],['email','Email'],['phone','Phone'],['city','City']].map(([k,l])=><FormField key={k} label={l}><input className="inp" value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></FormField>)}<button className="btn b1 w-full">Save</button></form></Modal>}</Page>}
const NotFound=()=><Page><EmptyState title="404 — Page not found" text="This route doesn't exist."><a href="#/" className="btn b1">Back to home</a></EmptyState></Page>;

/* ---------- App ---------- */
function App(){
 const [path,setPath]=useState(()=>location.hash.slice(1)||'/');const [s,setS]=useState(load);const [msg,setMsg]=useState('');
 useEffect(()=>{const h=()=>{setPath(location.hash.slice(1)||'/');scrollTo(0,0)};addEventListener('hashchange',h);return()=>removeEventListener('hashchange',h)},[]);
 const set=p=>setS(o=>{const n={...o,...(typeof p==='function'?p(o):p)};try{localStorage.setItem(KEY,JSON.stringify(n))}catch(e){}return n});
 const go=p=>{location.hash='#'+p};const toast=m=>{setMsg(m);setTimeout(()=>setMsg(''),2200)};
 const [,a,b]=path.split('?')[0].split('/');
 let v;switch(a){case'':v=<Home/>;break;case'ship':v=<Ship/>;break;case'matches':v=<Matches/>;break;case'booking':v=b?<Booking key={b} id={decodeURIComponent(b)}/>:<NotFound/>;break;case'tracking':v=<Tracking id={b&&decodeURIComponent(b)}/>;break;case'capacity':v=<Capacity/>;break;case'carrier':v=<Carrier/>;break;case'how-it-works':v=<How/>;break;case'about':v=<About/>;break;case'profile':v=<Profile/>;break;default:v=<NotFound/>}
 return <Ctx.Provider value={{s,set,go,toast}}><Navbar path={path}/>{v}<Footer/><Toast msg={msg}/></Ctx.Provider>}
export default App;
