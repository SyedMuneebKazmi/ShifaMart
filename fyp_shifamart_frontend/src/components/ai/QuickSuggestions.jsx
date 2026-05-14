import Button from '../ui/Button';

const QuickSuggestions = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 no-scrollbar">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="flex-shrink-0 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm rounded-full transition-colors whitespace-nowrap border border-neutral-200"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default QuickSuggestions;
