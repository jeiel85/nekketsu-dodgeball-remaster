// 열혈 피구 메인 게임 루프, 경기 진행, 심판 룰, 연쇄 도미노 충돌 시스템

import { Court } from './Court';
import { Ball } from './Ball';
import { Player } from './Player';
import { TEAMS_DATA, TeamData } from './Teams';
import { AIController } from './AIController';
import { input } from '../../engine/InputManager';
import { sound } from '../../engine/SoundEngine';

export type GameMode = 'tournament' | 'versus' | 'practice';

export interface SuperShotCutin {
  active: boolean;
  playerName: string;
  shotName: string;
  timer: number;
}

export class DodgeballGame {
  public court: Court;
  public ball: Ball;
  public teamLeft: TeamData;
  public teamRight: TeamData;

  public playersLeft: Player[] = [];
  public playersRight: Player[] = [];

  public controlledLeftIndex: number = 0;
  public controlledRightIndex: number = 0;

  public aiLeft: AIController | null = null;
  public aiRight: AIController | null = null;

  public mode: GameMode = 'tournament';
  public currentStageIndex: number = 0;
  public stageOrder: string[] = ['japan', 'england', 'india', 'iceland', 'china', 'kenya', 'usa', 'shadow'];

  // 경기 상태
  public matchState: 'READY' | 'PLAYING' | 'MATCH_OVER';
  public stateTimer: number = 0;
  public winner: 'left' | 'right' | null = null;

  // 마구 컷인 배너 & 화면 쉐이크
  public cutin: SuperShotCutin = { active: false, playerName: '', shotName: '', timer: 0 };
  public screenShake: number = 0;
  public hitStopTimer: number = 0;

  constructor() {
    this.court = new Court('japan');
    this.ball = new Ball();
    this.teamLeft = TEAMS_DATA.japan_nekketsu;
    this.teamRight = TEAMS_DATA.japan_hanazono;
    this.matchState = 'READY';
  }

  public startTournament(startStageIndex: number = 0, difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
    this.mode = 'tournament';
    this.currentStageIndex = startStageIndex;
    const stageKey = this.stageOrder[this.currentStageIndex];

    this.teamLeft = TEAMS_DATA.japan_nekketsu;
    this.setupOpponentByStage(stageKey);

    this.aiLeft = null; // 1P가 직접 조작
    this.aiRight = new AIController('right', difficulty);

    this.initMatch(stageKey);
  }

  public startVersus(leftTeamKey: string, rightTeamKey: string, stageKey: string) {
    this.mode = 'versus';
    this.teamLeft = TEAMS_DATA[leftTeamKey] || TEAMS_DATA.japan_nekketsu;
    this.teamRight = TEAMS_DATA[rightTeamKey] || TEAMS_DATA.japan_hanazono;

    this.aiLeft = null;
    this.aiRight = null; // 2P 플레이어 조작

    this.initMatch(stageKey);
  }

  public startPractice() {
    this.mode = 'practice';
    this.teamLeft = TEAMS_DATA.japan_nekketsu;
    this.teamRight = TEAMS_DATA.usa;

    this.aiLeft = null;
    this.aiRight = new AIController('right', 'easy');

    this.initMatch('japan');
  }

  private setupOpponentByStage(stageKey: string) {
    switch (stageKey) {
      case 'japan': this.teamRight = TEAMS_DATA.japan_hanazono; break;
      case 'england': this.teamRight = TEAMS_DATA.england; break;
      case 'india': this.teamRight = TEAMS_DATA.india; break;
      case 'iceland': this.teamRight = TEAMS_DATA.iceland; break;
      case 'china': this.teamRight = TEAMS_DATA.china; break;
      case 'kenya': this.teamRight = TEAMS_DATA.kenya; break;
      case 'usa': this.teamRight = TEAMS_DATA.usa; break;
      case 'shadow': this.teamRight = TEAMS_DATA.shadow; break;
      default: this.teamRight = TEAMS_DATA.japan_hanazono;
    }
  }

