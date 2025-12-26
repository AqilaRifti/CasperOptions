'use client';

/**
 * WalletButton Component
 * Connect/disconnect Casper wallet with balance display
 */

import { useState } from 'react';
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOptionsStore } from '../utils/store';
import { truncateAddress, formatCspr } from '../utils/calculations';
import { getAccountUrl } from '../constants/config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WalletButtonProps {
    variant?: 'default' | 'sidebar';
}

export function WalletButton({ variant = 'default' }: WalletButtonProps) {
    const { wallet, connectWallet, disconnectWallet } = useOptionsStore();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await connectWallet();
            toast.success('Wallet connected successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        disconnectWallet();
        toast.info('Wallet disconnected');
    };

    const handleCopyAddress = () => {
        if (wallet.accountHash) {
            navigator.clipboard.writeText(wallet.accountHash);
            toast.success('Address copied to clipboard');
        }
    };

    const handleViewOnExplorer = () => {
        if (wallet.accountHash) {
            window.open(getAccountUrl(wallet.accountHash), '_blank');
        }
    };

    // Sidebar variant - compact display
    if (variant === 'sidebar') {
        if (!wallet.isConnected) {
            return (
                <Button
                    onClick={handleConnect}
                    disabled={isConnecting || wallet.isConnecting}
                    size="sm"
                    className="w-full gap-2"
                >
                    {isConnecting || wallet.isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Wallet className="h-4 w-4" />
                    )}
                    <span className="group-data-[collapsible=icon]:hidden">
                        {isConnecting ? 'Connecting...' : 'Connect'}
                    </span>
                </Button>
            );
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                        <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                        <span className="font-mono text-xs truncate group-data-[collapsible=icon]:hidden">
                            {formatCspr(wallet.balance || '0')} CSPR
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">Connected Wallet</p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {truncateAddress(wallet.accountHash || '')}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopyAddress}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleViewOnExplorer}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Explorer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Default variant - full display
    if (!wallet.isConnected) {
        return (
            <Button
                onClick={handleConnect}
                disabled={isConnecting || wallet.isConnecting}
                className="gap-2"
            >
                {isConnecting || wallet.isConnecting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                    </>
                )}
            </Button>
        );
    }

    // Connected state
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-mono text-sm">
                            {truncateAddress(wallet.accountHash || '')}
                        </span>
                    </div>
                    <div className="border-l pl-2 ml-1">
                        <span className="text-sm font-medium">
                            {formatCspr(wallet.balance || '0')} CSPR
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Connected Wallet</p>
                        <p className="text-xs text-muted-foreground font-mono">
                            {truncateAddress(wallet.accountHash || '')}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyAddress}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewOnExplorer}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
