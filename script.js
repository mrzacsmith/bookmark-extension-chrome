let bookmarkGroups = []
let currentGroupIndex = 0

function saveBookmarks() {
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ bookmarkGroups: bookmarkGroups }, function () {
      if (chrome.runtime.lastError) {
        console.error('Error saving bookmarks:', chrome.runtime.lastError)
      } else {
        console.log('Bookmarks saved')
      }
    })
  } else {
    console.log('Chrome storage API not available. Bookmarks not saved.')
  }
}

function loadBookmarks() {
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['bookmarkGroups'], function (result) {
      if (chrome.runtime.lastError) {
        console.error('Error loading bookmarks:', chrome.runtime.lastError)
        initializeBookmarks()
      } else if (result.bookmarkGroups && result.bookmarkGroups.length > 0) {
        bookmarkGroups = result.bookmarkGroups
        renderNavigation()
        renderBookmarks()
      } else {
        initializeBookmarks()
      }
    })
  } else {
    console.log('Chrome storage API not available. Initializing with default bookmarks.')
    initializeBookmarks()
  }
}

function initializeBookmarks() {
  bookmarkGroups = [{ name: 'Default Group', bookmarks: [] }]
  currentGroupIndex = 0
  saveBookmarks()
  renderNavigation()
  renderBookmarks()
}

function renderNavigation() {
  const nav = document.getElementById('groupNav')
  nav.innerHTML = ''

  bookmarkGroups.forEach((group, index) => {
    const button = document.createElement('button')
    button.textContent = group.name
    button.dataset.groupIndex = index
    if (index === currentGroupIndex) {
      button.classList.add('active')
    }
    nav.insertBefore(button, nav.lastElementChild)
  })

  // Ensure the "New Group" button is always last
  const newGroupBtn = document.getElementById('newGroupBtn')
  nav.appendChild(newGroupBtn)
}

function renderBookmarks() {
  const container = document.getElementById('bookmarkContainer')
  container.innerHTML = ''

  if (bookmarkGroups.length === 0) {
    container.innerHTML = '<p>No bookmark groups. Add a new group to get started!</p>'
    return
  }

  const group = bookmarkGroups[currentGroupIndex]

  const groupElement = document.createElement('div')
  groupElement.innerHTML = `
        <h2>${group.name}</h2>
        <div class="bookmarks"></div>
        <input type="text" id="newBookmarkUrl" placeholder="Enter bookmark URL">
        <input type="text" id="newBookmarkName" placeholder="Enter bookmark name">
        <button id="addBookmarkBtn">Add Bookmark</button>
    `

  const bookmarksContainer = groupElement.querySelector('.bookmarks')
  group.bookmarks.forEach((bookmark, bookmarkIndex) => {
    const bookmarkElement = document.createElement('div')
    bookmarkElement.className = 'bookmark'
    bookmarkElement.innerHTML = `
            <a href="${bookmark.url}" target="_blank">${bookmark.name}</a>
            <button class="deleteBookmarkBtn" data-bookmark-index="${bookmarkIndex}">Delete</button>
        `
    bookmarksContainer.appendChild(bookmarkElement)
  })

  container.appendChild(groupElement)
}

function switchGroup(index) {
  currentGroupIndex = index
  renderNavigation()
  renderBookmarks()
}

function showAddGroupModal() {
  document.getElementById('addGroupModal').style.display = 'block'
}

function hideAddGroupModal() {
  document.getElementById('addGroupModal').style.display = 'none'
  document.getElementById('newGroupName').value = ''
}

function addGroup() {
  const groupName = document.getElementById('newGroupName').value.trim()
  if (groupName) {
    bookmarkGroups.push({ name: groupName, bookmarks: [] })
    currentGroupIndex = bookmarkGroups.length - 1
    saveBookmarks()
    renderNavigation()
    renderBookmarks()
    hideAddGroupModal()
  }
}

function addBookmark() {
  const urlInput = document.getElementById('newBookmarkUrl')
  const nameInput = document.getElementById('newBookmarkName')

  const url = urlInput.value.trim()
  const name = nameInput.value.trim()

  if (url && name) {
    bookmarkGroups[currentGroupIndex].bookmarks.push({ url, name })
    saveBookmarks()
    renderBookmarks()
    urlInput.value = ''
    nameInput.value = ''
  } else {
    alert('Please enter both URL and name for the bookmark.')
  }
}

function deleteBookmark(bookmarkIndex) {
  if (confirm('Are you sure you want to delete this bookmark?')) {
    bookmarkGroups[currentGroupIndex].bookmarks.splice(bookmarkIndex, 1)
    saveBookmarks()
    renderBookmarks()
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  loadBookmarks()

  document.getElementById('newGroupBtn').addEventListener('click', showAddGroupModal)
  document.getElementById('saveNewGroup').addEventListener('click', addGroup)
  document.getElementById('cancelNewGroup').addEventListener('click', hideAddGroupModal)

  document.getElementById('groupNav').addEventListener('click', function (e) {
    if (e.target.dataset.groupIndex) {
      switchGroup(parseInt(e.target.dataset.groupIndex))
    }
  })

  document.getElementById('bookmarkContainer').addEventListener('click', function (e) {
    if (e.target.id === 'addBookmarkBtn') {
      addBookmark()
    } else if (e.target.classList.contains('deleteBookmarkBtn')) {
      deleteBookmark(parseInt(e.target.dataset.bookmarkIndex))
    }
  })
})
