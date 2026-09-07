// 모바일 및 터치스크린용 온스크린 가상 조이패드

import { input, GameAction } from '../engine/InputManager';

export class VirtualPad {
  public enabled: boolean = false;
  private container: HTMLDivElement | null = null;

  constructor() {
    // 터치 디바이스 여부 자동 감지
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (hasTouch || window.innerWidth < 900) {
      this.enabled = true;
    }
  }

  public init() {
    if (document.getElementById('virtual-pad-container')) return;

    this.container = document.createElement('div');
    this.container.id = 'virtual-pad-container';
    this.container.style.position = 'fixed';
    this.container.style.bottom = '15px';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.pointerEvents = 'none';
    this.container.style.display = this.enabled ? 'flex' : 'none';
    this.container.style.justifyContent = 'space-between';
    this.container.style.padding = '0 20px';
    this.container.style.boxSizing = 'border-box';
    this.container.style.zIndex = '999';
    this.container.style.userSelect = 'none';

    // 1. 좌측 D-Pad
    const dpad = document.createElement('div');
    dpad.style.width = '140px';
    dpad.style.height = '140px';
    dpad.style.position = 'relative';
    dpad.style.pointerEvents = 'auto';

    const createDpadBtn = (action: GameAction, text: string, top: string, left: string) => {
      const btn = document.createElement('button');
      btn.innerText = text;
      btn.style.position = 'absolute';
      btn.style.width = '44px';
      btn.style.height = '44px';
      btn.style.top = top;
      btn.style.left = left;
      btn.style.background = 'rgba(30, 41, 59, 0.85)';
      btn.style.border = '2px solid #00e5ff';
      btn.style.borderRadius = '8px';
      btn.style.color = '#ffffff';
      btn.style.fontWeight = 'bold';
      btn.style.fontSize = '18px';
      btn.style.touchAction = 'manipulation';

      const press = (e: Event) => { e.preventDefault(); input.setVirtualButton(0, action, true); };
      const release = (e: Event) => { e.preventDefault(); input.setVirtualButton(0, action, false); };

      btn.addEventListener('touchstart', press);
      btn.addEventListener('touchend', release);
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);

      dpad.appendChild(btn);
    };

    createDpadBtn('UP', '▲', '0px', '48px');
    createDpadBtn('DOWN', '▼', '96px', '48px');
    createDpadBtn('LEFT', '◀', '48px', '0px');
    createDpadBtn('RIGHT', '▶', '48px', '96px');

    // 2. 우측 액션 버튼들 (J: 패스/캐치, K: 슛/마구, DASH: 대시, JUMP: 점프)
    const actionPad = document.createElement('div');
    actionPad.style.width = '180px';
    actionPad.style.height = '140px';
    actionPad.style.position = 'relative';
    actionPad.style.pointerEvents = 'auto';

    const createActionBtn = (action: GameAction, label: string, top: string, left: string, bg: string) => {
      const btn = document.createElement('button');
      btn.innerText = label;
      btn.style.position = 'absolute';
      btn.style.width = '52px';
      btn.style.height = '52px';
      btn.style.top = top;
      btn.style.left = left;
      btn.style.background = bg;
      btn.style.border = '2px solid #ffffff';
      btn.style.borderRadius = '50%';
      btn.style.color = '#ffffff';
      btn.style.fontWeight = 'bold';
      btn.style.fontSize = '13px';
      btn.style.touchAction = 'manipulation';
      btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.4)';

      const press = (e: Event) => { e.preventDefault(); input.setVirtualButton(0, action, true); };
      const release = (e: Event) => { e.preventDefault(); input.setVirtualButton(0, action, false); };

      btn.addEventListener('touchstart', press);
      btn.addEventListener('touchend', release);
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);

      actionPad.appendChild(btn);
    };

    createActionBtn('PASS', 'J 패스', '50px', '0px', 'rgba(2, 136, 209, 0.85)');
    createActionBtn('SHOT', 'K 슛', '10px', '55px', 'rgba(211, 47, 47, 0.85)');
    createActionBtn('DASH', '대시', '70px', '60px', 'rgba(245, 124, 0, 0.85)');
    createActionBtn('JUMP', '점프', '35px', '115px', 'rgba(56, 142, 60, 0.85)');

    this.container.appendChild(dpad);
    this.container.appendChild(actionPad);
    document.body.appendChild(this.container);
  }

  public toggle() {
    this.enabled = !this.enabled;
    if (this.container) {
      this.container.style.display = this.enabled ? 'flex' : 'none';
    }
  }
}

export const virtualPad = new VirtualPad();
