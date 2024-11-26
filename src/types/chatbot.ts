// Define a type for individual stock
export type Stock = {
    code: string;
    stockName: string;
    price: number;
};

// Define a type for stock exchanges
export type StockExchange = {
    code: string;
    stockExchange: string;
    topStocks: Stock[];
};

export type StockExchangeData = StockExchange[];