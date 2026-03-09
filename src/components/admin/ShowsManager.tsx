import { useState } from "react";
import type { ShowData } from "@/types/show";
import ShowsList from "./shows/ShowsList";
import ShowForm from "./shows/ShowForm";

const ShowsManager = () => {
  const [editingShow, setEditingShow] = useState<ShowData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (editingShow || isCreating) {
    return (
      <ShowForm
        show={editingShow}
        onBack={() => { setEditingShow(null); setIsCreating(false); }}
      />
    );
  }

  return (
    <ShowsList
      onEdit={setEditingShow}
      onCreate={() => setIsCreating(true)}
    />
  );
};

export default ShowsManager;
