import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://twvtjoehfbzusmfaisum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_erf69vfCX7qHMafcXo1FSw_MP_xGrza';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const OWNER_AVATAR_URL = 'https://avatars.githubusercontent.com/u/176790056?s=200&v=4';

let activeReplyId = null;
let activeReplyTable = 'guestbook';

// Read initial page from URL hash (e.g. #page2) if present
function getPageFromHash() {
  const match = window.location.hash.match(/^#page(\d+)$/i);
  return match ? Math.max(1, parseInt(match[1], 10)) : 1;
}

let currentPage = getPageFromHash();
const pageSize = 10;
let isNewSubmission = false; // Flag to trigger popup animation for new submissions

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

// Run session check on load
checkAdminSession();

// Listen for login/logout state changes automatically across tabs/sessions
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    document.body.classList.add('is-admin');
  } else {
    document.body.classList.remove('is-admin');
  }
});

// Live Taskbar Clock
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const clockEl = document.getElementById('xp-clock');
  if (clockEl) clockEl.textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// Start Menu Toggle
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

// Fixed Click Sound
document.addEventListener('click', (e) => {
  if (e.target.closest('button, a')) {
    const sound = document.getElementById('click-sound');
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }
});

// ASMR Keyboard Sound
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

window.openPreviewModal = () => {
  const rawMessage = document.getElementById('gb-message')?.value || '';
  if (!rawMessage.trim()) {
    alert('What are you gonna preview with a blank message?');
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

// About System Modal handlers
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

// Admin Log On Dialog Handlers
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
    alert("Login failed: " + error.message);
    if (passInput) {
      passInput.value = '';
      passInput.focus();
    }
  } else {
    document.body.classList.add('is-admin');
    alert("Successfully logged in as Admin!");
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
      alert("Error saving reply: " + error.message);
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
    loadOekakiGallery(true);
  }, 180);
}

