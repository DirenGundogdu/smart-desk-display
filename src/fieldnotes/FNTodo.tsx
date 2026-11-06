import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { memo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import ReorderableList, { useIsActive, useReorderableDrag } from 'react-native-reorderable-list';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { DesignText as T } from '../components/DesignText';
import { usePager } from '../pager/context';
import { font, useScale } from '../theme';
import { TodoItem } from '../todo/store';
import { useTodoController } from '../todo/useTodoController';
import { Header, HRule, Page, pad2 } from './parts';
import { FNTheme, useFN } from './theme';

const ROW_H = 37;

const PROMPTS = { addItem: 'NEW TASK', editItem: 'EDIT TASK', addList: 'NEW LIST', renameList: 'RENAME LIST' } as const;

function when(ts?: number) {
  if (!ts) return '--:--';
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

const isToday = (ts?: number) => !!ts && new Date(ts).toDateString() === new Date().toDateString();

type RowProps = {
  item: TodoItem;
  n: number;
  t: FNTheme;
  k: number;
  editingText: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onOpen: (row: SwipeableMethods) => void;
};

// Swipe left-to-right: delete. Right-to-left: voice edit. Long-press or handle: reorder.
const Row = memo(function Row({ item, n, t, k, editingText, onToggle, onDelete, onEdit, onOpen }: RowProps) {
  const drag = useReorderableDrag();
  const active = useIsActive();
  const ref = useRef<SwipeableMethods>(null);
  const status = item.done ? 'DONE' : isToday(item.createdAt) ? 'TODAY' : 'OPEN';

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
        <Pressable style={[styles.action, { width: 90 * k, backgroundColor: t.orange }]} onPress={() => onDelete(item.id)}>
          <Icon name="trash-can-outline" size={20 * k} color={t.paper} />
          <Text style={[styles.actionText, { color: t.paper, fontSize: 9 * k }]}>DELETE</Text>
        </Pressable>
      )}
      renderRightActions={() => (
        <Pressable
          style={[styles.action, { width: 90 * k, backgroundColor: t.blue }]}
          onPress={() => {
            ref.current?.close();
            onEdit(item.id);
          }}
        >
          <Icon name="microphone" size={20 * k} color={t.paper} />
          <Text style={[styles.actionText, { color: t.paper, fontSize: 9 * k }]}>EDIT</Text>
        </Pressable>
      )}
    >
      <Pressable
        onLongPress={drag}
        delayLongPress={300}
        style={{ height: ROW_H * k, backgroundColor: active ? (t.dark ? '#1C2420' : '#E2E5DA') : t.bg, borderBottomWidth: 1, borderColor: t.rule }}
      >
        <T x={3} y={25} size={13} color={t.blue} font={font.black}>
          {pad2(n)}
        </T>
        <T
          x={62}
          y={25}
          size={21}
          color={item.done ? t.muted : t.ink}
          font={font.heavy}
          spacing={-0.5}
          style={[{ width: 520 * k }, item.done && { textDecorationLine: 'line-through' }, editingText !== null && { color: t.orange }]}
        >
          {editingText || item.text}
        </T>
        <T x={648} y={24} size={12} color={t.muted} font={font.heavy}>
          {when(item.createdAt)}
        </T>
        <T x={762} y={24} size={10} color={item.done ? t.muted : t.blue} font={font.heavy} anchor="end" width={60}>
          {status}
        </T>
        <Pressable onPress={() => onToggle(item.id)} hitSlop={12} style={{ position: 'absolute', left: 783 * k, top: 9 * k }}>
          <Svg width={19 * k} height={19 * k} viewBox="0 0 19 19">
            <Rect x={0.75} y={0.75} width={17.5} height={17.5} fill={t.bg} stroke={t.ink} strokeWidth={1.5} />
            {item.done && <Path d="M4 10 l4 4 l7 -9" fill="none" stroke={t.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
          </Svg>
        </Pressable>
      </Pressable>
    </ReanimatedSwipeable>
  );
});

export function FNTodo() {
  const t = useFN();
  const k = useScale();
  const c = useTodoController();
  const { lockSwipe } = usePager();
  const { todos, dict, active } = c;
  const listIndex = Math.max(0, todos.lists.findIndex((l) => l.id === active?.id));

  const nextList = () => {
    if (todos.lists.length > 1) todos.selectList(todos.lists[(listIndex + 1) % todos.lists.length].id);
  };

  const listening = !!dict.target;
  const quote = listening
    ? dict.partial || 'Listening…'
    : dict.error
      ? dict.error
      : '“Buy milk and eggs.”';

  return (
    <Page>
      <Header section="/  TASKS  /  VOICE" />

      {/* Open count — tap for the next list, long-press for list options. Children use block-local coordinates. */}
      <Pressable
        onPress={nextList}
        onLongPress={() => active && c.listOptions(active.id, active.name)}
        style={{ position: 'absolute', left: 20 * k, top: 72 * k, width: 319 * k, height: 159 * k, backgroundColor: t.lime }}
      >
        <T x={16} y={24} size={11} color={t.onLime} font={font.heavy} spacing={1} style={{ width: 290 * k }}>
          {(active?.name ?? '').toUpperCase()}  /  {listIndex + 1} OF {todos.lists.length}
        </T>
        <T x={6} y={138} size={124} color={t.onLime} font={font.black} spacing={-8}>
          {pad2(c.open)}
        </T>
        <T x={184} y={121} size={17} color={t.onLime} font={font.black}>
          OPEN
        </T>
        <T x={186} y={143} size={14} color={t.onLime} font={font.heavy} spacing={0.5}>
          TASKS
        </T>
      </Pressable>
      {c.done > 0 && (
        <Pressable onPress={todos.clearDone} hitSlop={8} style={{ position: 'absolute', left: 236 * k, top: 120 * k }}>
          <Text style={{ ...font.heavy, color: t.onLime, fontSize: 9 * k, letterSpacing: 1 * k, textDecorationLine: 'underline' }}>
            CLEAR {c.done} DONE
          </Text>
        </Pressable>
      )}

      {/* Voice — block-local coordinates (block starts at 351, 72) */}
      <Pressable
        onPress={listening ? dict.stop : () => dict.start({ kind: 'addItem' })}
        style={{ position: 'absolute', left: 351 * k, top: 72 * k, width: 480 * k, height: 159 * k, backgroundColor: t.block }}
      >
        <T x={16} y={26} size={14} color={t.paper} font={font.black} spacing={0.1}>
          {listening ? `${PROMPTS[dict.target!.kind]}  /  LISTENING` : 'SAY IT. WE’LL WRITE IT.'}
        </T>
        <T x={16} y={50} size={15} color={listening ? t.paper : dict.error ? t.orange : t.muted} font={font.medium} style={{ width: 290 * k }}>
          {quote}
        </T>
        <Svg style={{ position: 'absolute', left: 323 * k, top: 29 * k }} width={106 * k} height={106 * k} viewBox="674 101 106 106">
          <Circle cx={727} cy={154} r={53} fill={listening ? t.lime : t.orange} />
          <Rect x={720} y={127} width={14} height={32} rx={7} fill={t.block} />
          <Path d="M712 151 C712 173 743 173 743 151" fill="none" stroke={t.block} strokeWidth={3} strokeLinecap="round" />
          <Line x1={727} y1={174} x2={727} y2={185} stroke={t.block} strokeWidth={3} />
          <Line x1={716} y1={185} x2={738} y2={185} stroke={t.block} strokeWidth={3} />
        </Svg>
        <T x={18} y={132} size={17} color={t.lime} font={font.black} spacing={0.5}>
          {listening ? 'TAP TO FINISH' : 'TAP TO SPEAK'}
        </T>
      </Pressable>
      {listening && (
        <Pressable onPress={dict.cancel} hitSlop={10} style={{ position: 'absolute', left: 530 * k, top: 190 * k }}>
          <Text style={{ ...font.heavy, color: t.muted, fontSize: 11 * k, letterSpacing: 1 * k }}>CANCEL</Text>
        </Pressable>
      )}

      {/* Rows */}
      <HRule y={246} color={t.rule} />
      {/* Rows swipe sideways, so page swiping pauses while a finger is on them. */}
      <View
        style={{ position: 'absolute', left: 20 * k, width: 811 * k, top: 246.5 * k, height: 117 * k }}
        onTouchStart={() => lockSwipe(true)}
        onTouchEnd={() => lockSwipe(false)}
        onTouchCancel={() => lockSwipe(false)}
      >
        {active && active.items.length > 0 ? (
          <ReorderableList
            data={active.items}
            keyExtractor={(i) => i.id}
            onReorder={({ from, to }) => todos.moveItem(from, to)}
            onDragStart={c.onDragStart}
            renderItem={({ item, index }) => (
              <Row
                item={item}
                n={index + 1}
                t={t}
                k={k}
                editingText={item.id === c.editingId ? dict.partial : null}
                onToggle={todos.toggleItem}
                onDelete={c.onDelete}
                onEdit={(id) => dict.start({ kind: 'editItem', id })}
                onOpen={c.onOpen}
              />
            )}
          />
        ) : (
          <T x={62} y={50} size={14} color={t.muted} font={font.heavy} spacing={0.5}>
            NOTHING HERE YET — TAP THE MIC AND SAY A TASK.
          </T>
        )}
      </View>
      <HRule y={364} color={t.ink} />
    </Page>
  );
}

const styles = StyleSheet.create({
  action: { alignItems: 'center', justifyContent: 'center' },
  actionText: { ...font.heavy, letterSpacing: 1, marginTop: 2 },
});
