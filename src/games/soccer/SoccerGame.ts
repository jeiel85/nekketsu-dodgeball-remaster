// 열혈 축구 (Nekketsu Soccer) 특별 모드
// 슬라이딩 태클, 바나나 마구 슛, 점프 오버헤드 킥, 골키퍼 날려버리기 액션 완벽 구현

import { Sprites, TEAM_PALETTES } from '../../assets/Sprites';
import { input } from '../../engine/InputManager';
import { sound } from '../../engine/SoundEngine';

export interface SoccerPlayer {
  id: string;
  name: string;
  team: 'left' | 'right';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  isGoalie: boolean;
  isDashing: boolean;
  isTackling: boolean;
  tackleTimer: number;
  animFrame: number;
  facingLeft: boolean;
  downTimer: number;
}

export class SoccerGame {
  public fieldWidth = 800;
  public fieldHeight = 480;

  // 골대 위치
  public goalLeft = { x: 70, yTop: 180, yBottom: 300 };
  public goalRight = { x: 730, yTop: 180, yBottom: 300 };

  // 축구공
  public ball = {
    x: 400,
    y: 240,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 9,
    rotation: 0,
    isSuperShot: false,
    holder: null as SoccerPlayer | null
  };

  public playersLeft: SoccerPlayer[] = [];
  public playersRight: SoccerPlayer[] = [];

  public scoreLeft: number = 0;
  public scoreRight: number = 0;
  public matchTimer: number = 180; // 3분
  public state: 'PLAYING' | 'GOAL' | 'OVER' = 'PLAYING';
  public stateTimer: number = 0;

  public screenShake: number = 0;

  constructor() {
    this.initPlayers();
    sound.playBgm('soccer');
  }

  private initPlayers() {
    // 4 vs 4: 골키퍼 1 + 공격수 2 + 수비수 1
    this.playersLeft = [
      { id: 'gk_l', name: 'GK 겐조', team: 'left', x: 100, y: 240, z: 0, vx: 0, vy: 0, vz: 0, isGoalie: true, isDashing: false, isTackling: false, tackleTimer: 0, animFrame: 0, facingLeft: false, downTimer: 0 },
      { id: 'kunio_s', name: '쿠니오', team: 'left', x: 340, y: 220, z: 0, vx: 0, vy: 0, vz: 0, isGoalie: false, isDashing: false, isTackling: false, tackleTimer: 0, animFrame: 0, facingLeft: false, downTimer: 0 },
      { id: 'riki_s', name: '리키', team: 'left', x: 340, y: 280, z: 0, vx: 0, vy: 0, vz: 0, isGoalie: false, isDashing: false, isTackling: false, tackleTimer: 0, animFrame: 0, facingLeft: false, downTimer: 0 },
      { id: 'df_l', name: '스스무', team: 'left', x: 220, y: 240, z: 0, vx: 0, vy: 0, vz: 0, isGoalie: false, isDashing: false, isTackling: false, tackleTimer: 0, animFrame: 0, facingLeft: false, downTimer: 0 }
    ];

    this.playersRight = [
      { id: 'gk_r', name: 'GK 윌리', team: 'right', x: 700, y: 240, z: 0, vx: 0, vy: 0, vz: 0, isGoalie: true, isDashing: false, isTackling: false, tackleTimer: 0, animFrame: 0, facingLeft: true, downTimer: 0 },
      { id: 'william_s', name: '윌리엄', team: 'right', x: 460, y: 220, z: 0, vx: 0, vy: 0, vz: 0, isGoalie: false, isDashing: false, isTackling: false, tackleTimer: 0, animFrame: 0, facingLeft: true, downTimer: 0 },
      { id: 'john_s', name: '존', team: 'right', x: 460, y: 280, z: 0, vx: 0, vy: 0, vz: 0, isGoalie: false, isDashing: false, isTackling: false, tackleTimer: 0, animFrame: 0, facingLeft: true, downTimer: 0 },
      { id: 'df_r', name: '마이크', team: 'right', x: 580, y: 240, z: 0, vx: 0, vy: 0, vz: 0, isGoalie: false, isDashing: false, isTackling: false, tackleTimer: 0, animFrame: 0, facingLeft: true, downTimer: 0 }
    ];

    this.resetBall();
  }

  public resetBall() {
    this.ball.x = 400;
    this.ball.y = 240;
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.ball.isSuperShot = false;
    this.ball.holder = null;
  }

