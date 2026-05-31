import { useState, useCallback, useRef } from "react";
import type { PlaylistItem } from "../types";

export function useDragDrop(addItems: (items: PlaylistItem[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const readAllEntries = (
    reader: FileSystemDirectoryReader,
  ): Promise<FileSystemEntry[]> => {
    return new Promise((resolve) => {
      const all: FileSystemEntry[] = [];
      const read = () => {
        reader.readEntries((entries) => {
          if (entries.length === 0) {
            resolve(all);
            return;
          }
          all.push(...entries);
          read();
        });
      };
      read();
    });
  };

  const traverseEntry = async (entry: FileSystemEntry): Promise<File[]> => {
    if (entry.isFile) {
      return new Promise((resolve) =>
        (entry as FileSystemFileEntry).file((f) => resolve([f])),
      );
    }
    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const entries = await readAllEntries(reader);
      const nested = await Promise.all(entries.map((e) => traverseEntry(e)));
      return nested.flat();
    }
    return [];
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      const items = Array.from(e.dataTransfer.items);
      const entries = items
        .map((i) => i.webkitGetAsEntry?.())
        .filter(Boolean) as FileSystemEntry[];

      let files: File[] = [];
      if (entries.length > 0) {
        const nested = await Promise.all(
          entries.map((en) => traverseEntry(en)),
        );
        files = nested.flat();
      } else {
        files = Array.from(e.dataTransfer.files);
      }

      const videoFiles = files.filter((f) => f.type.startsWith("video/"));
      if (videoFiles.length > 0) {
        addItems(
          videoFiles.map((f) => ({
            id: crypto.randomUUID(),
            name: f.name,
            source: f,
          })),
        );
      }
    },
    [addItems],
  );

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
