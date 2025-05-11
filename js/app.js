document.addEventListener('DOMContentLoaded', () => {
    // 初始化元素
    const videoElement = document.getElementById('video');
    const formatSelect = document.getElementById('formatSelect');
    const barcodeOutput = document.getElementById('barcodeOutput');
    const manualInput = document.getElementById('manualInput');
    const generateBtn = document.getElementById('generateBtn');
    const themeToggle = document.getElementById('themeToggle');

    // 初始化掃描器
    const scanner = new BarcodeScanner(videoElement);

    // 主題管理
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (systemPrefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // 監聽系統主題變化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }

    // 切換主題
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // 生成條碼
    function renderBarcode(text) {
        try {
            JsBarcode(barcodeOutput, text, {
                format: formatSelect.value,
                lineColor: "#000000",
                width: Math.min(4, Math.max(1, 300 / text.length)),
                height: 100,
                displayValue: true,
                background: "#ffffff",
                margin: 10,
                fontSize: 16
            });
        } catch (error) {
            barcodeOutput.innerHTML = "";
            alert("⚠️ 條碼格式不支援此內容，請重新選擇格式。");
            console.error('Barcode error:', error);
        }
    }

    // 事件監聽
    document.addEventListener('barcodeScanned', (e) => {
        manualInput.value = e.detail;
        renderBarcode(e.detail);
    });

    generateBtn.addEventListener('click', () => {
        const input = manualInput.value.trim();
        if (!input) {
            alert("請輸入條碼內容。");
            return;
        }
        renderBarcode(input);
    });

    themeToggle.addEventListener('click', toggleTheme);

    // 初始化應用
    initTheme();

    // 啟動掃描器
    scanner.start().catch(error => {
        alert(error.message);
        console.error('Scanner initialization error:', error);
    });
});