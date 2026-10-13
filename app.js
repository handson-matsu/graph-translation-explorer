 'use strict';
const $ = id => document.getElementById(id);
const defaults = {kind:'quadratic',a:1,b:0,p:2,q:0,x:0,trackX:1,view:'comparison',tableStep:1,tableMin:-2,tableMax:2};
const state = {...defaults};
const fmt = n => Number(n.toFixed(4)).toString();
const signed = n => n<0?`− ${fmt(-n)}`:`+ ${fmt(n)}`;
const subtract = n => n<0?`+ ${fmt(-n)}`:`− ${fmt(n)}`;
const f = x => state.kind==='quadratic'?state.a*x*x:state.a*x+state.b;
const moved = x => f(x-state.p)+state.q;
const base = arg => `${state.a===1?'':state.a===-1?'−':fmt(state.a)+' × '}${state.kind==='quadratic'?arg+'²':arg}${state.kind==='linear'&&state.b!==0?' '+signed(state.b):''}`;
let animation=null,frame=null;
function stop(){if(frame)cancelAnimationFrame(frame);frame=null;animation=null;}
function selectX(x){stop();state.x=x;state.view='comparison';render();}
function values(){return Array.from({length:Math.floor((state.tableMax-state.tableMin)/state.tableStep)+1},(_,i)=>state.tableMin+i*state.tableStep);}
function caption(){
 const tracking=state.view==='translation',x=tracking?state.trackX:state.x;
 $('comparison-x').textContent=tracking?'点の平行移動を追跡中':`共通の x = ${fmt(x)}`;
 $('compare').classList.toggle('active',!tracking);
 $('point-caption').textContent=tracking?`点の移動：(${fmt(x)}, ${fmt(f(x))}) → (${fmt(x+state.p)}, ${fmt(f(x)+state.q)})`:`同じ x：元 (${fmt(x)}, ${fmt(f(x))}) ／ 新 (${fmt(x)}, ${fmt(moved(x))})`;
}
function draw(){const g=$('graph'), W=640,H=480;const tracking=state.view==='translation',sx=tracking?state.trackX:state.x;const nx=tracking?sx+state.p:sx,ny=tracking?f(sx)+state.q:f(sx-state.p)+state.q;const extentX=Math.max(6,Math.abs(nx)+2,Math.abs(sx)+2),extentY=Math.max(6,Math.abs(f(sx))+2,Math.abs(ny)+2);const px=x=>W/2+x*(W-70)/(2*extentX),py=y=>H/2-y*(H-60)/(2*extentY);const line=(x1,y1,x2,y2,color,width=1,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;let s='<defs><clipPath id="plot"><rect x="0" y="0" width="640" height="480"/></clipPath></defs>';const tick=extentY>18?5:extentY>10?2:1;for(let x=-Math.floor(extentX);x<=extentX;x++){s+=line(px(x),0,px(x),H,'#e7eee7');if(x!==0)s+=`<text x="${px(x)}" y="${py(0)+18}" text-anchor="middle" font-size="11" fill="#839187">${x}</text>`;}for(let y=-Math.floor(extentY/tick)*tick;y<=extentY;y+=tick){s+=line(0,py(y),W,py(y),'#e7eee7');if(y!==0)s+=`<text x="${px(0)-9}" y="${py(y)+4}" text-anchor="end" font-size="11" fill="#839187">${y}</text>`;}s+=line(0,py(0),W,py(0),'#8fa096',1.5)+line(px(0),0,px(0),H,'#8fa096',1.5)+`<text x="625" y="${py(0)-9}" fill="#677b6c">x</text><text x="${px(0)+10}" y="17" fill="#677b6c">y</text><text x="${px(0)-14}" y="${py(0)+18}" font-size="11" fill="#839187">0</text>`;
const showNew=true;const curve=moved=>{let d='';for(let i=0;i<=600;i++){let x=-extentX*1.15+i/600*extentX*2.3;let y=moved?f(x-state.p)+state.q:f(x);d+=`${i?'L':'M'}${px(x).toFixed(2)},${py(y).toFixed(2)} `;}return `<path d="${d}" fill="none" stroke="${moved?'#da6835':'#087f79'}" stroke-width="3" ${moved?'stroke-dasharray="8 5"':''}/>`;};s+='<g clip-path="url(#plot)">'+curve(false)+(showNew?curve(true):'');const ox=px(sx),oy=py(f(sx)),tx=px(nx),ty=py(ny);if(showNew)s+=line(ox,oy,tx,ty,'#da6835',2,'stroke-dasharray="5 5"');const dot=(x,y,color)=>`<circle cx="${x}" cy="${y}" r="12" fill="${color}" opacity=".12"/><circle cx="${x}" cy="${y}" r="6" fill="${color}" stroke="white" stroke-width="2"/>`;s+=dot(ox,oy,'#087f79');if(showNew){let t=animation===null?1:animation;s+=dot(ox+(tx-ox)*t,oy+(ty-oy)*t,'#da6835');}if(nx===sx&&ny===f(sx))s+=`<circle cx="${ox}" cy="${oy}" r="9" fill="none" stroke="#087f79" stroke-width="2"/>`;s+='</g>';g.innerHTML=s;g.dataset.view=state.view;g.setAttribute('aria-label',`元の点 (${fmt(sx)}, ${fmt(f(sx))})${showNew?` と移動後の点 (${fmt(nx)}, ${fmt(ny)})`:''}`);}
function render(){
 $('b-wrap').hidden=state.kind!=='linear';
 $('p-value').textContent=fmt(state.p);$('q-value').textContent=fmt(state.q);
 $('original-formula').textContent='y = '+base('x');
 $('moved-formula').textContent='y = '+base(`(x ${subtract(state.p)})`)+(state.q!==0?' '+signed(state.q):'');
 $('input-heading').textContent=state.p===0?'x − 0':`x ${subtract(state.p)}`;
 $('rows').innerHTML=values().map(x=>`<tr data-x="${x}" class="${state.view==='comparison'&&x===state.x?'selected ':''}${x===0?'zero-row':''}" aria-selected="${state.view==='comparison'&&x===state.x}"><td class="matching"><button aria-label="x が ${fmt(x)} の行を選択">${fmt(x)}${x===0?'<span class="zero-mark" aria-hidden="true">基準</span>':''}</button></td><td>${fmt(f(x))}</td><td class="matching">${fmt(x-state.p)}</td><td>${fmt(moved(x))}</td></tr>`).join('');
 caption();draw();
}
for(const id of ['kind','a','b','p','q','source-x'])$(id).addEventListener('input',()=>{
 const el=$(id);if(id==='kind')state.kind=el.value;
 else {if(el.value===''||!Number.isFinite(Number(el.value)))return;const n=Math.max(Number(el.min),Math.min(Number(el.max),Number(el.value)));state[id==='source-x'?'trackX':id]=n;if(n!==Number(el.value))el.value=n;}
 stop();render();
});
function updateRange(){
 const min=Number($('table-min').value),max=Number($('table-max').value);
 const valid=$('table-min').value!==''&&$('table-max').value!==''&&min>=-10&&max<=10&&min<=max&&Number.isInteger(min*2)&&Number.isInteger(max*2);
 $('range-feedback').hidden=valid;
 if(!valid){$('range-feedback').textContent='−10〜10の範囲で、最小 ≤ 最大、0.5刻みの値を入力してください。';return;}
 stop();state.tableMin=min;state.tableMax=max;state.tableStep=Number($('table-step').value);
 if(!values().includes(state.x))state.x=values().reduce((best,x)=>Math.abs(x-state.x)<Math.abs(best-state.x)?x:best);
 render();
}
for(const id of ['table-min','table-max','table-step'])$(id).addEventListener(id==='table-step'?'change':'input',updateRange);
$('rows').addEventListener('click',e=>{const row=e.target.closest('[data-x]');if(row)selectX(Number(row.dataset.x));});
$('compare').onclick=()=>selectX(state.x);
$('reset').onclick=()=>{stop();Object.assign(state,defaults);for(const id of ['kind','a','b','p','q'])$(id).value=state[id];$('source-x').value=state.trackX;$('table-min').value=state.tableMin;$('table-max').value=state.tableMax;$('table-step').value=state.tableStep;$('range-feedback').hidden=true;render();};
$('animate').onclick=()=>{
 stop();state.view='translation';animation=0;render();const start=performance.now();
 function tick(t){animation=Math.min(1,(t-start)/1000);draw();if(animation<1)frame=requestAnimationFrame(tick);else {animation=null;frame=null;}}
 frame=requestAnimationFrame(tick);
};
render();
