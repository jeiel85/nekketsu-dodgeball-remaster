// 타이틀, 모드 선택, 팀 선택, 마구 연구소 메뉴 시스템

import { input } from '../engine/InputManager';
import { sound } from '../engine/SoundEngine';
import { TEAMS_DATA } from '../games/dodgeball/Teams';
import { SUPER_SHOTS } from '../games/dodgeball/SuperShots';

export type ScreenState = 'TITLE' | 'TEAM_SELECT' | 'DODGEBALL' | 'SOCCER' | 'SHOT_LAB' | 'HELP';

export class MenuSystem {
  public screen: ScreenState = 'TITLE';
  public titleIndex: number = 0;
  public titleItems: string[] = [
    '월드 토너먼트 (WORLD TOURNAMENT)',
    '2P 로컬 대전 (2P LOCAL BATTLE)',
    '열혈 축구 특별전 (NEKKETSU SOCCER)',
    '전설의 마구 연구소 (SUPER SHOT LAB)',
    '조작법 & 가이드 (HOW TO PLAY)'
  ];

  // 2P 팀 선택 상태
  public teamSelect1P: number = 0;
  public teamSelect2P: number = 1;
  public stageSelect: number = 0;
  public teamList: string[] = Object.keys(TEAMS_DATA);
  public stageList: string[] = ['japan', 'england', 'india', 'iceland', 'china', 'kenya', 'usa', 'shadow'];

  // 마구 연구소 선택 상태
  public shotLabIndex: number = 0;
  public shotKeys: string[] = Object.keys(SUPER_SHOTS);

  private animTimer: number = 0;

  constructor() {}

