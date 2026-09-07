// 픽셀 캔버스 렌더러, CRT 모니터 스캔라인 및 반응형 스케일러

export class CanvasRenderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public readonly logicalWidth: number = 800;
  public readonly logicalHeight: number = 480;

  public enableCRT: boolean = true;
  private scanlineCanvas: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('2D Context is not supported');
    this.ctx = context;

    this.initCanvasSize();
    this.createScanlinePattern();
    window.addEventListener('resize', () => this.onResize());
  }

  private initCanvasSize() {
    this.canvas.width = this.logicalWidth;
    this.canvas.height = this.logicalHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  private createScanlinePattern() {
    this.scanlineCanvas = document.createElement('canvas');
    this.scanlineCanvas.width = this.logicalWidth;
    this.scanlineCanvas.height = this.logicalHeight;
    const sCtx = this.scanlineCanvas.getContext('2d');
    if (!sCtx) return;

    // 가로 스캔라인
    sCtx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < this.logicalHeight; y += 3) {
      sCtx.fillRect(0, y, this.logicalWidth, 1.2);
    }

    // CRT 모서리 비네트 (Vignette)
    const grad = sCtx.createRadialGradient(
      this.logicalWidth / 2, this.logicalHeight / 2, this.logicalWidth * 0.35,
      this.logicalWidth / 2, this.logicalHeight / 2, this.logicalWidth * 0.55
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  private onResize() {
    // 종횡비 16:9 유지하면서 브라우저 창에 꽉 차게 스케일
    const containerW = window.innerWidth;
    const containerH = window.innerHeight;

    const scale = Math.min(containerW / this.logicalWidth, containerH / this.logicalHeight);
    const renderW = Math.floor(this.logicalWidth * scale);
    const renderH = Math.floor(this.logicalHeight * scale);

    this.canvas.style.width = `${renderW}px`;
    this.canvas.style.height = `${renderH}px`;
  }

  public clear() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  public applyPostProcessing() {
    if (this.enableCRT && this.scanlineCanvas) {
      this.ctx.save();
      this.ctx.drawImage(this.scanlineCanvas, 0, 0);
      this.ctx.restore();
    }
  }

  public toggleCRT(): boolean {
    this.enableCRT = !this.enableCRT;
    return this.enableCRT;
  }

  public toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
}
