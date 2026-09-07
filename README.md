# 熱血高校 돗지볼부 & 축구편 웹 리마스터 (Nekketsu Dodgeball & Soccer Remaster)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Play_Now-brightgreen?style=for-the-badge&logo=github)](https://jeiel85.github.io/pigu/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-8bit_Chiptune-orange?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

> **"쿠니오와 리키의 전설이 웹에서 되살아난다!"**  
> 패미컴(NES) 시절 오락실과 안방을 뜨겁게 달구었던 전설의 명작 **열혈고교 돗지볼부(Super Dodge Ball)**와 **열혈 축구(Nintendo World Cup)**를 별도 에뮬레이터나 롬 파일 없이 웹 브라우저에서 즉시 플레이할 수 있도록 100% 이식 및 리마스터한 프로젝트입니다.

---

## 🎮 [지금 바로 브라우저에서 플레이하기 (Live Demo)](https://jeiel85.github.io/pigu/)

---

## ✨ 핵심 이식 & 리마스터 특징 (100% 구현)

### 1. 전설의 고유 마구 (Super Shot) 완벽 재현
- **쿠니오 (열혈고교)**: **관통 압축 샷 (Compress Shot)** - 공이 납작해지며 초광속으로 직선 관통, 뒤쪽 적들까지 도미노 타격!
- **리키 (하나조노)**: **분신 파도 샷 (Wave Shot)** - 공이 3개로 분신하며 물결치듯 사인파 궤적으로 적을 교란!
- **윌리엄 (미국)**: **워프 초광속 샷 (Warp Sonic Shot)** - 발사 직후 투명화되어 허공으로 사라졌다가 적 코앞에서 가속 폭발!
- **샨카 (인도)**: **곡선 부유 바나나 샷 (Curved Shot)** - 공중에 정지했다가 급격한 U턴 궤적으로 강타!
- **헬기 (아이슬란드)**: **블리자드 헤비 샷 (Blizzard Heavy Shot)** - 지면을 긁으며 얼음 파티클과 함께 적을 날려버리는 중량탄!
- **그린 (영국)**: **번개 지그재그 샷 (Lightning Shot)** - Z자 번개 궤적으로 적의 캐치 타이밍을 무너뜨림!
- **응고모 (케냐)**: **부메랑 바운드 샷 (Boomerang Shot)** - 하늘 높이 솟구쳤다가 급강하!
- **왕 (중국)**: **스네이크 승천 샷 (Snake Shot)** - 뱀처럼 휘감기며 상승 후 낙하!
- **섀도우 (미러 월드)**: **다크 블랙홀 샷 (Dark Blackhole)** - 암흑 소용돌이 흡인 타격!

### 2. 열혈 시그니처 연출 & 물리 엔진
- **천국 승천 (Angel Ascending)**: 체력(HP)이 0이 되면 천사가 되어 하프를 연주하며 하늘로 승천하는 명장면 완벽 재현!
- **볼링핀 연쇄 도미노 충돌**: 마구를 맞고 빙글빙글 회전하며 날아간 선수가 다른 선수와 부딪히면 함께 쓰러지는 물리 효과!
- **외야수 삼각 패스 & 등 뒤 기습 슛**: 상대 진영 3면(상단, 하단, 후방)을 둘러싼 외야수들과의 협공 플레이!
- **타격감 극대화**: 묵직한 카메라 쉐이크(Screen Shake), 2프레임 히트스톱(Hit Stop), 흙먼지 및 스파크 파티클.

### 3. 전 세계 8개 스테이지 환경 기믹
1. **일본 (도쿄 옥상)**: 표준 밸런스 코트 & 후지산 원경
2. **영국 (런던 타워브리지)**: 비 내리는 잔디밭 (빗방울 파티클, 가벼운 미끄러짐)
3. **인도 (타지마할 진흙탕)**: 진흙탕 코트 (이동 속도 및 점프력 저하)
4. **아이슬란드 (빙하 코트)**: 마찰계수 0.985의 극한 빙판! 끝없는 스케이팅 미끄러짐
5. **중국 (천안문 광장)**: 단단한 석판 자갈 바닥과 빠른 볼 구름
6. **케냐 (사바나)**: 모래바람과 기린/아카시아 배경
7. **미국 (브루클린 스트리트)**: 고탄성 아스팔트 반발력
8. **섀도우 (사이버 아레나)**: 시공간 균열 네온 돔

### 4. 열혈 축구 특별 모드 (Nekketsu Soccer Special)
- 4 vs 4 길거리 스트리트 축구 수록
- **살인 슬라이딩 태클**: 상대 선수를 날려버리고 볼을 빼앗는 거친 액션!
- **바나나 마구 슛 & 오버헤드 킥**: 골키퍼를 뚫고 골망을 흔드는 쾌감!

### 5. 100% Web Audio API 신디사이저 사운드 엔진
- 외부 MP3/WAV 파일 의존 없이 **순수 코드로 실시간 합성(Synthesized)되는 NES 2A03 칩튠 사운드**
- 열혈 오프닝 메인 테마, 경기 배틀 테마, 월드 스테이지 테마, 최종 보스 테마, 축구 테마, 승리 팡파레
- 심판 휘슬, 마구 발사음, 호쾌한 타격음, 캐치음, 천사 승천 차임벨

---

## 🕹️ 조작 방법 (Controls)

### 1P 플레이어 (키보드)
| 액션 | 키 바인딩 |
|---|---|
| **이동** | `W`, `A`, `S`, `D` |
| **슛 / 공격** | `K` (또는 `X`) |
| **패스 / 캐치 / 웅크리기** | `J` (또는 `Z`) |
| **대시 (전력 질주)** | `SPACE` (또는 방향키 더블 탭) |
| **점프** | `SHIFT` (또는 `J` + `K` 동시 누름) |
| **일시정지 / 뒤로** | `ESC` 또는 `P` |

### 2P 플레이어 (로컬 대전 시)
| 액션 | 키 바인딩 |
|---|---|
| **이동** | 방향키 (`▲`, `◀`, `▼`, `▶`) |
| **슛** | `Num 2` (또는 `M`) |
| **패스 / 캐치** | `Num 1` (또는 `N`) |
| **대시** | `Num 0` (또는 `B`) |
| **점프** | `Num 3` (또는 `,`) |

> 💡 **모바일 & 태블릿 지원**: 스마트폰이나 태블릿 접속 시 온스크린 가상 조이패드가 자동으로 활성화됩니다.  
> 💡 **게임패드(Controller) 지원**: XBOX / DualShock / 일반 USB 패드를 연결하면 즉시 자동 인식됩니다.

---

## ⚡ 마구(슈퍼 샷) 발동 비기 가이드
- **【지상 마구】**: `SPACE`를 누른 채 전력 질주(대시)하며 3~4번째 걸음 타이밍에 `K` 슛을 누릅니다.
- **【공중 점프 마구】**: 대시 중 점프하여 최고 정점에 도달하는 순간 `K` 슛을 누릅니다.

---

## 🛠️ 개발 및 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/jeiel85/pigu.git
cd pigu

# 2. 의존성 설치
npm install

# 3. 로컬 개발 서버 실행
npm run dev

# 4. 프로덕션 빌드
npm run build
```

---

## 📄 라이선스
MIT License.
Original Nekketsu series concept & inspiration © Technōs Japan.
Web Engine & Remaster Code by jeiel85.
