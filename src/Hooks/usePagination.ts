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
    deleteItem: (deletedItem: T) => void; // New function to delete a specific item
}

export function usePagination<T>({
    limit,
    fetchFn,
    idField = 'userId' as keyof T // Default to userId
}: PaginationOptions<T>): PaginationState<T> {
    const [items, setItems] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [pageTokens, setPageTokens] = useState<
        { nextToken?: string; extraItem?: T | null }[]
    >([]);
    const [hasNext, setHasNext] = useState(false);
    const [extraItem, setExtraItem] = useState<T | null>(null); // Track the extra prefetched item

    const fetchItems = useCallback(
        async (token?: string, prevExtraItem?: T) => {
            setIsLoading(true);
            try {
                const fetchLimit = prevExtraItem ? limit : limit + 1;
                const lastItemIndex = prevExtraItem ? limit - 1 : limit;
                const response = await fetchFn(fetchLimit, token);

                // Check if there are more items
                if (response.data.length > lastItemIndex) {
                    setHasNext(true);
                    setItems([
                        ...(prevExtraItem ? [prevExtraItem] : []),
                        ...response.data.slice(0, lastItemIndex)
                    ]);
                    setExtraItem(response.data[lastItemIndex]); // Store the extra item
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
        (updatedItem: T & { allowedForms?: string[] }) => {
            setItems(prevItems =>
                prevItems.map(item =>
                    item[idField] === updatedItem[idField]
                        ? {
                              ...updatedItem,
                              ...(idField === 'userId' && {
                                  access: !updatedItem.allowedForms?.length
                                      ? 'none'
                                      : null
                              })
                          }
                        : item
                )
            );
        },
        [idField]
    );

    // Add method to delete a specific item in the list
    const deleteItem = useCallback(
        (deletedItem: T & { allowedForms?: string[] }) => {
            setItems(prevItems =>
                prevItems.filter(item => item[idField] !== deletedItem[idField])
            );
        },
        [idField]
    );

    const goToNext = useCallback(async () => {
        if (!hasNext) return;

        // Save current token and extra item to history before navigating
        setPageTokens(prev => [
            ...prev,
            { nextToken, extraItem: extraItem || null }
        ]);

        await fetchItems(nextToken, extraItem);
    }, [hasNext, nextToken, fetchItems, extraItem]);

    const goToPrevious = useCallback(async () => {
        if (!pageTokens.length) return;

        // Update the page tokens list
        setPageTokens(pageTokens.slice(0, -1));

        // Get the previous page tokens
        const prevPage = pageTokens.at(-2);

        const { nextToken: prevToken = null, extraItem: prevExtraItem = null } =
            prevPage || {};

        // Reinclude the extra item from the previous fetch and retrieve data using the previous token
        await fetchItems(prevToken, prevExtraItem);
    }, [pageTokens, fetchItems]);

    return {
        items,
        isLoading,
        hasNext,
        hasPrevious: !!pageTokens.length,
        goToNext,
        goToPrevious,
        updateItem,
        deleteItem
    };
}
