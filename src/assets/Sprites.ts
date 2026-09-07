// 열혈 시리즈 전설의 픽셀 아트 엔진 & 스프라이트 제너레이터

export interface TeamPalette {
  id: string;
  name: string;
  country: string;
  hairColor: string;
  skinColor: string;
  skinShade: string;
  shirtColor: string;
  shirtShade: string;
  pantsColor: string;
  shoesColor: string;
  ballColor1: string;
  ballColor2: string;
  captainName: string;
  captainShot: string;
}

export const TEAM_PALETTES: { [key: string]: TeamPalette } = {
  japan_nekketsu: {
    id: 'japan_nekketsu',
    name: '열혈고교 (NEKKETSU)',
    country: '일본 (Japan)',
    hairColor: '#3a2010',
    skinColor: '#ffcc99',
    skinShade: '#e09868',
    shirtColor: '#f8f8f8',
    shirtShade: '#c0c0c0',
    pantsColor: '#f8f8f8',
    shoesColor: '#cc0000',
    ballColor1: '#ff2222',
    ballColor2: '#ffffff',
    captainName: '쿠니오 (KUNIO)',
    captainShot: '관통 압축 샷 (Compress Shot)'
  },
  japan_hanazono: {
    id: 'japan_hanazono',
    name: '하나조노고교 (HANAZONO)',
    country: '일본 (Japan)',
    hairColor: '#2b3a55',
    skinColor: '#ffcc99',
    skinShade: '#e09868',
    shirtColor: '#2266cc',
    shirtShade: '#114488',
    pantsColor: '#2266cc',
    shoesColor: '#ffffff',
    ballColor1: '#0088ff',
    ballColor2: '#ffffff',
    captainName: '리키 (RIKI)',
    captainShot: '분신 파도 샷 (Wave Shot)'
  },
  england: {
    id: 'england',
    name: '영국 대표팀 (ENGLAND)',
    country: '영국 (England)',
    hairColor: '#b87333',
    skinColor: '#ffe0bd',
    skinShade: '#e6b89c',
    shirtColor: '#2e7d32',
    shirtShade: '#1b5e20',
    pantsColor: '#ffffff',
    shoesColor: '#2e7d32',
    ballColor1: '#2e7d32',
    ballColor2: '#ffffff',
    captainName: '그린 (GREEN)',
    captainShot: '번개 지그재그 샷 (Lightning Shot)'
  },
  india: {
    id: 'india',
    name: '인도 대표팀 (INDIA)',
    country: '인도 (India)',
    hairColor: '#222222',
    skinColor: '#a67c52',
    skinShade: '#805a36',
    shirtColor: '#ff9800',
    shirtShade: '#e65100',
    pantsColor: '#ffffff',
    shoesColor: '#ff9800',
    ballColor1: '#ff9800',
    ballColor2: '#ffffff',
    captainName: '샨카 (SHANKAR)',
    captainShot: '곡선 부유 바나나 샷 (Curved Shot)'
  },
  iceland: {
    id: 'iceland',
    name: '아이슬란드 대표팀 (ICELAND)',
    country: '아이슬란드 (Iceland)',
    hairColor: '#f5deb3',
    skinColor: '#fff0e0',
    skinShade: '#e0c0b0',
    shirtColor: '#00acc1',
    shirtShade: '#00838f',
    pantsColor: '#00acc1',
    shoesColor: '#ffffff',
    ballColor1: '#00e5ff',
    ballColor2: '#ffffff',
    captainName: '헬기 (HELGI)',
    captainShot: '블리자드 헤비 샷 (Blizzard Heavy Shot)'
  },
  china: {
    id: 'china',
    name: '중국 대표팀 (CHINA)',
    country: '중국 (China)',
    hairColor: '#111111',
    skinColor: '#ffd79e',
    skinShade: '#d9a76a',
    shirtColor: '#d32f2f',
    shirtShade: '#9a0007',
    pantsColor: '#ffd600',
    shoesColor: '#111111',
    ballColor1: '#d32f2f',
    ballColor2: '#ffd600',
    captainName: '왕 (WANG)',
    captainShot: '스네이크 승천 샷 (Snake Shot)'
  },
  kenya: {
    id: 'kenya',
    name: '케냐 대표팀 (KENYA)',
    country: '케냐 (Kenya)',
    hairColor: '#1a1a1a',
    skinColor: '#5c3a21',
    skinShade: '#3d2514',
    shirtColor: '#e65100',
    shirtShade: '#ac3b00',
    pantsColor: '#2e7d32',
    shoesColor: '#ffffff',
    ballColor1: '#e65100',
    ballColor2: '#2e7d32',
    captainName: '응고모 (NGOMO)',
    captainShot: '부메랑 바운드 샷 (Boomerang Shot)'
  },
  usa: {
    id: 'usa',
    name: '미국 대표팀 (USA)',
    country: '미국 (USA)',
    hairColor: '#f1c40f',
    skinColor: '#ffdbac',
    skinShade: '#d4a373',
    shirtColor: '#1565c0',
    shirtShade: '#0d47a1',
    pantsColor: '#c62828',
    shoesColor: '#ffffff',
    ballColor1: '#1565c0',
    ballColor2: '#c62828',
    captainName: '윌리엄 (WILLIAM)',
    captainShot: '워프 초광속 샷 (Warp Sonic Shot)'
  },
  shadow: {
    id: 'shadow',
    name: '섀도우 팀 (SHADOW)',
    country: '미러 월드 (Mirror World)',
    hairColor: '#8e24aa',
    skinColor: '#78909c',
    skinShade: '#546e7a',
    shirtColor: '#212121',
    shirtShade: '#000000',
    pantsColor: '#4a148c',
    shoesColor: '#d500f9',
    ballColor1: '#d500f9',
    ballColor2: '#000000',
    captainName: '섀도우 쿠니오 (SHADOW KUNIO)',
    captainShot: '다크 블랙홀 샷 (Dark Blackhole)'
  }
};

