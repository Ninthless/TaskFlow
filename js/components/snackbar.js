class Snackbar {
    constructor() {
        this.activeSnackbar = null;
    }

    static getInstance() {
        if (!Snackbar.instance) {
            Snackbar.instance = new Snackbar();
        }
        return Snackbar.instance;
    }

    show(message, type = 'info') {
        // 如果有活动的 snackbar，先移除它
        if (this.activeSnackbar) {
            this.close(this.activeSnackbar);
        }

        // 创建新的 snackbar
        const snackbar = document.createElement('md-snackbar');
        
        // 根据类型设置图标和样式
        let icon = 'info';
        let color = 'var(--md-sys-color-primary)';
        let bgColor = 'var(--md-sys-color-surface-container-high)';
        
        switch (type) {
            case 'success':
                icon = 'check_circle';
                color = 'var(--md-sys-color-primary)';
                break;
            case 'error':
                icon = 'error';
                color = 'var(--md-sys-color-error)';
                break;
            case 'warning':
                icon = 'warning';
                color = 'var(--md-sys-color-warning)';
                break;
        }

        // 设置基本样式
        snackbar.style.position = 'fixed';
        snackbar.style.bottom = '24px';
        snackbar.style.left = '50%';
        snackbar.style.transform = 'translateX(-50%)';
        snackbar.style.zIndex = '1000';
        snackbar.style.backgroundColor = bgColor;
        snackbar.style.borderRadius = '8px';
        snackbar.style.boxShadow = 'var(--md-sys-elevation-3)';
        snackbar.style.padding = '0 16px';
        snackbar.style.minWidth = '320px';
        snackbar.style.maxWidth = '640px';
        snackbar.style.height = '48px';
        snackbar.style.display = 'flex';
        snackbar.style.alignItems = 'center';
        snackbar.style.gap = '8px';
        snackbar.style.color = 'var(--md-sys-color-on-surface)';
        snackbar.style.fontSize = '14px';
        snackbar.style.fontWeight = '500';
        snackbar.style.lineHeight = '20px';
        snackbar.style.opacity = '0';
        snackbar.style.transition = 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)';

        // 创建内容
        const iconElement = document.createElement('md-icon');
        iconElement.textContent = icon;
        iconElement.style.color = color;
        iconElement.style.fontSize = '20px';
        
        const textElement = document.createElement('span');
        textElement.textContent = message;
        textElement.style.flex = '1';
        
        const closeButton = document.createElement('md-icon-button');
        closeButton.innerHTML = '<md-icon>close</md-icon>';
        closeButton.style.color = 'var(--md-sys-color-on-surface-variant)';
        closeButton.style.marginRight = '-8px';
        
        snackbar.appendChild(iconElement);
        snackbar.appendChild(textElement);
        snackbar.appendChild(closeButton);
        
        document.body.appendChild(snackbar);
        
        // 显示动画
        requestAnimationFrame(() => {
            snackbar.style.opacity = '1';
        });
        
        this.activeSnackbar = snackbar;
        
        // 绑定关闭按钮事件
        closeButton.addEventListener('click', () => {
            this.close(snackbar);
        });
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (this.activeSnackbar === snackbar) {
                this.close(snackbar);
            }
        }, 5000);
    }

    close(snackbar) {
        if (!snackbar) return;
        
        snackbar.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(snackbar)) {
                document.body.removeChild(snackbar);
            }
            if (this.activeSnackbar === snackbar) {
                this.activeSnackbar = null;
            }
        }, 150);
    }
}

// 导出单例实例
window.snackbar = Snackbar.getInstance(); 