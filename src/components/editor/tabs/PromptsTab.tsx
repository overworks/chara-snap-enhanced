import { useCard } from "../../../state/CardContext";
import { TextArea } from "../../fields";

export default function PromptsTab() {
  const { state, updateCard } = useCard();
  const { card } = state;
  return (
    <div className="space-y-6">
      <TextArea
        label="System Prompt"
        tooltip="Injected as a system message. Overrides the client's default system prompt if set."
        hint="Injected as a system message. Overrides the client's default system prompt if set."
        value={card.system_prompt}
        onChange={(v) => updateCard({ system_prompt: v })}
        placeholder="Write {{char}}'s next reply in a fictional chat…"
        rows={8}
        mono
      />
      <TextArea
        label="Post-History Instructions"
        tooltip="Injected after the chat history, before the AI's response. Also called 'jailbreak' in some clients."
        hint="Injected after the chat history, before the AI's response. Also known as 'jailbreak' in some clients."
        value={card.post_history_instructions}
        onChange={(v) => updateCard({ post_history_instructions: v })}
        placeholder="[Additional instructions placed after chat history]"
        rows={6}
        mono
      />
    </div>
  );
}
