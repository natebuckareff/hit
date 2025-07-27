import {
  DragEventHandler,
  Id,
  transformStyle,
  useDragDropContext,
} from '@thisbeyond/solid-dnd';
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  createSortable,
  closestCenter,
} from '@thisbeyond/solid-dnd';
import { createSignal, For, JSX, Setter } from 'solid-js';

interface SortableProps<T> {
  id: number | string;
  item: T;
  renderItem: (
    id: number | string,
    item: T,
    dragActivators: Record<string, unknown>,
  ) => JSX.Element;
}

const Sortable = <T,>(props: SortableProps<T>) => {
  const sortable = createSortable(props.id);
  const [state] = useDragDropContext()!;
  return (
    <div
      ref={sortable.ref}
      style={transformStyle(sortable.transform)}
      classList={{
        'opacity-25': sortable.isActiveDraggable,
        'transition-transform': !!state.active.draggable,
      }}
    >
      {props.renderItem(props.id, props.item, sortable.dragActivators)}
    </div>
  );
};

export interface DndListProps<T> {
  class?: string;
  items: T[];
  setItems: (items: T[]) => void;
  renderItem: (
    id?: number | string,
    item?: T,
    dragActivators?: Record<string, unknown>,
  ) => JSX.Element;
  onChange: (items: T[]) => void;
}

export const DndList = <T extends { id: string }>(props: DndListProps<T>) => {
  const [activeId, setActiveId] = createSignal<Id | null>(null);
  const ids = () => props.items.map(item => item.id);

  const onDragStart: DragEventHandler = ({ draggable }) => {
    setActiveId(draggable.id);
  };

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
    if (draggable && droppable) {
      const currentItems = props.items;
      const fromIndex = currentItems.findIndex(
        item => item.id === draggable.id.toString(),
      );
      const toIndex = currentItems.findIndex(
        item => item.id === droppable.id.toString(),
      );
      if (fromIndex !== toIndex) {
        const updatedItems = currentItems.slice();
        updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
        props.setItems(updatedItems);
        props.onChange(updatedItems);
      }
    }
  };

  const RenderOverlay = () => {
    const id = activeId();
    const activeItem = props.items.find(item => item.id === id?.toString());
    return props.renderItem(id ?? undefined, activeItem);
  };

  return (
    <DragDropProvider
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetector={closestCenter}
    >
      <DragDropSensors />
      <div class={props.class}>
        <SortableProvider ids={ids()}>
          <For each={props.items}>
            {item => (
              <Sortable
                id={item.id}
                item={item}
                renderItem={props.renderItem}
              />
            )}
          </For>
        </SortableProvider>
      </div>
      <DragOverlay>
        <div>{RenderOverlay()}</div>
      </DragOverlay>
    </DragDropProvider>
  );
};
