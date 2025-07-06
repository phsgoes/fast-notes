let notes = []
let editingNoteId = null
let db = null

const DB_NAME = 'QuickNotesDB'
const DB_VERSION = 1
const NOTES_STORE_NAME = 'notes'
const PREFERENCES_STORE_NAME = 'preferences'

function initDB(callback) {
  const request = indexedDB.open(DB_NAME, DB_VERSION)
  request.onerror = event => console.error('Database error: ', event.target.errorCode)
  request.onsuccess = event => {
    db = event.target.result
    if (callback) callback()
  }
  request.onupgradeneeded = event => {
    let db = event.target.result
    db.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id' })
    db.createObjectStore(PREFERENCES_STORE_NAME, { keyPath: 'key' })
  }
}

function loadNotes(callback) {
  const transaction = db.transaction([NOTES_STORE_NAME], 'readonly')
  const objectStore = transaction.objectStore(NOTES_STORE_NAME)
  const request = objectStore.getAll()
  request.onsuccess = event => {
    notes = event.target.result
    if (callback) callback()
  }
}

function saveNote(event) {
  event.preventDefault()
  const title = document.getElementById('noteTitle').value.trim()
  const content = document.getElementById('noteContent').value.trim()
  const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite')
  const objectStore = transaction.objectStore(NOTES_STORE_NAME)

  if (editingNoteId) {
    const noteIndex = notes.findIndex(note => note.id === editingNoteId)
    const updatedNote = { ...notes[noteIndex], title: title, content: content }
    objectStore.put(updatedNote)
    notes[noteIndex] = updatedNote
  } else {
    const newNote = { id: generateId(), title: title, content: content }
    objectStore.add(newNote)
    notes.unshift(newNote)
  }

  closeNoteDialog()
  renderNotes()
}

function generateId() {
  return Date.now().toString()
}

function deleteNote(noteId) {
  const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite')
  const objectStore = transaction.objectStore(NOTES_STORE_NAME)
  objectStore.delete(noteId)

  notes = notes.filter(note => note.id !== noteId)
  renderNotes()
}

function renderNotes() {
  const notesContainer = document.getElementById('notesContainer')

  if(notes.length === 0) {
    // Show some fall back elements
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No notes yet</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
      </div>
    `
    return
  }

  notesContainer.innerHTML = notes.map(note => `
    <div class="note-card">
      <h3 class="note-title" title="${note.title}">${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <div class="note-actions">
        <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15.4998 5.49994L18.3282 8.32837M3 20.9997L3.04745 20.6675C3.21536 19.4922 3.29932 18.9045 3.49029 18.3558C3.65975 17.8689 3.89124 17.4059 4.17906 16.9783C4.50341 16.4963 4.92319 16.0765 5.76274 15.237L17.4107 3.58896C18.1918 2.80791 19.4581 2.80791 20.2392 3.58896C21.0202 4.37001 21.0202 5.63634 20.2392 6.41739L8.37744 18.2791C7.61579 19.0408 7.23497 19.4216 6.8012 19.7244C6.41618 19.9932 6.00093 20.2159 5.56398 20.3879C5.07171 20.5817 4.54375 20.6882 3.48793 20.9012L3 20.9997Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('')
}

function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog')
  const titleInput = document.getElementById('noteTitle')
  const contentInput = document.getElementById('noteContent')

  if (noteId) {
    // Edit Mode
    const noteToEdit = notes.find(note => note.id === noteId)
    editingNoteId = noteId
    document.getElementById('dialogTitle').textContent = 'Edit Note'
    document.getElementById('saveBtn').textContent = 'Update Note'
    titleInput.value = noteToEdit.title
    contentInput.value = noteToEdit.content
    dialog.showModal()
    titleInput.focus()
    return
  }

  editingNoteId = null
  document.getElementById('dialogTitle').textContent = 'Add New Note'
  titleInput.value = ''
  contentInput.value = ''
  dialog.showModal()
  titleInput.focus()
}

function closeNoteDialog() {
  document.getElementById('noteDialog').close()
  // Reset Save Button text...
  document.getElementById('saveBtn').textContent = 'Save Note'
}

function toggleTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn')
  const isDark = document.body.classList.toggle('dark-theme')
  const theme = isDark ? 'dark' : 'light'

  const transaction = db.transaction([PREFERENCES_STORE_NAME], 'readwrite')
  const objectStore = transaction.objectStore(PREFERENCES_STORE_NAME)
  objectStore.put({ key: 'theme', value: theme })

  themeToggleBtn.textContent = isDark ? '☀️' : '🌙'
  themeToggleBtn.setAttribute('title', isDark ? 'Change to light mode' : 'Change to dark mode')
}

function applyStoredTheme() {
  const transaction = db.transaction([PREFERENCES_STORE_NAME], 'readonly')
  const objectStore = transaction.objectStore(PREFERENCES_STORE_NAME)
  const request = objectStore.get('theme')
  request.onsuccess = event => {
    const result = event.target.result
    if (result && result.value === 'dark') {
      document.body.classList.add('dark-theme')
      document.getElementById('themeToggleBtn').textContent = '☀️'
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDB(() => { applyStoredTheme(); loadNotes(() => renderNotes()) })

  document.getElementById('noteForm').addEventListener('submit', saveNote)
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme)
  const noteDialog = document.getElementById('noteDialog')

  noteDialog.addEventListener('click', event => {
    if (event.target === noteDialog) closeNoteDialog()
  })
})
