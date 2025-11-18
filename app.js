// Mock data structure (simulating backend)
// In production, this would connect to your C backend via HTTP API
let currentUser = null;
let users = [];
let books = [];
let friendRequests = [];
let bookRequests = [];
let undoStack = [];
let currentRatingLender = null;
let selectedRating = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadMockData();
});

// Load mock data (simulating data from C backend)
function loadMockData() {
    users = [
        { username: 'alice', password: 'pass123', friends: ['bob'], rating_sum: 20, rating_count: 5 },
        { username: 'bob', password: 'pass123', friends: ['alice', 'charlie'], rating_sum: 18, rating_count: 4 },
        { username: 'charlie', password: 'pass123', friends: ['bob'], rating_sum: 15, rating_count: 3 }
    ];
    
    books = [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', owner: 'alice' },
        { id: 2, title: '1984', author: 'George Orwell', owner: 'bob' },
        { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', owner: 'charlie' }
    ];
    
    bookRequests = [
        { bookId: 1, requests: ['bob'] },
        { bookId: 2, requests: [] }
    ];
    
    friendRequests = [
        { id: 1, from: 'alice', to: 'charlie', status: 'pending' }
    ];
}

// Authentication
function showTab(tab) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('register-form').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = username;
        document.getElementById('username-display').textContent = username;
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        showToast('Welcome back, ' + username + '!', 'success');
        loadMyBooks();
        updateBadges();
    } else {
        showToast('Invalid credentials', 'error');
    }
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (!username || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (password !== confirm) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        showToast('Username already exists', 'error');
        return;
    }
    
    users.push({ 
        username, 
        password, 
        friends: [], 
        rating_sum: 0, 
        rating_count: 0 
    });
    
    showToast('Account created successfully!', 'success');
    showTab('login');
}

function logout() {
    currentUser = null;
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    showToast('Logged out successfully', 'success');
}

// Navigation
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    document.getElementById(viewName + '-view').classList.add('active');
    event.target.closest('.menu-item').classList.add('active');
    
    // Load appropriate data
    switch(viewName) {
        case 'my-books': loadMyBooks(); break;
        case 'community': loadCommunityBooks(); break;
        case 'requests': loadBookRequests(); break;
        case 'friends': loadFriends(); break;
        case 'friend-requests': loadFriendRequests(); break;
        case 'leaderboard': loadLeaderboard(); break;
    }
}

// Books Management
function showAddBookModal() {
    document.getElementById('add-book-modal').style.display = 'block';
}

function addBook() {
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    
    if (!title || !author) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const newBook = {
        id: books.length + 1,
        title,
        author,
        owner: currentUser
    };
    
    books.push(newBook);
    undoStack.push(newBook.id);
    
    closeModal('add-book-modal');
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    
    showToast('Book added successfully!', 'success');
    loadMyBooks();
}

function undoLastBook() {
    if (undoStack.length === 0) {
        showToast('Nothing to undo', 'warning');
        return;
    }
    
    const bookId = undoStack.pop();
    const index = books.findIndex(b => b.id === bookId);
    
    if (index !== -1) {
        const book = books[index];
        books.splice(index, 1);
        showToast('Removed: ' + book.title, 'success');
        loadMyBooks();
    }
}

function loadMyBooks() {
    const container = document.getElementById('my-books-list');
    const myBooks = books.filter(b => b.owner === currentUser);
    
    if (myBooks.length === 0) {
        container.innerHTML = '<p style="color: var(--gray);">You haven\'t added any books yet.</p>';
        return;
    }
    
    container.innerHTML = myBooks.map(book => `
        <div class="book-card">
            <h3>📖 ${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ID:</strong> ${book.id}</p>
        </div>
    `).join('');
}

function loadCommunityBooks() {
    const container = document.getElementById('community-books-list');
    const communityBooks = books.filter(b => b.owner !== currentUser);
    
    if (communityBooks.length === 0) {
        container.innerHTML = '<p style="color: var(--gray);">No books available in the community.</p>';
        return;
    }
    
    container.innerHTML = communityBooks.map(book => `
        <div class="book-card">
            <h3>📖 ${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p class="book-owner">Owner: ${book.owner}</p>
            <div class="book-actions">
                <button class="btn-action btn-request" onclick="requestBook(${book.id})">
                    📬 Request
                </button>
                <button class="btn-action btn-secondary" onclick="showRateModal('${book.owner}')">
                    ⭐ Rate Owner
                </button>
            </div>
        </div>
    `).join('');
}

