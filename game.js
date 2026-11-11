import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const mount=document.querySelector('#game');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9bc9df);
scene.fog=new THREE.Fog(0x9bc9df,105,245);
const camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.1,420);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
mount.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdff3ff,0x53704c,2.0));
const sun=new THREE.DirectionalLight(0xfff0d7,3.0);sun.position.set(-45,70,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-90;sun.shadow.camera.right=90;sun.shadow.camera.top=90;sun.shadow.camera.bottom=-90;sun.shadow.bias=-.0002;scene.add(sun);
const mats={
 road:new THREE.MeshStandardMaterial({color:0x343b42,roughness:.92}),edge:new THREE.MeshStandardMaterial({color:0x777e81,roughness:.9}),grass:new THREE.MeshStandardMaterial({color:0x638d65,roughness:1}),
 curbRed:new THREE.MeshStandardMaterial({color:0xe9433e,roughness:.72}),curbWhite:new THREE.MeshStandardMaterial({color:0xf3eee1,roughness:.72}),
 tire:new THREE.MeshStandardMaterial({color:0x121619,roughness:.96}),rim:new THREE.MeshStandardMaterial({color:0xb7c3ca,metalness:.7,roughness:.28}),wing:new THREE.MeshStandardMaterial({color:0x202830,roughness:.5}),glass:new THREE.MeshStandardMaterial({color:0x182634,metalness:.38,roughness:.22}),
 white:new THREE.MeshStandardMaterial({color:0xf7f4ed,roughness:.35}),gold:new THREE.MeshStandardMaterial({color:0xe8c74f,metalness:.55,roughness:.3})};
const trackA=48,trackB=32;
function center(t){return new THREE.Vector3(trackA*Math.cos(t)+3.6*Math.sin(2*t),.04,trackB*Math.sin(t)+2.4*Math.sin(3*t));}
function tangent(t){const e=.001,a=center(t-.001),b=center(t+.001);return b.sub(a).normalize();}
function side(t){const d=tangent(t);return new THREE.Vector3(d.z,0,-d.x).normalize();}
function trackMesh(width,material,y){const n=420,verts=[],idx=[];for(let i=0;i<=n;i++){const t=i/n*Math.PI*2,c=center(t),s=side(t);verts.push(c.x-s.x*width/2,y,c.z-s.z*width/2,c.x+s.x*width/2,y,c.z+s.z*width/2);if(i<n){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(idx);g.computeVertexNormals();const mesh=new THREE.Mesh(g,material);mesh.receiveShadow=true;scene.add(mesh);return mesh;}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),mats.grass);ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;scene.add(ground);
trackMesh(19,mats.edge,-.09);trackMesh(14,mats.road,-.025);
// Alternating kerbs at the outside of each corner.
const curbGeo=new THREE.BoxGeometry(2.05,.24,.8);
for(let i=0;i<176;i++){const t=i/176*Math.PI*2,d=tangent(t),s=side(t),p=center(t),heading=Math.atan2(d.x,d.z);for(const sign of [-1,1]){const curb=new THREE.Mesh(curbGeo,i%2?mats.curbWhite:mats.curbRed);curb.position.set(p.x+s.x*sign*7.35,.055,p.z+s.z*sign*7.35);curb.rotation.y=heading;curb.castShadow=true;curb.receiveShadow=true;scene.add(curb)}}
// A start/finish gantry and a clean grid stripe.
function roadBar(t,width,color,y=.07,height=.16){const d=tangent(t),s=side(t),p=center(t),m=new THREE.Mesh(new THREE.BoxGeometry(width,height,1.05),new THREE.MeshStandardMaterial({color,roughness:.65}));m.position.set(p.x,p.y+y,p.z);m.rotation.y=Math.atan2(d.x,d.z);scene.add(m);return m;}
for(let i=0;i<14;i++){const p=center(.015),d=tangent(.015),s=side(.015),tile=new THREE.Mesh(new THREE.BoxGeometry(1,.035,1),new THREE.MeshStandardMaterial({color:i%2?0x11161a:0xf7f3e8}));tile.position.set(p.x+s.x*(i-6.5),.03,p.z+s.z*(i-6.5));tile.rotation.y=Math.atan2(d.x,d.z);scene.add(tile)}
// Palms, track flags, and low coastal ridges establish the circuit.
const trunkMat=new THREE.MeshStandardMaterial({color:0x735b42,roughness:1}),leafMat=new THREE.MeshStandardMaterial({color:0x297558,roughness:.9}),hillMat=new THREE.MeshStandardMaterial({color:0x75988c,roughness:1});
for(let i=0;i<38;i++){const t=i/38*Math.PI*2,p=center(t),s=side(t),sign=i%2?1:-1,offset=16+Math.sin(i*3)*2,x=p.x+s.x*offset*sign,z=p.z+s.z*offset*sign;if(i%3!==1){const h=4+(i%4)*.45;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.27,h,7),trunkMat);trunk.position.set(x,h/2-.05,z);trunk.castShadow=true;scene.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.65,3.4,7),leafMat);crown.position.set(x,h+1,z);crown.castShadow=true;scene.add(crown);const crown2=new THREE.Mesh(new THREE.ConeGeometry(1.25,2.8,7),leafMat);crown2.position.set(x,h+2.35,z);scene.add(crown2)}else{const signMesh=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.15,.18),new THREE.MeshStandardMaterial({color:i%2?0xe8edf0:0xd9ff4f,roughness:.45}));signMesh.position.set(x,1.25,z);signMesh.rotation.y=Math.atan2(-s.x*sign,-s.z*sign);scene.add(signMesh);const post=new THREE.Mesh(new THREE.BoxGeometry(.14,1.35,.14),mats.wing);post.position.set(x,.65,z);scene.add(post)}}
for(let i=0;i<22;i++){const t=i/22*Math.PI*2,p=center(t),s=side(t),sign=(i%2?1:-1),x=p.x+s.x*sign*(30+(i%4)*4),z=p.z+s.z*sign*(30+(i%4)*4),r=7+(i*7%10);const hill=new THREE.Mesh(new THREE.ConeGeometry(r,12+(i*5%13),7),hillMat);hill.position.set(x,4,z);hill.rotation.y=i*1.7;scene.add(hill)}
// Finish gantry is placed across the home straight.
const gantryGroup=new THREE.Group(),gantryMat=new THREE.MeshStandardMaterial({color:0x17222a,metalness:.25,roughness:.45});
for(const x of [-7.4,7.4]){const post=new THREE.Mesh(new THREE.BoxGeometry(.35,6.8,.4),gantryMat);post.position.set(x,3.35,0);gantryGroup.add(post)}const beam=new THREE.Mesh(new THREE.BoxGeometry(15.2,.6,.7),gantryMat);beam.position.y=6.45;gantryGroup.add(beam);for(let i=0;i<5;i++){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshBasicMaterial({color:0xff4138}));lamp.position.set(-4+i*2,6.05,.1);gantryGroup.add(lamp)}gantryGroup.position.copy(center(Math.PI));gantryGroup.rotation.y=Math.atan2(tangent(Math.PI).x,tangent(Math.PI).z);scene.add(gantryGroup);

