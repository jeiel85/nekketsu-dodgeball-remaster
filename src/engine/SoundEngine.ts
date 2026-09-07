// Web Audio API 기반 8-bit 칩튠 사운드 엔진
// NES 2A03 풍의 펄스파/삼각파/노이즈 채널 에뮬레이션

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isMuted: boolean = false;
  private currentBgmTimer: number | null = null;
  private currentBgmName: string = '';

  constructor() {
    // AudioContext는 유저 제스처 후 초기화됨
  }

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.4;
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.35;
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.6;
    this.sfxGain.connect(this.masterGain);

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  // --- 사운드 효과음 (SFX) ---

  // 호각 소리 (경기 시작/종료)
  public playWhistle() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    
    // 이중 톤 호각
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(2600, t);
    osc2.frequency.setValueAtTime(2850, t);

    // 트레몰로
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(30, t);
    lfoGain.gain.setValueAtTime(40, t);
    lfo.connect(osc1.frequency);
    lfo.start(t);
    lfo.stop(t + 0.6);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.setValueAtTime(0.4, t + 0.45);
    gain.gain.linearRampToValueAtTime(0, t + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.6);
    osc2.stop(t + 0.6);
  }

  // 볼 던지기 슉!
  public playThrow() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // 슈퍼 마구 발사 굉음!
  public playSuperShot() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // 1. 피치 레이저 스윕
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.35);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.linearRampToValueAtTime(0.01, t + 0.35);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);

    // 2. 노이즈 폭발 레이어
    this.playNoise(0.3, 0.4, 600);
  }

  // 캐치 성공 탁!
  public playCatch() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 피격 퍽! (강력한 타격음)
  public playHit(isHeavy: boolean = false) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // 삼각파 펀치
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(isHeavy ? 180 : 260, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + (isHeavy ? 0.25 : 0.15));

    gain.gain.setValueAtTime(isHeavy ? 0.8 : 0.5, t);
    gain.gain.linearRampToValueAtTime(0.01, t + (isHeavy ? 0.25 : 0.15));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + (isHeavy ? 0.25 : 0.15));

    // 노이즈 크런치
    this.playNoise(isHeavy ? 0.25 : 0.12, isHeavy ? 0.7 : 0.4, isHeavy ? 400 : 800);
  }

  // 바닥 바운드 통-
  public playBounce() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 점프 뾰옹
  public playJump() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // 대시 슥-
  public playDash() {
    this.playNoise(0.08, 0.2, 1200);
  }

  // 천국 승천 종소리 (Angel Ascending)
  public playAngel() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const baseTime = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = baseTime + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  // 축구 태클 콰당!
  public playTackle() {
    this.playHit(true);
  }

  // 골인 환호성!
  public playGoal() {
    this.playWhistle();
    setTimeout(() => this.playFanfare(), 300);
  }

  // 메뉴 이동/선택음
  public playSelect() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(880, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 노이즈 발생 유틸리티 (퍼커션/폭발)
  private playNoise(duration: number, volume: number, filterFreq: number = 1000) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  // --- BGM 사운드트랙 (Synthesized 8-Bit NES Style) ---

  public stopBgm() {
    if (this.currentBgmTimer !== null) {
      clearInterval(this.currentBgmTimer);
      this.currentBgmTimer = null;
    }
    this.currentBgmName = '';
  }

  public playBgm(name: 'title' | 'match' | 'world' | 'final' | 'soccer' | 'victory') {
    if (this.currentBgmName === name) return;
    this.stopBgm();
    this.currentBgmName = name;
    this.init();

    if (name === 'title') {
      this.startTitleBgm();
    } else if (name === 'match') {
      this.startMatchBgm();
    } else if (name === 'world') {
      this.startWorldBgm();
    } else if (name === 'final') {
      this.startFinalBgm();
    } else if (name === 'soccer') {
      this.startSoccerBgm();
    } else if (name === 'victory') {
      this.playFanfare();
    }
  }

  // 열혈 오프닝 메인 테마
  private startTitleBgm() {
    const tempo = 145;
    const stepDuration = 60 / tempo / 4; // 16분 음표 기준
    // 열혈 특유의 쾌활하고 웅장한 레트로 멜로디 (도라도라솔 솔솔라...)
    const melody = [
      // 마디 1
      { note: 293.66, dur: 2 }, // D4
      { note: 329.63, dur: 2 }, // E4
      { note: 392.00, dur: 2 }, // G4
      { note: 440.00, dur: 2 }, // A4
      { note: 523.25, dur: 4 }, // C5
      { note: 440.00, dur: 4 }, // A4
      // 마디 2
      { note: 392.00, dur: 4 }, // G4
      { note: 329.63, dur: 4 }, // E4
      { note: 293.66, dur: 8 }, // D4
      // 마디 3
      { note: 293.66, dur: 2 },
      { note: 329.63, dur: 2 },
      { note: 392.00, dur: 2 },
      { note: 440.00, dur: 2 },
      { note: 587.33, dur: 4 }, // D5
      { note: 523.25, dur: 4 }, // C5
      // 마디 4
      { note: 440.00, dur: 4 },
      { note: 493.88, dur: 4 }, // B4
      { note: 440.00, dur: 8 }
    ];

    let step = 0;
    const totalSteps = 64;

    const playLoop = () => {
      if (this.currentBgmName !== 'title') return;
      // 멜로디
      let accDur = 0;
      for (const item of melody) {
        if (step === accDur) {
          this.playPulseTone(item.note, item.dur * stepDuration, 0.22);
          break;
        }
        accDur += item.dur;
      }
      // 베이스라인 (펑키한 열혈 베이스)
      const bassNotes = [146.83, 146.83, 196.00, 146.83, 220.00, 196.00, 146.83, 164.81];
      const bassIdx = Math.floor(step / 4) % bassNotes.length;
      if (step % 2 === 0) {
        this.playTriangleTone(bassNotes[bassIdx], 0.1, 0.3);
      }
      // 드럼 (노이즈)
      if (step % 4 === 0) {
        this.playNoise(0.04, 0.15, 2000); // 킥
      } else if (step % 4 === 2) {
        this.playNoise(0.06, 0.2, 5000); // 스네어
      }

      step = (step + 1) % totalSteps;
    };

    this.currentBgmTimer = window.setInterval(playLoop, stepDuration * 1000);
  }

  // 열혈 피구 경기 테마 (Japan Match Theme)
  private startMatchBgm() {
    const tempo = 160;
    const stepDuration = 60 / tempo / 4;
    
    // 긴박하고 빠른 열혈 경기 멜로디
    const lead = [
      { note: 440.00, dur: 2 }, // A4
      { note: 440.00, dur: 2 },
      { note: 523.25, dur: 2 }, // C5
      { note: 587.33, dur: 2 }, // D5
      { note: 659.25, dur: 3 }, // E5
      { note: 587.33, dur: 1 },
      { note: 523.25, dur: 2 },
      { note: 440.00, dur: 2 },
      // 두번째 구절
      { note: 392.00, dur: 2 }, // G4
      { note: 440.00, dur: 2 },
      { note: 523.25, dur: 4 },
      { note: 440.00, dur: 4 },
      { note: 392.00, dur: 4 },
      // 세번째 구절
      { note: 440.00, dur: 2 },
      { note: 523.25, dur: 2 },
      { note: 587.33, dur: 2 },
      { note: 659.25, dur: 2 },
      { note: 698.46, dur: 4 }, // F5
      { note: 659.25, dur: 4 },
      // 네번째 구절
      { note: 587.33, dur: 4 },
      { note: 523.25, dur: 4 },
      { note: 440.00, dur: 8 }
    ];

    let step = 0;
    const totalSteps = 64;

    const playLoop = () => {
      if (this.currentBgmName !== 'match') return;
      let acc = 0;
      for (const item of lead) {
        if (step === acc) {
          this.playPulseTone(item.note, item.dur * stepDuration, 0.25);
          break;
        }
        acc += item.dur;
      }

      // 빠른 8분음표 베이스
      const bassNotes = [110.00, 110.00, 130.81, 110.00, 146.83, 110.00, 98.00, 110.00];
      const bIdx = Math.floor(step / 2) % bassNotes.length;
      if (step % 2 === 0) {
        this.playTriangleTone(bassNotes[bIdx], 0.1, 0.35);
      }

      // 하이햇 & 스네어 드럼 비트
      if (step % 4 === 2) {
        this.playNoise(0.05, 0.22, 4000);
      } else if (step % 2 === 0) {
        this.playNoise(0.02, 0.1, 8000);
      }

      step = (step + 1) % totalSteps;
    };

    this.currentBgmTimer = window.setInterval(playLoop, stepDuration * 1000);
  }

  // 월드 스테이지 테마
  private startWorldBgm() {
    const tempo = 150;
    const stepDuration = 60 / tempo / 4;
    let step = 0;
    const totalSteps = 32;

    const playLoop = () => {
      if (this.currentBgmName !== 'world') return;
      const notes = [329.63, 392.00, 440.00, 493.88, 587.33, 493.88, 440.00, 392.00];
      if (step % 4 === 0) {
        const n = notes[(step / 4) % notes.length];
        this.playPulseTone(n, 0.2, 0.25);
      }
      if (step % 2 === 0) {
        this.playTriangleTone(164.81, 0.1, 0.3);
      }
      if (step % 4 === 2) {
        this.playNoise(0.04, 0.18, 3000);
      }
      step = (step + 1) % totalSteps;
    };
    this.currentBgmTimer = window.setInterval(playLoop, stepDuration * 1000);
  }

  // 최종 결전 / 보스 테마
  private startFinalBgm() {
    const tempo = 175;
    const stepDuration = 60 / tempo / 4;
    let step = 0;
    const totalSteps = 32;

    const playLoop = () => {
      if (this.currentBgmName !== 'final') return;
      const metalNotes = [220, 233, 220, 261, 246, 220, 196, 207];
      if (step % 2 === 0) {
        const n = metalNotes[(step / 2) % metalNotes.length];
        this.playPulseTone(n * 2, 0.12, 0.28);
        this.playTriangleTone(n, 0.12, 0.35);
      }
      if (step % 4 === 0 || step % 4 === 2) {
        this.playNoise(0.05, 0.25, 2500);
      }
      step = (step + 1) % totalSteps;
    };
    this.currentBgmTimer = window.setInterval(playLoop, stepDuration * 1000);
  }

  // 열혈 축구 테마 (흥겨운 삼바/질주 리듬)
  private startSoccerBgm() {
    const tempo = 165;
    const stepDuration = 60 / tempo / 4;
    let step = 0;
    const totalSteps = 32;

    const soccerMelody = [523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 587.33, 523.25];
    const playLoop = () => {
      if (this.currentBgmName !== 'soccer') return;
      if (step % 4 === 0) {
        this.playPulseTone(soccerMelody[(step / 4) % soccerMelody.length], 0.2, 0.25);
      }
      if (step % 2 === 0) {
        this.playTriangleTone(130.81, 0.1, 0.3);
      }
      // 삼바 비트
      if (step % 4 === 1 || step % 4 === 3) {
        this.playNoise(0.03, 0.15, 6000);
      }
      step = (step + 1) % totalSteps;
    };
    this.currentBgmTimer = window.setInterval(playLoop, stepDuration * 1000);
  }

  // 승리 팡파레
  public playFanfare() {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;
    this.stopBgm();
    const fanfareNotes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.4 },
      { f: 415.30, d: 0.4 }, // G#4
      { f: 466.16, d: 0.4 }, // A#4
      { f: 523.25, d: 0.8 }  // C5
    ];

    let t = this.ctx.currentTime;
    fanfareNotes.forEach((item) => {
      this.playPulseToneAt(item.f, item.d * 0.9, 0.3, t);
      this.playTriangleToneAt(item.f / 2, item.d * 0.9, 0.3, t);
      t += item.d;
    });
  }

  private playPulseTone(freq: number, duration: number, vol: number) {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;
    this.playPulseToneAt(freq, duration, vol, this.ctx.currentTime);
  }

  private playPulseToneAt(freq: number, duration: number, vol: number, time: number) {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.setValueAtTime(vol, time + duration * 0.8);
    gain.gain.linearRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + duration);
  }

  private playTriangleTone(freq: number, duration: number, vol: number) {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;
    this.playTriangleToneAt(freq, duration, vol, this.ctx.currentTime);
  }

  private playTriangleToneAt(freq: number, duration: number, vol: number, time: number) {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.linearRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);
    osc.start(time);
    osc.stop(time + duration);
  }
}

export const sound = new SoundEngine();