export type PlayerAnimState = 
  | 'IDLE' 
  | 'WALK' 
  | 'DASH' 
  | 'JUMP' 
  | 'THROW_WINDUP' 
  | 'THROW_RELEASE' 
  | 'JUMP_THROW' 
  | 'CATCH' 
  | 'HURT' 
  | 'SPIN' 
  | 'DOWN' 
  | 'TIRED' 
  | 'ANGEL';

export class Sprites {
  // 캐릭터 픽셀 스프라이트를 정밀 렌더링
  public static drawPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    anim: PlayerAnimState,
    frame: number,
    facingLeft: boolean,
    palette: TeamPalette,
    isCaptain: boolean = false,
    scale: number = 2.5
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    const s = scale;

    // 그림자 (천사 상태가 아닐 때)
    if (anim !== 'ANGEL') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 16 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (anim === 'ANGEL') {
      this.drawAngel(ctx, s, frame);
      ctx.restore();
      return;
    }

    if (anim === 'SPIN') {
      // 강한 슛 맞고 회전
      const spinAngle = (frame * 35 * Math.PI) / 180;
      ctx.rotate(spinAngle);
    }

    // 기본 바디 오프셋
    let bodyY = 0;
    let legFrame = Math.floor(frame) % 2;

    if (anim === 'WALK') {
      bodyY = (legFrame === 0) ? -1 : 0;
    } else if (anim === 'DASH') {
      bodyY = 1;
    } else if (anim === 'TIRED') {
      bodyY = 2;
    }

    // 1. 머리 및 얼굴 (열혈 특유의 각진 얼굴 & 헤어스타일)
    const headX = (anim === 'DASH' ? 4 : (anim === 'TIRED' ? 3 : 0)) * s;
    const headY = (-14 + bodyY) * s;

    // 헤어
    ctx.fillStyle = palette.hairColor;
    if (isCaptain) {
      // 쿠니오식 리젠트 퐁파두르 또는 캡틴 엣지 헤어
      ctx.fillRect(headX - 6 * s, headY - 8 * s, 14 * s, 6 * s);
      ctx.fillRect(headX + 2 * s, headY - 11 * s, 7 * s, 4 * s); // 리젠트 앞머리
      ctx.fillRect(headX - 8 * s, headY - 5 * s, 3 * s, 7 * s); // 뒷머리
    } else {
      // 일반 단정/스포츠 헤어
      ctx.fillRect(headX - 6 * s, headY - 7 * s, 12 * s, 5 * s);
      ctx.fillRect(headX - 7 * s, headY - 4 * s, 2 * s, 6 * s);
    }

