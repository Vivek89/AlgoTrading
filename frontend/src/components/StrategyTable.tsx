'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'

export interface Strategy {
  id: string
  name: string
  strategy_type: string
  config: any
  is_active: boolean
  created_at: string
}

interface StrategyTableProps {
  strategies: Strategy[]
  onEdit: (strategy: Strategy) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onShare?: (strategy: Strategy) => void
  isLoading?: boolean
}

export default function StrategyTable({
  strategies,
  onEdit,
  onDelete,
  onToggleActive,
  onShare,
  isLoading,
}: StrategyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<Strategy>[] = [
    {
      accessorKey: 'name',
      header: 'Strategy Name',
      cell: (info) => (
        <div className="font-medium text-gray-900">{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'strategy_type',
      header: 'Type',
      cell: (info) => {
        const type = info.getValue() as string
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {type.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      accessorKey: 'config.instrument',
      header: 'Instrument',
      cell: (info) => (
        <span className="text-gray-700">{info.getValue() as string || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'config.lotSize',
      header: 'Lot Size',
      cell: (info) => (
        <span className="text-gray-700">{info.getValue() as number || 0}</span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: (info) => {
        const isActive = info.getValue() as boolean
        const strategy = info.row.original
        return (
          <button
            onClick={() => onToggleActive(strategy.id, !isActive)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {isActive ? '● Active' : '○ Inactive'}
          </button>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: (info) => {
        const date = new Date(info.getValue() as string)
        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString()}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const strategy = info.row.original
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(strategy)}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Edit
            </button>
            {onShare && (
              <button
                onClick={() => onShare(strategy)}
                className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Share to marketplace"
              >
                Share
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this strategy?')) {
                  onDelete(strategy.id)
                }
              }}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: strategies,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search strategies..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="text-sm text-gray-600">
          {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No strategies found. Create your first strategy to get started!
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
