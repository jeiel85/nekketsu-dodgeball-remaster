// 열혈 피구 선수 상태 머신, 액션, 마구 발동 판정 및 물리 시스템

import { PlayerAnimState, Sprites, TeamPalette } from '../../assets/Sprites';
import { PlayerStats } from './Teams';
import { Ball } from './Ball';
import { Court } from './Court';
import { sound } from '../../engine/SoundEngine';

export class Player {
  public stats: PlayerStats;
  public team: 'left' | 'right';
  public palette: TeamPalette;
  public court: Court;

  // 위치 및 속도
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public vz: number = 0;

  public facingLeft: boolean = false;
  public animState: PlayerAnimState = 'IDLE';
  public animFrame: number = 0;

  // 체력 및 생존 상태
  public hp: number;
  public isDead: boolean = false;
  public angelY: number = 0;

  // 공 소유
  public hasBall: boolean = false;

  // 동작 타이머 및 상태 카운터
  public dashSteps: number = 0;
  public isDashing: boolean = false;
  public isJumping: boolean = false;
  public stateTimer: number = 0;
  public catchCooldown: number = 0;
  public invincibleTimer: number = 0;

  // 피격 넉백
  public spinAngle: number = 0;

  constructor(stats: PlayerStats, team: 'left' | 'right', palette: TeamPalette, court: Court) {
    this.stats = stats;
    this.team = team;
    this.palette = palette;
    this.court = court;
    this.hp = stats.maxHp;
    this.facingLeft = (team === 'right');
    this.resetPosition();
  }

  public resetPosition() {
    const isLeft = (this.team === 'left');
    this.facingLeft = !isLeft;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.isDashing = false;
    this.isJumping = false;
    this.hasBall = false;
    this.animState = 'IDLE';
    this.stateTimer = 0;

    // 포지션별 초기 배치 좌표
    if (this.stats.position === 'infield_c') {
      this.x = isLeft ? 260 : 540;
      this.y = 280;
    } else if (this.stats.position === 'infield_1') {
      this.x = isLeft ? 180 : 620;
      this.y = 220;
    } else if (this.stats.position === 'infield_2') {
      this.x = isLeft ? 180 : 620;
      this.y = 340;
    } else if (this.stats.position === 'outfield_top') {
      // 상대 코트 상단
      this.x = isLeft ? 550 : 250;
      this.y = 165;
      this.facingLeft = isLeft;
    } else if (this.stats.position === 'outfield_bot') {
      // 상대 코트 하단
      this.x = isLeft ? 550 : 250;
      this.y = 395;
      this.facingLeft = isLeft;
    } else if (this.stats.position === 'outfield_back') {
      // 상대 코트 후방
      this.x = isLeft ? 710 : 90;
      this.y = 280;
      this.facingLeft = isLeft;
    }
  }

