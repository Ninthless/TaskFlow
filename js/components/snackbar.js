class Snackbar {
    constructor() {
        this.activeSnackbar = null;
        this.queue = [];
        this.isProcessing = false;
        this.template = this.createTemplate();
    }

    static getInstance() {
        if (!Snackbar.instance) {
            Snackbar.instance = new Snackbar();
        }
        return Snackbar.instance;
    }

    createTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `
            <md-snackbar style="opacity: 0">
                <md-icon></md-icon>
                <span style="flex: 1"></span>
                <md-icon-button>
                    <md-icon>close</md-icon>
                </md-icon-button>
            </md-snackbar>
        `;
        return template;
    }

    show(message, type = 'info') {
        if (!message) return;
        
        // 将消息添加到队列
        this.queue.push({ message, type });
        
        // 如果没有正在处理的消息，开始处理
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const { message, type } = this.queue.shift();
        this.showSnackbar(message, type);
    }

    showSnackbar(message, type) {
        // 如果有活动的 snackbar，先移除它
        if (this.activeSnackbar) {
            this.close(this.activeSnackbar);
        }

        // 克隆模板并设置内容
        const snackbar = this.template.content.cloneNode(true).firstElementChild;
        this.applyStyles(snackbar, type);
        this.setContent(snackbar, message, type);
        
        // 使用 DocumentFragment 优化 DOM 操作
        const fragment = document.createDocumentFragment();
        fragment.appendChild(snackbar);
        
        // 使用 requestAnimationFrame 优化渲染
        requestAnimationFrame(() => {
            document.body.appendChild(fragment);
            // 强制回流
            snackbar.offsetHeight;
            snackbar.style.opacity = '1';
        });
        
        this.activeSnackbar = snackbar;
        
        // 使用 setTimeout 替代 requestAnimationFrame 进行自动关闭
        setTimeout(() => {
            if (this.activeSnackbar === snackbar) {
                this.close(snackbar);
            }
        }, 5000);
    }

    applyStyles(snackbar, type) {
        const { color, bgColor } = this.getTypeStyles(type);
        
        Object.assign(snackbar.style, {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '1000',
            backgroundColor: bgColor,
            borderRadius: '8px',
            boxShadow: 'var(--md-sys-elevation-3)',
            padding: '0 16px',
            minWidth: '320px',
            maxWidth: '640px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--md-sys-color-on-surface)',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '20px',
            opacity: '0',
            transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)'
        });

        const icon = snackbar.querySelector('md-icon');
        if (icon) {
            icon.style.color = color;
            icon.style.fontSize = '20px';
        }

        const closeButton = snackbar.querySelector('md-icon-button');
        if (closeButton) {
            closeButton.style.color = 'var(--md-sys-color-on-surface-variant)';
            closeButton.style.marginRight = '-8px';
            closeButton.addEventListener('click', () => this.close(snackbar), { once: true });
        }
    }

    setContent(snackbar, message, type) {
        const icon = snackbar.querySelector('md-icon');
        const text = snackbar.querySelector('span');
        
        if (icon) {
            icon.textContent = this.getTypeStyles(type).icon;
        }
        
        if (text) {
            text.textContent = message;
        }
    }

    getTypeStyles(type) {
        const styles = {
            info: {
                icon: 'info',
                color: 'var(--md-sys-color-primary)',
                bgColor: 'var(--md-sys-color-surface-container-high)'
            },
            success: {
                icon: 'check_circle',
                color: 'var(--md-sys-color-primary)',
                bgColor: 'var(--md-sys-color-surface-container-high)'
            },
            error: {
                icon: 'error',
                color: 'var(--md-sys-color-error)',
                bgColor: 'var(--md-sys-color-surface-container-high)'
            },
            warning: {
                icon: 'warning',
                color: 'var(--md-sys-color-warning)',
                bgColor: 'var(--md-sys-color-surface-container-high)'
            }
        };

        return styles[type] || styles.info;
    }

    close(snackbar) {
        if (!snackbar) return;
        
        snackbar.style.opacity = '0';
        
        // 使用 setTimeout 替代 requestAnimationFrame
        setTimeout(() => {
            if (document.body.contains(snackbar)) {
                document.body.removeChild(snackbar);
            }
            if (this.activeSnackbar === snackbar) {
                this.activeSnackbar = null;
                // 处理队列中的下一个消息
                this.processQueue();
            }
        }, 150);
    }
}

// 导出单例实例
window.snackbar = Snackbar.getInstance(); 