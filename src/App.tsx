/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, TrendingDown, TrendingUp, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [holdShares, setHoldShares] = useState('');
  const [holdCost, setHoldCost] = useState('');
  
  const [actionType, setActionType] = useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = useState('');
  const [tradePrice, setTradePrice] = useState('');

  const result = useMemo(() => {
    const hs = parseFloat(holdShares) || 0;
    const hc = parseFloat(holdCost) || 0;
    const ts = parseFloat(tradeShares) || 0;
    const tp = parseFloat(tradePrice) || 0;

    if (hs <= 0 || hc <= 0) return null;

    const currentTotalValue = hs * hc;
    let newShares = hs;
    let newCost = hc;

    if (actionType === 'buy') {
      newShares = hs + ts;
      const newTotalValue = currentTotalValue + (ts * tp);
      newCost = newShares > 0 ? newTotalValue / newShares : 0;
    } else {
      newShares = hs - ts;
      const cashedOut = ts * tp;
      const remainingCostBasis = currentTotalValue - cashedOut;
      newCost = newShares > 0 ? remainingCostBasis / newShares : 0;
    }

    return {
      newShares,
      newCost,
      difference: newCost - hc,
    };
  }, [holdShares, holdCost, actionType, tradeShares, tradePrice]);

  const resetTrade = () => {
    setTradeShares('');
    setTradePrice('');
  };

  const resetAll = () => {
    setHoldShares('');
    setHoldCost('');
    setTradeShares('');
    setTradePrice('');
    setActionType('buy');
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      {/* Header */}
      <div className="bg-white px-6 py-5 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">股票成本计算器</h1>
          </div>
          <button 
            onClick={resetAll}
            className="p-2 text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
            title="重置全部"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* Section 1: Current Position */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            当前持仓
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput 
              label="持有股数" 
              value={holdShares} 
              onChange={setHoldShares} 
              placeholder="0" 
              suffix="股"
            />
            <NumberInput 
              label="持仓成本价" 
              value={holdCost} 
              onChange={setHoldCost} 
              placeholder="0.00" 
            />
          </div>
        </section>

        {/* Section 2: Transaction */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
              模拟交易
            </h2>
          </div>

          <div className="flex bg-gray-100/80 p-1 rounded-xl mb-5 relative">
            <motion.div 
              className="absolute inset-y-1 rounded-lg bg-white shadow-sm border border-gray-200/50"
              initial={false}
              animate={{ 
                left: actionType === 'buy' ? '0.25rem' : '50%',
                width: 'calc(50% - 0.25rem)'
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
            <button
              onClick={() => setActionType('buy')}
              className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${actionType === 'buy' ? 'text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              买入 (补仓)
            </button>
            <button
              onClick={() => setActionType('sell')}
              className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${actionType === 'sell' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              卖出 (减仓)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberInput 
              label="交易股数" 
              value={tradeShares} 
              onChange={setTradeShares} 
              placeholder="0" 
              suffix="股"
            />
            <NumberInput 
              label="交易价格" 
              value={tradePrice} 
              onChange={setTradePrice} 
              placeholder="0.00" 
            />
          </div>
        </section>

        {/* Section 3: Results */}
        <AnimatePresence>
          {result && (
            <motion.section 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", bounce: 0.2 }}
              className="bg-blue-600 rounded-3xl p-1 shadow-lg shadow-blue-600/20"
            >
              <div className="bg-white rounded-[22px] p-5 h-full overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-60"></div>
                
                <h2 className="text-sm font-bold text-gray-900 mb-5 relative z-10">计算结果 (摊薄后)</h2>
                
                {result.newShares < 0 ? (
                  <div className="py-6 text-center text-gray-500 text-sm">
                    交易股数不能大于当前持有股数
                  </div>
                ) : result.newShares === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-sm">
                    已全部清仓
                  </div>
                ) : (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-end justify-between border-b border-gray-100 pb-5">
                      <div>
                        <div className="text-xs text-gray-500 font-medium mb-1">最终成本价</div>
                        <div className="text-3xl font-bold tracking-tight text-gray-900">
                          {formatNumber(result.newCost, 3)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {Math.abs(result.difference) > 0.0001 && (
                          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
                            result.difference > 0 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'
                          }`}>
                            {result.difference > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {result.difference > 0 ? '+' : ''}{formatNumber(result.difference, 3)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 font-medium mb-0.5">最终持仓</div>
                        <div className="text-lg font-semibold text-gray-900">{formatNumber(result.newShares, 0)} <span className="text-sm font-normal text-gray-500">股</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 font-medium mb-0.5">总市值 (按此价)</div>
                        <div className="text-lg font-semibold text-gray-900">{formatNumber(result.newShares * result.newCost, 2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// Reusable Input Component
function NumberInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  prefix, 
  suffix 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 ml-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-gray-400 font-medium">{prefix}</span>}
        <input
          type="number"
          className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-medium
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all
            ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="0"
          step="any"
        />
        {suffix && <span className="absolute right-4 text-gray-400 text-sm font-medium pointer-events-none">{suffix}</span>}
      </div>
    </div>
  );
}
