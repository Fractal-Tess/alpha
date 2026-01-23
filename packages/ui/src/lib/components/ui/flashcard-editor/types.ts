export interface EditableFlashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface FlashcardEditorEvents {
  onCreate: (card: { question: string; answer: string }) => void;
  onUpdate: (id: string, card: { question: string; answer: string }) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}
