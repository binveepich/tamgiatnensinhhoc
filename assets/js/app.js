
(()=>{
const products=window.GREENCREST_PRODUCTS||[];
const byId=n=>products.find(p=>p.n===Number(n));
const moneyText=p=>p.price||'Giá chưa nêu trong tài liệu';
const priceNumber=p=>{const m=(p.price||'').match(/[\d.]+/);return m?Number(m[0].replace(/\./g,'')):0};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const overlay=$('#overlay'), cartDrawer=$('#cartDrawer'), detailModal=$('#detailModal'), accountModal=$('#accountModal'), checkoutModal=$('#checkoutModal'), policyModal=$('#policyModal'), toast=$('#toast');
let cart=JSON.parse(localStorage.getItem('greencrest-cart')||'{}');
let favs=new Set(JSON.parse(localStorage.getItem('greencrest-favs')||'[]'));
let discount=0;
function save(){localStorage.setItem('greencrest-cart',JSON.stringify(cart));localStorage.setItem('greencrest-favs',JSON.stringify([...favs]));}
function notify(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(window.__tt);window.__tt=setTimeout(()=>toast.classList.remove('show'),2200)}
function showLayer(el){overlay.hidden=false;if(el===cartDrawer){el.classList.add('open');el.setAttribute('aria-hidden','false')}else el.hidden=false;document.body.style.overflow='hidden'}
function closeAll(){overlay.hidden=true;cartDrawer.classList.remove('open');cartDrawer.setAttribute('aria-hidden','true');[detailModal,accountModal,checkoutModal,policyModal].forEach(x=>x.hidden=true);document.body.style.overflow=''}
overlay.addEventListener('click',closeAll);$$('[data-close]').forEach(b=>b.addEventListener('click',closeAll));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
function updateFavUI(){$$('[data-fav]').forEach(b=>{const on=favs.has(Number(b.dataset.fav));b.classList.toggle('active',on);b.textContent=on?'♥':'♡'})}
$$('[data-fav]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.fav);favs.has(n)?favs.delete(n):favs.add(n);save();updateFavUI();notify(favs.has(n)?'Đã thêm vào yêu thích':'Đã bỏ khỏi yêu thích')}));updateFavUI();
function add(n){cart[n]=(cart[n]||0)+1;save();renderCart();notify('Đã thêm sản phẩm vào giỏ hàng')}
$$('[data-add]').forEach(b=>b.addEventListener('click',()=>add(Number(b.dataset.add))));
function cartSubtotal(){return Object.entries(cart).reduce((s,[n,q])=>s+priceNumber(byId(n))*q,s)}
function formatVND(n){return new Intl.NumberFormat('vi-VN').format(n)+'đ'}
function renderCart(){const box=$('#cartItems');const entries=Object.entries(cart).filter(([,q])=>q>0);$('#cartCount').textContent=entries.reduce((s,[,q])=>s+q,0);if(!entries.length){box.innerHTML='<div class="empty-state">Giỏ hàng đang trống.</div>'}else{box.innerHTML=entries.map(([n,q])=>{const p=byId(n);return `<div class="cart-row"><img src="${p.image}" alt=""><div><h4>${p.name}</h4><small>${moneyText(p)}</small><div class="qty"><button data-minus="${n}">−</button><strong>${q}</strong><button data-plus="${n}">+</button></div></div><button class="remove" data-remove="${n}">Xóa</button></div>`}).join('');}
$('#cartSubtotal').textContent=formatVND(cartSubtotal());
$$('[data-minus]',box).forEach(b=>b.onclick=()=>{const n=b.dataset.minus;cart[n]=Math.max(0,(cart[n]||0)-1);if(!cart[n])delete cart[n];save();renderCart()});
$$('[data-plus]',box).forEach(b=>b.onclick=()=>{const n=b.dataset.plus;cart[n]=(cart[n]||0)+1;save();renderCart()});
$$('[data-remove]',box).forEach(b=>b.onclick=()=>{delete cart[b.dataset.remove];save();renderCart()});}
renderCart();
$('#openCart').onclick=()=>showLayer(cartDrawer);$('#demoCart').onclick=()=>showLayer(cartDrawer);
function detail(n){const p=byId(n);$('#detailContent').innerHTML=`<div class="detail-grid"><img src="${p.image}" alt="${p.name}"><div class="detail-copy"><small>${p.category} · ${p.code}</small><h2>${p.name}</h2><p>${p.description}</p><h3>Tính năng</h3><ul>${p.features.map(x=>`<li>${x}</li>`).join('')}</ul><div class="detail-price">${moneyText(p)}</div><button class="btn" id="modalAdd">Thêm vào giỏ hàng</button></div></div>`;showLayer(detailModal);$('#modalAdd').onclick=()=>add(n)}
$$('[data-detail]').forEach(b=>b.onclick=()=>detail(Number(b.dataset.detail)));
let currentFilter='all';const search=$('#productSearch');function applyFilter(){const q=search.value.trim().toLowerCase();let shown=0;$$('.product-card').forEach(card=>{const catOk=currentFilter==='all'||card.dataset.category===currentFilter;const qOk=!q||card.dataset.search.includes(q);card.hidden=!(catOk&&qOk);if(catOk&&qOk)shown++});$('#emptyState').hidden=shown!==0}
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentFilter=b.dataset.filter;applyFilter()});search.addEventListener('input',applyFilter);
$('#openSearch').onclick=()=>{document.querySelector('#san-pham').scrollIntoView();setTimeout(()=>search.focus(),450)};
$('#openAccount').onclick=()=>showLayer(accountModal);$('#demoLogin').onclick=()=>showLayer(accountModal);
$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');$$('.auth-form').forEach(f=>f.classList.toggle('active',f.dataset.pane===t.dataset.tab))});
$$('.auth-form').forEach(f=>f.onsubmit=e=>{e.preventDefault();notify('Đây là form mô phỏng cho bài tập');closeAll()});
$('#checkoutBtn').onclick=()=>{if(!Object.keys(cart).length)return notify('Giỏ hàng đang trống');cartDrawer.classList.remove('open');discount=0;updateCheckout();showLayer(checkoutModal)};
function updateCheckout(){const total=Math.max(0,cartSubtotal()-discount);$('#checkoutTotal').textContent=formatVND(total)}
$('#applyCoupon').onclick=()=>{if($('#coupon').value.trim().toUpperCase()==='GREEN10'){discount=Math.round(cartSubtotal()*.1);notify('Đã áp dụng GREEN10: giảm 10%')}else{discount=0;notify('Mã demo hợp lệ: GREEN10')}updateCheckout()};
$('#placeOrder').onclick=()=>{cart={};discount=0;save();renderCart();closeAll();notify('Đơn hàng demo đã được tạo: GC20260001')};
$('#trackBtn').onclick=()=>{const c=$('#trackCode').value.trim().toUpperCase();if(c==='GC20260001')notify('Đơn hàng đang được chuẩn bị') ;else notify('Mã demo trong tài liệu: GC20260001')};
const policies={return:{title:'Chính sách đổi trả',items:['Điều kiện đổi trả','Các trường hợp được hỗ trợ','Thời gian yêu cầu','Quy trình đổi trả','Trường hợp không áp dụng']},privacy:{title:'Chính sách bảo mật',items:['Mục đích sử dụng thông tin khách hàng','Thông tin đặt hàng','Bảo vệ dữ liệu','Cookie','Quyền của khách hàng']},terms:{title:'Điều khoản sử dụng',items:['Điều khoản mua hàng','Tài khoản','Giá sản phẩm','Đặt hàng','Thanh toán','Hủy đơn','Quyền và trách nhiệm của người dùng']}};
$$('[data-policy]').forEach(b=>b.onclick=()=>{const p=policies[b.dataset.policy];$('#policyContent').innerHTML=`<div class="policy-content"><small class="section-kicker">THEO DÀN Ý TRONG TÀI LIỆU</small><h2>${p.title}</h2><p>Tài liệu Word chỉ nêu các đề mục cần có, chưa cung cấp nội dung pháp lý chi tiết. Bản website giữ đúng phạm vi đó thay vì tự bổ sung điều khoản.</p><ul>${p.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`;showLayer(policyModal)});
$('#contactForm').onsubmit=e=>{e.preventDefault();e.target.reset();notify('Đã ghi nhận yêu cầu (mô phỏng, không gửi dữ liệu)')};
})();
