import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Lock,
  BookOpen,
  Download,
  Smartphone,
  Upload,
  ChevronDown,
} from "lucide-react";
import { useCard } from "../state/CardContext";
import { readCardFile, loadExampleCard } from "../lib/io";

const FEATURES = [
  {
    icon: FileText,
    title: "Edit V2 & V3 Character Cards",
    body: "Support for SillyTavern V2 PNG character cards: description, personality, scenario, first_mes, alternate greetings, depth_prompt, talkativeness, system_prompt, post_history_instructions, and many more. V3 and CHARX fields are also supported.",
  },
  {
    icon: Lock,
    title: "100% Client-Side",
    body: "No servers to upload to, no accounts to create, and no tracking. Everything happens entirely in your browser with local JavaScript. Your character cards and images stay on your device.",
  },
  {
    icon: BookOpen,
    title: "Full Lorebook Editor",
    body: "Create and manage lorebook entries, including keywords, secondary keys, priority, order, and recursive scanning, along with selective activation. You can edit world-building information directly on the card.",
  },
  {
    icon: Download,
    title: "Export to PNG, JSON or CHARX",
    body: "Export your card as a complete V2 PNG with metadata, ready to upload to Chub.ai, CharacterHub, or SillyTavern. You can also export it as JSON or a V3 CHARX archive with embedded assets.",
  },
  {
    icon: Smartphone,
    title: "Works on Mobile",
    body: "The editor is mobile-friendly, with a responsive design and a navigation drawer for a better experience. You can edit your character card from your phone or tablet, without needing a desktop device.",
  },
];

const FAQ = [
  {
    q: "What is a character card?",
    a: "A character card is a PNG image file containing a JSON data payload that describes an AI character. This includes a character's personality, background, sample conversation, and prompts. The most popular format is based on the SillyTavern V2 spec, commonly known as tavern cards or chara cards. A chara card contains a PNG image along with a tEXt chunk containing a JSON data payload.",
  },
  {
    q: "What apps work with Chara Snap cards?",
    a: "Character cards exported from Chara Snap are standard V2 PNG image files. They work with any app that supports Character Card V2, such as SillyTavern, RisuAI, Agnai, Backyard AI, Janitor AI, Venus AI, OpenRoleplay, and others. You can upload chara cards to any host, such as Chub.ai or CharacterHub.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Chara Snap runs entirely within your browser. Your character cards, images, and any edits you make are not sent anywhere — there are no servers involved. You can verify this by checking your browser's developer console: there's no network activity when you edit a card.",
  },
  {
    q: "What's the difference between V2 and V3?",
    a: "The current standard is V2, which stores character data as JSON inside a PNG tEXt chunk: description, personality, scenario, first message, example messages, system prompt, post-history instructions, depth prompt, alternate greetings, lorebook, and creator metadata. The newer standard, V3 (also known as CHARX), adds assets, group-only greetings, multilingual creator notes, and a nickname. Most apps support V2 today, but V3 support is growing.",
  },
  {
    q: "What is depth_prompt?",
    a: "depth_prompt is part of the V2 standard. It inserts a prompt at a specified point in the chat history, rather than at the top (system prompt) or bottom (post-history instructions). Instead, it appears N messages from the end of the chat. For example, if depth is 4, the prompt appears 4 messages before the latest message.",
  },
  {
    q: "Do I need an account?",
    a: "No. Chara Snap is completely free, with no sign-up, login, or account required. Just open the website and start editing!",
  },
];

const EXAMPLES = [
  { name: "Megumin", file: "megumin.png" },
  { name: "Rem", file: "rem.png" },
  { name: "Sherlock Holmes", file: "sherlock-holmes.png" },
];

