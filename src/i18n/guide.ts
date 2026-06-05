// Guide-page content, localized (en/ko). Kept out of the main dictionaries
// because it's long-form prose. Inline markup convention used by the page's
// <Rich> renderer: `code` → <code>, **bold** → <strong>. Field codes, anchor
// ids, {{char}}/{{user}}/<START> and spec names stay literal in every locale.

export interface GuideField {
  name: string;
  code: string;
  body: string;
}
export interface GuideNamed {
  name: string;
  body: string;
}

export interface GuideContent {
  back: string;
  openEditor: string;
  title: string;
  subtitle: string;
  toc: string[]; // aligned to SECTION_IDS order in guide.tsx
  s1: { heading: string; paras: string[] };
  s2: {
    heading: string;
    editTitle: string;
    edit: string[];
    createTitle: string;
    create: string[];
    tryTitle: string;
    tryBody: string;
  };
  s3: { heading: string; fields: GuideField[] };
  s4: {
    heading: string;
    intro: string;
    howTitle: string;
    howBody: string;
    fieldsTitle: string;
    fields: GuideNamed[];
  };
  s5: {
    heading: string;
    head: string[];
    rows: string[][];
    note: string;
  };
  s6: { heading: string; tips: GuideNamed[] };
  s7: {
    heading: string;
    pngTitle: string;
    pngBody: string;
    altTitle: string;
    altBody: string;
    whereTitle: string;
    where: string[];
  };
  backHome: string;
  openEditorCta: string;
}

