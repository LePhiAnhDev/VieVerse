import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [provider, setProvider] = useState(null);

    // Check if MetaMask is installed
    const checkIfWalletIsConnected = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);

                    // Get chain ID
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    setChainId(parseInt(chainId, 16));

                    return accounts[0];
                }
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
        return null;
    };

    // Connect wallet
    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            toast.error('MetaMask không được cài đặt! Vui lòng cài đặt MetaMask extension.');
            return null;
        }

        setIsConnecting(true);
        try {
            // Check if MetaMask is locked
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });

            if (accounts.length === 0) {
                // MetaMask is locked, request to unlock
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                if (accounts.length === 0) {
                    toast.error('Vui lòng mở khóa MetaMask và chọn tài khoản');
                    return null;
                }
            }

            const account = accounts[0];
            setAccount(account);
            setIsConnected(true);

            // Get chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(chainId, 16));

            toast.success('Kết nối ví thành công!');
            return account;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            if (error.code === 4001) {
                toast.error('Người dùng từ chối kết nối ví');
            } else if (error.code === -32002) {
                toast.error('Vui lòng kiểm tra MetaMask popup và chấp nhận kết nối');
            } else {
                toast.error('Lỗi kết nối ví: ' + error.message);
            }
        } finally {
            setIsConnecting(false);
        }
        return null;
    };

    // Disconnect wallet
    const disconnectWallet = () => {
        setAccount(null);
        setIsConnected(false);
        setChainId(null);
        setWeb3(null);
        setProvider(null);
        toast.success('Đã ngắt kết nối ví');
    };

    // Switch network
    const switchNetwork = async (targetChainId) => {
        if (!window.ethereum) {
            toast.error('MetaMask không được cài đặt!');
            return false;
        }

        try {
            // Try to switch to the target network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }]
            });

            toast.success('Chuyển đổi mạng thành công!');
            return true;
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    // Add the chain to MetaMask
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${targetChainId.toString(16)}`,
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: {
                                name: 'Sepolia ETH',
                                symbol: 'SEP',
                                decimals: 18
                            },
                            rpcUrls: ['https://sepolia.infura.io/v3/your-project-id'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                        }]
                    });

                    toast.success('Đã thêm mạng Sepolia vào MetaMask!');
                    return true;
                } catch (addError) {
                    toast.error('Không thể thêm mạng: ' + addError.message);
                    return false;
                }
            } else {
                toast.error('Lỗi chuyển đổi mạng: ' + switchError.message);
                return false;
            }
        }
    };

    // Sign message
    const signMessage = async (message) => {
        if (!account) {
            toast.error('Vui lòng kết nối ví trước!');
            return null;
        }

        try {
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, account]
            });

            toast.success('Ký tin nhắn thành công!');
            return signature;
        } catch (error) {
            console.error('Error signing message:', error);
            toast.error('Lỗi ký tin nhắn: ' + error.message);
            return null;
        }
    };

    // Get account balance
    const getBalance = async () => {
        if (!account) return null;

        try {
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
            });

            return balance;
        } catch (error) {
            console.error('Error getting balance:', error);
            return null;
        }
    };

    // Listen for account changes
    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected wallet
                    disconnectWallet();
                } else {
                    // User switched accounts
                    setAccount(accounts[0]);
                    toast.success('Đã chuyển đổi tài khoản!');
                }
            };

            const handleChainChanged = (chainId) => {
                const newChainId = parseInt(chainId, 16);
                setChainId(newChainId);
                toast.success('Đã chuyển đổi mạng!');
                window.location.reload(); // Reload page when chain changes
            };

            const handleDisconnect = () => {
                disconnectWallet();
            };

            // Add event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('disconnect', handleDisconnect);

            // Check initial connection
            checkIfWalletIsConnected();

            // Cleanup
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
                window.ethereum.removeListener('disconnect', handleDisconnect);
            };
        }
    }, []);

    const value = {
        web3,
        account,
        chainId,
        isConnected,
        isConnecting,
        provider,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        signMessage,
        getBalance,
        checkIfWalletIsConnected
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};

export default Web3Context; 