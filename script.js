// PDF.js 配置
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class FocusReadingApp {
    constructor() {
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
        this.focusInterval = 30; // 默认30秒
        this.focusCount = 0;
        this.startTime = null;
        this.readingTimeInterval = null;
        
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
            graduate: 'graduate.jpg' // 毕业生形象 - 尝试相对路径
        };
        
        // 角色当前位置
        this.characterPosition = { x: 0, y: 0 };
        this.lastPosition = { x: 0, y: 0 };
        
        this.initEventListeners();
        this.updateCharacterDisplay();
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
            this.focusInterval = parseInt(e.target.value);
            if (this.focusMode) {
                this.restartFocusTimer();
            }
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
        this.updateStats();
        
        // 开始阅读时间计时
        this.readingTimeInterval = setInterval(() => {
            this.updateReadingTime();
        }, 1000);
        
        // 开始专注提醒计时
        this.startFocusTimer();
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
        
        this.hideCharacter();
    }
    
    startFocusTimer() {
        if (this.focusTimer) {
            clearTimeout(this.focusTimer);
        }
        
        this.focusTimer = setTimeout(() => {
            this.showCharacter();
        }, this.focusInterval * 1000);
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
        const characterValue = this.characterEmojis[this.characterType];
        
        // 清空之前的内容
        this.character.innerHTML = '';
        
        // 判断是emoji还是图片路径
        if (characterValue.includes('.jpg') || characterValue.includes('.png') || characterValue.includes('.gif')) {
            // 创建图片元素
            const img = document.createElement('img');
            img.src = characterValue;
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
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
    new FocusReadingApp();
});

// 防止页面刷新时丢失专注模式状态
window.addEventListener('beforeunload', (e) => {
    const app = window.focusApp;
    if (app && app.focusMode) {
        e.preventDefault();
        e.returnValue = '您正在专注模式中，确定要离开吗？';
        return e.returnValue;
    }
});