import { FiArrowLeft } from 'react-icons/fi';

export default function BotaoVoltar({ onClick, size = 24 }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title="Voltar para Menu Principal"
            aria-label="Voltar para Menu Principal"
            className="back-button"
        >
            <FiArrowLeft size={size} />
        </button>
    );
}