    // 얼굴 베이스 (피부톤)
    ctx.fillStyle = palette.skinColor;
    ctx.fillRect(headX - 5 * s, headY - 2 * s, 11 * s, 9 * s);

    // 귀
    ctx.fillStyle = palette.skinShade;
    ctx.fillRect(headX - 6 * s, headY + 1 * s, 2 * s, 3 * s);

    // 표정 렌더링 (열혈의 핵심!)
    if (anim === 'HURT' || anim === 'SPIN') {
      // 눈 튀어나오는 피격 표정 (Pop-out Cartoon Shock)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX + 2 * s, headY - 2 * s, 6 * s, 6 * s);
      ctx.fillStyle = '#000000';
      ctx.fillRect(headX + 4 * s, headY - 1 * s, 3 * s, 3 * s);

      // 크게 벌린 비명 입
      ctx.fillStyle = '#000000';
      ctx.fillRect(headX + 1 * s, headY + 4 * s, 5 * s, 4 * s);
      ctx.fillStyle = '#ff4444'; // 혀
      ctx.fillRect(headX + 2 * s, headY + 6 * s, 3 * s, 2 * s);
    } else if (anim === 'TIRED') {
      // 지친 표정 (@_@ or 헐떡임)
      ctx.fillStyle = '#000000';
      ctx.fillRect(headX + 1 * s, headY + 1 * s, 3 * s, 1 * s);
      ctx.fillRect(headX + 1 * s, headY + 5 * s, 4 * s, 2 * s);
      // 땀방울
      ctx.fillStyle = '#64b5f6';
      ctx.fillRect(headX + 6 * s, headY - 1 * s, 2 * s, 3 * s);
    } else {
      // 결의에 찬 열혈 눈썹 & 눈
      ctx.fillStyle = '#111111';
      // 짙은 대각선 눈썹
      ctx.fillRect(headX + 1 * s, headY - 1 * s, 5 * s, 2 * s);
      // 부리부리한 눈
      ctx.fillRect(headX + 2 * s, headY + 2 * s, 3 * s, 2 * s);
      // 입 (앙다문 입)
      ctx.fillRect(headX + 1 * s, headY + 5 * s, 4 * s, 1 * s);
    }

    // 2. 몸통 / 유니폼 상의
    const torsoX = (anim === 'DASH' ? 2 : 0) * s;
    const torsoY = (-4 + bodyY) * s;

    ctx.fillStyle = palette.shirtColor;
    ctx.fillRect(torsoX - 5 * s, torsoY, 11 * s, 10 * s);

    // 상의 음영 및 디테일
    ctx.fillStyle = palette.shirtShade;
    ctx.fillRect(torsoX - 5 * s, torsoY + 7 * s, 11 * s, 3 * s);
    ctx.fillRect(torsoX - 1 * s, torsoY, 2 * s, 4 * s); // 칼라/목선

