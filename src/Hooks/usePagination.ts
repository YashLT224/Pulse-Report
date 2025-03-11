import { useState, useEffect, useCallback } from 'react';

interface PaginationOptions<T> {
    limit: number;
    fetchFn: (
        limit: number,
        token?: string
    ) => Promise<{
        data: T[];
        nextToken?: string | null;
    }>;
    idField?: keyof T; // Field to use as identifier for updates
}

interface PaginationState<T> {
    items: T[];
    isLoading: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
    goToNext: () => Promise<void>;
    goToPrevious: () => Promise<void>;
    updateItem: (updatedItem: T) => void; // New function to update a specific item
}

export function usePagination<T>({
    limit,
    fetchFn,
    idField = 'userId' as keyof T // Default to userId
}: PaginationOptions<T>): PaginationState<T> {
    const [items, setItems] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [previousPages, setPreviousPages] = useState<
        { nextToken?: string; extraItem?: T | null }[]
    >([]);
    const [hasNext, setHasNext] = useState(false);
    const [extraItem, setExtraItem] = useState<T | null>(null); // Track the extra prefetched item

    const fetchItems = useCallback(
        async (token?: string, prevExtraItem?: T) => {
            setIsLoading(true);
            try {
                const response = await fetchFn(
                    prevExtraItem ? limit : limit + 1,
                    token
                );

                // Check if there are more items
                if (
                    response.data.length > (prevExtraItem ? limit - 1 : limit)
                ) {
                    setHasNext(true);
                    setItems([
                        ...(prevExtraItem ? [prevExtraItem] : []),
                        ...response.data.slice(
                            0,
                            prevExtraItem ? limit - 1 : limit
                        )
                    ]);
                    setExtraItem(
                        response.data[prevExtraItem ? limit - 1 : limit]
                    ); // Store the extra item
                } else {
                    setHasNext(false);
                    setItems([
                        ...(prevExtraItem ? [prevExtraItem] : []),
                        ...response.data
                    ]);
                    setExtraItem(null); // No extra item
                }

                // Update nextToken
                setNextToken(response.nextToken || null);
            } catch (error) {
                console.error('Error fetching paginated data:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [fetchFn, limit]
    );

    // Initial fetch
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Add method to update a specific item in the list
    const updateItem = useCallback(
        (updatedItem: T) => {
            setItems(prevItems =>
                prevItems.map(item =>
                    item[idField] === updatedItem[idField] ? updatedItem : item
                )
            );
        },
        [idField]
    );

    const goToNext = useCallback(async () => {
        if (!hasNext) return;

        // Save current token and extra item to history before navigating
        setPreviousPages(prev => [
            ...prev,
            { nextToken, extraItem: extraItem || null }
        ]);

        await fetchItems(nextToken, extraItem);
    }, [hasNext, nextToken, fetchItems, extraItem]);

    const goToPrevious = useCallback(async () => {
        if (!previousPages.length) return;

        // Get the previous token
        const prevPagesCopy = [...previousPages];

        const prevPage = prevPagesCopy.pop();

        // Update the previous tokens list
        setPreviousPages(prevPagesCopy);

        const { nextToken: prevToken, extraItem: prevExtraItem } = prevPage;

        // Restore the extra item for the previous page and Fetch with the previous token
        await fetchItems(prevToken, prevExtraItem);
    }, [previousPages, fetchItems]);

    return {
        items,
        isLoading,
        hasNext,
        hasPrevious: !!previousPages.length,
        goToNext,
        goToPrevious,
        updateItem
    };
}
