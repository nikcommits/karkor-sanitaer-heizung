/**
 * Karkor SHK Planer Script
 * Core engine for multi-step digital lead qualification and pricing.
 */

class SHKPlaner {
  static EMAILJS_CONFIG = {
    serviceId: 'service_karkor',
    templateId: 'template_anfrage',
  };

  constructor() {
    this.content = null;
    this.currentTrade = null; // 'badsanierung', 'waermepumpe', 'split_klima', 'heizung'
    this.currentStepIndex = -1; // -1 means trade selection
    this.answers = {};
    this.stepsHistory = [];
    this.inRejectionState = false;

    // Elements
    this.container = document.getElementById('planer-card-container');
    this.progressWrapper = document.getElementById('planer-progress-wrapper');
    this.progressBarFill = document.getElementById('planer-progress-bar-fill');
    this.progressStepText = document.getElementById('planer-progress-step-text');
    this.progressPercentText = document.getElementById('planer-progress-percent-text');
  }

  async init() {
    // Hydrate content either from window variable (CORS fallback) or fetch content.json
    if (window.__ASE_CONTENT__) {
      this.content = window.__ASE_CONTENT__.planer;
      console.log('Planer: Content loaded from window.__ASE_CONTENT__');
    } else {
      try {
        const response = await fetch('./content/content.json');
        const data = await response.json();
        this.content = data.planer;
        console.log('Planer: Content loaded from content.json');
      } catch (err) {
        console.error('Planer: Error loading content config', err);
        this.container.innerHTML = `<div style="color: red; padding: 40px; text-align: center;">
          <strong>Fehler beim Laden:</strong> Content konnte nicht geladen werden.<br/>
          <small>${err.message}</small>
        </div>`;
        return;
      }
    }

    if (!this.content) {
      console.error('Planer: Planer configuration not found in content.');
      this.container.innerHTML = `<div style="color: red; padding: 40px; text-align: center;">
        <strong>Fehler:</strong> Planer-Konfiguration nicht gefunden.
      </div>`;
      return;
    }

    // Check for trade query parameter to auto-select trade flow
    const urlParams = new URLSearchParams(window.location.search);
    const tradeParam = urlParams.get('trade');
    if (tradeParam && this.content.services[tradeParam]) {
      this.selectTrade(tradeParam);
    } else {
      this.showTradeSelection();
    }
  }

  updateProgress() {
    if (this.currentStepIndex === -1 || this.inRejectionState) {
      this.progressWrapper.style.display = 'none';
      return;
    }

    this.progressWrapper.style.display = 'block';
    const totalQuestions = this.content.services[this.currentTrade].questions.length;
    // Total steps = trade selection (0) + questions (1..N) + budget_optional (N+1) + contact/summary (N+2)
    const currentStepNum = this.currentStepIndex + 1;
    const totalStepsNum = totalQuestions + 2;
    const percent = Math.min(Math.round((currentStepNum / totalStepsNum) * 100), 100);

    this.progressBarFill.style.width = `${percent}%`;
    this.progressStepText.textContent = `Schritt ${currentStepNum} von ${totalStepsNum}`;
    this.progressPercentText.textContent = `${percent}%`;
  }

  showTradeSelection() {
    this.currentTrade = null;
    this.currentStepIndex = -1;
    this.answers = {};
    this.stepsHistory = [];
    this.inRejectionState = false;
    this.updateProgress();

    let html = `
      <h1 class="planer-step-title" style="text-align: center;">${this.content.title}</h1>
      <p class="planer-step-desc" style="text-align: center; max-width: 600px; margin: 0 auto 40px;">${this.content.subtitle}</p>
      
      <div class="options-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
    `;

    for (const [key, svc] of Object.entries(this.content.services)) {
      html += `
        <div class="option-card trade-card" data-trade="${key}">
          <div class="option-card-content">
            <div class="option-card-label">${svc.title}</div>
            <div class="option-card-desc">${svc.description}</div>
          </div>
        </div>
      `;
    }

    html += `
      </div>
    `;

    this.container.innerHTML = html;

    // Attach listeners
    this.container.querySelectorAll('.trade-card').forEach(card => {
      card.addEventListener('click', () => {
        const trade = card.getAttribute('data-trade');
        this.selectTrade(trade);
      });
    });
  }

  selectTrade(trade) {
    this.currentTrade = trade;
    this.currentStepIndex = 0;
    this.stepsHistory = [];
    this.renderStep();
  }