    // 3. 팔 & 손
    if (anim === 'THROW_WINDUP') {
      // 공을 쥐고 뒤로 젖힌 팔
      ctx.fillStyle = palette.shirtColor;
      ctx.fillRect(torsoX - 8 * s, torsoY + 1 * s, 4 * s, 4 * s);
      ctx.fillStyle = palette.skinColor;
      ctx.fillRect(torsoX - 11 * s, torsoY - 4 * s, 4 * s, 5 * s);
    } else if (anim === 'THROW_RELEASE' || anim === 'JUMP_THROW') {
      // 앞으로 뻗은 슛 팔
      ctx.fillStyle = palette.shirtColor;
      ctx.fillRect(torsoX + 4 * s, torsoY + 1 * s, 4 * s, 4 * s);
      ctx.fillStyle = palette.skinColor;
      ctx.fillRect(torsoX + 8 * s, torsoY + 2 * s, 6 * s, 4 * s);
    } else if (anim === 'CATCH') {
      // 두 손을 앞으로 뻗어 포구
      ctx.fillStyle = palette.skinColor;
      ctx.fillRect(torsoX + 4 * s, torsoY + 2 * s, 6 * s, 5 * s);
    } else if (anim === 'DASH') {
      // 대시 자세 (팔 뒤로 뻗기)
      ctx.fillStyle = palette.shirtColor;
      ctx.fillRect(torsoX - 8 * s, torsoY + 2 * s, 5 * s, 3 * s);
      ctx.fillStyle = palette.skinColor;
      ctx.fillRect(torsoX - 11 * s, torsoY + 3 * s, 4 * s, 3 * s);
    } else {
      // 일반 걸음/아이들 팔
      ctx.fillStyle = palette.shirtColor;
      ctx.fillRect(torsoX + 4 * s, torsoY + 2 * s, 3 * s, 4 * s);
      ctx.fillStyle = palette.skinColor;
      ctx.fillRect(torsoX + 4 * s, torsoY + 6 * s, 3 * s, 3 * s);
    }

    // 4. 하의 (반바지)
    const pantsY = torsoY + 10 * s;
    ctx.fillStyle = palette.pantsColor;
    ctx.fillRect(torsoX - 5 * s, pantsY, 11 * s, 5 * s);

    // 5. 다리 & 신발 (하체 애니메이션)
    const legY = pantsY + 5 * s;
    ctx.fillStyle = palette.skinColor;

    if (anim === 'JUMP' || anim === 'JUMP_THROW') {
      // 점프 중 굽힌 다리
      ctx.fillRect(torsoX - 4 * s, legY, 4 * s, 3 * s);
      ctx.fillRect(torsoX + 1 * s, legY - 1 * s, 4 * s, 3 * s);
      // 신발
      ctx.fillStyle = palette.shoesColor;
      ctx.fillRect(torsoX - 5 * s, legY + 2 * s, 5 * s, 3 * s);
      ctx.fillRect(torsoX + 1 * s, legY + 1 * s, 5 * s, 3 * s);
    } else if (anim === 'DASH') {
      // 대시 다리 (큰 보폭)
      if (legFrame === 0) {
        ctx.fillRect(torsoX - 6 * s, legY, 4 * s, 4 * s);
        ctx.fillRect(torsoX + 2 * s, legY - 1 * s, 4 * s, 4 * s);
        ctx.fillStyle = palette.shoesColor;
        ctx.fillRect(torsoX - 7 * s, legY + 4 * s, 5 * s, 3 * s);
        ctx.fillRect(torsoX + 3 * s, legY + 3 * s, 5 * s, 3 * s);
      } else {
        ctx.fillRect(torsoX - 2 * s, legY - 1 * s, 4 * s, 4 * s);
        ctx.fillRect(torsoX + 4 * s, legY, 4 * s, 4 * s);
        ctx.fillStyle = palette.shoesColor;
        ctx.fillRect(torsoX - 3 * s, legY + 3 * s, 5 * s, 3 * s);
        ctx.fillRect(torsoX + 5 * s, legY + 4 * s, 5 * s, 3 * s);
      }
    } else if (anim === 'DOWN') {
      // 엎어진 다리
      ctx.fillRect(torsoX - 7 * s, legY - 3 * s, 6 * s, 3 * s);
      ctx.fillStyle = palette.shoesColor;
      ctx.fillRect(torsoX - 10 * s, legY - 3 * s, 4 * s, 3 * s);
    } else {
      // 일반 서기/걷기
      const legOff = (anim === 'WALK' && legFrame === 1) ? 2 : 0;
      ctx.fillRect(torsoX - 4 * s, legY, 3 * s, 4 * s);
      ctx.fillRect(torsoX + 1 * s, legY, 3 * s, 4 * s - legOff);
      // 신발
      ctx.fillStyle = palette.shoesColor;
      ctx.fillRect(torsoX - 5 * s, legY + 4 * s, 4 * s, 3 * s);
      ctx.fillRect(torsoX + 1 * s, legY + 4 * s - legOff, 4 * s, 3 * s);
    }

