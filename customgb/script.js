import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://twvtjoehfbzusmfaisum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_erf69vfCX7qHMafcXo1FSw_MP_xGrza';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const OWNER_AVATAR_URL = 'https://avatars.githubusercontent.com/u/176790056?s=200&v=4';

let activeReplyId = null;
let activeReplyTable = 'guestbook';

function getPageFromHash() {
  const match = window.location.hash.match(/^#page(\d+)$/i);
  return match ? Math.max(1, parseInt(match[1], 10)) : 1;
}

let currentPage = getPageFromHash();
const pageSize = 10;
let isNewSubmission = false; 

const appDialogQueue = [];
let activeAppDialog = null;

function showNextAppDialog() {
  if (activeAppDialog || !appDialogQueue.length) return;

  const dialog = appDialogQueue.shift();
  const modal = document.getElementById("app-dialog-modal");
  activeAppDialog = dialog;
  dialog.opener = document.activeElement;

  document.getElementById("app-dialog-title").textContent = dialog.title;
  document.getElementById("app-dialog-message").textContent = dialog.message;
  document.getElementById("app-dialog-cancel").hidden = !dialog.confirm;
  document.getElementById("app-dialog-cancel").textContent = dialog.cancelLabel;
  document.getElementById("app-dialog-ok").textContent = dialog.confirmLabel;
  modal.style.display = "flex";
  document.getElementById("app-dialog-ok").focus();
}

function finishAppDialog(result) {
  if (!activeAppDialog) return;

  const dialog = activeAppDialog;
  activeAppDialog = null;
  document.getElementById("app-dialog-modal").style.display = "none";
  dialog.resolve(result);
  if (dialog.opener && dialog.opener.isConnected && typeof dialog.opener.focus === "function") {
    dialog.opener.focus();
  }
  setTimeout(showNextAppDialog, 0);
}

function showAppDialog(message, options = {}) {
  return new Promise(resolve => {
    appDialogQueue.push({
      message: String(message),
      title: options.title || (options.confirm ? "Confirm" : "Alert"),
      confirm: Boolean(options.confirm),
      confirmLabel: options.confirmLabel || (options.confirm ? "Yes" : "OK"),
      cancelLabel: options.cancelLabel || "Cancel",
      resolve
    });
    showNextAppDialog();
  });
}

function showAppAlert(message, title = "Alert") {
  return showAppDialog(message, { title });
}

function showAppConfirm(message, confirmLabel = "Yes") {
  return showAppDialog(message, { confirm: true, confirmLabel });
}

document.getElementById("app-dialog-ok")?.addEventListener("click", () => finishAppDialog(true));
document.getElementById("app-dialog-cancel")?.addEventListener("click", () => finishAppDialog(false));
document.getElementById("app-dialog-close")?.addEventListener("click", () => {
  finishAppDialog(activeAppDialog ? !activeAppDialog.confirm : false);
});
document.addEventListener("keydown", event => {
  if (!activeAppDialog) return;
  if (event.key === "Escape") {
    event.preventDefault();
    finishAppDialog(!activeAppDialog.confirm);
  } else if (event.key === "Enter") {
    event.preventDefault();
    finishAppDialog(true);
  }
});

// ==========================================
// SUPABASE AUTH & SESSION MANAGEMENT
// ==========================================
async function checkAdminSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    document.body.classList.add('is-admin');
  } else {
    document.body.classList.remove('is-admin');
  }
}

// RUN SESSION CHECK ON LOAD
checkAdminSession();

// LISTEN FOR LOGIN/LOGOUT STATE CHANGES AUTOMATICALLY ACROSS TABS/SESSIONS
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    document.body.classList.add('is-admin');
  } else {
    document.body.classList.remove('is-admin');
  }
});

// LIVE TASKBAR CLOCK
const manilaClockFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Manila'
});

function updateClock() {
  const now = new Date();
  const localClock = document.getElementById('xp-local-clock');
  const clockTooltip = document.getElementById('xp-clock-tooltip');
  if (!localClock || !clockTooltip) return;

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  localClock.textContent = `${hours}:${minutes} ${ampm}`;
  clockTooltip.textContent = `R'S TIMEZONE: ${manilaClockFormatter.format(now)} PHT (GMT+8)`;
}
setInterval(updateClock, 1000);
updateClock();

// START MENU TOGGLE
window.toggleStartMenu = function() {
  const menu = document.getElementById('xp-start-menu');
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
}
window.addEventListener('click', (e) => {
  if (!e.target.closest('.xp-start-menu') && !e.target.closest('.xp-start-btn')) {
    const menu = document.getElementById('xp-start-menu');
    if (menu) menu.style.display = 'none';
  }
});

// FIXED CLICK SOUND
document.addEventListener('click', (e) => {
  if (e.target.closest('button, a')) {
    const sound = document.getElementById('click-sound');
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }
});

// ASMR KEYBOARD SOUND
const msgTextarea = document.getElementById('gb-message');
if (msgTextarea) {
  msgTextarea.addEventListener('keydown', (e) => {
    if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') {
      const typeSound = document.getElementById('type-sound');
      if (typeSound) {
        typeSound.currentTime = 0;
        typeSound.play().catch(() => {});
      }
    }
  });
}

const EMOJI_MAP = {
':smile:': '<img src="emoticons/smile.gif" class="custom-emoji" alt="smile">',
  ':laugh:': '<img src="emoticons/laugh.gif" class="custom-emoji" alt="laugh">',
  ':tu:': '<img src="emoticons/tu.gif" class="custom-emoji" alt="tu">',
  ':td:': '<img src="emoticons/td.gif" class="custom-emoji" alt="td">',
  ':wink:': '<img src="emoticons/wink.gif" class="custom-emoji" alt="wink">',
  ':p:': '<img src="emoticons/p.gif" class="custom-emoji" alt="p">',
  ':bownita:': '<img src="emoticons/bownita.gif" class="custom-emoji" alt="bownita">',
  ':ty:': '<img src="emoticons/ty.gif" class="custom-emoji" alt="ty">',
  ':puzzled:': '<img src="emoticons/puzzled.gif" class="custom-emoji" alt="puzzled">',
  ':shock:': '<img src="emoticons/shock.gif" class="custom-emoji" alt="shock">',
  ':grin:': '<img src="emoticons/grin.gif" class="custom-emoji" alt="grin">',
  ':blush:': '<img src="emoticons/blush.gif" class="custom-emoji" alt="blush">',
  ':worry:': '<img src="emoticons/worry.gif" class="custom-emoji" alt="worry">',
  ':nono:': '<img src="emoticons/nono.gif" class="custom-emoji" alt="nono">',
  ':sad:': '<img src="emoticons/sad.gif" class="custom-emoji" alt="sad">',
  ':awesomesauce:': '<img src="emoticons/awesomesauce.gif" class="custom-emoji" alt="awesomesauce">',
  ':mad:': '<img src="emoticons/mad.gif" class="custom-emoji" alt="mad">',
  ':cheers:': '<img src="emoticons/cheers.gif" class="custom-emoji" alt="cheers">',
  ':groovy:': '<img src="emoticons/groovy.gif" class="custom-emoji" alt="groovy">',
  ':bleh:': '<img src="emoticons/bleh.gif" class="custom-emoji" alt="bleh">',
  ':x:': '<img src="emoticons/x.gif" class="custom-emoji" alt="x">',
  ':kneel:': '<img src="emoticons/kneel.gif" class="custom-emoji" alt="kneel">',
  ':snorkmimi:': '<img src="emoticons/snorkmimi.gif" class="custom-emoji" alt="snorkmimi">',
  ':x_x:': '<img src="emoticons/x_x.gif" class="custom-emoji" alt="x_x">',
  ':wave:': '<img src="emoticons/wave.gif" class="custom-emoji" alt="wave">',
  ':luv:': '<img src="emoticons/luv.gif" class="custom-emoji" alt="luv">',
  ':taptap:': '<img src="emoticons/taptap.gif" class="custom-emoji" alt="taptap">',
  ':daydream:': '<img src="emoticons/daydream.png" class="custom-emoji" alt="daydream">',
  ':bouncey:': '<img src="emoticons/bouncey.gif" class="custom-emoji" alt="bouncey">',
  ':rose:': '<img src="emoticons/rose.gif" class="custom-emoji" alt="rose">',
  ':twitch:': '<img src="emoticons/twitch.gif" class="custom-emoji" alt="twitch">',
  ':pimp:': '<img src="emoticons/pimp.gif" class="custom-emoji" alt="pimp">',
  ':kiss:': '<img src="emoticons/kiss.gif" class="custom-emoji" alt="kiss">',
  ':cry:': '<img src="emoticons/cry.gif" class="custom-emoji" alt="cry">',
  ':smoke:': '<img src="emoticons/smoke.gif" class="custom-emoji" alt="smoke">',
  ':walkin:': '<img src="emoticons/walkin.gif" class="custom-emoji" alt="walkin">',
  ':drool:': '<img src="emoticons/drool.gif" class="custom-emoji" alt="drool">',
  ':silly:': '<img src="emoticons/silly.gif" class="custom-emoji" alt="silly">',
  ':uaa:': '<img src="emoticons/uaa.gif" class="custom-emoji" alt="uaa">'
};

window.toggleEmojiDropdown = function() {
  const dd = document.getElementById('emoji-dropdown');
  if (dd) dd.style.display = dd.style.display === 'grid' ? 'none' : 'grid';
};

window.addEventListener('click', (e) => {
  if (!e.target.closest('.toolbar')) {
    const dd = document.getElementById('emoji-dropdown');
    if (dd) dd.style.display = 'none';
  }
});

window.insertTag = function(startTag, endTag) {
  const textarea = document.getElementById('gb-message');
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  textarea.value = textarea.value.substring(0, start) + startTag + selectedText + endTag + textarea.value.substring(end);
  textarea.focus();
};

window.insertEmoji = function(code) {
  const msgInput = document.getElementById('gb-message');
  if (!msgInput) return;
  msgInput.value += ` ${code} `;
  const dd = document.getElementById('emoji-dropdown');
  if (dd) dd.style.display = 'none';
  msgInput.focus();
};

window.openImageModal = () => {
  const modal = document.getElementById('image-modal');
  if (modal) modal.style.display = 'flex';
};
window.closeImageModal = () => {
  const modal = document.getElementById('image-modal');
  if (modal) modal.style.display = 'none';
  const urlInput = document.getElementById('modal-img-url');
  if (urlInput) urlInput.value = '';
};
window.confirmImageEmbed = () => {
  const urlInput = document.getElementById('modal-img-url');
  const url = urlInput ? urlInput.value.trim() : '';
  if (url) window.insertTag(`[img]${url}[/img]`, '');
  window.closeImageModal();
};

window.openPreviewModal = async () => {
  const rawMessage = document.getElementById('gb-message')?.value || '';
  if (!rawMessage.trim()) {
    await showAppAlert('what are you gonna preview with a blank message?');
    return;
  }

  const name = document.getElementById('gb-name')?.value.trim() || 'Anonymous';
  const github = document.getElementById('gb-github')?.value;
  const favSong = document.getElementById('gb-fav-song')?.value;
  const avatar = document.getElementById('gb-avatar')?.value.trim();
  const message = rawMessage;

  const titleIcon = document.getElementById('preview-avatar-title');
  if (titleIcon) {
    if (avatar) {
      titleIcon.src = avatar;
      titleIcon.style.display = 'inline-block';
    } else {
      titleIcon.style.display = 'none';
    }
  }

  const previewNameContainer = document.getElementById('preview-name-container');
  if (previewNameContainer) {
    if (avatar) {
      previewNameContainer.innerHTML = `<div class="entry-name-container"><img src="${avatar}" class="entry-name-avatar"><span>${name}</span></div>`;
    } else {
      previewNameContainer.textContent = name;
    }
  }

  const previewDate = document.getElementById('preview-date');
  if (previewDate) {
    previewDate.textContent = new Date().toLocaleDateString('en-US', {
      month: 'long', day: '2-digit', year: 'numeric'
    });
  }

  const githubRow = document.getElementById('preview-github-row');
  if (githubRow) {
    if (github) {
      const githubEl = document.getElementById('preview-github');
      if (githubEl) githubEl.textContent = github;
      githubRow.style.display = 'flex';
    } else {
      githubRow.style.display = 'none';
    }
  }

  const songRow = document.getElementById('preview-song-row');
  if (songRow) {
    if (favSong) {
      const songEl = document.getElementById('preview-song');
      if (songEl) songEl.textContent = favSong;
      songRow.style.display = 'flex';
    } else {
      songRow.style.display = 'none';
    }
  }

  const previewBody = document.getElementById('preview-body');
  if (previewBody) previewBody.innerHTML = parseMessageText(message);

  const previewModal = document.getElementById('preview-modal');
  if (previewModal) previewModal.style.display = 'flex';
};