  public update(onStartGame: (mode: 'tournament' | 'versus' | 'soccer', p1Team?: string, p2Team?: string, stage?: string) => void) {
    this.animTimer += 0.05;

    if (this.screen === 'TITLE') {
      if (input.isActionJustPressed('UP', 0)) {
        this.titleIndex = (this.titleIndex - 1 + this.titleItems.length) % this.titleItems.length;
        sound.playSelect();
      }
      if (input.isActionJustPressed('DOWN', 0)) {
        this.titleIndex = (this.titleIndex + 1) % this.titleItems.length;
        sound.playSelect();
      }
      if (input.isActionJustPressed('SHOT', 0) || input.isActionJustPressed('DASH', 0) || input.isActionJustPressed('PASS', 0)) {
        sound.playSelect();
        if (this.titleIndex === 0) {
          onStartGame('tournament');
        } else if (this.titleIndex === 1) {
          this.screen = 'TEAM_SELECT';
        } else if (this.titleIndex === 2) {
          onStartGame('soccer');
        } else if (this.titleIndex === 3) {
          this.screen = 'SHOT_LAB';
        } else if (this.titleIndex === 4) {
          this.screen = 'HELP';
        }
      }
    } else if (this.screen === 'TEAM_SELECT') {
      // 1P 팀 변경
      if (input.isActionJustPressed('LEFT', 0)) {
        this.teamSelect1P = (this.teamSelect1P - 1 + this.teamList.length) % this.teamList.length;
        sound.playSelect();
      }
      if (input.isActionJustPressed('RIGHT', 0)) {
        this.teamSelect1P = (this.teamSelect1P + 1) % this.teamList.length;
        sound.playSelect();
      }
      // 2P 팀 변경
      if (input.isActionJustPressed('LEFT', 1)) {
        this.teamSelect2P = (this.teamSelect2P - 1 + this.teamList.length) % this.teamList.length;
        sound.playSelect();
      }
      if (input.isActionJustPressed('RIGHT', 1)) {
        this.teamSelect2P = (this.teamSelect2P + 1) % this.teamList.length;
        sound.playSelect();
      }
      // 스테이지 변경
      if (input.isActionJustPressed('UP', 0) || input.isActionJustPressed('UP', 1)) {
        this.stageSelect = (this.stageSelect - 1 + this.stageList.length) % this.stageList.length;
        sound.playSelect();
      }
      if (input.isActionJustPressed('DOWN', 0) || input.isActionJustPressed('DOWN', 1)) {
        this.stageSelect = (this.stageSelect + 1) % this.stageList.length;
        sound.playSelect();
      }
      // 시작
      if (input.isActionJustPressed('SHOT', 0) || input.isActionJustPressed('DASH', 0)) {
        sound.playSelect();
        onStartGame('versus', this.teamList[this.teamSelect1P], this.teamList[this.teamSelect2P], this.stageList[this.stageSelect]);
      }
      if (input.isActionJustPressed('PASS', 0)) {
        this.screen = 'TITLE';
      }
    } else if (this.screen === 'SHOT_LAB') {
      if (input.isActionJustPressed('UP', 0)) {
        this.shotLabIndex = (this.shotLabIndex - 1 + this.shotKeys.length) % this.shotKeys.length;
        sound.playSelect();
      }
      if (input.isActionJustPressed('DOWN', 0)) {
        this.shotLabIndex = (this.shotLabIndex + 1) % this.shotKeys.length;
        sound.playSelect();
      }
      if (input.isActionJustPressed('SHOT', 0)) {
        sound.playSuperShot();
      }
      if (input.isActionJustPressed('PASS', 0)) {
        this.screen = 'TITLE';
      }
    } else if (this.screen === 'HELP') {
      if (input.isActionJustPressed('PASS', 0) || input.isActionJustPressed('SHOT', 0) || input.isActionJustPressed('DASH', 0)) {
        this.screen = 'TITLE';
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.screen === 'TITLE') {
      this.drawTitle(ctx);
    } else if (this.screen === 'TEAM_SELECT') {
      this.drawTeamSelect(ctx);
    } else if (this.screen === 'SHOT_LAB') {
      this.drawShotLab(ctx);
    } else if (this.screen === 'HELP') {
      this.drawHelp(ctx);
    }
  }

  private drawTitle(ctx: CanvasRenderingContext2D) {
    // 배경 (다크 네온 펄스)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 480);
    bgGrad.addColorStop(0, '#0a0a1a');
    bgGrad.addColorStop(1, '#1b1b3a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 480);

    // 열혈 로고 그래픽
    ctx.save();
    const pulse = Math.sin(this.animTimer * 2) * 4;

    // "熱血高校" 붉은 붓글씨 감성
    ctx.font = '900 32px monospace';
    ctx.fillStyle = '#ff1744';
    ctx.textAlign = 'center';
    ctx.fillText('★ 熱血高校 시리즈 웹 완벽 리마스터 ★', 400, 75);

    // 메인 타이틀: "열혈 돗지볼부 & 축구편"
    ctx.font = '900 52px monospace';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.strokeText('SUPER DODGE BALL', 400, 140 + pulse);
    ctx.fillStyle = '#ffeb3b';
    ctx.fillText('SUPER DODGE BALL', 400, 140 + pulse);

    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('& NEKKETSU SOCCER SPECIAL', 400, 175 + pulse);
    ctx.restore();

    // 메뉴 항목
    for (let i = 0; i < this.titleItems.length; i++) {
      const isSelected = (i === this.titleIndex);
      const y = 235 + i * 42;

      if (isSelected) {
        // 선택 하이라이트 박스
        ctx.fillStyle = 'rgba(255, 235, 59, 0.2)';
        ctx.fillRect(150, y - 24, 500, 34);

        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('▶ ', 200, y);
      }

      ctx.font = isSelected ? 'bold 20px monospace' : '18px monospace';
      ctx.fillStyle = isSelected ? '#ffffff' : '#90a4ae';
      ctx.textAlign = 'center';
      ctx.fillText(this.titleItems[i], 400, y);
    }

    // 하단 안내
    ctx.fillStyle = '#78909c';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('메뉴 이동: [▲ / ▼] 또는 [W / S]  |  결정: [K / SPACE / ENTER]', 400, 460);
  }

  private drawTeamSelect(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#121620';
    ctx.fillRect(0, 0, 800, 480);

    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#ffeb3b';
    ctx.textAlign = 'center';
    ctx.fillText('대전 팀 & 코트 선택 (TEAM SELECT)', 400, 60);

    const t1 = TEAMS_DATA[this.teamList[this.teamSelect1P]];
    const t2 = TEAMS_DATA[this.teamList[this.teamSelect2P]];

    // 1P 선택 박스
    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.fillRect(60, 100, 300, 240);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 100, 300, 240);

    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('1P HOME TEAM', 210, 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(t1.name, 210, 190);
    ctx.font = '15px monospace';
    ctx.fillStyle = '#b0bec5';
    ctx.fillText(`캡틴: ${t1.palette.captainName}`, 210, 230);
    ctx.fillText(`마구: ${t1.palette.captainShot}`, 210, 260);
    ctx.fillText('[A / D] 키로 변경', 210, 310);

    // 2P 선택 박스
    ctx.fillStyle = 'rgba(255, 23, 68, 0.15)';
    ctx.fillRect(440, 100, 300, 240);
    ctx.strokeStyle = '#ff1744';
    ctx.strokeRect(440, 100, 300, 240);

    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#ff1744';
    ctx.fillText('2P AWAY TEAM', 590, 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(t2.name, 590, 190);
    ctx.font = '15px monospace';
    ctx.fillStyle = '#b0bec5';
    ctx.fillText(`캡틴: ${t2.palette.captainName}`, 590, 230);
    ctx.fillText(`마구: ${t2.palette.captainShot}`, 590, 260);
    ctx.fillText('[◀ / ▶] 키로 변경', 590, 310);

    // 스테이지 선택
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#ffeb3b';
    ctx.fillText(`경기 코트: [▲ / ▼]  ${this.stageList[this.stageSelect].toUpperCase()}`, 400, 385);

    ctx.font = '15px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('결정: [K / SPACE]  |  뒤로: [J / ESC]', 400, 445);
  }

  private drawShotLab(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 480);

    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#ffeb3b';
    ctx.textAlign = 'center';
    ctx.fillText('★ 전설의 마구 연구소 (SUPER SHOT LAB) ★', 400, 55);

    // 좌측 마구 리스트
    for (let i = 0; i < this.shotKeys.length; i++) {
      const key = this.shotKeys[i];
      const shot = SUPER_SHOTS[key];
      const isSel = (i === this.shotLabIndex);
      const y = 100 + i * 38;

      ctx.fillStyle = isSel ? '#00e5ff' : '#64748b';
      ctx.font = isSel ? 'bold 18px monospace' : '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${isSel ? '▶ ' : '   '}${shot.name} (${shot.nameEn})`, 60, y);
    }

    // 우측 상세 정보 박스
    const curShot = SUPER_SHOTS[this.shotKeys[this.shotLabIndex]];
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(440, 90, 310, 310);
    ctx.strokeStyle = curShot.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(440, 90, 310, 310);

    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = curShot.color;
    ctx.textAlign = 'center';
    ctx.fillText(curShot.name, 595, 135);

    ctx.font = '15px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`영문: ${curShot.nameEn}`, 595, 175);
    ctx.fillText(`투구 속도: ${curShot.speed} MACH`, 595, 210);
    ctx.fillText(`타격 파괴력: ${curShot.damage} DMG`, 595, 245);

    ctx.fillStyle = '#ffeb3b';
    ctx.fillText('[K] 키를 눌러 사운드 시연', 595, 330);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('뒤로가기: [J / ESC]', 400, 450);
  }

  private drawHelp(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 800, 480);

    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#ffeb3b';
    ctx.textAlign = 'center';
    ctx.fillText('열혈 비기 & 조작 가이드', 400, 50);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';

    const lines = [
      '1. 기본 조작:',
      '   - 이동: [방향키 ▲▼◀▶] 또는 [W, A, S, D] (연속 2번 탭하면 대시 질주!)',
      '   - 슛 / 공격: [K] 키 (또는 X, Z)',
      '   - 패스 / 캐치: [J] 키 (또는 C, Enter)',
      '   - 점프: [SHIFT] 키 (또는 V, J+K 동시 누름)',
      '   - 대시 전력질주: [SPACE] 키',
      '   - 수비 시 선수전환: [TAB] 또는 [Q] 키 (원하는 내야수 선택)',
      '',
      '2. 전설의 마구 (슈퍼 샷) 발동 비기:',
      '   - 【지상 마구】: [SPACE] 대시 질주 중 2~3번째 걸음 타이밍에 [K] 슛!',
      '   - 【공중 점프 마구】: 대시 점프 후 정점(최고점) 타이밍에 [K] 슛!',
      '   - 캐릭터마다 궤적과 능력이 완전히 다른 8종의 마구가 발동합니다.',
      '',
      '3. 수비 & 외야수 협공:',
      '   - 상대 공이 날아올 때 타이밍 맞춰 [J]를 누르면 공을 낚아챕니다.',
      '   - 외야수에게 패스하여 상대방 뒤통수를 노리는 등짝 슛을 날려보세요!',
      '   - 체력이 0이 되면 천사가 되어 하늘로 승천합니다.'
    ];

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 80, 95 + i * 24);
    }

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ff1744';
    ctx.textAlign = 'center';
    ctx.fillText('아무 키나 누르면 타이틀로 돌아갑니다', 400, 455);
  }
}
