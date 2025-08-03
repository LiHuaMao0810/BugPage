// PDF.js 配置
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ============ 存储管理器 ============
class StorageManager {
    static keys = {
        FOCUS_TARGET_DURATION: 'focusTargetDuration', // 专注目标时长
        REMINDER_INTERVAL: 'reminderInterval', // 角色提醒间隔
        MOVING_CHARACTER_AVATAR: 'movingCharacterAvatar', // 移动角色头像
        COMPANION_AVATAR: 'companionAvatar', // 陪伴吉祥物头像
        USER_SETTINGS: 'userSettings',
        FIRST_VISIT: 'firstVisit'
    };

    static get(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch {
            return localStorage.getItem(key);
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (error) {
            console.error('Storage error:', error);
        }
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static isFirstVisit() {
        return !this.get(this.keys.FIRST_VISIT);
    }

    static markVisited() {
        this.set(this.keys.FIRST_VISIT, true);
    }
}

// ============ 模态窗口管理器 ============
class ModalManager {
    static create(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                ${content}
            </div>
        `;

        if (options.closable !== false) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(modal);
                }
            });
        }

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        return modal;
    }

    static close(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    static createFocusTargetModal() {
        const savedTarget = StorageManager.get(StorageManager.keys.FOCUS_TARGET_DURATION) || 1800; // 默认30分钟
        
        const content = `
            <div class="focus-duration-modal">
                <h2>🎯 设置专注目标</h2>
                <p>您这次想要专注多长时间？达到目标后我们会为您庆祝！</p>
                
                <div class="duration-options">
                    <div class="duration-grid">
                        <button class="duration-btn ${savedTarget === 60 ? 'active' : ''}" data-duration="60">
                            <span class="duration-time">1分钟</span>
                            <span class="duration-desc">测试模式</span>
                        </button>
                        <button class="duration-btn ${savedTarget === 300 ? 'active' : ''}" data-duration="300">
                            <span class="duration-time">5分钟</span>
                            <span class="duration-desc">快速专注</span>
                        </button>
                        <button class="duration-btn ${savedTarget === 900 ? 'active' : ''}" data-duration="900">
                            <span class="duration-time">15分钟</span>
                            <span class="duration-desc">短时专注</span>
                        </button>
                        <button class="duration-btn ${savedTarget === 1800 ? 'active' : ''}" data-duration="1800">
                            <span class="duration-time">30分钟</span>
                            <span class="duration-desc">标准目标</span>
                        </button>
                        <button class="duration-btn ${savedTarget === 2700 ? 'active' : ''}" data-duration="2700">
                            <span class="duration-time">45分钟</span>
                            <span class="duration-desc">深度专注</span>
                        </button>
                        <button class="duration-btn ${savedTarget === 3600 ? 'active' : ''}" data-duration="3600">
                            <span class="duration-time">60分钟</span>
                            <span class="duration-desc">专注挑战</span>
                        </button>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button id="confirmTarget" class="btn btn-primary">开始专注之旅</button>
                </div>
            </div>
        `;

        return this.create(content, { closable: false });
    }
}

// ============ 烟花动画管理器 ============
class FireworksManager {
    static show(duration = 3000) {
        const fireworksContainer = document.createElement('div');
        fireworksContainer.className = 'fireworks-container';
        fireworksContainer.innerHTML = `
            <div class="firework firework-1"></div>
            <div class="firework firework-2"></div>
            <div class="firework firework-3"></div>
            <div class="congratulations">
                <h2>🎉 恭喜完成专注！</h2>
                <p>您的专注力正在不断提升！</p>
            </div>
        `;

        document.body.appendChild(fireworksContainer);
        
        // 播放烟花音效（如果有的话）
        this.playSound();

        setTimeout(() => {
            fireworksContainer.classList.add('show');
        }, 100);

        setTimeout(() => {
            fireworksContainer.classList.remove('show');
            setTimeout(() => {
                if (fireworksContainer.parentNode) {
                    fireworksContainer.parentNode.removeChild(fireworksContainer);
                }
            }, 500);
        }, duration);
    }

    static playSound() {
        // 创建音效（使用Web Audio API生成简单的庆祝声音）
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // 忽略音频错误
        }
    }
}

// ============ 陪伴吉祥物 ============
class CompanionMascot {
    constructor() {
        this.container = null;
        this.avatarKey = StorageManager.keys.COMPANION_AVATAR;
        this.createMascot();
        this.loadSavedAvatar();
    }

    createMascot() {
        this.container = document.createElement('div');
        this.container.className = 'companion-mascot';
        this.container.innerHTML = `
            <div class="mascot-avatar" id="companionAvatar">
                🐾
            </div>
            <div class="mascot-controls">
                <input type="file" id="companionAvatarInput" accept="image/*" style="display: none;">
                <button id="uploadCompanionBtn" class="btn-mascot">📷</button>
                <button id="removeCompanionBtn" class="btn-mascot btn-danger" style="display: none;">🗑️</button>
            </div>
        `;

        // 添加到页面左下角
        document.body.appendChild(this.container);

        // 绑定事件
        this.bindEvents();
    }

    bindEvents() {
        const uploadBtn = document.getElementById('uploadCompanionBtn');
        const removeBtn = document.getElementById('removeCompanionBtn');
        const fileInput = document.getElementById('companionAvatarInput');

        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        removeBtn.addEventListener('click', () => {
            this.removeAvatar();
        });
    }

    handleImageUpload(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.compressAndSaveImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    compressAndSaveImage(imageData) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const maxSize = 80;
            let { width, height } = img;

            if (width > height) {
                if (width > maxSize) {
                    height = height * (maxSize / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = width * (maxSize / height);
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const compressedData = canvas.toDataURL('image/jpeg', 0.8);
            
            StorageManager.set(this.avatarKey, compressedData);
            this.updateDisplay();
            this.showControls();
        };
        img.src = imageData;
    }

    loadSavedAvatar() {
        const savedAvatar = StorageManager.get(this.avatarKey);
        if (savedAvatar) {
            this.updateDisplay();
            this.showControls();
        }
    }

    updateDisplay() {
        const avatar = document.getElementById('companionAvatar');
        const savedAvatar = StorageManager.get(this.avatarKey);

        if (savedAvatar) {
            avatar.innerHTML = '';
            const img = document.createElement('img');
            img.src = savedAvatar;
            img.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
            `;
            avatar.appendChild(img);
        } else {
            avatar.textContent = '🐾';
        }
    }

    showControls() {
        const removeBtn = document.getElementById('removeCompanionBtn');
        const savedAvatar = StorageManager.get(this.avatarKey);
        removeBtn.style.display = savedAvatar ? 'block' : 'none';
    }

    removeAvatar() {
        if (confirm('确定要删除陪伴吉祥物的头像吗？')) {
            StorageManager.remove(this.avatarKey);
            this.updateDisplay();
            this.showControls();
        }
    }
}

// ============ 头像管理器 ============
class AvatarManager {
    constructor() {
        this.storageKey = StorageManager.keys.MOVING_CHARACTER_AVATAR;
        this.initFileUpload();
        this.loadSavedAvatar();
    }

