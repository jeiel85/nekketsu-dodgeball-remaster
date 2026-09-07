// 팀 및 선수 로스터 스펙 정의

import { TEAM_PALETTES, TeamPalette } from '../../assets/Sprites';

export interface PlayerStats {
  id: string;
  name: string;
  isCaptain: boolean;
  position: 'infield_c' | 'infield_1' | 'infield_2' | 'outfield_top' | 'outfield_bot' | 'outfield_back';
  maxHp: number;
  power: number;       // 투구 속도 및 데미지 계수 (1~100)
  speed: number;       // 이동 속도
  catchSkill: number;  // 캐치 성공 확률 가중치 (1~100)
  superShotId: string; // 마구 ID (compress, wave, warp 등)
}

export interface TeamData {
  id: string;
  name: string;
  country: string;
  palette: TeamPalette;
  players: PlayerStats[];
}

export const TEAMS_DATA: { [key: string]: TeamData } = {
  japan_nekketsu: {
    id: 'japan_nekketsu',
    name: '열혈고교 (NEKKETSU)',
    country: '일본 (Japan)',
    palette: TEAM_PALETTES.japan_nekketsu,
    players: [
      { id: 'kunio', name: '쿠니오', isCaptain: true, position: 'infield_c', maxHp: 120, power: 95, speed: 4.6, catchSkill: 88, superShotId: 'compress' },
      { id: 'hiroshi', name: '히로시', isCaptain: false, position: 'infield_1', maxHp: 90, power: 75, speed: 4.2, catchSkill: 78, superShotId: 'compress' },
      { id: 'koji', name: '코지', isCaptain: false, position: 'infield_2', maxHp: 85, power: 70, speed: 4.8, catchSkill: 72, superShotId: 'wave' },
      { id: 'shinichi', name: '신이치', isCaptain: false, position: 'outfield_top', maxHp: 80, power: 68, speed: 4.2, catchSkill: 70, superShotId: 'compress' },
      { id: 'mitsuhiro', name: '미츠히로', isCaptain: false, position: 'outfield_bot', maxHp: 80, power: 65, speed: 4.4, catchSkill: 70, superShotId: 'wave' },
      { id: 'kenichi', name: '켄이치', isCaptain: false, position: 'outfield_back', maxHp: 80, power: 72, speed: 4.3, catchSkill: 75, superShotId: 'compress' }
    ]
  },
  japan_hanazono: {
    id: 'japan_hanazono',
    name: '하나조노고교 (HANAZONO)',
    country: '일본 (Japan)',
    palette: TEAM_PALETTES.japan_hanazono,
    players: [
      { id: 'riki', name: '리키', isCaptain: true, position: 'infield_c', maxHp: 115, power: 92, speed: 4.5, catchSkill: 85, superShotId: 'wave' },
      { id: 'toru', name: '토오루', isCaptain: false, position: 'infield_1', maxHp: 88, power: 74, speed: 4.3, catchSkill: 75, superShotId: 'wave' },
      { id: 'akira', name: '아키라', isCaptain: false, position: 'infield_2', maxHp: 82, power: 72, speed: 4.5, catchSkill: 70, superShotId: 'compress' },
      { id: 'masahiro', name: '마사히로', isCaptain: false, position: 'outfield_top', maxHp: 80, power: 68, speed: 4.1, catchSkill: 70, superShotId: 'wave' },
      { id: 'shinji', name: '신지', isCaptain: false, position: 'outfield_bot', maxHp: 80, power: 66, speed: 4.2, catchSkill: 70, superShotId: 'wave' },
      { id: 'tatsuya', name: '타츠야', isCaptain: false, position: 'outfield_back', maxHp: 80, power: 70, speed: 4.2, catchSkill: 72, superShotId: 'wave' }
    ]
  },
  england: {
    id: 'england',
    name: '영국 대표팀 (ENGLAND)',
    country: '영국 (England)',
    palette: TEAM_PALETTES.england,
    players: [
      { id: 'green', name: '그린', isCaptain: true, position: 'infield_c', maxHp: 125, power: 88, speed: 4.7, catchSkill: 82, superShotId: 'lightning' },
      { id: 'james', name: '제임스', isCaptain: false, position: 'infield_1', maxHp: 95, power: 76, speed: 4.3, catchSkill: 74, superShotId: 'lightning' },
      { id: 'george', name: '조지', isCaptain: false, position: 'infield_2', maxHp: 90, power: 72, speed: 4.4, catchSkill: 75, superShotId: 'compress' },
      { id: 'oliver', name: '올리버', isCaptain: false, position: 'outfield_top', maxHp: 85, power: 68, speed: 4.2, catchSkill: 70, superShotId: 'lightning' },
      { id: 'harry', name: '해리', isCaptain: false, position: 'outfield_bot', maxHp: 85, power: 66, speed: 4.3, catchSkill: 70, superShotId: 'lightning' },
      { id: 'jack', name: '잭', isCaptain: false, position: 'outfield_back', maxHp: 85, power: 72, speed: 4.4, catchSkill: 72, superShotId: 'lightning' }
    ]
  },
  india: {
    id: 'india',
    name: '인도 대표팀 (INDIA)',
    country: '인도 (India)',
    palette: TEAM_PALETTES.india,
    players: [
      { id: 'shankar', name: '샨카', isCaptain: true, position: 'infield_c', maxHp: 120, power: 85, speed: 4.6, catchSkill: 86, superShotId: 'curved' },
      { id: 'rajesh', name: '라제쉬', isCaptain: false, position: 'infield_1', maxHp: 92, power: 74, speed: 4.4, catchSkill: 78, superShotId: 'curved' },
      { id: 'amit', name: '아밋', isCaptain: false, position: 'infield_2', maxHp: 86, power: 70, speed: 4.5, catchSkill: 74, superShotId: 'curved' },
      { id: 'vikram', name: '비크람', isCaptain: false, position: 'outfield_top', maxHp: 80, power: 68, speed: 4.2, catchSkill: 70, superShotId: 'curved' },
      { id: 'arjun', name: '아르준', isCaptain: false, position: 'outfield_bot', maxHp: 80, power: 65, speed: 4.3, catchSkill: 70, superShotId: 'curved' },
      { id: 'sanjay', name: '산제이', isCaptain: false, position: 'outfield_back', maxHp: 80, power: 70, speed: 4.4, catchSkill: 72, superShotId: 'curved' }
    ]
  },
  iceland: {
    id: 'iceland',
    name: '아이슬란드 대표팀 (ICELAND)',
    country: '아이슬란드 (Iceland)',
    palette: TEAM_PALETTES.iceland,
    players: [
      { id: 'helgi', name: '헬기', isCaptain: true, position: 'infield_c', maxHp: 135, power: 94, speed: 4.2, catchSkill: 88, superShotId: 'blizzard' },
      { id: 'jon', name: '욘', isCaptain: false, position: 'infield_1', maxHp: 105, power: 80, speed: 4.0, catchSkill: 80, superShotId: 'blizzard' },
      { id: 'einar', name: '에이나르', isCaptain: false, position: 'infield_2', maxHp: 98, power: 76, speed: 4.1, catchSkill: 76, superShotId: 'blizzard' },
      { id: 'olafur', name: '올라푸르', isCaptain: false, position: 'outfield_top', maxHp: 85, power: 70, speed: 4.0, catchSkill: 72, superShotId: 'blizzard' },
      { id: 'bjorn', name: '비요른', isCaptain: false, position: 'outfield_bot', maxHp: 85, power: 68, speed: 4.0, catchSkill: 72, superShotId: 'blizzard' },
      { id: 'sigurd', name: '시구르드', isCaptain: false, position: 'outfield_back', maxHp: 85, power: 75, speed: 4.1, catchSkill: 74, superShotId: 'blizzard' }
    ]
  },
  china: {
    id: 'china',
    name: '중국 대표팀 (CHINA)',
    country: '중국 (China)',
    palette: TEAM_PALETTES.china,
    players: [
      { id: 'wang', name: '왕', isCaptain: true, position: 'infield_c', maxHp: 125, power: 90, speed: 4.8, catchSkill: 85, superShotId: 'snake' },
      { id: 'li', name: '리', isCaptain: false, position: 'infield_1', maxHp: 95, power: 77, speed: 4.6, catchSkill: 78, superShotId: 'snake' },
      { id: 'zhang', name: '장', isCaptain: false, position: 'infield_2', maxHp: 90, power: 74, speed: 4.7, catchSkill: 75, superShotId: 'compress' },
      { id: 'chen', name: '첸', isCaptain: false, position: 'outfield_top', maxHp: 85, power: 70, speed: 4.5, catchSkill: 70, superShotId: 'snake' },
      { id: 'liu', name: '류', isCaptain: false, position: 'outfield_bot', maxHp: 85, power: 68, speed: 4.5, catchSkill: 70, superShotId: 'snake' },
      { id: 'yang', name: '양', isCaptain: false, position: 'outfield_back', maxHp: 85, power: 73, speed: 4.6, catchSkill: 74, superShotId: 'snake' }
    ]
  },
  kenya: {
    id: 'kenya',
    name: '케냐 대표팀 (KENYA)',
    country: '케냐 (Kenya)',
    palette: TEAM_PALETTES.kenya,
    players: [
      { id: 'ngomo', name: '응고모', isCaptain: true, position: 'infield_c', maxHp: 130, power: 92, speed: 5.2, catchSkill: 82, superShotId: 'boomerang' },
      { id: 'kofi', name: '코피', isCaptain: false, position: 'infield_1', maxHp: 96, power: 78, speed: 5.0, catchSkill: 76, superShotId: 'boomerang' },
      { id: 'kamau', name: '카마우', isCaptain: false, position: 'infield_2', maxHp: 90, power: 75, speed: 5.1, catchSkill: 74, superShotId: 'wave' },
      { id: 'mwangi', name: '므왕기', isCaptain: false, position: 'outfield_top', maxHp: 85, power: 70, speed: 4.8, catchSkill: 72, superShotId: 'boomerang' },
      { id: 'otieno', name: '오티에노', isCaptain: false, position: 'outfield_bot', maxHp: 85, power: 68, speed: 4.9, catchSkill: 72, superShotId: 'boomerang' },
      { id: 'maina', name: '마이나', isCaptain: false, position: 'outfield_back', maxHp: 85, power: 74, speed: 4.9, catchSkill: 74, superShotId: 'boomerang' }
    ]
  },
  usa: {
    id: 'usa',
    name: '미국 대표팀 (USA)',
    country: '미국 (USA)',
    palette: TEAM_PALETTES.usa,
    players: [
      { id: 'william', name: '윌리엄', isCaptain: true, position: 'infield_c', maxHp: 145, power: 98, speed: 4.8, catchSkill: 90, superShotId: 'warp' },
      { id: 'john', name: '존', isCaptain: false, position: 'infield_1', maxHp: 110, power: 84, speed: 4.6, catchSkill: 84, superShotId: 'warp' },
      { id: 'mike', name: '마이크', isCaptain: false, position: 'infield_2', maxHp: 105, power: 82, speed: 4.7, catchSkill: 82, superShotId: 'compress' },
      { id: 'tom', name: '톰', isCaptain: false, position: 'outfield_top', maxHp: 90, power: 75, speed: 4.4, catchSkill: 76, superShotId: 'warp' },
      { id: 'david', name: '데이비드', isCaptain: false, position: 'outfield_bot', maxHp: 90, power: 72, speed: 4.5, catchSkill: 76, superShotId: 'warp' },
      { id: 'chris', name: '크리스', isCaptain: false, position: 'outfield_back', maxHp: 90, power: 78, speed: 4.5, catchSkill: 78, superShotId: 'warp' }
    ]
  },
  shadow: {
    id: 'shadow',
    name: '섀도우 팀 (SHADOW)',
    country: '미러 월드 (Mirror World)',
    palette: TEAM_PALETTES.shadow,
    players: [
      { id: 'shadow_kunio', name: '섀도우 쿠니오', isCaptain: true, position: 'infield_c', maxHp: 160, power: 100, speed: 5.4, catchSkill: 94, superShotId: 'shadow' },
      { id: 'shadow_riki', name: '섀도우 리키', isCaptain: false, position: 'infield_1', maxHp: 130, power: 92, speed: 5.0, catchSkill: 88, superShotId: 'shadow' },
      { id: 'shadow_william', name: '섀도우 윌리엄', isCaptain: false, position: 'infield_2', maxHp: 125, power: 90, speed: 5.1, catchSkill: 86, superShotId: 'shadow' },
      { id: 'shadow_s1', name: '섀도우 1', isCaptain: false, position: 'outfield_top', maxHp: 100, power: 80, speed: 4.8, catchSkill: 80, superShotId: 'shadow' },
      { id: 'shadow_s2', name: '섀도우 2', isCaptain: false, position: 'outfield_bot', maxHp: 100, power: 78, speed: 4.8, catchSkill: 80, superShotId: 'shadow' },
      { id: 'shadow_s3', name: '섀도우 3', isCaptain: false, position: 'outfield_back', maxHp: 100, power: 85, speed: 4.9, catchSkill: 82, superShotId: 'shadow' }
    ]
  }
};