function makeCar(color,number,player=false){const root=new THREE.Group();const paint=new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.3});const dark=new THREE.MeshStandardMaterial({color:0x1a232b,metalness:.12,roughness:.55});const accent=new THREE.MeshStandardMaterial({color:player?0xd9ff4f:0xf1f1e9,metalness:.15,roughness:.35});
function box(parent,geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
// Monocoque, tapered nose, front/rear wings.
box(root,new THREE.BoxGeometry(1.34,.42,2.6),paint,0,.62,-.05);
const nose=new THREE.Mesh(new THREE.ConeGeometry(.57,2.35,4),paint);nose.rotation.x=Math.PI/2;nose.position.set(0,.59,1.75);nose.scale.set(1,.8,1);nose.castShadow=true;root.add(nose);
box(root,new THREE.BoxGeometry(2.55,.14,.48),dark,0,.38,2.55);box(root,new THREE.BoxGeometry(2.35,.15,.45),dark,0,.54,-1.55);box(root,new THREE.BoxGeometry(1.85,.19,.63),paint,0,.87,-1.48);
// Side pods and cockpit surround.
box(root,new THREE.BoxGeometry(.52,.38,1.35),paint,-.88,.55,-.12);box(root,new THREE.BoxGeometry(.52,.38,1.35),paint,.88,.55,-.12);
const cockpit=new THREE.Mesh(new THREE.SphereGeometry(.48,.18,12,8),mats.glass);cockpit.scale.set(.74,.55,1.08);cockpit.position.set(0,.92,.35);root.add(cockpit);
const helmetMat=new THREE.MeshStandardMaterial({color:player?0xf0f0d8:color,metalness:.16,roughness:.36});const helmet=new THREE.Mesh(new THREE.SphereGeometry(.31,16,12),helmetMat);helmet.position.set(0,1.14,.28);root.add(helmet);const visor=new THREE.Mesh(new THREE.BoxGeometry(.48,.12,.17),dark);visor.position.set(0,1.15,.52);root.add(visor);
// Four exposed racing slicks.
for(const x of [-1.15,1.15])for(const z of [-1.05,1.45]){const tire=new THREE.Mesh(new THREE.CylinderGeometry(.47,.47,.39,18),mats.tire);tire.rotation.z=Math.PI/2;tire.position.set(x,.48,z);tire.castShadow=true;root.add(tire);const rim=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.405,12),mats.rim);rim.rotation.z=Math.PI/2;rim.position.set(x,.48,z);root.add(rim)}
// Number panel on engine cover.
const panel=box(root,new THREE.BoxGeometry(.62,.035,.43),accent,0,1.025,-.55);panel.name='number';if(player){const glow=new THREE.PointLight(0xcfff36,1.5,4);glow.position.set(0,1.3,-1.8);root.add(glow)}
root.userData={number};scene.add(root);return root;}
const playerCar=makeCar(0xe7443e,7,true);
const opponents=[{car:makeCar(0x2479df,12),t:.13,lat:-1.8,speed:39,name:'BLUE COMET'},{car:makeCar(0xf3c230,18),t:.26,lat:1.8,speed:42,name:'GOLDEN ARROW'},{car:makeCar(0x7d45c5,24),t:.39,lat:-1.7,speed:40,name:'VIOLET GT'},{car:makeCar(0x19a978,31),t:-.14,lat:1.7,speed:37,name:'EMERALD' }];
// Boost pickups hover above the racing line and replenish the rechargeable nitro.
const pickups=[];const pickupMat=new THREE.MeshStandardMaterial({color:0xd8ff3e,emissive:0x759d05,emissiveIntensity:1.2,metalness:.25,roughness:.26});
for(let i=0;i<5;i++){const t=.35+i*1.19,p=center(t),crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.72,0),pickupMat);crystal.position.set(p.x,1.25,p.z);crystal.castShadow=true;scene.add(crystal);const ring=new THREE.Mesh(new THREE.TorusGeometry(.92,.065,8,24),new THREE.MeshBasicMaterial({color:0xd8ff3e}));ring.position.copy(crystal.position);ring.rotation.x=Math.PI/2;scene.add(ring);pickups.push({t,crystal,ring,active:true})}

