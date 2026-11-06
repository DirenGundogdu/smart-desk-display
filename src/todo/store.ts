import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

// createdAt is missing on items saved before it existed.
export type TodoItem = { id: string; text: string; done: boolean; createdAt?: number };
export type TodoList = { id: string; name: string; items: TodoItem[] };
type State = { lists: TodoList[]; activeId: string };

const KEY = 'todos.v1';

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function initialState(): State {
  const id = newId();
  return { lists: [{ id, name: 'To-do', items: [] }], activeId: id };
}

export function useTodos() {
  const [state, setState] = useState<State | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      loaded.current = true;
      setState(raw ? (JSON.parse(raw) as State) : initialState());
    });
  }, []);

  useEffect(() => {
    if (loaded.current && state) AsyncStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  // Applies fn to the active list's items.
  const updateItems = useCallback((fn: (items: TodoItem[]) => TodoItem[]) => {
    setState((s) =>
      s && { ...s, lists: s.lists.map((l) => (l.id === s.activeId ? { ...l, items: fn(l.items) } : l)) },
    );
  }, []);

  const actions = {
    addItem: (text: string) => updateItems((items) => [...items, { id: newId(), text, done: false, createdAt: Date.now() }]),
    editItem: (id: string, text: string) => updateItems((items) => items.map((i) => (i.id === id ? { ...i, text } : i))),
    toggleItem: (id: string) => updateItems((items) => items.map((i) => (i.id === id ? { ...i, done: !i.done } : i))),
    removeItem: (id: string) => updateItems((items) => items.filter((i) => i.id !== id)),
    clearDone: () => updateItems((items) => items.filter((i) => !i.done)),
    moveItem: (from: number, to: number) =>
      updateItems((items) => {
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      }),

    addList: (name: string) =>
      setState((s) => {
        if (!s) return s;
        const id = newId();
        return { lists: [...s.lists, { id, name, items: [] }], activeId: id };
      }),
    renameList: (id: string, name: string) =>
      setState((s) => s && { ...s, lists: s.lists.map((l) => (l.id === id ? { ...l, name } : l)) }),
    removeList: (id: string) =>
      setState((s) => {
        if (!s) return s;
        const lists = s.lists.filter((l) => l.id !== id);
        if (lists.length === 0) return initialState();
        return { lists, activeId: s.activeId === id ? lists[0].id : s.activeId };
      }),
    selectList: (id: string) => setState((s) => s && { ...s, activeId: id }),
  };

  const active = state?.lists.find((l) => l.id === state.activeId) ?? null;
  return { lists: state?.lists ?? [], active, ...actions };
}
