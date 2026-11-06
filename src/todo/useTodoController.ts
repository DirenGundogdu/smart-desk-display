import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useTodos } from './store';
import { useDictation } from './useDictation';

// Everything a to-do screen needs, whatever it looks like.
export function useTodoController() {
  const todos = useTodos();

  const dict = useDictation((text, target) => {
    if (target.kind === 'addItem') todos.addItem(text);
    else if (target.kind === 'editItem') todos.editItem(target.id, text);
    else if (target.kind === 'addList') todos.addList(text);
    else todos.renameList(target.id, text);
  });

  const { error, clearError } = dict;
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 3000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  // Only one row stays swiped open at a time.
  const openRow = useRef<SwipeableMethods | null>(null);
  const onOpen = useCallback((row: SwipeableMethods) => {
    if (openRow.current && openRow.current !== row) openRow.current.close();
    openRow.current = row;
  }, []);

  const { removeItem } = todos;
  const onDelete = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      removeItem(id);
    },
    [removeItem],
  );

  const onDragStart = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  const listOptions = (id: string, name: string) =>
    Alert.alert(name, undefined, [
      { text: 'New list by voice', onPress: () => dict.start({ kind: 'addList' }) },
      { text: 'Rename by voice', onPress: () => dict.start({ kind: 'renameList', id }) },
      {
        text: 'Delete list',
        style: 'destructive',
        onPress: () =>
          Alert.alert(`Delete "${name}"?`, 'All its items will be removed.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => todos.removeList(id) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const active = todos.active;
  const open = active?.items.filter((i) => !i.done).length ?? 0;
  const done = (active?.items.length ?? 0) - open;
  const editingId = dict.target?.kind === 'editItem' ? dict.target.id : null;

  return { todos, dict, active, open, done, editingId, onOpen, onDelete, onDragStart, listOptions };
}