    initFileUpload() {
        // 绑定自定义角色按钮事件
        const customizeBtn = document.getElementById('customizeCharacterBtn');
        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => {
                this.showCustomizeModal();
            });
        }
    }

    showCustomizeModal() {
        const savedAvatar = this.getCustomAvatar();
        
        const content = `
            <div class="customize-character-modal">
                <h2>🎨 自定义角色头像</h2>
                <p>上传您喜欢的图片作为移动角色的头像</p>
                
                <div class="avatar-upload-zone">
                    <input type="file" id="modalAvatarInput" accept="image/*" style="display: none;">
                    
                    <div class="avatar-display">
                        <div class="current-avatar" id="modalAvatarPreview">
                            ${savedAvatar ? 
                                `<img src="${savedAvatar}" alt="当前头像">` : 
                                '<div class="placeholder">🖼️</div>'
                            }
                        </div>
                        <div class="avatar-info">
                            <p>当前头像</p>
                            <small>建议尺寸: 100x100px，最大2MB</small>
                        </div>
                    </div>
                    
                    <div class="upload-actions">
                        <button id="modalUploadBtn" class="btn btn-primary">📷 选择图片</button>
                        ${savedAvatar ? '<button id="modalRemoveBtn" class="btn btn-danger">🗑️ 移除头像</button>' : ''}
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button id="modalCloseBtn" class="btn btn-secondary">完成</button>
                </div>
            </div>
        `;

        const modal = ModalManager.create(content);
        
        // 绑定事件
        modal.querySelector('#modalUploadBtn').addEventListener('click', () => {
            modal.querySelector('#modalAvatarInput').click();
        });

        modal.querySelector('#modalAvatarInput').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0], modal);
        });

        const removeBtn = modal.querySelector('#modalRemoveBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeAvatar();
                ModalManager.close(modal);
            });
        }

        modal.querySelector('#modalCloseBtn').addEventListener('click', () => {
            ModalManager.close(modal);
        });
    }

    handleImageUpload(file, modal = null) {
        if (!file) return;

        // 验证文件
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.compressAndSaveImage(e.target.result, modal);
        };
        reader.readAsDataURL(file);
    }

    compressAndSaveImage(imageData, modal = null) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 设置目标尺寸
            const maxSize = 120;
            let { width, height } = img;

            if (width > height) {
                if (width > maxSize) {
                    height = height * (maxSize / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = width * (maxSize / height);
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const compressedData = canvas.toDataURL('image/jpeg', 0.8);
            
            // 保存到本地存储
            StorageManager.set(this.storageKey, compressedData);
            
            // 更新界面
            this.addCustomOption();
            
            // 如果在模态窗口中，更新预览
            if (modal) {
                this.updateModalPreview(modal, compressedData);
                this.updateModalActions(modal, true);
            }
            
            // 更新角色显示
            if (window.app) {
                window.app.updateCharacterDisplay();
            }
            
            alert('头像上传成功！');
        };
        img.src = imageData;
    }

    loadSavedAvatar() {
        const savedAvatar = StorageManager.get(this.storageKey);
        if (savedAvatar) {
            this.addCustomOption();
        }
    }

    updateModalPreview(modal, imageData) {
        const preview = modal.querySelector('#modalAvatarPreview');
        if (preview) {
            preview.innerHTML = `<img src="${imageData}" alt="当前头像">`;
        }
    }

    updateModalActions(modal, hasAvatar) {
        const actions = modal.querySelector('.upload-actions');
        if (hasAvatar) {
            // 如果没有删除按钮，添加一个
            if (!actions.querySelector('#modalRemoveBtn')) {
                const removeBtn = document.createElement('button');
                removeBtn.id = 'modalRemoveBtn';
                removeBtn.className = 'btn btn-danger';
                removeBtn.textContent = '🗑️ 移除头像';
                removeBtn.addEventListener('click', () => {
                    this.removeAvatar();
                    ModalManager.close(modal);
                });
                actions.appendChild(removeBtn);
            }
        }
    }

    addCustomOption() {
        const characterSelect = document.getElementById('character');
        if (!document.querySelector('option[value="custom"]')) {
            const customOption = document.createElement('option');
            customOption.value = 'custom';
            customOption.textContent = '🖼️ 自定义头像';
            characterSelect.appendChild(customOption);
        }
    }

    removeAvatar() {
        if (confirm('确定要删除自定义头像吗？')) {
            StorageManager.remove(this.storageKey);
            
            // 移除选项
            const customOption = document.querySelector('option[value="custom"]');
            if (customOption) {
                customOption.remove();
            }
            
            // 如果当前选中的是自定义头像，切换到默认
            if (window.app && window.app.characterType === 'custom') {
                window.app.characterType = 'bug';
                window.app.updateCharacterDisplay();
                document.getElementById('character').value = 'bug';
            }
        }
    }

    getCustomAvatar() {
        return StorageManager.get(this.storageKey);
    }
}

