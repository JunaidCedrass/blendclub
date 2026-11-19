/* UTILS */
function smoothScrollTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({behavior:'smooth',block:'start'});
}

function toggleFaq(el){
  const item=el.closest('.faq-item');
  item.classList.toggle('open');
}

/* SCROLL REVEALS */
const revealObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');revealObs.unobserve(e.target);}});
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

/* TAGLINE WORD REVEAL */
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

/* DATA */
const WHATSAPP_NUMBER = "27609616087";

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
    nutrition:{protein:"5-7g",sugar:"22-25g",calories:"200–230 kcal",carbs:"30–35g",fat:"3–4g",purpose:"General health drink"},
    color:"#B8860B",cls:"card-c1" },
  { id:1,
    timing:"60–90 min before training/kickoff",
    name:"Game Fuel",
    tagline:"Fast carbs. Fast start.",
    price:40, proteinPrice:20,
    flavours:["Strawberry","Vanilla","Chocolate"],
    ingredients:["Banana","Oats","Honey","Milk","Dates","Beta-Alanine"],
    benefits:["Fast-release energy","Delays muscle fatigue","Sustained performance"],
    allergens:["Dairy","Gluten"],
    sizes:["350ml","500ml (Coming Soon)"],
    nutrition:{protein:"14g base / 24g with protein","sugar":"12–15g",calories:"320–375 kcal",carbs:"30–35g",fat:"8–10g",purpose:"Pre-training energy"},
    color:"#B8860B",cls:"card-c2" },
  { id:2,
    timing:"Within 30 min post-training/match",
    name:"Recovery Crusher",
    tagline:"Rebuild. Reload. Repeat.",
    price:45, proteinPrice:20,
    flavours:["Strawberry","Vanilla","Chocolate"],
    ingredients:["Banana","Frozen Berries","Greek Yoghurt","Milk","Peanut Butter"],
    benefits:["Muscle repair and growth","Replenishes energy stores","Reduces post-training soreness"],
    allergens:["Dairy","Peanuts"],
    sizes:["350ml","500ml (Coming Soon)"],
    nutrition:{protein:"30–33g",sugar:"13–15g",calories:"360–400 kcal",carbs:"25–30g",fat:"8–10g",purpose:"Muscle repair and recovery"},
    color:"#B8860B",cls:"card-c3" },
];

const PARTNER_PRODUCTS_ENABLED = false;
const partnerProducts = [
  { id:'pgf-beet', name:'The Beet Blend', shortName:'Beet',
    tagline:'A vibrant fruit and vegetable freezer pack.',
    ingredients:['Beetroot','Cucumber','Pineapple','Carrot'], cls:'partner-card--beet' },
  { id:'pgf-green', name:'The Green Blend', shortName:'Green',
    tagline:'A fresh, green freezer pack for easy blending.',
    ingredients:['Celery','Spinach','Cucumber','Pineapple','Chia seeds'], cls:'partner-card--green' },
  { id:'pgf-duo', name:'Freezer Duo', shortName:'Duo',
    tagline:'One Beet Blend and one Green Blend in a simple starter bundle.',
    ingredients:['1 Beet Blend','1 Green Blend'], cls:'partner-card--duo', bundle:true },
];

let cart={}, cartPrices={}, activeModal=null, selectedPayment='cash', selectedPickup='home';
let deliveryDistance='', deliveryFee=0, deliveryQuoteChecked=false;
let pageLockCount=0, lockedScrollY=0;

function lockPage(){
  if(pageLockCount===0){
    lockedScrollY=window.pageYOffset||document.documentElement.scrollTop||0;
    document.body.style.left='0';
    document.body.style.top=`-${lockedScrollY}px`;
  }
  pageLockCount++;
  document.body.classList.add('no-scroll');
}

