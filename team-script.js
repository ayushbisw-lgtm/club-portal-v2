document.addEventListener('DOMContentLoaded', () => {
    const memberSelect = document.getElementById('member-select');
    const projectsContainer = document.getElementById('my-projects-container');
    const statsSection = document.getElementById('member-stats');
    const projectsSection = document.getElementById('my-projects-section');
    const modal = document.getElementById('submission-modal');
    const submissionForm = document.getElementById('submission-form');
    const loginScreen = document.getElementById('login-screen');
    const mainDashboard = document.getElementById('main-dashboard');
    const currentMemberName = document.getElementById('current-member-name');
    const passwordResetHint = document.getElementById('password-reset-hint');

    // --- Robot Speech Logic ---
    let typingInterval;
    const robotSpeak = (text, delay = 0) => {
        setTimeout(() => {
            const bubble = document.getElementById('robot-speech-bubble');
            const wrapper = document.getElementById('robot-wrapper');
            
            // Cancel any previous speaking/typing
            window.speechSynthesis.cancel();
            if (typingInterval) clearInterval(typingInterval);

            if (bubble && wrapper) {
                bubble.textContent = '';
                bubble.classList.add('typing');
                bubble.style.opacity = '1';
                bubble.style.transform = 'translateY(0)';
                wrapper.classList.add('speaking');

                // Typing Animation
                let i = 0;
                typingInterval = setInterval(() => {
                    if (i < text.length) {
                        bubble.textContent += text.charAt(i);
                        i++;
                    } else {
                        clearInterval(typingInterval);
                        bubble.classList.remove('typing');
                    }
                }, 50);
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;

            utterance.onend = () => {
                if (bubble && wrapper) {
                    setTimeout(() => {
                        bubble.style.opacity = '0';
                        bubble.style.transform = 'translateY(10px)';
                        wrapper.classList.remove('speaking', 'happy');
                    }, 2000); 
                }
            };

            // Set happy reaction if the text is positive
            const positiveWords = ['welcome', 'hello', 'good', 'success', 'ready', 'granted'];
            if (positiveWords.some(word => text.toLowerCase().includes(word))) {
                wrapper.classList.add('happy');
            }

            window.speechSynthesis.speak(utterance);
        }, delay);
    };

    // Load data
    let projects = [];
    let teamMembers = [];
    let loginAttempts = 0;

    const loadData = async () => {
        try {
            const [projectsRes, teamRes] = await Promise.all([
                fetch('/api/projects', { 
                    cache: 'no-store',
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                }),
                fetch('/api/team', { 
                    cache: 'no-store',
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                })
            ]);

            // Debug response if not OK or content-type is wrong
            if (!projectsRes.ok) {
                console.error(`Projects API Error: ${projectsRes.status}`);
                throw new Error(`Projects API returned ${projectsRes.status}`);
            }
            if (!teamRes.ok) {
                console.error(`Team API Error: ${teamRes.status}`);
                throw new Error(`Team API returned ${teamRes.status}`);
            }

            try {
                const text = await projectsRes.text();
                projects = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse Projects JSON.");
                throw e;
            }

            try {
                const text = await teamRes.text();
                teamMembers = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse Team JSON.");
                throw e;
            }
            
            // Populate Member Dropdown (only if empty)
            if (memberSelect.options.length <= 1) { // Assuming first is placeholder
                memberSelect.innerHTML = '<option value="" disabled selected>Select your name</option>';
                teamMembers.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id; // Use ID for secure login
                    option.textContent = member.name;
                    memberSelect.appendChild(option);
                });
            }
            
            // If logged in, refresh view
            const currentName = currentMemberName.innerText;
            if (mainDashboard.style.display !== 'none' && currentName) {
                loadMyProjects(currentName);
            }

            // Update Online Count
            const onlineCount = teamMembers.filter(m => m.online).length;
            const onlineStat = document.getElementById('stat-online');
            if (onlineStat) {
                onlineStat.innerText = onlineCount;
            }
        } catch (e) {
            console.error("Error loading data:", e);
        }
    };

    // Initial load
    loadData();

    // Registration UI Helpers
    window.showRegistration = () => {
        document.getElementById('register-screen').style.display = 'flex';
        robotSpeak("Join the team by providing your details.");
    };

    window.hideRegistration = () => {
        document.getElementById('register-screen').style.display = 'none';
        document.getElementById('registration-form').reset();
    };

    window.handleRegistration = async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone })
            });

            const result = await response.json();
            if (result.success) {
                const msg = result.message || "Registration successful! Please wait for admin approval.";
                showToast(msg, "success");
                hideRegistration();
                
                // Refresh team data (new member won't appear until approved)
                await loadData();
                
                robotSpeak(`Registration received, ${name.split(' ')[0]}! Please wait for admin approval.`);
            } else {
                showToast(result.message || "Registration failed", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showToast("Server error during registration", "error");
        }
    };

    // Poll for updates (e.g. new projects assigned)
    setInterval(loadData, 5000);

    // --- Chat Logic ---
    window.toggleChat = () => {
        const chatWindow = document.getElementById('chat-window');
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
        if (chatWindow.style.display === 'block') {
            loadChatMessages();
            // Scroll to bottom
            const container = document.getElementById('chat-messages');
            container.scrollTop = container.scrollHeight;
        }
    };

    window.sendChatMessage = async () => {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        const sender = document.getElementById('current-member-name').innerText || "Anonymous";

        if (!text) return;

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    sender: sender,
                    text: text,
                    type: 'team-to-admin'
                })
            });
            
            // Append locally for immediate feedback
            appendMessage({ sender: 'Me', text: text }, true);
            input.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
            alert("Failed to send message. Server might be down.");
        }
    };

    function appendMessage(msg, isMe = false) {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.style.cssText = `
            background: ${isMe ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255,255,255,0.1)'}; 
            padding: 8px; 
            border-radius: 5px; 
            align-self: ${isMe ? 'flex-end' : 'flex-start'}; 
            max-width: 80%;
            border: 1px solid ${isMe ? 'var(--primary-color)' : 'transparent'};
        `;
        
        div.innerHTML = `
            <small style="color: ${isMe ? 'var(--primary-color)' : '#aaa'}; display: block; margin-bottom: 2px;">${isMe ? 'Me' : msg.sender}</small>
            <span style="font-size: 0.9em; color: #fff;">${msg.text}</span>
        `;
        
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    async function loadChatMessages() {
        try {
            const response = await fetch('/api/messages');
            const messages = await response.json();
            const container = document.getElementById('chat-messages');
            const currentUser = document.getElementById('current-member-name').innerText;
            
            // Clear except system message
            container.innerHTML = `
                <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 5px; align-self: flex-start; max-width: 80%;">
                    <small style="color: var(--primary-color); display: block; margin-bottom: 2px;">System</small>
                    <span style="font-size: 0.9em; color: #ddd;">Send a message to the admin directly.</span>
                </div>
            `;

            messages.forEach(msg => {
                const isMe = msg.sender === currentUser;
                const isAdminReply = msg.sender === 'Admin' && msg.recipient === currentUser;
                const isBroadcast = msg.recipient === 'all';

                if (isMe) {
                     appendMessage({ sender: 'Me', text: msg.text }, true);
                } else if (isAdminReply) {
                     appendMessage({ sender: 'Admin', text: msg.text }, false);
                } else if (isBroadcast) {
                     appendMessage({ sender: 'Admin (Broadcast)', text: msg.text }, false);
                }
            });
        } catch (e) {
            console.error("Error loading messages", e);
        }
    }

    // Welcome Voice for Team Member
    const speakWelcome = (name) => {
        const hour = new Date().getHours();
        let greeting = "Good Evening";
        if (hour >= 5 && hour < 12) greeting = "Good Morning";
        else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";

        robotSpeak(`Hi ${name}. ${greeting}`);
    };

    // Heartbeat Logic
    let heartbeatInterval;
    const sendHeartbeat = async (memberId) => {
        if (!memberId) return;
        try {
            await fetch('/api/heartbeat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ memberId: memberId })
            });
        } catch (e) {
            console.error("Heartbeat failed", e);
        }
    };

    // Toast Notification Function
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%) translateY(-100%)';
        toast.style.backgroundColor = type === 'error' ? 'var(--danger-color)' : 'var(--success-color)';
        toast.style.color = '#fff';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '10000';
        toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        toast.style.transition = 'transform 0.3s ease-in-out';
        toast.style.fontWeight = 'bold';
        
        document.body.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 10);

        // Slide out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    };

    window.enterPortal = async () => {
        const selectedMemberId = memberSelect.value;
        const passwordInput = document.getElementById('team-password');
        const password = passwordInput ? passwordInput.value : '';

        console.log("Login Attempt (JS Check):", { selectedMemberId, passwordLength: password.length });

        if (!selectedMemberId) {
            showToast("Please select your name to continue.", "error");
            return;
        }

        if (!password) {
            showToast("Please enter your password.", "error");
            return;
        }

        // --- NEW JS PASSWORD CHECK ---
        const member = teamMembers.find(m => String(m.id) === String(selectedMemberId));
        
        if (member) {
            if (member.password === password) {
                // Login Success
                loginAttempts = 0;
                if (passwordResetHint) passwordResetHint.style.display = 'none';
                const memberName = member.name;
                const loadingOverlay = document.getElementById('loading-overlay');
                const loadingText = loadingOverlay ? loadingOverlay.querySelector('.loading-text') : null;
                
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'flex';
                    loadingOverlay.style.opacity = '1';
                    loadingOverlay.classList.remove('ignition', 'revving', 'started', 'impact', 'broken');
                    
                    setTimeout(() => {
                        loadingOverlay.classList.add('ignition');
                        if (loadingText) loadingText.innerText = "IGNITION...";
                    }, 100);

                    setTimeout(() => {
                        loadingOverlay.classList.remove('ignition');
                        loadingOverlay.classList.add('revving');
                        if (loadingText) loadingText.innerText = "ACCELERATING...";
                    }, 1200);

                    setTimeout(() => {
                        loadingOverlay.classList.remove('revving');
                        loadingOverlay.classList.add('started');
                        if (loadingText) loadingText.innerText = "WELCOME " + memberName.toUpperCase();
                    }, 2500);
                }

                speakWelcome(memberName);

                if (passwordInput) passwordInput.value = '';

                loginScreen.style.opacity = '0';
                
                // Start heartbeat immediately after successful login
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                sendHeartbeat(selectedMemberId);
                heartbeatInterval = setInterval(() => sendHeartbeat(selectedMemberId), 15000);

                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    
                    setTimeout(() => {
                        if (loadingOverlay) {
                            loadingOverlay.classList.add('impact');
                            if (loadingText) loadingText.innerText = "ACCESS IMPACT";

                            setTimeout(() => {
                                loadingOverlay.classList.add('broken');
                                loadingOverlay.style.transition = 'opacity 0.5s ease';
                                loadingOverlay.style.opacity = '0';

                                setTimeout(() => {
                                    loadingOverlay.style.display = 'none';
                                    loadingOverlay.classList.remove('ignition', 'revving', 'started', 'impact', 'broken');
                                    mainDashboard.style.display = 'block';
                                    currentMemberName.innerText = memberName;
                                    loadMyProjects(memberName);
                                }, 500);
                            }, 400);
                        } else {
                            mainDashboard.style.display = 'block';
                            currentMemberName.innerText = memberName;
                            loadMyProjects(memberName);
                        }
                    }, 3500);
                }, 500);
            } else {
                // Wrong Password
                loginAttempts += 1;
                if (loginAttempts > 2 && passwordResetHint) {
                    passwordResetHint.style.display = 'block';
                }
                showToast("Wrong Password", "error");
            }
        } else {
            showToast("Member not found or not approved.", "error");
        }
    };

    window.logout = () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        mainDashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
        loginScreen.style.opacity = '1';
        memberSelect.value = "";
    };

    window.requestPasswordReset = async () => {
        const selectedMemberId = memberSelect.value;
        if (!selectedMemberId) {
            showToast("Select your name before resetting password.", "error");
            return;
        }

        const member = teamMembers.find(m => String(m.id) === String(selectedMemberId));
        if (!member) {
            showToast("Could not find your member record.", "error");
            return;
        }

        const text = `Password reset requested by ${member.name}.`;

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    sender: member.name,
                    text: text,
                    type: 'team-to-admin'
                })
            });

            showToast("Password reset request sent to admin.", "success");
            robotSpeak(`Okay ${member.name}. I have asked admin to reset your password.`, 200);
        } catch (error) {
            console.error("Password reset request failed:", error);
            showToast("Could not send reset request. Try messaging the admin.", "error");
        }
    };

    // Global function to load projects
    window.loadMyProjects = (selectedMember) => {
        // Fallback to current displayed name if not provided
        if (!selectedMember) {
            selectedMember = currentMemberName.innerText;
        }
        if (!selectedMember) return;

        // projects variable is already updated by loadData()
        
        // Filter projects
        const myProjects = projects.filter(p => 
            p.assignee && p.assignee.trim().toLowerCase() === selectedMember.trim().toLowerCase()
        );

        // Update Stats
        const completed = myProjects.filter(p => p.completed).length;
        const pending = myProjects.length - completed;
        document.getElementById('stat-pending').innerText = pending;
        document.getElementById('stat-completed').innerText = completed;

        // Render Projects
        projectsContainer.innerHTML = '';
        if (myProjects.length === 0) {
            projectsContainer.innerHTML = '<p style="color: #ccc; text-align: center;">No projects assigned to you yet.</p>';
            return;
        }

        // Sort: Pending first, then by deadline
        myProjects.sort((a, b) => {
            if (a.completed === b.completed) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            return a.completed ? 1 : -1;
        });

        myProjects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            
            // Determine status badge
            let statusBadge = '';
            if (project.completed) {
                statusBadge = '<span class="status-badge completed">Completed</span>';
            } else if (project.status === 'submitted') {
                statusBadge = '<span class="status-badge" style="background: var(--primary-color); color: #000;">Submitted</span>';
            } else if (project.status === 'redo') {
                statusBadge = '<span class="status-badge" style="background: var(--danger-color); color: #fff;">Redo Requested</span>';
            } else {
                const today = new Date().toISOString().split('T')[0];
                if (project.deadline < today) {
                    statusBadge = '<span class="status-badge overdue">Overdue</span>';
                } else {
                    statusBadge = '<span class="status-badge in-progress">In Progress</span>';
                }
            }

            // Button Logic
            let actionBtn = '';
            if (!project.completed && project.status !== 'submitted') {
                const btnText = project.status === 'redo' ? 'Resubmit Project' : 'Submit Project';
                const btnStyle = project.status === 'redo' ? 'background: var(--danger-color); border-color: var(--danger-color);' : '';
                actionBtn = `<button onclick="openSubmissionModal(${project.id})" class="submit-btn" style="margin-top: 10px; width: 100%; ${btnStyle}">${btnText}</button>`;
            } else if (project.status === 'submitted') {
                actionBtn = `<p style="margin-top: 10px; color: var(--primary-color); font-size: 0.9em;"><i class="fas fa-check"></i> Submitted for Review</p>`;
            }

            card.innerHTML = `
                <div class="card-header">
                    <h3>${project.name}</h3>
                    ${statusBadge}
                </div>
                <div class="card-body">
                    <p><strong>Deadline:</strong> ${project.deadline}</p>
                    <p><strong>Priority:</strong> <span class="priority-tag ${project.priority.toLowerCase()}">${project.priority}</span></p>
                    <p style="margin-top: 10px; color: #ccc;">${project.description}</p>
                    ${actionBtn}
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    };

    // Modal Logic
    window.openSubmissionModal = (projectId) => {
        document.getElementById('submit-project-id').value = projectId;
        modal.style.display = 'flex';
    };

    window.closeModal = () => {
        modal.style.display = 'none';
        submissionForm.reset();
    };

    // Handle Submission
    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const projectId = document.getElementById('submit-project-id').value;
        const link = document.getElementById('submit-link').value;
        const notes = document.getElementById('submit-notes').value;
        const fileInput = document.getElementById('submit-file');
        
        if (!link && (!fileInput.files || fileInput.files.length === 0)) {
            alert("Please provide either a link or a PDF file.");
            return;
        }

        const formData = new FormData();
        formData.append('projectId', projectId);
        formData.append('link', link);
        formData.append('notes', notes);
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            const response = await fetch('/api/submit-project', {
                method: 'POST',
                headers: { 'ngrok-skip-browser-warning': 'true' },
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                closeModal();
                loadMyProjects(document.getElementById('current-member-name').innerText); // Refresh view
                
                // Success Popup
                const popup = document.createElement('div');
                popup.style.position = 'fixed';
                popup.style.top = '50%';
                popup.style.left = '50%';
                popup.style.transform = 'translate(-50%, -50%)';
                popup.style.background = 'rgba(0, 0, 0, 0.9)';
                popup.style.border = '2px solid var(--success-color)';
                popup.style.padding = '30px';
                popup.style.zIndex = '10000';
                popup.style.color = '#fff';
                popup.style.borderRadius = '15px';
                popup.style.boxShadow = '0 0 30px rgba(5, 255, 161, 0.4)';
                popup.style.textAlign = 'center';
                popup.style.minWidth = '300px';
                popup.innerHTML = `
                    <div style="font-size: 3em; color: var(--success-color); margin-bottom: 15px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2 style="color: var(--success-color); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Submission Success</h2>
                    <p style="font-size: 1.1em; color: #ccc;">Your project has been successfully submitted for review.</p>
                    <button onclick="this.parentElement.remove()" class="submit-btn" style="margin-top: 20px; width: 100%;">GREAT!</button>
                `;
                document.body.appendChild(popup);
                
                robotSpeak("your project is submitted.");
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (err) {
            console.error("Error submitting project:", err);
            alert("Failed to submit project: " + err.message);
        }
    });

    // Close modal if clicking outside
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };

    // Clock Logic
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();

        const clock = document.getElementById('digital-clock');
        if (clock) {
            clock.innerHTML = `${day}/${month}/${year}<br>${hours}:${minutes}:${seconds}`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock(); // Initial call

    // --- Robot Companion Logic ---
    const robotWrapper = document.getElementById('robot-wrapper');
    
    if (robotWrapper) {
        // ... existing mousemove logic ...
        document.addEventListener('mousemove', (e) => {
            // 1. Parallax movement for the robot wrapper (subtle follow)
            // "Move with cursor"
            const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.02;
            
            robotWrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;

            // 2. Eyes following cursor
            const eyes = document.querySelectorAll('.eye');
            eyes.forEach(eye => {
                const pupil = eye.querySelector('.pupil');
                if (!pupil) return;

                const eyeRect = eye.getBoundingClientRect();
                const eyeCenterX = eyeRect.left + eyeRect.width / 2;
                const eyeCenterY = eyeRect.top + eyeRect.height / 2;

                const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
                const maxDist = 3; 
                const dist = Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY);
                const clampDist = Math.min(maxDist, dist / 15);

                const pupilX = Math.cos(angle) * clampDist;
                const pupilY = Math.sin(angle) * clampDist;

                pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
            });
        });

        // 3. User Typing Trigger
        let typingTimeout;
        const handleUserTyping = () => {
            robotWrapper.classList.add('user-typing');
            
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                robotWrapper.classList.remove('user-typing');
            }, 500); // Stop after 500ms of inactivity
        };

        // Attach to all inputs and textareas
        document.body.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                handleUserTyping();
            }
        });
    }
});