function filterBooks() {
    const searchTerm = document.getElementById('search-books').value.toLowerCase();
    const communityBooks = books.filter(b => 
        b.owner !== currentUser && 
        (b.title.toLowerCase().includes(searchTerm) || 
         b.author.toLowerCase().includes(searchTerm))
    );
    
    const container = document.getElementById('community-books-list');
    container.innerHTML = communityBooks.map(book => `
        <div class="book-card">
            <h3>📖 ${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p class="book-owner">Owner: ${book.owner}</p>
            <div class="book-actions">
                <button class="btn-action btn-request" onclick="requestBook(${book.id})">
                    📬 Request
                </button>
                <button class="btn-action btn-secondary" onclick="showRateModal('${book.owner}')">
                    ⭐ Rate Owner
                </button>
            </div>
        </div>
    `).join('');
}

function requestBook(bookId) {
    const existing = bookRequests.find(r => r.bookId === bookId);
    
    if (existing) {
        if (!existing.requests.includes(currentUser)) {
            existing.requests.push(currentUser);
            showToast('Request sent!', 'success');
        } else {
            showToast('You already requested this book', 'warning');
        }
    } else {
        bookRequests.push({ bookId, requests: [currentUser] });
        showToast('Request sent!', 'success');
    }
    
    updateBadges();
}

