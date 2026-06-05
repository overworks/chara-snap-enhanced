import { Link } from "@tanstack/react-router";
import HeaderControls from "../components/HeaderControls";

const TOC = [
  ["what-is-a-character-card", "1. What is a Character Card?"],
  ["getting-started", "2. Getting Started with Chara Studio"],
  ["character-card-fields", "3. Understanding Character Card Fields"],
  ["lorebooks", "4. Working with Lorebooks"],
  ["v2-vs-v3", "5. V2 vs V3 (CHARX) Format"],
  ["writing-tips", "6. Tips for Writing Better Character Cards"],
  ["exporting-and-sharing", "7. Exporting and Sharing Your Cards"],
] as const;

const FIELDS: [string, string, string][] = [
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
];

const LOREBOOK_FIELDS: [string, string][] = [
  ["Keywords", "Comma-separated trigger words. If any appears in the recent conversation, the entry activates. Be specific — 'sword' will trigger on every mention of any sword."],
  ["Secondary Keywords", "When Selective mode is on, the entry only activates when both a primary AND a secondary keyword are present. This prevents false triggers."],
  ["Content", "The text injected into the prompt when the entry activates. Write this as information the AI should know, not as instructions (unless that's your intent)."],
  ["Insertion Order", "Controls the sequence when multiple entries activate at the same time. Lower numbers go first."],
  ["Priority", "When the prompt runs out of token budget, lower-priority entries get dropped first. Higher number = higher priority = more likely to survive trimming."],
  ["Constant", "If enabled, this entry is always injected regardless of keywords. Use sparingly — it consumes tokens every message."],
  ["Position", "Whether the entry is inserted before or after the character definition in the prompt."],
];

