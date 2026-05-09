// ==================== AXIOS CONFIGURATION ====================

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            // Server responded with error
            const message = error.response.data?.message || 'Something went wrong';
            console.error('API Error:', message);
            
            // Handle unauthorized (401) - token expired
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateUI();
                showLogin();
                alert('Session expired. Please login again.');
            }
            return Promise.reject({ message, status: error.response.status });
        } else if (error.request) {
            // Request was made but no response
            console.error('Network Error:', error);
            return Promise.reject({ message: 'Network error. Check if server is running.' });
        } else {
            // Something else happened
            return Promise.reject({ message: error.message });
        }
    }
);

// ==================== STORAGE HELPERS ====================

function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// ==================== UI FUNCTIONS ====================

function updateUI() {
    const navLinks = document.getElementById('navLinks');
    const authButtons = document.getElementById('authButtons');
    const userName = document.getElementById('userName');
    
    if (isLoggedIn()) {
        navLinks.style.display = 'flex';
        authButtons.style.display = 'none';
        if (userName) {
            const user = getUser();
            userName.textContent = user?.name || 'User';
        }
        showDashboard();
    } else {
        navLinks.style.display = 'none';
        authButtons.style.display = 'flex';
        showLogin();
    }
}

function showLogin() {
    hideAllPages();
    document.getElementById('loginPage').classList.add('active');
}

function showSignup() {
    hideAllPages();
    document.getElementById('signupPage').classList.add('active');
}

async function showDashboard() {
    if (!isLoggedIn()) return showLogin();
    hideAllPages();
    document.getElementById('dashboardPage').classList.add('active');
    await loadDashboard();
}

function showCreateCapsule() {
    if (!isLoggedIn()) return showLogin();
    hideAllPages();
    document.getElementById('createPage').classList.add('active');
}

async function showMyVault() {
    if (!isLoggedIn()) return showLogin();
    hideAllPages();
    document.getElementById('vaultPage').classList.add('active');
    await loadCapsules();
}

async function showProfile() {
    if (!isLoggedIn()) return showLogin();
    hideAllPages();
    document.getElementById('profilePage').classList.add('active');
    await loadProfile();
}

function hideAllPages() {
    const pages = ['loginPage', 'signupPage', 'dashboardPage', 'createPage', 'vaultPage', 'profilePage'];
    pages.forEach(page => {
        const el = document.getElementById(page);
        if (el) el.classList.remove('active');
    });
}

// ==================== AUTH API CALLS ====================

// Signup
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing up...';
    
    try {
        const response = await api.post('/auth/signup', { name, email, password });
        
        if (response.success) {
            setAuth(response.data.token, response.data);
            alert('✅ Signup successful! Welcome!');
            updateUI();
        } else {
            alert(response.message || 'Signup failed');
        }
    } catch (error) {
        alert(error.message || 'Signup failed. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
});
// ==================== UPDATE/DELETE CAPSULES ====================

// 1. Edit Capsule
async function editCapsule(capsuleId) {
    try {
        const response = await api.get(`/capsules/${capsuleId}`);
        
        // Check if response is successful
        if (!response.success) {
            alert(response.message || 'Failed to load capsule');
            return;
        }
        
        const capsule = response.data;
        
        // Check if capsule is unlocked
        if (capsule.isUnlocked) {
            alert('❌ Cannot edit an unlocked capsule! The time has passed.');
            return;
        }
        
        // Populate edit form
        document.getElementById('editCapsuleId').value = capsule._id;
        document.getElementById('editTitle').value = capsule.title || '';
        document.getElementById('editMessage').value = capsule.message || '';
        document.getElementById('editUnlockDate').value = capsule.unlockDate ? capsule.unlockDate.split('T')[0] : '';
        document.getElementById('editMood').value = capsule.mood || 'happy';
        document.getElementById('editTags').value = capsule.tags ? capsule.tags.join(', ') : '';
        document.getElementById('editImageUrl').value = capsule.imageUrl || '';
        
        // Show edit modal
        document.getElementById('editModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Edit error:', error);
        alert('Failed to load capsule: ' + (error.response?.data?.message || error.message));
    }
}


