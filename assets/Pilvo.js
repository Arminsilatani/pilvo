/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-05-22
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== EDITOR SCRIPT ============================ */

document.addEventListener('DOMContentLoaded', function() {

  /* :::::::::::::::::::::::::: ELEMENTS :::::::::::::::::::::::::: */
  const editor           = document.getElementById('editor');
  const toolbar          = document.getElementById('toolbar');
  const counter          = document.getElementById('wordCharCounter');
  const fontSizeSelect   = document.getElementById('fontSizeSelect');
  const textColorInput   = document.getElementById('textColorInput');
  const bgColorInput     = document.getElementById('bgColorInput');
  const codeViewBtn      = document.getElementById('codeViewBtn');
  const emojiBtn         = document.getElementById('emojiBtn');
  const emojiPanel       = document.getElementById('emojiPanel');
  const emojiRow         = document.getElementById('emojiRow');
  const fullscreenBtn    = document.getElementById('fullscreenBtn');
  const exportBtn        = document.getElementById('exportTxtBtn');
  const loremBtn         = document.getElementById('loremBtn');
  const insertImageBtn   = document.getElementById('insertImageBtn');
  const insertTableBtn   = document.getElementById('insertTableBtn');
  const removeFormatBtn  = document.getElementById('removeFormatBtn');
  const cleanHtmlBtn     = document.getElementById('cleanHtmlBtn');
  const importBtn        = document.getElementById('importBtn');
  const importFileInput  = document.getElementById('importFileInput');
  const seoBtn           = document.getElementById('seoBtn');
  const seoPanel         = document.getElementById('seoPanel');
  const copyAllBtn       = document.getElementById('copyAllBtn');  // New: Copy All button

  // Toolbar scroll elements
  const scrollViewport   = document.querySelector('.toolbar-scroll-viewport');
  const arrowLeft        = document.getElementById('toolbarArrowLeft');
  const arrowRight       = document.getElementById('toolbarArrowRight');

  let isCodeView = false;

  /* :::::::::::::::::::::::::: TOOLBAR SCROLL :::::::::::::::::::::::::: */
  function updateToolbarArrows() {
    if (!scrollViewport) return;
    const maxScroll = toolbar.scrollWidth - scrollViewport.clientWidth;
    const scrollLeft = toolbar.scrollLeft;
    if (maxScroll <= 1) {
      arrowLeft.classList.add('hidden');
      arrowRight.classList.add('hidden');
    } else {
      arrowLeft.classList.toggle('hidden', scrollLeft <= 1);
      arrowRight.classList.toggle('hidden', scrollLeft >= maxScroll - 1);
    }
  }

  arrowLeft.addEventListener('click', () => toolbar.scrollBy({ left: -200, behavior: 'smooth' }));
  arrowRight.addEventListener('click', () => toolbar.scrollBy({ left: 200, behavior: 'smooth' }));
  toolbar.addEventListener('scroll', updateToolbarArrows);
  window.addEventListener('resize', updateToolbarArrows);
  new MutationObserver(updateToolbarArrows).observe(toolbar, { attributes: true, childList: true, subtree: true });
  updateToolbarArrows();

  /* :::::::::::::::::::::::::: CUSTOM HISTORY :::::::::::::::::::::::::: */
  const HISTORY_LIMIT = 100;
  let historyStack = [];
  let historyIndex = -1;
  let isUndoRedoAction = false;

  function pushHistory() {
    if (isUndoRedoAction) return;
    if (historyIndex < historyStack.length - 1) historyStack = historyStack.slice(0, historyIndex + 1);
    const html = editor.innerHTML;
    if (historyStack.length && historyStack[historyIndex] === html) return;
    historyStack.push(html);
    if (historyStack.length > HISTORY_LIMIT) historyStack.shift();
    else historyIndex++;
  }

  function undo() {
    if (historyIndex <= 0) return;
    isUndoRedoAction = true;
    historyIndex--;
    editor.innerHTML = historyStack[historyIndex];
    editor.focus();
    isUndoRedoAction = false;
    updateCounter();
    updateToolbarState();
  }

  function redo() {
    if (historyIndex >= historyStack.length - 1) return;
    isUndoRedoAction = true;
    historyIndex++;
    editor.innerHTML = historyStack[historyIndex];
    editor.focus();
    isUndoRedoAction = false;
    updateCounter();
    updateToolbarState();
  }

  pushHistory();
  editor.addEventListener('input', () => {
    if (!isUndoRedoAction) pushHistory();
    updateCounter();
  });

  function afterCommand() {
    if (!isUndoRedoAction) pushHistory();
    updateCounter();
    updateToolbarState();
  }

  /* :::::::::::::::::::::::::: COUNTER & COPY ALL BUTTON :::::::::::::::::::::::::: */
  function updateCounter() {
    const text = editor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    counter.textContent = `Words: ${words} · Chars: ${chars}`;

    // Show or hide the copy all button
    updateCopyAllButton();
  }

  function updateCopyAllButton() {
    const text = editor.innerText || '';
    const hasContent = text.trim().length > 0;

    if (hasContent && !isCodeView) {
      copyAllBtn.classList.add('show');
    } else {
      copyAllBtn.classList.remove('show');
    }
  }

  editor.addEventListener('paste', () => setTimeout(updateCounter, 10));

  /* ------------------------- FONT SIZE ------------------------- */
  fontSizeSelect.addEventListener('change', function() {
    document.execCommand('fontSize', false, this.value);
    editor.focus();
    afterCommand();
  });

  /* ------------------------- COLOR PICKERS ------------------------- */
  document.getElementById('textColorBtn').addEventListener('click', () => textColorInput.click());
  textColorInput.addEventListener('input', function() {
    document.execCommand('foreColor', false, this.value);
    editor.focus();
    afterCommand();
  });
  document.getElementById('bgColorBtn').addEventListener('click', () => bgColorInput.click());
  bgColorInput.addEventListener('input', function() {
    document.execCommand('backColor', false, this.value);
    editor.focus();
    afterCommand();
  });

  /* ------------------------- INSERT IMAGE ------------------------- */
  insertImageBtn.addEventListener('click', function() {
    const url = prompt('Enter image URL:');
    if (url) {
      document.execCommand('insertImage', false, url);
      editor.focus();
      afterCommand();
    }
  });

  /* ------------------------- CODE VIEW ------------------------- */
  codeViewBtn.addEventListener('click', function() {
    isCodeView = !isCodeView;
    if (isCodeView) {
      editor.classList.add('code-view');
      editor.textContent = editor.innerHTML;
      codeViewBtn.classList.add('active');
    } else {
      editor.classList.remove('code-view');
      editor.innerHTML = editor.textContent || '';
      codeViewBtn.classList.remove('active');
      pushHistory();
    }
    editor.focus();
    updateCounter();
  });

  /* ------------------------- EMOJI PICKER ------------------------- */
  const emojis = [
    "😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😙","😚","😋",
    "😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","😣",
    "😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥",
    "😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴",
    "🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡",
    "💩","👻","💀","☠️","👽","👾","🤖","🎃","😺","😸","😹","😻","😼","😽","🙀","😿","😾"
  ];

  function buildEmojiRow() {
    emojiRow.innerHTML = '';
    emojis.forEach(emoji => {
      const btn = document.createElement('button');
      btn.textContent = emoji;
      btn.addEventListener('click', () => {
        insertTextAtCursor(emoji);
        emojiPanel.style.display = 'none';
        editor.focus();
        afterCommand();
      });
      emojiRow.appendChild(btn);
    });
  }

  function positionEmojiPanel() {
    const btnRect = emojiBtn.getBoundingClientRect();
    const panelHeight = 56;
    const panelWidth = Math.min(window.innerWidth - 32, 560);
    emojiPanel.style.maxWidth = panelWidth + 'px';
    let top = btnRect.bottom + 6;
    let left = btnRect.left;
    if (top + panelHeight > window.innerHeight - 10) top = btnRect.top - panelHeight - 6;
    if (left + panelWidth > window.innerWidth - 16) left = window.innerWidth - panelWidth - 16;
    if (left < 16) left = 16;
    emojiPanel.style.top = top + 'px';
    emojiPanel.style.left = left + 'px';
  }

  function insertTextAtCursor(text) {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  buildEmojiRow();
  emojiBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (emojiPanel.style.display === 'flex') {
      emojiPanel.style.display = 'none';
      return;
    }
    positionEmojiPanel();
    emojiPanel.style.display = 'flex';
  });
  window.addEventListener('resize', () => { if (emojiPanel.style.display === 'flex') positionEmojiPanel(); });
  window.addEventListener('scroll', () => { if (emojiPanel.style.display === 'flex') positionEmojiPanel(); });
  document.addEventListener('click', event => {
    if (!emojiPanel.contains(event.target) && event.target !== emojiBtn) emojiPanel.style.display = 'none';
  });

  /* ------------------------- FULLSCREEN ------------------------- */
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.log);
      fullscreenBtn.classList.add('active');
    } else {
      document.exitFullscreen();
      fullscreenBtn.classList.remove('active');
    }
  });
  document.addEventListener('fullscreenchange', () => fullscreenBtn.classList.toggle('active', !!document.fullscreenElement));

  /* ------------------------- EXPORT ------------------------- */
  exportBtn.addEventListener('click', () => {
    const text = editor.innerText || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pilvo-document.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  /* ------------------------- LOREM IPSUM ------------------------- */
  loremBtn.addEventListener('click', () => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    editor.focus();
    const sel = window.getSelection();
    if (sel.rangeCount && sel.getRangeAt(0).intersectsNode(editor)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(lorem));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editor.innerHTML += '<p>' + lorem + '</p>';
    }
    afterCommand();
  });

  /* :::::::::::::::::::::::::: LINK MODAL :::::::::::::::::::::::::: */
  let savedRange = null;
  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
  }
  function restoreSelection() {
    if (savedRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
  }
  function findExistingLinkAtSelection() {
    if (!savedRange) return false;
    let node = savedRange.startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    return node && node.closest('a') !== null;
  }

  function openLinkModal(editingExisting = false) {
    const modal = document.getElementById('linkModal');
    const urlInput = document.getElementById('linkUrlInput');
    const targetCheck = document.getElementById('linkTargetBlank');
    const relChecks = document.querySelectorAll('.rel-check');
    const insertBtn = document.getElementById('linkInsertBtn');
    const removeBtn = document.getElementById('linkRemoveBtn');

    urlInput.value = '';
    targetCheck.checked = false;
    relChecks.forEach(cb => cb.checked = false);
    removeBtn.style.display = editingExisting ? 'inline-block' : 'none';

    if (editingExisting && savedRange) {
      let anchor = null;
      const startNode = savedRange.startContainer;
      if (startNode.nodeType === Node.TEXT_NODE) anchor = startNode.parentElement.closest('a');
      else anchor = startNode.closest('a');
      if (anchor) {
        urlInput.value = anchor.getAttribute('href') || '';
        targetCheck.checked = anchor.getAttribute('target') === '_blank';
        const relStr = anchor.getAttribute('rel') || '';
        const relValues = relStr.split(' ').filter(Boolean);
        relChecks.forEach(cb => {
          if (relValues.includes(cb.value)) cb.checked = true;
        });
      }
    }

    // Auto-sync noopener with target="_blank"
    targetCheck.addEventListener('change', function() {
      const noopenerCheck = document.querySelector('.rel-check[value="noopener"]');
      if (noopenerCheck) {
        noopenerCheck.checked = targetCheck.checked;
      }
    });

    modal.style.display = 'flex';
    urlInput.focus();

    insertBtn.onclick = () => {
      const url = urlInput.value.trim();
      if (!url) {
        alert('Please enter a valid URL');
        return;
      }
      const targetBlank = targetCheck.checked;
      const relString = Array.from(document.querySelectorAll('.rel-check:checked'))
                             .map(cb => cb.value)
                             .join(' ');
      applyLinkOptions(url, targetBlank, relString);
      closeLinkModal();
    };

    document.getElementById('linkCancelBtn').onclick = closeLinkModal;

    removeBtn.onclick = () => {
      restoreSelection();
      editor.focus();
      document.execCommand('unlink');
      closeLinkModal();
      afterCommand();
    };

    modal.onclick = e => {
      if (e.target === modal) closeLinkModal();
    };
  }

  function closeLinkModal() {
    document.getElementById('linkModal').style.display = 'none';
    savedRange = null;
    editor.focus();
  }

  function applyLinkOptions(url, targetBlank, relString) {
    restoreSelection();
    editor.focus();
    document.execCommand('createLink', false, url);
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      let node = sel.anchorNode;
      if (!node) return;
      let anchor = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      while (anchor && anchor.tagName !== 'A') {
        anchor = anchor.parentElement;
      }
      if (anchor && anchor.tagName === 'A') {
        if (targetBlank) {
          anchor.setAttribute('target', '_blank');
        } else {
          anchor.removeAttribute('target');
        }
        if (relString.trim()) {
          anchor.setAttribute('rel', relString.trim());
        } else {
          anchor.removeAttribute('rel');
        }
      }
    }
    afterCommand();
  }

  /* ------------------------- REMOVE FORMAT ------------------------- */
  function removeInlineFormatting() {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const fragment = range.extractContents();
    const div = document.createElement('div');
    div.appendChild(fragment);

    const formattingTags = ['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'FONT', 'SUP', 'SUB', 'SPAN'];
    function cleanNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (formattingTags.includes(node.tagName)) {
          while (node.firstChild) node.parentNode.insertBefore(node.firstChild, node);
          node.parentNode.removeChild(node);
        } else {
          let child = node.firstChild;
          while (child) {
            const next = child.nextSibling;
            cleanNode(child);
            child = next;
          }
        }
      }
    }
    cleanNode(div);
    range.insertNode(div);
    editor.focus();
    afterCommand();
  }
  removeFormatBtn.addEventListener('click', () => {
    editor.focus();
    removeInlineFormatting();
  });

  /* ------------------------- STRIP ALL HTML (CLEAN BUTTON) ------------------------- */
  cleanHtmlBtn.addEventListener('click', function() {
    // If in Code View mode
    if (isCodeView) {
      const selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) {
        alert('Please select the text you want to clean.');
        return;
      }

      const selectedText = selection.toString();
      if (!selectedText) return;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = selectedText;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(plainText));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      afterCommand();
      return;
    }

    // Normal mode
    editor.focus();
    const sel = window.getSelection();

    if (!sel.rangeCount || sel.isCollapsed) {
      alert('Please select the text you want to clean.');
      return;
    }

    const range = sel.getRangeAt(0);
    const fragment = range.extractContents();

    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    if (!plainText) {
      range.insertNode(tempDiv);
      return;
    }

    range.insertNode(document.createTextNode(plainText));

    sel.removeAllRanges();
    sel.addRange(range);

    editor.focus();
    afterCommand();
  });

  /* ------------------------- PASTE HANDLING ------------------------- */
  editor.addEventListener('paste', function(e) {
    if (e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
      afterCommand();
      return;
    }
    e.preventDefault();
    const html = (e.clipboardData || window.clipboardData).getData('text/html');
    const plain = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (html) {
      const cleanHTML = cleanDirtyHTML(html);
      document.execCommand('insertHTML', false, cleanHTML);
    } else if (plain) {
      document.execCommand('insertText', false, plain);
    }
    afterCommand();
  });

  function cleanDirtyHTML(dirty) {
    const temp = document.createElement('div');
    temp.innerHTML = dirty;
    temp.querySelectorAll('*').forEach(el => {
      el.removeAttribute('style');
      el.removeAttribute('class');
      if (el.tagName === 'FONT' || el.tagName === 'SPAN') {
        el.replaceWith(...el.childNodes);
      }
    });
    return temp.innerHTML;
  }

  /* ------------------------- TABLE INSERTION ------------------------- */
  insertTableBtn.addEventListener('click', () => {
    document.getElementById('tableModal').style.display = 'flex';
    document.getElementById('tableRows').value = 3;
    document.getElementById('tableCols').value = 3;
    document.getElementById('tableRows').focus();
  });
  document.getElementById('tableInsertBtn').addEventListener('click', () => {
    const rows = parseInt(document.getElementById('tableRows').value) || 3;
    const cols = parseInt(document.getElementById('tableCols').value) || 3;
    let tableHTML = '<table><tbody>';
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td><br></td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table><p><br></p>';
    document.execCommand('insertHTML', false, tableHTML);
    document.getElementById('tableModal').style.display = 'none';
    editor.focus();
    afterCommand();
  });
  document.getElementById('tableCancelBtn').addEventListener('click', () => {
    document.getElementById('tableModal').style.display = 'none';
  });

  /* ------------------------- FILE IMPORT ------------------------- */
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target.result;
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'html') {
        editor.innerHTML = content;
      } else if (ext === 'md' || ext === 'txt') {
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
        editor.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
      } else {
        alert('Unsupported file type.');
        return;
      }
      afterCommand();
    };
    reader.readAsText(file);
    this.value = '';
  });

  /* ------------------------- SEO PREVIEW ------------------------- */
  seoBtn.addEventListener('click', () => {
    seoPanel.style.display = 'block';
    updateSEOPreview();
  });
  document.getElementById('seoCloseBtn').addEventListener('click', () => {
    seoPanel.style.display = 'none';
  });

  function updateSEOPreview() {
    const text = editor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const wordCount = words.length;
    document.getElementById('seoReadingTime').textContent = Math.ceil(wordCount / 200) + ' min';
    document.getElementById('seoWordCount').textContent = wordCount;

    const freq = {};
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z0-9آ-ی]/g, '');
      if (clean.length > 2) freq[clean] = (freq[clean] || 0) + 1;
    });
    const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0,5);
    const list = document.getElementById('seoKeywords');
    list.innerHTML = '';
    sorted.forEach(([word, count]) => {
      const li = document.createElement('li');
      li.textContent = `${word} (${count})`;
      list.appendChild(li);
    });

    document.getElementById('seoMetaDesc').textContent =
      text.substring(0, 160).replace(/\s+/g, ' ').trim() + (text.length > 160 ? '...' : '');
  }
  editor.addEventListener('input', () => {
    if (seoPanel.style.display === 'block') updateSEOPreview();
  });

  /* ------------------------- COPY ALL BUTTON ------------------------- */
  copyAllBtn.addEventListener('click', function() {
    const text = editor.innerText || '';
    if (!text.trim()) return;

    // Attempt with modern Clipboard API (requires HTTPS or localhost)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showCopySuccess();
      }).catch(err => {
        console.warn('Clipboard API failed, trying fallback:', err);
        fallbackCopy(text);
      });
    } else {
      // Use legacy fallback (works everywhere)
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopySuccess();
    } catch (err) {
      alert('Copy failed. Please copy manually.');
    }
    document.body.removeChild(textarea);
  }

  function showCopySuccess() {
    // Visual feedback: temporarily change icon to checkmark
    const originalHTML = copyAllBtn.innerHTML;
    copyAllBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    copyAllBtn.style.color = '#4ade80';

    setTimeout(() => {
      copyAllBtn.innerHTML = originalHTML;
      copyAllBtn.style.color = '';
    }, 1500);
  }

  /* ------------------------- TOOLBAR COMMANDS ------------------------- */
  toolbar.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    if (cmd === 'undo') { undo(); return; }
    if (cmd === 'redo') { redo(); return; }
    if (!cmd) return;

    if (cmd === 'createLink') {
      saveSelection();
      openLinkModal(findExistingLinkAtSelection());
    } else if (cmd === 'formatBlock') {
      document.execCommand('formatBlock', false, `<${btn.dataset.value}>`);
      editor.focus();
      afterCommand();
    } else {
      document.execCommand(cmd, false, btn.dataset.value || null);
      editor.focus();
      afterCommand();
    }
  });

  editor.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  });

  function updateToolbarState() {
    toolbar.querySelectorAll('.tool-btn[data-cmd]').forEach(btn => {
      const cmd = btn.dataset.cmd;
      if (!cmd || ['createLink','unlink','removeFormat','formatBlock'].includes(cmd)) return;
      btn.classList.toggle('active', document.queryCommandState(cmd));
    });
    toolbar.querySelectorAll('[data-cmd="formatBlock"]').forEach(btn => {
      const val = btn.dataset.value;
      btn.classList.toggle('active', document.queryCommandValue('formatBlock').toLowerCase() === val.toLowerCase());
    });
    const size = document.queryCommandValue('fontSize');
    if (size && fontSizeSelect.querySelector(`option[value="${size}"]`)) fontSizeSelect.value = size;
  }

  document.addEventListener('selectionchange', () => {
    if (document.activeElement === editor || document.activeElement?.closest?.('.editor-wrapper')) {
      updateToolbarState();
    }
  });
  editor.addEventListener('focus', updateToolbarState);
  editor.addEventListener('click', updateToolbarState);
  editor.addEventListener('keyup', updateToolbarState);

  /* :::::::::::::::::::::::::: INITIALIZATION :::::::::::::::::::::::::: */
  editor.focus();
  updateCounter();
});