const TIPS: [string, string][] = [
  ["Show, don't tell", "Instead of 'She is sarcastic', write example dialogue that demonstrates sarcasm. The AI learns better from examples than from trait lists."],
  ["Write a strong first message", "Your first message does more work than any other field. A good one is 2–4 paragraphs that drop the user into an active situation, not a static description."],
  ["Use example messages effectively", "Example messages are few-shot learning for the AI. Show typical response style, vocabulary, and formatting. Include 2–3 exchanges covering different moods. Use {{char}} and {{user}} placeholders."],
  ["Don't overstuff the description", "Longer descriptions aren't always better. Every token competes with conversation history for context. Move world-building details into lorebook entries so they only appear when relevant."],
  ["Test with different models", "A card that works great with Claude might behave differently with GPT-4 or a local model. Test published cards with at least two different AI backends."],
  ["Use creator notes", "Tell users what model you tested with, recommended settings, and the card version. Good creator notes save users from guessing."],
];

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 font-display text-2xl font-bold tracking-tight text-fg">
      {children}
    </h2>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link to="/" className="text-sm text-fg-muted hover:text-fg">
            ← Back to Chara Studio
          </Link>
          <div className="flex items-center gap-2">
            <HeaderControls className="hidden sm:flex" />
            <Link to="/editor" className="btn-secondary">
              Open Editor
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 leading-relaxed text-fg-muted">
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
          How to Create &amp; Edit SillyTavern Character Cards
        </h1>
        <p className="mt-3 text-fg-muted">
          A comprehensive reference for creating AI character cards — from your first card
          to advanced lorebook setups.
        </p>

        <nav className="mt-8 card-surface p-5">
          <ul className="space-y-1.5 text-sm">
            {TOC.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-accent-text hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="mt-12 space-y-4">
          <H id="what-is-a-character-card">1. What is a Character Card?</H>
          <p>
            A character card is a PNG image that doubles as a complete AI character
            definition. The character data — name, description, personality, example
            dialogue, and prompts — is stored as JSON inside a <code>tEXt</code> metadata
            chunk in the PNG. Because it's just an image file, you can share it anywhere and
            import it into any compatible app.
          </p>
          <p>
            The most widely supported format is the Character Card V2 specification,
            popularized by SillyTavern. A newer V3 (CHARX) spec adds assets and a few extra
            fields. Chara Studio reads and writes both.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <H id="getting-started">2. Getting Started with Chara Studio</H>
          <h3 className="font-semibold text-fg">Editing an existing card</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Drag a PNG (or JSON/CHARX) card onto the drop zone on the home page.</li>
            <li>The editor opens with every field populated from the card.</li>
            <li>Make your changes across the tabs.</li>
            <li>
              Click <strong>Export</strong> to download the updated card.
            </li>
          </ol>
          <h3 className="font-semibold text-fg">Creating a new card from scratch</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Click <strong>Create New</strong> on the home page.
            </li>
            <li>
              Give your character a <strong>Name</strong>.
            </li>
            <li>
              Write a <strong>Description</strong> — the core of the character.
            </li>
            <li>
              Add a <strong>First Message</strong> to open the conversation.
            </li>
            <li>Upload an avatar image, then export.</li>
          </ol>
          <h3 className="font-semibold text-fg">Try an example</h3>
          <p>
            Not sure where to begin? Load one of the bundled examples — Megumin, Rem, or
            Sherlock Holmes — to see how a complete card is structured.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <H id="character-card-fields">3. Understanding Character Card Fields</H>
          <div className="space-y-4">
            {FIELDS.map(([name, code, body]) => (
              <div key={code}>
                <h3 className="font-semibold text-fg">
                  {name}{" "}
                  <code className="rounded bg-elevated px-1.5 py-0.5 text-xs text-fg-muted">
                    {code}
                  </code>
                </h3>
                <p className="mt-1 text-sm text-fg-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <H id="lorebooks">4. Working with Lorebooks</H>
          <p>
            A lorebook (also called a "world book" or "world info") is a collection of
            entries that get conditionally injected into the prompt when certain keywords
            appear in the conversation. Instead of cramming every world detail into the
            description, you put it in entries that only activate when relevant.
          </p>
          <h3 className="font-semibold text-fg">How lorebook entries work</h3>
          <p className="text-sm text-fg-muted">
            Each entry has <strong>keywords</strong> and <strong>content</strong>. When one
            of the keywords appears in recent chat history, the content gets injected into
            the prompt. For example, an entry with keywords "Blackwood Forest, the forest"
            would automatically appear when the conversation mentions those terms.
          </p>
          <h3 className="font-semibold text-fg">Key lorebook fields</h3>
          <div className="space-y-3">
            {LOREBOOK_FIELDS.map(([name, body]) => (
              <div key={name}>
                <h4 className="text-sm font-medium text-fg">{name}</h4>
                <p className="text-sm text-fg-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <H id="v2-vs-v3">5. V2 vs V3 (CHARX) Format</H>
          <div className="overflow-hidden rounded-[12px] border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-fg-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Aspect</th>
                  <th className="px-4 py-2 font-medium">V2</th>
                  <th className="px-4 py-2 font-medium">V3 (CHARX)</th>
                </tr>
              </thead>
              <tbody className="text-fg-muted">
                {[
                  ["Container", "PNG tEXt chunk", "ZIP archive (.charx)"],
                  ["Assets", "Avatar only", "Multiple embedded assets"],
                  ["Group greetings", "—", "Yes"],
                  ["Nickname", "—", "Yes"],
                  ["Multilingual notes", "—", "Yes"],
                  ["App compatibility", "Very broad", "Growing"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-border">
                    {row.map((cell, i) => (
                      <td key={i} className="px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-fg-muted">
            <strong>Use V2</strong> for maximum compatibility — if you're sharing on Chub.ai
            or CharacterHub and want it to work everywhere, V2 PNG is the safe choice.{" "}
            <strong>Use V3</strong> if you need multiple assets or V3-specific fields, and
            your target app supports it. Chara Studio exposes V3 fields in the editor and
            preserves them during export even inside a V2 PNG.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <H id="writing-tips">6. Tips for Writing Better Character Cards</H>
          <div className="space-y-3">
            {TIPS.map(([name, body]) => (
              <div key={name}>
                <h3 className="font-semibold text-fg">{name}</h3>
                <p className="text-sm text-fg-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <H id="exporting-and-sharing">7. Exporting and Sharing Your Cards</H>
          <h3 className="font-semibold text-fg">Export as PNG</h3>
          <p className="text-sm text-fg-muted">
            The standard export. Chara Studio bakes your character data into the PNG as a
            V2-format <code>tEXt</code> chunk. The result is both a viewable image and a
            complete character definition — what you upload to hosting sites and import into
            chat apps.
          </p>
          <h3 className="font-semibold text-fg">Export as JSON or CHARX</h3>
          <p className="text-sm text-fg-muted">
            JSON exports just the character metadata without an image — useful for backups,
            diffing versions, or tools that accept raw JSON. CHARX bundles the V3 card plus
            any assets into a single ZIP archive.
          </p>
          <h3 className="font-semibold text-fg">Where to share</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-fg-muted">
            <li>
              <strong>Chub.ai</strong> — the largest character card hosting platform.
            </li>
            <li>
              <strong>CharacterHub</strong> — another popular site with ratings and
              collections.
            </li>
            <li>
              <strong>Discord communities</strong> — many AI roleplay servers have
              card-sharing channels.
            </li>
            <li>
              <strong>Direct file sharing</strong> — it's just a PNG, so share it anywhere.
            </li>
          </ul>
        </section>

        <div className="mt-14 flex items-center justify-between border-t border-border pt-6">
          <Link to="/" className="text-sm text-fg-muted hover:text-fg">
            ← Back to home
          </Link>
          <Link to="/editor" className="btn-primary">
            Open the Editor →
          </Link>
        </div>
      </article>
    </div>
  );
}
