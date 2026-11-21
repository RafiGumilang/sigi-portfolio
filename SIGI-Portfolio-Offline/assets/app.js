(function () {
  'use strict';

  const APP_VERSION = '1.0.0';
  const currency = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  const number = n => new Intl.NumberFormat('id-ID').format(n);
  const today = new Date();
  const dateLabel = today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const shortDate = d => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  let deferredInstall = null;
  let toastTimer = null;

  const modules = [
    { id: 'kwh', title: 'KWH', group: 'Elektrik', icon: 'ϟ', kicker: 'ENERGY METER READING', desc: 'Input pembacaan meter listrik harian dan pemantauan energi.', tags: ['Meter harian', 'kWh', 'Rekap energi'] },
    { id: 'kwh-report', title: 'Laporan KWH', group: 'Elektrik', icon: '▥', kicker: 'ENERGY CONSUMPTION', desc: 'Rekap konsumsi energi, perbandingan periode, dan ekspor laporan simulasi.', tags: ['Konsumsi', 'Tren', 'Rekap'] },
    { id: 'history', title: 'History Modification', group: 'Elektrik', icon: '↻', kicker: 'TECHNICAL HISTORY', desc: 'Dokumentasi improvement dan perubahan teknis mesin.', tags: ['Improvement', 'Riwayat', 'Aset'] },
    { id: 'breakdown', title: 'Breakdown', group: 'Elektrik', icon: '!', kicker: 'DOWNTIME MANAGEMENT', desc: 'Pencatatan gangguan, waktu berhenti, penyebab, dan tindak lanjut.', tags: ['Gangguan', 'Downtime', 'Analisis'] },
    { id: 'job-progress', title: 'Job Progress', group: 'Elektrik', icon: '✓', kicker: 'WORK ORDER TRACKING', desc: 'Pantau PIC, prioritas, target, status, dan progres pekerjaan.', tags: ['PIC', 'Target', 'Status'] },
    { id: 'pending', title: 'Pending Job', group: 'Elektrik', icon: '⌛', kicker: 'WORK QUEUE', desc: 'Antrean pekerjaan yang belum memiliki jadwal pelaksanaan.', tags: ['Antrean', 'Prioritas', 'Jadwal'] },
    { id: 'machine-history', title: 'History Mesin', group: 'Elektrik', icon: '⌕', kicker: 'ASSET TRACEABILITY', desc: 'Pencarian kode mesin dan penelusuran histori aset.', tags: ['Machine code', 'Histori', 'Aset'] },
    { id: 'ampere', title: 'Data Motor / Ampere', group: 'Elektrik', icon: 'M', kicker: 'MOTOR MANAGEMENT', desc: 'Pemeriksaan motor area Calcining & Crusher, Preparing, Wet End, Dryer, dan Stacking.', tags: ['Inspeksi', 'Motor', 'Area'] },
    { id: 'verification', title: 'Verifikasi & Kalibrasi', group: 'Elektrik', icon: 'V', kicker: 'INSTRUMENT VERIFICATION', desc: 'Formulir verifikasi dan kalibrasi instrumen.', tags: ['Instrumen', 'Kalibrasi', 'Verifikasi'] },
    { id: 'speed', title: 'Pengukuran Speed Line #2', group: 'Elektrik', icon: 'S', kicker: 'LINE SPEED MEASUREMENT', desc: 'Pengukuran speed Wet End, Dryer + Take Off, Booker, Bundler & Stacking.', tags: ['Speed', 'Line #2', 'Pengukuran'] },
    { id: 'daily', title: 'Daily Electrical Report', group: 'Elektrik', icon: '▤', kicker: 'DAILY ACTIVITY REPORT', desc: 'Catat kondisi area, waktu kejadian, masalah, dan uraian pekerjaan harian.', tags: ['Shift', 'Aktivitas', 'Laporan'] },
    { id: 'mechanical-daily', title: 'Daily Report', group: 'Mekanik', icon: '▤', kicker: 'MECHANICAL DAILY REPORT', desc: 'Pencatatan aktivitas dan kondisi pekerjaan mekanik per shift.', tags: ['Aktivitas', 'Shift', 'Laporan'] },
    { id: 'mechanical-maintenance', title: 'Perawatan Mesin', group: 'Mekanik', icon: '⚙', kicker: 'MECHANICAL MAINTENANCE', desc: 'Perencanaan dan pencatatan pekerjaan perawatan mesin.', tags: ['Preventive', 'Corrective', 'Mesin'] },
    { id: 'lubrication', title: 'Lubrication', group: 'Mekanik', icon: '◉', kicker: 'LUBRICATION MANAGEMENT', desc: 'Master aset, titik pelumasan, interval maintenance, dan riwayat pelaksanaan.', tags: ['Pelumas', 'Interval', 'Riwayat'] },
    { id: 'vibration', title: 'Vibration', group: 'Mekanik', icon: '∿', kicker: 'CONDITION MONITORING', desc: 'Pengukuran getaran mesin pada titik A–D dan arah V/H/A.', tags: ['Velocity', 'Trend', 'ISO 10816-3'] },
    { id: 'vehicle', title: 'Vehicle', group: 'SPM & Utility', icon: '▰', kicker: 'VEHICLE INSPECTION', desc: 'Pemeriksaan kendaraan operasional, kondisi komponen, dan tindak lanjut perawatan.', tags: ['Inspeksi', 'Kendaraan', 'Checklist'] },
    { id: 'recycle', title: 'Recycle', group: 'SPM & Utility', icon: '♻', kicker: 'RECYCLE PRODUCTION', desc: 'Pencatatan produksi gypsum recycle, rejection, running hour crusher, dan stok material.', tags: ['Produksi', 'Rejection', 'Stok'] },
    { id: 'utility', title: 'Utility', group: 'SPM & Utility', icon: '⌁', kicker: 'UTILITY OPERATION', desc: 'Pencatatan kompresor, air dryer, pompa, flow meter, dan utilitas.', tags: ['Compressor', 'Air dryer', 'Water system'] },
    { id: 'utility-schedule', title: 'Jadwal Perawatan Utility', group: 'SPM & Utility', icon: '▦', kicker: 'PREVENTIVE SCHEDULE', desc: 'Jadwal regreasing, tools & equipment, hoist, trafo, air compressor, dan air dryer.', tags: ['Regreasing', 'Compressor', 'Schedule'] },
    { id: 'maintenance-cost', title: 'Maintenance Cost Bulanan', group: 'Umum', icon: 'Rp', kicker: 'COST CONTROL', desc: 'Ringkasan biaya, pemantauan anggaran, analisis kategori, dan rincian transaksi.', tags: ['Budget', 'Expense', 'Analisis'] },
    { id: 'sparepart', title: 'Sparepart Container', group: 'Umum', icon: '▦', kicker: 'INVENTORY MANAGEMENT', desc: 'Pencatatan inventaris, foto barang, dan monitoring data sparepart.', tags: ['Inventory', 'Stok', 'Barang'] },
    { id: 'calendar', title: 'Kalender Job', group: 'Umum', icon: '▣', kicker: 'MAINTENANCE SCHEDULE', desc: 'Agenda pekerjaan, kategori, prioritas, dan status tiap divisi.', tags: ['Agenda', 'Jadwal', 'Prioritas'] }
  ];

  const meters = [
    { meter: 'KWH-MTR-001', area: 'Main Distribution Panel', reading: 128450, yesterday: 127980, unit: 'kWh', status: 'Normal' },
    { meter: 'KWH-MTR-002', area: 'Calcining Line', reading: 84320, yesterday: 83985, unit: 'kWh', status: 'Normal' },
    { meter: 'KWH-MTR-003', area: 'Dryer & Take Off', reading: 95680, yesterday: 95110, unit: 'kWh', status: 'Normal' },
    { meter: 'KWH-MTR-004', area: 'Stacking Area', reading: 44720, yesterday: 44480, unit: 'kWh', status: 'Perlu cek' },
    { meter: 'KWH-MTR-005', area: 'Utility Building', reading: 32650, yesterday: 32490, unit: 'kWh', status: 'Normal' }
  ];
  const amps = [
    { motor: 'MTR-CAL-01', name: 'Calciner Fan', area: 'Calcining', amp: 82.5, rated: 96, status: 'Normal' },
    { motor: 'MTR-CRU-02', name: 'Crusher Drive', area: 'Crusher', amp: 67.2, rated: 80, status: 'Normal' },
    { motor: 'MTR-WET-04', name: 'Wet End Pump', area: 'Wet End', amp: 44.8, rated: 55, status: 'Normal' },
    { motor: 'MTR-DRY-03', name: 'Dryer Exhaust Fan', area: 'Dryer', amp: 91.4, rated: 100, status: 'Monitor' },
    { motor: 'MTR-STK-02', name: 'Stacker Conveyor', area: 'Stacking', amp: 38.6, rated: 50, status: 'Normal' }
  ];
  const jobs = [
    { id: 'JOB-2601', title: 'Inspeksi panel MCC area Calcining', division: 'Elektrik', date: '2026-11-21', priority: 'Tinggi', status: 'In Progress', pic: 'Tim Elektrik' },
    { id: 'JOB-2602', title: 'Pemeriksaan bearing conveyor transfer', division: 'Mekanik', date: '2026-11-21', priority: 'Sedang', status: 'Scheduled', pic: 'Tim Mekanik' },
    { id: 'JOB-2603', title: 'Pengecekan temperatur air dryer', division: 'SPM', date: '2026-11-22', priority: 'Sedang', status: 'Open', pic: 'Utility' },
    { id: 'JOB-2604', title: 'Verifikasi pembacaan meter energi', division: 'Elektrik', date: '2026-11-23', priority: 'Rendah', status: 'Completed', pic: 'Tim Elektrik' },
    { id: 'JOB-2605', title: 'Pelumasan gearbox conveyor', division: 'Mekanik', date: '2026-11-24', priority: 'Tinggi', status: 'Open', pic: 'Tim Mekanik' }
  ];
  const costs = [
    { date: '2026-11-02', doc: 'DEMO-001', desc: 'Bearing assembly', division: 'Mekanik', category: 'Sparepart', amount: 18500000 },
    { date: '2026-11-05', doc: 'DEMO-002', desc: 'Cable lug & terminal kit', division: 'Elektrik', category: 'Electrical', amount: 8750000 },
    { date: '2026-11-08', doc: 'DEMO-003', desc: 'Lubricant industrial grade', division: 'Mekanik', category: 'Consumable', amount: 6200000 },
    { date: '2026-11-10', doc: 'DEMO-004', desc: 'Pressure gauge set', division: 'SPM', category: 'Instrument', amount: 4350000 },
    { date: '2026-11-13', doc: 'DEMO-005', desc: 'Motor cooling fan', division: 'Elektrik', category: 'Sparepart', amount: 12800000 },
    { date: '2026-11-16', doc: 'DEMO-006', desc: 'Air filter element', division: 'SPM', category: 'Consumable', amount: 3150000 },
    { date: '2026-11-19', doc: 'DEMO-007', desc: 'Mechanical seal kit', division: 'Mekanik', category: 'Sparepart', amount: 9400000 }
  ];
  const inventory = [
    { code: 'SP-ELE-001', name: 'Contactor 3P 32A', category: 'Electrical', qty: 8, min: 4, unit: 'pcs' },
    { code: 'SP-MEC-014', name: 'Bearing 6205-2RS', category: 'Mechanical', qty: 12, min: 6, unit: 'pcs' },
    { code: 'SP-UTL-006', name: 'Air filter element', category: 'Utility', qty: 3, min: 4, unit: 'pcs' },
    { code: 'SP-ELE-021', name: 'MCB 3P 16A', category: 'Electrical', qty: 15, min: 5, unit: 'pcs' }
  ];
  const fmtStatus = s => ({ 'Normal':'green', 'Completed':'green', 'In Progress':'amber', 'Scheduled':'blue', 'Open':'gray', 'Monitor':'amber', 'Perlu cek':'amber' }[s] || 'gray');
  const statusTag = s => `<span class="tag ${fmtStatus(s)}">${s}</span>`;
  const iconFor = id => ({ dashboard:'⌂', elektrik:'ϟ', mekanik:'⚙', spm:'✓', kwh:'ϟ', 'kwh-report':'▥', ampere:'A', daily:'▤', calendar:'▣', 'maintenance-cost':'Rp', sparepart:'▦' }[id] || '◈');
  const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const demoDisclaimer = `<div class="demo-disclaimer"><span>ⓘ</span><span><strong>PORTFOLIO DEMO — DATA SIMULASI.</strong> Aplikasi ini merupakan demonstrasi mandiri dan tidak terhubung ke database, akun, maupun jaringan operasional perusahaan.</span></div>`;

  function getPage() {
    const raw = (location.hash || '#dashboard').slice(1).split('?')[0];
    return modules.some(m => m.id === raw) || ['dashboard','elektrik','mekanik','spm','about'].includes(raw) ? raw : 'dashboard';
  }
  function navItem(id, label, icon) {
    return `<a class="side-link ${getPage() === id ? 'active' : ''}" href="#${id}"><span class="ico">${icon || iconFor(id)}</span><span>${label}</span></a>`;
  }
  function topNav() {
    const top = [['dashboard','Dashboard'],['calendar','Kalender Job'],['maintenance-cost','Maintenance Cost'],['sparepart','Sparepart Container'],['elektrik','Elektrik'],['mekanik','Mekanik'],['spm','SPM & Utility']];
    return top.map(([id,label]) => `<a class="nav-link ${getPage()===id?'active':''}" href="#${id}">${label}</a>`).join('');
  }
  function sidebar() {
    const groups = [
      { label:'MENU UTAMA', items:[['dashboard','Dashboard','⌂'],['calendar','Kalender Job','▣'],['maintenance-cost','Maintenance Cost','Rp'],['sparepart','Sparepart Container','▦']] },
      { label:'DIVISI ELEKTRIK', items:[['elektrik','Dashboard Elektrik','ϟ'],['kwh','KWH','ϟ'],['kwh-report','Laporan KWH','▥'],['ampere','Data Motor / Ampere','M'],['daily','Daily Electrical Report','▤'],['breakdown','Breakdown','!'],['job-progress','Job Progress','✓']] },
      { label:'DIVISI MEKANIK', items:[['mekanik','Dashboard Mekanik','⚙'],['mechanical-daily','Daily Report','▤'],['mechanical-maintenance','Perawatan Mesin','⚙'],['lubrication','Lubrication','◉'],['vibration','Vibration','∿']] },
      { label:'SPM & UTILITY', items:[['spm','Dashboard SPM & Utility','✓'],['vehicle','Vehicle','▰'],['recycle','Recycle','♻'],['utility','Utility','⌁'],['utility-schedule','Jadwal Utility','▦']] },
      { label:'PORTOFOLIO', items:[['about','Tentang Proyek SIGI','ⓘ']] }
    ];
    return groups.map(g => `<div class="side-caption">${g.label}</div>${g.items.map(i=>navItem(i[0],i[1],i[2])).join('')}<div class="side-divider"></div>`).join('');
  }
  function hero(kicker,title,desc,tags,period='PORTFOLIO DEMO') {
    return `<section class="hero"><div class="hero-copy"><div class="hero-overline"><span class="pulse"></span>${kicker}</div><h1>${title}</h1><p>${desc}</p><div class="hero-tags">${tags.map(t=>`<span>${t}</span>`).join('')}</div></div><div class="hero-date"><small>${period}</small><strong>${today.getDate()}<span>${today.toLocaleDateString('id-ID',{month:'short'}).toUpperCase()}</span></strong><small>${today.getFullYear()} · ${today.toLocaleDateString('id-ID',{weekday:'long'})}</small><em>DEMO DATA · OFFLINE READY</em></div></section>`;
  }
  function sectionHead(kicker,title,desc,count='') {
    return `<div class="section-head"><div><div class="section-kicker">${kicker}</div><h2>${title}</h2><p>${desc}</p></div>${count?`<span class="count-badge">${count}</span>`:''}</div>`;
  }
  function kpi(label,value,note,ico) {
    return `<article class="kpi"><span class="kpi-icon">${ico}</span><div><label>${label}</label><strong>${value}</strong><small>${note}</small></div></article>`;
  }
  function barChart(labels,values) {
    const max=Math.max(...values);
    return `<div class="chart">${labels.map((l,i)=>`<div class="chart-col"><div class="chart-bar" style="height:${Math.max(8,values[i]/max*100)}%" title="${values[i]}"></div><span>${l}</span></div>`).join('')}</div>`;
  }
  function moduleCard(m) {
    return `<a class="module-card" href="#${m.id}"><span class="module-icon">${m.icon}</span><span class="module-kicker">${m.kicker}</span><strong>${m.title}</strong><p>${m.desc}</p><span class="module-link">Buka modul ↗</span></a>`;
  }
  function deptCard(title,desc,id,icon,kicker) {
    return `<a class="department" href="#${id}"><div class="department-top"><span class="department-symbol">${icon}</span><span class="active-label">● MODUL DEMO</span></div><span class="department-kicker">${kicker}</span><h3>${title}</h3><p>${desc}</p><span class="department-footer">Masuk ke ${title}<b>↗</b></span><div class="department-watermark">${icon}</div></a>`;
  }
  function dashboard() {
    return `${hero('SISTEM INFORMASI OPERASIONAL','Selamat datang di <span>SIGI Portfolio</span>','Demonstrasi sistem informasi operasional dan pemeliharaan lintas divisi. Jelajahi modul menggunakan data simulasi, termasuk saat perangkat offline.',['Elektrik','Mekanik','SPM & Utility'])}${demoDisclaimer}
      <section class="briefing"><div class="briefing-top"><div class="briefing-number">08</div><div class="briefing-copy"><div class="section-kicker">BRIEFING PEMELIHARAAN HARIAN</div><h3>Briefing pagi — agenda hari ini</h3><p>Contoh agenda pemeliharaan untuk demonstrasi antarmuka SIGI.</p></div><span class="briefing-deadline">SIMULASI</span></div><div class="briefing-grid"><article class="briefing-card"><div class="briefing-card-head"><span>🔴 Elektrik</span><strong>2</strong></div><p>2 pekerjaan contoh pada agenda elektrik.</p><a href="#elektrik">Buka Elektrik →</a></article><article class="briefing-card"><div class="briefing-card-head"><span>🔵 Mekanik</span><strong>2</strong></div><p>2 pekerjaan contoh pada agenda mekanik.</p><a href="#mekanik">Buka Mekanik →</a></article><article class="briefing-card"><div class="briefing-card-head"><span>🟡 SPM</span><strong>1</strong></div><p>1 pekerjaan contoh pada agenda SPM & Utility.</p><a href="#spm">Buka SPM →</a></article></div></section>
      ${sectionHead('RINGKASAN OPERASIONAL','Overview Dashboard','Indikator ilustratif untuk menunjukkan kemampuan pemantauan SIGI.','4 KPI')}
      <div class="kpi-grid">${kpi('Konsumsi energi bulan ini','125.480 kWh','Data simulasi · November','ϟ')}${kpi('Arus motor tertinggi','91,4 A','Contoh pembacaan motor','A')}${kpi('Pekerjaan terbuka','12 job','3 divisi · data demo','✓')}${kpi('Biaya maintenance',currency(63200000),'Periode simulasi','Rp')}</div>
      ${sectionHead('MENU UTAMA','Pilih Divisi','Akses modul sesuai struktur aplikasi SIGI.','3 DIVISI')}
      <div class="department-grid">${deptCard('Elektrik','Pemantauan energi, kondisi motor, laporan harian, downtime, modifikasi, dan progres pekerjaan.','elektrik','ϟ','ENERGI · MOTOR · DATA PEMELIHARAAN')}${deptCard('Mekanik','Daily Report dan perawatan mesin dengan modul Lubrication serta Vibration.','mekanik','⚙','MECHANICAL MAINTENANCE')}${deptCard('SPM & Utility','Pemeriksaan kendaraan, produksi recycle, dan monitoring utilitas.','spm','✓','PREVENTIVE MAINTENANCE')}</div>
      ${sectionHead('MODUL LAINNYA','Akses Cepat','Modul lintas divisi yang tersedia di SIGI.','3 MODUL')}
      <div class="module-grid">${moduleCard(modules.find(m=>m.id==='maintenance-cost'))}${moduleCard(modules.find(m=>m.id==='sparepart'))}${moduleCard(modules.find(m=>m.id==='calendar'))}<a class="module-card" href="#about"><span class="module-icon">ⓘ</span><span class="module-kicker">PROJECT OVERVIEW</span><strong>Tentang SIGI</strong><p>Ringkasan tujuan, arsitektur, dan fitur demonstrasi portofolio.</p><span class="module-link">Lihat proyek ↗</span></a></div>
      <div class="panel-grid"><section class="panel"><div class="panel-head"><div><div class="section-kicker">ENERGY MONITORING</div><h3>Tren konsumsi KWH</h3><p>Contoh konsumsi energi mingguan.</p></div><span class="tag">SIMULASI</span></div>${barChart(['M1','M2','M3','M4','M5'],[21,24,22,27,31])}<div class="legend"><span><i></i>Konsumsi (ribu kWh)</span></div></section><section class="panel"><div class="panel-head"><div><div class="section-kicker">WORK ORDER</div><h3>Status pekerjaan</h3><p>Distribusi pekerjaan demonstrasi.</p></div></div>${progress('Completed',67)}${progress('In Progress',22)}${progress('Open',11)}</section></div>`;
  }
  function progress(label,val){return `<div class="progress-row"><span>${label}</span><div class="progress-track"><div class="progress-fill" style="width:${val}%"></div></div><strong>${val}%</strong></div>`;}
  function departmentPage(id) {
    const map={
      elektrik:{title:'Elektrik',kicker:'SIGI · OPERASIONAL ELEKTRIK',desc:'Pemantauan energi, kondisi motor, verifikasi & kalibrasi, Speed Line #2, laporan harian, downtime, modifikasi, dan progres pekerjaan Divisi Elektrik.',tags:['Pemantauan Energi','Pengelolaan Motor','Analisis Pemeliharaan'],list:modules.filter(m=>m.group==='Elektrik')},
      mekanik:{title:'Mekanik',kicker:'SIGI · DIVISI MEKANIK',desc:'Pemantauan agenda pemeliharaan, prioritas pekerjaan, status penyelesaian, dan aktivitas maintenance Mekanik.',tags:['Kalender Job','Analisis Aktivitas','Biaya Maintenance'],list:modules.filter(m=>m.group==='Mekanik')},
      spm:{title:'SPM & Utility',kicker:'SIGI · PREVENTIVE MAINTENANCE',desc:'Dashboard pemeriksaan Utility, Vehicle, dan Recycle beserta riwayat serta analisis operasional.',tags:['SPM','Utility','Preventive Maintenance'],list:modules.filter(m=>m.group==='SPM & Utility')}
    };
    const d=map[id];
    return `${hero(d.kicker,`Dashboard <span>${d.title}</span>`,d.desc,d.tags)}${demoDisclaimer}${sectionHead('MENU OPERASIONAL',`Menu ${d.title}`,`Pilih modul untuk melihat demonstrasi ${d.title}.`,`${d.list.length} MODUL`)}<div class="module-grid">${d.list.map(moduleCard).join('')}</div>${sectionHead('RINGKASAN','Aktivitas Demo','Angka berikut merupakan contoh ilustratif, bukan data operasional aktual.')}<div class="kpi-grid">${kpi('Pekerjaan selesai','18','Periode simulasi','✓')}${kpi('Dalam proses','5','Periode simulasi','◷')}${kpi('Terjadwal','7','Periode simulasi','▣')}${kpi('Open','3','Periode simulasi','!')}</div>`;
  }
  function table(headers,rows) {
    return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function filterToolbar(placeholder='Cari data demo…') {return `<div class="toolbar"><input class="search" type="search" placeholder="${placeholder}" data-table-search><select class="select" data-status-filter><option value="">Semua status</option><option>Normal</option><option>Monitor</option><option>Completed</option><option>In Progress</option><option>Open</option></select></div>`;}
  function kwhPage(report=false) {
    const rows=meters.map(m=>[`<span class="strong">${m.meter}</span>`,m.area,number(m.reading),number(m.reading-m.yesterday)+' kWh',statusTag(m.status)]);
    return `${hero(report?'ELEKTRIK · ENERGY REPORT':'ELEKTRIK · ENERGY MANAGEMENT',report?'Laporan <span>KWH</span>':'Manajemen <span>KWH</span>',report?'Rekap konsumsi energi, perbandingan periode, dan ringkasan meter listrik.':'Input pembacaan meter listrik harian dan monitoring konsumsi energi.', ['Energy Management','Meter Reading','Demo Data'])}${demoDisclaimer}
      <div class="kpi-grid">${kpi('Total konsumsi hari ini','1.690 kWh','Akumulasi meter simulasi','ϟ')}${kpi('Meter aktif','5 unit','Contoh data meter','▥')}${kpi('Konsumsi bulan ini','125.480 kWh','Data demonstrasi','↗')}${kpi('Anomali','1 meter','Perlu pemeriksaan contoh','!')}</div>
      ${sectionHead(report?'ENERGY REPORT':'METER READING',report?'Rekap Pembacaan Meter':'Daftar Meter Listrik',report?'Tabel ringkasan dan tren konsumsi simulasi.':'Nilai pembacaan meter merupakan data simulasi untuk demonstrasi.')}
      ${filterToolbar('Cari kode meter atau area…')}${table(['Kode Meter','Area','Pembacaan Terakhir','Konsumsi Harian','Status'],rows)}
      <div class="panel-grid"><section class="panel"><div class="panel-head"><div><div class="section-kicker">KONSUMSI ENERGI</div><h3>Tren mingguan</h3><p>Contoh total konsumsi per minggu.</p></div></div>${barChart(['M1','M2','M3','M4','M5'],[22,25,21,28,31])}</section><section class="panel"><div class="panel-head"><div><div class="section-kicker">CATATAN</div><h3>Simulasi pembacaan</h3></div></div><p style="font-size:11px;color:var(--muted)">Dalam versi portofolio, pembacaan meter ditampilkan sebagai contoh. Data tidak dikirim ke server dan tidak memengaruhi catatan operasional.</p><button class="btn primary" data-action="toast" data-message="Mode demo: formulir aktual tidak terhubung ke server perusahaan.">Lihat simulasi input</button></section></div>`;
  }
  function amperePage() {
    const rows=amps.map(m=>[`<strong>${m.motor}</strong>`,m.name,m.area,`${m.amp.toFixed(1)} A`,`${m.rated} A`,statusTag(m.status)]);
    return `${hero('ELEKTRIK · MOTOR MANAGEMENT','Monitoring <span>Data Motor</span>','Pemeriksaan motor untuk area Calcining & Crusher, Preparing, Wet End, Dryer, dan Stacking.',['Motor Inspection','Current Monitoring','Demo Data'])}${demoDisclaimer}<div class="kpi-grid">${kpi('Motor terpantau','5 unit','Contoh aset','M')}${kpi('Arus tertinggi','91,4 A','Dryer Exhaust Fan','A')}${kpi('Status normal','4 unit','Data simulasi','✓')}${kpi('Perlu monitoring','1 unit','Bukan alarm aktual','◷')}</div>${sectionHead('MOTOR CONDITION','Daftar Motor','Filter dan pencarian motor berdasarkan area atau kode.')}${filterToolbar('Cari motor, kode, atau area…')}${table(['Kode Motor','Nama Motor','Area','Arus Aktual','Rated Current','Status'],rows)}${sectionHead('AREA PENGUKURAN','Area Motor','Contoh kelompok area inspeksi motor.')}<div class="module-grid">${['Calcining & Crusher','Preparing','Wet End','Dryer','Stacking'].map((a,i)=>`<article class="module-card"><span class="module-icon">M${i+1}</span><span class="module-kicker">AREA INSPEKSI</span><strong>${a}</strong><p>Daftar motor, parameter inspeksi, dan contoh histori pembacaan.</p><span class="module-link">Lihat area ↗</span></article>`).join('')}</div>`;
  }
  function dailyPage(mechanical=false) {
    const saved=JSON.parse(localStorage.getItem(mechanical?'sigiPortfolioMechanicalReports':'sigiPortfolioDailyReports')||'[]');
    return `${hero(mechanical?'MEKANIK · DAILY REPORT':'ELEKTRIK · DAILY REPORT',mechanical?'Daily <span>Mechanical Report</span>':'Daily <span>Electrical Report</span>',mechanical?'Pencatatan aktivitas harian dan kondisi pekerjaan mekanik.':'Catat kondisi area, waktu kejadian, masalah, dan uraian pekerjaan harian.',['Daily Activity','Shift Report','Local Demo Storage'])}${demoDisclaimer}
      <section class="panel"><div class="panel-head"><div><div class="section-kicker">FORM PENGISIAN DEMO</div><h3>Buat Laporan Harian</h3><p>Data disimpan hanya di browser perangkat ini (localStorage), tidak dikirim ke server.</p></div><span class="tag amber">LOCAL ONLY</span></div>
      <form id="demo-report-form" data-kind="${mechanical?'mechanical':'electrical'}"><div class="form-grid"><div class="field"><label>Tanggal</label><input name="date" type="date" value="${today.toISOString().slice(0,10)}" required></div><div class="field"><label>Shift</label><select name="shift"><option>Shift 1</option><option>Shift 2</option><option>Shift 3</option><option>Non Shift</option></select></div><div class="field"><label>Area</label><select name="area"><option>Calcining</option><option>Crusher</option><option>Preparing</option><option>Wet End</option><option>Dryer</option><option>Stacking</option><option>Utility</option><option>Workshop</option></select></div><div class="field"><label>Kategori</label><select name="category"><option>Preventive Maintenance</option><option>Corrective Maintenance</option><option>Inspection</option><option>Improvement</option></select></div><div class="field"><label>Petugas (nama demo)</label><input name="pic" placeholder="Contoh: Teknisi A" required></div><div class="field"><label>Status</label><select name="status"><option>Completed</option><option>In Progress</option><option>Open</option></select></div><div class="field" style="grid-column:1/-1"><label>Uraian aktivitas</label><textarea name="description" placeholder="Tuliskan aktivitas demonstrasi…" required></textarea></div></div><div class="form-actions"><button class="btn" type="reset">Reset</button><button class="btn primary" type="submit">Simpan Demo Lokal</button></div></form></section>
      ${sectionHead('LOCAL HISTORY','Laporan Tersimpan','Contoh laporan yang ditulis melalui perangkat ini.',''+(saved.length)+' DATA')}${saved.length?table(['Tanggal','Shift','Area','Aktivitas','Status'],saved.map(r=>[r.date,r.shift,r.area,r.description,statusTag(r.status)])):`<div class="empty">Belum ada laporan demo tersimpan. Coba isi form di atas untuk melihat penyimpanan lokal.</div>`}`;
  }
  function maintenanceCostPage() {
    const total=costs.reduce((s,r)=>s+r.amount,0);
    const cats={};costs.forEach(r=>cats[r.category]=(cats[r.category]||0)+r.amount);
    const catRows=Object.entries(cats).map(([k,v])=>`<div class="progress-row"><span>${k}</span><div class="progress-track"><div class="progress-fill" style="width:${v/Math.max(...Object.values(cats))*100}%"></div></div><strong>${Math.round(v/total*100)}%</strong></div>`).join('');
    return `${hero('COST CONTROL · MAINTENANCE','Maintenance <span>Cost Bulanan</span>','Ringkasan biaya pemeliharaan, pengendalian anggaran, analisis kategori, dan rincian transaksi.',['Cost Monitoring','Budget Control','ABC Analysis'])}${demoDisclaimer}<div class="kpi-grid">${kpi('Total biaya simulasi',currency(total),'7 transaksi demo','Rp')}${kpi('Anggaran ilustratif',currency(100000000),'Bukan budget aktual','▤')}${kpi('Anggaran terpakai','63,2%','Simulasi periode','◷')}${kpi('Jumlah transaksi','7 item','Data demonstrasi','▦')}</div>
      <div class="panel-grid"><section class="panel"><div class="panel-head"><div><div class="section-kicker">COST DISTRIBUTION</div><h3>Biaya berdasarkan kategori</h3><p>Persentase dari total biaya simulasi.</p></div></div>${catRows}</section><section class="panel"><div class="panel-head"><div><div class="section-kicker">MONTHLY TREND</div><h3>Perbandingan bulanan</h3><p>Nilai ilustratif dalam juta rupiah.</p></div></div>${barChart(['Jul','Agu','Sep','Okt','Nov'],[42,48,55,51,63])}</section></div>
      ${sectionHead('TRANSACTION REGISTER','Contoh Rincian Transaksi','Data fiktif untuk menunjukkan tabel Maintenance Cost.')}<div class="toolbar"><input class="search" data-table-search placeholder="Cari deskripsi, divisi, kategori…"></div>${table(['Tanggal','Dokumen Demo','Deskripsi','Divisi','Kategori','Total Harga'],costs.map(r=>[shortDate(r.date),r.doc,r.desc,r.division,r.category,currency(r.amount)]))}`;
  }
  function calendarPage() {
    return `${hero('PLANNING & SCHEDULING','Kalender <span>Job</span>','Agenda pekerjaan pemeliharaan dengan pengelompokan divisi, tanggal, prioritas, dan status.',['Job Calendar','Work Planning','Demo Agenda'])}${demoDisclaimer}${sectionHead('SCHEDULE OVERVIEW','Agenda Pekerjaan','Gunakan filter untuk menelusuri contoh agenda.')}${filterToolbar('Cari job atau PIC…')}${table(['Job ID','Pekerjaan','Divisi','Tanggal','Prioritas','PIC','Status'],jobs.map(j=>[j.id,j.title,j.division,shortDate(j.date),statusTag(j.priority),j.pic,statusTag(j.status)]))}`;
  }
  function simpleModulePage(id) {
    const m=modules.find(x=>x.id===id); if(!m)return dashboard();
    let body='';
    if(id==='breakdown') body=`<div class="kpi-grid">${kpi('Kejadian demo','4','Periode simulasi','!')}${kpi('Total downtime','6,5 jam','Data ilustratif','◷')}${kpi('Rata-rata respon','32 menit','Data ilustratif','↗')}${kpi('Closed','3 kasus','Contoh status','✓')}</div>${table(['ID','Area','Gangguan','Downtime','Status'],[['BD-001','Dryer','Temperature sensor alarm','1,5 jam',statusTag('Completed')],['BD-002','Crusher','V-belt slip','2,0 jam',statusTag('Completed')],['BD-003','Wet End','Pump seal leakage','1,0 jam',statusTag('In Progress')],['BD-004','Stacking','Conveyor misalignment','2,0 jam',statusTag('Open')]])}`;
    else if(id==='job-progress'||id==='pending') body=`<div class="list-stack">${jobs.filter(j=>id==='pending'?j.status==='Open':true).map(j=>`<div class="list-row"><span class="list-row-icon">✓</span><div class="list-row-main"><strong>${j.title}</strong><small>${j.id} · ${j.division} · PIC ${j.pic}</small></div><div class="list-row-tail">${statusTag(j.status)}<br><small>${j.priority}</small></div></div>`).join('')}</div>`;
    else if(id==='history'||id==='machine-history') body=`${table(['Tanggal','Kode Mesin','Perubahan / Aktivitas','Divisi','Dokumen'],[['05 Nov 2026','MTR-DRY-03','Penggantian fan guard','Elektrik','DEMO-HM-001'],['09 Nov 2026','CV-TRF-02','Alignment ulang pulley','Mekanik','DEMO-HM-002'],['14 Nov 2026','PMP-UTL-01','Penggantian seal kit','SPM','DEMO-HM-003']])}`;
    else if(id==='verification') body=`<div class="kpi-grid">${kpi('Instrumen demo','6 unit','Contoh daftar','V')}${kpi('Terverifikasi','5 unit','Data simulasi','✓')}${kpi('Jadwal mendatang','1 unit','Contoh rencana','▣')}${kpi('Status','Monitor','Perlu jadwal ulang demo','◷')}</div>${table(['Tag Instrumen','Lokasi','Parameter','Tanggal Verifikasi','Status'],[['PT-DEMO-01','Dryer','Pressure','10 Nov 2026',statusTag('Completed')],['TT-DEMO-02','Wet End','Temperature','12 Nov 2026',statusTag('Completed')],['FT-DEMO-03','Utility','Flow','28 Nov 2026',statusTag('Open')]])}`;
    else if(id==='speed') body=`${table(['Area Pengukuran','Parameter','Nilai Demo','Unit','Status'],[['Wet End','Line speed','82,4','m/min',statusTag('Normal')],['Dryer + Take Off','Line speed','81,8','m/min',statusTag('Normal')],['Booker / Bundler','Line speed','81,2','m/min',statusTag('Monitor')],['Stacking','Line speed','80,9','m/min',statusTag('Normal')]])}`;
    else if(id==='mechanical-maintenance'||id==='lubrication'||id==='vibration') body=`<div class="kpi-grid">${kpi('Aset terdaftar','12 unit','Contoh aset','⚙')}${kpi('Riwayat ukur','28 record','Simulasi','▤')}${kpi('Perlu tindak lanjut','2 item','Contoh monitoring','◷')}${kpi('Status normal','10 unit','Data demo','✓')}</div>${table(['Kode Aset','Nama Mesin','Area','Parameter','Hasil Demo','Status'],[['MC-DEMO-01','Transfer Conveyor','Crusher','Bearing temp.','56 °C',statusTag('Normal')],['MC-DEMO-02','Exhaust Fan','Dryer','Vibration','4,2 mm/s',statusTag('Monitor')],['MC-DEMO-03','Water Pump','Utility','Lubrication','Due 7 hari',statusTag('Open')]])}`;
    else if(id==='vehicle') body=`${table(['Unit','Checklist','Temuan Demo','Tindak Lanjut','Status'],[['Forklift Demo 01','12 item','Ban depan aus','Jadwalkan inspeksi',statusTag('Monitor')],['Pickup Demo 02','12 item','Tidak ada','Tidak ada',statusTag('Completed')],['Utility Cart 03','10 item','Lampu indikator','Pemeriksaan kelistrikan',statusTag('Open')]])}`;
    else if(id==='recycle') body=`<div class="kpi-grid">${kpi('Recycle production','18,4 ton','Angka demo','♻')}${kpi('Rejection','1,2 ton','Angka demo','▤')}${kpi('Crusher RH','6,5 jam','Angka demo','◷')}${kpi('Stock balance','24,8 ton','Angka demo','▦')}</div>${barChart(['Shift 1','Shift 2','Shift 3'],[5.2,6.1,7.1])}`;
    else if(id==='utility'||id==='utility-schedule') body=`<div class="kpi-grid">${kpi('Air compressor','5 unit','Contoh aset','⌁')}${kpi('Air dryer','4 unit','Contoh aset','▤')}${kpi('Water pump','3 unit','Contoh aset','◉')}${kpi('Jadwal due','2 item','Data simulasi','▣')}</div>${table(['Peralatan','Parameter','Pembacaan Demo','Unit','Status'],[['Compressor 01','Running hour','8.250','h',statusTag('Normal')],['Compressor 02','Loading','76','%',statusTag('Normal')],['Air Dryer 01','Outlet temperature','8,4','°C',statusTag('Normal')],['Supply Pump 01','Flow','28','m³/h',statusTag('Monitor')]])}`;
    else if(id==='sparepart') body=`<div class="kpi-grid">${kpi('Item demo','4 SKU','Inventaris simulasi','▦')}${kpi('Total stok','38 pcs','Angka demo','▤')}${kpi('Low stock','1 item','Contoh peringatan','!')}${kpi('Kategori','3 grup','Data demo','◈')}</div>${table(['Kode','Nama Barang','Kategori','Stok','Minimum','Status'],inventory.map(r=>[r.code,r.name,r.category,`${r.qty} ${r.unit}`,`${r.min} ${r.unit}`,statusTag(r.qty<=r.min?'Monitor':'Normal')]))}`;
    return `${hero(m.kicker,`${safe(m.title)} <span>Demo</span>`,m.desc,m.tags)}${demoDisclaimer}${sectionHead('MODUL PORTOFOLIO',m.title,'Tampilan dan data simulasi untuk mencoba alur navigasi SIGI.')}${body}<div class="content-note">Semua nilai, nama aset, nomor dokumen, dan status pada halaman ini merupakan data fiktif untuk portofolio. Tidak ada koneksi ke server produksi.</div>`;
  }
  function aboutPage(){return `${hero('PROJECT OVERVIEW · PORTFOLIO','Tentang <span>SIGI Web</span>','Sistem informasi operasional dan pemeliharaan yang dirancang untuk menyatukan pemantauan energi, pekerjaan maintenance, laporan harian, dan utilitas.',['Engineering Portfolio','Operational Information System','Offline Demo'])}${demoDisclaimer}<div class="panel-grid"><section class="panel"><div class="panel-head"><div><div class="section-kicker">PROJECT OBJECTIVE</div><h3>Tujuan Proyek</h3></div></div><p style="font-size:12px;color:var(--muted)">SIGI dirancang sebagai pusat informasi operasional lintas divisi. Dashboard menyediakan navigasi menuju modul Elektrik, Mekanik, SPM & Utility, Kalender Job, Maintenance Cost, serta pengelolaan Sparepart Container.</p><p style="font-size:12px;color:var(--muted)">Versi portofolio ini menampilkan alur antarmuka dan interaksi dengan data fiktif agar dapat dicoba tanpa koneksi ke sistem produksi.</p></section><section class="panel"><div class="panel-head"><div><div class="section-kicker">TECHNOLOGY</div><h3>Teknologi Demonstrasi</h3></div></div><div class="hero-tags"><span style="background:#eef2f7;color:#3d4a58">HTML</span><span style="background:#eef2f7;color:#3d4a58">CSS</span><span style="background:#eef2f7;color:#3d4a58">JavaScript</span><span style="background:#eef2f7;color:#3d4a58">PWA</span><span style="background:#eef2f7;color:#3d4a58">Service Worker</span><span style="background:#eef2f7;color:#3d4a58">Local Storage</span></div><p style="font-size:11px;color:var(--muted);margin-top:14px">Aplikasi produksi yang menjadi referensi menggunakan backend PHP dan database SQLite. Portfolio Offline Edition merupakan implementasi statis yang berdiri sendiri.</p></section></div>${sectionHead('MODULE COVERAGE','Cakupan Modul','Semua nama dan kelompok modul mengikuti struktur menu aplikasi SIGI yang diberikan.')}<div class="module-grid">${modules.map(moduleCard).join('')}</div><div class="content-note">Demo ini tidak mewakili performa, data, atau konfigurasi jaringan aktual perusahaan. Seluruh record di dalam demo adalah contoh ilustratif.</div>`;}
  function pageContent(page) {
    if(page==='dashboard') return dashboard();
    if(page==='about') return aboutPage();
    if(['elektrik','mekanik','spm'].includes(page)) return departmentPage(page);
    if(page==='kwh') return kwhPage(false);
    if(page==='kwh-report') return kwhPage(true);
    if(page==='ampere') return amperePage();
    if(page==='daily') return dailyPage(false);
    if(page==='mechanical-daily') return dailyPage(true);
    if(page==='maintenance-cost') return maintenanceCostPage();
    if(page==='calendar') return calendarPage();
    return simpleModulePage(page);
  }
  function render() {
    const page=getPage();
    const title=(modules.find(m=>m.id===page)||{}).title || ({dashboard:'Dashboard',elektrik:'Elektrik',mekanik:'Mekanik',spm:'SPM & Utility',about:'Tentang SIGI'}[page]||'Dashboard');
    document.title=`${title} — SIGI Portfolio Offline`;
    $('#app').className='app-shell';
    $('#app').innerHTML=`<header class="topbar"><div class="topbar-main"><a class="brand" href="#dashboard"><img src="./assets/sigi-logo.png" alt="SIGI"><span>SIGI <em>Portfolio</em></span></a><nav class="topnav" aria-label="Navigasi utama">${topNav()}</nav><div class="top-actions"><button class="install-button" data-install-app>Install App</button><button class="mobile-menu" data-mobile-menu aria-label="Buka menu">☰</button></div></div><div class="subbar"><div class="subbar-inner"><span class="status-pill"><i class="status-dot"></i><span data-network-status>ONLINE</span></span><span>PORTFOLIO DEMO</span><span class="subbar-spacer"></span><span data-cache-status>Menyiapkan cache offline…</span><span>v${APP_VERSION}</span></div></div></header><div class="app-offline-banner" data-offline-banner>Anda sedang offline. SIGI Portfolio berjalan dari penyimpanan perangkat.</div><main class="layout"><aside class="sidebar" data-sidebar>${sidebar()}</aside><div class="content">${pageContent(page)}</div></main><footer class="footer"><span>SIGI Web Portfolio · Offline Edition · v${APP_VERSION}</span><span>Data simulasi · Tidak terhubung ke sistem produksi perusahaan</span></footer><nav class="mobile-bottom"><button class="${page==='dashboard'?'active':''}" data-bottom="dashboard"><span>⌂</span><span>Home</span></button><button class="${page==='elektrik'?'active':''}" data-bottom="elektrik"><span>ϟ</span><span>Elektrik</span></button><button class="${page==='mekanik'?'active':''}" data-bottom="mekanik"><span>⚙</span><span>Mekanik</span></button><button class="${page==='spm'?'active':''}" data-bottom="spm"><span>✓</span><span>SPM</span></button><button data-mobile-menu><span>☰</span><span>Menu</span></button></nav><div class="toast" data-toast></div>`;
    updateNetwork();
    wirePageControls();
    markActiveLinks();
  }
  function markActiveLinks(){ $$('.side-link').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+getPage())); }
  function showToast(message){const t=$('[data-toast]');if(!t)return;t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2800);}
  function updateNetwork(){const online=navigator.onLine;const net=$('[data-network-status]');const banner=$('[data-offline-banner]');if(net)net.textContent=online?'ONLINE':'OFFLINE';if(banner)banner.classList.toggle('show',!online);}
  function setCacheStatus(text){const el=$('[data-cache-status]');if(el)el.textContent=text;}
  function wirePageControls(){
    $$('[data-mobile-menu]').forEach(btn=>btn.addEventListener('click',()=> $('[data-sidebar]')?.classList.toggle('open')));
    $$('[data-bottom]').forEach(btn=>btn.addEventListener('click',()=>location.hash=btn.dataset.bottom));
    $$('[data-action="toast"]').forEach(btn=>btn.addEventListener('click',()=>showToast(btn.dataset.message||'Mode demonstrasi.')));
    const search=$('[data-table-search]');if(search){search.addEventListener('input',()=>{const q=search.value.toLowerCase();const rows=$$('tbody tr');rows.forEach(r=>r.style.display=r.innerText.toLowerCase().includes(q)?'':'none');});}
    const filter=$('[data-status-filter]');if(filter){filter.addEventListener('change',()=>{$$('tbody tr').forEach(r=>r.style.display=!filter.value||r.innerText.includes(filter.value)?'':'none');});}
    const form=$('#demo-report-form');if(form){form.addEventListener('submit',e=>{e.preventDefault();const kind=form.dataset.kind;const key=kind==='mechanical'?'sigiPortfolioMechanicalReports':'sigiPortfolioDailyReports';const arr=JSON.parse(localStorage.getItem(key)||'[]');const data=Object.fromEntries(new FormData(form).entries());arr.unshift(data);localStorage.setItem(key,JSON.stringify(arr.slice(0,30)));showToast('Laporan demo tersimpan di perangkat ini.');render();});}
  }
  function handleInstallButton(){
    if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.then(choice=>{showToast(choice.outcome==='accepted'?'SIGI Portfolio berhasil dipasang.':'Instalasi dibatalkan.');deferredInstall=null;}).catch(()=>{showInstallHelp();});}
    else showInstallHelp();
  }
  function showInstallHelp(){
    const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
    const message=isIOS?'Di Safari: tekan Share, pilih Add to Home Screen, lalu Add.':'Di Chrome: buka menu ⋮ lalu pilih Install app. Jika hanya tersedia Create shortcut, browser/perangkat belum menawarkan instalasi PWA penuh.';
    const backdrop=document.createElement('div');backdrop.className='modal-backdrop';backdrop.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="install-help-title"><h3 id="install-help-title">Pasang SIGI Portfolio</h3><p>${message}</p><p><strong>Mode offline:</strong> buka aplikasi sekali saat internet tersedia dan tunggu indikator “Offline siap”. Setelah itu, uji dengan mode pesawat.</p><div class="modal-actions"><button class="btn" data-close-modal>Tutup</button></div></section>`;document.body.append(backdrop);$('[data-close-modal]',backdrop).addEventListener('click',()=>backdrop.remove());backdrop.addEventListener('click',e=>{if(e.target===backdrop)backdrop.remove();});
  }
  window.addEventListener('beforeinstallprompt', event=>{event.preventDefault();deferredInstall=event;});
  window.addEventListener('appinstalled',()=>showToast('SIGI Portfolio berhasil dipasang.'));
  window.addEventListener('online',updateNetwork);window.addEventListener('offline',updateNetwork);
  window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0,behavior:'smooth'});});
  document.addEventListener('click',e=>{const btn=e.target.closest('[data-install-app]');if(btn)handleInstallButton();});

  if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')){
    navigator.serviceWorker.register(new URL('./app-sw.js',document.baseURI).toString(),{scope:new URL('./',document.baseURI).pathname})
      .then(async reg=>{await navigator.serviceWorker.ready;setCacheStatus('Offline siap · cache aplikasi tersedia');if(!navigator.serviceWorker.controller){navigator.serviceWorker.addEventListener('controllerchange',()=>setCacheStatus('Offline siap · aplikasi tersimpan'),{once:true});}})
      .catch(err=>{console.warn('Service Worker registration error:',err);setCacheStatus('Cache offline belum aktif');});
  } else {
    setTimeout(()=>setCacheStatus('Gunakan hosting HTTPS untuk aktivasi offline'),150);
  }
  render();
})();
