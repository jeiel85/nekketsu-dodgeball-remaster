// 픽셀 캔버스 렌더러: 4:3 레트로 / 16:9 와이드 비율 지원, 상단바 보정 정밀 스케일러

export type AspectRatioMode = '4:3' | '16:9' | 'fit';

export class CanvasRenderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public readonly logicalWidth: number = 800;
  public readonly logicalHeight: number = 480;

  public enableCRT: boolean = true;
  public aspectMode: AspectRatioMode = '4:3'; // 기본 원작 레트로 4:3 비율

  private scanlineCanvas: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('2D Context is not supported');
    this.ctx = context;

    this.initCanvasSize();
    this.createScanlinePattern();
    window.addEventListener('resize', () => this.onResize());

    // 초기화 즉시 리사이즈 호출로 캔버스 스케일 완벽 적용!
    setTimeout(() => this.onResize(), 0);
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

  public onResize() {
    // 상단 아케이드 툴바 48px 제외한 순수 게임 뷰포트 영역 계산
    const containerW = window.innerWidth;
    const containerH = Math.max(200, window.innerHeight - 48);

    let targetRatio: number;
    if (this.aspectMode === '4:3') {
      targetRatio = 4 / 3; // 1.333 (원작 레트로 패미컴/아케이드 비율)
    } else if (this.aspectMode === '16:9') {
      targetRatio = 16 / 9; // 1.777 (와이드스크린 비율)
    } else {
      targetRatio = this.logicalWidth / this.logicalHeight; // 기본 800:480 (5:3)
    }

    let renderW: number;
    let renderH: number;

    if (containerW / containerH > targetRatio) {
      // 세로 높이에 맞춤
      renderH = containerH - 16; // 16px 패딩
      renderW = renderH * targetRatio;
    } else {
      // 가로 너비에 맞춤
      renderW = containerW - 16;
      renderH = renderW / targetRatio;
    }

    this.canvas.style.width = `${Math.floor(renderW)}px`;
    this.canvas.style.height = `${Math.floor(renderH)}px`;
  }

  public cycleAspectRatio(): AspectRatioMode {
    if (this.aspectMode === '4:3') {
      this.aspectMode = '16:9';
    } else if (this.aspectMode === '16:9') {
      this.aspectMode = 'fit';
    } else {
      this.aspectMode = '4:3';
    }
    this.onResize();
    return this.aspectMode;
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