function loadBookRequests() {
    const container = document.getElementById('requests-list');
    const myRequests = bookRequests.filter(req => {
        const book = books.find(b => b.id === req.bookId);
        return book && book.owner === currentUser && req.requests.length > 0;
    });
    
    if (myRequests.length === 0) {
        container.innerHTML = '<p style="color: var(--gray);">No pending requests.</p>';
        return;
    }
    
    container.innerHTML = myRequests.map(req => {
        const book = books.find(b => b.id === req.bookId);
        const requester = req.requests[0];
        
        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-info">
                        <h4>${book.title}</h4>
                        <p>Request from: <strong>${requester}</strong></p>
                    </div>
                    <div class="request-actions">
                        <button class="btn-action btn-accept" onclick="acceptRequest(${req.bookId}, '${requester}')">
                            ✓ Accept
                        </button>
                        <button class="btn-action btn-reject" onclick="rejectRequest(${req.bookId}, '${requester}')">
                            ✗ Reject
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function acceptRequest(bookId, requester) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.owner = requester;
        const req = bookRequests.find(r => r.bookId === bookId);
        if (req) {
            req.requests = req.requests.filter(r => r !== requester);
        }
        showToast('Book transferred to ' + requester, 'success');
        loadBookRequests();
        updateBadges();
    }
}

function rejectRequest(bookId, requester) {
    const req = bookRequests.find(r => r.bookId === bookId);
    if (req) {
        req.requests = req.requests.filter(r => r !== requester);
        showToast('Request rejected', 'success');
        loadBookRequests();
        updateBadges();
    }
}

// Friends Management
function showAddFriendModal() {
    document.getElementById('add-friend-modal').style.display = 'block';
}

function sendFriendRequest() {
    const username = document.getElementById('friend-username').value;
    
    if (!username) {
        showToast('Please enter a username', 'error');
        return;
    }
    
    if (username === currentUser) {
        showToast('You cannot friend yourself', 'error');
        return;
    }
    
    if (!users.find(u => u.username === username)) {
        showToast('User not found', 'error');
        return;
    }
    
    const user = users.find(u => u.username === currentUser);
    if (user.friends.includes(username)) {
        showToast('Already friends', 'warning');
        return;
    }
    
    if (friendRequests.find(r => r.from === currentUser && r.to === username && r.status === 'pending')) {
        showToast('Request already sent', 'warning');
        return;
    }
    
    friendRequests.push({
        id: friendRequests.length + 1,
        from: currentUser,
        to: username,
        status: 'pending'
    });
    
    closeModal('add-friend-modal');
    document.getElementById('friend-username').value = '';
    showToast('Friend request sent!', 'success');
    updateBadges();
}

function loadFriends() {
    const user = users.find(u => u.username === currentUser);
    const container = document.getElementById('friends-list');
    
    if (user.friends.length === 0) {
        container.innerHTML = '<p style="color: var(--gray);">No friends yet. Start connecting!</p>';
    } else {
        container.innerHTML = user.friends.map(friendName => {
            const friend = users.find(u => u.username === friendName);
            const avgRating = friend.rating_count > 0 ? 
                (friend.rating_sum / friend.rating_count).toFixed(1) : 'N/A';
            
            return `
                <div class="friend-card">
                    <div class="friend-avatar">${friendName[0].toUpperCase()}</div>
                    <div class="friend-name">${friendName}</div>
                    <div class="friend-rating">⭐ ${avgRating}</div>
                </div>
            `;
        }).join('');
    }
    
    // Load suggestions
    loadFriendSuggestions();
}

function loadFriendSuggestions() {
    const user = users.find(u => u.username === currentUser);
    const suggestions = [];
    const visited = new Set([currentUser]);
    
    // BFS for friend suggestions
    const queue = [...user.friends];
    visited.add(currentUser);
    
    while (queue.length > 0 && suggestions.length < 5) {
        const friendName = queue.shift();
        if (visited.has(friendName)) continue;
        visited.add(friendName);
        
        const friend = users.find(u => u.username === friendName);
        if (!friend) continue;
        
        if (!user.friends.includes(friendName) && friendName !== currentUser) {
            suggestions.push(friendName);
        }
        
        friend.friends.forEach(f => {
            if (!visited.has(f)) queue.push(f);
        });
    }
    
    const container = document.getElementById('suggestions-list');
    if (suggestions.length === 0) {
        container.innerHTML = '<p style="color: var(--gray);">No suggestions available.</p>';
    } else {
        container.innerHTML = suggestions.map(friendName => `
            <div class="friend-card">
                <div class="friend-avatar">${friendName[0].toUpperCase()}</div>
                <div class="friend-name">${friendName}</div>
                <button class="btn-action btn-request" onclick="quickAddFriend('${friendName}')" 
                        style="margin-top: 10px; width: 100%;">
                    + Add Friend
                </button>
            </div>
        `).join('');
    }
}

function quickAddFriend(username) {
    friendRequests.push({
        id: friendRequests.length + 1,
        from: currentUser,
        to: username,
        status: 'pending'
    });
    showToast('Friend request sent to ' + username, 'success');
    updateBadges();
}

function loadFriendRequests() {
    const container = document.getElementById('friend-requests-list');
    const incoming = friendRequests.filter(r => r.to === currentUser && r.status === 'pending');
    
    if (incoming.length === 0) {
        container.innerHTML = '<p style="color: var(--gray);">No pending friend requests.</p>';
        return;
    }
    
    container.innerHTML = incoming.map(req => `
        <div class="request-card">
            <div class="request-header">
                <div class="request-info">
                    <h4>Friend Request</h4>
                    <p>From: <strong>${req.from}</strong></p>
                </div>
                <div class="request-actions">
                    <button class="btn-action btn-accept" onclick="acceptFriendRequest(${req.id})">
                        ✓ Accept
                    </button>
                    <button class="btn-action btn-reject" onclick="rejectFriendRequest(${req.id})">
                        ✗ Reject
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function acceptFriendRequest(reqId) {
    const req = friendRequests.find(r => r.id === reqId);
    if (req) {
        req.status = 'accepted';
        
        const user1 = users.find(u => u.username === req.from);
        const user2 = users.find(u => u.username === req.to);
        
        if (user1 && user2) {
            if (!user1.friends.includes(user2.username)) user1.friends.push(user2.username);
            if (!user2.friends.includes(user1.username)) user2.friends.push(user1.username);
        }
        
        showToast('Friend request accepted!', 'success');
        loadFriendRequests();
        updateBadges();
    }
}

function rejectFriendRequest(reqId) {
    const req = friendRequests.find(r => r.id === reqId);
    if (req) {
        req.status = 'rejected';
        showToast('Friend request rejected', 'success');
        loadFriendRequests();
        updateBadges();
    }
}

// Rating System
function showRateModal(lenderName) {
    currentRatingLender = lenderName;
    selectedRating = 0;
    document.getElementById('rate-lender-name').textContent = 'Rate ' + lenderName;
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    document.getElementById('rate-modal').style.display = 'block';
}

function setRating(rating) {
    selectedRating = rating;
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

function submitRating() {
    if (selectedRating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }
    
    const lender = users.find(u => u.username === currentRatingLender);
    if (lender) {
        lender.rating_sum += selectedRating;
        lender.rating_count += 1;
        showToast('Rating submitted!', 'success');
        closeModal('rate-modal');
    }
}

// Leaderboard
function loadLeaderboard() {
    const sortedUsers = users
        .map(u => ({
            username: u.username,
            avgRating: u.rating_count > 0 ? u.rating_sum / u.rating_count : 0,
            reviewCount: u.rating_count
        }))
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 10);
    
    const container = document.getElementById('leaderboard-list');
    
    container.innerHTML = sortedUsers.map((user, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        
        return `
            <div class="leaderboard-item">
                <div class="rank ${rankClass}">#${index + 1}</div>
                <div class="leaderboard-info">
                    <h3>${user.username}</h3>
                    <div class="leaderboard-stats">
                        <span>⭐ ${user.avgRating.toFixed(2)} avg rating</span>
                        <span>📊 ${user.reviewCount} reviews</span>
                    </div>
                </div>
                <div class="rating-display">★ ${user.avgRating.toFixed(1)}</div>
            </div>
        `;
    }).join('');
}

// Utilities
function updateBadges() {
    // Update book requests badge
    const myRequests = bookRequests.filter(req => {
        const book = books.find(b => b.id === req.bookId);
        return book && book.owner === currentUser && req.requests.length > 0;
    });
    document.getElementById('requests-badge').textContent = myRequests.length;
    
    // Update friend requests badge
    const incoming = friendRequests.filter(r => r.to === currentUser && r.status === 'pending');
    document.getElementById('friend-requests-badge').textContent = incoming.length;
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}