  public initMatch(stageKey: string) {
    this.court.setStage(stageKey);
    this.ball.reset(400, 280);

    // 선수 초기화
    this.playersLeft = this.teamLeft.players.map(p => new Player(p, 'left', this.teamLeft.palette, this.court));
    this.playersRight = this.teamRight.players.map(p => new Player(p, 'right', this.teamRight.palette, this.court));

    this.controlledLeftIndex = 0;
    this.controlledRightIndex = 0;

    this.matchState = 'READY';
    this.stateTimer = 120; // 2초간 READY 연출
    this.winner = null;

    sound.playBgm(stageKey === 'shadow' ? 'final' : stageKey === 'japan' ? 'match' : 'world');
    sound.playWhistle();
  }

  public update() {
    if (this.hitStopTimer > 0) {
      this.hitStopTimer--;
      return;
    }

    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    if (this.cutin.active) {
      this.cutin.timer--;
      if (this.cutin.timer <= 0) {
        this.cutin.active = false;
      }
    }

    this.court.update();

    // 1. 경기 시작 연출 대기
    if (this.matchState === 'READY') {
      this.stateTimer--;
      if (this.stateTimer <= 0) {
        this.matchState = 'PLAYING';
      }
      return;
    }

    // 2. 경기 승패 확인
    if (this.matchState === 'PLAYING') {
      const leftInfieldAlive = this.playersLeft.filter(p => p.stats.position.startsWith('infield') && !p.isDead).length;
      const rightInfieldAlive = this.playersRight.filter(p => p.stats.position.startsWith('infield') && !p.isDead).length;

      if (leftInfieldAlive === 0) {
        this.endMatch('right');
        return;
      } else if (rightInfieldAlive === 0) {
        this.endMatch('left');
        return;
      }
    }

    if (this.matchState === 'MATCH_OVER') {
      this.stateTimer++;
      // 경기 종료 후 대기
      return;
    }

    // 3. 1P 플레이어 입력 처리
    this.handlePlayerInput(0, this.playersLeft, 'left');

    // 4. 2P 플레이어 또는 우측 AI 입력 처리
    if (this.aiRight) {
      this.aiRight.update(this.playersRight, this.playersLeft, this.ball);
    } else {
      this.handlePlayerInput(1, this.playersRight, 'right');
    }

    // 5. 좌측 AI (AI vs AI 또는 특수 모드 시)
    if (this.aiLeft) {
      this.aiLeft.update(this.playersLeft, this.playersRight, this.ball);
    }

    // 6. 모든 선수 업데이트
    for (const p of this.playersLeft) p.update(this.ball);
    for (const p of this.playersRight) p.update(this.ball);

    // 7. 공 업데이트
    this.ball.update(0.45, this.court.stage.ballBounce);

    // 8. 볼 충돌 & 피격 판정
    this.checkBallCollisions();

    // 9. 선수 간 연쇄 넉다운(도미노 효과) 판정
    this.checkDominoKnockdowns();
  }