export const guideEn: GuideContent = {
  back: "← Back to Chara Studio",
  openEditor: "Open Editor",
  title: "How to Create & Edit SillyTavern Character Cards",
  subtitle:
    "A comprehensive reference for creating AI character cards — from your first card to advanced lorebook setups.",
  toc: [
    "1. What is a Character Card?",
    "2. Getting Started with Chara Studio",
    "3. Understanding Character Card Fields",
    "4. Working with Lorebooks",
    "5. V2 vs V3 (CHARX) Format",
    "6. Tips for Writing Better Character Cards",
    "7. Exporting and Sharing Your Cards",
  ],
  s1: {
    heading: "1. What is a Character Card?",
    paras: [
      "A character card is a PNG image that doubles as a complete AI character definition. The character data — name, description, personality, example dialogue, and prompts — is stored as JSON inside a `tEXt` metadata chunk in the PNG. Because it's just an image file, you can share it anywhere and import it into any compatible app.",
      "The most widely supported format is the Character Card V2 specification, popularized by SillyTavern. A newer V3 (CHARX) spec adds assets and a few extra fields. Chara Studio reads and writes both.",
    ],
  },
  s2: {
    heading: "2. Getting Started with Chara Studio",
    editTitle: "Editing an existing card",
    edit: [
      "Drag a PNG (or JSON/CHARX) card onto the drop zone on the home page.",
      "The editor opens with every field populated from the card.",
      "Make your changes across the tabs.",
      "Click **Export** to download the updated card.",
    ],
    createTitle: "Creating a new card from scratch",
    create: [
      "Click **Create New** on the home page.",
      "Give your character a **Name**.",
      "Write a **Description** — the core of the character.",
      "Add a **First Message** to open the conversation.",
      "Upload an avatar image, then export.",
    ],
    tryTitle: "Try an example",
    tryBody:
      "Not sure where to begin? Load one of the bundled examples — Megumin, Rem, or Sherlock Holmes — to see how a complete card is structured.",
  },
  s3: {
    heading: "3. Understanding Character Card Fields",
    fields: [
      ["Name", "name", "The character's display name. Chat apps show this in the conversation interface and use it for the {{char}} placeholder. Keep it simple — a name, not a title with parenthetical qualifiers."],
      ["Description", "description", "The core definition of who the character is. This is the main block of text that tells the AI what to roleplay: personality traits, appearance, backstory, mannerisms, speech patterns. Usually the longest and most important field."],
      ["Personality", "personality", "A short personality summary. Some apps inject this as a separate block. If you already covered personality in the description, you can leave this empty or use a terse bullet-point recap (e.g. 'cynical, witty, loyal, hates mornings')."],
      ["Scenario", "scenario", "Sets the scene — where and when the conversation takes place. For example: 'You meet {{char}} in a crowded marketplace at dusk.' This gives both the AI and the user a starting context."],
      ["First Message", "first_mes", "The character's opening message when a new chat begins. Crucial — it sets the tone, establishes the scenario in action, and shows the character's voice. A good first message demonstrates how the character talks rather than just describing them. Use *asterisks for actions*."],
      ["Example Messages", "mes_example", "Sample conversations that show the AI how the character talks. Format them as dialogue using {{char}} and {{user}} placeholders, separated by <START> tags. These are few-shot examples — two or three quality examples are worth more than ten mediocre ones."],
      ["System Prompt", "system_prompt", "Instructions prepended as a system message. If set, this overrides the chat app's default system prompt. Use it when the character needs specific instructions the user shouldn't have to configure manually."],
      ["Post-History Instructions", "post_history_instructions", "Instructions injected after the conversation history, right before the AI generates its response. In SillyTavern this is the 'jailbreak' / Author's Note insertion point. Use it for reminders the AI should consider as it writes."],
      ["Depth Prompt", "depth_prompt", "A prompt injected at a specific depth in the conversation. The 'depth' value controls how many messages from the bottom it appears — depth=4 means 4 messages before the most recent. The 'role' field sets whether it appears as a system, user, or assistant message."],
      ["Talkativeness", "talkativeness", "A number from 0.0 to 1.0 that hints at response length. 0.0 = very terse, 1.0 = very verbose. Default is 0.5. Not all apps use this field, but apps that do will scale output length accordingly."],
      ["Alternate Greetings", "alternate_greetings", "Additional first messages beyond the main one. Users can swipe between greetings to pick a different scenario or conversation start. Use these to offer variety — different moods, settings, or situations."],
      ["Creator Notes", "creator_notes", "Notes from you to anyone importing the card. Shown in card listings and import screens — not sent to the AI. Use it for usage tips, recommended settings, credit, NSFW warnings, or changelog notes."],
      ["Tags", "tags", "Comma-separated tags for categorization. Hosting platforms like Chub.ai use these for search and filtering. Include genre, character type, and setting — e.g. 'fantasy, female, elf, adventure, SFW'."],
      ["Creator", "creator", "Your name or handle. Shown in card listings on hosting platforms. Helps people find more of your cards."],
      ["Character Version", "character_version", "A version string for tracking revisions (e.g. '1.0', '2.3'). Useful when you update a card and want users to know which version they have."],
    ].map(([name, code, body]) => ({ name, code, body })),
  },
  s4: {
    heading: "4. Working with Lorebooks",
    intro:
      'A lorebook (also called a "world book" or "world info") is a collection of entries that get conditionally injected into the prompt when certain keywords appear in the conversation. Instead of cramming every world detail into the description, you put it in entries that only activate when relevant.',
    howTitle: "How lorebook entries work",
    howBody:
      'Each entry has **keywords** and **content**. When one of the keywords appears in recent chat history, the content gets injected into the prompt. For example, an entry with keywords "Blackwood Forest, the forest" would automatically appear when the conversation mentions those terms.',
    fieldsTitle: "Key lorebook fields",
    fields: [
      ["Keywords", "Comma-separated trigger words. If any appears in the recent conversation, the entry activates. Be specific — 'sword' will trigger on every mention of any sword."],
      ["Secondary Keywords", "When Selective mode is on, the entry only activates when both a primary AND a secondary keyword are present. This prevents false triggers."],
      ["Content", "The text injected into the prompt when the entry activates. Write this as information the AI should know, not as instructions (unless that's your intent)."],
      ["Insertion Order", "Controls the sequence when multiple entries activate at the same time. Lower numbers go first."],
      ["Priority", "When the prompt runs out of token budget, lower-priority entries get dropped first. Higher number = higher priority = more likely to survive trimming."],
      ["Constant", "If enabled, this entry is always injected regardless of keywords. Use sparingly — it consumes tokens every message."],
      ["Position", "Whether the entry is inserted before or after the character definition in the prompt."],
    ].map(([name, body]) => ({ name, body })),
  },
  s5: {
    heading: "5. V2 vs V3 (CHARX) Format",
    head: ["Aspect", "V2", "V3 (CHARX)"],
    rows: [
      ["Container", "PNG tEXt chunk", "ZIP archive (.charx)"],
      ["Assets", "Avatar only", "Multiple embedded assets"],
      ["Group greetings", "—", "Yes"],
      ["Nickname", "—", "Yes"],
      ["Multilingual notes", "—", "Yes"],
      ["App compatibility", "Very broad", "Growing"],
    ],
    note: "**Use V2** for maximum compatibility — if you're sharing on Chub.ai or CharacterHub and want it to work everywhere, V2 PNG is the safe choice. **Use V3** if you need multiple assets or V3-specific fields, and your target app supports it. Chara Studio exposes V3 fields in the editor and preserves them during export even inside a V2 PNG.",
  },
  s6: {
    heading: "6. Tips for Writing Better Character Cards",
    tips: [
      ["Show, don't tell", "Instead of 'She is sarcastic', write example dialogue that demonstrates sarcasm. The AI learns better from examples than from trait lists."],
      ["Write a strong first message", "Your first message does more work than any other field. A good one is 2–4 paragraphs that drop the user into an active situation, not a static description."],
      ["Use example messages effectively", "Example messages are few-shot learning for the AI. Show typical response style, vocabulary, and formatting. Include 2–3 exchanges covering different moods. Use {{char}} and {{user}} placeholders."],
      ["Don't overstuff the description", "Longer descriptions aren't always better. Every token competes with conversation history for context. Move world-building details into lorebook entries so they only appear when relevant."],
      ["Test with different models", "A card that works great with Claude might behave differently with GPT-4 or a local model. Test published cards with at least two different AI backends."],
      ["Use creator notes", "Tell users what model you tested with, recommended settings, and the card version. Good creator notes save users from guessing."],
    ].map(([name, body]) => ({ name, body })),
  },
  s7: {
    heading: "7. Exporting and Sharing Your Cards",
    pngTitle: "Export as PNG",
    pngBody:
      "The standard export. Chara Studio bakes your character data into the PNG as a V2-format `tEXt` chunk. The result is both a viewable image and a complete character definition — what you upload to hosting sites and import into chat apps.",
    altTitle: "Export as JSON or CHARX",
    altBody:
      "JSON exports just the character metadata without an image — useful for backups, diffing versions, or tools that accept raw JSON. CHARX bundles the V3 card plus any assets into a single ZIP archive.",
    whereTitle: "Where to share",
    where: [
      "**Chub.ai** — the largest character card hosting platform.",
      "**CharacterHub** — another popular site with ratings and collections.",
      "**Discord communities** — many AI roleplay servers have card-sharing channels.",
      "**Direct file sharing** — it's just a PNG, so share it anywhere.",
    ],
  },
  backHome: "← Back to home",
  openEditorCta: "Open the Editor →",
};

