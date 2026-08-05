import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" isLoading={isLoading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