// ==================== DELETE CAPSULE ====================
async function deleteCapsule(capsuleId) {
    const confirmed = confirm('⚠️ Move this capsule to trash? You can restore within 30 days.');
    if (!confirmed) return;
    
    try {
        const response = await api.delete(`/capsules/${capsuleId}`);
        if (response.success) {
            alert('🗑️ Capsule moved to trash!');
            loadCapsules();
            loadDashboard();
        }
    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
}

// ==================== UPDATE CAPSULE ====================
async function updateCapsule() {
    console.log("🔄 Update function called");
    
    const capsuleId = document.getElementById('editCapsuleId')?.value;
    const title = document.getElementById('editTitle')?.value;
    const message = document.getElementById('editMessage')?.value;
    const unlockDate = document.getElementById('editUnlockDate')?.value;
    const mood = document.getElementById('editMood')?.value;
    const tags = document.getElementById('editTags')?.value;
    const imageUrl = document.getElementById('editImageUrl')?.value;
    
    if (!capsuleId) {
        alert('No capsule selected');
        return;
    }
    
    const body = { title, message, unlockDate, mood };
    if (tags && tags.trim()) body.tags = tags.split(',').map(t => t.trim());
    if (imageUrl && imageUrl.trim()) body.image = imageUrl;
    
    try {
        const response = await api.put(`/capsules/${capsuleId}`, body);
        
        if (response.success) {
            alert('✅ Capsule updated successfully!');
            closeEditModal();
            loadCapsules();
            loadDashboard();
        } else {
            alert(response.message || 'Update failed');
        }
    } catch (error) {
        console.error('Update error:', error);
        alert('Update failed: ' + (error.response?.data?.message || error.message));
    }
}

// ==================== CLOSE MODAL ====================
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// ==================== LOGIN ====================
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.success) {
            setAuth(response.data.token, response.data);
            alert('✅ Login successful!');
            updateUI();
        } else {
            alert(response.message || 'Login failed');
        }
    } catch (error) {
        alert(error.message || 'Invalid email or password');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
});


// Logout
async function logout() {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearAuth();
        updateUI();
        alert('Logged out successfully');
    }
}

// ==================== DASHBOARD API ====================

async function loadDashboard() {
    if (!isLoggedIn()) return;
    
    try {
        const response = await api.get('/capsules/stats/dashboard');
        
        if (response.success) {
            document.getElementById('totalCapsules').textContent = response.data.totalCapsules || 0;
            document.getElementById('lockedCapsules').textContent = response.data.lockedCapsules || 0;
            document.getElementById('unlockedCapsules').textContent = response.data.unlockedCapsules || 0;
            document.getElementById('weeklyStreak').textContent = response.data.streak?.weekly || 0;
            
            const nextCapsule = response.data.nextCapsule;
            const nextCapsuleInfo = document.getElementById('nextCapsuleInfo');
            
            if (nextCapsule && nextCapsule.title && nextCapsule.title !== 'No locked capsules! All are unlocked.') {
                const unlockDate = new Date(nextCapsule.unlockDate).toLocaleDateString();
                nextCapsuleInfo.innerHTML = `
                    <strong>"${nextCapsule.title}"</strong><br>
                    📅 Unlocks on: ${unlockDate}<br>
                    ${nextCapsule.mood ? getMoodEmoji(nextCapsule.mood) : ''}
                `;
            } else {
                nextCapsuleInfo.innerHTML = '🎉 No locked capsules! Everything is unlocked!';
            }
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        document.getElementById('nextCapsuleInfo').textContent = 'Failed to load dashboard';
    }
}

// ==================== CAPSULE API CALLS ====================

// Create Capsule
document.getElementById('createCapsuleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('capsuleTitle').value;
    const message = document.getElementById('capsuleMessage').value;
    const unlockDate = document.getElementById('capsuleUnlockDate').value;
    const mood = document.getElementById('capsuleMood').value;
    const tags = document.getElementById('capsuleTags').value;
    const imageUrl = document.getElementById('capsuleImageUrl').value;
    const isPublic = document.getElementById('capsuleIsPublic').checked;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    
    try {
        const body = { title, message, unlockDate, mood, isPublic };
        if (tags) body.tags = tags.split(',').map(t => t.trim());
        if (imageUrl) body.image = imageUrl;
        
        const response = await api.post('/capsules', body);
        
        if (response.success) {
            alert('✨ Time capsule created successfully! 🎉');
            document.getElementById('createCapsuleForm').reset();
            showMyVault();
        } else {
            alert(response.message || 'Creation failed');
        }
    } catch (error) {
        alert(error.message || 'Failed to create capsule');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Capsule 🎉';
    }
});