function unlockPage(){
  if(pageLockCount===0)return;
  pageLockCount--;
  if(pageLockCount>0)return;
  document.body.classList.remove('no-scroll');
  document.body.style.top='';
  document.body.style.left='';
  const previousScrollBehavior=document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior='auto';
  window.scrollTo(0,lockedScrollY);
  requestAnimationFrame(()=>{document.documentElement.style.scrollBehavior=previousScrollBehavior;});
}

/*MENU */
function renderMenu(){
  const grid=document.getElementById('menuGrid');
  grid.innerHTML=smoothies.map(s=>{
    const keys=Object.keys(cart).filter(k=>k.toString().split('_')[0]==s.id);
    const qty=keys.reduce((sum,k)=>sum+cart[k],0);
    return `
      <div class="menu-card ${s.cls}" onclick="openModal(${s.id})" onkeydown="handleMenuCardKeydown(event,${s.id})" role="button" tabindex="0" aria-label="View ${s.name} ingredients and details">
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
          <div class="card-ingredients" aria-label="Ingredients">${s.ingredients.map((ingredient,index)=>`<span class="ing-tag ingredient-chip ingredient-chip--${index+1}">${ingredient}</span>`).join('')}</div>
          <div class="card-footer">
            <div class="card-price">R${s.price}</div>
            <div class="card-actions">
              <button class="card-details-btn" type="button" onclick="event.stopPropagation();openModal(${s.id})" aria-label="View ${s.name} ingredients and details">View blend <span aria-hidden="true">→</span></button>
              <button class="card-order-btn" onclick="event.stopPropagation();addToCart(${s.id})" aria-label="Add ${s.name} to order">
                ${qty>0?`Added (${qty})`:'+ Add'}
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
  renderPartnerMenu();
  observeMobileSmoothieCups();
}

function observeMobileSmoothieCups(){
  if(window.innerWidth>820&&!window.matchMedia('(hover: none)').matches)return;
  const cards=document.querySelectorAll('.menu-card');
  const cupObserver=new IntersectionObserver((entries,observer)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('scroll-visible');
      observer.unobserve(entry.target);
    });
  },{threshold:0.28});
  cards.forEach(card=>cupObserver.observe(card));
}

function renderPartnerMenu(){
  const grid=document.getElementById('partnerGrid');
  if(!grid)return;
  grid.innerHTML=partnerProducts.map(product=>`
    <article class="menu-card partner-card ${product.cls}${PARTNER_PRODUCTS_ENABLED?'':' partner-card--disabled'}" onclick="handlePartnerCardTap(event,this)" onkeydown="handlePartnerCardKeydown(event,this)" tabindex="0" role="button" aria-expanded="false" aria-label="Preview ${product.name}">
      <div class="card-bg-img" aria-hidden="true"></div>
      <div class="smoothie-cup partner-cup partner-cup--${product.shortName.toLowerCase()}" aria-hidden="true">
        <span class="cup-straw"></span>
        <span class="cup-lid"></span>
        <span class="cup-liquid"><span class="cup-swirl"></span><span class="cup-garnish"></span></span>
      </div>
      <div class="partner-card-content">
        <div class="card-timing">PGF SMOOTHIE BLENDS</div>
        <div class="card-name">${product.name}</div>
        <div class="card-tagline">${product.tagline}</div>
        <div class="card-ingredients" aria-label="Ingredients">${product.ingredients.map((ingredient,index)=>`<span class="ing-tag ingredient-chip ingredient-chip--${index+1}">${ingredient}</span>`).join('')}</div>
        <div class="card-footer partner-card-footer">
          <div class="card-price">${PARTNER_PRODUCTS_ENABLED?'Available':'Coming soon'}</div>
          <button class="card-order-btn partner-card-button" type="button" ${PARTNER_PRODUCTS_ENABLED?'':'disabled'}>${PARTNER_PRODUCTS_ENABLED?'Add':'Not available'}</button>
        </div>
      </div>
    </article>`).join('');
}

function isTouchDevice(){
  return window.matchMedia('(hover: none)').matches;
}

function handleMenuCardKeydown(event,id){
  if(event.key==='Enter'||event.key===' '){
    event.preventDefault();
    openModal(id);
  }
}

function handlePartnerCardTap(event,card){
  if(!isTouchDevice())return;
  event.preventDefault();
  const isActive=card.classList.toggle('is-active');
  card.setAttribute('aria-expanded',isActive);
}

function handlePartnerCardKeydown(event,card){
  if(event.key==='Enter'||event.key===' '){
    event.preventDefault();
    const isActive=card.classList.toggle('is-active');
    card.setAttribute('aria-expanded',isActive);
  }
}

/*CART*/
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
  unlockPage();
  updateCartUI();renderMenu();
}

function showProteinStep(id){
  const s=smoothies.find(s=>s.id==id);
  document.getElementById('flavourCloseBtn').style.display='flex';
  lockPage();
  document.getElementById('flavourOverlay').classList.add('open');
  document.getElementById('flavourContent').innerHTML=`
    <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${s.name}</div>
    <div style="font-family:'Manrope',Arial,sans-serif;font-size:11px;color:var(--muted);letter-spacing:2px;margin-bottom:24px;">ADD PROTEIN</div>
    <button class="btn-primary" style="width:100%;margin-bottom:10px;padding:14px;border-radius:8px;text-align:center;" onclick="showFlavourStep(${id})">Yes – add protein (+R20)</button>
    <button style="width:100%;margin-bottom:10px;padding:14px;font-size:13px;background:#f0ede8;border:1px solid var(--border);border-radius:8px;color:var(--dark);font-weight:500;" onclick="addFlavourToCart(${id},null)">No thanks</button>
    <button style="width:100%;padding:12px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:12px;text-align:center;" onclick="document.getElementById('flavourOverlay').classList.remove('open');unlockPage();">Cancel</button>`;
}

function showFlavourStep(id){
  const s=smoothies.find(s=>s.id==id);
  document.getElementById('flavourContent').innerHTML=`
    <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${s.name}</div>
    <div style="font-family:'Manrope',Arial,sans-serif;font-size:11px;color:var(--muted);letter-spacing:2px;margin-bottom:8px;">CHOOSE FLAVOUR</div>
    <div style="font-family:'Manrope',Arial,sans-serif;font-size:10px;color:var(--gold);margin-bottom:20px;">+R20 protein added</div>
    ${s.flavours.map(f=>`
      <button class="btn-primary" ${f==='Chocolate'?'disabled':''} style="width:100%;margin-bottom:10px;padding:14px;border-radius:8px;background:${f==='Chocolate'?'#4a2c1a':f==='Vanilla'?'#f3ead7':'#e8336b'};color:${f==='Vanilla'?'#3b3326':'#fff'};${f==='Chocolate'?'opacity:0.6;cursor:not-allowed;':''}" ${f==='Chocolate'?'':`onclick="addFlavourToCart(${id}, '${f}')"`}>${f==='Chocolate'?'Chocolate – Coming Soon':f}</button>
    `).join('')}
    <button style="width:100%;padding:12px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:12px;margin-top:4px;" onclick="showProteinStep(${id})">← Back</button>`;
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

/* MODAL */
function openModal(id){
  const s=smoothies.find(s=>s.id===id);
  activeModal=s;
  lockPage();
  document.getElementById('mName').textContent=s.name;
  document.getElementById('mTagline').textContent=s.tagline;
  document.getElementById('mTiming').textContent=s.timing;
  document.getElementById('mPrice').textContent=`R${s.price}`;
  document.getElementById('mHeaderPrice').textContent=`R${s.price}`;
  document.getElementById('mIngs').innerHTML=s.ingredients.map(i=>`<span class="ing-tag">${i}</span>`).join('');
  document.getElementById('mBenefits').innerHTML=s.benefits.map(b=>`<span class="ing-tag" style="background:#e8f5e2;color:#1B4332;">${b}</span>`).join('');
  document.getElementById('mAllergens').innerHTML=s.allergens.map(a=>`<span class="ing-tag" style="background:#fff3e0;color:#B8860B;">${a}</span>`).join('');
  document.getElementById('mSizes').innerHTML=s.sizes.map(sz=>`<span class="ing-tag" style="${sz.includes('Coming Soon')?'opacity:0.4;':''}">${sz}</span>`).join('');
  document.getElementById('mNote').style.display=s.id===1?'block':'none';
  document.getElementById('mNutrition').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-family:'Manrope',Arial,sans-serif;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">PROTEIN</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.protein}</div>
      </div>
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-family:'Manrope',Arial,sans-serif;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">CALORIES</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.calories}</div>
      </div>
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-family:'Manrope',Arial,sans-serif;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">CARBS</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.carbs}</div>
      </div>
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;">
        <div style="font-family:'Manrope',Arial,sans-serif;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">SUGAR</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.sugar}</div>
      </div>
      <div style="background:#f9f5ed;border-radius:6px;padding:10px;text-align:center;grid-column:span 2;">
        <div style="font-family:'Manrope',Arial,sans-serif;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:4px;">FAT</div>
        <div style="font-size:15px;font-weight:700;color:var(--green);">${s.nutrition.fat}</div>
      </div>
    </div>
    <div style="font-family:'Manrope',Arial,sans-serif;font-size:9px;color:var(--muted);margin-top:8px;letter-spacing:1px;">* Approximate values based on recipe quantities</div>`;
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalCloseBtn').style.display='flex';
}
function closeModal(e){if(e.target===document.getElementById('modalOverlay'))closeModalDirect();}
function closeModalDirect(){
  unlockPage();
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalCloseBtn').style.display='none';
}
function addFromModal(){if(activeModal)addToCart(activeModal.id);closeModalDirect();}

/* CHECKOUT */
function openCheckout(){
  if(cartCount()===0)return;
  lockPage();
  renderCheckoutItems();
  selectPickup('home');
  selectPay('cash');
  document.getElementById('checkoutOverlay').classList.add('open');
  document.getElementById('checkoutCloseBtn').style.display='flex';
}
function renderCheckoutItems(){
  updateOrderTotal();
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
            <div class="checkout-item-meta">R${s.price}${flavour?` · +R${cartPrices[key]-s.price} protein`:''}</div>
          </div>
        </div>
        <div class="checkout-qty-ctrl">
          <button type="button" class="cqbtn" onclick="removeFromCart('${key}')" aria-label="Remove one ${s.name}">-</button>
          <span class="checkout-quantity">${qty}</span>
          <button type="button" class="cqbtn" onclick="addFlavourToCart('${baseId}','${flavour||''}');renderCheckoutItems();" aria-label="Add one ${s.name}">+</button>
          <span class="checkout-line-total">R${(cartPrices[key]||s.price)*qty}</span>
        </div>
      </div>`;
  }).join('');
}
function closeCheckoutModal(e){if(e.target===document.getElementById('checkoutOverlay'))closeCheckoutDirect();}
function closeCheckoutDirect(){
  unlockPage();
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.getElementById('checkoutCloseBtn').style.display='none';
}
function closeFlavourModal(e){
  if(e.target===document.getElementById('flavourOverlay')){
    unlockPage();
    document.getElementById('flavourOverlay').classList.remove('open');
    document.getElementById('flavourCloseBtn').style.display='none';
  }
}

/* PAYMENT & PICKUP */
function selectPay(method){
  selectedPayment=method;
  document.querySelectorAll('.pay-opt').forEach(b=>b.classList.remove('active'));
  const map={cash:'payCash',eft:'payEFT'};
  if(map[method])document.getElementById(map[method]).classList.add('active');
  document.getElementById('cashInstructions').style.display=method==='cash'?'block':'none';
  document.getElementById('eftInstructions').style.display=method==='eft'?'block':'none';
  updatePickupNote();
}
function selectPickup(option){
  selectedPickup=option;
  document.querySelectorAll('.pickup-opt').forEach(button=>{
    const active=button.id===({home:'pickupHome',friday:'pickupFriday',delivery:'pickupDelivery'})[option];
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.getElementById('deliveryFields').hidden=option!=='delivery';
  if(option!=='delivery'){
    document.getElementById('deliveryZone').value='';
    updateDeliveryZone();
  }
  updatePriceBreakdown();
  updateOrderTotal();
  updatePickupNote();
}
function updateOrderTotal(){
  const total=cartTotal()+deliveryFee;
  document.getElementById('checkoutTotalLabel').textContent=selectedPickup==='delivery'&&!deliveryQuoteChecked?'Subtotal (delivery not included)':'Order total';
  document.getElementById('checkoutTotal').textContent=`R${total}`;
  updatePriceBreakdown();
}
function updatePriceBreakdown(){
  const breakdown=document.getElementById('priceBreakdown');
  if(!breakdown)return;
  const visible=selectedPickup==='delivery'&&deliveryQuoteChecked;
  breakdown.hidden=!visible;
  if(!visible)return;
  document.getElementById('subtotalAmount').textContent=`R${cartTotal()}`;
  document.getElementById('distanceAmount').textContent=deliveryDistance;
  document.getElementById('deliveryFeeAmount').textContent=`R${deliveryFee}`;
  document.getElementById('finalTotalAmount').textContent=`R${cartTotal()+deliveryFee}`;
}
function updatePickupNote(){
  const pickupLabels={home:'Home pickup',friday:'Friday collection',delivery:'Delivery'};
  const paymentText=selectedPayment==='eft'?'Pay by EFT before collection or delivery':selectedPickup==='delivery'?'Pay on delivery':'Pay on collection';
  const feeText=selectedPickup==='delivery'?(deliveryQuoteChecked?` + R${deliveryFee} delivery`:' - select delivery area'):'';
  document.getElementById('pickupNote').textContent=`${pickupLabels[selectedPickup]}${feeText} - ${paymentText}`;
  document.getElementById('cashChoiceDetail').textContent=selectedPickup==='delivery'?'Pay on delivery':'Pay on collection';
  document.getElementById('cashInstructions').innerHTML=selectedPickup==='delivery'
    ? '<strong>Cash on delivery.</strong> Bring exact change if possible.'
    : '<strong>Cash at pickup.</strong> Bring exact change if possible and look for the cooler box.';
}
function updateDeliveryZone(){
  const zones={near:{label:'Nearby area',fee:15},mid:{label:'Local area',fee:25},far:{label:'Outer area',fee:35}};
  const zone=zones[document.getElementById('deliveryZone').value];
  deliveryDistance=zone?zone.label:'';
  deliveryFee=zone?zone.fee:0;
  deliveryQuoteChecked=Boolean(zone);
  document.getElementById('deliveryResult').textContent=zone?`Delivery fee: R${zone.fee}. We'll check your address.`:'';
  updateOrderTotal();
  updatePickupNote();
}

/* PLACE ORDER */
function placeOrder(){
  const name=document.getElementById('checkoutName').value.trim();
  if(!name){
    document.getElementById('checkoutName').focus();
    document.getElementById('checkoutName').style.borderColor='var(--gold)';
    return;
  }
  if(cartCount()===0)return;
  const address=document.getElementById('checkoutAddress').value.trim();
  const phone=document.getElementById('checkoutPhone').value.trim();
  if(selectedPickup==='delivery'&&!address){
    document.getElementById('deliveryResult').textContent='Enter your delivery address first.';
    document.getElementById('checkoutAddress').focus();
    return;
  }
  if(selectedPickup==='delivery'&&!deliveryQuoteChecked){
    document.getElementById('deliveryResult').textContent='Select your delivery area before placing your order.';
    document.getElementById('deliveryZone').focus();
    return;
  }
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
    total:cartTotal()+deliveryFee,
    payment:selectedPayment,
    pickup:selectedPickup,
    deliveryDistance,
    deliveryFee,
    phone:selectedPickup==='delivery'?phone:'',
    address:selectedPickup==='delivery'?address:'',
    timestamp:new Date().toISOString(),
  };
  const itemsSummary=order.items.map(i=>`${i.name} x${i.qty}`).join(', ');
  fetch('/.netlify/functions/order',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      id:order.id,
      name:order.name,
      items:itemsSummary,
      total:order.total,
      payment:order.payment,
      pickup:order.pickup,
      deliveryDistance:order.deliveryDistance,
      deliveryFee:order.deliveryFee,
      phone:order.phone,
      address:order.address
    })
  }).then(async response=>{
    if(!response.ok)throw new Error('Order request failed');
    const result=await response.json();
    if(result.success!==true)throw new Error('Order was not saved');
    cart={};cartPrices={};
    updateCartUI();
    renderMenu();
    document.getElementById('checkoutItems').innerHTML='';
    closeCheckoutDirect();
    document.getElementById('checkoutName').value='';
    document.getElementById('checkoutAddress').value='';
    document.getElementById('checkoutPhone').value='';
    btn.textContent='Place order →';btn.disabled=false;
    showConfirmation(order);
  }).catch(()=>{
    btn.textContent='Place order →';btn.disabled=false;
    alert('We could not confirm your order. Please contact BlendClub before trying again to avoid a duplicate.');
  });
}

