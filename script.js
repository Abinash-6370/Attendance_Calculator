
  // ── CAPTCHA ─────────────────────────────────────────────────────────────────
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captchaValue = '';
 
  function genCaptcha() {
    captchaValue = Array.from({length: 5}, () => CHARS[Math.floor(Math.random()*CHARS.length)]).join('');
    document.getElementById('captchaText').textContent = captchaValue;
    const inp = document.getElementById('captchaInput');
    inp.value = '';
    inp.classList.remove('error','success');
    document.getElementById('captchaErr').classList.remove('show');
  }
 
  document.getElementById('captchaRefresh').addEventListener('click', genCaptcha);
  genCaptcha();
 
  // ── THRESHOLD ────────────────────────────────────────────────────────────────
  let threshold = 80;
  document.querySelectorAll('.thresh-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.thresh-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      threshold = parseInt(btn.dataset.val);
      updateBar();
    });
  });
 
  // ── LIVE BAR ─────────────────────────────────────────────────────────────────
  function updateBar() {
    const t = parseInt(document.getElementById('totalClasses').value) || 0;
    const a = parseInt(document.getElementById('attendedClasses').value) || 0;
    const bar = document.getElementById('attendBar');
    if (t > 0) {
      const pct = Math.min((a/t)*100, 100);
      bar.style.width = pct + '%';
      if (pct >= threshold) bar.style.background = 'var(--accent3)';
      else if (pct >= threshold - 10) bar.style.background = 'var(--warn)';
      else bar.style.background = 'var(--accent2)';
    } else {
      bar.style.width = '0%';
    }
  }
 
  document.getElementById('totalClasses').addEventListener('input', updateBar);
  document.getElementById('attendedClasses').addEventListener('input', updateBar);
 
  // ── CALCULATE ─────────────────────────────────────────────────────────────────
  document.getElementById('calcBtn').addEventListener('click', calculate);
 
  function calculate() {
    let valid = true;
 
    const totalEl = document.getElementById('totalClasses');
    const attendEl = document.getElementById('attendedClasses');
    const captchaEl = document.getElementById('captchaInput');
    const total = parseInt(totalEl.value);
    const attended = parseInt(attendEl.value);
 
    // Clear errors
    ['totalErr','attendErr','captchaErr'].forEach(id => document.getElementById(id).classList.remove('show'));
    [totalEl, attendEl, captchaEl].forEach(el => el.classList.remove('error'));
 
    // Validate total
    if (!total || total < 1) {
      document.getElementById('totalErr').classList.add('show');
      totalEl.classList.add('error');
      valid = false;
    }
 
    // Validate attended
    if (isNaN(attended) || attended < 0 || (total && attended > total)) {
      document.getElementById('attendErr').classList.add('show');
      attendEl.classList.add('error');
      valid = false;
    }
 
    // Validate captcha
    if (captchaEl.value.trim().toUpperCase() !== captchaValue) {
      document.getElementById('captchaErr').classList.add('show');
      captchaEl.classList.add('error');
      captchaEl.classList.remove('success');
      document.querySelector('.captcha-section').classList.add('shake');
      setTimeout(() => document.querySelector('.captcha-section').classList.remove('shake'), 500);
      genCaptcha();
      valid = false;
    } else {
      captchaEl.classList.remove('error');
      captchaEl.classList.add('success');
    }
 
    if (!valid) return;
 
    showResult(total, attended, threshold);
    genCaptcha();
  }
 
  function showResult(total, attended, thresh) {
    const currentPct = (attended / total) * 100;
    const threshDec = thresh / 100;
    const missed = total - attended;
 
    let canBunk = 0, needAttend = 0;
    if (currentPct >= thresh) {
      canBunk = Math.floor(attended / threshDec - total);
      if (canBunk < 0) canBunk = 0;
    } else {
      needAttend = Math.ceil((threshDec * total - attended) / (1 - threshDec));
      if (needAttend < 0) needAttend = 0;
    }
 
    const resultCard = document.getElementById('resultCard');
    resultCard.classList.remove('show','can-miss','need-attend','critical','perfect');
 
    let type, emoji, title, subtitle, color;
    if (attended === total) {
      type = 'perfect'; emoji = '🏆'; title = 'Perfect Attendance!';
      subtitle = `You haven't missed a single class — ${currentPct.toFixed(1)}%`;
      color = '#6c63ff';
    } else if (currentPct >= thresh) {
      type = 'can-miss'; emoji = '😎'; title = "You're Safe — Bunk Away!";
      subtitle = `Your attendance is ${currentPct.toFixed(1)}% — above ${thresh}%`;
      color = '#43e97b';
    } else if (currentPct >= thresh - 10) {
      type = 'need-attend'; emoji = '⚠️'; title = 'Below Target — Attend More!';
      subtitle = `Your attendance is ${currentPct.toFixed(1)}% — just below ${thresh}%`;
      color = '#f7971e';
    } else {
      type = 'critical'; emoji = '🚨'; title = 'Critical — Attend ASAP!';
      subtitle = `Your attendance is only ${currentPct.toFixed(1)}%`;
      color = '#ff3250';
    }
 
    resultCard.classList.add('show', type);
    document.getElementById('resultEmoji').textContent = emoji;
 
    // ── ZONE BADGE in title ───────────────────────────────────────────────────
    let badgeHTML = '';
    if (type === 'can-miss' || type === 'perfect') {
      badgeHTML = `<span class="zone-badge safe-badge"><span class="badge-dot"></span>Safe Zone</span>`;
    } else if (type === 'need-attend') {
      badgeHTML = `<span class="zone-badge warn-badge"><span class="badge-dot"></span>Warning</span>`;
    } else {
      badgeHTML = `<span class="zone-badge danger-badge"><span class="badge-dot"></span>Danger Zone</span>`;
    }
    document.getElementById('resultTitle').innerHTML = title + ' ' + badgeHTML;
    document.getElementById('resultSubtitle').textContent = subtitle;
 
    // ── SMART ALERT BANNER ───────────────────────────────────────────────────
    const alertBanner = document.getElementById('alertBanner');
    alertBanner.classList.remove('show','danger','warning','safe');
 
    if (currentPct < 75) {
      alertBanner.classList.add('show','danger');
      document.getElementById('alertIcon').textContent = '🚨';
      document.getElementById('alertZoneLabel').textContent = '🔴 Danger Zone — Action Required';
      document.getElementById('alertMsg').innerHTML =
        `Attendance is <strong>${currentPct.toFixed(1)}%</strong> — critically below the 75% minimum. You need <strong>${needAttend} more classes</strong> to recover. Stop skipping immediately!`;
    } else if (currentPct < thresh) {
      alertBanner.classList.add('show','warning');
      document.getElementById('alertIcon').textContent = '⚠️';
      document.getElementById('alertZoneLabel').textContent = '🟡 Warning — Below Required Threshold';
      document.getElementById('alertMsg').innerHTML =
        `Attendance is <strong>${currentPct.toFixed(1)}%</strong>, just below the required <strong>${thresh}%</strong>. Attend <strong>${needAttend} more classes</strong> to get back on track.`;
    } else {
      alertBanner.classList.add('show','safe');
      document.getElementById('alertIcon').textContent = '✅';
      document.getElementById('alertZoneLabel').textContent = '🟢 Safe Zone — You\'re Good!';
      document.getElementById('alertMsg').innerHTML =
        `Attendance is <strong>${currentPct.toFixed(1)}%</strong> — above the required <strong>${thresh}%</strong>. You can safely skip <strong>${canBunk} class${canBunk!==1?'es':''}</strong> without falling below the threshold.`;
    }
 
    // ── PIE CHART ─────────────────────────────────────────────────────────────
    renderPieChart(attended, missed, currentPct, color, thresh, total);
 
    // ── STATS GRID ────────────────────────────────────────────────────────────
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
      <div class="stat-box">
        <div class="stat-value" style="color:${color}">${currentPct.toFixed(1)}%</div>
        <div class="stat-label">Current %</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:${color}">${thresh}%</div>
        <div class="stat-label">Required %</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${attended}</div>
        <div class="stat-label">Attended</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${missed}</div>
        <div class="stat-label">Missed</div>
      </div>
    `;
 
    // ── HIGHLIGHT + MESSAGE ───────────────────────────────────────────────────
    let highlightHTML = '';
    if (currentPct >= thresh) {
      highlightHTML = `
        <div style="background:rgba(67,233,123,0.1);border:1.5px solid rgba(67,233,123,0.35);border-radius:16px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;gap:18px;">
          <div style="font-size:2.4rem;line-height:1;">🛌</div>
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#43e97b;margin-bottom:4px;">Classes You Can Bunk</div>
            <div style="font-family:'Syne',sans-serif;font-size:2.6rem;font-weight:800;color:#43e97b;line-height:1;">${canBunk}</div>
            <div style="font-size:0.82rem;color:var(--muted);margin-top:4px;">future class${canBunk!==1?'es':''} you can skip &amp; still stay ≥ ${thresh}%</div>
          </div>
        </div>`;
    } else {
      highlightHTML = `
        <div style="background:${type==='critical'?'rgba(255,50,80,0.1)':'rgba(247,151,30,0.1)'};border:1.5px solid ${type==='critical'?'rgba(255,50,80,0.35)':'rgba(247,151,30,0.35)'};border-radius:16px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;gap:18px;">
          <div style="font-size:2.4rem;line-height:1;">📚</div>
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${color};margin-bottom:4px;">Classes You Must Attend</div>
            <div style="font-family:'Syne',sans-serif;font-size:2.6rem;font-weight:800;color:${color};line-height:1;">${needAttend}</div>
            <div style="font-size:0.82rem;color:var(--muted);margin-top:4px;">consecutive class${needAttend!==1?'es':''} without skipping to reach ${thresh}%</div>
          </div>
        </div>`;
    }
 
    let msgText = '';
    if (attended === total) {
      msgText = `<strong>Incredible!</strong> You attended every class. You can bunk <strong>${canBunk}</strong> future class${canBunk!==1?'es':''} and still maintain ${thresh}% attendance.`;
    } else if (currentPct >= thresh) {
      msgText = `<strong>You're in the clear!</strong> With ${attended} out of ${total} classes attended, you can skip <strong>${canBunk}</strong> more class${canBunk!==1?'es':''} before dipping below ${thresh}%. Enjoy — but don't push it!`;
    } else {
      const shortfall = Math.ceil(threshDec * total - attended);
      msgText = `<strong>You're ${shortfall} class${shortfall!==1?'es':''} short</strong> of the ${thresh}% requirement. Attend <strong>${needAttend}</strong> class${needAttend!==1?'es':''} in a row without missing any to get back on track. No more bunking until then!`;
    }
    document.getElementById('resultMessage').innerHTML = highlightHTML + `<div style="font-size:0.88rem;line-height:1.7;color:var(--text);">${msgText}</div>`;
 
    // ── PROGRESS BAR ──────────────────────────────────────────────────────────
    const pf = document.getElementById('progressFill');
    pf.style.background = color;
    pf.style.width = '0%';
    setTimeout(() => { pf.style.width = Math.min(currentPct, 100) + '%'; }, 100);
 
    setTimeout(() => { resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 200);
  }
 
  // ── PIE CHART RENDERER ────────────────────────────────────────────────────
  function renderPieChart(attended, missed, currentPct, attendColor, thresh, total) {
    const svg = document.getElementById('pieSvg');
    const cx = 70, cy = 70, r = 54, innerR = 34;
    const total2 = attended + missed;
 
    // Wedge path helper
    function describeWedge(cx, cy, r, startAngle, endAngle) {
      const toRad = a => (a - 90) * Math.PI / 180;
      const x1 = cx + r * Math.cos(toRad(startAngle));
      const y1 = cy + r * Math.sin(toRad(startAngle));
      const x2 = cx + r * Math.cos(toRad(endAngle));
      const y2 = cy + r * Math.sin(toRad(endAngle));
      const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
      return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }
 
    function describeArc(cx, cy, outerR, innerR2, startAngle, endAngle) {
      if (endAngle - startAngle >= 360) endAngle = startAngle + 359.99;
      const toRad = a => (a - 90) * Math.PI / 180;
      const x1o = cx + outerR * Math.cos(toRad(startAngle));
      const y1o = cy + outerR * Math.sin(toRad(startAngle));
      const x2o = cx + outerR * Math.cos(toRad(endAngle));
      const y2o = cy + outerR * Math.sin(toRad(endAngle));
      const x1i = cx + innerR2 * Math.cos(toRad(endAngle));
      const y1i = cy + innerR2 * Math.sin(toRad(endAngle));
      const x2i = cx + innerR2 * Math.cos(toRad(startAngle));
      const y2i = cy + innerR2 * Math.sin(toRad(startAngle));
      const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
      return `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR2} ${innerR2} 0 ${largeArc} 0 ${x2i} ${y2i} Z`;
    }
 
    const attendedAngle = (attended / total2) * 360;
    const missedAngle = (missed / total2) * 360;
    const threshAngle = (thresh / 100) * 360;
 
    // Colors
    const missedColor = '#ff3250';
    const gapColor = '#1a1a26';
 
    // Build SVG content
    let svgContent = `<defs>
      <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.5)" flood-opacity="1"/>
      </filter>
    </defs>`;
 
    // Background circle
    svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#111118"/>`;
 
    if (total2 === 0) {
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.05)"/>`;
    } else if (missed === 0) {
      // Full circle attended
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${attendColor}" opacity="0.9"/>`;
    } else if (attended === 0) {
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${missedColor}" opacity="0.9"/>`;
    } else {
      // Attended slice
      svgContent += `<path d="${describeArc(cx,cy,r,innerR,0,attendedAngle)}" fill="${attendColor}" opacity="0.9"/>`;
      // Missed slice
      svgContent += `<path d="${describeArc(cx,cy,r,innerR,attendedAngle,360)}" fill="${missedColor}" opacity="0.85"/>`;
    }
 
    // Threshold marker line
    const threshRad = (threshAngle - 90) * Math.PI / 180;
    const mx1 = cx + innerR * Math.cos(threshRad);
    const my1 = cy + innerR * Math.sin(threshRad);
    const mx2 = cx + (r+4) * Math.cos(threshRad);
    const my2 = cy + (r+4) * Math.sin(threshRad);
    svgContent += `
      <line x1="${mx1}" y1="${my1}" x2="${mx2}" y2="${my2}" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-dasharray="3,2" stroke-linecap="round"/>
      <text x="${mx2 + (Math.cos(threshRad)>0?5:-5)}" y="${my2 + (Math.sin(threshRad)>0?5:-3)}"
        text-anchor="${Math.cos(threshRad)>0?'start':'end'}"
        font-size="8" font-family="Syne, sans-serif" font-weight="700"
        fill="rgba(255,255,255,0.7)">${thresh}% req.</text>`;
 
    // Inner hole
    svgContent += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#111118"/>`;
    // Subtle ring
    svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
    svgContent += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
 
    svg.innerHTML = svgContent;
 
    // Center text
    document.getElementById('pieCenterPct').textContent = currentPct.toFixed(0) + '%';
    document.getElementById('pieCenterPct').style.color = attendColor;
 
    // Legend
    document.getElementById('pieLegend').innerHTML = `
      <div class="legend-item">
        <div class="legend-swatch" style="background:${attendColor};"></div>
        <div class="legend-info">
          <div class="legend-label">Attended</div>
          <div class="legend-val" style="color:${attendColor}">${attended} <span style="font-size:0.7rem;color:var(--muted);font-weight:400">(${currentPct.toFixed(1)}%)</span></div>
        </div>
      </div>
      <div class="legend-item">
        <div class="legend-swatch" style="background:${missedColor};"></div>
        <div class="legend-info">
          <div class="legend-label">Missed</div>
          <div class="legend-val" style="color:${missedColor}">${missed} <span style="font-size:0.7rem;color:var(--muted);font-weight:400">(${(100-currentPct).toFixed(1)}%)</span></div>
        </div>
      </div>
      <div class="legend-item">
        <div class="legend-swatch" style="background:rgba(255,255,255,0.4);border:1px dashed rgba(255,255,255,0.5);"></div>
        <div class="legend-info">
          <div class="legend-label">Required</div>
          <div class="legend-val" style="color:rgba(255,255,255,0.7)">${thresh}%</div>
        </div>
      </div>
    `;
  }
 
  // ── ENTER KEY ─────────────────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculate();
  });
