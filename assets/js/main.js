/* â”€â”€ UTILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function smoothScrollTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({behavior:'smooth',block:'start'});
}

function toggleFaq(el){
  const item=el.closest('.faq-item');
  item.classList.toggle('open');
}

/* â”€â”€ SCROLL REVEALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const revealObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');revealObs.unobserve(e.target);}});
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

/* â”€â”€ TAGLINE WORD REVEAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function(){
  const el=document.getElementById('taglineText');
  if(!el)return;
  const words=el.textContent.trim().split(/\s+/);
  el.innerHTML=words.map(w=>`<span class="word">${w}</span>`).join(' ');
  const spans=[...el.querySelectorAll('.word')];
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        spans.forEach((s,i)=>setTimeout(()=>s.classList.add('lit'),i*80));
        obs.unobserve(entry.target);
      }
    });
  },{threshold:0.3});
  obs.observe(el);
})();

/* â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const WHATSAPP_NUMBER = "27609616087";
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxD-tIjZsk4JFN7LQoVr2SLcGSZXplmC6G2n2Tc3Z5qiUCFObqpIoomaylrU9UeIibiMQ/exec';

const smoothies = [
  { id:3,
    timing:"Anytime for anyone",
    name:"Tropical Rush",
    tagline:"Refreshing and healthy for anyone.",
    price:40, flavours:[],
    ingredients:["Mango","Banana","Pineapple","Yoghurt","Orange Juice"],
    benefits:["Immune boost from Vitamin C","Aids digestion","Natural hydration"],
    allergens:["Dairy"],
    sizes:["350ml","500ml (Coming Soon)"],
    nutrition:{protein:"5â€“7g",sugar:"22â€“25g",calories:"200â€“230 kcal",carbs:"30â€“35g",fat:"3â€“4g",purpose:"General health drink"},
    color:"#B8860B",cls:"card-c1" },
  { id:1,
    timing:"60â€“90 min before training/kickoff",
    name:"Game Fuel",
    tagline:"Fast carbs. Fast start.",
    price:40, proteinPrice:20,
    flavours:["Chocolate","Strawberry"],
    ingredients:["Banana","Oats","Honey","Milk","Dates","Beta-Alanine"],
    benefits:["Fast-release energy","Delays muscle fatigue","Sustained performance"],
    allergens:["Dairy","Gluten"],
    sizes:["350ml","500ml (Coming Soon)"],
    nutrition:{protein:"14g base / 24g with protein","sugar":"12â€“15g",calories:"320â€“375 kcal",carbs:"30â€“35g",fat:"8â€“10g",purpose:"Pre-training energy"},
    color:"#B8860B",cls:"card-c2" },
  { id:2,
    timing:"Within 30 min post-training/match",
    name:"Recovery Crusher",
    tagline:"Rebuild. Reload. Repeat.",
    price:45, proteinPrice:20,
    flavours:["Chocolate","Strawberry"],
    ingredients:["Banana","Frozen Berries","Greek Yoghurt","Milk","Peanut Butter"],
    benefits:["Muscle repair and growth","Replenishes energy stores","Reduces post-training soreness"],
    allergens:["Dairy","Peanuts"],
    sizes:["350ml","500ml (Coming Soon)"],
    nutrition:{protein:"30â€“33g",sugar:"13â€“15g",calories:"360â€“400 kcal",carbs:"25â€“30g",fat:"8â€“10g",purpose:"Muscle repair and recovery"},
    color:"#B8860B",cls:"card-c3" },
];

let cart={}, cartPrices={}, activeModal=null, selectedPayment='cash', selectedPickup='tuesday';

/* â”€â”€ MENU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function renderMenu(){
  const grid=document.getElementById('menuGrid');
  grid.innerHTML=smoothies.map(s=>{
    const keys=Object.keys(cart).filter(k=>k.toString().split('_')[0]==s.id);
    const qty=keys.reduce((sum,k)=>sum+cart[k],0);
    return `
      <div class="menu-card ${s.cls}" onclick="openModal(${s.id})" role="button" tabindex="0" aria-label="View ${s.name} details">
        <div class="card-bg-img" aria-hidden="true"></div>
        <div class="smoothie-cup cup-${s.id}" aria-hidden="true">
          <span class="cup-straw"></span>
          <span class="cup-lid"></span>
          <span class="cup-liquid"><span class="cup-swirl"></span><span class="cup-garnish"></span></span>
        </div>
        <div class="card-content">
          <div class="card-timing">${s.timing.toUpperCase()}</div>
          <div class="card-name">${s.name}</div>
          <div class="card-tagline">${s.tagline}</div>
          <div class="card-ingredients">${s.ingredients.map(i=>`<span class="ing-tag">${i}</span>`).join('')}</div>
          <div class="card-footer">
            <div class="card-price">R${s.price}</div>
            <button class="card-order-btn" onclick="event.stopPropagation();addToCart(${s.id})" aria-label="Add ${s.name} to order">
              ${qty>0?`âœ“ Added (${qty})`:'+ Add'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* â”€â”€ CART â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function addToCart(id){
  const s=smoothies.find(s=>s.id==id);
  if(s.flavours&&s.flavours.length>0){showProteinStep(id);}
  else{cart[id]=(cart[id]||0)+1;updateCartUI();renderMenu();}
}

function addFlavourToCart(id,flavour){
  const s=smoothies.find(s=>s.id==id);
  const key=flavour?`${id}_${flavour}`:String(id);
  const price=flavour&&s.proteinPrice?s.price+s.proteinPrice:s.price;
  cart[key]=(cart[key]||0)+1;
  cartPrices[key]=price;
  document.getElementById('flavourOverlay').classList.remove('open');
  document.body.classList.remove('no-scroll');
  updateCartUI();renderMenu();
}

function showProteinStep(id){
  const s=smoothies.find(s=>s.id==id);
  document.getElementById('flavourCloseBtn').style.display='flex';
  document.body.classList.add('no-scroll');
  document.getElementById('flavourOverlay').classList.add('open');
  document.getElementById('flavourContent').innerHTML=`
    <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${s.name}</div>
    <div style="font-family:'Geist Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:2px;margin-bottom:24px;">ADD PROTEIN?</div>
    <button class="btn-primary" style="width:100%;margin-bottom:10px;padding:14px;border-radius:8px;" onclick="showFlavourStep(${id})">Yes â€” add protein (+R20) ðŸ’ª</button>
    <button style="width:100%;margin-bottom:10px;padding:14px;font-size:13px;background:#f0ede8;border:1px solid var(--border);border-radius:8px;color:var(--dark);font-weight:500;" onclick="addFlavourToCart(${id},null)">No thanks</button>
    <button style="width:100%;padding:12px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:12px;" onclick="document.getElementById('flavourOverlay').classList.remove('open');document.body.classList.remove('no-scroll');">Cancel</button>`;
}

function showFlavourStep(id){
  const s=smoothies.find(s=>s.id==id);
  document.getElementById('flavourContent').innerHTML=`
    <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${s.name}</div>
    <div style="font-family:'Geist Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:2px;margin-bottom:8px;">CHOOSE FLAVOUR</div>
    <div style="font-family:'Geist Mono',monospace;font-size:10px;color:var(--gold);margin-bottom:20px;">+R20 protein added</div>
    ${s.flavours.map(f=>`
      <button class="btn-primary" style="width:100%;margin-bottom:10px;padding:14px;border-radius:8px;background:${f==='Chocolate'?'#4a2c1a':'#e8336b'};" onclick="addFlavourToCart(${id},'${f}')">${f}</button>
    `).join('')}
    <button style="width:100%;padding:12px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:12px;margin-top:4px;" onclick="showProteinStep(${id})">â† Back</button>`;
}

function removeFromCart(key){
  if(cart[key]>1){cart[key]--;}else{delete cart[key];delete cartPrices[key];}
  updateCartUI();renderMenu();renderCheckoutItems();
}

function cartTotal(){
  return Object.entries(cart).reduce((sum,[key,qty])=>{
    const baseId=key.toString().split('_')[0];
    const s=smoothies.find(s=>s.id==baseId);
    return sum+(cartPrices[key]||s.price)*qty;
  },0);
}
function cartCount(){return Object.values(cart).reduce((a,b)=>a+b,0);}

function updateCartUI(){
  const count=cartCount(),total=cartTotal();
  document.getElementById('cartCount').textContent=count;
  document.getElementById('cartTotal').textContent=total;
  const b=document.getElementById('cartBubble');
  count>0?b.classList.add('visible'):b.classList.remove('visible');
}

/* â”€â”€ MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function openModal(id){
  const s=smoothies.find(s=>s.id===id);
  activeModal=s;
  document.body.classList.add('no-scroll');
  document.getElementById('mName').textContent=s.name;
  document.getElementById('mTagline').textContent=s.tagline;
  document.getElementById('mTiming').textContent=s.timing;
  document.getElementById('mPrice').textContent=`R${s.price}`;
  document.getElementById('mIngs').innerHTML=s.ingredients.map(i=>`<span class="ing-tag">${i}</span>`).join('');
  document.getElementById('mBenefits').innerHTML=s.benefits.map(b=>`<span class="ing-tag" style="background:#e8f5e2;color:#1B4332;">âœ“ ${b}</span>`).join('');
  document.getElementById('mAllergens').innerHTML=s.allergens.map(a=>`<span class="ing-tag" style="background:#fff3e0;color:#B8860B;">âš  ${a}</span>`).join('');
  document.getElementById('mSizes').innerHTML=s.sizes.map(sz=>`<span class="ing-tag" style="${sz.includes('Coming Soon')?'opacity:0.4;':''}">${sz}</span>`).join('');
  document.getElementById('mNote').style.display=s.id===1?'block':'none';
  document.getElementById('mNutrition').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">PROTEIN</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.protein}</div>
      </div>
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">CALORIES</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.calories}</div>
      </div>
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">CARBS</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.carbs}</div>
      </div>
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">SUGAR</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.sugar}</div>
      </div>
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;grid-column:span 2;">
        <div style="font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">FAT</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.fat}</div>
      </div>
    </div>
    <div style="font-family:'Geist Mono',monospace;font-size:9px;color:var(--muted);margin-top:8px;letter-spacing:1px;">* Approximate values based on recipe quantities</div>`;
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalCloseBtn').style.display='flex';
}
function closeModal(e){if(e.target===document.getElementById('modalOverlay'))closeModalDirect();}
function closeModalDirect(){
  document.body.classList.remove('no-scroll');
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalCloseBtn').style.display='none';
}
function addFromModal(){if(activeModal)addToCart(activeModal.id);closeModalDirect();}

/* â”€â”€ CHECKOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function openCheckout(){
  if(cartCount()===0)return;
  document.body.classList.add('no-scroll');
  renderCheckoutItems();
  selectPay('cash');
  document.getElementById('checkoutOverlay').classList.add('open');
  document.getElementById('checkoutCloseBtn').style.display='flex';
}
function renderCheckoutItems(){
  document.getElementById('checkoutTotal').textContent=`R${cartTotal()}`;
  if(cartCount()===0){closeCheckoutDirect();return;}
  document.getElementById('checkoutItems').innerHTML=Object.entries(cart).map(([key,qty])=>{
    const baseId=key.toString().split('_')[0];
    const flavour=key.toString().split('_')[1]||null;
    const s=smoothies.find(s=>s.id==baseId);
    return `
      <div class="checkout-item">
        <div class="checkout-item-left">
          <div>
            <div class="checkout-item-name">${s.name}${flavour?`<span class="checkout-item-flavour">${flavour}</span>`:''}</div>
            <div class="checkout-item-meta">R${s.price}${flavour?` Â· +R${cartPrices[key]-s.price} protein`:''}</div>
          </div>
        </div>
        <div class="checkout-qty-ctrl">
          <button type="button" class="cqbtn" onclick="removeFromCart('${key}')" aria-label="Remove one ${s.name}">âˆ’</button>
          <span class="checkout-quantity">${qty}</span>
          <button type="button" class="cqbtn" onclick="addFlavourToCart('${baseId}','${flavour||''}');renderCheckoutItems();" aria-label="Add one ${s.name}">+</button>
          <span class="checkout-line-total">R${(cartPrices[key]||s.price)*qty}</span>
        </div>
      </div>`;
  }).join('');
}
function closeCheckoutModal(e){if(e.target===document.getElementById('checkoutOverlay'))closeCheckoutDirect();}
function closeCheckoutDirect(){
  document.body.classList.remove('no-scroll');
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.getElementById('checkoutCloseBtn').style.display='none';
}
function closeFlavourModal(e){
  if(e.target===document.getElementById('flavourOverlay')){
    document.body.classList.remove('no-scroll');
    document.getElementById('flavourOverlay').classList.remove('open');
    document.getElementById('flavourCloseBtn').style.display='none';
  }
}

/* â”€â”€ PAYMENT & PICKUP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function selectPay(method){
  selectedPayment=method;
  document.querySelectorAll('.pay-opt').forEach(b=>b.classList.remove('active'));
  const map={cash:'payCash',eft:'payEFT'};
  if(map[method])document.getElementById(map[method]).classList.add('active');
  document.getElementById('cashInstructions').style.display=method==='cash'?'block':'none';
  document.getElementById('eftInstructions').style.display=method==='eft'?'block':'none';
  document.getElementById('pickupNote').textContent=method==='eft'?'PICKUP AT TRAINING':'PICKUP AT TRAINING Â· PAY ON COLLECTION';
}
function selectPickup(day){
  selectedPickup=day;
  document.querySelectorAll('#pickupTue,#pickupSat').forEach(b=>b.classList.remove('active'));
  document.getElementById(day==='tuesday'?'pickupTue':'pickupSat').classList.add('active');
}

/* â”€â”€ PLACE ORDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function placeOrder(){
  const name=document.getElementById('checkoutName').value.trim();
  if(!name){
    document.getElementById('checkoutName').focus();
    document.getElementById('checkoutName').style.borderColor='var(--gold)';
    return;
  }
  if(cartCount()===0)return;
  const btn=document.getElementById('placeOrderBtn');
  btn.textContent='Placing order...';btn.disabled=true;
  const order={
    id:Date.now(),name,
    items:Object.entries(cart).map(([key,qty])=>{
      const baseId=key.toString().split('_')[0];
      const flavour=key.toString().split('_')[1]||null;
      const s=smoothies.find(s=>s.id==baseId);
      return{id:s.id,name:s.name+(flavour?` (${flavour})`:''),qty,price:cartPrices[key]||s.price};
    }),
    total:cartTotal(),payment:selectedPayment,pickup:selectedPickup,
    timestamp:new Date().toISOString(),
  };
  const itemsSummary=order.items.map(i=>`${i.name} x${i.qty}`).join(', ');
  fetch(SHEETS_URL,{
    method:'POST',mode:'no-cors',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:order.id,name:order.name,items:itemsSummary,total:order.total,payment:order.payment,pickup:order.pickup})
  }).catch(()=>{}).finally(()=>{
    closeCheckoutDirect();
    cart={};cartPrices={};updateCartUI();renderMenu();
    document.getElementById('checkoutName').value='';
    btn.textContent='Place order â†’';btn.disabled=false;
    showConfirmation(order);
    if(selectedPayment==='eft'){
      const waItems=order.items.map(i=>`${i.name} x${i.qty}`).join(', ');
      const msg=encodeURIComponent(`Hi Juju! Here's my Blend Club order:\n\nName: ${order.name}\nItems: ${waItems}\nTotal: R${order.total}\nPickup: ${order.pickup}\n\nPlease find proof of payment attached ðŸ‘†`);
      window.location.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    }
  });
}

function showConfirmation(order){
  const items=order.items.map(i=>`
    <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:14px;color:#F8F8F4;">${i.name} <span style="color:rgba(255,255,255,0.35);font-size:12px;">Ã—${i.qty}</span></span>
      <span style="color:var(--gold);font-weight:700;font-family:'Geist Mono',monospace;">R${i.price*i.qty}</span>
    </div>`).join('');
  document.getElementById('confirmationOverlay').classList.add('open');
  document.getElementById('confirmationContent').innerHTML=`
    <div style="font-size:48px;margin-bottom:12px;">âœ…</div>
    <div style="font-size:22px;font-weight:700;margin-bottom:4px;color:#F8F8F4;">Order placed.</div>
    <div style="font-family:'Geist Mono',monospace;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-bottom:24px;">ORDER RECEIVED</div>
    <div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:16px;margin-bottom:16px;text-align:left;">${items}
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;">
        <span style="font-family:'Geist Mono',monospace;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;">TOTAL</span>
        <span style="font-size:24px;font-weight:700;color:var(--gold);">R${order.total}</span>
      </div>
    </div>
    <div style="background:rgba(27,67,50,0.3);border:1px solid rgba(82,183,136,0.2);border-radius:10px;padding:16px;margin-bottom:20px;text-align:left;">
      <div style="font-family:'Geist Mono',monospace;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-bottom:10px;">PICKUP INFO</div>
      <div style="font-size:13px;line-height:2;color:rgba(255,255,255,0.6);">
        ðŸ“… ${order.pickup.charAt(0).toUpperCase()+order.pickup.slice(1)}<br/>
        ðŸ“ Look for the cooler box<br/>
        ${order.payment==='eft'?'ðŸ¦ EFT â€” send POP via WhatsApp':'ðŸ’µ Cash at pickup'}
      </div>
    </div>
    <div style="font-family:'Geist Mono',monospace;font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:2px;margin-bottom:16px;">ðŸ“¸ SCREENSHOT AS YOUR RECEIPT</div>
    <button class="btn-primary" style="width:100%;padding:14px;border-radius:8px;" onclick="document.getElementById('confirmationOverlay').classList.remove('open')">Done âœ“</button>`;
}

renderMenu();