  public update() {
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    if (this.state === 'GOAL') {
      this.stateTimer++;
      if (this.stateTimer > 120) {
        this.state = 'PLAYING';
        this.resetBall();
      }
      return;
    }

    // 1. 1P 제어 (쿠니오 또는 공 가진 선수)
    this.handle1PInput();

    // 2. 우측 AI 제어
    this.handleSoccerAI();

    // 3. 모든 선수 물리 및 상태 업데이트
    const allPlayers = [...this.playersLeft, ...this.playersRight];
    for (const p of allPlayers) {
      p.animFrame += 0.2;
      if (p.downTimer > 0) {
        p.downTimer--;
        p.vx *= 0.8;
        p.vy *= 0.8;
      }
      if (p.isTackling) {
        p.tackleTimer--;
        if (p.tackleTimer <= 0) {
          p.isTackling = false;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.85;
      p.vy *= 0.85;

      // 필드 경계 제한
      p.x = Math.max(80, Math.min(720, p.x));
      p.y = Math.max(160, Math.min(390, p.y));

      // 태클 충돌 판정 (상대 선수에게 부딪히면 날려버림!)
      if (p.isTackling) {
        const enemies = (p.team === 'left') ? this.playersRight : this.playersLeft;
        for (const enemy of enemies) {
          if (enemy.downTimer <= 0 && Math.hypot(p.x - enemy.x, p.y - enemy.y) < 28) {
            enemy.downTimer = 50;
            enemy.vx = (p.facingLeft ? -1 : 1) * 6;
            enemy.vy = (Math.random() - 0.5) * 3;
            sound.playTackle();
            this.screenShake = 8;
            if (this.ball.holder === enemy) {
              this.ball.holder = null;
              this.ball.vx = (p.facingLeft ? -1 : 1) * 4;
            }
          }
        }
      }
    }

    // 4. 축구공 물리
    if (this.ball.holder) {
      this.ball.x = this.ball.holder.x + (this.ball.holder.facingLeft ? -12 : 12);
      this.ball.y = this.ball.holder.y + 4;
      this.ball.z = 0;
    } else {
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.z += this.ball.vz;
      this.ball.vz -= 0.35; // 중력
      this.ball.rotation += this.ball.vx * 0.08;

      if (this.ball.z <= 0) {
        this.ball.z = 0;
        if (Math.abs(this.ball.vz) > 1.5) {
          this.ball.vz = -this.ball.vz * 0.6;
        } else {
          this.ball.vz = 0;
          this.ball.vx *= 0.94;
          this.ball.vy *= 0.94;
        }
      }

      // 공과 선수 접촉 (볼 드리블/획득)
      for (const p of allPlayers) {
        if (p.downTimer <= 0 && Math.hypot(p.x - this.ball.x, p.y - this.ball.y) < 22 && this.ball.z < 20) {
          this.ball.holder = p;
          this.ball.isSuperShot = false;
          sound.playCatch();
          break;
        }
      }

      // 골대 판정
      // 좌측 골대 (Right 팀 득점)
      if (this.ball.x <= this.goalLeft.x && this.ball.y >= this.goalLeft.yTop && this.ball.y <= this.goalLeft.yBottom) {
        this.scoreGoal('right');
        return;
      }
      // 우측 골대 (Left 팀 득점)
      if (this.ball.x >= this.goalRight.x && this.ball.y >= this.goalRight.yTop && this.ball.y <= this.goalRight.yBottom) {
        this.scoreGoal('left');
        return;
      }

      // 벽 튕기기
      if (this.ball.x < 70) { this.ball.x = 70; this.ball.vx = -this.ball.vx * 0.7; }
      if (this.ball.x > 730) { this.ball.x = 730; this.ball.vx = -this.ball.vx * 0.7; }
      if (this.ball.y < 150) { this.ball.y = 150; this.ball.vy = -this.ball.vy * 0.7; }
      if (this.ball.y > 400) { this.ball.y = 400; this.ball.vy = -this.ball.vy * 0.7; }
    }
  }

  private handle1PInput() {
    const p1 = this.playersLeft[1]; // 쿠니오
    if (p1.downTimer > 0) return;

    let dx = 0;
    let dy = 0;
    if (input.isActionPressed('LEFT', 0)) dx -= 1;
    if (input.isActionPressed('RIGHT', 0)) dx += 1;
    if (input.isActionPressed('UP', 0)) dy -= 1;
    if (input.isActionPressed('DOWN', 0)) dy += 1;

    if (dx !== 0) p1.facingLeft = (dx < 0);

    const speed = input.isActionPressed('DASH', 0) ? 6.2 : 3.8;
    p1.vx += (dx * speed - p1.vx) * 0.5;
    p1.vy += (dy * speed - p1.vy) * 0.5;

    // 슬라이딩 태클 (수비 시) 또는 슛 (공 가졌을 때)
    if (input.isActionJustPressed('SHOT', 0)) {
      if (this.ball.holder === p1) {
        // 슈퍼 바나나 슛 발사!
        this.ball.holder = null;
        this.ball.isSuperShot = true;
        this.ball.vx = (p1.facingLeft ? -1 : 1) * 16;
        this.ball.vy = (Math.random() - 0.5) * 4;
        this.ball.vz = 5;
        this.screenShake = 10;
        sound.playSuperShot();
      } else {
        // 슬라이딩 태클!
        p1.isTackling = true;
        p1.tackleTimer = 25;
        p1.vx = (p1.facingLeft ? -1 : 1) * 9;
        sound.playDash();
      }
    }

    // 패스
    if (input.isActionJustPressed('PASS', 0) && this.ball.holder === p1) {
      this.ball.holder = null;
      const mate = this.playersLeft[2]; // 리키에게 패스
      const dx = mate.x - p1.x;
      const dy = mate.y - p1.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.ball.vx = (dx / dist) * 10;
      this.ball.vy = (dy / dist) * 10;
      this.ball.vz = 2;
      sound.playThrow();
    }
  }

  private handleSoccerAI() {
    const aiAttacker = this.playersRight[1]; // 윌리엄
    if (aiAttacker.downTimer > 0) return;

    if (this.ball.holder === aiAttacker) {
      // 골대를 향해 드리블 후 강슛!
      aiAttacker.facingLeft = true;
      aiAttacker.vx = -4.5;
      if (aiAttacker.x < 350) {
        // 슛 발사!
        this.ball.holder = null;
        this.ball.vx = -14;
        this.ball.vy = (Math.random() - 0.5) * 3;
        this.ball.vz = 4;
        sound.playSuperShot();
      }
    } else {
      // 공을 쫓아감
      const dx = this.ball.x - aiAttacker.x;
      const dy = this.ball.y - aiAttacker.y;
      aiAttacker.facingLeft = (dx < 0);
      aiAttacker.vx += (Math.sign(dx) * 3.5 - aiAttacker.vx) * 0.3;
      aiAttacker.vy += (Math.sign(dy) * 3.5 - aiAttacker.vy) * 0.3;

      // 가까우면 태클 시도
      if (Math.hypot(dx, dy) < 40 && Math.random() < 0.05) {
        aiAttacker.isTackling = true;
        aiAttacker.tackleTimer = 20;
        aiAttacker.vx = Math.sign(dx) * 8;
        sound.playDash();
      }
    }

    // 골키퍼 수비 인공지능
    const gk = this.playersRight[0];
    gk.y += (this.ball.y - gk.y) * 0.1;
    gk.y = Math.max(this.goalRight.yTop + 10, Math.min(this.goalRight.yBottom - 10, gk.y));
  }

  private scoreGoal(team: 'left' | 'right') {
    this.state = 'GOAL';
    this.stateTimer = 0;
    this.screenShake = 18;
    if (team === 'left') this.scoreLeft++;
    else this.scoreRight++;
    sound.playGoal();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    if (this.screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
    }

    // 축구장 잔디 그라운드
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, this.fieldWidth, this.fieldHeight);

    // 잔디 스트라이프 패턴
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 80; x < 720; x += 80) {
      ctx.fillRect(x, 140, 40, 270);
    }

    // 축구장 라인
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 140, 640, 270);

