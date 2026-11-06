import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import ReorderableList from 'react-native-reorderable-list';

import { Backdrop } from '../components/Backdrop';
import { ColorPanel } from '../components/ColorPanel';
import { DesignText as T } from '../components/DesignText';
import { usePager } from '../pager/context';
import { font, useScale, useTheme } from '../theme';
import { RowSeparator, TodoRow } from '../todo/TodoRow';
import { DictationTarget } from '../todo/useDictation';
import { useTodoController } from '../todo/useTodoController';

const PROMPTS: Record<DictationTarget['kind'], string> = {
  addItem: 'NEW ITEM',
  editItem: 'EDIT ITEM',
  addList: 'NEW LIST',
  renameList: 'RENAME LIST',
};

export function TodoScreen() {
  const t = useTheme();
  const k = useScale();
  const { index, goTo, lockSwipe } = usePager();
  const c = useTodoController();
  const { todos, dict, active, onOpen, onDelete, listOptions } = c;
  const left = c.open;
  const doneCount = c.done;
  const editingId = c.editingId;

  // Rows swipe sideways, so the page only swipes when the touch starts off the list; a fling on the panel works too.
  const pageFling = Gesture.Race(
    Gesture.Fling().direction(Directions.RIGHT).runOnJS(true).onStart(() => goTo(index - 1)),
    Gesture.Fling().direction(Directions.LEFT).runOnJS(true).onStart(() => goTo(index + 1)),
  );

  return (
    <View style={styles.root}>
      <Backdrop />
      <GestureDetector gesture={pageFling}>
        <View style={{ height: '100%' }}>
          <ColorPanel title="TODO" footer="SAY IT. DONE.">
            <View style={{ position: 'absolute', left: 14 * k, right: 14 * k, top: 44 * k, bottom: 48 * k }}>
              <Text style={[styles.panelCaps, { marginLeft: 9 * k, marginBottom: 6 * k }]}>LISTS</Text>
              <ScrollView style={{ flex: 1 }}>
                {todos.lists.map((l) => {
                  const selected = l.id === active?.id;
                  const open = l.items.filter((i) => !i.done).length;
                  return (
                    <Pressable
                      key={l.id}
                      onPress={() => todos.selectList(l.id)}
                      onLongPress={() => listOptions(l.id, l.name)}
                      style={[styles.listItem, selected && styles.listItemSelected]}
                    >
                      <Text style={[styles.listName, !selected && { opacity: 0.75 }]} numberOfLines={1}>
                        {l.name}
                      </Text>
                      {open > 0 && <Text style={styles.listCount}>{open}</Text>}
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Pressable style={styles.newList} onPress={() => dict.start({ kind: 'addList' })}>
                <Icon name="plus" size={18} color="#FFF2DD" />
                <Text style={[styles.panelCaps, { flex: 1 }]}>NEW LIST</Text>
                <Icon name="microphone" size={16} color="#FFF2DD" />
              </Pressable>
            </View>
          </ColorPanel>
        </View>
      </GestureDetector>

      <View style={styles.right}>
        <T x={23} y={55} size={40} color={t.title} font={font.black} spacing={-1.6} style={{ width: 380 * k }}>
          {active?.name ?? ''}.
        </T>
        <T x={25} y={73} size={10} color={t.accentText} font={font.heavy} spacing={1.8}>
          {left === 0 ? 'ALL DONE' : `${left} LEFT`}
          {doneCount > 0 ? `  ·  ${doneCount} DONE` : ''}
        </T>
        {doneCount > 0 && (
          <Pressable onPress={todos.clearDone} hitSlop={10} style={[styles.row, { position: 'absolute', right: 22 * k, top: 33 * k, gap: 8 * k }]}>
            <View style={{ width: 6.8 * k, height: 6.8 * k, borderRadius: 3.4 * k, backgroundColor: t.cityDot }} />
            <Text style={[styles.caps, { color: t.city, fontSize: 11 * k }]}>CLEAR DONE</Text>
          </Pressable>
        )}

        <View
          style={{ position: 'absolute', left: 23 * k, right: 22 * k, top: 92 * k, bottom: 0 }}
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
              ItemSeparatorComponent={RowSeparator}
              contentContainerStyle={{ paddingBottom: 96 * k }}
              renderItem={({ item }) => (
                <TodoRow
                  item={item}
                  editingText={item.id === editingId ? dict.partial : null}
                  onToggle={todos.toggleItem}
                  onDelete={onDelete}
                  onEdit={(id) => dict.start({ kind: 'editItem', id })}
                  onOpen={onOpen}
                />
              )}
            />
          ) : (
            <View style={styles.empty}>
              <Icon name="microphone-outline" size={36} color={t.label} />
              <Text style={[styles.caps, { color: t.label, fontSize: 10 * k, letterSpacing: 1.8 * k }]}>TAP THE MIC AND SAY AN ITEM</Text>
            </View>
          )}
        </View>

        {dict.target ? (
          <View style={[styles.listening, { left: 23 * k, right: 22 * k, bottom: 16 * k, backgroundColor: t.band[1] }]}>
            <View style={[styles.micBubble, { backgroundColor: t.accent }]}>
              <Icon name="microphone" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.caps, { color: t.bandAccent, fontSize: 9.5 }]}>{PROMPTS[dict.target.kind]} · LISTENING</Text>
              <Text style={styles.listeningText} numberOfLines={1}>
                {dict.partial || 'Speak now…'}
              </Text>
            </View>
            <Pressable onPress={dict.cancel} hitSlop={8} style={styles.listeningBtn}>
              <Text style={[styles.caps, { color: t.bandLabel, fontSize: 11 }]}>CANCEL</Text>
            </Pressable>
            <Pressable onPress={dict.stop} hitSlop={8} style={[styles.listeningBtn, { backgroundColor: t.bandCell, borderRadius: 12 }]}>
              <Text style={[styles.caps, { color: '#FFE9D5', fontSize: 11 }]}>DONE</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.fab, { right: 22 * k, bottom: 18 * k, backgroundColor: t.accent }]} onPress={() => dict.start({ kind: 'addItem' })}>
            <Icon name="microphone" size={32} color="#fff" />
          </Pressable>
        )}

        {dict.error && !dict.target && (
          <Text style={[styles.caps, { position: 'absolute', left: 23 * k, bottom: 22 * k, color: t.danger, fontSize: 11 }]}>
            {dict.error.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  right: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  caps: { letterSpacing: 1.3, ...font.heavy },
  panelCaps: { color: '#FFF2DD', fontSize: 10, letterSpacing: 1.6, ...font.heavy },

  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12 },
  listItemSelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
  listName: { flex: 1, color: '#FFF9EA', fontSize: 18, ...font.bold },
  listCount: { color: '#FFF2DD', fontSize: 13, ...font.heavy },
  newList: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 10 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 40 },

  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  listening: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18 },
  micBubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  listeningText: { color: '#FFFFFF', fontSize: 18, marginTop: 2, ...font.bold },
  listeningBtn: { paddingHorizontal: 12, paddingVertical: 9 },
});
