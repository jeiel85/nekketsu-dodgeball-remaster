// 열혈 피구 & 축구 시리즈 웹 리마스터 메인 엔트리포인트

import { CanvasRenderer } from './engine/CanvasRenderer';
import { input } from './engine/InputManager';
import { sound } from './engine/SoundEngine';
import { MenuSystem } from './ui/MenuSystem';
import { HUD } from './ui/HUD';
import { DodgeballGame } from './games/dodgeball/DodgeballGame';
import { SoccerGame } from './games/soccer/SoccerGame';
import { virtualPad } from './ui/VirtualPad';

class App {
  private renderer: CanvasRenderer;
  private menu: MenuSystem;
  private dodgeballGame: DodgeballGame | null = null;
  private soccerGame: SoccerGame | null = null;

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas not found');

    this.renderer = new CanvasRenderer(canvas);
    this.menu = new MenuSystem();

    this.setupUIControls();
    virtualPad.init();

    // 첫 인터랙션 시 사운드 엔진 활성화 & 타이틀 BGM 시작
    const startAudio = () => {
      sound.init();
      sound.playBgm('title');
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('keydown', startAudio);
    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);

    // 메인 루프 시작
    requestAnimationFrame((t) => this.loop(t));
  }

  private setupUIControls() {
    // 사운드 토글
    document.getElementById('btn-mute')?.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      const btn = document.getElementById('btn-mute');
      if (btn) btn.innerText = isMuted ? '🔇 소리 켬' : '🔊 음소거';
    });

    // CRT 필터 토글
    document.getElementById('btn-crt')?.addEventListener('click', () => {
      const crt = this.renderer.toggleCRT();
      const btn = document.getElementById('btn-crt');
      if (btn) btn.innerText = crt ? '📺 CRT: ON' : '📺 CRT: OFF';
    });

    // 가상패드 토글
    document.getElementById('btn-pad')?.addEventListener('click', () => {
      virtualPad.toggle();
    });

    // 전체화면 토글
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      this.renderer.toggleFullscreen();
    });

    // 홈 (타이틀로 이동)
    document.getElementById('btn-home')?.addEventListener('click', () => {
      this.returnToTitle();
    });
  }

  private returnToTitle() {
    this.menu.screen = 'TITLE';
    this.dodgeballGame = null;
    this.soccerGame = null;
    sound.playBgm('title');
  }

  private startGame(mode: 'tournament' | 'versus' | 'soccer', p1Team?: string, p2Team?: string, stage?: string) {
    if (mode === 'tournament') {
      this.dodgeballGame = new DodgeballGame();
      this.dodgeballGame.startTournament(0);
      this.menu.screen = 'DODGEBALL';
    } else if (mode === 'versus') {
      this.dodgeballGame = new DodgeballGame();
      this.dodgeballGame.startVersus(p1Team || 'japan_nekketsu', p2Team || 'japan_hanazono', stage || 'japan');
      this.menu.screen = 'DODGEBALL';
    } else if (mode === 'soccer') {
      this.soccerGame = new SoccerGame();
      this.menu.screen = 'SOCCER';
    }
  }

  private loop(_time: number) {
    // 1. 화면 클리어
    this.renderer.clear();
    const ctx = this.renderer.ctx;

    // 2. 화면 상태별 업데이트 및 렌더링
    if (this.menu.screen === 'DODGEBALL' && this.dodgeballGame) {
      this.dodgeballGame.update();
      this.dodgeballGame.draw(ctx);
      HUD.draw(ctx, this.dodgeballGame);

      // 토너먼트 모드에서 다음 스테이지 진행 처리
      if (this.dodgeballGame.matchState === 'MATCH_OVER' && this.dodgeballGame.stateTimer > 180) {
        if (input.isActionJustPressed('DASH', 0) || input.isActionJustPressed('SHOT', 0)) {
          if (this.dodgeballGame.mode === 'tournament' && this.dodgeballGame.winner === 'left') {
            const nextStage = this.dodgeballGame.currentStageIndex + 1;
            if (nextStage < this.dodgeballGame.stageOrder.length) {
              this.dodgeballGame.startTournament(nextStage);
            } else {
              // 전세계 제패 완료! 엔딩 후 타이틀로
              alert('축하합니다! 열혈고교가 전 세계와 섀도우 군단을 꺾고 세계 챔피언에 올랐습니다!!');
              this.returnToTitle();
            }
          } else {
            this.returnToTitle();
          }
        }
      }

      // ESC로 타이틀 복귀
      if (input.isActionJustPressed('PAUSE', 0)) {
        this.returnToTitle();
      }
    } else if (this.menu.screen === 'SOCCER' && this.soccerGame) {
      this.soccerGame.update();
      this.soccerGame.draw(ctx);

      if (input.isActionJustPressed('PAUSE', 0)) {
        this.returnToTitle();
      }
    } else {
      // 메뉴 화면들 (TITLE, TEAM_SELECT, SHOT_LAB, HELP)
      this.menu.update((mode, p1, p2, stg) => this.startGame(mode, p1, p2, stg));
      this.menu.draw(ctx);
    }

    // 3. CRT 스캔라인 및 비네트 오버레이
    this.renderer.applyPostProcessing();

    // 4. 입력 상태 갱신
    input.update();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// 앱 실행
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
