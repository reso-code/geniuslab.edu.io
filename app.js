    // =========================================================================
    // 1. ENHANCED WEB AUDIO SOUND ENGINE (Realistic Multi-Effect Synthesizer)
    // =========================================================================
    let soundEnabled = true;
    let audioCtx = null;

    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }

    function toggleSound() {
      soundEnabled = !soundEnabled;
      const iconSpan = document.getElementById('soundIconSpan');
      const labelSpan = document.getElementById('soundLabelSpan');
      if (iconSpan) iconSpan.textContent = soundEnabled ? '🔊' : '🔇';
      if (labelSpan) labelSpan.textContent = soundEnabled ? 'الصوت مفعّل' : 'الصوت مكتوم';
      if (soundEnabled) {
        playTone('star');
      }
    }

    function playTone(type) {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const playNote = (freq, oscType, startTime, duration, peakGain = 0.14, endFreq = null) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = oscType;
          osc.frequency.setValueAtTime(freq, startTime);
          if (endFreq) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
          }
          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration + 0.02);
        };

        if (type === 'page') {
          // صوت تقليب صفحات الكتاب الورقية (Paper Whoosh)
          const bufferSize = Math.floor(ctx.sampleRate * 0.16);
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(900, now);
          filter.frequency.exponentialRampToValueAtTime(2600, now + 0.15);
          filter.Q.value = 1.4;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          whiteNoise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          whiteNoise.start(now);
        } else if (type === 'success') {
          // لحن النجاح والتفوق
          playNote(523.25, 'sine', now, 0.16, 0.15);
          playNote(659.25, 'sine', now + 0.09, 0.18, 0.15);
          playNote(783.99, 'sine', now + 0.18, 0.22, 0.16);
          playNote(1046.50, 'triangle', now + 0.27, 0.32, 0.14);
        } else if (type === 'win') {
          // لحن الفوز الكبير باللعبة أو الاختبار
          const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
          const times = [0, 0.11, 0.22, 0.34, 0.50, 0.62];
          notes.forEach((f, idx) => {
            playNote(f, idx % 2 === 0 ? 'triangle' : 'sine', now + times[idx], 0.24, 0.16);
          });
        } else if (type === 'star') {
          // رنين النجمة الذهبية المتلألئ
          playNote(880, 'sine', now, 0.14, 0.13);
          playNote(1318.5, 'sine', now + 0.07, 0.24, 0.13);
        } else if (type === 'catch') {
          // صوت التقاط عنصر صحيح في الألعاب
          playNote(660, 'sine', now, 0.10, 0.14, 990);
        } else if (type === 'hit') {
          // صوت اصطدام بعنصر خاطئ في الألعاب
          playNote(190, 'sawtooth', now, 0.18, 0.12, 110);
        } else if (type === 'drop') {
          // صوت إفلات البطاقة في مكانها
          playNote(360, 'triangle', now, 0.09, 0.13, 540);
        } else if (type === 'tick') {
          // دقة الساعة في الثواني الأخيرة
          playNote(920, 'sine', now, 0.045, 0.07);
        } else if (type === 'error') {
          // تنبيه لطيف للإجابة الخاطئة
          playNote(250, 'triangle', now, 0.16, 0.13, 210);
          playNote(195, 'triangle', now + 0.14, 0.22, 0.13, 165);
        } else {
          // نقرة زر ناعمة
          playNote(520, 'sine', now, 0.075, 0.09, 680);
        }
      } catch (e) {}
    }

    // =========================================================================
    // 2. CUSTOM MODAL DIALOGS
    // =========================================================================
    function showCustomModal({ icon = '🌟', title = '', body = '', onConfirm = null }) {
      document.getElementById('customModalIcon').textContent = icon;
      document.getElementById('customModalTitle').textContent = title;
      document.getElementById('customModalBody').textContent = body;
      const actionsEl = document.getElementById('customModalActions');
      actionsEl.innerHTML = '';

      if (onConfirm) {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-2xl transition';
        confirmBtn.textContent = 'نعم، متأكد';
        confirmBtn.onclick = () => {
          playTone('click');
          closeCustomModal();
          onConfirm();
        };
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-2xl transition';
        cancelBtn.textContent = 'إلغاء';
        cancelBtn.onclick = () => {
          playTone('click');
          closeCustomModal();
        };
        actionsEl.appendChild(confirmBtn);
        actionsEl.appendChild(cancelBtn);
      } else {
        const okBtn = document.createElement('button');
        okBtn.className = 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-2xl transition';
        okBtn.textContent = 'حسناً';
        okBtn.onclick = () => {
          playTone('click');
          closeCustomModal();
        };
        actionsEl.appendChild(okBtn);
      }

      document.getElementById('customModalBackdrop').classList.remove('hidden');
    }

    function closeCustomModal() {
      document.getElementById('customModalBackdrop').classList.add('hidden');
    }

    // =========================================================================
    // 3. EXACT TEXTBOOK STRUCTURE & TABLE OF CONTENTS (Pages 1 - 196)
    // =========================================================================
    const TEXTBOOK_UNITS = [
      {
        id: 1,
        title: 'الوحدة الأولى: تغذية الكائنات الحية',
        startPage: 28,
        endPage: 61,
        chapters: [1, 2],
        icon: '🌿',
        description: 'النبات يصنع غذاءه (البناء الضوئي)، الفطريات، طرائق وعلاقات التغذية عند الحيوانات والسلاسل الغذائية.'
      },
      {
        id: 2,
        title: 'الوحدة الثانية: موارد البيئة ومشكلاتها',
        startPage: 62,
        endPage: 93,
        chapters: [3, 4],
        icon: '🌍',
        description: 'موارد البيئة الطبيعية، الثروة النباتية والحيوانية، ترشيد الاستهلاك وإعادة التدوير، والمحافظة على التنوع الحيوي.'
      },
      {
        id: 3,
        title: 'الوحدة الثالثة: المادة',
        startPage: 94,
        endPage: 125,
        chapters: [5, 6],
        icon: '⚖️',
        description: 'قياس الطول بالمتر والسنتمتر، قياس الكتلة بالكيلوغرام والغرام، والمخاليط غير المتجانسة وطرائق فصلها.'
      },
      {
        id: 4,
        title: 'الوحدة الرابعة: الضوء والحرارة',
        startPage: 126,
        endPage: 163,
        chapters: [7, 8],
        icon: '☀️',
        description: 'انتقال الضوء وانعكاسه وانكساره وتحلله بالموشور، وانتقال الحرارة بالتوصيل وقياس درجة الحرارة بالمحرار.'
      },
      {
        id: 5,
        title: 'الوحدة الخامسة: المواد المكونة للأرض',
        startPage: 164,
        endPage: 195,
        chapters: [9, 10],
        icon: '🪨',
        description: 'الصخور النارية والرسوبية، أنواع التربة (الرملية والطينية والمزيجية)، وصفات المعادن واستعمالاتها.'
      }
    ];

    const TEXTBOOK_TOC = [
      { title: 'غلاف الكتاب وصفحة العنوان', page: 1, type: 'intro' },
      { title: 'المقدمة', page: 3, type: 'intro' },
      { title: 'المحتويات (الفهرس)', page: 5, type: 'intro' },
      { title: 'احتياطات السلامة', page: 7, type: 'intro' },
      { title: 'العلم ومهاراته (ألاحظ، أصنف، أقيس...)', page: 8, type: 'intro' },
      { title: 'الطريقة العلمية', page: 20, type: 'intro' },

      { title: 'الوحدة الأولى: تغذية الكائنات الحية', page: 28, type: 'unit' },
      { title: 'الفصل الأول: التغذية عند النباتات والفطريات', page: 29, type: 'chapter' },
      { title: 'الدرس الأول: النبات يصنع غذاءه', page: 30, type: 'lesson' },
      { title: 'الدرس الثاني: الفطريات', page: 36, type: 'lesson' },
      { title: 'قراءة علمية: صنع الغذاء في النباتات وتخزينه', page: 42, type: 'reading' },
      { title: 'مراجعة الفصل الأول', page: 44, type: 'review' },
      { title: 'الفصل الثاني: التغذية عند الحيوانات', page: 45, type: 'chapter' },
      { title: 'الدرس الأول: طرائق التغذية عند الحيوانات', page: 46, type: 'lesson' },
      { title: 'الدرس الثاني: علاقات التغذية عند الحيوانات', page: 52, type: 'lesson' },
      { title: 'قراءة علمية: المكافحة الحياتية', page: 60, type: 'reading' },
      { title: 'مراجعة الفصل الثاني', page: 61, type: 'review' },

      { title: 'الوحدة الثانية: موارد البيئة ومشكلاتها', page: 62, type: 'unit' },
      { title: 'الفصل الثالث: موارد البيئة وأهميتها للإنسان', page: 63, type: 'chapter' },
      { title: 'الدرس الأول: موارد البيئة الطبيعية', page: 64, type: 'lesson' },
      { title: 'الدرس الثاني: الثروة النباتية والحيوانية', page: 70, type: 'lesson' },
      { title: 'قراءة علمية: صناعة الأدوية من النباتات', page: 76, type: 'reading' },
      { title: 'مراجعة الفصل الثالث', page: 78, type: 'review' },
      { title: 'الفصل الرابع: المحافظة على موارد البيئة', page: 79, type: 'chapter' },
      { title: 'الدرس الأول: ترشيد الاستهلاك وإعادة الاستعمال', page: 80, type: 'lesson' },
      { title: 'الدرس الثاني: المحافظة على التنوع الحيوي', page: 86, type: 'lesson' },
      { title: 'كتابة علمية: تأثير المدن في موارد البيئة', page: 92, type: 'reading' },
      { title: 'مراجعة الفصل الرابع', page: 93, type: 'review' },

      { title: 'الوحدة الثالثة: المادة', page: 94, type: 'unit' },
      { title: 'الفصل الخامس: القياس', page: 95, type: 'chapter' },
      { title: 'الدرس الأول: قياس الطول', page: 96, type: 'lesson' },
      { title: 'الدرس الثاني: قياس الكتلة', page: 102, type: 'lesson' },
      { title: 'قراءة علمية: أنواع الموازين', page: 108, type: 'reading' },
      { title: 'مراجعة الفصل الخامس', page: 110, type: 'review' },
      { title: 'الفصل السادس: المخاليط غير المتجانسة', page: 111, type: 'chapter' },
      { title: 'الدرس الأول: مخلوط صلب مع صلب', page: 112, type: 'lesson' },
      { title: 'الدرس الثاني: مخلوط صلب مع سائل', page: 118, type: 'lesson' },
      { title: 'التركيز على المهارات: أعمل أنموذجاً', page: 124, type: 'reading' },
      { title: 'مراجعة الفصل السادس', page: 125, type: 'review' },

      { title: 'الوحدة الرابعة: الضوء والحرارة', page: 126, type: 'unit' },
      { title: 'الفصل السابع: الضوء', page: 127, type: 'chapter' },
      { title: 'الدرس الأول: انتقال الضوء', page: 128, type: 'lesson' },
      { title: 'الدرس الثاني: انعكاس الضوء', page: 134, type: 'lesson' },
      { title: 'الدرس الثالث: انكسار الضوء وتحلله', page: 140, type: 'lesson' },
      { title: 'قراءة علمية: تطبيقات المرايا', page: 146, type: 'reading' },
      { title: 'مراجعة الفصل السابع', page: 148, type: 'review' },
      { title: 'الفصل الثامن: الحرارة', page: 149, type: 'chapter' },
      { title: 'الدرس الأول: انتقال الحرارة بالتوصيل', page: 150, type: 'lesson' },
      { title: 'الدرس الثاني: قياس درجة الحرارة', page: 156, type: 'lesson' },
      { title: 'أعمل كالعلماء: كيف أقيس انتقال الحرارة؟', page: 162, type: 'reading' },
      { title: 'مراجعة الفصل الثامن', page: 163, type: 'review' },

      { title: 'الوحدة الخامسة: المواد المكونة للأرض', page: 164, type: 'unit' },
      { title: 'الفصل التاسع: الصخور والتربة', page: 165, type: 'chapter' },
      { title: 'الدرس الأول: الصخور', page: 166, type: 'lesson' },
      { title: 'الدرس الثاني: التربة', page: 172, type: 'lesson' },
      { title: 'أعمل كالعلماء: كيف أقيس نفاذية التربة للماء؟', page: 179, type: 'reading' },
      { title: 'مراجعة الفصل التاسع', page: 180, type: 'review' },
      { title: 'الفصل العاشر: المعادن', page: 181, type: 'chapter' },
      { title: 'الدرس الأول: صفات المعادن', page: 182, type: 'lesson' },
      { title: 'الدرس الثاني: استعمالات المعادن', page: 188, type: 'lesson' },
      { title: 'مهن مرتبطة بالعلوم: مهن مرتبطة بالمعادن', page: 194, type: 'reading' },
      { title: 'مراجعة الفصل العاشر ونهاية الكتاب', page: 195, type: 'review' },
    ];

    // =========================================================================
    // 4. PERSISTENT PROGRESS STATE (localStorage + Resume Support)
    // =========================================================================
    const STORAGE_KEY = 'iraq_science_grade3_platform_state_v3';

    const appState = {
      currentSection: 'home',
      currentPage: 1,
      totalPages: 196,
      zoomScale: 1.15,
      pdfDoc: null,
      rawPdfBuffer: null,
      isEmbeddedMode: false,
      isRendering: false,
      pendingPage: null,
      visitedPages: new Set([1]),
      completedActivities: new Set(),
      completedGames: new Set(),
      gameBestScores: { catcher: 0, memory: 0, speed: 0, recycle: 0 },
      answeredQuestions: {},
      chapterExams: {},
      triedExperiments: new Set(),
      stars: 0,
      notes: [],
      activeActivityIndex: 0,
      activeGameIndex: 0,
      activeQuestionFilter: 'all',
      activeExamChapterId: 1,
      activeExperimentIndex: 0
    };

    let selectedQuestionChoices = {};

    function saveStateToStorage() {
      try {
        const payload = {
          currentSection: appState.currentSection,
          currentPage: appState.currentPage,
          visitedPages: Array.from(appState.visitedPages),
          completedActivities: Array.from(appState.completedActivities),
          completedGames: Array.from(appState.completedGames),
          gameBestScores: appState.gameBestScores,
          answeredQuestions: appState.answeredQuestions,
          selectedQuestionChoices: selectedQuestionChoices,
          chapterExams: appState.chapterExams,
          triedExperiments: Array.from(appState.triedExperiments),
          stars: appState.stars,
          notes: appState.notes,
          activeExamChapterId: appState.activeExamChapterId,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        const badge = document.getElementById('saveStatusBadge');
        if (badge) {
          badge.innerHTML = '<span>💾</span><span>تم الحفظ</span>';
        }
      } catch (e) {}
    }

    function loadStateFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('iraq_science_grade3_platform_state_v2');
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data) return false;

        if (typeof data.currentPage === 'number' && data.currentPage >= 1 && data.currentPage <= 196) {
          appState.currentPage = data.currentPage;
        }
        if (Array.isArray(data.visitedPages) && data.visitedPages.length > 0) {
          appState.visitedPages = new Set(data.visitedPages);
        }
        if (Array.isArray(data.completedActivities)) {
          appState.completedActivities = new Set(data.completedActivities);
        }
        if (Array.isArray(data.completedGames)) {
          appState.completedGames = new Set(data.completedGames);
        }
        if (data.gameBestScores && typeof data.gameBestScores === 'object') {
          appState.gameBestScores = { ...appState.gameBestScores, ...data.gameBestScores };
        }
        if (data.answeredQuestions && typeof data.answeredQuestions === 'object') {
          appState.answeredQuestions = data.answeredQuestions;
        }
        if (data.selectedQuestionChoices && typeof data.selectedQuestionChoices === 'object') {
          selectedQuestionChoices = data.selectedQuestionChoices;
        }
        if (data.chapterExams && typeof data.chapterExams === 'object') {
          appState.chapterExams = data.chapterExams;
        }
        if (Array.isArray(data.triedExperiments)) {
          appState.triedExperiments = new Set(data.triedExperiments);
        }
        if (typeof data.stars === 'number') {
          appState.stars = data.stars;
        }
        if (Array.isArray(data.notes)) {
          appState.notes = data.notes;
        }
        if (typeof data.activeExamChapterId === 'number') {
          appState.activeExamChapterId = data.activeExamChapterId;
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    function updateResumeBanner() {
      const banner = document.getElementById('resumeProgressBanner');
      if (!banner) return;
      const completedExamsCount = Object.values(appState.chapterExams).filter(e => e && e.submitted).length;
      const hasProgress =
        appState.currentPage > 1 ||
        appState.visitedPages.size > 1 ||
        appState.completedActivities.size > 0 ||
        appState.completedGames.size > 0 ||
        Object.keys(appState.answeredQuestions).length > 0 ||
        completedExamsCount > 0 ||
        appState.notes.length > 0;

      if (!hasProgress) {
        banner.classList.add('hidden');
        return;
      }

      const lessonInfo = getLessonTitleForPage(appState.currentPage);
      document.getElementById('resumeLastLocationTitle').textContent =
        `آخر صفحة وصلت إليها في الكتاب: صفحة (${appState.currentPage}) — ${lessonInfo}`;
      document.getElementById('resumeStatsSummary').textContent =
        `تصفحت ${appState.visitedPages.size} صفحة • أكملت ${appState.completedActivities.size} أنشطة • ${appState.completedGames.size} ألعاب • ${completedExamsCount} اختبارات فصول`;
      document.getElementById('resumeBookBtn').textContent = `📖 أكمل القراءة من ص ${appState.currentPage}`;
      banner.classList.remove('hidden');
    }

    function awardStars(amount) {
      appState.stars += amount;
      playTone('star');
      saveStateToStorage();
      updateProgressUI();
    }

    function updateProgressUI() {
      document.getElementById('headerStarsCount').textContent = appState.stars;
      document.getElementById('progStars').textContent = appState.stars;
      document.getElementById('progPagesCount').textContent = `${appState.visitedPages.size} / 196`;
      document.getElementById('progActivitiesCount').textContent = `${appState.completedActivities.size} / ${INTERACTIVE_ACTIVITIES.length}`;

      const correctCount = Object.values(appState.answeredQuestions).filter(Boolean).length;
      document.getElementById('progQuestionsCount').textContent = `${correctCount} / ${TEXTBOOK_QUESTIONS.length}`;
      document.getElementById('quizScoreBadge').textContent = correctCount;
      document.getElementById('quizTotalBadge').textContent = TEXTBOOK_QUESTIONS.length;

      const completedExamsCount = Object.values(appState.chapterExams).filter(e => e && e.submitted).length;
      document.getElementById('progExamsCount').textContent = `${completedExamsCount} / ${CHAPTER_FINAL_EXAMS.length}`;
      document.getElementById('completedExamsCountBadge').textContent = completedExamsCount;

      updateResumeBanner();
      renderProgressExamsTable();
      renderBadges();
    }

    function confirmResetProgress() {
      showCustomModal({
        icon: '🔄',
        title: 'إعادة ضبط سجل التقدم',
        body: 'هل تريد تصفير النجوم والأنشطة والألعاب والاختبارات والبدء من جديد؟ (لن يتم حذف ملاحظاتك المكتوبة)',
        onConfirm: () => {
          appState.currentPage = 1;
          appState.visitedPages = new Set([1]);
          appState.completedActivities.clear();
          appState.completedGames.clear();
          appState.gameBestScores = { catcher: 0, memory: 0, speed: 0, recycle: 0 };
          appState.answeredQuestions = {};
          selectedQuestionChoices = {};
          appState.chapterExams = {};
          appState.triedExperiments.clear();
          appState.stars = 0;
          saveStateToStorage();
          updateProgressUI();
          selectActivity(appState.activeActivityIndex);
          renderQuestions();
          renderChapterExamsGrid();
          renderActiveChapterExam();
          showCustomModal({
            icon: '✅',
            title: 'تمت إعادة الضبط',
            body: 'تم تصفير سجل التقدم بنجاح. يمكنك البدء من جديد!'
          });
        }
      });
    }

    // =========================================================================
    // 5. NAVIGATION BETWEEN SECTIONS
    // =========================================================================
    function navigateTo(sectionName) {
      playTone('click');
      stopActiveGameLoops();
      appState.currentSection = sectionName;
      saveStateToStorage();

      const sections = ['home', 'reader', 'activities', 'games', 'questions', 'exams', 'practicals', 'notes', 'progress'];
      sections.forEach(sec => {
        const el = document.getElementById(`section-${sec}`);
        if (el) {
          if (sec === sectionName) el.classList.remove('hidden');
          else el.classList.add('hidden');
        }
      });

      document.querySelectorAll('.nav-tab').forEach(btn => {
        if (btn.dataset.nav === sectionName) btn.classList.add('nav-btn-active');
        else btn.classList.remove('nav-btn-active');
      });

      if (sectionName === 'reader' && appState.pdfDoc) {
        renderPdfPage(appState.currentPage);
      }
      if (sectionName === 'games') {
        selectGame(appState.activeGameIndex || 0);
      }
      if (sectionName === 'exams') {
        renderChapterExamsGrid();
        renderActiveChapterExam();
      }
      if (sectionName === 'notes') {
        renderStudentNotes();
      }
      if (sectionName === 'progress') {
        updateProgressUI();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openBookPage(pageNumber) {
      navigateTo('reader');
      goToPage(pageNumber);
    }

    // =========================================================================
    // 6. ORIGINAL TEXTBOOK PDF.JS VIEWER (196 Pages Unmodified + Direct Embed)
    // =========================================================================
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/lib/pdf.worker.min.js';
    }

    function savePdfToBrowserCache(arrayBuffer) {
      try {
        const req = indexedDB.open('ScienceGrade3DB', 1);
        req.onupgradeneeded = (e) => {
          e.target.result.createObjectStore('books');
        };
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('books', 'readwrite');
          tx.objectStore('books').put(arrayBuffer, 'textbook_pdf');
        };
      } catch (e) {}
    }

    function loadPdfFromBrowserCache() {
      return new Promise((resolve) => {
        try {
          const req = indexedDB.open('ScienceGrade3DB', 1);
          req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore('books');
          };
          req.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction('books', 'readonly');
            const getReq = tx.objectStore('books').get('textbook_pdf');
            getReq.onsuccess = () => resolve(getReq.result || null);
            getReq.onerror = () => resolve(null);
          };
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }

    function base64ToUint8Array(base64) {
      const binaryString = atob(base64.trim());
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    async function initPdfAutoLoad() {
      if (!window.pdfjsLib) return;
      const statusBadge = document.getElementById('bookSourceStatusBadge');

      const embeddedEl = document.getElementById('embedded-book-data');
      const embeddedBase64 = embeddedEl ? embeddedEl.textContent.trim() : '';
      if (embeddedBase64.length > 100) {
        try {
          document.getElementById('pdfUploadPrompt').classList.add('hidden');
          document.getElementById('pdfLoadingSpinner').classList.remove('hidden');
          const bytes = base64ToUint8Array(embeddedBase64);
          appState.rawPdfBuffer = bytes.buffer;
          appState.isEmbeddedMode = true;
          const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
          if (statusBadge) {
            statusBadge.textContent = '✅ الكتاب الأصلي مدمج ومفعّل تلقائياً';
            statusBadge.className = 'text-xs font-bold bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-xl';
          }
          onPdfLoaded(pdf);
          return;
        } catch (err) {}
      }

      const cachedBuffer = await loadPdfFromBrowserCache();
      if (cachedBuffer) {
        try {
          appState.rawPdfBuffer = cachedBuffer;
          const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(cachedBuffer.slice(0)) }).promise;
          if (statusBadge) {
            statusBadge.textContent = '✅ الكتاب محفوظ في المتصفح ومفتوح تلقائياً';
            statusBadge.className = 'text-xs font-bold bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-xl';
          }
          onPdfLoaded(pdf);
          return;
        } catch (err) {}
      }

      const candidateNames = ['./كتاب العلوم الثالث الابتدائي.pdf', './book.pdf'];
      for (const name of candidateNames) {
        try {
          const response = await fetch(encodeURI(name));
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            appState.rawPdfBuffer = buffer;
            savePdfToBrowserCache(buffer);
            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
            if (statusBadge) {
              statusBadge.textContent = '✅ محمّل تلقائياً من مجلد المنصة';
              statusBadge.className = 'text-xs font-bold bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-xl';
            }
            onPdfLoaded(pdf);
            return;
          }
        } catch (err) {}
      }

      document.getElementById('pdfUploadPrompt').classList.remove('hidden');
    }

    function handlePdfFileUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      loadPdfFromFileObject(file);
    }

    function handlePdfDrop(event) {
      event.preventDefault();
      document.getElementById('pdfCanvasWrapper').classList.remove('drag-over');
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        loadPdfFromFileObject(file);
      } else {
        showCustomModal({
          icon: '📄',
          title: 'يرجى اختيار ملف PDF',
          body: 'الرجاء اختيار ملف الكتاب المدرسي بصيغة PDF (كتاب العلوم الثالث الابتدائي.pdf).'
        });
      }
    }

    function loadPdfFromFileObject(file) {
      document.getElementById('pdfUploadPrompt').classList.add('hidden');
      document.getElementById('pdfLoadingSpinner').classList.remove('hidden');

      const reader = new FileReader();
      reader.onload = async function (e) {
        try {
          const arrayBuffer = e.target.result;
          appState.rawPdfBuffer = arrayBuffer;
          savePdfToBrowserCache(arrayBuffer);
          const typedArray = new Uint8Array(arrayBuffer.slice(0));
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          const statusBadge = document.getElementById('bookSourceStatusBadge');
          if (statusBadge) {
            statusBadge.textContent = '✅ تم تحميل الكتاب وحفظه تلقائياً';
            statusBadge.className = 'text-xs font-bold bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-xl';
          }
          onPdfLoaded(pdf);
          playTone('success');
        } catch (err) {
          document.getElementById('pdfLoadingSpinner').classList.add('hidden');
          document.getElementById('pdfUploadPrompt').classList.remove('hidden');
          showCustomModal({
            icon: '⚠️',
            title: 'تعذر فتح الملف',
            body: 'حدث خطأ أثناء قراءة ملف PDF. تأكد من أن الملف هو كتاب العلوم للصف الثالث الابتدائي.'
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function onPdfLoaded(pdf) {
      appState.pdfDoc = pdf;
      appState.totalPages = pdf.numPages || 196;
      document.getElementById('pageNumberInput').max = appState.totalPages;
      document.getElementById('pdfUploadPrompt').classList.add('hidden');
      document.getElementById('pdfLoadingSpinner').classList.add('hidden');
      document.getElementById('canvasContainer').classList.remove('hidden');

      if (!appState.isEmbeddedMode && appState.rawPdfBuffer) {
        document.getElementById('exportEmbeddedBtn').classList.remove('hidden');
      }

      renderPdfPage(appState.currentPage);
    }

    function exportStandaloneWithPdf() {
      if (!appState.rawPdfBuffer) return;

      showCustomModal({
        icon: '⏳',
        title: 'جاري دمج الكتاب داخل المنصة...',
        body: 'يرجى الانتظار بضع ثوانٍ ليتم بناء ملف HTML واحد يحتوي على المنصة وصفحات الكتاب الـ ١٩٦ معاً.'
      });

      const blob = new Blob([appState.rawPdfBuffer], { type: 'application/pdf' });
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result;
        const base64Data = dataUrl.split(',')[1];

        const docClone = document.documentElement.cloneNode(true);
        const embedScript = docClone.querySelector('#embedded-book-data');
        if (embedScript) embedScript.textContent = base64Data;

        const modalEl = docClone.querySelector('#customModalBackdrop');
        if (modalEl) modalEl.classList.add('hidden');

        const promptEl = docClone.querySelector('#pdfUploadPrompt');
        if (promptEl) promptEl.classList.add('hidden');

        const exportBtn = docClone.querySelector('#exportEmbeddedBtn');
        if (exportBtn) exportBtn.classList.add('hidden');

        const finalHtml = '<!DOCTYPE html>\n' + docClone.outerHTML;
        const htmlBlob = new Blob([finalHtml], { type: 'text/html;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(htmlBlob);

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'منصة_العلوم_التفاعلية_مدمجة_بالكتاب.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

        playTone('win');
        showCustomModal({
          icon: '🎉',
          title: 'تم إنشاء النسخة النهائية المدمجة بالكتاب!',
          body: 'تم تنزيل ملف (منصة_العلوم_التفاعلية_مدمجة_بالكتاب.html). عند فتح هذا الملف في أي جهاز، سيفتح الكتاب الأصلي مباشرة دون أي طلب لرفع الملف!'
        });
      };
      reader.readAsDataURL(blob);
    }

    async function renderPdfPage(num) {
      if (!appState.pdfDoc) return;
      if (appState.isRendering) {
        appState.pendingPage = num;
        return;
      }
      appState.isRendering = true;
      document.getElementById('pdfLoadingSpinner').classList.remove('hidden');

      try {
        const page = await appState.pdfDoc.getPage(num);
        const canvas = document.getElementById('pdfRenderCanvas');
        const ctx = canvas.getContext('2d');

        const wrapperWidth = Math.max(280, document.getElementById('pdfCanvasWrapper').clientWidth - 36);
        const unscaledViewport = page.getViewport({ scale: 1 });
        const fitScale = Math.min(1.5, wrapperWidth / unscaledViewport.width);
        const finalScale = fitScale * appState.zoomScale;

        const outputScale = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: finalScale });

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        await page.render({
          canvasContext: ctx,
          transform: transform,
          viewport: viewport
        }).promise;

        document.getElementById('pdfLoadingSpinner').classList.add('hidden');
        document.getElementById('canvasContainer').classList.remove('hidden');
      } catch (err) {
        document.getElementById('pdfLoadingSpinner').classList.add('hidden');
      } finally {
        appState.isRendering = false;
        if (appState.pendingPage !== null) {
          const next = appState.pendingPage;
          appState.pendingPage = null;
          renderPdfPage(next);
        }
      }
    }

    function getLessonTitleForPage(page) {
      let matched = TEXTBOOK_TOC[0];
      for (const item of TEXTBOOK_TOC) {
        if (item.page <= page) matched = item;
        else break;
      }
      return matched.title;
    }

    function goToPage(pageNum) {
      const clamped = Math.max(1, Math.min(appState.totalPages, parseInt(pageNum, 10) || 1));
      appState.currentPage = clamped;

      if (!appState.visitedPages.has(clamped)) {
        appState.visitedPages.add(clamped);
        if (appState.visitedPages.size % 3 === 0) {
          awardStars(1);
        }
      }

      saveStateToStorage();
      updateResumeBanner();

      document.getElementById('pageNumberInput').value = clamped;
      document.getElementById('pendingPageLabel').textContent = clamped;
      document.getElementById('prevPageBtn').disabled = clamped <= 1;
      document.getElementById('nextPageBtn').disabled = clamped >= appState.totalPages;

      document.getElementById('currentLessonBreadcrumb').textContent = `${getLessonTitleForPage(clamped)} — (صفحة ${clamped} من ١٩٦)`;
      highlightActiveTocItem(clamped);

      if (appState.pdfDoc) {
        renderPdfPage(clamped);
      }
    }

    function changePage(delta) {
      playTone('page');
      goToPage(appState.currentPage + delta);
    }

    function handlePageInputSubmit(e) {
      e.preventDefault();
      playTone('page');
      goToPage(document.getElementById('pageNumberInput').value);
    }

    function changeZoom(delta) {
      playTone('click');
      appState.zoomScale = Math.max(0.6, Math.min(2.4, +(appState.zoomScale + delta).toFixed(2)));
      document.getElementById('zoomLevelLabel').textContent = `${Math.round(appState.zoomScale * 100)}%`;
      if (appState.pdfDoc) renderPdfPage(appState.currentPage);
    }

    function resetZoom() {
      playTone('click');
      appState.zoomScale = 1.0;
      document.getElementById('zoomLevelLabel').textContent = '100%';
      if (appState.pdfDoc) renderPdfPage(appState.currentPage);
    }

    function toggleTocDrawer() {
      playTone('click');
      document.getElementById('tocSidebar').classList.toggle('hidden');
    }

    function renderTocList() {
      const container = document.getElementById('tocListContainer');
      container.innerHTML = TEXTBOOK_TOC.map(item => {
        let styleClass = 'pr-3 text-slate-700 hover:bg-emerald-50';
        if (item.type === 'unit') {
          styleClass = 'bg-emerald-600 text-white font-extrabold mt-2';
        } else if (item.type === 'chapter') {
          styleClass = 'bg-sky-50 text-sky-900 font-bold border-r-4 border-sky-500';
        } else if (item.type === 'reading' || item.type === 'review') {
          styleClass = 'pr-5 text-teal-800 bg-teal-50/50 hover:bg-teal-100/70 font-medium';
        } else if (item.type === 'lesson') {
          styleClass = 'pr-5 text-slate-800 hover:bg-emerald-50 font-semibold';
        }
        return `
          <button onclick="playTone('page'); goToPage(${item.page});" data-toc-page="${item.page}" class="toc-item w-full text-right px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition ${styleClass}">
            <span class="leading-snug">${item.title}</span>
            <span class="text-xs font-extrabold px-2 py-0.5 rounded-lg ${item.type === 'unit' ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'} shrink-0">ص ${item.page}</span>
          </button>
        `;
      }).join('');
    }

    function highlightActiveTocItem(page) {
      let activePage = 1;
      for (const item of TEXTBOOK_TOC) {
        if (item.page <= page) activePage = item.page;
      }
      document.querySelectorAll('.toc-item').forEach(btn => {
        if (parseInt(btn.dataset.tocPage, 10) === activePage) {
          btn.classList.add('ring-2', 'ring-amber-400');
        } else {
          btn.classList.remove('ring-2', 'ring-amber-400');
        }
      });
    }

    // =========================================================================
    // 7. HOME UNITS GRID RENDERING
    // =========================================================================
    function renderHomeUnits() {
      const grid = document.getElementById('homeUnitsGrid');
      grid.innerHTML = TEXTBOOK_UNITS.map(u => `
        <div class="card-hover rounded-3xl border-2 border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40 p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-3xl">${u.icon}</span>
              <span class="text-xs font-extrabold bg-sky-100 text-sky-800 px-3 py-1 rounded-full">صفحة ${u.startPage} - ${u.endPage}</span>
            </div>
            <h3 class="font-extrabold text-lg text-slate-900">${u.title}</h3>
            <p class="text-sm text-slate-600 mt-2 leading-relaxed">${u.description}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-emerald-100 flex flex-wrap gap-2">
            <button onclick="openBookPage(${u.startPage})" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs sm:text-sm transition">
              📖 اقرأ في الكتاب
            </button>
            <button onclick="navigateTo('exams'); selectExamChapter(${u.chapters[0]});" class="bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold py-2 px-3 rounded-xl text-xs sm:text-sm transition">
              🎓 اختبار الفصل ${u.chapters[0]}
            </button>
          </div>
        </div>
      `).join('');
    }

    // =========================================================================
    // 8. INTERACTIVE LEARNING ACTIVITIES (With Retry Button)
    // =========================================================================
    const INTERACTIVE_ACTIVITIES = [
      {
        id: 'act_animals_sort',
        shortTitle: '١. تصنيف الحيوانات',
        title: 'تصنيف الحيوانات وفقاً لنوع غذائها (السحب والإفلات أو النقر)',
        bookPage: 49,
        unitLabel: 'الوحدة الأولى • الفصل الثاني • الدرس الأول (ص ٤٨ - ٥٠ و ص ٦١)',
        instruction: 'صنّف الكائنات الحية الآتية الواردة في الكتاب المدرسي إلى مجموعاتها الثلاث: (آكلات النباتات، آكلات اللحوم، مختلطة التغذية). اسحب البطاقة أو اضغط عليها ثم اختر المجموعة المناسبة.',
        type: 'sort',
        categories: [
          { id: 'herbivore', label: '🌱 آكلات النباتات (الأعشاب)' },
          { id: 'carnivore', label: '🥩 آكلات اللحوم' },
          { id: 'omnivore', label: '🍽️ مختلطة التغذية' }
        ],
        items: [
          { id: 'rabbit', name: 'الأرنب 🐇', target: 'herbivore' },
          { id: 'lion', name: 'الأسد 🦁', target: 'carnivore' },
          { id: 'bear', name: 'الدب 🐻', target: 'omnivore' },
          { id: 'horse', name: 'الحصان 🐎', target: 'herbivore' },
          { id: 'shark', name: 'سمك القرش 🦈', target: 'carnivore' },
          { id: 'chicken', name: 'الدجاجة 🐔', target: 'omnivore' },
          { id: 'gazelle', name: 'الغزال 🦌', target: 'herbivore' },
          { id: 'tiger', name: 'النمر 🐅', target: 'carnivore' },
          { id: 'human', name: 'الإنسان 🧑', target: 'omnivore' }
        ]
      },
      {
        id: 'act_plant_parts',
        shortTitle: '٢. أجزاء النبات والبناء الضوئي',
        title: 'مخطط تفاعلي: أجزاء النبات وعملية البناء الضوئي',
        bookPage: 34,
        unitLabel: 'الوحدة الأولى • الفصل الأول • الدرس الأول (ص ٣٢ و ص ٣٤)',
        instruction: 'أكمل المخطط العلمي لعملية البناء الضوئي في النبات باختيار الجزء أو الوظيفة الصحيحة لكل فراغ كما ورد في الصفحة (٣٢) والصفحة (٣٤) من الكتاب.',
        type: 'diagram_match',
        slots: [
          { id: 'roots', prompt: '١. تمتص الماء والمواد المغذية كالأملاح من التربة وتثبت النبات في الأرض:', answer: 'الجذور' },
          { id: 'stem', prompt: '٢. يقوم بنقل الماء والمواد المغذية كالأملاح إلى أجزاء النبات كافة:', answer: 'الساق' },
          { id: 'leaves', prompt: '٣. تصنع الغذاء للنبات بعملية البناء الضوئي بوجود ضوء الشمس والهواء والماء:', answer: 'الأوراق' },
          { id: 'stomata', prompt: '٤. فتحات صغيرة على سطح الورقة يدخل منها غاز ثنائي أوكسيد الكاربون ويخرج غاز الأوكسجين:', answer: 'الثغور' },
          { id: 'oxygen', prompt: '٥. الغاز الذي تحرره أوراق النباتات في أثناء عملية البناء الضوئي:', answer: 'غاز الأوكسجين' }
        ],
        options: ['الجذور', 'الساق', 'الأوراق', 'الثغور', 'غاز الأوكسجين']
      },
      {
        id: 'act_food_chain',
        shortTitle: '٣. السلسلة الغذائية',
        title: 'ترتيب السلسلة الغذائية في البيئة اليابسة والبيئة المائية',
        bookPage: 56,
        unitLabel: 'الوحدة الأولى • الفصل الثاني • الدرس الثاني (ص ٥٦ - ٥٧)',
        instruction: 'تبدأ السلاسل الغذائية كلها بكائنات منتجة (النباتات أو الطحالب). رتّب الكائنات الحية التالية بالتسلسل الصحيح لانتقال الغذاء:',
        type: 'order_dual',
        chains: [
          {
            id: 'land_chain',
            title: 'أولاً: أنموذج لسلسلة غذائية في البيئة اليابسة (صفحة ٥٦)',
            correctOrder: [
              '🌿 الأعشاب (تنتج الغذاء بمساعدة الشمس)',
              '🐭 الفأر (يأكل العشب)',
              '🐍 الأفعى (تأكل الفأر)',
              '🦅 النسر (يأكل الأفعى)'
            ]
          },
          {
            id: 'water_chain',
            title: 'ثانياً: أنموذج لسلسلة غذائية في البيئة المائية (صفحة ٥٧)',
            correctOrder: [
              '🟢 الطحالب (كائنات منتجة)',
              '🐟 الأسماك الصغيرة (تتغذى على الطحالب)',
              '🦈 الأسماك الكبيرة (تأكل الأسماك الصغيرة)',
              '🧑 الإنسان (يتغذى على الأسماك الكبيرة)'
            ]
          }
        ]
      },
      {
        id: 'act_mixtures',
        shortTitle: '٤. فصل المخاليط',
        title: 'مطابقة المخاليط غير المتجانسة مع طريقة فصل مكوناتها',
        bookPage: 125,
        unitLabel: 'الوحدة الثالثة • الفصل السادس • مراجعة الفصل (ص ١١٥ - ١٢٥)',
        instruction: 'اختر طريقة الفصل المناسبة لكل مخلوط غير متجانس مما يأتي استناداً إلى جدول مراجعة الفصل السادس (صفحة ١٢٥):',
        type: 'diagram_match',
        slots: [
          { id: 'm1', prompt: '١. برادة حديد + رمل (مواد حديدية مختلطة بالرمل):', answer: 'المغناطيس' },
          { id: 'm2', prompt: '٢. رمل + ماء (أو ماء معكر بالطين):', answer: 'الترشيح' },
          { id: 'm3', prompt: '٣. الحمص + الحصى (أو كرات زجاجية + رمل):', answer: 'الالتقاط باليد' },
          { id: 'm4', prompt: '٤. الرمل + الحصى الصغير (مواد صلبة صغيرة مختلفة الحجم):', answer: 'الغربال' },
          { id: 'm5', prompt: '٥. نشارة الخشب + الرمل (عند وضعها في وعاء فيه ماء):', answer: 'الطفو والترسيب' }
        ],
        options: ['المغناطيس', 'الترشيح', 'الالتقاط باليد', 'الغربال', 'الطفو والترسيب']
      },
      {
        id: 'act_spectrum',
        shortTitle: '٥. ألوان ضوء الشمس',
        title: 'ترتيب ألوان ضوء الشمس السبعة الناتجة عن الموشور الزجاجي',
        bookPage: 144,
        unitLabel: 'الوحدة الرابعة • الفصل السابع • الدرس الثالث (ص ١٤٣ - ١٤٤)',
        instruction: 'يحلل الموشور الزجاجي وقطرات الماء ضوء الشمس إلى ألوانه السبعة. رتّب الألوان السبعة على التوالي كما وردت في الصفحة (١٤٣) والصفحة (١٤٤):',
        type: 'order_single',
        correctOrder: [
          '🔴 الأحمر',
          '🟠 البرتقالي',
          '🟡 الأصفر',
          '🟢 الأخضر',
          '🔵 الأزرق',
          '🟣 النيلي',
          '🪻 البنفسجي'
        ]
      },
      {
        id: 'act_heat_conductors',
        shortTitle: '٦. الموصلات والعوازل للحرارة',
        title: 'تصنيف المواد الموصلة للحرارة والمواد العازلة للحرارة',
        bookPage: 154,
        unitLabel: 'الوحدة الرابعة • الفصل الثامن • الدرس الأول (ص ١٥٣ - ١٥٤ و ص ١٦٣)',
        instruction: 'صنّف المواد الآتية إلى (مواد موصلة للحرارة) تنتقل خلالها الطاقة الحرارية بسهولة، و(مواد عازلة للحرارة) لا تنتقل الحرارة خلالها بسهولة:',
        type: 'sort',
        categories: [
          { id: 'conductor', label: '🔥 مواد موصلة للحرارة' },
          { id: 'insulator', label: '🧤 مواد عازلة للحرارة' }
        ],
        items: [
          { id: 'aluminum', name: 'الألمنيوم (أواني الطهي) 🍲', target: 'conductor' },
          { id: 'wood', name: 'الخشب (مقابض الأواني) 🪵', target: 'insulator' },
          { id: 'iron', name: 'الحديد 🔩', target: 'conductor' },
          { id: 'wool', name: 'الصوف (السترة الشتوية) 🧶', target: 'insulator' },
          { id: 'copper', name: 'النحاس 🪙', target: 'conductor' },
          { id: 'plastic', name: 'البلاستيك 🥤', target: 'insulator' },
          { id: 'rubber', name: 'المطاط 🧤', target: 'insulator' }
        ]
      }
    ];

    let sortAssignments = {};
    let selectedSortItemId = null;
    let matchSelections = {};
    let currentOrderList = [];
    let currentDualOrders = { land_chain: [], water_chain: [] };

    function shuffleArray(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    function renderActivityTabs() {
      const tabsEl = document.getElementById('activitySelectorTabs');
      tabsEl.innerHTML = INTERACTIVE_ACTIVITIES.map((act, idx) => {
        const isDone = appState.completedActivities.has(act.id);
        const isActive = idx === appState.activeActivityIndex;
        return `
          <button onclick="selectActivity(${idx})" class="px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
            isActive ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-sky-50 text-slate-700'
          }">
            <span>${act.shortTitle}</span>
            ${isDone ? '<span>✅</span>' : ''}
          </button>
        `;
      }).join('');
    }

    function selectActivity(index) {
      appState.activeActivityIndex = index;
      const act = INTERACTIVE_ACTIVITIES[index];
      sortAssignments = {};
      selectedSortItemId = null;
      matchSelections = {};

      if (act.type === 'order_single') {
        currentOrderList = shuffleArray(act.correctOrder);
        if (currentOrderList.join('|') === act.correctOrder.join('|')) currentOrderList.reverse();
      } else if (act.type === 'order_dual') {
        act.chains.forEach(ch => {
          let shuffled = shuffleArray(ch.correctOrder);
          if (shuffled.join('|') === ch.correctOrder.join('|')) shuffled.reverse();
          currentDualOrders[ch.id] = shuffled;
        });
      }

      renderActivityTabs();
      renderActivity(index);
    }

    function retryCurrentActivity(index) {
      playTone('click');
      selectActivity(index);
    }

    function renderActivity(index) {
      const act = INTERACTIVE_ACTIVITIES[index];
      const container = document.getElementById('activeActivityContainer');
      let bodyHtml = '';

      if (act.type === 'sort') {
        const unassigned = act.items.filter(it => !sortAssignments[it.id]);
        bodyHtml = `
          <div class="space-y-5">
            <div class="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4">
              <div class="text-xs sm:text-sm font-bold text-slate-600 mb-3">
                البطاقات غير المصنفة (${unassigned.length}): <span class="text-sky-700">(اسحب البطاقة إلى مجموعتها أو اضغط عليها لتحديدها)</span>
              </div>
              <div class="flex flex-wrap gap-2.5 min-h-[52px]">
                ${unassigned.length === 0
                  ? '<span class="text-sm font-bold text-emerald-700">🎉 تم توزيع جميع البطاقات! اضغط على «تحقق من الإجابة» بالأسفل.</span>'
                  : unassigned.map(it => `
                    <button draggable="true"
                            ondragstart="handleSortDragStart(event, '${it.id}')"
                            onclick="handleSortItemClick('${it.id}')"
                            class="px-4 py-2.5 rounded-2xl font-bold text-sm sm:text-base shadow-2xs border-2 transition cursor-grab active:cursor-grabbing ${
                              selectedSortItemId === it.id
                                ? 'bg-amber-100 border-amber-500 text-amber-950 scale-105'
                                : 'bg-white border-emerald-200 text-slate-800 hover:border-emerald-400'
                            }">
                      ${it.name}
                    </button>
                  `).join('')
                }
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-${act.categories.length} gap-4">
              ${act.categories.map(cat => {
                const assignedHere = act.items.filter(it => sortAssignments[it.id] === cat.id);
                return `
                  <div ondragover="event.preventDefault(); this.classList.add('drag-over');"
                       ondragleave="this.classList.remove('drag-over');"
                       ondrop="handleSortDrop(event, '${cat.id}')"
                       onclick="handleSortBucketClick('${cat.id}')"
                       class="rounded-3xl border-2 border-emerald-200 bg-emerald-50/40 p-4 min-h-[180px] flex flex-col justify-between transition cursor-pointer">
                    <div>
                      <div class="font-extrabold text-base sm:text-lg text-slate-900 pb-2 mb-3 border-b border-emerald-200 flex items-center justify-between">
                        <span>${cat.label}</span>
                        <span class="text-xs bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">${assignedHere.length}</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        ${assignedHere.map(it => `
                          <span class="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-800 shadow-2xs">
                            <span>${it.name}</span>
                            <button type="button" onclick="event.stopPropagation(); removeSortAssignment('${it.id}')" class="text-rose-600 hover:text-rose-800 font-extrabold px-1" title="إزالة">✕</button>
                          </span>
                        `).join('')}
                      </div>
                    </div>
                    <div class="text-xs text-slate-500 mt-3 text-center">أفلت البطاقة هنا أو اضغط لوضع البطاقة المحددة</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else if (act.type === 'diagram_match') {
        bodyHtml = `
          <div class="space-y-4">
            ${act.slots.map(slot => `
              <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="font-bold text-slate-800 text-sm sm:text-base leading-relaxed">${slot.prompt}</div>
                <select onchange="matchSelections['${slot.id}'] = this.value; playTone('drop');" class="bg-white border-2 border-sky-300 rounded-xl px-4 py-2.5 font-bold text-sky-900 text-sm sm:text-base min-w-[200px] focus:outline-none focus:border-emerald-500">
                  <option value="">-- اختر الإجابة الصحيحة --</option>
                  ${act.options.map(opt => `
                    <option value="${opt}" ${matchSelections[slot.id] === opt ? 'selected' : ''}>${opt}</option>
                  `).join('')}
                </select>
              </div>
            `).join('')}
          </div>
        `;
      } else if (act.type === 'order_single') {
        bodyHtml = `
          <div class="space-y-2.5 max-w-2xl mx-auto">
            <div class="text-xs sm:text-sm font-bold text-sky-800 mb-2">استخدم أزرار الأسهم (▲ للأعلى / ▼ للأسفل) لترتيب الألوان بالترتيب الصحيح:</div>
            ${currentOrderList.map((item, idx) => `
              <div class="flex items-center justify-between gap-3 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">${idx + 1}</span>
                  <span class="font-extrabold text-base sm:text-lg text-slate-800">${item}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button onclick="moveSingleOrder(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-sky-50 disabled:opacity-30 font-extrabold text-sky-800">▲</button>
                  <button onclick="moveSingleOrder(${idx}, 1)" ${idx === currentOrderList.length - 1 ? 'disabled' : ''} class="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-sky-50 disabled:opacity-30 font-extrabold text-sky-800">▼</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else if (act.type === 'order_dual') {
        bodyHtml = `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            ${act.chains.map(ch => `
              <div class="bg-slate-50 border-2 border-emerald-100 rounded-3xl p-4 space-y-2.5">
                <h4 class="font-extrabold text-base text-emerald-900 pb-2 border-b border-emerald-200">${ch.title}</h4>
                ${currentDualOrders[ch.id].map((item, idx) => `
                  <div class="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5">
                    <div class="flex items-center gap-2.5">
                      <span class="w-7 h-7 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">${idx + 1}</span>
                      <span class="font-bold text-sm text-slate-800">${item}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button onclick="moveDualOrder('${ch.id}', ${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-100 disabled:opacity-30 font-bold text-sky-800">▲</button>
                      <button onclick="moveDualOrder('${ch.id}', ${idx}, 1)" ${idx === currentDualOrders[ch.id].length - 1 ? 'disabled' : ''} class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-100 disabled:opacity-30 font-bold text-sky-800">▼</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        `;
      }

      container.innerHTML = `
        <div class="space-y-5">
          <div class="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span class="inline-block text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full mb-2">${act.unitLabel}</span>
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">${act.title}</h3>
              <p class="text-slate-600 text-sm sm:text-base mt-1.5 leading-relaxed">${act.instruction}</p>
            </div>
            <button onclick="openBookPage(${act.bookPage})" class="shrink-0 flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 text-sky-800 font-bold px-4 py-2.5 rounded-2xl text-sm transition">
              <span>📖</span>
              <span>افتح ص ${act.bookPage} في الكتاب</span>
            </button>
          </div>

          ${bodyHtml}

          <div id="activityFeedbackBox" class="hidden rounded-2xl p-4 font-bold text-base"></div>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            <button onclick="checkCurrentActivity()" class="bg-gradient-to-l from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-extrabold px-6 py-3 rounded-2xl text-base shadow-md transition">
              ✅ تحقق من الإجابة
            </button>
            <button onclick="retryCurrentActivity(${index})" class="bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold px-5 py-3 rounded-2xl text-sm sm:text-base transition">
              🔄 إعادة المحاولة
            </button>
          </div>
        </div>
      `;
    }

    function handleSortDragStart(event, itemId) {
      event.dataTransfer.setData('text/plain', itemId);
      selectedSortItemId = itemId;
    }

    function handleSortDrop(event, categoryId) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');
      const itemId = event.dataTransfer.getData('text/plain') || selectedSortItemId;
      if (itemId) {
        sortAssignments[itemId] = categoryId;
        selectedSortItemId = null;
        playTone('drop');
        renderActivity(appState.activeActivityIndex);
      }
    }

    function handleSortItemClick(itemId) {
      selectedSortItemId = (selectedSortItemId === itemId) ? null : itemId;
      playTone('click');
      renderActivity(appState.activeActivityIndex);
    }

    function handleSortBucketClick(categoryId) {
      if (selectedSortItemId) {
        sortAssignments[selectedSortItemId] = categoryId;
        selectedSortItemId = null;
        playTone('drop');
        renderActivity(appState.activeActivityIndex);
      }
    }

    function removeSortAssignment(itemId) {
      delete sortAssignments[itemId];
      playTone('click');
      renderActivity(appState.activeActivityIndex);
    }

    function moveSingleOrder(idx, dir) {
      const target = idx + dir;
      if (target < 0 || target >= currentOrderList.length) return;
      [currentOrderList[idx], currentOrderList[target]] = [currentOrderList[target], currentOrderList[idx]];
      playTone('drop');
      renderActivity(appState.activeActivityIndex);
    }

    function moveDualOrder(chainId, idx, dir) {
      const list = currentDualOrders[chainId];
      const target = idx + dir;
      if (target < 0 || target >= list.length) return;
      [list[idx], list[target]] = [list[target], list[idx]];
      playTone('drop');
      renderActivity(appState.activeActivityIndex);
    }

    function checkCurrentActivity() {
      const act = INTERACTIVE_ACTIVITIES[appState.activeActivityIndex];
      const fb = document.getElementById('activityFeedbackBox');
      let isCorrect = false;
      let message = '';

      if (act.type === 'sort') {
        if (Object.keys(sortAssignments).length < act.items.length) {
          fb.className = 'rounded-2xl p-4 font-bold text-base bg-amber-50 border-2 border-amber-300 text-amber-900';
          fb.textContent = '⚠️ يرجى تصنيف جميع البطاقات في مجموعاتها أولاً قبل التحقق من الإجابة.';
          fb.classList.remove('hidden');
          playTone('error');
          return;
        }
        let wrongItems = act.items.filter(it => sortAssignments[it.id] !== it.target);
        if (wrongItems.length === 0) {
          isCorrect = true;
          message = '🌟 أحسنت! جميع إجاباتك صحيحة ومطابقة لما ورد في الكتاب المدرسي.';
        } else {
          message = `❌ لديك (${wrongItems.length}) بطاقة في غير مكانها الصحيح، مثل: «${wrongItems[0].name}». راجع صفحة (${act.bookPage}) وحاول مجدداً!`;
        }
      } else if (act.type === 'diagram_match') {
        const unanswered = act.slots.filter(s => !matchSelections[s.id]);
        if (unanswered.length > 0) {
          fb.className = 'rounded-2xl p-4 font-bold text-base bg-amber-50 border-2 border-amber-300 text-amber-900';
          fb.textContent = '⚠️ يرجى اختيار الإجابة لجميع الفقرات أولاً.';
          fb.classList.remove('hidden');
          playTone('error');
          return;
        }
        const wrong = act.slots.filter(s => matchSelections[s.id] !== s.answer);
        if (wrong.length === 0) {
          isCorrect = true;
          message = '🌟 ممتاز! أكملت المخطط العلمي بدقة تامة وفق الكتاب المدرسي.';
        } else {
          message = `❌ هناك (${wrong.length}) إجابة تحتاج إلى مراجعة. راجع صفحة (${act.bookPage}) في الكتاب.`;
        }
      } else if (act.type === 'order_single') {
        isCorrect = currentOrderList.every((val, i) => val === act.correctOrder[i]);
        message = isCorrect
          ? '🌟 رائع! رتبت ألوان ضوء الشمس السبعة بالتسلسل الصحيح: الأحمر، البرتقالي، الأصفر، الأخضر، الأزرق، النيلي، البنفسجي.'
          : '❌ الترتيب غير مطابق للكتاب. تذكر الترتيب في صفحة (١٤٣): الأحمر، البرتقالي، الأصفر، الأخضر، الأزرق، النيلي، البنفسجي.';
      } else if (act.type === 'order_dual') {
        const ok1 = currentDualOrders.land_chain.every((val, i) => val === act.chains[0].correctOrder[i]);
        const ok2 = currentDualOrders.water_chain.every((val, i) => val === act.chains[1].correctOrder[i]);
        isCorrect = ok1 && ok2;
        message = isCorrect
          ? '🌟 عمل رائع! السلسلتان الغذائيتان في البيئة اليابسة والبيئة المائية مرتبتان بدقة.'
          : `❌ تحقق من ترتيب الكائنات الحية: ${!ok1 ? 'السلسلة اليابسة (ص ٥٦)' : ''} ${!ok2 ? 'السلسلة المائية (ص ٥٧)' : ''}. تذكر أن السلسلة تبدأ دائماً بالكائنات المنتجة.`;
      }

      fb.classList.remove('hidden');
      if (isCorrect) {
        fb.className = 'rounded-2xl p-4 font-bold text-base bg-emerald-50 border-2 border-emerald-400 text-emerald-900';
        fb.textContent = message;
        playTone('win');
        if (!appState.completedActivities.has(act.id)) {
          appState.completedActivities.add(act.id);
          awardStars(5);
          renderActivityTabs();
        }
      } else {
        fb.className = 'rounded-2xl p-4 font-bold text-base bg-rose-50 border-2 border-rose-300 text-rose-900';
        fb.textContent = message;
        playTone('error');
      }
    }

    // =========================================================================
    // 8B. EDUCATIONAL GAMES HUB (4 COMPLETE CURRICULUM GAMES + SOUND FX)
    // =========================================================================
    let catcherAnimFrameId = null;
    let speedTimerIntervalId = null;

    function stopActiveGameLoops() {
      if (catcherAnimFrameId) {
        cancelAnimationFrame(catcherAnimFrameId);
        catcherAnimFrameId = null;
      }
      if (speedTimerIntervalId) {
        clearInterval(speedTimerIntervalId);
        speedTimerIntervalId = null;
      }
    }

    function selectGame(idx) {
      stopActiveGameLoops();
      playTone('click');
      appState.activeGameIndex = idx;
      document.querySelectorAll('.game-tab-btn').forEach((btn, i) => {
        if (i === idx) {
          btn.className = 'game-tab-btn bg-purple-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm transition';
        } else {
          btn.className = 'game-tab-btn bg-slate-100 hover:bg-purple-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition';
        }
      });

      const container = document.getElementById('activeGameContainer');
      if (!container) return;

      if (idx === 0) renderCatcherGame(container);
      else if (idx === 1) renderMemoryGame(container);
      else if (idx === 2) renderSpeedQuizGame(container);
      else renderRecyclingGame(container);
    }

    // -------------------------------------------------------------------------
    // GAME 1: صائد العلوم (Science Catcher Arcade Canvas Game)
    // -------------------------------------------------------------------------
    const CATCHER_MISSIONS = [
      {
        id: 'env',
        title: 'مهمة ١: موارد البيئة الطبيعية (ص ٦٦)',
        instruction: 'حرّك المختبر لالتقاط موارد البيئة الطبيعية المفيدة وتجنب الملوثات!',
        good: [
          { icon: '💧', label: 'ماء عذب' },
          { icon: '🌳', label: 'أشجار' },
          { icon: '☀️', label: 'شمس' },
          { icon: '🪨', label: 'صخور' },
          { icon: '🐟', label: 'أسماك' }
        ],
        bad: [
          { icon: '🛢️', label: 'نفايات سامة' },
          { icon: '💨', label: 'دخان ملوث' },
          { icon: '🗑️', label: 'قمامة' }
        ]
      },
      {
        id: 'heat',
        title: 'مهمة ٢: المواد الموصلة للحرارة (ص ١٥٣)',
        instruction: 'التقط المواد الموصلة للحرارة فقط وتجنب المواد العازلة!',
        good: [
          { icon: '🍲', label: 'ألمنيوم' },
          { icon: '🪙', label: 'نحاس' },
          { icon: '🔩', label: 'حديد' },
          { icon: '🥄', label: 'ملعقة معدن' }
        ],
        bad: [
          { icon: '🪵', label: 'خشب عازل' },
          { icon: '🧶', label: 'صوف عازل' },
          { icon: '🧤', label: 'مطاط' },
          { icon: '🥤', label: 'بلاستيك' }
        ]
      },
      {
        id: 'herb',
        title: 'مهمة ٣: الحيوانات آكلة النباتات (ص ٤٩)',
        instruction: 'التقط الحيوانات آكلة النباتات وتجنب الحيوانات المفترسة آكلة اللحوم!',
        good: [
          { icon: '🐇', label: 'أرنب' },
          { icon: '🦌', label: 'غزال' },
          { icon: '🐎', label: 'حصان' },
          { icon: '🐑', label: 'خروف' }
        ],
        bad: [
          { icon: '🦁', label: 'أسد' },
          { icon: '🐅', label: 'نمر' },
          { icon: '🦈', label: 'قرش' },
          { icon: '🦅', label: 'نسر' }
        ]
      }
    ];

    let catcherMissionIdx = 0;

    function renderCatcherGame(container) {
      const mission = CATCHER_MISSIONS[catcherMissionIdx];
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span class="inline-block text-xs font-extrabold bg-purple-100 text-purple-800 px-3 py-1 rounded-full mb-1">لعبة تفاعلية • تحكم باللمس أو الفأرة أو الأسهم</span>
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">🚀 صائد العلوم — ${mission.title}</h3>
              <p class="text-sm text-slate-600 mt-0.5">${mission.instruction}</p>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${CATCHER_MISSIONS.map((m, i) => `
                <button onclick="catcherMissionIdx=${i}; playTone('click'); renderCatcherGame(document.getElementById('activeGameContainer'));" class="px-3 py-1.5 rounded-xl text-xs font-bold border ${i === catcherMissionIdx ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'}">
                  ${m.title.split(':')[0]}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Legend -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
            <div class="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 font-bold text-emerald-900">
              ✅ التقط: ${mission.good.map(g => `${g.icon} ${g.label}`).join(' • ')}
            </div>
            <div class="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2.5 font-bold text-rose-900">
              ❌ تجنب: ${mission.bad.map(b => `${b.icon} ${b.label}`).join(' • ')}
            </div>
          </div>

          <!-- HUD -->
          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-sm font-extrabold">
            <div>النقاط: <span id="catcherScoreEl" class="text-amber-400 text-lg">0</span></div>
            <div>أعلى نتيجة: <span id="catcherBestEl" class="text-emerald-400">${appState.gameBestScores.catcher || 0}</span></div>
            <div>المحاولات: <span id="catcherLivesEl" class="text-rose-400 text-base">❤️❤️❤️</span></div>
          </div>

          <!-- Canvas Container -->
          <div id="catcherCanvasBox" class="relative rounded-3xl overflow-hidden border-2 border-sky-300 bg-gradient-to-b from-sky-900 via-sky-800 to-emerald-900 shadow-inner">
            <canvas id="catcherGameCanvas" height="340"></canvas>
            <div id="catcherOverlay" class="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
              <div class="text-5xl animate-bounce">🛸🔬</div>
              <h4 id="catcherOverlayTitle" class="text-2xl font-extrabold">مستعد لبدء مغامرة صائد العلوم؟</h4>
              <p id="catcherOverlayDesc" class="text-sm text-sky-100 max-w-md">اسحب المركبة يميناً ويساراً لالتقاط العناصر الصحيحة وجمع النجوم!</p>
              <button onclick="startCatcherLoop()" class="bg-gradient-to-l from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-extrabold px-8 py-3.5 rounded-2xl text-base shadow-lg transition">
                ▶️ ابدأ اللعب الآن
              </button>
            </div>
          </div>

          <!-- Mobile / Touch On-Screen Controls -->
          <div class="flex items-center justify-center gap-4 pt-1">
            <button type="button" onpointerdown="moveCatcherBy(-55)" class="flex-1 max-w-[180px] py-3 rounded-2xl bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-900 font-extrabold text-base border-2 border-sky-300 transition">
              ◀ تحرك يساراً
            </button>
            <button type="button" onpointerdown="moveCatcherBy(55)" class="flex-1 max-w-[180px] py-3 rounded-2xl bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-900 font-extrabold text-base border-2 border-sky-300 transition">
              تحرك يميناً ▶
            </button>
          </div>
        </div>
      `;
    }

    let catcherPlayerX = 200;
    let catcherWidth = 600;

    function moveCatcherBy(dx) {
      catcherPlayerX = Math.max(45, Math.min(catcherWidth - 45, catcherPlayerX + dx));
      playTone('click');
    }

    function startCatcherLoop() {
      stopActiveGameLoops();
      playTone('star');

      const canvas = document.getElementById('catcherGameCanvas');
      const box = document.getElementById('catcherCanvasBox');
      const overlay = document.getElementById('catcherOverlay');
      if (!canvas || !box) return;

      overlay.classList.add('hidden');
      catcherWidth = Math.max(300, box.clientWidth);
      const height = 340;
      canvas.width = catcherWidth;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const mission = CATCHER_MISSIONS[catcherMissionIdx];
      let score = 0;
      let lives = 3;
      let items = [];
      let particles = [];
      let spawnTimer = 0;
      catcherPlayerX = catcherWidth / 2;

      const updateHud = () => {
        const sEl = document.getElementById('catcherScoreEl');
        const lEl = document.getElementById('catcherLivesEl');
        const bEl = document.getElementById('catcherBestEl');
        if (sEl) sEl.textContent = score;
        if (lEl) lEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
        if (bEl) bEl.textContent = Math.max(score, appState.gameBestScores.catcher || 0);
      };
      updateHud();

      const setPointerX = (clientX) => {
        const rect = canvas.getBoundingClientRect();
        const relX = clientX - rect.left;
        catcherPlayerX = Math.max(45, Math.min(catcherWidth - 45, relX));
      };

      canvas.onmousemove = (e) => setPointerX(e.clientX);
      canvas.ontouchmove = (e) => {
        if (e.touches && e.touches[0]) setPointerX(e.touches[0].clientX);
      };
      canvas.ontouchstart = (e) => {
        if (e.touches && e.touches[0]) setPointerX(e.touches[0].clientX);
      };

      function spawnItem() {
        const isGood = Math.random() < 0.65;
        const pool = isGood ? mission.good : mission.bad;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        items.push({
          x: 45 + Math.random() * (catcherWidth - 90),
          y: -30,
          vy: 2.1 + Math.min(2.4, score * 0.04) + Math.random() * 0.9,
          isGood,
          icon: chosen.icon,
          label: chosen.label
        });
      }

      function addBurst(x, y, color) {
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI * 2 * i) / 10;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * (2 + Math.random() * 2.5),
            vy: Math.sin(angle) * (2 + Math.random() * 2.5),
            life: 24,
            color
          });
        }
      }

      function endGame() {
        stopActiveGameLoops();
        const earnedStars = Math.max(1, Math.floor(score / 20));
        if (score > (appState.gameBestScores.catcher || 0)) {
          appState.gameBestScores.catcher = score;
        }
        if (score >= 30) {
          appState.completedGames.add('catcher');
        }
        awardStars(earnedStars);
        playTone(score >= 30 ? 'win' : 'error');

        if (overlay) {
          document.getElementById('catcherOverlayTitle').textContent = score >= 40 ? '🏆 بطل صائد العلوم!' : 'انتهت الجولة!';
          document.getElementById('catcherOverlayDesc').textContent = `حققت (${score}) نقطة وحصلت على (+${earnedStars}) نجمة ذهبية!`;
          overlay.classList.remove('hidden');
        }
      }

      function frame() {
        if (!document.getElementById('catcherGameCanvas')) {
          stopActiveGameLoops();
          return;
        }

        ctx.clearRect(0, 0, catcherWidth, height);

        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        for (let i = 0; i < 18; i++) {
          ctx.beginPath();
          ctx.arc(((i * 97) % catcherWidth), ((i * 53) % (height - 50)), 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#065f46';
        ctx.fillRect(0, height - 18, catcherWidth, 18);

        spawnTimer++;
        if (spawnTimer >= 52) {
          spawnTimer = 0;
          spawnItem();
        }

        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          it.y += it.vy;

          ctx.fillStyle = it.isGood ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.28)';
          ctx.strokeStyle = it.isGood ? '#34d399' : '#fb7185';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(it.x - 36, it.y - 24, 72, 48, 14);
          ctx.fill();
          ctx.stroke();

          ctx.font = '24px Tajawal, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(it.icon, it.x, it.y + 3);

          ctx.font = 'bold 11px Tajawal, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(it.label, it.x, it.y + 19);

          const playerY = height - 42;
          if (Math.abs(it.x - catcherPlayerX) < 58 && Math.abs(it.y - playerY) < 30) {
            if (it.isGood) {
              score += 10;
              playTone('catch');
              addBurst(it.x, it.y, '#34d399');
            } else {
              lives -= 1;
              playTone('hit');
              addBurst(it.x, it.y, '#fb7185');
            }
            items.splice(i, 1);
            updateHud();
            if (lives <= 0) {
              endGame();
              return;
            }
            continue;
          }

          if (it.y > height + 30) {
            items.splice(i, 1);
          }
        }

        const py = height - 42;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(catcherPlayerX - 46, py - 14, 92, 28, 14);
        ctx.fill();
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = 'bold 13px Tajawal, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.fillText('🔬 مختبري', catcherPlayerX, py + 5);

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
          if (p.life <= 0) particles.splice(i, 1);
        }

        catcherAnimFrameId = requestAnimationFrame(frame);
      }

      catcherAnimFrameId = requestAnimationFrame(frame);
    }

    // -------------------------------------------------------------------------
    // GAME 2: ذاكرة العلماء الصغار (Science Memory Match Pairs)
    // -------------------------------------------------------------------------
    const MEMORY_PAIRS_POOL = [
      { pairId: 'p1', term: '🌱 البناء الضوئي', def: 'صنع غذاء النبات في الأوراق' },
      { pairId: 'p2', term: '🍃 الثغور', def: 'فتحات صغيرة على سطح الورقة' },
      { pairId: 'p3', term: '🧲 المغناطيس', def: 'يجذب برادة الحديد من الرمل' },
      { pairId: 'p4', term: '🌡️ المحرار', def: 'أداة قياس درجة الحرارة (°س)' },
      { pairId: 'p5', term: '🔺 الموشور الزجاجي', def: 'يحلل ضوء الشمس إلى ٧ ألوان' },
      { pairId: 'p6', term: '🪴 التربة المزيجية', def: 'أفضل تربة لنمو النباتات' },
      { pairId: 'p7', term: '💎 الماس', def: 'أكثر المعادن صلادةً' },
      { pairId: 'p8', term: '⚖️ الميزان ذو الكفتين', def: 'أداة قياس الكتلة بالكيلوغرام' }
    ];

    let memoryDeck = [];
    let memoryFlippedIndices = [];
    let memoryMatchedPairIds = new Set();
    let memoryMoves = 0;
    let memoryLocked = false;

    function initMemoryDeck() {
      const chosenPairs = shuffleArray(MEMORY_PAIRS_POOL).slice(0, 6);
      const cards = [];
      chosenPairs.forEach(p => {
        cards.push({ pairId: p.pairId, text: p.term, kind: 'term' });
        cards.push({ pairId: p.pairId, text: p.def, kind: 'def' });
      });
      memoryDeck = shuffleArray(cards);
      memoryFlippedIndices = [];
      memoryMatchedPairIds = new Set();
      memoryMoves = 0;
      memoryLocked = false;
    }

    function renderMemoryGame(container) {
      if (memoryDeck.length === 0) initMemoryDeck();
      const allMatched = memoryMatchedPairIds.size === 6;

      container.innerHTML = `
        <div class="space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span class="inline-block text-xs font-extrabold bg-sky-100 text-sky-800 px-3 py-1 rounded-full mb-1">تنمية الذاكرة والمفاهيم العلمية</span>
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">🃏 لعبة ذاكرة العلماء الصغار</h3>
              <p class="text-sm text-slate-600 mt-0.5">اقلب بطاقتين في كل مرة لتطابق المصطلح العلمي مع تعريفه الصحيح من الكتاب!</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold">
                المحاولات: ${memoryMoves} | الأزواج: ${memoryMatchedPairIds.size} / 6
              </span>
              <button onclick="initMemoryDeck(); playTone('click'); renderMemoryGame(document.getElementById('activeGameContainer'));" class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-2xl text-xs sm:text-sm transition">
                🔄 بطاقات جديدة
              </button>
            </div>
          </div>

          ${allMatched ? `
            <div class="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-5 text-center space-y-2 animate-pop">
              <div class="text-4xl">🎉🌟</div>
              <h4 class="text-xl font-extrabold text-emerald-950">رائع! طابقت جميع البطاقات العلمية بنجاح في (${memoryMoves}) محاولة!</h4>
              <p class="text-sm font-bold text-emerald-800">حصلت على +٤ نجوم ذهبية!</p>
            </div>
          ` : ''}

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            ${memoryDeck.map((card, idx) => {
              const isFlipped = memoryFlippedIndices.includes(idx) || memoryMatchedPairIds.has(card.pairId);
              const isMatched = memoryMatchedPairIds.has(card.pairId);
              return `
                <button type="button" onclick="flipMemoryCard(${idx})"
                  class="h-28 sm:h-32 rounded-3xl border-2 p-3 flex flex-col items-center justify-center text-center transition transform active:scale-95 ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                      : isFlipped
                        ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-md'
                        : 'bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400 text-white hover:from-purple-500 hover:to-indigo-600 shadow-sm'
                  }">
                  ${isFlipped ? `
                    <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 ${card.kind === 'term' ? 'bg-amber-200 text-amber-950' : 'bg-white text-sky-800'}">
                      ${card.kind === 'term' ? 'مصطلح' : 'تعريف'}
                    </span>
                    <span class="font-extrabold text-xs sm:text-sm leading-snug">${card.text}</span>
                  ` : `
                    <span class="text-3xl mb-1">🔬</span>
                    <span class="text-xs font-bold text-purple-100">اضغط للكشف</span>
                  `}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    function flipMemoryCard(idx) {
      if (memoryLocked) return;
      const card = memoryDeck[idx];
      if (!card || memoryMatchedPairIds.has(card.pairId) || memoryFlippedIndices.includes(idx)) return;

      playTone('page');
      memoryFlippedIndices.push(idx);
      const container = document.getElementById('activeGameContainer');
      renderMemoryGame(container);

      if (memoryFlippedIndices.length === 2) {
        memoryMoves++;
        memoryLocked = true;
        const [i1, i2] = memoryFlippedIndices;
        if (memoryDeck[i1].pairId === memoryDeck[i2].pairId) {
          memoryMatchedPairIds.add(memoryDeck[i1].pairId);
          memoryFlippedIndices = [];
          memoryLocked = false;
          if (memoryMatchedPairIds.size === 6) {
            appState.completedGames.add('memory');
            appState.gameBestScores.memory = Math.max(appState.gameBestScores.memory || 0, Math.max(10, 100 - memoryMoves * 4));
            awardStars(4);
            playTone('win');
          } else {
            playTone('catch');
          }
          renderMemoryGame(container);
        } else {
          playTone('error');
          setTimeout(() => {
            memoryFlippedIndices = [];
            memoryLocked = false;
            const c = document.getElementById('activeGameContainer');
            if (c && appState.activeGameIndex === 1) renderMemoryGame(c);
          }, 850);
        }
      }
    }

    // -------------------------------------------------------------------------
    // GAME 3: تحدي الـ ٦٠ ثانية: صح أم خطأ؟ (Rapid Science Speed Challenge)
    // -------------------------------------------------------------------------
    const SPEED_STATEMENTS = [
      { text: 'يصنع النبات غذاءه داخل الأوراق بعملية البناء الضوئي.', isTrue: true, page: 34 },
      { text: 'تستطيع الفطريات صنع غذائها بنفسها لأنها تمتلك أوراقاً خضراء.', isTrue: false, page: 38 },
      { text: 'تبدأ السلسلة الغذائية دائماً بكائنات منتجة كالنباتات والطحالب.', isTrue: true, page: 56 },
      { text: 'الأرنب والغزال من الحيوانات آكلة اللحوم.', isTrue: false, page: 49 },
      { text: 'المحمية الطبيعية توفر للحيوان المأوى والغذاء والتكاثر والحماية.', isTrue: true, page: 90 },
      { text: 'كل ١ كيلوغرام يساوي ١٠٠٠ غرام.', isTrue: true, page: 106 },
      { text: 'نستعمل المسطرة المدرجة لقياس كتلة كيس التفاح.', isTrue: false, page: 99 },
      { text: 'يجذب المغناطيس برادة الحديد ويفصلها عن الرمل.', isTrue: true, page: 115 },
      { text: 'يسير الضوء في الهواء بخطوط مستقيمة في جميع الاتجاهات.', isTrue: true, page: 130 },
      { text: 'الأجسام المعتمة تسمح بمرور الضوء من خلالها بوضوح.', isTrue: false, page: 132 },
      { text: 'يحلل الموشور الزجاجي ضوء الشمس إلى ٧ ألوان.', isTrue: true, page: 144 },
      { text: 'تنتقل الحرارة دائماً من الجسم الساخن إلى الجسم البارد.', isTrue: true, page: 152 },
      { text: 'يُعد الخشب والبلاستيك من المواد الموصلة الجيدة للحرارة.', isTrue: false, page: 154 },
      { text: 'وحدة قياس درجة الحرارة هي الدرجة السيليزية (°س).', isTrue: true, page: 159 },
      { text: 'التربة المزيجية هي أفضل أنواع الترب لنمو النباتات.', isTrue: true, page: 177 },
      { text: 'يُعد الماس أكثر المعادن صلادةً ويقطع الفولاذ والزجاج.', isTrue: true, page: 185 }
    ];

    let speedState = { active: false, timeLeft: 60, score: 0, streak: 0, idx: 0, list: [], lastFeedback: '' };

    function renderSpeedQuizGame(container) {
      if (!speedState.active && speedState.list.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 space-y-4 max-w-xl mx-auto">
            <div class="text-6xl animate-float">⚡⏱️</div>
            <h3 class="text-2xl font-extrabold text-slate-900">تحدي السرعة: صح أم خطأ؟ (٦٠ ثانية)</h3>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              اقرأ العبارة العلمية بسرعة وحدد هل هي <strong>صحيحة (✔️)</strong> أم <strong>خاطئة (❌)</strong> قبل انتهاء الوقت! كل إجابة متتالية تضاعف نقاطك.
            </p>
            <div class="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 inline-block px-4 py-2 rounded-2xl">
              أعلى نتيجة سابقة: ${appState.gameBestScores.speed || 0} نقطة
            </div>
            <div>
              <button onclick="startSpeedChallenge()" class="bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-base shadow-lg transition">
                🚀 ابدأ التحدي الآن
              </button>
            </div>
          </div>
        `;
        return;
      }

      if (!speedState.active && speedState.list.length > 0) {
        container.innerHTML = `
          <div class="text-center py-8 space-y-4 max-w-xl mx-auto animate-pop">
            <div class="text-6xl">🏆⚡</div>
            <h3 class="text-2xl font-extrabold text-emerald-900">انتهى وقت التحدي!</h3>
            <p class="text-lg font-extrabold text-slate-800">
              مجموع نقاطك: <span class="text-2xl text-purple-700">${speedState.score}</span> نقطة
            </p>
            <button onclick="startSpeedChallenge()" class="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-7 py-3 rounded-2xl text-base shadow transition">
              🔄 العب جولة جديدة
            </button>
          </div>
        `;
        return;
      }

      const currentQ = speedState.list[speedState.idx % speedState.list.length];
      container.innerHTML = `
        <div class="space-y-5 max-w-2xl mx-auto">
          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-extrabold text-sm">
            <div>⏱️ الوقت: <span id="speedTimerEl" class="${speedState.timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'} text-lg">${speedState.timeLeft}</span> ث</div>
            <div>🔥 التتابع: <span class="text-emerald-400">${speedState.streak}</span></div>
            <div>النقاط: <span class="text-sky-300 text-lg">${speedState.score}</span></div>
          </div>

          <div class="bg-gradient-to-b from-sky-50 to-white border-2 border-sky-200 rounded-3xl p-6 sm:p-8 text-center shadow-xs space-y-3">
            <span class="text-xs font-extrabold bg-sky-100 text-sky-800 px-3 py-1 rounded-full">مرجع المعلومة: صفحة ${currentQ.page} في الكتاب</span>
            <p class="text-lg sm:text-2xl font-extrabold text-slate-900 leading-relaxed">${currentQ.text}</p>
          </div>

          ${speedState.lastFeedback ? `
            <div class="text-center text-sm font-extrabold py-2 px-4 rounded-2xl ${speedState.lastFeedback.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'}">
              ${speedState.lastFeedback}
            </div>
          ` : ''}

          <div class="grid grid-cols-2 gap-4">
            <button onclick="answerSpeedQuestion(true)" class="py-4 rounded-3xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-lg sm:text-xl shadow-md transition">
              ✔️ عبارة صحيحة
            </button>
            <button onclick="answerSpeedQuestion(false)" class="py-4 rounded-3xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-lg sm:text-xl shadow-md transition">
              ❌ عبارة خاطئة
            </button>
          </div>
        </div>
      `;
    }

    function startSpeedChallenge() {
      stopActiveGameLoops();
      playTone('star');
      speedState = {
        active: true,
        timeLeft: 60,
        score: 0,
        streak: 0,
        idx: 0,
        list: shuffleArray(SPEED_STATEMENTS),
        lastFeedback: ''
      };
      const container = document.getElementById('activeGameContainer');
      renderSpeedQuizGame(container);

      speedTimerIntervalId = setInterval(() => {
        speedState.timeLeft--;
        if (speedState.timeLeft <= 10 && speedState.timeLeft > 0) {
          playTone('tick');
        }
        const tEl = document.getElementById('speedTimerEl');
        if (tEl) tEl.textContent = speedState.timeLeft;

        if (speedState.timeLeft <= 0) {
          stopActiveGameLoops();
          speedState.active = false;
          if (speedState.score > (appState.gameBestScores.speed || 0)) {
            appState.gameBestScores.speed = speedState.score;
          }
          if (speedState.score >= 40) {
            appState.completedGames.add('speed');
          }
          awardStars(Math.max(1, Math.floor(speedState.score / 25)));
          playTone('win');
          const c = document.getElementById('activeGameContainer');
          if (c && appState.activeGameIndex === 2) renderSpeedQuizGame(c);
        }
      }, 1000);
    }

    function answerSpeedQuestion(userBool) {
      if (!speedState.active) return;
      const currentQ = speedState.list[speedState.idx % speedState.list.length];
      if (userBool === currentQ.isTrue) {
        speedState.streak++;
        const bonus = Math.min(10, (speedState.streak - 1) * 2);
        speedState.score += 10 + bonus;
        speedState.lastFeedback = `✅ أحسنت! إجابة صحيحة (+${10 + bonus} نقطة)`;
        playTone('catch');
      } else {
        speedState.streak = 0;
        speedState.lastFeedback = `❌ خطأ! راجع صفحة (${currentQ.page}) في الكتاب.`;
        playTone('error');
      }
      speedState.idx++;
      renderSpeedQuizGame(document.getElementById('activeGameContainer'));
    }

    // -------------------------------------------------------------------------
    // GAME 4: بطل التدوير البيئي (Eco-Recycling Sorter Game - ص ٨٤)
    // -------------------------------------------------------------------------
    const RECYCLE_ITEMS_POOL = [
      { icon: '📄', name: 'أوراق ودفاتر قديمة', bin: 'paper' },
      { icon: '📦', name: 'صندوق كرتون', bin: 'paper' },
      { icon: '🧴', name: 'قنينة ماء بلاستيكية', bin: 'plastic' },
      { icon: '🥤', name: 'كوب بلاستيك', bin: 'plastic' },
      { icon: '🫙', name: 'مرطبان زجاجي', bin: 'glass' },
      { icon: '🍾', name: 'قارورة زجاجية', bin: 'glass' },
      { icon: '🍌', name: 'قشور موز وفواكه', bin: 'organic' },
      { icon: '🍎', name: 'بقايا خضروات', bin: 'organic' }
    ];

    let recycleRound = { queue: [], score: 0, index: 0, feedback: '' };

    function initRecycleRound() {
      recycleRound = {
        queue: shuffleArray(RECYCLE_ITEMS_POOL),
        score: 0,
        index: 0,
        feedback: ''
      };
    }

    function renderRecyclingGame(container) {
      if (recycleRound.queue.length === 0) initRecycleRound();
      const finished = recycleRound.index >= recycleRound.queue.length;
      const current = recycleRound.queue[recycleRound.index];

      container.innerHTML = `
        <div class="space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span class="inline-block text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full mb-1">الوحدة الثانية • الفصل الرابع • إعادة التدوير (ص ٨٤)</span>
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">♻️ لعبة بطل التدوير وحماية البيئة</h3>
              <p class="text-sm text-slate-600 mt-0.5">اضغط على حاوية إعادة التدوير الصحيحة لكل مادة للحفاظ على نظافة بيئتنا!</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold">
                النقاط: ${recycleRound.score} | التقدم: ${Math.min(recycleRound.index, recycleRound.queue.length)} / ${recycleRound.queue.length}
              </span>
              <button onclick="initRecycleRound(); playTone('click'); renderRecyclingGame(document.getElementById('activeGameContainer'));" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-2xl text-xs sm:text-sm transition">
                🔄 إعادة اللعبة
              </button>
            </div>
          </div>

          <div class="bg-gradient-to-b from-sky-50 to-emerald-50/60 border-2 border-emerald-200 rounded-3xl p-6 text-center">
            ${!finished ? `
              <div class="text-xs font-bold text-slate-500 mb-2">ضع هذه المادة في الحاوية المناسبة:</div>
              <div class="inline-flex flex-col items-center bg-white border-2 border-emerald-400 rounded-3xl px-8 py-5 shadow-md animate-float">
                <span class="text-5xl mb-2">${current.icon}</span>
                <span class="font-extrabold text-lg text-slate-900">${current.name}</span>
              </div>
              ${recycleRound.feedback ? `<div class="mt-3 text-sm font-extrabold ${recycleRound.feedback.startsWith('✅') ? 'text-emerald-700' : 'text-rose-700'}">${recycleRound.feedback}</div>` : ''}
            ` : `
              <div class="py-4 space-y-2 animate-pop">
                <div class="text-5xl">🌍🏆</div>
                <h4 class="text-xl font-extrabold text-emerald-950">أحسنت يا بطل البيئة! أنهيت الفرز بنتيجة (${recycleRound.score}) نقطة!</h4>
                <button onclick="initRecycleRound(); renderRecyclingGame(document.getElementById('activeGameContainer'));" class="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-2xl text-sm">
                  🔄 العب مرة أخرى
                </button>
              </div>
            `}
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button onclick="chooseRecycleBin('paper')" class="p-4 rounded-3xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-400 text-center transition active:scale-95">
              <div class="text-4xl mb-1">📘</div>
              <div class="font-extrabold text-sm sm:text-base text-sky-950">حاوية الورق</div>
            </button>
            <button onclick="chooseRecycleBin('plastic')" class="p-4 rounded-3xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 text-center transition active:scale-95">
              <div class="text-4xl mb-1">📙</div>
              <div class="font-extrabold text-sm sm:text-base text-amber-950">حاوية البلاستيك</div>
            </button>
            <button onclick="chooseRecycleBin('glass')" class="p-4 rounded-3xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-400 text-center transition active:scale-95">
              <div class="text-4xl mb-1">📗</div>
              <div class="font-extrabold text-sm sm:text-base text-emerald-950">حاوية الزجاج</div>
            </button>
            <button onclick="chooseRecycleBin('organic')" class="p-4 rounded-3xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-400 text-center transition active:scale-95">
              <div class="text-4xl mb-1">📕</div>
              <div class="font-extrabold text-sm sm:text-base text-rose-950">سماد عضوي</div>
            </button>
          </div>
        </div>
      `;
    }

    function chooseRecycleBin(binId) {
      if (recycleRound.index >= recycleRound.queue.length) return;
      const current = recycleRound.queue[recycleRound.index];
      if (current.bin === binId) {
        recycleRound.score += 10;
        recycleRound.index++;
        recycleRound.feedback = '✅ أحسنت! تم وضع المادة في حاوية التدوير الصحيحة.';
        if (recycleRound.index >= recycleRound.queue.length) {
          appState.completedGames.add('recycle');
          appState.gameBestScores.recycle = Math.max(appState.gameBestScores.recycle || 0, recycleRound.score);
          awardStars(3);
          playTone('win');
        } else {
          playTone('catch');
        }
      } else {
        recycleRound.score = Math.max(0, recycleRound.score - 5);
        recycleRound.feedback = '❌ حاوية غير مناسبة لهذه المادة! جرّب حاوية أخرى.';
        playTone('error');
      }
      renderRecyclingGame(document.getElementById('activeGameContainer'));
    }

    // =========================================================================
    // 9. INTERACTIVE LESSON QUESTIONS (With Retry Button Per Question)
    // =========================================================================
    const TEXTBOOK_QUESTIONS = [
      {
        id: 'q1',
        unit: 1,
        page: 35,
        source: 'مراجعة الدرس الأول (صفحة ٣٥) - نص السؤال الأصلي:',
        question: 'إملأ الفراغات بما يناسبها من الكلمات الآتية: (البناء الضوئي، الثغور) — أ - ينتج النبات غذاءه بعملية تُسمى .................',
        choices: ['البناء الضوئي', 'الثغور', 'الترشيح'],
        correctIndex: 0,
        explanation: 'ورد في الصفحة (٣٤) و(٣٥): تسمى عملية صنع غذاء النبات داخل الأوراق بعملية البناء الضوئي.'
      },
      {
        id: 'q2',
        unit: 1,
        page: 35,
        source: 'مراجعة الدرس الأول (صفحة ٣٥) - نص السؤال الأصلي:',
        question: 'ب - يحصل النبات على ثنائي أوكسيد الكاربون من خلال ................. الموجودة على سطح الأوراق.',
        choices: ['الجذور', 'الثغور', 'البذور'],
        correctIndex: 1,
        explanation: 'ورد في الصفحة (٣٤): يدخل غاز ثنائي أوكسيد الكاربون إلى الورقة من فتحات صغيرة على سطح الورقة تسمى الثغور.'
      },
      {
        id: 'q3',
        unit: 1,
        page: 41,
        source: 'مراجعة الدرس الثاني (صفحة ٤١) - نص السؤال الأصلي:',
        question: 'أكمل الجملة التالية بالمفردة المناسبة: (العفن، الفطريات) — ب. أُسَمّي الفطر الذي ينمو على الخبز والفاكهة بـ .................',
        choices: ['الخميرة', 'العفن', 'الطحالب'],
        correctIndex: 1,
        explanation: 'ورد في الصفحة (٣٩): العفن كائن حي من الفطريات يعيش على مختلف أنواع الأطعمة مثل الخبز والفواكه والطماطة والجبن.'
      },
      {
        id: 'q4',
        unit: 1,
        page: 61,
        source: 'مراجعة الفصل الثاني (صفحة ٦١) - نص السؤال الأصلي:',
        question: 'أكمل الجملة أدناه باستعمال المفردات ما بين القوسين: (المنتجات، آكلات النباتات، آكلات اللحوم، السلسلة الغذائية) — ١. تتغذى ................. على النباتات فقط.',
        choices: ['آكلات اللحوم', 'آكلات النباتات', 'مختلطة التغذية'],
        correctIndex: 1,
        explanation: 'ورد في الصفحة (٤٩): الحيوانات آكلة النباتات (الأعشاب) هي الحيوانات التي تعتمد على النباتات في تغذيتها مثل الأغنام والأرانب والغزلان.'
      },
      {
        id: 'q5',
        unit: 1,
        page: 61,
        source: 'مراجعة الفصل الثاني (صفحة ٦١) - نص السؤال الأصلي:',
        question: '٦. يتغذى النمر على الغزال؛ والنمر يُعَدُّ ................. أما الغزالُ فَيُعَدُّ .................',
        choices: ['المفترس / الفريسة', 'الفريسة / المفترس', 'المنتجات / المستهلكات'],
        correctIndex: 0,
        explanation: 'ورد في الصفحة (٥٨): الحيوان الذي يصطاد للحصول على غذائه هو المفترس (النمر)، وأما الحيوان الذي تم اصطياده فهو فريسة (الغزال).'
      },
      {
        id: 'q6',
        unit: 2,
        page: 78,
        source: 'مراجعة الفصل الثالث (صفحة ٧٨) - نص السؤال الأصلي:',
        question: 'أكمل الجمل أدناه باستعمال المفردات ما بين القوسين: (الثروة النباتية، الثروة الحيوانية، موارد البيئة) — ٢. تُصنع بعض الملابس من الصوف الذي يُعد من .................',
        choices: ['الثروة النباتية', 'الثروة الحيوانية', 'المعادن'],
        correctIndex: 1,
        explanation: 'ورد في الصفحة (٧٣) و(٧٨): الصوف يؤخذ من الأغنام وهو من موارد الثروة الحيوانية الحية.'
      },
      {
        id: 'q7',
        unit: 2,
        page: 93,
        source: 'مراجعة الفصل الرابع (صفحة ٩٣) - نص السؤال الأصلي:',
        question: 'إملأ الفراغات بما يناسبها من الكلمات ما بين القوسين: (ترشيد استهلاك، المحمية الطبيعية، إعادة التدوير) — ٣. توفر ................. للحيوان فرصة المأوى والغذاء والتكاثر والحماية.',
        choices: ['المحمية الطبيعية', 'إعادة التدوير', 'تلوث البيئة'],
        correctIndex: 0,
        explanation: 'ورد في الصفحة (٩٠): أُنشئت المحميات الطبيعية إذ توفر المحمية للحيوان فرصة المأوى والغذاء والتكاثر والحماية من اعتداء الصيادين.'
      },
      {
        id: 'q8',
        unit: 2,
        page: 93,
        source: 'مراجعة الفصل الرابع (صفحة ٩٣) - نص السؤال الأصلي:',
        question: '٤. يُقصد بـ ................. إعادة استعمال المواد والمخلفات مرة ثانية أو إعادتها للتصنيع من جديد.',
        choices: ['ترشيد الاستهلاك', 'إعادة التدوير', 'الانقراض'],
        correctIndex: 1,
        explanation: 'ورد في الصفحة (٨٤): إعادة التدوير هي إعادة استعمال المواد والمخلفات مرة ثانية، أو إعادتها للتصنيع من جديد بدلاً من الاستمرار في استهلاك الموارد البيئية.'
      },
      {
        id: 'q9',
        unit: 3,
        page: 110,
        source: 'مراجعة الفصل الخامس (صفحة ١١٠) - نص السؤال الأصلي:',
        question: 'إملأ الفراغات بما يناسبها من الكلمات ما بين القوسين: (كيلوغرام، غرام، الميزان ذو الكفتين، المسطرة المدرجة) — ٤. أقيس طول كتاب العلوم باستعمال .................',
        choices: ['المسطرة المدرجة', 'الميزان ذو الكفتين', 'المحرار'],
        correctIndex: 0,
        explanation: 'ورد في الصفحة (٩٩): المسطرة المدرجة هي أداة قياس أطوال الأجسام القصيرة مثل طول كتاب العلوم أو القلم.'
      },
      {
        id: 'q10',
        unit: 3,
        page: 107,
        source: 'العلوم والرياضيات - مراجعة الدرس الثاني (صفحة ١٠٧) - نص السؤال الأصلي:',
        question: 'عند ذهابي إلى السوق وجدت كيس فاصولياء مكتوباً عليه 2000 غرام ووجدت بجانبه كيس فاصولياء آخر مكتوباً عليه 2 كيلوغرام. أي الكيسين يحتوي كمية أكبر من الفاصولياء؟',
        choices: ['متساويان في الكتلة (١ كيلوغرام = ١٠٠٠ غرام)', 'كيس 2000 غرام أكبر', 'كيس 2 كيلوغرام أكبر'],
        correctIndex: 0,
        explanation: 'ورد في الصفحة (١٠٦): ١ كيلوغرام = ١٠٠٠ غرام، وبذلك فإن ٢ كيلوغرام تساوي ٢٠٠٠ غرام فهما متساويان.'
      },
      {
        id: 'q11',
        unit: 3,
        page: 125,
        source: 'مراجعة الفصل السادس (صفحة ١٢٥) - نص السؤال الأصلي:',
        question: 'أكمل الجمل أدناه باستعمال المفردات ما بين القوسين: (مخلوط صلب مع صلب، مخلوط صلب مع سائل) — ١. مخلوط الطباشير مع الماء يعد .................',
        choices: ['مخلوط صلب مع صلب', 'مخلوط صلب مع سائل', 'مادة نقية'],
        correctIndex: 1,
        explanation: 'ورد في الصفحة (١٢٠): إضافة مادة صلبة (كالطباشير أو قطع الفواكه) إلى سائل ينتج مخلوطاً صلباً مع سائل غير متجانس.'
      },
      {
        id: 'q12',
        unit: 4,
        page: 148,
        source: 'مراجعة الفصل السابع (صفحة ١٤٨) - نص السؤال الأصلي:',
        question: 'أكمل الجمل أدناه باستعمال المفردات ما بين القوسين: (انعكاس الضوء، انكسار الضوء، الموشور) — ٥. انحراف الضوء عن مساره عندما ينتقل من الهواء إلى الماء يُسمى .................',
        choices: ['انعكاس الضوء', 'انكسار الضوء', 'انتشار الضوء'],
        correctIndex: 1,
        explanation: 'ورد في الصفحة (١٤٢): انكسار الضوء هو انحراف الضوء عن مساره عند انتقاله بشكل مائل من وسط شفاف إلى وسط شفاف آخر مختلف عنه.'
      },
      {
        id: 'q13',
        unit: 4,
        page: 163,
        source: 'مراجعة الفصل الثامن (صفحة ١٦٣) - نص السؤال الأصلي:',
        question: 'أكمل الجمل أدناه باستعمال المفردات ما بين القوسين: (المحرار، الدرجة السيليزية، التوصيل الحراري) — ١. يستعمل ................. لقياس درجة حرارة الجسم.',
        choices: ['الميزان', 'المحرار', 'المسطرة'],
        correctIndex: 1,
        explanation: 'ورد في الصفحة (١٥٩): المحرار أداة لقياس درجة الحرارة، ووحدة قياس درجة الحرارة هي الدرجة السيليزية ويرمز لها بالرمز (°س).'
      },
      {
        id: 'q14',
        unit: 5,
        page: 180,
        source: 'مراجعة الفصل التاسع (صفحة ١٨٠) - نص السؤال الأصلي:',
        question: 'أكمل الجمل أدناه باستعمال المفردات ما بين القوسين: (المزيجية، النارية، الطينية، الرملية) — ٦. تُعد التربة ................. من أفضل أنواع الترب لنمو النباتات.',
        choices: ['الرملية', 'الطينية', 'المزيجية'],
        correctIndex: 2,
        explanation: 'ورد في الصفحة (١٧٧): التربة المزيجية تتكون من مزيج من الرمل والطين وتتميز بوجود الدبال التي تجعلها خصبة وصالحة لنمو النبات بصورة جيدة.'
      },
      {
        id: 'q15',
        unit: 5,
        page: 195,
        source: 'مراجعة الفصل العاشر (صفحة ١٩٥) - نص السؤال الأصلي:',
        question: 'أكمل الجمل أدناه باستعمال المفردات ما بين القوسين: (التعدين، لمعان، صلادة، المعدن) — ١. الماس أكثر ................. من المعادن الأخرى.',
        choices: ['صلادة', 'ليونة', 'هشاشة'],
        correctIndex: 0,
        explanation: 'ورد في الصفحة (١٨٥): الماس صلد إلى درجة أنه يقطع الفولاذ، وهو أكثر المعادن صلادة.'
      }
    ];

    function filterQuestions(unitFilter) {
      playTone('click');
      appState.activeQuestionFilter = unitFilter;
      document.querySelectorAll('.qfilter-btn').forEach(btn => {
        if (String(btn.dataset.qfilter) === String(unitFilter)) {
          btn.className = 'qfilter-btn bg-emerald-600 text-white font-bold px-4 py-2 rounded-2xl text-sm transition';
        } else {
          btn.className = 'qfilter-btn bg-slate-100 hover:bg-emerald-50 text-slate-700 font-bold px-4 py-2 rounded-2xl text-sm transition';
        }
      });
      renderQuestions();
    }

    function renderQuestions() {
      const listEl = document.getElementById('questionsListContainer');
      const filtered = appState.activeQuestionFilter === 'all'
        ? TEXTBOOK_QUESTIONS
        : TEXTBOOK_QUESTIONS.filter(q => q.unit === appState.activeQuestionFilter);

      listEl.innerHTML = filtered.map((q, idx) => {
        const chosen = selectedQuestionChoices[q.id];
        const isSolvedCorrectly = appState.answeredQuestions[q.id] === true;

        return `
          <div class="bg-white rounded-3xl border-2 ${isSolvedCorrectly ? 'border-emerald-400' : 'border-slate-200'} p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-sm">${idx + 1}</span>
                <span class="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">${q.source}</span>
              </div>
              <button onclick="openBookPage(${q.page})" class="text-xs sm:text-sm font-bold bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 px-3.5 py-1.5 rounded-xl transition">
                📖 راجع ص ${q.page} في الكتاب
              </button>
            </div>

            <p class="font-extrabold text-base sm:text-lg text-slate-900 leading-relaxed">${q.question}</p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              ${q.choices.map((choice, cIdx) => {
                const isSelected = chosen === cIdx;
                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50 hover:border-sky-300';
                if (isSelected) {
                  btnStyle = 'bg-sky-100 border-sky-600 text-sky-950 ring-2 ring-sky-300';
                }
                if (isSolvedCorrectly && cIdx === q.correctIndex) {
                  btnStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-2 ring-emerald-300';
                }
                return `
                  <button onclick="selectQuestionChoice('${q.id}', ${cIdx})" class="text-right px-4 py-3 rounded-2xl border-2 font-bold text-sm sm:text-base transition flex items-center gap-2.5 ${btnStyle}">
                    <span class="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs shrink-0">${isSelected ? '●' : ''}</span>
                    <span>${choice}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div class="flex flex-wrap items-center gap-2">
                <button onclick="submitQuestionAnswer('${q.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-2xl text-sm sm:text-base transition">
                  ✅ تحقق من الإجابة
                </button>
                <button onclick="retrySingleQuestion('${q.id}')" class="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold px-4 py-2.5 rounded-2xl text-sm transition">
                  🔄 إعادة المحاولة
                </button>
              </div>
              ${isSolvedCorrectly ? '<span class="text-sm font-extrabold text-emerald-700">✅ تمت الإجابة بنجاح</span>' : ''}
            </div>

            <div id="q-feedback-${q.id}" class="${isSolvedCorrectly ? '' : 'hidden'} rounded-2xl p-4 text-sm sm:text-base font-bold ${isSolvedCorrectly ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' : ''}">
              ${isSolvedCorrectly ? `🌟 إجابة صحيحة! ${q.explanation}` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    function selectQuestionChoice(qId, cIdx) {
      selectedQuestionChoices[qId] = cIdx;
      saveStateToStorage();
      playTone('click');
      renderQuestions();
    }

    function retrySingleQuestion(qId) {
      delete selectedQuestionChoices[qId];
      delete appState.answeredQuestions[qId];
      saveStateToStorage();
      updateProgressUI();
      playTone('click');
      renderQuestions();
    }

    function resetAllLessonQuestions() {
      selectedQuestionChoices = {};
      appState.answeredQuestions = {};
      saveStateToStorage();
      updateProgressUI();
      playTone('click');
      renderQuestions();
    }

    function submitQuestionAnswer(qId) {
      const q = TEXTBOOK_QUESTIONS.find(item => item.id === qId);
      const chosen = selectedQuestionChoices[qId];
      const fb = document.getElementById(`q-feedback-${qId}`);

      if (chosen === undefined) {
        fb.className = 'rounded-2xl p-4 text-sm sm:text-base font-bold bg-amber-50 border border-amber-300 text-amber-900';
        fb.textContent = '⚠️ اختر إحدى الإجابات أولاً ثم اضغط على «تحقق من الإجابة».';
        fb.classList.remove('hidden');
        playTone('error');
        return;
      }

      fb.classList.remove('hidden');
      if (chosen === q.correctIndex) {
        fb.className = 'rounded-2xl p-4 text-sm sm:text-base font-bold bg-emerald-50 border border-emerald-300 text-emerald-900';
        fb.textContent = `🌟 أحسنت! إجابة صحيحة. ${q.explanation}`;
        playTone('success');
        if (!appState.answeredQuestions[qId]) {
          appState.answeredQuestions[qId] = true;
          awardStars(2);
          renderQuestions();
        }
      } else {
        fb.className = 'rounded-2xl p-4 text-sm sm:text-base font-bold bg-rose-50 border border-rose-300 text-rose-900';
        fb.textContent = `❌ إجابة غير صحيحة. اضغط «إعادة المحاولة» وجرّب مرة أخرى أو راجع الصفحة (${q.page}) في الكتاب المدرسي.`;
        playTone('error');
      }
    }

    // =========================================================================
    // 10. CHAPTER FINAL EXAMS (10 CHAPTERS WITH SCORE & ANSWER KEY REVEAL)
    // =========================================================================
    const CHAPTER_FINAL_EXAMS = [
      {
        chapterId: 1,
        unitTitle: 'الوحدة الأولى',
        chapterTitle: 'الفصل الأول: التغذية عند النباتات والفطريات',
        reviewPage: 44,
        questions: [
          {
            q: '١. ما العملية التي يصنع بها النبات غذاءه داخل الأوراق بوجود ضوء الشمس والهواء والماء؟',
            choices: ['عملية البناء الضوئي', 'عملية الترشيح', 'عملية التعدين'],
            correctIndex: 0,
            page: 34,
            explanation: 'يصنع النبات غذاءه داخل الأوراق بعملية تسمى البناء الضوئي (ص ٣٤).'
          },
          {
            q: '٢. أي جزء من أجزاء النبات يمتص الماء والمواد المغذية كالأملاح من التربة؟',
            choices: ['الأوراق', 'الجذور', 'الأزهار'],
            correctIndex: 1,
            page: 32,
            explanation: 'تمتص الجذور الماء والمواد المغذية كالأملاح من التربة وتثبت النبات في الأرض (ص ٣٢).'
          },
          {
            q: '٣. ما الفتحات الصغيرة الموجودة على سطح الورقة والتي يدخل منها غاز ثنائي أوكسيد الكاربون؟',
            choices: ['البذور', 'الثغور', 'المعادن'],
            correctIndex: 1,
            page: 34,
            explanation: 'يدخل غاز ثنائي أوكسيد الكاربون إلى الورقة من فتحات صغيرة على سطحها تسمى الثغور (ص ٣٤).'
          },
          {
            q: '٤. لماذا لا تستطيع الفطريات صنع غذائها بنفسها كالنباتات؟',
            choices: ['لأنها تعيش في الماء فقط', 'لأنها لا تمتلك جذوراً ولا سيقاناً ولا أوراقاً', 'لأنها كبيرة الحجم جداً'],
            correctIndex: 1,
            page: 38,
            explanation: 'الفطريات كائنات حية بسيطة لا تمتلك جذوراً ولا سيقاناً ولا أوراقاً لذا تحصل على غذائها جاهزاً (ص ٣٨).'
          },
          {
            q: '٥. أي نوع من الفطريات يُستعمل في صنع المعجنات وانتفاخ عجينة الخبز؟',
            choices: ['العفن', 'الخميرة', 'الكمأ'],
            correctIndex: 1,
            page: 40,
            explanation: 'الخميرة من الفطريات المفيدة التي تُستعمل في صنع المعجنات والخبز (ص ٤٠).'
          }
        ]
      },
      {
        chapterId: 2,
        unitTitle: 'الوحدة الأولى',
        chapterTitle: 'الفصل الثاني: التغذية عند الحيوانات',
        reviewPage: 61,
        questions: [
          {
            q: '١. كيف تُصنّف الحيوانات التي تتغذى على النباتات فقط مثل الأرنب والغزال والحصان؟',
            choices: ['آكلات اللحوم', 'آكلات النباتات (الأعشاب)', 'مختلطة التغذية'],
            correctIndex: 1,
            page: 49,
            explanation: 'تُسمى الحيوانات التي تعتمد على النباتات في تغذيتها آكلات النباتات (ص ٤٩).'
          },
          {
            q: '٢. ما الذي يساعد الحيوانات آكلة اللحوم كالأسد والنمر على تمزيق اللحوم؟',
            choices: ['الأنياب الحادة والمخالب القوية', 'الأضراس العريضة المسطحة', 'الثغور'],
            correctIndex: 0,
            page: 50,
            explanation: 'تمتلك الحيوانات آكلة اللحوم أسناناً حادة (أنياباً) ومخالب قوية تساعدها في تناول اللحوم (ص ٥٠).'
          },
          {
            q: '٣. أي الحيوانات الآتية يُعد من الحيوانات مختلطة التغذية (يتغذى على النباتات والحيوانات)؟',
            choices: ['الدب والدجاجة', 'الأسد وسمك القرش', 'الأرنب والأغنام'],
            correctIndex: 0,
            page: 51,
            explanation: 'الدب والدجاجة والإنسان كائنات حية مختلطة التغذية (ص ٥١).'
          },
          {
            q: '٤. بماذا تبدأ السلاسل الغذائية جميعها في البيئة اليابسة والبيئة المائية؟',
            choices: ['بالحيوانات المفترسة', 'بالكائنات المنتجة (النباتات أو الطحالب)', 'بالحيوانات آكلة اللحوم'],
            correctIndex: 1,
            page: 56,
            explanation: 'تبدأ السلسلة الغذائية دائماً بكائنات منتجة تصنع غذاءها بنفسها كالأعشاب والطحالب (ص ٥٦ - ٥٧).'
          },
          {
            q: '٥. في العلاقة بين النمر والغزال، ماذا يُسمى الحيوان الذي يصطاد للحصول على غذائه؟',
            choices: ['الفريسة', 'المفترس', 'المنتج'],
            correctIndex: 1,
            page: 58,
            explanation: 'الحيوان الذي يصطاد للحصول على غذائه يُسمى المفترس، والحيوان الذي تم اصطياده يُسمى الفريسة (ص ٥٨).'
          }
        ]
      },
      {
        chapterId: 3,
        unitTitle: 'الوحدة الثانية',
        chapterTitle: 'الفصل الثالث: موارد البيئة وأهميتها للإنسان',
        reviewPage: 78,
        questions: [
          {
            q: '١. أي مما يأتي يُعد من موارد البيئة الطبيعية غير الحية الضرورية للحياة؟',
            choices: ['الماء والهواء والتربة', 'الأغنام والأبقار', 'الأشجار والقمح'],
            correctIndex: 0,
            page: 66,
            explanation: 'الماء والهواء والتربة والصخور والمعادن والنفط من موارد البيئة الطبيعية غير الحية (ص ٦٦ - ٦٨).'
          },
          {
            q: '٢. من أين نحصل على الأخشاب لصناعة الأثاث والورق؟',
            choices: ['من الثروة المعدنية', 'من الثروة النباتية (الأشجار)', 'من الثروة الحيوانية'],
            correctIndex: 1,
            page: 72,
            explanation: 'الثروة النباتية توفر للإنسان الغذاء والأخشاب والقطن وبعض الأدوية (ص ٧٢).'
          },
          {
            q: '٣. تُصنع بعض الملابس الشتوية الدافئة من الصوف؛ فمن أي مورد بيئي نحصل على الصوف؟',
            choices: ['الثروة الحيوانية (الأغنام)', 'الثروة النباتية', 'الصخور الرسوبية'],
            correctIndex: 0,
            page: 73,
            explanation: 'نحصل على اللحوم والحليب والبيض والصوف والجلود من الثروة الحيوانية (ص ٧٣).'
          },
          {
            q: '٤. لماذا تُعد النباتات والحيوانات من الموارد البيئية المتجددة؟',
            choices: ['لأنها لا تتكاثر أبداً', 'لأنها تنمو وتتكاثر وتُعوّض باستمرار', 'لأنها مصنوعة من الحديد'],
            correctIndex: 1,
            page: 72,
            explanation: 'الثروة النباتية والحيوانية موارد حية متجددة لأنها تنمو وتتكاثر (ص ٧٢ - ٧٣).'
          },
          {
            q: '٥. يستفيد الإنسان من بعض النباتات في صناعة:',
            choices: ['الأدوية والعطور والزيوت', 'الزجاج والحديد', 'المغناطيس'],
            correctIndex: 0,
            page: 76,
            explanation: 'ورد في القراءة العلمية (ص ٧٦): تُستعمل كثير من النباتات في صناعة الأدوية لعلاج الأمراض.'
          }
        ]
      },
      {
        chapterId: 4,
        unitTitle: 'الوحدة الثانية',
        chapterTitle: 'الفصل الرابع: المحافظة على موارد البيئة',
        reviewPage: 93,
        questions: [
          {
            q: '١. ماذا نسمي عدم الإسراف في استعمال الماء والكهرباء والموارد البيئية؟',
            choices: ['ترشيد الاستهلاك', 'الصيد الجائر', 'تلوث البيئة'],
            correctIndex: 0,
            page: 82,
            explanation: 'ترشيد الاستهلاك هو عدم الإسراف في استعمال الموارد البيئية والمحافظة عليها (ص ٨٢).'
          },
          {
            q: '٢. ما المقصود بـ «إعادة التدوير»؟',
            choices: ['رمي النفايات في الأنهار', 'إعادة استعمال المواد والمخلفات مرة ثانية أو تصنيعها من جديد', 'قطع أشجار الغابات'],
            correctIndex: 1,
            page: 84,
            explanation: 'إعادة التدوير هي إعادة استعمال المواد والمخلفات مرة ثانية أو إعادتها للتصنيع من جديد (ص ٨٤).'
          },
          {
            q: '٣. أي من التصرفات الآتية يسبب تناقص التنوع الحيوي وانقراض بعض الحيوانات؟',
            choices: ['إنشاء المحميات الطبيعية', 'الصيد الجائر وتلوث البيئة وقطع الأشجار', 'زراعة الأشجار'],
            correctIndex: 1,
            page: 88,
            explanation: 'الصيد الجائر والتلوث وقطع الأشجار تسبب تناقص أعداد الكائنات الحية (ص ٨٨ - ٨٩).'
          },
          {
            q: '٤. ما المكان الآمن الذي يُنشأ لحماية الحيوانات وتوفير المأوى والغذاء والتكاثر لها؟',
            choices: ['المحمية الطبيعية', 'المصنع', 'الموشور الزجاجي'],
            correctIndex: 0,
            page: 90,
            explanation: 'المحمية الطبيعية توفر للحيوانات فرصة المأوى والغذاء والتكاثر والحماية من الصيادين (ص ٩٠).'
          },
          {
            q: '٥. كيف تحافظ على الماء في منزلك ومدرستك؟',
            choices: ['ترك الصنبور مفتوحاً باستمرار', 'إغلاق صنبور الماء جيداً بعد الاستعمال وعدم هدره', 'سقي الحديقة وقت الظهيرة بكميات كبيرة'],
            correctIndex: 1,
            page: 82,
            explanation: 'من طرائق ترشيد استهلاك الماء إغلاق الصنبور جيداً بعد الاستعمال (ص ٨٢).'
          }
        ]
      },
      {
        chapterId: 5,
        unitTitle: 'الوحدة الثالثة',
        chapterTitle: 'الفصل الخامس: القياس',
        reviewPage: 110,
        questions: [
          {
            q: '١. ما الأداة المناسبة لقياس طول كتاب العلوم أو طول قلم الرصاص؟',
            choices: ['المسطرة المدرجة', 'الميزان ذو الكفتين', 'المحرار'],
            correctIndex: 0,
            page: 99,
            explanation: 'تُستعمل المسطرة المدرجة لقياس أطوال الأجسام القصيرة كالكتاب والقلم (ص ٩٩).'
          },
          {
            q: '٢. كم سنتمتراً يساوي المتر الواحد (١ م)؟',
            choices: ['١٠ سنتمترات', '١٠٠ سنتمتر', '١٠٠٠ سنتمتر'],
            correctIndex: 1,
            page: 100,
            explanation: 'المتر وحدة قياس الأطوال الكبيرة، وكل ١ متر = ١٠٠ سنتمتر (ص ١٠٠).'
          },
          {
            q: '٣. ما الأداة التي تُستعمل لقياس كتلة الفواكه والخضروات؟',
            choices: ['الميزان ذو الكفتين', 'شريط القياس', 'الموشور'],
            correctIndex: 0,
            page: 104,
            explanation: 'يُستعمل الميزان ذو الكفتين والميزان الرقمي لقياس كتل الأجسام (ص ١٠٤).'
          },
          {
            q: '٤. كم غراماً يساوي الكيلوغرام الواحد (١ كغم)؟',
            choices: ['١٠٠ غرام', '٥٠٠ غرام', '١٠٠٠ غرام'],
            correctIndex: 2,
            page: 106,
            explanation: 'الكيلوغرام وحدة قياس الكتل الكبيرة، وكل ١ كيلوغرام = ١٠٠٠ غرام (ص ١٠٦).'
          },
          {
            q: '٥. أي وحدة قياس نستخدم لقياس كتلة خاتم ذهبي صغير؟',
            choices: ['الغرام (غم)', 'الكيلوغرام (كغم)', 'المتر (م)'],
            correctIndex: 0,
            page: 106,
            explanation: 'الغرام (غم) وحدة قياس كتل الأجسام الصغيرة والخفيفة مثل الخاتم والريشة (ص ١٠٦).'
          }
        ]
      },
      {
        chapterId: 6,
        unitTitle: 'الوحدة الثالثة',
        chapterTitle: 'الفصل السادس: المخاليط غير المتجانسة',
        reviewPage: 125,
        questions: [
          {
            q: '١. ماذا يتكون عند خلط مادتين صلبتين أو أكثر مع احتفاظ كل مادة بخصائصها الأصلية؟',
            choices: ['مخلوط صلب مع صلب غير متجانس', 'مخلوط صلب مع سائل', 'مادة نقية'],
            correctIndex: 0,
            page: 114,
            explanation: 'مخلوط صلب مع صلب ينتج من خلط مادتين صلبتين أو أكثر وتحتفظ كل مادة بخصائصها (ص ١١٤).'
          },
          {
            q: '٢. ما الطريقة الأنسب لفصل برادة الحديد المختلطة مع الرمل؟',
            choices: ['استعمال المغناطيس', 'الترشيح', 'التبخير'],
            correctIndex: 0,
            page: 115,
            explanation: 'يجذب المغناطيس برادة الحديد ويفصلها عن الرمل بسهولة (ص ١١٥).'
          },
          {
            q: '٣. كيف نفصل مخلوط الرمل والحصى الصغير مختلف الحجم؟',
            choices: ['باستعمال الغربال', 'باستعمال المغناطيس', 'بالتسخين'],
            correctIndex: 0,
            page: 116,
            explanation: 'يُستعمل الغربال لفصل المواد الصلبة المختلفة في حجومها مثل الرمل والحصى الصغير (ص ١١٦).'
          },
          {
            q: '٤. كيف يمكن فصل الرمل أو الطباشير غير الذائب عن الماء؟',
            choices: ['بالترشيح باستعمال ورق الترشيح', 'بالمغناطيس', 'بالالتقاط باليد'],
            correctIndex: 0,
            page: 121,
            explanation: 'يُفصل مخلوط صلب مع سائل (مثل الرمل والماء) باستعمال ورق الترشيح أو المصفاة (ص ١٢١).'
          },
          {
            q: '٥. ماذا يحدث لنشارة الخشب والرمل عند وضعهما في وعاء فيه ماء؟',
            choices: ['تطفو نشارة الخشب على سطح الماء ويترسب الرمل في القاع', 'يذوب الرمل في الماء', 'ينجذب الرمل للمغناطيس'],
            correctIndex: 0,
            page: 117,
            explanation: 'تُستعمل طريقة الطفو والترسيب لفصل نشارة الخشب التي تطفو عن الرمل الذي يترسب في الأسفل (ص ١١٧).'
          }
        ]
      },
      {
        chapterId: 7,
        unitTitle: 'الوحدة الرابعة',
        chapterTitle: 'الفصل السابع: الضوء',
        reviewPage: 148,
        questions: [
          {
            q: '١. كيف ينتقل الضوء في الوسط المتجانس كالهواء؟',
            choices: ['بخطوط مستقيمة في جميع الاتجاهات', 'بخطوط متعرجة فقط', 'لا ينتقل في الهواء'],
            correctIndex: 0,
            page: 130,
            explanation: 'ينتقل الضوء بخطوط مستقيمة في جميع الاتجاهات (ص ١٣٠).'
          },
          {
            q: '٢. ماذا نسمي الأجسام التي لا تسمح بمرور الضوء من خلالها وتكوّن ظلاً خلفها مثل الخشب؟',
            choices: ['الأجسام المعتمة', 'الأجسام الشفافة', 'المرايا المستوية'],
            correctIndex: 0,
            page: 132,
            explanation: 'الأجسام المعتمة لا تسمح بمرور الضوء من خلالها ويتكون لها ظل عند سقوط الضوء عليها (ص ١٣٢).'
          },
          {
            q: '٣. ما الظاهرة التي تحدث عندما يرتد الضوء عن سطح المرآة المستوية؟',
            choices: ['انعكاس الضوء', 'انكسار الضوء', 'تحلل الضوء'],
            correctIndex: 0,
            page: 136,
            explanation: 'انعكاس الضوء هو ارتداد الضوء عن السطح العاكس كالمرآة (ص ١٣٦).'
          },
          {
            q: '٤. لماذا يبدو قلم الرصاص الموضوع بشكل مائل في كأس فيه ماء وكأنه مكسور؟',
            choices: ['بسبب انكسار الضوء', 'بسبب انعكاس الضوء', 'بسبب التوصيل الحراري'],
            correctIndex: 0,
            page: 142,
            explanation: 'ينحرف الضوء عن مساره عند انتقاله بشكل مائل من الهواء إلى الماء ويُسمى ذلك انكسار الضوء (ص ١٤٢).'
          },
          {
            q: '٥. إلى كم لون يحلل الموشور الزجاجي ضوء الشمس؟',
            choices: ['٣ ألوان', '٥ ألوان', '٧ ألوان (الأحمر، البرتقالي، الأصفر، الأخضر، الأزرق، النيلي، البنفسجي)'],
            correctIndex: 2,
            page: 144,
            explanation: 'يحلل الموشور الزجاجي ضوء الشمس إلى ألوانه السبعة (ص ١٤٣ - ١٤٤).'
          }
        ]
      },
      {
        chapterId: 8,
        unitTitle: 'الوحدة الرابعة',
        chapterTitle: 'الفصل الثامن: الحرارة',
        reviewPage: 163,
        questions: [
          {
            q: '١. كيف تنتقل الحرارة بين جسمين متلامسين مختلفين في درجة حرارتهما؟',
            choices: ['من الجسم الساخن إلى الجسم البارد', 'من الجسم البارد إلى الجسم الساخن', 'لا تنتقل الحرارة أبداً'],
            correctIndex: 0,
            page: 152,
            explanation: 'تنتقل الطاقة الحرارية دائماً من الجسم الساخن إلى الجسم البارد عند تلامسهما (ص ١٥٢).'
          },
          {
            q: '٢. أي من المواد الآتية تُعد من المواد الموصلة للحرارة وتُصنع منها أواني الطهي؟',
            choices: ['الألمنيوم والنحاس والحديد', 'الخشب والبلاستيك', 'الصوف والمطاط'],
            correctIndex: 0,
            page: 153,
            explanation: 'الألمنيوم والحديد والنحاس مواد موصلة للحرارة تنتقل خلالها الحرارة بسهولة (ص ١٥٣).'
          },
          {
            q: '٣. لماذا تُصنع مقابض أواني الطهي من الخشب أو البلاستيك؟',
            choices: ['لأنها مواد عازلة للحرارة تحمي أيدينا من الاحتراق', 'لأنها موصلة جيدة للحرارة', 'لأنها تذوب بسرعة'],
            correctIndex: 0,
            page: 154,
            explanation: 'الخشب والبلاستيك والصوف مواد عازلة للحرارة لا تنتقل الحرارة خلالها بسهولة (ص ١٥٤).'
          },
          {
            q: '٤. ما الأداة التي تُستعمل لقياس درجة حرارة الجسم أو الجو؟',
            choices: ['المحرار', 'المسطرة المدرجة', 'الميزان ذو الكفتين'],
            correctIndex: 0,
            page: 159,
            explanation: 'المحرار أداة تُستعمل لقياس درجة حرارة الأجسام (ص ١٥٩).'
          },
          {
            q: '٥. ما وحدة قياس درجة الحرارة المعتمدة في كتاب العلوم؟',
            choices: ['الدرجة السيليزية (°س)', 'الكيلوغرام (كغم)', 'السنتمتر (سم)'],
            correctIndex: 0,
            page: 159,
            explanation: 'وحدة قياس درجة الحرارة هي الدرجة السيليزية ويرمز لها بالرمز (°س) (ص ١٥٩).'
          }
        ]
      },
      {
        chapterId: 9,
        unitTitle: 'الوحدة الخامسة',
        chapterTitle: 'الفصل التاسع: الصخور والتربة',
        reviewPage: 180,
        questions: [
          {
            q: '١. كيف تتكون الصخور النارية مثل البازلت والغرانيت؟',
            choices: ['من تصلب منصهر البراكين الخارج من باطن الأرض', 'من تراكم الرمال في قاع البحر', 'من تحلل أوراق الأشجار'],
            correctIndex: 0,
            page: 169,
            explanation: 'تتكون الصخور النارية نتيجة تصلب منصهر البراكين الخارج من باطن الأرض (ص ١٦٩).'
          },
          {
            q: '٢. أي نوع من الصخور يتكون على شكل طبقات نتيجة تراكم المواد المترسبة وتصلبها؟',
            choices: ['الصخور الرسوبية (مثل الحجر الجيري والحجر الرملي)', 'الصخور النارية', 'المعادن السائلة'],
            correctIndex: 0,
            page: 170,
            explanation: 'الصخور الرسوبية تتكون من تراكم المواد المترسبة بشكل طبقات وتصلبها عبر الزمن (ص ١٧٠).'
          },
          {
            q: '٣. ما المادة العضوية المتكونة من بقايا الكائنات الحية المتحللة والتي تزيد خصوبة التربة؟',
            choices: ['الدبال', 'البلاستيك', 'الزجاج'],
            correctIndex: 0,
            page: 174,
            explanation: 'الدبال بقايا كائنات حية نباتية وحيوانية متحللة تزيد من خصوبة التربة (ص ١٧٤).'
          },
          {
            q: '٤. أي نوع من أنواع التربة يسمح بمرور الماء بسرعة كبيرة ولا يحتفظ به؟',
            choices: ['التربة الرملية', 'التربة الطينية', 'التربة المزيجية'],
            correctIndex: 0,
            page: 176,
            explanation: 'التربة الرملية حبيباتها كبيرة متباعدة لذا تسمح بمرور الماء من خلالها بسهولة ولا تحتفظ به (ص ١٧٦).'
          },
          {
            q: '٥. ما أفضل أنواع الترب لنمو النباتات بصورة جيدة لاحتوائها على الرمل والطين والدبال؟',
            choices: ['التربة المزيجية', 'التربة الرملية فقط', 'التربة الطينية فقط'],
            correctIndex: 0,
            page: 177,
            explanation: 'التربة المزيجية أفضل أنواع الترب لنمو النباتات لأنها تحتفظ بالماء بدرجة مناسبة وغنية بالدبال (ص ١٧٧).'
          }
        ]
      },
      {
        chapterId: 10,
        unitTitle: 'الوحدة الخامسة',
        chapterTitle: 'الفصل العاشر: المعادن',
        reviewPage: 195,
        questions: [
          {
            q: '١. أي مما يأتي يُعد من الصفات الرئيسة التي نميّز بها المعادن عن بعضها؟',
            choices: ['اللون والصلادة واللمعان', 'الطعم والرائحة', 'الطفو على الماء'],
            correctIndex: 0,
            page: 184,
            explanation: 'تتميز المعادن بصفات منها: اللون، والصلادة، واللمعان (ص ١٨٤ - ١٨٦).'
          },
          {
            q: '٢. ما أكثر المعادن صلادةً والذي يُستعمل في قطع الزجاج والفولاذ؟',
            choices: ['الماس', 'التلك', 'الكرافيت'],
            correctIndex: 0,
            page: 185,
            explanation: 'الماس أكثر المعادن صلادةً ويقطع الفولاذ والزجاج، بينما التلك أقلها صلادة (ص ١٨٥).'
          },
          {
            q: '٣. أي معدن يُستعمل في صناعة الأسلاك الكهربائية لأنه موصل جيد للكهرباء؟',
            choices: ['النحاس', 'التلك', 'الجبس'],
            correctIndex: 0,
            page: 191,
            explanation: 'يُستعمل النحاس في صناعة الأسلاك الكهربائية والأواني (ص ١٩١).'
          },
          {
            q: '٤. في أي مجال يُستعمل معدن الألمنيوم؟',
            choices: ['صناعة هياكل الطائرات وأواني الطهي', 'صناعة الحلي الذهبية', 'صناعة أقلام الرصاص'],
            correctIndex: 0,
            page: 191,
            explanation: 'يُستعمل الألمنيوم لخفته ومتانته في صناعة هياكل الطائرات وأواني الطهي (ص ١٩١).'
          },
          {
            q: '٥. ماذا نسمي عملية استخراج المعادن من باطن الأرض؟',
            choices: ['التعدين', 'الترشيح', 'البناء الضوئي'],
            correctIndex: 0,
            page: 192,
            explanation: 'التعدين هو عملية استخراج المعادن من باطن الأرض (ص ١٩٢).'
          }
        ]
      }
    ];

    let currentExamDraftAnswers = {};
    let currentExamSubmitted = false;

    function selectExamChapter(chapterId) {
      playTone('click');
      appState.activeExamChapterId = chapterId;
      saveStateToStorage();

      const savedRecord = appState.chapterExams[chapterId];
      if (savedRecord && savedRecord.submitted) {
        currentExamDraftAnswers = { ...savedRecord.userAnswers };
        currentExamSubmitted = true;
      } else {
        currentExamDraftAnswers = {};
        currentExamSubmitted = false;
      }

      renderChapterExamsGrid();
      renderActiveChapterExam();
    }

    function renderChapterExamsGrid() {
      const grid = document.getElementById('chapterExamsGrid');
      if (!grid) return;

      grid.innerHTML = CHAPTER_FINAL_EXAMS.map(ex => {
        const isSelected = ex.chapterId === appState.activeExamChapterId;
        const record = appState.chapterExams[ex.chapterId];
        const hasScore = record && record.submitted;

        return `
          <button onclick="selectExamChapter(${ex.chapterId})" class="text-right p-3 rounded-2xl border-2 transition flex flex-col justify-between ${
            isSelected
              ? 'bg-sky-600 border-sky-700 text-white shadow-sm'
              : hasScore
                ? 'bg-emerald-50 border-emerald-300 text-slate-900 hover:bg-emerald-100'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50'
          }">
            <div class="flex items-center justify-between gap-1">
              <span class="text-xs font-extrabold ${isSelected ? 'text-sky-100' : 'text-emerald-700'}">الفصل ${ex.chapterId}</span>
              ${hasScore
                ? `<span class="text-xs font-extrabold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white text-sky-900' : 'bg-emerald-600 text-white'}">${record.bestScore}/${ex.questions.length}</span>`
                : `<span class="text-[11px] ${isSelected ? 'text-sky-200' : 'text-slate-400'}">لم يُختبر</span>`
              }
            </div>
            <div class="font-bold text-xs sm:text-sm mt-1 line-clamp-2">${ex.chapterTitle.replace(/^الفصل [^:]+:\s*/, '')}</div>
          </button>
        `;
      }).join('');
    }

    function selectExamChoice(qIdx, cIdx) {
      if (currentExamSubmitted) return;
      currentExamDraftAnswers[qIdx] = cIdx;
      playTone('click');
      renderActiveChapterExam();
    }

    function submitChapterFinalExam() {
      const exam = CHAPTER_FINAL_EXAMS.find(e => e.chapterId === appState.activeExamChapterId);
      if (!exam) return;

      const answeredCount = Object.keys(currentExamDraftAnswers).length;
      if (answeredCount < exam.questions.length) {
        playTone('error');
        showCustomModal({
          icon: '⚠️',
          title: 'يرجى الإجابة عن جميع الأسئلة',
          body: `لقد أجبت عن (${answeredCount}) من أصل (${exam.questions.length}) أسئلة. أكمل بقية الأسئلة ثم اضغط «إنهاء الاختبار وعرض النتيجة».`
        });
        return;
      }

      let score = 0;
      exam.questions.forEach((q, idx) => {
        if (currentExamDraftAnswers[idx] === q.correctIndex) score++;
      });

      currentExamSubmitted = true;
      const prevBest = appState.chapterExams[exam.chapterId] ? appState.chapterExams[exam.chapterId].bestScore : 0;
      const isFirstTime = !appState.chapterExams[exam.chapterId];

      appState.chapterExams[exam.chapterId] = {
        bestScore: Math.max(prevBest, score),
        total: exam.questions.length,
        userAnswers: { ...currentExamDraftAnswers },
        submitted: true
      };

      if (isFirstTime) {
        awardStars(score * 2);
      } else {
        saveStateToStorage();
        updateProgressUI();
      }

      playTone(score >= 3 ? 'win' : 'error');
      renderChapterExamsGrid();
      renderActiveChapterExam();
    }

    function retryChapterFinalExam() {
      currentExamDraftAnswers = {};
      currentExamSubmitted = false;
      playTone('click');
      renderActiveChapterExam();
    }

    function renderActiveChapterExam() {
      const exam = CHAPTER_FINAL_EXAMS.find(e => e.chapterId === appState.activeExamChapterId);
      const container = document.getElementById('activeChapterExamContainer');
      if (!exam || !container) return;

      let scoreBannerHtml = '';
      if (currentExamSubmitted) {
        let score = 0;
        exam.questions.forEach((q, idx) => {
          if (currentExamDraftAnswers[idx] === q.correctIndex) score++;
        });
        const percent = Math.round((score / exam.questions.length) * 100);
        let gradeLabel = 'ممتاز 🌟';
        let bannerColors = 'bg-emerald-50 border-emerald-400 text-emerald-950';
        if (percent < 60) {
          gradeLabel = 'يحتاج إلى مراجعة الكتاب 💪';
          bannerColors = 'bg-amber-50 border-amber-400 text-amber-950';
        } else if (percent < 80) {
          gradeLabel = 'جيد 👏';
          bannerColors = 'bg-sky-50 border-sky-400 text-sky-950';
        } else if (percent < 100) {
          gradeLabel = 'جيد جداً 🏅';
        }

        scoreBannerHtml = `
          <div class="rounded-3xl border-2 p-5 sm:p-6 ${bannerColors} flex flex-wrap items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="text-xs font-extrabold uppercase tracking-wide">نتيجة الاختبار الختامي — ${exam.chapterTitle}</div>
              <div class="text-2xl sm:text-3xl font-extrabold">
                الدرجة: <span class="text-emerald-700">${score}</span> من <span>${exam.questions.length}</span> (${percent}%) — ${gradeLabel}
              </div>
              <p class="text-sm font-medium">تم إظهار الإجابات الصحيحة باللون الأخضر مع توضيح أرقام صفحاتها في الكتاب بالأسفل.</p>
            </div>
            <button onclick="retryChapterFinalExam()" class="bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-900 font-extrabold px-5 py-3 rounded-2xl text-sm sm:text-base shadow-2xs transition">
              🔄 إعادة الاختبار
            </button>
          </div>
        `;
      }

      container.innerHTML = `
        <div class="space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span class="inline-block text-xs font-extrabold bg-amber-100 text-amber-900 px-3 py-1 rounded-full mb-1.5">${exam.unitTitle} • اختبار ختامي</span>
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">${exam.chapterTitle}</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="openBookPage(${exam.reviewPage})" class="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition">
                📖 مراجعة الفصل في الكتاب (ص ${exam.reviewPage})
              </button>
              <button onclick="retryChapterFinalExam()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition">
                🔄 إعادة الاختبار
              </button>
            </div>
          </div>

          ${scoreBannerHtml}

          <div class="space-y-5">
            ${exam.questions.map((q, qIdx) => {
              const userChoice = currentExamDraftAnswers[qIdx];
              const isUserRight = currentExamSubmitted && userChoice === q.correctIndex;

              return `
                <div class="rounded-3xl border-2 p-5 transition ${
                  !currentExamSubmitted
                    ? 'bg-slate-50/70 border-slate-200'
                    : isUserRight
                      ? 'bg-emerald-50/50 border-emerald-400'
                      : 'bg-rose-50/40 border-rose-300'
                }">
                  <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <p class="font-extrabold text-base sm:text-lg text-slate-900">${q.q}</p>
                    ${currentExamSubmitted ? `
                      <span class="text-xs font-extrabold px-3 py-1 rounded-full shrink-0 ${
                        isUserRight ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }">
                        ${isUserRight ? '✅ إجابة صحيحة' : '❌ إجابة خاطئة'}
                      </span>
                    ` : ''}
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    ${q.choices.map((ch, cIdx) => {
                      const isSelected = userChoice === cIdx;
                      let style = 'bg-white border-slate-200 text-slate-800 hover:border-sky-400';

                      if (!currentExamSubmitted) {
                        if (isSelected) style = 'bg-sky-100 border-sky-600 text-sky-950 ring-2 ring-sky-300';
                      } else {
                        if (cIdx === q.correctIndex) {
                          style = 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-2 ring-emerald-300';
                        } else if (isSelected && cIdx !== q.correctIndex) {
                          style = 'bg-rose-100 border-rose-500 text-rose-950 line-through';
                        } else {
                          style = 'bg-white/60 border-slate-200 text-slate-500';
                        }
                      }

                      return `
                        <button type="button" ${currentExamSubmitted ? 'disabled' : ''} onclick="selectExamChoice(${qIdx}, ${cIdx})"
                                class="text-right px-4 py-3 rounded-2xl border-2 font-bold text-sm transition flex items-center justify-between gap-2 ${style}">
                          <span>${ch}</span>
                          ${currentExamSubmitted && cIdx === q.correctIndex ? '<span class="text-emerald-700 font-extrabold text-xs shrink-0">✔ الصحيحة</span>' : ''}
                          ${currentExamSubmitted && isSelected && cIdx !== q.correctIndex ? '<span class="text-rose-700 font-extrabold text-xs shrink-0">✖ اختيارك</span>' : ''}
                        </button>
                      `;
                    }).join('')}
                  </div>

                  ${currentExamSubmitted ? `
                    <div class="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                      <span class="font-bold text-slate-700">📘 التوضيح من الكتاب: ${q.explanation}</span>
                      <button onclick="openBookPage(${q.page})" class="text-sky-700 hover:underline font-extrabold shrink-0">افتح ص ${q.page} ←</button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            ${!currentExamSubmitted ? `
              <button onclick="submitChapterFinalExam()" class="bg-gradient-to-l from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-extrabold px-7 py-3.5 rounded-2xl text-base shadow-md transition">
                🏁 إنهاء الاختبار وعرض الدرجة والإجابات الصحيحة
              </button>
            ` : `
              <button onclick="retryChapterFinalExam()" class="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-3 rounded-2xl text-base shadow transition">
                🔄 إعادة محاولة اختبار الفصل
              </button>
            `}
          </div>
        </div>
      `;
    }

    // =========================================================================
    // 11. PRACTICAL LEARNING ACTIVITIES & INTERACTIVE SIMULATIONS
    // =========================================================================
    let simPlantState = { sunlight: true, airOpen: true, watered: true, day: 3 };
    let simLightMode = 'straight';
    let simCard2Shifted = false;
    let simPencilTilted = true;
    let simSoilState = { poured: false };

    function selectExperiment(idx) {
      playTone('click');
      appState.activeExperimentIndex = idx;
      appState.triedExperiments.add(idx);
      saveStateToStorage();
      document.querySelectorAll('.exp-tab-btn').forEach((btn, i) => {
        if (i === idx) {
          btn.className = 'exp-tab-btn bg-sky-600 text-white font-bold px-4 py-2.5 rounded-2xl text-sm sm:text-base transition';
        } else {
          btn.className = 'exp-tab-btn bg-slate-100 hover:bg-sky-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-sm sm:text-base transition';
        }
      });
      renderActiveExperiment();
    }

    function resetPlantSim() {
      simPlantState = { sunlight: true, airOpen: true, watered: true, day: 3 };
      playTone('click');
      renderActiveExperiment();
    }

    function renderActiveExperiment() {
      const idx = appState.activeExperimentIndex;
      const container = document.getElementById('activeExperimentContainer');

      if (idx === 0) {
        const healthy = simPlantState.sunlight && simPlantState.airOpen && simPlantState.watered;
        const heightCm = healthy ? (12 + simPlantState.day * 2) : 12;
        const statusText = healthy
          ? 'النبتة تنمو وتكبر وأوراقها خضراء نضرة لأنها حصلت على ضوء الشمس والهواء والماء.'
          : `النبتة تذبل وتضعف بسبب نقص: ${!simPlantState.sunlight ? 'ضوء الشمس ' : ''}${!simPlantState.airOpen ? 'الهواء (مغطاة بناقوس زجاجي) ' : ''}${!simPlantState.watered ? 'الماء' : ''}.`;

        container.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-5 bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-5 space-y-4">
              <div class="flex items-center justify-between gap-2">
                <span class="bg-emerald-700 text-white text-xs font-extrabold px-3 py-1 rounded-full">📘 النص الأصلي من الكتاب (ص ٣١ و ص ٣٣)</span>
                <button onclick="openBookPage(31)" class="text-xs font-bold bg-white border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl">افتح ص ٣١</button>
              </div>
              <h3 class="font-extrabold text-lg text-emerald-950">أستكشف: ما أهمية ضوء الشمس للنبات؟ (ص ٣١) ونشاط: هل تحتاج النباتات إلى الهواء؟ (ص ٣٣)</h3>
              <div class="bg-white rounded-2xl p-4 border border-emerald-100 text-sm space-y-2 text-slate-700">
                <div class="font-bold text-emerald-800">أشياء أحتاج إليها:</div>
                <p>أصيصين في كل منهما نبات، شريط قياس، شريط لاصق، قلم رصاص، ورقة بيضاء، وعاء فيه ماء، ناقوس زجاجي (ص ٣٣).</p>
                <div class="font-bold text-emerald-800 pt-2">خطوات العمل في الكتاب:</div>
                <ol class="list-decimal pr-5 space-y-1">
                  <li>أقيس طول كل من النبتتين باستعمال شريط القياس.</li>
                  <li>أسقي النبتتين بالماء ثم أضع النبتة رقم (١) في مكان تصله أشعة الشمس والنبتة رقم (٢) في مكان مظلم (أو أغطيها بناقوس زجاجي ص ٣٣).</li>
                  <li>أفحص النبتتين بعد (٣) أيام وأقارن بينهما.</li>
                </ol>
              </div>
            </div>

            <div class="lg:col-span-7 bg-white border-2 border-sky-200 rounded-3xl p-5 space-y-5 shadow-sm">
              <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <span class="bg-sky-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">🖥️ محاكاة تفاعلية توضيحية</span>
                <button onclick="resetPlantSim()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition">🔄 إعادة التجربة</button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button onclick="simPlantState.sunlight = !simPlantState.sunlight; playTone('click'); renderActiveExperiment();" class="p-3 rounded-2xl border-2 font-bold text-sm transition ${simPlantState.sunlight ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-slate-800 border-slate-700 text-white'}">
                  ${simPlantState.sunlight ? '☀️ ضوء الشمس: متوفر' : '🌑 مكان مظلم: بدون ضوء'}
                </button>
                <button onclick="simPlantState.airOpen = !simPlantState.airOpen; playTone('click'); renderActiveExperiment();" class="p-3 rounded-2xl border-2 font-bold text-sm transition ${simPlantState.airOpen ? 'bg-sky-50 border-sky-400 text-sky-900' : 'bg-indigo-50 border-indigo-400 text-indigo-900'}">
                  ${simPlantState.airOpen ? '🌬️ الهواء: متجدد ومفتوح' : '🔔 مغطاة بناقوس زجاجي'}
                </button>
                <button onclick="simPlantState.watered = !simPlantState.watered; playTone('click'); renderActiveExperiment();" class="p-3 rounded-2xl border-2 font-bold text-sm transition ${simPlantState.watered ? 'bg-teal-50 border-teal-400 text-teal-900' : 'bg-orange-50 border-orange-300 text-orange-900'}">
                  ${simPlantState.watered ? '💧 السقي بالماء: نعم' : '🏜️ بدون ماء'}
                </button>
              </div>

              <div class="rounded-3xl p-6 border-2 transition ${simPlantState.sunlight ? 'bg-gradient-to-b from-sky-100 to-emerald-50 border-sky-200' : 'bg-gradient-to-b from-slate-800 to-slate-700 border-slate-600 text-white'} flex flex-col items-center justify-center min-h-[230px] relative">
                <div class="absolute top-3 right-4 text-xs font-extrabold bg-white/90 text-slate-800 px-3 py-1 rounded-full">
                  📏 شريط القياس: ${heightCm} سم
                </div>
                <div class="relative flex flex-col items-center">
                  ${!simPlantState.airOpen ? '<div class="w-40 h-44 rounded-t-full border-4 border-sky-300/80 bg-sky-200/20 flex items-end justify-center p-2"><span class="text-xs font-bold bg-white/80 text-slate-800 px-2 py-0.5 rounded-full absolute top-2">ناقوس زجاجي</span>' : '<div class="flex items-end justify-center p-2">'}
                    <div class="text-center transition-all duration-300" style="transform: scale(${healthy ? 1.2 : 0.85});">
                      <div class="text-6xl">${healthy ? '🌿🌻🌿' : '🥀🍂'}</div>
                    </div>
                  </div>
                  <div class="w-28 h-12 bg-amber-700 rounded-b-2xl border-t-4 border-amber-900 flex items-center justify-center text-white font-bold text-xs shadow">
                    أصيص النبات
                  </div>
                </div>
              </div>

              <div class="rounded-2xl p-4 font-bold text-sm sm:text-base ${healthy ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' : 'bg-amber-50 border border-amber-300 text-amber-900'}">
                <strong>الاستنتاج:</strong> ${statusText}
              </div>
            </div>
          </div>
        `;
      } else if (idx === 1) {
        let visualStage = '';
        let explanation = '';

        if (simLightMode === 'straight') {
          visualStage = `
            <div class="space-y-4">
              <div class="flex justify-center">
                <button onclick="simCard2Shifted = !simCard2Shifted; playTone('drop'); renderActiveExperiment();" class="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-2xl text-sm shadow transition">
                  ${simCard2Shifted ? '↩️ أعد البطاقة رقم (٢) على استقامة واحدة' : '↔️ حرّك البطاقة الكرتونية رقم (٢) إلى الجانب'}
                </button>
              </div>
              <div class="bg-slate-900 rounded-3xl p-5 text-white flex items-center justify-between gap-2 overflow-x-auto min-h-[180px]">
                <div class="text-center shrink-0">
                  <div class="text-3xl">🔦</div>
                  <div class="text-xs mt-1 text-amber-300 font-bold">مصباح كهربائي</div>
                </div>
                <div class="h-1.5 flex-1 bg-amber-400 rounded"></div>
                <div class="w-8 h-24 bg-sky-700 rounded-lg flex items-center justify-center border border-sky-400 shrink-0">
                  <div class="w-3 h-3 rounded-full bg-amber-300"></div>
                </div>
                <div class="h-1.5 flex-1 bg-amber-400 rounded"></div>
                <div class="w-8 h-24 bg-sky-700 rounded-lg flex items-center justify-center border border-sky-400 shrink-0 transition-transform duration-300 ${simCard2Shifted ? '-translate-y-7 bg-rose-800 border-rose-400' : ''}">
                  <div class="w-3 h-3 rounded-full ${simCard2Shifted ? 'bg-slate-900' : 'bg-amber-300'}"></div>
                </div>
                <div class="h-1.5 flex-1 ${simCard2Shifted ? 'bg-transparent' : 'bg-amber-400'} rounded"></div>
                <div class="w-8 h-24 bg-sky-700 rounded-lg flex items-center justify-center border border-sky-400 shrink-0">
                  <div class="w-3 h-3 rounded-full ${simCard2Shifted ? 'bg-slate-900' : 'bg-amber-300'}"></div>
                </div>
                <div class="h-1.5 flex-1 ${simCard2Shifted ? 'bg-transparent' : 'bg-amber-400'} rounded"></div>
                <div class="w-10 h-28 bg-white rounded-lg flex items-center justify-center shrink-0">
                  ${simCard2Shifted ? '<span class="text-[10px] text-slate-400 font-bold">معتم</span>' : '<div class="w-5 h-5 rounded-full bg-amber-400 shadow-[0_0_15px_#fbbf24]"></div>'}
                </div>
              </div>
            </div>
          `;
          explanation = simCard2Shifted
            ? 'عند تحريك البطاقة الوسطى لم نعد نرى ضوء المصباح على الورقة البيضاء؛ وهذا يثبت أن الضوء يسير في خطوط مستقيمة ولا ينحني حول البطاقة (ص ١٢٩).'
            : 'عندما تكون الثقوب الثلاثة على استقامة واحدة نرى بقعة الضوء على الحائل (الورقة البيضاء)؛ لأن الضوء يسير في خطوط مستقيمة (ص ١٢٩).';
        } else if (simLightMode === 'refract') {
          visualStage = `
            <div class="space-y-4">
              <div class="flex justify-center">
                <button onclick="simPencilTilted = !simPencilTilted; playTone('click'); renderActiveExperiment();" class="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-2xl text-sm shadow transition">
                  ${simPencilTilted ? '⬆️ ضع قلم الرصاص بصورة عمودية في الكأس' : '📐 ضع قلم الرصاص بصورة مائلة في الكأس'}
                </button>
              </div>
              <div class="bg-sky-50 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[200px] border border-sky-200">
                <div class="relative w-44 h-44 border-x-4 border-b-4 border-slate-400 rounded-b-3xl bg-white/60 overflow-hidden flex justify-center">
                  <div class="absolute bottom-0 inset-x-0 h-24 bg-sky-300/60 border-t-2 border-sky-500"></div>
                  <div class="w-3 h-20 bg-amber-500 rounded-t transition-transform duration-300 origin-bottom ${simPencilTilted ? 'rotate-12 -translate-x-1' : ''}" style="margin-top: 8px;"></div>
                  <div class="w-3 h-20 bg-amber-600 rounded-b transition-transform duration-300 origin-top ${simPencilTilted ? 'rotate-3 translate-x-2' : ''}" style="margin-top: 86px; position: absolute;"></div>
                </div>
              </div>
            </div>
          `;
          explanation = simPencilTilted
            ? 'نلاحظ من جانب الكأس أن قلم الرصاص يبدو وكأنه مكسور عند سطح الماء؛ لأن الضوء ينكسر (ينحرف عن مساره) عند انتقاله بشكل مائل من الماء إلى الهواء (ص ١٤١ - ١٤٢).'
            : 'عند وضع القلم بصورة عمودية يبدو مستقيماً؛ أما عند إمالته فينكسر الضوء ويبدو القلم مكسوراً (ص ١٤١).';
        } else {
          visualStage = `
            <div class="bg-slate-900 rounded-3xl p-6 text-white flex items-center justify-between gap-3 overflow-x-auto min-h-[200px]">
              <div class="text-center shrink-0">
                <div class="text-4xl">☀️</div>
                <div class="text-xs font-bold text-amber-200 mt-1">ضوء الشمس الأبيض</div>
              </div>
              <div class="h-2 w-20 bg-white rounded shadow-[0_0_12px_#fff] shrink-0"></div>
              <svg viewBox="0 0 120 110" class="w-28 h-28 shrink-0">
                <polygon points="60,10 110,100 10,100" fill="rgba(186,230,253,0.35)" stroke="#7dd3fc" stroke-width="3" />
              </svg>
              <div class="flex-1 space-y-1.5 min-w-[160px]">
                <div class="h-2.5 rounded-r-full bg-red-500 flex items-center pr-2 text-[10px] font-bold">الأحمر</div>
                <div class="h-2.5 rounded-r-full bg-orange-500 flex items-center pr-2 text-[10px] font-bold">البرتقالي</div>
                <div class="h-2.5 rounded-r-full bg-yellow-400 text-slate-900 flex items-center pr-2 text-[10px] font-bold">الأصفر</div>
                <div class="h-2.5 rounded-r-full bg-green-500 flex items-center pr-2 text-[10px] font-bold">الأخضر</div>
                <div class="h-2.5 rounded-r-full bg-blue-500 flex items-center pr-2 text-[10px] font-bold">الأزرق</div>
                <div class="h-2.5 rounded-r-full bg-indigo-600 flex items-center pr-2 text-[10px] font-bold">النيلي</div>
                <div class="h-2.5 rounded-r-full bg-purple-500 flex items-center pr-2 text-[10px] font-bold">البنفسجي</div>
              </div>
            </div>
          `;
          explanation = 'الموشور الزجاجي قطعة زجاجية شفافة تحلل ضوء الشمس الساقط عليه إلى سبعة ألوان: الأحمر، البرتقالي، الأصفر، الأخضر، الأزرق، النيلي، البنفسجي (ص ١٤٣ - ١٤٤).';
        }

        container.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-5 bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-5 space-y-4">
              <div class="flex items-center justify-between gap-2">
                <span class="bg-emerald-700 text-white text-xs font-extrabold px-3 py-1 rounded-full">📘 النص الأصلي من الكتاب (ص ١٢٩ - ١٤٤)</span>
                <button onclick="openBookPage(129)" class="text-xs font-bold bg-white border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl">افتح ص ١٢٩</button>
              </div>
              <h3 class="font-extrabold text-lg text-emerald-950">تجارب الفصل السابع: كيف ينتقل الضوء؟ (ص ١٢٩) وانكسار الضوء وتحلله (ص ١٤١ و ١٤٤)</h3>
              <div class="bg-white rounded-2xl p-4 border border-emerald-100 text-sm space-y-2 text-slate-700">
                <div class="font-bold text-emerald-800">أشياء أحتاج إليها:</div>
                <p>مصباح كهربائي يدوي، (٣) قطع كرتون مثقوبة من المنتصف، كأس زجاجية شفافة فيها ماء، قلم رصاص، موشور زجاجي، ورقة بيضاء.</p>
                <div class="font-bold text-emerald-800 pt-2">ملخص التجارب في الكتاب:</div>
                <ul class="list-disc pr-5 space-y-1">
                  <li><strong>انتقال الضوء (ص ١٢٩):</strong> وضع القطع الكرتونية الثلاث على استقامة واحدة أمام المصباح.</li>
                  <li><strong>انكسار الضوء (ص ١٤١):</strong> وضع قلم رصاص بصورة مائلة في كأس زجاجية فيها ماء وملاحظته من الجانب.</li>
                  <li><strong>تحلل الضوء (ص ١٤٤):</strong> تسليط ضوء الشمس على موشور زجاجي واستقبال الألوان السبعة على ورقة بيضاء.</li>
                </ul>
              </div>
            </div>

            <div class="lg:col-span-7 bg-white border-2 border-sky-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <span class="bg-sky-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">🖥️ محاكاة تفاعلية توضيحية</span>
                <div class="flex flex-wrap gap-1.5">
                  <button onclick="simLightMode='straight'; playTone('click'); renderActiveExperiment();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${simLightMode==='straight' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">١. انتقال الضوء (ص ١٢٩)</button>
                  <button onclick="simLightMode='refract'; playTone('click'); renderActiveExperiment();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${simLightMode==='refract' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">٢. انكسار القلم (ص ١٤١)</button>
                  <button onclick="simLightMode='prism'; playTone('click'); renderActiveExperiment();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${simLightMode==='prism' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}">٣. الموشور (ص ١٤٤)</button>
                </div>
              </div>

              ${visualStage}

              <div class="rounded-2xl p-4 bg-sky-50 border border-sky-200 text-sky-950 font-bold text-sm sm:text-base">
                <strong>الاستنتاج العلمي:</strong> ${explanation}
              </div>
            </div>
          </div>
        `;
      } else {
        const poured = simSoilState.poured;
        container.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-5 bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-5 space-y-4">
              <div class="flex items-center justify-between gap-2">
                <span class="bg-emerald-700 text-white text-xs font-extrabold px-3 py-1 rounded-full">📘 النص الأصلي من الكتاب (صفحة ١٧٩)</span>
                <button onclick="openBookPage(179)" class="text-xs font-bold bg-white border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl">افتح ص ١٧٩</button>
              </div>
              <h3 class="font-extrabold text-lg text-emerald-950">أعمل كالعلماء: كيف أقيس نفاذية التربة للماء؟ (صفحة ١٧٩)</h3>
              <div class="bg-white rounded-2xl p-4 border border-emerald-100 text-sm space-y-2 text-slate-700">
                <div class="font-bold text-emerald-800">أشياء أحتاج إليها:</div>
                <p>عينات تربة مختلفة (رملية، طينية، مزيجية)، (٣) أقماع ترشيح، ورق ترشيح، (٣) كؤوس مدرجة، ماء.</p>
                <div class="font-bold text-emerald-800 pt-2">خطوات العمل في الكتاب:</div>
                <ol class="list-decimal pr-5 space-y-1">
                  <li>أضع ورقة ترشيح في كل قمع، ثم أضع كمية متساوية من التربة الرملية والطينية والمزيجية في الأقماع الثلاثة.</li>
                  <li>أصب كمية متساوية من الماء في كل قمع في الوقت نفسه.</li>
                  <li>أقيس كمية الماء النافذ في كل كأس مدرجة بعد مرور (٥) دقائق.</li>
                </ol>
              </div>
            </div>

            <div class="lg:col-span-7 bg-white border-2 border-sky-200 rounded-3xl p-5 space-y-5 shadow-sm">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <span class="bg-sky-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">🖥️ محاكاة قياس نفاذية التربة للماء</span>
                <div class="flex gap-2">
                  <button onclick="simSoilState.poured = true; playTone('success'); renderActiveExperiment();" class="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow transition">💧 صبّ ١٠٠ مل ماء في الأقماع الثلاثة</button>
                  <button onclick="simSoilState.poured = false; playTone('click'); renderActiveExperiment();" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs">🔄 إعادة التجربة</button>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 flex flex-col items-center">
                  <div class="font-extrabold text-sm sm:text-base text-amber-900 mb-2">١. التربة الرملية</div>
                  <div class="w-24 h-16 bg-amber-300 rounded-b-3xl border-2 border-amber-500 flex items-center justify-center text-xs font-bold text-amber-950">حبيبات كبيرة</div>
                  <div class="h-6 w-1 bg-sky-400 my-1 ${poured ? 'opacity-100' : 'opacity-0'}"></div>
                  <div class="w-20 h-28 border-x-2 border-b-2 border-slate-400 rounded-b-2xl bg-white relative overflow-hidden flex items-end justify-center">
                    <div class="w-full bg-sky-400 transition-all duration-700" style="height: ${poured ? '82%' : '0%'}"></div>
                    <span class="absolute bottom-1 text-xs font-extrabold text-slate-900">${poured ? '٨٢ مل' : '٠ مل'}</span>
                  </div>
                  <span class="text-xs font-bold text-amber-800 mt-2">نفاذية عالية جداً</span>
                </div>

                <div class="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 flex flex-col items-center">
                  <div class="font-extrabold text-sm sm:text-base text-emerald-900 mb-2">٢. التربة المزيجية</div>
                  <div class="w-24 h-16 bg-amber-700 rounded-b-3xl border-2 border-amber-900 flex items-center justify-center text-xs font-bold text-white">رمل + طين + دبال</div>
                  <div class="h-6 w-1 bg-sky-400 my-1 ${poured ? 'opacity-100' : 'opacity-0'}"></div>
                  <div class="w-20 h-28 border-x-2 border-b-2 border-slate-400 rounded-b-2xl bg-white relative overflow-hidden flex items-end justify-center">
                    <div class="w-full bg-sky-400 transition-all duration-700" style="height: ${poured ? '48%' : '0%'}"></div>
                    <span class="absolute bottom-1 text-xs font-extrabold text-slate-900">${poured ? '٤٨ مل' : '٠ مل'}</span>
                  </div>
                  <span class="text-xs font-bold text-emerald-800 mt-2">نفاذية متوسطة (الأفضل)</span>
                </div>

                <div class="bg-orange-50/70 border border-orange-200 rounded-3xl p-4 flex flex-col items-center">
                  <div class="font-extrabold text-sm sm:text-base text-orange-950 mb-2">٣. التربة الطينية</div>
                  <div class="w-24 h-16 bg-orange-800 rounded-b-3xl border-2 border-orange-950 flex items-center justify-center text-xs font-bold text-white">حبيبات متراصة</div>
                  <div class="h-6 w-1 bg-sky-400 my-1 ${poured ? 'opacity-100' : 'opacity-0'}"></div>
                  <div class="w-20 h-28 border-x-2 border-b-2 border-slate-400 rounded-b-2xl bg-white relative overflow-hidden flex items-end justify-center">
                    <div class="w-full bg-sky-400 transition-all duration-700" style="height: ${poured ? '15%' : '0%'}"></div>
                    <span class="absolute bottom-1 text-xs font-extrabold text-slate-900">${poured ? '١٥ مل' : '٠ مل'}</span>
                  </div>
                  <span class="text-xs font-bold text-orange-900 mt-2">نفاذية بطيئة جداً</span>
                </div>
              </div>

              <div class="rounded-2xl p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-sm sm:text-base">
                <strong>الاستنتاج العلمي (صفحة ١٧٦ - ١٧٩):</strong> التربة الرملية تسمح بمرور الماء بسرعة ولا تحتفظ به، والتربة الطينية تحتفظ بالماء بكثرة فتتعفن جذور النباتات، أما <strong>التربة المزيجية</strong> فتحتفظ بالماء بدرجة مناسبة لذا هي أفضل أنواع الترب للزراعة.
              </div>
            </div>
          </div>
        `;
      }
    }

    // =========================================================================
    // 12. STUDENT NOTES SECTION (Auto-Saved in localStorage)
    // =========================================================================
    function openNoteForCurrentPage() {
      playTone('click');
      const currentPg = appState.currentPage || 1;
      const lessonTitle = getLessonTitleForPage(currentPg);

      let matchedUnit = 'عام';
      for (const u of TEXTBOOK_UNITS) {
        if (currentPg >= u.startPage && currentPg <= u.endPage) {
          matchedUnit = u.title;
          break;
        }
      }

      navigateTo('notes');
      resetNoteForm();
      document.getElementById('noteTitleInput').value = `ملاحظة حول: ${lessonTitle}`;
      document.getElementById('noteUnitSelect').value = matchedUnit;
      document.getElementById('notePageInput').value = currentPg;
      document.getElementById('noteBodyInput').focus();
    }

    function saveStudentNote() {
      const editId = document.getElementById('editingNoteId').value;
      const title = document.getElementById('noteTitleInput').value.trim();
      const unit = document.getElementById('noteUnitSelect').value;
      const pageVal = parseInt(document.getElementById('notePageInput').value, 10);
      const body = document.getElementById('noteBodyInput').value.trim();

      if (!title || !body) {
        playTone('error');
        showCustomModal({
          icon: '✍️',
          title: 'يرجى إكمال الحقول',
          body: 'اكتب عنوان الملاحظة ونص الملاحظة ثم اضغط على «حفظ الملاحظة».'
        });
        return;
      }

      const validPage = (!isNaN(pageVal) && pageVal >= 1 && pageVal <= 196) ? pageVal : null;
      const nowStr = new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });

      if (editId) {
        const idx = appState.notes.findIndex(n => n.id === editId);
        if (idx !== -1) {
          appState.notes[idx] = {
            ...appState.notes[idx],
            title,
            unit,
            page: validPage,
            body,
            updatedAt: nowStr
          };
        }
      } else {
        appState.notes.unshift({
          id: 'note_' + Date.now(),
          title,
          unit,
          page: validPage,
          body,
          updatedAt: nowStr
        });
        awardStars(1);
      }

      saveStateToStorage();
      updateResumeBanner();
      resetNoteForm();
      renderStudentNotes();
      playTone('success');
    }

    function resetNoteForm() {
      document.getElementById('editingNoteId').value = '';
      document.getElementById('noteTitleInput').value = '';
      document.getElementById('noteUnitSelect').value = 'عام';
      document.getElementById('notePageInput').value = '';
      document.getElementById('noteBodyInput').value = '';
      document.getElementById('noteFormHeading').innerHTML = '<span>✍️</span><span>إضافة ملاحظة جديدة</span>';
      document.getElementById('cancelEditNoteBtn').classList.add('hidden');
    }

    function editStudentNote(noteId) {
      playTone('click');
      const note = appState.notes.find(n => n.id === noteId);
      if (!note) return;
      document.getElementById('editingNoteId').value = note.id;
      document.getElementById('noteTitleInput').value = note.title;
      document.getElementById('noteUnitSelect').value = note.unit || 'عام';
      document.getElementById('notePageInput').value = note.page || '';
      document.getElementById('noteBodyInput').value = note.body;
      document.getElementById('noteFormHeading').innerHTML = '<span>✏️</span><span>تعديل الملاحظة</span>';
      document.getElementById('cancelEditNoteBtn').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteStudentNote(noteId) {
      playTone('click');
      showCustomModal({
        icon: '🗑️',
        title: 'حذف الملاحظة',
        body: 'هل أنت متأكد من حذف هذه الملاحظة من دفترك؟',
        onConfirm: () => {
          appState.notes = appState.notes.filter(n => n.id !== noteId);
          saveStateToStorage();
          updateResumeBanner();
          renderStudentNotes();
        }
      });
    }

    function renderStudentNotes() {
      const listEl = document.getElementById('studentNotesList');
      const countEl = document.getElementById('notesCountLabel');
      const filterVal = document.getElementById('notesFilterSelect') ? document.getElementById('notesFilterSelect').value : 'all';

      if (!listEl) return;
      const filtered = filterVal === 'all'
        ? appState.notes
        : appState.notes.filter(n => n.unit === filterVal);

      if (countEl) countEl.textContent = filtered.length;

      if (filtered.length === 0) {
        listEl.innerHTML = `
          <div class="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center space-y-2">
            <div class="text-4xl">📒</div>
            <h4 class="font-extrabold text-slate-800 text-base">لا توجد ملاحظات محفوظة بعد</h4>
            <p class="text-xs sm:text-sm text-slate-500">اكتب أول ملاحظة لك من النموذج المجاور، أو اضغط على زر «دوّن ملاحظة للصفحة» أثناء قراءة الكتاب.</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = filtered.map(n => `
        <article class="bg-white rounded-3xl border-2 border-teal-100 p-5 shadow-2xs space-y-2.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full">${n.unit}</span>
              ${n.page ? `
                <button onclick="openBookPage(${n.page})" class="no-print text-xs font-extrabold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3 py-1 rounded-full transition">
                  📖 صفحة ${n.page}
                </button>
              ` : ''}
            </div>
            <span class="text-xs text-slate-400 font-medium">${n.updatedAt || ''}</span>
          </div>

          <h4 class="font-extrabold text-lg text-slate-900">${escapeHtml(n.title)}</h4>
          <p class="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(n.body)}</p>

          <div class="flex items-center gap-2 pt-2 border-t border-slate-100 no-print">
            <button onclick="editStudentNote('${n.id}')" class="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl transition">✏️ تعديل</button>
            <button onclick="deleteStudentNote('${n.id}')" class="text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl transition">🗑️ حذف</button>
          </div>
        </article>
      `).join('');
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // =========================================================================
    // 13. STUDENT PROGRESS EXAMS TABLE & BADGES
    // =========================================================================
    function renderProgressExamsTable() {
      const tbody = document.getElementById('progressExamsTableBody');
      if (!tbody) return;

      tbody.innerHTML = CHAPTER_FINAL_EXAMS.map(ex => {
        const rec = appState.chapterExams[ex.chapterId];
        const done = rec && rec.submitted;
        return `
          <tr class="hover:bg-slate-50">
            <td class="py-3 px-4 font-bold text-slate-900">${ex.chapterTitle}</td>
            <td class="py-3 px-4 text-slate-600">ص ${ex.reviewPage}</td>
            <td class="py-3 px-4 font-extrabold ${done ? 'text-emerald-700' : 'text-slate-400'}">
              ${done ? `${rec.bestScore} / ${ex.questions.length}` : '—'}
            </td>
            <td class="py-3 px-4">
              ${done
                ? `<span class="inline-block text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">مكتمل ✅</span>`
                : `<span class="inline-block text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">بانتظار الاختبار</span>`
              }
            </td>
            <td class="py-3 px-4 no-print">
              <button onclick="navigateTo('exams'); selectExamChapter(${ex.chapterId});" class="text-xs font-extrabold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-xl transition">
                ${done ? 'إعادة / عرض الإجابات' : 'ابدأ الاختبار'}
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function renderBadges() {
      const completedExamsCount = Object.values(appState.chapterExams).filter(e => e && e.submitted).length;
      const badges = [
        {
          icon: '📖',
          title: 'قارئ الكتاب المثابر',
          desc: 'تصفح ١٠ صفحات أو أكثر من الكتاب المدرسي الأصلي.',
          unlocked: appState.visitedPages.size >= 10
        },
        {
          icon: '🎮',
          title: 'بطل الألعاب العلمية',
          desc: 'الفوز في لعبتين تعليميتين أو أكثر.',
          unlocked: appState.completedGames.size >= 2
        },
        {
          icon: '🌿',
          title: 'صديق النباتات والحيوانات',
          desc: 'إكمال نشاط تصنيف الحيوانات أو مخطط البناء الضوئي.',
          unlocked: appState.completedActivities.has('act_animals_sort') || appState.completedActivities.has('act_plant_parts')
        },
        {
          icon: '🧪',
          title: 'المستكشف الصغير',
          desc: 'تجربة محاكاة التجارب العملية للكتاب (أستكشف وأعمل كالعلماء).',
          unlocked: appState.triedExperiments.size >= 2
        },
        {
          icon: '🎓',
          title: 'المتفوق في اختبارات الفصول',
          desc: 'إتمام ٣ اختبارات ختامية للفصول بنجاح.',
          unlocked: completedExamsCount >= 3
        },
        {
          icon: '📝',
          title: 'مدوّن الملاحظات الذكي',
          desc: 'كتابة ملاحظتين علميتين أو أكثر في دفتر الملاحظات.',
          unlocked: appState.notes.length >= 2
        }
      ];

      document.getElementById('badgesGrid').innerHTML = badges.map(b => `
        <div class="rounded-3xl border-2 p-4 flex items-center gap-4 ${b.unlocked ? 'bg-gradient-to-l from-amber-50 to-emerald-50 border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'}">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${b.unlocked ? 'bg-amber-200/70' : 'bg-slate-200'}">
            ${b.unlocked ? b.icon : '🔒'}
          </div>
          <div>
            <div class="font-extrabold text-base text-slate-900">${b.title}</div>
            <p class="text-xs text-slate-600 mt-0.5">${b.desc}</p>
            <span class="inline-block mt-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${b.unlocked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}">
              ${b.unlocked ? 'مكتسب ✅' : 'مقفل'}
            </span>
          </div>
        </div>
      `).join('');
    }

    // =========================================================================
    // 14. INITIALIZATION ON PAGE LOAD + KEYBOARD SUPPORT FOR GAMES
    // =========================================================================
    window.addEventListener('keydown', (e) => {
      if (appState.currentSection === 'games' && appState.activeGameIndex === 0) {
        if (e.key === 'ArrowLeft') moveCatcherBy(-45);
        else if (e.key === 'ArrowRight') moveCatcherBy(45);
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      loadStateFromStorage();
      renderHomeUnits();
      renderTocList();
      selectActivity(0);
      renderQuestions();
      renderChapterExamsGrid();
      renderActiveChapterExam();
      selectExperiment(0);
      renderStudentNotes();
      goToPage(appState.currentPage || 1);
      updateProgressUI();
      initPdfAutoLoad();
    });
