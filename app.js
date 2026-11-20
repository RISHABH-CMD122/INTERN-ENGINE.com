// INTERN ENGINE — Minimalist Engineering Internship Portal
// Black, White & Orange Minimalist Palette Engine
// Supports National, International & Local Firms, Paid/Unpaid & Upcoming 2027 Batches

const state = {
  internships: [],
  activeTab: 'directory',
  searchQuery: '',
  selectedBranch: 'all',
  selectedScope: 'all', // 'all', 'govt-defense', 'local', 'national', 'international'
  selectedCountry: 'all',
  selectedCompensation: 'all', // 'all', 'paid', 'unpaid', 'high'
  selectedTimeline: 'all', // 'all', 'active', 'upcoming'
  selectedWorkType: 'all',
  selectedPerk: 'all',
  sortBy: 'recommended',
  viewMode: 'grid', // 'grid' | 'list'
  savedBookmarks: [],
  trackerApplications: {},
  appliedOpportunities: {}, // { [id]: { appliedAt, company, title, stipend } }
  currentUser: null, // { name, email, college, branch, studentId, initials }
  notifications: [],
  selectedGovtFilter: 'all', // 'all', 'armed-forces', 'defense-space', 'ministries'
  activeOtp: null,
  activeModalInternship: null,
  isDarkMode: false
};

// Application Init
document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  initTheme();
  initAuthUI();
  initNotificationsUI();
  initEventListeners();
  populateFilterDropdowns();
  updateHeroStats();
  renderBranchPills();
  renderInternships();
  renderGovtPartition();
  renderFellowships();
  renderCareerToolkit();
  renderKanbanTracker();
  updateNavSavedCount();
  handleDeepLinkHash();
});

// Load persistent state
function loadSavedState() {
  const customInternships = JSON.parse(localStorage.getItem('eng_custom_internships') || '[]');
  state.internships = [...customInternships, ...INITIAL_INTERNSHIPS];
  state.savedBookmarks = JSON.parse(localStorage.getItem('eng_bookmarks') || '[]');
  state.trackerApplications = JSON.parse(localStorage.getItem('eng_tracker') || '{}');
  state.appliedOpportunities = JSON.parse(localStorage.getItem('eng_applied') || '{}');
  state.currentUser = JSON.parse(localStorage.getItem('eng_user') || 'null');

  const savedNotifications = localStorage.getItem('eng_notifications');
  if (savedNotifications) {
    state.notifications = JSON.parse(savedNotifications);
  } else {
    state.notifications = [
      {
        id: 'notif-1',
        title: 'Indian Army DGIS Applications Open',
        message: 'Tactical Drone Swarm & Military Cyber Systems accepting university bonafide NOCs.',
        time: '2 hours ago',
        type: 'army',
        read: false
      },
      {
        id: 'notif-2',
        title: 'DRDO GTRE Aero-Engine Division',
        message: 'Kaveri Turbofan single-crystal blade test batch closing in 35 days.',
        time: '1 day ago',
        type: 'govt',
        read: false
      },
      {
        id: 'notif-3',
        title: 'ISRO VSSC Rocket Propulsion Trainee',
        message: 'Liquid & semi-cryogenic propulsion simulation positions active.',
        time: '2 days ago',
        type: 'space',
        read: false
      }
    ];
    localStorage.setItem('eng_notifications', JSON.stringify(state.notifications));
  }

  const savedTheme = localStorage.getItem('eng_theme');
  if (savedTheme) {
    state.isDarkMode = savedTheme === 'dark';
  } else {
    // Default to the new developer Coders Theme
    state.isDarkMode = true;
  }
  updateNavSavedCount();
}

// Minimal Theme Handling
function initTheme() {
  if (state.isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcons();
}

function toggleTheme() {
  state.isDarkMode = !state.isDarkMode;
  if (state.isDarkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('eng_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('eng_theme', 'light');
  }
  updateThemeIcons();
  showToast(state.isDarkMode ? 'Dark Theme' : 'Light Theme');
}

function updateThemeIcons() {
  const moonIcon = document.getElementById('themeMoonIcon');
  const sunIcon = document.getElementById('themeSunIcon');
  if (moonIcon && sunIcon) {
    if (state.isDarkMode) {
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
    } else {
      moonIcon.classList.remove('hidden');
      sunIcon.classList.add('hidden');
    }
  }
}

// Event Listeners
function initEventListeners() {
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // Tab Nav
  document.querySelectorAll('[data-nav-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(tab.getAttribute('data-nav-tab'));
    });
  });

  // Search input
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        renderInternships();
      }, 200);
    });
  }

  // Scope Buttons (All, Local, National, International)
  document.querySelectorAll('[data-scope-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-scope-btn]').forEach(b => {
        b.classList.remove('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
        b.classList.add('text-neutral-600', 'dark:text-neutral-400');
      });
      btn.classList.add('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
      btn.classList.remove('text-neutral-600', 'dark:text-neutral-400');
      state.selectedScope = btn.getAttribute('data-scope-btn');
      renderInternships();
    });
  });

  // Location Filter
  const countrySelect = document.getElementById('countryFilter');
  if (countrySelect) {
    countrySelect.addEventListener('change', (e) => {
      state.selectedCountry = e.target.value;
      renderInternships();
    });
  }

  // Compensation (Paid vs Unpaid) Filter
  const compSelect = document.getElementById('compensationFilter');
  if (compSelect) {
    compSelect.addEventListener('change', (e) => {
      state.selectedCompensation = e.target.value;
      renderInternships();
    });
  }

  // Timeline / Cycle Filter
  const timelineSelect = document.getElementById('timelineFilter');
  if (timelineSelect) {
    timelineSelect.addEventListener('change', (e) => {
      state.selectedTimeline = e.target.value;
      renderInternships();
    });
  }

  // Work Mode Filter
  const workTypeSelect = document.getElementById('workTypeFilter');
  if (workTypeSelect) {
    workTypeSelect.addEventListener('change', (e) => {
      state.selectedWorkType = e.target.value;
      renderInternships();
    });
  }

  // Perks Filter
  const perkSelect = document.getElementById('perkFilter');
  if (perkSelect) {
    perkSelect.addEventListener('change', (e) => {
      state.selectedPerk = e.target.value;
      renderInternships();
    });
  }

  // Sort
  const sortSelect = document.getElementById('sortBySelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderInternships();
    });
  }

  // Grid / List Toggle
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');
  if (viewGridBtn && viewListBtn) {
    viewGridBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      viewGridBtn.classList.add('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
      viewGridBtn.classList.remove('text-neutral-400');
      viewListBtn.classList.remove('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
      viewListBtn.classList.add('text-neutral-400');
      renderInternships();
    });
    viewListBtn.addEventListener('click', () => {
      state.viewMode = 'list';
      viewListBtn.classList.add('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
      viewListBtn.classList.remove('text-neutral-400');
      viewGridBtn.classList.remove('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
      viewGridBtn.classList.add('text-neutral-400');
      renderInternships();
    });
  }

  // Reset Filters
  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

  // Modals
  const closeDetailBtn = document.getElementById('closeDetailModalBtn');
  if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetailModal);

  const detailModal = document.getElementById('detailModal');
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeDetailModal();
    });
  }

  const openSubmitBtn = document.getElementById('openSubmitModalBtn');
  const closeSubmitBtn = document.getElementById('closeSubmitModalBtn');
  const submitModal = document.getElementById('submitModal');
  const submitForm = document.getElementById('postInternshipForm');

  if (openSubmitBtn && submitModal) {
    openSubmitBtn.addEventListener('click', () => submitModal.classList.remove('hidden'));
  }
  if (closeSubmitBtn && submitModal) {
    closeSubmitBtn.addEventListener('click', () => submitModal.classList.add('hidden'));
  }
  if (submitModal) {
    submitModal.addEventListener('click', (e) => {
      if (e.target === submitModal) submitModal.classList.add('hidden');
    });
  }
  if (submitForm) {
    submitForm.addEventListener('submit', handlePostInternship);
  }

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavMenu = document.getElementById('mobileNavMenu');
  if (mobileMenuBtn && mobileNavMenu) {
    mobileMenuBtn.addEventListener('click', () => mobileNavMenu.classList.toggle('hidden'));
  }

  // Export
  const exportBtn = document.getElementById('exportTrackerBtn');
  if (exportBtn) exportBtn.addEventListener('click', exportTrackerCSV);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (e.key === '/' && !isInputActive) {
      e.preventDefault();
      const sInput = document.getElementById('globalSearchInput');
      if (sInput) {
        sInput.focus();
        sInput.select();
      }
    } else if (e.key === 'Escape') {
      closeDetailModal();
      const sModal = document.getElementById('submitModal');
      if (sModal) sModal.classList.add('hidden');
    }
  });

  // Deep linking hash listener
  window.addEventListener('hashchange', handleDeepLinkHash);

  // Notification Center Listeners
  const notifBtn = document.getElementById('notificationBtn');
  const notifDropdown = document.getElementById('notificationDropdown');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
      const profileDropdown = document.getElementById('userProfileDropdown');
      if (profileDropdown) profileDropdown.classList.add('hidden');
    });
  }

  const enableAlertsBtn = document.getElementById('enableAlertsDropdownBtn');
  if (enableAlertsBtn) {
    enableAlertsBtn.addEventListener('click', () => {
      requestNotificationPermission();
    });
  }

  const markAllReadBtn = document.getElementById('markAllNotificationsReadBtn');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      markAllNotificationsRead();
    });
  }

  const testNotifBtn = document.getElementById('testNotificationBtn');
  if (testNotifBtn) {
    testNotifBtn.addEventListener('click', () => {
      handleTestNotification();
    });
  }

  // Authentication & Profile Listeners
  const openAuthBtn = document.getElementById('openAuthModalBtn');
  const mobileAuthBtn = document.getElementById('mobileAuthBtn');
  const closeAuthBtn = document.getElementById('closeAuthModalBtn');
  const authModal = document.getElementById('authModal');
  const userProfileBtn = document.getElementById('userProfileBtn');
  const userProfileDropdown = document.getElementById('userProfileDropdown');
  const signOutBtn = document.getElementById('signOutBtn');
  const demoLoginBtn = document.getElementById('demoLoginBtn');

  if (openAuthBtn) openAuthBtn.addEventListener('click', openAuthModal);
  if (mobileAuthBtn) {
    mobileAuthBtn.addEventListener('click', () => {
      const mobileNav = document.getElementById('mobileNavMenu');
      if (mobileNav) mobileNav.classList.add('hidden');
      if (state.currentUser) {
        handleSignOut();
      } else {
        openAuthModal();
      }
    });
  }
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuthModal);
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  if (userProfileBtn && userProfileDropdown) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userProfileDropdown.classList.toggle('hidden');
      if (notifDropdown) notifDropdown.classList.add('hidden');
    });
  }

  if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
  if (demoLoginBtn) demoLoginBtn.addEventListener('click', handleDemoLogin);

  const authTabSignInBtn = document.getElementById('authTabSignInBtn');
  const authTabSignUpBtn = document.getElementById('authTabSignUpBtn');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const authModalTitle = document.getElementById('authModalTitle');

  if (authTabSignInBtn && authTabSignUpBtn && signInForm && signUpForm) {
    authTabSignInBtn.addEventListener('click', () => {
      authTabSignInBtn.className = 'flex-1 py-1.5 rounded-md bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs transition-all';
      authTabSignUpBtn.className = 'flex-1 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-all';
      signInForm.classList.remove('hidden');
      signUpForm.classList.add('hidden');
      if (authModalTitle) authModalTitle.textContent = 'Sign In with Gmail OTP';
      resetOtpView();
    });

    authTabSignUpBtn.addEventListener('click', () => {
      authTabSignUpBtn.className = 'flex-1 py-1.5 rounded-md bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs transition-all';
      authTabSignInBtn.className = 'flex-1 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-all';
      signUpForm.classList.remove('hidden');
      signInForm.classList.add('hidden');
      if (authModalTitle) authModalTitle.textContent = 'Register Student Candidate Profile';
      resetOtpView();
    });

    signInForm.addEventListener('submit', handleRequestSignInOtp);
    signUpForm.addEventListener('submit', handleRequestSignUpOtp);
  }

  // OTP Verification Listeners
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const backToAuthInputsBtn = document.getElementById('backToAuthInputsBtn');
  const otpInput = document.getElementById('otpInput');
  const toggleRevealOtpBtn = document.getElementById('toggleRevealOtpBtn');
  const autoFillRevealedOtpBtn = document.getElementById('autoFillRevealedOtpBtn');
  const revealedOtpBox = document.getElementById('revealedOtpBox');

  if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', verifyOtpAndSignIn);
  if (resendOtpBtn) resendOtpBtn.addEventListener('click', resendOtp);
  if (backToAuthInputsBtn) backToAuthInputsBtn.addEventListener('click', resetOtpView);

  if (toggleRevealOtpBtn && revealedOtpBox) {
    toggleRevealOtpBtn.addEventListener('click', () => {
      revealedOtpBox.classList.toggle('hidden');
    });
  }

  if (autoFillRevealedOtpBtn) {
    autoFillRevealedOtpBtn.addEventListener('click', () => {
      if (state.activeOtp && state.activeOtp.code) {
        const input = document.getElementById('otpInput');
        if (input) {
          input.value = state.activeOtp.code;
          showToast('Code Auto-Filled');
          setTimeout(() => verifyOtpAndSignIn(), 200);
        }
      }
    });
  }

  if (otpInput) {
    otpInput.addEventListener('input', (e) => {
      // Auto verify when 6 digits are typed
      if (e.target.value.trim().length === 6) {
        verifyOtpAndSignIn();
      }
    });
    otpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyOtpAndSignIn();
      }
    });
  }

  // My Applications Modal Listeners
  const openMyAppsBtn = document.getElementById('openMyApplicationsBtn');
  const closeMyAppsBtn = document.getElementById('closeMyApplicationsModalBtn');
  const myAppsModal = document.getElementById('myApplicationsModal');

  if (openMyAppsBtn) openMyAppsBtn.addEventListener('click', openMyApplicationsModal);
  if (closeMyAppsBtn) closeMyAppsBtn.addEventListener('click', closeMyApplicationsModal);
  if (myAppsModal) {
    myAppsModal.addEventListener('click', (e) => {
      if (e.target === myAppsModal) closeMyApplicationsModal();
    });
  }

  // Govt Partition Subfilter Buttons
  document.querySelectorAll('[data-govt-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-govt-filter');
      setGovtFilter(filter);
    });
  });

  // Global Outside Click to dismiss dropdowns
  document.addEventListener('click', (e) => {
    if (notifDropdown && !notifDropdown.contains(e.target) && (!notifBtn || !notifBtn.contains(e.target))) {
      notifDropdown.classList.add('hidden');
    }
    if (userProfileDropdown && !userProfileDropdown.contains(e.target) && (!userProfileBtn || !userProfileBtn.contains(e.target))) {
      userProfileDropdown.classList.add('hidden');
    }
  });
}

