interface Aptos {
    connect: () => Promise<{ address: string }>;
    account: () => Promise<{ address: string }>;
}

interface Window {
    aptos?: Aptos;
}
