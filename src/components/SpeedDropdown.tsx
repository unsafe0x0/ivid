import { memo, useRef, useEffect } from "react";

interface SpeedDropdownProps {
  speed: number;
  showMenu: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onChangeSpeed: (s: number) => void;
}

export const SpeedDropdown = memo(function SpeedDropdown({
  speed,
  showMenu,
  onToggleMenu,
  onCloseMenu,
  onChangeSpeed,
}: SpeedDropdownProps) {
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
      <button className="control-btn speed-btn" onClick={onToggleMenu}>
        {speed}x
      </button>
      {showMenu && (
        <div className="dropdown-menu">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
            <div
              key={s}
              className={`dropdown-item ${s === speed ? "active" : ""}`}
              onClick={() => onChangeSpeed(s)}
            >
              {s}x
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