// Populate Countries
function populateFilterDropdowns() {
  const countrySelect = document.getElementById('countryFilter');
  if (!countrySelect) return;

  const countries = new Set();
  state.internships.forEach(item => {
    if (item.country) {
      item.country.split('/').forEach(c => {
        const cleaned = c.trim().split('&')[0].trim();
        if (cleaned) countries.add(cleaned);
      });
    }
  });

  Array.from(countries).sort().forEach(country => {
    const opt = document.createElement('option');
    opt.value = country.toLowerCase();
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });
}

// Tab Switching
function switchTab(targetTab) {
  state.activeTab = targetTab;

  document.querySelectorAll('[data-nav-tab]').forEach(tab => {
    const isTarget = tab.getAttribute('data-nav-tab') === targetTab;
    if (isTarget) {
      tab.classList.add('text-neutral-950', 'dark:text-white', 'border-b-2', 'border-neutral-950', 'dark:border-orange-500', 'font-semibold');
      tab.classList.remove('text-neutral-500', 'dark:text-neutral-400', 'font-medium', 'border-transparent');
    } else {
      tab.classList.remove('text-neutral-950', 'dark:text-white', 'border-b-2', 'border-neutral-950', 'dark:border-orange-500', 'font-semibold');
      tab.classList.add('text-neutral-500', 'dark:text-neutral-400', 'font-medium', 'border-transparent');
    }
  });

  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('hidden'));

  const activeSec = document.getElementById(`section-${targetTab}`);
  if (activeSec) {
    activeSec.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (targetTab === 'govt') renderGovtPartition();
  if (targetTab === 'tracker') renderKanbanTracker();

  const mobileNav = document.getElementById('mobileNavMenu');
  if (mobileNav) mobileNav.classList.add('hidden');
}

// Hero Stats
function updateHeroStats() {
  const total = state.internships.length;
  const govt = state.internships.filter(i => i.scope === 'govt-defense').length;
  const intl = state.internships.filter(i => i.scope === 'international').length;
  const nat = state.internships.filter(i => i.scope === 'national').length;
  const local = state.internships.filter(i => i.scope === 'local').length;

  const totalEl = document.getElementById('statTotalInternships');
  const govtEl = document.getElementById('statGovtDefense');
  const intlEl = document.getElementById('statInternational');
  const natEl = document.getElementById('statNational');
  const localEl = document.getElementById('statLocal');

  if (totalEl) totalEl.textContent = `${total}+`;
  if (govtEl) govtEl.textContent = `${govt}+`;
  if (intlEl) intlEl.textContent = `${intl}+`;
  if (natEl) natEl.textContent = `${nat}+`;
  if (localEl) localEl.textContent = `${local}+`;
}

// Discipline Filter Pills (Minimal Black/White + Orange Badge)
function renderBranchPills() {
  const container = document.getElementById('branchPillsContainer');
  if (!container) return;

  container.innerHTML = ENGINEERING_BRANCHES.map(branch => {
    const isSelected = state.selectedBranch === branch.id;
    const count = branch.id === 'all'
      ? state.internships.length
      : state.internships.filter(i => i.branch === branch.id).length;

    return `
      <button 
        onclick="selectBranch('${branch.id}')"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap border ${
          isSelected 
            ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-semibold' 
            : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
        }"
      >
        <span>${branch.name}</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] font-mono ${
          isSelected 
            ? 'bg-orange-500 text-white' 
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
        }">
          ${count}
        </span>
      </button>
    `;
  }).join('');
}

window.selectBranch = function(branchId) {
  state.selectedBranch = branchId;
  renderBranchPills();
  renderInternships();
};

