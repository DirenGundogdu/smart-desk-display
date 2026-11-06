import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { memo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useIsActive, useReorderableDrag } from 'react-native-reorderable-list';

import { font, useTheme } from '../theme';
import { TodoItem } from './store';

type Props = {
  item: TodoItem;
  // Live transcript while this item is being re-dictated.
  editingText: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onOpen: (row: SwipeableMethods) => void;
};

// Swipe left-to-right reveals delete, right-to-left reveals voice edit,
// long-press or the handle drags to reorder.
export const TodoRow = memo(function TodoRow({ item, editingText, onToggle, onDelete, onEdit, onOpen }: Props) {
  const t = useTheme();
  const drag = useReorderableDrag();
  const isActive = useIsActive();
  const ref = useRef<SwipeableMethods>(null);

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={1.5}
      leftThreshold={50}
      rightThreshold={50}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableWillOpen={() => ref.current && onOpen(ref.current)}
      renderLeftActions={() => (
        // No close() first: the row unmounts, and closing it mid-unmount trips the gesture handler.
        <Pressable style={[styles.action, styles.left, { backgroundColor: t.danger }]} onPress={() => onDelete(item.id)}>
          <Icon name="trash-can-outline" size={26} color="#fff" />
        </Pressable>
      )}
      renderRightActions={() => (
        <Pressable
          style={[styles.action, styles.right, { backgroundColor: t.band[0] }]}
          onPress={() => {
            ref.current?.close();
            onEdit(item.id);
          }}
        >
          <Icon name="microphone" size={24} color="#FFE9D5" />
          <Text style={styles.actionText}>EDIT</Text>
        </Pressable>
      )}
    >
      <Pressable
        onLongPress={drag}
        delayLongPress={300}
        style={[
          styles.row,
          { backgroundColor: isActive ? t.surfaceStrong : t.surface },
          editingText !== null && { borderWidth: 1.5, borderColor: t.accent },
        ]}
      >
        <Pressable onPress={() => onToggle(item.id)} hitSlop={12} style={styles.check}>
          <View style={[styles.box, { borderColor: item.done ? t.accent : t.muted }, item.done && { backgroundColor: t.accent }]}>
            {item.done && <Icon name="check" size={16} color="#fff" />}
          </View>
        </Pressable>
        <Text
          style={[styles.text, { color: item.done ? t.muted : t.text }, item.done && styles.done]}
          numberOfLines={2}
        >
          {editingText || item.text}
        </Text>
        <Pressable onPressIn={drag} hitSlop={12} style={styles.handle}>
          <Icon name="drag-horizontal-variant" size={22} color={t.muted} />
        </Pressable>
      </Pressable>
    </ReanimatedSwipeable>
  );
});

export const ROW_GAP = 7;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 14, borderRadius: 14 },
  check: { marginRight: 14 },
  box: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, fontSize: 17, ...font.semibold },
  done: { textDecorationLine: 'line-through' },
  handle: { paddingLeft: 12, paddingVertical: 8 },
  action: { width: 86, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  left: { marginRight: ROW_GAP },
  right: { marginLeft: ROW_GAP },
  actionText: { color: '#FFE9D5', fontSize: 10, letterSpacing: 1.2, marginTop: 3, ...font.heavy },
});

export const RowSeparator = () => <View style={{ height: ROW_GAP }} />;
