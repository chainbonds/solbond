import React, {useState, useContext, useEffect} from 'react';

export interface IItemsLoad {
    addLoadItem: any,
    incrementCounter: any,
    resetCounter: any,
    progressCounter: any,
    loadItems: any
}

const defaultValue: IItemsLoad = {
    // currentToken: () => console.error("attempting to use AuthContext outside of a valid provider"),
    addLoadItem: () => console.error("attempting to use AuthContext outside of a valid provider"),
    incrementCounter: () => console.error("attempting to use AuthContext outside of a valid provider"),
    resetCounter: () => console.error("attempting to use AuthContext outside of a valid provider"),
    progressCounter: () => console.error("attempting to use AuthContext outside of a valid provider"),
    loadItems: () => console.error("attempting to use AuthContext outside of a valid provider")
}

const LoadContext = React.createContext<IItemsLoad>(defaultValue);

export function useItemsLoad() {
    return useContext(LoadContext);
}

export interface LoadingItem {
    message: string,
    loadingDone: boolean
}

export function ItemsLoadProvider(props: any) {

    const [loadItems, setLoadItems] = useState<LoadingItem[]>([]);
    const [progressCounter, setProgressCounter] = useState<number>(1);
    const [showModal, setShowModal] = useState<boolean>(true);

    useEffect(() => {
        if (loadItems.length > 0) {
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }, [loadItems]);

    const resetCounter = () => {
        setLoadItems([]);
        setProgressCounter(0);
    }

    const incrementCounter = () => {
        setProgressCounter((i: number) => i+1);
    }

    const addLoadItem = (x: LoadingItem) => {
        setLoadItems((oldItems: LoadingItem[]) => {
           return ([...oldItems, x])
        });
    }

    const value: IItemsLoad = {
        addLoadItem,
        incrementCounter,
        resetCounter,
        progressCounter,
        loadItems
    };

    return (
        <>
            <LoadContext.Provider value={value}>
                {props.children}
            </LoadContext.Provider>
        </>
    );
}