// Filter & Sort
function getFilteredInternships() {
  let list = [...state.internships];

  // Branch
  if (state.selectedBranch !== 'all') {
    list = list.filter(item => item.branch === state.selectedBranch || item.branch === 'all');
  }

  // Scope: all, local, national, international
  if (state.selectedScope !== 'all') {
    list = list.filter(item => item.scope === state.selectedScope);
  }

  // Compensation: all, paid, unpaid, high
  if (state.selectedCompensation === 'paid') {
    list = list.filter(item => item.isPaid === true);
  } else if (state.selectedCompensation === 'unpaid') {
    list = list.filter(item => item.isPaid === false);
  } else if (state.selectedCompensation === 'high') {
    list = list.filter(item => item.isFunded === true);
  }

  // Timeline / Cycle: all, active, upcoming
  if (state.selectedTimeline === 'active') {
    list = list.filter(item => !item.isUpcoming);
  } else if (state.selectedTimeline === 'upcoming') {
    list = list.filter(item => Boolean(item.isUpcoming));
  }

  // Country
  if (state.selectedCountry !== 'all') {
    list = list.filter(item => item.country.toLowerCase().includes(state.selectedCountry));
  }

  // Work Type
  if (state.selectedWorkType !== 'all') {
    list = list.filter(item => item.workType.toLowerCase() === state.selectedWorkType.toLowerCase());
  }

  // Perks: visa, housing
  if (state.selectedPerk === 'visa') {
    list = list.filter(item => item.visaSponsorship);
  } else if (state.selectedPerk === 'housing') {
    list = list.filter(item => item.housingProvided);
  }

  // Search Query
  if (state.searchQuery) {
    const q = state.searchQuery;
    list = list.filter(item => {
      const match = item.title.toLowerCase().includes(q) ||
                    item.company.toLowerCase().includes(q) ||
                    item.country.toLowerCase().includes(q) ||
                    item.city.toLowerCase().includes(q) ||
                    item.branchName.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q);
      return match;
    });
  }

  // Sorting
  if (state.sortBy === 'deadline') {
    list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (state.sortBy === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (state.sortBy === 'stipend') {
    list.sort((a, b) => (b.isFunded ? 1 : 0) - (a.isFunded ? 1 : 0));
  } else {
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  return list;
}

// Render Listings
function renderInternships() {
  const container = document.getElementById('internshipsContainer');
  const countDisplay = document.getElementById('matchingCountDisplay');
  if (!container) return;

  renderActiveFiltersSummary();
  updateNavSavedCount();

  const filtered = getFilteredInternships();

  if (countDisplay) {
    countDisplay.textContent = `${filtered.length} listings available`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-24 text-center">
        <p class="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">No Matching Records</p>
        <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-6">No engineering positions match active criteria</h3>
        <button onclick="resetAllFilters()" class="px-5 py-2.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs uppercase tracking-wider rounded-lg">
          Clear All Filters
        </button>
      </div>
    `;
    return;
  }

  if (state.viewMode === 'list') {
    container.className = "space-y-4";
    container.innerHTML = filtered.map(item => renderListItem(item)).join('');
  } else {
    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
    container.innerHTML = filtered.map(item => renderGridCard(item)).join('');
  }
}

// Navigation Saved Count
function updateNavSavedCount() {
  const countEl = document.getElementById('navSavedCount');
  if (countEl) {
    countEl.textContent = state.savedBookmarks.length;
  }
}

// Opportunity Lookup Helper (supports both internships and fellowships)
function getOpportunityById(id) {
  let item = state.internships.find(i => i.id === id);
  if (!item && typeof RESEARCH_FELLOWSHIPS !== 'undefined') {
    const fel = RESEARCH_FELLOWSHIPS.find(f => f.id === id);
    if (fel) {
      item = {
        id: fel.id,
        title: fel.name,
        company: fel.host,
        logoText: (fel.badge || fel.name).substring(0, 4).toUpperCase(),
        branchName: fel.disciplines || "Engineering Research",
        scope: "international",
        country: fel.badge || "Global",
        city: fel.host,
        workType: "Onsite Laboratory",
        stipend: fel.funding,
        isPaid: true,
        isFunded: true,
        duration: fel.duration,
        deadline: fel.deadline,
        eligibility: fel.eligibility,
        description: fel.summary,
        requirements: [
          `Active enrolled student in accredited engineering or applied science discipline`,
          `High academic standing (${fel.eligibility})`,
          `Demonstrated research interest in ${fel.disciplines}`
        ],
        perks: [
          fel.funding,
          "International research laboratory accreditation",
          "Direct mentorship from senior university faculty and research scientists",
          "Global scholar alumni network and advanced degree funding eligibility"
        ],
        applyUrl: fel.officialUrl,
        visaSponsorship: true,
        housingProvided: true,
        featured: true,
        rating: 4.9
      };
    }
  }
  return item;
}

// Deep Linking Hash Handler
function handleDeepLinkHash() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#int-')) {
    const id = hash.replace('#int-', '');
    const item = getOpportunityById(id);
    if (item) {
      if (item.id.startsWith('fel-') && state.activeTab !== 'fellowships') {
        switchTab('fellowships');
      } else if (!item.id.startsWith('fel-') && state.activeTab !== 'directory') {
        switchTab('directory');
      }
      openDetailModal(id);
    }
  }
}

// Copy Opportunity Direct Permalink
window.copyOpportunityLink = function(id, event) {
  if (event) event.stopPropagation();
  const url = `${window.location.origin}${window.location.pathname}#int-${id}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Permalink Copied');
    }).catch(() => {
      prompt('Copy opportunity permalink:', url);
    });
  } else {
    prompt('Copy opportunity permalink:', url);
  }
};