window.closePreviewModal = () => {
  const modal = document.getElementById('preview-modal');
  if (modal) modal.style.display = 'none';
};

// ABOUT SYSTEM MODAL HANDLERS
window.openAboutModal = () => {
  const modal = document.getElementById('about-modal');
  if (modal) modal.style.display = 'flex';
};
window.closeAboutModal = () => {
  const video = document.getElementById('about-video-player');
  if (video) video.pause();
  const modal = document.getElementById('about-modal');
  if (modal) modal.style.display = 'none';
};

window.openOekakiHelpModal = () => {
  const modal = document.getElementById('oekaki-help-modal');
  if (modal) modal.style.display = 'flex';
};
window.closeOekakiHelpModal = () => {
  const modal = document.getElementById('oekaki-help-modal');
  if (modal) modal.style.display = 'none';
  document.getElementById('oekaki-help-menu')?.focus();
};

// ADMIN LOG ON DIALOG HANDLERS
window.openAdminAuthModal = () => {
  const modal = document.getElementById('admin-auth-modal');
  if (modal) {
    modal.style.display = 'flex';
    const emailInput = document.getElementById('admin-email-input');
    const passInput = document.getElementById('admin-pass-input');
    if (emailInput) emailInput.focus();
    if (passInput) passInput.value = '';
  }
};

window.closeAdminAuthModal = () => {
  const modal = document.getElementById('admin-auth-modal');
  if (modal) modal.style.display = 'none';
  const passInput = document.getElementById('admin-pass-input');
  if (passInput) passInput.value = '';
};

window.submitAdminAuth = async () => {
  const emailInput = document.getElementById('admin-email-input');
  const passInput = document.getElementById('admin-pass-input');
  
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passInput ? passInput.value : '';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    await showAppAlert("Login failed: " + error.message, "Login Error");
    if (passInput) {
      passInput.value = '';
      passInput.focus();
    }
  } else {
    document.body.classList.add('is-admin');
    await showAppAlert("Successfully logged in as Admin!");
    closeAdminAuthModal();
  }
};

const adminPassInput = document.getElementById('admin-pass-input');
if (adminPassInput) {
  adminPassInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      window.submitAdminAuth();
    }
  });
}

window.openReplyModal = (id, currentHtml, table = 'guestbook') => {
  activeReplyId = id;
  activeReplyTable = table;
  const textarea = document.getElementById('modal-reply-html');
  if (textarea) {
    textarea.value = currentHtml || '';
    updateReplyPreview(textarea.value);
  }
  const modal = document.getElementById('reply-modal');
  if (modal) modal.style.display = 'flex';
};

window.closeReplyModal = () => {
  const modal = document.getElementById('reply-modal');
  if (modal) modal.style.display = 'none';
  const textarea = document.getElementById('modal-reply-html');
  if (textarea) textarea.value = '';
  const output = document.getElementById('reply-preview-output');
  if (output) {
    output.innerHTML = '(Type something above to preview...)';
    output.style.color = '#444';
    output.style.fontStyle = 'italic';
  }
  activeReplyId = null;
};

const replyTextarea = document.getElementById('modal-reply-html');
if (replyTextarea) {
  replyTextarea.addEventListener('input', (e) => {
    updateReplyPreview(e.target.value);
  });
}

function updateReplyPreview(val) {
  const output = document.getElementById('reply-preview-output');
  if (!output) return;
  if (!val.trim()) {
    output.innerHTML = '(Type something above to preview...)';
    output.style.color = '#444';
    output.style.fontStyle = 'italic';
  } else {
    output.innerHTML = val;
    output.style.color = '#000';
    output.style.fontStyle = 'normal';
  }
}

window.confirmReplySubmit = async () => {
  const textarea = document.getElementById('modal-reply-html');
  const htmlReply = textarea ? textarea.value : '';
  if (activeReplyId) {
    const { error } = await supabase
      .from(activeReplyTable)
      .update({ reply_html: htmlReply })
      .eq('id', activeReplyId);
    if (error) {
      await showAppAlert("Error saving reply: " + error.message, "Error");
    } else {
      if (activeReplyTable === 'oekaki') loadOekakiGallery();
      else loadEntries();
    }
  }
  window.closeReplyModal();
};

function parseMessageText(text) {
  let safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  for (const [code, imgTag] of Object.entries(EMOJI_MAP)) {
    safe = safe.split(code).join(imgTag);
  }
  safe = safe.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>');
  safe = safe.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>');
  safe = safe.replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<span style="color: $1;">$2</span>');
  safe = safe.replace(/\[font=(.*?)\](.*?)\[\/font\]/gi, '<span style="font-family: $1;">$2</span>');
  safe = safe.replace(/\[size=(.*?)\](.*?)\[\/size\]/gi, '<span style="font-size: $1;">$2</span>');
  safe = safe.replace(/\[img\](https?:\/\/[^\s]+)\[\/img\]/gi, '<img src="$1" alt="image">');
  return safe.replace(/\n/g, '<br>');
}

window.changePage = function(direction) {
  const container = document.getElementById('entries-container');
  const oekakiGallery = document.getElementById('oekaki-gallery');
  currentPage += direction;
  
  history.pushState(null, '', `#page${currentPage}`);
  window.scrollTo({ top: 400, behavior: 'smooth' });

  if (container) {
    container.classList.remove('page-enter');
    container.classList.add('page-exit');
  }
  if (oekakiGallery) {
    oekakiGallery.classList.remove('page-enter');
    oekakiGallery.classList.add('page-exit');
  }

  setTimeout(() => {
    loadEntries(true);
  }, 180);
}

// HANDLE BROWSER BACK/FORWARD NAVIGATION OR DIRECT HASH INPUTS
window.addEventListener('hashchange', () => {
  const targetPage = getPageFromHash();
  if (targetPage !== currentPage) {
    currentPage = targetPage;
    const container = document.getElementById('entries-container');
    const oekakiGallery = document.getElementById('oekaki-gallery');
    
    if (container) {
      container.classList.remove('page-enter');
      container.classList.add('page-exit');
    }
    if (oekakiGallery) {
      oekakiGallery.classList.remove('page-enter');
      oekakiGallery.classList.add('page-exit');
    }

    setTimeout(() => {
      loadEntries(true);
    }, 180);
  }
});