// ============ 主应用类 ============
class FocusReadingApp {
    constructor() {
        // PDF相关
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.0;
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 专注模式相关
        this.focusMode = false;
        this.focusTimer = null;
        this.reminderInterval = StorageManager.get(StorageManager.keys.REMINDER_INTERVAL) || 120; // 默认2分钟提醒
        this.focusTargetDuration = StorageManager.get(StorageManager.keys.FOCUS_TARGET_DURATION) || 1800; // 默认30分钟目标
        this.focusCount = 0;
        this.startTime = null;
        this.readingTimeInterval = null;
        this.targetReachedTimer = null; // 专注目标达成计时器
        this.totalFocusTime = 0; // 累计专注时间
        this.targetReached = false; // 是否已达成目标
        
        // 角色相关
        this.character = document.getElementById('focusCharacter');
        this.characterType = 'bug';
        this.characterEmojis = {
            bug: '🐛',
            cat: '🐱',
            bird: '🐦',
            fish: '🐠',
            butterfly: '🦋',
            cockroach: '🪳',
            graduate: 'graduate.jpg'
        };
        
        // 角色位置
        this.characterPosition = { x: 0, y: 0 };
        this.lastPosition = { x: 0, y: 0 };
        
        // 初始化组件
        this.avatarManager = new AvatarManager();
        this.companionMascot = new CompanionMascot();
        
        this.initEventListeners();
        this.updateCharacterDisplay();
        this.updateSettingsDisplay();
        
        // 检查是否首次访问
        if (StorageManager.isFirstVisit()) {
            this.showWelcomeModal();
        }
    }

