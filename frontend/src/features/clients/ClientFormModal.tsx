import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ClientFormValues, clientFormSchema } from "./clients.schema";
import { ClientRecord, STATUS_LABEL } from "./types";

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  initialData?: ClientRecord | null;
}

export function ClientFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: ClientFormModalProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { name: "", status: "LEAD", value: 0 },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              name: initialData.name,
              status: initialData.status,
              value: initialData.value,
            }
          : { name: "", status: "LEAD", value: 0 },
      );
    }
  }, [open, initialData, reset]);

  const submit = async (values: ClientFormValues) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit record" : "New record"}
      description={
        isEdit
          ? "Update the client's information."
          : "Add a new client to your base."
      }
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Input
          label="Name"
          placeholder="e.g. Aurora Consulting"
          error={errors.name?.message}
          {...register("name")}
        />

        <Select
          label="Status"
          error={errors.status?.message}
          {...register("status")}
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option
              key={value}
              value={value}
              className="bg-zinc-900 text-white"
            >
              {label}
            </option>
          ))}
        </Select>

        <Input
          label="Value (USD)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          error={errors.value?.message}
          {...register("value")}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? "Save changes" : "Create record"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
