class BarcodeScanner {
    constructor(videoElement) {
        this.codeReader = new ZXing.BrowserMultiFormatReader();
        this.videoElement = videoElement;
        this.selectedDeviceId = null;
    }

    async start() {
        try {
            const devices = await this.codeReader.listVideoInputDevices();

            // 優先選擇後鏡頭
            this.selectedDeviceId = devices[0].deviceId;
            for (const device of devices) {
                if (/back|environment/i.test(device.label)) {
                    this.selectedDeviceId = device.deviceId;
                    break;
                }
            }

            await this.codeReader.decodeFromVideoDevice(
                this.selectedDeviceId,
                this.videoElement,
                (result, err) => {
                    if (result) {
                        this.onScanSuccess(result.text);
                    }
                }
            );
        } catch (error) {
            console.error('Scanner error:', error);
            throw new Error('無法啟用相機，請確認權限已開啟。');
        }
    }

    stop() {
        this.codeReader.reset();
    }

    onScanSuccess(barcodeText) {
        const event = new CustomEvent('barcodeScanned', { detail: barcodeText });
        document.dispatchEvent(event);
    }
}