// Handle browser Back/Forward navigation or direct hash inputs
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
      loadOekakiGallery(true);
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
    return;
  }

  const totalPages = Math.ceil((count || 0) / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // Keep URL hash synchronized if clamped out-of-range
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
    return;
  }

  if (data.length === 0) {
    container.classList.remove('page-exit');
    container.innerHTML = '<p style="color: #fff; text-shadow:1px 1px 2px #000;">No messages yet. Be the first to sign!</p>';
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  container.innerHTML = '';
  data.forEach((entry, index) => {
    const el = document.createElement('div');
    el.className = 'window resizable-window';

    if (currentPage === 1 && index === 0 && isNewSubmission) {
      el.classList.add('window-popup-anim');
    }

    const existingReplyEscaped = entry.reply_html ? encodeURIComponent(entry.reply_html) : '';

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
          <button class="admin-btn" onclick="openReplyModal('${entry.id}', decodeURIComponent('${existingReplyEscaped}'))">Reply HTML</button>
          <button class="admin-btn" onclick="deleteEntry('${entry.id}')" style="background:#f2acac;">Delete</button>
        </div>
      </div>
      <!-- Windows XP Resize Handle -->
      <div class="window-resizer"></div>
    `;
    container.appendChild(el);
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
}

const gbForm = document.getElementById('gb-form');
if (gbForm) {
  gbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const rawMessage = document.getElementById('gb-message')?.value || '';
    if (!rawMessage.trim()) {
      alert('Wow, a blank message. ');
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

    if (error) alert('Error sending message: ' + error.message);
    else {
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
  if (confirm("Are you sure you want to delete this message?")) {
    const { error } = await supabase.from('guestbook').delete().eq('id', id);
    if (error) alert("Error deleting: " + error.message);
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

  document.addEventListener('mousedown', (e) => {
    // Check for Resize Handle
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

      startX = e.clientX;
      startY = e.clientY;
      initialWidth = activeResizeWindow.offsetWidth;
      initialHeight = activeResizeWindow.offsetHeight;

      e.preventDefault();
      return;
    }

    // Check for Title Bar Dragging
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

    startX = e.clientX;
    startY = e.clientY;

    initialLeft = parseFloat(activeDragWindow.style.left) || 0;
    initialTop = parseFloat(activeDragWindow.style.top) || 0;

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (activeResizeWindow) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      activeResizeWindow.style.width = Math.max(240, initialWidth + dx) + 'px';
      activeResizeWindow.style.height = Math.max(150, initialHeight + dy) + 'px';
      return;
    }

    if (activeDragWindow) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      activeDragWindow.style.left = (initialLeft + dx) + 'px';
      activeDragWindow.style.top = (initialTop + dy) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    activeDragWindow = null;
    activeResizeWindow = null;
  });

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
  if (confirm("Are you sure you want to log off from Admin mode?")) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error logging off: " + error.message);
    } else {
      document.body.classList.remove('is-admin');
      alert("Logged off successfully.");
    }
  }
};

// ==========================================
// OEKAKI BOARD (DRAGGABLE, RESIZABLE, CTRL+Z, REPLIES, LINE & GHOST-FREE S-CURVE)
// ==========================================

(function () {
  const paintWin = document.getElementById("oekaki-paint-window");
  const titleBar = document.getElementById("oekaki-title-bar");
  const resizer = document.getElementById("oekaki-resizer");
  const resetBtn = document.getElementById("oekaki-reset-pos");
  const canvas = document.getElementById("oekaki-canvas");
  if (!paintWin || !canvas) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Block external image pasting
  ctx.drawImage = function () {
    console.warn("noo >:(");
  };

  let restoreArray = [];
  let startIndex = -1;
  let isDrawing = false;
  let currentTool = "brush";

  // State variables for line and multi-point curves
  let startX = 0, startY = 0;
  let endX = 0, endY = 0;
  let cp1X = 0, cp1Y = 0; 
  let cp2X = 0, cp2Y = 0;
  let snapshot = null;
  let curveStep = 0; // 0 = idle, 1 = dragging line, 2 = waiting for pull 1, 3 = dragging pull 1, 4 = waiting for pull 2, 5 = dragging pull 2

  // --- DRAWING & CTRL+Z UNDO ---
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDraw(e) {
    e.preventDefault();
    const pos = getPos(e);
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);

    // 1. TEXT TOOL
    if (currentTool === "text") {
      const userText = prompt("Enter text to stamp on canvas:");
      if (userText && userText.trim() !== "") {
        const color = document.getElementById("oekaki-color").value;
        const size = document.getElementById("oekaki-size").value;
        
        ctx.fillStyle = color;
        ctx.font = `${Math.max(10, size * 3)}px Tahoma, sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillText(userText, x, y);

        restoreArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        startIndex++;
      }
      setTool("brush");
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
      restoreArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      startIndex++;
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
        // Take clean snapshot ONCE at the very beginning of the curve tool workflow
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
  }

  function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);

    const color = document.getElementById("oekaki-color").value;
    const size = document.getElementById("oekaki-size").value;

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
      // Always restore the original clean snapshot before rendering preview to completely eliminate ghosting
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
        // Render true cubic bezier curve cleanly from original endpoints using locked cp1 and live cp2
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.stroke();
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

    if (currentTool === "line") {
      isDrawing = false;
      snapshot = null;
      restoreArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      startIndex++;
    } else if (currentTool === "curve") {
      isDrawing = false;
      if (curveStep === 1) {
        curveStep = 2; // Baseline line set, waiting for first pull
      } else if (curveStep === 3) {
        curveStep = 4; // First bend locked in, waiting for second twist pull
      } else if (curveStep === 5) {
        curveStep = 0; // Final twist locked in, shape complete!
        snapshot = null;
        restoreArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        startIndex++;
      }
    } else {
      ctx.stroke();
      ctx.closePath();
      isDrawing = false;
      restoreArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      startIndex++;
    }

    e.preventDefault();
  }

  function clearCanvas() {
    ctx.fillStyle = "#ffffff";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    restoreArray = [];
    startIndex = -1;
    curveStep = 0;
  }

  function undoCanvas() {
    if (startIndex <= 0) {
      clearCanvas();
    } else {
      startIndex--;
      restoreArray.pop();
      ctx.putImageData(restoreArray[startIndex], 0, 0);
      curveStep = 0;
    }
  }

  // --- LINE-AWARE FLOOD FILL ALGORITHM ---
  function floodFill(startX, startY, fillHex) {
    const width = canvas.width;
    const height = canvas.height;
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const fillR = parseInt(fillHex.slice(1, 3), 16);
    const fillG = parseInt(fillHex.slice(3, 5), 16);
    const fillB = parseInt(fillHex.slice(5, 7), 16);

    const startIdx = (startY * width + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];

    if (startR === fillR && startG === fillG && startB === fillB) return;

    const tolerance = 32;
    const visited = new Uint8Array(width * height);

    function matchesTarget(idx) {
      return (
        Math.abs(data[idx] - startR) <= tolerance &&
        Math.abs(data[idx + 1] - startG) <= tolerance &&
        Math.abs(data[idx + 2] - startB) <= tolerance
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
      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = 255;

      if (x > 0) stack.push([x - 1, y]);
      if (x < width - 1) stack.push([x + 1, y]);
      if (y > 0) stack.push([x, y - 1]);
      if (y < height - 1) stack.push([x, y + 1]);
    }

    ctx.putImageData(imgData, 0, 0);
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  window.addEventListener("mouseup", stopDraw);

  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  window.addEventListener("touchend", stopDraw, { passive: false });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      if (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT") return;
      e.preventDefault();
      undoCanvas();
    }
  });

  document.getElementById("oekaki-undo")?.addEventListener("click", undoCanvas);
  document.getElementById("oekaki-clear")?.addEventListener("click", clearCanvas);

  const brushBtn = document.getElementById("oekaki-brush");
  const eraserBtn = document.getElementById("oekaki-eraser");
  const pencilBtn = document.getElementById("oekaki-pencil");
  const fillBtn = document.getElementById("oekaki-fill");
  const pickerBtn = document.getElementById("oekaki-picker");
  const textBtn = document.getElementById("oekaki-text");
  const lineBtn = document.getElementById("oekaki-line");
  const curveBtn = document.getElementById("oekaki-curve");

  function setTool(toolName) {
    currentTool = toolName;
    curveStep = 0; 
    if (brushBtn) brushBtn.classList.toggle("active", toolName === "brush");
    if (pencilBtn) pencilBtn.classList.toggle("active", toolName === "pencil");
    if (fillBtn) fillBtn.classList.toggle("active", toolName === "fill");
    if (pickerBtn) pickerBtn.classList.toggle("active", toolName === "picker");
    if (textBtn) textBtn.classList.toggle("active", toolName === "text");
    if (lineBtn) lineBtn.classList.toggle("active", toolName === "line");
    if (curveBtn) curveBtn.classList.toggle("active", toolName === "curve");
    if (eraserBtn) {
      eraserBtn.classList.toggle("active", toolName === "eraser");
      eraserBtn.style.fontWeight = toolName === "eraser" ? "bold" : "normal";
    }
  }

  brushBtn?.addEventListener("click", () => setTool("brush"));
  pencilBtn?.addEventListener("click", () => setTool("pencil"));
  fillBtn?.addEventListener("click", () => setTool("fill"));
  pickerBtn?.addEventListener("click", () => setTool("picker"));
  textBtn?.addEventListener("click", () => setTool("text"));
  lineBtn?.addEventListener("click", () => setTool("line"));
  curveBtn?.addEventListener("click", () => setTool("curve"));
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

  titleBar.addEventListener("mousedown", (e) => {
    if (e.target.closest("button")) return;
    floatPaintWindow();
    isDraggingWin = true;
    paintWin.style.zIndex = 200;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    winStartLeft = parseFloat(paintWin.style.left) || 0;
    winStartTop = parseFloat(paintWin.style.top) || 0;
    e.preventDefault();
  });

  resizer.addEventListener("mousedown", (e) => {
    floatPaintWindow();
    isResizingWin = true;
    paintWin.style.zIndex = 200;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    winStartW = paintWin.offsetWidth;
    winStartH = paintWin.offsetHeight;
    canvasStartW = canvas.width;
    canvasStartH = canvas.height;
    savedArtData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDraggingWin) {
      paintWin.style.left = winStartLeft + (e.clientX - dragStartX) + "px";
      paintWin.style.top = winStartTop + (e.clientY - dragStartY) + "px";
    } else if (isResizingWin) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

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
    }
  });

  document.addEventListener("mouseup", () => {
    if (isResizingWin) {
      restoreArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      startIndex++;
      savedArtData = null;
    }
    isDraggingWin = false;
    isResizingWin = false;
  });

  resetBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
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
  });

  // --- SUBMIT TO SUPABASE STORAGE & DATABASE ---
  document.getElementById("oekaki-submit")?.addEventListener("click", async (e) => {
    const btn = e.target;
    btn.disabled = true;
    const origText = btn.textContent;
    btn.textContent = "Uploading...";

    try {
      const imageData = canvas.toDataURL("image/png");
      const blob = await (await fetch(imageData)).blob();

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
      const filePath = `drawings/${fileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('oekaki-drawings')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('oekaki-drawings')
        .getPublicUrl(filePath);

      const author = document.getElementById("oekaki-author")?.value.trim() || "Anonymous";
      const { error: dbError } = await supabase.from("oekaki").insert([
        { author: author, image_url: publicUrl }
      ]);

      if (dbError) throw dbError;

      const dingSound = document.getElementById("ding-sound");
      if (dingSound) {
        dingSound.currentTime = 0;
        dingSound.play().catch(() => {});
      }

      clearCanvas();
      if (document.getElementById("oekaki-author")) {
        document.getElementById("oekaki-author").value = "";
      }
      loadOekakiGallery();
    } catch (err) {
      console.error(err);
      alert("Error posting drawing: " + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  });

})();

const oekakiPageSize = 8;

// --- LOAD OEKAKI GALLERY WITH OWNER REPLIES ---
window.loadOekakiGallery = async function (animateTransition = false) {
  const gallery = document.getElementById("oekaki-gallery");
  if (!gallery) return;

  const from = (currentPage - 1) * oekakiPageSize;
  const to = from + oekakiPageSize - 1;

  const { data, error } = await supabase
    .from("oekaki")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    gallery.classList.remove("page-exit");
    return;
  }

  if (data.length === 0) {
    gallery.classList.remove("page-exit");
    gallery.innerHTML = `<p style="color: #fff; text-shadow: 1px 1px 2px #000; text-align: center; font-size: 0.85em;">No drawings on this page.</p>`;
    return;
  }

  gallery.innerHTML = data.map((item) => {
    const replyEscaped = item.reply_html ? encodeURIComponent(item.reply_html) : "";
    const dateStr = new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });

    return `
      <div class="window" style="margin-bottom: 0;">
        <div class="title-bar">
          <div class="title-bar-text" style="font-size: 11px;">${item.author}.png</div>
        </div>
        <div class="window-body" style="padding: 6px;">
          <img src="${item.image_url}" alt="drawing by ${item.author}" loading="lazy" style="width:100%; height:auto; display:block; background:#fff; border:1px solid #7f9db9;">
          <div style="font-size: 0.75em; color: #555; margin-top: 4px; text-align: right;">${dateStr}</div>

          ${item.reply_html ? `
            <div class="owner-reply" style="margin-top: 8px; padding: 6px 8px;">
              <img src="${OWNER_AVATAR_URL}" class="owner-avatar" style="width: 20px; height: 20px;">
              <div class="reply-content" style="font-size: 0.85em;"><span class="reply-prefix">R:</span>${item.reply_html}</div>
            </div>
          ` : ""}

          <div class="admin-actions">
            <button class="admin-btn" onclick="openReplyModal('${item.id}', decodeURIComponent('${replyEscaped}'), 'oekaki')">Reply HTML</button>
            <button class="admin-btn" onclick="deleteOekaki('${item.id}')" style="background:#f2acac;">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  gallery.classList.remove("page-exit");
  if (animateTransition) {
    void gallery.offsetWidth;
    gallery.classList.add("page-enter");
    setTimeout(() => {
      gallery.classList.remove("page-enter");
    }, 300);
  }
};

window.deleteOekaki = async function (id) {
  if (confirm("Delete this drawing?")) {
    const { error } = await supabase.from("oekaki").delete().eq("id", id);
    if (error) alert("Error deleting: " + error.message);
    else loadOekakiGallery();
  }
};

loadOekakiGallery();

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

