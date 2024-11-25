interface OptionsListProps {
    text: string;
    options: string[];
    onSelect: (option: string) => void;
}

const OptionsList = ({ options, text, onSelect }: OptionsListProps) => {
    return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start space-x-4">

            {/* Content Section */}
            <div className="flex-1">
                <p className="mb-4 text-gray-700">{text}</p>
                <ul className="space-y-2">
                    {options.map((option) => (
                        <li key={option}>
                            <button
                                onClick={() => onSelect(option)}
                                className="w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-blue-100 text-gray-700"
                            >
                                {option}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OptionsList;