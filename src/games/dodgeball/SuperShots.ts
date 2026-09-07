// 마구 (Super Shot) 궤적 알고리즘 & 스펙 정의

export interface SuperShotDefinition {
  id: string;
  name: string;
  nameEn: string;
  speed: number;
  damage: number;
  color: string;
  calculateTrajectory: (
    time: number,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    direction: number
  ) => { x: number; y: number; z: number; visible: boolean };
}

export const SUPER_SHOTS: { [key: string]: SuperShotDefinition } = {
  // 1. 관통 압축 샷 (쿠니오): 광속 직선 + 가로 압축 + 막강한 데미지
  compress: {
    id: 'compress',
    name: '관통 압축 샷',
    nameEn: 'Compress Shot',
    speed: 16.5,
    damage: 38,
    color: '#ffcc00',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      const dx = (targetX - startX);
      const dy = (targetY - startY);
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, t / (dist / 16.5));
      const curX = startX + dx * progress;
      const curY = startY + dy * progress;
      const z = Math.sin(progress * Math.PI) * 15 + 10;
      return { x: curX, y: curY, z, visible: true };
    }
  },

  // 2. 분신 파도 샷 (리키): 위아래 사인파로 요동치며 돌진
  wave: {
    id: 'wave',
    name: '분신 파도 샷',
    nameEn: 'Wave Shot',
    speed: 13.0,
    damage: 32,
    color: '#00b0ff',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, t / (dist / 13.0));
      const curX = startX + dx * progress;
      // 상하 큰 파도 사인곡선
      const waveOffset = Math.sin(progress * Math.PI * 5) * 45;
      const curY = startY + dy * progress + waveOffset;
      const z = 12 + Math.abs(Math.sin(progress * Math.PI * 4)) * 18;
      return { x: curX, y: curY, z, visible: true };
    }
  },

  // 3. 워프 초광속 샷 (윌리엄): 중간에 투명화되어 사라졌다가 코앞 출현
  warp: {
    id: 'warp',
    name: '워프 초광속 샷',
    nameEn: 'Warp Sonic Shot',
    speed: 18.0,
    damage: 42,
    color: '#d500f9',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, t / (dist / 18.0));
      // 30% ~ 70% 구간 투명화
      const isHidden = progress > 0.25 && progress < 0.75;
      const curX = startX + dx * progress;
      const curY = startY + dy * progress;
      const z = 14;
      return { x: curX, y: curY, z, visible: !isHidden };
    }
  },

  // 4. 곡선 부유 바나나 샷 (샨카): 공중 정지 후 급격한 곡선 가속
  curved: {
    id: 'curved',
    name: '곡선 부유 바나나 샷',
    nameEn: 'Curved Shot',
    speed: 12.0,
    damage: 30,
    color: '#ff9100',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      // 12~24 프레임 구간 정지
      let effectiveT = t;
      let hovering = false;
      if (t > 10 && t < 26) {
        effectiveT = 10;
        hovering = true;
      } else if (t >= 26) {
        effectiveT = t - 16;
      }
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, effectiveT / (dist / 15.0));
      const curX = startX + dx * progress;
      // 호를 그리는 커브
      const curveY = Math.sin(progress * Math.PI) * 60 * dir;
      const curY = startY + dy * progress + curveY;
      const z = hovering ? 28 + Math.sin(t * 0.4) * 4 : 15;
      return { x: curX, y: curY, z, visible: true };
    }
  },

  // 5. 블리자드 헤비 샷 (헬기): 얼음판을 긁는 묵직한 돌진
  blizzard: {
    id: 'blizzard',
    name: '블리자드 헤비 샷',
    nameEn: 'Blizzard Heavy Shot',
    speed: 14.0,
    damage: 35,
    color: '#00e5ff',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, t / (dist / 14.0));
      const curX = startX + dx * progress;
      const curY = startY + dy * progress;
      const z = 4; // 바닥에 깔려서 질주
      return { x: curX, y: curY, z, visible: true };
    }
  },

  // 6. 번개 지그재그 샷 (그린): 꺾어지는 궤적
  lightning: {
    id: 'lightning',
    name: '번개 지그재그 샷',
    nameEn: 'Lightning Shot',
    speed: 15.0,
    damage: 34,
    color: '#ffea00',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, t / (dist / 15.0));
      const curX = startX + dx * progress;
      // 꺾인 지그재그 스텝
      const zigStep = Math.floor(progress * 6) % 2 === 0 ? 30 : -30;
      const curY = startY + dy * progress + zigStep;
      const z = 15 + ((Math.floor(progress * 8) % 2) * 10);
      return { x: curX, y: curY, z, visible: true };
    }
  },

  // 7. 부메랑 바운드 샷 (응고모): 상공으로 솟구쳤다가 뚝 떨어짐
  boomerang: {
    id: 'boomerang',
    name: '부메랑 바운드 샷',
    nameEn: 'Boomerang Shot',
    speed: 13.5,
    damage: 33,
    color: '#ff6d00',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, t / (dist / 13.5));
      const curX = startX + dx * progress;
      const curY = startY + dy * progress;
      // 높은 포물선 궤적
      const z = Math.sin(progress * Math.PI) * 90 + 10;
      return { x: curX, y: curY, z, visible: true };
    }
  },

  // 8. 스네이크 승천 샷 (왕): 좌우로 회오리치며 승천
  snake: {
    id: 'snake',
    name: '스네이크 승천 샷',
    nameEn: 'Snake Shot',
    speed: 14.0,
    damage: 35,
    color: '#e53935',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, t / (dist / 14.0));
      const curX = startX + dx * progress;
      const snakeX = Math.cos(progress * Math.PI * 6) * 20;
      const curY = startY + dy * progress + snakeX;
      const z = Math.sin(progress * Math.PI * 3) * 35 + 15;
      return { x: curX, y: curY, z, visible: true };
    }
  },

  // 9. 다크 블랙홀 샷 (섀도우): 암흑 파동
  shadow: {
    id: 'shadow',
    name: '다크 블랙홀 샷',
    nameEn: 'Dark Blackhole',
    speed: 17.0,
    damage: 45,
    color: '#aa00ff',
    calculateTrajectory: (t, startX, startY, targetX, targetY, dir) => {
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const progress = Math.min(1, t / (dist / 17.0));
      const curX = startX + dx * progress;
      const vortex = Math.sin(progress * Math.PI * 8) * (1 - progress) * 35;
      const curY = startY + dy * progress + vortex;
      const z = 15 + Math.cos(progress * Math.PI * 8) * 15;
      return { x: curX, y: curY, z, visible: true };
    }
  }
};
