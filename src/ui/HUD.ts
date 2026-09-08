// 경기 진행 중 HUD: 팀 체력 게이지, 캐릭터 프로필, 인원수 및 조작 가이드

import { DodgeballGame } from '../games/dodgeball/DodgeballGame';

export class HUD {
  public static draw(ctx: CanvasRenderingContext2D, game: DodgeballGame) {
    ctx.save();

    // 상단 블랙 반투명 배너
    ctx.fillStyle = 'rgba(10, 15, 25, 0.88)';
    ctx.fillRect(0, 0, 800, 70);

    // 하단 구분선
    ctx.strokeStyle = '#fbc02d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 70);
    ctx.lineTo(800, 70);
    ctx.stroke();

    // --- 좌측 팀 (Home) ---
    const leftCapt = game.playersLeft[0];
    const leftInfieldCount = game.playersLeft.filter(p => p.stats.position.startsWith('infield') && !p.isDead).length;

    // 팀 이름
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'left';
    ctx.fillText(game.teamLeft.name, 15, 22);

    // 캡틴 HP 바
    this.drawHpBar(ctx, 15, 30, 220, 16, leftCapt.hp, leftCapt.stats.maxHp, leftCapt.stats.name);

    // 생존 인원 아이콘 (도트 인형 3개)
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = (i < leftInfieldCount) ? '#00e5ff' : '#455a64';
      ctx.fillRect(15 + i * 18, 52, 12, 12);
    }

    // --- 중앙: 스테이지 명칭 ---
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ffeb3b';
    ctx.textAlign = 'center';
    ctx.fillText(`★ ${game.court.stage.name} ★`, 400, 28);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#b0bec5';
    ctx.fillText(game.court.stage.location, 400, 48);

    // --- 우측 팀 (Away) ---
    const rightCapt = game.playersRight[0];
    const rightInfieldCount = game.playersRight.filter(p => p.stats.position.startsWith('infield') && !p.isDead).length;

    // 팀 이름
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#ff5252';
    ctx.textAlign = 'right';
    ctx.fillText(game.teamRight.name, 785, 22);

    // 캡틴 HP 바
    this.drawHpBar(ctx, 565, 30, 220, 16, rightCapt.hp, rightCapt.stats.maxHp, rightCapt.stats.name, true);

    // 생존 인원 아이콘
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = (i < rightInfieldCount) ? '#ff5252' : '#455a64';
      ctx.fillRect(785 - 12 - i * 18, 52, 12, 12);
    }

    // --- 하단 조작 가이드 안내바 ---
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 452, 800, 28);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('1P: [방향키 / WASD] 이동 | [K] 슛/마구 | [J] 패스/캐치 | [SPACE] 대시 | [SHIFT] 점프 | [TAB] 선수전환', 400, 470);

    ctx.restore();
  }

  private static drawHpBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    hp: number,
    maxHp: number,
    name: string,
    alignRight: boolean = false
  ) {
    // 배경
    ctx.fillStyle = '#212121';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // 게이지 채우기
    const ratio = Math.max(0, hp / maxHp);
    const fillW = w * ratio;
    const fillColor = ratio > 0.5 ? '#00e676' : ratio > 0.25 ? '#ffeb3b' : '#ff1744';

    ctx.fillStyle = fillColor;
    if (alignRight) {
      ctx.fillRect(x + w - fillW, y, fillW, h);
    } else {
      ctx.fillRect(x, y, fillW, h);
    }

    // 텍스트 (이름 & 수치)
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = alignRight ? 'right' : 'left';
    const textX = alignRight ? x + w - 6 : x + 6;
    ctx.fillText(`${name} HP: ${Math.round(hp)}/${maxHp}`, textX, y + h - 3);
  }
}
