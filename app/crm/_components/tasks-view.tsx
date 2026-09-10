"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CalendarIcon, GripVerticalIcon, RotateCcwIcon } from "lucide-react"
import { CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TASK_COLUMNS, type CrmTask, type TaskColumnId } from "@/lib/crm-data"
import { useCrmStore } from "@/stores/crm-store"
import { cn } from "@/lib/utils"

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

const dueLabel = (due: string) => {
  const date = new Date(`${due}T00:00:00Z`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

export function TasksView() {
  const tasks = useCrmStore((s) => s.tasks)
  const moveTask = useCrmStore((s) => s.moveTask)
  const resetBoard = useCrmStore((s) => s.resetBoard)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  /** 任务 id → 所在列。 */
  const columnOf = useMemo(() => {
    const map = new Map<string, TaskColumnId>()
    for (const column of TASK_COLUMNS) {
      for (const task of tasks[column.id] ?? []) map.set(task.id, column.id)
    }
    return map
  }, [tasks])

  const activeTask = useMemo(
    () => (activeId ? TASK_COLUMNS.flatMap((c) => tasks[c.id] ?? []).find((t) => t.id === activeId) ?? null : null),
    [activeId, tasks]
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const taskId = String(active.id)
    const from = columnOf.get(taskId)
    if (!from) return

    const overId = String(over.id)
    // over 可能是另一张卡片，也可能是空列的 droppable 容器。
    const to = columnOf.get(overId) ?? (TASK_COLUMNS.some((c) => c.id === overId) ? (overId as TaskColumnId) : undefined)
    if (!to) return

    if (from === to) {
      const list = tasks[from] ?? []
      const oldIndex = list.findIndex((t) => t.id === taskId)
      const newIndex = list.findIndex((t) => t.id === overId)
      if (newIndex === -1 || oldIndex === newIndex) return
      const next = arrayMove(list, oldIndex, newIndex)
      moveTask(taskId, from, to, next.findIndex((t) => t.id === taskId))
      return
    }

    const targetList = tasks[to] ?? []
    const overIndex = targetList.findIndex((t) => t.id === overId)
    const toIndex = overIndex === -1 ? targetList.length : overIndex
    moveTask(taskId, from, to, toIndex)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-muted-foreground">
          Drag a card to another column — the order is written straight into the store.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetBoard}
          data-testid="reset-board"
        >
          <RotateCcwIcon />
          Reset board
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
          data-testid="task-board"
        >
          {TASK_COLUMNS.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              hint={column.hint}
              tasks={tasks[column.id] ?? []}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          {activeTask ? <TaskCardBody task={activeTask} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function TaskColumn({
  id,
  title,
  hint,
  tasks,
}: {
  id: TaskColumnId
  title: string
  hint: string
  tasks: CrmTask[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      data-testid={`task-column-${id}`}
      className={cn(
        "flex flex-col rounded-card border bg-muted/30 transition-colors",
        isOver && "border-ring/50 bg-accent/40"
      )}
    >
      <header className="flex items-center gap-2 border-b px-3 py-2.5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Badge variant="outline" className="ml-auto h-5 px-1.5 font-normal tabular-nums">
          {tasks.length}
        </Badge>
      </header>
      <p className="px-3 pt-2 text-label text-muted-foreground">{hint}</p>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex min-h-24 flex-1 flex-col gap-2 p-2.5">
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
          {tasks.length === 0 ? (
            <li className="flex flex-1 items-center justify-center rounded-field border border-dashed px-3 py-6 text-center text-label text-muted-foreground">
              Drop a task here
            </li>
          ) : null}
        </ul>
      </SortableContext>
    </section>
  )
}

function SortableTask({ task }: { task: CrmTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  // 手写 transform（不依赖 @dnd-kit/utilities —— pnpm 12 对其存在链接 bug）
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`,
        transition,
      }
    : { transition }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn("touch-none", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
    >
      <TaskCardBody task={task} />
    </li>
  )
}

function TaskCardBody({ task, dragging = false }: { task: CrmTask; dragging?: boolean }) {
  const overdue = task.progress < 30
  return (
    <article
      className={cn(
        "flex cursor-grab flex-col gap-2 rounded-field border bg-card p-3 transition-colors active:cursor-grabbing",
        "hover:border-foreground/20",
        dragging && "shadow-lg ring-1 ring-ring/30"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVerticalIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 text-sm leading-snug font-medium">{task.title}</span>
      </div>

      <span className="truncate text-caption text-muted-foreground">{task.company}</span>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-label text-muted-foreground">
          <span>Progress</span>
          <span className="tabular-nums">{task.progress}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", overdue ? "bg-chart-5" : "bg-chart-1")}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <Avatar size="sm" className="size-5">
          <AvatarFallback className="text-[9px]">{initials(task.owner)}</AvatarFallback>
        </Avatar>
        <span className="truncate text-label text-muted-foreground">{task.owner}</span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-label text-muted-foreground">
          <CalendarIcon className="size-3" />
          {dueLabel(task.due)}
        </span>
      </div>
    </article>
  )
}