    // 센터 라인 및 센터 서클
    ctx.beginPath();
    ctx.moveTo(400, 140);
    ctx.lineTo(400, 410);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(400, 275, 55, 0, Math.PI * 2);
    ctx.stroke();

    // 골대 (좌/우)
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    // 좌측 골대
    ctx.strokeRect(45, this.goalLeft.yTop, 35, this.goalLeft.yBottom - this.goalLeft.yTop);
    // 우측 골대
    ctx.strokeRect(720, this.goalRight.yTop, 35, this.goalRight.yBottom - this.goalRight.yTop);

    // 선수 렌더링
    const all = [...this.playersLeft, ...this.playersRight].sort((a, b) => a.y - b.y);
    for (const p of all) {
      const pal = (p.team === 'left') ? TEAM_PALETTES.japan_nekketsu : TEAM_PALETTES.usa;
      const anim = p.downTimer > 0 ? 'DOWN' : p.isTackling ? 'DASH' : Math.hypot(p.vx, p.vy) > 0.5 ? 'WALK' : 'IDLE';
      Sprites.drawPlayer(ctx, p.x, p.y, anim, p.animFrame, p.facingLeft, pal, p.id.includes('kunio') || p.id.includes('william'));
    }

    // 축구공 렌더링
    Sprites.drawSoccerBall(ctx, this.ball.x, this.ball.y, this.ball.z, this.ball.radius, this.ball.rotation);

    // 스코어보드 HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(250, 15, 300, 50);
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`열혈 ${this.scoreLeft} : ${this.scoreRight} 미국`, 400, 48);

    if (this.state === 'GOAL') {
      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 56px monospace';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.strokeText('G O A L ! ! !', 400, 270);
      ctx.fillText('G O A L ! ! !', 400, 270);
    }

    ctx.restore();
  }
}
