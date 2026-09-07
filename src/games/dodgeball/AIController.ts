// 열혈 피구 스마트 AI: 패스 연계, 대시 마구 발동, 타이밍 캐치 및 회피

import { Player } from './Player';
import { Ball } from './Ball';

export class AIController {
  private team: 'left' | 'right';
  private difficulty: 'easy' | 'normal' | 'hard';
  private thinkTimer: number = 0;
  private actionCooldown: number = 0;

  constructor(team: 'left' | 'right', difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
    this.team = team;
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: 'easy' | 'normal' | 'hard') {
    this.difficulty = diff;
  }

  public update(myPlayers: Player[], enemyPlayers: Player[], ball: Ball) {
    this.thinkTimer++;

    const activeMyPlayers = myPlayers.filter(p => !p.isDead);
    const activeEnemies = enemyPlayers.filter(p => !p.isDead && p.stats.position.startsWith('infield'));

    if (activeEnemies.length === 0) return;

    // 1. 공을 아군이 쥐고 있을 때 (공격 전략)
    const ballCarrier = activeMyPlayers.find(p => p.hasBall);

    if (ballCarrier) {
      this.handleAttack(ballCarrier, activeMyPlayers, activeEnemies, ball);
      return;
    }

    // 2. 공이 공격구(적이 던진 공)로 날아오고 있을 때 (수비 전략)
    if ((ball.state === 'THROWN' || ball.state === 'SUPER') && ball.throwerTeam !== this.team) {
      this.handleDefense(activeMyPlayers, ball);
      return;
    }

    // 3. 루즈볼 상태일 때 (공 줍기 전력 질주)
    if (ball.state === 'LOOSE' || ball.state === 'BOUNCING') {
      this.handleLooseBall(activeMyPlayers, ball);
      return;
    }

    // 4. 일반 평시 포지셔닝
    this.handleIdlePositioning(activeMyPlayers);
  }

  // 공격 처리: 대시 마구 또는 전술 패스
  private handleAttack(carrier: Player, teammates: Player[], enemies: Player[], ball: Ball) {
    this.actionCooldown++;

    // 가장 체력이 낮은 적 내야수 타깃 선정
    const targetEnemy = enemies.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev), enemies[0]);
    if (!targetEnemy) return;

    const isCarrierInfield = carrier.stats.position.startsWith('infield');

    if (isCarrierInfield) {
      // 내야수가 공을 쥐었을 때:
      // 전진 대시 후 마구 발사!
      const targetDirX = (this.team === 'left') ? 1 : -1;
      carrier.move(targetDirX, 0, true);

      // 30~50프레임 대시 후 마구 슛!
      if (this.actionCooldown > 35) {
        // 난이도별 마구 확률
        const superChance = this.difficulty === 'hard' ? 0.9 : this.difficulty === 'normal' ? 0.65 : 0.4;
        const willSuper = Math.random() < superChance;

        if (willSuper && Math.random() < 0.4) {
          // 공중 점프 마구 구사
          carrier.jump();
          setTimeout(() => {
            carrier.throwBall(ball, targetEnemy.x, targetEnemy.y, true);
          }, 200);
        } else {
          // 지상 마구 또는 강속구
          carrier.throwBall(ball, targetEnemy.x, targetEnemy.y, willSuper);
        }
        this.actionCooldown = 0;
      }
    } else {
      // 외야수가 공을 쥐었을 때:
      // 50% 확률로 내야수에게 삼각 패스, 50% 확률로 적 등 뒤에서 기습 슛!
      if (this.actionCooldown > 25) {
        const myInfielders = teammates.filter(p => p.stats.position.startsWith('infield'));
        if (myInfielders.length > 0 && Math.random() < 0.5) {
          // 내야수에게 패스 연결!
          const passTarget = myInfielders[Math.floor(Math.random() * myInfielders.length)];
          carrier.passBall(ball, passTarget.x, passTarget.y);
        } else {
          // 등 뒤 기습 슛!
          carrier.throwBall(ball, targetEnemy.x, targetEnemy.y, Math.random() < 0.5);
        }
        this.actionCooldown = 0;
      }
    }
  }

  // 수비 처리: 날아오는 공 캐치 또는 회피
  private handleDefense(myPlayers: Player[], ball: Ball) {
    const infielders = myPlayers.filter(p => p.stats.position.startsWith('infield'));

    for (const player of infielders) {
      const dist = Math.hypot(player.x - ball.x, player.y - ball.y);

      // 공이 근접(80px 이내)했을 때
      if (dist < 75) {
        // 캐치 타이밍 시도
        const catchTimingThreshold = this.difficulty === 'hard' ? 45 : this.difficulty === 'normal' ? 35 : 25;
        if (dist < catchTimingThreshold) {
          player.tryCatch(ball);
        } else {
          // 회피 시도 (공의 y축과 반대로 이동)
          const avoidDirY = (player.y > ball.y) ? 1 : -1;
          player.move(0, avoidDirY, false);
        }
      }
    }
  }

  // 루즈볼 주우러 이동
  private handleLooseBall(myPlayers: Player[], ball: Ball) {
    // 공이 있는 영역에 따라 내야수 또는 외야수가 볼을 회수
    const infielders = myPlayers.filter(p => p.stats.position.startsWith('infield'));
    const isBallOnMySide = (this.team === 'left') ? ball.x < 400 : ball.x > 400;

    if (isBallOnMySide && infielders.length > 0) {
      // 공에 가장 가까운 내야수가 공을 향해 대시
      const closest = infielders.reduce((prev, curr) => {
        const dPrev = Math.hypot(prev.x - ball.x, prev.y - ball.y);
        const dCurr = Math.hypot(curr.x - ball.x, curr.y - ball.y);
        return dCurr < dPrev ? curr : prev;
      });

      const dx = ball.x - closest.x;
      const dy = ball.y - closest.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 28) {
        closest.tryCatch(ball);
      } else {
        closest.move(Math.sign(dx), Math.sign(dy), true);
      }
    } else {
      // 상대 코트에 있는 경우 외야수가 회수 시도
      const outfields = myPlayers.filter(p => !p.stats.position.startsWith('infield'));
      if (outfields.length > 0) {
        const closestOut = outfields.reduce((prev, curr) => {
          const dPrev = Math.hypot(prev.x - ball.x, prev.y - ball.y);
          const dCurr = Math.hypot(curr.x - ball.x, curr.y - ball.y);
          return dCurr < dPrev ? curr : prev;
        });

        const dx = ball.x - closestOut.x;
        const dy = ball.y - closestOut.y;
        if (Math.hypot(dx, dy) < 32) {
          closestOut.tryCatch(ball);
        } else {
          closestOut.move(Math.sign(dx), Math.sign(dy), false);
        }
      }
    }
  }

  // 평상시 기본 위치 유지 및 미세 움직임
  private handleIdlePositioning(myPlayers: Player[]) {
    if (this.thinkTimer % 30 !== 0) return;

    for (const player of myPlayers) {
      if (player.hasBall) continue;
      // 살짝 전후좌우로 흔들리며 긴장감 유지
      if (Math.random() < 0.4) {
        const rdx = (Math.random() - 0.5) * 0.8;
        const rdy = (Math.random() - 0.5) * 0.8;
        player.move(rdx, rdy, false);
      }
    }
  }
}