async function loadEntries(animateTransition = false) {
  const container = document.getElementById('entries-container');
  const paginationContainer = document.getElementById('pagination-container');
  if (!container) return;

  const { count, error: countError } = await supabase.from('guestbook').select('*', { count: 'exact', head: true });
  if (countError) {
    container.classList.remove('page-exit');
    container.innerHTML = `<p style="color:red; text-shadow:1px 1px 0 #fff;">Error loading count: ${countError.message}</p>`;
    loadOekakiGallery(animateTransition);
    return;
  }

  const totalPages = Math.ceil((count || 0) / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // KEEP URL HASH SYNCHRONIZED IF CLAMPED OUT-OF-RANGE
  if (window.location.hash !== `#page${currentPage}`) {
    history.replaceState(null, '', `#page${currentPage}`);
  }

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase.from('guestbook')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    container.classList.remove('page-exit');
    container.innerHTML = `<p style="color:red; text-shadow:1px 1px 0 #fff;">Error loading entries: ${error.message}</p>`;
    loadOekakiGallery(animateTransition);
    return;
  }

  if (data.length === 0) {
    container.classList.remove('page-exit');
    container.innerHTML = '<p style="color: #fff; text-shadow:1px 1px 2px #000;">No messages yet. Be the first to sign!</p>';
    if (paginationContainer) paginationContainer.innerHTML = '';
    loadOekakiGallery(animateTransition);
    return;
  }

  container.innerHTML = '';
  data.forEach((entry, index) => {
    const el = document.createElement('div');
    el.className = 'window resizable-window';

    if (currentPage === 1 && index === 0 && isNewSubmission) {
      el.classList.add('window-popup-anim');
    }

    const hasAvatar = entry.email && entry.email.trim() !== '';
    const titleBarImgHtml = hasAvatar ? `<img src="${entry.email}" class="user-avatar-icon">` : '';
    
    const nameHtml = hasAvatar 
      ? `<div class="entry-name-container"><img src="${entry.email}" class="entry-name-avatar"><span>${entry.name}</span></div>` 
      : entry.name;

    const entryDate = new Date(entry.created_at);
    const isLegacy = entryDate.getFullYear() < 2026;

    const formattedDate = entryDate.toLocaleDateString('en-US', {
      month: 'long', day: '2-digit', year: 'numeric'
    });

    const legacyBannerHtml = isLegacy 
      ? `<div class="legacy-archive-banner">LEGACY ARCHIVE - Carried over from ULTRAGUEST</div>` 
      : '';

    el.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text">
          ${titleBarImgHtml} ${isLegacy ? 'legacy_mail.exe' : 'you got mail.exe'}
        </div>
        <div class="title-bar-controls">
          <button aria-label="Close"></button>
        </div>
      </div>
      <div class="window-body">
        ${legacyBannerHtml}
        <div class="entry-field">
          <span class="entry-label">Name :</span>
          <span class="entry-value">${nameHtml}</span>
        </div>
        <div class="entry-field"><span class="entry-label">Date :</span><span class="entry-value">${formattedDate}</span></div>
        ${entry.user_url ? `<div class="entry-field"><span class="entry-label">github :</span><span class="entry-value">${entry.user_url}</span></div>` : ''}
        ${entry.fav_song ? `<div class="entry-field"><span class="entry-label">fav song? :</span><span class="entry-value">${entry.fav_song}</span></div>` : ''}
        
        <div class="entry-field" style="margin-top:10px;">
          <span class="entry-label">Message:</span>
          <div class="entry-value entry-message-body">${parseMessageText(entry.message)}</div>
        </div>

        ${entry.reply_html ? `
          <div class="owner-reply">
            <img src="${OWNER_AVATAR_URL}" class="owner-avatar">
            <div class="reply-content"><span class="reply-prefix">R:</span>${entry.reply_html}</div>
          </div>
        ` : ''}

        <div class="admin-actions">
          <button class="admin-btn reply-html-btn">Reply HTML</button>
          <button class="admin-btn" onclick="deleteEntry('${entry.id}')" style="background:#f2acac;">Delete</button>
        </div>
      </div>
      <!-- WINDOWS XP RESIZE HANDLE -->
      <div class="window-resizer"></div>
    `;
    container.appendChild(el);
    el.querySelector('.reply-html-btn')?.addEventListener('click', () => {
      window.openReplyModal(entry.id, entry.reply_html || '');
    });
  });

container.classList.remove('page-exit');
  if (animateTransition) {
    void container.offsetWidth; 
    container.classList.add('page-enter');
    
    setTimeout(() => {
      container.classList.remove('page-enter');
    }, 300);
  }

  if (paginationContainer) {
    paginationContainer.innerHTML = `
      <div class="pagination-controls">
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>&lt;&lt; Prev</button>
        <span class="page-indicator">Page ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(1)" ${currentPage === totalPages ? 'disabled' : ''}>Next &gt;&gt;</button>
      </div>
    `;
  }

  isNewSubmission = false;
  loadOekakiGallery(animateTransition);
}

const gbForm = document.getElementById('gb-form');
if (gbForm) {
  gbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const rawMessage = document.getElementById('gb-message')?.value || '';
    if (!rawMessage.trim()) {
      await showAppAlert('dude you can\'t send a blank message, cmon');
      return;
    }

    const rawName = document.getElementById('gb-name')?.value;
    const name = (rawName && rawName.trim() !== '') ? rawName.trim() : 'Anonymous';

    const user_url = document.getElementById('gb-github')?.value;
    const fav_song = document.getElementById('gb-fav-song')?.value;
    const avatar = document.getElementById('gb-avatar')?.value;
    const message = rawMessage.trim();

    const { error } = await supabase.from('guestbook').insert([{ 
      name: name, 
      email: avatar || null, 
      user_url: user_url || null, 
      fav_song: fav_song || null,
      message: message 
    }]);

    if (error) {
      await showAppAlert('Error sending message: ' + error.message, "Error");
    } else {
      document.getElementById('gb-message').value = '';
      document.getElementById('gb-name').value = '';
      document.getElementById('gb-github').value = '';
      document.getElementById('gb-fav-song').value = '';
      document.getElementById('gb-avatar').value = '';
      currentPage = 1;
      history.replaceState(null, '', '#page1');
      
      const dingSound = document.getElementById('ding-sound');
      if (dingSound) {
        dingSound.currentTime = 0;
        dingSound.play().catch(() => {});
      }

      isNewSubmission = true;
      loadEntries();
    }
  });
}

window.deleteEntry = async function(id) {
  if (await showAppConfirm("Are you sure you want to delete this message?", "Delete")) {
    const { error } = await supabase.from('guestbook').delete().eq('id', id);
    if (error) await showAppAlert("Error deleting: " + error.message, "Error");
    else loadEntries();
  }
};

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    window.openAdminAuthModal();
  }
});

let headerClicks = 0;
let headerClickTimer = null;
const xpStartHeader = document.getElementById('xp-start-header');
if (xpStartHeader) {
  xpStartHeader.addEventListener('click', () => {
    headerClicks++;
    clearTimeout(headerClickTimer);
    if (headerClicks >= 5) {
      headerClicks = 0;
      window.toggleStartMenu();
      window.openAdminAuthModal();
    } else {
      headerClickTimer = setTimeout(() => { headerClicks = 0; }, 1500);
    }
  });
}

loadEntries();

window.openColorPicker = function() {
  const fontDd = document.getElementById('font-dropdown');
  const sizeDd = document.getElementById('size-dropdown');
  if (fontDd) fontDd.style.display = 'none';
  if (sizeDd) sizeDd.style.display = 'none';
  
  const colorPicker = document.getElementById('native-color-picker');
  if (colorPicker) {
    colorPicker.click();
  }
};

window.insertCustomColor = function(colorHex) {
  window.insertTag(`[color=${colorHex}]`, '[/color]');
};

window.toggleFontDropdown = function() {
  const dd = document.getElementById('font-dropdown');
  const sizeDd = document.getElementById('size-dropdown');
  if (sizeDd) sizeDd.style.display = 'none';
  if (dd) dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
};

window.toggleSizeDropdown = function() {
  const dd = document.getElementById('size-dropdown');
  const fontDd = document.getElementById('font-dropdown');
  if (fontDd) fontDd.style.display = 'none';
  if (dd) dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
};

window.addEventListener('click', (e) => {
  if (!e.target.closest('.toolbar')) {
    const fontDd = document.getElementById('font-dropdown');
    const sizeDd = document.getElementById('size-dropdown');
    if (fontDd) fontDd.style.display = 'none';
    if (sizeDd) sizeDd.style.display = 'none';
  }
});

window.insertFont = function(fontName) {
  window.insertTag(`[font=${fontName}]`, '[/font]');
  const dd = document.getElementById('font-dropdown');
  if (dd) dd.style.display = 'none';
};

window.insertSize = function(sizeVal) {
  window.insertTag(`[size=${sizeVal}]`, '[/size]');
  const dd = document.getElementById('size-dropdown');
  if (dd) dd.style.display = 'none';
};

// ==========================================
// DRAGGING & RESIZING WINDOWS XP MECHANICS
// ==========================================
(function() {
  let activeDragWindow = null;
  let activeResizeWindow = null;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  let initialWidth = 0, initialHeight = 0;
  let highestZIndex = 50;

  function getPointerPosition(e) {
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    return {
      x: touch ? touch.clientX : e.clientX,
      y: touch ? touch.clientY : e.clientY
    };
  }

  function startDragOrResize(e) {
    // CHECK FOR RESIZE HANDLE
    const resizer = e.target.closest('.window-resizer');
    if (resizer) {
      const windowEl = resizer.closest('.window');
      if (!windowEl) return;

      activeResizeWindow = windowEl;
      highestZIndex++;
      activeResizeWindow.style.zIndex = highestZIndex;

      if (activeResizeWindow.style.position !== 'absolute') {
        const rect = activeResizeWindow.getBoundingClientRect();
        activeResizeWindow.style.position = 'absolute';
        activeResizeWindow.style.left = rect.left + window.scrollX + 'px';
        activeResizeWindow.style.top = rect.top + window.scrollY + 'px';
        activeResizeWindow.style.width = rect.width + 'px';
        activeResizeWindow.style.height = rect.height + 'px';
        activeResizeWindow.style.transform = 'none';
      }

      const pointer = getPointerPosition(e);
      startX = pointer.x;
      startY = pointer.y;
      initialWidth = activeResizeWindow.offsetWidth;
      initialHeight = activeResizeWindow.offsetHeight;

      e.preventDefault();
      return;
    }

    // CHECK FOR TITLE BAR DRAGGING
    const titleBar = e.target.closest('#entries-container .title-bar');
    if (!titleBar) return;
    if (e.target.closest('button')) return;

    const windowEl = titleBar.closest('.window');
    if (!windowEl) return;

    activeDragWindow = windowEl;
    highestZIndex++;
    activeDragWindow.style.zIndex = highestZIndex;

    if (activeDragWindow.style.position !== 'absolute') {
      const rect = activeDragWindow.getBoundingClientRect();
      activeDragWindow.style.position = 'absolute';
      activeDragWindow.style.left = rect.left + window.scrollX + 'px';
      activeDragWindow.style.top = rect.top + window.scrollY + 'px';
      activeDragWindow.style.width = rect.width + 'px';
      activeDragWindow.style.transform = 'none';
    }

    const pointer = getPointerPosition(e);
    startX = pointer.x;
    startY = pointer.y;

    initialLeft = parseFloat(activeDragWindow.style.left) || 0;
    initialTop = parseFloat(activeDragWindow.style.top) || 0;

    e.preventDefault();
  }

  function onMove(e) {
    if (!activeDragWindow && !activeResizeWindow) return;
    const pointer = getPointerPosition(e);
    if (activeResizeWindow) {
      const dx = pointer.x - startX;
      const dy = pointer.y - startY;

      activeResizeWindow.style.width = Math.max(240, initialWidth + dx) + 'px';
      activeResizeWindow.style.height = Math.max(150, initialHeight + dy) + 'px';
      e.preventDefault();
      return;
    }

    if (activeDragWindow) {
      const dx = pointer.x - startX;
      const dy = pointer.y - startY;

      activeDragWindow.style.left = (initialLeft + dx) + 'px';
      activeDragWindow.style.top = (initialTop + dy) + 'px';
      e.preventDefault();
    }
  }

  function onEnd() {
    activeDragWindow = null;
    activeResizeWindow = null;
  }

  document.addEventListener('mousedown', startDragOrResize);
  document.addEventListener('touchstart', startDragOrResize, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
  document.addEventListener('touchcancel', onEnd);

  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('#entries-container .title-bar-controls button');
    if (!closeBtn) return;

    const windowEl = closeBtn.closest('.window');
    if (!windowEl) return;

    e.preventDefault();
    e.stopPropagation();

    windowEl.style.position = '';
    windowEl.style.left = '';
    windowEl.style.top = '';
    windowEl.style.width = '';
    windowEl.style.height = '';
    windowEl.style.transform = '';
    windowEl.style.zIndex = '';
  });
})();

window.logoutAdmin = async () => {
  if (await showAppConfirm("Are you sure you want to log off from Admin mode?", "Log Off")) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      await showAppAlert("Error logging off: " + error.message, "Error");
    } else {
      document.body.classList.remove('is-admin');
      await showAppAlert("Logged off successfully.");
    }
  }
};

// ==========================================
// OEKAKI BOARD (DRAGGABLE, RESIZABLE, ROTATABLE, CTRL+Z, REPLIES, RECT/FREEFORM SELECT)
// ==========================================

(function () {
  const paintWin = document.getElementById("oekaki-paint-window");
  const titleBar = document.getElementById("oekaki-title-bar");
  const resizer = document.getElementById("oekaki-resizer");
  const resetBtn = document.getElementById("oekaki-reset-pos");
  const canvas = document.getElementById("oekaki-canvas");
  if (!paintWin || !canvas) return;
  const artistLinkToggle = document.getElementById("oekaki-artist-link-toggle");
  const artistUrlField = document.getElementById("oekaki-artist-url-field");
  const artistUrlInput = document.getElementById("oekaki-artist-url");
  function syncArtistUrlField() {
    const enabled = Boolean(artistLinkToggle?.checked);
    if (artistUrlField) artistUrlField.hidden = !enabled;
    if (artistUrlInput) artistUrlInput.disabled = !enabled;
  }
  artistLinkToggle?.addEventListener("change", syncArtistUrlField);
  syncArtistUrlField();

  const wigglyCanvas = document.getElementById("oekaki-wiggly-layer");
  const wigglyCtx = wigglyCanvas.getContext("2d");
  const canvasViewport = document.getElementById("oekaki-canvas-viewport");
  const canvasContainer = document.getElementById("oekaki-canvas-container");

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // SAVE PRIVATE REFERENCE FOR INTERNAL SELECT/ROTATE/SCALE RENDERING, THEN BLOCK EXTERNAL IMAGE PASTING
  const internalDrawImage = ctx.drawImage.bind(ctx);
  ctx.drawImage = function () {
    console.warn("noo >:(");
  };

  // OFFSCREEN CANVAS TO HOLD THE CUT-OUT SELECTION
  const selCanvas = document.createElement("canvas");
  const selCtx = selCanvas.getContext("2d");
  const fillCanvas = document.createElement("canvas");
  const fillCtx = fillCanvas.getContext("2d", { willReadFrequently: true });

  let restoreArray = [];
  let startIndex = -1;
  let isDrawing = false;
  let currentTool = "brush";
  let lastSprayPos = null;
  let activeTextBox = null;
  let textBoxInteraction = null;
  let wigglyStrokes = [];
  let wigglyHistory = [];
  let currentWigglyStroke = null;
  let wigglyAnimationFrame = null;
  let zoomLevel = 1;
  const zoomLevels = [1, 1.5, 2, 3, 4];
  const wigglyFrameCount = 3;
  const wigglyFrameDelay = 10;

  function getWigglyFrameIndex(timestamp) {
    return Math.floor(timestamp / (wigglyFrameDelay * 10)) % wigglyFrameCount;
  }

  function getWigglyNoise(index, frameIndex, seed) {
    const value = Math.sin((index + 1) * 127.1 + (frameIndex + 1) * 311.7 + seed * 74.7) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
  }

  function cloneWigglyStrokes(strokes) {
    return strokes.map(stroke => ({
      ...stroke,
      points: stroke.points.map(point => ({ x: point.x, y: point.y }))
    }));
  }

  function saveHistory() {
    restoreArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    wigglyHistory.push(cloneWigglyStrokes(wigglyStrokes));
    startIndex++;
  }

  function updateSaveMenuLabel() {
    const saveButton = document.getElementById("oekaki-save-png");
    if (saveButton) saveButton.textContent = wigglyStrokes.length ? "Save as GIF..." : "Save as PNG...";
  }

  function syncWigglyLayer() {
    if (wigglyCanvas.width !== canvas.width) wigglyCanvas.width = canvas.width;
    if (wigglyCanvas.height !== canvas.height) wigglyCanvas.height = canvas.height;
    wigglyCanvas.style.left = `${canvas.offsetLeft + 2}px`;
    wigglyCanvas.style.top = `${canvas.offsetTop + 2}px`;
    wigglyCanvas.style.width = `${canvas.clientWidth}px`;
    wigglyCanvas.style.height = `${canvas.clientHeight}px`;
  }

  function drawWigglyStroke(targetCtx, stroke, frameIndex, boundaryPadding = 0) {
    const sourcePoints = stroke.points;
    if (!sourcePoints.length) return;

    targetCtx.save();
    targetCtx.strokeStyle = stroke.color;
    targetCtx.fillStyle = stroke.color;
    targetCtx.lineWidth = stroke.size + boundaryPadding;
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";

    if (sourcePoints.length === 1) {
      targetCtx.beginPath();
      const offset = getWigglyNoise(0, frameIndex, stroke.phase) * Math.max(1, stroke.size * 0.35);
      targetCtx.arc(
        sourcePoints[0].x + offset,
        sourcePoints[0].y + getWigglyNoise(1, frameIndex, stroke.phase) * Math.max(1, stroke.size * 0.35),
        stroke.size / 2,
        0,
        Math.PI * 2
      );
      targetCtx.fill();
      targetCtx.restore();
      return;
    }

    const spacing = Math.max(2, stroke.size);
    const points = [sourcePoints[0]];
    for (let index = 1; index < sourcePoints.length; index++) {
      const previous = sourcePoints[index - 1];
      const current = sourcePoints[index];
      const distance = Math.hypot(current.x - previous.x, current.y - previous.y);
      const steps = Math.max(1, Math.ceil(distance / spacing));
      for (let step = 1; step <= steps; step++) {
        const progress = step / steps;
        points.push({
          x: previous.x + (current.x - previous.x) * progress,
          y: previous.y + (current.y - previous.y) * progress
        });
      }
    }

    const isClosed = stroke.closed || Math.hypot(
      sourcePoints[0].x - sourcePoints[sourcePoints.length - 1].x,
      sourcePoints[0].y - sourcePoints[sourcePoints.length - 1].y
    ) <= Math.max(12, stroke.size * 3);
    const animatedPoints = points.map((point, index) => {
      const previous = points[Math.max(0, index - 1)];
      const next = points[Math.min(points.length - 1, index + 1)];
      const tangentX = next.x - previous.x;
      const tangentY = next.y - previous.y;
      const length = Math.hypot(tangentX, tangentY) || 1;
      const noise = (
        getWigglyNoise(index - 1, frameIndex, stroke.phase) * 0.25 +
        getWigglyNoise(index, frameIndex, stroke.phase) * 0.5 +
        getWigglyNoise(index + 1, frameIndex, stroke.phase) * 0.25
      );
      const offset = noise * Math.max(1, stroke.size * 0.35);
      return {
        x: point.x - tangentY / length * offset,
        y: point.y + tangentX / length * offset
      };
    });

    if (isClosed) animatedPoints[animatedPoints.length - 1] = animatedPoints[0];

    targetCtx.beginPath();
    animatedPoints.forEach((point, index) => {
      if (index === 0) targetCtx.moveTo(point.x, point.y);
      else targetCtx.lineTo(point.x, point.y);
    });
    if (isClosed) targetCtx.closePath();
    targetCtx.stroke();
    targetCtx.restore();
  }

  function quantizeGifFrame(imageData) {
    const data = imageData.data;
    const pixels = new Uint8Array(data.length / 4);
    for (let source = 0, target = 0; source < data.length; source += 4, target++) {
      pixels[target] = (data[source] >> 5) << 5 | (data[source + 1] >> 5) << 2 | data[source + 2] >> 6;
    }
    return pixels;
  }

  function encodeGifLzw(pixels) {
    const output = [];
    const clearCode = 256;
    const endCode = 257;
    let bitBuffer = 0;
    let bitCount = 0;
    let codeSize = 9;
    let nextCode = 258;
    let dictionary = new Map();

    function writeCode(code) {
      bitBuffer |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        output.push(bitBuffer & 255);
        bitBuffer >>>= 8;
        bitCount -= 8;
      }
    }

    function resetDictionary() {
      dictionary = new Map();
      codeSize = 9;
      nextCode = 258;
    }

    writeCode(clearCode);
    let prefix = pixels[0];
    for (let i = 1; i < pixels.length; i++) {
      const pixel = pixels[i];
      const key = prefix << 8 | pixel;
      if (dictionary.has(key)) {
        prefix = dictionary.get(key);
        continue;
      }

      writeCode(prefix);
      if (nextCode < 4096) {
        dictionary.set(key, nextCode++);
        if (nextCode > 1 << codeSize && codeSize < 12) codeSize++;
      } else {
        writeCode(clearCode);
        resetDictionary();
      }
      prefix = pixel;
    }
    writeCode(prefix);
    writeCode(endCode);
    if (bitCount > 0) output.push(bitBuffer & 255);
    return output;
  }

  function encodeAnimatedGif(frames, frameDelay) {
    const bytes = [];
    const writeWord = value => bytes.push(value & 255, value >> 8 & 255);
    const writeString = value => {
      for (let i = 0; i < value.length; i++) bytes.push(value.charCodeAt(i));
    };
    const writeSubBlocks = data => {
      for (let offset = 0; offset < data.length; offset += 255) {
        const length = Math.min(255, data.length - offset);
        bytes.push(length);
        for (let i = 0; i < length; i++) bytes.push(data[offset + i]);
      }
      bytes.push(0);
    };

    writeString("GIF89a");
    writeWord(canvas.width);
    writeWord(canvas.height);
    bytes.push(0xf7, 0, 0);
    for (let red = 0; red < 8; red++) {
      for (let green = 0; green < 8; green++) {
        for (let blue = 0; blue < 4; blue++) {
          bytes.push(Math.round(red * 255 / 7), Math.round(green * 255 / 7), Math.round(blue * 255 / 3));
        }
      }
    }
    bytes.push(0x21, 0xff, 0x0b);
    writeString("NETSCAPE2.0");
    bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);

    frames.forEach(frame => {
      bytes.push(0x21, 0xf9, 0x04, 0x04);
      writeWord(frameDelay);
      bytes.push(0, 0);
      bytes.push(0x2c);
      writeWord(0);
      writeWord(0);
      writeWord(canvas.width);
      writeWord(canvas.height);
      bytes.push(0, 8);
      writeSubBlocks(encodeGifLzw(frame));
    });
    bytes.push(0x3b);
    return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
  }

  function createAnimatedGifBlob() {
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = canvas.width;
    frameCanvas.height = canvas.height;
    const frameCtx = frameCanvas.getContext("2d", { willReadFrequently: true });
    if (!frameCtx) throw new Error("Could not create an offscreen canvas for GIF export.");

    const frames = [];
    for (let index = 0; index < wigglyFrameCount; index++) {
      frameCtx.clearRect(0, 0, canvas.width, canvas.height);
      frameCtx.drawImage(canvas, 0, 0);
      wigglyStrokes.forEach(stroke => drawWigglyStroke(frameCtx, stroke, index));
      frames.push(quantizeGifFrame(frameCtx.getImageData(0, 0, canvas.width, canvas.height)));
    }
    return encodeAnimatedGif(frames, wigglyFrameDelay);
  }

  function renderWigglyLayer(timestamp) {
    syncWigglyLayer();
    wigglyCtx.clearRect(0, 0, wigglyCanvas.width, wigglyCanvas.height);
    const frameIndex = getWigglyFrameIndex(timestamp);
    const selectedIndexes = new Set(selection?.wigglyItems?.map(item => item.index) || []);
    wigglyStrokes.forEach((stroke, index) => {
      if (!selectedIndexes.has(index)) drawWigglyStroke(wigglyCtx, stroke, frameIndex);
    });
    selection?.wigglyItems?.forEach(item => {
      drawWigglyStroke(wigglyCtx, getTransformedWigglyStroke(item), frameIndex);
    });
    if (currentWigglyStroke) drawWigglyStroke(wigglyCtx, currentWigglyStroke, frameIndex);

    if (wigglyStrokes.length || currentWigglyStroke) {
      wigglyAnimationFrame = requestAnimationFrame(renderWigglyLayer);
    } else {
      wigglyAnimationFrame = null;
    }
  }

  function refreshWigglyLayer() {
    if (wigglyAnimationFrame === null) {
      wigglyAnimationFrame = requestAnimationFrame(renderWigglyLayer);
    }
  }

  // STATE VARIABLES FOR LINE AND MULTI-POINT CURVES
  let startX = 0, startY = 0;
  let endX = 0, endY = 0;
  let cp1X = 0, cp1Y = 0;
  let cp2X = 0, cp2Y = 0;
  let snapshot = null;
  let curveStep = 0;

  // STATE VARIABLES FOR SELECT / FREEFORM / DRAG / ROTATE / RESIZE
  let selection = null; // { X, Y, W, H, ANGLE, PATH, BASESNAPSHOT }
  let selAction = null; // 'SELECTING' | 'FREEFORM-SELECTING' | 'DRAGGING' | 'ROTATING' | 'RESIZING-NW' | 'RESIZING-NE' | 'RESIZING-SW' | 'RESIZING-SE'
  let dragOffset = { x: 0, y: 0 };
  let resizeStart = { x: 0, y: 0, w: 0, h: 0, selX: 0, selY: 0 };
  let pathPoints = [];

  // --- SELECTION, ROTATION & RESIZING HELPERS ---
  function renderSelectionOverlay() {
    if (!selection) return;
    ctx.putImageData(selection.baseSnapshot, 0, 0);

    const cx = selection.x + selection.w / 2;
    const cy = selection.y + selection.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(selection.angle);

    // DRAW SCALED CUTOUT
    if (selection.path) {
      ctx.save();
      ctx.translate(-selection.w / 2, -selection.h / 2);
      ctx.clip(selection.path);
      internalDrawImage(selCanvas, 0, 0, selCanvas.width, selCanvas.height, 0, 0, selection.w, selection.h);
      ctx.restore();
    } else {
      internalDrawImage(selCanvas, 0, 0, selCanvas.width, selCanvas.height, -selection.w / 2, -selection.h / 2, selection.w, selection.h);
    }

    // DRAW DASHED BOUNDING BOX
    ctx.strokeStyle = "#0055ea";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(-selection.w / 2, -selection.h / 2, selection.w, selection.h);
    ctx.setLineDash([]);

    // DRAW 4 RESIZE HANDLES AT THE CORNERS
    const hw = selection.w / 2;
    const hh = selection.h / 2;
    const handles = [
      { x: -hw, y: -hh }, // NW
      { x: hw, y: -hh },  // NE
      { x: -hw, y: hh },  // SW
      { x: hw, y: hh }    // SE
    ];
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#0055ea";
    ctx.lineWidth = 1;
    handles.forEach(h => {
      ctx.fillRect(h.x - 3, h.y - 3, 6, 6);
      ctx.strokeRect(h.x - 3, h.y - 3, 6, 6);
    });

    // DRAW ROTATION HANDLE STEM & GREEN CIRCLE ABOVE TOP CENTER
    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(0, -hh - 16);
    ctx.stroke();

    ctx.fillStyle = "#389638";
    ctx.beginPath();
    ctx.arc(0, -hh - 16, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    refreshWigglyLayer();
  }

  function commitSelection() {
    if (!selection) return;
    ctx.putImageData(selection.baseSnapshot, 0, 0);

    const cx = selection.x + selection.w / 2;
    const cy = selection.y + selection.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(selection.angle);

    if (selection.path) {
      ctx.save();
      ctx.translate(-selection.w / 2, -selection.h / 2);
      ctx.clip(selection.path);
      internalDrawImage(selCanvas, 0, 0, selCanvas.width, selCanvas.height, 0, 0, selection.w, selection.h);
      ctx.restore();
    } else {
      internalDrawImage(selCanvas, 0, 0, selCanvas.width, selCanvas.height, -selection.w / 2, -selection.h / 2, selection.w, selection.h);
    }
    ctx.restore();

    selection.wigglyItems?.forEach(item => {
      wigglyStrokes[item.index] = getTransformedWigglyStroke(item);
    });
    selection = null;
    selAction = null;
    saveHistory();
    refreshWigglyLayer();
  }

  function hitTestSelection(mx, my) {
    if (!selection) return null;
    const cx = selection.x + selection.w / 2;
    const cy = selection.y + selection.h / 2;

    // CONVERT CURSOR COORDINATES INTO SELECTION'S ROTATED LOCAL SPACE
    const dx = mx - cx;
    const dy = my - cy;
    const cos = Math.cos(-selection.angle);
    const sin = Math.sin(-selection.angle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const hw = selection.w / 2;
    const hh = selection.h / 2;

    // 1. CHECK ROTATION HANDLE KNOB (AT 0, -HH - 16)
    if (Math.hypot(localX, localY - (-hh - 16)) <= 9) {
      return "rotating";
    }

    // 2. CHECK 4 CORNER RESIZE HANDLES
    const handleSize = 8;
    if (Math.abs(localX - (-hw)) <= handleSize && Math.abs(localY - (-hh)) <= handleSize) return "resizing-nw";
    if (Math.abs(localX - hw) <= handleSize && Math.abs(localY - (-hh)) <= handleSize) return "resizing-ne";
    if (Math.abs(localX - (-hw)) <= handleSize && Math.abs(localY - hh) <= handleSize) return "resizing-sw";
    if (Math.abs(localX - hw) <= handleSize && Math.abs(localY - hh) <= handleSize) return "resizing-se";

    // 3. CHECK INSIDE BOUNDING BOX (DRAGGING)
    if (Math.abs(localX) <= hw && Math.abs(localY) <= hh) {
      return "dragging";
    }
    return null;
  }

  function getContainedWigglyStrokes(x, y, width, height) {
    const selectedItems = [];
    wigglyStrokes.forEach((stroke, index) => {
      const padding = stroke.size / 2 + Math.max(1, stroke.size * 0.35);
      const contained = stroke.points.every(point =>
        point.x - padding >= x &&
        point.x + padding <= x + width &&
        point.y - padding >= y &&
        point.y + padding <= y + height
      );
      if (contained) {
        selectedItems.push({
          index,
          stroke: {
            ...stroke,
            points: stroke.points.map(point => ({ x: point.x, y: point.y }))
          }
        });
      }
    });
    return selectedItems;
  }

  function getTransformedWigglyStroke(item) {
    const scaleX = selection.w / selection.sourceW;
    const scaleY = selection.h / selection.sourceH;
    const centerX = selection.x + selection.w / 2;
    const centerY = selection.y + selection.h / 2;
    const cos = Math.cos(selection.angle);
    const sin = Math.sin(selection.angle);

    return {
      ...item.stroke,
      size: item.stroke.size * Math.sqrt(Math.abs(scaleX * scaleY)),
      points: item.stroke.points.map(point => {
        const localX = (point.x - selection.sourceX) * scaleX - selection.w / 2;
        const localY = (point.y - selection.sourceY) * scaleY - selection.h / 2;
        return {
          x: centerX + localX * cos - localY * sin,
          y: centerY + localX * sin + localY * cos
        };
      })
    };
  }

  // --- DRAWING & CTRL+Z UNDO ---
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return {
      x: (clientX - rect.left) * canvas.width / rect.width,
      y: (clientY - rect.top) * canvas.height / rect.height
    };
  }

  function setZoomLevel(level, clientX, clientY) {
    const viewportRect = canvasViewport.getBoundingClientRect();
    const containerRect = canvasContainer.getBoundingClientRect();
    if (clientX === undefined) clientX = viewportRect.left + viewportRect.width / 2;
    if (clientY === undefined) clientY = viewportRect.top + viewportRect.height / 2;
    const relativeX = clientX - viewportRect.left;
    const relativeY = clientY - viewportRect.top;
    const contentX = (clientX - containerRect.left) / zoomLevel;
    const contentY = (clientY - containerRect.top) / zoomLevel;
    const containerOffsetX = containerRect.left - viewportRect.left + canvasViewport.scrollLeft;
    const containerOffsetY = containerRect.top - viewportRect.top + canvasViewport.scrollTop;

    zoomLevel = level;
    canvasContainer.style.transform = zoomLevel === 1 ? "none" : `scale(${zoomLevel})`;
    canvasViewport.classList.toggle("zoomed", zoomLevel > 1);
    document.getElementById("oekaki-zoom-level").textContent = `${Math.round(zoomLevel * 100)}%`;
    positionTextEditor();
    syncWigglyLayer();
    void canvasContainer.offsetWidth;
    canvasViewport.scrollLeft = Math.max(0, containerOffsetX + contentX * zoomLevel - relativeX);
    canvasViewport.scrollTop = Math.max(0, containerOffsetY + contentY * zoomLevel - relativeY);
  }

  function changeZoom(direction, clientX, clientY) {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    const nextIndex = Math.max(0, Math.min(zoomLevels.length - 1, currentIndex + direction));
    if (nextIndex !== currentIndex) setZoomLevel(zoomLevels[nextIndex], clientX, clientY);
  }

  function zoomAtPointer(clientX, clientY) {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    const nextIndex = currentIndex === zoomLevels.length - 1 ? 0 : currentIndex + 1;
    setZoomLevel(zoomLevels[nextIndex], clientX, clientY);
  }

  function sprayAirbrush(x, y) {
    const size = Number(document.getElementById("oekaki-size").value);
    const color = document.getElementById("oekaki-color").value;
    const radius = Math.max(3, size * 2);
    const speckleCount = 8 + size * 2;

    ctx.fillStyle = color;
    for (let i = 0; i < speckleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * radius;
      const dotSize = Math.random() < 0.8 ? 1 : 2;
      ctx.fillRect(
        Math.round(x + Math.cos(angle) * distance),
        Math.round(y + Math.sin(angle) * distance),
        dotSize,
        dotSize
      );
    }
  }

  function isShapeTool(toolName) {
    return toolName === "rect" || toolName === "ellipse" || toolName === "roundrect";
  }

  function drawShape(toolName, x, y, width, height, color, size) {
    const left = Math.min(x, x + width);
    const top = Math.min(y, y + height);
    const shapeWidth = Math.max(1, Math.abs(width));
    const shapeHeight = Math.max(1, Math.abs(height));

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "butt";
    ctx.lineJoin = toolName === "roundrect" ? "round" : "miter";
    if (toolName === "ellipse") {
      ctx.ellipse(
        left + shapeWidth / 2,
        top + shapeHeight / 2,
        shapeWidth / 2,
        shapeHeight / 2,
        0,
        0,
        Math.PI * 2
      );
    } else if (toolName === "roundrect") {
      const radius = Math.min(12, shapeWidth / 4, shapeHeight / 4);
      ctx.moveTo(left + radius, top);
      ctx.lineTo(left + shapeWidth - radius, top);
      ctx.quadraticCurveTo(left + shapeWidth, top, left + shapeWidth, top + radius);
      ctx.lineTo(left + shapeWidth, top + shapeHeight - radius);
      ctx.quadraticCurveTo(left + shapeWidth, top + shapeHeight, left + shapeWidth - radius, top + shapeHeight);
      ctx.lineTo(left + radius, top + shapeHeight);
      ctx.quadraticCurveTo(left, top + shapeHeight, left, top + shapeHeight - radius);
      ctx.lineTo(left, top + radius);
      ctx.quadraticCurveTo(left, top, left + radius, top);
      ctx.closePath();
    } else {
      ctx.rect(left, top, shapeWidth, shapeHeight);
    }
    ctx.stroke();
    ctx.restore();
  }

  function updateTextEditorStyle() {
    if (!activeTextBox) return;
    const font = document.getElementById("oekaki-font").value;
    const size = Math.max(10, Number(document.getElementById("oekaki-size").value) * 3);
    const color = document.getElementById("oekaki-color").value;
    activeTextBox.input.style.fontFamily = font;
    activeTextBox.input.style.fontSize = `${size}px`;
    activeTextBox.input.style.lineHeight = `${size * 1.2}px`;
    activeTextBox.input.style.color = color;
  }

  function positionTextEditor() {
    if (!activeTextBox) return;
    const container = document.getElementById("oekaki-canvas-container");
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    activeTextBox.frame.style.left = `${(canvasRect.left - containerRect.left) / zoomLevel + activeTextBox.x}px`;
    activeTextBox.frame.style.top = `${(canvasRect.top - containerRect.top) / zoomLevel + activeTextBox.y}px`;
    activeTextBox.frame.style.width = `${activeTextBox.width}px`;
    activeTextBox.frame.style.height = `${activeTextBox.height}px`;
  }

  function startTextBoxInteraction(mode, e) {
    if (!activeTextBox) return;
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    textBoxInteraction = {
      mode,
      clientX: touch ? touch.clientX : e.clientX,
      clientY: touch ? touch.clientY : e.clientY,
      x: activeTextBox.x,
      y: activeTextBox.y,
      width: activeTextBox.width,
      height: activeTextBox.height
    };
    e.preventDefault();
    e.stopPropagation();
  }

  function moveTextBox(e) {
    if (!activeTextBox || !textBoxInteraction) return;
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    const dx = (clientX - textBoxInteraction.clientX) / zoomLevel;
    const dy = (clientY - textBoxInteraction.clientY) / zoomLevel;

    if (textBoxInteraction.mode === "move") {
      activeTextBox.x = Math.max(0, Math.min(canvas.width - activeTextBox.width, textBoxInteraction.x + dx));
      activeTextBox.y = Math.max(0, Math.min(canvas.height - activeTextBox.height, textBoxInteraction.y + dy));
    } else {
      activeTextBox.width = Math.max(40, Math.min(canvas.width - activeTextBox.x, textBoxInteraction.width + dx));
      const fontSize = Math.max(10, Number(document.getElementById("oekaki-size").value) * 3);
      const minHeight = Math.max(34, fontSize * 1.2 + 18);
      const availableHeight = canvas.height - activeTextBox.y;
      activeTextBox.height = Math.max(Math.min(minHeight, availableHeight), Math.min(availableHeight, textBoxInteraction.height + dy));
    }
    positionTextEditor();
    e.preventDefault();
  }

  function wrapTextLines(text, maxWidth) {
    const lines = [];
    text.split(/\r?\n/).forEach((sourceLine) => {
      let line = "";
      for (const character of sourceLine) {
        if (line && ctx.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = character;
        } else {
          line += character;
        }
      }
      lines.push(line);
    });
    return lines;
  }

  function commitTextBox() {
    if (!activeTextBox) return;
    const { frame, input, x, y, width, height } = activeTextBox;
    const text = input.value;
    frame.remove();
    activeTextBox = null;
    textBoxInteraction = null;
    if (!text.trim()) return;

    const font = document.getElementById("oekaki-font").value;
    const fontName = font.includes(" ") ? `"${font}"` : font;
    const fontSize = Math.max(10, Number(document.getElementById("oekaki-size").value) * 3);
    const lineHeight = fontSize * 1.2;
    const textTop = y + 15;
    const textHeight = Math.max(0, height - 18);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.font = `${fontSize}px ${fontName}`;
    ctx.textBaseline = "top";
    ctx.fillStyle = document.getElementById("oekaki-color").value;
    const lines = wrapTextLines(text, Math.max(1, width - 8));
    const maxLines = Math.floor(textHeight / lineHeight);
    lines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, x + 4, textTop + index * lineHeight);
    });
    ctx.restore();

    saveHistory();
  }

  function cancelTextBox() {
    if (!activeTextBox) return;
    activeTextBox.frame.remove();
    activeTextBox = null;
    textBoxInteraction = null;
  }

  function createTextEditor(x, y, width, height) {
    const container = document.getElementById("oekaki-canvas-container");
    const frame = document.createElement("div");
    const moveHandle = document.createElement("div");
    const input = document.createElement("textarea");
    const resizeHandle = document.createElement("div");
    frame.id = "oekaki-text-editor";
    moveHandle.id = "oekaki-text-move";
    input.id = "oekaki-text-input";
    input.setAttribute("aria-label", "Text to stamp on canvas");
    resizeHandle.id = "oekaki-text-resize";
    frame.append(moveHandle, input, resizeHandle);

    const fontSize = Math.max(10, Number(document.getElementById("oekaki-size").value) * 3);
    const minHeight = Math.max(34, fontSize * 1.2 + 18);
    const maxX = Math.max(0, canvas.width - 40);
    const maxY = Math.max(0, canvas.height - minHeight);
    activeTextBox = {
      frame,
      input,
      x: Math.max(0, Math.min(maxX, x)),
      y: Math.max(0, Math.min(maxY, y)),
      width: 0,
      height: 0
    };
    activeTextBox.width = Math.max(40, Math.min(canvas.width - activeTextBox.x, width));
    activeTextBox.height = Math.max(minHeight, Math.min(canvas.height - activeTextBox.y, height));
    container.appendChild(frame);
    positionTextEditor();
    updateTextEditorStyle();

    moveHandle.addEventListener("mousedown", (e) => startTextBoxInteraction("move", e));
    moveHandle.addEventListener("touchstart", (e) => startTextBoxInteraction("move", e), { passive: false });
    resizeHandle.addEventListener("mousedown", (e) => startTextBoxInteraction("resize", e));
    resizeHandle.addEventListener("touchstart", (e) => startTextBoxInteraction("resize", e), { passive: false });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelTextBox();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        commitTextBox();
      }
    });
    input.focus();
  }

  document.addEventListener("mousemove", moveTextBox);
  document.addEventListener("touchmove", moveTextBox, { passive: false });
  document.addEventListener("mouseup", () => { textBoxInteraction = null; });
  document.addEventListener("touchend", () => { textBoxInteraction = null; });
  document.addEventListener("touchcancel", () => { textBoxInteraction = null; });
  function finishTextEditOutside(e) {
    if (!activeTextBox) return;
    if (activeTextBox.frame.contains(e.target) || canvas.contains(e.target)) return;
    if (e.target.closest("#oekaki-color, #oekaki-size, #oekaki-font, .mspaint-palette .palette-swatch")) return;
    commitTextBox();
  }

  document.addEventListener("mousedown", finishTextEditOutside);
  document.addEventListener("touchstart", finishTextEditOutside, { passive: true });
  document.addEventListener("click", (e) => {
    if (e.target.closest(".mspaint-palette .palette-swatch")) updateTextEditorStyle();
  });

  function startDraw(e) {
    canvas.focus();
    e.preventDefault();
    const pos = getPos(e);
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);

    if (activeTextBox) {
      commitTextBox();
      return;
    }

    if (currentTool === "text") {
      isDrawing = true;
      startX = x;
      startY = y;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }

    if (isShapeTool(currentTool)) {
      isDrawing = true;
      startX = x;
      startY = y;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }

    if (currentTool === "zoom") {
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      zoomAtPointer(touch ? touch.clientX : e.clientX, touch ? touch.clientY : e.clientY);
      return;
    }

    if (currentTool === "wiggly") {
      isDrawing = true;
      currentWigglyStroke = {
        points: [pos],
        color: document.getElementById("oekaki-color").value,
        size: Number(document.getElementById("oekaki-size").value),
        phase: Math.random() * Math.PI * 2
      };
      refreshWigglyLayer();
      return;
    }

    // 0A. RECTANGULAR SELECT TOOL
    if (currentTool === "select") {
      if (selection) {
        const hit = hitTestSelection(x, y);
        if (hit) {
          selAction = hit;
          if (hit === "dragging") {
            dragOffset = { x: x - selection.x, y: y - selection.y };
          } else if (hit.startsWith("resizing")) {
            resizeStart = { x, y, w: selection.w, h: selection.h, selX: selection.x, selY: selection.y };
          }
          isDrawing = true;
          return;
        }
        commitSelection();
      }

      isDrawing = true;
      selAction = "selecting";
      startX = x;
      startY = y;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }

    // 0B. FREE-FORM SELECT TOOL
    if (currentTool === "freeform") {
      if (selection) {
        const hit = hitTestSelection(x, y);
        if (hit) {
          selAction = hit;
          if (hit === "dragging") {
            dragOffset = { x: x - selection.x, y: y - selection.y };
          } else if (hit.startsWith("resizing")) {
            resizeStart = { x, y, w: selection.w, h: selection.h, selX: selection.x, selY: selection.y };
          }
          isDrawing = true;
          return;
        }
        commitSelection();
      }

      isDrawing = true;
      selAction = "freeform-selecting";
      pathPoints = [{ x, y }];
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }

    // 2. COLOR PICKER (EYEDROPPER)
    if (currentTool === "picker") {
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = "#" + [pixel[0], pixel[1], pixel[2]]
          .map(c => c.toString(16).padStart(2, "0"))
          .join("");

        const colorInput = document.getElementById("oekaki-color");
        if (colorInput) colorInput.value = hex;

        setTool("brush");
      }
      return;
    }

    // 3. FLOOD FILL BUCKET
    if (currentTool === "fill") {
      const fillColorHex = document.getElementById("oekaki-color").value;
      floodFill(x, y, fillColorHex);
      saveHistory();
      return;
    }

    // 4. LINE TOOL INITIALIZATION
    if (currentTool === "line") {
      if (!isDrawing) {
        isDrawing = true;
        startX = x;
        startY = y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // 5. GHOST-FREE MS-PAINT STYLE CURVE TOOL
    if (currentTool === "curve") {
      if (curveStep === 0) {
        isDrawing = true;
        startX = x;
        startY = y;
        endX = x;
        endY = y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        curveStep = 1;
      } else if (curveStep === 2) {
        isDrawing = true;
        curveStep = 3;
      } else if (curveStep === 4) {
        isDrawing = true;
        curveStep = 5;
      }
      return;
    }

    // 6. BRUSH / ERASER / PENCIL
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (currentTool === "airbrush") {
      lastSprayPos = pos;
      sprayAirbrush(pos.x, pos.y);
    }
  }

  function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);

    if (currentTool === "select" || currentTool === "freeform") {
      if (selAction === "selecting") {
        ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = "#0055ea";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(startX, startY, x - startX, y - startY);
        ctx.setLineDash([]);
      } else if (selAction === "freeform-selecting") {
        pathPoints.push({ x, y });
        ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = "#0055ea";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) {
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (selAction === "dragging" && selection) {
        selection.x = x - dragOffset.x;
        selection.y = y - dragOffset.y;
        renderSelectionOverlay();
      } else if (selAction === "rotating" && selection) {
        const cx = selection.x + selection.w / 2;
        const cy = selection.y + selection.h / 2;
        selection.angle = Math.atan2(y - cy, x - cx) + Math.PI / 2;
        renderSelectionOverlay();
      } else if (selAction && selAction.startsWith("resizing") && selection) {
        const dx = x - resizeStart.x;
        const dy = y - resizeStart.y;
        
        // UNROTATE DELTAS TO MATCH AXIS-ALIGNED BOX RESIZING
        const cos = Math.cos(-selection.angle);
        const sin = Math.sin(-selection.angle);
        const localDx = dx * cos - dy * sin;
        const localDy = dx * sin + dy * cos;

        if (selAction === "resizing-se") {
          selection.w = Math.max(10, resizeStart.w + localDx);
          selection.h = Math.max(10, resizeStart.h + localDy);
        } else if (selAction === "resizing-sw") {
          const newW = Math.max(10, resizeStart.w - localDx);
          selection.x = resizeStart.selX + (resizeStart.w - newW);
          selection.w = newW;
          selection.h = Math.max(10, resizeStart.h + localDy);
        } else if (selAction === "resizing-ne") {
          selection.w = Math.max(10, resizeStart.w + localDx);
          const newH = Math.max(10, resizeStart.h - localDy);
          selection.y = resizeStart.selY + (resizeStart.h - newH);
          selection.h = newH;
        } else if (selAction === "resizing-nw") {
          const newW = Math.max(10, resizeStart.w - localDx);
          const newH = Math.max(10, resizeStart.h - localDy);
          selection.x = resizeStart.selX + (resizeStart.w - newW);
          selection.y = resizeStart.selY + (resizeStart.h - newH);
          selection.w = newW;
          selection.h = newH;
        }
        renderSelectionOverlay();
      }
      e.preventDefault();
      return;
    }

    if (currentTool === "text") {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = "#0055ea";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(startX, startY, x - startX, y - startY);
      ctx.setLineDash([]);
      e.preventDefault();
      return;
    }

    if (currentTool === "wiggly") {
      const lastPoint = currentWigglyStroke.points[currentWigglyStroke.points.length - 1];
      if (Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y) >= 1) {
        currentWigglyStroke.points.push(pos);
        refreshWigglyLayer();
      }
      e.preventDefault();
      return;
    }

    const color = document.getElementById("oekaki-color").value;
    const size = document.getElementById("oekaki-size").value;

    if (isShapeTool(currentTool)) {
      ctx.putImageData(snapshot, 0, 0);
      drawShape(currentTool, startX, startY, x - startX, y - startY, color, size);
      e.preventDefault();
      return;
    }

    if (currentTool === "line") {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.stroke();
      return;
    }

    if (currentTool === "curve") {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      if (curveStep === 1) {
        endX = x;
        endY = y;
        ctx.lineTo(endX, endY);
      } else if (curveStep === 3) {
        cp1X = x;
        cp1Y = y;
        ctx.quadraticCurveTo(cp1X, cp1Y, endX, endY);
      } else if (curveStep === 5) {
        cp2X = x;
        cp2Y = y;
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.stroke();
      return;
    }

    if (currentTool === "airbrush") {
      const dx = pos.x - lastSprayPos.x;
      const dy = pos.y - lastSprayPos.y;
      const distance = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(distance / 3));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        sprayAirbrush(lastSprayPos.x + dx * t, lastSprayPos.y + dy * t);
      }
      lastSprayPos = pos;
      e.preventDefault();
      return;
    }

    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    e.preventDefault();
  }

  function stopDraw(e) {
    if (!isDrawing) return;

    lastSprayPos = null;

    if (currentTool === "text") {
      isDrawing = false;
      ctx.putImageData(snapshot, 0, 0);
      const pos = getPos(e);
      const endX = Math.max(0, Math.min(canvas.width, Math.floor(pos.x)));
      const endY = Math.max(0, Math.min(canvas.height, Math.floor(pos.y)));
      let x = Math.min(startX, endX);
      let y = Math.min(startY, endY);
      let width = Math.abs(endX - startX);
      let height = Math.abs(endY - startY);
      if (width < 4 && height < 4) {
        width = Math.min(180, canvas.width - x);
        height = Math.min(60, canvas.height - y);
      }
      createTextEditor(x, y, width, height);
      snapshot = null;
      e.preventDefault();
      return;
    }

    if (isShapeTool(currentTool)) {
      isDrawing = false;
      const pos = getPos(e);
      ctx.putImageData(snapshot, 0, 0);
      drawShape(
        currentTool,
        startX,
        startY,
        Math.floor(pos.x) - startX,
        Math.floor(pos.y) - startY,
        document.getElementById("oekaki-color").value,
        document.getElementById("oekaki-size").value
      );
      snapshot = null;
      saveHistory();
      e.preventDefault();
      return;
    }

    if (currentTool === "wiggly") {
      isDrawing = false;
      if (currentWigglyStroke) {
        const endPosition = getPos(e);
        const lastPoint = currentWigglyStroke.points[currentWigglyStroke.points.length - 1];
        if (Math.hypot(endPosition.x - lastPoint.x, endPosition.y - lastPoint.y) >= 1) {
          currentWigglyStroke.points.push(endPosition);
        }
        const firstPoint = currentWigglyStroke.points[0];
        const finalPoint = currentWigglyStroke.points[currentWigglyStroke.points.length - 1];
        if (Math.hypot(firstPoint.x - finalPoint.x, firstPoint.y - finalPoint.y) <= Math.max(12, currentWigglyStroke.size * 3)) {
          currentWigglyStroke.points.push({ x: firstPoint.x, y: firstPoint.y });
          currentWigglyStroke.closed = true;
        }
        wigglyStrokes.push(currentWigglyStroke);
        currentWigglyStroke = null;
        saveHistory();
        updateSaveMenuLabel();
        refreshWigglyLayer();
      }
      e.preventDefault();
      return;
    }

    if (currentTool === "select") {
      isDrawing = false;
      if (selAction === "selecting") {
        ctx.putImageData(snapshot, 0, 0);
        const pos = getPos(e);
        const endSelX = Math.max(0, Math.min(canvas.width, Math.floor(pos.x)));
        const endSelY = Math.max(0, Math.min(canvas.height, Math.floor(pos.y)));
        const clampedStartX = Math.max(0, Math.min(canvas.width, startX));
        const clampedStartY = Math.max(0, Math.min(canvas.height, startY));

        const rx = Math.min(clampedStartX, endSelX);
        const ry = Math.min(clampedStartY, endSelY);
        const rw = Math.abs(endSelX - clampedStartX);
        const rh = Math.abs(endSelY - clampedStartY);

        if (rw > 2 && rh > 2) {
          selCanvas.width = rw;
          selCanvas.height = rh;
          selCtx.clearRect(0, 0, rw, rh);
          selCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, rw, rh);

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(rx, ry, rw, rh);

          selection = {
            x: rx,
            y: ry,
            w: rw,
            h: rh,
            angle: 0,
            path: null,
            baseSnapshot: ctx.getImageData(0, 0, canvas.width, canvas.height),
            sourceX: rx,
            sourceY: ry,
            sourceW: rw,
            sourceH: rh,
            wigglyItems: getContainedWigglyStrokes(rx, ry, rw, rh)
          };
          renderSelectionOverlay();
        }
        snapshot = null;
      }
      selAction = null;
      e.preventDefault();
      return;
    }

    if (currentTool === "freeform") {
      isDrawing = false;
      if (selAction === "freeform-selecting") {
        ctx.putImageData(snapshot, 0, 0);

        if (pathPoints.length > 3) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          pathPoints.forEach(pt => {
            minX = Math.min(minX, pt.x);
            minY = Math.min(minY, pt.y);
            maxX = Math.max(maxX, pt.x);
            maxY = Math.max(maxY, pt.y);
          });

          const rw = Math.max(4, maxX - minX);
          const rh = Math.max(4, maxY - minY);

          const p2d = new Path2D();
          p2d.moveTo(pathPoints[0].x - minX, pathPoints[0].y - minY);
          for (let i = 1; i < pathPoints.length; i++) {
            p2d.lineTo(pathPoints[i].x - minX, pathPoints[i].y - minY);
          }
          p2d.closePath();

          selCanvas.width = rw;
          selCanvas.height = rh;
          selCtx.clearRect(0, 0, rw, rh);

          selCtx.save();
          selCtx.clip(p2d);
          selCtx.drawImage(canvas, minX, minY, rw, rh, 0, 0, rw, rh);
          selCtx.restore();

          ctx.save();
          ctx.beginPath();
          pathPoints.forEach((pt, idx) => idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
          ctx.closePath();
          ctx.clip();
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(minX, minY, rw, rh);
          ctx.restore();

          selection = {
            x: minX,
            y: minY,
            w: rw,
            h: rh,
            angle: 0,
            path: p2d,
            baseSnapshot: ctx.getImageData(0, 0, canvas.width, canvas.height),
            wigglyItems: []
          };
          renderSelectionOverlay();
        }
        snapshot = null;
      }
      selAction = null;
      e.preventDefault();
      return;
    }

    if (currentTool === "line") {
      isDrawing = false;
      snapshot = null;
      saveHistory();
    } else if (currentTool === "curve") {
      isDrawing = false;
      if (curveStep === 1) {
        curveStep = 2;
      } else if (curveStep === 3) {
        curveStep = 4;
      } else if (curveStep === 5) {
        curveStep = 0;
        snapshot = null;
        saveHistory();
      }
    } else {
      ctx.stroke();
      ctx.closePath();
      isDrawing = false;
      saveHistory();
    }

    e.preventDefault();
  }

  function clearCanvas() {
    cancelTextBox();
    selection = null;
    selAction = null;
    currentWigglyStroke = null;
    wigglyStrokes = [];
    ctx.fillStyle = "#ffffff";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    restoreArray = [];
    wigglyHistory = [];
    startIndex = -1;
    curveStep = 0;
    if (wigglyAnimationFrame !== null) cancelAnimationFrame(wigglyAnimationFrame);
    wigglyAnimationFrame = null;
    syncWigglyLayer();
    wigglyCtx.clearRect(0, 0, wigglyCanvas.width, wigglyCanvas.height);
    updateSaveMenuLabel();
  }

  function undoCanvas() {
    if (selection) {
      commitSelection();
    }
    if (startIndex <= 0) {
      clearCanvas();
    } else {
      startIndex--;
      restoreArray.pop();
      ctx.putImageData(restoreArray[startIndex], 0, 0);
      wigglyHistory.pop();
      wigglyStrokes = cloneWigglyStrokes(wigglyHistory[startIndex]);
      updateSaveMenuLabel();
      refreshWigglyLayer();
      curveStep = 0;
    }
  }

  // --- LINE-AWARE FLOOD FILL ALGORITHM ---
  function floodFill(startX, startY, fillHex) {
    const width = canvas.width;
    const height = canvas.height;
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

    if (fillCanvas.width !== width) fillCanvas.width = width;
    if (fillCanvas.height !== height) fillCanvas.height = height;
    fillCtx.clearRect(0, 0, width, height);
    fillCtx.drawImage(canvas, 0, 0);
    const frameIndex = getWigglyFrameIndex(performance.now());
    wigglyStrokes.forEach(stroke => drawWigglyStroke(fillCtx, stroke, frameIndex, 2));
    if (currentWigglyStroke) drawWigglyStroke(fillCtx, currentWigglyStroke, frameIndex, 2);

    const sourceData = fillCtx.getImageData(0, 0, width, height).data;
    const destinationData = ctx.getImageData(0, 0, width, height);
    const destination = destinationData.data;

    const fillR = parseInt(fillHex.slice(1, 3), 16);
    const fillG = parseInt(fillHex.slice(3, 5), 16);
    const fillB = parseInt(fillHex.slice(5, 7), 16);

    const startIdx = (startY * width + startX) * 4;
    const startR = sourceData[startIdx];
    const startG = sourceData[startIdx + 1];
    const startB = sourceData[startIdx + 2];

    if (startR === fillR && startG === fillG && startB === fillB) return;

    const tolerance = 32;
    const visited = new Uint8Array(width * height);

    function matchesTarget(idx) {
      return (
        Math.abs(sourceData[idx] - startR) <= tolerance &&
        Math.abs(sourceData[idx + 1] - startG) <= tolerance &&
        Math.abs(sourceData[idx + 2] - startB) <= tolerance
      );
    }

    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const pixelPos = y * width + x;

      if (visited[pixelPos]) continue;
      const idx = pixelPos * 4;
      if (!matchesTarget(idx)) continue;

      visited[pixelPos] = 1;
      destination[idx] = fillR;
      destination[idx + 1] = fillG;
      destination[idx + 2] = fillB;
      destination[idx + 3] = 255;

      if (x > 0) stack.push([x - 1, y]);
      if (x < width - 1) stack.push([x + 1, y]);
      if (y > 0) stack.push([x, y - 1]);
      if (y < height - 1) stack.push([x, y + 1]);
    }

    ctx.putImageData(destinationData, 0, 0);
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  window.addEventListener("mouseup", stopDraw);

  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  window.addEventListener("touchend", stopDraw, { passive: false });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      const activeElement = document.activeElement;
      if (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT") return;
      if (!paintWin.contains(activeElement)) return;
      e.preventDefault();
      undoCanvas();
    }
  });

  document.getElementById("oekaki-undo")?.addEventListener("click", undoCanvas);
  document.getElementById("oekaki-clear")?.addEventListener("click", clearCanvas);

  const fileMenuButton = document.getElementById("oekaki-file-menu");
  const fileDropdown = document.getElementById("oekaki-file-dropdown");

  function closeFileMenu() {
    fileDropdown.style.display = "none";
    fileMenuButton.setAttribute("aria-expanded", "false");
  }

  fileMenuButton.addEventListener("click", () => {
    const isOpen = fileDropdown.style.display === "block";
    fileDropdown.style.display = isOpen ? "none" : "block";
    fileMenuButton.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".mspaint-file-menu")) closeFileMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && fileDropdown.style.display === "block") {
      closeFileMenu();
      fileMenuButton.focus();
    }
  });

  document.getElementById("oekaki-save-png").addEventListener("click", async () => {
    closeFileMenu();
    if (activeTextBox) commitTextBox();
    if (selection) commitSelection();

    try {
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      if (wigglyStrokes.length) {
        const url = URL.createObjectURL(createAnimatedGifBlob());
        link.href = url;
        link.download = `oekaki-${timestamp}.gif`;
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        link.href = canvas.toDataURL("image/png");
        link.download = `oekaki-${timestamp}.png`;
      }
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Could not save the Paint canvas.", error);
      await showAppAlert("Could not save the image: " + error.message, "Error");
    }
  });

  const freeformBtn = document.getElementById("oekaki-freeform");
  const selectBtn = document.getElementById("oekaki-select");
  const brushBtn = document.getElementById("oekaki-brush");
  const airbrushBtn = document.getElementById("oekaki-airbrush");
  const wigglyBtn = document.getElementById("oekaki-wiggly");
  const zoomBtn = document.getElementById("oekaki-zoom");
  const zoomControls = document.getElementById("oekaki-zoom-controls");
  const eraserBtn = document.getElementById("oekaki-eraser");
  const pencilBtn = document.getElementById("oekaki-pencil");
  const fillBtn = document.getElementById("oekaki-fill");
  const pickerBtn = document.getElementById("oekaki-picker");
  const textBtn = document.getElementById("oekaki-text");
  const lineBtn = document.getElementById("oekaki-line");
  const curveBtn = document.getElementById("oekaki-curve");
  const rectBtn = document.getElementById("oekaki-rect");
  const ellipseBtn = document.getElementById("oekaki-ellipse");
  const roundRectBtn = document.getElementById("oekaki-roundrect");
  const sizeInput = document.getElementById("oekaki-size");
  const fontInput = document.getElementById("oekaki-font");

  function setTool(toolName) {
    if (activeTextBox && toolName !== "text") {
      commitTextBox();
    }
    if (selection && toolName !== "select" && toolName !== "freeform") {
      commitSelection();
    }
    currentTool = toolName;
    curveStep = 0;
    fontInput.style.display = toolName === "text" ? "inline-block" : "none";
    zoomControls.style.display = toolName === "zoom" ? "inline-flex" : "none";
    sizeInput.title = toolName === "text" ? "Text Size" : "Brush Size";
    if (freeformBtn) freeformBtn.classList.toggle("active", toolName === "freeform");
    if (selectBtn) selectBtn.classList.toggle("active", toolName === "select");
    if (brushBtn) brushBtn.classList.toggle("active", toolName === "brush");
    if (airbrushBtn) airbrushBtn.classList.toggle("active", toolName === "airbrush");
    if (wigglyBtn) wigglyBtn.classList.toggle("active", toolName === "wiggly");
    if (zoomBtn) zoomBtn.classList.toggle("active", toolName === "zoom");
    if (pencilBtn) pencilBtn.classList.toggle("active", toolName === "pencil");
    if (fillBtn) fillBtn.classList.toggle("active", toolName === "fill");
    if (pickerBtn) pickerBtn.classList.toggle("active", toolName === "picker");
    if (textBtn) textBtn.classList.toggle("active", toolName === "text");
    if (lineBtn) lineBtn.classList.toggle("active", toolName === "line");
    if (curveBtn) curveBtn.classList.toggle("active", toolName === "curve");
    if (rectBtn) rectBtn.classList.toggle("active", toolName === "rect");
    if (ellipseBtn) ellipseBtn.classList.toggle("active", toolName === "ellipse");
    if (roundRectBtn) roundRectBtn.classList.toggle("active", toolName === "roundrect");
    if (eraserBtn) {
      eraserBtn.classList.toggle("active", toolName === "eraser");
      eraserBtn.style.fontWeight = toolName === "eraser" ? "bold" : "normal";
    }
  }

  freeformBtn?.addEventListener("click", () => setTool("freeform"));
  selectBtn?.addEventListener("click", () => setTool("select"));
  brushBtn?.addEventListener("click", () => setTool("brush"));
  airbrushBtn?.addEventListener("click", () => setTool("airbrush"));
  wigglyBtn?.addEventListener("click", () => setTool("wiggly"));
  zoomBtn?.addEventListener("click", () => setTool("zoom"));
  pencilBtn?.addEventListener("click", () => setTool("pencil"));
  fillBtn?.addEventListener("click", () => setTool("fill"));
  pickerBtn?.addEventListener("click", () => setTool("picker"));
  textBtn?.addEventListener("click", () => setTool("text"));
  lineBtn?.addEventListener("click", () => setTool("line"));
  curveBtn?.addEventListener("click", () => setTool("curve"));
  rectBtn?.addEventListener("click", () => setTool("rect"));
  ellipseBtn?.addEventListener("click", () => setTool("ellipse"));
  roundRectBtn?.addEventListener("click", () => setTool("roundrect"));
  document.getElementById("oekaki-zoom-in").addEventListener("click", () => changeZoom(1));
  document.getElementById("oekaki-zoom-out").addEventListener("click", () => changeZoom(-1));
  canvasViewport.addEventListener("wheel", (e) => {
    if (currentTool !== "zoom") return;
    e.preventDefault();
    changeZoom(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY);
  }, { passive: false });
  fontInput.addEventListener("change", updateTextEditorStyle);
  sizeInput.addEventListener("input", () => {
    updateTextEditorStyle();
    if (!activeTextBox) return;
    const fontSize = Math.max(10, Number(sizeInput.value) * 3);
    const minHeight = Math.max(34, fontSize * 1.2 + 18);
    activeTextBox.y = Math.min(activeTextBox.y, canvas.height - minHeight);
    activeTextBox.height = Math.min(canvas.height - activeTextBox.y, Math.max(activeTextBox.height, minHeight));
    positionTextEditor();
  });
  document.getElementById("oekaki-color").addEventListener("input", updateTextEditorStyle);
  eraserBtn?.addEventListener("click", () => {
    setTool(currentTool === "eraser" ? "brush" : "eraser");
  });

  // --- DRAGGING & RESIZING PAINT WINDOW (PRESERVING ART) ---
  let isDraggingWin = false;
  let isResizingWin = false;
  let dragStartX = 0, dragStartY = 0;
  let winStartLeft = 0, winStartTop = 0;
  let winStartW = 0, winStartH = 0;
  let canvasStartW = 0, canvasStartH = 0;
  let savedArtData = null;

  function floatPaintWindow() {
    if (paintWin.style.position !== "absolute") {
      const rect = paintWin.getBoundingClientRect();
      paintWin.style.position = "absolute";
      paintWin.style.left = rect.left + window.scrollX + "px";
      paintWin.style.top = rect.top + window.scrollY + "px";
      paintWin.style.width = rect.width + "px";
      paintWin.style.zIndex = 200;
    }
  }

  function startWinDrag(e) {
    if (e.target.closest("button")) return;
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    floatPaintWindow();
    isDraggingWin = true;
    paintWin.style.zIndex = 200;
    dragStartX = touch ? touch.clientX : e.clientX;
    dragStartY = touch ? touch.clientY : e.clientY;
    winStartLeft = parseFloat(paintWin.style.left) || 0;
    winStartTop = parseFloat(paintWin.style.top) || 0;
    e.preventDefault();
  }

  function startWinResize(e) {
    if (activeTextBox) commitTextBox();
    if (selection) commitSelection();
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    floatPaintWindow();
    isResizingWin = true;
    paintWin.style.zIndex = 200;
    dragStartX = touch ? touch.clientX : e.clientX;
    dragStartY = touch ? touch.clientY : e.clientY;
    winStartW = paintWin.offsetWidth;
    winStartH = paintWin.offsetHeight;
    canvasStartW = canvas.width;
    canvasStartH = canvas.height;
    savedArtData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    e.preventDefault();
    e.stopPropagation();
  }

  function onWinMove(e) {
    if (isDraggingWin) {
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      paintWin.style.left = winStartLeft + (clientX - dragStartX) + "px";
      paintWin.style.top = winStartTop + (clientY - dragStartY) + "px";
      e.preventDefault();
    } else if (isResizingWin) {
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      const dx = clientX - dragStartX;
      const dy = clientY - dragStartY;

      const newW = Math.max(256, winStartW + dx);
      const newH = Math.max(290, winStartH + dy);
      paintWin.style.width = newW + "px";
      paintWin.style.height = newH + "px";

      canvas.width = Math.max(220, canvasStartW + dx);
      canvas.height = Math.max(180, canvasStartH + dy);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (savedArtData) {
        ctx.putImageData(savedArtData, 0, 0);
      }
      e.preventDefault();
    }
  }

  function endWinInteraction() {
    if (isResizingWin) {
      syncWigglyLayer();
      saveHistory();
      savedArtData = null;
    }
    isDraggingWin = false;
    isResizingWin = false;
  }

  titleBar.addEventListener("mousedown", startWinDrag);
  titleBar.addEventListener("touchstart", startWinDrag, { passive: false });
  resizer.addEventListener("mousedown", startWinResize);
  resizer.addEventListener("touchstart", startWinResize, { passive: false });
  document.addEventListener("mousemove", onWinMove);
  document.addEventListener("touchmove", onWinMove, { passive: false });
  document.addEventListener("mouseup", endWinInteraction);
  document.addEventListener("touchend", endWinInteraction);
  document.addEventListener("touchcancel", endWinInteraction);

  resetBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selection) commitSelection();
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    paintWin.style.position = "";
    paintWin.style.left = "";
    paintWin.style.top = "";
    paintWin.style.width = "";
    paintWin.style.height = "";
    paintWin.style.zIndex = "";
    canvas.width = 240;
    canvas.height = 220;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(snap, 0, 0);
    syncWigglyLayer();
  });

  // --- SUBMIT TO SUPABASE STORAGE & DATABASE ---
  document.getElementById("oekaki-submit")?.addEventListener("click", async (e) => {
    const rawArtistUrl = artistLinkToggle?.checked ? artistUrlInput?.value.trim() || "" : "";
    const artistUrl = rawArtistUrl ? getSafeArtistUrl(rawArtistUrl) : null;
    if (artistLinkToggle?.checked && !artistUrl) {
      await showAppAlert("Please enter a valid artist URL beginning with http:// or https://.", "Invalid URL");
      artistUrlInput?.focus();
      return;
    }

    if (activeTextBox) commitTextBox();
    if (selection) commitSelection();

    const btn = e.target;
    btn.disabled = true;
    const origText = btn.textContent;
    btn.textContent = "Uploading...";

    try {
      let blob;
      let extension;
      let contentType;
      if (wigglyStrokes.length) {
        blob = createAnimatedGifBlob();
        extension = "gif";
        contentType = "image/gif";
      } else {
        const imageData = canvas.toDataURL("image/png");
        blob = await (await fetch(imageData)).blob();
        extension = "png";
        contentType = "image/png";
      }

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const filePath = `drawings/${fileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('oekaki-drawings')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType
        });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('oekaki-drawings')
        .getPublicUrl(filePath);

      const author = document.getElementById("oekaki-author")?.value.trim() || "Anonymous";
      const drawingRecord = { author, image_url: publicUrl };
      if (artistUrl) drawingRecord.artist_url = artistUrl;
      const { error: dbError } = await supabase.from("oekaki").insert([drawingRecord]);

      if (dbError) {
        const { error: cleanupError } = await supabase.storage
          .from("oekaki-drawings")
          .remove([filePath]);
        if (cleanupError) {
          throw new Error(`${dbError.message} Uploaded image cleanup also failed: ${cleanupError.message}`);
        }
        throw dbError;
      }

      const dingSound = document.getElementById("ding-sound");
      if (dingSound) {
        dingSound.currentTime = 0;
        dingSound.play().catch(() => {});
      }

      clearCanvas();
      if (document.getElementById("oekaki-author")) {
        document.getElementById("oekaki-author").value = "";
      }
      if (artistLinkToggle) artistLinkToggle.checked = false;
      if (artistUrlInput) artistUrlInput.value = "";
      syncArtistUrlField();
      loadOekakiGallery();
    } catch (err) {
      console.error(err);
      await showAppAlert("Error posting drawing: " + err.message, "Error");
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  });

})();

