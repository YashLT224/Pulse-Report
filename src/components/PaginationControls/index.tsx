interface PaginationControlsProps {
    onPrevious: () => void;
    onNext: () => void;
    hasPrevious: boolean;
    hasNext: boolean;
}

const PaginationControls = ({
    onPrevious,
    onNext,
    hasPrevious,
    hasNext
}: PaginationControlsProps) => {
    return (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                style={{
                    padding: '8px 16px',
                    margin: '0 8px',
                    backgroundColor: !hasPrevious ? '#ccc' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !hasPrevious ? 'not-allowed' : 'pointer'
                }}
            >
                Prev
            </button>
            <button
                onClick={onNext}
                disabled={!hasNext}
                style={{
                    padding: '8px 16px',
                    margin: '0 8px',
                    backgroundColor: !hasNext ? '#ccc' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !hasNext ? 'not-allowed' : 'pointer'
                }}
            >
                Next
            </button>
        </div>
    );
};

export default PaginationControls;
