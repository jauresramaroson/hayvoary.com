/* =========================
   HAYVOARY PRO - APP 1.0
   Frontend GitHub-ready (localStorage)
   + placeholders pour future API mails réels
========================= */

(() => {
  const STORAGE_KEYS = {
    USER: "hayvoary_user",
    PROFILE: "hayvoary_profile",
    EXPS: "hayvoary_experiences",
    MAILS: "hayvoary_mails",
    OTP: "hayvoary_otp_demo"
  };

  // ⚠️ Laisse vide pour mode local (GitHub Pages simulation)
  // Plus tard, mets ton endpoint serverless (ex: https://xxx.workers.dev/api/mails)
  const MAIL_API_URL = "";

  /* ---------- Helpers ---------- */
  const $ = (id) => document.getElementById(id);

  function safeText(str) {
    return (str ?? "").toString().trim();
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function show(elOrId) {
    const el = typeof elOrId === "string" ? $(elOrId) : elOrId;
    if (el) el.classList.remove("hidden");
  }

  function hide(elOrId) {
    const el = typeof elOrId === "string" ? $(elOrId) : elOrId;
    if (el) el.classList.add("hidden");
  }

  function formatMonthLabel(monthStr) {
    if (!monthStr) return "—";
    const [y, m] = monthStr.split("-");
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const mm = Number(m);
    if (!y || !mm || mm < 1 || mm > 12) return monthStr;
    return `${months[mm - 1]} ${y}`;
  }

  function isValidMalagasyPhone(phone) {
    // +261 suivi de 9 chiffres commençant souvent par 32,33,34,37,38
    // Ex: +261341234567
    return /^\+261(32|33|34|37|38)\d{7}$/.test(safeText(phone));
  }

  function normalizeLocalPart(localPart) {
    return safeText(localPart)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9._-]/g, "")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "");
  }

  function nowFR() {
    return new Date().toLocaleString("fr-FR");
  }

  function uuid() {
    return "m_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function storageGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function storageSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function defaultAvatarSVG(name = "HV") {
    const initials = safeText(name)
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() || "")
      .join("") || "HV";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#10b981"/>
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#g)"/>
        <text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="74" fill="white" font-weight="700">${initials}</text>
      </svg>
    `;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  /* ---------- Demo Mail Seed ---------- */
  function seedMailsIfEmpty() {
    const existing = storageGet(STORAGE_KEYS.MAILS, null);
    if (existing && Array.isArray(existing) && existing.length) return;

    const user = storageGet(STORAGE_KEYS.USER, {});
    const to = user?.professionalEmail || "vous@hayvoary.com";

    const mails = [
      {
        id: uuid(),
        folder: "inbox",
        from: "recrutement@hayvoary.com",
        to,
        subject: "Bienvenue sur HayVoary Pro",
        body: `Bonjour,\n\nVotre espace personnel est prêt.\nVous pouvez désormais consulter votre messagerie, gérer vos dossiers et enrichir votre profil.\n\n— Équipe HayVoary`,
        date: nowFR(),
        isRead: false
      },
      {
        id: uuid(),
        folder: "inbox",
        from: "partenariat@hayvoary.com",
        to,
        subject: "Proposition d’échange professionnel",
        body: `Bonjour,\n\nNous aimerions organiser un échange sur des opportunités de collaboration à Madagascar.\n\nCordialement,\nService Partenariat`,
        date: nowFR(),
        isRead: false
      },
      {
        id: uuid(),
        folder: "spam",
        from: "promo@very-suspicious.biz",
        to,
        subject: "Offre incroyable immédiate !!!",
        body: `Cliquez ici pour une offre suspecte.\n(Ceci est un exemple pour le dossier Spam)`,
        date: nowFR(),
        isRead: false
      }
    ];

    storageSet(STORAGE_KEYS.MAILS, mails);
  }

  /* ======================================================
     PAGE 1: index.html  (Inscription / Profil)
  ====================================================== */
  function initIndexPage() {
    const fullName = $("fullName");
    if (!fullName) return; // pas sur cette page

    let otpVerified = false;
    let avatarBase64 = null;
    let experiences = storageGet(STORAGE_KEYS.EXPS, []);

    const refs = {
      fullName: $("fullName"),
      jobTitle: $("jobTitle"),
      sector: $("sector"),
      city: $("city"),
      phone: $("phone"),
      emailLocal: $("emailLocal"),
      password: $("password"),
      bio: $("bio"),
      avatarInput: $("avatarInput"),
      avatarPreview: $("avatarPreview"),
      liveAvatar: $("liveAvatar"),
      emailPreview: $("emailPreview"),
      previewMail: $("previewMail"),
      liveEmail: $("liveEmail"),
      previewName: $("previewName"),
      liveName: $("liveName"),
      previewTitle: $("previewTitle"),
      liveJob: $("liveJob"),
      liveBio: $("liveBio"),
      liveTags: $("liveTags"),
      previewChips: $("previewChips"),
      phoneHelp: $("phoneHelp"),
      otpInput: $("otpInput"),
      otpStatus: $("otpStatus"),
      otpDemoMessage: $("otpDemoMessage"),
      experienceList: $("experienceList"),
      liveExpList: $("liveExpList"),
      formMessage: $("formMessage")
    };

    function currentProfessionalEmail() {
      const local = normalizeLocalPart(refs.emailLocal.value || "prenom.nom");
      return `${local || "prenom.nom"}@hayvoary.com`;
    }

    function updatePreview() {
      const name = safeText(refs.fullName.value) || "Votre nom";
      const job = safeText(refs.jobTitle.value) || "Votre titre professionnel";
      const sector = safeText(refs.sector.value);
      const city = safeText(refs.city.value);
      const bio = safeText(refs.bio.value) || "Votre bio apparaîtra ici.";
      const email = currentProfessionalEmail();

      const avatar = avatarBase64 || defaultAvatarSVG(name);

      refs.avatarPreview.src = avatar;
      refs.liveAvatar.src = avatar;

      refs.previewName.textContent = name;
      refs.liveName.textContent = name;
      refs.previewTitle.textContent = job;
      refs.liveJob.textContent = job;
      refs.liveBio.textContent = bio;

      refs.emailPreview.textContent = email;
      refs.previewMail.textContent = email;
      refs.liveEmail.textContent = email;

      const chips = [];
      if (sector) chips.push(sector);
      if (city) chips.push(city);
      chips.push("Professionnel");

      const chipsHTML = chips.map(c => `<span class="chip">${c}</span>`).join("");
      refs.previewChips.innerHTML = chipsHTML;
      refs.liveTags.innerHTML = chipsHTML;

      renderExperiences();
      validatePhoneLive();
    }

    function validatePhoneLive() {
      const phone = safeText(refs.phone.value);
      if (!phone) {
        refs.phoneHelp.textContent = "Format attendu: +26132/33/34/37/38xxxxxxx";
        refs.phoneHelp.className = "muted";
        return false;
      }
      const ok = isValidMalagasyPhone(phone);
      refs.phoneHelp.textContent = ok
        ? "Numéro malgache valide ✅"
        : "Numéro invalide. Exemple: +261341234567";
      refs.phoneHelp.className = ok ? "small" : "small";
      return ok;
    }

    function renderExperiences() {
      // liste formulaire
      if (experiences.length === 0) {
        refs.experienceList.innerHTML = `<p class="muted">Aucune expérience ajoutée.</p>`;
        refs.liveExpList.innerHTML = `<p class="muted">Aucune expérience ajoutée pour le moment.</p>`;
        return;
      }

      refs.experienceList.innerHTML = experiences.map((exp, index) => `
        <div class="exp-item">
          <div class="head">
            <div>
              <div class="title">${exp.role || "Poste"}</div>
              <div class="meta">${exp.organization || "Organisation"} • ${exp.location || "—"}</div>
            </div>
            <button class="btn danger btn-sm" type="button" data-exp-delete="${index}">Supprimer</button>
          </div>
          <div class="meta">${formatMonthLabel(exp.start)} → ${exp.end ? formatMonthLabel(exp.end) : "Présent"}</div>
          <p class="muted">${exp.description || ""}</p>
        </div>
      `).join("");

      refs.liveExpList.innerHTML = experiences.map(exp => `
        <div class="exp-item">
          <div class="title">${exp.role || "Poste"}</div>
          <div class="meta">${exp.organization || "Organisation"} • ${exp.location || "—"}</div>
          <div class="meta">${formatMonthLabel(exp.start)} → ${exp.end ? formatMonthLabel(exp.end) : "Présent"}</div>
          <p class="muted">${exp.description || ""}</p>
        </div>
      `).join("");

      refs.experienceList.querySelectorAll("[data-exp-delete]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-exp-delete"));
          experiences.splice(idx, 1);
          storageSet(STORAGE_KEYS.EXPS, experiences);
          renderExperiences();
        });
      });
    }

    function setOtpStatus(state, text) {
      refs.otpStatus.className = "status " + (state === "ok" ? "ok" : state === "error" ? "error" : "warn");
      refs.otpStatus.textContent = text;
    }

    function showFormMessage(type, text) {
      refs.formMessage.className = `alert ${type}`;
      refs.formMessage.textContent = text;
      show(refs.formMessage);
    }

    function hideFormMessage() {
      hide(refs.formMessage);
    }

    // Events
    [refs.fullName, refs.jobTitle, refs.sector, refs.city, refs.phone, refs.emailLocal, refs.bio].forEach(el => {
      el?.addEventListener("input", updatePreview);
    });

    refs.avatarInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        avatarBase64 = reader.result;
        updatePreview();
      };
      reader.readAsDataURL(file);
    });

    $("sendOtpBtn")?.addEventListener("click", () => {
      hideFormMessage();
      const phone = safeText(refs.phone.value);
      if (!isValidMalagasyPhone(phone)) {
        setOtpStatus("error", "Numéro invalide");
        refs.otpDemoMessage.textContent = "Corrige le numéro (format +261...) avant d’envoyer l’OTP.";
        return;
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      storageSet(STORAGE_KEYS.OTP, { phone, code, createdAt: Date.now() });
      otpVerified = false;
      setOtpStatus("warn", "OTP envoyé (démo)");
      refs.otpDemoMessage.textContent = `Démo GitHub: ton code OTP est ${code}`;
    });

    $("verifyOtpBtn")?.addEventListener("click", () => {
      hideFormMessage();
      const otpData = storageGet(STORAGE_KEYS.OTP, null);
      const codeInput = safeText(refs.otpInput.value);

      if (!otpData) {
        setOtpStatus("error", "OTP non envoyé");
        refs.otpDemoMessage.textContent = "Clique d’abord sur “Envoyer OTP”.";
        return;
      }

      if (codeInput === otpData.code) {
        otpVerified = true;
        setOtpStatus("ok", "Téléphone vérifié ✅");
        refs.otpDemoMessage.textContent = "Validation OTP réussie (mode démo).";
      } else {
        otpVerified = false;
        setOtpStatus("error", "Code OTP incorrect");
      }
    });

    $("addExpBtn")?.addEventListener("click", () => {
      const role = safeText($("expRole")?.value);
      const organization = safeText($("expOrg")?.value);
      const start = safeText($("expStart")?.value);
      const end = safeText($("expEnd")?.value);
      const location = safeText($("expPlace")?.value);
      const description = safeText($("expDesc")?.value);

      if (!role && !organization && !description) {
        showFormMessage("error", "Ajoute au moins un poste / organisation / description avant de valider.");
        return;
      }

      experiences.push({ role, organization, start, end, location, description });
      storageSet(STORAGE_KEYS.EXPS, experiences);

      ["expRole", "expOrg", "expStart", "expEnd", "expPlace", "expDesc"].forEach(id => {
        const el = $(id);
        if (el) el.value = "";
      });

      renderExperiences();
      showFormMessage("success", "Expérience ajoutée ✅");
      updatePreview();
    });

    $("clearFormBtn")?.addEventListener("click", () => {
      [
        "fullName", "jobTitle", "sector", "city", "phone", "emailLocal",
        "password", "bio", "otpInput", "expRole", "expOrg", "expStart",
        "expEnd", "expPlace", "expDesc"
      ].forEach(id => {
        const el = $(id);
        if (el) el.value = "";
      });

      avatarBase64 = null;
      otpVerified = false;
      experiences = [];
      localStorage.removeItem(STORAGE_KEYS.EXPS);
      localStorage.removeItem(STORAGE_KEYS.OTP);

      setOtpStatus("warn", "Non vérifié");
      refs.otpDemoMessage.textContent = "";
      hideFormMessage();
      updatePreview();
    });

    $("createAccountBtn")?.addEventListener("click", () => {
      hideFormMessage();

      const fullNameVal = safeText(refs.fullName.value);
      const jobTitleVal = safeText(refs.jobTitle.value);
      const phoneVal = safeText(refs.phone.value);
      const localPart = normalizeLocalPart(refs.emailLocal.value);
      const passwordVal = safeText(refs.password.value);

      if (!fullNameVal || !jobTitleVal || !phoneVal || !localPart || !passwordVal) {
        showFormMessage("error", "Veuillez remplir tous les champs obligatoires (*)");
        return;
      }
      if (!isValidMalagasyPhone(phoneVal)) {
        showFormMessage("error", "Numéro malgache invalide. Exemple: +261341234567");
        return;
      }
      if (passwordVal.length < 8) {
        showFormMessage("error", "Le mot de passe doit contenir au moins 8 caractères.");
        return;
      }
      if (!otpVerified) {
        showFormMessage("error", "Veuillez valider le numéro de téléphone via OTP (démo).");
        return;
      }

      const user = {
        id: "u_" + Date.now(),
        fullName: fullNameVal,
        phone: phoneVal,
        phoneVerified: true,
        emailLocalPart: localPart,
        professionalEmail: `${localPart}@hayvoary.com`,
        passwordDemo: passwordVal, // démo uniquement
        createdAt: new Date().toISOString()
      };

      const profile = {
        jobTitle: jobTitleVal,
        sector: safeText(refs.sector.value),
        city: safeText(refs.city.value),
        bio: safeText(refs.bio.value),
        avatarUrl: avatarBase64 || defaultAvatarSVG(fullNameVal)
      };

      storageSet(STORAGE_KEYS.USER, user);
      storageSet(STORAGE_KEYS.PROFILE, profile);
      storageSet(STORAGE_KEYS.EXPS, experiences);

      seedMailsIfEmpty();

      showFormMessage("success", "Compte créé ✅ Redirection vers votre espace personnel...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    });

    // Initial UI
    hideFormMessage();
    setOtpStatus("warn", "Non vérifié");
    updatePreview();
  }

  /* ======================================================
     PAGE 2: dashboard.html  (Messagerie + Profil)
  ====================================================== */
  function initDashboardPage() {
    const dashName = $("dashName");
    if (!dashName) return; // pas sur cette page

    const user = storageGet(STORAGE_KEYS.USER, null);
    const profile = storageGet(STORAGE_KEYS.PROFILE, null);
    const experiences = storageGet(STORAGE_KEYS.EXPS, []);

    if (!user || !profile) {
      alert("Aucun compte trouvé. Veuillez créer votre profil d’abord.");
      window.location.href = "index.html";
      return;
    }

    let mails = storageGet(STORAGE_KEYS.MAILS, []);
    seedMailsIfEmpty();
    mails = storageGet(STORAGE_KEYS.MAILS, []);
    let currentFolder = "inbox";
    let selectedMailId = null;

    function saveMails() {
      storageSet(STORAGE_KEYS.MAILS, mails);
    }

    function renderProfile() {
      setText("dashName", user.fullName || "-");
      setText("dashJob", profile.jobTitle || "-");
      setText("dashEmail", user.professionalEmail || "-");
      setText("dashPhone", user.phone || "-");
      setText("dashCity", profile.city || "-");
      setText("dashSector", profile.sector || "-");
      setText("dashOtp", user.phoneVerified ? "Vérifié ✅" : "Non vérifié");
      setText("dashBio", profile.bio || "-");

      const avatar = profile.avatarUrl || defaultAvatarSVG(user.fullName);
      const av = $("dashAvatar");
      if (av) av.src = avatar;

      const expList = $("dashExpList");
      if (!expList) return;

      if (!experiences.length) {
        expList.innerHTML = `<p class="muted">Aucune expérience enregistrée.</p>`;
        return;
      }

      expList.innerHTML = experiences.map(exp => `
        <div class="exp-item">
          <div class="title">${exp.role || "Poste"}</div>
          <div class="meta">${exp.organization || "Organisation"} • ${exp.location || "—"}</div>
          <div class="meta">${formatMonthLabel(exp.start)} → ${exp.end ? formatMonthLabel(exp.end) : "Présent"}</div>
          <p class="muted">${exp.description || ""}</p>
        </div>
      `).join("");
    }

    function countFolder(folder) {
      return mails.filter(m => m.folder === folder).length;
    }

    function renderFolderCounts() {
      setText("countInbox", countFolder("inbox"));
      setText("countSent", countFolder("sent"));
      setText("countDrafts", countFolder("drafts"));
      setText("countSpam", countFolder("spam"));
      setText("countTrash", countFolder("trash"));
    }

    function setActiveFolderBtn() {
      document.querySelectorAll(".folder-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.folder === currentFolder);
      });
    }

    function currentSearchQuery() {
      return safeText($("mailSearch")?.value).toLowerCase();
    }

    function filteredMails() {
      const q = currentSearchQuery();
      return mails
        .filter(m => m.folder === currentFolder)
        .filter(m => {
          if (!q) return true;
          return [m.from, m.to, m.subject, m.body].some(v =>
            safeText(v).toLowerCase().includes(q)
          );
        })
        .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
    }

    function renderMailList() {
      renderFolderCounts();
      setActiveFolderBtn();

      const list = $("mailList");
      if (!list) return;

      const data = filteredMails();

      if (!data.length) {
        list.innerHTML = `<div class="alert info">Aucun message dans ce dossier.</div>`;
        hide("mailReader");
        selectedMailId = null;
        return;
      }

      list.innerHTML = data.map(m => `
        <div class="mail-item ${m.isRead ? "" : "unread"}" data-mail-id="${m.id}">
          <div class="mail-item-top">
            <div class="from">${m.folder === "sent" ? "À: " + (m.to || "") : "De: " + (m.from || "")}</div>
            <div class="date">${m.date || ""}</div>
          </div>
          <div class="subject">${m.subject || "(Sans sujet)"}</div>
          <div class="snippet">${safeText(m.body).slice(0, 120)}${safeText(m.body).length > 120 ? "..." : ""}</div>
        </div>
      `).join("");

      list.querySelectorAll("[data-mail-id]").forEach(item => {
        item.addEventListener("click", () => {
          const id = item.getAttribute("data-mail-id");
          openMail(id);
        });
      });

      // Si un mail est sélectionné et toujours visible, le réafficher
      if (selectedMailId && data.some(m => m.id === selectedMailId)) {
        openMail(selectedMailId, false);
      } else {
        hide("mailReader");
        selectedMailId = null;
      }
    }

    function openMail(mailId, markRead = true) {
      const mail = mails.find(m => m.id === mailId);
      if (!mail) return;

      selectedMailId = mailId;
      if (markRead && !mail.isRead) {
        mail.isRead = true;
        saveMails();
      }

      setText("readSubject", mail.subject || "(Sans sujet)");
      setText("readMeta", `De: ${mail.from || "-"} | À: ${mail.to || "-"} | Date: ${mail.date || "-"}`);

      const bodyEl = $("readBody");
      if (bodyEl) bodyEl.textContent = mail.body || "";

      show("mailReader");
      renderMailList();
    }

    function moveSelectedMail(targetFolder) {
      if (!selectedMailId) return;
      const mail = mails.find(m => m.id === selectedMailId);
      if (!mail) return;
      mail.folder = targetFolder;
      saveMails();

      if (targetFolder !== currentFolder) {
        hide("mailReader");
        selectedMailId = null;
      }
      renderMailList();
    }

    // Compose modal
    function openComposeModal() {
      $("composeTo").value = "";
      $("composeSubject").value = "";
      $("composeBody").value = "";
      hide("composeMessage");
      show("composeModal");
    }

    function closeComposeModal() {
      hide("composeModal");
    }

    function showComposeMessage(type, text) {
      const el = $("composeMessage");
      el.className = `alert ${type}`;
      el.textContent = text;
      show(el);
    }

    function createMailObject({ to, subject, body, folder }) {
      return {
        id: uuid(),
        folder,
        from: user.professionalEmail,
        to,
        subject: subject || "(Sans sujet)",
        body: body || "",
        date: nowFR(),
        isRead: folder !== "sent",
        createdAt: new Date().toISOString()
      };
    }

    function sendMail() {
      const to = safeText($("composeTo").value);
      const subject = safeText($("composeSubject").value);
      const body = safeText($("composeBody").value);

      if (!to) {
        showComposeMessage("error", "Le champ destinataire est obligatoire.");
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) && !to.endsWith("@hayvoary.com")) {
        // tolérant, mais on encourage format mail
        showComposeMessage("error", "Adresse e-mail destinataire invalide.");
        return;
      }

      // Mode local : on ajoute dans Envoyés
      const sentMail = createMailObject({ to, subject, body, folder: "sent" });
      mails.unshift(sentMail);

      // Si on s'envoie à soi-même, on simule réception
      if (to.toLowerCase() === user.professionalEmail.toLowerCase()) {
        const inboxCopy = {
          ...sentMail,
          id: uuid(),
          folder: "inbox",
          from: user.professionalEmail,
          to: user.professionalEmail,
          isRead: false
        };
        mails.unshift(inboxCopy);
      }

      saveMails();
      renderMailList();
      showComposeMessage("success", "Message envoyé (mode simulation locale).");
      setTimeout(closeComposeModal, 500);
    }

    function saveDraft() {
      const to = safeText($("composeTo").value);
      const subject = safeText($("composeSubject").value);
      const body = safeText($("composeBody").value);

      const draft = createMailObject({ to, subject, body, folder: "drafts" });
      mails.unshift(draft);
      saveMails();
      renderMailList();
      showComposeMessage("success", "Brouillon enregistré ✅");
    }

    // Sync API placeholder
    async function syncMailsFromApi() {
      if (!MAIL_API_URL) {
        alert("Aucune API configurée. Le bouton Synchroniser est prêt pour plus tard.\n\nÉdite MAIL_API_URL dans app.js.");
        return;
      }

      try {
        const res = await fetch(MAIL_API_URL, {
          headers: {
            "Content-Type": "application/json"
            // plus tard: Authorization: "Bearer ..."
          }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Format attendu: [{id, folder, from, to, subject, body, date, isRead}]
        if (!Array.isArray(data)) throw new Error("Réponse API invalide (array attendu).");

        const mapped = data.map(m => ({
          id: m.id || uuid(),
          folder: m.folder || "inbox",
          from: m.from || "",
          to: m.to || user.professionalEmail,
          subject: m.subject || "(Sans sujet)",
          body: m.body || "",
          date: m.date || nowFR(),
          isRead: !!m.isRead,
          createdAt: m.createdAt || new Date().toISOString()
        }));

        // Remplace seulement les dossiers gérés par API (ex: inbox/spam), garde sent/drafts/trash locaux si tu veux
        // Ici on remplace tout pour simplifier :
        mails = mapped;
        saveMails();
        renderMailList();
        alert("Synchronisation API réussie ✅");
      } catch (err) {
        console.error(err);
        alert("Échec de synchronisation API: " + err.message);
      }
    }

    // Events
    document.querySelectorAll(".folder-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentFolder = btn.dataset.folder;
        renderMailList();
      });
    });

    $("mailSearch")?.addEventListener("input", renderMailList);
    $("resetSearchBtn")?.addEventListener("click", () => {
      $("mailSearch").value = "";
      renderMailList();
    });

    $("markSpamBtn")?.addEventListener("click", () => moveSelectedMail("spam"));
    $("markInboxBtn")?.addEventListener("click", () => moveSelectedMail("inbox"));
    $("restoreBtn")?.addEventListener("click", () => moveSelectedMail("inbox"));
    $("deleteMailBtn")?.addEventListener("click", () => moveSelectedMail("trash"));

    $("composeBtn")?.addEventListener("click", openComposeModal);
    $("closeComposeBtn")?.addEventListener("click", closeComposeModal);
    $("sendMailBtn")?.addEventListener("click", sendMail);
    $("saveDraftBtn")?.addEventListener("click", saveDraft);

    $("composeModal")?.addEventListener("click", (e) => {
      if (e.target.id === "composeModal") closeComposeModal();
    });

    $("syncMailsBtn")?.addEventListener("click", syncMailsFromApi);

    $("logoutBtn")?.addEventListener("click", () => {
      // Déconnexion légère (on garde les données)
      window.location.href = "index.html";
    });

    renderProfile();
    renderMailList();
  }

  // Init pages
  document.addEventListener("DOMContentLoaded", () => {
    initIndexPage();
    initDashboardPage();
  });
})();