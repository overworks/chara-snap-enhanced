import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Home,
  Download,
  UserSquare,
  MessageSquare,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  Image as ImageIcon,
  Code2,
  User,
} from "lucide-react";
import { useCard } from "../state/CardContext";
import { useI18n } from "../i18n";
import HeaderControls from "../components/HeaderControls";
import ProfilePanel from "../components/editor/ProfilePanel";
import ExportModal from "../components/editor/ExportModal";
import IdentityTab from "../components/editor/tabs/IdentityTab";
import MessagesTab from "../components/editor/tabs/MessagesTab";
import PromptsTab from "../components/editor/tabs/PromptsTab";
import LorebookTab from "../components/editor/tabs/LorebookTab";
import ExtensionsTab from "../components/editor/tabs/ExtensionsTab";
import AssetsTab from "../components/editor/tabs/AssetsTab";
import RawJsonTab from "../components/editor/tabs/RawJsonTab";

const TABS = [
  { id: "identity", label: "Identity", icon: UserSquare, Comp: IdentityTab },
  { id: "messages", label: "Messages", icon: MessageSquare, Comp: MessagesTab },
  { id: "prompts", label: "Prompts", icon: Sparkles, Comp: PromptsTab },
  { id: "lorebook", label: "Lorebook", icon: BookOpen, Comp: LorebookTab },
  { id: "extensions", label: "Extensions", icon: SlidersHorizontal, Comp: ExtensionsTab },
  { id: "assets", label: "Assets", icon: ImageIcon, Comp: AssetsTab },
  { id: "raw", label: "Raw JSON", icon: Code2, Comp: RawJsonTab },
] as const;

export default function EditorPage() {
  const { state } = useCard();
  const { d } = useI18n();
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("identity");
  const [exportOpen, setExportOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const ActiveComp = TABS.find((t) => t.id === active)!.Comp;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
        <Link to="/" className="btn-ghost px-2" aria-label="Home">
          <Home size={18} />
        </Link>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
          {state.card.name || d.editor.untitled}
        </span>
        <HeaderControls className="hidden md:flex" />
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="btn-ghost px-2 lg:hidden"
          aria-label={d.editor.profile}
        >
          <User size={18} />
        </button>
        <button onClick={() => setExportOpen(true)} className="btn-primary text-sm">
          <Download size={15} /> {d.common.export}
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Main column */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Tab bar */}
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-3">
            {TABS.map((t) => {
              const on = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition ${
                    on
                      ? "border-accent text-fg"
                      : "border-transparent text-fg-faint hover:text-fg-muted"
                  }`}
                >
                  <t.icon size={15} />
                  {d.editor.tabs[t.id]}
                </button>
              );
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-2xl pb-16">
              <ActiveComp />
            </div>
          </div>
        </main>

        {/* Right sidebar (desktop) */}
        <aside className="hidden w-[22rem] shrink-0 overflow-y-auto border-l border-border px-4 py-5 lg:block">
          <ProfilePanel />
        </aside>
      </div>

      {/* Profile drawer (mobile) */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[20rem] max-w-[85vw] overflow-y-auto border-l border-border-strong bg-bg px-4 py-5"
            onClick={(e) => e.stopPropagation()}
          >
            <HeaderControls className="mb-4 justify-end" />
            <ProfilePanel />
          </div>
        </div>
      )}

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}
