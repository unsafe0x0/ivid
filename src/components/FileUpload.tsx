import { memo } from "react";
import { MdFileUpload } from "react-icons/md";
import type { PlaylistItem } from "../types";

interface FileUploadProps {
  hidden: boolean;
  onItemsSelected: (items: PlaylistItem[]) => void;
}

export const FileUpload = memo(function FileUpload({
  hidden,
  onItemsSelected,
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const items = Array.from(e.target.files).map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        source: f,
      }));
      onItemsSelected(items);
    }
  };

  return (
    <div className={`file-upload-group ${hidden ? "hidden" : ""}`}>
      <label className="file-upload">
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileChange}
        />
        <MdFileUpload size={20} />
        <span>Browse</span>
      </label>
    </div>
  );
});
