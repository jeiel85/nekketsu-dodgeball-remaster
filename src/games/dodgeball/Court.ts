// 코트 규격, 영역 판정, 스테이지별 날씨 및 마찰력 기믹

export interface CourtStageConfig {
  id: string;
  name: string;
  location: string;
  friction: number;       // 이동 마찰력 (0.99 = 빙판, 0.6 = 진흙, 0.88 = 기본)
  ballBounce: number;     // 지면 볼 바운드 탄성
  floorColor: string;
  lineColor: string;
  skyColor: string;
  bgElements: string;     // 배경 테마 식별자
  weather: 'none' | 'rain' | 'snow' | 'dust' | 'neon';
}

export const STAGE_CONFIGS: { [key: string]: CourtStageConfig } = {
  japan: {
    id: 'japan',
    name: '열혈고교 옥상 코트',
    location: '일본 도쿄',
    friction: 0.88,
    ballBounce: 0.72,
    floorColor: '#8d6e63',
    lineColor: '#ffffff',
    skyColor: '#64b5f6',
    bgElements: 'school_rooftop',
    weather: 'none'
  },
  england: {
    id: 'england',
    name: '런던 타워브리지 잔디 코트',
    location: '영국 런던',
    friction: 0.94,
    ballBounce: 0.60,
    floorColor: '#388e3c',
    lineColor: '#e8f5e9',
    skyColor: '#78909c',
    bgElements: 'tower_bridge',
    weather: 'rain'
  },
  india: {
    id: 'india',
    name: '타지마할 진흙탕 코트',
    location: '인도 아그라',
    friction: 0.70, // 질척질척 느려짐
    ballBounce: 0.45,
    floorColor: '#5d4037',
    lineColor: '#d7ccc8',
    skyColor: '#ffb74d',
    bgElements: 'taj_mahal',
    weather: 'dust'
  },
  iceland: {
    id: 'iceland',
    name: '아이슬란드 빙하 코트',
    location: '아이슬란드 빙원',
    friction: 0.985, // 극강의 미끄러짐! 스케이팅
    ballBounce: 0.80,
    floorColor: '#b2ebf2',
    lineColor: '#006064',
    skyColor: '#1a237e',
    bgElements: 'iceberg_aurora',
    weather: 'snow'
  },
  china: {
    id: 'china',
    name: '천안문 광장 자갈 코트',
    location: '중국 베이징',
    friction: 0.89,
    ballBounce: 0.82,
    floorColor: '#a1887f',
    lineColor: '#ffe082',
    skyColor: '#90caf9',
    bgElements: 'forbidden_city',
    weather: 'none'
  },
  kenya: {
    id: 'kenya',
    name: '사바나 흙먼지 코트',
    location: '케냐 나이로비',
    friction: 0.86,
    ballBounce: 0.70,
    floorColor: '#d87d4a',
    lineColor: '#ffffff',
    skyColor: '#ff9e80',
    bgElements: 'savanna',
    weather: 'dust'
  },
  usa: {
    id: 'usa',
    name: '브루클린 스트리트 코트',
    location: '미국 뉴욕',
    friction: 0.88,
    ballBounce: 0.85, // 강력한 바운드
    floorColor: '#455a64',
    lineColor: '#ffeb3b',
    skyColor: '#e0f7fa',
    bgElements: 'statue_liberty',
    weather: 'none'
  },
  shadow: {
    id: 'shadow',
    name: '섀도우 네온 아레나',
    location: '시공간 균열',
    friction: 0.90,
    ballBounce: 0.75,
    floorColor: '#1a0933',
    lineColor: '#00e5ff',
    skyColor: '#0a0017',
    bgElements: 'cyber_arena',
    weather: 'neon'
  }
};

export class Court {
  public stage: CourtStageConfig;

  // 경기장 물리 영역
  public readonly width = 800;
  public readonly height = 480;

  // 코트 라인 경계
  public readonly courtTop = 150;
  public readonly courtBottom = 420;
  public readonly courtLeft = 70;
  public readonly courtRight = 730;
  public readonly halfLineX = 400;

