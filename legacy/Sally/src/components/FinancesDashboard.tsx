'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, PiggyBank,
  Target, Lightbulb,
  Plus, ChevronRight,
} from 'lucide-react';

interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  budgeted: number;
  spent: number;
  color: string;
}

interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
}

interface SallieAdvice {
  id: string;
  type: 'tip' | 'warning' | 'opportunity';
  message: string;
  action?: string;
}

export function FinancesDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'goals' | 'advice'>('overview');

  const budgetCategories: BudgetCategory[] = [];
  const goals: FinancialGoal[] = [];

  const advice: SallieAdvice[] = [
    { id: '1', type: 'tip', message: 'Connect your finances to get personalized advice. Once Sallie understands your income, spending, and goals, she\'ll offer tailored guidance right here.' },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'budget' as const, label: 'Budget' },
    { id: 'goals' as const, label: 'Goals' },
    { id: 'advice' as const, label: 'Sallie\'s Advice' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Finances
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sallie helps you budget, save, and make smart money moves</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)' }}>
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-400">Not Connected</span>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Monthly Income', value: '\u2014', icon: <TrendingUp className="w-4 h-4" />, color: '#22c55e', sub: 'Not set up yet' },
              { label: 'Monthly Spending', value: '\u2014', icon: <DollarSign className="w-4 h-4" />, color: '#ef4444', sub: 'Not set up yet' },
              { label: 'Net Savings', value: '\u2014', icon: <PiggyBank className="w-4 h-4" />, color: '#3b82f6', sub: 'Not set up yet' },
              { label: 'Total Saved', value: '\u2014', icon: <TrendingUp className="w-4 h-4" />, color: '#8b5cf6', sub: 'Not set up yet' },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border"
                style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.03), ${metric.color}08)`, borderColor: `${metric.color}15` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ background: `${metric.color}15`, color: metric.color }}>
                    {metric.icon}
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-100">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.label}</p>
                <p className="text-xs mt-1" style={{ color: metric.color }}>{metric.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-4 rounded-xl border" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(16,185,129,0.02))', borderColor: 'rgba(34,197,94,0.15)' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Lightbulb className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">Sallie says</p>
                <p className="text-sm text-gray-400 mt-1">
                  Welcome to your finances dashboard! Set up your budget categories and financial goals, and I&apos;ll help you track spending, save smarter, and stay on top of your money.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Budget at a Glance</h3>
            <div className="luxury-panel text-center">
              <p className="text-sm font-black tracking-tight text-white/70 mb-3">We counting or guessing, love?</p>
              <button
                onClick={() => setActiveTab('budget')}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
              >
                <Plus className="w-3 h-3 inline mr-1.5" />
                Set Up Your Budget
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Savings Goals</h3>
            <div className="luxury-panel text-center">
              <p className="text-sm font-black tracking-tight text-white/70 mb-3">No goals means no direction, queen</p>
              <button
                onClick={() => setActiveTab('goals')}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <Target className="w-3 h-3 inline mr-1.5" />
                Add a Financial Goal
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'budget' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-gray-200">Monthly Budget</p>
              <p className="text-sm text-gray-500">
                Add categories to start tracking your spending
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20 transition-colors">
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {budgetCategories.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-green-500/10">
                  <DollarSign className="w-6 h-6 text-green-400/70" />
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-1">No budget categories yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Add categories like Housing, Groceries, Transportation to start tracking where your money goes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgetCategories.map(cat => {
                const pct = cat.budgeted > 0 ? Math.round((cat.spent / cat.budgeted) * 100) : 0;
                const isOver = cat.spent > cat.budgeted;
                const remaining = cat.budgeted - cat.spent;
                return (
                  <div key={cat.id} className="p-4 rounded-xl border hover:bg-white/[0.02] transition-colors" style={{ borderColor: `${cat.color}15`, background: `${cat.color}03` }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ background: `${cat.color}15`, color: cat.color }}>
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-200">{cat.name}</span>
                          <span className={`text-sm font-medium ${isOver ? 'text-red-400' : 'text-gray-300'}`}>
                            ${cat.spent.toLocaleString()} / ${cat.budgeted.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%`, background: isOver ? '#ef4444' : cat.color }}
                          />
                        </div>
                        <p className={`text-xs mt-1 ${isOver ? 'text-red-400' : 'text-gray-500'}`}>
                          {isOver ? `$${Math.abs(remaining)} over budget` : `$${remaining} remaining`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'goals' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-200">Financial Goals</p>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20 transition-colors">
              <Plus className="w-4 h-4" />
              New Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Target className="w-6 h-6 text-blue-400/70" />
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-1">No financial goals yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Set goals like an emergency fund, vacation savings, or college fund. Sallie will help you track progress and stay motivated.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => {
                const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
                const remaining = goal.target - goal.current;
                return (
                  <div key={goal.id} className="p-5 rounded-xl border" style={{ borderColor: `${goal.color}20`, background: `linear-gradient(135deg, ${goal.color}08, transparent)` }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-200">{goal.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Target: {goal.deadline}</p>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: goal.color }}>{pct}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 mb-3">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${goal.color}, ${goal.color}cc)` }} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">${goal.current.toLocaleString()} saved</span>
                      <span className="text-gray-500">${remaining.toLocaleString()} to go</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'advice' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-lg font-semibold text-gray-200">Sallie&apos;s Financial Guidance</p>
          <p className="text-sm text-gray-500">Personalized advice based on your spending patterns, goals, and financial situation</p>

          <div className="space-y-3">
            {advice.map((item, i) => {
              const typeConfig = {
                tip: { icon: <Lightbulb className="w-5 h-5" />, color: '#22c55e', label: 'Getting Started' },
                warning: { icon: <Lightbulb className="w-5 h-5" />, color: '#f59e0b', label: 'Heads Up' },
                opportunity: { icon: <Target className="w-5 h-5" />, color: '#3b82f6', label: 'Opportunity' },
              }[item.type];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-xl border"
                  style={{ borderColor: `${typeConfig.color}15`, background: `${typeConfig.color}05` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}>
                      {typeConfig.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}>
                          {typeConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{item.message}</p>
                      {item.action && (
                        <button className="mt-2 flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: typeConfig.color }}>
                          {item.action}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