export const guideKo: GuideContent = {
  back: "← Chara Studio로 돌아가기",
  openEditor: "에디터 열기",
  title: "SillyTavern 캐릭터 카드 만들기 & 편집 가이드",
  subtitle:
    "첫 카드부터 고급 로어북 구성까지 — AI 캐릭터 카드 제작을 위한 종합 안내서.",
  toc: [
    "1. 캐릭터 카드란?",
    "2. Chara Studio 시작하기",
    "3. 캐릭터 카드 필드 이해하기",
    "4. 로어북 활용하기",
    "5. V2 vs V3 (CHARX) 포맷",
    "6. 더 나은 캐릭터 카드를 쓰는 팁",
    "7. 카드 내보내기와 공유하기",
  ],
  s1: {
    heading: "1. 캐릭터 카드란?",
    paras: [
      "캐릭터 카드는 완전한 AI 캐릭터 정의를 겸하는 PNG 이미지입니다. 이름, 설명, 성격, 예시 대화, 프롬프트 같은 캐릭터 데이터가 PNG의 `tEXt` 메타데이터 청크 안에 JSON으로 저장됩니다. 그냥 이미지 파일이므로 어디서든 공유하고 호환되는 앱으로 가져올 수 있습니다.",
      "가장 널리 지원되는 포맷은 SillyTavern이 대중화한 Character Card V2 사양입니다. 더 새로운 V3(CHARX) 사양은 에셋과 몇 가지 추가 필드를 더합니다. Chara Studio는 둘 다 읽고 씁니다.",
    ],
  },
  s2: {
    heading: "2. Chara Studio 시작하기",
    editTitle: "기존 카드 편집하기",
    edit: [
      "홈 화면의 드롭 영역에 PNG(또는 JSON/CHARX) 카드를 끌어다 놓습니다.",
      "카드의 모든 필드가 채워진 상태로 에디터가 열립니다.",
      "탭을 오가며 원하는 대로 수정합니다.",
      "**내보내기**를 눌러 수정된 카드를 다운로드합니다.",
    ],
    createTitle: "처음부터 새 카드 만들기",
    create: [
      "홈 화면에서 **새로 만들기**를 누릅니다.",
      "캐릭터에 **이름**을 지어 줍니다.",
      "**설명**을 작성합니다 — 캐릭터의 핵심입니다.",
      "대화를 여는 **첫 메시지**를 추가합니다.",
      "아바타 이미지를 업로드한 뒤 내보냅니다.",
    ],
    tryTitle: "예제로 시작해 보기",
    tryBody:
      "어디서 시작할지 모르겠다면, 기본 제공 예제(메구밍, 렘, 셜록 홈즈) 중 하나를 불러와 완성된 카드가 어떻게 구성되는지 살펴보세요.",
  },
  s3: {
    heading: "3. 캐릭터 카드 필드 이해하기",
    fields: [
      ["이름", "name", "캐릭터의 표시 이름입니다. 채팅 앱은 대화 인터페이스에 이 이름을 보여 주고 {{char}} 자리표시자에 사용합니다. 단순하게 — 괄호 수식어가 붙은 제목이 아니라 이름으로 유지하세요."],
      ["설명", "description", "캐릭터가 어떤 존재인지에 대한 핵심 정의입니다. AI가 무엇을 연기할지 알려 주는 주요 텍스트 블록으로, 성격 특성·외모·배경 이야기·버릇·말투가 들어갑니다. 보통 가장 길고 가장 중요한 필드입니다."],
      ["성격", "personality", "짧은 성격 요약입니다. 일부 앱은 이를 별도 블록으로 삽입합니다. 설명에서 이미 성격을 다뤘다면 비워 두거나 간결한 요약(예: '냉소적, 재치 있음, 충실함, 아침을 싫어함')을 써도 됩니다."],
      ["시나리오", "scenario", "장면을 설정합니다 — 대화가 언제 어디서 일어나는지. 예: '해 질 녘 붐비는 시장에서 {{char}}를 만난다.' 이는 AI와 사용자 모두에게 시작 맥락을 제공합니다."],
      ["첫 메시지", "first_mes", "새 대화가 시작될 때 캐릭터가 보내는 첫 메시지입니다. 매우 중요합니다 — 분위기를 정하고, 시나리오를 행동으로 보여 주며, 캐릭터의 목소리를 드러냅니다. 좋은 첫 메시지는 캐릭터를 설명하기보다 어떻게 말하는지 보여 줍니다. *행동은 별표로* 표시하세요."],
      ["예시 메시지", "mes_example", "AI에게 캐릭터의 말투를 보여 주는 예시 대화입니다. {{char}}와 {{user}} 자리표시자를 사용한 대화 형식으로 작성하고 <START> 태그로 구분합니다. 이는 퓨샷 예시로 — 좋은 예시 두세 개가 평범한 예시 열 개보다 낫습니다."],
      ["시스템 프롬프트", "system_prompt", "시스템 메시지로 앞에 추가되는 지시문입니다. 설정하면 채팅 앱의 기본 시스템 프롬프트를 덮어씁니다. 사용자가 직접 설정하지 않아도 되도록 캐릭터에 특정 지시가 필요할 때 사용하세요."],
      ["Post-History 지시문", "post_history_instructions", "대화 기록 뒤, AI가 응답을 생성하기 직전에 삽입되는 지시문입니다. SillyTavern에서는 '제일브레이크' / 작가 노트 삽입 지점입니다. AI가 글을 쓰며 고려해야 할 알림에 사용하세요."],
      ["Depth Prompt", "depth_prompt", "대화의 특정 깊이에 삽입되는 프롬프트입니다. 'depth' 값은 맨 아래에서 몇 번째 메시지에 나타날지 정합니다 — depth=4면 가장 최근 메시지보다 4개 앞입니다. 'role' 필드는 system·user·assistant 중 어느 역할로 나타날지 정합니다."],
      ["Talkativeness", "talkativeness", "응답 길이를 암시하는 0.0~1.0 사이의 숫자입니다. 0.0 = 매우 간결, 1.0 = 매우 장황. 기본값은 0.5입니다. 모든 앱이 이 필드를 쓰는 건 아니지만, 쓰는 앱은 그에 맞춰 출력 길이를 조절합니다."],
      ["대체 인사말", "alternate_greetings", "기본 첫 메시지 외의 추가 첫 메시지입니다. 사용자는 인사말 사이를 스와이프해 다른 시나리오나 대화 시작점을 고를 수 있습니다. 다양한 분위기·배경·상황을 제공하는 데 사용하세요."],
      ["제작자 노트", "creator_notes", "카드를 가져오는 사람에게 전하는 메모입니다. 카드 목록과 가져오기 화면에 표시되며 AI에게는 전송되지 않습니다. 사용 팁, 권장 설정, 크레딧, NSFW 경고, 변경 내역에 사용하세요."],
      ["태그", "tags", "분류용 쉼표 구분 태그입니다. Chub.ai 같은 호스팅 플랫폼이 검색·필터링에 사용합니다. 장르·캐릭터 유형·배경을 포함하세요 — 예: 'fantasy, female, elf, adventure, SFW'."],
      ["제작자", "creator", "당신의 이름이나 핸들입니다. 호스팅 플랫폼의 카드 목록에 표시되어 사람들이 당신의 다른 카드를 찾는 데 도움이 됩니다."],
      ["캐릭터 버전", "character_version", "리비전 추적용 버전 문자열입니다(예: '1.0', '2.3'). 카드를 업데이트했을 때 사용자에게 어떤 버전인지 알려 주는 데 유용합니다."],
    ].map(([name, code, body]) => ({ name, code, body })),
  },
  s4: {
    heading: "4. 로어북 활용하기",
    intro:
      "로어북('월드 북' 또는 '월드 인포'라고도 함)은 대화에 특정 키워드가 나타날 때 조건부로 프롬프트에 삽입되는 항목의 모음입니다. 모든 세계관 디테일을 설명에 욱여넣는 대신, 관련 있을 때만 활성화되는 항목에 담습니다.",
    howTitle: "로어북 항목의 작동 방식",
    howBody:
      '각 항목에는 **키워드**와 **내용**이 있습니다. 키워드 중 하나가 최근 대화 기록에 나타나면 내용이 프롬프트에 삽입됩니다. 예를 들어 키워드가 "Blackwood Forest, the forest"인 항목은 대화에서 그 용어가 언급될 때 자동으로 나타납니다.',
    fieldsTitle: "주요 로어북 필드",
    fields: [
      ["키워드", "쉼표로 구분된 트리거 단어입니다. 최근 대화에 하나라도 나타나면 항목이 활성화됩니다. 구체적으로 — 'sword'는 모든 검 언급마다 발동합니다."],
      ["보조 키워드", "선택적(Selective) 모드가 켜지면, 기본 키워드와 보조 키워드가 모두 있어야 항목이 활성화됩니다. 잘못된 발동을 막아 줍니다."],
      ["내용", "항목이 활성화될 때 프롬프트에 삽입되는 텍스트입니다. 지시문이 아니라 AI가 알아야 할 정보로 작성하세요(그게 의도가 아니라면)."],
      ["삽입 순서", "여러 항목이 동시에 활성화될 때의 순서를 정합니다. 낮은 숫자가 먼저 들어갑니다."],
      ["우선순위", "프롬프트의 토큰 예산이 부족하면 우선순위가 낮은 항목부터 제거됩니다. 숫자가 높을수록 우선순위가 높아 트리밍에서 살아남을 가능성이 큽니다."],
      ["상시(Constant)", "켜면 키워드와 무관하게 항상 삽입됩니다. 매 메시지마다 토큰을 소모하니 아껴 쓰세요."],
      ["위치", "항목이 프롬프트에서 캐릭터 정의 앞에 들어갈지 뒤에 들어갈지 정합니다."],
    ].map(([name, body]) => ({ name, body })),
  },
  s5: {
    heading: "5. V2 vs V3 (CHARX) 포맷",
    head: ["항목", "V2", "V3 (CHARX)"],
    rows: [
      ["컨테이너", "PNG tEXt 청크", "ZIP 아카이브 (.charx)"],
      ["에셋", "아바타만", "여러 임베드 에셋"],
      ["그룹 인사말", "—", "지원"],
      ["닉네임", "—", "지원"],
      ["다국어 노트", "—", "지원"],
      ["앱 호환성", "매우 넓음", "확대 중"],
    ],
    note: "최대 호환성을 원하면 **V2를 사용**하세요 — Chub.ai나 CharacterHub에 공유하며 어디서든 동작하길 바란다면 V2 PNG가 안전한 선택입니다. 여러 에셋이나 V3 전용 필드가 필요하고 대상 앱이 지원한다면 **V3을 사용**하세요. Chara Studio는 에디터에서 V3 필드를 노출하고, V2 PNG로 내보낼 때조차 이를 보존합니다.",
  },
  s6: {
    heading: "6. 더 나은 캐릭터 카드를 쓰는 팁",
    tips: [
      ["설명하지 말고 보여 주기", "'그녀는 빈정댄다'라고 쓰는 대신, 빈정거림을 드러내는 예시 대화를 쓰세요. AI는 특성 나열보다 예시에서 더 잘 배웁니다."],
      ["강한 첫 메시지 쓰기", "첫 메시지는 다른 어떤 필드보다 많은 일을 합니다. 좋은 첫 메시지는 정적인 묘사가 아니라, 사용자를 능동적인 상황에 빠뜨리는 2~4문단입니다."],
      ["예시 메시지 잘 활용하기", "예시 메시지는 AI를 위한 퓨샷 학습입니다. 전형적인 응답 스타일·어휘·서식을 보여 주세요. 서로 다른 분위기를 담은 2~3개의 대화를 넣고 {{char}}와 {{user}} 자리표시자를 사용하세요."],
      ["설명을 과하게 채우지 않기", "설명이 길다고 늘 좋은 건 아닙니다. 모든 토큰은 맥락을 두고 대화 기록과 경쟁합니다. 세계관 디테일은 로어북 항목으로 옮겨 관련 있을 때만 나타나게 하세요."],
      ["여러 모델로 테스트하기", "Claude에서 잘 동작하는 카드가 GPT-4나 로컬 모델에서는 다르게 동작할 수 있습니다. 공개하는 카드는 최소 두 개의 서로 다른 AI 백엔드로 테스트하세요."],
      ["제작자 노트 활용하기", "어떤 모델로 테스트했는지, 권장 설정, 카드 버전을 사용자에게 알려 주세요. 좋은 제작자 노트는 사용자의 추측을 덜어 줍니다."],
    ].map(([name, body]) => ({ name, body })),
  },
  s7: {
    heading: "7. 카드 내보내기와 공유하기",
    pngTitle: "PNG로 내보내기",
    pngBody:
      "표준 내보내기입니다. Chara Studio는 캐릭터 데이터를 V2 포맷 `tEXt` 청크로 PNG에 새겨 넣습니다. 결과물은 볼 수 있는 이미지인 동시에 완전한 캐릭터 정의입니다 — 호스팅 사이트에 업로드하고 채팅 앱으로 가져오는 바로 그 파일입니다.",
    altTitle: "JSON 또는 CHARX로 내보내기",
    altBody:
      "JSON은 이미지 없이 캐릭터 메타데이터만 내보냅니다 — 백업, 버전 비교, 원본 JSON을 받는 도구에 유용합니다. CHARX는 V3 카드와 모든 에셋을 하나의 ZIP 아카이브로 묶습니다.",
    whereTitle: "어디에 공유할까",
    where: [
      "**Chub.ai** — 가장 큰 캐릭터 카드 호스팅 플랫폼.",
      "**CharacterHub** — 평점과 컬렉션을 갖춘 또 다른 인기 사이트.",
      "**Discord 커뮤니티** — 많은 AI 롤플레이 서버에 카드 공유 채널이 있습니다.",
      "**직접 파일 공유** — 그냥 PNG이니 어디서든 공유하세요.",
    ],
  },
  backHome: "← 홈으로 돌아가기",
  openEditorCta: "에디터 열기 →",
};