  renderStep() {
    this.inRejectionState = false;
    this.updateProgress();
    const service = this.content.services[this.currentTrade];
    const totalQuestions = service.questions.length;

    // Check if this is the budget_optional step
    if (this.currentStepIndex === totalQuestions) {
      this.showBudgetOptionalStep();
      return;
    }

    // Check if this is the summary step
    if (this.currentStepIndex === totalQuestions + 1) {
      this.showSummaryScreen();
      return;
    }

    const question = service.questions[this.currentStepIndex];
    const isLastStep = this.currentStepIndex === service.questions.length;

    if (isLastStep) {
      this.showSummaryScreen();
      return;
    }

    const savedVal = this.answers[question.id];

    let html = `
      <div class="planer-step active">
        <h2 class="planer-step-title">${question.frage}</h2>
        ${question.hinweis ? `<p class="planer-step-desc">${question.hinweis}</p>` : '<div style="height: 16px;"></div>'}
        
        <div id="planer-input-container">
    `;

    if (question.typ === 'slider') {
      const currentVal = savedVal !== undefined ? savedVal : question.default;
      html += `
        <div class="slider-container">
          <div class="slider-val-display"><span id="slider-val">${currentVal}</span><span>${question.unit}</span></div>
          <input type="range" class="planer-range-input" id="q-input" min="${question.min}" max="${question.max}" value="${currentVal}">
          <div class="slider-limits">
            <span>${question.min} ${question.unit}</span>
            <span>${question.max} ${question.unit}</span>
          </div>
        </div>
      `;
    } else if (question.typ === 'select') {
      html += `<div class="options-grid">`;
      question.optionen.forEach(opt => {
        const isSelected = savedVal === opt.id || (savedVal === undefined && question.default === opt.id);
        html += `
          <div class="option-card select-card ${isSelected ? 'selected' : ''}" data-value="${opt.id}">
            <div class="option-input-indicator"></div>
            <div class="option-card-content">
              <div class="option-card-label">${opt.label}</div>
              <div class="option-card-desc">${opt.desc || ''}</div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    } else if (question.typ === 'checkboxes') {
      html += `<div class="options-grid">`;
      question.optionen.forEach(opt => {
        const isSelected = Array.isArray(savedVal) && savedVal.includes(opt.id);
        html += `
          <div class="option-card checkbox-card checkbox-type ${isSelected ? 'selected' : ''}" data-value="${opt.id}">
            <div class="option-input-indicator"></div>
            <div class="option-card-content">
              <div class="option-card-label">${opt.label}</div>
              <div class="option-card-desc">${opt.desc || ''}</div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    } else if (question.typ === 'number') {
      const currentVal = savedVal !== undefined ? savedVal : (question.default || '');
      html += `
        <div class="input-container">
          <input type="number" class="planer-text-input" id="q-input" value="${currentVal}" placeholder="${question.placeholder || ''}" min="0">
        </div>
      `;
    } else if (question.typ === 'text') {
      const currentVal = savedVal !== undefined ? savedVal : '';
      html += `
        <div class="input-container">
          <input type="text" class="planer-text-input" id="q-input" value="${currentVal}" placeholder="${question.placeholder || ''}">
        </div>
      `;
    } else if (question.typ === 'textarea') {
      const currentVal = savedVal !== undefined ? savedVal : '';
      html += `
        <div class="input-container">
          <textarea class="planer-text-input planer-textarea" id="q-input"
                    placeholder="${question.placeholder || ''}"
                    rows="5">${currentVal}</textarea>
        </div>
      `;
    }

    html += `
        </div>
        
        <!-- Warning Banner Container -->
        <div id="planer-warning-container" style="display: none;"></div>

        <!-- Navigation Buttons -->
        <div class="planer-actions">
          <button class="btn btn-outline" id="planer-btn-back">${this.content.btn_back}</button>
          <button class="btn btn-primary" id="planer-btn-next">${this.content.btn_next}</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    // Attach interaction handlers
    this.setupStepEvents(question);
  }

  showBudgetOptionalStep() {
    const savedMin = this.answers['wunschbudget_min'] || '';
    const savedMax = this.answers['wunschbudget_max'] || '';

    const html = `
      <div class="planer-step active">
        <h2 class="planer-step-title">Haben Sie ein Wunschbudget?</h2>
        <p class="planer-step-desc">Diese Angabe ist freiwillig und hilft uns, Ihnen ein passendes Angebot zu erstellen.</p>

        <div class="planer-budget-optional-grid">
          <div class="planer-contact-field">
            <label for="budget-min">Budget von (€)</label>
            <input type="number" id="budget-min" class="planer-text-input"
                   placeholder="z.B. 10000" value="${savedMin}" min="0" step="500">
          </div>
          <div class="planer-contact-field">
            <label for="budget-max">Budget bis (€)</label>
            <input type="number" id="budget-max" class="planer-text-input"
                   placeholder="z.B. 20000" value="${savedMax}" min="0" step="500">
          </div>
        </div>
        <p style="font-size: 13px; color: var(--mute); margin-top: -8px; margin-bottom: 24px;">
          Sie können auch nur einen Wert angeben oder das Feld leer lassen.
        </p>

        <div class="planer-actions">
          <button class="btn btn-outline" id="planer-btn-back">${this.content.btn_back}</button>
          <button class="btn btn-primary" id="planer-btn-next">${this.content.btn_next}</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    document.getElementById('planer-btn-back').addEventListener('click', () => this.handleBack());
    document.getElementById('planer-btn-next').addEventListener('click', () => {
      const minVal = document.getElementById('budget-min').value;
      const maxVal = document.getElementById('budget-max').value;
      this.answers['wunschbudget_min'] = minVal;
      this.answers['wunschbudget_max'] = maxVal;
      this.stepsHistory.push(this.currentStepIndex);
      this.currentStepIndex++;
      this.renderStep();
    });
  }

  setupStepEvents(question) {
    const nextBtn = document.getElementById('planer-btn-next');
    const backBtn = document.getElementById('planer-btn-back');
    const warningContainer = document.getElementById('planer-warning-container');

    const validate = () => {
      let val = this.getInputValue(question);
      let isValid = true;

      if (question.typ === 'select') {
        isValid = val !== undefined && val !== '';
      } else if (question.typ === 'number') {
        isValid = val !== '' && !isNaN(val) && Number(val) > 0;
      } else if (question.typ === 'text') {
        isValid = val.trim() !== '';
      }

      nextBtn.disabled = !isValid;
      nextBtn.style.opacity = isValid ? '1' : '0.5';
      nextBtn.style.pointerEvents = isValid ? 'auto' : 'none';

      // Check soft warnings in real time
      this.checkSoftWarnings(question.id, val, warningContainer);
    };

    // Events based on type
    if (question.typ === 'slider') {
      const slider = document.getElementById('q-input');
      const display = document.getElementById('slider-val');
      slider.addEventListener('input', (e) => {
        display.textContent = e.target.value;
        validate();
      });
    } else if (question.typ === 'select') {
      this.container.querySelectorAll('.select-card').forEach(card => {
        card.addEventListener('click', () => {
          this.container.querySelectorAll('.select-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          validate();
        });
      });
    } else if (question.typ === 'checkboxes') {
      this.container.querySelectorAll('.checkbox-card').forEach(card => {
        card.addEventListener('click', () => {
          card.classList.toggle('selected');
          validate();
        });
      });
    } else if (question.typ === 'number' || question.typ === 'text') {
      const input = document.getElementById('q-input');
      input.addEventListener('input', validate);
    } else if (question.typ === 'textarea') {
      const input = document.getElementById('q-input');
      input.addEventListener('input', validate);
    }

    backBtn.addEventListener('click', () => this.handleBack());
    nextBtn.addEventListener('click', () => this.handleNext(question));

    // Run initial validation
    validate();
  }

  getInputValue(question) {
    if (question.typ === 'slider') {
      return Number(document.getElementById('q-input').value);
    } else if (question.typ === 'select') {
      const selected = this.container.querySelector('.select-card.selected');
      return selected ? selected.getAttribute('data-value') : undefined;
    } else if (question.typ === 'checkboxes') {
      const selected = [];
      this.container.querySelectorAll('.checkbox-card.selected').forEach(c => {
        selected.push(c.getAttribute('data-value'));
      });
      return selected;
    } else if (question.typ === 'number') {
      const val = document.getElementById('q-input').value;
      return val === '' ? '' : Number(val);
    } else if (question.typ === 'text') {
      return document.getElementById('q-input').value;
    } else if (question.typ === 'textarea') {
      return document.getElementById('q-input').value;
    }
    return undefined;
  }

  checkSoftWarnings(questionId, val, container) {
    container.style.display = 'none';
    container.innerHTML = '';

    if (this.currentTrade === 'badsanierung') {
      if (questionId === 'umfang') {
        const budget = this.answers['budgetrahmen'];
        if (val === 'teilsanierung' && budget === 'unter_15') {
          container.innerHTML = `<div class="planer-warning-banner">Wir konzentrieren uns auf ganzheitliche Badprojekte. Für kleinere Teilmaßnahmen empfehlen wir Ihnen gerne Partnerbetriebe aus unserem Netzwerk.</div>`;
          container.style.display = 'block';
        }
      } else if (questionId === 'budgetrahmen') {
        const umfang = this.answers['umfang'];
        if (umfang === 'teilsanierung' && val === 'unter_15') {
          container.innerHTML = `<div class="planer-warning-banner">Wir konzentrieren uns auf ganzheitliche Badprojekte. Für kleinere Teilmaßnahmen empfehlen wir Ihnen gerne Partnerbetriebe aus unserem Netzwerk.</div>`;
          container.style.display = 'block';
        }
      }
    } else if (this.currentTrade === 'waermepumpe') {
      if (questionId === 'vorlauftemperatur') {
        const daemm = this.answers['daemmstandard'];
        if (val === 'ueber_55' && daemm === 'unsaniert') {
          container.innerHTML = `<div class="planer-warning-banner">Ohne energetische Sanierung oder den Tausch einzelner Heizflächen kann die Wärmepumpe im Bestandsbau unwirtschaftlich sein. Wir prüfen vor Ort gerne eine Hybridlösung oder Hochtemperatur-Systeme.</div>`;
          container.style.display = 'block';
        }
      } else if (questionId === 'daemmstandard') {
        const vorlauf = this.answers['vorlauftemperatur'];
        if (vorlauf === 'ueber_55' && val === 'unsaniert') {
          container.innerHTML = `<div class="planer-warning-banner">Ohne energetische Sanierung oder den Tausch einzelner Heizflächen kann die Wärmepumpe im Bestandsbau unwirtschaftlich sein. Wir prüfen vor Ort gerne eine Hybridlösung oder Hochtemperatur-Systeme.</div>`;
          container.style.display = 'block';
        }
      }
    } else if (this.currentTrade === 'split_klima') {
      if (questionId === 'gebaeudeart' && val === 'mietwohnung') {
        container.innerHTML = `<div class="planer-warning-banner">In Mietwohnungen sind bauliche Änderungen genehmigungspflichtig. Bitte klären Sie vorab die schriftliche Zustimmung des Vermieters.</div>`;
        container.style.display = 'block';
      }
    }
  }

  handleNext(question) {
    const val = this.getInputValue(question);
    this.answers[question.id] = val;

    // Check hard rejection rules
    const rejectionReason = this.checkHardRejection(question.id, val);
    if (rejectionReason) {
      this.showRejectionScreen(rejectionReason);
      return;
    }

    this.stepsHistory.push(this.currentStepIndex);
    this.currentStepIndex++;
    this.renderStep();
  }

  handleBack() {
    if (this.inRejectionState) {
      this.inRejectionState = false;
      this.renderStep();
      return;
    }

    if (this.stepsHistory.length > 0) {
      this.currentStepIndex = this.stepsHistory.pop();
      this.renderStep();
    } else {
      this.showTradeSelection();
    }
  }

  checkHardRejection(questionId, val) {
    if (this.currentTrade === 'badsanierung') {
      if (questionId === 'asbest_verdacht' && val === 'bestaetigt') {
        return "Asbest nachgewiesen: Vor einer Badsanierung muss eine fachgerechte Asbestsanierung durch ein zertifiziertes Spezialunternehmen geklärt und abgeschlossen sein.";
      }
      if (questionId === 'budgetrahmen') {
        const umfang = this.answers['umfang'];
        if (umfang === 'nur_fliesen' && val === 'unter_15') {
          return "Reine Fliesenerneuerung / Kleinstreparaturen ohne Sanitärinstallationen können wir als meistergeführter Komplettanbieter wirtschaftlich leider nicht anbieten.";
        }
      }
      if (questionId === 'umfang' && val === 'nur_fliesen') {
        const budget = this.answers['budgetrahmen'];
        if (budget === 'unter_15') {
          return "Reine Fliesenerneuerung / Kleinstreparaturen ohne Sanitärinstallationen können wir als meistergeführter Komplettanbieter wirtschaftlich leider nicht anbieten.";
        }
      }
    } else if (this.currentTrade === 'waermepumpe') {
      if (questionId === 'aufstellort' && val === 'keiner') {
        return "Ohne geeignete Aufstellfläche im Außenbereich (z. B. Garten, Hof oder Flachdach) ist die Installation einer Luft-Wasser-Wärmepumpe technisch leider nicht möglich.";
      }
    } else if (this.currentTrade === 'split_klima') {
      if (questionId === 'weg_genehmigung' && val === 'nein') {
        return "Ohne schriftliche Zustimmung der Eigentümergemeinschaft (WEG) dürfen keine baulichen Veränderungen (Kernbohrungen, Außengerät) am Gemeinschaftseigentum vorgenommen werden.";
      }
      if (questionId === 'denkmalschutz' && val === 'ja') {
        return "Fassadendenkmalschutz verhindert in der Regel die Montage klassischer Außeneinheiten an der Außenwand. Daher ist eine Standardumsetzung leider nicht möglich.";
      }
    } else if (this.currentTrade === 'heizung') {
      if (questionId === 'erdgasanschluss') {
        const bisher = this.answers['brennstoff_bisher'];
        if (val === 'nein_kein' && bisher !== 'fluessiggas') {
          return "Wenn kein Erdgasanschluss vorhanden ist und Flüssiggas nicht infrage kommt, kann kein Gas-Brennwertgerät verbaut werden. Wir beraten Sie gerne zu Wärmepumpen-Alternativen.";
        }
      }
      if (questionId === 'brennstoff_bisher' && val !== 'fluessiggas') {
        const gas = this.answers['erdgasanschluss'];
        if (gas === 'nein_kein') {
          return "Wenn kein Erdgasanschluss vorhanden ist und Flüssiggas nicht infrage kommt, kann kein Gas-Brennwertgerät verbaut werden. Wir beraten Sie gerne zu Wärmepumpen-Alternativen.";
        }
      }
    }
    return null;
  }

  showRejectionScreen(reason) {
    this.inRejectionState = true;
    this.updateProgress();

    this.container.innerHTML = `
      <div class="planer-step active planer-rejection-card">
        <div class="planer-rejection-icon">✕</div>
        <h2 class="planer-step-title">${this.content.rejection_title}</h2>
        <p class="planer-step-desc">${this.content.rejection_sub}</p>
        
        <div class="planer-rejection-reason">
          <strong>Grund:</strong> ${reason}
        </div>

        <div class="planer-actions" style="justify-content: center;">
          <button class="btn btn-outline" id="planer-btn-back">${this.content.btn_back}</button>
        </div>
      </div>
    `;

    document.getElementById('planer-btn-back').addEventListener('click', () => this.handleBack());
  }

  calculateBudget() {
    let min = 0;
    let max = 0;
    let extraSummary = [];

    if (this.currentTrade === 'badsanierung') {
      const qm = this.answers['badgroesse'] || 8;
      const segment = this.answers['segment'];
      
      let rateMin = 1000;
      let rateMax = 1800;

      if (segment === 'komfort_bad') {
        rateMin = 1800;
        rateMax = 2500;
      } else if (segment === 'premium_bad') {
        rateMin = 2500;
        rateMax = 3500;
      }

      min = rateMin * qm;
      max = rateMax * qm;

      // Apply scaling rule (qm < 5 -> min project value 15000)
      if (qm < 5) {
        if (min < 15000) min = 15000;
        if (max < 15000) max = 15000;
      }
      
      // Apply scaling rule (qm >= 15 -> reduction of 10-15%)
      if (qm >= 15) {
        min = Math.round(min * 0.90);
        max = Math.round(max * 0.85);
      }

      // Add extras
      const extras = this.answers['zuschlaege'] || [];
      if (extras.includes('walk_in_dusche')) { min += 3000; max += 7000; extraSummary.push("Walk-In-Dusche"); }
      if (extras.includes('freistehende_wanne')) { min += 3000; max += 8000; extraSummary.push("Freistehende Badewanne"); }
      if (extras.includes('doppelwaschtisch')) { min += 2500; max += 6000; extraSummary.push("Doppelwaschtisch"); }
      if (extras.includes('rohrleitungswechsel')) { min += 4000; max += 12000; extraSummary.push("Rohrleitungswechsel"); }

    } else if (this.currentTrade === 'waermepumpe') {
      const paket = this.answers['paket'];
      let baseMin = 18000, baseMax = 28000;

      if (paket === 'lw_wp_10_16kw') {
        baseMin = 22000; baseMax = 35000;
      } else if (paket === 'lw_wp_ueber_16kw') {
        baseMin = 28000; baseMax = 45000;
      }

      min = baseMin;
      max = baseMax;

      const extras = this.answers['extras'] || [];
      if (extras.includes('elektrik_ausbau')) { min += 1500; max += 3500; extraSummary.push("Elektrik-Erweiterung"); }
      if (extras.includes('oeltank_entsorgung')) { min += 3000; max += 8000; extraSummary.push("Öltank-Entsorgung"); }
      if (extras.includes('asbest_heizraum')) { min += 5000; max += 15000; extraSummary.push("Asbest Heizraumsanierung"); }
      if (extras.includes('niedertemperatur_heizkoerper')) { min += 8000; max += 20000; extraSummary.push("Niedertemperatur-Heizkörper"); }
      if (extras.includes('fundament')) { min += 800; max += 2500; extraSummary.push("Außenfundament"); }

    } else if (this.currentTrade === 'split_klima') {
      const count = this.answers['raeume_anzahl'];
      let baseMin = 2500, baseMax = 4500;

      if (count === 'multi_2') {
        baseMin = 4000; baseMax = 7000;
      } else if (count === 'multi_3_4') {
        baseMin = 7000; baseMax = 14000;
      }

      min = baseMin;
      max = baseMax;

      const extras = this.answers['extras'] || [];
      if (extras.includes('leitung_lang')) { min += 400; max += 900; extraSummary.push("Zusätzliche Leitungslänge (>5m)"); }
      if (extras.includes('bohrung_beton')) { min += 150; max += 300; extraSummary.push("Kernbohrungen Beton/KS"); }
      if (extras.includes('dachmontage')) { min += 800; max += 2500; extraSummary.push("Dachmontage"); }
      if (extras.includes('kondensatpumpe')) { min += 250; max += 600; extraSummary.push("Kondensatpumpe"); }

    } else if (this.currentTrade === 'heizung') {
      const type = this.answers['paket'];
      let baseMin = 9000, baseMax = 15000;

      if (type === 'gas_hybrid_ready') {
        baseMin = 11000; baseMax = 18000;
      } else if (type === 'gas_solar_ww') {
        baseMin = 15000; baseMax = 23000;
      } else if (type === 'gas_solar_heizung') {
        baseMin = 18000; baseMax = 30000;
      }

      min = baseMin;
      max = baseMax;

      const extras = this.answers['extras'] || [];
      if (extras.includes('schornsteinsanierung')) { min += 1500; max += 4000; extraSummary.push("Schornsteinsanierung"); }
      if (extras.includes('gasanschluss_neu')) { min += 2500; max += 6000; extraSummary.push("Neuer Gasanschluss"); }
      if (extras.includes('fluessiggas_tank')) { min += 3500; max += 9000; extraSummary.push("Flüssiggastank"); }
    }

    return { min, max, extraSummary };
  }

  calculateSubsidies(totalCost) {
    if (this.currentTrade !== 'waermepumpe') return null;

    let pct = 30; // Grundförderung
    if (this.answers['foerder_klimabonus'] === 'ja') pct += 20;
    if (this.answers['foerder_einkommen'] === 'ja') pct += 30;
    if (this.answers['foerder_kaeltemittel'] === 'ja') pct += 5;

    // Capped at 70%
    pct = Math.min(pct, 70);

    const maxEligible = 30000;
    const maxSubsidy = maxEligible * (pct / 100);
    const actualSubsidy = Math.round(Math.min(totalCost, maxEligible) * (pct / 100));

    return {
      percent: pct,
      maxEligible,
      amount: actualSubsidy,
      net: totalCost - actualSubsidy
    };
  }

  showSummaryScreen() {
    this.updateProgress();
    // Berechne Budget intern und speichere es (wird nicht angezeigt!)
    this._internalBudget = this.calculateBudget();
    const avgCost = (this._internalBudget.min + this._internalBudget.max) / 2;
    this._internalSubsidy = this.calculateSubsidies(avgCost);

    let html = `
      <div class="planer-step active">
        <h2 class="planer-step-title">${this.content.success_title}</h2>
        <p class="planer-step-desc">${this.content.success_sub}</p>

      <h3 class="planer-step-title" style="font-size: 18px; margin-top: 32px; border-bottom: 1px solid var(--hair); padding-bottom: 8px;">Projektübersicht</h3>
      <table class="planer-summary-table">
        <tr>
          <td class="label">Gewerk</td>
          <td class="value">${this.content.services[this.currentTrade].title}</td>
        </tr>
    `;

    // Specific configurations to render in the table
    if (this.currentTrade === 'badsanierung') {
      const qm = this.answers['badgroesse'];
      const segment = this.answers['segment'] === 'standard_bad' ? 'Standard' : (this.answers['segment'] === 'komfort_bad' ? 'Komfort' : 'Premium');
      html += `
        <tr><td class="label">Größe</td><td class="value">${qm} m²</td></tr>
        <tr><td class="label">Qualitätsstufe</td><td class="value">${segment}</td></tr>
      `;
    } else if (this.currentTrade === 'waermepumpe') {
      const heat = this.answers['paket'] === 'lw_wp_bis_10kw' ? 'Bis 10 kW' : (this.answers['paket'] === 'lw_wp_10_16kw' ? '10–16 kW' : 'Über 16 kW');
      html += `<tr><td class="label">Leistungsklasse</td><td class="value">${heat}</td></tr>`;
    } else if (this.currentTrade === 'split_klima') {
      const r = this.answers['raeume_anzahl'] === 'single' ? '1 Raum (Single)' : (this.answers['raeume_anzahl'] === 'multi_2' ? '2 Räume (Multi)' : '3–4 Räume (Multi)');
      html += `<tr><td class="label">Klimatisierung</td><td class="value">${r}</td></tr>`;
    } else if (this.currentTrade === 'heizung') {
      const h = this.answers['paket'] === 'gas_solo' ? 'Gas Brennwert Solo' : (this.answers['paket'] === 'gas_hybrid_ready' ? 'Gas Hybrid-Ready' : 'Gas mit Solar');
      html += `<tr><td class="label">System</td><td class="value">${h}</td></tr>`;
    }

    if (budget.extraSummary.length > 0) {
      html += `<tr><td class="label">Gewählte Extras</td><td class="value">${budget.extraSummary.join(', ')}</td></tr>`;
    }

    html += `
      </table>

      <!-- Contact Info Section -->
      <h3 class="planer-step-title" style="font-size: 18px; margin-top: 32px; border-bottom: 1px solid var(--hair); padding-bottom: 8px;">${this.content.contact_info_title}</h3>
      <div class="planer-contact-grid">
        <div class="planer-contact-field">
          <label for="p-name">${this.content.contact_info_name} *</label>
          <input type="text" id="p-name" placeholder="Ihr Name" required>
        </div>
        <div class="planer-contact-field">
          <label for="p-email">${this.content.contact_info_email} *</label>
          <input type="email" id="p-email" placeholder="ihre.adresse@mail.de" required>
        </div>
        <div class="planer-contact-field">
          <label for="p-phone">${this.content.contact_info_phone} *</label>
          <input type="tel" id="p-phone" placeholder="z.B. 0176 123456" required>
        </div>
        <div class="planer-contact-field">
          <label for="p-address">${this.content.contact_info_address} *</label>
          <input type="text" id="p-address" placeholder="Ort / PLZ" required>
        </div>
      </div>

      <!-- Error Banner -->
      <div id="planer-submit-error" style="display:none;" class="planer-warning-banner"></div>

      <div class="planer-actions">
        <button class="btn btn-outline" id="planer-btn-back">${this.content.btn_back}</button>
        <button class="btn btn-primary" id="planer-btn-submit">${this.content.btn_submit}</button>
      </div>
    </div>
    `;

    this.container.innerHTML = html;

    const backBtn = document.getElementById('planer-btn-back');
    const submitBtn = document.getElementById('planer-btn-submit');

    backBtn.addEventListener('click', () => this.handleBack());
    submitBtn.addEventListener('click', () => this.handleSubmit());

    // Handle initial inputs tracking to enable/disable submit
    const inputs = ['p-name', 'p-email', 'p-phone', 'p-address'].map(id => document.getElementById(id));
    const validateSubmit = () => {
      const allFilled = inputs.every(el => el.value.trim() !== '');
      submitBtn.disabled = !allFilled;
      submitBtn.style.opacity = allFilled ? '1' : '0.5';
      submitBtn.style.pointerEvents = allFilled ? 'auto' : 'none';
    };

    inputs.forEach(el => el.addEventListener('input', validateSubmit));
    validateSubmit();
  }

  async handleSubmit() {
    const submitBtn = document.getElementById('planer-btn-submit');
    const errorContainer = document.getElementById('planer-submit-error');

    const name = document.getElementById('p-name').value.trim();
    const email = document.getElementById('p-email').value.trim();
    const phone = document.getElementById('p-phone').value.trim();
    const address = document.getElementById('p-address').value.trim();

    // Loading-State
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';
    errorContainer.style.display = 'none';

    const tradeTitle = this.content.services[this.currentTrade].title;
    const budget = this._internalBudget;
    const subsidy = this._internalSubsidy;
    const timestamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

    // Alle Fachfragen als formatierten Text
    const service = this.content.services[this.currentTrade];
    let answersText = '';
    service.questions.forEach(q => {
      let ans = this.answers[q.id];
      if (Array.isArray(ans)) ans = ans.join(', ');
      answersText += `${q.frage}: ${ans || 'Nicht beantwortet'}\n`;
    });

    // Wunschbudget des Nutzers (optional)
    const wunschMin = this.answers['wunschbudget_min'];
    const wunschMax = this.answers['wunschbudget_max'];
    let wunschbudgetText = 'Nicht angegeben';
    if (wunschMin || wunschMax) {
      if (wunschMin && wunschMax) {
        wunschbudgetText = `${Number(wunschMin).toLocaleString('de-DE')} € – ${Number(wunschMax).toLocaleString('de-DE')} €`;
      } else if (wunschMin) {
        wunschbudgetText = `Ab ${Number(wunschMin).toLocaleString('de-DE')} €`;
      } else {
        wunschbudgetText = `Bis ${Number(wunschMax).toLocaleString('de-DE')} €`;
      }
    }

    // Interne Kalkulation (nur für den Inhaber)
    let interneKalkulation = `${budget.min.toLocaleString('de-DE')} € – ${budget.max.toLocaleString('de-DE')} €`;
    if (budget.extraSummary.length > 0) {
      interneKalkulation += ` (inkl. ${budget.extraSummary.join(', ')})`;
    }

    let foerderInfo = 'Nicht anwendbar';
    if (subsidy) {
      foerderInfo = `ca. ${subsidy.percent}% Förderquote, Zuschuss ca. ${subsidy.amount.toLocaleString('de-DE')} €, Eigenanteil ca. ${Math.round(subsidy.net).toLocaleString('de-DE')} €`;
    }

    // Template-Parameter für EmailJS
    const templateParams = {
      customer_name:       name,
      customer_email:      email,
      customer_phone:      phone,
      customer_address:    address,
      trade_title:         tradeTitle,
      answers_text:        answersText,
      interne_kalkulation: interneKalkulation,
      foerder_info:        foerderInfo,
      wunschbudget:        wunschbudgetText,
      timestamp:           timestamp,
      reply_to:            email,
    };

    try {
      await emailjs.send(
        SHKPlaner.EMAILJS_CONFIG.serviceId,
        SHKPlaner.EMAILJS_CONFIG.templateId,
        templateParams
      );
      this.showConfirmationScreen();
    } catch (err) {
      console.error('EmailJS Fehler:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = this.content.btn_submit;
      errorContainer.textContent = 'Die Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.';
      errorContainer.style.display = 'block';
    }
  }

  showConfirmationScreen() {
    // Progress verstecken
    this.progressWrapper.style.display = 'none';

    this.container.innerHTML = `
      <div class="planer-step active planer-confirmation-card">
        <div class="planer-confirmation-icon">✓</div>
        <h2 class="planer-step-title">Anfrage erfolgreich übermittelt!</h2>
        <p class="planer-step-desc">
          Vielen Dank für Ihre Anfrage. Wir haben Ihre Angaben erhalten und melden
          uns in Kürze mit einem individuellen Angebot bei Ihnen.
        </p>
        <div class="planer-confirmation-details">
          <p>Bei dringenden Anliegen erreichen Sie uns unter:<br>
          <strong><a href="tel:+492151350 7935">02151 350 7935</a></strong> &nbsp;·&nbsp;
          Mo-Do 8-17 · Fr 8-14 Uhr</p>
        </div>
        <div class="planer-actions" style="justify-content: center; border-top: none; margin-top: 32px;">
          <a href="index.html" class="btn btn-outline">Zur Startseite</a>
          <button class="btn btn-primary" id="planer-btn-neue-anfrage">Neue Anfrage starten</button>
        </div>
      </div>
    `;

    document.getElementById('planer-btn-neue-anfrage').addEventListener('click', () => {
      this.showTradeSelection();
      this.progressWrapper.style.display = 'none';
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const planer = new SHKPlaner();
  planer.init();
});
