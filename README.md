# Book Exchange Platform - Frontend

A modern, responsive web frontend for the Book Exchange application built with vanilla HTML, CSS, and JavaScript.

## Features

### 📚 Book Management
- Add books with title and author information
- View your personal book collection
- Browse community books
- Request books from other users
- Manage incoming book requests
- Undo last book addition

### 👥 Friend System
- Send friend requests to other users
- Accept/reject incoming friend requests
- View your friends list with ratings
- BFS-based friend suggestions (friends-of-friends)
- Quick-add suggested friends

### ⭐ Rating System
- Rate lenders after borrowing books
- View average ratings for all users
- Track number of reviews per user

### 🏆 Leaderboard
- Top lenders ranked by average rating
- Display review counts
- Medal system (Gold, Silver, Bronze)

### 🎨 UI Features
- Responsive design (desktop and mobile)
- Clean, modern interface
- Real-time notifications (toast messages)
- Modal dialogs for actions
- Badge notifications for pending items
- Smooth animations and transitions

## File Structure

```
book_exchange_frontend/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling
├── app.js              # Application logic
└── README.md          # Documentation
```

## Getting Started

### Option 1: Open Directly in Browser
1. Navigate to the folder
2. Double-click `index.html`
3. The application will open in your default browser

### Option 2: Use Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

## Default Login Credentials

For testing, use these pre-loaded accounts:

- **Username:** alice | **Password:** pass123
- **Username:** bob | **Password:** pass123
- **Username:** charlie | **Password:** pass123

## Current Implementation

This frontend uses **mock data** stored in JavaScript to simulate the backend. In production, you would need to:

### Connecting to C Backend

To connect this frontend to your C backend, you'll need to:

1. **Create a REST API wrapper** for your C application:
   - Use a lightweight web framework (e.g., `mongoose`, `libmicrohttpd`)
   - Or create a Node.js/Python middleware that interfaces with your C program

2. **API Endpoints to implement:**
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/books
POST   /api/books
DELETE /api/books/:id/undo
GET    /api/books/community
POST   /api/books/:id/request
GET    /api/requests
POST   /api/requests/:id/accept
POST   /api/requests/:id/reject
GET    /api/friends
POST   /api/friends/request
GET    /api/friends/requests
POST   /api/friends/requests/:id/accept
POST   /api/friends/requests/:id/reject
GET    /api/friends/suggestions
POST   /api/ratings
GET    /api/leaderboard
```

3. **Modify app.js** to use `fetch()` API calls instead of mock data:

```javascript
// Example: Login function with API
async function login() {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value
        })
    });
    
    if (response.ok) {
        const data = await response.json();
        currentUser = data.username;
        // ... rest of login logic
    }
}
```

## Features Showcase

### Authentication
- Clean login/register interface
- Tab-based switching
- Password confirmation
- User session management

### Dashboard
- Sidebar navigation with icons
- Badge notifications
- Multi-view layout
- Responsive grid system

### Book Operations
- Grid-based book display
- Search/filter functionality
- Request queue system
- Transfer ownership

### Social Features
- Friend network visualization
- BFS algorithm for suggestions
- Request management system
- Rating system with stars

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #6366f1;
    --secondary: #8b5cf6;
    --success: #10b981;
    --danger: #ef4444;
    /* ... */
}
```

### Layout
- Grid columns: `.books-grid`, `.friends-grid`
- Sidebar width: `#app-section` grid-template-columns
- Responsive breakpoints: `@media` queries

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Advanced search with filters
- [ ] Book cover images
- [ ] User profiles with avatars
- [ ] Chat system between friends
- [ ] Book review system
- [ ] Reading history
- [ ] Recommendation engine
- [ ] Mobile app (React Native/Flutter)

## Technical Details

### Data Structures
- **Users:** Array of user objects with friends list
- **Books:** Linked list simulation with arrays
- **Requests:** Queue-based system
- **Friend Suggestions:** BFS graph traversal

### State Management
All state is managed in JavaScript variables:
- `currentUser`: Active session
- `users`: User database
- `books`: Book catalog
- `friendRequests`: Pending friend connections
- `bookRequests`: Pending book requests
- `undoStack`: Stack for undo operations

## License

This frontend is provided as a demonstration for the Book Exchange C application.

## Support

For issues or questions about connecting to the C backend, refer to the main C application documentation.

---

**Note:** This is a frontend-only implementation with mock data. To use with your C backend, implement the API layer as described above.