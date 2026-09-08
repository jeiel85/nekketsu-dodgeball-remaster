// 입력 시스템: 1P(방향키 & WASD 동시 지원), 2P 키보드, 더블 탭 대시, 선수 전환(SWITCH) 지원

export type GameAction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'PASS' | 'SHOT' | 'DASH' | 'JUMP' | 'SWITCH' | 'PAUSE';

export class InputManager {
  private keyState: Map<string, boolean> = new Map();
  private prevKeyState: Map<string, boolean> = new Map();

  // 2인 대전 모드 여부 (false일 때 화살표 키도 1P가 직접 사용)
  public is2PlayerMode: boolean = false;

  // 더블 탭 대시 감지용
  private lastTapTime: { [key: string]: number } = {};
  public doubleTapActive: { [player: number]: { x: number; y: number } } = {
    0: { x: 0, y: 0 },
    1: { x: 0, y: 0 }
  };

  // 모바일 가상 패드 입력 상태
  private virtualState: { [player: number]: { [action in GameAction]?: boolean } } = {
    0: {},
    1: {}
  };

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent) {
    const code = e.code;
    const now = performance.now();

    // 방향키 더블 탭 대시 감지 함수
    const checkDoubleTap = (player: number, dirKey: string, dx: number, dy: number) => {
      const last = this.lastTapTime[dirKey] || 0;
      if (now - last < 300 && now - last > 50) {
        this.doubleTapActive[player] = { x: dx, y: dy };
      }
      this.lastTapTime[dirKey] = now;
    };

    // 1P WASD 더블탭
    if (code === 'KeyD') checkDoubleTap(0, 'KeyD', 1, 0);
    if (code === 'KeyA') checkDoubleTap(0, 'KeyA', -1, 0);
    if (code === 'KeyW') checkDoubleTap(0, 'KeyW', 0, -1);
    if (code === 'KeyS') checkDoubleTap(0, 'KeyS', 0, 1);

    // 화살표 방향키 더블탭
    if (!this.is2PlayerMode) {
      // 싱글플레이 모드에서는 화살표 키도 1P 더블탭으로 작동!
      if (code === 'ArrowRight') checkDoubleTap(0, 'ArrowRight', 1, 0);
      if (code === 'ArrowLeft') checkDoubleTap(0, 'ArrowLeft', -1, 0);
      if (code === 'ArrowUp') checkDoubleTap(0, 'ArrowUp', 0, -1);
      if (code === 'ArrowDown') checkDoubleTap(0, 'ArrowDown', 0, 1);
    } else {
      // 2P 모드에서는 2P 더블탭
      if (code === 'ArrowRight') checkDoubleTap(1, 'ArrowRight', 1, 0);
      if (code === 'ArrowLeft') checkDoubleTap(1, 'ArrowLeft', -1, 0);
      if (code === 'ArrowUp') checkDoubleTap(1, 'ArrowUp', 0, -1);
      if (code === 'ArrowDown') checkDoubleTap(1, 'ArrowDown', 0, 1);
    }

    this.keyState.set(code, true);

    // 웹페이지 스크롤 및 포커스 방지 (스페이스, 방향키, 탭 등)
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(code)) {
      e.preventDefault();
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    const code = e.code;
    this.keyState.set(code, false);

    // 방향키에서 손 떼면 더블탭 대시 해제
    if (['KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(code)) {
      this.doubleTapActive[0] = { x: 0, y: 0 };
    }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) {
      if (!this.is2PlayerMode) {
        this.doubleTapActive[0] = { x: 0, y: 0 };
      } else {
        this.doubleTapActive[1] = { x: 0, y: 0 };
      }
    }
  }

  public update() {
    this.prevKeyState = new Map(this.keyState);
  }

  public setVirtualButton(player: number, action: GameAction, isPressed: boolean) {
    if (!this.virtualState[player]) this.virtualState[player] = {};
    this.virtualState[player][action] = isPressed;
  }

  public isActionPressed(action: GameAction, playerIndex: number = 0): boolean {
    // 1. 가상 터치 입력 확인
    if (this.virtualState[playerIndex] && this.virtualState[playerIndex][action]) {
      return true;
    }

    // 2. 게임패드 확인
    if (this.checkGamepad(action, playerIndex)) {
      return true;
    }

    // 3. 키보드 확인
    if (playerIndex === 0) {
      // 1P: WASD + 방향키(싱글 모드 시) 모두 지원!
      const useArrows = !this.is2PlayerMode;

      switch (action) {
        case 'UP':
          return this.isKeyDown('KeyW') || (useArrows && this.isKeyDown('ArrowUp'));
        case 'DOWN':
          return this.isKeyDown('KeyS') || (useArrows && this.isKeyDown('ArrowDown'));
        case 'LEFT':
          return this.isKeyDown('KeyA') || (useArrows && this.isKeyDown('ArrowLeft'));
        case 'RIGHT':
          return this.isKeyDown('KeyD') || (useArrows && this.isKeyDown('ArrowRight'));
        case 'PASS':
          return this.isKeyDown('KeyJ') || this.isKeyDown('KeyC') || (useArrows && this.isKeyDown('Numpad1'));
        case 'SHOT':
          return this.isKeyDown('KeyK') || this.isKeyDown('KeyX') || this.isKeyDown('KeyZ') || (useArrows && this.isKeyDown('Numpad2'));
        case 'DASH':
          return this.isKeyDown('Space') || (this.doubleTapActive[0].x !== 0 || this.doubleTapActive[0].y !== 0);
        case 'JUMP':
          return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight') || this.isKeyDown('KeyV') || 
                 (this.isKeyDown('KeyJ') && this.isKeyDown('KeyK'));
        case 'SWITCH':
          return this.isKeyDown('Tab') || this.isKeyDown('KeyQ') || this.isKeyDown('KeyE');
        case 'PAUSE':
          return this.isKeyDown('Escape') || this.isKeyDown('KeyP');
      }
    } else {
      // 2P (2인 대전 모드 전용)
      switch (action) {
        case 'UP': return this.isKeyDown('ArrowUp');
        case 'DOWN': return this.isKeyDown('ArrowDown');
        case 'LEFT': return this.isKeyDown('ArrowLeft');
        case 'RIGHT': return this.isKeyDown('ArrowRight');
        case 'PASS': return this.isKeyDown('Numpad1') || this.isKeyDown('KeyN');
        case 'SHOT': return this.isKeyDown('Numpad2') || this.isKeyDown('KeyM');
        case 'DASH': return this.isKeyDown('Numpad0') || this.isKeyDown('KeyB') || (this.doubleTapActive[1].x !== 0 || this.doubleTapActive[1].y !== 0);
        case 'JUMP': return this.isKeyDown('Numpad3') || this.isKeyDown('Comma') || (this.isKeyDown('KeyN') && this.isKeyDown('KeyM'));
        case 'SWITCH': return this.isKeyDown('NumpadPeriod') || this.isKeyDown('Slash');
        case 'PAUSE': return false;
      }
    }
    return false;
  }

  public isActionJustPressed(action: GameAction, playerIndex: number = 0): boolean {
    const isNow = this.isActionPressed(action, playerIndex);
    let wasPrev = false;
    const useArrows = !this.is2PlayerMode;

    if (playerIndex === 0) {
      switch (action) {
        case 'UP':
          wasPrev = this.wasKeyDown('KeyW') || (useArrows && this.wasKeyDown('ArrowUp'));
          break;
        case 'DOWN':
          wasPrev = this.wasKeyDown('KeyS') || (useArrows && this.wasKeyDown('ArrowDown'));
          break;
        case 'LEFT':
          wasPrev = this.wasKeyDown('KeyA') || (useArrows && this.wasKeyDown('ArrowLeft'));
          break;
        case 'RIGHT':
          wasPrev = this.wasKeyDown('KeyD') || (useArrows && this.wasKeyDown('ArrowRight'));
          break;
        case 'PASS':
          wasPrev = this.wasKeyDown('KeyJ') || this.wasKeyDown('KeyC') || (useArrows && this.wasKeyDown('Numpad1'));
          break;
        case 'SHOT':
          wasPrev = this.wasKeyDown('KeyK') || this.wasKeyDown('KeyX') || this.wasKeyDown('KeyZ') || (useArrows && this.wasKeyDown('Numpad2'));
          break;
        case 'DASH':
          wasPrev = this.wasKeyDown('Space');
          break;
        case 'JUMP':
          wasPrev = this.wasKeyDown('ShiftLeft') || this.wasKeyDown('ShiftRight') || this.wasKeyDown('KeyV');
          break;
        case 'SWITCH':
          wasPrev = this.wasKeyDown('Tab') || this.wasKeyDown('KeyQ') || this.wasKeyDown('KeyE');
          break;
        case 'PAUSE':
          wasPrev = this.wasKeyDown('Escape') || this.wasKeyDown('KeyP');
          break;
      }
    } else {
      switch (action) {
        case 'UP': wasPrev = this.wasKeyDown('ArrowUp'); break;
        case 'DOWN': wasPrev = this.wasKeyDown('ArrowDown'); break;
        case 'LEFT': wasPrev = this.wasKeyDown('ArrowLeft'); break;
        case 'RIGHT': wasPrev = this.wasKeyDown('ArrowRight'); break;
        case 'PASS': wasPrev = this.wasKeyDown('Numpad1') || this.wasKeyDown('KeyN'); break;
        case 'SHOT': wasPrev = this.wasKeyDown('Numpad2') || this.wasKeyDown('KeyM'); break;
        case 'DASH': wasPrev = this.wasKeyDown('Numpad0') || this.wasKeyDown('KeyB'); break;
        case 'JUMP': wasPrev = this.wasKeyDown('Numpad3') || this.wasKeyDown('Comma'); break;
        case 'SWITCH': wasPrev = this.wasKeyDown('NumpadPeriod') || this.wasKeyDown('Slash'); break;
        case 'PAUSE': wasPrev = false; break;
      }
    }
    return isNow && !wasPrev;
  }

  private isKeyDown(code: string): boolean {
    return !!this.keyState.get(code);
  }

  private wasKeyDown(code: string): boolean {
    return !!this.prevKeyState.get(code);
  }

  private checkGamepad(action: GameAction, playerIndex: number): boolean {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[playerIndex];
    if (!gp) return false;

    const threshold = 0.4;
    switch (action) {
      case 'UP': return gp.buttons[12]?.pressed || gp.axes[1] < -threshold;
      case 'DOWN': return gp.buttons[13]?.pressed || gp.axes[1] > threshold;
      case 'LEFT': return gp.buttons[14]?.pressed || gp.axes[0] < -threshold;
      case 'RIGHT': return gp.buttons[15]?.pressed || gp.axes[0] > threshold;
      case 'PASS': return gp.buttons[0]?.pressed; // A button
      case 'SHOT': return gp.buttons[2]?.pressed || gp.buttons[1]?.pressed; // X or B
      case 'JUMP': return gp.buttons[3]?.pressed || gp.buttons[5]?.pressed; // Y or RB
      case 'DASH': return gp.buttons[4]?.pressed || gp.buttons[7]?.pressed; // LB or RT
      case 'SWITCH': return gp.buttons[8]?.pressed || gp.buttons[5]?.pressed; // Select or R1
      case 'PAUSE': return gp.buttons[9]?.pressed; // Start
    }
    return false;
  }
}

export const input = new InputManager();