    showWelcomeModal() {
        const modal = ModalManager.createFocusTargetModal();
        
        // 处理目标时长选择
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('duration-btn')) {
                // 移除其他按钮的active状态
                modal.querySelectorAll('.duration-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 添加当前按钮的active状态
                e.target.classList.add('active');
                
                // 保存选择的目标时长
                const targetDuration = parseInt(e.target.dataset.duration);
                this.focusTargetDuration = targetDuration;
                StorageManager.set(StorageManager.keys.FOCUS_TARGET_DURATION, targetDuration);
                this.updateSettingsDisplay();
            }
            
            if (e.target.id === 'confirmTarget') {
                StorageManager.markVisited();
                ModalManager.close(modal);
            }
        });
    }

    updateSettingsDisplay() {
        const intervalInput = document.getElementById('interval');
        if (intervalInput) {
            intervalInput.value = this.reminderInterval;
        }
        
        const focusTargetSelect = document.getElementById('focusTarget');
        if (focusTargetSelect) {
            focusTargetSelect.value = this.focusTargetDuration;
        }
        
        // 更新目标时长显示
        this.updateTargetDisplay();
    }
    
    updateTargetDisplay() {
        // 格式化目标时长显示
        const minutes = Math.floor(this.focusTargetDuration / 60);
        const targetText = minutes >= 60 ? 
            `${Math.floor(minutes / 60)}小时${minutes % 60 > 0 ? minutes % 60 + '分钟' : ''}` :
            `${minutes}分钟`;
        
        // 可以在UI中显示当前目标（如果需要的话）
        console.log(`当前专注目标: ${targetText}`);
    }
    
    initEventListeners() {
        // PDF上传
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('pdfInput').click();
        });
        
        document.getElementById('pdfInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                this.loadPDF(file);
            } else {
                alert('请选择有效的PDF文件');
            }
        });
        
        // PDF控制
        document.getElementById('prevPage').addEventListener('click', () => {
            this.onPrevPage();
        });
        
        document.getElementById('nextPage').addEventListener('click', () => {
            this.onNextPage();
        });
        
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomIn();
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomOut();
        });
        
        // 专注模式控制
        document.getElementById('toggleBtn').addEventListener('click', () => {
            this.toggleFocusMode();
        });
        
        document.getElementById('interval').addEventListener('change', (e) => {
            this.reminderInterval = parseInt(e.target.value);
            StorageManager.set(StorageManager.keys.REMINDER_INTERVAL, this.reminderInterval);
            if (this.focusMode) {
                this.restartFocusTimer();
            }
        });
        
        document.getElementById('focusTarget').addEventListener('change', (e) => {
            this.focusTargetDuration = parseInt(e.target.value);
            StorageManager.set(StorageManager.keys.FOCUS_TARGET_DURATION, this.focusTargetDuration);
            this.updateTargetDisplay();
        });
        
        document.getElementById('character').addEventListener('change', (e) => {
            this.characterType = e.target.value;
            this.updateCharacterDisplay();
        });
        
        // 角色点击事件
        this.character.addEventListener('click', () => {
            this.onCharacterClick();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (this.pdfDoc) {
                switch(e.key) {
                    case 'ArrowLeft':
                        this.onPrevPage();
                        break;
                    case 'ArrowRight':
                        this.onNextPage();
                        break;
                    case '+':
                    case '=':
                        this.zoomIn();
                        break;
                    case '-':
                        this.zoomOut();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.toggleFocusMode();
                        break;
                }
            }
        });
    }
    
    async loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            
            this.pdfDoc = await loadingTask.promise;
            this.pageNum = 1;
            
            // 隐藏欢迎消息，显示PDF
            document.getElementById('welcomeMessage').style.display = 'none';
            document.getElementById('pdfCanvas').style.display = 'block';
            document.getElementById('pdfControls').style.display = 'flex';
            
            this.renderPage(this.pageNum);
            this.updatePageInfo();
            
            // 显示成功消息
            this.showSuccessMessage('PDF加载成功！');
            
        } catch (error) {
            console.error('PDF加载失败:', error);
            alert('PDF加载失败，请检查文件格式');
        }
    }
    
    async renderPage(num) {
        this.pageRendering = true;
        
        try {
            const page = await this.pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: this.scale });
            
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            this.pageRendering = false;
            
            if (this.pageNumPending !== null) {
                this.renderPage(this.pageNumPending);
                this.pageNumPending = null;
            }
        } catch (error) {
            console.error('页面渲染失败:', error);
            this.pageRendering = false;
        }
    }
    
    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }
    
    onPrevPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
        this.updatePageInfo();
    }
    
    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
        this.updatePageInfo();
    }
    
    zoomIn() {
        this.scale *= 1.2;
        this.queueRenderPage(this.pageNum);
        this.updateZoomInfo();
    }
    
    zoomOut() {
        this.scale /= 1.2;
        this.queueRenderPage(this.pageNum);
        this.updateZoomInfo();
    }
    
    updatePageInfo() {
        if (this.pdfDoc) {
            document.getElementById('pageInfo').textContent = 
                `第 ${this.pageNum} 页 / 共 ${this.pdfDoc.numPages} 页`;
        }
    }
    
    updateZoomInfo() {
        document.getElementById('zoomLevel').textContent = 
            `${Math.round(this.scale * 100)}%`;
    }
    
    toggleFocusMode() {
        this.focusMode = !this.focusMode;
        const toggleBtn = document.getElementById('toggleBtn');
        
        if (this.focusMode) {
            toggleBtn.textContent = '停止专注模式';
            document.body.classList.add('focus-mode-active');
            this.startFocusMode();
        } else {
            toggleBtn.textContent = '开始专注模式';
            document.body.classList.remove('focus-mode-active');
            this.stopFocusMode();
        }
    }
    
    startFocusMode() {
        this.startTime = Date.now();
        this.focusCount = 0;
        this.targetReached = false;
        this.updateStats();
        
        // 开始阅读时间计时
        this.readingTimeInterval = setInterval(() => {
            this.updateReadingTime();
        }, 1000);
        
        // 开始专注提醒计时
        this.startFocusTimer();
        
        // 设置专注目标达成计时器
        this.targetReachedTimer = setTimeout(() => {
            this.onTargetReached();
        }, this.focusTargetDuration * 1000);
    }
    
    stopFocusMode() {
        if (this.focusTimer) {
            clearTimeout(this.focusTimer);
            this.focusTimer = null;
        }
        
        if (this.readingTimeInterval) {
            clearInterval(this.readingTimeInterval);
            this.readingTimeInterval = null;
        }
        
        if (this.targetReachedTimer) {
            clearTimeout(this.targetReachedTimer);
            this.targetReachedTimer = null;
        }
        
        // 计算本次专注时长
        if (this.startTime) {
            const sessionTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.totalFocusTime += sessionTime;
            
            // 如果没有达成目标但专注超过1分钟，显示鼓励
            if (!this.targetReached && sessionTime >= 60) {
                this.showEncouragement(sessionTime);
            }
        }
        
        this.hideCharacter();
    }
    
    onTargetReached() {
        if (!this.focusMode) return;
        
        this.targetReached = true;
        
        // 显示目标达成庆祝
        FireworksManager.show(5000); // 显示5秒烟花
        
        // 显示特殊祝贺消息
        this.showTargetReachedMessage();
        
        // 自动停止专注模式
        setTimeout(() => {
            if (this.focusMode) {
                this.toggleFocusMode();
            }
        }, 2000);
    }
    
    showTargetReachedMessage() {
        const minutes = Math.floor(this.focusTargetDuration / 60);
        const targetText = minutes >= 60 ? 
            `${Math.floor(minutes / 60)}小时${minutes % 60 > 0 ? minutes % 60 + '分钟' : ''}` :
            `${minutes}分钟`;
            
        this.showSuccessMessage(`🎉 恭喜！您已完成${targetText}的专注目标！`);
    }
    
    showEncouragement(sessionTime) {
        const minutes = Math.floor(sessionTime / 60);
        const seconds = sessionTime % 60;
        let timeText = '';
        
        if (minutes > 0) {
            timeText = `${minutes}分钟${seconds > 0 ? seconds + '秒' : ''}`;
        } else {
            timeText = `${seconds}秒`;
        }
        
        this.showSuccessMessage(`💪 您已专注了${timeText}，继续努力！`);
    }
    
    startFocusTimer() {
        if (this.focusTimer) {
            clearTimeout(this.focusTimer);
        }
        
        this.focusTimer = setTimeout(() => {
            this.showCharacter();
        }, this.reminderInterval * 1000);
    }
    
    restartFocusTimer() {
        this.hideCharacter();
        this.startFocusTimer();
    }
    
    showCharacter() {
        if (!this.focusMode) return;
        
        // 随机位置
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        
        // 记录初始位置
        this.characterPosition = { x, y };
        this.lastPosition = { x, y };
        
        this.character.style.left = x + 'px';
        this.character.style.top = y + 'px';
        this.character.classList.remove('hidden');
        
        // 随机移动轨迹
        this.animateCharacterMovement();
    }
    
    hideCharacter() {
        this.character.classList.add('hidden');
        // 重置变换状态
        this.character.style.transform = 'rotate(0deg)';
    }
    
    animateCharacterMovement() {
        const moveInterval = setInterval(() => {
            if (this.character.classList.contains('hidden')) {
                clearInterval(moveInterval);
                return;
            }
            
            // 记录当前位置作为上一个位置
            this.lastPosition = { ...this.characterPosition };
            
            // 生成新的随机位置
            const newX = Math.random() * (window.innerWidth - 100);
            const newY = Math.random() * (window.innerHeight - 100);
            
            // 更新当前位置
            this.characterPosition = { x: newX, y: newY };
            
            // 计算移动方向并调整朝向
            this.updateCharacterDirection(this.lastPosition, this.characterPosition);
            
            this.character.style.transition = 'all 2s ease-in-out';
            this.character.style.left = newX + 'px';
            this.character.style.top = newY + 'px';
        }, 2000);
        
        // 10秒后停止移动
        setTimeout(() => {
            clearInterval(moveInterval);
        }, 10000);
    }
    
    onCharacterClick() {
        this.focusCount++;
        this.updateStats();
        this.hideCharacter();
        
        // 显示点击效果
        this.showClickEffect();
        
        // 重新开始计时
        this.startFocusTimer();
    }
    
    showClickEffect() {
        const effect = document.createElement('div');
        effect.textContent = '+1';
        effect.style.cssText = `
            position: fixed;
            left: ${this.character.style.left};
            top: ${this.character.style.top};
            color: #48bb78;
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            z-index: 1001;
            animation: fadeUpOut 1s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
        }, 1000);
        
        // 添加CSS动画
        if (!document.getElementById('clickEffectStyle')) {
            const style = document.createElement('style');
            style.id = 'clickEffectStyle';
            style.textContent = `
                @keyframes fadeUpOut {
                    0% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    updateCharacterDisplay() {
        let characterValue = this.characterEmojis[this.characterType];
        
        // 如果是自定义头像，从存储中获取
        if (this.characterType === 'custom') {
            characterValue = this.avatarManager.getCustomAvatar() || '🖼️';
        }
        
        // 清空之前的内容
        this.character.innerHTML = '';
        
        // 判断是emoji还是图片
        if (typeof characterValue === 'string' && 
            (characterValue.startsWith('data:') || characterValue.includes('.jpg') || 
             characterValue.includes('.png') || characterValue.includes('.gif'))) {
            // 创建图片元素
            const img = document.createElement('img');
            img.src = characterValue;
            img.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #fff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            this.character.appendChild(img);
        } else {
            // 显示emoji
            this.character.textContent = characterValue;
        }
    }
    
    updateCharacterDirection(fromPos, toPos) {
        // 计算移动向量
        const deltaX = toPos.x - fromPos.x;
        const deltaY = toPos.y - fromPos.y;
        
        // 如果移动距离太小，不改变朝向
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < 10) {
            return;
        }
        
        // 计算角度（弧度转角度）
        // Math.atan2(deltaY, deltaX) 返回从X轴正方向到向量的角度
        // 由于emoji默认"头部"向上，我们需要调整90度
        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        // 调整角度，使emoji的"头部"指向移动方向
        // 默认emoji朝上（0度），向右移动需要顺时针旋转90度
        angle = angle + 90;
        
        // 标准化角度到0-360度范围
        if (angle < 0) {
            angle += 360;
        }
        
        // 应用旋转变换
        this.character.style.transform = `rotate(${angle}deg)`;
    }
    
    updateStats() {
        document.getElementById('focusCount').textContent = this.focusCount;
    }
    
    updateReadingTime() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('readingTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        
        const header = document.querySelector('header');
        header.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FocusReadingApp();
});

// 防止页面刷新时丢失专注模式状态
window.addEventListener('beforeunload', (e) => {
    if (window.app && window.app.focusMode) {
        e.preventDefault();
        e.returnValue = '您正在专注模式中，确定要离开吗？';
        return e.returnValue;
    }
});