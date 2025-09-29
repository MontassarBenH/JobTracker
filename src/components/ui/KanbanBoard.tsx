"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash, ChevronDown } from "lucide-react";

/* ---------- Types (match your app) ---------- */
export type Status = "applied" | "interviewing" | "offer" | "rejected" | "accepted";

export interface Interview {
  id: string;
  type: string;
  date: string;
  time: string;
  notes: string;
}

export interface OfferDetails {
  salary: string;
  equity: string;
  bonus: string;
  location: string;
  startDate: string;
  deadline: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: Status;
  dateApplied: string;
  jobUrl: string;
  notes: string;
  interviews: Interview[];
  offerDetails: OfferDetails;
  lastFollowUp?: string;
}

/* ---------- Constants (match your app) ---------- */
const STATUS_ORDER: Status[] = ["applied", "interviewing", "offer", "rejected", "accepted"];

const STATUS_LABELS: Record<Status, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  accepted: "Accepted",
};

const STATUS_COLORS: Record<Status, string> = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-yellow-100 text-yellow-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-purple-100 text-purple-800",
};

type BoardState = Record<Status, string[]>;

interface KanbanBoardProps {
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: Status) => void;

  // keep your tooltip + overlay UX
  onOpen: (app: JobApplication) => void;
  onHoverEnter: (app: JobApplication) => void;
  onHoverLeave: () => void;
}

/* ---------- Component ---------- */
export default function KanbanBoard({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
  onOpen,
  onHoverEnter,
  onHoverLeave,
}: KanbanBoardProps) {
  // quick lookup by id
  const appById = useMemo(
    () => Object.fromEntries(applications.map((a) => [a.id, a] as const)),
    [applications]
  );

  // build initial per-column order
  const initialBoard: BoardState = useMemo(() => {
    const cols: BoardState = { applied: [], interviewing: [], offer: [], rejected: [], accepted: [] };
    const sorted = [...applications].sort((a, b) => b.dateApplied.localeCompare(a.dateApplied));
    sorted.forEach((a) => cols[a.status].push(a.id));
    return cols;
  }, [applications]);

  const [board, setBoard] = useState<BoardState>(initialBoard);
  useEffect(() => setBoard(initialBoard), [initialBoard]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const findContainerByItem = (id: string): Status | undefined =>
    STATUS_ORDER.find((col) => board[col].includes(id));

  /* ---------- Offer-only rule helpers ---------- */
    // treat as "offer" if status is offer OR any offer fields exist
    const isOfferApp = (app: JobApplication) => {
    if (app.status === "offer") return true;
    const o = app.offerDetails || ({} as OfferDetails);
    return Boolean(o.salary || o.equity || o.bonus || o.location || o.startDate || o.deadline);
    };

    // allow offer apps to go to Offer, Accepted, or Rejected
    const canDropTo = (app: JobApplication, toCol: Status) => {
    if (isOfferApp(app)) {
        return toCol === "offer" || toCol === "accepted" || toCol === "rejected";
    }
    return true; // non-offer apps anywhere
    };


  /* ---------- DnD handlers ---------- */
  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleDragOver = (_e: DragOverEvent) => {};

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromCol = findContainerByItem(activeId);
    if (!fromCol) return;

    // if over a column, take it directly; else find the column of the card we hovered
    let toCol: Status | undefined = STATUS_ORDER.find((s) => s === (overId as Status));
    if (!toCol) toCol = findContainerByItem(overId);
    if (!toCol) return;

    // enforce your rule
    const app = appById[activeId];
    if (!app || !canDropTo(app, toCol)) {
      // disallowed: do nothing; dnd-kit will snap the card back
      return;
    }

    if (fromCol === toCol) {
      // reorder within same column
      const fromIdx = board[fromCol].indexOf(activeId);
      const toIdx = STATUS_ORDER.includes(overId as Status)
        ? fromIdx // dropped on column background → keep index
        : board[toCol].indexOf(overId);
      if (toIdx >= 0 && fromIdx !== toIdx) {
        setBoard((prev) => ({ ...prev, [fromCol]: arrayMove(prev[fromCol], fromIdx, toIdx) }));
      }
      return;
    }

    // move across columns
    setBoard((prev) => {
      const fromList = prev[fromCol].filter((id) => id !== activeId);
      const isOverColumn = STATUS_ORDER.includes(overId as Status);
      const insertIndex = isOverColumn ? prev[toCol].length : prev[toCol].indexOf(overId);
      const toList =
        insertIndex >= 0
          ? [...prev[toCol].slice(0, insertIndex), activeId, ...prev[toCol].slice(insertIndex)]
          : [...prev[toCol], activeId];
      return { ...prev, [fromCol]: fromList, [toCol]: toList };
    });

    // persist status change upstream
    onStatusChange(activeId, toCol);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STATUS_ORDER.map((col) => (
          <Column
            key={col}
            id={col}
            title={`${STATUS_LABELS[col]} (${board[col].length})`}
            badgeClass={STATUS_COLORS[col]}
          >
            <SortableContext items={board[col]} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {board[col].map((id) => {
                  const app = appById[id];
                  if (!app) return null;
                  return (
                    <SortableCard key={id} id={id}>
                      <AppCard
                        app={app}
                        badgeClass={STATUS_COLORS[app.status]}
                        onEdit={() => onEdit(app)}
                        onDelete={() => onDelete(app.id)}
                        onOpen={() => onOpen(app)}
                        onHoverEnter={() => onHoverEnter(app)}
                        onHoverLeave={onHoverLeave}
                      />
                    </SortableCard>
                  );
                })}
              </div>
            </SortableContext>
          </Column>
        ))}
      </div>
    </DndContext>
  );
}

/* ---------- UI bits ---------- */

function Column({
  id,
  title,
  badgeClass,
  children,
}: {
  id: string;
  title: string;
  badgeClass: string;
  children: React.ReactNode;
}) {
  // make the column background a drop zone (supports empty columns)
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge className={badgeClass}>{title.match(/\((\d+)\)$/)?.[1]}</Badge>
      </div>

      <div
        ref={setNodeRef}
        id={id}
        className={`min-h-[12rem] rounded-md p-1 transition-colors ${isOver ? "bg-gray-50" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function AppCard({
  app,
  badgeClass,
  onEdit,
  onDelete,
  onOpen,
  onHoverEnter,
  onHoverLeave,
}: {
  app: JobApplication;
  badgeClass: string;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}) {
  return (
    <Card
      className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      onClick={onOpen}
    >
      <CardHeader className="pb-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg whitespace-normal break-words hyphens-auto">
              {app.role}
            </CardTitle>
            <p className="text-gray-600 whitespace-normal break-words hyphens-auto">
              {app.company}
            </p>
          </div>
          <Badge className={`${badgeClass} shrink-0`}>
            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="mr-2 h-4 w-4" />
          Applied: {new Date(app.dateApplied).toLocaleDateString()}
        </div>
      </CardContent>
      <div className="mt-auto border-t border-gray-100 p-2">
        <div className="flex justify-between">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ChevronDown className="mr-1 h-4 w-4" />
            Details
          </Button>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
