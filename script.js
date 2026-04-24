document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form');
    const projectsContainer = document.getElementById('projects-container');
    const teamForm = document.getElementById('team-form');
    const teamContainer = document.getElementById('team-container');
    
    // --- Voice Lock Logic ---
    const lockScreen = document.getElementById('voice-lock-screen');
    const mainApp = document.getElementById('main-app');
    const micIcon = document.getElementById('mic-icon');
    const lockStatus = document.getElementById('lock-status');
    const manualPassword = document.getElementById('manual-password');

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
                }, 50); // Speed: 50ms per character
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
                        wrapper.classList.remove('speaking', 'happy'); // Remove happy too
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

    // Create Welcome Voice
    const speakWelcome = () => {
        const hour = new Date().getHours();
        let greeting = "Good Evening";
        if (hour >= 5 && hour < 12) greeting = "Good Morning";
        else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";

        // Speak Welcome first
        robotSpeak("Welcome Admin.");

        // Speak Greeting after a delay
        robotSpeak(greeting, 2000);
    };

    // --- Check session status disabled to force login on refresh ---
    /*
    if (sessionStorage.getItem('adminUnlocked') === 'true') {
        if (lockScreen) lockScreen.style.display = 'none';
        if (mainApp) {
            mainApp.style.filter = 'blur(0)';
            mainApp.style.pointerEvents = 'all';
            // Default to home tab
            setTimeout(() => switchTab('home'), 100);
        }
    }
    */

    // --- Particle Network Animation for Lock Screen ---
    const initLockParticles = () => {
        const canvas = document.getElementById('lock-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 80;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.update();
                p.draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(0, 229, 255, ${1 - dist / 150})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            if (lockScreen.style.display !== 'none') {
                requestAnimationFrame(animate);
            }
        };
        animate();
    };

    initLockParticles();

    const unlockSystem = () => {
        // sessionStorage.setItem('adminUnlocked', 'true'); // No longer persisting across refresh
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = loadingOverlay ? loadingOverlay.querySelector('.loading-text') : null;

        // Visual glitch effect on lock screen before transition
        lockScreen.classList.add('lock-screen-glitch');
        const cube = document.querySelector('.security-cube');
        if (cube) cube.style.animation = 'rotate-3d 0.5s linear infinite'; // Spin super fast

        setTimeout(() => {
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
                    if (loadingText) loadingText.innerText = "REVVING ENGINE...";
                }, 1200);

                setTimeout(() => {
                    loadingOverlay.classList.remove('revving');
                    loadingOverlay.classList.add('started');
                    if (loadingText) loadingText.innerText = "SYSTEM READY";
                }, 2500);
            }

            lockScreen.style.opacity = '0';
            lockScreen.style.transition = 'opacity 0.5s ease';

            setTimeout(() => {
                lockScreen.style.display = 'none';
                lockScreen.classList.remove('lock-screen-glitch');

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
                                mainApp.style.filter = 'blur(0)';
                                mainApp.style.pointerEvents = 'all';
                                // Switch to home view after unlock animation
                                switchTab('home');
                            }, 500);
                        }, 400);
                    } else {
                        mainApp.style.filter = 'blur(0)';
                        mainApp.style.pointerEvents = 'all';
                    }
                }, 3500);
            }, 500);
        }, 500);
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

    // Manual Password Fallback
    manualPassword.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            if (manualPassword.value === 'Admin1234') { // Updated password
                // Show Welcome Message
                lockStatus.textContent = "Welcome Admin";
                lockStatus.style.color = "var(--success-color)";
                lockStatus.style.fontSize = "1.5em";
                lockStatus.style.textShadow = "0 0 10px var(--success-color)";
                manualPassword.style.display = 'none'; // Hide input
                
                speakWelcome();

                // Unlock after delay
                setTimeout(unlockSystem, 1500);
            } else {
                manualPassword.style.borderColor = 'red';
                showToast('Wrong Password!', 'error');
                setTimeout(() => manualPassword.style.borderColor = 'var(--primary-color)', 1000);
            }
        }
    });

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
                // Limit pupil movement radius
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

    // Speech Recognition Setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        let isListening = false;
        
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
        };

        micIcon.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
                return;
            }
            try {
                recognition.start();
                micIcon.classList.add('listening');
                lockStatus.textContent = "Listening... Say 'Access Granted'";
                lockStatus.style.color = "#fff";
            } catch (e) {
                console.log("Speech recognition interaction error:", e);
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Voice Command:', transcript);

            if (transcript.includes('access granted') || transcript.includes('open') || transcript.includes('unlock')) {
                speakWelcome();
                lockStatus.textContent = "Access Granted. Welcome, Admin.";
                lockStatus.style.color = "var(--success-color)";
                micIcon.classList.remove('listening');
                micIcon.style.color = "var(--success-color)";
                micIcon.style.borderColor = "var(--success-color)";
                
                setTimeout(unlockSystem, 1000);
            } else {
                lockStatus.textContent = `Access Denied. Heard: "${transcript}"`;
                lockStatus.style.color = "var(--danger-color)";
                micIcon.classList.remove('listening');
                micIcon.style.color = "var(--danger-color)";
                micIcon.style.borderColor = "var(--danger-color)";
                
                setTimeout(() => {
                    lockStatus.textContent = "Click microphone and say 'Access Granted'";
                    lockStatus.style.color = "#a0a0a0";
                    micIcon.style.color = "var(--text-color)";
                    micIcon.style.borderColor = "var(--primary-color)";
                    micIcon.style.boxShadow = "0 0 20px rgba(0, 229, 255, 0.3)";
                }, 2000);
            }
        };

        recognition.onerror = (event) => {
            if (event.error === 'network') {
                 console.warn('Speech recognition network error (common with local/ngrok setups).');
                 lockStatus.textContent = "Network error. Voice requires HTTPS/Online.";
            } else {
                 console.error('Speech recognition error', event.error);
                 lockStatus.textContent = "Error. Try again or use password.";
            }
            micIcon.classList.remove('listening');
            micIcon.style.color = "var(--danger-color)";
            
            setTimeout(() => {
                lockStatus.textContent = "Click microphone and say 'Access Granted'";
                lockStatus.style.color = "#a0a0a0";
                micIcon.style.color = "var(--text-color)";
                micIcon.style.borderColor = "var(--primary-color)";
            }, 2000);
        };
        
        recognition.onend = () => {
            isListening = false;
            // Reset visual state if not unlocked
            if (lockScreen.style.display !== 'none') {
                // Keep the last status message for a bit if it was an error/denial
            }
        };

    } else {
        lockStatus.textContent = "Voice not supported in this browser. Use password.";
        micIcon.style.display = 'none';
    }

    // Load projects and team from API
    let projects = [];
    let teamMembers = [];
    let seenSubmittedProjectIds = new Set();
    let isFirstProjectsLoad = true;

    let connectionErrorCount = 0;
    const MAX_RETRIES_BEFORE_ALERT = 3;

    const handleFetchError = (e, context) => {
        connectionErrorCount++;
        const isNetworkError = e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('INTERNET_DISCONNECTED');
        const is404 = e.message.includes('404');

        if (isNetworkError || is404) {
            console.warn(`[${context}] Connection issue (${e.message}). Retrying...`);
            
            // Update UI to show offline status if persistent
            if (connectionErrorCount >= MAX_RETRIES_BEFORE_ALERT) {
                const lockStatus = document.getElementById('lock-status');
                if (lockStatus) {
                    lockStatus.textContent = "Connection Lost. Reconnecting...";
                    lockStatus.style.color = "var(--danger-color)";
                }
            }
        } else {
            console.error(`Error fetching ${context}:`, e);
        }
    };

    const handleFetchSuccess = () => {
        if (connectionErrorCount > 0) {
            connectionErrorCount = 0;
            const lockStatus = document.getElementById('lock-status');
            if (lockStatus && lockStatus.textContent.includes("Connection Lost")) {
                lockStatus.textContent = "Welcome Admin";
                lockStatus.style.color = "var(--success-color)";
            }
            console.log("Connection restored.");
        }
    };

    let lastSeenSubmissionTimestamp = null;
    let lastSeenMessageTimestamp = null;
    let lastPendingCount = 0;
    let isFirstPendingLoad = true;

    const updateStatusDot = () => {
        const dot = document.getElementById('status-dot');
        if (!dot) return;

        const hasNew = projects.some(p => p.submittedAt && (!lastSeenSubmissionTimestamp || new Date(p.submittedAt) > new Date(lastSeenSubmissionTimestamp)));
        dot.style.display = hasNew ? 'inline-block' : 'none';
    };

    const updateTalksDot = async () => {
        const dot = document.getElementById('talks-dot');
        if (!dot) return;

        try {
            const response = await fetch('/api/messages', { headers: { 'ngrok-skip-browser-warning': 'true' } });
            if (!response.ok) {
                if (response.status === 403 || response.status === 429) {
                    console.warn("API request blocked by ngrok (likely bandwidth limit reached).");
                }
                return;
            }
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('application/json')) {
                console.warn("Received non-JSON response for talks dot check.");
                return;
            }
            const messages = await response.json();
            if (!Array.isArray(messages) || messages.length === 0) {
                dot.style.display = 'none';
                return;
            }
            messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const newest = messages[0];
            const isNew = !lastSeenMessageTimestamp || new Date(newest.timestamp) > new Date(lastSeenMessageTimestamp);
            dot.style.display = isNew ? 'inline-block' : 'none';
        } catch (e) {
            // Silently ignore during connectivity issues to avoid console spam
        }
    };

    const updatePendingDot = async () => {
        const dot = document.getElementById('pending-dot');
        if (!dot) return;

        try {
            const response = await fetch('/api/admin/pending', { headers: { 'ngrok-skip-browser-warning': 'true' } });
            if (!response.ok) return;
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('application/json')) return;
            
            const pending = await response.json();
            const currentCount = Array.isArray(pending) ? pending.length : 0;

            if (currentCount > 0) {
                dot.style.display = 'inline-block';
                
                // Bot announcement logic
                if (isFirstPendingLoad) {
                    // On first load, mention the total count if any exist
                    if (currentCount === 1) {
                        robotSpeak("Admin, you have one pending registration to review.");
                    } else {
                        robotSpeak(`Admin, you have ${currentCount} pending registrations to review.`);
                    }
                    // Show information popup for pending registrations
                    showRegistrationPendingPopup(currentCount);
                } else if (currentCount > lastPendingCount) {
                    // On subsequent loads, only announce if new ones arrived
                    const diff = currentCount - lastPendingCount;
                    if (diff === 1) {
                        robotSpeak("Admin, a new team registration has arrived.");
                        showRegistrationPendingPopup(currentCount); // Show popup for new arrival
                    } else {
                        robotSpeak(`Admin, ${diff} new team registrations have arrived.`);
                        showRegistrationPendingPopup(currentCount); // Show popup for new arrivals
                    }
                }
            } else {
                dot.style.display = 'none';
            }

            lastPendingCount = currentCount;
            isFirstPendingLoad = false;
        } catch (e) {
            console.error("Error checking pending for dot:", e);
        }
    };

    // --- Submission Notification Logic ---
    window.showRegistrationPendingPopup = (count) => {
        // Remove existing popup if any
        const existing = document.getElementById('registration-pending-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'registration-pending-popup';
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(16, 5, 21, 0.95)';
        popup.style.border = '2px solid #ffea00'; // Yellow for pending
        popup.style.padding = '30px';
        popup.style.zIndex = '10000';
        popup.style.color = '#fff';
        popup.style.borderRadius = '15px';
        popup.style.boxShadow = '0 0 40px rgba(255, 234, 0, 0.5)';
        popup.style.textAlign = 'center';
        popup.style.minWidth = '350px';
        popup.style.backdropFilter = 'blur(10px)';
        
        popup.innerHTML = `
            <div style="font-size: 3.5em; color: #ffea00; margin-bottom: 20px;">
                <i class="fas fa-user-clock"></i>
            </div>
            <h2 style="color: #ffea00; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 3px; font-size: 1.5em;">Pending Registrations</h2>
            <p style="font-size: 1.2em; color: #fff; margin-bottom: 10px;"><strong>${count}</strong> registration${count > 1 ? 's' : ''} waiting for approval.</p>
            <p style="color: #aaa; margin-bottom: 20px;">Please review and approve new team members.</p>
            <div style="display: flex; gap: 10px;">
                <button onclick="this.closest('#registration-pending-popup').remove(); switchTab('pending');" class="btn-add" style="flex: 1; padding: 12px; font-size: 1.1em; background: #ffea00; color: #000; border: none; font-weight: bold; cursor: pointer; border-radius: 5px;">REVIEW NOW</button>
                <button onclick="this.closest('#registration-pending-popup').remove()" class="btn-add" style="flex: 1; padding: 12px; font-size: 1.1em; background: transparent; border: 1px solid #aaa; color: #aaa; font-weight: bold; cursor: pointer; border-radius: 5px;">LATER</button>
            </div>
        `;
        
        document.body.appendChild(popup);
    };

    window.showSubmissionPopup = (memberName) => {
        // Success Popup
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(16, 5, 21, 0.95)';
        popup.style.border = '2px solid var(--primary-color)';
        popup.style.padding = '30px';
        popup.style.zIndex = '10000';
        popup.style.color = '#fff';
        popup.style.borderRadius = '15px';
        popup.style.boxShadow = '0 0 40px rgba(0, 229, 255, 0.5)';
        popup.style.textAlign = 'center';
        popup.style.minWidth = '350px';
        popup.style.backdropFilter = 'blur(10px)';
        
        popup.innerHTML = `
            <div style="font-size: 3.5em; color: var(--primary-color); margin-bottom: 20px;">
                <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h2 style="color: var(--primary-color); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 3px; font-size: 1.5em;">New Submission</h2>
            <p style="font-size: 1.2em; color: #fff; margin-bottom: 10px;"><strong>${memberName}</strong></p>
            <p style="color: #aaa; margin-bottom: 20px;">Project submitted successfully!</p>
            <button onclick="this.parentElement.remove()" class="btn-add" style="width: 100%; padding: 12px; font-size: 1.1em; background: var(--primary-color); color: #000; border: none; font-weight: bold;">DISMISS</button>
        `;
        
        document.body.appendChild(popup);
        
        // Robot announcement
        robotSpeak(`Admin, ${memberName} has just submitted a project.`);
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects', { 
                cache: 'no-store',
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (!response.ok) {
                if (response.status === 403 || response.status === 429) {
                    throw new Error("ngrok bandwidth limit reached or access denied.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('application/json')) {
                throw new Error("Received HTML error page instead of project data.");
            }
            const text = await response.text();
            try {
                const newProjects = JSON.parse(text);
                
                // Check for new submissions
                newProjects.forEach(p => {
                    const isSubmitted = p.status === 'submitted' && !p.completed;
                    
                    if (isSubmitted) {
                        if (!isFirstProjectsLoad && !seenSubmittedProjectIds.has(p.id)) {
                            showSubmissionPopup(p.assignee);
                        }
                        seenSubmittedProjectIds.add(p.id);
                    } else {
                        // If it's no longer submitted (e.g. approved or deleted), 
                        // remove from seen list so it can trigger again if resubmitted
                        seenSubmittedProjectIds.delete(p.id);
                    }
                });

                isFirstProjectsLoad = false;
                projects = newProjects;
                handleFetchSuccess();
            } catch (e) {
                console.error("Failed to parse projects JSON:", text.substring(0, 100));
                throw e;
            }
            renderProjects();
            updateStats();
            updateStatusDot();
            // Also refresh status view if active
            if (document.getElementById('status-view').style.display === 'block') {
                renderStatus();
            }
        } catch (e) {
            handleFetchError(e, 'projects');
        }
    };

    const fetchTeam = async () => {
        try {
            const response = await fetch('/api/team', { 
                cache: 'no-store',
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (!response.ok) {
                if (response.status === 403 || response.status === 429) {
                    throw new Error("ngrok bandwidth limit reached or access denied.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('application/json')) {
                throw new Error("Received HTML error page instead of team data.");
            }
            const text = await response.text();
            try {
                teamMembers = JSON.parse(text);
                handleFetchSuccess();
            } catch (e) {
                console.error("Failed to parse team JSON:", text.substring(0, 100));
                throw e;
            }
            renderTeam();
        } catch (e) {
            handleFetchError(e, 'team');
        }
    };

    // Initial load
    fetchProjects();
    fetchTeam();
    updateTalksDot();
    updatePendingDot();

    // Poll for updates every 5 seconds (to sync multiple admins)
    setInterval(() => {
        // Only fetch if tab is visible and online to avoid ERR_NETWORK_IO_SUSPENDED
        if (document.visibilityState === 'visible' && navigator.onLine) {
            fetchProjects();
            fetchTeam();
            updateTalksDot();
            updatePendingDot();
        }
    }, 5000);

    // Render data on load (initial render might be empty until fetch completes)
    renderProjects();
    renderTeam();
    updateStats();

    // --- Tab Switching Logic ---
    const mainDropdownMenu = document.getElementById('main-dropdown-menu');

    window.toggleMenu = () => {
        if (mainDropdownMenu) mainDropdownMenu.classList.toggle('show');
    };

    window.showViewLoading = (event) => {
        if (event) {
            // If it's a direct link click (like Database), show loading and allow navigation
            const loadingOverlay = document.getElementById('loading-overlay');
            const loadingText = loadingOverlay ? loadingOverlay.querySelector('.loading-text') : null;
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
                loadingOverlay.style.opacity = '1';
                if (loadingText) loadingText.innerText = "LOADING DATA...";
            }
        }
    };

    window.switchTabWithLoading = (tabName) => {
        const loadingOverlay = document.getElementById('loading-overlay');
        const loadingText = loadingOverlay ? loadingOverlay.querySelector('.loading-text') : null;
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            loadingOverlay.style.opacity = '1';
            loadingOverlay.classList.remove('ignition', 'revving', 'started', 'impact', 'broken');
            if (loadingText) loadingText.innerText = "LOADING " + tabName.toUpperCase() + "...";
            
            setTimeout(() => {
                window.switchTab(tabName);
                
                setTimeout(() => {
                    loadingOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                    }, 500);
                }, 800);
            }, 500);
        } else {
            window.switchTab(tabName);
        }
    };

    window.switchTab = (tabName) => {
        // Close menu after selection
        if (mainDropdownMenu) mainDropdownMenu.classList.remove('show');

        // Remove active class from all menu items
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        // Add active class to the selected menu item
        const activeItem = document.querySelector(`.menu-item[onclick*="'${tabName}'"]`);
        if (activeItem) activeItem.classList.add('active');

        // Handle dashboard tabs active state
        document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
        const activeTab = document.querySelector(`.tab-btn[onclick*="'${tabName}'"]`);
        if (activeTab) activeTab.classList.add('active');

        // Hide all views
        const views = ['home-view', 'projects-view', 'status-view', 'team-view', 'talks-view', 'pending-view', 'submissions-view'];
        views.forEach(viewId => {
            const view = document.getElementById(viewId);
            if (view) view.style.display = 'none';
        });

        // Show the selected view
        const selectedView = document.getElementById(`${tabName}-view`);
        if (selectedView) selectedView.style.display = 'block';

        if (tabName === 'home') {
            updateStats();
        } else if (tabName === 'status') {
            renderStatus();
            const dot = document.getElementById('status-dot');
            if (dot) {
                dot.style.display = 'none';
                lastSeenSubmissionTimestamp = new Date().toISOString();
            }
        } else if (tabName === 'team') {
            renderTeam();
        } else if (tabName === 'talks') {
            loadAdminMessages();
            const dot = document.getElementById('talks-dot');
            if (dot) {
                dot.style.display = 'none';
                lastSeenMessageTimestamp = new Date().toISOString();
            }
        } else if (tabName === 'pending') {
            loadPendingMembers();
            const dot = document.getElementById('pending-dot');
            if (dot) dot.style.display = 'none';
        } else if (tabName === 'submissions') {
            renderSubmissions();
        }
    };

    // --- Submissions View Logic ---
    window.renderSubmissions = () => {
        const tableBody = document.getElementById('submissions-table-body');
        const searchTerm = document.getElementById('submission-search').value.toLowerCase();
        
        if (!tableBody) return;
        tableBody.innerHTML = '';

        // Filter for projects that have submissions (link or file)
        const submittedProjects = projects.filter(p => 
            (p.submissionLink || p.submissionFile) &&
            (p.assignee.toLowerCase().includes(searchTerm) || p.name.toLowerCase().includes(searchTerm))
        );

        // Sort by submission date (newest first)
        submittedProjects.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        if (submittedProjects.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #a0a0a0;">No submissions found.</td></tr>';
            return;
        }

        submittedProjects.forEach(project => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            tr.style.transition = 'background 0.2s';
            tr.onmouseover = () => tr.style.background = 'rgba(255,255,255,0.05)';
            tr.onmouseout = () => tr.style.background = 'transparent';

            let fileLinkHtml = '<div style="display: flex; gap: 10px; flex-wrap: wrap;">';
            
            if (project.submissionLink) {
                fileLinkHtml += `<a href="${project.submissionLink}" target="_blank" style="color: var(--primary-color); text-decoration: none; border: 1px solid var(--primary-color); padding: 5px 10px; border-radius: 4px; font-size: 0.9em;"><i class="fas fa-link"></i> Link</a>`;
            }
            if (project.submissionFile) {
                fileLinkHtml += `<a href="/uploads/${project.submissionFile}" target="_blank" style="color: #ff00ff; text-decoration: none; border: 1px solid #ff00ff; padding: 5px 10px; border-radius: 4px; font-size: 0.9em; box-shadow: 0 0 8px rgba(255, 0, 255, 0.4); text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);"><i class="fas fa-file-pdf"></i> PDF</a>`;
            }
            fileLinkHtml += '</div>';

            const submittedDate = project.submittedAt ? new Date(project.submittedAt).toLocaleString() : 'N/A';

            tr.innerHTML = `
                <td style="padding: 15px; font-weight: bold; color: var(--primary-color);">${project.assignee}</td>
                <td style="padding: 15px;">${project.name}</td>
                <td style="padding: 15px; color: #aaa;">${submittedDate}</td>
                <td style="padding: 15px;">${fileLinkHtml}</td>
            `;
            tableBody.appendChild(tr);
        });
    };

    // --- Admin Messages Logic ---
    window.loadAdminMessages = async () => {
        const container = document.getElementById('admin-messages-container');
        container.innerHTML = '<p style="text-align: center; color: #777;">Loading...</p>';
        
        try {
            const response = await fetch('/api/messages');
            const messages = await response.json();
            
            container.innerHTML = '';
            
            if (messages.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #777;">No messages yet.</p>';
                return;
            }

            // Sort by timestamp desc (newest first)
            messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            messages.forEach(msg => {
                const div = document.createElement('div');
                div.style.cssText = `
                    background: rgba(0, 229, 255, 0.05); 
                    border: 1px solid var(--border-color); 
                    border-radius: 8px; 
                    padding: 15px;
                    position: relative;
                `;
                
                // Don't show reply button if it's already an admin reply or broadcast
                const isReply = msg.sender === 'Admin';
                const isBroadcast = msg.recipient === 'all';
                
                let replyBtn = '';
                if (!isReply && !isBroadcast) {
                    replyBtn = `<button onclick="replyToMember('${msg.sender}')" style="margin-top: 10px; background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color); padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8em; transition: all 0.3s;">
                        <i class="fas fa-reply"></i> Reply
                     </button>`;
                }

                let senderDisplay = msg.sender;
                if (isBroadcast) senderDisplay += ' (Broadcast)';
                if (isReply && !isBroadcast) senderDisplay += ' <i class="fas fa-check-circle"></i>';

                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <strong style="color: ${isReply || isBroadcast ? 'var(--success-color)' : 'var(--primary-color)'};">${senderDisplay}</strong>
                        <small style="color: #888;">${msg.timestamp}</small>
                    </div>
                    <p style="color: #fff; margin: 0;">${msg.text}</p>
                    ${replyBtn}
                `;
                
                container.appendChild(div);
            });
        } catch (e) {
            console.error("Error loading messages:", e);
            container.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Error loading messages. Server offline?</p>';
        }
    };

    // --- Broadcast Logic ---
    window.sendBroadcast = async () => {
        const input = document.getElementById('broadcast-input');
        const text = input.value.trim();
        if (!text) return;

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: 'Admin',
                    text: text,
                    recipient: 'all',
                    type: 'broadcast'
                })
            });
            
            input.value = '';
            loadAdminMessages(); // Show it in the list too
            alert('Broadcast sent to everyone!');
        } catch (e) {
            console.error(e);
            alert("Failed to send broadcast.");
        }
    };

    // --- Reply Logic ---
    let currentReplyRecipient = '';

    window.replyToMember = (recipient) => {
        currentReplyRecipient = recipient;
        document.getElementById('reply-recipient-name').innerText = recipient;
        document.getElementById('reply-modal').style.display = 'flex';
        document.getElementById('reply-text').focus();
    };

    window.closeReplyModal = () => {
        document.getElementById('reply-modal').style.display = 'none';
        document.getElementById('reply-text').value = '';
        currentReplyRecipient = '';
    };

    window.sendReply = async () => {
        const text = document.getElementById('reply-text').value.trim();
        if (!text) return;

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    sender: 'Admin',
                    text: text,
                    recipient: currentReplyRecipient,
                    type: 'admin-reply'
                })
            });
            
            closeReplyModal();
            loadAdminMessages(); // Refresh to see the new message in the list
        } catch (e) {
            console.error("Error sending reply:", e);
            alert("Failed to send reply.");
        }
    };

    // --- Admin Pending Approvals Logic ---
    window.loadPendingMembers = async () => {
        const container = document.getElementById('pending-container');
        if (!container) return;

        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">Loading pending registrations...</p>';
        
        try {
            const response = await fetch('/api/admin/pending', {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            const pending = await response.json();
            
            container.innerHTML = '';
            
            if (!Array.isArray(pending) || pending.length === 0) {
                container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">No pending registrations.</p>';
                return;
            }

            pending.forEach(member => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.style.borderLeftColor = '#ffea00'; // Yellow border for pending

                card.innerHTML = `
                    <div>
                        <h3 style="color: #ffea00;"><i class="fas fa-user-clock"></i> ${member.name}</h3>
                        <div class="project-info">
                            <p><i class="fas fa-envelope"></i> ${member.email}</p>
                            <p><i class="fas fa-phone"></i> ${member.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="card-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                        <button class="btn-add" style="background-color: var(--success-color); color: #000; flex: 1;" 
                                onclick="approveMember(${member.id}, '${member.name}')">
                            <i class="fas fa-user-check"></i> Approve
                        </button>
                        <button class="btn-delete" style="flex: 1;" onclick="rejectMember(${member.id}, '${member.name}')">
                            <i class="fas fa-user-times"></i> Reject
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });

            // Update dot if we found pending members
            const dot = document.getElementById('pending-dot');
            if (dot) dot.style.display = pending.length > 0 ? 'inline-block' : 'none';

        } catch (e) {
            console.error("Error loading pending members:", e);
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger-color);">Error loading registrations.</p>';
        }
    };

    window.approveMember = async (id, name) => {
        if (!confirm(`Approve registration for ${name}?`)) return;

        try {
            const response = await fetch('/api/admin/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const result = await response.json();
            
            if (result.success) {
                showToast(`Member ${name} approved!`, 'success');
                loadPendingMembers();
                fetchTeam(); // Refresh team list
                
                // Robot speaks on approval
                robotSpeak(`${name} is now a member of the team.`);

                // Automatically notify member via Email/WhatsApp
                if (result.member) {
                    window.notifyMember(
                        result.member.name,
                        result.member.email,
                        result.member.phone,
                        result.member.id,
                        result.member.password
                    );
                }
            } else {
                alert("Failed to approve: " + result.message);
            }
        } catch (e) {
            console.error("Error approving member:", e);
            alert("Failed to approve member. Check connection.");
        }
    };

    window.rejectMember = async (id, name) => {
        if (!confirm(`REJECT and DELETE registration for ${name}? This cannot be undone.`)) return;

        try {
            const response = await fetch('/api/admin/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const result = await response.json();
            
            if (result.success) {
                showToast(`Registration for ${name} rejected.`, 'info');
                loadPendingMembers();
            } else {
                alert("Failed to reject: " + result.message);
            }
        } catch (e) {
            console.error("Error rejecting member:", e);
            alert("Failed to reject member. Check connection.");
        }
    };

    window.clearAllMessages = async () => {
        if (!confirm("Are you sure you want to DELETE ALL messages? This cannot be undone.")) return;

        try {
            await fetch('/api/messages', {
                method: 'DELETE',
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            loadAdminMessages(); // Refresh view
            alert("All messages deleted.");
        } catch (e) {
            console.error("Error clearing messages:", e);
            alert("Failed to delete messages.");
        }
    };

    // --- Status Logic ---
    window.requestRedo = (id) => {
        if (!confirm("Request team member to redo this project?")) return;
        
        const project = projects.find(p => p.id === id);
        if (project) {
            project.status = 'redo';
            saveProjects();
            renderStatus();
            
            // Create and show the popup
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.background = 'rgba(0, 0, 0, 0.9)';
            popup.style.border = '2px solid var(--danger-color)';
            popup.style.padding = '20px';
            popup.style.zIndex = '10000';
            popup.style.color = '#fff';
            popup.style.borderRadius = '10px';
            popup.style.boxShadow = '0 0 20px rgba(255, 42, 109, 0.5)';
            popup.style.textAlign = 'center';
            popup.innerHTML = `
                <h3 style="color: var(--danger-color); margin-bottom: 10px;">Action Taken</h3>
                <p style="font-size: 1.2em;">The Project is not proper</p>
                <button onclick="this.parentElement.remove()" style="margin-top: 15px; background: var(--primary-color); border: none; padding: 8px 15px; cursor: pointer; border-radius: 5px;">OK</button>
            `;
            document.body.appendChild(popup);
        }
    };

    window.renderStatus = () => {
        const tableBody = document.getElementById('status-table-body');
        const searchTerm = document.getElementById('status-search').value.toLowerCase();
        
        tableBody.innerHTML = '';

        // Filter and Sort Projects
        const filteredProjects = projects.filter(p => 
            p.assignee.toLowerCase().includes(searchTerm) || 
            p.name.toLowerCase().includes(searchTerm)
        );

        // Sort: Submitted/Review Needed -> Overdue -> In Progress -> Completed
        filteredProjects.sort((a, b) => {
            // Priority 1: Submitted but not completed
            const aSub = (a.status === 'submitted' && !a.completed) ? 1 : 0;
            const bSub = (b.status === 'submitted' && !b.completed) ? 1 : 0;
            if (aSub !== bSub) return bSub - aSub;

            // Priority 2: Not completed
            if (a.completed !== b.completed) return a.completed - b.completed; // false (0) < true (1)

            // Priority 3: Deadline
            return new Date(a.deadline) - new Date(b.deadline);
        });

        if (filteredProjects.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #a0a0a0;">No projects found matching your search.</td></tr>';
            return;
        }

        filteredProjects.forEach(project => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            tr.style.transition = 'background 0.2s';
            tr.onmouseover = () => tr.style.background = 'rgba(255,255,255,0.05)';
            tr.onmouseout = () => tr.style.background = 'transparent';

            // Status Badge Logic
            let statusHtml = '';
            if (project.completed) {
                statusHtml = '<span style="color: var(--success-color);"><i class="fas fa-check-circle"></i> Completed</span>';
            } else if (project.status === 'submitted') {
                statusHtml = '<span style="color: var(--primary-color); font-weight: bold;"><i class="fas fa-exclamation-circle"></i> Submitted</span>';
            } else {
                const today = new Date().toISOString().split('T')[0];
                if (project.deadline < today) {
                    statusHtml = '<span style="color: var(--danger-color);"><i class="fas fa-times-circle"></i> Overdue</span>';
                } else {
                    statusHtml = '<span style="color: #f1c40f;"><i class="fas fa-clock"></i> In Progress</span>';
                }
            }

            // Action Button Logic
            let actionHtml = '<div style="display: flex; gap: 5px; align-items: center;">';
            
            // Show submission artifacts (Link/PDF/Notes) if they exist
            if (project.submissionLink) {
                actionHtml += `<a href="${project.submissionLink}" target="_blank" title="Open Link" style="background: rgba(0, 229, 255, 0.2); color: var(--primary-color); text-decoration: none; padding: 5px 8px; border-radius: 4px; border: 1px solid var(--primary-color);"><i class="fas fa-link"></i></a>`;
            }
            if (project.submissionFile) {
                actionHtml += `<a href="/uploads/${project.submissionFile}" target="_blank" title="Open PDF" style="background: rgba(255, 0, 255, 0.2); color: #ff00ff; text-decoration: none; padding: 5px 8px; border-radius: 4px; border: 1px solid #ff00ff; box-shadow: 0 0 5px rgba(255, 0, 255, 0.3);"><i class="fas fa-file-pdf"></i> PDF</a>`;
            }
            if (project.submissionNotes) {
                actionHtml += `<span title="${project.submissionNotes}" style="cursor: help; color: #ddd; padding: 5px;"><i class="fas fa-sticky-note"></i></span>`;
            }

            if (project.status === 'submitted' && !project.completed) {
                actionHtml += `<button onclick="toggleComplete(${project.id}); renderStatus();" style="background: var(--success-color); border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; color: #000; font-weight: bold; margin-right: 5px;">Approve</button>`;
                actionHtml += `<button onclick="requestRedo(${project.id});" style="background: var(--danger-color); border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; color: #fff; font-weight: bold;">Redo</button>`;
            } else if (!project.completed) {
                actionHtml += `<button onclick="toggleComplete(${project.id}); renderStatus();" style="background: rgba(255,255,255,0.1); border: 1px solid #fff; padding: 5px 10px; border-radius: 4px; cursor: pointer; color: #fff;">Mark Done</button>`;
            } else {
                if (!project.submissionLink && !project.submissionFile) {
                    actionHtml += `<span style="color: #aaa;">-</span>`;
                }
            }
            actionHtml += '</div>';

            tr.innerHTML = `
                <td style="padding: 15px;">${project.assignee}</td>
                <td style="padding: 15px;">${project.name}</td>
                <td style="padding: 15px;">${formatDate(project.deadline)}</td>
                <td style="padding: 15px;">${statusHtml}</td>
                <td style="padding: 15px;">${actionHtml}</td>
            `;
            tableBody.appendChild(tr);
        });
    };

    // --- Project Logic ---
    // Handle Project Form Submission
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('project-name').value;
        const assignee = document.getElementById('assignee').value;
        const deadline = document.getElementById('deadline').value;
        const priority = document.getElementById('priority').value;
        const notifyMethod = document.getElementById('notify-method') ? document.getElementById('notify-method').value : 'None';
        const description = document.getElementById('description').value;

        const newProject = {
            id: Date.now(),
            name,
            assignee,
            deadline,
            priority,
            description,
            completed: false,
            createdAt: new Date().toISOString()
        };

        projects.push(newProject);
        saveProjects();

        if (notifyMethod !== 'None') {
            const member = teamMembers.find(m => m.name.trim().toLowerCase() === assignee.trim().toLowerCase());
            if (member) {
                const msg = `Hello ${assignee},\n\nClub Project: ${name}\n\ngot a project from the club completed it by time\n\nBest regards, \nGaming Club Admin`;
                if (notifyMethod === 'Email' && member.email) {
                    const subject = encodeURIComponent(`Club Project: ${name}`);
                    const body = encodeURIComponent(msg);
                    window.open(`mailto:${member.email}?subject=${subject}&body=${body}`, '_blank');
                } else if (notifyMethod === 'WhatsApp' && member.phone) {
                    const number = (member.phone || '').replace(/[^+\\d]/g, '').replace(/^\\+/, '');
                    const text = encodeURIComponent(msg);
                    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
                }
            }
        }
        projectForm.reset();
    });

    // --- Team Logic ---
    // Handle Team Form Submission
    teamForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('member-name').value;
        const email = document.getElementById('member-email').value;
        const phone = document.getElementById('member-phone').value;

        const newMember = {
            id: Date.now(),
            name,
            email,
            phone
        };

        teamMembers.push(newMember);
        saveTeam();
        teamForm.reset();

        // Calculate password (Firstname + 123)
        const firstNamePart = name.trim().split(/\s+/)[0];
        const password = firstNamePart.charAt(0).toUpperCase() + firstNamePart.slice(1).toLowerCase() + "123";

        // Notify with credentials
        notifyMember(name, email, phone, newMember.id, password);
    });

    async function saveProjects() {
        try {
            await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projects)
            });
            renderProjects();
            updateStats();
        } catch (e) {
            console.error("Error saving projects:", e);
            alert("Failed to save project. Check connection.");
        }
    }

    async function saveTeam() {
        try {
            await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamMembers)
            });
            renderTeam();
        } catch (e) {
            console.error("Error saving team:", e);
            alert("Failed to save team member. Check connection.");
        }
    }

    async function renderTeam() {
        teamContainer.innerHTML = '';

        // Render Approved Members
        if (teamMembers.length === 0) {
            teamContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #a0a0a0;">No team members added yet.</p>';
        } else {
            teamMembers.forEach(member => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.style.borderLeftColor = '#2ecc71'; // Green border for team

                const onlineStatus = member.online ? 
                    '<span style="color: #2ecc71; font-size: 0.8em; margin-left: 10px; display: inline-flex; align-items: center; gap: 5px;"><i class="fas fa-circle" style="font-size: 0.8em;"></i> Online</span>' : 
                    '<span style="color: #95a5a6; font-size: 0.8em; margin-left: 10px; display: inline-flex; align-items: center; gap: 5px;"><i class="far fa-circle" style="font-size: 0.8em;"></i> Offline</span>';

                card.innerHTML = `
                    <div>
                        <h3 style="display: flex; align-items: center; flex-wrap: wrap;">
                            ${member.name} 
                            ${onlineStatus}
                        </h3>
                        <div class="project-info">
                            <p><i class="fas fa-envelope"></i> ${member.email}</p>
                            <p><i class="fas fa-phone"></i> ${member.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-add" style="background-color: #9b59b6; padding: 8px 12px; font-size: 0.9em;" 
                                onclick="notifyMember('${member.name}', '${member.email}', '${member.phone || ''}')">
                            <i class="fas fa-robot"></i> Notify
                        </button>
                        <button class="btn-delete" onclick="deleteMember(${member.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                teamContainer.appendChild(card);
            });
        }
    }

    window.deleteMember = (id) => {
        if(confirm('Remove this member from the team?')) {
            teamMembers = teamMembers.filter(m => m.id !== id);
            saveTeam();
        }
    };

    // --- Bot Logic ---
    window.notifyMember = (name, email, phone, id = null, password = null) => {
        const overlay = document.getElementById('bot-overlay');
        const logs = document.getElementById('bot-logs');
        
        overlay.classList.remove('hidden');
        logs.innerHTML = ''; // Clear previous logs

        const steps = [
            `Initializing MailBot v2.0...`,
            `Detected communication channels: Email, WhatsApp`,
            `Connecting to SMTP server... Success.`,
            `Connecting to WhatsApp Gateway... Success.`,
            `Preparing payload for ${name}...`,
            `Target Email: ${email}`,
            `Target Phone: ${phone || 'Not provided (Skipping WhatsApp)'}`,
            `Sending data packets...`,
            `Verifying delivery protocols...`,
            `<span class="bot-success">Notifications dispatched successfully!</span>`
        ];

        let i = 0;
        function addLog() {
            if (i < steps.length) {
                const p = document.createElement('div');
                p.className = 'bot-log-item';
                p.innerHTML = `> ${steps[i]}`;
                logs.appendChild(p);
                logs.scrollTop = logs.scrollHeight; // Auto scroll
                i++;
                setTimeout(addLog, 600 + Math.random() * 400); // Random delay
            } else {
                // Done
                const p = document.createElement('div');
                p.className = 'bot-log-item bot-typing';
                p.innerHTML = `> Waiting for next command`;
                logs.appendChild(p);
                
                // Auto close after 2 seconds and trigger actions
                setTimeout(() => {
                    closeBot();
                    
                    const subject = encodeURIComponent("Welcome to the Gaming devlopment Club!");
                    const body = encodeURIComponent(`Hello ${name}, 
  
 You are now a member of the Gaming Club! 
  
 Your Login Credentials: https://compositional-sedimentary-in.ngrok-free.dev/team.html 
 ID:${id} 
 Password: ${password} 
  
 We are excited to have you on the team. 
  
 Best regards, 
 Gaming Devlopment Club Admin`);

                    // 1. Open Email
                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

                    // 2. Open WhatsApp (if phone exists)
                    if (phone) {
                        // clean phone number
                        const cleanPhone = phone.replace(/[^\d]/g, '');
                        const waMessage = `Hello ${name}, You are now a member of the Gaming Club! Your Login ID: ${id}, Password: ${password}. Welcome to the Gaming devlopment Club!`;
                        const waText = encodeURIComponent(waMessage);
                        
                        // Use window.open for WhatsApp to try and open in new tab
                        // Note: Browsers might block the second popup.
                        setTimeout(() => {
                             window.open(`https://wa.me/${cleanPhone}?text=${waText}`, '_blank');
                        }, 1000);
                    }
                    
                }, 2000);
            }
        }

        addLog();
    };

    window.closeBot = () => {
        document.getElementById('bot-overlay').classList.add('hidden');
    };

    // Update Dashboard Stats
    function updateStats() {
        const total = projects.length;
        const completed = projects.filter(p => p.completed).length;
        const inProgress = total - completed;
        const highPriority = projects.filter(p => !p.completed && p.priority === 'High').length;
        
        // Count online members from the fetched team list
        const onlineMembers = teamMembers.filter(m => m.online);
        const onlineMembersCount = onlineMembers.length;

        const statTotal = document.getElementById('stat-total');
        const statProgress = document.getElementById('stat-progress');
        const statCompleted = document.getElementById('stat-completed');
        const statPriority = document.getElementById('stat-priority');
        const activeMembersEl = document.getElementById('stat-active-members');
        const onlineListContainer = document.getElementById('online-members-list-container');
        const onlineNamesEl = document.getElementById('online-members-names');

        if (statTotal) statTotal.innerText = total;
        if (statProgress) statProgress.innerText = inProgress;
        if (statCompleted) statCompleted.innerText = completed;
        if (statPriority) statPriority.innerText = highPriority;
        if (activeMembersEl) activeMembersEl.innerText = onlineMembersCount;

        // Update the names list
        if (onlineListContainer && onlineNamesEl) {
            if (onlineMembersCount > 0) {
                onlineListContainer.style.display = 'block';
                onlineNamesEl.innerHTML = onlineMembers.map(m => 
                    `<span style="background: rgba(0, 229, 255, 0.1); padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(0, 229, 255, 0.3);"><i class="fas fa-circle" style="font-size: 0.6em; margin-right: 5px; color: #05ffa1;"></i>${m.name}</span>`
                ).join('');
            } else {
                onlineListContainer.style.display = 'none';
                onlineNamesEl.innerHTML = '';
            }
        }
    }

    // Render the list of projects
    function renderProjects() {
        projectsContainer.innerHTML = '';

        if (projects.length === 0) {
            projectsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #a0a0a0;">No projects assigned yet.</p>';
            return;
        }

        // Sort projects: Submitted & Uncompleted first, then by deadline
        projects.sort((a, b) => {
            if (a.completed === b.completed) {
                // Prioritize submitted projects
                if (a.status === 'submitted' && b.status !== 'submitted') return -1;
                if (a.status !== 'submitted' && b.status === 'submitted') return 1;
                return new Date(a.deadline) - new Date(b.deadline);
            }
            return a.completed ? 1 : -1;
        });

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = `project-card ${project.completed ? 'status-completed' : ''}`;
            
            const deadlineStatus = getDeadlineStatus(project.deadline);
            const priorityClass = `priority-${project.priority.toLowerCase()}`;

            // Submission Info Block
            let submissionInfo = '';
            // Show if submitted OR (completed and has submission data)
            const hasSubmission = project.status === 'submitted' || (project.completed && (project.submissionLink || project.submissionFile));

            if (hasSubmission) {
                submissionInfo = `
                    <div style="margin-top: 15px; padding: 12px; background: ${project.completed ? 'rgba(46, 204, 113, 0.1)' : 'rgba(0, 229, 255, 0.1)'}; border-radius: 8px; border: 1px dashed ${project.completed ? 'var(--success-color)' : 'var(--primary-color)'};">
                        <p style="color: ${project.completed ? 'var(--success-color)' : 'var(--primary-color)'}; font-weight: bold; margin-bottom: 5px;">
                            ${project.completed ? '<i class="fas fa-check-circle"></i> Completed Submission' : '<i class="fas fa-exclamation-circle"></i> Submission Received'}
                        </p>
                        ${project.submissionLink ? `<div style="margin-bottom: 5px;"><a href="${project.submissionLink}" target="_blank" style="color: #fff; text-decoration: none; border-bottom: 1px dotted #fff;"><i class="fas fa-link"></i> View Project Link</a></div>` : ''}
                        ${project.submissionFile ? `<div style="margin-bottom: 5px;"><a href="/uploads/${project.submissionFile}" target="_blank" style="color: #fff; text-decoration: none; border-bottom: 1px dotted #fff;"><i class="fas fa-file-pdf"></i> View PDF</a></div>` : ''}
                        ${project.submissionNotes ? `<p style="font-style: italic; color: #ddd; font-size: 0.9em; margin-bottom: 5px;">"${project.submissionNotes}"</p>` : ''}
                        ${project.submittedAt ? `<p style="font-size: 0.8em; color: #aaa;"><i class="far fa-clock"></i> ${new Date(project.submittedAt).toLocaleString()}</p>` : ''}
                    </div>
                `;
            }

            card.innerHTML = `
                <div>
                    <h3>
                        ${project.name} 
                        ${project.completed ? '<i class="fas fa-check-circle" style="color: var(--success-color);"></i>' : ''}
                    </h3>
                    <div class="project-info">
                        <p><i class="fas fa-user"></i> <strong>Assigned to:</strong> ${project.assignee}</p>
                        <p>
                            <i class="fas fa-flag"></i> <strong>Priority:</strong> 
                            <span class="priority-tag ${priorityClass}">${project.priority}</span>
                        </p>
                        <p><i class="fas fa-calendar-alt"></i> <strong>Deadline:</strong> 
                           <span class="deadline-tag ${deadlineStatus.class}">${formatDate(project.deadline)}</span>
                        </p>
                    </div>
                    <div class="project-desc">
                        ${project.description || 'No description provided.'}
                    </div>
                    ${submissionInfo}
                </div>
                <div class="card-actions">
                    <button class="btn-complete" onclick="toggleComplete(${project.id})" style="${project.status === 'submitted' && !project.completed ? 'background-color: var(--success-color); color: #000;' : ''}">
                        <i class="fas ${project.completed ? 'fa-undo' : 'fa-check'}"></i> 
                        ${project.completed ? 'Undo' : (project.status === 'submitted' ? 'Approve & Complete' : 'Complete')}
                    </button>
                    <button class="btn-delete" onclick="deleteProject(${project.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            projectsContainer.appendChild(card);
        });
    }

    // Expose functions to global scope
    window.deleteProject = (id) => {
        if(confirm('Are you sure you want to delete this project?')) {
            projects = projects.filter(p => p.id !== id);
            saveProjects();
        }
    };

    window.toggleComplete = (id) => {
        const project = projects.find(p => p.id === id);
        if (project) {
            project.completed = !project.completed;
            saveProjects();
        }
    };

    // Helper to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Helper to determine deadline urgency
    function getDeadlineStatus(deadlineDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(deadlineDate);
        
        // Calculate difference in days
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays < 0) {
            return { class: 'deadline-overdue', label: 'Overdue' };
        } else if (diffDays <= 3) {
            return { class: 'deadline-soon', label: 'Soon' };
        } else {
            return { class: 'deadline-normal', label: 'Normal' };
        }
    }

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
});
