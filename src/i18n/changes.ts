// "What's different" + running notes page, localized (en/ko). Kept in its own
// module (like the guide) so it stays easy to append to as features land.
// Inline markup follows the <Rich> convention: `code`, **bold**.

export interface DiffItem {
  title: string;
  body: string;
}
export interface LogEntry {
  date: string; // ISO, locale-neutral (e.g. "2026-06-06")
  title: string;
  items: string[];
}

export interface ChangesContent {
  back: string;
  openEditor: string;
  title: string;
  subtitle: string;
  originNote: string;
  diffTitle: string;
  diffs: DiffItem[];
  logTitle: string;
  logIntro: string;
  log: LogEntry[];
  backHome: string;
  openEditorCta: string;
}

export const changesEn: ChangesContent = {
  back: "← Back to Chara Studio",
  openEditor: "Open Editor",
  title: "What's Different — and What's New",
  subtitle:
    "How Chara Studio differs from the original Chara Snap, plus a running log of changes as features land.",
  originNote:
    "Chara Studio is an independent, clean-room reconstruction of the original Chara Snap (charasnap.com), built because it ships no public source and its author could not be reached. It is **not affiliated** with the original and will be taken down on request — see the home page for the full notice.",
  diffTitle: "Differences from the original",
  diffs: [
    {
      title: "Real CHARX, not a stub",
      body: "The original exposed CHARX in the UI but never implemented it. Chara Studio reads and writes real `.charx` ZIP archives with embedded assets, and leniently imports non-conformant files the way RisuAI does.",
    },
    {
      title: "In-editor asset workflow",
      body: "Upload images and files directly in the Assets tab, embed them into CHARX exports, and preview thumbnails — including the character's main icon.",
    },
    {
      title: "Truly zero-network",
      body: "Everything is bundled and served from one origin: no CDN, no web fonts over the wire, no telemetry. Even the Raw JSON editor and the display font are self-hosted.",
    },
    {
      title: "Bilingual (English / 한국어)",
      body: "The entire interface — and the full guide — switches language with one toggle. The original was English-only.",
    },
    {
      title: "Light, dark, and system themes",
      body: "A theme-aware token system follows your OS or your manual choice, with no flash on load.",
    },
    {
      title: "A distinct identity",
      body: "Chara Studio has its own brand: a warm persimmon accent, a self-hosted display typeface, and a refreshed component style — documented in `DESIGN.md`.",
    },
    {
      title: "Fuller V3 support",
      body: "Lorebook `use_regex`, custom `x_` asset types, group-only greetings, multilingual creator notes, and source links are all editable and preserved on export.",
    },
  ],
  logTitle: "Change log",
  logIntro: "Newest first. New features land here as they're built.",
  log: [
    {
      date: "2026-06-06",
      title: "Initial reconstruction",
      items: [
        "Rebuilt the original feature set as a static, client-only app: PNG / JSON / CHARX import and export, a seven-tab editor, lorebook, live validation, and token estimates.",
        "Added real CHARX with embedded-asset round-trip and lenient import of non-conformant files.",
        "Localized the interface and the full guide (English / Korean) and added light / dark / system theming.",
        "Launched the Chara Studio identity: a persimmon accent and a self-hosted display font, captured in `DESIGN.md`.",
      ],
    },
  ],
  backHome: "← Back to home",
  openEditorCta: "Open the Editor →",
};

export const changesKo: ChangesContent = {
  back: "← Chara Studio로 돌아가기",
  openEditor: "에디터 열기",
  title: "무엇이 다른가 — 그리고 무엇이 새로운가",
  subtitle:
    "Chara Studio가 원본 Chara Snap과 어떻게 다른지, 그리고 기능이 추가될 때마다 기록하는 변경 노트입니다.",
  originNote:
    "Chara Studio는 원본 Chara Snap(charasnap.com)을 독립적으로 다시 만든 재구성판입니다. 공개 소스가 없고 제작자와 연락이 닿지 않아 부득이 만들었습니다. 원본과 **제휴 관계가 아니며** 요청 시 삭제됩니다 — 전체 고지는 홈 화면을 참고하세요.",
  diffTitle: "원본과의 차이점",
  diffs: [
    {
      title: "스텁이 아닌 진짜 CHARX",
      body: "원본은 UI에 CHARX를 노출했지만 구현하지는 않았습니다. Chara Studio는 에셋이 임베드된 진짜 `.charx` ZIP 아카이브를 읽고 쓰며, RisuAI처럼 규격에 맞지 않는 파일도 관용적으로 가져옵니다.",
    },
    {
      title: "에디터 내 에셋 워크플로",
      body: "에셋 탭에서 이미지와 파일을 바로 업로드해 CHARX 내보내기에 임베드하고, 캐릭터의 메인 아이콘을 포함한 썸네일을 미리볼 수 있습니다.",
    },
    {
      title: "진정한 네트워크 제로",
      body: "모든 것이 번들되어 단일 출처에서 제공됩니다: CDN 없음, 외부 웹폰트 없음, 텔레메트리 없음. 원본 JSON 에디터와 디스플레이 폰트까지 self-host입니다.",
    },
    {
      title: "이중 언어 (English / 한국어)",
      body: "전체 인터페이스와 가이드 전문이 토글 하나로 언어가 바뀝니다. 원본은 영어 전용이었습니다.",
    },
    {
      title: "라이트 · 다크 · 시스템 테마",
      body: "테마 인식 토큰 시스템이 OS 설정이나 수동 선택을 따르며, 로딩 시 깜빡임이 없습니다.",
    },
    {
      title: "고유한 정체성",
      body: "Chara Studio는 고유 브랜드를 가집니다: 따뜻한 페르시몬 accent, self-host 디스플레이 서체, 다듬어진 컴포넌트 스타일 — `DESIGN.md`에 문서화되어 있습니다.",
    },
    {
      title: "더 완전한 V3 지원",
      body: "로어북 `use_regex`, 커스텀 `x_` 에셋 타입, 그룹 전용 인사말, 다국어 제작자 노트, 소스 링크를 모두 편집할 수 있고 내보낼 때 보존됩니다.",
    },
  ],
  logTitle: "변경 노트",
  logIntro: "최신순입니다. 새 기능이 만들어질 때마다 여기에 기록됩니다.",
  log: [
    {
      date: "2026-06-06",
      title: "최초 재구성",
      items: [
        "원본 기능 전체를 정적·클라이언트 전용 앱으로 재구축: PNG / JSON / CHARX 가져오기·내보내기, 7개 탭 에디터, 로어북, 실시간 검증, 토큰 추정.",
        "에셋 임베드 라운드트립을 지원하는 진짜 CHARX와 비규격 파일의 관용적 임포트를 추가.",
        "인터페이스와 가이드 전문을 현지화(영어 / 한국어)하고 라이트 / 다크 / 시스템 테마를 추가.",
        "Chara Studio 정체성 도입: 페르시몬 accent와 self-host 디스플레이 폰트, `DESIGN.md`에 정리.",
      ],
    },
  ],
  backHome: "← 홈으로 돌아가기",
  openEditorCta: "에디터 열기 →",
};
