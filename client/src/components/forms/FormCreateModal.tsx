import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";

interface FormCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; description: string }) => void;
}

export function FormCreateModal({ open, onOpenChange, onCreate }: FormCreateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onCreate({ name, description });
    setLoading(false);
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Novo Formulário</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Nome do Formulário</label>
            <input
              className="form-input w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="Digite o nome"
            />
          </div>
          <div>
            <label className="form-label">Descrição</label>
            <textarea
              className="form-textarea w-full"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={255}
              placeholder="Descreva o objetivo do formulário"
            />
          </div>
          <ModalFooter>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? "Criando..." : "Criar"}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
