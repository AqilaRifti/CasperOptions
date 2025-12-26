'use client';

/**
 * LST Price History Chart
 * Displays simulated price history for demo purposes
 */

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceChartProps {
    currentPrice: number;
    timeframe?: '1D' | '1W' | '1M';
}

interface PriceDataPoint {
    time: string;
    price: number;
}

/**
 * Generate simulated price history data
 * Creates realistic-looking price movements around the current price
 */
function generatePriceHistory(currentPrice: number, timeframe: '1D' | '1W' | '1M'): PriceDataPoint[] {
    const data: PriceDataPoint[] = [];

    const config = {
        '1D': { points: 24, volatility: 0.02, format: (i: number) => `${i}:00` },
        '1W': { points: 7, volatility: 0.05, format: (i: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] },
        '1M': { points: 30, volatility: 0.08, format: (i: number) => `Day ${i + 1}` },
    };

    const { points, volatility, format } = config[timeframe];

    // Start from a slightly different price and trend toward current
    let price = currentPrice * (1 - volatility * 0.5 + Math.random() * volatility);

    for (let i = 0; i < points; i++) {
        // Random walk with slight trend toward current price
        const trend = (currentPrice - price) * 0.1;
        const noise = (Math.random() - 0.5) * volatility * currentPrice;
        price = Math.max(0.5, price + trend + noise);

        // Last point should be close to current price
        if (i === points - 1) {
            price = currentPrice;
        }

        data.push({
            time: format(i),
            price: Math.round(price * 1000) / 1000,
        });
    }

    return data;
}

/**
 * Custom tooltip for price chart
 */
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded-lg shadow-lg p-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">
                    {payload[0].value.toFixed(4)} CSPR
                </p>
            </div>
        );
    }
    return null;
}

export function PriceChart({ currentPrice, timeframe = '1W' }: PriceChartProps) {
    const data = generatePriceHistory(currentPrice, timeframe);

    // Calculate price change
    const startPrice = data[0]?.price || currentPrice;
    const priceChange = currentPrice - startPrice;
    const priceChangePercent = ((priceChange / startPrice) * 100);
    const isPositive = priceChange >= 0;

    // Get min/max for Y axis
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">LST/CSPR Price</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{currentPrice.toFixed(4)}</span>
                        <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span className="ml-1">
                                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor={isPositive ? '#10b981' : '#ef4444'}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={isPositive ? '#10b981' : '#ef4444'}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[minPrice, maxPrice]}
                                tick={{ fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => value.toFixed(2)}
                                width={45}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={isPositive ? '#10b981' : '#ef4444'}
                                strokeWidth={2}
                                fill="url(#priceGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    {(['1D', '1W', '1M'] as const).map((tf) => (
                        <button
                            key={tf}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${tf === timeframe
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
