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

    // 條碼格式驗證規則
    const barcodeValidators = {
        'CODE128': (text) => /^[\x00-\x7F]+$/.test(text), // 所有ASCII字符
        'EAN13': (text) => /^\d{12,13}$/.test(text),
        'EAN8': (text) => /^\d{7,8}$/.test(text),
        'UPC': (text) => /^\d{11,12}$/.test(text),
        'UPCE': (text) => /^\d{6,8}$/.test(text),
        'CODE39': (text) => /^[A-Z0-9\-\.\ \$\/\+\%]+$/.test(text),
        'ITF14': (text) => /^\d{13,14}$/.test(text),
        'MSI': (text) => /^\d+$/.test(text),
        'pharmacode': (text) => /^\d+$/.test(text) && parseInt(text) <= 131070,
        'codabar': (text) => /^[A-Da-d][0-9\-\$\:\.\/\+]+[A-Da-d]$/.test(text)
    };

    // 條碼格式友好名稱
    const formatNames = {
        'CODE128': 'Code 128',
        'EAN13': 'EAN-13',
        'EAN8': 'EAN-8',
        'UPC': 'UPC-A',
        'UPCE': 'UPC-E',
        'CODE39': 'Code 39',
        'ITF14': 'ITF-14',
        'MSI': 'MSI',
        'pharmacode': 'Pharmacode',
        'codabar': 'Codabar'
    };

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

    // 驗證條碼格式
    function validateBarcode(text, format) {
        if (!barcodeValidators[format]) return true; // 如果沒有驗證規則則跳過

        if (!barcodeValidators[format](text)) {
            const formatName = formatNames[format] || format;
            let errorMessage = `"${text}" 不符合 ${formatName} 格式要求。`;

            // 添加特定格式的提示
            switch (format) {
                case 'EAN13':
                    errorMessage += '\n請輸入12或13位數字。';
                    break;
                case 'EAN8':
                    errorMessage += '\n請輸入7或8位數字。';
                    break;
                case 'UPC':
                    errorMessage += '\n請輸入11或12位數字。';
                    break;
                case 'UPCE':
                    errorMessage += '\n請輸入6-8位數字。';
                    break;
                case 'CODE39':
                    errorMessage += '\n只允許大寫字母、數字和 -.$/+% 符號。';
                    break;
                case 'pharmacode':
                    errorMessage += '\n請輸入1-131070之間的數字。';
                    break;
                case 'codabar':
                    errorMessage += '\n必須以A-D開頭和結尾，中間包含數字或-:$/.+符號。';
                    break;
            }

            return {
                valid: false,
                message: errorMessage
            };
        }

        return { valid: true };
    }

    // 生成條碼
    function renderBarcode(text) {
        const format = formatSelect.value;
        const validation = validateBarcode(text, format);

        if (!validation.valid) {
            alert(validation.message);
            barcodeOutput.innerHTML = "";
            return;
        }

        try {
            JsBarcode(barcodeOutput, text, {
                format: format,
                lineColor: "#000000",
                width: Math.min(4, Math.max(1, 300 / text.length)),
                height: 100,
                displayValue: true,
                background: "#ffffff",
                margin: 10,
                fontSize: 16,
                valid: function (valid) {
                    if (!valid) {
                        alert(`無法生成 ${formatNames[format] || format} 條碼，請檢查輸入內容。`);
                        barcodeOutput.innerHTML = "";
                    }
                }
            });
        } catch (error) {
            barcodeOutput.innerHTML = "";
            alert(`⚠️ 條碼生成錯誤: ${error.message}`);
            console.error('Barcode generation error:', error);
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

    manualInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
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