  // 플레이어 입력 제어
  private handlePlayerInput(playerNum: number, teamPlayers: Player[], teamSide: 'left' | 'right') {
    const activeInfielders = teamPlayers.filter(p => p.stats.position.startsWith('infield') && !p.isDead);
    if (activeInfielders.length === 0) return;

    // 공을 가진 선수가 있으면 그 선수로 자동 제어 전환
    const ballHolder = teamPlayers.find(p => p.hasBall && !p.isDead);
    let controlled: Player;

    if (ballHolder) {
      controlled = ballHolder;
    } else {
      // 공에 가장 가까운 내야수를 제어
      controlled = activeInfielders.reduce((prev, curr) => {
        const dPrev = Math.hypot(prev.x - this.ball.x, prev.y - this.ball.y);
        const dCurr = Math.hypot(curr.x - this.ball.x, curr.y - this.ball.y);
        return dCurr < dPrev ? curr : prev;
      });
    }

    if (teamSide === 'left') {
      this.controlledLeftIndex = teamPlayers.indexOf(controlled);
    } else {
      this.controlledRightIndex = teamPlayers.indexOf(controlled);
    }

    // 방향 이동
    let dx = 0;
    let dy = 0;
    if (input.isActionPressed('LEFT', playerNum)) dx -= 1;
    if (input.isActionPressed('RIGHT', playerNum)) dx += 1;
    if (input.isActionPressed('UP', playerNum)) dy -= 1;
    if (input.isActionPressed('DOWN', playerNum)) dy += 1;

    const dashReq = input.isActionPressed('DASH', playerNum);
    controlled.move(dx, dy, dashReq);

    // 점프
    if (input.isActionJustPressed('JUMP', playerNum)) {
      controlled.jump();
    }

    // 슛 (공격)
    if (input.isActionJustPressed('SHOT', playerNum)) {
      if (controlled.hasBall) {
        // 상대 진영의 가장 가까운 적을 조준
        const enemyTeam = (teamSide === 'left') ? this.playersRight : this.playersLeft;
        const targetEnemies = enemyTeam.filter(p => p.stats.position.startsWith('infield') && !p.isDead);
        const target = targetEnemies[0] || { x: teamSide === 'left' ? 600 : 200, y: 280 };

        const isSuper = (controlled.isDashing && controlled.dashSteps >= 3.0) || (controlled.isJumping && controlled.z > 15);
        if (isSuper) {
          this.triggerSuperShotCutin(controlled.stats.name, controlled.stats.superShotId);
          this.screenShake = 12;
        }

        controlled.throwBall(this.ball, target.x, target.y);
      }
    }

    // 패스 / 캐치 (수비)
    if (input.isActionJustPressed('PASS', playerNum)) {
      if (controlled.hasBall) {
        // 아군 외야수 또는 다른 내야수에게 패스
        const teammates = teamPlayers.filter(p => p !== controlled && !p.isDead);
        if (teammates.length > 0) {
          const passTarget = teammates[Math.floor(Math.random() * teammates.length)];
          controlled.passBall(this.ball, passTarget.x, passTarget.y);
        }
      } else {
        // 공 낚아채기 (캐치 시도)
        controlled.tryCatch(this.ball);
      }
    }
  }

  // 마구 발동 시 상단 컷인 배너 발동
  private triggerSuperShotCutin(playerName: string, shotId: string) {
    this.cutin = {
      active: true,
      playerName,
      shotName: shotId.toUpperCase() + ' SHOT!',
      timer: 45
    };
  }

  // 볼과 선수 충돌 판정
  private checkBallCollisions() {
    if (this.ball.state !== 'THROWN' && this.ball.state !== 'SUPER') {
      // 바닥에 있거나 패스 중일 때 선수와의 접촉 (자동 픽업)
      const allPlayers = [...this.playersLeft, ...this.playersRight].filter(p => !p.isDead && !p.hasBall);
      for (const p of allPlayers) {
        const dist = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
        if (dist < 28 && this.ball.z < 25) {
          p.tryCatch(this.ball);
          break;
        }
      }
      return;
    }

    // 공격 중인 공: 적 팀 선수와의 충돌 판정
    const enemyTeam = (this.ball.throwerTeam === 'left') ? this.playersRight : this.playersLeft;
    const activeEnemies = enemyTeam.filter(p => p.stats.position.startsWith('infield') && !p.isDead && p.invincibleTimer <= 0);

    for (const enemy of activeEnemies) {
      const dist = Math.hypot(enemy.x - this.ball.x, enemy.y - this.ball.y);
      const zDiff = Math.abs(enemy.z - this.ball.z);

      if (dist < 32 && zDiff < 30) {
        // 캐치 자세인 경우 캐치 성공 여부 재확인
        if (enemy.animState === 'CATCH') {
          const caught = enemy.tryCatch(this.ball);
          if (caught) return;
        }

        // 강타 적중!
        enemy.takeHit(this.ball);
        this.screenShake = this.ball.isSuperShot ? 16 : 8;
        this.hitStopTimer = this.ball.isSuperShot ? 4 : 2; // 강렬한 손맛 히트스톱

        // 마구가 관통형(compress)이 아닌 경우 바운스 상태로 전환
        if (!this.ball.isSuperShot || this.ball.superShotDef?.id !== 'compress') {
          this.ball.state = 'BOUNCING';
          this.ball.vx = (this.ball.throwerTeam === 'left' ? 1 : -1) * 3;
          this.ball.vy = (Math.random() - 0.5) * 4;
          this.ball.vz = 5;
          this.ball.isSuperShot = false;
          break;
        }
      }
    }
  }

