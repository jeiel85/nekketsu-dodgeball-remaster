// 피구공 물리, 바운드, 궤적, 마구 엔진

import { Sprites } from '../../assets/Sprites';
import { SuperShotDefinition, SUPER_SHOTS } from './SuperShots';
import { sound } from '../../engine/SoundEngine';

export type BallState = 'HELD' | 'THROWN' | 'SUPER' | 'PASS' | 'BOUNCING' | 'LOOSE';

export interface BallParticle {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  alpha: number;
}

export class Ball {
  public x: number = 400;
  public y: number = 260;
  public z: number = 0;

  public vx: number = 0;
  public vy: number = 0;
  public vz: number = 0;

  public radius: number = 10;
  public rotation: number = 0;
  public state: BallState = 'LOOSE';

  // 공격 정보
  public throwerTeam: 'left' | 'right' = 'left';
  public throwerId: string = '';
  public damage: number = 20;
  public isSuperShot: boolean = false;
  public superShotDef: SuperShotDefinition | null = null;
  public superShotTimer: number = 0;
  public superStartX: number = 0;
  public superStartY: number = 0;
  public superTargetX: number = 0;
  public superTargetY: number = 0;
  public superDir: number = 1;
  public isVisible: boolean = true;

  // 파티클 잔상
  public trails: BallParticle[] = [];

  constructor() {}

  public reset(x: number = 400, y: number = 260) {
    this.x = x;
    this.y = y;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.state = 'LOOSE';
    this.isSuperShot = false;
    this.superShotDef = null;
    this.superShotTimer = 0;
    this.trails = [];
    this.isVisible = true;
  }

  // 볼 던지기 (일반)
  public throwNormal(
    startX: number,
    startY: number,
    startZ: number,
    targetX: number,
    targetY: number,
    power: number,
    team: 'left' | 'right',
    throwerId: string
  ) {
    this.x = startX;
    this.y = startY;
    this.z = startZ;
    this.throwerTeam = team;
    this.throwerId = throwerId;
    this.state = 'THROWN';
    this.isSuperShot = false;
    this.superShotDef = null;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy) || 1;

    const baseSpeed = 8 + (power / 100) * 6; // 8 ~ 14
    this.vx = (dx / dist) * baseSpeed;
    this.vy = (dy / dist) * baseSpeed;
    this.vz = 0.5; // 살짝 포물선
    this.damage = Math.round(15 + (power / 100) * 15); // 15 ~ 30
    sound.playThrow();
  }

  // 마구 발사 (슈퍼 샷)
  public throwSuper(
    startX: number,
    startY: number,
    startZ: number,
    targetX: number,
    targetY: number,
    superShotId: string,
    team: 'left' | 'right',
    throwerId: string
  ) {
    this.x = startX;
    this.y = startY;
    this.z = startZ;
    this.throwerTeam = team;
    this.throwerId = throwerId;
    this.state = 'SUPER';
    this.isSuperShot = true;

    const def = SUPER_SHOTS[superShotId] || SUPER_SHOTS.compress;
    this.superShotDef = def;
    this.superShotTimer = 0;
    this.superStartX = startX;
    this.superStartY = startY;
    this.superTargetX = targetX;
    this.superTargetY = targetY;
    this.superDir = targetX >= startX ? 1 : -1;
    this.damage = def.damage;

    sound.playSuperShot();
  }

  // 패스 던지기
  public passTo(
    startX: number,
    startY: number,
    startZ: number,
    targetX: number,
    targetY: number,
    team: 'left' | 'right',
    throwerId: string
  ) {
    this.x = startX;
    this.y = startY;
    this.z = startZ;
    this.throwerTeam = team;
    this.throwerId = throwerId;
    this.state = 'PASS';
    this.isSuperShot = false;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 9.5;
    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;
    this.vz = 2.0;
    this.damage = 0;
    sound.playThrow();
  }

  public update(gravity: number = 0.45, bounceCoeff: number = 0.7) {
    // 잔상 파티클 페이드아웃
    for (let i = this.trails.length - 1; i >= 0; i--) {
      this.trails[i].alpha -= 0.08;
      if (this.trails[i].alpha <= 0) {
        this.trails.splice(i, 1);
      }
    }

    if (this.state === 'HELD') {
      return;
    }

    // 마구 모드 업데이트
    if (this.state === 'SUPER' && this.superShotDef) {
      this.superShotTimer += 1;
      const res = this.superShotDef.calculateTrajectory(
        this.superShotTimer,
        this.superStartX,
        this.superStartY,
        this.superTargetX,
        this.superTargetY,
        this.superDir
      );

      this.x = res.x;
      this.y = res.y;
      this.z = res.z;
      this.isVisible = res.visible;

      // 마구 잔상 파티클 남기기
      if (this.isVisible) {
        this.trails.push({
          x: this.x,
          y: this.y,
          z: this.z,
          color: this.superShotDef.color,
          size: this.radius * (this.superShotDef.id === 'compress' ? 1.4 : 1.1),
          alpha: 0.8
        });
      }

      this.rotation += 0.4 * this.superDir;

      // 목표지점 도달 또는 화면 밖 나갔을 때 바운드 모드로 전환
      const dx = this.x - this.superTargetX;
      const dy = this.y - this.superTargetY;
      const reached = (this.superDir > 0 ? this.x >= this.superTargetX + 30 : this.x <= this.superTargetX - 30);
      if (reached || this.x < 30 || this.x > 770 || this.superShotTimer > 80) {
        this.state = 'BOUNCING';
        this.vx = this.superDir * 3;
        this.vy = 0;
        this.vz = 4;
        this.isSuperShot = false;
        sound.playBounce();
      }
      return;
    }

    // 일반 투구, 패스, 바운스 물리
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
    this.vz -= gravity;

    // 회전
    this.rotation += (this.vx * 0.05);

    // 지면(z <= 0) 충돌
    if (this.z <= 0) {
      this.z = 0;
      if (Math.abs(this.vz) > 1.5) {
        this.vz = -this.vz * bounceCoeff;
        this.vx *= 0.8;
        this.vy *= 0.8;
        this.state = 'BOUNCING';
        sound.playBounce();
      } else {
        this.vz = 0;
        this.vx *= 0.85;
        this.vy *= 0.85;
        if (Math.hypot(this.vx, this.vy) < 0.3) {
          this.vx = 0;
          this.vy = 0;
          this.state = 'LOOSE';
        }
      }
    }

    // 코트 외곽 벽 바운드 (화면 안쪽으로 튕기기)
    if (this.x < 40) {
      this.x = 40;
      this.vx = -this.vx * 0.7;
    } else if (this.x > 760) {
      this.x = 760;
      this.vx = -this.vx * 0.7;
    }
    if (this.y < 130) {
      this.y = 130;
      this.vy = -this.vy * 0.7;
    } else if (this.y > 440) {
      this.y = 440;
      this.vy = -this.vy * 0.7;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, color1: string = '#ff2222', color2: string = '#ffffff') {
    // 1. 파티클 잔상 그리기
    for (const t of this.trails) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y - t.z, t.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (!this.isVisible) return;

    // 2. 본체 볼 렌더링
    Sprites.drawBall(
      ctx,
      this.x,
      this.y,
      this.z,
      this.radius,
      this.rotation,
      this.isSuperShot && this.superShotDef ? this.superShotDef.color : color1,
      color2,
      this.isSuperShot,
      this.superShotDef ? this.superShotDef.id : ''
    );
  }
}