  // 날씨 파티클
  private weatherParticles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];

  constructor(stageId: string = 'japan') {
    this.stage = STAGE_CONFIGS[stageId] || STAGE_CONFIGS.japan;
    this.initWeatherParticles();
  }

  public setStage(stageId: string) {
    this.stage = STAGE_CONFIGS[stageId] || STAGE_CONFIGS.japan;
    this.initWeatherParticles();
  }

  private initWeatherParticles() {
    this.weatherParticles = [];
    const count = this.stage.weather === 'rain' ? 80 : this.stage.weather === 'snow' ? 50 : 35;
    for (let i = 0; i < count; i++) {
      this.weatherParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: this.stage.weather === 'rain' ? -2 : this.stage.weather === 'snow' ? -0.5 : 1.5,
        vy: this.stage.weather === 'rain' ? 12 : this.stage.weather === 'snow' ? 1.5 : 0.5,
        size: Math.random() * 2 + 1
      });
    }
  }

  public update() {
    // 날씨 파티클 업데이트
    for (const p of this.weatherParticles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y > this.height) {
        p.y = 0;
        p.x = Math.random() * this.width;
      }
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // 1. 하늘 / 배경 그리기
    this.drawSkyAndBackground(ctx);

    // 2. 바닥 코트 그리기
    this.drawCourtFloor(ctx);

    // 3. 코트 라인 (하프라인, 외야라인)
    this.drawCourtLines(ctx);

    // 4. 날씨 효과 렌더링
    this.drawWeather(ctx);
  }

  private drawSkyAndBackground(ctx: CanvasRenderingContext2D) {
    // 하늘 그라디언트
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.courtTop);
    skyGrad.addColorStop(0, this.stage.skyColor);
    skyGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.courtTop);

    // 배경 랜드마크 렌더링
    ctx.save();
    if (this.stage.bgElements === 'school_rooftop') {
      // 후지산 원경
      ctx.fillStyle = '#b0bec5';
      ctx.beginPath();
      ctx.moveTo(300, this.courtTop);
      ctx.lineTo(400, 40);
      ctx.lineTo(500, this.courtTop);
      ctx.fill();
      ctx.fillStyle = '#ffffff'; // 눈 덮인 봉우리
      ctx.beginPath();
      ctx.moveTo(370, 75);
      ctx.lineTo(400, 40);
      ctx.lineTo(430, 75);
      ctx.fill();

      // 철조망 펜스
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < this.width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, this.courtTop - 60);
        ctx.lineTo(x, this.courtTop);
        ctx.stroke();
      }
    } else if (this.stage.bgElements === 'tower_bridge') {
      // 런던 타워브리지 실루엣
      ctx.fillStyle = '#455a64';
      ctx.fillRect(250, 40, 50, this.courtTop - 40);
      ctx.fillRect(500, 40, 50, this.courtTop - 40);
      ctx.fillRect(200, 80, 400, 15);
    } else if (this.stage.bgElements === 'taj_mahal') {
      // 타지마할 돔 실루엣
      ctx.fillStyle = '#ffe0b2';
      ctx.beginPath();
      ctx.arc(400, 90, 40, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(360, 90, 80, this.courtTop - 90);
    } else if (this.stage.bgElements === 'iceberg_aurora') {
      // 오로라 광선
      ctx.fillStyle = 'rgba(0, 230, 118, 0.3)';
      ctx.beginPath();
      ctx.moveTo(100, 0);
      ctx.bezierCurveTo(250, 60, 550, 20, 700, 0);
      ctx.lineTo(800, 0);
      ctx.lineTo(0, 0);
      ctx.fill();
      // 빙산
      ctx.fillStyle = '#e0f7fa';
      ctx.beginPath();
      ctx.moveTo(150, this.courtTop);
      ctx.lineTo(250, 60);
      ctx.lineTo(350, this.courtTop);
      ctx.fill();
    } else if (this.stage.bgElements === 'forbidden_city') {
      // 자금성 붉은 지붕
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(300, 70, 200, 25);
      ctx.fillStyle = '#fbc02d';
      ctx.beginPath();
      ctx.moveTo(270, 70);
      ctx.lineTo(400, 40);
      ctx.lineTo(530, 70);
      ctx.fill();
    } else if (this.stage.bgElements === 'statue_liberty') {
      // 자유의 여신상 & 뉴욕 스카이라인
      ctx.fillStyle = '#37474f';
      ctx.fillRect(150, 50, 60, this.courtTop - 50);
      ctx.fillRect(220, 30, 50, this.courtTop - 30);
      ctx.fillRect(560, 45, 70, this.courtTop - 45);
      // 여신상 실루엣
      ctx.fillStyle = '#80cbc4';
      ctx.fillRect(390, 35, 20, this.courtTop - 35);
    } else if (this.stage.bgElements === 'cyber_arena') {
      // 네온 그리드
      ctx.strokeStyle = '#e040fb';
      ctx.lineWidth = 1;
      for (let x = 0; x < this.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.courtTop);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 관중석 / 응원단 실루엣
    ctx.fillStyle = '#263238';
    ctx.fillRect(0, this.courtTop - 25, this.width, 25);
    // 흔들리는 응원 깃발 및 작은 도트 관중들
    const t = performance.now() * 0.005;
    for (let x = 30; x < this.width; x += 45) {
      const bob = Math.sin(t + x) * 2;
      ctx.fillStyle = (x % 90 === 0) ? '#e53935' : '#ffffff';
      ctx.beginPath();
      ctx.arc(x, this.courtTop - 18 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCourtFloor(ctx: CanvasRenderingContext2D) {
    // 코트 바닥면 (원근감 있는 사다리꼴 형태)
    ctx.fillStyle = this.stage.floorColor;
    ctx.beginPath();
    ctx.moveTo(this.courtLeft + 30, this.courtTop);
    ctx.lineTo(this.courtRight - 30, this.courtTop);
    ctx.lineTo(this.courtRight, this.courtBottom);
    ctx.lineTo(this.courtLeft, this.courtBottom);
    ctx.closePath();
    ctx.fill();

    // 아이슬란드 얼음 반사광 / 광택
    if (this.stage.id === 'iceland') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(this.courtLeft + 60, this.courtTop + 20);
      ctx.lineTo(this.courtRight - 100, this.courtTop + 40);
      ctx.lineTo(this.courtRight - 40, this.courtBottom - 60);
      ctx.lineTo(this.courtLeft + 120, this.courtBottom - 30);
      ctx.fill();
    }
  }

  private drawCourtLines(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = this.stage.lineColor;
    ctx.lineWidth = 3;

    // 외곽 라인
    ctx.strokeRect(this.courtLeft + 40, this.courtTop + 10, (this.courtRight - this.courtLeft) - 80, (this.courtBottom - this.courtTop) - 20);

    // 하프 라인 (중앙선)
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(this.halfLineX, this.courtTop + 10);
    ctx.lineTo(this.halfLineX, this.courtBottom - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // 중앙 원
    ctx.beginPath();
    ctx.arc(this.halfLineX, (this.courtTop + this.courtBottom) / 2, 45, 0, Math.PI * 2);
    ctx.stroke();

    // 내야/외야 경계선 (상단/하단 외야수 존)
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // 상단 외야 라인
    ctx.moveTo(this.courtLeft + 40, this.courtTop + 40);
    ctx.lineTo(this.courtRight - 40, this.courtTop + 40);
    // 하단 외야 라인
    ctx.moveTo(this.courtLeft + 40, this.courtBottom - 40);
    ctx.lineTo(this.courtRight - 40, this.courtBottom - 40);
    ctx.stroke();

    ctx.restore();
  }

  private drawWeather(ctx: CanvasRenderingContext2D) {
    ctx.save();
    if (this.stage.weather === 'rain') {
      ctx.strokeStyle = 'rgba(180, 210, 255, 0.6)';
      ctx.lineWidth = 1.5;
      for (const p of this.weatherParticles) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 3, p.y + 12);
        ctx.stroke();
      }
    } else if (this.stage.weather === 'snow') {
      ctx.fillStyle = '#ffffff';
      for (const p of this.weatherParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.stage.weather === 'dust') {
      ctx.fillStyle = 'rgba(215, 120, 60, 0.4)';
      for (const p of this.weatherParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 플레이어가 특정 구역 내에 있는지 판별
  public isInfield(x: number, y: number, isTeamLeft: boolean): boolean {
    const yValid = y >= this.courtTop + 40 && y <= this.courtBottom - 40;
    if (!yValid) return false;
    if (isTeamLeft) {
      return x >= this.courtLeft + 40 && x < this.halfLineX - 5;
    } else {
      return x > this.halfLineX + 5 && x <= this.courtRight - 40;
    }
  }

  // 외야 영역 판별
  public isOutfield(x: number, y: number, isTeamLeft: boolean): boolean {
    // 왼쪽 팀의 외야는 상대(오른쪽) 진영의 위, 아래, 오른쪽 바깥
    if (isTeamLeft) {
      const topOut = x >= this.halfLineX && x <= this.courtRight && y < this.courtTop + 40 && y >= this.courtTop;
      const botOut = x >= this.halfLineX && x <= this.courtRight && y > this.courtBottom - 40 && y <= this.courtBottom;
      const rightOut = x > this.courtRight - 40 && x <= this.courtRight + 30 && y >= this.courtTop + 40 && y <= this.courtBottom - 40;
      return topOut || botOut || rightOut;
    } else {
      // 오른쪽 팀의 외야는 상대(왼쪽) 진영의 위, 아래, 왼쪽 바깥
      const topOut = x <= this.halfLineX && x >= this.courtLeft && y < this.courtTop + 40 && y >= this.courtTop;
      const botOut = x <= this.halfLineX && x >= this.courtLeft && y > this.courtBottom - 40 && y <= this.courtBottom;
      const leftOut = x < this.courtLeft + 40 && x >= this.courtLeft - 30 && y >= this.courtTop + 40 && y <= this.courtBottom - 40;
      return topOut || botOut || leftOut;
    }
  }
}
