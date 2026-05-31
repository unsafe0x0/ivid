import { memo, useRef, useEffect } from "react";

export type Quality = "4K" | "1080p" | "720p" | "480p" | "360p";
export const QUALITY_LABELS: Quality[] = [
  "4K",
  "1080p",
  "720p",
  "480p",
  "360p",
];

interface QualityDropdownProps {
  quality: Quality;
  showMenu: boolean;
  isLocal: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onChangeQuality: (q: Quality) => void;
}

export const QualityDropdown = memo(function QualityDropdown({
  quality,
  showMenu,
  isLocal,
  onToggleMenu,
  onCloseMenu,
  onChangeQuality,
}: QualityDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        onCloseMenu();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu, onCloseMenu]);

  return (
    <div className="custom-dropdown" ref={menuRef}>
      <button
        className="control-btn speed-btn quality-btn"
        onClick={onToggleMenu}
        title="Video Quality"
      >
        {quality}
      </button>
      {showMenu && (
        <div className="dropdown-menu">
          {QUALITY_LABELS.map((q) => (
            <div
              key={q}
              className={`dropdown-item ${q === quality ? "active" : ""} ${isLocal && q !== quality ? "disabled-item" : ""}`}
              onClick={() => {
                if (!isLocal || q === quality) {
                  onChangeQuality(q);
                  onCloseMenu();
                }
              }}
              title={
                isLocal && q !== quality
                  ? "Quality is fixed for local files"
                  : undefined
              }
            >
              {q}
              {isLocal && q !== quality && (
                <span className="quality-lock">—</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
