/* ============================================================
   InstaAssign – Shared JS
   Each page calls initPage({ waNumber, services, pageName })
   ============================================================ */

const WA_NUMBER = '919005315241';

// ---- THEME ----
const themeBtn = document.getElementById('themeBtn');
function applyTheme(t) {
  document.body.classList.toggle('light', t === 'light');
  if (themeBtn) themeBtn.textContent = t === 'light' ? '🌙' : '☀️';
  localStorage.setItem('theme', t);
}
applyTheme(localStorage.getItem('theme') || 'dark');
if (themeBtn) themeBtn.addEventListener('click', () => applyTheme(document.body.classList.contains('light') ? 'dark' : 'light'));

// ---- HAMBURGER ----
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav    = document.getElementById('mobileNav');
const mobileClose  = document.getElementById('mobileNavClose');
function closeMobileNav() {
  mobileNav?.classList.remove('open');
  hamburgerBtn?.classList.remove('open');
  document.body.style.overflow = '';
}
hamburgerBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  hamburgerBtn.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
mobileClose?.addEventListener('click', closeMobileNav);

// ---- ACTIVE NAV ----
const sections   = document.querySelectorAll('section[id]');
const dNavLinks  = document.querySelectorAll('.desktop-nav a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) cur = s.id; });
  dNavLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}, { passive: true });

// ---- ESC ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeMobileNav(); }
});

// ---- SCROLL REVEAL ----
const revObs = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ============================================================
// MODAL ENGINE
// ============================================================
let currentKey = '';
let PAGE_SERVICES = {};

function initServices(services) { PAGE_SERVICES = services; }