  public update(ball: Ball) {
    this.animFrame += 0.2;
    if (this.stateTimer > 0) this.stateTimer--;
    if (this.catchCooldown > 0) this.catchCooldown--;
    if (this.invincibleTimer > 0) this.invincibleTimer--;

    // 1. 사망 / 천국 승천 연출
    if (this.isDead) {
      this.animState = 'ANGEL';
      this.angelY -= 1.2;
      this.y = this.angelY;
      return;
    }

    // 2. 피격 넉다운 / 회전 상태 처리
    if (this.animState === 'SPIN') {
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;
      this.vz -= 0.4;
      this.spinAngle += 0.3;

      if (this.z <= 0) {
        this.z = 0;
        this.vz = 0;
        this.animState = 'DOWN';
        this.stateTimer = 45; // 45프레임간 다운
        sound.playHit(false);
      }
      return;
    }

    if (this.animState === 'HURT') {
      this.x += this.vx;
      this.vx *= 0.85;
      if (this.stateTimer <= 0) {
        this.animState = this.hp <= this.stats.maxHp * 0.25 ? 'TIRED' : 'IDLE';
      }
      return;
    }

    if (this.animState === 'DOWN') {
      this.vx *= 0.8;
      this.vy *= 0.8;
      this.x += this.vx;
      this.y += this.vy;
      if (this.stateTimer <= 0) {
        this.animState = this.hp <= this.stats.maxHp * 0.25 ? 'TIRED' : 'IDLE';
      }
      return;
    }

    // 3. 투구 모션 처리
    if (this.animState === 'THROW_WINDUP') {
      if (this.stateTimer <= 0) {
        this.animState = 'THROW_RELEASE';
        this.stateTimer = 12;
      }
      return;
    }
    if (this.animState === 'THROW_RELEASE' || this.animState === 'JUMP_THROW') {
      if (this.stateTimer <= 0) {
        this.animState = this.isJumping ? 'JUMP' : 'IDLE';
      }
    }

    // 4. 캐치 포즈 처리
    if (this.animState === 'CATCH') {
      if (this.stateTimer <= 0) {
        this.animState = 'IDLE';
      }
    }

    // 5. 물리 이동 & 마찰력
    const stageFriction = this.court.stage.friction;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= stageFriction;
    this.vy *= stageFriction;

    // 점프 중 중력
    if (this.isJumping) {
      this.z += this.vz;
      this.vz -= 0.45;
      if (this.z <= 0) {
        this.z = 0;
        this.vz = 0;
        this.isJumping = false;
        if (this.animState === 'JUMP') {
          this.animState = 'IDLE';
        }
      }
    }

    // 공을 쥐고 있을 때 공 위치를 손 위치에 동기화
    if (this.hasBall) {
      ball.state = 'HELD';
      const handOffX = (this.facingLeft ? -12 : 12);
      const handOffY = -12;
      ball.x = this.x + handOffX;
      ball.y = this.y + handOffY;
      ball.z = this.z + 14;
    }

    // 6. 코트 경계 제한 (내야수 vs 외야수 구역 가두기)
    this.clampToTerritory();

    // 7. 걷기/대시/지친 모션 결정
    if (['IDLE', 'WALK', 'DASH', 'TIRED'].includes(this.animState)) {
      const speedMag = Math.hypot(this.vx, this.vy);
      if (this.isDashing && speedMag > 1.0) {
        this.animState = 'DASH';
        this.dashSteps += 0.2;
      } else if (speedMag > 0.4) {
        this.animState = 'WALK';
        this.dashSteps = 0;
      } else {
        this.animState = (this.hp <= this.stats.maxHp * 0.25) ? 'TIRED' : 'IDLE';
        this.dashSteps = 0;
      }
    }
  }

  // 이동 명령 (dx, dy는 -1, 0, 1)
  public move(dx: number, dy: number, dashRequested: boolean) {
    if (this.isDead || ['SPIN', 'DOWN', 'HURT', 'THROW_WINDUP'].includes(this.animState)) {
      return;
    }

    if (dx !== 0) {
      this.facingLeft = (dx < 0);
    }

    let currentSpeed = this.stats.speed;
    if (this.hp <= this.stats.maxHp * 0.25) {
      currentSpeed *= 0.7; // 부상 시 속도 저하
    }

    // 대시 모드 진입
    if (dashRequested && !this.isDashing && (dx !== 0 || dy !== 0)) {
      this.isDashing = true;
      this.dashSteps = 0;
      sound.playDash();
    } else if (!dashRequested && Math.hypot(dx, dy) === 0) {
      this.isDashing = false;
    }

    if (this.isDashing) {
      currentSpeed *= 1.75; // 대시 속도 대폭 증가!
    }

    if (dx !== 0 && dy !== 0) {
      // 대각선 정규화
      currentSpeed *= 0.707;
    }

    // 가속도 적용 (아이슬란드 빙판 등 마찰력에 따라 부드러운 가속)
    const accel = this.court.stage.friction > 0.95 ? 0.35 : 0.8;
    this.vx += (dx * currentSpeed - this.vx) * accel;
    this.vy += (dy * currentSpeed - this.vy) * accel;
  }