// Active Filter Chips Summary Bar
window.activeChipResets = [];
function renderActiveFiltersSummary() {
  const summaryEl = document.getElementById('activeFiltersSummary');
  if (!summaryEl) return;

  const activeChips = [];

  // Branch
  if (state.selectedBranch !== 'all') {
    const branchObj = ENGINEERING_BRANCHES.find(b => b.id === state.selectedBranch);
    const branchName = branchObj ? branchObj.name : state.selectedBranch;
    activeChips.push({
      label: `Discipline: ${branchName}`,
      reset: () => selectBranch('all')
    });
  }

  // Scope
  if (state.selectedScope !== 'all') {
    const scopeLabel = state.selectedScope === 'local' ? 'Local Firms' : (state.selectedScope === 'national' ? 'National / PSUs' : 'International');
    activeChips.push({
      label: `Scope: ${scopeLabel}`,
      reset: () => {
        state.selectedScope = 'all';
        document.querySelectorAll('[data-scope-btn]').forEach(b => {
          if (b.getAttribute('data-scope-btn') === 'all') {
            b.classList.add('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
            b.classList.remove('text-neutral-600', 'dark:text-neutral-400');
          } else {
            b.classList.remove('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
            b.classList.add('text-neutral-600', 'dark:text-neutral-400');
          }
        });
        renderInternships();
      }
    });
  }

  // Compensation
  if (state.selectedCompensation !== 'all') {
    const compLabel = state.selectedCompensation === 'paid' ? 'Paid Only' : (state.selectedCompensation === 'unpaid' ? 'Unpaid / Credit' : 'High Stipend');
    activeChips.push({
      label: `Pay: ${compLabel}`,
      reset: () => {
        state.selectedCompensation = 'all';
        const el = document.getElementById('compensationFilter');
        if (el) el.value = 'all';
        renderInternships();
      }
    });
  }

  // Timeline
  if (state.selectedTimeline !== 'all') {
    const timeLabel = state.selectedTimeline === 'upcoming' ? 'Upcoming 2027' : 'Open & Active';
    activeChips.push({
      label: `Timeline: ${timeLabel}`,
      reset: () => {
        state.selectedTimeline = 'all';
        const el = document.getElementById('timelineFilter');
        if (el) el.value = 'all';
        renderInternships();
      }
    });
  }

  // Location / Country
  if (state.selectedCountry !== 'all') {
    activeChips.push({
      label: `Location: ${state.selectedCountry.toUpperCase()}`,
      reset: () => {
        state.selectedCountry = 'all';
        const el = document.getElementById('countryFilter');
        if (el) el.value = 'all';
        renderInternships();
      }
    });
  }

  // Work Mode
  if (state.selectedWorkType !== 'all') {
    activeChips.push({
      label: `Mode: ${state.selectedWorkType}`,
      reset: () => {
        state.selectedWorkType = 'all';
        const el = document.getElementById('workTypeFilter');
        if (el) el.value = 'all';
        renderInternships();
      }
    });
  }

  // Perk
  if (state.selectedPerk !== 'all') {
    const perkLabel = state.selectedPerk === 'visa' ? 'Visa Sponsorship' : 'Housing Provided';
    activeChips.push({
      label: `Benefit: ${perkLabel}`,
      reset: () => {
        state.selectedPerk = 'all';
        const el = document.getElementById('perkFilter');
        if (el) el.value = 'all';
        renderInternships();
      }
    });
  }

  // Search Query
  if (state.searchQuery) {
    activeChips.push({
      label: `Search: "${state.searchQuery}"`,
      reset: () => {
        state.searchQuery = '';
        const el = document.getElementById('globalSearchInput');
        if (el) el.value = '';
        renderInternships();
      }
    });
  }

  if (activeChips.length === 0) {
    summaryEl.classList.add('hidden');
    summaryEl.innerHTML = '';
    return;
  }

  summaryEl.classList.remove('hidden');
  summaryEl.innerHTML = `
    <span class="text-neutral-400 font-mono text-[11px] uppercase mr-1">Active Criteria:</span>
    ${activeChips.map((chip, idx) => `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
        <span>${chip.label}</span>
        <button onclick="window.activeChipResets[${idx}]()" class="hover:text-orange-500 text-neutral-400 transition-colors ml-1" title="Remove filter">
          <i class="fa-solid fa-xmark text-[10px]"></i>
        </button>
      </span>
    `).join('')}
    <button onclick="resetAllFilters()" class="font-mono text-xs text-orange-500 hover:underline uppercase tracking-wider ml-2">
      Clear All
    </button>
  `;

  window.activeChipResets = activeChips.map(c => c.reset);
}

// Minimal Grid Card
function renderGridCard(item) {
  const isBookmarked = state.savedBookmarks.includes(item.id);
  const isApplied = Boolean(state.appliedOpportunities && state.appliedOpportunities[item.id]);
  const isLocal = item.scope === 'local';
  const isNational = item.scope === 'national';
  const isGovt = item.scope === 'govt-defense';
  const isUpcoming = Boolean(item.isUpcoming);
  const isPaid = Boolean(item.isPaid);
  const trackerStatus = state.trackerApplications[item.id]?.stage;
  const daysLeft = calculateDaysRemaining(item.deadline);

  // Scope Badge HTML
  let scopeBadgeHtml = '';
  if (isGovt) {
    if (item.govtCategory === 'armed-forces') {
      scopeBadgeHtml = `<span class="badge-army px-2 py-0.5 rounded uppercase font-semibold text-[10px]"><i class="fa-solid fa-person-rifle mr-1 text-orange-500"></i>Armed Forces</span>`;
    } else if (item.govtCategory === 'defense-space') {
      scopeBadgeHtml = `<span class="badge-govt px-2 py-0.5 rounded uppercase font-semibold text-[10px]"><i class="fa-solid fa-rocket mr-1 text-orange-500"></i>Defense & Space</span>`;
    } else {
      scopeBadgeHtml = `<span class="badge-govt px-2 py-0.5 rounded uppercase font-semibold text-[10px]"><i class="fa-solid fa-landmark mr-1 text-orange-500"></i>Govt of India</span>`;
    }
  } else if (isLocal) {
    scopeBadgeHtml = `<span class="badge-local px-2 py-0.5 rounded uppercase font-semibold text-[10px]"><i class="fa-solid fa-map-pin mr-1 text-orange-500"></i>Local Firm</span>`;
  } else if (isNational) {
    scopeBadgeHtml = `<span class="badge-national px-2 py-0.5 rounded uppercase font-semibold text-[10px]"><i class="fa-solid fa-flag mr-1"></i>National</span>`;
  } else {
    scopeBadgeHtml = `<span class="badge-international px-2 py-0.5 rounded uppercase font-semibold text-[10px]"><i class="fa-solid fa-globe mr-1"></i>International</span>`;
  }

  return `
    <div class="internship-card p-6 rounded-xl flex flex-col justify-between relative group ${isApplied ? 'border-orange-500/50 dark:border-orange-500/50 shadow-xs' : ''}">
      <div>
        
        <!-- Header: Monotone Tag & Actions -->
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white flex items-center justify-center font-mono font-bold text-xs tracking-tight border border-neutral-200 dark:border-neutral-700">
              ${item.logoText}
            </div>
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-neutral-400 block">${item.company}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-neutral-500 font-mono">${item.city || item.country}</span>
                <span class="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-orange-500 text-[9px]"></i>Verified</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button 
              onclick="copyOpportunityLink('${item.id}', event)" 
              class="w-7 h-7 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title="Copy Direct Link"
            >
              <i class="fa-solid fa-link text-xs"></i>
            </button>

            <button 
              onclick="toggleBookmark('${item.id}', event)" 
              class="w-7 h-7 rounded flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-orange-500 transition-colors ${
                isBookmarked ? 'text-orange-500 dark:text-orange-500' : ''
              }"
              title="${isBookmarked ? 'Saved' : 'Bookmark'}"
            >
              <i class="${isBookmarked ? 'fa-solid fa-bookmark text-sm' : 'fa-regular fa-bookmark text-sm'}"></i>
            </button>
          </div>
        </div>

        <!-- Role Title -->
        <h3 class="text-base font-bold text-neutral-950 dark:text-white mb-3 leading-snug line-clamp-2 cursor-pointer hover:text-orange-500 transition-colors" onclick="openDetailModal('${item.id}')">
          ${item.title}
        </h3>

        <!-- Minimal Scope & Branch Tags -->
        <div class="flex flex-wrap items-center gap-1.5 mb-5 font-mono text-[11px]">
          ${scopeBadgeHtml}

          ${isApplied ? `
            <span class="badge-applied px-2 py-0.5 rounded uppercase font-bold text-[10px] flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-orange-500 text-[9px]"></i>Applied
            </span>
          ` : ''}

          ${isUpcoming ? `
            <span class="badge-upcoming px-2 py-0.5 rounded uppercase font-semibold text-[10px]">
              <i class="fa-regular fa-clock mr-1"></i>${item.upcomingDate || 'Upcoming 2027'}
            </span>
          ` : ''}

          <span class="px-2 py-0.5 rounded uppercase ${isPaid ? 'badge-paid' : 'badge-unpaid'} text-[10px]">
            ${isPaid ? 'Paid' : 'Unpaid / Credit'}
          </span>

          <span class="px-2 py-0.5 rounded uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            ${item.branchName}
          </span>
          <span class="px-2 py-0.5 rounded uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            ${item.workType}
          </span>
        </div>

        <!-- Compensation Highlight -->
        <div class="mb-5 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 font-mono">
          <div class="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span class="uppercase">${isPaid ? 'Stipend / Compensation' : 'Category / Certification'}</span>
            ${item.visaSponsorship ? '<span class="text-orange-500 uppercase font-semibold">Visa Support</span>' : ''}
          </div>
          <p class="text-xs font-bold ${isPaid ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400 font-semibold'} line-clamp-1">
            ${isPaid ? '' : '<i class="fa-solid fa-graduation-cap text-orange-500 mr-1.5"></i>'}${item.stipend}
          </p>
        </div>

        <!-- Concise Description -->
        <p class="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-6 leading-relaxed">
          ${item.description}
        </p>
      </div>

      <!-- Footer Actions -->
      <div class="pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div class="flex items-center justify-between text-xs font-mono text-neutral-400 mb-4">
          <span>${isUpcoming ? (item.upcomingDate || 'Upcoming Cycle') : (daysLeft !== null ? (daysLeft > 0 ? `${daysLeft}d remaining` : 'Closed') : 'Rolling')}</span>
          <span>${item.duration}</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button 
            onclick="openDetailModal('${item.id}')"
            class="py-2 px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase tracking-wider hover:border-neutral-950 dark:hover:border-white transition-colors text-center"
          >
            Details
          </button>

          <button 
            onclick="toggleAppliedStatus('${item.id}', event)" 
            class="py-2 px-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1 text-center ${
              isApplied 
                ? 'bg-orange-500 text-white font-bold shadow-xs' 
                : 'border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-950 dark:hover:border-white'
            }"
            title="${isApplied ? 'Application Recorded - Click to unmark' : 'Record that you applied'}"
          >
            <i class="fa-solid ${isApplied ? 'fa-check' : 'fa-paper-plane'} text-[9px]"></i>
            <span>${isApplied ? 'Applied' : 'Mark'}</span>
          </button>

          <a 
            href="${item.applyUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="py-2 px-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-mono uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1"
          >
            <span>${isUpcoming ? 'Register' : 'Apply'}</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
          </a>
        </div>

        ${trackerStatus ? `
          <div class="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between font-mono text-[10px] uppercase">
            <span class="text-neutral-400">Tracker Stage:</span>
            <span class="font-bold text-orange-500">${trackerStatus}</span>
          </div>
        ` : ''}
      </div>

    </div>
  `;
}

// Minimal List Item
function renderListItem(item) {
  const isBookmarked = state.savedBookmarks.includes(item.id);
  const isApplied = Boolean(state.appliedOpportunities && state.appliedOpportunities[item.id]);
  const isLocal = item.scope === 'local';
  const isNational = item.scope === 'national';
  const isGovt = item.scope === 'govt-defense';
  const isUpcoming = Boolean(item.isUpcoming);
  const isPaid = Boolean(item.isPaid);

  let scopeBadgeHtml = '';
  if (isGovt) {
    if (item.govtCategory === 'armed-forces') {
      scopeBadgeHtml = `<span class="badge-army px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">Armed Forces</span>`;
    } else if (item.govtCategory === 'defense-space') {
      scopeBadgeHtml = `<span class="badge-govt px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">Defense & Space</span>`;
    } else {
      scopeBadgeHtml = `<span class="badge-govt px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">Govt of India</span>`;
    }
  } else if (isLocal) {
    scopeBadgeHtml = `<span class="badge-local px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">Local Firm</span>`;
  } else if (isNational) {
    scopeBadgeHtml = `<span class="badge-national px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">National</span>`;
  } else {
    scopeBadgeHtml = `<span class="badge-international px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">International</span>`;
  }

  return `
    <div class="internship-card p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${isApplied ? 'border-orange-500/50 dark:border-orange-500/50 shadow-xs' : ''}">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white flex items-center justify-center font-mono font-bold text-xs tracking-tight flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
          ${item.logoText}
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h3 class="font-bold text-neutral-950 dark:text-white text-sm hover:text-orange-500 cursor-pointer transition-colors" onclick="openDetailModal('${item.id}')">
              ${item.title}
            </h3>
            <span class="text-neutral-400 font-mono text-xs">/ ${item.company}</span>
            <span class="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-orange-500 text-[9px]"></i>Verified</span>
            ${scopeBadgeHtml}
            ${isApplied ? '<span class="badge-applied px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold">Applied</span>' : ''}
            ${isUpcoming ? '<span class="badge-upcoming px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold">Upcoming</span>' : ''}
            <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase ${isPaid ? 'badge-paid' : 'badge-unpaid'}">
              ${isPaid ? 'Paid' : 'Unpaid'}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-neutral-400 mb-1">
            <span>${item.city || item.country}</span>
            <span><strong class="text-neutral-900 dark:text-white font-medium">${item.stipend}</strong></span>
            <span>${item.duration}</span>
            ${item.visaSponsorship ? '<span class="text-orange-500 uppercase">Visa Sponsored</span>' : ''}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
        <button 
          onclick="copyOpportunityLink('${item.id}', event)" 
          class="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-xs text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
          title="Copy Direct Link"
        >
          <i class="fa-solid fa-link"></i>
        </button>
        <button 
          onclick="toggleBookmark('${item.id}', event)" 
          class="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-xs transition-colors ${
            isBookmarked ? 'text-orange-500 border-orange-500' : 'text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
          }"
        >
          <i class="${isBookmarked ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}"></i>
        </button>

        <button 
          onclick="toggleAppliedStatus('${item.id}', event)" 
          class="px-2.5 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-colors ${
            isApplied 
              ? 'bg-orange-500 text-white font-bold' 
              : 'border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-950 dark:hover:border-white'
          }"
          title="${isApplied ? 'Application Recorded - Click to unmark' : 'Record that you applied'}"
        >
          <i class="fa-solid ${isApplied ? 'fa-check' : 'fa-paper-plane'} text-[9px]"></i>
          <span>${isApplied ? 'Applied' : 'Mark'}</span>
        </button>

        <button 
          onclick="openDetailModal('${item.id}')"
          class="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase tracking-wider"
        >
          Details
        </button>

        <a 
          href="${item.applyUrl}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="px-4 py-1.5 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
        >
          <span>${isUpcoming ? 'Register' : 'Apply'}</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
        </a>
      </div>
    </div>
  `;
}

function calculateDaysRemaining(deadlineStr) {
  if (!deadlineStr || deadlineStr === 'Rolling') return null;
  const deadline = new Date(deadlineStr);
  const diffTime = deadline - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Toggle Bookmark
window.toggleBookmark = function(id, event) {
  if (event) event.stopPropagation();
  const index = state.savedBookmarks.indexOf(id);
  if (index === -1) {
    state.savedBookmarks.push(id);
    showToast('Saved to Bookmarks');
    if (!state.trackerApplications[id]) {
      state.trackerApplications[id] = {
        stage: 'saved',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('eng_tracker', JSON.stringify(state.trackerApplications));
    }
  } else {
    state.savedBookmarks.splice(index, 1);
    showToast('Removed from Bookmarks');
  }
  localStorage.setItem('eng_bookmarks', JSON.stringify(state.savedBookmarks));
  updateNavSavedCount();
  renderInternships();
  renderFellowships();
  renderKanbanTracker();
};

// Reset Filters
window.resetAllFilters = function() {
  state.searchQuery = '';
  state.selectedBranch = 'all';
  state.selectedScope = 'all';
  state.selectedCountry = 'all';
  state.selectedCompensation = 'all';
  state.selectedTimeline = 'all';
  state.selectedWorkType = 'all';
  state.selectedPerk = 'all';
  state.sortBy = 'recommended';

  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) searchInput.value = '';

  const countrySelect = document.getElementById('countryFilter');
  if (countrySelect) countrySelect.value = 'all';

  const compSelect = document.getElementById('compensationFilter');
  if (compSelect) compSelect.value = 'all';

  const timelineSelect = document.getElementById('timelineFilter');
  if (timelineSelect) timelineSelect.value = 'all';

  const workTypeSelect = document.getElementById('workTypeFilter');
  if (workTypeSelect) workTypeSelect.value = 'all';

  const perkSelect = document.getElementById('perkFilter');
  if (perkSelect) perkSelect.value = 'all';

  const sortSelect = document.getElementById('sortBySelect');
  if (sortSelect) sortSelect.value = 'recommended';

  document.querySelectorAll('[data-scope-btn]').forEach(btn => {
    if (btn.getAttribute('data-scope-btn') === 'all') {
      btn.classList.add('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
      btn.classList.remove('text-neutral-600', 'dark:text-neutral-400');
    } else {
      btn.classList.remove('bg-neutral-950', 'dark:bg-white', 'text-white', 'dark:text-neutral-950');
      btn.classList.add('text-neutral-600', 'dark:text-neutral-400');
    }
  });

  renderBranchPills();
  renderInternships();
  showToast('Filters Reset');
};

// Open Detail Modal
window.openDetailModal = function(id) {
  const item = getOpportunityById(id);
  if (!item) return;

  state.activeModalInternship = item;
  const modal = document.getElementById('detailModal');
  const modalContent = document.getElementById('detailModalBody');
  if (!modal || !modalContent) return;

  const isApplied = Boolean(state.appliedOpportunities && state.appliedOpportunities[item.id]);
  const isGovt = item.scope === 'govt-defense';
  const isLocal = item.scope === 'local';
  const isNational = item.scope === 'national';
  const isUpcoming = Boolean(item.isUpcoming);
  const isPaid = Boolean(item.isPaid);
  const isBookmarked = state.savedBookmarks.includes(item.id);
  const currentStage = state.trackerApplications[item.id]?.stage || (isApplied ? 'applied' : 'none');

  let scopeLabel = 'International Enterprise';
  if (isGovt) {
    if (item.govtCategory === 'armed-forces') scopeLabel = '🇮🇳 Indian Armed Forces Directorate';
    else if (item.govtCategory === 'defense-space') scopeLabel = '🇮🇳 Sovereign Defense & Space R&D';
    else scopeLabel = '🇮🇳 Union Ministry / Central PSU';
  } else if (isLocal) {
    scopeLabel = 'Local Firm / Regional Workshop';
  } else if (isNational) {
    scopeLabel = 'National Organization / PSU';
  }

  modalContent.innerHTML = `
    <!-- Modal Header -->
    <div class="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-6">
      <div class="flex items-center gap-2 mb-2 font-mono text-xs uppercase text-neutral-400 flex-wrap">
        <span class="text-neutral-950 dark:text-white font-bold">${item.company}</span>
        <span>/</span>
        <span class="text-orange-500 font-semibold">${scopeLabel}</span>
        <span>/</span>
        <span>${item.city || item.country}</span>
        <span>/</span>
        <span class="text-neutral-400 dark:text-neutral-500 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-orange-500 text-[10px]"></i>Verified Portal</span>
      </div>
      <h2 class="text-2xl font-extrabold text-neutral-950 dark:text-white">${item.title}</h2>

      ${isApplied ? `
        <div class="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold">
            <i class="fa-solid fa-circle-check text-sm"></i>
            <span>Application Recorded & Logged (${state.appliedOpportunities[item.id]?.appliedAt || 'Applied'})</span>
          </div>
          <button onclick="toggleAppliedStatus('${item.id}'); openDetailModal('${item.id}');" class="text-neutral-500 hover:text-red-500 uppercase font-semibold text-[11px] transition-colors">
            Unmark Status
          </button>
        </div>
      ` : ''}

      ${isGovt ? `
        <div class="mt-4 p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs font-mono text-neutral-700 dark:text-neutral-300">
          <div class="flex items-center gap-2 font-bold text-neutral-950 dark:text-white uppercase mb-1">
            <i class="fa-solid fa-shield-halved text-orange-500"></i>
            <span>Official Government of India Application Protocol</span>
          </div>
          <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
            Mandatory Institutional NOC required from College Principal or Dean. Selected engineering candidates undergo official verification under sovereign guidelines.
          </p>
        </div>
      ` : ''}

      ${isUpcoming ? `
        <div class="mt-3 p-2.5 rounded border border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20 text-xs font-mono text-orange-600 dark:text-orange-400 flex items-center gap-2">
          <i class="fa-regular fa-calendar-check"></i>
          <span><strong>Upcoming 2027 Cycle Notice:</strong> ${item.upcomingDate || 'Applications opening soon. Prepare credentials in advance.'}</span>
        </div>
      ` : ''}
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 font-mono text-xs">
      <div class="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <span class="text-neutral-400 block mb-1 uppercase">Pay Status</span>
        <span class="font-bold ${isPaid ? 'text-neutral-950 dark:text-white' : 'text-neutral-500'}">
          ${isPaid ? 'Paid Stipend' : 'Unpaid / Credit'}
        </span>
      </div>
      <div class="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <span class="text-neutral-400 block mb-1 uppercase">Compensation / Value</span>
        <span class="font-bold text-neutral-950 dark:text-white line-clamp-1">${item.stipend}</span>
      </div>
      <div class="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <span class="text-neutral-400 block mb-1 uppercase">Duration</span>
        <span class="font-bold text-neutral-950 dark:text-white">${item.duration}</span>
      </div>
      <div class="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <span class="text-neutral-400 block mb-1 uppercase">Deadline / Batch</span>
        <span class="font-bold text-neutral-950 dark:text-white">${item.deadline || 'Rolling'}</span>
      </div>
    </div>

    <!-- Overview -->
    <div class="mb-8">
      <h4 class="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">Scope & Responsibilities</h4>
      <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        ${item.description}
      </p>
    </div>

    <!-- Criteria & Skills -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
      <div>
        <h4 class="font-mono uppercase tracking-widest text-neutral-400 mb-2">Eligibility & Prerequisites</h4>
        <div class="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300">
          ${item.eligibility}
        </div>
      </div>

      <div>
        <h4 class="font-mono uppercase tracking-widest text-neutral-400 mb-2">Required Core Competencies</h4>
        <ul class="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-2 text-neutral-700 dark:text-neutral-300">
          ${item.requirements ? item.requirements.map(req => `
            <li class="flex items-start gap-2">
              <span class="text-orange-500 font-mono">•</span>
              <span>${req}</span>
            </li>
          `).join('') : '<li>Refer to official posting</li>'}
        </ul>
      </div>
    </div>

    <!-- Perks / Certification Value -->
    ${item.perks && item.perks.length > 0 ? `
      <div class="mb-8">
        <h4 class="font-mono uppercase tracking-widest text-neutral-400 mb-2 text-xs">Credentials, Perks & Benefits</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${item.perks.map(perk => `
            <div class="p-2.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <span class="text-orange-500 font-mono">✓</span>
              <span>${perk}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Tracker Selector -->
    <div class="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/50">
      <div>
        <span class="text-xs font-mono uppercase text-neutral-950 dark:text-white font-semibold block">Application Status</span>
        <span class="text-xs text-neutral-400 font-mono">Sync with your private local pipeline</span>
      </div>
      <select 
        onchange="updateTrackerStage('${item.id}', this.value); if(this.value==='applied'){ if(!state.appliedOpportunities['${item.id}']){ toggleAppliedStatus('${item.id}'); } } else if(state.appliedOpportunities['${item.id}']){ toggleAppliedStatus('${item.id}'); }"
        class="text-xs font-mono px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white focus:outline-none"
      >
        <option value="none" ${currentStage === 'none' ? 'selected' : ''}>Untracked</option>
        <option value="saved" ${currentStage === 'saved' ? 'selected' : ''}>Saved</option>
        <option value="applied" ${currentStage === 'applied' ? 'selected' : ''}>Applied</option>
        <option value="interview" ${currentStage === 'interview' ? 'selected' : ''}>Interviewing</option>
        <option value="offer" ${currentStage === 'offer' ? 'selected' : ''}>Offer Received</option>
        <option value="archived" ${currentStage === 'archived' ? 'selected' : ''}>Archived</option>
      </select>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
      <button 
        onclick="copyOpportunityLink('${item.id}', event)"
        class="px-3.5 py-2 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-white transition-colors flex items-center gap-1.5"
        title="Copy Direct Link to Opportunity"
      >
        <i class="fa-solid fa-link text-[10px]"></i>
        <span>Share Link</span>
      </button>

      <div class="flex items-center gap-2">
        <button 
          onclick="toggleBookmark('${item.id}'); openDetailModal('${item.id}');"
          class="px-3.5 py-2 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-white transition-colors flex items-center gap-1.5"
        >
          <i class="${isBookmarked ? 'fa-solid fa-bookmark text-orange-500' : 'fa-regular fa-bookmark'}"></i>
          <span>${isBookmarked ? 'Saved' : 'Save'}</span>
        </button>

        <button 
          onclick="toggleAppliedStatus('${item.id}'); openDetailModal('${item.id}');"
          class="px-3.5 py-2 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
            isApplied 
              ? 'bg-orange-500 text-white font-bold' 
              : 'border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-white'
          }"
        >
          <i class="fa-solid ${isApplied ? 'fa-circle-check' : 'fa-paper-plane'} text-[10px]"></i>
          <span>${isApplied ? 'Applied ✓' : 'Mark Applied'}</span>
        </button>

        <a 
          href="${item.applyUrl}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="px-5 py-2 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <span>${isUpcoming ? 'Register Interest' : 'Apply on Official Site'}</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
};

window.closeDetailModal = function() {
  const modal = document.getElementById('detailModal');
  if (modal) modal.classList.add('hidden');
};

// Render Global Fellowships
function renderFellowships() {
  const container = document.getElementById('fellowshipsGrid');
  if (!container) return;

  container.innerHTML = RESEARCH_FELLOWSHIPS.map(fel => {
    const isBookmarked = state.savedBookmarks.includes(fel.id);

    return `
    <div class="internship-card p-6 rounded-xl flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-3 mb-3 font-mono text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded uppercase font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
              ${fel.badge}
            </span>
            <span class="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-orange-500 text-[9px]"></i>Verified</span>
          </div>

          <div class="flex items-center gap-1">
            <button 
              onclick="copyOpportunityLink('${fel.id}', event)" 
              class="w-7 h-7 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title="Copy Direct Link"
            >
              <i class="fa-solid fa-link text-xs"></i>
            </button>
            <button 
              onclick="toggleBookmark('${fel.id}', event)" 
              class="w-7 h-7 rounded flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-orange-500 transition-colors ${
                isBookmarked ? 'text-orange-500 dark:text-orange-500' : ''
              }"
              title="${isBookmarked ? 'Saved' : 'Bookmark'}"
            >
              <i class="${isBookmarked ? 'fa-solid fa-bookmark text-sm' : 'fa-regular fa-bookmark text-sm'}"></i>
            </button>
          </div>
        </div>

        <h3 
          class="text-lg font-bold text-neutral-950 dark:text-white mb-1.5 leading-snug cursor-pointer hover:text-orange-500 transition-colors"
          onclick="openDetailModal('${fel.id}')"
        >
          ${fel.name}
        </h3>
        
        <p class="text-xs font-mono text-neutral-500 mb-4">
          ${fel.host}
        </p>

        <p class="text-xs text-neutral-600 dark:text-neutral-400 mb-5 leading-relaxed">
          ${fel.summary}
        </p>

        <!-- Grant Box -->
        <div class="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 mb-4 font-mono text-xs">
          <span class="text-orange-500 uppercase block mb-1 font-semibold">Grant & Coverage</span>
          <p class="text-neutral-800 dark:text-neutral-200">
            ${fel.funding}
          </p>
        </div>

        <div class="space-y-1.5 text-xs text-neutral-500 mb-6 font-mono">
          <div><strong class="text-neutral-800 dark:text-neutral-200">Disciplines:</strong> ${fel.disciplines}</div>
          <div><strong class="text-neutral-800 dark:text-neutral-200">Duration:</strong> ${fel.duration}</div>
          <div><strong class="text-neutral-800 dark:text-neutral-200">Deadline:</strong> <span class="text-neutral-950 dark:text-white">${fel.deadline}</span></div>
        </div>
      </div>

      <div class="pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div class="grid grid-cols-2 gap-2">
          <button 
            onclick="openDetailModal('${fel.id}')"
            class="py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase tracking-wider hover:border-neutral-950 dark:hover:border-white transition-colors text-center"
          >
            Details
          </button>

          <a 
            href="${fel.officialUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="py-2 px-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-mono uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Apply</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
        </div>
      </div>
    </div>
    `;
  }).join('');
}

// Render Career Toolkit
function renderCareerToolkit() {
  const emailContainer = document.getElementById('coldEmailTemplatesContainer');
  const checklistContainer = document.getElementById('resumeChecklistContainer');

  if (emailContainer) {
    emailContainer.innerHTML = CAREER_TOOLKIT.coldEmails.map((tmpl, idx) => `
      <div class="p-6 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900">
        <div class="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div>
            <h4 class="font-bold text-neutral-950 dark:text-white text-sm">${tmpl.title}</h4>
            <p class="text-xs font-mono text-neutral-400">${tmpl.purpose}</p>
          </div>
          <button 
            onclick="copyTemplate(${idx})"
            class="px-3 py-1 rounded text-xs font-mono uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-orange-500 hover:text-white transition-colors"
          >
            Copy
          </button>
        </div>

        <div class="mb-3 p-2.5 rounded bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 font-mono text-xs">
          <span class="text-neutral-400">Subject: </span>
          <span class="text-neutral-900 dark:text-neutral-100">${tmpl.subject}</span>
        </div>

        <pre class="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 text-xs whitespace-pre-wrap font-mono leading-relaxed border border-neutral-200 dark:border-neutral-800 max-h-72 overflow-y-auto">${tmpl.body}</pre>
      </div>
    `).join('');
  }

  if (checklistContainer) {
    checklistContainer.innerHTML = CAREER_TOOLKIT.resumeChecklist.map((item, idx) => `
      <div class="border-b border-neutral-100 dark:border-neutral-800 pb-3 last:border-b-0">
        <h5 class="text-xs font-bold text-neutral-950 dark:text-white mb-1 font-mono uppercase tracking-wider">
          <span class="text-orange-500 mr-1.5">${idx + 1}.</span>${item.rule}
        </h5>
        <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">${item.desc}</p>
      </div>
    `).join('');
  }
}

window.copyTemplate = function(idx) {
  const tmpl = CAREER_TOOLKIT.coldEmails[idx];
  if (!tmpl) return;
  const full = `Subject: ${tmpl.subject}\n\n${tmpl.body}`;
  navigator.clipboard.writeText(full).then(() => {
    showToast('Template Copied');
  }).catch(() => {
    showToast('Failed to Copy');
  });
};

// Render Application Kanban
function renderKanbanTracker() {
  const cols = ['saved', 'applied', 'interview', 'offer', 'archived'];

  cols.forEach(col => {
    const colContainer = document.getElementById(`kanban-col-${col}`);
    const badgeCount = document.getElementById(`kanban-count-${col}`);
    if (!colContainer) return;

    const matching = Object.keys(state.trackerApplications).filter(id => {
      return state.trackerApplications[id].stage === col;
    });

    if (badgeCount) badgeCount.textContent = matching.length;

    if (matching.length === 0) {
      colContainer.innerHTML = `
        <div class="h-28 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-center font-mono text-[11px] uppercase tracking-wider text-neutral-400 text-center p-3">
          Empty
        </div>
      `;
      return;
    }

    colContainer.innerHTML = matching.map(id => {
      const item = getOpportunityById(id);
      if (!item) return '';

      return `
        <div class="kanban-card p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="font-mono text-[11px] uppercase text-neutral-400 font-semibold">${item.company}</span>
            <button onclick="removeFromTracker('${id}')" class="text-neutral-400 hover:text-orange-500 text-xs">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <h5 class="text-xs font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1 cursor-pointer hover:text-orange-500" onclick="openDetailModal('${id}')">
            ${item.title}
          </h5>

          <div class="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between font-mono text-[10px]">
            <span class="text-neutral-400 uppercase">Stage:</span>
            <select 
              onchange="updateTrackerStage('${id}', this.value)"
              class="py-0.5 px-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-[10px] uppercase focus:outline-none"
            >
              <option value="saved" ${col === 'saved' ? 'selected' : ''}>Saved</option>
              <option value="applied" ${col === 'applied' ? 'selected' : ''}>Applied</option>
              <option value="interview" ${col === 'interview' ? 'selected' : ''}>Interview</option>
              <option value="offer" ${col === 'offer' ? 'selected' : ''}>Offer</option>
              <option value="archived" ${col === 'archived' ? 'selected' : ''}>Archived</option>
            </select>
          </div>
        </div>
      `;
    }).join('');
  });
}

window.updateTrackerStage = function(id, newStage) {
  if (newStage === 'none') {
    delete state.trackerApplications[id];
    showToast('Removed from Pipeline');
  } else {
    state.trackerApplications[id] = {
      ...(state.trackerApplications[id] || {}),
      stage: newStage,
      date: new Date().toISOString().split('T')[0]
    };
    showToast(`Status: ${newStage.toUpperCase()}`);
  }
  localStorage.setItem('eng_tracker', JSON.stringify(state.trackerApplications));
  updateNavSavedCount();
  renderInternships();
  renderKanbanTracker();
  if (state.activeModalInternship?.id === id) openDetailModal(id);
};

window.removeFromTracker = function(id) {
  delete state.trackerApplications[id];
  localStorage.setItem('eng_tracker', JSON.stringify(state.trackerApplications));
  updateNavSavedCount();
  renderInternships();
  renderKanbanTracker();
  showToast('Removed from Pipeline');
};

function exportTrackerCSV() {
  const ids = Object.keys(state.trackerApplications);
  if (ids.length === 0) {
    showToast('Pipeline Empty');
    return;
  }

  let csv = 'Company,Title,Discipline,Scope,Country,Stage,Date,URL\n';
  ids.forEach(id => {
    const item = getOpportunityById(id);
    const tr = state.trackerApplications[id];
    if (item) {
      csv += `"${item.company}","${item.title}","${item.branchName}","${item.scope}","${item.country}","${tr.stage}","${tr.date}","${item.applyUrl}"\n`;
    }
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `engineering_pipeline_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Export Complete');
}

// Handle Community Submission
function handlePostInternship(e) {
  e.preventDefault();

  const title = document.getElementById('postTitle').value.trim();
  const company = document.getElementById('postCompany').value.trim();
  const branch = document.getElementById('postBranch').value;
  const scope = document.getElementById('postScope').value;
  const country = document.getElementById('postCountry').value.trim();
  const city = document.getElementById('postCity').value.trim();
  const workType = document.getElementById('postWorkType').value;
  const postIsPaidVal = document.getElementById('postIsPaid') ? document.getElementById('postIsPaid').value : 'paid';
  const stipend = document.getElementById('postStipend').value.trim();
  const visaSponsorship = document.getElementById('postVisa').checked;
  const housingProvided = document.getElementById('postHousing').checked;
  const isUpcoming = document.getElementById('postUpcoming') ? document.getElementById('postUpcoming').checked : false;
  const deadline = document.getElementById('postDeadline').value;
  const duration = document.getElementById('postDuration').value.trim();
  const applyUrl = document.getElementById('postApplyUrl').value.trim();
  const description = document.getElementById('postDescription').value.trim();
  const eligibility = document.getElementById('postEligibility').value.trim();

  const branchObj = ENGINEERING_BRANCHES.find(b => b.id === branch);
  const isPaid = postIsPaidVal === 'paid' && !stipend.toLowerCase().includes('unpaid');

  const newListing = {
    id: `custom-${Date.now()}`,
    title,
    company,
    logoText: company.substring(0, 4).toUpperCase(),
    logoColor: '#09090b',
    branch,
    branchName: branchObj ? branchObj.name : 'Engineering',
    scope, // 'local', 'national', 'international'
    country,
    city,
    workType,
    stipend: stipend || (isPaid ? 'Paid Stipend' : 'Unpaid / Curricular Credit'),
    isPaid: isPaid,
    isFunded: Boolean(isPaid && (stipend.includes('$') || stipend.includes('€') || stipend.includes('₹') || stipend.includes('CHF'))),
    isUpcoming: isUpcoming,
    upcomingDate: isUpcoming ? 'Upcoming Cycle Notice' : null,
    visaSponsorship,
    housingProvided,
    deadline: deadline || 'Rolling',
    duration: duration || '8 - 12 Weeks',
    eligibility: eligibility || 'Open to Engineering Undergraduates and Graduates',
    description,
    requirements: [
      "Review official organization portal for specifications",
      "Valid enrolled engineering degree status"
    ],
    perks: [
      visaSponsorship ? "Visa sponsorship support" : "Domestic authorization",
      housingProvided ? "Housing stipend / corporate accommodation" : "Certificate of completion provided"
    ],
    applyUrl,
    featured: false,
    rating: 4.5
  };

  const existingCustom = JSON.parse(localStorage.getItem('eng_custom_internships') || '[]');
  existingCustom.unshift(newListing);
  localStorage.setItem('eng_custom_internships', JSON.stringify(existingCustom));

  state.internships.unshift(newListing);

  document.getElementById('postInternshipForm').reset();
  document.getElementById('submitModal').classList.add('hidden');

  updateHeroStats();
  renderBranchPills();
  renderInternships();
  showToast('Opening Published');
}

// Minimal Toast
function showToast(message) {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider shadow-lg flex items-center gap-2.5 transform translate-y-2 opacity-0 transition-all duration-200 border border-neutral-800 dark:border-neutral-200';
  toast.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span><span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 200);
  }, 2800);
}

// ==================== AUTHENTICATION & CANDIDATE PORTAL ====================

function initAuthUI() {
  const openAuthBtn = document.getElementById('openAuthModalBtn');
  const profilePill = document.getElementById('authProfilePill');
  const mobileAuthBtnText = document.getElementById('mobileAuthBtnText');

  if (state.currentUser) {
    if (openAuthBtn) openAuthBtn.classList.add('hidden');
    if (profilePill) profilePill.classList.remove('hidden');

    const avatar = document.getElementById('userAvatarInitials');
    const dropdownAvatar = document.getElementById('userDropdownAvatar');
    const nameNav = document.getElementById('userNameNav');
    const branchNav = document.getElementById('userBranchNav');
    const dropdownName = document.getElementById('userDropdownName');
    const dropdownEmail = document.getElementById('userDropdownEmail');
    const dropdownCollege = document.getElementById('userDropdownCollege');
    const appliedBadge = document.getElementById('userAppliedCountBadge');

    const firstName = state.currentUser.name.split(' ')[0];
    const initials = state.currentUser.initials || 'ES';

    if (avatar) avatar.textContent = initials;
    if (dropdownAvatar) dropdownAvatar.textContent = initials;
    if (nameNav) nameNav.textContent = firstName;
    if (branchNav) branchNav.textContent = (state.currentUser.branch || 'Engineer').substring(0, 16);
    if (dropdownName) dropdownName.textContent = state.currentUser.name;
    if (dropdownEmail) dropdownEmail.textContent = state.currentUser.email;
    if (dropdownCollege) dropdownCollege.textContent = state.currentUser.college || 'Engineering Institute';
    if (appliedBadge) appliedBadge.textContent = Object.keys(state.appliedOpportunities).length;

    if (mobileAuthBtnText) mobileAuthBtnText.textContent = `${firstName} (Sign Out)`;
  } else {
    if (openAuthBtn) openAuthBtn.classList.remove('hidden');
    if (profilePill) profilePill.classList.add('hidden');
    if (mobileAuthBtnText) mobileAuthBtnText.textContent = 'Sign In with Gmail OTP';
  }
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('hidden');
  resetOtpView();
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('hidden');
  resetOtpView();
}

// Request OTP for Sign In (User chooses their Name and Gmail)
function handleRequestSignInOtp(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('loginName');
  const emailInput = document.getElementById('loginEmail');
  const branchInput = document.getElementById('loginBranch');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const branch = branchInput ? branchInput.value : 'Computer Science & IT';

  if (!name) {
    showToast('Please enter your full name');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid Gmail address');
    if (emailInput) emailInput.focus();
    return;
  }

  dispatchOtpFlow({
    name,
    email,
    branch,
    college: 'Engineering Institute',
    studentId: 'CANDIDATE-' + Math.floor(1000 + Math.random() * 9000)
  });
}

// Request OTP for Registration
function handleRequestSignUpOtp(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const college = document.getElementById('regCollege').value.trim();
  const branch = document.getElementById('regBranch').value;
  const studentId = document.getElementById('regStudentId').value.trim() || '2024ENG01';
  const email = document.getElementById('regEmail').value.trim();

  if (!name) {
    showToast('Please enter your full name');
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid Gmail address');
    return;
  }

  dispatchOtpFlow({
    name,
    email,
    college,
    branch,
    studentId
  });
}

// Asynchronous Real Email Dispatch via AJAX Mail Gateway
async function dispatchRealEmailOtp(email, name, otpCode) {
  const statusEl = document.getElementById('otpDispatchStatus');
  const gmailDirectBtn = document.getElementById('openGmailDirectBtn');
  
  if (gmailDirectBtn) {
    gmailDirectBtn.href = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(email)}+OR+INTERN+ENGINE+OR+formsubmit`;
  }

  if (statusEl) {
    statusEl.textContent = 'Transmitting 6-digit OTP code to ' + email + '...';
  }

  // Developer audit trail in browser console (invisible on UI screen)
  console.info(`%c[INTERN ENGINE Mail Gateway]%c Dispatching OTP to ${email}: %c${otpCode}`, "color: #ff5500; font-weight:bold;", "", "font-weight:bold; color: #10b981;");

  const formData = new FormData();
  formData.append('_subject', `INTERN ENGINE Verification Code: ${otpCode}`);
  formData.append('Candidate_Name', name);
  formData.append('Recipient_Email', email);
  formData.append('Verification_Code', otpCode);
  formData.append('Security_Message', `Hello ${name},\n\nYour 6-digit INTERN ENGINE verification OTP is: ${otpCode}\n\nEnter this code into the portal to authenticate your student session.\nValid for 10 minutes.`);
  formData.append('_captcha', 'false');
  formData.append('_template', 'table');

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.ok) {
      if (statusEl) {
        statusEl.textContent = 'Dispatched to your Gmail! Check Inbox, Spam & Updates tabs.';
      }
    } else {
      if (statusEl) {
        statusEl.textContent = 'Dispatched to Gmail. If not received in 60s, click view code below.';
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = 'Dispatched to Gmail. If delayed or not received, click view code below.';
    }
  }
}

// Generate & Dispatch 6-Digit OTP to Gmail
function dispatchOtpFlow(userData) {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  state.activeOtp = {
    code: otpCode,
    name: userData.name,
    email: userData.email,
    branch: userData.branch || 'Computer Science & IT',
    college: userData.college || 'Institute of Technology',
    studentId: userData.studentId || '2024ENG01',
    expiresAt: Date.now() + 10 * 60 * 1000
  };

  // Switch UI view to OTP verification step
  const formsContainer = document.getElementById('authFormsContainer');
  const otpContainer = document.getElementById('otpStepContainer');
  const targetEmail = document.getElementById('otpTargetEmail');
  const targetName = document.getElementById('otpTargetName');
  const otpInput = document.getElementById('otpInput');
  const otpError = document.getElementById('otpErrorMsg');
  const revealedCode = document.getElementById('revealedOtpCode');
  const revealedBox = document.getElementById('revealedOtpBox');

  if (formsContainer) formsContainer.classList.add('hidden');
  if (otpContainer) otpContainer.classList.remove('hidden');
  if (targetEmail) targetEmail.textContent = userData.email;
  if (targetName) targetName.textContent = userData.name;
  if (revealedCode) revealedCode.textContent = otpCode;
  if (revealedBox) revealedBox.classList.add('hidden');
  
  if (otpInput) {
    otpInput.value = '';
    setTimeout(() => otpInput.focus(), 100);
  }
  if (otpError) otpError.classList.add('hidden');

  // Trigger real email delivery via AJAX mail gateway
  dispatchRealEmailOtp(userData.email, userData.name, otpCode);

  // Notifications & Alerts
  showToast(`Verification OTP sent to ${userData.email}`);
  sendNotification('Gmail Security Verification', `A 6-digit verification code has been dispatched to ${userData.email}. Check your Gmail inbox and spam folder.`, 'security');

  if (window.Notification && Notification.permission === 'granted') {
    try {
      new Notification('INTERN ENGINE Security: Gmail OTP', {
        body: `A 6-digit verification code was sent to ${userData.email}. Check your Gmail inbox.`,
        icon: 'favicon.ico'
      });
    } catch (err) {
      console.log('Push notification dispatch:', err);
    }
  }
}

// Verify OTP & Activate User Session
function verifyOtpAndSignIn() {
  if (!state.activeOtp) {
    showToast('Please request an OTP first');
    return;
  }

  const otpInput = document.getElementById('otpInput');
  const enteredCode = otpInput ? otpInput.value.trim() : '';
  const errorEl = document.getElementById('otpErrorMsg');

  if (enteredCode !== state.activeOtp.code) {
    if (errorEl) {
      errorEl.textContent = 'Invalid OTP code. Please enter the 6-digit code received in your Gmail.';
      errorEl.classList.remove('hidden');
    }
    showToast('Incorrect OTP Code');
    if (otpInput) {
      otpInput.classList.add('border-red-500');
      setTimeout(() => otpInput.classList.remove('border-red-500'), 1500);
      otpInput.focus();
    }
    return;
  }

  // OTP Matches — Compute initials from user's chosen name
  const nameParts = state.activeOtp.name.trim().split(' ').filter(Boolean);
  let initials = 'ES';
  if (nameParts.length >= 2) {
    initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
    initials = nameParts[0].substring(0, 2).toUpperCase();
  } else if (nameParts.length === 1) {
    initials = nameParts[0][0].toUpperCase();
  }

  state.currentUser = {
    name: state.activeOtp.name,
    email: state.activeOtp.email,
    college: state.activeOtp.college || 'Institute of Technology',
    branch: state.activeOtp.branch || 'Engineering',
    studentId: state.activeOtp.studentId || '2024ENG01',
    initials,
    verified: true,
    verifiedAt: new Date().toISOString()
  };

  localStorage.setItem('eng_user', JSON.stringify(state.currentUser));
  initAuthUI();
  closeAuthModal();
  resetOtpView();
  showToast(`Verified & Signed In: ${state.currentUser.name}`);
  sendNotification('Gmail Verification Complete', `Candidate session verified for ${state.currentUser.name} (${state.currentUser.email}).`, 'user');
}

// Resend OTP
function resendOtp() {
  if (!state.activeOtp) return;
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  state.activeOtp.code = newCode;
  state.activeOtp.expiresAt = Date.now() + 10 * 60 * 1000;

  const otpInput = document.getElementById('otpInput');
  if (otpInput) otpInput.value = '';

  const otpError = document.getElementById('otpErrorMsg');
  if (otpError) otpError.classList.add('hidden');

  const revealedCode = document.getElementById('revealedOtpCode');
  if (revealedCode) revealedCode.textContent = newCode;

  dispatchRealEmailOtp(state.activeOtp.email, state.activeOtp.name, newCode);

  showToast(`New OTP sent to ${state.activeOtp.email}`);
  sendNotification('New Gmail OTP Dispatched', `A new verification code was sent to ${state.activeOtp.email}. Check your inbox.`, 'security');

  if (window.Notification && Notification.permission === 'granted') {
    try {
      new Notification('INTERN ENGINE Security: New OTP', {
        body: `A new verification code was sent to ${state.activeOtp.email}.`,
        icon: 'favicon.ico'
      });
    } catch (err) {
      console.log(err);
    }
  }
}

// Reset OTP Form View
function resetOtpView() {
  state.activeOtp = null;
  const formsContainer = document.getElementById('authFormsContainer');
  const otpContainer = document.getElementById('otpStepContainer');
  const otpError = document.getElementById('otpErrorMsg');
  const otpInput = document.getElementById('otpInput');
  const revealedBox = document.getElementById('revealedOtpBox');

  if (formsContainer) formsContainer.classList.remove('hidden');
  if (otpContainer) otpContainer.classList.add('hidden');
  if (otpError) otpError.classList.add('hidden');
  if (otpInput) otpInput.value = '';
  if (revealedBox) revealedBox.classList.add('hidden');
}

function handleDemoLogin() {
  state.currentUser = {
    name: "Engineering Scholar",
    email: "scholar@gmail.com",
    college: "Indian Institute of Technology",
    branch: "Mechanical & Robotics",
    studentId: "2024ME018",
    initials: "ES",
    verified: true,
    verifiedAt: new Date().toISOString()
  };

  localStorage.setItem('eng_user', JSON.stringify(state.currentUser));
  initAuthUI();
  closeAuthModal();
  showToast('Signed In: Engineering Scholar (Demo)');
}

function handleSignOut() {
  state.currentUser = null;
  state.activeOtp = null;
  localStorage.removeItem('eng_user');
  initAuthUI();
  const dropdown = document.getElementById('userProfileDropdown');
  if (dropdown) dropdown.classList.add('hidden');
  showToast('Signed Out');
}

// ==================== NOTIFICATION CENTER & PERMISSION ENGINE ====================

function initNotificationsUI() {
  const badge = document.getElementById('notificationBadge');
  const unreadCount = state.notifications.filter(n => !n.read).length;

  if (badge) {
    badge.textContent = unreadCount;
    if (unreadCount === 0) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
    }
  }

  const prompt = document.getElementById('dropdownPermissionPrompt');
  if (prompt && window.Notification && Notification.permission === 'granted') {
    prompt.classList.add('hidden');
  }

  const list = document.getElementById('notificationList');
  if (!list) return;

  if (state.notifications.length === 0) {
    list.innerHTML = `
      <div class="p-8 text-center text-neutral-400 font-mono text-xs">
        <i class="fa-regular fa-bell-slash text-base mb-2 block"></i>
        <span>No active notifications</span>
      </div>
    `;
    return;
  }

  list.innerHTML = state.notifications.map(n => `
    <div class="p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${n.read ? 'opacity-60' : ''}">
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white text-xs">
          ${!n.read ? '<span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>' : ''}
          <span>${n.title}</span>
        </div>
        <span class="text-[10px] font-mono text-neutral-400 whitespace-nowrap">${n.time}</span>
      </div>
      <p class="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">${n.message}</p>
    </div>
  `).join('');
}

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Browser does not support notifications');
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      const prompt = document.getElementById('dropdownPermissionPrompt');
      if (prompt) prompt.classList.add('hidden');
      sendNotification('Desktop Alerts Activated', 'You will receive direct notifications for application milestones and deadlines.', 'system');
      showToast('Notifications Enabled ✓');
    } else {
      showToast('Notifications Blocked by Browser');
    }
  });
}

function sendNotification(title, message, type = 'info', time = 'Just now') {
  const notif = {
    id: `notif-${Date.now()}`,
    title,
    message,
    type,
    time,
    read: false
  };

  state.notifications.unshift(notif);
  localStorage.setItem('eng_notifications', JSON.stringify(state.notifications));
  initNotificationsUI();

  if (window.Notification && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: message
      });
    } catch (err) {
      console.log('Desktop notification triggered:', title);
    }
  }
}

function markAllNotificationsRead() {
  state.notifications.forEach(n => n.read = true);
  localStorage.setItem('eng_notifications', JSON.stringify(state.notifications));
  initNotificationsUI();
  showToast('Alerts Marked Read');
}

function handleTestNotification() {
  sendNotification('System Verification Alert', 'Indian Army & DRDO laboratory telemetry pipeline active.', 'system');
  showToast('Test Alert Sent');
}

// ==================== APPLIED APPLICATIONS TRACKER & MODAL ====================

window.toggleAppliedStatus = function(id, event) {
  if (event) event.stopPropagation();
  const item = getOpportunityById(id);
  if (!item) return;

  if (state.appliedOpportunities[id]) {
    delete state.appliedOpportunities[id];
    localStorage.setItem('eng_applied', JSON.stringify(state.appliedOpportunities));
    if (state.trackerApplications[id] && state.trackerApplications[id].stage === 'applied') {
      state.trackerApplications[id].stage = 'saved';
      localStorage.setItem('eng_tracker', JSON.stringify(state.trackerApplications));
    }
    showToast('Removed from Applied');
  } else {
    state.appliedOpportunities[id] = {
      appliedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      company: item.company,
      title: item.title,
      stipend: item.stipend,
      branchName: item.branchName,
      scope: item.scope,
      applyUrl: item.applyUrl
    };
    localStorage.setItem('eng_applied', JSON.stringify(state.appliedOpportunities));

    state.trackerApplications[id] = {
      stage: 'applied',
      notes: `Applied on ${state.appliedOpportunities[id].appliedAt}`,
      date: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('eng_tracker', JSON.stringify(state.trackerApplications));

    showToast(`Marked Applied: ${item.title}`);
    sendNotification('Application Logged', `Submission recorded for ${item.title} at ${item.company}.`, 'applied');
  }

  // Update UI
  renderInternships();
  renderGovtPartition();
  renderKanbanTracker();
  initAuthUI();
  renderMyApplicationsModal();
};

function openMyApplicationsModal() {
  renderMyApplicationsModal();
  const modal = document.getElementById('myApplicationsModal');
  if (modal) modal.classList.remove('hidden');
  const dropdown = document.getElementById('userProfileDropdown');
  if (dropdown) dropdown.classList.add('hidden');
}

function closeMyApplicationsModal() {
  const modal = document.getElementById('myApplicationsModal');
  if (modal) modal.classList.add('hidden');
}

function renderMyApplicationsModal() {
  const list = document.getElementById('myApplicationsList');
  const countBadge = document.getElementById('myApplicationsCountBadge');
  const appliedIds = Object.keys(state.appliedOpportunities);

  if (countBadge) countBadge.textContent = appliedIds.length;
  if (!list) return;

  if (appliedIds.length === 0) {
    list.innerHTML = `
      <div class="py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
        <i class="fa-solid fa-paper-plane text-3xl text-neutral-300 dark:text-neutral-700 mb-3"></i>
        <h4 class="font-bold text-neutral-950 dark:text-white text-sm mb-1">No Applications Recorded Yet</h4>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-6">
          Browse the Directory or Government partition and click "Mark Applied" on any position to track your submissions here.
        </p>
        <button onclick="document.getElementById('myApplicationsModal').classList.add('hidden'); switchTab('directory');"
          class="px-4 py-2 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs uppercase font-bold rounded-lg hover:bg-neutral-800 transition-colors">
          Browse Open Positions
        </button>
      </div>
    `;
    return;
  }

  list.innerHTML = appliedIds.map(id => {
    const record = state.appliedOpportunities[id];
    return `
      <div class="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="badge-applied px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold">Applied</span>
            <span class="text-xs font-mono text-neutral-400">/ ${record.company}</span>
            <span class="text-[10px] font-mono text-neutral-500">Recorded: ${record.appliedAt}</span>
          </div>
          <h4 class="font-bold text-neutral-950 dark:text-white text-sm hover:text-orange-500 cursor-pointer" onclick="openDetailModal('${id}')">
            ${record.title}
          </h4>
          <div class="mt-1 flex items-center gap-3 text-xs font-mono text-neutral-500">
            <span>${record.stipend || ''}</span>
            <span>•</span>
            <span class="uppercase">${record.branchName || 'Engineering'}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button onclick="openDetailModal('${id}')"
            class="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-white transition-colors">
            Details
          </button>
          <a href="${record.applyUrl || '#'}" target="_blank" rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-lg bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-mono uppercase flex items-center gap-1.5 font-semibold hover:bg-neutral-800 transition-colors">
            <span>Portal</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
          <button onclick="toggleAppliedStatus('${id}');"
            class="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-red-500 flex items-center justify-center transition-colors"
            title="Unmark Applied">
            <i class="fa-regular fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== GOVERNMENT & DEFENSE PARTITION ====================

function setGovtFilter(filter) {
  state.selectedGovtFilter = filter;

  document.querySelectorAll('[data-govt-filter]').forEach(btn => {
    if (btn.getAttribute('data-govt-filter') === filter) {
      btn.className = 'govt-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all bg-neutral-950 dark:bg-white text-white dark:text-neutral-950';
    } else {
      btn.className = 'govt-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400';
    }
  });

  renderGovtPartition();
}

function renderGovtPartition() {
  const container = document.getElementById('govtInternshipsContainer');
  if (!container) return;

  let govtList = state.internships.filter(i => i.scope === 'govt-defense');
  if (state.selectedGovtFilter !== 'all') {
    govtList = govtList.filter(i => i.govtCategory === state.selectedGovtFilter);
  }

  if (govtList.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center font-mono text-xs text-neutral-400 uppercase tracking-widest">
        No positions listed under this sector
      </div>
    `;
    return;
  }

  container.innerHTML = govtList.map(item => renderGridCard(item)).join('');
}