// Load Capsules with Search & Filter
async function loadCapsules() {
    if (!isLoggedIn()) return;
    
    const search = document.getElementById('searchInput')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    let params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    
    const container = document.getElementById('capsulesList');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:40px;">Loading...</div>';
    
    try {
        const response = await api.get('/capsules', { params });
        
        if (response.success && response.data.length > 0) {
container.innerHTML = response.data.map(capsule => `
    <div class="capsule-card">
        ${capsule.imageUrl ? `<img src="${capsule.imageUrl}" alt="${capsule.title}">` : ''}
        <div class="capsule-mood">${getMoodEmoji(capsule.mood)}</div>
        <h3>${escapeHtml(capsule.title)}</h3>
        <p>${capsule.message ? escapeHtml(capsule.message.substring(0, 100)) : ''}</p>
        <div class="capsule-date">📅 ${capsule.status === 'locked' ? 'Unlocks' : 'Unlocked'}: ${new Date(capsule.unlockDate).toLocaleDateString()}</div>
        ${capsule.tags ? `<div class="tags">${capsule.tags.map(t => `#${escapeHtml(t)}`).join(' ')}</div>` : ''}
        <span class="badge ${capsule.status}">${capsule.status === 'locked' ? '🔒 Locked' : '🔓 Unlocked'}</span>
        <div class="capsule-actions">
       <button class="btn-edit" onclick="editCapsule('${capsule._id}')">✏️ Edit</button>      
      <button class="btn-delete" onclick="deleteCapsule('${capsule._id}')">🗑️ Delete</button>
        </div>
    </div>
`).join('');
} else {
            container.innerHTML = '<div style="text-align:center; padding:40px;">📦 No capsules found. Create your first time capsule!</div>';
        }
    } catch (error) {
        console.error('Load capsules error:', error);
        container.innerHTML = '<div style="text-align:center; padding:40px; color:red;">❌ Failed to load capsules. Make sure server is running.</div>';
    }
}

        

// ==================== PROFILE API ====================

async function loadProfile() {
    if (!isLoggedIn()) return;
    
    try {
        const response = await api.get('/auth/me');
        
        if (response.success) {
            document.getElementById('profileName').value = response.data.name || '';
            document.getElementById('profileEmail').value = response.data.email || '';
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const password = document.getElementById('profilePassword').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    try {
        const body = { name, email };
        if (password) body.password = password;
        
        const response = await api.put('/auth/profile', body);
        
        if (response.success) {
            alert('✅ Profile updated successfully!');
            document.getElementById('profilePassword').value = '';
            // Update stored user info
            const user = getUser();
            if (user) {
                user.name = name;
                user.email = email;
                localStorage.setItem('user', JSON.stringify(user));
            }
        } else {
            alert(response.message || 'Update failed');
        }
    } catch (error) {
        alert(error.message || 'Failed to update profile');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Profile';
    }
});

// ==================== HELPER FUNCTIONS ====================

function getMoodEmoji(mood) {
    const moods = {
        happy: '😊', excited: '🎉', motivated: '💪', 
        grateful: '🙏', peaceful: '😌', sad: '😢',
        confused: '🤔', romantic: '💕', angry: '😤', hopeful: '🌟'
    };
    return moods[mood] || '😊';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== EVENT LISTENERS ====================

document.getElementById('searchInput')?.addEventListener('input', () => loadCapsules());
document.getElementById('statusFilter')?.addEventListener('change', () => loadCapsules());

document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editCapsuleForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await updateCapsule();
        });
    }
});
// ==================== INITIALIZE ====================

updateUI();