  // 점프
  public jump() {
    if (this.isDead || this.isJumping || ['SPIN', 'DOWN', 'HURT', 'THROW_WINDUP'].includes(this.animState)) {
      return;
    }
    this.isJumping = true;
    this.vz = 7.5;
    this.animState = 'JUMP';
    sound.playJump();
  }

  // 던지기 (일반 슛, 지상 마구, 공중 마구)
  public throwBall(ball: Ball, targetX: number, targetY: number, forceSuper: boolean = false) {
    if (!this.hasBall || this.isDead) return;

    this.hasBall = false;
    const isJumpShot = this.isJumping;
    const isGroundSuper = this.isDashing && this.dashSteps >= 3.0;
    const shouldSuper = forceSuper || isGroundSuper || (isJumpShot && this.z > 20);

    this.animState = isJumpShot ? 'JUMP_THROW' : 'THROW_WINDUP';
    this.stateTimer = 10;

    const startX = this.x + (this.facingLeft ? -15 : 15);
    const startY = this.y - 12;
    const startZ = this.z + 16;

    if (shouldSuper) {
      // 전설의 마구 발동!
      ball.throwSuper(
        startX,
        startY,
        startZ,
        targetX,
        targetY,
        this.stats.superShotId,
        this.team,
        this.stats.id
      );
    } else {
      // 일반 강속구
      ball.throwNormal(
        startX,
        startY,
        startZ,
        targetX,
        targetY,
        this.stats.power,
        this.team,
        this.stats.id
      );
    }
  }

  // 패스하기 (아군에게 연결)
  public passBall(ball: Ball, targetX: number, targetY: number) {
    if (!this.hasBall || this.isDead) return;
    this.hasBall = false;
    this.animState = 'THROW_RELEASE';
    this.stateTimer = 10;

    ball.passTo(
      this.x + (this.facingLeft ? -10 : 10),
      this.y - 10,
      this.z + 12,
      targetX,
      targetY,
      this.team,
      this.stats.id
    );
  }

  // 캐치 시도
  public tryCatch(ball: Ball): boolean {
    if (this.hasBall || this.isDead || this.catchCooldown > 0) return false;
    this.animState = 'CATCH';
    this.stateTimer = 15;
    this.catchCooldown = 25;

    // 공이 잡을 수 있는 사거리(35px 이내)에 있는지 확인
    const dist = Math.hypot(this.x - ball.x, this.y - ball.y);
    const zDiff = Math.abs(this.z - ball.z);

    if (dist < 42 && zDiff < 32 && (ball.state === 'THROWN' || ball.state === 'SUPER' || ball.state === 'BOUNCING' || ball.state === 'LOOSE' || ball.state === 'PASS')) {
      // 적의 공격구일 경우 능력치에 따른 캐치 성공 여부 계산
      if (ball.state === 'THROWN' || ball.state === 'SUPER') {
        const successRate = this.stats.catchSkill * (ball.isSuperShot ? 0.7 : 0.95);
        const roll = Math.random() * 100;
        if (roll < successRate) {
          // 캐치 성공!
          this.hasBall = true;
          ball.state = 'HELD';
          ball.isSuperShot = false;
          sound.playCatch();
          return true;
        } else {
          // 캐치 실패 -> 볼에 맞음
          this.takeHit(ball);
          return false;
        }
      } else {
        // 루즈볼 또는 패스 볼은 100% 캐치 성공
        this.hasBall = true;
        ball.state = 'HELD';
        sound.playCatch();
        return true;
      }
    }
    return false;
  }

