import { memo } from "react";
import { MdClose } from "react-icons/md";

interface ShortcutsModalProps {
  hidden: boolean;
  onClose: () => void;
}

export const ShortcutsModal = memo(function ShortcutsModal({
  hidden,
  onClose,
}: ShortcutsModalProps) {
  if (hidden) return null;

  const shortcuts = [
    { key: "Space", label: "Play / Pause" },
    { key: "F", label: "Toggle Fullscreen" },
    { key: "M", label: "Toggle Mute" },
    { key: "P", label: "Picture in Picture" },
    { key: "S", label: "Capture Screenshot" },
    { key: "C", label: "Toggle Subtitles" },
    { key: "I / O", label: "A/B Loop Start / End" },
    { key: "Backspace", label: "Clear Loop" },
    { key: ", / .", label: "Step Frame Backward / Forward" },
    { key: "←", label: "Skip Backward 10s" },
    { key: "→", label: "Skip Forward 10s" },
    { key: "↑", label: "Volume Up" },
    { key: "↓", label: "Volume Down" },
    { key: "?", label: "Show Shortcuts" },
  ];

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className="shortcuts-list">
          {shortcuts.map((s) => (
            <div className="shortcut-item" key={s.label}>
              <span className="shortcut-desc">{s.label}</span>
              <kbd className="shortcut-key">{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
