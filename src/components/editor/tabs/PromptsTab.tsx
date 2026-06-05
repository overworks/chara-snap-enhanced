import { useCard } from "../../../state/CardContext";
import { useI18n } from "../../../i18n";
import { TextArea } from "../../fields";

export default function PromptsTab() {
  const { state, updateCard } = useCard();
  const { d } = useI18n();
  const { card } = state;
  return (
    <div className="space-y-6">
      <TextArea
        label={d.prompts.system}
        tooltip={d.prompts.systemTip}
        hint={d.prompts.systemTip}
        value={card.system_prompt}
        onChange={(v) => updateCard({ system_prompt: v })}
        placeholder={d.prompts.systemPlaceholder}
        rows={8}
        mono
      />
      <TextArea
        label={d.prompts.postHistory}
        tooltip={d.prompts.postHistoryTip}
        hint={d.prompts.postHistoryTip}
        value={card.post_history_instructions}
        onChange={(v) => updateCard({ post_history_instructions: v })}
        placeholder={d.prompts.postHistoryPlaceholder}
        rows={6}
        mono
      />
    </div>
  );
}