  // 볼링핀 연쇄 도미노 충돌 (피격되어 날아가는 선수가 아군/적군과 부딪히면 함께 쓰러짐!)
  private checkDominoKnockdowns() {
    const spinningPlayers = [...this.playersLeft, ...this.playersRight].filter(p => p.animState === 'SPIN');

    for (const spinner of spinningPlayers) {
      const otherPlayers = [...this.playersLeft, ...this.playersRight].filter(p => p !== spinner && !p.isDead && p.animState !== 'SPIN' && p.animState !== 'DOWN');

      for (const target of otherPlayers) {
        const dist = Math.hypot(spinner.x - target.x, spinner.y - target.y);
        if (dist < 35) {
          // 함께 넘어짐 (도미노 넉다운)
          target.animState = 'DOWN';
          target.stateTimer = 40;
          target.vx = spinner.vx * 0.7;
          target.hp = Math.max(0, target.hp - 15);
          sound.playHit(false);
          this.screenShake = 6;
        }
      }
    }
  }

  private endMatch(winningTeam: 'left' | 'right') {
    this.matchState = 'MATCH_OVER';
    this.stateTimer = 0;
    this.winner = winningTeam;
    sound.playWhistle();
    sound.playFanfare();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 화면 쉐이크 연출
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake * 1.5;
      const shakeY = (Math.random() - 0.5) * this.screenShake * 1.5;
      ctx.translate(shakeX, shakeY);
    }

    // 1. 코트 배경 및 바닥
    this.court.draw(ctx);

    // 2. 선수들 및 공 Y-소팅 렌더링 (원근감에 따라 아래쪽 개체가 앞쪽에 오도록 정렬)
    const renderList: Array<{ type: 'player' | 'ball'; y: number; obj: Player | Ball; isControlled?: boolean }> = [];

    for (let i = 0; i < this.playersLeft.length; i++) {
      const p = this.playersLeft[i];
      renderList.push({ type: 'player', y: p.y, obj: p, isControlled: (i === this.controlledLeftIndex) });
    }
    for (let i = 0; i < this.playersRight.length; i++) {
      const p = this.playersRight[i];
      renderList.push({ type: 'player', y: p.y, obj: p, isControlled: (i === this.controlledRightIndex) });
    }
    renderList.push({ type: 'ball', y: this.ball.y, obj: this.ball });

    renderList.sort((a, b) => a.y - b.y);

    for (const item of renderList) {
      if (item.type === 'player') {
        const p = item.obj as Player;
        p.draw(ctx, item.isControlled);
      } else {
        const b = item.obj as Ball;
        b.draw(ctx, this.teamLeft.palette.ballColor1, this.teamLeft.palette.ballColor2);
      }
    }

    // 3. 상단 마구 컷인 배너
    if (this.cutin.active) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 80, 800, 50);
      ctx.fillStyle = '#ffeb3b';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${this.cutin.playerName}: ${this.cutin.shotName} ★`, 400, 114);
      ctx.restore();
    }

    // 4. READY 및 승리/패배 텍스트 연출
    if (this.matchState === 'READY') {
      ctx.save();
      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeText('READY...', 400, 260);
      ctx.fillText('READY...', 400, 260);
      ctx.restore();
    } else if (this.matchState === 'MATCH_OVER') {
      ctx.save();
      ctx.font = 'bold 44px monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;

      const isLeftWin = (this.winner === 'left');
      const winText = isLeftWin ? `${this.teamLeft.name} 승리!!` : `${this.teamRight.name} 승리!!`;
      ctx.fillStyle = isLeftWin ? '#00e5ff' : '#ff1744';
      ctx.strokeText(winText, 400, 240);
      ctx.fillText(winText, 400, 240);

      ctx.font = '20px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PRESS [SPACE] TO CONTINUE', 400, 290);
      ctx.restore();
    }

    ctx.restore();
  }
}