    ctx.restore();
  }

  // 승천하는 천사 스프라이트
  private static drawAngel(ctx: CanvasRenderingContext2D, s: number, frame: number) {
    const wingFlap = Math.sin(frame * 0.3) * 3;

    // 천사 날개 (좌/우)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-10 * s, -6 * s + wingFlap, 7 * s, 4 * s, -0.4, 0, Math.PI * 2);
    ctx.ellipse(10 * s, -6 * s + wingFlap, 7 * s, 4 * s, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 천사 고리 (엔젤 링)
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.ellipse(0, -18 * s, 6 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 하얀 로브 (옷)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6 * s, -6 * s, 12 * s, 14 * s);

    // 얼굴 (편안하게 눈감은 표정)
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(-5 * s, -14 * s, 10 * s, 8 * s);
    ctx.fillStyle = '#555555';
    // 웃는 눈 (^^)
    ctx.fillRect(-3 * s, -10 * s, 2 * s, 1 * s);
    ctx.fillRect(2 * s, -10 * s, 2 * s, 1 * s);

    // 작은 골드 하프
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-2 * s, -1 * s, 4 * s, 5 * s);
  }

  // 피구공 렌더링 (일반 볼, 회전, 그림자, 마구 발광 이펙트)
  public static drawBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    z: number, // 공중 높이
    radius: number,
    rotation: number,
    color1: string = '#ff2222',
    color2: string = '#ffffff',
    isSuperShot: boolean = false,
    superShotType: string = ''
  ) {
    ctx.save();
    // 지면 그림자
    const shadowScale = Math.max(0.3, 1 - z / 200);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y, radius * shadowScale * 1.1, radius * shadowScale * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // 공 위치 (z만큼 위로)
    const ballY = y - z;

    // 슈퍼 샷 특수 연출 (잔상, 불꽃, 압축 등)
    if (isSuperShot) {
      this.drawSuperShotAura(ctx, x, ballY, radius, superShotType);
    }

    ctx.translate(x, ballY);
    ctx.rotate(rotation);

    if (isSuperShot && superShotType === 'compress') {
      // 압축 샷: 가로로 찌그러진 타원형 초고속 볼!
      ctx.scale(1.7, 0.6);
    }

    // 볼 외형
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = color1;
    ctx.fill();

    // 볼 시그니처 2톤 스트라이프 (회전 효과)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI);
    ctx.fillStyle = color2;
    ctx.fill();

    // 테두리
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // 하이라이트 광택
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-radius * 0.35, -radius * 0.35, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 마구 발광 오라 및 파티클 잔상 렌더링
  private static drawSuperShotAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    shotType: string
  ) {
    ctx.save();
    const time = performance.now() * 0.01;

    let glowColor = 'rgba(255, 60, 0, 0.6)';
    if (shotType === 'compress') glowColor = 'rgba(255, 230, 0, 0.8)';
    if (shotType === 'wave') glowColor = 'rgba(0, 180, 255, 0.8)';
    if (shotType === 'warp') glowColor = 'rgba(180, 0, 255, 0.8)';
    if (shotType === 'blizzard') glowColor = 'rgba(150, 240, 255, 0.8)';
    if (shotType === 'lightning') glowColor = 'rgba(255, 255, 0, 0.9)';

    // 방사형 에너지 펄스
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    const pulseR = radius * (1.6 + Math.sin(time) * 0.3);
    ctx.arc(x, y, pulseR, 0, Math.PI * 2);
    ctx.fill();

    // 번개 / 스파크 효과
    if (shotType === 'lightning' || shotType === 'compress') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + time * 0.5;
        const lx = x + Math.cos(ang) * radius * 2;
        const ly = y + Math.sin(ang) * radius * 2;
        ctx.moveTo(x, y);
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  // 축구공 렌더링
  public static drawSoccerBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    z: number,
    radius: number,
    rotation: number
  ) {
    ctx.save();
    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(x, y - z);
    ctx.rotate(rotation);

    // 백색 구체
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5각형 오각형 흑색 패치 (텔스타 패턴)
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const ang = (i * 2 * Math.PI) / 5;
      const px = Math.cos(ang) * (radius * 0.45);
      const py = Math.sin(ang) * (radius * 0.45);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
