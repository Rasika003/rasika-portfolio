/* ============================================================
   RASIKA M — Portfolio JavaScript
   Admin editing, animations, persistence, and interactions
   ============================================================ */

(function () {
  'use strict';

  // ===== CONFIG =====
  const CONFIG = {
    defaultPassword: 'rasika2026',
    storageKey: 'rasika_portfolio_data',
    passwordKey: 'rasika_portfolio_pw',
    typingTexts: [
      'HR Professional',
      'People Analytics Enthusiast',
      'Talent Acquisition Specialist',
      'Data-Driven HR Strategist',
      'Employee Engagement Advocate'
    ],
    typingSpeed: 80,
    deletingSpeed: 40,
    pauseTime: 2000
  };

  // ===== STATE =====
  let isAdminMode = false;

  // ===== DOM REFS =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== INITIALIZATION =====
  document.addEventListener('DOMContentLoaded', () => {
    initTypingEffect();
    initScrollReveal();
    initNavigation();
    initCursorGlow();
    initAdminSystem();
    loadSavedData();
    setCurrentYear();
    initSmoothScrollLinks();
  });

  // ===== TYPING EFFECT =====
  function initTypingEffect() {
    const el = $('#typingText');
    if (!el) return;

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentText = CONFIG.typingTexts[textIndex];

      if (!isDeleting) {
        el.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentText.length) {
          isDeleting = true;
          setTimeout(type, CONFIG.pauseTime);
          return;
        }
        setTimeout(type, CONFIG.typingSpeed);
      } else {
        el.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % CONFIG.typingTexts.length;
          setTimeout(type, 400);
          return;
        }
        setTimeout(type, CONFIG.deletingSpeed);
      }
    }

    setTimeout(type, 1000);
  }

  // ===== SCROLL REVEAL =====
  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    $$('.reveal').forEach((el) => observer.observe(el));
  }

  // ===== NAVIGATION =====
  function initNavigation() {
    const nav = $('#nav');
    const mobileMenuBtn = $('#mobileMenuBtn');
    const navLinks = $('#navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      // Active link tracking
      const sections = $$('section[id]');
      let current = '';
      sections.forEach((section) => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) {
          current = section.getAttribute('id');
        }
      });
      $$('.nav-link').forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });

    // Mobile menu
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        mobileMenuBtn.classList.toggle('active');
      });

      // Close on link click
      $$('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          mobileMenuBtn.classList.remove('active');
        });
      });
    }
  }

  // ===== SMOOTH SCROLL =====
  function initSmoothScrollLinks() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = $(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ===== CURSOR GLOW =====
  function initCursorGlow() {
    const glow = $('#cursorGlow');
    if (!glow) return;

    document.addEventListener('mousemove', (e) => {
      requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      });
    });
  }

  // ===== CURRENT YEAR =====
  function setCurrentYear() {
    const el = $('#currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ===== ADMIN SYSTEM =====
  function initAdminSystem() {
    const adminToggle = $('#adminToggle');
    const passwordModal = $('#passwordModal');
    const passwordInput = $('#passwordInput');
    const passwordError = $('#passwordError');
    const modalCancel = $('#modalCancel');
    const modalSubmit = $('#modalSubmit');
    const togglePassword = $('#togglePassword');
    const saveBtn = $('#saveBtn');
    const exportBtn = $('#exportBtn');
    const lockBtn = $('#lockBtn');

    // Open modal
    adminToggle.addEventListener('click', () => {
      if (isAdminMode) {
        lockEditing();
      } else {
        passwordModal.classList.add('visible');
        passwordInput.focus();
      }
    });

    // Cancel modal
    modalCancel.addEventListener('click', () => {
      passwordModal.classList.remove('visible');
      passwordInput.value = '';
      passwordError.textContent = '';
    });

    // Submit password
    modalSubmit.addEventListener('click', () => attemptLogin());
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassword.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });

    // Close modal on overlay click
    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) {
        passwordModal.classList.remove('visible');
        passwordInput.value = '';
        passwordError.textContent = '';
      }
    });

    // Save button
    saveBtn.addEventListener('click', () => {
      saveData();
      showToast('All changes saved successfully!');
    });

    // Export button
    exportBtn.addEventListener('click', () => exportPortfolio());

    // Lock button
    lockBtn.addEventListener('click', () => lockEditing());
  }

  function attemptLogin() {
    const passwordInput = $('#passwordInput');
    const passwordError = $('#passwordError');
    const passwordModal = $('#passwordModal');

    const storedPassword = localStorage.getItem(CONFIG.passwordKey) || CONFIG.defaultPassword;
    const enteredPassword = passwordInput.value;

    if (enteredPassword === storedPassword) {
      passwordModal.classList.remove('visible');
      passwordInput.value = '';
      passwordError.textContent = '';
      enableAdminMode();
    } else {
      passwordError.textContent = 'Incorrect password. Please try again.';
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  function enableAdminMode() {
    isAdminMode = true;
    document.body.classList.add('admin-mode');
    $('#adminToolbar').classList.add('visible');

    // Make all data-editable elements contenteditable
    $$('[data-editable]').forEach((el) => {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'true');
    });

    // Show admin-only buttons
    $$('.admin-only').forEach((el) => {
      el.style.display = 'flex';
    });

    // Bind add/remove handlers
    bindAdminEventHandlers();

    showToast('Admin mode enabled — click any text to edit!');
  }

  function lockEditing() {
    isAdminMode = false;
    document.body.classList.remove('admin-mode');
    $('#adminToolbar').classList.remove('visible');

    // Remove contenteditable
    $$('[data-editable]').forEach((el) => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });

    // Hide admin-only buttons
    $$('.admin-only').forEach((el) => {
      el.style.display = 'none';
    });

    // Save on lock
    saveData();
    showToast('Editing locked. Changes saved.');
  }

  // ===== ADMIN EVENT HANDLERS =====
  function bindAdminEventHandlers() {
    // Add skill
    $$('.add-skill-btn').forEach((btn) => {
      btn.onclick = () => {
        const group = btn.getAttribute('data-group');
        const container = $(`[data-skill-group="${group}"]`);
        if (container) {
          const tag = document.createElement('span');
          tag.className = 'skill-tag';
          tag.setAttribute('data-editable', 'true');
          tag.setAttribute('contenteditable', 'true');
          tag.textContent = 'New Skill';

          const removeBtn = document.createElement('span');
          removeBtn.className = 'remove-skill';
          removeBtn.innerHTML = '<i class="fas fa-times"></i>';
          removeBtn.onclick = () => tag.remove();
          tag.appendChild(removeBtn);

          container.appendChild(tag);
        }
      };
    });

    // Add category
    const addCatBtn = $('#addCategoryBtn');
    if (addCatBtn) {
      addCatBtn.onclick = () => {
        const grid = $('#skillsGrid');
        const catCount = grid.querySelectorAll('.skill-category').length;
        const newCat = document.createElement('div');
        newCat.className = 'skill-category reveal revealed';
        newCat.setAttribute('data-category', catCount);
        newCat.innerHTML = `
          <div class="skill-cat-header">
            <div class="skill-cat-icon"><i class="fas fa-star"></i></div>
            <h3 class="skill-cat-title" data-editable="skillCat${catCount}Title" contenteditable="true">New Category</h3>
          </div>
          <div class="skill-tags" data-skill-group="${catCount}">
            <span class="skill-tag" data-editable="true" contenteditable="true">New Skill<span class="remove-skill"><i class="fas fa-times"></i></span></span>
          </div>
          <button class="add-skill-btn admin-only" data-group="${catCount}"><i class="fas fa-plus"></i> Add Skill</button>
        `;
        grid.appendChild(newCat);
        bindAdminEventHandlers();
      };
    }

    // Add project
    const addProjBtn = $('#addProjectBtn');
    if (addProjBtn) {
      addProjBtn.onclick = () => {
        const grid = $('#projectsGrid');
        const projCount = grid.querySelectorAll('.project-card').length;
        const num = String(projCount + 1).padStart(2, '0');
        const newProj = document.createElement('div');
        newProj.className = 'project-card reveal revealed';
        newProj.setAttribute('data-project', projCount);
        newProj.innerHTML = `
          <div class="project-number">${num}</div>
          <div class="project-header">
            <div class="project-icon"><i class="fas fa-project-diagram"></i></div>
            <h3 class="project-title" data-editable="proj${projCount}Title" contenteditable="true">New Project Title</h3>
          </div>
          <div class="project-problem">
            <span class="problem-label">Problem</span>
            <p data-editable="proj${projCount}Problem" contenteditable="true">Describe the problem here...</p>
          </div>
          <div class="project-solution">
            <span class="solution-label">Solution & Impact</span>
            <p data-editable="proj${projCount}Solution" contenteditable="true">Describe your solution and impact here...</p>
          </div>
          <div class="project-tools">
            <span class="tool-chip">Tool 1</span>
          </div>
          <button class="delete-project-btn admin-only" onclick="this.closest('.project-card').remove()"><i class="fas fa-trash"></i></button>
        `;
        grid.appendChild(newProj);
        bindDeleteHandlers();
      };
    }

    // Add education
    const addEduBtn = $('#addEduBtn');
    if (addEduBtn) {
      addEduBtn.onclick = () => {
        const timeline = $('#educationTimeline');
        const eduCount = timeline.querySelectorAll('.timeline-item').length;
        const newEdu = document.createElement('div');
        newEdu.className = 'timeline-item reveal revealed';
        newEdu.setAttribute('data-edu', eduCount);
        newEdu.innerHTML = `
          <div class="timeline-dot"><i class="fas fa-graduation-cap"></i></div>
          <div class="timeline-content">
            <div class="timeline-date" data-editable="edu${eduCount}Date" contenteditable="true">Year – Year</div>
            <h3 class="timeline-title" data-editable="edu${eduCount}Title" contenteditable="true">Degree / Program</h3>
            <p class="timeline-institution" data-editable="edu${eduCount}Inst" contenteditable="true">Institution Name</p>
            <p class="timeline-desc" data-editable="edu${eduCount}Desc" contenteditable="true">Description of your studies...</p>
            <button class="delete-edu-btn admin-only" onclick="this.closest('.timeline-item').remove()"><i class="fas fa-trash"></i></button>
          </div>
        `;
        timeline.appendChild(newEdu);
        bindDeleteHandlers();
      };
    }

    // Add certification
    const addCertBtn = $('#addCertBtn');
    if (addCertBtn) {
      addCertBtn.onclick = () => {
        const grid = $('#certsGrid');
        const certCount = grid.querySelectorAll('.cert-card').length;
        const newCert = document.createElement('div');
        newCert.className = 'cert-card reveal revealed';
        newCert.setAttribute('data-cert', certCount);
        newCert.innerHTML = `
          <div class="cert-badge"><i class="fas fa-certificate"></i></div>
          <h3 class="cert-name" data-editable="cert${certCount}Name" contenteditable="true">Certificate Name</h3>
          <p class="cert-issuer" data-editable="cert${certCount}Issuer" contenteditable="true">Issuing Organization</p>
          <button class="delete-cert-btn admin-only" onclick="this.closest('.cert-card').remove()"><i class="fas fa-trash"></i></button>
        `;
        grid.appendChild(newCert);
        bindDeleteHandlers();
      };
    }

    // Bind delete handlers
    bindDeleteHandlers();

    // Bind remove-skill handlers
    $$('.remove-skill').forEach((btn) => {
      btn.onclick = () => btn.closest('.skill-tag').remove();
    });
  }

  function bindDeleteHandlers() {
    $$('.delete-project-btn').forEach((btn) => {
      btn.onclick = () => {
        if (confirm('Delete this project?')) {
          btn.closest('.project-card').remove();
          renumberProjects();
        }
      };
    });

    $$('.delete-edu-btn').forEach((btn) => {
      btn.onclick = () => {
        if (confirm('Delete this education entry?')) {
          btn.closest('.timeline-item').remove();
        }
      };
    });

    $$('.delete-cert-btn').forEach((btn) => {
      btn.onclick = () => {
        if (confirm('Delete this certification?')) {
          btn.closest('.cert-card').remove();
        }
      };
    });
  }

  function renumberProjects() {
    $$('.project-card').forEach((card, i) => {
      const numEl = card.querySelector('.project-number');
      if (numEl) {
        numEl.textContent = String(i + 1).padStart(2, '0');
      }
    });
  }

  // ===== DATA PERSISTENCE =====
  function saveData() {
    const data = {};

    // Save all editable text content
    $$('[data-editable]').forEach((el) => {
      const key = el.getAttribute('data-editable');
      if (key && key !== 'true') {
        data[key] = el.innerHTML;
      }
    });

    // Save skills
    const skillCategories = [];
    $$('.skill-category').forEach((cat) => {
      const titleEl = cat.querySelector('.skill-cat-title');
      const iconEl = cat.querySelector('.skill-cat-icon i');
      const skills = [];
      cat.querySelectorAll('.skill-tag').forEach((tag) => {
        // Get text without the remove button
        const clone = tag.cloneNode(true);
        const removeBtn = clone.querySelector('.remove-skill');
        if (removeBtn) removeBtn.remove();
        skills.push(clone.textContent.trim());
      });
      skillCategories.push({
        title: titleEl ? titleEl.textContent : '',
        icon: iconEl ? iconEl.className : 'fas fa-star',
        skills
      });
    });
    data._skillCategories = skillCategories;

    // Save projects
    const projects = [];
    $$('.project-card').forEach((card) => {
      const titleEl = card.querySelector('.project-title');
      const problemEl = card.querySelector('.project-problem p');
      const solutionEl = card.querySelector('.project-solution p');
      const iconEl = card.querySelector('.project-icon i');
      const tools = [];
      card.querySelectorAll('.tool-chip').forEach((chip) => {
        tools.push(chip.textContent.trim());
      });
      projects.push({
        title: titleEl ? titleEl.textContent : '',
        problem: problemEl ? problemEl.textContent : '',
        solution: solutionEl ? solutionEl.textContent : '',
        icon: iconEl ? iconEl.className : 'fas fa-project-diagram',
        tools
      });
    });
    data._projects = projects;

    // Save education
    const education = [];
    $$('.timeline-item').forEach((item) => {
      const dateEl = item.querySelector('.timeline-date');
      const titleEl = item.querySelector('.timeline-title');
      const instEl = item.querySelector('.timeline-institution');
      const descEl = item.querySelector('.timeline-desc');
      const iconEl = item.querySelector('.timeline-dot i');
      education.push({
        date: dateEl ? dateEl.textContent : '',
        title: titleEl ? titleEl.textContent : '',
        institution: instEl ? instEl.textContent : '',
        description: descEl ? descEl.textContent : '',
        icon: iconEl ? iconEl.className : 'fas fa-graduation-cap'
      });
    });
    data._education = education;

    // Save certifications
    const certifications = [];
    $$('.cert-card').forEach((card) => {
      const nameEl = card.querySelector('.cert-name');
      const issuerEl = card.querySelector('.cert-issuer');
      certifications.push({
        name: nameEl ? nameEl.textContent : '',
        issuer: issuerEl ? issuerEl.textContent : ''
      });
    });
    data._certifications = certifications;

    localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
  }

  function loadSavedData() {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);

      // Restore text content
      Object.keys(data).forEach((key) => {
        if (key.startsWith('_')) return; // Skip structured data
        const el = $(`[data-editable="${key}"]`);
        if (el) {
          el.innerHTML = data[key];
        }
      });

      // Restore skill categories if present
      if (data._skillCategories && data._skillCategories.length > 0) {
        const grid = $('#skillsGrid');
        grid.innerHTML = '';
        data._skillCategories.forEach((cat, i) => {
          const catEl = document.createElement('div');
          catEl.className = 'skill-category reveal revealed';
          catEl.setAttribute('data-category', i);
          catEl.innerHTML = `
            <div class="skill-cat-header">
              <div class="skill-cat-icon"><i class="${cat.icon}"></i></div>
              <h3 class="skill-cat-title" data-editable="skillCat${i}Title">${cat.title}</h3>
            </div>
            <div class="skill-tags" data-skill-group="${i}">
              ${cat.skills.map(s => `<span class="skill-tag" data-editable="true">${s}<span class="remove-skill"><i class="fas fa-times"></i></span></span>`).join('')}
            </div>
            <button class="add-skill-btn admin-only" data-group="${i}" style="display:none;"><i class="fas fa-plus"></i> Add Skill</button>
          `;
          grid.appendChild(catEl);
        });
      }

      // Restore projects if present
      if (data._projects && data._projects.length > 0) {
        const grid = $('#projectsGrid');
        grid.innerHTML = '';
        data._projects.forEach((proj, i) => {
          const num = String(i + 1).padStart(2, '0');
          const card = document.createElement('div');
          card.className = 'project-card reveal revealed';
          card.setAttribute('data-project', i);
          card.innerHTML = `
            <div class="project-number">${num}</div>
            <div class="project-header">
              <div class="project-icon"><i class="${proj.icon}"></i></div>
              <h3 class="project-title" data-editable="proj${i}Title">${proj.title}</h3>
            </div>
            <div class="project-problem">
              <span class="problem-label">Problem</span>
              <p data-editable="proj${i}Problem">${proj.problem}</p>
            </div>
            <div class="project-solution">
              <span class="solution-label">Solution & Impact</span>
              <p data-editable="proj${i}Solution">${proj.solution}</p>
            </div>
            <div class="project-tools">
              ${proj.tools.map(t => `<span class="tool-chip">${t}</span>`).join('')}
            </div>
            <button class="delete-project-btn admin-only" style="display:none;"><i class="fas fa-trash"></i></button>
          `;
          grid.appendChild(card);
        });
      }

      // Restore education if present
      if (data._education && data._education.length > 0) {
        const timeline = $('#educationTimeline');
        timeline.innerHTML = '';
        data._education.forEach((edu, i) => {
          const item = document.createElement('div');
          item.className = 'timeline-item reveal revealed';
          item.setAttribute('data-edu', i);
          item.innerHTML = `
            <div class="timeline-dot"><i class="${edu.icon}"></i></div>
            <div class="timeline-content">
              <div class="timeline-date" data-editable="edu${i}Date">${edu.date}</div>
              <h3 class="timeline-title" data-editable="edu${i}Title">${edu.title}</h3>
              <p class="timeline-institution" data-editable="edu${i}Inst">${edu.institution}</p>
              <p class="timeline-desc" data-editable="edu${i}Desc">${edu.description}</p>
              <button class="delete-edu-btn admin-only" style="display:none;"><i class="fas fa-trash"></i></button>
            </div>
          `;
          timeline.appendChild(item);
        });
      }

      // Restore certifications if present
      if (data._certifications && data._certifications.length > 0) {
        const grid = $('#certsGrid');
        grid.innerHTML = '';
        data._certifications.forEach((cert, i) => {
          const card = document.createElement('div');
          card.className = 'cert-card reveal revealed';
          card.setAttribute('data-cert', i);
          card.innerHTML = `
            <div class="cert-badge"><i class="fas fa-certificate"></i></div>
            <h3 class="cert-name" data-editable="cert${i}Name">${cert.name}</h3>
            <p class="cert-issuer" data-editable="cert${i}Issuer">${cert.issuer}</p>
            <button class="delete-cert-btn admin-only" style="display:none;"><i class="fas fa-trash"></i></button>
          `;
          grid.appendChild(card);
        });
      }

    } catch (e) {
      console.warn('Failed to load saved data:', e);
    }
  }

  // ===== EXPORT =====
  function exportPortfolio() {
    // Save current data first
    saveData();

    // Clone the document
    const clone = document.documentElement.cloneNode(true);

    // Remove admin-only elements from export
    clone.querySelectorAll('.admin-only').forEach((el) => el.remove());
    clone.querySelectorAll('.admin-toolbar').forEach((el) => el.remove());
    clone.querySelectorAll('.modal-overlay').forEach((el) => el.remove());
    clone.querySelectorAll('.toast').forEach((el) => el.remove());
    clone.querySelectorAll('.admin-toggle').forEach((el) => el.remove());
    clone.querySelectorAll('.remove-skill').forEach((el) => el.remove());

    // Remove contenteditable
    clone.querySelectorAll('[contenteditable]').forEach((el) => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });

    // Remove admin-mode class
    const body = clone.querySelector('body');
    if (body) body.classList.remove('admin-mode');

    const html = `<!DOCTYPE html>\n<html lang="en">\n${clone.innerHTML}\n</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rasika-portfolio.html';
    a.click();
    URL.revokeObjectURL(url);

    showToast('Portfolio exported successfully!');
  }

  // ===== TOAST NOTIFICATION =====
  function showToast(message) {
    const toast = $('#toast');
    const toastMsg = $('#toastMessage');
    toastMsg.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
  }

})();
