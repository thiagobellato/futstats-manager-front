import { ArrowLeft } from 'lucide-react';

export default function BotaoVoltar({ onClick, size = 24 }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title="Voltar para Menu Principal"
            aria-label="Voltar para Menu Principal"
            className="p-2 hover:bg-brand-card rounded-full transition-colors text-brand-primary"
        >
            <ArrowLeft size={size} />
        </button>
    );
}