const COMPATIBLE = [
  ["SillyTavern", "https://sillytavern.app"],
  ["RisuAI", "https://risuai.net"],
  ["Agnai", "https://agnai.chat"],
  ["Janitor AI", "https://janitorai.com"],
  ["Venus AI", "https://venusai.chat"],
  ["Chub.ai", "https://chub.ai"],
  ["CharacterHub", "https://characterhub.org"],
  ["Backyard AI", "https://backyard.ai"],
  ["OpenRoleplay", "https://openroleplay.ai"],
];

export default function LandingPage() {
  const { setState, reset } = useCard();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const state = await readCardFile(file);
      setState(state);
      navigate({ to: "/editor" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that file.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExample(file: string, name: string) {
    setError(null);
    setLoading(true);
    try {
      const url = `${import.meta.env.BASE_URL}example-cards/${file}`;
      const state = await loadExampleCard(url, file);
      setState(state);
      navigate({ to: "/editor" });
    } catch {
      setError(`Could not load the ${name} example.`);
    } finally {
      setLoading(false);
    }
  }

  function createNew() {
    reset();
    navigate({ to: "/editor" });
  }

  const base = import.meta.env.BASE_URL;

  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span aria-hidden>🃏</span>
          <span>Chara Snap</span>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/guide" className="btn-ghost">
            Guide
          </Link>
          <Link to="/editor" className="btn-secondary">
            Open Editor
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-6 text-center">
        <h1 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          Chara Snap
        </h1>
        <p className="mt-4 text-balance text-lg text-zinc-400">
          Create, edit, and export character cards for AI roleplay platforms.
        </p>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={`mt-8 cursor-pointer rounded-[14px] border-2 border-dashed p-10 transition ${
            dragging
              ? "border-[#6d5cff] bg-[#6d5cff1a]"
              : "border-[#ffffff1a] bg-surface-base hover:border-[#6d5cff80] hover:bg-zinc-900/40"
          }`}
        >
          <Upload className="mx-auto text-zinc-500" size={28} />
          <p className="mt-3 font-medium text-zinc-200">
            {loading ? "Reading card…" : "Drop a character card here"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">PNG, JSON, or CHARX</p>
          <input
            ref={inputRef}
            type="file"
            accept=".png,.json,.charx,image/png,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <div className="mt-5">
          <button onClick={createNew} className="btn-secondary">
            Create New
          </button>
        </div>

        {/* Examples */}
        <div className="mt-10">
          <p className="text-sm text-zinc-500">Start from an example</p>
          <div className="mt-4 flex justify-center gap-4">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.file}
                onClick={() => handleExample(ex.file, ex.name)}
                className="group w-28 text-center"
              >
                <div className="overflow-hidden rounded-[12px] border border-[#ffffff0f] transition group-hover:border-[#6d5cff80] group-hover:shadow-[0_8px_24px_-8px_#6d5cffaa]">
                  <img
                    src={`${base}example-cards/${ex.file}`}
                    alt={ex.name}
                    className="aspect-[2/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="mt-2 block text-xs text-zinc-400 transition group-hover:text-zinc-100">
                  {ex.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-center text-2xl font-bold">The AI Character Card Editor</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-zinc-400">
          Everything you need to build, edit, and export character cards — all in your
          browser.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-surface p-5">
              <f.icon className="text-[#6d5cff]" size={22} />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{f.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link to="/guide" className="text-sm text-[#7e70ff] hover:underline">
            Read the full character card guide →
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="text-center text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="card-surface group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-zinc-100">
                {item.q}
                <ChevronDown
                  size={18}
                  className="text-zinc-500 transition group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-5 py-16">
        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold">What is Chara Snap?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
            Chara Snap is a free character card editor for AI roleplay, available directly
            in your browser. It is a character card maker and editor for SillyTavern V2 and
            V3 PNG formats — you don't need to install anything or make an account to use it.
          </p>
          <h3 className="mt-6 text-sm font-semibold text-zinc-300">Compatible with</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {COMPATIBLE.map(([name, href]) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-[#7e70ff]"
              >
                {name}
              </a>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/guide" className="text-sm text-[#7e70ff] hover:underline">
              Character Card Guide →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
