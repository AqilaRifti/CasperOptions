'use client';

/**
 * Option Payoff Chart
 * Displays profit/loss curve at different underlying prices
 * Shows break-even point, current price, and ITM/OTM zones
 */

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Area,
    ComposedChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Option } from '@/types/options';
import { calculateBreakEven } from '../utils/calculations';

interface PayoffChartProps {
    option: Option;
    currentPrice: number;
    showCard?: boolean;
}

interface PayoffDataPoint {
    price: number;
    profit: number;
    label: string;
}

/**
 * Generate payoff data points for a CALL option
 * Profit = max(0, price - strike) * amount - premium
 */
function generatePayoffData(option: Option): PayoffDataPoint[] {
    const { strikePrice, premium, amount } = option;
    const breakEven = calculateBreakEven(strikePrice, premium / amount);

    // Generate price range: 50% below strike to 150% above strike
    const minPrice = Math.max(0, strikePrice * 0.5);
    const maxPrice = strikePrice * 1.5;
    const step = (maxPrice - minPrice) / 50;

    const data: PayoffDataPoint[] = [];

    for (let price = minPrice; price <= maxPrice; price += step) {
        // CALL option payoff: max(0, price - strike) * amount - premium
        const intrinsicValue = Math.max(0, price - strikePrice) * amount;
        const profit = intrinsicValue - premium;

        data.push({
            price: Math.round(price * 100) / 100,
            profit: Math.round(profit * 100) / 100,
            label: profit >= 0 ? 'Profit' : 'Loss',
        });
    }

    return data;
}

/**
 * Custom tooltip for the chart
 */
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        const profit = payload[0].value;
        const isProfit = profit >= 0;

        return (
            <div className="bg-background border rounded-lg shadow-lg p-3">
                <p className="text-sm text-muted-foreground">
                    LST Price: <span className="font-medium text-foreground">{label} CSPR</span>
                </p>
                <p className={`text-sm font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                    {isProfit ? 'Profit' : 'Loss'}: {isProfit ? '+' : ''}{profit.toFixed(2)} CSPR
                </p>
            </div>
        );
    }
    return null;
}

export function PayoffChart({ option, currentPrice, showCard = true }: PayoffChartProps) {
    const data = generatePayoffData(option);
    const breakEven = calculateBreakEven(option.strikePrice, option.premium / option.amount);

    // Calculate current profit for display
    const currentIntrinsic = Math.max(0, currentPrice - option.strikePrice) * option.amount;
    const currentProfit = currentIntrinsic - option.premium;

    const chartContent = (
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey="price"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}`}
                        label={{ value: 'LST Price (CSPR)', position: 'bottom', offset: 0, fontSize: 12 }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}`}
                        label={{ value: 'P&L (CSPR)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Zero line */}
                    <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />

                    {/* Strike price line */}
                    <ReferenceLine
                        x={option.strikePrice}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        label={{ value: 'Strike', position: 'top', fill: '#f59e0b', fontSize: 11 }}
                    />

                    {/* Break-even line */}
                    <ReferenceLine
                        x={breakEven}
                        stroke="#8b5cf6"
                        strokeDasharray="5 5"
                        label={{ value: 'Break-even', position: 'top', fill: '#8b5cf6', fontSize: 11 }}
                    />

                    {/* Current price line */}
                    <ReferenceLine
                        x={currentPrice}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        label={{ value: 'Current', position: 'top', fill: '#3b82f6', fontSize: 11 }}
                    />

                    {/* Payoff line */}
                    <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: '#10b981' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );

    if (!showCard) {
        return chartContent;
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <span>Payoff Diagram</span>
                    <span className={`text-sm font-medium ${currentProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        Current P&L: {currentProfit >= 0 ? '+' : ''}{currentProfit.toFixed(2)} CSPR
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {chartContent}
                <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-amber-500"></div>
                        <span>Strike: {option.strikePrice} CSPR</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-violet-500"></div>
                        <span>Break-even: {breakEven.toFixed(2)} CSPR</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-blue-500"></div>
                        <span>Current: {currentPrice} CSPR</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