  // 공에 피격됨
  public takeHit(ball: Ball) {
    if (this.isDead || this.invincibleTimer > 0) return;

    this.hp = Math.max(0, this.hp - ball.damage);
    this.invincibleTimer = 40;
    sound.playHit(ball.isSuperShot);

    const hitDir = ball.vx >= 0 ? 1 : -1;

    if (this.hp <= 0) {
      // 체력 고갈 -> 천국 승천 모드 돌입
      this.isDead = true;
      this.animState = 'ANGEL';
      this.angelY = this.y;
      sound.playAngel();
      return;
    }

    if (ball.isSuperShot) {
      // 마구 맞고 공중 빙글빙글 회전 넉다운!
      this.animState = 'SPIN';
      this.vx = hitDir * 7.5;
      this.vy = (Math.random() - 0.5) * 4;
      this.vz = 6.0;
    } else {
      // 일반 피격
      this.animState = 'HURT';
      this.stateTimer = 20;
      this.vx = hitDir * 3.5;
    }
  }

  // 코트 구역 이탈 방지
  private clampToTerritory() {
    const isLeft = (this.team === 'left');
    const halfX = this.court.halfLineX;
    const cTop = this.court.courtTop + 40;
    const cBot = this.court.courtBottom - 40;

    if (this.stats.position.startsWith('infield')) {
      // 내야수 구역 제한
      this.y = Math.max(cTop, Math.min(cBot, this.y));
      if (isLeft) {
        this.x = Math.max(this.court.courtLeft + 40, Math.min(halfX - 10, this.x));
      } else {
        this.x = Math.max(halfX + 10, Math.min(this.court.courtRight - 40, this.x));
      }
    } else if (this.stats.position === 'outfield_top') {
      // 상단 외야수
      this.y = Math.max(this.court.courtTop + 5, Math.min(cTop - 5, this.y));
      if (isLeft) {
        this.x = Math.max(halfX + 20, Math.min(this.court.courtRight - 20, this.x));
      } else {
        this.x = Math.max(this.court.courtLeft + 20, Math.min(halfX - 20, this.x));
      }
    } else if (this.stats.position === 'outfield_bot') {
      // 하단 외야수
      this.y = Math.max(cBot + 5, Math.min(this.court.courtBottom - 5, this.y));
      if (isLeft) {
        this.x = Math.max(halfX + 20, Math.min(this.court.courtRight - 20, this.x));
      } else {
        this.x = Math.max(this.court.courtLeft + 20, Math.min(halfX - 20, this.x));
      }
    } else if (this.stats.position === 'outfield_back') {
      // 후방 외야수
      this.y = Math.max(cTop, Math.min(cBot, this.y));
      if (isLeft) {
        this.x = Math.max(this.court.courtRight - 35, Math.min(this.court.courtRight + 15, this.x));
      } else {
        this.x = Math.max(this.court.courtLeft - 15, Math.min(this.court.courtLeft + 35, this.x));
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, isControlled: boolean = false) {
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      // 무적 점멸
      ctx.save();
      ctx.globalAlpha = 0.5;
    }

    // 플레이어 스프라이트 렌더링
    Sprites.drawPlayer(
      ctx,
      this.x,
      this.y - this.z,
      this.animState,
      this.animFrame,
      this.facingLeft,
      this.palette,
      this.stats.isCaptain
    );

    // 1P/2P 컨트롤 인디케이터 (머리 위 역삼각형)
    if (isControlled && !this.isDead) {
      ctx.save();
      const bob = Math.sin(performance.now() * 0.008) * 3;
      ctx.fillStyle = (this.team === 'left') ? '#00e5ff' : '#ff1744';
      ctx.beginPath();
      ctx.moveTo(this.x - 6, this.y - this.z - 48 + bob);
      ctx.lineTo(this.x + 6, this.y - this.z - 48 + bob);
      ctx.lineTo(this.x, this.y - this.z - 38 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 이름 및 HP 바 (미니)
    if (!this.isDead && this.stats.position.startsWith('infield')) {
      const barW = 28;
      const barH = 4;
      const barX = this.x - barW / 2;
      const barY = this.y - this.z + 18;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const hpRatio = Math.max(0, this.hp / this.stats.maxHp);
      ctx.fillStyle = hpRatio > 0.5 ? '#00e676' : hpRatio > 0.25 ? '#ffeb3b' : '#ff1744';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
    }

    if (this.invincibleTimer > 0) {
      ctx.restore();
    }
  }
}