function showConfirmation(order){
  const safeAddress=order.address.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const safeName=order.name.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const items=order.items.map(i=>`
    <div class="confirmation-item">
      <span>${i.name} <small>×${i.qty}</small></span>
      <strong>R${i.price*i.qty}</strong>
    </div>`).join('');
  document.getElementById('confirmationOverlay').classList.add('open');
  document.getElementById('confirmationContent').innerHTML=`
    <div class="confirmation-mark" aria-hidden="true">✓</div>
    <p class="confirmation-eyebrow">Order received</p>
    <h2 class="confirmation-title">Thanks, ${safeName}.</h2>
    <p class="confirmation-intro">Your BlendClub order has been placed and is ready to be prepared.</p>
    <div class="confirmation-receipt">
      <div class="confirmation-receipt-heading"><span>Your order</span><span>#${String(order.id).slice(-6)}</span></div>
      ${items}
      <div class="confirmation-total"><span>Total</span><strong>R${order.total}</strong></div>
    </div>
    <div class="confirmation-next">
      <p class="confirmation-section-title">What happens next</p>
      <p>
        ${order.pickup==='delivery'?`Delivery to: ${safeAddress}<br/>Delivery area: ${order.deliveryDistance}<br/>Delivery fee: R${order.deliveryFee}`:order.pickup==='friday'?'Friday collection':'Collection from Juju'}<br/>
        ${order.payment==='eft'?'Please pay by EFT and send proof via WhatsApp.':order.pickup==='delivery'?'Cash on delivery.':'Pay cash at collection.'}
      </p>
      ${order.payment==='eft'?`<div class="confirmation-bank"><strong>EFT details</strong><span>FNB · J Cedrass</span><span>Acc (Easy): 63053860087</span><span>Branch: 210046 · Ref: ${safeName}</span></div>`:''}
    </div>
    <p class="confirmation-note">Screenshot this page as your receipt.</p>
    <button class="btn-primary confirmation-done" onclick="document.getElementById('confirmationOverlay').classList.remove('open');smoothScrollTo('top')">Done</button>`;
}

// Inline event handlers in the HTML and generated cards need these module functions.
Object.assign(window, {
  smoothScrollTo, toggleFaq, openModal, handleMenuCardKeydown,
  handlePartnerCardTap, handlePartnerCardKeydown, addToCart,
  showProteinStep, showFlavourStep, addFlavourToCart, removeFromCart,
  renderCheckoutItems, unlockPage, closeModal, closeModalDirect, addFromModal,
  openCheckout, closeCheckoutModal, closeCheckoutDirect, closeFlavourModal,
  selectPickup, selectPay, updateDeliveryZone, placeOrder
});

renderMenu();