function openModal(key) {
  const s = PAGE_SERVICES[key];
  if (!s) return;
  currentKey = key;
  document.getElementById('modalTitle').textContent = s.title;
  document.getElementById('modalSub').textContent   = s.sub;
  document.getElementById('modalStripe').className  = 'modal-stripe stripe-' + s.color;

  const form = document.getElementById('orderForm');
  if (s.type === 'academic')  { form.innerHTML = buildAcademicForm(s);  form.onsubmit = submitAcademic; }
  else if (s.type === 'business') { form.innerHTML = buildBusinessForm(s); form.onsubmit = submitBusiness; }
  else { form.innerHTML = buildCustomForm(s); form.onsubmit = submitCustom; }

  // set min date
  const dl = document.getElementById('fDeadline');
  if (dl) dl.min = new Date().toISOString().split('T')[0];

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('modalOverlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

// ---- HELPERS ----
const fc  = c => c === 'a' ? 'focus-a' : 'focus-b';
const sc  = c => c === 'a' ? 'sub-a'   : 'sub-b';
const waN = () => `<div class="wa-note"><i class="fa-brands fa-whatsapp" style="color:#25d366;margin-right:.3rem;"></i> Your details open WhatsApp. Payment discussed before work begins.</div>`;

// ---- FORM BUILDERS ----
function buildAcademicForm(s) {
  const f = fc(s.color);
  return `
    <div class="form-grid">
      <div class="form-row"><label class="form-label">Your Name *</label><input type="text" class="form-input ${f}" id="fName" placeholder="Full name" required></div>
      <div class="form-row"><label class="form-label">WhatsApp Number *</label><input type="tel" class="form-input ${f}" id="fPhone" placeholder="10-digit number" required></div>
    </div>
    <div class="form-row"><label class="form-label">Subject / Topic *</label><input type="text" class="form-input ${f}" id="fSubject" placeholder="e.g. Environmental Science, Indian History" required></div>
    ${s.needsRollNo ? `
    <div class="form-grid">
      <div class="form-row"><label class="form-label">Roll No. *</label><input type="text" class="form-input ${f}" id="fRollNo" placeholder="e.g. 12345" required></div>
      <div class="form-row"><label class="form-label">Enrollment No. (if any)</label><input type="text" class="form-input ${f}" id="fEnrollNo" placeholder="Optional"></div>
    </div>
    <div class="form-row"><label class="form-label">Supervisor / Guide Name</label><input type="text" class="form-input ${f}" id="fSupervisor" placeholder="e.g. Dr. Sharma"></div>
    ` : ''}
    <div class="form-grid">
      <div class="form-row"><label class="form-label">${s.pagesLabel || 'Pages / Slides'}</label><input type="number" class="form-input ${f}" id="fPages" placeholder="e.g. 10" min="1"></div>
      <div class="form-row"><label class="form-label">Deadline *</label><input type="date" class="form-input ${f}" id="fDeadline" required></div>
    </div>
    ${s.showLang ? `<div class="form-row"><label class="form-label">Language Preference</label><select class="form-select ${f}" id="fLang"><option value="Hindi">Hindi</option><option value="English">English</option><option value="Hindi + English">Hindi + English</option></select></div>` : ''}
    <div class="form-row">
      <label class="form-label">Your Budget *</label>
      <input type="text" class="form-input ${f}" id="fBudget" placeholder="e.g. ${s.budget}" required>
      <div class="form-hint">💡 ${s.budgetHint}</div>
    </div>
    <div class="form-row"><label class="form-label">Additional Instructions</label><textarea class="form-textarea ${f}" id="fNotes" placeholder="Formatting, references, style, or anything else..."></textarea></div>
    <button type="submit" class="submit-btn ${sc(s.color)}"><i class="fa-brands fa-whatsapp"></i> Send to WhatsApp</button>
    ${waN()}
  `;
}

function buildBusinessForm(s) {
  const f = fc(s.color);
  const extra = (s.fields || []).map(fld => {
    const t = fld.type === 'number' ? 'number' : 'text';
    return `<div class="form-row"><label class="form-label">${fld.label}</label><input type="${t}" class="form-input ${f}" id="${fld.id}" placeholder="${fld.placeholder}"></div>`;
  }).join('');
  return `
    <div class="form-grid">
      <div class="form-row"><label class="form-label">Your Name *</label><input type="text" class="form-input ${f}" id="bName" placeholder="Full name" required></div>
      <div class="form-row"><label class="form-label">WhatsApp Number *</label><input type="tel" class="form-input ${f}" id="bPhone" placeholder="10-digit number" required></div>
    </div>
    ${extra}
    <div class="form-row">
      <label class="form-label">Your Budget *</label>
      <input type="text" class="form-input ${f}" id="bBudget" placeholder="e.g. ${s.budget}" required>
      <div class="form-hint">💡 ${s.budgetHint}</div>
    </div>
    <div class="form-row"><label class="form-label">Additional Notes</label><textarea class="form-textarea ${f}" id="bNotes" placeholder="Deadline, references, special requirements..."></textarea></div>
    <button type="submit" class="submit-btn ${sc(s.color)}"><i class="fa-brands fa-whatsapp"></i> Send to WhatsApp</button>
    ${waN()}
  `;
}

function buildCustomForm(s) {
  const f = fc(s.color);
  return `
    <div class="form-row"><label class="form-label">Your Name *</label><input type="text" class="form-input ${f}" id="cName" placeholder="Full name" required></div>
    <div class="form-grid">
      <div class="form-row"><label class="form-label">Contact Number *</label><input type="tel" class="form-input ${f}" id="cContact" placeholder="Phone number" required></div>
      <div class="form-row"><label class="form-label">WhatsApp Number *</label><input type="tel" class="form-input ${f}" id="cWhatsapp" placeholder="WhatsApp number" required></div>
    </div>
    <div class="form-row"><label class="form-label">Type of Work *</label><input type="text" class="form-input ${f}" id="cWorkType" placeholder="${s.workTypePlaceholder || 'Describe the work type'}" required></div>
    <div class="form-row"><label class="form-label">Project Description *</label><textarea class="form-textarea ${f}" id="cDesc" placeholder="Quantity, deadline, format, references, etc." required style="min-height:108px;"></textarea></div>
    <button type="submit" class="submit-btn ${sc(s.color)}"><i class="fa-brands fa-whatsapp"></i> Send to WhatsApp</button>
    ${waN()}
  `;
}

// ---- SUBMIT HANDLERS ----
function submitAcademic(e) {
  e.preventDefault();
  const s = PAGE_SERVICES[currentKey];
  const name     = v('fName'), phone = v('fPhone'), subject = v('fSubject');
  const rollNo   = v('fRollNo'), enroll = v('fEnrollNo'), supervisor = v('fSupervisor');
  const pages    = v('fPages'), deadline = v('fDeadline');
  const lang     = v('fLang'), budget = v('fBudget'), notes = v('fNotes');

  let m = `🫡 *InstaAssign – Academic Order*\n\n`;
  m += `📋 *Service:* ${s.title}\n`;
  m += `👤 *Name:* ${name}\n📱 *WhatsApp:* ${phone}\n`;
  m += `📚 *Subject/Topic:* ${subject}\n`;
  if (rollNo)    m += `🎓 *Roll No.:* ${rollNo}\n`;
  if (enroll)    m += `📘 *Enrollment No.:* ${enroll}\n`;
  if (supervisor)m += `👨‍🏫 *Supervisor:* ${supervisor}\n`;
  if (pages)     m += `📄 *${s.pagesLabel}:* ${pages}\n`;
  m += `📅 *Deadline:* ${deadline}\n`;
  if (lang)      m += `🌐 *Language:* ${lang}\n`;
  if (budget)    m += `💰 *Budget:* ${budget}\n`;
  if (notes)     m += `📝 *Instructions:* ${notes}\n`;
  m += `\n⏳ Please confirm & quote!`;
  openWA(m);
}

function submitBusiness(e) {
  e.preventDefault();
  const s = PAGE_SERVICES[currentKey];
  const name = v('bName'), phone = v('bPhone');
  const budget = v('bBudget'), notes = v('bNotes');

  let m = `🫡 *InstaAssign – Business Enquiry*\n\n`;
  m += `📋 *Service:* ${s.title}\n`;
  m += `👤 *Name:* ${name}\n📱 *WhatsApp:* ${phone}\n`;
  (s.fields || []).forEach(f => {
    const el = document.getElementById(f.id);
    if (el?.value?.trim()) m += `🔹 *${f.label}:* ${el.value.trim()}\n`;
  });
  if (budget) m += `💰 *Budget:* ${budget}\n`;
  if (notes)  m += `📝 *Notes:* ${notes}\n`;
  m += `\n⏳ Please send quote & timeline!`;
  openWA(m);
}

function submitCustom(e) {
  e.preventDefault();
  const s    = PAGE_SERVICES[currentKey];
  const name = v('cName'), contact = v('cContact');
  const wa   = v('cWhatsapp'), work = v('cWorkType'), desc = v('cDesc');

  let m = `🫡 *InstaAssign – Custom Work Request*\n\n`;
  m += `📋 *Category:* ${s.title}\n`;
  m += `👤 *Name:* ${name}\n📞 *Contact:* ${contact}\n📱 *WhatsApp:* ${wa}\n`;
  m += `🔧 *Work Type:* ${work}\n📝 *Description:* ${desc}\n`;
  m += `\n⏳ Awaiting quote!`;
  openWA(m);
}

function v(id) { return document.getElementById(id)?.value?.trim() || ''; }
function openWA(msg) {
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  closeModal();
}