const oekakiPageSize = 8;
const oekakiPageBatchSize = 4;
const oekakiPageOffsets = new Map([[1, 0]]);
let oekakiGalleryLoadVersion = 0;

function escapeOekakiHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getSafeArtistUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function renderOekakiGalleryItem(item) {
  const artistName = escapeOekakiHtml(item.author || "Anonymous");
  const artistUrl = getSafeArtistUrl(item.artist_url);
  const artistNameMarkup = artistUrl
    ? `<a href="${escapeOekakiHtml(artistUrl)}" target="_blank" rel="noopener noreferrer">${artistName}</a>`
    : artistName;
  const imageUrl = escapeOekakiHtml(item.image_url || "");
  const dateStr = new Date(item.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });

  return `
    <div class="window" style="margin-bottom: 0;">
      <div class="title-bar">
        <div class="title-bar-text" style="font-size: 11px;">
          <img src="assets/UI/paint/mspaint.png" width="16" height="16" style="width: 16px !important; height: 16px !important; max-width: 16px !important; max-height: 16px !important; vertical-align: middle; display: inline-block; background: transparent; border: none;"> ${artistNameMarkup}.png
        </div>
      </div>
      <div class="window-body" style="padding: 6px;">
        <img class="oekaki-art-image" src="${imageUrl}" alt="drawing by ${artistName}" loading="eager" style="width:100%; height:auto; display:block; background:#fff; border:1px solid #7f9db9;">
        <div style="font-size: 0.75em; color: #555; margin-top: 4px; text-align: right;">${dateStr}</div>

        ${item.reply_html ? `
          <div class="owner-reply" style="margin-top: 8px; padding: 6px 8px;">
            <img src="${OWNER_AVATAR_URL}" class="owner-avatar" style="width: 20px; height: 20px;">
            <div class="reply-content" style="font-size: 0.85em;"><span class="reply-prefix">R:</span>${item.reply_html}</div>
          </div>
        ` : ""}

        <div class="admin-actions">
          <button class="admin-btn reply-html-btn">Reply HTML</button>
          <button class="admin-btn" onclick="deleteOekaki('${item.id}')" style="background:#f2acac;">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function waitForImage(image, description) {
  if (!image) return Promise.resolve();
  if (image.complete) {
    if (!image.naturalWidth) console.warn(`Could not load ${description}:`, image.src);
    return Promise.resolve();
  }

  return new Promise(resolve => {
    let timeoutId;
    const finish = loaded => {
      clearTimeout(timeoutId);
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
      if (!loaded) console.warn(`Could not load ${description}:`, image.src);
      resolve();
    };
    const onLoad = () => finish(true);
    const onError = () => finish(false);

    timeoutId = setTimeout(() => finish(false), 2000);
    image.addEventListener("load", onLoad, { once: true });
    image.addEventListener("error", onError, { once: true });
  });
}

// --- LOAD OEKAKI GALLERY WITH OWNER REPLIES ---
window.loadOekakiGallery = async function (animateTransition = false) {
  const loadVersion = ++oekakiGalleryLoadVersion;
  const gallery = document.getElementById("oekaki-gallery");
  if (!gallery) return;

  const entries = document.getElementById("entries-container");
  const matchGuestbookHeight = window.matchMedia("(min-width: 861px)").matches;
  if (matchGuestbookHeight && entries) {
    await Promise.all(Array.from(entries.querySelectorAll("img"))
      .map(image => waitForImage(image, "guestbook image")));
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  if (loadVersion !== oekakiGalleryLoadVersion) return;

  const targetHeight = matchGuestbookHeight && entries
    ? Math.max(0, entries.getBoundingClientRect().bottom - gallery.getBoundingClientRect().top)
    : 0;
  let nextOffset = oekakiPageOffsets.get(currentPage);
  if (nextOffset === undefined) {
    nextOffset = (currentPage - 1) * oekakiPageSize;
  }

  gallery.innerHTML = "";
  let displayedCount = 0;
  let reachedEnd = false;
  let reachedHeight = false;
  let failed = false;
  const batchSize = matchGuestbookHeight ? oekakiPageBatchSize : oekakiPageSize;

  while (!reachedEnd && !reachedHeight && (displayedCount === 0 ||
    (matchGuestbookHeight ? gallery.scrollHeight < targetHeight : displayedCount < oekakiPageSize))) {
    const { data, error } = await supabase
      .from("oekaki")
      .select("*")
      .order("created_at", { ascending: false })
      .range(nextOffset, nextOffset + batchSize - 1);

    if (loadVersion !== oekakiGalleryLoadVersion) return;
    if (error) {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = `Error loading drawings: ${error.message}`;
      gallery.appendChild(errorMessage);
      failed = true;
      break;
    }

    if (!data || data.length === 0) {
      reachedEnd = true;
      break;
    }

    for (const item of data) {
      const previousHeight = gallery.scrollHeight;
      gallery.insertAdjacentHTML("beforeend", renderOekakiGalleryItem(item));
      gallery.lastElementChild.querySelector('.reply-html-btn')?.addEventListener('click', () => {
        window.openReplyModal(item.id, item.reply_html || '', 'oekaki');
      });
      nextOffset++;
      displayedCount++;

      const image = gallery.lastElementChild.querySelector(".oekaki-art-image");
      await waitForImage(image, "Oekaki image");
      if (loadVersion !== oekakiGalleryLoadVersion) return;

      if (matchGuestbookHeight && gallery.scrollHeight >= targetHeight) {
        reachedHeight = true;
        const overshoot = gallery.scrollHeight - targetHeight;
        const undershoot = targetHeight - previousHeight;
        if (displayedCount > 1 && overshoot > undershoot) {
          gallery.lastElementChild.remove();
          nextOffset--;
          displayedCount--;
        }
        break;
      }
      if (!matchGuestbookHeight && displayedCount >= oekakiPageSize) break;
    }

    if (data.length < batchSize) reachedEnd = true;
  }

  if (displayedCount === 0 && !failed) {
    gallery.innerHTML = `<p style="color: #fff; text-shadow: 1px 1px 2px #000; text-align: center; font-size: 0.85em;">No drawings on this page.</p>`;
  }

  const followingOffset = nextOffset;
  if (oekakiPageOffsets.get(currentPage + 1) !== followingOffset) {
    for (const page of oekakiPageOffsets.keys()) {
      if (page > currentPage + 1) oekakiPageOffsets.delete(page);
    }
    oekakiPageOffsets.set(currentPage + 1, followingOffset);
  }

  gallery.classList.remove("page-exit");
  if (animateTransition) {
    void gallery.offsetWidth;
    gallery.classList.add("page-enter");
    setTimeout(() => {
      gallery.classList.remove("page-enter");
    }, 300);
  }
};

function getOekakiStoragePath(imageUrl) {
  const image = new URL(imageUrl);
  const storagePrefix = "/storage/v1/object/public/oekaki-drawings/";
  if (image.origin !== new URL(SUPABASE_URL).origin || !image.pathname.startsWith(storagePrefix)) {
    return null;
  }

  const storagePath = decodeURIComponent(image.pathname.slice(storagePrefix.length));
  return storagePath.startsWith("drawings/") ? storagePath : null;
}

window.deleteOekaki = async function (id) {
  if (!await showAppConfirm("Delete this drawing and its uploaded image?", "Delete")) return;

  const { data: drawing, error: fetchError } = await supabase
    .from("oekaki")
    .select("image_url")
    .eq("id", id)
    .single();
  if (fetchError) {
    await showAppAlert("Error finding drawing: " + fetchError.message, "Error");
    return;
  }

  let storagePath;
  try {
    storagePath = getOekakiStoragePath(drawing.image_url);
  } catch (error) {
    await showAppAlert("Could not read the drawing image URL: " + error.message, "Error");
    return;
  }

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("oekaki-drawings")
      .remove([storagePath]);
    if (storageError) {
      await showAppAlert("Error deleting image from Supabase Storage: " + storageError.message, "Error");
      return;
    }
  }

  const { error: deleteError } = await supabase.from("oekaki").delete().eq("id", id);
  if (deleteError) {
    await showAppAlert(storagePath
      ? "The image was deleted, but the drawing entry could not be removed: " + deleteError.message
      : "Error deleting drawing: " + deleteError.message, "Error");
    return;
  }


};

// ==========================================
// DYNAMIC OEKAKI WINDOW TITLE UPDATE
// ==========================================
const oekakiAuthorInput = document.getElementById("oekaki-author");
const oekakiWindowTitle = document.getElementById("oekaki-window-title");

if (oekakiAuthorInput && oekakiWindowTitle) {
  oekakiAuthorInput.addEventListener("input", (e) => {
    const nameVal = e.target.value.trim();
    oekakiWindowTitle.textContent = nameVal !== "" ? nameVal : "untitled";
  });
}