const ui={hud:document.querySelector('#hud'),intro:document.querySelector('#intro'),start:document.querySelector('#startBtn'),finish:document.querySelector('#finish'),again:document.querySelector('#againBtn'),timer:document.querySelector('#timer'),lap:document.querySelector('#lap'),speed:document.querySelector('#speed'),speedLabel:document.querySelector('#speedLabel'),boostFill:document.querySelector('#boostFill'),pos:document.querySelector('#pos'),positionText:document.querySelector('#positionText'),status:document.querySelector('#status'),mapDot:document.querySelector('#mapDot'),finishTitle:document.querySelector('#finishTitle'),finishTime:document.querySelector('#finishTime')};
const input={gas:false,left:false,right:false,drift:false,boost:false};let state='intro',playerT=0,lat=0,speed=0,boost=100,elapsed=0,countdown=3,boosting=false,driftCharge=0,last=performance.now(),finishPlace=0;
const keyMap={ArrowUp:'gas',KeyW:'gas',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ShiftLeft:'drift',ShiftRight:'drift',Space:'boost'};
function keyDown(e){if(state==='intro'&&(e.code==='Enter'||e.code==='Space')){startRace();e.preventDefault();return}if(keyMap[e.code]){input[keyMap[e.code]]=true;e.preventDefault()}if(e.code==='KeyR'){resetRace();e.preventDefault()}}
function keyUp(e){if(keyMap[e.code]){input[keyMap[e.code]]=false;e.preventDefault()}}
addEventListener('keydown',keyDown);addEventListener('keyup',keyUp);addEventListener('blur',()=>Object.keys(input).forEach(k=>input[k]=false));
document.querySelectorAll('.touch-btn').forEach(btn=>{const k=btn.dataset.key;const on=e=>{e.preventDefault();input[k]=true;btn.classList.add('down')},off=e=>{e.preventDefault();input[k]=false;btn.classList.remove('down')};btn.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,off))});
ui.start.addEventListener('click',startRace);ui.again.addEventListener('click',resetRace);
function startRace(){if(state!=='intro')return;ui.intro.classList.add('hidden');ui.hud.classList.add('active');state='countdown';countdown=3;ui.status.textContent='3';}
function resetRace(){state='intro';Object.keys(input).forEach(k=>input[k]=false);playerT=0;lat=0;speed=0;boost=100;elapsed=0;countdown=3;driftCharge=0;opponents[0].t=.13;opponents[1].t=.26;opponents[2].t=.39;opponents[3].t=-.14;opponents.forEach((o,i)=>o.speed=[39,42,40,37][i]);pickups.forEach(p=>{p.active=true;p.crystal.visible=true;p.ring.visible=true});ui.finish.classList.add('hidden');ui.hud.classList.remove('active');ui.intro.classList.remove('hidden');ui.status.textContent='';}
function wrapDelta(a,b){return ((a-b+Math.PI*3)%(Math.PI*2))-Math.PI;}
function placeCar(car,t,lateral){const p=center(t),s=side(t),d=tangent(t);car.position.set(p.x+s.x*lateral,.02,p.z+s.z*lateral);car.rotation.y=Math.atan2(d.x,d.z);}
function formatTime(s){const mm=Math.floor(s/60),ss=Math.floor(s%60),cs=Math.floor(s%1*100);return `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}.${String(cs).padStart(2,'0')}`}
function update(dt,now){
  // Idle motion keeps the title screen alive without moving the grid.
  pickups.forEach((p,i)=>{p.crystal.rotation.y=now*.0012+i;p.crystal.position.y=1.22+Math.sin(now*.002+i)*.15;p.ring.rotation.z=now*.0006});
  if(state==='countdown'){countdown-=dt;ui.status.textContent=countdown>2?'3':countdown>1?'2':countdown>0?'1':'GO!';if(countdown<=-.65){state='race';elapsed=0;ui.status.textContent='';}}
  if(state==='race'){
    elapsed+=dt;boosting=input.boost&&boost>0;if(boosting)boost=Math.max(0,boost-dt*43);else boost=Math.min(100,boost+dt*5.5);
    const drifting=input.drift&&(input.left||input.right)&&speed>15;const accel=input.gas?27:-9;
    speed=THREE.MathUtils.clamp(speed+accel*dt+(boosting?25*dt:0),0,boosting?64:49);
    if(drifting){driftCharge=Math.min(100,driftCharge+dt*26);speed=Math.max(0,speed-dt*1.8)}else if(driftCharge>0){speed=Math.min(54,speed+Math.min(driftCharge*.06,7));driftCharge=0}
    const steer=(input.right?1:0)-(input.left?1:0);lat+=steer*dt*(drifting?8.2:5.1)*(.35+speed/49);lat*=Math.pow(.985,dt*60);lat=THREE.MathUtils.clamp(lat,-11,11);
    const off=Math.max(0,Math.abs(lat)-6.3);if(off>0)speed=Math.max(7,speed-off*dt*5.5);
    playerT+=speed*dt/610;
    opponents.forEach(o=>{o.t+=o.speed*dt/610;const wobble=Math.sin(o.t*4)*.25;placeCar(o.car,o.t,o.lat+wobble)});
    // Pack contact gives a subtle bump without trapping the player.
    opponents.forEach(o=>{if(Math.abs(wrapDelta(playerT,o.t))<.021&&Math.abs(lat-o.lat)<1.9){speed=Math.max(8,speed-10*dt);lat+=Math.sign(lat-o.lat||1)*dt*1.5}});
    pickups.forEach(p=>{if(p.active&&Math.abs(wrapDelta(playerT,p.t))<.035&&Math.abs(lat)<4.8){p.active=false;p.crystal.visible=false;p.ring.visible=false;boost=Math.min(100,boost+48);ui.status.textContent='NITRO +';setTimeout(()=>{if(state==='race')ui.status.textContent=''},700)}});
    const lap=Math.floor(playerT/(Math.PI*2))+1;if(lap>3){state='finished';finishPlace=1+opponents.filter(o=>o.t>playerT).length;ui.finishTitle.textContent=finishPlace===1?'PODIUM FINISH':`P${finishPlace} FINISH`;ui.finishTime.textContent=`RACE TIME — ${formatTime(elapsed)}`;ui.finish.classList.remove('hidden');}
    const place=1+opponents.filter(o=>o.t>playerT).length;ui.pos.innerHTML=`${String(place).padStart(2,'0')}<span style="font-size:14px;color:#aab5bc">/05</span>`;ui.positionText.textContent=place===1?'LEADING THE PACK':'CHASE THE LEAD';ui.lap.textContent=String(Math.min(lap,3)).padStart(2,'0');ui.timer.textContent=formatTime(elapsed);ui.speed.textContent=String(Math.round(speed*4.25)).padStart(3,'0');ui.speedLabel.textContent=boosting?'NITRO ENGAGED':drifting?'DRIFTING':speed>42?'FULL THROTTLE':speed>8?'ON THE PACE':'READY TO RACE';ui.boostFill.style.width=`${boost}%`;
    for(let i=1;i<=3;i++)document.querySelector(`#lap${i}`).classList.toggle('on',i<=lap);
    const mapT=((playerT%(Math.PI*2))/(Math.PI*2))*Math.PI*2;const mx=50+42*Math.cos(mapT),my=28+19*Math.sin(mapT);ui.mapDot.setAttribute('cx',mx);ui.mapDot.setAttribute('cy',my);
  }
  placeCar(playerCar,playerT,lat);
  const p=playerCar.position,d=tangent(playerT),cameraTarget=p.clone().add(new THREE.Vector3(0,1.25,0)).addScaledVector(d,5.5),cameraPos=p.clone().add(new THREE.Vector3(0,6.8,0)).addScaledVector(d,-12.5);camera.position.lerp(cameraPos,1-Math.pow(.0005,dt));camera.lookAt(cameraTarget);
  if(state==='race'){const fov=57+Math.max(0,speed-28)*.2+(boosting?5:0);camera.fov=THREE.MathUtils.damp(camera.fov,fov,4,dt);camera.updateProjectionMatrix()}
  renderer.render(scene,camera);
}
function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;update(dt,now);requestAnimationFrame(frame)}requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
